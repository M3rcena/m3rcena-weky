import chalk from "chalk";
import {
    ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction,
    Client, ComponentType, EmbedBuilder, Message
} from "discord.js";

import {
    checkPackageUpdates, convertTime, createEmbed, getRandomSentence, getRandomString
} from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";

import type { FastTypeTyping } from "../Types/";

const data = new Set();

const FastType = async (options: FastTypeTyping) => {
    OptionsChecking(options, "FastType")

    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");

    if (!interaction.channel || !interaction.channel.isSendable() || !interaction.channel.isTextBased()) throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " Interaction channel is not provided.");

    let client: Client = options.client;

    let id: string = "";
    if ((options.interaction as Message).author) {
        id = (options.interaction as Message).author.id;
    } else {
        id = (options.interaction as ChatInputCommandInteraction).user.id;
    };

    if (data.has(id)) return;
    data.add(id);

    const ids =
        getRandomString(20) +
        "-" +
        getRandomString(20);

    if (!options.sentence) {
        options.sentence = getRandomSentence(Math.floor(Math.random() * 20) + 3)
            .toString()
            .split(',').join(' ');
    };

    const sentence = options.sentence

    const gameCreatedAt = Date.now();

    let btn1 = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(options.buttonText ? options.buttonText : "Cancel")
        .setCustomId(ids);

    options.embed.description = options.embed.description ?
        options.embed.description.replace(
            '{{time}}',
            convertTime(options.time ? options.time : 60000),
        ) :
        `You have **${convertTime(options.time ? options.time : 60000)}** to type the sentence below.`

    if (!options.embed.fields) {
        options.embed.fields = [{ name: 'Sentence:', value: `${sentence}` }];
    };

    const embed = createEmbed(options.embed);

    const msg = await (interaction as Message || interaction as ChatInputCommandInteraction).reply({
        embeds: [embed],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
    });


    const collector = await interaction.channel.createMessageCollector({
        filter: (m: Message) => !m.author.bot && m.author.id === id,
        time: options.time ? options.time : 60000
    });

    collector.on("collect", async (mes: Message) => {
        if (mes.content.toLowerCase().trim() === sentence.toLowerCase()) {
            const time = Date.now() - gameCreatedAt;
            const minute = (time / 1000 / 60) % 60;
            const wpm = mes.content.toLowerCase().trim().length / 5 / minute;
            options.embed.description = options.winMessage ? options.winMessage.replace('{{time}}', convertTime(time)).replace('{{wpm}}', wpm.toFixed(2)) : `You have typed the sentence correctly in **${convertTime(time)}** with **${wpm.toFixed(2)}** WPM.`;
            options.embed.fields = [];
            const _embed = createEmbed(options.embed);

            await interaction.channel.send({ embeds: [_embed] });
            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);

            await msg.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
            });

            collector.stop(mes.author.username);
            data.delete(id);
        } else {
            options.embed.fields = [];
            options.embed.description = options.loseMessage ? options.loseMessage : "Better Luck Next Time!";
            const _embed = createEmbed(options.embed);

            await interaction.channel.send({ embeds: [_embed] });

            collector.stop(mes.author.username);
            data.delete(id);

            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);

            await msg.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
            });
        }
    });

    collector.on('end', async (_collected, reason) => {
        if (reason === 'time') {
            options.embed.fields = [];
            options.embed.description = options.loseMessage ? options.loseMessage : "Better Luck Next Time!";
            const _embed = createEmbed(options.embed);

            await interaction.channel.send({ embeds: [_embed] });

            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);

            await msg.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
            });

            data.delete(id);
        }
    });

    const gameCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (button: ButtonInteraction) => button.customId === ids,
        time: options.time ? options.time : 60000
    });

    gameCollector.on("collect", async (button) => {
        if (button.user.id !== id) {
            return button.reply({
                content: options.othersMessage ? options.othersMessage.replace('{{author}}', id) : `This button is for <@${id}>`,
                ephemeral: true
            });
        };

        btn1 = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(options.buttonText ? options.buttonText : "Cancel")
            .setDisabled()
            .setCustomId(ids);

        embed.setTimestamp(options.embed.timestamp ? new Date() : null);

        await button.update({
            content: options.cancelMessage ? options.cancelMessage : "Game has been cancelled.",
            embeds: [embed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
        });
        gameCollector.stop();
        data.delete(id);
        return collector.stop();
    });

    gameCollector.on("end", async (data, reason) => {
        if (reason === "time") {
            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)],
            });
        }
    })

    checkPackageUpdates("FastType", options.notifyUpdate);
};

export default FastType;
