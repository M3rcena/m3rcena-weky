'use strict';

var index = require('./index-B_cCIQRz.js');
var mathjs = require('mathjs');
var discord_js = require('discord.js');
var _function = require('./function-yZe69etB.js');
var chalk = require('chalk');
require('axios');
require('cheerio');
require('node-fetch');
require('string-width');

/**
 * Make a calculator for your bot
 * @param {object} options - Options for the calculator
 * @param {object} options.message - The message object
 * @param {object} options.interaction - The interaction object
 *
 * @param {object} [options.embed] - The embed object
 * @param {string} [options.embed.title] - The title of the embed
 * @param {string} [options.embed.color] - The color of the embed
 * @param {string} [options.embed.footer] - The footer of the embed
 * @param {boolean} [options.embed.timestamp] - The timestamp of the embed
 *
 * @param {string} [options.disabledQuery] - The disabled query message
 * @param {string} [options.invalidQuery] - The invalid query message
 * @param {string} [options.othersMessage] - The others message
 *
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */
var Calculator = (options) => index.__awaiter(void 0, void 0, void 0, function* () {
    if (!options.message && !options.interaction) {
        throw new TypeError(`${chalk.red('Weky Error:')} message or interaction must be provided.`);
    }
    if (options.message && options.interaction) {
        throw new TypeError(`${chalk.red('Weky Error:')} message and interaction cannot be provided at the same time.`);
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
    if (!options.embed)
        options.embed = {};
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
    if (!options.embed.footer) {
        options.embed.footer = '©️ M3rcena Development';
    }
    if (typeof options.embed.footer !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} footer must be a string.`);
    }
    if (!options.embed.timestamp)
        options.embed.timestamp = true;
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
    const row = [];
    const rows = [];
    const button = new Array([], [], [], [], []);
    const buttons = new Array([], [], [], [], []);
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
        if (button[current].length === 5)
            current++;
        button[current].push(_function.createButton(text[i], false, _function.getRandomString));
        if (i === text.length - 1) {
            for (const btn of button)
                row.push(_function.addRow(btn));
        }
    }
    const embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(stringify)
        .setColor(options.embed.color)
        .setAuthor({ name: options.message.author.author, iconURL: options.message.author.displayAvatarURL() })
        .setFooter({ text: options.embed.footer });
    embed.setTimestamp();
    options.message
        .reply({
        embeds: [embed],
        components: row,
    })
        .then((msg) => index.__awaiter(void 0, void 0, void 0, function* () {
        function edit() {
            return index.__awaiter(this, void 0, void 0, function* () {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(stringify)
                    .setColor(options.embed.color)
                    .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                    .setFooter({ text: options.embed.footer });
                _embed.setTimestamp();
                msg.edit({
                    embeds: [_embed],
                    components: row,
                });
            });
        }
        function lock() {
            return index.__awaiter(this, void 0, void 0, function* () {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(stringify)
                    .setColor(options.embed.color)
                    .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                    .setFooter({ text: options.embed.footer });
                _embed.setTimestamp();
                for (let i = 0; i < text.length; i++) {
                    if (buttons[cur].length === 5)
                        cur++;
                    buttons[cur].push(_function.createButton(text[i], true, _function.getRandomString));
                    if (i === text.length - 1) {
                        for (const btn of buttons)
                            rows.push(_function.addRow(btn));
                    }
                }
                msg.edit({
                    embeds: [_embed],
                    components: rows,
                });
            });
        }
        const calc = msg.createMessageComponentCollector({
            filter: (fn) => fn,
        });
        calc.on('collect', (btn) => index.__awaiter(void 0, void 0, void 0, function* () {
            if (btn.user.id !== options.message.author.id) {
                return btn.reply({
                    content: options.othersMessage.replace('{{author}}', options.message.author.id),
                    ephemeral: true,
                });
            }
            yield btn.deferUpdate();
            if (btn.customId === 'calAC') {
                str += ' ';
                stringify = '```\n' + str + '\n```';
                edit();
            }
            else if (btn.customId === 'calx') {
                str += '*';
                stringify = '```\n' + str + '\n```';
                edit();
            }
            else if (btn.customId === 'cal÷') {
                str += '/';
                stringify = '```\n' + str + '\n```';
                edit();
            }
            else if (btn.customId === 'cal⌫') {
                if (str === ' ' || str === '' || str === null || str === undefined) {
                    return;
                }
                else {
                    str = str.split('');
                    str.pop();
                    str = str.join('');
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
            }
            else if (btn.customId === 'cal=') {
                if (str === ' ' || str === '' || str === null || str === undefined) {
                    return;
                }
                else {
                    try {
                        str += ' = ' + mathjs.evaluate(str);
                        stringify = '```\n' + str + '\n```';
                        edit();
                        str = ' ';
                        stringify = '```\n' + str + '\n```';
                    }
                    catch (e) {
                        str = options.invalidQuery;
                        stringify = '```\n' + str + '\n```';
                        edit();
                        str = ' ';
                        stringify = '```\n' + str + '\n```';
                    }
                }
            }
            else if (btn.customId === 'calDC') {
                str = options.disabledQuery;
                stringify = '```\n' + str + '\n```';
                edit();
                calc.stop();
                lock();
            }
            else {
                str += btn.customId.replace('cal', '');
                stringify = '```\n' + str + '\n```';
                edit();
            }
        }));
    }));
});

exports.default = Calculator;
