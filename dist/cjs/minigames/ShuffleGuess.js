"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const data = new Set();
const ShuffleGuess = async (options) => {
    // Options Check
    (0, OptionChecking_1.OptionsChecking)(options, "ShuffleGuess");
    if (!options.interaction.inGuild())
        return;
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk_1.default.red("[@m3rcena/weky] FastType Error:") + " No channel provided in interaction.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    if (!options.word) {
        options.word = (0, functions_1.getRandomSentence)(1)[0];
    }
    ;
    if (options.time < 10000) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] ShuffleGuess Error:") + " Time must be greater than 10 Seconds (in ms i.e. 10000)");
    }
    ;
    if (options.time && typeof options.time !== 'number') {
        throw new TypeError(chalk_1.default.red("[@m3rcena/weky] ShuffleGuess Error:") + " Time must be a number.");
    }
    ;
    if (!options.buttons) {
        options.buttons = {
            reshuffle: "Reshuffle",
            cancel: "Cancel"
        };
    }
    ;
    if (!options.buttons.reshuffle) {
        options.buttons.reshuffle = "Reshuffle";
    }
    ;
    if (!options.buttons.cancel) {
        options.buttons.cancel = "Cancel";
    }
    ;
    if (data.has(id))
        return;
    data.add(id);
    const id1 = (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20);
    const id2 = (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20);
    const word = (0, functions_1.shuffleString)(options.word.toString());
    let disbut = new discord_js_1.ButtonBuilder()
        .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setCustomId(id1);
    let cancel = new discord_js_1.ButtonBuilder()
        .setLabel(options.buttons.cancel ?? 'Cancel')
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setCustomId(id2);
    let emd = new discord_js_1.EmbedBuilder()
        .setTitle(options.embed.title ?? "Shuffle Guess")
        .setColor(options.embed.color ?? "Blurple")
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    })
        .setDescription(options.startMessage ?
        options.startMessage
            .replace('{{word}}', word)
            .replace('{{time}}', (0, functions_1.convertTime)(options.time ?? 60000)) :
        `The word is \`${word}\` and you have ${(0, functions_1.convertTime)(options.time ?? 60000)} to guess it!`);
    if (options.embed.footer) {
        emd.setFooter({
            text: options.embed.footer.text,
            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
        });
    }
    ;
    if (options.embed.author) {
        emd.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    ;
    if (options.embed.fields) {
        emd.setFields(options.embed.fields);
    }
    ;
    const embed = await options.interaction.reply({
        embeds: [emd],
        components: [
            {
                type: 1,
                components: [disbut, cancel],
            },
        ],
    });
    const gameCreatedAt = Date.now();
    const gameCollector = options.interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === id,
        time: options.time ?? 60000,
    });
    gameCollector.on('collect', async (msg) => {
        if (msg.content.toLowerCase() === options.word.toString()) {
            gameCollector.stop();
            data.delete(id);
            disbut = new discord_js_1.ButtonBuilder()
                .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setCustomId(id1)
                .setDisabled();
            cancel = new discord_js_1.ButtonBuilder()
                .setLabel(options.buttons.cancel ?? 'Cancel')
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setCustomId(id2)
                .setDisabled();
            const time = (0, functions_1.convertTime)(Date.now() - gameCreatedAt);
            let _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title ?? "Shuffle Guess")
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            })
                .setDescription(options.winMessage ?
                options.winMessage
                    .replace('{{word}}', options.word.toString())
                    .replace('{{time}}', time) :
                `You have guessed the word \`${options.word.toString()}\` in ${time}!`);
            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            }
            ;
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            ;
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            ;
            msg.reply({ embeds: [_embed] });
            return embed.edit({
                embeds: [emd],
                components: [
                    {
                        type: 1,
                        components: [disbut, cancel],
                    },
                ],
            });
        }
        else {
            const _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title ?? "Shuffle Guess")
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            })
                .setDescription(options.incorrectMessage ?
                options.incorrectMessage :
                `No ${msg.author.toString()}! The word isn\'t \`${msg.content.toLowerCase()}\``);
            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            }
            ;
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            ;
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            ;
            msg.reply({ embeds: [_embed] }).then((m) => setTimeout(() => {
                if (m.deletable) {
                    m.delete();
                }
                ;
                if (msg.deletable) {
                    msg.delete();
                }
                ;
            }, 3000));
        }
    });
    const GameCollector = embed.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        filter: (fn) => fn.customId === id1 || fn.customId === id2,
    });
    GameCollector.on('collect', async (btn) => {
        if (btn.user.id !== id) {
            return btn.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `Only <@${id}> can use the buttons!`,
            });
        }
        ;
        await btn.deferUpdate();
        if (btn.customId === id1) {
            let _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title ?? "Shuffle Guess")
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            })
                .setDescription(options.startMessage ?
                options.startMessage
                    .replace('{{word}}', (0, functions_1.shuffleString)(options.word.toString()))
                    .replace('{{time}}', (0, functions_1.convertTime)(options.time ?? 60000)) :
                `The word is \`${word}\` and you have ${(0, functions_1.convertTime)(options.time ?? 60000)} to guess it!`);
            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            }
            ;
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            ;
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            ;
            return embed.edit({
                embeds: [_embed],
                components: [
                    {
                        type: 1,
                        components: [disbut, cancel],
                    },
                ],
            });
        }
        else if (btn.customId === id2) {
            gameCollector.stop();
            data.delete(id);
            disbut = new discord_js_1.ButtonBuilder()
                .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setCustomId(id1)
                .setDisabled();
            cancel = new discord_js_1.ButtonBuilder()
                .setLabel(options.buttons.cancel ?? 'Cancel')
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setCustomId(id2)
                .setDisabled();
            let _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title ?? "Shuffle Guess")
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            })
                .setDescription(options.loseMessage ?
                options.loseMessage.replace('{{answer}}', options.word.toString()) :
                `The word was \`${options.word.toString()}\``);
            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            }
            ;
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            ;
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            ;
            return embed.edit({
                embeds: [_embed],
                components: [
                    {
                        type: 1,
                        components: [disbut, cancel],
                    },
                ],
            });
        }
        ;
    });
    gameCollector.on('end', async (_collected, reason) => {
        if (reason === 'time') {
            disbut = new discord_js_1.ButtonBuilder()
                .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setCustomId(id1)
                .setDisabled();
            cancel = new discord_js_1.ButtonBuilder()
                .setLabel(options.buttons.cancel ?? 'Cancel')
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setCustomId(id2)
                .setDisabled();
            let _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title ?? "Shuffle Guess")
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            })
                .setDescription(options.loseMessage ?
                options.loseMessage.replace('{{answer}}', options.word.toString()) :
                `The word was \`${options.word.toString()}\``);
            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            }
            ;
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            ;
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            ;
            await interaction.reply({ embeds: [_embed] });
            data.delete(id);
            return embed.edit({
                embeds: [emd],
                components: [
                    {
                        type: 1,
                        components: [disbut, cancel],
                    },
                ],
            });
        }
        ;
    });
};
exports.default = ShuffleGuess;
