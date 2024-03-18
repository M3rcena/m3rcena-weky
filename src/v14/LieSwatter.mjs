import { ButtonStyle } from 'discord.js';
import fetch from 'node-fetch';
import Discord from 'discord.js';
import { decode } from 'html-entities';
import { getRandomString, convertTime } from '../../functions/function.mjs';

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
		options.embed.title = 'Lie Swatter | Weky Development';
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

	if (!options.thinkMessage) options.thinkMessage = 'I am thinking';
	if (typeof options.thinkMessage !== 'string') {
		throw new TypeError('Weky Error: thinkMessage must be a boolean.');
	}

	if (!options.winMessage) {
		options.winMessage =
			'GG, It was a **{{answer}}**. You got it correct in **{{time}}**.';
	}
	if (typeof options.winMessage !== 'string') {
		throw new TypeError('Weky Error: winMessage must be a boolean.');
	}

	if (!options.loseMessage) {
		options.loseMessage = 'Better luck next time! It was a **{{answer}}**.';
	}
	if (typeof options.loseMessage !== 'string') {
		throw new TypeError('Weky Error: loseMessage must be a boolean.');
	}

	if (!options.othersMessage) {
		options.othersMessage = 'Only <@{{author}}> can use the buttons!';
	}
	if (typeof options.othersMessage !== 'string') {
		throw new TypeError('Weky Error: othersMessage must be a string.');
	}

	if (!options.buttons) options.buttons = {};
	if (typeof options.buttons !== 'object') {
		throw new TypeError('Weky Error: buttons must be an object.');
	}

	if (!options.buttons.true) options.buttons.true = 'Truth';
	if (typeof options.buttons.true !== 'string') {
		throw new TypeError('Weky Error: true buttons text must be a string.');
	}

	if (!options.buttons.lie) options.buttons.lie = 'Lie';
	if (typeof options.buttons.lie !== 'string') {
		throw new TypeError('Weky Error: lie buttons text must be a string.');
	}

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

	const think = await options.message.reply({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}...`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	const { results } = await fetch(
		'https://opentdb.com/api.php?amount=1&type=boolean',
	).then((res) => res.json());
	const question = results[0];

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	let answer;
	let winningID;
	if (question.correct_answer === 'True') {
		winningID = id1;
		answer = options.buttons.true;
	} else {
		winningID = id2;
		answer = options.buttons.lie;
	}

	let btn1 = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setLabel(options.buttons.true)
		.setCustomId(id1);
	let btn2 = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setLabel(options.buttons.lie)
		.setCustomId(id2);


	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
		],
	});

	const embed = new Discord.EmbedBuilder()
		.setTitle(options.embed.title)
		.setDescription(decode(question.question))
		.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
		.setFooter({ text: options.embed.footer })
	if (options.embed.timestamp) {
		embed.setTimestamp();
	}
	await think
		.edit({
			embeds: [embed],
			components: [{ type: 1, components: [btn1, btn2] }],
		});

	const gameCreatedAt = Date.now();
	const gameCollector = think.createMessageComponentCollector({
		filter: (fn) => fn,
	});

	gameCollector.on('collect', async (button) => {
		if (button.user.id !== options.message.author.id) {
			return button.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}

		await button.deferUpdate();

		if (button.customId === winningID) {
			btn1 = new Discord.ButtonBuilder()
				.setLabel(options.buttons.true)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new Discord.ButtonBuilder()
				.setLabel(options.buttons.lie)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				btn2.setStyle(ButtonStyle.Danger);
			} else {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Success);
			}
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1, btn2] }],
			});
			const time = convertTime(Date.now() - gameCreatedAt);
			const winEmbed = new Discord.EmbedBuilder()
				.setDescription(
					`${options.winMessage
						.replace('{{answer}}', decode(answer))
						.replace('{{time}}', time)}`,
				)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				winEmbed.setTimestamp();
			}
			options.message.reply({ embeds: [winEmbed] });
		} else {
			btn1 = new Discord.ButtonBuilder()
				.setLabel(options.buttons.true)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new Discord.ButtonBuilder()
				.setLabel(options.buttons.lie)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			if (winningID === id1) {
				btn1.setStyle(ButtonStyle.Success);
				btn2.setStyle(ButtonStyle.Danger);
			} else {
				btn1.setStyle(ButtonStyle.Danger);
				btn2.setStyle(ButtonStyle.Success);
			}
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1, btn2] }],
			});
			const lostEmbed = new Discord.EmbedBuilder()
				.setDescription(
					`${options.loseMessage.replace('{{answer}}', decode(answer))}`,
				)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				lostEmbed.setTimestamp();
			}
			options.message.reply({ embeds: [lostEmbed] });
		}
	});
};