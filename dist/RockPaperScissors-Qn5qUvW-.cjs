'use strict';

var index = require('./index-B_cCIQRz.js');
var discord_js = require('discord.js');
var db = require('quick.db');
var _function = require('./function-yZe69etB.js');
require('chalk');
require('axios');
require('cheerio');
require('node-fetch');
require('string-width');

const data = new Set();
/**
 * Rock Paper Scissors game for your bot!
 * @param {object} options - Options for the Rock Paper Scissors game.
 * @param {object} options.message - The message object.
 * @param {object} options.opponent - The opponent object.
 *
 * @param {object} [options.embed] - Embed options.
 * @param {string} [options.embed.title] - The title of the embed.
 * @param {string} [options.embed.description] - The description of the embed.
 * @param {string} [options.embed.footer] - The footer of the embed.
 * @param {boolean} [options.embed.timestamp] - Whether to show the timestamp on the embed.
 *
 * @param {object} [options.buttons] - Button options.
 * @param {string} [options.buttons.rock] - The text for the rock button.
 * @param {string} [options.buttons.paper] - The text for the paper button.
 * @param {string} [options.buttons.scissors] - The text for the scissors button.
 * @param {string} [options.buttons.accept] - The text for the accept button.
 * @param {string} [options.buttons.deny] - The text for the deny button.
 *
 * @param {number} [options.time] - The time for the game.
 * @param {string} [options.acceptMessage] - The message to show when the opponent accepts the game.
 * @param {string} [options.winMessage] - The message to show when the user wins.
 * @param {string} [options.drawMessage] - The message to show when the game is a draw.
 * @param {string} [options.endMessage] - The message to show when the opponent doesn't answer in time.
 * @param {string} [options.timeEndMessage] - The message to show when both of the users didn't pick something in time.
 * @param {string} [options.cancelMessage] - The message to show when the opponent cancels the game.
 * @param {string} [options.choseMessage] - The message to show when the user picks something.
 * @param {string} [options.noChangeMessage] - The message to show when the user tries to change their selection.
 * @param {string} [options.othersMessage] - The message to show when others rather than the message author uses the buttons.
 *
 * @param {boolean} [options.returnWinner] - Whether to return the winner of the game.
 * @param {string} [options.gameID] - The ID for the game.
 *
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */
var RockPaperScissors = (options) => index.__awaiter(void 0, void 0, void 0, function* () {
    if (!options.message) {
        throw new Error('Weky Error: message argument was not specified.');
    }
    if (typeof options.message !== 'object') {
        throw new TypeError('Weky Error: Invalid Discord Message was provided.');
    }
    if (!options.opponent) {
        throw new Error('Weky Error: opponent argument was not specified.');
    }
    if (typeof options.opponent !== 'object') {
        throw new TypeError('Weky Error: Invalid Discord User was provided.');
    }
    if (!options.embed)
        options.embed = {};
    if (typeof options.embed !== 'object') {
        throw new TypeError('Weky Error: embed must be an object.');
    }
    if (!options.embed.title) {
        options.embed.title = 'Rock Paper Scissors | Weky Development';
    }
    if (typeof options.embed.title !== 'string') {
        throw new TypeError('Weky Error: embed title must be a string.');
    }
    if (!options.embed.description) {
        options.embed.description =
            'Press the button below to choose your element.';
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
    if (!options.embed.timestamp) {
        options.embed.timestamp = true;
    }
    if (typeof options.embed.timestamp !== 'boolean') {
        throw new TypeError('Weky Error: setTimestamp must be a boolean.');
    }
    if (!options.buttons)
        options.buttons = {};
    if (typeof options.buttons !== 'object') {
        throw new TypeError('Weky Error: buttons must be an object.');
    }
    if (!options.buttons.rock) {
        options.buttons.rock = 'Rock';
    }
    if (typeof options.buttons.rock !== 'string') {
        throw new Error('Weky Error: rock button text must be a string.');
    }
    if (!options.buttons.paper) {
        options.buttons.paper = 'Paper';
    }
    if (typeof options.buttons.paper !== 'string') {
        throw new Error('Weky Error: paper button text must be a string.');
    }
    if (!options.buttons.scissors) {
        options.buttons.scissors = 'Scissors';
    }
    if (typeof options.buttons.scissors !== 'string') {
        throw new Error('Weky Error: scissors button text must be a string.');
    }
    if (!options.buttons.accept) {
        options.buttons.accept = 'Accept';
    }
    if (typeof options.buttons.accept !== 'string') {
        throw new Error('Weky Error: accept button text must be a string.');
    }
    if (!options.buttons.deny) {
        options.buttons.deny = 'Deny';
    }
    if (typeof options.buttons.deny !== 'string') {
        throw new Error('Weky Error: deny button text must be a string.');
    }
    if (!options.time)
        options.time = 60000;
    if (parseInt(options.time) < 10000) {
        throw new Error('Weky Error: time argument must be greater than 10 Seconds (in ms i.e. 10000).');
    }
    if (typeof options.time !== 'number') {
        throw new TypeError('Weky Error: time must be a number.');
    }
    if (!options.acceptMessage) {
        options.acceptMessage =
            '<@{{challenger}}> has challenged <@{{opponent}}> for a game of Rock Paper and Scissors!';
    }
    if (typeof options.acceptMessage !== 'string') {
        throw new Error('Weky Error: acceptMessage must be a string.');
    }
    if (!options.winMessage) {
        options.winMessage = 'GG, <@{{winner}}> won!';
    }
    if (typeof options.winMessage !== 'string') {
        throw new TypeError('Weky Error: winMessage must be a string.');
    }
    if (!options.drawMessage) {
        options.drawMessage = 'This game is deadlock!';
    }
    if (typeof options.drawMessage !== 'string') {
        throw new TypeError('Weky Error: drawMessage must be a string.');
    }
    if (!options.endMessage) {
        options.endMessage =
            '<@{{opponent}}> didn\'t answer in time. So, I dropped the game!';
    }
    if (typeof options.endMessage !== 'string') {
        throw new TypeError('Weky Error: endMessage must be a string.');
    }
    if (!options.timeEndMessage) {
        options.timeEndMessage =
            'Both of you didn\'t pick something in time. So, I dropped the game!';
    }
    if (typeof options.timeEndMessage !== 'string') {
        throw new TypeError('Weky Error: timeEndMessage must be a string.');
    }
    if (!options.cancelMessage) {
        options.cancelMessage =
            '<@{{opponent}}> refused to have a game of Rock Paper and Scissors with you!';
    }
    if (typeof options.cancelMessage !== 'string') {
        throw new TypeError('Weky Error: cancelMessage must be a string.');
    }
    if (!options.choseMessage) {
        options.choseMessage = 'You picked {{emoji}}';
    }
    if (typeof options.choseMessage !== 'string') {
        throw new TypeError('Weky Error: choseMessage must be a string.');
    }
    if (!options.noChangeMessage) {
        options.noChangeMessage = 'You cannot change your selection!';
    }
    if (typeof options.noChangeMessage !== 'string') {
        throw new TypeError('Weky Error: noChangeMessage must be a string.');
    }
    if (!options.othersMessage) {
        options.othersMessage = 'Only {{author}} can use the buttons!';
    }
    if (typeof options.othersMessage !== 'string') {
        throw new TypeError('Weky Error: othersMessage must be a string.');
    }
    if (!options.returnWinner)
        options.returnWinner = false;
    if (typeof options.returnWinner !== 'boolean') {
        throw new TypeError('Weky Error: buttonText must be a boolean.');
    }
    if (data.has(options.message.author.id) || data.has(options.opponent.id)) {
        return;
    }
    data.add(options.message.author.id);
    data.add(options.opponent.id);
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
    const id3 = _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20) +
        '-' +
        _function.getRandomString(20);
    if (options.opponent.bot ||
        options.opponent.id === options.message.author.id) {
        return;
    }
    let acceptbutton = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Success)
        .setLabel(options.buttons.accept)
        .setCustomId('accept');
    let denybutton = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Danger)
        .setLabel(options.buttons.deny)
        .setCustomId('deny');
    let component = new discord_js.ActionRowBuilder().addComponents([
        acceptbutton,
        denybutton,
    ]);
    const embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.acceptMessage
        .replace('{{challenger}}', options.message.author.id)
        .replace('{{opponent}}', options.opponent.id))
        .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
        .setFooter({ text: options.embed.footer });
    if (options.embed.timestamp) {
        embed.setTimestamp();
    }
    const question = yield options.message.reply({
        embeds: [embed],
        components: [component],
    });
    const Collector = yield question.createMessageComponentCollector({
        filter: (fn) => fn,
        time: options.time,
    });
    Collector.on('collect', (_btn) => index.__awaiter(void 0, void 0, void 0, function* () {
        if (_btn.member.id !== options.opponent.id) {
            return _btn.reply({
                content: options.othersMessage.replace('{{author}}', `<@${options.opponent.id}>`),
                ephemeral: true,
            });
        }
        yield _btn.deferUpdate();
        if (_btn.customId === 'deny') {
            acceptbutton = new discord_js.ButtonBuilder()
                .setDisabled()
                .setStyle(discord_js.ButtonStyle.Success)
                .setLabel(options.buttons.accept)
                .setCustomId('accept');
            denybutton = new discord_js.ButtonBuilder()
                .setDisabled()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttons.deny)
                .setCustomId('deny');
            component = new discord_js.ActionRowBuilder().addComponents([
                acceptbutton,
                denybutton,
            ]);
            const emd = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.cancelMessage.replace('{{opponent}}', options.opponent.id))
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                emd.setTimestamp();
            }
            Collector.stop();
            data.delete(options.opponent.id);
            data.delete(options.message.author.id);
            return question.edit({
                embeds: [emd],
                components: [component],
            });
        }
        else if (_btn.customId === 'accept') {
            Collector.stop();
            let scissorsbtn = new discord_js.ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons.scissors)
                .setStyle(discord_js.ButtonStyle.Primary)
                .setEmoji('✌️');
            let rockbtn = new discord_js.ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons.rock)
                .setStyle(discord_js.ButtonStyle.Primary)
                .setEmoji('✊');
            let paperbtn = new discord_js.ButtonBuilder()
                .setCustomId(id3)
                .setLabel(options.buttons.paper)
                .setStyle(discord_js.ButtonStyle.Primary)
                .setEmoji('✋');
            let row = new discord_js.ActionRowBuilder()
                .addComponents(rockbtn)
                .addComponents(paperbtn)
                .addComponents(scissorsbtn);
            const emd = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.embed.description)
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                emd.setTimestamp();
            }
            question.edit({
                embeds: [emd],
                components: [row],
            });
            let opponentChose;
            let opponentChoice;
            let challengerChose;
            let challengerChoice;
            const collector = question.createMessageComponentCollector({
                filter: (fn) => fn,
                time: options.time,
            });
            collector.on('collect', (button) => index.__awaiter(void 0, void 0, void 0, function* () {
                if (button.member.id !== options.opponent.id &&
                    button.member.id !== options.message.author.id) {
                    return button.reply({
                        content: options.othersMessage.replace('{{author}}', `<@${options.message.author.id}> and <@${options.opponent.id}>`),
                        ephemeral: true,
                    });
                }
                if (button.member.id === options.message.author.id) {
                    challengerChose = true;
                    if (typeof challengerChoice !== 'undefined') {
                        return button.reply({
                            content: options.noChangeMessage,
                            ephemeral: true,
                        });
                    }
                    if (button.customId === id2) {
                        challengerChoice = '✊';
                        button.reply({
                            content: options.choseMessage.replace('{{emoji}}', '✊'),
                            ephemeral: true,
                        });
                        if (challengerChose && opponentChose === true) {
                            let result;
                            if (challengerChoice === opponentChoice) {
                                result = options.drawMessage;
                            }
                            else if ((opponentChoice === '✌️' && challengerChoice === '✋') ||
                                (opponentChoice === '✊' && challengerChoice === '✌️') ||
                                (opponentChoice === '✋' && challengerChoice === '✊')) {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.opponent.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.opponent.id);
                            }
                            else {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.message.author.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.message.author.id);
                            }
                            scissorsbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id1)
                                .setLabel(options.buttons.scissors)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✌️');
                            rockbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id2)
                                .setLabel(options.buttons.rock)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✊');
                            paperbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id3)
                                .setLabel(options.buttons.paper)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✋');
                            row = new discord_js.ActionRowBuilder()
                                .addComponents(rockbtn)
                                .addComponents(paperbtn)
                                .addComponents(scissorsbtn);
                            const _embed = new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                .setFooter({ text: options.embed.footer })
                                .setDescription(result)
                                .addFields({
                                name: options.message.author.username,
                                value: challengerChoice,
                                inline: true,
                            }, {
                                name: options.opponent.username,
                                value: opponentChoice,
                                inline: true,
                            });
                            if (options.embed.timestamp) {
                                _embed.setTimestamp();
                            }
                            collector.stop();
                            data.delete(options.opponent.id);
                            data.delete(options.message.author.id);
                            return question.edit({
                                embeds: [_embed],
                                components: [row],
                            });
                        }
                    }
                    else if (button.customId === id3) {
                        challengerChoice = '✋';
                        button.reply({
                            content: options.choseMessage.replace('{{emoji}}', '✋'),
                            ephemeral: true,
                        });
                        if (challengerChose && opponentChose === true) {
                            let result;
                            if (challengerChoice === opponentChoice) {
                                result = options.drawMessage;
                            }
                            else if ((opponentChoice === '✌️' && challengerChoice === '✋') ||
                                (opponentChoice === '✊' && challengerChoice === '✌️') ||
                                (opponentChoice === '✋' && challengerChoice === '✊')) {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.opponent.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.opponent.id);
                            }
                            else {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.message.author.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.message.author.id);
                            }
                            scissorsbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id1)
                                .setLabel(options.buttons.scissors)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✌️');
                            rockbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id2)
                                .setLabel(options.buttons.rock)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✊');
                            paperbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id3)
                                .setLabel(options.buttons.paper)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✋');
                            row = new discord_js.ActionRowBuilder()
                                .addComponents(rockbtn)
                                .addComponents(paperbtn)
                                .addComponents(scissorsbtn);
                            const _embed = new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setDescription(result)
                                .addFields({
                                name: options.message.author.username,
                                value: challengerChoice,
                                inline: true,
                            }, {
                                name: options.opponent.username,
                                value: opponentChoice,
                                inline: true,
                            })
                                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                .setFooter({ text: options.embed.footer });
                            if (options.embed.timestamp) {
                                _embed.setTimestamp();
                            }
                            collector.stop();
                            data.delete(options.opponent.id);
                            data.delete(options.message.author.id);
                            return question.edit({
                                embeds: [_embed],
                                components: [row],
                            });
                        }
                    }
                    else if (button.customId === id1) {
                        challengerChoice = '✌️';
                        button.reply({
                            content: options.choseMessage.replace('{{emoji}}', '✌️'),
                            ephemeral: true,
                        });
                        if (challengerChose && opponentChose === true) {
                            let result;
                            if (challengerChoice === opponentChoice) {
                                result = options.drawMessage;
                            }
                            else if ((opponentChoice === '✌️' && challengerChoice === '✋') ||
                                (opponentChoice === '✊' && challengerChoice === '✌️') ||
                                (opponentChoice === '✋' && challengerChoice === '✊')) {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.opponent.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.opponent.id);
                            }
                            else {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.message.author.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.message.author.id);
                            }
                            scissorsbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id1)
                                .setLabel(options.buttons.scissors)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✌️');
                            rockbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id2)
                                .setLabel(options.buttons.rock)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✊');
                            paperbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id3)
                                .setLabel(options.buttons.paper)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✋');
                            row = new discord_js.ActionRowBuilder()
                                .addComponents(rockbtn)
                                .addComponents(paperbtn)
                                .addComponents(scissorsbtn);
                            const _embed = new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setDescription(result)
                                .addFields({
                                name: options.message.author.username,
                                value: challengerChoice,
                                inline: true,
                            }, {
                                name: options.opponent.username,
                                value: opponentChoice,
                                inline: true,
                            })
                                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                .setFooter({ text: options.embed.footer });
                            if (options.embed.timestamp) {
                                _embed.setTimestamp();
                            }
                            collector.stop();
                            data.delete(options.opponent.id);
                            data.delete(options.message.author.id);
                            return question.edit({
                                embeds: [_embed],
                                components: [row],
                            });
                        }
                    }
                }
                else if (button.member.id === options.opponent.id) {
                    opponentChose = true;
                    if (typeof opponentChoice !== 'undefined') {
                        return button.reply({
                            content: options.noChangeMessage,
                            ephemeral: true,
                        });
                    }
                    if (button.customId === id2) {
                        opponentChoice = '✊';
                        button.reply({
                            content: options.choseMessage.replace('{{emoji}}', '✊'),
                            ephemeral: true,
                        });
                        if (challengerChose && opponentChose === true) {
                            let result;
                            if (challengerChoice === opponentChoice) {
                                result = options.drawMessage;
                            }
                            else if ((opponentChoice === '✌️' && challengerChoice === '✋') ||
                                (opponentChoice === '✊' && challengerChoice === '✌️') ||
                                (opponentChoice === '✋' && challengerChoice === '✊')) {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.opponent.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.opponent.id);
                            }
                            else {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.message.author.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.message.author.id);
                            }
                            scissorsbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id1)
                                .setLabel(options.buttons.scissors)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✌️');
                            rockbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id2)
                                .setLabel(options.buttons.rock)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✊');
                            paperbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id3)
                                .setLabel(options.buttons.paper)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✋');
                            row = new discord_js.ActionRowBuilder()
                                .addComponents(rockbtn)
                                .addComponents(paperbtn)
                                .addComponents(scissorsbtn);
                            const _embed = new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setDescription(result)
                                .addFields({
                                name: options.message.author.username,
                                value: challengerChoice,
                                inline: true,
                            }, {
                                name: options.opponent.username,
                                value: opponentChoice,
                                inline: true,
                            })
                                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                .setFooter({ text: options.embed.footer });
                            if (options.embed.timestamp) {
                                _embed.setTimestamp();
                            }
                            collector.stop();
                            data.delete(options.opponent.id);
                            data.delete(options.message.author.id);
                            return question.edit({
                                embeds: [_embed],
                                components: [row],
                            });
                        }
                    }
                    else if (button.customId === id3) {
                        opponentChoice = '✋';
                        button.reply({
                            content: options.choseMessage.replace('{{emoji}}', '✋'),
                            ephemeral: true,
                        });
                        if (challengerChose && opponentChose === true) {
                            let result;
                            if (challengerChoice === opponentChoice) {
                                result = options.drawMessage;
                            }
                            else if ((opponentChoice === '✌️' && challengerChoice === '✋') ||
                                (opponentChoice === '✊' && challengerChoice === '✌️') ||
                                (opponentChoice === '✋' && challengerChoice === '✊')) {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.opponent.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.opponent.id);
                            }
                            else {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.message.author.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.message.author.id);
                            }
                            scissorsbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id1)
                                .setLabel(options.buttons.scissors)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✌️');
                            rockbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id2)
                                .setLabel(options.buttons.rock)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✊');
                            paperbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id3)
                                .setLabel(options.buttons.paper)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✋');
                            row = new discord_js.ActionRowBuilder()
                                .addComponents(rockbtn)
                                .addComponents(paperbtn)
                                .addComponents(scissorsbtn);
                            const _embed = new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setDescription(result)
                                .addFields({
                                name: options.message.author.username,
                                value: challengerChoice,
                                inline: true,
                            }, {
                                name: options.opponent.username,
                                value: opponentChoice,
                                inline: true,
                            })
                                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                .setFooter({ text: options.embed.footer });
                            if (options.embed.timestamp) {
                                _embed.setTimestamp();
                            }
                            collector.stop();
                            data.delete(options.opponent.id);
                            data.delete(options.message.author.id);
                            return question.edit({
                                embeds: [_embed],
                                components: [row],
                            });
                        }
                    }
                    else if (button.customId === id1) {
                        opponentChoice = '✌️';
                        button.reply({
                            content: options.choseMessage.replace('{{emoji}}', '✌️'),
                            ephemeral: true,
                        });
                        if (challengerChose && opponentChose === true) {
                            let result;
                            if (challengerChoice === opponentChoice) {
                                result = options.drawMessage;
                            }
                            else if ((opponentChoice === '✌️' && challengerChoice === '✋') ||
                                (opponentChoice === '✊' && challengerChoice === '✌️') ||
                                (opponentChoice === '✋' && challengerChoice === '✊')) {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.opponent.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.opponent.id);
                            }
                            else {
                                if (options.returnWinner) {
                                    if (!options.gameID) {
                                        throw new Error('Weky Error: gameID argument was not specified.');
                                    }
                                    if (typeof options.gameID !== 'string') {
                                        throw new TypeError('Weky Error: gameID must be a string.');
                                    }
                                    db.set(`RockPaperScissors_${options.message.guild.id}_${options.gameID}`, options.message.author.id);
                                }
                                result = options.winMessage.replace('{{winner}}', options.message.author.id);
                            }
                            scissorsbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id1)
                                .setLabel(options.buttons.scissors)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✌️');
                            rockbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id2)
                                .setLabel(options.buttons.rock)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✊');
                            paperbtn = new discord_js.ButtonBuilder()
                                .setDisabled()
                                .setCustomId(id3)
                                .setLabel(options.buttons.paper)
                                .setStyle(discord_js.ButtonStyle.Primary)
                                .setEmoji('✋');
                            row = new discord_js.ActionRowBuilder()
                                .addComponents(rockbtn)
                                .addComponents(paperbtn)
                                .addComponents(scissorsbtn);
                            const _embed = new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setDescription(result)
                                .addFields({
                                name: options.message.author.username,
                                value: challengerChoice,
                                inline: true,
                            }, {
                                name: options.opponent.username,
                                value: opponentChoice,
                                inline: true,
                            })
                                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                .setFooter({ text: options.embed.footer });
                            if (options.embed.timestamp) {
                                _embed.setTimestamp();
                            }
                            collector.stop();
                            data.delete(options.opponent.id);
                            data.delete(options.message.author.id);
                            return question.edit({
                                embeds: [_embed],
                                components: [row],
                            });
                        }
                    }
                }
            }));
            collector.on('end', (collected, reason) => index.__awaiter(void 0, void 0, void 0, function* () {
                if (reason === 'time') {
                    scissorsbtn = new discord_js.ButtonBuilder()
                        .setDisabled()
                        .setCustomId(id1)
                        .setLabel(options.buttons.scissors)
                        .setStyle(discord_js.ButtonStyle.Primary)
                        .setEmoji('✌️');
                    rockbtn = new discord_js.ButtonBuilder()
                        .setDisabled()
                        .setCustomId(id2)
                        .setLabel(options.buttons.rock)
                        .setStyle(discord_js.ButtonStyle.Primary)
                        .setEmoji('✊');
                    paperbtn = new discord_js.ButtonBuilder()
                        .setDisabled()
                        .setCustomId(id3)
                        .setLabel(options.buttons.paper)
                        .setStyle(discord_js.ButtonStyle.Primary)
                        .setEmoji('✋');
                    row = new discord_js.ActionRowBuilder()
                        .addComponents(rockbtn)
                        .addComponents(paperbtn)
                        .addComponents(scissorsbtn);
                    const _embed = new discord_js.EmbedBuilder()
                        .setTitle(options.embed.title)
                        .setDescription(options.timeEndMessage)
                        .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                        .setFooter({ text: options.embed.footer });
                    if (options.embed.timestamp) {
                        _embed.setTimestamp();
                    }
                    data.delete(options.opponent.id);
                    data.delete(options.message.author.id);
                    return question.edit({
                        embeds: [_embed],
                        components: [row],
                    });
                }
            }));
        }
    }));
    Collector.on('end', (msg, reason) => index.__awaiter(void 0, void 0, void 0, function* () {
        if (reason === 'time') {
            acceptbutton = new discord_js.ButtonBuilder()
                .setDisabled()
                .setStyle(discord_js.ButtonStyle.Success)
                .setLabel(options.buttons.accept)
                .setCustomId('accept');
            denybutton = new discord_js.ButtonBuilder()
                .setDisabled()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttons.deny)
                .setCustomId('deny');
            component = new discord_js.ActionRowBuilder().addComponents([
                acceptbutton,
                denybutton,
            ]);
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.endMessage.replace('{{opponent}}', options.opponent.id))
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                _embed.setTimestamp();
            }
            data.delete(options.opponent.id);
            data.delete(options.message.author.id);
            return question.edit({
                embeds: [_embed],
                components: [component],
            });
        }
    }));
});

exports.default = RockPaperScissors;
