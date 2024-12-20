"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const data = new Set();
const FastType = async (options) => {
    // Check type
    (0, OptionChecking_1.OptionsChecking)(options, "FastType");
    // Check if the interaction object is provided
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
        throw new Error(chalk_1.default.red("[@m3rcena/weky] FastType Error:") + " Interaction channel is not provided.");
    let client = options.client;
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
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(`${options.embed.description ?
        options.embed.description.replace('{{time}}', (0, functions_1.convertTime)(options.time ? options.time : 60000)) :
        `You have **${(0, functions_1.convertTime)(options.time ? options.time : 60000)}** to type the sentence below.`}`)
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
    else {
        embed.addFields({ name: 'Sentence:', value: `${sentence}` });
    }
    ;
    const msg = await interaction.reply({
        embeds: [embed],
        components: [{ type: 1, components: [btn1] }],
    });
    if (!interaction.channel || !interaction.channel.isTextBased()) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] FastTyoe Error: ") + "Interaction channel is not a text channel.");
    }
    const collector = await interaction.channel.createMessageCollector({
        filter: (m) => !m.author.bot && m.author.id === id,
        time: options.time ? options.time : 60000
    });
    collector.on("collect", async (mes) => {
        if (mes.content.toLowerCase().trim() === sentence.toLowerCase()) {
            const time = Date.now() - gameCreatedAt;
            const minute = (time / 1000 / 60) % 60;
            const wpm = mes.content.toLowerCase().trim().length / 5 / minute;
            const _embed = new discord_js_1.EmbedBuilder()
                .setDescription(options.winMessage ?
                options.winMessage
                    .replace('time', (0, functions_1.convertTime)(time))
                    .replace('wpm', wpm.toFixed(2))
                : `You have typed the sentence correctly in **${(0, functions_1.convertTime)(time)}** with **${wpm.toFixed(2)}** WPM.`)
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
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await interaction.channel.send({ embeds: [_embed] });
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            collector.stop(mes.author.username);
            data.delete(id);
        }
        else {
            const _embed = new discord_js_1.EmbedBuilder()
                .setDescription(options.loseMessage ? options.loseMessage : "Better Luck Next Time!")
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
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await interaction.channel.send({ embeds: [_embed] });
            collector.stop(mes.author.username);
            data.delete(id);
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
        }
    });
    collector.on('end', async (_collected, reason) => {
        if (reason === 'time') {
            const _embed = new discord_js_1.EmbedBuilder()
                .setDescription(options.loseMessage ? options.loseMessage : "Better Luck Next Time!")
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
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await interaction.channel.send({ embeds: [_embed] });
            btn1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            data.delete(id);
        }
    });
    const gameCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        filter: (button) => button.customId === ids
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
        await msg.edit({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }],
        });
        button.reply({
            content: options.cancelMessage ? options.cancelMessage : "Game has been cancelled.",
            ephemeral: true
        });
        gameCollector.stop();
        data.delete(id);
        return collector.stop();
    });
    (0, functions_1.checkPackageUpdates)("FastType", options.notifyUpdate);
};
exports.default = FastType;
