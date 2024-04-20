import { ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder } from 'discord.js';
const currentGames = new Object();
import { getRandomString, convertTime, shuffleArray } from '../../functions/function.mjs';

/**
 * Quick Click game for your bot!
 * @param {object} options - Options for the Quick Click game.
 * @param {object} options.message - The message object.
 * 
 * @param {object} [options.embed] - Embed options.
 * @param {string} [options.embed.title] - The title of the embed.
 * @param {string} [options.embed.footer] - The footer of the embed.
 * @param {boolean} [options.embed.timestamp] - Whether to show the timestamp on the embed.
 * 
 * @param {number} [options.time] - The time for the game.
 * @param {string} [options.waitMessage] - The message to show while the bot is waiting for the game to start.
 * @param {string} [options.startMessage] - The message to show when the game starts.
 * @param {string} [options.winMessage] - The message to show when the user wins.
 * @param {string} [options.loseMessage] - The message to show when the user loses.
 * @param {string} [options.ongoingMessage] - The message to show when the game is already running.
 * 
 * @param {string} [options.emoji] - The emoji for the button.
 * 
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */

export default async (options) => {
	if (!options.message) {
		throw new Error('Weky Error: message argument was not specified.');
	}
	if (typeof options.message !== 'object') {
		throw new TypeError('Weky Error: Invalid Discord Message was provided.');
	}

	if (!options.embed) options.embed = {};
	if (typeof options.embed !== 'object') {
		throw new TypeError('Weky Error: embed must be an object.');
	}

	if (!options.embed.title) {
		options.embed.title = 'Quick Click | Weky Development';
	}
	if (typeof options.embed.title !== 'string') {
		throw new TypeError('Weky Error: embed title must be a string.');
	}



	if (!options.embed.footer) {
		options.embed.footer = '©️ Weky Development';
	}
	if (typeof options.embed.footer !== 'string') {
		throw new TypeError('Weky Error: embed footer must be a string.');
	}

	if (!options.embed.timestamp) options.embed.timestamp = true;
	if (typeof options.embed.timestamp !== 'boolean') {
		throw new TypeError('Weky Error: timestamp must be a boolean.');
	}

	if (!options.time) options.time = 60000;
	if (parseInt(options.time) < 10000) {
		throw new Error(
			'Weky Error: time argument must be greater than 10 Seconds (in ms i.e. 10000).',
		);
	}
	if (typeof options.time !== 'number') {
		throw new TypeError('Weky Error: time must be a number.');
	}

	if (!options.waitMessage) {
		options.waitMessage = 'The buttons may appear anytime now!';
	}
	if (typeof options.waitMessage !== 'string') {
		throw new TypeError('Weky Error: waitMessage must be a string.');
	}

	if (!options.startMessage) {
		options.startMessage =
			'First person to press the correct button will win. You have **{{time}}**!';
	}
	if (typeof options.startMessage !== 'string') {
		throw new TypeError('Weky Error: startMessage must be a string.');
	}

	if (!options.winMessage) {
		options.winMessage =
			'GG, <@{{winner}}> pressed the button in **{{time}} seconds**.';
	}
	if (typeof options.winMessage !== 'string') {
		throw new TypeError('Weky Error: startMessage must be a string.');
	}

	if (!options.loseMessage) {
		options.loseMessage =
			'No one pressed the button in time. So, I dropped the game!';
	}
	if (typeof options.loseMessage !== 'string') {
		throw new TypeError('Weky Error: startMessage must be a string.');
	}

	if (!options.emoji) options.emoji = '👆';
	if (typeof options.emoji !== 'string') {
		throw new TypeError('Weky Error: emoji must be a string.');
	}

	if (!options.ongoingMessage) {
		options.ongoingMessage =
			'A game is already runnning in <#{{channel}}>. You can\'t start a new one!';
	}
	if (typeof options.ongoingMessage !== 'string') {
		throw new TypeError('Weky Error: ongoingMessage must be a string.');
	}

	if (currentGames[options.message.guild.id]) {
		const embed = new EmbedBuilder()
			.setTitle(options.embed.title)
			.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
			.setFooter({ text: options.embed.footer })
			.setDescription(
				options.ongoingMessage.replace(
					'{{channel}}',
					currentGames[`${options.message.guild.id}_channel`],
				),
			);
		if (options.embed.timestamp) {
			embed.setTimestamp();
		}
		return options.message.reply({ embeds: [embed] });
	}

	const embed = new EmbedBuilder()
		.setTitle(options.embed.title)
		.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
		.setFooter({ text: options.embed.footer })
		.setDescription(options.waitMessage);
	if (options.embed.timestamp) {
		embed.setTimestamp();
	}

	const msg = await options.message.reply({ embeds: [embed] });

	currentGames[options.message.guild.id] = true;
	currentGames[`${options.message.guild.id}_channel`] =
		options.message.channel.id;

	setTimeout(async function () {
		const rows = [];
		const buttons = [];
		const gameCreatedAt = Date.now();

		for (let i = 0; i < 24; i++) {
			buttons.push(
				new ButtonBuilder()
					.setDisabled()
					.setLabel('\u200b')
					.setStyle(ButtonStyle.Primary)
					.setCustomId(getRandomString(20)),
			);
		}

		buttons.push(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji(options.emoji)
				.setCustomId('CORRECT'),
		);

		shuffleArray(buttons);

		for (let i = 0; i < 5; i++) {
			rows.push(new ActionRowBuilder());
		}

		rows.forEach((row, i) => {
			row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
		});

		const _embed = new EmbedBuilder()
			.setTitle(options.embed.title)
			.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
			.setFooter({ text: options.embed.footer })
			.setDescription(
				options.startMessage.replace(
					'{{time}}',
					convertTime(options.time),
				),
			);
		if (options.embed.timestamp) {
			_embed.setTimestamp();
		}
		await msg.edit({
			embeds: [_embed],
			components: rows,
		});

		const Collector = msg.createMessageComponentCollector({
			filter: (fn) => fn,
			time: options.time,
		});

		Collector.on('collect', async (button) => {
			if (button.customId === 'CORRECT') {
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
				const __embed = new EmbedBuilder()
					.setTitle(options.embed.title)
					.setDescription(
						options.winMessage
							.replace('{{winner}}', button.user.id)
							.replace('{{time}}', (Date.now() - gameCreatedAt) / 1000),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer })
				if (options.embed.timestamp) {
					__embed.setTimestamp();
				}
				await msg.edit({
					embeds: [__embed],
					components: rows,
				});
			}
			return delete currentGames[options.message.guild.id];
		});

		Collector.on('end', async (_msg, reason) => {
			if (reason === 'time') {
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
				const __embed = new EmbedBuilder()
					.setTitle(options.embed.title)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer })
					.setDescription(options.loseMessage);
				if (options.embed.timestamp) {
					__embed.setTimestamp();
				}
				await msg.edit({
					embeds: [__embed],
					components: rows,
				});
				return delete currentGames[options.message.guild.id];
			}
		});
	}, Math.floor(Math.random() * 5000) + 1000);
};