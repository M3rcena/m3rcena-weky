import chalk from "chalk";
import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder
} from "discord.js";

import {
    checkPackageUpdates, convertTime, createEmbed, getRandomSentence, getRandomString, shuffleString
} from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";

import type { ButtonInteraction, ChatInputCommandInteraction, Client, Message } from "discord.js";
import type { ShuffleGuessTypes } from "../Types";
const data = new Set();

const ShuffleGuess = async (options: ShuffleGuessTypes) => {
    // Options Check
    OptionsChecking(options, "ShuffleGuess");

    if (!options.interaction.inGuild()) return;

    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }
    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");

    if (!interaction.channel || !interaction.channel.isSendable()) throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No channel provided in interaction.");

    let client: Client = options.client;

    let id: string = "";
    if ((options.interaction as Message).author) {
        id = (options.interaction as Message).author.id;
    } else {
        id = (options.interaction as ChatInputCommandInteraction).user.id;
    };

    if (!options.word) {
        options.word = getRandomSentence(1)[0];
    };

    if (options.time < 10000) {
        throw new Error(chalk.red("[@m3rcena/weky] ShuffleGuess Error:") + " Time must be greater than 10 Seconds (in ms i.e. 10000)");
    };

    if (options.time && typeof options.time !== 'number') {
        throw new TypeError(chalk.red("[@m3rcena/weky] ShuffleGuess Error:") + " Time must be a number.");
    };

    if (!options.buttons) {
        options.buttons = {
            reshuffle: "Reshuffle",
            cancel: "Cancel"
        }
    };

    if (!options.buttons.reshuffle) {
        options.buttons.reshuffle = "Reshuffle";
    };

    if (!options.buttons.cancel) {
        options.buttons.cancel = "Cancel";
    };

    if (data.has(id)) return;
    data.add(id);

    const id1 =
        getRandomString(20) +
        '-' +
        getRandomString(20);

    const id2 =
        getRandomString(20) +
        '-' +
        getRandomString(20);

    const word = shuffleString(options.word.toString());

    let disbut = new ButtonBuilder()
        .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
        .setStyle(ButtonStyle.Success)
        .setCustomId(id1);

    let cancel = new ButtonBuilder()
        .setLabel(options.buttons.cancel ?? 'Cancel')
        .setStyle(ButtonStyle.Danger)
        .setCustomId(id2);

    options.embed.title = options.embed.title ?? "Shuffle Guess";
    options.embed.description = options.startMessage ?
        options.startMessage
            .replace('{{word}}', word)
            .replace('{{time}}', convertTime(options.time ?? 60000)) :
        `The word is \`${word}\` and you have ${convertTime(options.time ?? 60000)} to guess it!`;
    let emd = createEmbed(options.embed);

    const embed = await options.interaction.reply({
        embeds: [emd],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(disbut, cancel)],
    });

    const gameCreatedAt = Date.now();
    const gameCollector = options.interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === id,
        time: options.time ?? 60000,
    });

    gameCollector.on('collect', async (msg) => {
        if (msg.system) return;

        if (msg.content.toLowerCase() === options.word.toString()) {
            gameCollector.stop();
            data.delete(id);
            disbut = new ButtonBuilder()
                .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
                .setStyle(ButtonStyle.Success)
                .setCustomId(id1)
                .setDisabled();

            cancel = new ButtonBuilder()
                .setLabel(options.buttons.cancel ?? 'Cancel')
                .setStyle(ButtonStyle.Danger)
                .setCustomId(id2)
                .setDisabled();

            const time = convertTime(Date.now() - gameCreatedAt);

            options.embed.description = options.winMessage ?
                options.winMessage
                    .replace('{{word}}', options.word.toString())
                    .replace('{{time}}', time) :
                `You have guessed the word \`${options.word.toString()}\` in ${time}!`;
            let _embed = createEmbed(options.embed);

            msg.reply({ embeds: [_embed] });
            return embed.edit({
                embeds: [emd],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(disbut, cancel)],
            });
        } else {
            options.embed.description = options.incorrectMessage ?
                options.incorrectMessage :
                `No ${msg.author.toString()}! The word isn\'t \`${msg.content.toLowerCase()}\``;
            let _embed = createEmbed(options.embed);

            msg.reply({ embeds: [_embed] }).then((m) => setTimeout(() => {
                if (m.deletable) {
                    m.delete()
                };
                if (msg.deletable) {
                    msg.delete()
                };
            }, 3000));
        }
    });

    const GameCollector = embed.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (fn: ButtonInteraction) => fn.customId === id1 || fn.customId === id2,
    });

    GameCollector.on('collect', async (btn) => {
        if (btn.user.id !== id) {
            return btn.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `Only <@${id}> can use the buttons!`,
            });
        };

        await btn.deferUpdate();

        if (btn.customId === id1) {
            options.embed.description = options.startMessage ?
                options.startMessage
                    .replace('{{word}}', shuffleString(options.word.toString()))
                    .replace('{{time}}', convertTime(options.time ?? 60000)) :
                `The word is \`${shuffleString(options.word.toString())}\` and you have ${convertTime(options.time ?? 60000)} to guess it!`;
            let _embed = createEmbed(options.embed);

            return embed.edit({
                embeds: [_embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(disbut, cancel)],
            });
        } else if (btn.customId === id2) {
            gameCollector.stop();
            data.delete(id);
            disbut = new ButtonBuilder()
                .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
                .setStyle(ButtonStyle.Success)
                .setCustomId(id1)
                .setDisabled();

            cancel = new ButtonBuilder()
                .setLabel(options.buttons.cancel ?? 'Cancel')
                .setStyle(ButtonStyle.Danger)
                .setCustomId(id2)
                .setDisabled();

            options.embed.description = options.loseMessage ?
                options.loseMessage.replace('{{answer}}', options.word.toString()) :
                `The word was \`${options.word.toString()}\``;
            let _embed = createEmbed(options.embed);

            return embed.edit({
                embeds: [_embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(disbut, cancel)],
            });
        };
    });

    gameCollector.on('end', async (_collected, reason) => {
        if (reason === 'time') {
            disbut = new ButtonBuilder()
                .setLabel(options.buttons.reshuffle ? options.buttons.reshuffle : 'Reshuffle')
                .setStyle(ButtonStyle.Success)
                .setCustomId(id1)
                .setDisabled();

            cancel = new ButtonBuilder()
                .setLabel(options.buttons.cancel ?? 'Cancel')
                .setStyle(ButtonStyle.Danger)
                .setCustomId(id2)
                .setDisabled();

            options.embed.description = options.loseMessage ?
                options.loseMessage.replace('{{answer}}', options.word.toString()) :
                `The word was \`${options.word.toString()}\``;
            let _embed = createEmbed(options.embed);

            await interaction.reply({ embeds: [_embed] });
            data.delete(id);
            return embed.edit({
                embeds: [emd],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(disbut, cancel)],
            });
        };
    });
};

export default ShuffleGuess;