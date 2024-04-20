'use strict';

var discord_js = require('discord.js');
var db = require('quick.db');
var _function = require('./function-Bv9fWZf5.js');
var chalk = require('chalk');
require('axios');
require('cheerio');
require('node-fetch');
require('string-width');

const data = new Set();
const currentGames = new Object();

/**
 * Make a guess the number game for your bot
 * @param {object} options - Options for the guess the number game
 * @param {object} options.message - The message object
 * 
 * @param {object} [options.embed] - The embed object
 * @param {string} [options.embed.title] - The title of the embed
 * @param {string} [options.embed.description] - The description of the embed
 * @param {string} [options.embed.footer] - The footer of the embed
 * @param {boolean} [options.embed.timestamp] - The timestamp of the embed
 * 
 * @param {boolean} [options.publicGame] - If the game is public or not
 * @param {number} [options.number] - The number to guess
 * @param {number} [options.time] - The time for the game
 * 
 * @param {object} [options.winMessage] - The win message
 * @param {string} [options.winMessage.publicGame] - The win message for public game
 * @param {string} [options.winMessage.privateGame] - The win message for private game
 * 
 * @param {string} [options.loseMessage] - The lose message
 * 
 * @param {string} [options.bigNumberMessage] - The big number message
 * @param {string} [options.smallNumberMessage] - The small number message
 * 
 * @param {string} [options.othersMessage] - The others message
 * @param {string} [options.buttonText] - The button text
 * 
 * @param {boolean} [options.returnWinner] - If the game should return the winner
 * @param {string} [options.gameID] - The game ID
 * 
 * @param {string} [options.ongoingMessage] - The ongoing message
 * 
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */

var GuessTheNumber = async (options) => {
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
		options.embed.title = 'Guess The Number | Weky Development';
	}
	if (typeof options.embed.title !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} embed title must be a string.`);
	}

	if (!options.embed.description) {
		options.embed.description = 'You have **{{time}}** to guess the number.';
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

	if (!options.publicGame) options.publicGame = false;
	if (typeof options.publicGame !== 'boolean') {
		throw new TypeError(`${chalk.red('Weky Error:')} publicGame must be a boolean.`);
	}

	if (!options.number) options.number = Math.floor(Math.random() * 1000);
	if (typeof options.number !== 'number') {
		throw new TypeError(`${chalk.red('Weky Error:')} number must be a number.`);
	}

	if (!options.time) options.time = 60000;
	if (parseInt(options.time) < 10000) {
		throw new Error(
			`${chalk.red('Weky Error:')} time argument must be greater than 10 Seconds (in ms i.e. 10000).`,
		);
	}
	if (typeof options.time !== 'number') {
		throw new TypeError(`${chalk.red('Weky Error:')} time must be a number.`);
	}

	if (!options.winMessage) options.winMessage = {};
	if (typeof options.winMessage !== 'object') {
		throw new TypeError(`${chalk.red('Weky Error:')} winMessage must be an object.`);
	}

	if (!options.winMessage.publicGame) {
		options.winMessage.publicGame =
			'GG, The number which I guessed was **{{number}}**. <@{{winner}}> made it in **{{time}}**.\n\n__**Stats of the game:**__\n**Duration**: {{time}}\n**Number of participants**: {{totalparticipants}} Participants\n**Participants**: {{participants}}';
	}
	if (typeof options.winMessage.publicGame !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} winMessage must be a string.`);
	}

	if (!options.winMessage.privateGame) {
		options.winMessage.privateGame =
			'GG, The number which I guessed was **{{number}}**. You made it in **{{time}}**.';
	}
	if (typeof options.winMessage.privateGame !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} winMessage must be a string.`);
	}

	if (!options.loseMessage) {
		options.loseMessage =
			'Better luck next time! The number which I guessed was **{{number}}**.';
	}
	if (typeof options.loseMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} loseMessage must be a string.`);
	}

	if (!options.bigNumberMessage) {
		options.bigNumberMessage =
			'No {{author}}! My number is greater than **{{number}}**.';
	}
	if (typeof options.bigNumberMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} bigNumberMessage must be a string.`);
	}

	if (!options.smallNumberMessage) {
		options.smallNumberMessage =
			'No {{author}}! My number is smaller than **{{number}}**.';
	}
	if (typeof options.smallNumberMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} smallNumberMessage must be a string.`);
	}

	if (!options.othersMessage) {
		options.othersMessage = 'Only <@{{author}}> can use the buttons!';
	}
	if (typeof options.othersMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} othersMessage must be a string.`);
	}

	if (!options.buttonText) options.buttonText = 'Cancel';
	if (typeof options.buttonText !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} buttonText must be a string.`);
	}

	const id =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	if (options.publicGame) {
		if (!options.ongoingMessage) {
			options.ongoingMessage =
				'A game is already runnning in <#{{channel}}>. You can\'t start a new one!';
		}
		if (typeof options.ongoingMessage !== 'string') {
			throw new TypeError(`${chalk.red('Weky Error:')} ongoingMessage must be a string.`);
		}

		if (!options.returnWinner) options.returnWinner = false;
		if (typeof options.returnWinner !== 'boolean') {
			throw new TypeError(`${chalk.red('Weky Error:')} buttonText must be a boolean.`);
		}
		const participants = [];
		if (currentGames[options.message.guild.id]) {
			const embed = new discord_js.EmbedBuilder()
				.setDescription(
					options.ongoingMessage.replace(
						/{{channel}}/g,
						currentGames[`${options.message.guild.id}_channel`],
					),
				)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer });
			if (options.embed.timestamp) {
				embed.setTimestamp();
			}
			return options.message.reply({ embeds: [embed] });
		}
		const embed = new discord_js.EmbedBuilder()
			.setDescription(
				`${options.embed.description.replace(
					/{{time}}/g,
					_function.convertTime(options.time),
				)}`,
			)
			.setTitle(options.embed.title)
			.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
			.setFooter({ text: options.embed.footer });
		if (options.embed.timestamp) {
			embed.setTimestamp();
		}
		let btn1 = new discord_js.ButtonBuilder()
			.setStyle(discord_js.ButtonStyle.Danger)
			.setLabel(options.buttonText)
			.setCustomId(id);
		const msg = await options.message.reply({
			embeds: [embed],
			components: [{ type: 1, components: [btn1] }],
		});
		const gameCreatedAt = Date.now();
		const collector = await options.message.channel.createMessageCollector({
			filter: (fn) => !fn.author.bot,
			time: options.time,
		});

		const gameCollector = msg.createMessageComponentCollector({
			filter: (fn) => fn,
		});

		currentGames[options.message.guild.id] = true;
		currentGames[`${options.message.guild.id}_channel`] =
			options.message.channel.id;

		collector.on('collect', async (_msg) => {
			if (!participants.includes(_msg.author.id)) {
				participants.push(_msg.author.id);
			}
			if (isNaN(_msg.content)) {
				return;
			}
			const parsedNumber = parseInt(_msg.content, 10);
			if (parsedNumber === options.number) {
				const time = _function.convertTime(Date.now() - gameCreatedAt);
				const _embed = new discord_js.EmbedBuilder()
					.setDescription(
						`${options.winMessage.publicGame
							.replace(/{{number}}/g, options.number)
							.replace(/{{winner}}/g, _msg.author.id)
							.replace(/{{time}}/g, time)
							.replace(/{{totalparticipants}}/g, participants.length)
							.replace(
								/{{participants}}/g,
								participants.map((p) => '<@' + p + '>').join(', '),
							)}`,
					)
					.setTitle(options.embed.title)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				if (options.embed.timestamp) {
					_embed.setTimestamp();
				}
				btn1 = new discord_js.ButtonBuilder()
					.setStyle(discord_js.ButtonStyle.Danger)
					.setLabel(options.buttonText)
					.setDisabled()
					.setCustomId(id);
				await msg.edit({
					embeds: [embed],
					components: [{ type: 1, components: [btn1] }],
				});
				_msg.reply({ embeds: [_embed] });
				gameCollector.stop();
				collector.stop();
				if (options.returnWinner) {
					if (!options.gameID) {
						throw new Error(`${chalk.red('Weky Error:')} gameID argument was not specified.`);
					}
					if (typeof options.gameID !== 'string') {
						throw new TypeError(`${chalk.red('Weky Error:')} gameID must be a string.`);
					}
					db.set(
						`GuessTheNumber_${options.message.guild.id}_${options.gameID}`,
						_msg.author.id,
					);
				}
			}
			if (parseInt(_msg.content) < options.number) {
				const _embed = new discord_js.EmbedBuilder()
					.setDescription(
						options.bigNumberMessage
							.replace(/{{author}}/g, _msg.author.toString())
							.replace(/{{number}}/g, parsedNumber),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				_msg.reply({ embeds: [_embed] });
			}
			if (parseInt(_msg.content) > options.number) {
				const _embed = new discord_js.EmbedBuilder()
					.setDescription(
						options.smallNumberMessage
							.replace(/{{author}}/g, _msg.author.toString())
							.replace(/{{number}}/g, parsedNumber),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				_msg.reply({ embeds: [_embed] });
			}
		});

		gameCollector.on('collect', async (button) => {
			if (button.user.id !== options.message.author.id) {
				return button.reply({
					content: options.othersMessage.replace(
						/{{author}}/g,
						options.message.member.id,
					),
					ephemeral: true,
				});
			}

			await button.deferUpdate();

			if (button.customId === id) {
				btn1 = new discord_js.ButtonBuilder()
					.setStyle(discord_js.ButtonStyle.Danger)
					.setLabel(options.buttonText)
					.setDisabled()
					.setCustomId(id);
				gameCollector.stop();
				collector.stop();
				msg.edit({
					embeds: [embed],
					components: [{ type: 1, components: [btn1] }],
				});
				const _embed = new discord_js.EmbedBuilder()
					.setTitle(options.embed.title)
					.setDescription(
						options.loseMessage.replace(/{{number}}/g, options.number),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				if (options.embed.timestamp) {
					_embed.setTimestamp();
				}
				options.message.inlineReply({
					embeds: [_embed],
				});
			}
		});
		collector.on('end', async (_collected, reason) => {
			delete currentGames[options.message.guild.id];
			if (reason === 'time') {
				const _embed = new discord_js.EmbedBuilder()
					.setTitle(options.embed.title)
					.setDescription(
						options.loseMessage.replace(/{{number}}/g, options.number),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				if (options.embed.timestamp) {
					_embed.setTimestamp();
				}
				btn1 = new discord_js.ButtonBuilder()
					.setStyle(discord_js.ButtonStyle.Danger)
					.setLabel(options.buttonText)
					.setDisabled()
					.setCustomId(id);
				await msg.edit({
					embeds: [embed],
					components: [{ type: 1, components: [btn1] }],
				});
				return options.message.reply({ embeds: [_embed] });
			}
		});
	} else {
		if (data.has(options.message.author.id)) return;
		data.add(options.message.author.id);

		const embed = new discord_js.EmbedBuilder()
			.setDescription(
				`${options.embed.description.replace(
					/{{time}}/g,
					_function.convertTime(options.time),
				)}`,
			)
			.setTitle(options.embed.title)
			.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
			.setFooter({ text: options.embed.footer });
		if (options.embed.timestamp) {
			embed.setTimestamp();
		}
		let btn1 = new discord_js.ButtonBuilder()
			.setStyle(discord_js.ButtonStyle.Danger)
			.setLabel(options.buttonText)
			.setCustomId(id);
		const msg = await options.message.reply({
			embeds: [embed],
			components: [{ type: 1, components: [btn1] }],
		});
		const gameCreatedAt = Date.now();

		const collector = await options.message.channel.createMessageCollector({
			filter: (m) => m.author.id === options.message.author.id,
			time: options.time,
		});

		const gameCollector = msg.createMessageComponentCollector({
			filter: (fn) => fn,
		});

		collector.on('collect', async (_msg) => {
			if (_msg.author.id !== options.message.author.id) return;
			if (isNaN(_msg.content)) {
				return;
			}
			const parsedNumber = parseInt(_msg.content, 10);
			if (parsedNumber === options.number) {
				const time = _function.convertTime(Date.now() - gameCreatedAt);
				const _embed = new discord_js.EmbedBuilder()
					.setDescription(
						`${options.winMessage.privateGame
							.replace(/{{time}}/g, time)
							.replace(/{{number}}/g, options.number)}`,
					)
					.setTitle(options.embed.title)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				if (options.embed.timestamp) {
					_embed.setTimestamp();
				}
				btn1 = new discord_js.ButtonBuilder()
					.setStyle(discord_js.ButtonStyle.Danger)
					.setLabel(options.buttonText)
					.setDisabled()
					.setCustomId(id);
				await msg.edit({
					embeds: [embed],
					components: [{ type: 1, components: [btn1] }],
				});
				_msg.reply({ embeds: [_embed] });
				gameCollector.stop();
				collector.stop();
				data.delete(options.message.author.id);
			}
			if (parseInt(_msg.content) < options.number) {
				const _embed = new discord_js.EmbedBuilder()
					.setDescription(
						options.bigNumberMessage
							.replace(/{{author}}/g, _msg.author.toString())
							.replace(/{{number}}/g, parsedNumber),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				_msg.reply({ embeds: [_embed] });
			}
			if (parseInt(_msg.content) > options.number) {
				const _embed = new discord_js.EmbedBuilder()
					.setDescription(
						options.smallNumberMessage
							.replace(/{{author}}/g, _msg.author.toString())
							.replace(/{{number}}/g, parsedNumber),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				_msg.reply({ embeds: [_embed] });
			}
		});

		gameCollector.on('collect', async (button) => {
			if (button.user.id !== options.message.author.id) {
				return button.reply({
					content: options.othersMessage.replace(
						/{{author}}/g,
						options.message.member.id,
					),
					ephemeral: true,
				});
			}

			await button.deferUpdate();

			if (button.customId === id) {
				btn1 = new discord_js.ButtonBuilder()
					.setStyle(discord_js.ButtonStyle.Danger)
					.setLabel(options.buttonText)
					.setDisabled()
					.setCustomId(id);
				gameCollector.stop();
				collector.stop();
				data.delete(options.message.author.id);
				msg.edit({
					embeds: [embed],
					components: [{ type: 1, components: [btn1] }],
				});
				const _embed = new discord_js.EmbedBuilder()
					.setTitle(options.embed.title)
					.setDescription(
						options.loseMessage.replace(/{{number}}/g, options.number),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				if (options.embed.timestamp) {
					_embed.setTimestamp();
				}
				options.message.inlineReply({
					embeds: [_embed],
				});
			}
		});
		collector.on('end', async (_collected, reason) => {
			if (reason === 'time') {
				const _embed = new discord_js.EmbedBuilder()
					.setTitle(options.embed.title)
					.setDescription(
						options.loseMessage.replace(/{{number}}/g, options.number),
					)
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer });
				if (options.embed.timestamp) {
					_embed.setTimestamp();
				}
				btn1 = new discord_js.ButtonBuilder()
					.setStyle(discord_js.ButtonStyle.Danger)
					.setLabel(options.buttonText)
					.setDisabled()
					.setCustomId(id);
				await msg.edit({
					embeds: [embed],
					components: [{ type: 1, components: [btn1] }],
				});
				data.delete(options.message.author.id);
				return options.message.reply({ embeds: [_embed] });
			}
		});
	}};

exports.default = GuessTheNumber;
