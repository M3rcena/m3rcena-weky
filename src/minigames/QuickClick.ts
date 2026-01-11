import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";

import type { CustomOptions, QuickClickTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";

interface GameType {
	[guildId: string]: boolean | string;
}

const currentGames: GameType = {};

// TODO: REMAKE THE GAME USING COMPONENTS V2
const QuickClick = async (weky: WekyManager, options: CustomOptions<QuickClickTypes>) => {
	let context = options.context;

	if (!options.time) options.time = 60000;
	if (options.time < 10000) {
		return weky._LoggerManager.createError(
			"QuickClick",
			"Time argument must be greater than 10 Seconds (in ms i.e. 10000)."
		);
	}

	if (!options.waitMessage) options.waitMessage = "The buttons may appear anytime now!";
	if (typeof options.waitMessage !== "string") {
		return weky._LoggerManager.createTypeError("QuickClick", "waitMessage must be a string");
	}

	if (!options.startMessage)
		options.startMessage = "First person to press the correct button will win. You have **{{time}}**!";
	if (typeof options.startMessage !== "string") {
		return weky._LoggerManager.createTypeError("QuickClick", "startMessage must be a string");
	}

	if (!options.winMessage) options.winMessage = "GG, <@{{winner}}> pressed the button in **{{time}} seconds**.";
	if (typeof options.winMessage !== "string") {
		return weky._LoggerManager.createTypeError("QuickClick", "winMessage must be a string");
	}

	if (!options.loseMessage) options.loseMessage = "No one pressed the button in time. So, I dropped the game!";
	if (typeof options.loseMessage !== "string") {
		return weky._LoggerManager.createTypeError("QuickClick", "loseMessage must be a string");
	}

	if (!options.emoji) options.emoji = "👆";
	if (typeof options.emoji !== "string") {
		return weky._LoggerManager.createTypeError("QuickClick", "emoji must be a string");
	}

	if (!options.ongoingMessage)
		options.ongoingMessage = "A game is already runnning in <#{{channel}}>. You can't start a new one!";
	if (typeof options.ongoingMessage !== "string") {
		return weky._LoggerManager.createTypeError("QuickClick", "ongoingMessage must be a string");
	}

	if (currentGames[context.guild.id]) {
		options.embed.description = options.ongoingMessage
			? options.ongoingMessage.replace("{{channel}}", `${currentGames[`${context.guild.id}_channel`]}`)
			: `A game is already runnning in <#${currentGames[`${context.guild.id}_channel`]}>. You can\'t start a new one!`;
		let embed = weky._createEmbed(options.embed);

		return context.channel.send({ embeds: [embed] });
	}

	options.embed.description = options.waitMessage ? options.waitMessage : "The buttons may appear anytime now!";
	let embed = weky._createEmbed(options.embed);

	const msg = await context.channel.send({ embeds: [embed] });

	currentGames[context.guild.id] = true;
	currentGames[`${context.guild.id}_channel`] = context.channel.id;

	setTimeout(async function () {
		const rows: ActionRowBuilder<ButtonBuilder>[] = [];
		const buttons: ButtonBuilder[] = [];
		const gameCreatedAt = Date.now();

		for (let i = 0; i < 24; i++) {
			buttons.push(
				new ButtonBuilder()
					.setDisabled()
					.setLabel("\u200b")
					.setStyle(ButtonStyle.Primary)
					.setCustomId(weky.getRandomString(20))
			);
		}

		buttons.push(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji(options.emoji ? options.emoji : "👆")
				.setCustomId("weky_correct")
		);

		weky.shuffleArray(buttons);

		for (let i = 0; i < 5; i++) {
			rows.push(new ActionRowBuilder<ButtonBuilder>());
		}

		rows.forEach((row, i) => {
			row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
		});

		options.embed.description = options.startMessage
			? options.startMessage.replace("{{time}}", weky.convertTime(options.time ? options.time : 60000))
			: `First person to press the correct button will win. You have **${weky.convertTime(
					options.time ? options.time : 60000
			  )}**!`;
		let _embed = weky._createEmbed(options.embed);

		await msg.edit({
			embeds: [_embed],
			components: rows,
		});

		const Collector = msg.createMessageComponentCollector({
			filter: (fn) => fn.message.id === msg.id,
			time: options.time,
		});

		Collector.on("collect", async (button: ButtonInteraction) => {
			if (button.customId === "weky_correct") {
				await button.deferUpdate();
				Collector.stop();
				buttons.forEach((element) => {
					element.setDisabled();
				});
				rows.length = 0;
				for (let i = 0; i < 5; i++) {
					rows.push(new ActionRowBuilder());
				}

				rows.forEach((row, i) => {
					row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
				});

				options.embed.description = options.winMessage
					? options.winMessage
							.replace("{{winner}}", button.user.id)
							.replace("{{time}}", `${(Date.now() - gameCreatedAt) / 1000}`)
					: `GG, <@${button.user.id}> pressed the button in **${(Date.now() - gameCreatedAt) / 1000} seconds**.`;
				let __embed = weky._createEmbed(options.embed);

				await msg.edit({
					embeds: [__embed],
					components: rows,
				});
			}
			return delete currentGames[context.guild.id];
		});

		Collector.on("end", async (_msg, reason) => {
			if (reason === "time") {
				buttons.forEach((element) => {
					element.setDisabled();
				});

				rows.length = 0;
				for (let i = 0; i < 5; i++) {
					rows.push(new ActionRowBuilder());
				}

				rows.forEach((row, i) => {
					row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
				});

				options.embed.description = options.loseMessage
					? options.loseMessage
					: "No one pressed the button in time. So, I dropped the game!";
				let __embed = weky._createEmbed(options.embed);

				await msg.edit({
					embeds: [__embed],
					components: rows,
				});

				return delete currentGames[context.guild.id];
			}
		});
	}, Math.floor(Math.random() * 5000) + 1000);
};

export default QuickClick;
