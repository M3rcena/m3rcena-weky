import { ButtonStyle, ButtonBuilder, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { decode } from 'html-entities';
import { getRandomString } from '../../functions/function.mjs';

/**
 * Would You Rather? Game for your Discord Bot!
 * @param {object} options - Options for the game.
 * @param {object} options.message - The Discord Message object.
 * 
 * @param {object} [options.embed] - Embed options.
 * @param {string} [options.embed.title] - The title of the embed.
 * @param {string} [options.embed.footer] - The footer of the embed.
 * @param {boolean} [options.embed.timestamp] - Whether to show the timestamp on the footer or not.
 * 
 * @param {string} [options.thinkMessage] - The message to show while the bot is thinking.
 * @param {string} [options.othersMessage] - The message to show when someone else tries to click the buttons.
 * 
 * @param {object} [options.buttons] - Button options.
 * @param {string} [options.buttons.optionA] - The label for the option A button.
 * @param {string} [options.buttons.optionB] - The label for the option B button.
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
		options.embed.title = 'Would you rather... | Weky Development';
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

	if (!options.buttons.optionA) options.buttons.optionA = 'Option A';
	if (typeof options.buttons.optionA !== 'string') {
		throw new TypeError('Weky Error: button must be a string.');
	}

	if (!options.buttons.optionB) options.buttons.optionB = 'Option B';
	if (typeof options.buttons.optionB !== 'string') {
		throw new TypeError('Weky Error: button must be a string.');
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
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	const response = await fetch(
		'https://fun-api.sujalgoel.engineer/wyr',
	).then((res) => res.json());
	const data = response.data;

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}...`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	const res = {
		questions: [data.option_1.option, data.option_2.option],
		percentage: {
			1:
				(
					(parseInt(data.option_1.votes) /
						(parseInt(data.option_1.votes) + parseInt(data.option_2.votes))) *
					100
				).toFixed(2) + '%',
			2:
				(
					(parseInt(data.option_2.votes) /
						(parseInt(data.option_1.votes) + parseInt(data.option_2.votes))) *
					100
				).toFixed(2) + '%',
		},
	};

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setColor(options.embed.color),
		],
	});

	let btn = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setLabel(`${options.buttons.optionA}`)
		.setCustomId(id1);

	let btn2 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setLabel(`${options.buttons.optionB}`)
		.setCustomId(id2);

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	const embed = new EmbedBuilder()
		.setTitle(options.embed.title)
		.setDescription(
			`**A)** ${decode(res.questions[0])} \n**B)** ${decode(res.questions[1])}`,
		)
		.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
		.setFooter({ text: options.embed.footer })
	if (options.embed.timestamp) {
		embed.setTimestamp();
	}

	await think.edit({
		embeds: [embed],
		components: [{ type: 1, components: [btn, btn2] }],
	});

	const gameCollector = think.createMessageComponentCollector({
		filter: (fn) => fn,
	});

	gameCollector.on('collect', async (wyr) => {
		if (wyr.user.id !== options.message.author.id) {
			return wyr.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}
		await wyr.deferUpdate();
		if (wyr.customId === id1) {
			btn = new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(`${options.buttons.optionA}` + ` (${res.percentage['1']})`)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(`${options.buttons.optionB}` + ` (${res.percentage['2']})`)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			const _embed = new EmbedBuilder()
				.setTitle(options.embed.title)
				.setDescription(
					`**A) ${decode(res.questions[0])} (${res.percentage['1']
					})** \nB) ${decode(res.questions[1])} (${res.percentage['2']})`,
				)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			await wyr.editReply({
				embeds: [_embed],
				components: [{ type: 1, components: [btn, btn2] }],
			});
		} else if (wyr.customId === id2) {
			btn = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(`${options.buttons.optionA}` + ` (${res.percentage['1']})`)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(`${options.buttons.optionB}` + ` (${res.percentage['2']})`)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			const _embed = new EmbedBuilder()
				.setTitle(options.embed.title)
				.setDescription(
					`A) ${decode(res.questions[0])} (${res.percentage['1']
					}) \n**B) ${decode(res.questions[1])} (${res.percentage['2']})**`,
				)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			await wyr.editReply({
				embeds: [_embed],
				components: [{ type: 1, components: [btn, btn2] }],
			});
		}
	});
};