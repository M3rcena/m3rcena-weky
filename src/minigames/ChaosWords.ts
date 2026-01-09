import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";

import { convertTime, createEmbed, getRandomSentence, getRandomString } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";

import type { ChaosTypes, Fields } from "../Types/index.js";
import { deferContext, getContextUserID } from "../functions/context.js";
import { LoggerManager } from "../handlers/Logger.js";

const data = new Set();

const ChaosWords = async (options: ChaosTypes, loggerManager: LoggerManager) => {
	// Check types
	OptionsChecking(options, "ChaosWords", loggerManager);

	let context = options.context;

	if (!context.channel) {
		loggerManager.createError("ChaosWords", "No channel found on Context");
		return;
	}

	if (!context.channel.isSendable()) {
		loggerManager.createError("ChaosWords", "Channel is not Sendable");
		return;
	}

	let id = getContextUserID(context);

	if (data.has(id)) return;
	data.add(id);

	const ids = getRandomString(20) + "-" + getRandomString(20);

	let tries = 0;
	const array: string[] = [];
	let remaining = 0;
	const guessed: string[] = [];

	let words = options.words ? options.words : getRandomSentence(Math.floor(Math.random() * 6) + 2);
	let charGenerated = options.charGenerated
		? options.charGenerated
		: options.words
		? options.words.join("").length - 1
		: 0;
	if (words.join("").length > charGenerated) {
		charGenerated = words.join("").length - 1;
	}

	for (let i = 0; i < charGenerated; i++) {
		array.push("abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * "abcdefghijklmnopqrstuvwxyz".length)));
	}

	words.forEach((e) => {
		array.splice(Math.floor(Math.random() * array.length), 0, e);
	});

	let fields: Fields[] = [];
	if (!options.embed.fields) {
		fields = [
			{
				name: "Sentence:",
				value: array.join(""),
			},
			{
				name: "Words Found / Remaining:",
				value: `${remaining} / ${words.length}`,
			},
			{
				name: "Words Found:",
				value: `${guessed.join(", ")}`,
			},
			{
				name: "Words:",
				value: words.join(", "),
			},
		];
	}

	let embed = createEmbed(options.embed).setDescription(
		options.embed.description
			? options.embed.description.replace("{{time}}", convertTime(options.time ? options.time : 60000))
			: `You have **${convertTime(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`
	);

	if (!options.embed.fields) {
		fields = [
			{
				name: "Sentence:",
				value: array.join(""),
			},
			{
				name: "Words Found / Remaining:",
				value: `${remaining} / ${words.length}`,
			},
			{
				name: "Words Found:",
				value: `${guessed.join(", ")}`,
			},
			{
				name: "Words:",
				value: words.join(", "),
			},
		];

		let _field: Fields[] = [];
		fields.map((field, index) => {
			if (index < 2) {
				_field.push({
					name: `${field.name}`,
					value: `${field.value}`,
				});
			}
		});
		embed.setFields(_field);
	}

	let btn1 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setLabel(options.buttonText ? options.buttonText : "Cancel")
		.setCustomId(ids);

	deferContext(context);

	const originalSentence = array;

	const msg = await context.channel.send({
		embeds: [embed],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
	});

	const gameCreatedAt = Date.now();

	if (!context.channel || !context.channel.isTextBased()) return;
	const game = context.channel.createMessageCollector({
		filter: (m) => m.author.id === id,
		time: options.time ? options.time : 60000,
	});

	if (!context.channel || !context.channel.isSendable()) return;
	game.on("collect", async (mes) => {
		if (words === undefined) return;
		const condition = words.includes(mes.content.toLowerCase()) && !guessed.includes(mes.content.toLowerCase());

		if (condition) {
			remaining++;
			array.splice(array.indexOf(mes.content.toLowerCase()), 1);
			guessed.push(mes.content.toLowerCase());
			let _embed = createEmbed(options.embed).setDescription(
				options.embed.description
					? options.embed.description.replace("{{time}}", convertTime(options.time ? options.time : 60000))
					: `You have **${convertTime(
							options.time ? options.time : 60000
					  )}** to find the correct words in the chaos above.`
			);

			if (!options.embed.fields) {
				fields = [
					{
						name: "Sentence:",
						value: array.join(""),
					},
					{
						name: "Words Found / Remaining:",
						value: `${remaining} / ${words.length}`,
					},
					{
						name: "Words Found:",
						value: `${guessed.join(", ")}`,
					},
					{
						name: "Words:",
						value: words.join(", "),
					},
				];

				let _field: Fields[] = [];
				fields.map((field, index) => {
					if (index < 3) {
						_field.push({
							name: `${field.name}`,
							value: `${field.value}`,
						});
					}
				});
				_embed.setFields(_field);
			}

			btn1 = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(options.buttonText ? options.buttonText : "Cancel")
				.setCustomId(ids);

			const correctEmbed = createEmbed(options.embed, true).setColor(`Green`).setDescription(`
										${
											options.correctWord
												? options.correctWord
														.replace("{{word}}", mes.content.toLowerCase())
														.replace("{{remaining}}", `${words.length - remaining}`)
												: `GG, **${mes.content.toLowerCase()}** was correct! You have to find **${
														words.length - remaining
												  }** more word(s).`
										}
										`);

			await msg.edit({
				embeds: [_embed, correctEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
			});

			if (remaining === words.length) {
				if (!context.channel || !context.channel.isSendable()) return;
				btn1 = new ButtonBuilder()
					.setStyle(ButtonStyle.Danger)
					.setLabel(options.buttonText ? options.buttonText : "Cancel")
					.setDisabled()
					.setCustomId(ids);

				await msg.edit({
					embeds: [embed],
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
				});

				const time = convertTime(Date.now() - gameCreatedAt);
				let __embed = createEmbed(options.embed)
					.setColor("Green")
					.setDescription(
						options.winMessage ? options.winMessage.replace("{{time}}", time) : `You found all the words in **${time}**`
					);

				if (!options.embed.fields) {
					fields = [
						{
							name: "Sentence:",
							value: originalSentence.join(""),
						},
						{
							name: "Words:",
							value: words.join(", "),
						},
					];

					let _field: Fields[] = [];
					fields.map((field) => {
						_field.push({
							name: `${field.name}`,
							value: `${field.value}`,
						});
					});
					__embed.setFields(_field);
				}

				await msg.edit({
					embeds: [__embed],
					components: [],
				});

				data.delete(id);
				if (mes.deletable) mes.delete();

				return game.stop();
			}

			if (mes.deletable) mes.delete();
		} else {
			tries++;
			if (tries === (options.maxTries ? options.maxTries : 10)) {
				const _embed = createEmbed(options.embed)
					.setDescription(
						options.loseMessage
							? options.loseMessage
							: `You failed to find all the words in ${options.maxTries ? options.maxTries.toString() : "10"} tries.`
					)
					.setColor("Red");

				if (!options.embed.fields) {
					fields = [
						{
							name: "Original Sentence:",
							value: originalSentence.join(""),
						},
						{
							name: "Words:",
							value: words.join(", "),
						},
					];

					let _fields: Fields[] = [];
					fields.map((field) => {
						_fields.push({
							name: `${field.name}`,
							value: `${field.value}`,
						});
					});
					_embed.setFields(_fields);
				}

				await msg.edit({
					embeds: [_embed],
					components: [],
				});

				if (mes.deletable) mes.delete();

				data.delete(id);
				return game.stop("Too many Tries");
			}

			let _embed = createEmbed(options.embed).setDescription(
				options.embed.description
					? options.embed.description.replace("{{time}}", convertTime(options.time ? options.time : 60000))
					: `You have **${convertTime(
							options.time ? options.time : 60000
					  )}** to find the correct words in the chaos above.`
			);

			if (!options.embed.fields) {
				fields = [
					{
						name: "Sentence:",
						value: array.join(""),
					},
					{
						name: "Words Found / Remaining:",
						value: `${remaining} / ${words.length}`,
					},
					{
						name: "Words Found:",
						value: `${guessed.join(", ")}`,
					},
					{
						name: "Words:",
						value: words.join(", "),
					},
				];

				let _field: Fields[] = [];
				fields.map((field, index) => {
					if (index < 3) {
						_field.push({
							name: `${field.name}`,
							value: `${field.value}`,
						});
					}
				});
				_embed.setFields(_field);
			}

			btn1 = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(options.buttonText ? options.buttonText : "Cancel")
				.setCustomId(ids);

			const wrongEmbed = createEmbed(options.embed, true).setColor("Red").setDescription(`
                    ${
											options.wrongWord
												? options.wrongWord.replace(
														`{{remaining_tries}}`,
														`${options.maxTries ? options.maxTries : 10 - tries}`
												  )
												: `**${mes.content.toLowerCase()}** is not the correct word. You have **${
														options.maxTries ? options.maxTries : 10 - tries
												  }** tries left.`
										}
                    `);

			msg.edit({
				embeds: [_embed, wrongEmbed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
			});

			if (mes.deletable) mes.delete();
		}
	});

	game.on("end", (mes, reason: string) => {
		if (reason === "time") {
			const _embed = createEmbed(options.embed)
				.setColor("Red")
				.setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`);

			if (!options.embed.fields) {
				fields = [
					{
						name: "Original Sentence:",
						value: originalSentence.join(""),
					},
					{
						name: "Words Found / Remaining:",
						value: `${remaining} / ${words.length}`,
					},
					{
						name: "Words:",
						value: words.join(", "),
					},
					{
						name: "Words Found:",
						value: `${guessed.length > 0 ? guessed.join(", ") : "**No Words Found!**"}`,
					},
				];

				let _fields: Fields[] = [];
				fields.map((field, index) => {
					_fields.push({
						name: `${field.name}`,
						value: `${field.value}`,
					});
				});
				_embed.setFields(_fields);
			}

			btn1 = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(options.buttonText ? options.buttonText : "Cancel")
				.setDisabled()
				.setCustomId(ids);

			msg.edit({
				embeds: [_embed],
				components: [],
			});

			data.delete(id);
		}
	});

	const gameCollector = msg.createMessageComponentCollector({
		componentType: ComponentType.Button,
	});

	gameCollector.on("collect", async (button: ButtonInteraction) => {
		await button.deferUpdate();

		if (options.embed.fields) {
			embed.setFields(options.embed.fields);
		} else {
			fields = [
				{
					name: "Original Sentence:",
					value: originalSentence.join(""),
				},
				{
					name: "Words Found / Remaining:",
					value: `${remaining} / ${words.length}`,
				},
				{
					name: "Words:",
					value: words.join(", "),
				},
				{
					name: "Words Found:",
					value: `${guessed.length > 0 ? guessed.join(", ") : "**No Words found**"}`,
				},
			];

			let _fields: Fields[] = [];
			fields.map((field) => {
				_fields.push({
					name: `${field.name}`,
					value: `${field.value}`,
				});
			});
			embed.setFields(_fields);
		}

		const stoppedEmbed = createEmbed(options.embed, true)
			.setColor("Red")
			.setDescription(options.loseMessage ? options.loseMessage : `The game has been stopped by <@${id}>`);

		await msg.edit({
			embeds: [embed, stoppedEmbed],
			components: [],
		});

		data.delete(id);
		gameCollector.stop();
		return game.stop();
	});
};

export default ChaosWords;
