import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import { decode } from "html-entities";

import { convertTime, createEmbed, getRandomString } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
import { getContextUserID } from "../functions/context.js";

import type { LieSwatterTypes } from "../Types/index.js";
import type { LoggerManager } from "../handlers/Logger.js";

interface OpenTDBResponse {
	response_code: number;
	results: {
		category: string;
		type: string;
		difficulty: string;
		question: string;
		correct_answer: string;
		incorrect_answers: string[];
	}[];
}

const LieSwatter = async (options: LieSwatterTypes, loggerManager: LoggerManager) => {
	// Check types
	OptionsChecking(options, "LieSwatter", loggerManager);

	const context = options.context;

	if (!context) return loggerManager.createError("LieSwatter", "No context provided.");

	if (!context.channel || !context.channel.isSendable() || context.channel.isDMBased())
		return loggerManager.createError("LieSwatter", "No channel found or the channel is invalid.");

	const id = getContextUserID(context);

	const id1 = getRandomString(20) + "-" + getRandomString(20);

	const id2 = getRandomString(20) + "-" + getRandomString(20);

	if (!options.winMessage) options.winMessage = "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";

	if (typeof options.winMessage !== "string") {
		return loggerManager.createTypeError("LieSwatter", "Win message must be a string.");
	}

	if (!options.loseMessage) options.loseMessage = "Better luck next time! It was a **{{answer}}**.";

	if (typeof options.loseMessage !== "string") {
		return loggerManager.createTypeError("LieSwatter", "Lose message must be a string.");
	}

	if (!options.othersMessage) options.othersMessage = "Only <@{{author}}> can use the buttons!";
	if (typeof options.othersMessage !== "string") {
		return loggerManager.createTypeError("LieSwatter", "Others message must be a string.");
	}

	if (!options.buttons)
		options.buttons = {
			true: "Truth",
			lie: "Lie",
		};

	if (typeof options.buttons !== "object") {
		return loggerManager.createTypeError("LieSwatter", "Buttons must be an object.");
	}

	if (!options.buttons.true) options.buttons.true = "Truth";
	if (typeof options.buttons.true !== "string") {
		return loggerManager.createTypeError("LieSwatter", "True button text must be a string.");
	}

	if (!options.buttons.lie) options.buttons.lie = "Lie";
	if (typeof options.buttons.lie !== "string") {
		return loggerManager.createTypeError("LieSwatter", "Lie button text must be a string.");
	}

	if (!options.thinkMessage) options.thinkMessage = "I am thinking...";
	if (typeof options.thinkMessage !== "string") {
		return loggerManager.createTypeError("LieSwatter", "Think message must be a string.");
	}

	options.embed.description = options.thinkMessage;
	let embed = createEmbed(options.embed);

	const msg = await context.channel.send({
		embeds: [embed],
	});

	const result = (await fetch(`https://opentdb.com/api.php?amount=1&type=boolean`).then((res) =>
		res.json()
	)) as OpenTDBResponse;

	const question = result.results[0];

	let answer: string;
	let winningID: string;
	if (question.correct_answer === "True") {
		winningID = id1;
		answer = options.buttons.true;
	} else {
		winningID = id2;
		answer = options.buttons.lie;
	}

	let btn1 = new ButtonBuilder().setCustomId(id1).setLabel(options.buttons.true).setStyle(ButtonStyle.Primary);

	let btn2 = new ButtonBuilder().setCustomId(id2).setLabel(options.buttons.lie).setStyle(ButtonStyle.Primary);

	options.embed.description = decode(question.question);
	embed = createEmbed(options.embed);

	await msg.edit({
		embeds: [embed],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1, btn2)],
	});

	const gameCreatedAt = Date.now();
	const gameCollector = msg.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: options.time ? options.time : 60_000,
	});

	gameCollector.on("collect", async (button) => {
		if (button.user.id !== id) {
			return button.reply({
				content: options.othersMessage
					? options.othersMessage.replace(`{{author}}`, id)
					: "Only <@" + id + "> can use the buttons!",
				flags: [MessageFlags.Ephemeral],
			});
		}

		await button.deferUpdate();

		if (button.customId === winningID) {
			btn1 = new ButtonBuilder()
				.setCustomId(id1)
				.setLabel(options.buttons ? options.buttons.true : "Truth")
				.setDisabled();

			btn2 = new ButtonBuilder()
				.setCustomId(id2)
				.setLabel(options.buttons ? options.buttons.lie : "Lie")
				.setDisabled();
			gameCollector.stop();
			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				btn2.setStyle(ButtonStyle.Danger);
			} else {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Success);
			}

			embed.setTimestamp(options.embed.timestamp ? new Date() : null);

			const time = convertTime(Date.now() - gameCreatedAt);

			options.embed.description = options.winMessage
				? options.winMessage.replace(`{{answer}}`, decode(answer)).replace(`{{time}}`, time)
				: `GG, It was a **${decode(answer)}**. You got it correct in **${time}**.`;

			const winEmbed = createEmbed(options.embed).setColor("Green");

			await msg.edit({
				embeds: [embed, winEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1, btn2)],
			});
		} else {
			btn1 = new ButtonBuilder()
				.setCustomId(id1)
				.setLabel(options.buttons ? options.buttons.true : "Truth")
				.setDisabled();

			btn2 = new ButtonBuilder()
				.setCustomId(id2)
				.setLabel(options.buttons ? options.buttons.lie : "Lie")
				.setDisabled();

			gameCollector.stop();
			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				btn2.setStyle(ButtonStyle.Danger);
			} else {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Success);
			}

			embed.setTimestamp(options.embed.timestamp ? new Date() : null);

			options.embed.description = options.loseMessage
				? options.loseMessage.replace("{{answer}}", decode(answer))
				: `Better luck next time! It was a **${decode(answer)}**.`;
			const lostEmbed = createEmbed(options.embed).setColor("Red");

			await msg.edit({
				embeds: [embed, lostEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1, btn2)],
			});
		}
	});

	gameCollector.on("end", async (collected, reason) => {
		if (reason === "time") {
			btn1 = new ButtonBuilder()
				.setCustomId(id1)
				.setLabel(options.buttons ? options.buttons.true : "Truth")
				.setDisabled();

			btn2 = new ButtonBuilder()
				.setCustomId(id2)
				.setLabel(options.buttons ? options.buttons.lie : "Lie")
				.setDisabled();

			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				btn2.setStyle(ButtonStyle.Danger);
			} else {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Success);
			}

			embed.setTimestamp(options.embed.timestamp ? new Date() : null);

			options.embed.description = options.loseMessage
				? options.loseMessage.replace("{{answer}}", decode(answer))
				: `**You run out of Time**\nBetter luck next time! It was a **${decode(answer)}**.`;
			const lostEmbed = createEmbed(options.embed).setColor("Red");

			await msg.edit({
				embeds: [embed, lostEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1, btn2)],
			});
		}
	});
};

export default LieSwatter;
