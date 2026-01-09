import chalk from "chalk";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";

import {
	checkPackageUpdates,
	convertTime,
	createEmbed,
	getRandomString,
	shuffleArray,
} from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";

import type { QuickClickTypes } from "../Types/index.js";

interface GameType {
	[guildId: string]: boolean | string;
}

const currentGames: GameType = {};

const QuickClick = async (options: QuickClickTypes) => {
	OptionsChecking(options, "GuessTheNumber");

	let interaction = options.interaction;

	if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " No interaction provided.");

	if (!interaction.channel || !interaction.channel.isSendable())
		throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Channel is not available in this interaction.");

	if (!interaction.guild) {
		throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Guild is not available in this interaction.");
	}

	if (!interaction.channel || !interaction.channel.isSendable()) {
		throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Channel is not available in this interaction.");
	}

	let id = interaction.user.id;

	if (!options.time) options.time = 60000;
	if (options.time < 10000) {
		throw new Error(
			chalk.red("[@m3rcena/weky] QuickClick Error:") +
				" Time argument must be greater than 10 Seconds (in ms i.e. 10000)."
		);
	}

	if (!options.waitMessage) options.waitMessage = "The buttons may appear anytime now!";
	if (typeof options.waitMessage !== "string") {
		throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " waitMessage must be a string");
	}

	if (!options.startMessage)
		options.startMessage = "First person to press the correct button will win. You have **{{time}}**!";
	if (typeof options.startMessage !== "string") {
		throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " startMessage must be a string");
	}

	if (!options.winMessage) options.winMessage = "GG, <@{{winner}}> pressed the button in **{{time}} seconds**.";
	if (typeof options.winMessage !== "string") {
		throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " winMessage must be a string");
	}

	if (!options.loseMessage) options.loseMessage = "No one pressed the button in time. So, I dropped the game!";
	if (typeof options.loseMessage !== "string") {
		throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " loseMessage must be a string");
	}

	if (!options.emoji) options.emoji = "👆";
	if (typeof options.emoji !== "string") {
		throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " emoji must be a string");
	}

	if (!options.ongoingMessage)
		options.ongoingMessage = "A game is already runnning in <#{{channel}}>. You can't start a new one!";
	if (typeof options.ongoingMessage !== "string") {
		throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " ongoingMessage must be a string");
	}

	if (currentGames[interaction.guild.id]) {
		options.embed.description = options.ongoingMessage
			? options.ongoingMessage.replace("{{channel}}", `${currentGames[`${interaction.guild.id}_channel`]}`)
			: `A game is already runnning in <#${
					currentGames[`${interaction.guild.id}_channel`]
			  }>. You can\'t start a new one!`;
		let embed = createEmbed(options.embed);

		return interaction.reply({ embeds: [embed] });
	}

	options.embed.description = options.waitMessage ? options.waitMessage : "The buttons may appear anytime now!";
	let embed = createEmbed(options.embed);

	const msg = await interaction.reply({ embeds: [embed] });

	currentGames[interaction.guild.id] = true;
	currentGames[`${interaction.guild.id}_channel`] = interaction.channel.id;

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
					.setCustomId(getRandomString(20))
			);
		}

		buttons.push(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji(options.emoji ? options.emoji : "👆")
				.setCustomId("weky_correct")
		);

		shuffleArray(buttons);

		for (let i = 0; i < 5; i++) {
			rows.push(new ActionRowBuilder<ButtonBuilder>());
		}

		rows.forEach((row, i) => {
			row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
		});

		options.embed.description = options.startMessage
			? options.startMessage.replace("{{time}}", convertTime(options.time ? options.time : 60000))
			: `First person to press the correct button will win. You have **${convertTime(
					options.time ? options.time : 60000
			  )}**!`;
		let _embed = createEmbed(options.embed);

		await msg.edit({
			embeds: [_embed],
			components: rows,
		});

		const Collector = msg.createMessageComponentCollector({
			filter: (fn) => fn.message.id === msg.id,
			time: options.time,
		});

		Collector.on("collect", async (button: ButtonInteraction) => {
			if (!interaction.guild) {
				throw new Error(
					chalk.red("[@m3rcena/weky] QuickClick Error:") + " Guild is not available in this interaction."
				);
			}
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
				let __embed = createEmbed(options.embed);

				await msg.edit({
					embeds: [__embed],
					components: rows,
				});
			}
			return delete currentGames[interaction.guild.id];
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
				let __embed = createEmbed(options.embed);

				await msg.edit({
					embeds: [__embed],
					components: rows,
				});

				if (!interaction.guild) {
					return;
				}

				return delete currentGames[interaction.guild.id];
			}
		});
	}, Math.floor(Math.random() * 5000) + 1000);

	checkPackageUpdates("QuickClick", options.notifyUpdate);
};

export default QuickClick;
