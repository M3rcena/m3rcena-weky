import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	Message,
	MessageFlags,
} from "discord.js";

import { convertTime, createEmbed, getRandomString } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";

import type { FastTypeTypes } from "../Types/index.js";
import { deferContext, getContextUserID } from "../functions/context.js";
import { NetworkManager } from "../handlers/NetworkManager.js";
import { LoggerManager } from "../handlers/Logger.js";

const data = new Set();

const FastType = async (networkManager: NetworkManager, options: FastTypeTypes, loggerManager: LoggerManager) => {
	OptionsChecking(options, "FastType", loggerManager);

	let context = options.context;

	if (!context.channel || !context.channel.isSendable() || !context.channel.isTextBased()) {
		loggerManager.createError("FastType", "The Context channel is not Sendable or Text-Based");
		return;
	}

	let id = getContextUserID(context);

	if (data.has(id)) return;
	data.add(id);

	const ids = getRandomString(20) + "-" + getRandomString(20);

	deferContext(context);

	const sentence = options.sentence
		? options.sentence
		: await networkManager.getText(options.difficulty ? options.difficulty.toLowerCase() : "medium");

	if (sentence.includes("Please try again!")) {
		const embed = createEmbed(options.embed).setDescription(`**${sentence}**`);

		await context.channel.send({
			embeds: [embed],
		});

		return;
	}

	const gameCreatedAt = Date.now();

	let btn1 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setLabel(options.buttonText ? options.buttonText : "Cancel")
		.setCustomId(ids);

	options.embed.description = options.embed.description
		? options.embed.description.replace("{{time}}", convertTime(options.time ? options.time : 60000))
		: `You have **${convertTime(options.time ? options.time : 60000)}** to type the sentence below.`;

	if (!options.embed.fields) {
		options.embed.fields = [{ name: "Sentence:", value: `${sentence}` }];
	}

	const embed = createEmbed(options.embed);

	const msg = await context.channel.send({
		embeds: [embed],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
	});

	const collector = context.channel.createMessageCollector({
		filter: (m: Message) => !m.author.bot && m.author.id === id,
		time: options.time ? options.time : 60000,
	});

	collector.on("collect", async (mes: Message) => {
		if (mes.content.toLowerCase().trim() === sentence.toLowerCase()) {
			const time = Date.now() - gameCreatedAt;
			const minute = (time / 1000 / 60) % 60;
			const wpm = mes.content.toLowerCase().trim().length / 5 / minute;
			options.embed.description = options.winMessage
				? options.winMessage.replace("{{time}}", convertTime(time)).replace("{{wpm}}", wpm.toFixed(2))
				: `You have typed the sentence correctly in **${convertTime(time)}** with **${wpm.toFixed(2)}** WPM.`;
			options.embed.fields = [];
			const _embed = createEmbed(options.embed).setColor("Green");

			embed.setTimestamp(options.embed.timestamp ? new Date() : null);

			await msg.edit({
				embeds: [embed, _embed],
				components: [],
			});

			collector.stop(mes.author.username);
			data.delete(id);
		} else {
			options.embed.fields = [];
			options.embed.title = options.loseMessage ? options.loseMessage : "Better Luck Next Time!";
			const _embed = createEmbed(options.embed).setColor("Red").setDescription(null);

			collector.stop(mes.author.username);
			data.delete(id);

			embed.setTimestamp(options.embed.timestamp ? new Date() : null);

			await msg.edit({
				embeds: [embed, _embed],
				components: [],
			});
		}
	});

	collector.on("end", async (_collected, reason) => {
		if (reason === "time") {
			options.embed.fields = [];
			options.embed.title = options.loseMessage ? options.loseMessage : "You run out of time!";
			const _embed = createEmbed(options.embed).setColor("Red").setDescription(null);

			embed.setTimestamp(options.embed.timestamp ? new Date() : null);

			await msg.edit({
				embeds: [embed, _embed],
				components: [],
			});

			data.delete(id);
		}
	});

	const gameCollector = msg.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter: (button: ButtonInteraction) => button.customId === ids,
		time: options.time ? options.time : 60000,
	});

	gameCollector.on("collect", async (button) => {
		if (button.user.id !== id) {
			return button.reply({
				content: options.othersMessage
					? options.othersMessage.replace("{{author}}", id)
					: `This button is for <@${id}>`,
				flags: [MessageFlags.Ephemeral],
			});
		}

		embed.setTimestamp(options.embed.timestamp ? new Date() : null);

		const _embed = createEmbed(options.embed)
			.setDescription(null)
			.setTitle("GAME CANCELLED")
			.setColor("Red")
			.setFields([]);

		await button.update({
			embeds: [embed, _embed],
			components: [],
		});
		gameCollector.stop();
		data.delete(id);
		return collector.stop();
	});
};

export default FastType;
