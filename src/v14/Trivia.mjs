import { ButtonStyle } from 'discord.js';
const data = new Set();
import db from 'quick.db';
import fetch from 'node-fetch';
import Discord from 'discord.js';
import { decode } from 'html-entities';
const difficulties = ['hard', 'medium', 'easy'];
import { getRandomString, convertTime, shuffleArray } from '../../functions/function.mjs';

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

	if (!options.embed.title) options.embed.title = 'Trivia | Weky Development';
	if (typeof options.embed.title !== 'string') {
		throw new TypeError('Weky Error: embed title must be a string.');
	}

	if (!options.embed.description) {
		options.embed.description =
			'You only have **{{time}}** to guess the answer!';
	}
	if (typeof options.embed.description !== 'string') {
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

	if (!options.difficulty || !difficulties.includes(options.difficulty)) {
		options.difficulty =
			difficulties[Math.floor(Math.random() * difficulties.length)];
	}
	if (typeof options.difficulty !== 'string') {
		throw new TypeError('Weky Error: difficulty must be a string.');
	}

	if (!options.thinkMessage) options.thinkMessage = 'I am thinking';
	if (typeof options.thinkMessage !== 'string') {
		throw new TypeError('Weky Error: thinkMessage must be a boolean.');
	}

	if (!options.winMessage) {
		options.winMessage =
			'GG, It was **{{answer}}**. You gave the correct answer in **{{time}}**.';
	}
	if (typeof options.winMessage !== 'string') {
		throw new TypeError('Weky Error: winMessage must be a boolean.');
	}

	if (!options.loseMessage) {
		options.loseMessage =
			'Better luck next time! The correct answer was **{{answer}}**.';
	}
	if (typeof options.loseMessage !== 'string') {
		throw new TypeError('Weky Error: loseMessage must be a boolean.');
	}

	if (!options.emojis) options.emojis = {};
	if (typeof options.emojis !== 'object') {
		throw new TypeError('Weky Error: emojis must be an object.');
	}

	if (!options.emojis.one) options.emojis.one = '1️⃣';
	if (typeof options.emojis.one !== 'string') {
		throw new TypeError('Weky Error: emoji one must be an emoji.');
	}

	if (!options.emojis.two) options.emojis.two = '2️⃣';
	if (typeof options.emojis.two !== 'string') {
		throw new TypeError('Weky Error: emoji two must be an emoji.');
	}

	if (!options.emojis.three) options.emojis.three = '3️⃣';
	if (typeof options.emojis.three !== 'string') {
		throw new TypeError('Weky Error: emoji three must be an emoji.');
	}

	if (!options.emojis.four) options.emojis.four = '4️⃣';
	if (typeof options.emojis.four !== 'string') {
		throw new TypeError('Weky Error: emoji four must be an emoji.');
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

	if (!options.returnWinner) options.returnWinner = false;
	if (typeof options.returnWinner !== 'boolean') {
		throw new TypeError('Weky Error: buttonText must be a boolean.');
	}

	if (!options.othersMessage) {
		options.othersMessage = 'Only <@{{author}}> can use the buttons!';
	}
	if (typeof options.othersMessage !== 'string') {
		throw new TypeError('Weky Error: othersMessage must be a string.');
	}

	if (data.has(options.message.author.id)) return;
	data.add(options.message.author.id);

	const id1 =
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20);

	const id2 =
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20);

	const id3 =
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20);

	const id4 =
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20) +
		'-' +
		getRandomString(20);

	const think = await options.message.reply({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	const question = {};

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}...`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	const q = [];
	const res = await fetch(
		`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${options.difficulty}`,
	).then((response) => response.json());

	q.push(res.results[0]);
	question.question = res.results[0].question;
	question.difficulty = res.results[0].difficulty;
	q[0].incorrect_answers.push(q[0].correct_answer);
	const shuffledArray = shuffleArray(q[0].incorrect_answers);
	question.correct = shuffledArray.indexOf(res.results[0].correct_answer);
	question.options = shuffledArray;

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	let winningID;

	if (question.correct === 0) {
		winningID = id1;
	} else if (question.correct === 1) {
		winningID = id2;
	} else if (question.correct === 2) {
		winningID = id3;
	} else if (question.correct === 3) {
		winningID = id4;
	}

	let btn1 = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji(options.emojis.one)
		.setCustomId(id1);

	let btn2 = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji(options.emojis.two)
		.setCustomId(id2);

	let btn3 = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji(options.emojis.three)
		.setCustomId(id3);

	let btn4 = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji(options.emojis.four)
		.setCustomId(id4);

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	let opt = '';

	for (let i = 0; i < question.options.length; i++) {
		opt += `**${i + 1})** ${decode(question.options[i])}\n`;
	}

	const embed = new Discord.EmbedBuilder()
		.setTitle(options.embed.title)
		.addFields(
			decode(question.question),
			`${options.embed.description.replace(
				'{{time}}',
				convertTime(options.time),
			)}\n\n${opt}`,
		)
		.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
		.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()})
	if (options.embed.timestamp) {
		embed.setTimestamp();
	}
	await think.edit({
		embeds: [embed],
		components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
	});

	const gameCreatedAt = Date.now();
	const gameCollector = think.createMessageComponentCollector({
		filter: (fn) => fn,
		time: options.time,
	});

	gameCollector.on('collect', async (trivia) => {
		if (trivia.user.id !== options.message.author.id) {
			return trivia.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}
		await trivia.deferUpdate();
		if (trivia.customId === winningID) {
			btn1 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.one)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.two)
				.setCustomId(id2)
				.setDisabled();
			btn3 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.three)
				.setCustomId(id3)
				.setDisabled();
			btn4 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.four)
				.setCustomId(id4)
				.setDisabled();
			gameCollector.stop();
			data.delete(options.message.author.id);
			if (options.returnWinner) {
				if (!options.gameID) {
					throw new Error('Weky Error: gameID argument was not specified.');
				}
				if (typeof options.gameID !== 'string') {
					throw new TypeError('Weky Error: gameID must be a string.');
				}
				db.set(
					`Trivia_${options.message.guild.id}_${options.gameID}`,
					options.message.author.id,
				);
			}
			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				btn2.setStyle(ButtonStyle.Danger);
				btn3.setStyle(ButtonStyle.Danger);
				btn4.setStyle(ButtonStyle.Danger);
			} else if (winningID === id2) {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Success);
				btn3.setStyle(ButtonStyle.Danger);
				btn4.setStyle(ButtonStyle.Danger);
			} else if (winningID === id3) {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Danger);
				btn3.setStyle(ButtonStyle.Success);
				btn4.setStyle(ButtonStyle.Danger);
			} else if (winningID === id4) {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Danger);
				btn3.setStyle(ButtonStyle.Danger);
				btn4.setStyle(ButtonStyle.Success);
			}
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
			});
			const time = convertTime(Date.now() - gameCreatedAt);
			const winEmbed = new Discord.EmbedBuilder()
				.setDescription(
					`${options.winMessage
						.replace('{{answer}}', decode(question.options[question.correct]))
						.replace('{{time}}', time)}`,
				)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()})
			if (options.embed.timestamp) {
				winEmbed.setTimestamp();
			}
			options.message.reply({ embeds: [winEmbed] });
		} else {
			btn1 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.one)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.two)
				.setCustomId(id2)
				.setDisabled();
			btn3 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.three)
				.setCustomId(id3)
				.setDisabled();
			btn4 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.four)
				.setCustomId(id4)
				.setDisabled();

			gameCollector.stop();
			data.delete(options.message.author.id);
			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				if (trivia.customId === id2) {
					btn2.setStyle(ButtonStyle.Danger);
					btn3.setStyle(ButtonStyle.Secondary);
					btn4.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id3) {
					btn2.setStyle(ButtonStyle.Secondary);
					btn3.setStyle(ButtonStyle.Danger);
					btn4.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id4) {
					btn2.setStyle(ButtonStyle.Secondary);
					btn3.setStyle(ButtonStyle.Secondary);
					btn4.setStyle(ButtonStyle.Danger);
				}
			} else if (winningID === id2) {
				btn2.setStyle(ButtonStyle.Success);
				if (trivia.customId === id1) {
					btn1.setStyle(ButtonStyle.Danger);
					btn3.setStyle(ButtonStyle.Secondary);
					btn4.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id3) {
					btn1.setStyle(ButtonStyle.Secondary);
					btn3.setStyle(ButtonStyle.Danger);
					btn4.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id4) {
					btn1.setStyle(ButtonStyle.Secondary);
					btn3.setStyle(ButtonStyle.Secondary);
					btn4.setStyle(ButtonStyle.Danger);
				}
			} else if (winningID === id3) {
				btn3.setStyle(ButtonStyle.Success);
				if (trivia.customId === id1) {
					btn1.setStyle(ButtonStyle.Danger);
					btn2.setStyle(ButtonStyle.Secondary);
					btn4.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id2) {
					btn1.setStyle(ButtonStyle.Secondary);
					btn2.setStyle(ButtonStyle.Danger);
					btn4.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id4) {
					btn1.setStyle(ButtonStyle.Secondary);
					btn2.setStyle(ButtonStyle.Secondary);
					btn4.setStyle(ButtonStyle.Danger);
				}
			} else if (winningID === id4) {
				btn4.setStyle(ButtonStyle.Success);
				if (trivia.customId === id1) {
					btn1.setStyle(ButtonStyle.Danger);
					btn2.setStyle(ButtonStyle.Secondary);
					btn3.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id2) {
					btn1.setStyle(ButtonStyle.Secondary);
					btn2.setStyle(ButtonStyle.Danger);
					btn3.setStyle(ButtonStyle.Secondary);
				} else if (trivia.customId === id3) {
					btn1.setStyle(ButtonStyle.Secondary);
					btn2.setStyle(ButtonStyle.Secondary);
					btn3.setStyle(ButtonStyle.Danger);
				}
			}
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
			});
			const lostEmbed = new Discord.EmbedBuilder()
				.setDescription(
					`${options.loseMessage.replace(
						'{{answer}}',
						decode(question.options[question.correct]),
					)}`,
				)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()})
			if (options.embed.timestamp) {
				lostEmbed.setTimestamp();
			}
			options.message.reply({ embeds: [lostEmbed] });
		}
	});

	gameCollector.on('end', (trivia, reason) => {
		console.log(reason);
		if (reason === 'time') {
			btn1 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.one)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.two)
				.setCustomId(id2)
				.setDisabled();
			btn3 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.three)
				.setCustomId(id3)
				.setDisabled();
			btn4 = new Discord.ButtonBuilder()
				.setEmoji(options.emojis.four)
				.setCustomId(id4)
				.setDisabled();
			data.delete(options.message.author.id);
			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				btn2.setStyle(ButtonStyle.Secondary);
				btn3.setStyle(ButtonStyle.Secondary);
				btn4.setStyle(ButtonStyle.Secondary);
			} else if (winningID === id2) {
				btn1.setStyle(ButtonStyle.Secondary);
				btn2.setStyle(ButtonStyle.Success);
				btn3.setStyle(ButtonStyle.Secondary);
				btn4.setStyle(ButtonStyle.Secondary);
			} else if (winningID === id3) {
				btn1.setStyle(ButtonStyle.Secondary);
				btn2.setStyle(ButtonStyle.Secondary);
				btn3.setStyle(ButtonStyle.Success);
				btn4.setStyle(ButtonStyle.Secondary);
			} else if (winningID === id4) {
				btn1.setStyle(ButtonStyle.Secondary);
				btn2.setStyle(ButtonStyle.Secondary);
				btn3.setStyle(ButtonStyle.Secondary);
				btn4.setStyle(ButtonStyle.Success);
			}
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
			});
			const lostEmbed = new Discord.EmbedBuilder()
				.setDescription(
					`${options.loseMessage.replace(
						'{{answer}}',
						decode(question.options[question.correct]),
					)}`,
				)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()})
			if (options.embed.timestamp) {
				lostEmbed.setTimestamp();
			}
			options.message.reply({ embeds: [lostEmbed] });
		}
	});
};