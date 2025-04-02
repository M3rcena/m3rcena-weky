"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const data = new Set();
const FastType = async (options) => {
    (0, OptionChecking_1.OptionsChecking)(options, "FastType");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable() || !interaction.channel.isTextBased())
        throw new Error(chalk_1.default.red("[@m3rcena/weky] FastType Error:") + " Interaction channel is not provided.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    if (data.has(id))
        return;
    data.add(id);
    const ids = (0, functions_1.getRandomString)(20) +
        "-" +
        (0, functions_1.getRandomString)(20);
    if (!options.sentence) {
        options.sentence = (0, functions_1.getRandomSentence)(Math.floor(Math.random() * 20) + 3)
            .toString()
            .split(',').join(' ');
    }
    ;
    const sentence = options.sentence;
    const gameCreatedAt = Date.now();
    let btn1 = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setLabel(options.buttonText ? options.buttonText : "Cancel")
        .setCustomId(ids);
    options.embed.description = options.embed.description ?
        options.embed.description.replace('{{time}}', (0, functions_1.convertTime)(options.time ? options.time : 60000)) :
        `You have **${(0, functions_1.convertTime)(options.time ? options.time : 60000)}** to type the sentence below.`;
    if (!options.embed.fields) {
        options.embed.fields = [{ name: 'Sentence:', value: `${sentence}` }];
    }
    ;
    const embed = (0, functions_1.createEmbed)(options.embed);
    const msg = await (interaction || interaction).reply({
        embeds: [embed],
        components: [new discord_js_1.ActionRowBuilder().addComponents(btn1)],
    });
    const collector = await interaction.channel.createMessageCollector({
        filter: (m) => !m.author.bot && m.author.id === id,
        time: options.time ? options.time : 60000
    });
    collector.on("collect", async (mes) => {
        if (mes.content.toLowerCase().trim() === sentence.toLowerCase()) {
            const time = Date.now() - gameCreatedAt;
            const minute = (time / 1000 / 60) % 60;
            const wpm = mes.content.toLowerCase().trim().length / 5 / minute;
            options.embed.description = options.winMessage ? options.winMessage.replace('{{time}}', (0, functions_1.convertTime)(time)).replace('{{wpm}}', wpm.toFixed(2)) : `You have typed the sentence correctly in **${(0, functions_1.convertTime)(time)}** with **${wpm.toFixed(2)}** WPM.`;
            options.embed.fields = [];
            const _embed = (0, functions_1.createEmbed)(options.embed);
            await interaction.channel.send({ embeds: [_embed] });
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(btn1)],
            });
            collector.stop(mes.author.username);
            data.delete(id);
        }
        else {
            options.embed.fields = [];
            options.embed.description = options.loseMessage ? options.loseMessage : "Better Luck Next Time!";
            const _embed = (0, functions_1.createEmbed)(options.embed);
            await interaction.channel.send({ embeds: [_embed] });
            collector.stop(mes.author.username);
            data.delete(id);
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(btn1)],
            });
        }
    });
    collector.on('end', async (_collected, reason) => {
        if (reason === 'time') {
            options.embed.fields = [];
            options.embed.description = options.loseMessage ? options.loseMessage : "Better Luck Next Time!";
            const _embed = (0, functions_1.createEmbed)(options.embed);
            await interaction.channel.send({ embeds: [_embed] });
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(btn1)],
            });
            data.delete(id);
        }
    });
    const gameCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        filter: (button) => button.customId === ids,
        time: options.time ? options.time : 60000
    });
    gameCollector.on("collect", async (button) => {
        if (button.user.id !== id) {
            return button.reply({
                content: options.othersMessage ? options.othersMessage.replace('{{author}}', id) : `This button is for <@${id}>`,
                ephemeral: true
            });
        }
        ;
        btn1 = new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setLabel(options.buttonText ? options.buttonText : "Cancel")
            .setDisabled()
            .setCustomId(ids);
        embed.setTimestamp(options.embed.timestamp ? new Date() : null);
        await button.update({
            content: options.cancelMessage ? options.cancelMessage : "Game has been cancelled.",
            embeds: [embed],
            components: [new discord_js_1.ActionRowBuilder().addComponents(btn1)],
        });
        gameCollector.stop();
        data.delete(id);
        return collector.stop();
    });
    gameCollector.on("end", async (data, reason) => {
        if (reason === "time") {
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(btn1)],
            });
        }
    });
    (0, functions_1.checkPackageUpdates)("FastType", options.notifyUpdate);
};
exports.default = FastType;
