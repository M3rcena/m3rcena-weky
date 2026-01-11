import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	GuildMember,
	MessageFlags,
} from "discord.js";

import type { PowerUp } from "../Types/fight.js";
import type { CustomOptions, FightTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";

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

const Fight = async (weky: WekyManager, options: CustomOptions<FightTypes>) => {
	let context = options.context;

	let id = weky._getContextUserID(context);

	weky._deferContext(context);

	if (!options.buttons) options.buttons = {};
	if (typeof options.buttons !== "object") {
		return weky._LoggerManager.createTypeError("Fight", "Buttons must be an object.");
	}

	if (!options.buttons.hit) options.buttons.hit = "Hit";
	if (typeof options.buttons.hit !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Hit the button text must be a string");
	}

	if (!options.buttons.heal) options.buttons.heal = "Heal";
	if (typeof options.buttons.heal !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Heal button text must be a string.");
	}

	if (!options.buttons.cancel) options.buttons.cancel = "Surrender";
	if (typeof options.buttons.cancel !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Cancel button text must be a string");
	}

	if (!options.buttons.accept) options.buttons.accept = "Accept";
	if (typeof options.buttons.accept !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Accept button text must be a string");
	}

	if (!options.buttons.deny) options.buttons.deny = "Deny";
	if (typeof options.buttons.deny !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Deny button text must be a string.");
	}

	if (!options.wrongUserFight) options.wrongUserFight = "**This is not your Game!**";
	if (typeof options.wrongUserFight !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Wrong Fight message must be a string.");
	}

	if (!options.opponentsTurnMessage) options.opponentsTurnMessage = "**Please wait for your opponents move!**";
	if (typeof options.opponentsTurnMessage !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Opponents turn message must be a string.");
	}

	if (!options.highHealthMessage) options.highHealthMessage = "You cannot heal if your HP is above 80!";
	if (typeof options.highHealthMessage !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "High health message must be a string.");
	}

	if (!options.lowHealthMessage) options.lowHealthMessage = "You cannot cancel the fight if your HP is below 50!";
	if (typeof options.lowHealthMessage !== "string") {
		return weky._LoggerManager.createTypeError("Fight", "Low health message must be a string.");
	}

	if (!options.opponent) {
		weky._LoggerManager.createError("Fight", "Opponent is missing from the options.");
		return;
	}

	if (!(options.opponent as GuildMember).user.username) {
		return weky._LoggerManager.createTypeError("Fight", "Opponent option must be User.");
	}

	if (id === options.opponent.id) {
		return context.channel.send({
			embeds: [weky._createErrorEmbed("Fight Error", "**Did you for real try to play with yourself?")],
		});
	}

	const challenger = await context.guild.members.fetch(id);
	const opponent = options.opponent;

	if (
		(await weky.NetworkManager.checkPlayerFightStatus(challenger.id)) ||
		(await weky.NetworkManager.checkPlayerFightStatus(opponent.id))
	) {
		const errorEmbed = weky._createErrorEmbed("Fight", "## One of the two Users are already in game!");

		await context.channel.send({
			embeds: [errorEmbed],
		});

		return;
	}

	const requestCard = await weky.NetworkManager.makeRequestCard(
		challenger.user.username,
		challenger.displayAvatarURL({ extension: "png", size: 256 }),
		opponent.user.username,
		opponent.displayAvatarURL({ extension: "png", size: 256 })
	);

	if (!requestCard) {
		const errorEmbed = weky._createErrorEmbed("API", "**API Failed to get the Request Card!**");

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

	const gameId = await weky.NetworkManager.createGame(
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
			const deniedCard = await weky.NetworkManager.makeDenyCard(
				challenger.user.username,
				challenger.displayAvatarURL({ extension: "png", size: 256 }),
				opponent.user.username,
				opponent.displayAvatarURL({ extension: "png", size: 256 })
			);

			const removed = await weky.NetworkManager.removeGame(gameId);

			if (!removed) {
				const embed = weky._createErrorEmbed("API", "**API Failed to Remove Fight from the Database**");

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
			await startFight(gameId, interaction, options, challenger, opponent, weky);
			collector.stop();
		}
	});

	collector.on("end", async (collected, reason) => {
		if (reason === "time" && collected.size === 0) {
			const timeoutCard = await weky.NetworkManager.makeTimeOutCard(
				challenger.user.username,
				challenger.displayAvatarURL({ extension: "png", size: 256 }),
				opponent.user.username,
				opponent.displayAvatarURL({ extension: "png", size: 256 })
			);

			const removed = await weky.NetworkManager.removeGame(gameId);

			if (!removed) {
				const embed = weky._createErrorEmbed(
					"API",
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
	weky: WekyManager
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
	const gameCard = await weky.NetworkManager.makeMainCard(
		gameID,
		challenger.displayAvatarURL({ extension: "png", size: 256 }),
		opponentOriginal.displayAvatarURL({ extension: "png", size: 256 })
	);

	let turn = await weky.NetworkManager.getTurn(gameID);

	const msg = await interaction.update({
		files: [gameCard],
		components: [actionRow, powerupRow],
	});

	// Create game collector
	const collector = msg.createMessageComponentCollector();

	collector.on("collect", async (i: ButtonInteraction) => {
		if (i.user.id !== challenger.id && i.user.id !== opponentOriginal.id) {
			await i.reply({
				embeds: [weky._createErrorEmbed("Fight", options.wrongUserFight)],
				flags: [MessageFlags.Ephemeral],
			});

			return;
		}

		if (i.user.id !== turn.userID) {
			await i.reply({
				embeds: [weky._createErrorEmbed("Fight", options.opponentsTurnMessage)],
				flags: [MessageFlags.Ephemeral],
			});

			return;
		}

		await i.deferUpdate();

		const player = await weky.NetworkManager.getPlayer(gameID, false);
		const opponent = await weky.NetworkManager.getPlayer(gameID, true);

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

			const updated = weky.NetworkManager.updatePlayers(gameID, player, opponent);

			if (!updated) {
				const embed = weky._createErrorEmbed("API", "**The API failed to update the data.**");

				await i.editReply({
					embeds: [embed],
					files: [],
					components: [],
					content: null,
				});

				return;
			}

			if (opponent.health <= 0) {
				const winnerCard = await weky.NetworkManager.makeWinCard(
					playerMember.user.username,
					playerMember.displayAvatarURL({ extension: "png", size: 256 }),
					opponentMember.user.username,
					opponentMember.displayAvatarURL({ extension: "png", size: 256 })
				);

				const removed = await weky.NetworkManager.removeGame(gameID);

				if (!removed) {
					const embed = weky._createErrorEmbed("API", "**API Failed to Remove Fight from the Database.**");

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

			const updated = weky.NetworkManager.updatePlayers(gameID, player, opponent);

			if (!updated) {
				const embed = weky._createErrorEmbed("API", "**The API failed to update the data.**");

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

			const surrenderCard = await weky.NetworkManager.makeSurrenderCard(
				opponentMember.user.username,
				opponentMember.displayAvatarURL({ extension: "png", size: 256 }),
				playerMember.user.username,
				playerMember.displayAvatarURL({ extension: "png", size: 256 })
			);

			const removed = await weky.NetworkManager.removeGame(gameID);

			if (!removed) {
				const embed = weky._createErrorEmbed("API", "**API Failed to Remove Fight from the Database.**");

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

				const updated = weky.NetworkManager.updatePlayers(gameID, player, opponent);

				if (!updated) {
					const embed = weky._createErrorEmbed("API", "**The API failed to update the data**");

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
		const turned = await weky.NetworkManager.changeTurn(gameID);

		if (!turned) {
			const embed = weky._createErrorEmbed("API", "**The API failed to update the data**");

			await i.editReply({
				embeds: [embed],
				files: [],
				components: [],
				content: null,
			});

			return;
		}

		// Update game state
		const newGameCard = await weky.NetworkManager.makeMainCard(
			gameID,
			challenger.displayAvatarURL({ extension: "png", size: 256 }),
			opponentOriginal.displayAvatarURL({ extension: "png", size: 256 })
		);

		turn = await weky.NetworkManager.getTurn(gameID);

		await i.editReply({
			files: [newGameCard],
			components: [actionRow, powerupRow],
		});
	});
}

export default Fight;
