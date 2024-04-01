'use strict';

var Discord = require('discord.js');
var _function = require('./function-tD1ad7nu.cjs');
require('axios');
require('chalk');
require('cheerio');
require('node-fetch');
require('string-width');

const data = new Set();

module.exports = Snake;

async function Snake (options) {
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
		options.embed.title = 'Snake | Weky Development';
	}
	if (typeof options.embed.title !== 'string') {
		throw new TypeError('Weky Error: title must be a string.');
	}

	if (!options.embed.description) {
		options.embed.description = 'GG, you scored **{{score}}** points!';
	}
	if (typeof options.embed.description !== 'string') {
		throw new TypeError('Weky Error: description must be a string.');
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

	if (!options.emojis) options.emojis = {};
	if (typeof options.emojis !== 'object') {
		throw new TypeError('Weky Error: emojis must be an object.');
	}

	if (!options.emojis.empty) options.emojis.empty = '⬛';
	if (typeof options.emojis.empty !== 'string') {
		throw new TypeError('Weky Error: empty emoji must be an emoji.');
	}

	if (!options.emojis.snakeBody) options.emojis.snakeBody = '🟩';
	if (typeof options.emojis.snakeBody !== 'string') {
		throw new TypeError('Weky Error: snakeBody emoji must be an emoji.');
	}

	if (!options.emojis.food) options.emojis.food = '🍎';
	if (typeof options.emojis.food !== 'string') {
		throw new TypeError('Weky Error: food emoji must be an emoji.');
	}

	if (!options.emojis.up) options.emojis.up = '⬆️';
	if (typeof options.emojis.up !== 'string') {
		throw new TypeError('Weky Error: up emoji must be an emoji.');
	}

	if (!options.emojis.right) options.emojis.right = '⬅️';
	if (typeof options.emojis.right !== 'string') {
		throw new TypeError('Weky Error: right emoji must be an emoji.');
	}

	if (!options.emojis.down) options.emojis.down = '⬇️';
	if (typeof options.emojis.down !== 'string') {
		throw new TypeError('Weky Error: down emoji must be an emoji.');
	}

	if (!options.emojis.left) options.emojis.left = '➡️';
	if (typeof options.emojis.left !== 'string') {
		throw new TypeError('Weky Error: left emoji must be an emoji.');
	}

	if (!options.othersMessage) {
		options.othersMessage = 'Only <@{{author}}> can use the buttons!';
	}
	if (typeof options.othersMessage !== 'string') {
		throw new TypeError('Weky Error: othersMessage must be a string.');
	}

	if (!options.buttonText) options.buttonText = 'Cancel';
	if (typeof options.buttonText !== 'string') {
		throw new TypeError('Weky Error: buttonText must be a string.');
	}

	if (data.has(options.message.author.id)) return;
	data.add(options.message.author.id);

	const id1 =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	const id2 =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	const id3 =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	const id4 =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	const id5 =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	const id6 =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	const id7 =
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20) +
		'-' +
		_function.getRandomString(20);

	let score = 0;
	const width = 15;
	const height = 10;
	const gameBoard = [];
	let inGame = false;
	let snakeLength = 1;
	const apple = { x: 0, y: 0 };
	let snake = [{ x: 0, y: 0 }];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			gameBoard[y * width + x] = options.emojis.empty;
		}
	}

	function gameBoardToString() {
		let str = '';
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (x == apple.x && y == apple.y) {
					str += options.emojis.food;
					continue;
				}
				let flag = true;
				for (let s = 0; s < snake.length; s++) {
					if (x == snake[s].x && y == snake[s].y) {
						str += options.emojis.snakeBody;
						flag = false;
					}
				}
				if (flag) {
					str += gameBoard[y * width + x];
				}
			}
			str += '\n';
		}
		return str;
	}

	function isLocInSnake(pos) {
		return snake.find((sPos) => sPos.x == pos.x && sPos.y == pos.y);
	}

	function newappleLoc() {
		let newapplePos = {
			x: 0,
			y: 0,
		};
		do {
			newapplePos = {
				x: parseInt(Math.random() * width),
				y: parseInt(Math.random() * height),
			};
		} while (isLocInSnake(newapplePos));
		apple.x = newapplePos.x;
		apple.y = newapplePos.y;
	}

	function step(msg) {
		if (apple.x == snake[0].x && apple.y == snake[0].y) {
			score += 1;
			snakeLength++;
			newappleLoc();
		}

		const editEmbed = new Discord.EmbedBuilder()
			.setTitle(options.embed.title)
			.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
			.setFooter({text: options.embed.footer})
			.setDescription(gameBoardToString());
		if (options.embed.timestamp) {
			editEmbed.setTimestamp();
		}
		lock1 = new Discord.ButtonBuilder()
			.setLabel('\u200b')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setCustomId(id1)
			.setDisabled();
		w = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.up)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id2);
		lock2 = new Discord.ButtonBuilder()
			.setLabel('\u200b')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setCustomId(id7)
			.setDisabled();
		a = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.right)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id3);
		s = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.down)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id4);
		d = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.left)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id5);
		stopy = new Discord.ButtonBuilder()
			.setLabel(options.buttonText)
			.setStyle(Discord.ButtonStyle.Danger)
			.setCustomId(id6);

		msg.edit({
			embeds: [editEmbed],
			components: [
				{
					type: 1,
					components: [lock1, w, lock2, stopy],
				},
				{
					type: 1,
					components: [a, s, d],
				},
			],
		});
	}

	function gameOver(m) {
		lock1 = new Discord.ButtonBuilder()
			.setLabel('\u200b')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setCustomId(id1)
			.setDisabled();

		lock2 = new Discord.ButtonBuilder()
			.setLabel('\u200b')
			.setStyle(Discord.ButtonStyle.Secondary)
			.setCustomId(id7)
			.setDisabled();
		w = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.up)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id2)
			.setDisabled();
		a = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.right)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id3)
			.setDisabled();
		s = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.down)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id4)
			.setDisabled();
		d = new Discord.ButtonBuilder()
			.setEmoji(options.emojis.left)
			.setStyle(Discord.ButtonStyle.Primary)
			.setCustomId(id5)
			.setDisabled();
		stopy = new Discord.ButtonBuilder()
			.setLabel(options.buttonText)
			.setStyle(Discord.ButtonStyle.Danger)
			.setCustomId(id6)
			.setDisabled();
		inGame = false;

		const editEmbed = new Discord.EmbedBuilder()
			.setTitle(options.embed.title)
			.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
			.setFooter({text: options.embed.footer})
			.setDescription(options.embed.description.replace('{{score}}', score));
		if (options.embed.timestamp) {
			editEmbed.setTimestamp();
		}

		m.edit({
			embeds: [editEmbed],
			components: [
				{
					type: 1,
					components: [lock1, w, lock2, stopy],
				},
				{
					type: 1,
					components: [a, s, d],
				},
			],
		});
	}

	if (inGame) return;
	inGame = true;
	score = 0;
	snakeLength = 1;
	snake = [{ x: 5, y: 5 }];
	newappleLoc();
	const embed = new Discord.EmbedBuilder()
		.setTitle(options.embed.title)
		.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
		.setFooter({text: options.embed.footer})
		.setDescription(gameBoardToString());
	if (options.embed.timestamp) {
		embed.setTimestamp();
	}

	let lock1 = new Discord.ButtonBuilder()
		.setLabel('\u200b')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setCustomId(id1)
		.setDisabled();
	let w = new Discord.ButtonBuilder()
		.setEmoji(options.emojis.up)
		.setStyle(Discord.ButtonStyle.Primary)
		.setCustomId(id2);
	let lock2 = new Discord.ButtonBuilder()
		.setLabel('\u200b')
		.setStyle(Discord.ButtonStyle.Secondary)
		.setCustomId(id7)
		.setDisabled();
	let a = new Discord.ButtonBuilder()
		.setEmoji(options.emojis.right)
		.setStyle(Discord.ButtonStyle.Primary)
		.setCustomId(id3);
	let s = new Discord.ButtonBuilder()
		.setEmoji(options.emojis.down)
		.setStyle(Discord.ButtonStyle.Primary)
		.setCustomId(id4);
	let d = new Discord.ButtonBuilder()
		.setEmoji(options.emojis.left)
		.setStyle(Discord.ButtonStyle.Primary)
		.setCustomId(id5);
	let stopy = new Discord.ButtonBuilder()
		.setLabel(options.buttonText)
		.setStyle(Discord.ButtonStyle.Danger)
		.setCustomId(id6);

	const m = await options.message.reply({
		embeds: [embed],
		components: [
			{
				type: 1,
				components: [lock1, w, lock2, stopy],
			},
			{
				type: 1,
				components: [a, s, d],
			},
		],
	});

	const collector = m.createMessageComponentCollector({
		filter: (fn) => fn,
	});

	collector.on('collect', async (btn) => {
		if (btn.user.id !== options.message.author.id) {
			return btn.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}
		await btn.deferUpdate();

		const snakeHead = snake[0];
		const nextPos = {
			x: snakeHead.x,
			y: snakeHead.y,
		};

		if (btn.customId === id3) {
			let nextX = snakeHead.x - 1;
			if (nextX < 0) {
				nextX = width - 1;
			}
			nextPos.x = nextX;
		} else if (btn.customId === id2) {
			let nextY = snakeHead.y - 1;
			if (nextY < 0) {
				nextY = height - 1;
			}
			nextPos.y = nextY;
		} else if (btn.customId === id4) {
			let nextY = snakeHead.y + 1;
			if (nextY >= height) {
				nextY = 0;
			}
			nextPos.y = nextY;
		} else if (btn.customId === id5) {
			let nextX = snakeHead.x + 1;
			if (nextX >= width) {
				nextX = 0;
			}
			nextPos.x = nextX;
		} else if (btn.customId === id6) {
			gameOver(m);
			collector.stop();
			data.delete(options.message.author.id);
		}

		if (isLocInSnake(nextPos)) {
			gameOver(m);
			collector.stop();
			data.delete(options.message.author.id);
		} else {
			snake.unshift(nextPos);
			if (snake.length > snakeLength) {
				snake.pop();
			}
			step(m);
		}
	});
};