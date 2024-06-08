import { evaluate, string } from 'mathjs';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ComponentType, EmbedBuilder } from 'discord.js';
import { createButton, getRandomString, addRow } from '../../functions/function.ts';
import chalk from 'chalk';
import type { Calc } from '../../typings/index.d.ts';

export default async (options:Calc) => {
	if (!options.message && !options.interaction) {
		throw new TypeError(`${chalk.red('Weky Error:')} message or interaction must be provided.`)
	}

	if (options.message && options.interaction) {
		throw new TypeError(`${chalk.red('Weky Error:')} message and interaction cannot be provided at the same time.`)
	}

	if (options.message) {
		if (typeof options.message !== 'object') {
			throw new TypeError(`${chalk.red('Weky Error:')} message must be an object.`);
		}
	}

	if (options.interaction) {
		if (typeof options.interaction !== 'object') {
			throw new TypeError(`${chalk.red('Weky Error:')} interaction must be an object.`);
		}
	}

	if (!options.embed) return;
	if (typeof options.embed !== 'object') {
		throw new TypeError(`${chalk.red('Weky Error:')} embed must be an object.`);
	}

	if (!options.embed.title) {
		options.embed.title = 'Calculator';
	}
	if (typeof options.embed.title !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} embed title must be a string.`);
	}

	if (!options.embed.color) {
		options.embed.color = 'Blurple';
	}
	if (typeof options.embed.color !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} color must be a string.`);
	}

	if (!options.embed.footer?.text) {
		if (options.embed.footer) {
			options.embed.footer.text = '©️ M3rcena Development';
		}
	}
	if (typeof options.embed.footer !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} footer must be a string.`);
	}

	if (!options.embed.timestamp) options.embed.timestamp = true;
	if (typeof options.embed.timestamp !== 'boolean') {
		throw new TypeError(`${chalk.red('Weky Error:')} timestamp must be a boolean.`);
	}

	if (!options.disabledQuery) {
		options.disabledQuery = 'Calculator is disabled!';
	}
	if (typeof options.disabledQuery !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} disabledQuery must be a string.`);
	}

	if (!options.invalidQuery) {
		options.invalidQuery = 'The provided equation is invalid!';
	}
	if (typeof options.invalidQuery !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} invalidQuery must be a string.`);
	}

	if (!options.othersMessage) {
		options.othersMessage = 'Only <@{{author}}> can use the buttons!';
	}
	if (typeof options.othersMessage !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} othersMessage must be a string.`);
	}

	let str = ' ';
	let stringify = '```\n' + str + '\n```';

	const row:ActionRowBuilder<ButtonBuilder>[] = [];
	const rows:ActionRowBuilder<ButtonBuilder>[] = [];

	const button:ButtonBuilder[][] = new Array([], [], [], [], []);
	const buttons:ButtonBuilder[][] = new Array([], [], [], [], []);

	const text = [
		'(',
		')',
		'^',
		'%',
		'AC',
		'7',
		'8',
		'9',
		'÷',
		'DC',
		'4',
		'5',
		'6',
		'x',
		'⌫',
		'1',
		'2',
		'3',
		'-',
		'\u200b',
		'.',
		'0',
		'=',
		'+',
		'\u200b',
	];

	let cur = 0;
	let current = 0;

	for (let i = 0; i < text.length; i++) {
		if (button[current].length === 5) current++;
		button[current].push(
			createButton(text[i], false, getRandomString),
		);
		if (i === text.length - 1) {
			for (const btn of button) row.push(addRow(btn));
		}
	}

	const embed = new EmbedBuilder()
		.setTitle(options.embed.title)
		.setDescription(stringify)
		.setColor(options.embed.color)
		.setAuthor({ name: options.message.author.displayName, iconURL: options.message.author.displayAvatarURL() })
		.setFooter({ text: options.embed.footer });
	embed.setTimestamp();

	options.message
		.reply({
			embeds: [embed],
			components: row,
		})
		.then(async (msg) => {
			async function edit() {
				const _embed = new EmbedBuilder()
					.setTitle(options.embed.title ? options.embed.title : 'Calculator')
					.setDescription(stringify)
					.setColor(options.embed.color ? options.embed.color : "Blurple")
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer?.text ? options.embed.footer.text : "M3rcena Development", iconURL: options.embed.footer?.url ? options.embed.footer.url : undefined });
				_embed.setTimestamp();

				msg.edit({
					embeds: [_embed],
					components: row,
				});
			}

			async function lock() {
				const _embed = new EmbedBuilder()
					.setTitle(options.embed.title ? options.embed.title : 'Calculator')
					.setDescription(stringify)
					.setColor(options.embed.color ? options.embed.color : "Blurple")
					.setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
					.setFooter({ text: options.embed.footer?.text ? options.embed.footer.text : "M3rcena Development", iconURL: options.embed.footer?.url ? options.embed.footer.url : undefined });
				_embed.setTimestamp();
				for (let i = 0; i < text.length; i++) {
					if (buttons[cur].length === 5) cur++;
					buttons[cur].push(
						createButton(text[i], true, getRandomString),
					);
					if (i === text.length - 1) {
						for (const btn of buttons) rows.push(addRow(btn));
					}
				}

				msg.edit({
					embeds: [_embed],
					components: rows,
				});
			}

			const calc = msg.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: (fn) => fn.id === options.message.author.id,
			});

			calc.on('collect', async (interaction) => {
				await interaction.deferUpdate();
				if (interaction.customId === 'calAC') {
					str += ' ';
					stringify = '```\n' + str + '\n```';
					edit();
				} else if (interaction.customId === 'calx') {
					str += '*';
					stringify = '```\n' + str + '\n```';
					edit();
				} else if (interaction.customId === 'cal÷') {
					str += '/';
					stringify = '```\n' + str + '\n```';
					edit();
				} else if (interaction.customId === 'cal⌫') {
					if (str === ' ' || str === '' || str === null || str === undefined) {
						return;
					} else {
						str.slice(0, -1);
						stringify = '```\n' + str + '\n```';
						edit();
					}
				} else if (interaction.customId === 'cal=') {
					if (str === ' ' || str === '' || str === null || str === undefined) {
						return;
					} else {
						try {
							str += ' = ' + evaluate(str);
							stringify = '```\n' + str + '\n```';
							edit();
							str = ' ';
							stringify = '```\n' + str + '\n```';
						} catch (e) {
							if (options.invalidQuery === undefined) {
								return;
							} else {
								str = options.invalidQuery;
								stringify = '```\n' + str + '\n```';
								edit();
								str = ' ';
								stringify = '```\n' + str + '\n```';
							}
						}
					}
				} else if (interaction.customId === 'calDC') {
					if (options.disabledQuery === undefined) return;
					str = options.disabledQuery;
					stringify = '```\n' + str + '\n```';
					edit();
					calc.stop();
					lock();
				} else {
					str += interaction.customId.replace('cal', '');
					stringify = '```\n' + str + '\n```';
					edit();
				}
			});
		});
}
