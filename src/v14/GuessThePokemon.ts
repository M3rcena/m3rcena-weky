import { ButtonStyle, ButtonBuilder, EmbedBuilder } from 'discord.js';
const gameData = new Set();
import fetch from 'node-fetch';
import { getRandomString, convertTime } from '../../functions/function.ts';

/**
 * Make a Guess The Pokémon game for your bot
 * @param {object} options - Options for the Guess The Pokémon game
 * @param {object} options.message - The message object
 * 
 * @param {object} [options.embed] - The embed object
 * @param {string} [options.embed.title] - The title of the embed
 * @param {string} [options.embed.description] - The description of the embed
 * @param {string} [options.embed.footer] - The footer of the embed
 * @param {boolean} [options.embed.timestamp] - The timestamp of the embed
 * 
 * @param {string} [options.thinkMessage] - The thinking message
 * @param {string} [options.othersMessage] - The others message
 * @param {string} [options.winMessage] - The win message
 * @param {string} [options.loseMessage] - The lose message
 * @param {string} [options.incorrectMessage] - The incorrect message
 * 
 * @param {number} [options.time] - The time for the game
 * 
 * @param {string} [options.buttonText] - The button text
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
		options.embed.title = 'Guess The Pokémon | Weky Development';
	}
	if (typeof options.embed.title !== 'string') {
		throw new TypeError('Weky Error: embed title must be a string.');
	}

	if (!options.embed.description) {
		options.embed.description =
			'**Type:**\n{{type}}\n\n**Abilities:**\n{{abilities}}\n\nYou only have **{{time}}** to guess the pokémon.';
	}
	if (typeof options.embed.description !== 'string') {
		throw new TypeError('Weky Error: embed color must be a string.');
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

	if (!options.time) options.time = 60000;
	if (parseInt(options.time) < 10000) {
		throw new Error(
			'Weky Error: time argument must be greater than 10 Seconds (in ms i.e. 10000).',
		);
	}
	if (typeof options.time !== 'number') {
		throw new TypeError('Weky Error: time must be a number.');
	}

	if (!options.incorrectMessage) {
		options.incorrectMessage = 'No {{author}}! The pokémon isn\'t `{{answer}}`';
	}
	if (typeof options.incorrectMessage !== 'string') {
		throw new TypeError('Weky Error: loseMessage must be a string.');
	}

	if (!options.buttonText) options.buttonText = 'Cancel';
	if (typeof options.buttonText !== 'string') {
		throw new TypeError('Weky Error: buttonText must be a string.');
	}

	if (gameData.has(options.message.author.id)) return;
	gameData.add(options.message.author.id);

	const id =
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

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}...`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	const randomNumber = Math.floor(Math.random() * 801);
	let data = await fetch(
		`http://pokeapi.co/api/v2/pokemon/${randomNumber}`,
	).then(res => res.json());

	const abilities = data.abilities.map(item => item.ability.name);
	const seperatedAbilities = abilities.join(', ');

	const types = data.types.map(item => item.type.name);
	const seperatedTypes = types.join(', ');

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}..`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	await think.edit({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${options.thinkMessage}.`)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer }),
		],
	});

	let btn1 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setLabel(options.buttonText)
		.setCustomId(id);

	const embed = new EmbedBuilder()
		.setTitle(options.embed.title)
		.setDescription(
			options.embed.description
				.replace('{{type}}', seperatedTypes)
				.replace('{{abilities}}', seperatedAbilities)
				.replace('{{time}}', convertTime(options.time)),
		)

		.setImage(data.HiddenImage)
		.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
		.setFooter({ text: options.embed.footer })
	if (options.embed.timestamp) {
		embed.setTimestamp();
	}

	await think.edit({
		embeds: [embed],
		components: [{ type: 1, components: [btn1] }],
	});
	const gameCreatedAt = Date.now();
	const collector = await options.message.channel.createMessageCollector({
		filter: m => m.author.id === options.message.author.id,
		time: options.time,
	});

	collector.on('collect', async (msg) => {
		if (msg.content.toLowerCase() === data.name) {
			const _embed = new EmbedBuilder()
				.setTitle(options.embed.title)
				.setDescription(
					options.winMessage
						.replace(
							'{{answer}}',
							data.name.charAt(0).toUpperCase() + data.name.slice(1),
						)
						.replace(
							'{{time}}',
							convertTime(Date.now() - gameCreatedAt),
						),
				)
				.setImage(data.ShowImage)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			msg.reply({
				embeds: [_embed],
			});
			btn1 = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(options.buttonText)
				.setDisabled()
				.setCustomId(id);
			await think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1] }],
			});
			collector.stop();
			gameData.delete(options.message.author.id);
		} else {
			const _embed = new EmbedBuilder()
				.setDescription(
					options.incorrectMessage
						.replace('{{answer}}', msg.content.toLowerCase())
						.replace('{{author}}', msg.author.toString()),
				)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			msg.reply({
				embeds: [_embed],
			}).then(msg => setTimeout(() => msg.delete(), 3000));
		}
	});

	const gameCollector = think.createMessageComponentCollector({
		filter: (fn) => fn,
	});

	gameCollector.on('collect', async (button) => {
		if (button.user.id !== options.message.member.id) {
			return button.reply({
				content: options.othersMessage.replace(
					'{{author}}',
					options.message.member.id,
				),
				ephemeral: true,
			});
		}

		await button.deferUpdate();

		if (button.customId === id) {
			btn1 = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(options.buttonText)
				.setDisabled()
				.setCustomId(id);
			gameCollector.stop();
			collector.stop();
			gameData.delete(options.message.author.id);
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1] }],
			});
			const _embed = new EmbedBuilder()
				.setTitle(options.embed.title)
				.setDescription(
					options.loseMessage.replace(
						'{{answer}}',
						data.name.charAt(0).toUpperCase() + data.name.slice(1),
					),
				)
				.setImage(data.ShowImage)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			options.message.reply({
				embeds: [_embed],
			});
		}
	});

	collector.on('end', async (_msg, reason) => {
		if (reason === 'time') {
			btn1 = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(options.buttonText)
				.setDisabled()
				.setCustomId(id);
			gameCollector.stop();
			collector.stop();
			gameData.delete(options.message.author.id);
			think.edit({
				embeds: [embed],
				components: [{ type: 1, components: [btn1] }],
			});
			const _embed = new EmbedBuilder()
				.setTitle(options.embed.title)
				.setDescription(
					options.loseMessage.replace(
						'{{answer}}',
						data.name.charAt(0).toUpperCase() + data.name.slice(1),
					),
				)

				.setImage(data.ShowImage)
				.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
				.setFooter({ text: options.embed.footer })
			if (options.embed.timestamp) {
				_embed.setTimestamp();
			}
			options.message.reply({
				embeds: [_embed],
			});
		}
	});
};