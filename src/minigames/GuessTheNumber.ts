import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from "discord.js";

import { convertTime, createEmbed, getRandomString } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
import { deferContext, getContextUserID } from "../functions/context.js";

import type { GuessTheNumberTypes } from "../Types/index.js";
import type { LoggerManager } from "../handlers/Logger.js";

const data = new Set();
const currentGames: any = new Object();

const GuessTheNumber = async (options: GuessTheNumberTypes, loggerManager: LoggerManager) => {
	OptionsChecking(options, "GuessTheNumber", loggerManager);

	let context = options.context;

	let id = getContextUserID(context);

	deferContext(context);

	if (!context.guild) {
		return loggerManager.createError("GuessTheNumber", "Context must be in Guild");
	}

	if (!context.channel || !context.channel.isSendable() || context.channel.isDMBased()) {
		return loggerManager.createError(
			"GuessTheNumber",
			"Channel is not available in this context or cannot send message."
		);
	}

	if (!options.ongoingMessage) {
		options.ongoingMessage = "A game is already running in <#{{channel}}>. Try again later!";
	}
	if (typeof options.ongoingMessage !== "string") {
		return loggerManager.createTypeError("GuessTheNumber", "ongoingMessage must be a string.");
	}

	if (!options.winMessage) options.winMessage = {};
	let winMessage = options.winMessage;
	if (typeof winMessage !== "object") {
		return loggerManager.createTypeError("GuessTheNumber", "winMessage must be an object.");
	}

	let winMessagePublicGame: string;
	if (!options.winMessage.publicGame) {
		winMessagePublicGame =
			"GG, The number was **{{number}}**. <@{{winner}}> made it in **{{time}}**.\n\n__**Stats of the game:**__\n**Duration**: {{time}}\n**Number of participants**: {{totalparticipants}} Participants\n**Participants**: {{participants}}";
	} else {
		winMessagePublicGame = options.winMessage.publicGame;
	}
	if (typeof winMessagePublicGame !== "string") {
		return loggerManager.createTypeError("GuessTheNumber", "winMessage.publicGame must be a string.");
	}

	let winMessagePrivateGame: string;
	if (!options.winMessage.privateGame) {
		winMessagePrivateGame = "GG, The number which I guessed was **{{number}}**. You made it in **{{time}}**.";
	} else {
		winMessagePrivateGame = options.winMessage.privateGame;
	}
	if (typeof winMessagePrivateGame !== "string") {
		return loggerManager.createTypeError("GuessTheNumber", "winMessage.privateGame must be a string.");
	}

	const ids = getRandomString(20) + "-" + getRandomString(20);

	let number: number;
	if (!options.number) {
		number = Math.floor(Math.random() * 1000);
	} else {
		number = options.number;
	}

	let min: number = -1;
	let max: number = number * (Math.floor(Math.random() * 100) + 1) * 13;

	if (typeof number !== "number") {
		return loggerManager.createTypeError("GuessTheNumber", "Number must be a number.");
	}

	const handleGame = async (isPublic: boolean) => {
		const participants: string[] = [];

		if (isPublic && currentGames[context.guild.id]) {
			options.embed.description = options.ongoingMessage.replace(
				/{{channel}}/g,
				currentGames[`${context.guild.id}_channel`]
			);

			if (context.channel.isDMBased()) return;

			return await context.channel.send({
				embeds: [createEmbed(options.embed)],
			});
		}

		if (!isPublic && data.has(id)) return;
		if (!isPublic) data.add(id);

		options.embed.description = options.embed.description
			? options.embed.description.replace(/{{time}}/g, convertTime(options.time ? options.time : 60000))
			: "You have **{{time}}** to guess the number.".replace(
					/{{time}}/g,
					convertTime(options.time ? options.time : 60000)
			  );

		const embed = createEmbed(options.embed);
		const btn1 = new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel(options.button ? options.button : "Cancel")
			.setCustomId(ids);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btn1);

		if (context.channel.isDMBased()) return;

		const msg = await context.channel.send({
			embeds: [embed],
			components: [row],
		});

		const gameCreatedAt = Date.now();

		const collector = context.channel?.createMessageCollector({
			filter: (m) => (isPublic ? !m.author.bot : m.author.id === id),
			time: options.time ? options.time : 60000,
		});

		const gameCollector = msg.createMessageComponentCollector({
			componentType: ComponentType.Button,
		});

		if (isPublic) {
			currentGames[context.guild.id] = true;
			currentGames[`${context.guild.id}_channel`] = context.channel.id;
		}

		collector.on("collect", async (_msg) => {
			if (isPublic && !participants.includes(_msg.author.id)) {
				participants.push(_msg.author.id);
			}

			const parsedNumber = parseInt(_msg.content, 10);

			await _msg.delete();

			if (parsedNumber === number) {
				const time = convertTime(Date.now() - gameCreatedAt);
				options.embed.description = isPublic
					? winMessagePublicGame
							.replace(/{{number}}/g, number.toString())
							.replace(/{{winner}}/g, _msg.author.id)
							.replace(/{{time}}/g, time)
							.replace(/{{totalparticipants}}/g, `${participants.length}`)
							.replace(/{{participants}}/g, participants.map((p) => "<@" + p + ">").join(", "))
					: winMessagePrivateGame.replace(/{{time}}/g, time).replace(/{{number}}/g, `${number}`);

				let _embed = createEmbed(options.embed);

				await msg.edit({
					embeds: [_embed],
					components: [],
				});

				gameCollector.stop();
				collector.stop();
			}

			const compareResponse = (comparison: "bigger" | "smaller", guessed: number) => {
				options.embed.description = options[comparison === "bigger" ? "bigNumber" : "smallNumber"]
					? options[comparison === "bigger" ? "bigNumber" : "smallNumber"]
							.replace(/{{author}}/g, _msg.author.toString())
							.replace(/{{number}}/g, `${parsedNumber}`)
					: `The number is ${comparison} than **${parsedNumber}**!`;

				if (comparison === "bigger" && guessed > min) {
					min = guessed;
				} else if (comparison === "smaller" && guessed < max) {
					max = guessed;
				}

				return msg.edit({
					embeds: [
						embed.setTimestamp(),
						createEmbed(options.embed)
							.setFields([
								{
									name: "Number is above:",
									value: `\`${min}\``,
									inline: true,
								},
								{
									name: "Number is below:",
									value: `\`${max}\``,
									inline: true,
								},
							])
							.setColor(comparison === "bigger" ? "Green" : "Red"),
					],
					components: [row],
				});
			};

			if (parsedNumber < number) compareResponse("bigger", parsedNumber);
			if (parsedNumber > number) compareResponse("smaller", parsedNumber);
		});

		gameCollector.on("collect", async (button) => {
			if (button.user.id !== id) {
				return button.reply({
					content: options.otherMessage ? options.otherMessage.replace(/{{author}}/g, id) : "This is not your game!",
					flags: [MessageFlags.Ephemeral],
				});
			}

			await button.deferUpdate();

			if (button.customId === ids) {
				btn1.setDisabled(true);
				gameCollector.stop();
				collector.stop();
				embed.setTimestamp(options.embed.timestamp ? new Date() : null);
				msg.edit({
					embeds: [embed],
					components: [{ type: 1, components: [btn1] }],
				});

				options.embed.description = options.loseMessage
					? options.loseMessage.replace(/{{number/g, `${number}`)
					: `The number was **${number}**!`;
				let _embed = createEmbed(options.embed);

				msg.edit({ embeds: [_embed] });
			}
		});

		collector.on("end", async (_collected, reason) => {
			if (reason === "time") {
				options.embed.description = options.loseMessage
					? options.loseMessage.replace(/{{number}}/g, `${number}`)
					: `The number was **${number}**!`;
				let _embed = createEmbed(options.embed);

				await msg.edit({
					embeds: [_embed],
				});
			}
			data.delete(id);
			currentGames[context.guild.id] = false;
		});
	};

	await handleGame(options.publicGame ?? false);
};

export default GuessTheNumber;
