'use strict';

var index = require('./index-B_cCIQRz.js');
var discord_js = require('discord.js');
var fetch = require('node-fetch');
var htmlEntities = require('html-entities');
var _function = require('./function-yZe69etB.js');
require('chalk');
require('axios');
require('cheerio');
require('string-width');

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
var WouldYouRather = (options) => index.__awaiter(void 0, void 0, void 0, function* () {
    if (!options.message) {
        throw new Error('Weky Error: message argument was not specified.');
    }
    if (typeof options.message !== 'object') {
        throw new TypeError('Weky Error: Invalid Discord Message was provided.');
    }
    if (!options.embed)
        options.embed = {};
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
    if (!options.embed.timestamp)
        options.embed.timestamp = true;
    if (typeof options.embed.timestamp !== 'boolean') {
        throw new TypeError('Weky Error: timestamp must be a boolean.');
    }
    if (!options.thinkMessage)
        options.thinkMessage = 'I am thinking';
    if (typeof options.thinkMessage !== 'string') {
        throw new TypeError('Weky Error: thinkMessage must be a boolean.');
    }
    if (!options.othersMessage) {
        options.othersMessage = 'Only <@{{author}}> can use the buttons!';
    }
    if (typeof options.othersMessage !== 'string') {
        throw new TypeError('Weky Error: othersMessage must be a string.');
    }
    if (!options.buttons)
        options.buttons = {};
    if (typeof options.buttons !== 'object') {
        throw new TypeError('Weky Error: buttons must be an object.');
    }
    if (!options.buttons.optionA)
        options.buttons.optionA = 'Option A';
    if (typeof options.buttons.optionA !== 'string') {
        throw new TypeError('Weky Error: button must be a string.');
    }
    if (!options.buttons.optionB)
        options.buttons.optionB = 'Option B';
    if (typeof options.buttons.optionB !== 'string') {
        throw new TypeError('Weky Error: button must be a string.');
    }
    const id1 = _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20);
    const id2 = _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20);
    const think = yield options.message.reply({
        embeds: [
            new discord_js.EmbedBuilder()
                .setTitle(`${options.thinkMessage}.`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer }),
        ],
    });
    yield think.edit({
        embeds: [
            new discord_js.EmbedBuilder()
                .setTitle(`${options.thinkMessage}..`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer }),
        ],
    });
    const response = yield fetch('https://fun-api.sujalgoel.engineer/wyr').then((res) => res.json());
    const data = response.data;
    yield think.edit({
        embeds: [
            new discord_js.EmbedBuilder()
                .setTitle(`${options.thinkMessage}...`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer }),
        ],
    });
    const res = {
        questions: [data.option_1.option, data.option_2.option],
        percentage: {
            1: ((parseInt(data.option_1.votes) /
                (parseInt(data.option_1.votes) + parseInt(data.option_2.votes))) *
                100).toFixed(2) + '%',
            2: ((parseInt(data.option_2.votes) /
                (parseInt(data.option_1.votes) + parseInt(data.option_2.votes))) *
                100).toFixed(2) + '%',
        },
    };
    yield think.edit({
        embeds: [
            new discord_js.EmbedBuilder()
                .setTitle(`${options.thinkMessage}..`)
                .setColor(options.embed.color),
        ],
    });
    let btn = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(`${options.buttons.optionA}`)
        .setCustomId(id1);
    let btn2 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(`${options.buttons.optionB}`)
        .setCustomId(id2);
    yield think.edit({
        embeds: [
            new discord_js.EmbedBuilder()
                .setTitle(`${options.thinkMessage}.`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer }),
        ],
    });
    const embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(`**A)** ${htmlEntities.decode(res.questions[0])} \n**B)** ${htmlEntities.decode(res.questions[1])}`)
        .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
        .setFooter({ text: options.embed.footer });
    if (options.embed.timestamp) {
        embed.setTimestamp();
    }
    yield think.edit({
        embeds: [embed],
        components: [{ type: 1, components: [btn, btn2] }],
    });
    const gameCollector = think.createMessageComponentCollector({
        filter: (fn) => fn,
    });
    gameCollector.on('collect', (wyr) => index.__awaiter(void 0, void 0, void 0, function* () {
        if (wyr.user.id !== options.message.author.id) {
            return wyr.reply({
                content: options.othersMessage.replace('{{author}}', options.message.member.id),
                ephemeral: true,
            });
        }
        yield wyr.deferUpdate();
        if (wyr.customId === id1) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Primary)
                .setLabel(`${options.buttons.optionA}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons.optionB}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(`**A) ${htmlEntities.decode(res.questions[0])} (${res.percentage['1']})** \nB) ${htmlEntities.decode(res.questions[1])} (${res.percentage['2']})`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                _embed.setTimestamp();
            }
            yield wyr.editReply({
                embeds: [_embed],
                components: [{ type: 1, components: [btn, btn2] }],
            });
        }
        else if (wyr.customId === id2) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons.optionA}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Primary)
                .setLabel(`${options.buttons.optionB}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(`A) ${htmlEntities.decode(res.questions[0])} (${res.percentage['1']}) \n**B) ${htmlEntities.decode(res.questions[1])} (${res.percentage['2']})**`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                _embed.setTimestamp();
            }
            yield wyr.editReply({
                embeds: [_embed],
                components: [{ type: 1, components: [btn, btn2] }],
            });
        }
    }));
});

exports.default = WouldYouRather;
