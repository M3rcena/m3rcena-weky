import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, Message, MessageFlags } from "discord.js";

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
	const btnText = options.buttonText || "Cancel";

	const msgWin = options.winMessage || "You typed it in **{{time}}** with **{{wpm}} WPM**!";
	const msgLose = options.loseMessage || "You made a typo! Better luck next time.";
	const msgTimeout = "You ran out of time!";

	const createGameContainer = (
		state: "loading" | "active" | "won" | "lost" | "timeout" | "cancelled" | "error",
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
				content = `## ${gameTitle}\n> 🔄 Preparing sentence...`;
				break;

			case "active":
				container.setAccentColor(defaultColor);
				content =
					`## ${gameTitle}\n` +
					`> Type the sentence below as fast as you can!\n\n` +
					`\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "won":
				container.setAccentColor(0x57f287); // Green
				const winText = msgWin.replace("{{time}}", data.timeTaken || "0s").replace("{{wpm}}", data.wpm || "0");

				content = `## 🏆 Fast Fingers!\n> ${winText}\n\n` + `**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "lost":
				container.setAccentColor(0xed4245); // Red
				content = `## ❌ Incorrect\n> ${msgLose}\n\n` + `**Correct Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "timeout":
				container.setAccentColor(0xed4245); // Red
				content = `## ⏱️ Time's Up\n> ${msgTimeout}\n\n` + `**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "cancelled":
				container.setAccentColor(0xed4245); // Red
				content = `## 🚫 Game Cancelled\n> You ended the game.`;
				break;

			case "error":
				container.setAccentColor(0xff0000);
				content = `## ❌ Error\n> ${data.errorDetails || "Something went wrong."}`;
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
				components: [createGameContainer("error", { errorDetails: "Failed to fetch sentence." })],
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

	msgCollector.on("collect", async (mes: Message) => {
		const input = mes.content.toLowerCase().trim();
		const target = sentence!.toLowerCase().trim();

		if (input === target) {
			msgCollector.stop("won");
			btnCollector.stop();
			activePlayers.delete(userId);

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
			btnCollector.stop();
			activePlayers.delete(userId);

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
			btnCollector.stop();
			activePlayers.delete(userId);

			await msg.edit({
				components: [createGameContainer("cancelled", {})],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	});

	msgCollector.on("end", async (_collected, reason) => {
		if (reason === "time") {
			btnCollector.stop();
			activePlayers.delete(userId);

			try {
				await msg.edit({
					components: [createGameContainer("timeout", { sentence })],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
	});
};

export default FastType;
