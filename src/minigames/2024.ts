import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageFlags } from "discord.js";

import { createEmbed, ErrorEmbed } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
import { LoggerManager } from "..//handlers/Logger.js";
import { getContextUserID } from "../functions/context.js";
import { NetworkManager } from "../handlers/NetworkManager.js";

import type { Types2048 } from "../Types/index.js";

const mapDirection = (customId: string): string => {
	switch (customId) {
		case "weky_up":
			return "UP";
		case "weky_down":
			return "DOWN";
		case "weky_left":
			return "LEFT";
		case "weky_right":
			return "RIGHT";
		default:
			return "";
	}
};

// Main game function that handles the 2048 game logic
const mini2048 = async (networkManager: NetworkManager, options: Types2048, loggerManager: LoggerManager) => {
	// Validate the provided options
	OptionsChecking(options, "2048", loggerManager);

	let context = options.context;

	if (!context.channel || !context.channel.isSendable() || context.channel.isDMBased())
		return loggerManager.createError("2048", "The Channel must be sendable and not in DMs");

	if (!context.guild) return loggerManager.createError("2048", "No guild found on Context.");

	const userID = getContextUserID(context);

	const member = await context.guild.members.fetch(userID);
	const username = member.user.username || "Player";
	const userIcon = member.user?.displayAvatarURL({ extension: "png" }) || "";

	const msg = await context.channel.send({ content: "Starting the game..." });

	const gameID = await networkManager.create2048Game(userID, username);

	if (gameID === "-1") {
		const embed = ErrorEmbed("2048")
			.setDescription("Could not create game. You might already have one running or the API is down.")
			.setTimestamp(options.embed.timestamp ? new Date() : null);

		return await msg.edit({ content: ``, embeds: [embed] }).catch(() => {});
	}

	let currentScore = 0;
	const initialImg = await networkManager.get2048BoardImage(gameID, userIcon);

	if (!initialImg) {
		await networkManager.end2048Game(gameID);
		return await msg.edit({ content: "Failed to generate game board." });
	}

	let originalDescription = options.embed.description;
	options.embed.description =
		originalDescription?.replace(`{{score}}`, `${currentScore}`).replace(`{{id}}`, `${userID}`) ||
		`ID: \`${userID}\`\nScore: \`${currentScore}\``;

	options.embed.image = "attachment://2048-board.png";

	let embed = createEmbed(options.embed);

	const up = new ButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(options.emojis?.up || "⬆️")
		.setCustomId("weky_up");
	const down = new ButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(options.emojis?.down || "⬇️")
		.setCustomId("weky_down");
	const left = new ButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(options.emojis?.left || "⬅️")
		.setCustomId("weky_left");
	const right = new ButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(options.emojis?.right || "➡️")
		.setCustomId("weky_right");
	const stop = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setLabel("Quit")
		.setCustomId("weky_quit")
		.setEmoji("🛑");

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(left, up, down, right);
	const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(stop);

	await msg
		.edit({
			content: `React with the buttons to play the game!`,
			embeds: [embed],
			components: [row, row2],
			files: [initialImg],
		})
		.catch(() => {});

	const collector = msg.createMessageComponentCollector({
		time: options.time || 600_000,
		componentType: ComponentType.Button,
	});

	collector.on("collect", async (btn) => {
		if (btn.user.id !== userID) {
			return btn.reply({ content: "This is not your game!", flags: [MessageFlags.Ephemeral] });
		}

		if (btn.customId === "weky_quit") {
			return collector.stop("quit");
		}

		const direction = mapDirection(btn.customId);
		if (!direction) return;

		await btn.deferUpdate();

		const moveResult = await networkManager.move2048(gameID, direction);

		if (!moveResult) {
			return btn.followUp({ content: "Failed to communicate with game server.", flags: [MessageFlags.Ephemeral] });
		}

		if (!moveResult.moved && !moveResult.gameOver) {
			return;
		}

		currentScore = moveResult.score;

		if (moveResult.gameOver || moveResult.won) {
			return collector.stop(moveResult.won ? "won" : "gameover");
		}

		const newImg = await networkManager.get2048BoardImage(gameID, userIcon);

		if (!newImg) {
			return btn.followUp({ content: "Failed to render board.", flags: [MessageFlags.Ephemeral] });
		}

		options.embed.description =
			originalDescription?.replace(`{{score}}`, `${currentScore}`).replace(`{{id}}`, `${userID}`) ||
			`ID: \`${userID}\`\nScore: \`${currentScore}\``;

		embed = createEmbed(options.embed);

		await msg
			.edit({
				embeds: [embed],
				files: [newImg],
				components: [row, row2],
			})
			.catch(() => {});
	});

	collector.on("end", async (_, reason) => {
		const gameOverImg = await networkManager.get2048BoardImage(gameID, userIcon);

		await networkManager.end2048Game(gameID);

		const endEmbed = new EmbedBuilder().setColor(reason === "won" ? "Green" : "Red").setTimestamp(new Date());

		if (reason === "quit") {
			endEmbed.setTitle("Game Stopped").setDescription(`You quit the game.\nFinal Score: \`${currentScore}\``);
		} else if (reason === "won") {
			endEmbed.setTitle("You Won! 🎉").setDescription(`You reached **2048**!\nFinal Score: \`${currentScore}\``);
		} else if (reason === "gameover") {
			endEmbed.setTitle("Game Over").setDescription(`No more moves available.\nFinal Score: \`${currentScore}\``);
		} else {
			endEmbed.setTitle("Time's Up").setDescription(`Game session expired.\nFinal Score: \`${currentScore}\``);
		}

		const files = gameOverImg ? [gameOverImg] : [];
		if (gameOverImg) {
			endEmbed.setImage("attachment://2048-board.png");
		}

		await msg
			.edit({
				content: ``,
				embeds: [endEmbed],
				components: [],
				files: files,
			})
			.catch(() => {});
	});
};

export default mini2048;
