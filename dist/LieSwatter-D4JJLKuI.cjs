'use strict';

var index = require('./index-B_cCIQRz.js');
var discord_js = require('discord.js');
var fetch = require('node-fetch');
var htmlEntities = require('html-entities');
var _function = require('./function-yZe69etB.js');
var chalk = require('chalk');
require('axios');
require('cheerio');
require('string-width');

/**
 * Lie Swatter game for your bot!
 * @param {object} options - Options for the Lie Swatter game.
 * @param {object} options.message - The message object.
 *
 * @param {object} [options.embed] - Embed options.
 * @param {string} [options.embed.title] - The title of the embed.
 * @param {string} [options.embed.footer] - The footer of the embed.
 * @param {boolean} [options.embed.timestamp] - Whether to show the timestamp on the embed.
 *
 * @param {string} [options.thinkMessage] - The message to show while the bot is thinking.
 * @param {string} [options.winMessage] - The message to show when the user wins.
 * @param {string} [options.loseMessage] - The message to show when the user loses.
 * @param {string} [options.othersMessage] - The message to show when others rather than the message author uses the buttons.
 *
 * @param {object} [options.buttons] - Button options.
 * @param {string} [options.buttons.true] - The text for the true button.
 * @param {string} [options.buttons.lie] - The text for the lie button.
 *
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */
var LieSwatter = (options) => index.__awaiter(void 0, void 0, void 0, function* () {
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
        options.embed.title = 'Lie Swatter | Weky Development';
    }
    if (typeof options.embed.title !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} embed title must be a string.`);
    }
    if (!options.embed.footer) {
        options.embed.footer = '©️ Weky Development';
    }
    if (typeof options.embed.footer !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} embed footer must be a string.`);
    }
    if (!options.embed.timestamp)
        options.embed.timestamp = true;
    if (typeof options.embed.timestamp !== 'boolean') {
        throw new TypeError(`${chalk.red('Weky Error:')} timestamp must be a boolean.`);
    }
    if (!options.thinkMessage)
        options.thinkMessage = 'I am thinking';
    if (typeof options.thinkMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} thinkMessage must be a boolean.`);
    }
    if (!options.winMessage) {
        options.winMessage =
            'GG, It was a **{{answer}}**. You got it correct in **{{time}}**.';
    }
    if (typeof options.winMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} winMessage must be a boolean.`);
    }
    if (!options.loseMessage) {
        options.loseMessage = 'Better luck next time! It was a **{{answer}}**.';
    }
    if (typeof options.loseMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} loseMessage must be a boolean.`);
    }
    if (!options.othersMessage) {
        options.othersMessage = 'Only <@{{author}}> can use the buttons!';
    }
    if (typeof options.othersMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} othersMessage must be a string.`);
    }
    if (!options.buttons)
        options.buttons = {};
    if (typeof options.buttons !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} buttons must be an object.`);
    }
    if (!options.buttons.true)
        options.buttons.true = 'Truth';
    if (typeof options.buttons.true !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} true buttons text must be a string.`);
    }
    if (!options.buttons.lie)
        options.buttons.lie = 'Lie';
    if (typeof options.buttons.lie !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} lie buttons text must be a string.`);
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
    yield think.edit({
        embeds: [
            new discord_js.EmbedBuilder()
                .setTitle(`${options.thinkMessage}...`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer }),
        ],
    });
    const { results } = yield fetch('https://opentdb.com/api.php?amount=1&type=boolean').then((res) => res.json());
    const question = results[0];
    yield think.edit({
        embeds: [
            new discord_js.EmbedBuilder()
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
    }
    else {
        winningID = id2;
        answer = options.buttons.lie;
    }
    let btn1 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(options.buttons.true)
        .setCustomId(id1);
    let btn2 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(options.buttons.lie)
        .setCustomId(id2);
    yield think.edit({
        embeds: [
            new discord_js.EmbedBuilder()
                .setTitle(`${options.thinkMessage}.`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer })
        ],
    });
    const embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(htmlEntities.decode(question.question))
        .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
        .setFooter({ text: options.embed.footer });
    if (options.embed.timestamp) {
        embed.setTimestamp();
    }
    yield think
        .edit({
        embeds: [embed],
        components: [{ type: 1, components: [btn1, btn2] }],
    });
    const gameCreatedAt = Date.now();
    const gameCollector = think.createMessageComponentCollector({
        filter: (fn) => fn,
    });
    gameCollector.on('collect', (button) => index.__awaiter(void 0, void 0, void 0, function* () {
        if (button.user.id !== options.message.author.id) {
            return button.reply({
                content: options.othersMessage.replace('{{author}}', options.message.member.id),
                ephemeral: true,
            });
        }
        yield button.deferUpdate();
        if (button.customId === winningID) {
            btn1 = new discord_js.ButtonBuilder()
                .setLabel(options.buttons.true)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setLabel(options.buttons.lie)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(discord_js.ButtonStyle.Success);
                btn2.setStyle(discord_js.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js.ButtonStyle.Danger);
                btn2.setStyle(discord_js.ButtonStyle.Success);
            }
            think.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }],
            });
            const time = _function.convertTime(Date.now() - gameCreatedAt);
            const winEmbed = new discord_js.EmbedBuilder()
                .setDescription(`${options.winMessage
                .replace('{{answer}}', htmlEntities.decode(answer))
                .replace('{{time}}', time)}`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                winEmbed.setTimestamp();
            }
            options.message.reply({ embeds: [winEmbed] });
        }
        else {
            btn1 = new discord_js.ButtonBuilder()
                .setLabel(options.buttons.true)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setLabel(options.buttons.lie)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(discord_js.ButtonStyle.Success);
                btn2.setStyle(discord_js.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js.ButtonStyle.Danger);
                btn2.setStyle(discord_js.ButtonStyle.Success);
            }
            think.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }],
            });
            const lostEmbed = new discord_js.EmbedBuilder()
                .setDescription(`${options.loseMessage.replace('{{answer}}', htmlEntities.decode(answer))}`)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                lostEmbed.setTimestamp();
            }
            options.message.reply({ embeds: [lostEmbed] });
        }
    }));
});

exports.default = LieSwatter;
