"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const html_entities_1 = require("html-entities");
const ofetch_1 = require("ofetch");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const WouldYouRather = async (options) => {
    // Options Check
    (0, OptionChecking_1.OptionsChecking)(options, "WouldYouRather");
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
    const id1 = (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20);
    const id2 = (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20) +
        '-' +
        (0, functions_1.getRandomString)(20);
    let embed = new discord_js_1.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.thinkMessage ?
        options.thinkMessage :
        `I am thinking...`)
        .setColor(options.embed.color)
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
    const think = await interaction.reply({
        embeds: [embed]
    });
    const number = Math.floor(Math.random() * (700 - 1 + 1)) + 1;
    const response = await (0, ofetch_1.ofetch)(`https://wouldurather.io/api/question?id=${number}`);
    const data = response;
    const res = {
        questions: [data.option1, data.option2],
        percentage: {
            1: ((parseInt(data.option1Votes) /
                (parseInt(data.option1Votes) + parseInt(data.option2Votes))) *
                100).toFixed(2) + '%',
            2: ((parseInt(data.option2Votes) /
                (parseInt(data.option1Votes) + parseInt(data.option2Votes))) *
                100).toFixed(2) + '%',
        },
    };
    let btn = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setLabel(options.buttons ? options.buttons.optionA : "Option A")
        .setCustomId(id1);
    let btn2 = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setLabel(options.buttons ? options.buttons.optionB : "Option B")
        .setCustomId(id2);
    embed = new discord_js_1.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(`**Option A:** ${(0, html_entities_1.decode)(res.questions[0])}\n**Option B:** ${(0, html_entities_1.decode)(res.questions[1])}`)
        .setColor(options.embed.color)
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
        components: [
            {
                type: 1,
                components: [btn, btn2]
            }
        ]
    });
    const gameCollector = think.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: options.time ? options.time : undefined
    });
    gameCollector.on('collect', async (wyr) => {
        if (wyr.user.id !== id) {
            return wyr.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `This is not your game!`,
                ephemeral: true
            });
        }
        ;
        await wyr.deferUpdate();
        if (wyr.customId === id1) {
            btn = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Option A"}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "Option B"}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            const _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(`**Option A:** ${(0, html_entities_1.decode)(res.questions[0])} (${res.percentage['1']})\n**Option B:** ${(0, html_entities_1.decode)(res.questions[1])} (${res.percentage['2']})`)
                .setColor(options.embed.color)
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
            await wyr.editReply({
                embeds: [_embed],
                components: [
                    {
                        type: 1,
                        components: [btn, btn2]
                    }
                ]
            });
        }
        else if (wyr.customId === id2) {
            btn = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Option A"}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "Option B"}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            const _embed = new discord_js_1.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(`**Option A:** ${(0, html_entities_1.decode)(res.questions[0])} (${res.percentage['1']})\n**Option B:** ${(0, html_entities_1.decode)(res.questions[1])} (${res.percentage['2']})`)
                .setColor(options.embed.color)
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
            await wyr.editReply({
                embeds: [_embed],
                components: [
                    {
                        type: 1,
                        components: [btn, btn2]
                    }
                ]
            });
        }
    });
    (0, functions_1.checkPackageUpdates)("WouldYouRather", options.notifyUpdate);
};
exports.default = WouldYouRather;
