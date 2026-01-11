import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, Message, MessageFlags } from "discord.js";

import type { ChaosTypes, CustomOptions } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const activePlayers = new Set();

const ChaosWords = async (weky: WekyManager, options: CustomOptions<ChaosTypes>) => {
	const context = options.context;
	const userId = weky._getContextUserID(context);

	if (activePlayers.has(userId)) return;
	activePlayers.add(userId);

	const cancelId = `chaos_cancel_${weky.getRandomString(10)}`;
	const gameTitle = options.embed.title || "Chaos Words";
	const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;

	const maxTries = options.maxTries || 10;
	const timeLimit = options.time || 60000;

	let words: string[] = options.words || [];
	if (words.length === 0) {
		try {
			const fetchedWords = await weky.NetworkManager.getRandomSentence(Math.floor(Math.random() * 3) + 2);
			words = fetchedWords.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
			words = words.filter((w) => w.length > 0);
		} catch (e) {
			activePlayers.delete(userId);
			return context.channel.send("Failed to fetch words.");
		}
	} else {
		words = words.map((w) => w.toLowerCase());
	}

	const totalWordLength = words.join("").length;
	let charCount = options.charGenerated || totalWordLength + 5;

	const chaosArray: string[] = [];
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	for (let i = 0; i < charCount; i++) {
		chaosArray.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
	}

	words.forEach((word) => {
		const insertPos = Math.floor(Math.random() * chaosArray.length);
		chaosArray.splice(insertPos, 0, word);
	});

	const gameState = {
		remaining: [...words],
		found: [] as string[],
		tries: 0,
	};

	const createGameContainer = (
		state: "active" | "correct" | "wrong" | "repeat" | "won" | "lost" | "timeout" | "cancelled",
		details?: { feedback?: string; timeTaken?: string }
	) => {
		const container = new ContainerBuilder();
		let content = "";

		switch (state) {
			case "active":
				container.setAccentColor(defaultColor);
				content = `## ${gameTitle}\n> Find the hidden words in the text below!`;
				break;

			case "correct":
				container.setAccentColor(0x57f287); // Green
				content = `## ${gameTitle}\n> ✅ **${details?.feedback}**`;
				break;

			case "wrong":
				container.setAccentColor(0xed4245); // Red
				content = `## ${gameTitle}\n> ❌ **${details?.feedback}**`;
				break;

			case "repeat":
				container.setAccentColor(0xfee75c); // Yellow
				content = `## ${gameTitle}\n> ⚠️ **${details?.feedback}**`;
				break;

			case "won":
				container.setAccentColor(0x57f287); // Green
				const winMsg = (options.winMessage || "You found all words in **{{time}}**!").replace(
					"{{time}}",
					details?.timeTaken || ""
				);
				content = `## 🏆 You Won!\n> ${winMsg}`;
				break;

			case "lost":
				container.setAccentColor(0xed4245); // Red
				const loseMsg = options.loseMessage || "You failed to find all words.";
				content = `## ❌ Game Over\n> ${loseMsg}`;
				break;

			case "timeout":
				container.setAccentColor(0xed4245); // Red
				content = `## ⏱️ Time's Up\n> You ran out of time!`;
				break;

			case "cancelled":
				container.setAccentColor(0xed4245); // Red
				content = `## 🚫 Cancelled\n> Game ended by player.`;
				break;
		}

		if (state !== "cancelled") {
			const currentChaosString = chaosArray.join("");
			content += `\n\n**Chaos String:**\n\`\`\`text\n${currentChaosString}\n\`\`\``;

			content +=
				`\n**Words Found (${gameState.found.length}/${words.length}):**\n` +
				`${gameState.found.length > 0 ? gameState.found.map((w) => `\`${w}\``).join(", ") : "_None yet_"}`;

			if (state === "won") {
			} else if (state === "lost" || state === "timeout") {
				content += `\n\n**Missing Words:**\n${gameState.remaining.map((w) => `\`${w}\``).join(", ")}`;
			} else {
				content += `\n\n**Tries:** ${gameState.tries}/${maxTries}`;
				content += `\n> ⏳ Time Remaining: **${weky.convertTime(timeLimit)}**`;
			}
		}

		container.addTextDisplayComponents((t) => t.setContent(content));

		if (state === "active" || state === "correct" || state === "wrong" || state === "repeat") {
			const btnCancel = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(options.buttonText || "Cancel")
				.setCustomId(cancelId);

			container.addActionRowComponents((row) => row.setComponents(btnCancel));
		}

		return container;
	};

	const msg = await context.channel.send({
		components: [createGameContainer("active")],
		flags: MessageFlags.IsComponentsV2,
		allowedMentions: { repliedUser: false },
	});

	const gameCreatedAt = Date.now();

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
		const guess = mes.content.toLowerCase().trim();

		if (mes.deletable) await mes.delete().catch(() => {});

		if (gameState.found.includes(guess)) {
			await msg.edit({
				components: [createGameContainer("repeat", { feedback: `You already found "${guess}"!` })],
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}

		if (gameState.remaining.includes(guess)) {
			gameState.found.push(guess);
			gameState.remaining = gameState.remaining.filter((w) => w !== guess);

			const indexInChaos = chaosArray.indexOf(guess);
			if (indexInChaos > -1) {
				chaosArray.splice(indexInChaos, 1);
			}

			if (gameState.remaining.length === 0) {
				msgCollector.stop("won");
				btnCollector.stop();
				activePlayers.delete(userId);

				const timeTaken = weky.convertTime(Date.now() - gameCreatedAt);

				await msg.edit({
					components: [createGameContainer("won", { timeTaken })],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				const correctMsg = options.correctWord
					? options.correctWord.replace("{{word}}", guess).replace("{{remaining}}", `${gameState.remaining.length}`)
					: `Correct! **${guess}** was found.`;

				await msg.edit({
					components: [createGameContainer("correct", { feedback: correctMsg })],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} else {
			gameState.tries++;

			if (gameState.tries >= maxTries) {
				msgCollector.stop("lost");
				btnCollector.stop();
				activePlayers.delete(userId);

				await msg.edit({
					components: [createGameContainer("lost")],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				const wrongMsg = options.wrongWord
					? options.wrongWord.replace("{{remaining_tries}}", `${maxTries - gameState.tries}`)
					: `**${guess}** is not in the text!`;

				await msg.edit({
					components: [createGameContainer("wrong", { feedback: wrongMsg })],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	});

	btnCollector.on("collect", async (btn) => {
		if (btn.customId === cancelId) {
			await btn.deferUpdate();
			msgCollector.stop("cancelled");
			btnCollector.stop();
			activePlayers.delete(userId);

			await msg.edit({
				components: [createGameContainer("cancelled")],
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
					components: [createGameContainer("timeout")],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
	});
};

export default ChaosWords;
