import { ButtonStyle } from 'discord.js';
import fetch from 'node-fetch';
import Discord from 'discord.js';
import { getRandomString } from '../../functions/function.mjs';

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
		options.embed.title = 'Never Have I Ever | Weky Development';
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

	if (!options.buttons.optionA) options.buttons.optionA = 'Yes';
	if (typeof options.buttons.optionA !== 'string') {
		throw new TypeError('Weky Error: button must be a string.');
	}

	if (!options.buttons.optionB) options.buttons.optionB = 'No';
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
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	let { statement } = await fetch(
		'https://api.nhie.io/v1/statements/random?category[]=harmless',
	).then((res) => res.json());

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}...`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	statement = statement.trim();

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	let btn = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setLabel(`${options.buttons.optionA}`)
		.setCustomId(id1);
	let btn2 = new Discord.ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setLabel(`${options.buttons.optionB}`)
		.setCustomId(id2);

	await think.edit({
		embeds: [
			new Discord.EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
				.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()}),
		],
	});

	const embed = new Discord.EmbedBuilder()
		.setTitle(options.embed.title)
		.setDescription(statement)
		.setAuthor({name: options.message.author.username, iconURL: options.message.author.displayAvatarURL()})
		.setFooter({text: options.embed.footer, iconURL: options.client.user.displayAvatarURL()})
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

	gameCollector.on('collect', async (nhie) => {
		if (nhie.user.id !== options.message.author.id) {
			return nhie.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}

		await nhie.deferUpdate();

		if (nhie.customId === id1) {
			btn = new Discord.ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(`${options.buttons.optionA}`)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new Discord.ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(`${options.buttons.optionB}`)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn, btn2] }],
			});
		} else if (nhie.customId === id2) {
			btn = new Discord.ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(`${options.buttons.optionA}`)
				.setCustomId(id1)
				.setDisabled();
			btn2 = new Discord.ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(`${options.buttons.optionB}`)
				.setCustomId(id2)
				.setDisabled();
			gameCollector.stop();
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn, btn2] }],
			});
		}
	});
};