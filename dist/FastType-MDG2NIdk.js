'use strict';

var discord_js = require('discord.js');
var _function = require('./function-Bv9fWZf5.js');
var chalk = require('chalk');
require('axios');
require('cheerio');
require('node-fetch');
require('string-width');

const data = new Set();

/**
 * Make a Fast Type game for your bot
 * @param {object} options - Options for the Fast Type game
 * @param {object} options.message - The message object
 * 
 * @param {object} [options.embed] - The embed object
 * @param {string} [options.embed.title] - The title of the embed
 * @param {string} [options.embed.description] - The description of the embed
 * @param {string} [options.embed.field1] - The field1 of the embed
 * @param {string} [options.embed.field2] - The field2 of the embed
 * @param {string} [options.embed.field3] - The field3 of the embed
 * @param {string} [options.embed.field4] - The field4 of the embed
 * @param {string} [options.embed.color] - The color of the embed
 * @param {string} [options.embed.footer] - The footer of the embed
 * @param {boolean} [options.embed.timestamp] - The timestamp of the embed
 * 
 * @param {string} [options.sentence] - The sentence for the game
 * @param {string} [options.winMessage] - The win message
 * @param {string} [options.loseMessage] - The lose message
 * 
 * @param {number} [options.time] - The time for the game
 * 
 * @param {string} [options.buttonText] - The button text
 * 
 * @param {string} [options.othersMessage] - The others message
 * @param {string} [options.cancelMessage] - The cancel message
 * 
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */

var FastType = async (options) => {
	if (!options.message) {
		throw new Error(`${chalk.red('Weky Error:')} message argument was not specified.`);
	}
	if (typeof options.message !== 'object') {
		throw new TypeError(`${chalk.red('Weky Error:')} Invalid Discord Message was provided.`);
	}

	if (!options.embed) options.embed = {};
	if (typeof options.embed !== 'object') {
		throw new TypeError(`${chalk.red('Weky Error:')} embed must be an object.`);
	}

	if (!options.embed.title) {
		options.embed.title = 'Fast Type | Weky Development';
	}
	if (typeof options.embed.title !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} embed title must be a string.`);
	}

	if (!options.embed.description) {
		options.embed.description =
			'You have **{{time}}** to type the below sentence.';
	}
	if (typeof options.embed.description !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} embed description must be a string.`);
	}


	if (!options.embed.footer) {
		options.embed.footer = '©️ Weky Development';
	}
	if (typeof options.embed.footer !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} footer must be a string.`);
	}

	if (!options.embed.timestamp) options.embed.timestamp = true;
	if (typeof options.embed.timestamp !== 'boolean') {
		throw new TypeError(`${chalk.red('Weky Error:')} timestamp must be a boolean.`);
	}

	if (!options.sentence) {
		options.sentence = _function.getRandomSentence(Math.floor(Math.random() * 10) + 3).toString().split(',').join(' ');
	}
	if (typeof options.sentence !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} sentence must be a string`);
	}

	if (!options.winMessage) {
		options.winMessage =
			'GG, you have a wpm of **{{wpm}}** and You made it in **{{time}}**.';
	}
	if (typeof options.winMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} winMessage must be a string.`);
	}

	if (!options.loseMessage) options.loseMessage = 'Better luck next time!';
	if (typeof options.loseMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} loseMessage must be a string.`);
	}

	if (!options.time) options.time = 60000;
	if (parseInt(options.time) < 10000) {
		throw new TypeError(`${chalk.red('Weky Error:')} time must be greater than 10000.`);
	}
	if (typeof options.time !== 'number') {
		throw new TypeError(`${chalk.red('Weky Error:')} time must be a number.`);
	}

	if (!options.buttonText) options.buttonText = 'Cancel';
	if (typeof options.buttonText !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} buttonText must be a string.`);
	}

	if (!options.othersMessage) {
		options.othersMessage = 'Only <@{{author}}> can use the buttons!';
	}
	if (typeof options.othersMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} othersMessage must be a string.`);
	}

	if (!options.cancelMessage) options.cancelMessage = 'You ended the game!';
	if (typeof options.cancelMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} cancelMessage must be a string.`);
	}

	if (data.has(options.message.author.id)) return;
	data.add(options.message.author.id);

	const id =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	const sentence = options.sentence
		.toLowerCase()
		.split(' ')
		.map((msg) => `\`${msg.split('').join(' ')}\``)
		.join(' ');
	const gameCreatedAt = Date.now();
	let btn1 = new discord_js.ButtonBuilder()
		.setStyle(discord_js.ButtonStyle.Danger)
		.setLabel(options.buttonText)
		.setCustomId(id);
	const embed = new discord_js.EmbedBuilder()
		.setTitle(options.embed.title)
		.setDescription(
			`${options.embed.description.replace(
				'{{time}}',
				_function.convertTime(options.time),
			)}`,
		)
		.addFields({ name: 'Sentence:', value: `${sentence}` })
		.setAuthor({ name: options.message.author.username })
		.setFooter({ text: options.embed.footer });
	if (options.embed.timestamp) {
		embed.setTimestamp();
	}
	const think = await options.message.reply({
		embeds: [embed],
		components: [{ type: 1, components: [btn1] }],
	});

	const collector = await options.message.channel.createMessageCollector({
		filter: (m) => !m.author.bot && m.author.id === options.message.author.id,
		time: options.time,
	});

	collector.on('collect', async (msg) => {
		if (msg.content.toLowerCase().trim() === options.sentence.toLowerCase()) {
			const time = Date.now() - gameCreatedAt;
			const minute = (time / 1000 / 60) % 60;
			const wpm = msg.content.toLowerCase().trim().length / 5 / minute;
			const _embed = new discord_js.EmbedBuilder()
				.setDescription(
					options.winMessage
						.replace('{{time}}', _function.convertTime(time))
						.replace('{{wpm}}', wpm.toFixed(2)),
				)
				.setAuthor({ name: options.message.author.username })
				.setFooter({ text: options.embed.footer });
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			options.message.reply({ embeds: [_embed] });
			btn1 = new discord_js.ButtonBuilder()
				.setStyle(discord_js.ButtonStyle.Danger)
				.setLabel(options.buttonText)
				.setDisabled()
				.setCustomId(id);
			await think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1] }],
			});
			collector.stop(msg.author.username);
			data.delete(options.message.author.id);
		} else {
			const _embed = new discord_js.EmbedBuilder()
				.setDescription(`${options.loseMessage}`)
				.setFooter({ text: options.embed.footer })
				.setAuthor({ name: options.message.author.username })
				.setFooter({ text: options.embed.footer });
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			options.message.reply({ embeds: [_embed] });
			collector.stop(msg.author.username);
			data.delete(options.message.author.id);
			btn1 = new discord_js.ButtonBuilder()
				.setStyle(discord_js.ButtonStyle.Danger)
				.setLabel(options.buttonText)
				.setDisabled()
				.setCustomId(id);
			await think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1] }],
			});
		}
	});

	collector.on('end', async (_collected, reason) => {
		if (reason === 'time') {
			const _embed = new discord_js.EmbedBuilder()
				.setDescription(`${options.loseMessage}`)
				.setAuthor({ name: options.message.author.username })
				.setFooter({ text: options.embed.footer });
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			options.message.reply({ embeds: [_embed] });
			btn1 = new discord_js.ButtonBuilder()
				.setStyle(discord_js.ButtonStyle.Danger)
				.setLabel(options.buttonText)
				.setDisabled()
				.setCustomId(id);
			await think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1] }],
			});
			data.delete(options.message.author.id);
		}
	});

	const gameCollector = think.createMessageComponentCollector((fn) => fn);

	gameCollector.on('collect', (button) => {
		if (button.user.id !== options.message.author.id) {
			return button.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}
		btn1 = new discord_js.ButtonBuilder()
			.setStyle(discord_js.ButtonStyle.Danger)
			.setLabel(options.buttonText)
			.setDisabled()
			.setCustomId(id);
		think.edit({
			embeds: [embed],
			components: [{ type: 1, components: [btn1] }],
		});
		button.reply({
			content: options.cancelMessage,
			ephemeral: true,
		});
		gameCollector.stop();
		data.delete(options.message.author.id);
		return collector.stop();
	});
};

exports.default = FastType;
