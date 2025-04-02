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
    options.embed.title = options.embed.title ?? "Shuffle Guess";
    options.embed.description = options.startMessage ?
        options.startMessage
            .replace('{{word}}', word)
            .replace('{{time}}', (0, functions_1.convertTime)(options.time ?? 60000)) :
        `The word is \`${word}\` and you have ${(0, functions_1.convertTime)(options.time ?? 60000)} to guess it!`;
    let emd = (0, functions_1.createEmbed)(options.embed);
    const embed = await options.interaction.reply({
        embeds: [emd],
        components: [new discord_js_1.ActionRowBuilder().addComponents(disbut, cancel)],
    });
    const gameCreatedAt = Date.now();
    const gameCollector = options.interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === id,
        time: options.time ?? 60000,
    });
    gameCollector.on('collect', async (msg) => {
        if (msg.system)
            return;
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
            options.embed.description = options.winMessage ?
                options.winMessage
                    .replace('{{word}}', options.word.toString())
                    .replace('{{time}}', time) :
                `You have guessed the word \`${options.word.toString()}\` in ${time}!`;
            let _embed = (0, functions_1.createEmbed)(options.embed);
            msg.reply({ embeds: [_embed] });
            return embed.edit({
                embeds: [emd],
                components: [new discord_js_1.ActionRowBuilder().addComponents(disbut, cancel)],
            });
        }
        else {
            options.embed.description = options.incorrectMessage ?
                options.incorrectMessage :
                `No ${msg.author.toString()}! The word isn\'t \`${msg.content.toLowerCase()}\``;
            let _embed = (0, functions_1.createEmbed)(options.embed);
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
            options.embed.description = options.startMessage ?
                options.startMessage
                    .replace('{{word}}', (0, functions_1.shuffleString)(options.word.toString()))
                    .replace('{{time}}', (0, functions_1.convertTime)(options.time ?? 60000)) :
                `The word is \`${(0, functions_1.shuffleString)(options.word.toString())}\` and you have ${(0, functions_1.convertTime)(options.time ?? 60000)} to guess it!`;
            let _embed = (0, functions_1.createEmbed)(options.embed);
            return embed.edit({
                embeds: [_embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(disbut, cancel)],
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
            options.embed.description = options.loseMessage ?
                options.loseMessage.replace('{{answer}}', options.word.toString()) :
                `The word was \`${options.word.toString()}\``;
            let _embed = (0, functions_1.createEmbed)(options.embed);
            return embed.edit({
                embeds: [_embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(disbut, cancel)],
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
            options.embed.description = options.loseMessage ?
                options.loseMessage.replace('{{answer}}', options.word.toString()) :
                `The word was \`${options.word.toString()}\``;
            let _embed = (0, functions_1.createEmbed)(options.embed);
            await interaction.reply({ embeds: [_embed] });
            data.delete(id);
            return embed.edit({
                embeds: [emd],
                components: [new discord_js_1.ActionRowBuilder().addComponents(disbut, cancel)],
            });
        }
        ;
    });
};
exports.default = ShuffleGuess;
