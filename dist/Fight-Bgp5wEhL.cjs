'use strict';

var index = require('./index-B_cCIQRz.js');
var discord_js = require('discord.js');
var db = require('quick.db');
var _function = require('./function-yZe69etB.js');
var chalk = require('chalk');
require('axios');
require('cheerio');
require('node-fetch');
require('string-width');

const data = new Set();
/**
 * Make a Fight game for your bot
 * @param {object} options - Options for the Fight game
 * @param {object} options.message - The message object
 * @param {object} options.opponent - The opponent object
 *
 * @param {object} [options.embed] - The embed object
 * @param {string} [options.embed.title] - The title of the embed
 * @param {string} [options.embed.footer] - The footer of the embed
 * @param {boolean} [options.embed.timestamp] - The timestamp of the embed
 *
 * @param {object} [options.buttons] - The buttons object
 * @param {string} [options.buttons.hit] - The hit button text
 * @param {string} [options.buttons.heal] - The heal button text
 * @param {string} [options.buttons.cancel] - The cancel button text
 * @param {string} [options.buttons.accept] - The accept button text
 * @param {string} [options.buttons.deny] - The deny button text
 *
 * @param {string} [options.acceptMessage] - The accept message
 * @param {string} [options.winMessage] - The win message
 * @param {string} [options.endMessage] - The end message
 * @param {string} [options.cancelMessage] - The cancel message
 * @param {string} [options.fightMessage] - The fight message
 * @param {string} [options.othersMessage] - The others message
 * @param {string} [options.opponentsTurnMessage] - The opponents turn message
 *
 * @param {string} [options.highHealthMessage] - The high health message
 * @param {string} [options.lowHealthMessage] - The low health message
 *
 * @param {boolean} [options.returnWinner] - If the winner should be returned
 *
 * @param {string} [options.gameID] - The game ID
 *
 * @param {number} [options.dmgMin] - The minimum damage
 * @param {number} [options.dmgMax] - The maximum damage
 * @param {number} [options.healMin] - The minimum heal
 * @param {number} [options.healMax] - The maximum heal
 *
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */
var Fight = (options) => index.__awaiter(void 0, void 0, void 0, function* () {
    if (!options.message) {
        throw new Error(`${chalk.red('Weky Error:')} message argument was not specified.`);
    }
    if (typeof options.message !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} Invalid Discord Message was provided.`);
    }
    if (!options.opponent) {
        throw new Error(`${chalk.red('Weky Error:')} opponent argument was not specified.`);
    }
    if (typeof options.opponent !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} Invalid Discord User was provided.`);
    }
    if (!options.embed)
        options.embed = {};
    if (typeof options.embed !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} embed must be an object.`);
    }
    if (!options.embed.title) {
        options.embed.title = 'Fight | Weky Development';
    }
    if (typeof options.embed.title !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} embed title must be a string.`);
    }
    if (!options.embed.footer) {
        options.embed.footer = '©️ Weky Development';
    }
    if (typeof options.embed.footer !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} footer must be a string.`);
    }
    if (!options.embed.timestamp) {
        options.embed.timestamp = true;
    }
    if (typeof options.embed.timestamp !== 'boolean') {
        throw new TypeError(`${chalk.red('Weky Error:')} timestamp must be a boolean.`);
    }
    if (!options.buttons)
        options.buttons = {};
    if (typeof options.buttons !== 'object') {
        throw new TypeError(`${chalk.red('Weky Error:')} buttons must be an object.`);
    }
    if (!options.buttons.hit) {
        options.buttons.hit = 'Hit';
    }
    if (typeof options.buttons.hit !== 'string') {
        throw new Error(`${chalk.red('Weky Error:')} hit button text must be a string.`);
    }
    if (!options.buttons.heal) {
        options.buttons.heal = 'Heal';
    }
    if (typeof options.buttons.heal !== 'string') {
        throw new Error(`${chalk.red('Weky Error:')} heal button text must be a string.`);
    }
    if (!options.buttons.cancel) {
        options.buttons.cancel = 'Stop';
    }
    if (typeof options.buttons.cancel !== 'string') {
        throw new Error(`${chalk.red('Weky Error:')} cancel button text must be a string.`);
    }
    if (!options.buttons.accept) {
        options.buttons.accept = 'Accept';
    }
    if (typeof options.buttons.accept !== 'string') {
        throw new Error(`${chalk.red('Weky Error:')} accept button text must be a string.`);
    }
    if (!options.buttons.deny) {
        options.buttons.deny = 'Deny';
    }
    if (typeof options.buttons.deny !== 'string') {
        throw new Error(`${chalk.red('Weky Error:')} deny button text must be a string.`);
    }
    if (!options.acceptMessage) {
        options.acceptMessage =
            '<@{{challenger}}> has challenged <@{{opponent}}> for a fight!';
    }
    if (typeof options.acceptMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} acceptMessage must be a string.`);
    }
    if (!options.winMessage) {
        options.winMessage = 'GG, <@{{winner}}> won the fight!';
    }
    if (typeof options.winMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} winMessage must be a string.`);
    }
    if (!options.endMessage) {
        options.endMessage =
            '<@{{opponent}}> didn\'t answer in time. So, I dropped the game!';
    }
    if (typeof options.endMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} endMessage must be a string.`);
    }
    if (!options.cancelMessage) {
        options.cancelMessage = '<@{{opponent}}> refused to have a fight with you!';
    }
    if (typeof options.cancelMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} cancelMessage must be a string.`);
    }
    if (!options.fightMessage) {
        options.fightMessage = '{{player}} you go first!';
    }
    if (typeof options.fightMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} fightMessage must be a string.`);
    }
    if (!options.othersMessage) {
        options.othersMessage = 'Only {{author}} can use the buttons!';
    }
    if (typeof options.othersMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} othersMessage must be a string.`);
    }
    if (!options.opponentsTurnMessage) {
        options.opponentsTurnMessage = 'Please wait for your opponents move!';
    }
    if (typeof options.opponentsTurnMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} opponentsTurnMessage must be a string.`);
    }
    if (!options.highHealthMessage) {
        options.highHealthMessage = 'You cannot heal if your HP is above 80!';
    }
    if (typeof options.highHealthMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} highHealthMessage must be a string.`);
    }
    if (!options.lowHealthMessage) {
        options.lowHealthMessage =
            'You cannot cancel the fight if your HP is below 50!';
    }
    if (typeof options.lowHealthMessage !== 'string') {
        throw new TypeError(`${chalk.red('Weky Error:')} lowHealthMessage must be a string.`);
    }
    if (!options.returnWinner)
        options.returnWinner = false;
    if (typeof options.returnWinner !== 'boolean') {
        throw new TypeError(`${chalk.red('Weky Error:')} returnWinner must be a boolean.`);
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
    const oppenent = options.opponent;
    const challenger = options.message.author;
    if (oppenent.bot || oppenent.id === challenger.id)
        return;
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
        .replace('{{challenger}}', challenger.id)
        .replace('{{opponent}}', oppenent.id))
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
        time: 60000,
    });
    Collector.on('collect', (_btn) => index.__awaiter(void 0, void 0, void 0, function* () {
        if (_btn.member.id !== oppenent.id) {
            return _btn.reply({
                content: options.othersMessage.replace('{{author}}', `<@${oppenent.id}>`),
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
                .setDescription(options.cancelMessage.replace('{{opponent}}', oppenent.id))
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
            const challengerHealth = 100;
            const oppenentHealth = 100;
            const challengerLastAttack = 'heal';
            const oppenentLastAttack = 'heal';
            const gameData = [
                {
                    member: challenger,
                    health: challengerHealth,
                    lastAttack: challengerLastAttack,
                },
                {
                    member: oppenent,
                    health: oppenentHealth,
                    lastAttack: oppenentLastAttack,
                },
            ];
            let player = Math.floor(Math.random() * gameData.length);
            let btn1 = new discord_js.ButtonBuilder()
                .setLabel(options.buttons.hit)
                .setCustomId(id1)
                .setStyle(discord_js.ButtonStyle.Danger);
            let btn2 = new discord_js.ButtonBuilder()
                .setLabel(options.buttons.heal)
                .setCustomId(id2)
                .setStyle(discord_js.ButtonStyle.Success);
            let btn3 = new discord_js.ButtonBuilder()
                .setLabel(options.buttons.cancel)
                .setCustomId(id3)
                .setStyle(discord_js.ButtonStyle.Secondary);
            let row = new discord_js.ActionRowBuilder()
                .addComponents(btn1)
                .addComponents(btn2)
                .addComponents(btn3);
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.fightMessage.replace('{{player}}', gameData[player].member))
                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                .setFooter({ text: options.embed.footer });
            if (options.embed.timestamp) {
                _embed.setTimestamp();
            }
            question.edit({
                embeds: [_embed],
                components: [row],
            });
            const checkHealth = (member) => {
                if (gameData[member].health <= 0)
                    return true;
                else
                    return false;
            };
            const gameCollector = question.createMessageComponentCollector((fn) => fn);
            gameCollector.on('collect', (msg) => index.__awaiter(void 0, void 0, void 0, function* () {
                if (gameData.some((x) => x.member.id === msg.member.id)) {
                    if (!checkHealth(player)) {
                        const btn = msg.member;
                        if (msg.customId === id1) {
                            if (btn.id !== gameData[player].member.id) {
                                return msg.reply({
                                    content: options.opponentsTurnMessage,
                                    ephemeral: true,
                                });
                            }
                            yield msg.deferUpdate();
                            let randNumb = Math.floor(Math.random() * parseInt(options.dmgMax)) +
                                parseInt(options.dmgMin) ||
                                Math.floor(Math.random() * 15) + 4;
                            const tempPlayer = (player + 1) % 2;
                            if (gameData[tempPlayer].lastAttack === 'heal') {
                                randNumb = Math.floor(randNumb / 2);
                            }
                            gameData[tempPlayer].health -= randNumb;
                            gameData[player].lastAttack = 'attack';
                            if (gameData[player].member.id == options.message.author.id) {
                                const __embed = new discord_js.EmbedBuilder()
                                    .setTitle(options.embed.title)
                                    .setDescription(`(:punch:) ${gameData[player].member.username} — ${gameData[player].health} HP - **versus** - **${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP`)
                                    .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                    .setFooter({ text: options.embed.footer });
                                if (options.embed.timestamp) {
                                    __embed.setTimestamp();
                                }
                                question.edit({
                                    embeds: [__embed],
                                    components: [row],
                                });
                            }
                            else if (gameData[player].member.id == options.opponent.id) {
                                const __embed = new discord_js.EmbedBuilder()
                                    .setTitle(options.embed.title)
                                    .setDescription(`**${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP - **versus** - ${gameData[player].member.username} — ${gameData[player].health} HP (:punch:)`)
                                    .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                    .setFooter({ text: options.embed.footer });
                                if (options.embed.timestamp) {
                                    __embed.setTimestamp();
                                }
                                question.edit({
                                    embeds: [__embed],
                                    components: [row],
                                });
                            }
                            player = (player + 1) % 2;
                        }
                        else if (msg.customId === id2) {
                            if (btn.id !== gameData[player].member.id) {
                                return msg.reply({
                                    content: options.opponentsTurnMessage,
                                    ephemeral: true,
                                });
                            }
                            if (gameData[player].health > 80) {
                                return msg.reply({
                                    content: options.highHealthMessage,
                                    ephemeral: true,
                                });
                            }
                            else {
                                yield msg.deferUpdate();
                                let randNumb = Math.floor(Math.random() * parseInt(options.healMax)) +
                                    parseInt(options.healMin) ||
                                    Math.floor(Math.random() * 10) + 4;
                                const tempPlayer = (player + 1) % 2;
                                if (gameData[tempPlayer].lastAttack === 'heal') {
                                    randNumb = Math.floor(randNumb / 2);
                                }
                                gameData[player].health += randNumb;
                                gameData[player].lastAttack = 'heal';
                                if (gameData[player].member.id == options.message.author.id) {
                                    const __embed = new discord_js.EmbedBuilder()
                                        .setTitle(options.embed.title)
                                        .setDescription(`(:hearts:) ${gameData[player].member.username} — ${gameData[player].health} HP - **versus** - **${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP`)
                                        .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                        .setFooter({ text: options.embed.footer });
                                    if (options.embed.timestamp) {
                                        __embed.setTimestamp();
                                    }
                                    question.edit({
                                        embeds: [__embed],
                                        components: [row],
                                    });
                                }
                                else if (gameData[player].member.id == options.opponent.id) {
                                    const __embed = new discord_js.EmbedBuilder()
                                        .setTitle(options.embed.title)
                                        .setDescription(`**${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP - **versus** - ${gameData[player].member.username} — ${gameData[player].health} HP (:hearts:)`)
                                        .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                        .setFooter({ text: options.embed.footer });
                                    if (options.embed.timestamp) {
                                        __embed.setTimestamp();
                                    }
                                    question.edit({
                                        embeds: [__embed],
                                        components: [row],
                                    });
                                }
                                player = (player + 1) % 2;
                            }
                        }
                        else if (msg.customId === id3) {
                            if (btn.id !== gameData[player].member.id) {
                                return msg.reply({
                                    content: options.opponentsTurnMessage,
                                    ephemeral: true,
                                });
                            }
                            if (gameData[player].health < 50) {
                                return msg.reply({
                                    content: options.lowHealthMessage,
                                    ephemeral: true,
                                });
                            }
                            else {
                                yield msg.deferUpdate();
                                btn1 = new discord_js.ButtonBuilder()
                                    .setLabel(options.buttons.hit)
                                    .setCustomId(id1)
                                    .setStyle(discord_js.ButtonStyle.Danger)
                                    .setDisabled();
                                btn2 = new discord_js.ButtonBuilder()
                                    .setLabel(options.buttons.heal)
                                    .setCustomId(id2)
                                    .setStyle(discord_js.ButtonStyle.Success)
                                    .setDisabled();
                                btn3 = new discord_js.ButtonBuilder()
                                    .setLabel(options.buttons.cancel)
                                    .setCustomId(id3)
                                    .setStyle(discord_js.ButtonStyle.Secondary)
                                    .setDisabled();
                                row = new discord_js.ActionRowBuilder()
                                    .addComponents(btn1)
                                    .addComponents(btn2)
                                    .addComponents(btn3);
                                gameCollector.stop();
                                data.delete(options.opponent.id);
                                data.delete(options.message.author.id);
                                const __embed = new discord_js.EmbedBuilder()
                                    .setTitle(options.embed.title)
                                    .setDescription(options.cancelMessage.replace('{{opponent}}', gameData[player].member.id))
                                    .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                    .setFooter({ text: options.embed.footer });
                                if (options.embed.timestamp) {
                                    __embed.setTimestamp();
                                }
                                question.edit({
                                    embeds: [__embed],
                                    components: [row],
                                });
                            }
                        }
                        if (checkHealth(player)) {
                            btn1 = new discord_js.ButtonBuilder()
                                .setLabel(options.buttons.hit)
                                .setCustomId(id1)
                                .setStyle(discord_js.ButtonStyle.Danger)
                                .setDisabled();
                            btn2 = new discord_js.ButtonBuilder()
                                .setLabel(options.buttons.heal)
                                .setCustomId(id2)
                                .setStyle(discord_js.ButtonStyle.Success)
                                .setDisabled();
                            btn3 = new discord_js.ButtonBuilder()
                                .setLabel(options.buttons.cancel)
                                .setCustomId(id3)
                                .setStyle(discord_js.ButtonStyle.Secondary)
                                .setDisabled();
                            row = new discord_js.ActionRowBuilder()
                                .addComponents(btn1)
                                .addComponents(btn2)
                                .addComponents(btn3);
                            gameCollector.stop();
                            data.delete(options.opponent.id);
                            data.delete(options.message.author.id);
                            const tempPlayer = (player + 1) % 2;
                            const __embed = new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setDescription(options.winMessage.replace('{{winner}}', gameData[tempPlayer].member.id))
                                .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                                .setFooter({ text: options.embed.footer });
                            if (options.embed.timestamp) {
                                __embed.setTimestamp();
                            }
                            if (options.returnWinner) {
                                if (!options.gameID) {
                                    throw new Error(`${chalk.red('Weky Error:')} gameID argument was not specified.`);
                                }
                                if (typeof options.gameID !== 'string') {
                                    throw new TypeError(`${chalk.red('Weky Error:')} gameID must be a string.`);
                                }
                                db.set(`Fight_${options.message.guild.id}_${options.gameID}`, gameData[tempPlayer].member.id);
                            }
                            question.edit({
                                embeds: [__embed],
                                components: [row],
                            });
                        }
                    }
                    else {
                        btn1 = new discord_js.ButtonBuilder()
                            .setLabel(options.buttons.hit)
                            .setCustomId(id1)
                            .setStyle(discord_js.ButtonStyle.Danger)
                            .setDisabled();
                        btn2 = new discord_js.ButtonBuilder()
                            .setLabel(options.buttons.heal)
                            .setCustomId(id2)
                            .setStyle(discord_js.ButtonStyle.Success)
                            .setDisabled();
                        btn3 = new discord_js.ButtonBuilder()
                            .setLabel(options.buttons.cancel)
                            .setCustomId(id3)
                            .setStyle(discord_js.ButtonStyle.Secondary)
                            .setDisabled();
                        gameCollector.stop();
                        data.delete(options.opponent.id);
                        data.delete(options.message.author.id);
                        const tempPlayer = (player + 1) % 2;
                        const __embed = new discord_js.EmbedBuilder()
                            .setTitle(options.embed.title)
                            .setDescription(options.winMessage.replace('{{winner}}', gameData[tempPlayer].member.id))
                            .setAuthor({ name: options.message.author.username, iconURL: options.message.author.displayAvatarURL() })
                            .setFooter({ text: options.embed.footer });
                        if (options.embed.timestamp) {
                            __embed.setTimestamp();
                        }
                        if (options.returnWinner) {
                            if (!options.gameID) {
                                throw new Error(`${chalk.red('Weky Error:')} gameID argument was not specified.`);
                            }
                            if (typeof options.gameID !== 'string') {
                                throw new TypeError(`${chalk.red('Weky Error:')} gameID must be a string.`);
                            }
                            db.set(`Fight_${options.message.guild.id}_${options.gameID}`, gameData[tempPlayer].member.id);
                        }
                        question.edit({
                            embeds: [__embed],
                            components: [row],
                        });
                    }
                }
                else {
                    return msg.reply({
                        content: options.othersMessage.replace('{{author}}', `<@${challenger.id}> és <@${oppenent.id}>`),
                        ephemeral: true,
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
                .setDescription(options.endMessage.replace('{{opponent}}', oppenent.id))
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

exports.default = Fight;
