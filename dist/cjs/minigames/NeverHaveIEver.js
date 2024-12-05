"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const NeverHaveIEver = async (options) => {
    // Check type
    (0, OptionChecking_1.OptionsChecking)(options, "NeverHaveIEver");
    // Check if the interaction object is provided
    let interaction = options.interaction;
    if (!interaction)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] Calculator Error:") + " No interaction provided.");
    let client = options.client;
    if (!options.thinkMessage)
        options.thinkMessage = "I am thinking";
    if (typeof options.thinkMessage !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] NeverHaveIEver Error:") + " thinkMessage must be a string.");
    }
    ;
    if (!options.othersMessage) {
        options.othersMessage = "Only <@{{author}}> can use the buttons!";
    }
    ;
    if (typeof options.othersMessage !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] NeverHaveIEver Error:") + " othersMessage must be a string.");
    }
    ;
    if (!options.buttons)
        options.buttons = {};
    if (typeof options.buttons !== "object") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] NeverHaveIEver Error:") + " buttons must be an object.");
    }
    ;
    if (!options.buttons.optionA)
        options.buttons.optionA = "Yes";
    if (typeof options.buttons.optionA !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] NeverHaveIEver Error:") + " button must be a string.");
    }
    ;
    if (!options.buttons.optionB)
        options.buttons.optionB = "No";
    if (typeof options.buttons.optionB !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] NeverHaveIEver Error:") + " button must be a string.");
    }
    ;
    const id1 = (0, functions_1.getRandomString)(20) +
        "-" +
        (0, functions_1.getRandomString)(20);
    const id2 = (0, functions_1.getRandomString)(20) +
        "-" +
        (0, functions_1.getRandomString)(20);
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    let embed = new discord_js_1.EmbedBuilder()
        .setTitle(options.thinkMessage ? options.thinkMessage : "I am thinking...")
        .setColor(options.embed.color ?? "Blurple")
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
    const think = await interaction.reply({
        embeds: [embed]
    });
    let { statement } = await fetch("https://api.boozee.app/v2/statements/next?language=en&category=harmless")
        .then((res) => res.json());
    statement = statement.trim();
    let btn = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setLabel(options.buttons.optionA ? options.buttons.optionA : "Yes")
        .setCustomId(id1);
    let btn2 = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setLabel(options.buttons.optionB ? options.buttons.optionB : "No")
        .setCustomId(id2);
    embed
        .setTitle(options.embed.title)
        .setDescription(statement)
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
    await think.edit({
        embeds: [embed],
        components: [{
                type: 1,
                components: [btn, btn2]
            }]
    });
    const gameCollector = think.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: options.time ? options.time : 60000
    });
    gameCollector.on("collect", async (nhie) => {
        if (nhie.user.id !== id) {
            return nhie.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `Only <@${id}> can use the buttons!`,
                ephemeral: true,
            });
        }
        ;
        await nhie.deferUpdate();
        if (nhie.customId === id1) {
            btn = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            await think.edit({
                embeds: [embed],
                components: [{
                        type: 1,
                        components: [btn, btn2]
                    }]
            });
        }
        else if (nhie.customId === id2) {
            btn = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            await think.edit({
                embeds: [embed],
                components: [{
                        type: 1,
                        components: [btn, btn2]
                    }]
            });
        }
        ;
    });
    gameCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
            btn = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();
            embed.setDescription(statement + "\n\n**The game has ended!**");
            await think.edit({
                embeds: [embed],
                components: [{
                        type: 1,
                        components: [btn, btn2]
                    }]
            });
        }
        ;
    });
    (0, functions_1.checkPackageUpdates)("NeverHaveIEver", options.notifyUpdate);
};
exports.default = NeverHaveIEver;
