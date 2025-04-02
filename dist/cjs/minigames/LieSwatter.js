"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const html_entities_1 = require("html-entities");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const LieSwatter = async (options) => {
    // Check types
    (0, OptionChecking_1.OptionsChecking)(options, "LieSwatter");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter Error:") + " No channel found.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    const id1 = (0, functions_1.getRandomString)(20) +
        "-" +
        (0, functions_1.getRandomString)(20);
    const id2 = (0, functions_1.getRandomString)(20) +
        "-" +
        (0, functions_1.getRandomString)(20);
    if (!options.winMessage)
        options.winMessage = "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";
    if (typeof options.winMessage !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter TypeError:") + " Win message must be a string.");
    }
    ;
    if (!options.loseMessage)
        options.loseMessage = "Better luck next time! It was a **{{answer}}**.";
    if (typeof options.loseMessage !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter TypeError:") + " Lose message must be a string.");
    }
    ;
    if (!options.othersMessage)
        options.othersMessage = "Only <@{{author}}> can use the buttons!";
    if (typeof options.othersMessage !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter TypeError:") + " Others message must be a string.");
    }
    ;
    if (!options.buttons)
        options.buttons = {
            true: "Truth",
            lie: "Lie"
        };
    if (typeof options.buttons !== "object") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter TypeError:") + " Buttons must be an object.");
    }
    ;
    if (!options.buttons.true)
        options.buttons.true = "Truth";
    if (typeof options.buttons.true !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter TypeError:") + " True button text must be a string.");
    }
    ;
    if (!options.buttons.lie)
        options.buttons.lie = "Lie";
    if (typeof options.buttons.lie !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter TypeError:") + " Lie button text must be a string.");
    }
    ;
    if (!options.thinkMessage)
        options.thinkMessage = "I am thinking...";
    if (typeof options.thinkMessage !== "string") {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] LieSwatter TypeError:") + " Think message must be a string.");
    }
    ;
    options.embed.description = options.thinkMessage;
    let embed = (0, functions_1.createEmbed)(options.embed);
    const msg = await interaction.reply({
        embeds: [embed]
    });
    const result = await fetch(`https://opentdb.com/api.php?amount=1&type=boolean`).then((res) => res.json());
    const question = result.results[0];
    let answer;
    let winningID;
    if (question.correct_answer === "True") {
        winningID = id1;
        answer = options.buttons.true;
    }
    else {
        winningID = id2;
        answer = options.buttons.lie;
    }
    ;
    let btn1 = new discord_js_1.ButtonBuilder()
        .setCustomId(id1)
        .setLabel(options.buttons.true)
        .setStyle(discord_js_1.ButtonStyle.Primary);
    let btn2 = new discord_js_1.ButtonBuilder()
        .setCustomId(id2)
        .setLabel(options.buttons.lie)
        .setStyle(discord_js_1.ButtonStyle.Primary);
    options.embed.description = (0, html_entities_1.decode)(question.question);
    embed = (0, functions_1.createEmbed)(options.embed);
    await msg.edit({
        embeds: [embed],
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(btn1, btn2)
        ]
    });
    const gameCreatedAt = Date.now();
    const gameCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: 60000
    });
    gameCollector.on("collect", async (button) => {
        if (button.user.id !== id) {
            return button.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace(`{{author}}`, id) :
                    "Only <@" + id + "> can use the buttons!",
                ephemeral: true
            });
        }
        await button.deferUpdate();
        if (button.customId === winningID) {
            btn1 = new discord_js_1.ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();
            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(discord_js_1.ButtonStyle.Success);
                btn2.setStyle(discord_js_1.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js_1.ButtonStyle.Danger);
                btn2.setStyle(discord_js_1.ButtonStyle.Success);
            }
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(btn1, btn2)]
            });
            const time = (0, functions_1.convertTime)(Date.now() - gameCreatedAt);
            options.embed.description = options.winMessage ? options.winMessage
                .replace(`{{answer}}`, (0, html_entities_1.decode)(answer))
                .replace(`{{time}}`, time) : `GG, It was a **${(0, html_entities_1.decode)(answer)}**. You got it correct in **${time}**.`;
            const winEmbed = (0, functions_1.createEmbed)(options.embed);
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            await interaction.channel.send({
                embeds: [winEmbed]
            });
        }
        else {
            btn1 = new discord_js_1.ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();
            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(discord_js_1.ButtonStyle.Success);
                btn2.setStyle(discord_js_1.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js_1.ButtonStyle.Danger);
                btn2.setStyle(discord_js_1.ButtonStyle.Success);
            }
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(btn1, btn2)]
            });
            options.embed.description = options.loseMessage ? options.loseMessage.replace('{{answer}}', (0, html_entities_1.decode)(answer)) : `Better luck next time! It was a **${(0, html_entities_1.decode)(answer)}**.`;
            const lostEmbed = (0, functions_1.createEmbed)(options.embed);
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            await interaction.channel.send({
                embeds: [lostEmbed]
            });
        }
    });
    gameCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
            btn1 = new discord_js_1.ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();
            if (winningID === id1) {
                btn1.setStyle(discord_js_1.ButtonStyle.Success);
                btn2.setStyle(discord_js_1.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js_1.ButtonStyle.Danger);
                btn2.setStyle(discord_js_1.ButtonStyle.Success);
            }
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [new discord_js_1.ActionRowBuilder().addComponents(btn1, btn2)]
            });
            options.embed.description = options.loseMessage ? options.loseMessage.replace('{{answer}}', (0, html_entities_1.decode)(answer)) : `**You run out of Time**\nBetter luck next time! It was a **${(0, html_entities_1.decode)(answer)}**.`;
            const lostEmbed = (0, functions_1.createEmbed)(options.embed);
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            await interaction.channel.send({
                embeds: [lostEmbed]
            });
        }
    });
    (0, functions_1.checkPackageUpdates)("LieSwatter", options.notifyUpdate);
};
exports.default = LieSwatter;
