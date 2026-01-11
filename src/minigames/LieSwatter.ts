import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import { decode } from "html-entities";

import type { CustomOptions, LieSwatterTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";

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

const LieSwatter = async (weky: WekyManager, options: CustomOptions<LieSwatterTypes>) => {
	const context = options.context;

	const id = weky._getContextUserID(context);

	const id1 = weky.getRandomString(20) + "-" + weky.getRandomString(20);

	const id2 = weky.getRandomString(20) + "-" + weky.getRandomString(20);

	if (!options.winMessage) options.winMessage = "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";

	if (typeof options.winMessage !== "string") {
		return weky._LoggerManager.createTypeError("LieSwatter", "Win message must be a string.");
	}

	if (!options.loseMessage) options.loseMessage = "Better luck next time! It was a **{{answer}}**.";

	if (typeof options.loseMessage !== "string") {
		return weky._LoggerManager.createTypeError("LieSwatter", "Lose message must be a string.");
	}

	if (!options.othersMessage) options.othersMessage = "Only <@{{author}}> can use the buttons!";
	if (typeof options.othersMessage !== "string") {
		return weky._LoggerManager.createTypeError("LieSwatter", "Others message must be a string.");
	}

	if (!options.buttons)
		options.buttons = {
			true: "Truth",
			lie: "Lie",
		};

	if (typeof options.buttons !== "object") {
		return weky._LoggerManager.createTypeError("LieSwatter", "Buttons must be an object.");
	}

	if (!options.buttons.true) options.buttons.true = "Truth";
	if (typeof options.buttons.true !== "string") {
		return weky._LoggerManager.createTypeError("LieSwatter", "True button text must be a string.");
	}

	if (!options.buttons.lie) options.buttons.lie = "Lie";
	if (typeof options.buttons.lie !== "string") {
		return weky._LoggerManager.createTypeError("LieSwatter", "Lie button text must be a string.");
	}

	if (!options.thinkMessage) options.thinkMessage = "I am thinking...";
	if (typeof options.thinkMessage !== "string") {
		return weky._LoggerManager.createTypeError("LieSwatter", "Think message must be a string.");
	}

	options.embed.description = options.thinkMessage;
	let embed = weky._createEmbed(options.embed);

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
	embed = weky._createEmbed(options.embed);

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

			const time = weky.convertTime(Date.now() - gameCreatedAt);

			options.embed.description = options.winMessage
				? options.winMessage.replace(`{{answer}}`, decode(answer)).replace(`{{time}}`, time)
				: `GG, It was a **${decode(answer)}**. You got it correct in **${time}**.`;

			const winEmbed = weky._createEmbed(options.embed).setColor("Green");

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
			const lostEmbed = weky._createEmbed(options.embed).setColor("Red");

			await msg.edit({
				embeds: [embed, lostEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1, btn2)],
			});
		}
	});

	gameCollector.on("end", async (_, reason) => {
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
			const lostEmbed = weky._createEmbed(options.embed).setColor("Red");

			await msg.edit({
				embeds: [embed, lostEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1, btn2)],
			});
		}
	});
};

export default LieSwatter;
