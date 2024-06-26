import { ButtonStyle, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { decode } from 'html-entities';
import { getRandomString, WillYouPressTheButton } from '../../functions/function.ts';

/**
 * Will You Press The Button? Game for your Discord Bot!
 * @param {object} options - Options for the game.
 * @param {object} options.message - The Discord Message object.
 * 
 * @param {object} [options.embed] - Embed options.
 * @param {string} [options.embed.title] - The title of the embed.
 * @param {string} [options.embed.description] - The description of the embed.
 * @param {string} [options.embed.footer] - The footer of the embed.
 * @param {boolean} [options.embed.timestamp] - Whether to show the timestamp on the footer or not.
 * 
 * @param {object} [options.button] - Button options.
 * @param {string} [options.button.yes] - The label for the yes button.
 * @param {string} [options.button.no] - The label for the no button.
 * 
 * @param {string} [options.thinkMessage] - The message to show while the bot is thinking.
 * @param {string} [options.othersMessage] - The message to show when someone else tries to click the buttons.
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
		options.embed.title = 'Will you press the button? | Weky Development';
	}
	if (typeof options.embed.title !== 'string') {
		throw new TypeError('Weky Error: embed title must be a string.');
	}

	if (!options.embed.description) {
		options.embed.description =
			'```{{statement1}}```\n**but**\n\n```{{statement2}}```';
	}
	if (typeof options.embed.description !== 'string') {
		throw new TypeError('Weky Error: embed description must be a string.');
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

	if (!options.button) options.button = {};
	if (typeof options.embed !== 'object') {
		throw new TypeError('Weky Error: buttons must be an object.');
	}

	if (!options.button.yes) options.button.yes = 'Yes';
	if (typeof options.button.yes !== 'string') {
		throw new TypeError('Weky Error: yesLabel must be a string.');
	}

	if (!options.button.no) options.button.no = 'No';
	if (typeof options.button.no !== 'string') {
		throw new TypeError('Weky Error: noLabel must be a string.');
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

	const fetchedData = await WillYouPressTheButton();

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}...`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	const res = {
		questions: [fetchedData.txt1, fetchedData.txt2],
		percentage: {
			1: fetchedData.yes,
			2: fetchedData.no,
		},
	};

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	let btn = new ButtonBuilder()
		.setStyle(ButtonStyle.Success)
		.setLabel(options.button.yes)
		.setCustomId(id1);
	let btn2 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setLabel(options.button.no)
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
			`${options.embed.description
				.replace(
					'{{statement1}}',
					decode(
						res.questions[0].charAt(0).toUpperCase() +
						res.questions[0].slice(1),
					),
				)
				.replace(
					'{{statement2}}',
					decode(
						res.questions[1].charAt(0).toUpperCase() +
						res.questions[1].slice(1),
					),
				)}`,
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

	gameCollector.on('collect', async (wyptb) => {
		if (wyptb.user.id !== options.message.author.id) {
			return wyptb.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}

		await wyptb.deferUpdate();

		if (wyptb.customId === id1) {
			btn = new ButtonBuilder()
				.setStyle(ButtonStyle.Success)
				.setLabel(`${options.button.yes} (${res.percentage['1']})`)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(`${options.button.no} (${res.percentage['2']})`)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			await wyptb.editReply({
				embed: embed,
				components: [{ type: 1, components: [btn, btn2] }],
			});
		} else if (wyptb.customId === id2) {
			btn = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(`${options.button.yes} (${res.percentage['1']})`)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new ButtonBuilder()
				.setStyle(ButtonStyle.Success)
				.setLabel(`${options.button.no} (${res.percentage['2']})`)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			await wyptb.editReply({
				embed: embed,
				components: [{ type: 1, components: [btn, btn2] }],
			});
		}
	});
};