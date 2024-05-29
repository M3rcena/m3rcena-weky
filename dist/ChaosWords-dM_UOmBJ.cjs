'use strict';

var index = require('./index-B_cCIQRz.js');
var discord_js = require('discord.js');
var _function = require('./function-yZe69etB.js');
var chalk = require('chalk');
require('axios');
require('cheerio');
require('node-fetch');
require('string-width');

const data = new Set();
/**
 * Play Chaos Words with someone on discord!
 * @param {object} options - Options for the Chaos Words
 * @param {object} options.message - The message object
 *
 * @param {object} [options.embed] - The embed object
 * @param {string} [options.embed.title] - The title of the embed
 * @param {string} [options.embed.description] - The description of the embed
 * @param {string} [options.embed.field1] - The field1 of the embed
 * @param {string} [options.embed.field2] - The field2 of the embed
 * @param {string} [options.embed.field3] - The field3 of the embed
 * @param {string} [options.embed.field4] - The field4 of the embed
 * @param {string} [options.embed.color] - The color of the embed
 * @param {string} [options.embed.footer] - The footer of the embed
 * @param {boolean} [options.embed.timestamp] - The timestamp of the embed
 *
 * @param {string} [options.winMessage] - The win message
 * @param {string} [options.loseMessage] - The lose message
 * @param {string} [options.wrongWordMessage] - The wrong word message
 * @param {string} [options.correctWordMessage] - The correct word message
 *
 * @param {number} [options.time] - The time of the game
 *
 * @param {array} [options.words] - The words of the game
 * @param {number} [options.charGenerated] - The char generated of the game
 *
 * @param {number} [options.maxTries] - The max tries of the game
 *
 * @param {string} [options.othersMessage] - The others message
 * @param {string} [options.buttonText] - The button text
 *
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */
var ChaosWords = (options) => index.__awaiter(void 0, void 0, void 0, function* () {
    if (!options.message) {
        throw new Error(`${chalk.red('Weky Error:')} message argument was not specified.`);
    }
    if (typeof options.message !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} Invalid Discord Message was provided.`);
    }
    if (!options.embed)
        options.embed = {};
    if (typeof options.embed !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} embed must be an object.`);
    }
    if (!options.embed.title) {
        options.embed.title = 'Chaos Words | Weky Development';
    }
    if (typeof options.embed.title !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} embed title must be a string.`);
    }
    if (!options.embed.description) {
        options.embed.description =
            'You have **{{time}}** to find the hidden words in the below sentence.';
    }
    if (typeof options.embed.description !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} embed description must be a string.`);
    }
    if (!options.embed.field1)
        options.embed.field1 = 'Sentence:';
    if (typeof options.embed.field1 !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} field1 must be a string.`);
    }
    if (!options.embed.field2) {
        options.embed.field2 = 'Words Found/Remaining Words:';
    }
    if (typeof options.embed.field2 !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} field2 must be a string.`);
    }
    if (!options.embed.field3)
        options.embed.field3 = 'Words found:';
    if (typeof options.embed.field3 !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} field3 must be a string.`);
    }
    if (!options.embed.field4)
        options.embed.field4 = 'Words:';
    if (typeof options.embed.field4 !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} field4 must be a string.`);
    }
    if (!options.embed.color)
        options.embed.color = _function.randomHexColor();
    if (typeof options.embed.color !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} color must be a string.`);
    }
    if (!options.embed.footer) {
        options.embed.footer = '©️ Weky Development';
    }
    if (typeof options.embed.footer !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} footer must be a string.`);
    }
    if (!options.embed.timestamp)
        options.embed.timestamp = true;
    if (typeof options.embed.timestamp !== 'boolean') {
        throw new TypeError(`${chalk.red('Weky Error:')} timestamp must be a boolean.`);
    }
    if (!options.winMessage) {
        options.winMessage = 'GG, You won! You made it in **{{time}}**.';
    }
    if (typeof options.winMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} winMessage must be a string.`);
    }
    if (!options.loseMessage)
        options.loseMessage = 'Better luck next time!';
    if (typeof options.loseMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} loseMessage must be a string.`);
    }
    if (!options.wrongWordMessage) {
        options.wrongWordMessage =
            'Wrong Guess! You have **{{remaining_tries}}** tries left.';
    }
    if (typeof options.wrongWordMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} wrongWordMessage must be a string.`);
    }
    if (!options.correctWordMessage) {
        options.correctWordMessage =
            'GG, **{{word}}** was correct! You have to find **{{remaining}}** more word(s).';
    }
    if (typeof options.correctWordMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} correctWordMessage must be a string.`);
    }
    if (!options.time)
        options.time = 60000;
    if (parseInt(options.time) < 10000) {
        throw new TypeError(`${chalk.red('Weky Error:')} time must be greater than 10000.`);
    }
    if (typeof options.time !== 'number') {
        throw new TypeError(`${chalk.red('Weky Error:')} time must be a number.`);
    }
    if (!options.words) {
        options.words = _function.getRandomSentence(Math.floor(Math.random() * 6) + 2);
    }
    if (typeof options.words !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} words must be an array.`);
    }
    if (!options.charGenerated) {
        options.charGenerated = options.words.join('').length - 1;
    }
    if (typeof options.charGenerated !== 'number') {
        throw new TypeError(`${chalk.red('Weky Error:')} charGenerated must be a number.`);
    }
    if (!options.maxTries)
        options.maxTries = 10;
    if (typeof options.maxTries !== 'number') {
        throw new TypeError(`${chalk.red('Weky Error:')} maxTries must be a number.`);
    }
    if (!options.othersMessage) {
        options.othersMessage = 'Only <@{{author}}> can use the buttons!';
    }
    if (typeof options.othersMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} othersMessage must be a string.`);
    }
    if (!options.buttonText)
        options.buttonText = 'Cancel';
    if (typeof options.buttonText !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} buttonText must be a string.`);
    }
    if (data.has(options.message.author.id))
        return;
    data.add(options.message.author.id);
    const id = _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20);
    let tries = 0;
    const array = [];
    let remaining = 0;
    const guessed = [];
    if (options.words.join('').length > options.charGenerated) {
        options.charGenerated = options.words.join('').length - 1;
    }
    for (let i = 0; i < options.charGenerated; i++) {
        array.push('abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyz'.length)));
    }
    options.words.forEach((e) => {
        array.splice(Math.floor(Math.random() * array.length), 0, e);
    });
    const arr = array.join('');
    const embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.embed.description.replace('{{time}}', _function.convertTime(options.time)))
        .addFields({ name: options.embed.field1, value: array.join('') })
        .addFields({ name: options.embed.field2, value: `0/${options.words.length}` })
        .setFooter({ text: options.embed.footer })
        .setColor(options.embed.color);
    if (options.embed.timestamp) {
        embed.setTimestamp();
    }
    let btn1 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Danger)
        .setLabel(options.buttonText)
        .setCustomId(id);
    const mes = yield options.message.reply({
        embeds: [embed],
        components: [{ type: 1, components: [btn1] }],
    });
    const gameCreatedAt = Date.now();
    const filter = (m) => m.author.id === options.message.author.id;
    const game = yield options.message.channel.createMessageCollector({
        filter,
        time: options.time,
    });
    game.on('collect', (msg) => index.__awaiter(void 0, void 0, void 0, function* () {
        const condition = options.words.includes(msg.content.toLowerCase()) &&
            !guessed.includes(msg.content.toLowerCase());
        if (condition) {
            remaining++;
            array.splice(array.indexOf(msg.content.toLowerCase()), 1);
            guessed.push(msg.content.toLowerCase());
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.embed.description.replace('{{time}}', _function.convertTime(options.time)))
                .addFields({ name: options.embed.field1, value: array.join('') })
                .addFields({ name: options.embed.field3, value: `${guessed.join(', ')}` })
                .addFields({ name: options.embed.field2, value: `${remaining}/${options.words.length}` })
                .setFooter({ text: options.embed.footer })
                .setColor(options.embed.color);
            if (options.embed.timestamp) {
                _embed.setTimestamp();
            }
            btn1 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttonText)
                .setCustomId(id);
            mes.edit({
                embeds: [_embed],
                components: [
                    {
                        type: 1,
                        components: [btn1],
                    },
                ],
            });
            if (remaining === options.words.length) {
                btn1 = new discord_js.ButtonBuilder()
                    .setStyle(discord_js.ButtonStyle.Danger)
                    .setLabel(options.buttonText)
                    .setDisabled()
                    .setCustomId(id);
                mes.edit({
                    embeds: [embed],
                    components: [
                        {
                            type: 1,
                            components: [btn1],
                        },
                    ],
                });
                const time = _function.convertTime(Date.now() - gameCreatedAt);
                const __embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .addFields({ name: options.embed.field1, value: arr })
                    .setDescription(options.winMessage.replace('{{time}}', time))
                    .addFields({ name: options.embed.field4, value: `${options.words.join(', ')}` })
                    .setFooter({ text: options.embed.footer })
                    .setColor(options.embed.color);
                if (options.embed.timestamp) {
                    __embed.setTimestamp();
                }
                options.message.reply({
                    embeds: [__embed],
                });
                data.delete(options.message.author.id);
                return game.stop();
            }
            const __embed = new discord_js.EmbedBuilder()
                .setDescription(`${options.correctWordMessage
                .replace('{{word}}', msg.content.toLowerCase())
                .replace('{{remaining}}', options.words.length - remaining)}`)
                .setColor(options.embed.color)
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                __embed.setTimestamp();
            }
            options.message.reply({
                embeds: [__embed],
            });
        }
        else {
            tries++;
            if (tries === options.maxTries) {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage)
                    .addFields({ name: options.embed.field1, value: arr })
                    .addFields({ name: options.embed.field4, value: `${options.words.join(', ')}` })
                    .setFooter({ text: options.embed.footer })
                    .setColor(options.embed.color);
                if (options.embed.timestamp) {
                    _embed.setTimestamp();
                }
                btn1 = new discord_js.ButtonBuilder()
                    .setStyle(discord_js.ButtonStyle.Danger)
                    .setLabel(options.buttonText)
                    .setDisabled()
                    .setCustomId(id);
                mes.edit({
                    embeds: [embed],
                    components: [
                        {
                            type: 1,
                            components: [btn1],
                        },
                    ],
                });
                options.message.reply({
                    embeds: [_embed],
                });
                data.delete(options.message.author.id);
                return game.stop();
            }
            const _embed = new discord_js.EmbedBuilder()
                .setDescription(`${options.wrongWordMessage.replace('{{remaining_tries}}', `${options.maxTries - tries}`)}`)
                .setColor(options.embed.color)
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                _embed.setTimestamp();
            }
            options.message.reply({
                embeds: [_embed],
            });
        }
    }));
    game.on('end', (msg, reason) => {
        if (reason === 'time') {
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.loseMessage)
                .addFields({ name: options.embed.field1, value: arr })
                .addFields({ name: options.embed.field4, value: `${options.words.join(', ')}` })
                .setFooter({ text: options.embed.footer })
                .setColor(options.embed.color);
            if (options.embed.timestamp) {
                _embed.setTimestamp();
            }
            btn1 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttonText)
                .setDisabled()
                .setCustomId(id);
            mes.edit({
                embeds: [embed],
                components: [
                    {
                        type: 1,
                        components: [btn1],
                    },
                ],
            });
            data.delete(options.message.author.id);
            options.message.reply({
                embeds: [_embed],
            });
        }
    });
    const gameCollector = mes.createMessageComponentCollector({
        filter: (fn) => fn,
    });
    gameCollector.on('collect', (button) => index.__awaiter(void 0, void 0, void 0, function* () {
        if (button.user.id !== options.message.member.id) {
            return button.reply({
                content: options.othersMessage.replace('{{author}}', options.message.member.id),
                ephemeral: true,
            });
        }
        yield button.deferUpdate();
        btn1 = new discord_js.ButtonBuilder()
            .setStyle(discord_js.ButtonStyle.Danger)
            .setLabel(options.buttonText)
            .setDisabled()
            .setCustomId(id);
        mes.edit({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [btn1],
                },
            ],
        });
        const _embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.loseMessage)
            .addFields({ name: options.embed.field1, value: arr })
            .addFields({ name: options.embed.field4, value: `${options.words.join(', ')}` })
            .setFooter({ text: options.embed.footer })
            .setColor(options.embed.color);
        if (options.embed.timestamp) {
            _embed.setTimestamp();
        }
        options.message.reply({
            embeds: [_embed],
        });
        data.delete(options.message.author.id);
        gameCollector.stop();
        return game.stop();
    }));
});

exports.default = ChaosWords;
