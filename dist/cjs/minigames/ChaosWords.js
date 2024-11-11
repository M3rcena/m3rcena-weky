"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const data = new Set();
const ChaosWords = async (options) => {
    // Check types
    (0, OptionChecking_1.OptionsChecking)(options, "ChaosWords");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");
    if (!interaction.channel)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] ChaosWords Error:") + " No channel found on Interaction.");
    if (!interaction.channel.isSendable())
        throw new Error(chalk_1.default.red("[@m3rcena/weky] ChaosWords Error:") + " Channel is not sendable.");
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    if (data.has(id))
        return;
    data.add(id);
    const ids = (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20);
    let tries = 0;
    const array = [];
    let remaining = 0;
    const guessed = [];
    let words = options.words ? options.words : (0, functions_1.getRandomSentence)(Math.floor(Math.random() * 6) + 2);
    let charGenerated = options.charGenerated ? options.charGenerated : options.words ? options.words.join('').length - 1 : 0;
    if (words.join('').length > charGenerated) {
        charGenerated = words.join('').length - 1;
    }
    ;
    for (let i = 0; i < charGenerated; i++) {
        array.push('abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyz'.length)));
    }
    ;
    words.forEach((e) => {
        array.splice(Math.floor(Math.random() * array.length), 0, e);
    });
    let fields = [];
    if (!options.embed.fields) {
        fields = [
            {
                name: 'Sentence:',
                value: array.join('')
            },
            {
                name: 'Words Founds:',
                value: `${remaining} / ${words.length}`
            },
            {
                name: 'Words Found / Remaining:',
                value: `${guessed.join(', ')}`
            },
            {
                name: 'Words:',
                value: words.join(', ')
            }
        ];
    }
    let embed = new discord_js_1.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.embed.description ?
        options.embed.description.replace('{{time}}', (0, functions_1.convertTime)(options.time ? options.time : 60000)) :
        `You have **${(0, functions_1.convertTime)(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`)
        .setColor(options.embed.color ?? "Blurple")
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.footer) {
        embed.setFooter({
            text: options.embed.footer.text,
            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
        });
    }
    ;
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    ;
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    ;
    if (!options.embed.fields) {
        fields = [
            {
                name: 'Sentence:',
                value: array.join('')
            },
            {
                name: 'Words Founds:',
                value: `${remaining} / ${words.length}`
            },
            {
                name: 'Words Found / Remaining:',
                value: `${guessed.join(', ')}`
            },
            {
                name: 'Words:',
                value: words.join(', ')
            }
        ];
        let _field = [];
        fields.map((field, index) => {
            if (index < 2) {
                _field.push({
                    name: `${field.name}`,
                    value: `${field.value}`
                });
            }
        });
        embed.setFields(_field);
    }
    let btn1 = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setLabel(options.buttonText ? options.buttonText : "Cancel")
        .setCustomId(ids);
    const msg = await interaction.reply({
        embeds: [embed],
        components: [{ type: 1, components: [btn1] }]
    });
    const gameCreatedAt = Date.now();
    const filter = (m) => m.author.id === id;
    let game;
    if (interaction instanceof discord_js_1.Message) {
        game = await interaction.channel.createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        });
    }
    else {
        if (!interaction.channel || !interaction.channel.isTextBased())
            return;
        game = interaction.channel.createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        });
    }
    ;
    if (!interaction.channel || !interaction.channel.isSendable())
        return;
    game.on('collect', async (mes) => {
        if (words === undefined)
            return;
        const condition = words.includes(mes.content.toLowerCase()) &&
            !guessed.includes(mes.content.toLowerCase());
        if (condition) {
            remaining++;
            array.splice(array.indexOf(mes.content.toLowerCase()), 1);
            guessed.push(mes.content.toLowerCase());
            let _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.embed.description ?
                options.embed.description.replace('{{time}}', (0, functions_1.convertTime)(options.time ? options.time : 60000)) :
                `You have **${(0, functions_1.convertTime)(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`)
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
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
            else {
                fields = [
                    {
                        name: 'Sentence:',
                        value: array.join('')
                    },
                    {
                        name: 'Words Founds:',
                        value: `${remaining} / ${words.length}`
                    },
                    {
                        name: 'Words Found / Remaining:',
                        value: `${guessed.join(', ')}`
                    },
                    {
                        name: 'Words:',
                        value: words.join(', ')
                    }
                ];
                let _field = [];
                fields.map((field, index) => {
                    if (index < 3) {
                        _field.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                });
                _embed.setFields(_field);
            }
            ;
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setCustomId(ids);
            await msg.edit({
                embeds: [_embed],
                components: [{ type: 1, components: [btn1] }]
            });
            if (remaining === words.length) {
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                btn1 = new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Danger)
                    .setLabel(options.buttonText ? options.buttonText : "Cancel")
                    .setDisabled()
                    .setCustomId(ids);
                await msg.edit({
                    embeds: [embed],
                    components: [{
                            type: 1,
                            components: [btn1]
                        }]
                });
                const time = (0, functions_1.convertTime)(Date.now() - gameCreatedAt);
                let __embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.winMessage ? options.winMessage.replace('{{time}}', time) : `You found all the words in **${time}**`)
                    .setColor(options.embed.color ?? "Blurple")
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.footer) {
                    __embed.setFooter({
                        text: options.embed.footer.text,
                        iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                    });
                }
                ;
                if (options.embed.author) {
                    __embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                ;
                if (options.embed.fields) {
                    __embed.setFields(options.embed.fields);
                }
                else {
                    fields = [
                        {
                            name: 'Sentence:',
                            value: array.join('')
                        },
                        {
                            name: 'Words Founds:',
                            value: `${remaining} / ${words.length}`
                        },
                        {
                            name: 'Words Found / Remaining:',
                            value: `${guessed.join(', ')}`
                        },
                        {
                            name: 'Words:',
                            value: words.join(', ')
                        }
                    ];
                    let _field = [];
                    fields.map((field, index) => {
                        if (index === 0) {
                            _field.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                        else if (index === 3) {
                            _field.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                    });
                    __embed.setFields(_field);
                }
                ;
                await msg.edit({
                    embeds: [__embed],
                    components: []
                });
                await interaction.channel.send({
                    embeds: [__embed],
                });
                data.delete(id);
                return game.stop();
            }
            const __embed = new discord_js_1.EmbedBuilder()
                .setDescription(`
                    ${options.correctWord ?
                options.correctWord
                    .replace('{{word}}', mes.content.toLowerCase())
                    .replace('{{remaining}}', `${words.length - remaining}`)
                : `GG, **${mes.content.toLowerCase()}** was correct! You have to find **${words.length - remaining}** more word(s).`}
                    `)
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            mes.reply({
                embeds: [__embed],
            });
        }
        else {
            tries++;
            if (tries === (options.maxTries ? options.maxTries : 10)) {
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`)
                    .setColor(options.embed.color ?? "Blurple")
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
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
                else {
                    fields = [
                        {
                            name: 'Sentence:',
                            value: array.join('')
                        },
                        {
                            name: 'Words Founds:',
                            value: `${remaining} / ${words.length}`
                        },
                        {
                            name: 'Words Found / Remaining:',
                            value: `${guessed.join(', ')}`
                        },
                        {
                            name: 'Words:',
                            value: words.join(', ')
                        }
                    ];
                    let _fields = [];
                    fields.map((field, index) => {
                        if (index === 0) {
                            _fields.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                        else if (index === 3) {
                            _fields.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                    });
                    _embed.setFields(_fields);
                }
                ;
                btn1 = new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Danger)
                    .setLabel(options.buttonText ? options.buttonText : "Cancel")
                    .setDisabled()
                    .setCustomId(ids);
                await msg.edit({
                    embeds: [_embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                await interaction.channel.send({
                    embeds: [_embed],
                });
                data.delete(id);
                return game.stop();
            }
            ;
            const _embed = new discord_js_1.EmbedBuilder()
                .setDescription(`
                    ${options.wrongWord ?
                options.wrongWord.replace(`{{remaining_tries}}`, `${options.maxTries ? options.maxTries : 10 - tries}`) :
                `**${mes.content.toLowerCase()}** is not the correct word. You have **${options.maxTries ? options.maxTries : 10 - tries}** tries left.`}
                    `)
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            mes.reply({
                embeds: [_embed],
            });
        }
    });
    game.on('end', (mes, reason) => {
        if (reason === 'time') {
            const _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`)
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
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
            else {
                fields = [
                    {
                        name: 'Sentence:',
                        value: array.join('')
                    },
                    {
                        name: 'Words Founds:',
                        value: `${remaining} / ${words.length}`
                    },
                    {
                        name: 'Words Found / Remaining:',
                        value: `${guessed.join(', ')}`
                    },
                    {
                        name: 'Words:',
                        value: words.join(', ')
                    }
                ];
                let _fields = [];
                fields.map((field, index) => {
                    if (index === 0) {
                        _fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                    else if (index === 3) {
                        _fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                });
                _embed.setFields(_fields);
                let __fields = [];
                fields.map((field, index) => {
                    if (index < 2) {
                        __fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                });
                embed.setFields(__fields);
            }
            ;
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }]
            });
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            data.delete(id);
            interaction.channel.send({
                embeds: [_embed],
            });
        }
    });
    const gameCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
    });
    gameCollector.on('collect', async (button) => {
        await button.deferUpdate();
        btn1 = new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setLabel(options.buttonText ? options.buttonText : "Cancel")
            .setDisabled()
            .setCustomId(ids);
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        else {
            fields = [
                {
                    name: 'Sentence:',
                    value: array.join('')
                },
                {
                    name: 'Words Founds:',
                    value: `${remaining} / ${words.length}`
                },
                {
                    name: 'Words Found / Remaining:',
                    value: `${guessed.join(', ')}`
                },
                {
                    name: 'Words:',
                    value: words.join(', ')
                }
            ];
            let _fields = [];
            fields.map((field, index) => {
                if (index < 2) {
                    _fields.push({
                        name: `${field.name}`,
                        value: `${field.value}`
                    });
                }
            });
            embed.setFields(_fields);
        }
        await msg.edit({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }]
        });
        const _embed = new discord_js_1.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.loseMessage ? options.loseMessage : `The game has been stopped by <@${id}>`)
            .setColor(options.embed.color ?? "Blurple")
            .setTimestamp(options.embed.timestamp ? new Date() : null)
            .setURL(options.embed.url ? options.embed.url : null)
            .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
            .setImage(options.embed.image ? options.embed.image : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
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
        if (!interaction.channel || !interaction.channel.isSendable())
            return;
        await interaction.channel.send({
            embeds: [_embed],
        });
        data.delete(id);
        gameCollector.stop();
        return game.stop();
    });
    (0, functions_1.checkPackageUpdates)("ChaosWords", options.notifyUpdate);
};
exports.default = ChaosWords;
