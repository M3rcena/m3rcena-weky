"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const db = new Map();
const data = new Set();
const currentGames = new Object();
const GuessTheNumber = async (options) => {
    (0, OptionChecking_1.OptionsChecking)(options, 'GuessTheNumber');
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    if (!interaction.guild) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " Guild is not available in this interaction.");
    }
    ;
    if (!interaction.channel || !interaction.channel.isSendable()) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " Channel is not available in this interaction.");
    }
    if (!options.ongoingMessage) {
        options.ongoingMessage = "A game is already running in <#{{channel}}>. Try again later!";
    }
    ;
    if (typeof options.ongoingMessage !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " ongoingMessage must be a string.");
    }
    ;
    if (!options.returnWinner) {
        options.returnWinner = false;
    }
    ;
    if (typeof options.returnWinner !== 'boolean') {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " returnWinner must be a boolean.");
    }
    ;
    if (!options.winMessage)
        options.winMessage = {};
    let winMessage = options.winMessage;
    if (typeof winMessage !== 'object') {
        throw new TypeError('Weky Error: winMessage must be an object.');
    }
    let winMessagePublicGame;
    if (!options.winMessage.publicGame) {
        winMessagePublicGame =
            'GG, The number which I guessed was **{{number}}**. <@{{winner}}> made it in **{{time}}**.\n\n__**Stats of the game:**__\n**Duration**: {{time}}\n**Number of participants**: {{totalparticipants}} Participants\n**Participants**: {{participants}}';
    }
    else {
        winMessagePublicGame = options.winMessage.publicGame;
    }
    if (typeof winMessagePublicGame !== 'string') {
        throw new TypeError('Weky Error: winMessage must be a string.');
    }
    let winMessagePrivateGame;
    if (!options.winMessage.privateGame) {
        winMessagePrivateGame =
            'GG, The number which I guessed was **{{number}}**. You made it in **{{time}}**.';
    }
    else {
        winMessagePrivateGame = options.winMessage.privateGame;
    }
    if (typeof winMessagePrivateGame !== 'string') {
        throw new TypeError('Weky Error: winMessage must be a string.');
    }
    const ids = (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20);
    let number;
    if (!options.number) {
        number = Math.floor(Math.random() * 1000);
    }
    else {
        number = options.number;
    }
    ;
    if (typeof number !== "number") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " number must be a number.");
    }
    if (options.publicGame) {
        const participants = [];
        if (currentGames[interaction.guild.id]) {
            let embed = new discord_js_1.EmbedBuilder()
                .setDescription(options.ongoingMessage.replace(/{{channel}}/g, currentGames[`${interaction.guild.id}_channel`]))
                .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
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
            return await interaction.reply({
                embeds: [embed]
            });
        }
        ;
        let embed = new discord_js_1.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(`${options.embed.description ?
            options.embed.description.replace(/{{time}}/g, (0, functions_1.convertTime)(options.time ? options.time : 60000)) :
            "You have **{{time}}** to guess the number.".replace(/{{time}}/g, (0, functions_1.convertTime)(options.time ? options.time : 60000))}`)
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
        let btn1 = new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setLabel(options.button ? options.button : "Cancel")
            .setCustomId(ids);
        const msg = await interaction.reply({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }]
        });
        const gameCreatedAt = Date.now();
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => !m.author.bot,
            time: options.time ? options.time : 60000
        });
        const gameCollector = msg.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
        });
        currentGames[interaction.guild.id] = true;
        currentGames[`${interaction.guild.id}_channel`] = interaction.channel.id;
        const guildId = interaction.guild.id;
        collector.on('collect', async (_msg) => {
            if (!participants.includes(_msg.author.id)) {
                participants.push(_msg.author.id);
            }
            const parsedNumber = parseInt(_msg.content, 10);
            if (parsedNumber === number) {
                const time = (0, functions_1.convertTime)(Date.now() - gameCreatedAt);
                let _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(`
                        ${winMessagePublicGame
                    .replace(/{{number}}/g, number.toString())
                    .replace(/{{winner}}/g, _msg.author.id)
                    .replace(/{{time}}/g, time)
                    .replace(/{{totalparticipants}}/g, `${participants.length}`)
                    .replace(/{{participants}}/g, participants.map((p) => '<@' + p + '>').join(', '))}`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                _msg.reply({ embeds: [_embed] });
                gameCollector.stop();
                collector.stop();
                if (options.returnWinner) {
                    if (!options.gameID) {
                        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " gameID must be provided.");
                    }
                    ;
                    if (typeof options.gameID !== "string") {
                        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " gameID must be a string.");
                    }
                    ;
                    db.set(`GuessTheNumber_${guildId}_${options.gameID}`, _msg.author.id);
                }
            }
            if (parseInt(_msg.content) < number) {
                let _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.bigNumber ?
                    options.bigNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is bigger than **${parsedNumber}**!`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                _msg.reply({ embeds: [_embed] });
            }
            ;
            if (parseInt(_msg.content) > number) {
                let _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.smallNumber ?
                    options.smallNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is smaller than **${parsedNumber}**!`)
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
                ;
                _msg.reply({ embeds: [_embed] });
            }
            ;
        });
        gameCollector.on('collect', async (button) => {
            if (button.user.id !== id) {
                return button.reply({
                    content: options.otherMessage ?
                        options.otherMessage.replace(/{{author}}/g, id) :
                        "This is not your game!",
                    ephemeral: true,
                });
            }
            await button.deferUpdate();
            if (button.customId === ids) {
                btn1.setDisabled(true);
                gameCollector.stop();
                collector.stop();
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number/g, `${number}`) :
                    `The number was **${number}**!`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                msg.edit({ embeds: [_embed] });
            }
        });
        collector.on('end', async (_collected, reason) => {
            delete currentGames[guildId];
            if (reason === 'time') {
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number}}/g, `${number}`) :
                    `The number was **${number}**!`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                return interaction.channel.send({ embeds: [_embed] });
            }
        });
    }
    else {
        if (data.has(id))
            return;
        data.add(id);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.embed.description ?
            options.embed.description.replace(/{{time}}/g, (0, functions_1.convertTime)(options.time ? options.time : 60000)) :
            "You have **{{time}}** to guess the number.".replace(/{{time}}/g, (0, functions_1.convertTime)(options.time ? options.time : 60000)))
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
            embed.setFooter({
                text: options.embed.footer.text,
                iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
            });
        }
        if (options.embed.author) {
            embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        let btn1 = new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setLabel(options.button ? options.button : "Cancel")
            .setCustomId(ids);
        const msg = await interaction.reply({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }]
        });
        const gameCreatedAt = Date.now();
        const collector = await interaction.channel.createMessageCollector({
            filter: (m) => m.author.id === id,
            time: options.time ? options.time : 60000
        });
        const gameCollector = msg.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
        });
        collector.on('collect', async (_msg) => {
            if (_msg.author.id !== id)
                return;
            const parsedNumber = parseInt(_msg.content, 10);
            if (parsedNumber === number) {
                const time = (0, functions_1.convertTime)(Date.now() - gameCreatedAt);
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(winMessagePrivateGame
                    .replace(/{{time}}/g, time)
                    .replace(/{{number}}/g, `${number}`))
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                await _msg.reply({ embeds: [_embed] });
                gameCollector.stop();
                collector.stop();
            }
            ;
            if (parseInt(_msg.content) < number) {
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.bigNumber ?
                    options.bigNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is bigger than **${parsedNumber}**!`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                await _msg.reply({ embeds: [_embed] });
            }
            ;
            if (parseInt(_msg.content) > number) {
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.smallNumber ?
                    options.smallNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is smaller than **${parsedNumber}**!`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                await _msg.reply({ embeds: [_embed] });
            }
            ;
        });
        gameCollector.on('collect', async (button) => {
            if (button.user.id !== id) {
                return button.reply({
                    content: options.otherMessage ?
                        options.otherMessage.replace(/{{author}}/g, id) :
                        "This is not your game!",
                    ephemeral: true,
                });
            }
            await button.deferUpdate();
            if (button.customId === ids) {
                btn1.setDisabled(true);
                gameCollector.stop();
                collector.stop();
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number}}/g, `${number}`) :
                    `The number was **${number}**!`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                await msg.edit({ embeds: [_embed] });
            }
        });
        collector.on('end', async (_collected, reason) => {
            if (reason === 'time') {
                const _embed = new discord_js_1.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number}}/g, `${number}`) :
                    `The number was **${number}**!`)
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
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                return interaction.channel.send({ embeds: [_embed] });
            }
            data.delete(id);
        });
    }
    (0, functions_1.checkPackageUpdates)("GuessTheNumber", options.notifyUpdate);
};
exports.default = GuessTheNumber;
