import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, Message, MessageFlags, Typing } from "discord.js";

import type { CustomOptions, FastTypeTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const activePlayers = new Set();

const FastType = async (weky: WekyManager, options: CustomOptions<FastTypeTypes>) => {
	const context = options.context;
	const userId = weky._getContextUserID(context);

	if (activePlayers.has(userId)) return;
	activePlayers.add(userId);

	const cancelId = `ft_cancel_${weky.getRandomString(10)}`;

	const gameTitle = options.embed.title || "Fast Type";
	const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;

	const btnText = options.cancelButton || "Cancel";

	const msgWin = options.winMessage || "You typed it in **{{time}}** with **{{wpm}} WPM**!";
	const msgLose = options.loseMessage || "You made a typo! Better luck next time.";
	const msgTimeout = options.timeoutMessage || "You ran out of time!";
	const msgCheat = options.cheatMessage || "⚠️ **Anti-Cheat:** You didn't type! Copy-pasting is not allowed.";

	let hasStartedTyping = false;

	const createGameContainer = (
		state: "loading" | "active" | "won" | "lost" | "timeout" | "cancelled" | "error" | "cheat",
		data: {
			sentence?: string;
			wpm?: string;
			timeTaken?: string;
			errorDetails?: string;
		}
	) => {
		const container = new ContainerBuilder();
		let content = "";

		switch (state) {
			case "loading":
				container.setAccentColor(defaultColor);
				content = options.states?.loading
					? options.states.loading.replace("{{gameTitle", gameTitle)
					: `## ${gameTitle}\n> 🔄 Preparing sentence...`;
				break;

			case "active":
				container.setAccentColor(defaultColor);
				content = options.states?.active
					? options.states.active.replace("{{gameTitle}}", gameTitle).replace("{{sentence}}", data.sentence)
					: `## ${gameTitle}\n> Type the sentence below as fast as you can!\n\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "won":
				container.setAccentColor(0x57f287); // Green
				const winText = msgWin.replace("{{time}}", data.timeTaken || "0s").replace("{{wpm}}", data.wpm || "0");

				content = options.states?.won
					? options.states.won.replace("{{winText}}", winText).replace("{{sentence}}", data.sentence)
					: `## 🏆 Fast Fingers!\n> ${winText}\n\n**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "lost":
				container.setAccentColor(0xed4245); // Red
				content = options.states?.lost
					? options.states.lost.replace("{{msgLose}}", msgLose).replace("{{sentence}}", data.sentence)
					: `## ❌ Incorrect\n> ${msgLose}\n\n` + `**Correct Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "cheat":
				container.setAccentColor(0xed4245); // Red
				content = options.states?.cheat
					? options.states.cheat.replace("{{msgCheat}}", msgCheat).replace("{{sentence}}", data.sentence)
					: `## ⚠️ Cheat Detected\n> ${msgCheat}\n\n` + `**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "timeout":
				container.setAccentColor(0xed4245); // Red
				content = options.states?.timeout
					? options.states.timeout.replace("{{msgTimeout}}", msgTimeout).replace("{{sentence}}", data.sentence)
					: `## ⏱️ Time's Up\n> ${msgTimeout}\n\n` + `**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "cancelled":
				container.setAccentColor(0xed4245); // Red
				content = options.states?.cancelled
					? options.states.cancelled.replace("{{sentence}}", data.sentence)
					: `## 🚫 Game Cancelled\n> You ended the game.`;
				break;

			case "error":
				container.setAccentColor(0xff0000);
				content = options.states?.error?.main
					? options.states.error?.main.replace(
							"{{error}}",
							data.errorDetails || options.states?.error?.details
								? options.states.error.details
								: "Something went wrong."
					  )
					: `## ❌ Error\n> ${
							data.errorDetails || options.states?.error?.details
								? options.states.error.details
								: "Something went wrong."
					  }`;
				break;
		}

		container.addTextDisplayComponents((t) => t.setContent(content));

		if (state === "active") {
			const btnCancel = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(btnText).setCustomId(cancelId);
			container.addActionRowComponents((row) => row.setComponents(btnCancel));
		}

		return container;
	};

	const msg = await context.channel.send({
		components: [createGameContainer("loading", {})],
		flags: MessageFlags.IsComponentsV2,
		allowedMentions: { repliedUser: false },
	});

	let sentence = options.sentence;
	if (!sentence) {
		try {
			sentence = await weky.NetworkManager.getText(options.difficulty ? options.difficulty.toLowerCase() : "medium");
		} catch (e) {
			activePlayers.delete(userId);
			return await msg.edit({
				components: [
					createGameContainer("error", {
						errorDetails: options.failedFetchError ? options.failedFetchError : "Failed to fetch sentence.",
					}),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}

	if (sentence.includes("Please try again!")) {
		activePlayers.delete(userId);
		return await msg.edit({
			components: [createGameContainer("error", { errorDetails: sentence })],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	const typingHandler = (typing: Typing) => {
		if (typing.channel.id === context.channel.id && typing.user.id === userId) {
			hasStartedTyping = true;
		}
	};

	weky._client.on("typingStart", typingHandler);

	await msg.edit({
		components: [createGameContainer("active", { sentence })],
		flags: MessageFlags.IsComponentsV2,
	});

	const gameCreatedAt = Date.now();
	const timeLimit = options.time || 60000;

	const msgCollector = context.channel.createMessageCollector({
		filter: (m: Message) => !m.author.bot && m.author.id === userId,
		time: timeLimit,
	});

	const btnCollector = msg.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter: (i) => i.user.id === userId,
		time: timeLimit,
	});

	const cleanupGame = () => {
		activePlayers.delete(userId);
		weky._client.off("typingStart", typingHandler);
		btnCollector.stop();
	};

	msgCollector.on("collect", async (mes: Message) => {
		const input = mes.content.toLowerCase().trim();
		const target = sentence!.toLowerCase().trim();

		if (!hasStartedTyping) {
			msgCollector.stop("cheat");
			cleanupGame();

			await msg.edit({
				components: [createGameContainer("cheat", { sentence })],
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}

		// 2. CHECK ACCURACY
		if (input === target) {
			msgCollector.stop("won");
			cleanupGame();

			const timeMs = Date.now() - gameCreatedAt;
			const timeTaken = weky.convertTime(timeMs);

			const minutes = timeMs / 1000 / 60;
			const wpm = sentence!.length / 5 / minutes;

			await msg.edit({
				components: [
					createGameContainer("won", {
						sentence,
						timeTaken,
						wpm: wpm.toFixed(2),
					}),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			msgCollector.stop("lost");
			cleanupGame();

			await msg.edit({
				components: [createGameContainer("lost", { sentence })],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	});

	btnCollector.on("collect", async (btn) => {
		if (btn.customId === cancelId) {
			await btn.deferUpdate();
			msgCollector.stop("cancelled");
			cleanupGame();

			await msg.edit({
				components: [createGameContainer("cancelled", {})],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	});

	msgCollector.on("end", async (_collected, reason) => {
		if (reason === "time") {
			cleanupGame();

			try {
				await msg.edit({
					components: [createGameContainer("timeout", { sentence })],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
		weky._client.off("typingStart", typingHandler);
	});
};

export default FastType;
