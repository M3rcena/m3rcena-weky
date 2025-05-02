"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const functions_js_1 = require("../../functions/functions.js");
const OptionChecking_js_1 = require("../../functions/OptionChecking.js");
const db = new Map();
const data = new Set();
const currentGames = new Object();
const GuessTheNumber = async (options) => {
    (0, OptionChecking_js_1.OptionsChecking)(options, 'GuessTheNumber');
    let message = options.message;
    if (!message)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] ChaosWords Error:") + " No message provided.");
    let id = message.author.id;
    if (!message.guild) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " Guild is not available in this interaction.");
    }
    ;
    if (!message.channel || !message.channel.isSendable()) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " Channel is not available in this interaction.");
    }
    if (message.channel.isDMBased()) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessTheNumber Error:") + " Channel is a DM.");
    }
    ;
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
    const ids = (0, functions_js_1.getRandomString)(20) +
        '-' +
        (0, functions_js_1.getRandomString)(20);
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
    const handleGame = async (isPublic) => {
        const participants = [];
        if (isPublic && currentGames[message.guild.id]) {
            options.embed.description = options.ongoingMessage.replace(/{{channel}}/g, currentGames[`${message.guild.id}_channel`]);
            return await message.reply({
                embeds: [(0, functions_js_1.createEmbed)(options.embed)]
            });
        }
        if (!isPublic && data.has(id))
            return;
        if (!isPublic)
            data.add(id);
        options.embed.description = options.embed.description ?
            options.embed.description.replace(/{{time}}/g, (0, functions_js_1.convertTime)(options.time ? options.time : 60000)) :
            "You have **{{time}}** to guess the number.".replace(/{{time}}/g, (0, functions_js_1.convertTime)(options.time ? options.time : 60000));
        const embed = (0, functions_js_1.createEmbed)(options.embed);
        const btn1 = new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setLabel(options.button ? options.button : "Cancel")
            .setCustomId(ids);
        const row = new discord_js_1.ActionRowBuilder().addComponents(btn1);
        const msg = await message.reply({
            embeds: [embed],
            components: [row]
        });
        const gameCreatedAt = Date.now();
        if (!message.channel.isSendable())
            return;
        const collector = message.channel.createMessageCollector({
            filter: (m) => isPublic ? !m.author.bot : m.author.id === id,
            time: options.time ? options.time : 60000
        });
        const gameCollector = msg.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
        });
        if (isPublic) {
            currentGames[message.guild.id] = true;
            currentGames[`${message.guild.id}_channel`] = message.channel.id;
        }
        collector.on('collect', async (_msg) => {
            if (isPublic && !participants.includes(_msg.author.id)) {
                participants.push(_msg.author.id);
            }
            const parsedNumber = parseInt(_msg.content, 10);
            if (parsedNumber === number) {
                const time = (0, functions_js_1.convertTime)(Date.now() - gameCreatedAt);
                options.embed.description = isPublic ?
                    winMessagePublicGame
                        .replace(/{{number}}/g, number.toString())
                        .replace(/{{winner}}/g, _msg.author.id)
                        .replace(/{{time}}/g, time)
                        .replace(/{{totalparticipants}}/g, `${participants.length}`)
                        .replace(/{{participants}}/g, participants.map((p) => '<@' + p + '>').join(', ')) :
                    winMessagePrivateGame
                        .replace(/{{time}}/g, time)
                        .replace(/{{number}}/g, `${number}`);
                let _embed = (0, functions_js_1.createEmbed)(options.embed);
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                const row = new discord_js_1.ActionRowBuilder().addComponents(btn1);
                await msg.edit({
                    embeds: [embed],
                    components: [row]
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
                    db.set(`GuessTheNumber_${message.guild.id}_${options.gameID}`, _msg.author.id);
                }
            }
            const compareResponse = (comparison) => {
                options.embed.description = options[comparison === 'bigger' ? 'bigNumber' : 'smallNumber'] ?
                    options[comparison === 'bigger' ? 'bigNumber' : 'smallNumber']
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is ${comparison} than **${parsedNumber}**!`;
                return _msg.reply({ embeds: [(0, functions_js_1.createEmbed)(options.embed)] });
            };
            if (parsedNumber < number)
                compareResponse('bigger');
            if (parsedNumber > number)
                compareResponse('smaller');
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
                options.embed.description = options.loseMessage ?
                    options.loseMessage.replace(/{{number/g, `${number}`) :
                    `The number was **${number}**!`;
                let _embed = (0, functions_js_1.createEmbed)(options.embed);
                msg.edit({ embeds: [_embed] });
            }
        });
        collector.on('end', async (_collected, reason) => {
            if (reason === 'time') {
                options.embed.description = options.loseMessage ?
                    options.loseMessage.replace(/{{number}}/g, `${number}`) :
                    `The number was **${number}**!`;
                let _embed = (0, functions_js_1.createEmbed)(options.embed);
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                const row = new discord_js_1.ActionRowBuilder().addComponents(btn1);
                await msg.edit({
                    embeds: [embed],
                    components: [row]
                });
                if (!message.channel || !message.channel.isSendable())
                    return;
                return message.channel.send({ embeds: [_embed] });
            }
            data.delete(id);
            currentGames[message.guild.id] = false;
        });
    };
    await handleGame(options.publicGame ?? false);
    (0, functions_js_1.checkPackageUpdates)("GuessTheNumber", options.notifyUpdate);
};
exports.default = GuessTheNumber;
