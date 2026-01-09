import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	GuildMember,
	MessageFlags,
} from "discord.js";

import { ErrorEmbed } from "../functions/functions.js";

import type { PowerUp } from "../Types/fight.js";
import type { FightTypes } from "../Types/index.js";
import { LoggerManager } from "../handlers/Logger.js";
import { getContextUserID } from "../functions/context.js";
import { NetworkManager } from "../handlers/NetworkManager.js";

// Define available powerups
const POWERUPS: PowerUp[] = [
	{
		id: "double-damage",
		label: "2x Damage",
		style: ButtonStyle.Danger,
		cost: 30,
		effect: (player, playerUsername) => {
			player.activeEffects.push("Double Damage (Next Attack)");
			return `${playerUsername} will deal double damage on their next attack!`;
		},
	},
	{
		id: "shield",
		label: "Shield",
		style: ButtonStyle.Secondary,
		cost: 25,
		effect: (player, playerUsername) => {
			player.activeEffects.push("Shield (Next Attack)");
			return `${playerUsername} will take half damage from the next attack!`;
		},
	},
	{
		id: "heal-boost",
		label: "Heal Boost",
		style: ButtonStyle.Success,
		cost: 20,
		effect: (player, playerUsername) => {
			player.health += 30;
			if (player.health > 100) player.health = 100;
			return `${playerUsername} received a 30 HP healing boost!`;
		},
	},
];

const Fight = async (NetworkManager: NetworkManager, options: FightTypes, loggerManager: LoggerManager) => {
	if (!options) {
		return loggerManager.createError("Fight", "No options provided.");
	}

	if (typeof options !== "object") {
		return loggerManager.createTypeError("Fight", "Options must be an object.");
	}

	if (!options.context) {
		return loggerManager.createError("Fight", "No Context provided.");
	}

	let context = options.context;

	if (!context.channel.isSendable() || !context.channel.isTextBased() || context.channel.isDMBased()) {
		loggerManager.createError("Fight", "The Context channel is not Sendable or Text-Based");
		return;
	}

	let id = getContextUserID(context);

	if (!context.guild) {
		loggerManager.createError("Fight", "Guild is not available in this context");
		return;
	}

	if (!options.buttons) options.buttons = {};
	if (typeof options.buttons !== "object") {
		return loggerManager.createTypeError("Fight", "Buttons must be an object.");
	}

	if (!options.buttons.hit) options.buttons.hit = "Hit";
	if (typeof options.buttons.hit !== "string") {
		return loggerManager.createTypeError("Fight", "Hit the button text must be a string");
	}

	if (!options.buttons.heal) options.buttons.heal = "Heal";
	if (typeof options.buttons.heal !== "string") {
		return loggerManager.createTypeError("Fight", "Heal button text must be a string.");
	}

	if (!options.buttons.cancel) options.buttons.cancel = "Surrender";
	if (typeof options.buttons.cancel !== "string") {
		return loggerManager.createTypeError("Fight", "Cancel button text must be a string");
	}

	if (!options.buttons.accept) options.buttons.accept = "Accept";
	if (typeof options.buttons.accept !== "string") {
		return loggerManager.createTypeError("Fight", "Accept button text must be a string");
	}

	if (!options.buttons.deny) options.buttons.deny = "Deny";
	if (typeof options.buttons.deny !== "string") {
		return loggerManager.createTypeError("Fight", "Deny button text must be a string.");
	}

	if (!options.wrongUserFight) options.wrongUserFight = "**This is not your Game!**";
	if (typeof options.wrongUserFight !== "string") {
		return loggerManager.createTypeError("Fight", "Wrong Fight message must be a string.");
	}

	if (!options.opponentsTurnMessage) options.opponentsTurnMessage = "**Please wait for your opponents move!**";
	if (typeof options.opponentsTurnMessage !== "string") {
		return loggerManager.createTypeError("Fight", "Opponents turn message must be a string.");
	}

	if (!options.highHealthMessage) options.highHealthMessage = "You cannot heal if your HP is above 80!";
	if (typeof options.highHealthMessage !== "string") {
		return loggerManager.createTypeError("Fight", "High health message must be a string.");
	}

	if (!options.lowHealthMessage) options.lowHealthMessage = "You cannot cancel the fight if your HP is below 50!";
	if (typeof options.lowHealthMessage !== "string") {
		return loggerManager.createTypeError("Fight", "Low health message must be a string.");
	}

	if (!options.opponent) {
		loggerManager.createError("Fight", "Opponent is missing from the options.");
		return;
	}

	if (!(options.opponent as GuildMember).user.username) {
		return loggerManager.createTypeError("Fight", "Opponent option must be User.");
	}

	if (id === options.opponent.id) {
		return context.channel.send({
			embeds: [
				ErrorEmbed("Fight Error")
					.setColor("Red")
					.setDescription("**Did you for real try to play with yourself?")
					.setTimestamp(),
			],
		});
	}

	const challenger = await context.guild.members.fetch(id);
	const opponent = options.opponent;

	if (
		(await NetworkManager.checkPlayerFightStatus(challenger.id)) ||
		(await NetworkManager.checkPlayerFightStatus(opponent.id))
	) {
		const errorEmbed = ErrorEmbed("Fight").setDescription("## One of the two Users are already in game!");

		await context.channel.send({
			embeds: [errorEmbed],
		});

		return;
	}

	const requestCard = await NetworkManager.makeRequestCard(
		challenger.user.username,
		challenger.displayAvatarURL({ extension: "png", size: 256 }),
		opponent.user.username,
		opponent.displayAvatarURL({ extension: "png", size: 256 })
	);

	if (!requestCard) {
		const errorEmbed = ErrorEmbed("API").setTitle("API Failed to get the Request Card! Please notify a Developer.");

		await context.channel.send({
			embeds: [errorEmbed],
		});

		return;
	}

	const accept = new ButtonBuilder()
		.setLabel(options.buttons.accept)
		.setStyle(ButtonStyle.Success)
		.setCustomId("fight_accept");

	const deny = new ButtonBuilder()
		.setLabel(options.buttons.deny)
		.setStyle(ButtonStyle.Danger)
		.setCustomId("fight_deny");

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(accept, deny);

	const msg = await context.channel.send({
		files: [requestCard],
		components: [row],
	});

	const gameId = await NetworkManager.createGame(
		challenger.id,
		challenger.user.username,
		opponent.id,
		opponent.user.username
	);

	// Create button collector for accept/deny
	const filter = (i: ButtonInteraction) => i.user.id === opponent.id;
	const collector = msg.createMessageComponentCollector({
		filter,
		time: options.time ? options.time : 120_000,
		componentType: ComponentType.Button,
	});

	collector.on("collect", async (interaction) => {
		if (interaction.customId === "fight_deny") {
			const deniedCard = await NetworkManager.makeDenyCard(
				challenger.user.username,
				challenger.displayAvatarURL({ extension: "png", size: 256 }),
				opponent.user.username,
				opponent.displayAvatarURL({ extension: "png", size: 256 })
			);

			const removed = await NetworkManager.removeGame(gameId);

			if (!removed) {
				const embed = ErrorEmbed("API").setDescription(
					"# API Failed to Remove Fight from the Database. Please notify a developer."
				);

				await interaction.update({
					content: null,
					components: [],
					files: [],
					embeds: [embed],
				});

				collector.stop();

				return;
			}

			await interaction.update({
				content: null,
				embeds: [],
				components: [],
				files: [deniedCard],
			});
			collector.stop();
			return;
		}

		if (interaction.customId === "fight_accept") {
			await startFight(gameId, interaction, options, challenger, opponent, NetworkManager);
			collector.stop();
		}
	});

	collector.on("end", async (collected, reason) => {
		if (reason === "time" && collected.size === 0) {
			const timeoutCard = await NetworkManager.makeTimeOutCard(
				challenger.user.username,
				challenger.displayAvatarURL({ extension: "png", size: 256 }),
				opponent.user.username,
				opponent.displayAvatarURL({ extension: "png", size: 256 })
			);

			const removed = await NetworkManager.removeGame(gameId);

			if (!removed) {
				const embed = ErrorEmbed("API").setDescription(
					"# API Failed to Remove Fight from the Database. Please notify a developer."
				);

				await msg.edit({
					content: null,
					components: [],
					files: [],
					embeds: [embed],
				});

				collector.stop();

				return;
			}

			msg.edit({
				content: null,
				embeds: [],
				components: [],
				files: [timeoutCard],
			});
		}
	});
};

async function startFight(
	gameID: string,
	interaction: ButtonInteraction,
	options: FightTypes,
	challenger: GuildMember,
	opponentOriginal: GuildMember,
	NetworkManager: NetworkManager
) {
	// Create action buttons
	const hit = new ButtonBuilder().setLabel(options.buttons.hit).setStyle(ButtonStyle.Danger).setCustomId("fight_hit");

	const heal = new ButtonBuilder()
		.setLabel(options.buttons.heal)
		.setStyle(ButtonStyle.Success)
		.setCustomId("fight_heal");

	const surrender = new ButtonBuilder()
		.setLabel(options.buttons.cancel)
		.setStyle(ButtonStyle.Secondary)
		.setCustomId("fight_surrender");

	// Create powerup buttons
	const powerupButtons = POWERUPS.map((powerup) =>
		new ButtonBuilder()
			.setLabel(`${powerup.label} (${powerup.cost}🪙)`)
			.setStyle(powerup.style)
			.setCustomId(`powerup_${powerup.id}`)
	);

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(hit, heal, surrender);
	const powerupRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...powerupButtons);

	// Update the fight status
	const gameCard = await NetworkManager.makeMainCard(
		gameID,
		challenger.displayAvatarURL({ extension: "png", size: 256 }),
		opponentOriginal.displayAvatarURL({ extension: "png", size: 256 })
	);

	let turn = await NetworkManager.getTurn(gameID);

	const msg = await interaction.update({
		files: [gameCard],
		components: [actionRow, powerupRow],
	});

	// Create game collector
	const collector = msg.createMessageComponentCollector();

	collector.on("collect", async (i: ButtonInteraction) => {
		if (i.user.id !== challenger.id && i.user.id !== opponentOriginal.id) {
			await i.reply({
				embeds: [ErrorEmbed("Wrong Game!").setDescription(options.wrongUserFight).setColor("Red")],
				flags: [MessageFlags.Ephemeral],
			});

			return;
		}

		if (i.user.id !== turn.userID) {
			await i.reply({
				embeds: [ErrorEmbed("Wrong Turn!").setDescription(options.opponentsTurnMessage).setColor("Red")],
				flags: [MessageFlags.Ephemeral],
			});

			return;
		}

		await i.deferUpdate();

		const player = await NetworkManager.getPlayer(gameID, false);
		const opponent = await NetworkManager.getPlayer(gameID, true);

		const playerMember = await i.guild.members.fetch(player.memberId);
		const opponentMember = await i.guild.members.fetch(opponent.memberId);

		// Handle different actions
		if (i.customId === "fight_hit") {
			let damage = Math.floor(Math.random() * 20) + 10;

			// Check for double damage effect
			if (player.activeEffects.includes("Double Damage (Next Attack)")) {
				damage *= 2;
				player.activeEffects = player.activeEffects.filter((effect) => effect !== "Double Damage (Next Attack)");
			}

			// Check for shield effect
			if (opponent.activeEffects.includes("Shield (Next Attack)")) {
				damage = Math.floor(damage / 2);
				opponent.activeEffects = opponent.activeEffects.filter((effect) => effect !== "Shield (Next Attack)");
			}

			opponent.health -= damage;
			player.coins += 10;

			const updated = NetworkManager.updatePlayers(gameID, player, opponent);

			if (!updated) {
				const embed = ErrorEmbed("API").setDescription("## The API failed to update the data. Please contact a dev!");

				await i.editReply({
					embeds: [embed],
					files: [],
					components: [],
					content: null,
				});

				return;
			}

			if (opponent.health <= 0) {
				const winnerCard = await NetworkManager.makeWinCard(
					playerMember.user.username,
					playerMember.displayAvatarURL({ extension: "png", size: 256 }),
					opponentMember.user.username,
					opponentMember.displayAvatarURL({ extension: "png", size: 256 })
				);

				const removed = await NetworkManager.removeGame(gameID);

				if (!removed) {
					const embed = ErrorEmbed("API").setDescription(
						"# API Failed to Remove Fight from the Database. Please notify a developer."
					);

					await interaction.update({
						content: null,
						components: [],
						files: [],
						embeds: [embed],
					});

					collector.stop();

					return;
				}

				await i.editReply({
					files: [winnerCard],
					components: [],
					content: null,
				});
				collector.stop();
				return;
			}
		} else if (i.customId === "fight_heal") {
			if (player.health >= 80) {
				i.followUp({
					content: options.highHealthMessage,
					flags: [MessageFlags.Ephemeral],
				});
				return;
			}

			const healAmount = Math.floor(Math.random() * 20) + 10;
			player.health += healAmount;
			if (player.health > 100) player.health = 100;

			const updated = NetworkManager.updatePlayers(gameID, player, opponent);

			if (!updated) {
				const embed = ErrorEmbed("API").setDescription("## The API failed to update the data. Please contact a dev!");

				await i.editReply({
					embeds: [embed],
					files: [],
					components: [],
					content: null,
				});

				return;
			}
		} else if (i.customId === "fight_surrender") {
			if (player.health < 50) {
				i.followUp({
					content: options.lowHealthMessage,
					flags: [MessageFlags.Ephemeral],
				});
				return;
			}

			const surrenderCard = await NetworkManager.makeSurrenderCard(
				opponentMember.user.username,
				opponentMember.displayAvatarURL({ extension: "png", size: 256 }),
				playerMember.user.username,
				playerMember.displayAvatarURL({ extension: "png", size: 256 })
			);

			const removed = await NetworkManager.removeGame(gameID);

			if (!removed) {
				const embed = ErrorEmbed("API").setDescription(
					"# API Failed to Remove Fight from the Database. Please notify a developer."
				);

				await interaction.update({
					content: null,
					components: [],
					files: [],
					embeds: [embed],
				});

				collector.stop();

				return;
			}

			await i.editReply({
				components: [],
				embeds: [],
				files: [surrenderCard],
				content: null,
			});
			collector.stop();
			return;
		} else if (i.customId.startsWith("powerup_")) {
			const powerupId = i.customId.split("_")[1];
			const powerup = POWERUPS.find((p) => p.id === powerupId);

			if (powerup && player.coins >= powerup.cost) {
				player.coins -= powerup.cost;
				const effectMessage = powerup.effect(player, playerMember.user.username);

				const updated = NetworkManager.updatePlayers(gameID, player, opponent);

				if (!updated) {
					const embed = ErrorEmbed("API").setDescription("## The API failed to update the data. Please contact a dev!");

					await i.editReply({
						embeds: [embed],
						files: [],
						components: [],
						content: null,
					});

					return;
				}

				await i.followUp({
					content: effectMessage,
					flags: [MessageFlags.Ephemeral],
				});
			} else {
				await i.followUp({
					content: "You don't have enough coins for this powerup!",
					flags: [MessageFlags.Ephemeral],
				});
				return;
			}
		}

		// Switch turns
		const turned = await NetworkManager.changeTurn(gameID);

		if (!turned) {
			const embed = ErrorEmbed("API").setDescription("## The API failed to update the data. Please contact a dev!");

			await i.editReply({
				embeds: [embed],
				files: [],
				components: [],
				content: null,
			});

			return;
		}

		// Update game state
		const newGameCard = await NetworkManager.makeMainCard(
			gameID,
			challenger.displayAvatarURL({ extension: "png", size: 256 }),
			opponentOriginal.displayAvatarURL({ extension: "png", size: 256 })
		);

		turn = await NetworkManager.getTurn(gameID);

		await i.editReply({
			files: [newGameCard],
			components: [actionRow, powerupRow],
		});
	});
}

export default Fight;
