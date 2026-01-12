import {
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	ContainerBuilder,
	MediaGalleryBuilder,
	MessageFlags,
} from "discord.js";

import type { CustomOptions, Types2048 } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const activePlayers = new Set();

const mapDirection = (customId: string): string => {
	switch (customId) {
		case "weky_2048_up":
			return "UP";
		case "weky_2048_down":
			return "DOWN";
		case "weky_2048_left":
			return "LEFT";
		case "weky_2048_right":
			return "RIGHT";
		default:
			return "";
	}
};

const mini2048 = async (weky: WekyManager, options: CustomOptions<Types2048>) => {
	const context = options.context;
	const userId = weky._getContextUserID(context);

	if (activePlayers.has(userId)) return;
	activePlayers.add(userId);

	const member = await context.guild?.members.fetch(userId);
	const username = member?.user.username || "Player";
	const userIcon = member?.user.displayAvatarURL({ extension: "png" }) || "";

	const gameTitle = options.embed.title || "2048";
	const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;

	const emojiUp = options.emojis?.up || "⬆️";
	const emojiDown = options.emojis?.down || "⬇️";
	const emojiLeft = options.emojis?.left || "⬅️";
	const emojiRight = options.emojis?.right || "➡️";

	const createGameContainer = (
		state: "loading" | "active" | "won" | "gameover" | "quit" | "timeout" | "error",
		details?: { error?: string; image?: string; score?: number }
	) => {
		const container = new ContainerBuilder();
		let content = "";
		const score = details?.score || 0;

		switch (state) {
			case "loading":
				container.setAccentColor(defaultColor);
				content = options.loadingMessage
					? options.loadingMessage.replace("{{gameTitle}}", gameTitle)
					: `## ${gameTitle}\n> 🔄 Starting game...`;
				break;

			case "active":
				container.setAccentColor(defaultColor);
				content = options.activeMessage
					? options.activeMessage.replace("{{gameTitle}}", gameTitle).replace("{{score}}", score.toString())
					: `## ${gameTitle}\n> Combine the tiles to reach **2048**!\n\n**Score:** \`${score}\``;
				break;

			case "won":
				container.setAccentColor(0x57f287); // Green
				content = options.wonMessage
					? options.wonMessage.replace("{{score}}", score.toString())
					: `## 🎉 You Won!\n> You reached the **2048** tile!\n\n**Final Score:** \`${score}\``;
				break;

			case "gameover":
				container.setAccentColor(0xed4245); // Red
				content = options.gameoverMessage
					? options.gameoverMessage.replace("{{score}}", score.toString())
					: `## 💀 Game Over\n> No more moves available.\n\n**Final Score:** \`${score}\``;
				break;

			case "quit":
				container.setAccentColor(0xed4245); // Red
				content = options.quitMessage
					? options.quitMessage.replace("{{score}}", score.toString())
					: `## 🛑 Game Stopped\n> You quit the game.\n\n**Final Score:** \`${score}\``;
				break;

			case "timeout":
				container.setAccentColor(0xed4245); // Red
				content = options.timeoutMessage
					? options.timeoutMessage.replace("{{score}}", score.toString())
					: `## ⏱️ Time's Up\n> Game session expired.\n\n**Final Score:** \`${score}\``;
				break;

			case "error":
				container.setAccentColor(0xff0000);
				content = options.errorMessage
					? options.errorMessage.replace("{{error}}", details?.error || "Uknown")
					: `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
				break;
		}

		container.addTextDisplayComponents((t) => t.setContent(content));

		if (details?.image) {
			const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
			container.addMediaGalleryComponents(gallery);
		}

		if (state === "active") {
			const up = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(emojiUp).setCustomId("weky_2048_up");
			const down = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(emojiDown)
				.setCustomId("weky_2048_down");
			const left = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(emojiLeft)
				.setCustomId("weky_2048_left");
			const right = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(emojiRight)
				.setCustomId("weky_2048_right");

			const stop = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel("Quit")
				.setCustomId("weky_2048_quit")
				.setEmoji("🛑");

			const dis1 = new ButtonBuilder()
				.setLabel(`\u200b`)
				.setStyle(ButtonStyle.Secondary)
				.setCustomId("dis1")
				.setDisabled(true);
			const dis2 = new ButtonBuilder()
				.setLabel(`\u200b`)
				.setStyle(ButtonStyle.Secondary)
				.setCustomId("dis2")
				.setDisabled(true);

			container.addActionRowComponents((row) => row.setComponents(dis1, up, dis2, stop));

			container.addActionRowComponents((row) => row.setComponents(left, down, right));
		}

		return container;
	};

	const msg = await context.channel.send({
		components: [createGameContainer("loading")],
		flags: MessageFlags.IsComponentsV2,
		allowedMentions: { repliedUser: false },
	});

	const gameID = await weky.NetworkManager.create2048Game(userId, username);

	if (gameID === "-1") {
		activePlayers.delete(userId);
		return await msg.edit({
			components: [createGameContainer("error", { error: "Could not create game." })],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	let currentScore = 0;
	const initialImg = await weky.NetworkManager.get2048BoardImage(gameID, userIcon);

	if (!initialImg) {
		await weky.NetworkManager.end2048Game(gameID);
		activePlayers.delete(userId);
		return await msg.edit({
			components: [createGameContainer("error", { error: "Failed to generate board." })],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	await msg.edit({
		components: [createGameContainer("active", { image: "2048-board.png", score: currentScore })],
		files: [initialImg],
		flags: MessageFlags.IsComponentsV2,
	});

	const collector = msg.createMessageComponentCollector({
		time: options.time || 600_000,
		componentType: ComponentType.Button,
	});

	collector.on("collect", async (btn) => {
		if (btn.user.id !== userId) {
			return btn.reply({ content: "This is not your game!", flags: [MessageFlags.Ephemeral] });
		}

		if (btn.customId === "weky_2048_quit") {
			await btn.deferUpdate();
			return collector.stop("quit");
		}

		const direction = mapDirection(btn.customId);
		if (!direction) return;

		await btn.deferUpdate();

		const moveResult = await weky.NetworkManager.move2048(gameID, direction);

		if (!moveResult) {
			return btn.followUp({ content: "Connection error!", flags: [MessageFlags.Ephemeral] });
		}

		if (!moveResult.moved && !moveResult.gameOver) {
			return;
		}

		currentScore = moveResult.score;

		if (moveResult.gameOver || moveResult.won) {
			return collector.stop(moveResult.won ? "won" : "gameover");
		}

		const newImg = await weky.NetworkManager.get2048BoardImage(gameID, userIcon);
		if (newImg) {
			await msg
				.edit({
					files: [newImg],
					components: [createGameContainer("active", { image: "2048-board.png", score: currentScore })],
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		}
	});

	collector.on("end", async (_, reason) => {
		const finalImg = await weky.NetworkManager.get2048BoardImage(gameID, userIcon);

		await weky.NetworkManager.end2048Game(gameID);
		activePlayers.delete(userId);

		let endState: "won" | "gameover" | "quit" | "timeout" = "gameover";
		if (reason === "won") endState = "won";
		else if (reason === "quit") endState = "quit";
		else if (reason === "time") endState = "timeout";

		await msg
			.edit({
				components: [
					createGameContainer(endState, { image: finalImg ? "2048-board.png" : undefined, score: currentScore }),
				],
				files: finalImg ? [finalImg] : [],
				flags: MessageFlags.IsComponentsV2,
			})
			.catch(() => {});
	});
};

export default mini2048;
