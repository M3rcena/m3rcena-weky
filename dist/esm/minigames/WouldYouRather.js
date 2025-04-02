import chalk from "chalk";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { decode } from "html-entities";
import { ofetch } from "ofetch";
import { checkPackageUpdates, createEmbed, getRandomString } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
const WouldYouRather = async (options) => {
    // Options Check
    OptionsChecking(options, "WouldYouRather");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No channel provided in interaction.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    const id1 = getRandomString(20) +
        '-' +
        getRandomString(20);
    const id2 = getRandomString(20) +
        '-' +
        getRandomString(20);
    options.embed.title = options.embed.title ?? "Would You Rather?";
    options.embed.description = options.thinkMessage ? options.thinkMessage : "I am thinking";
    let embed = createEmbed(options.embed);
    const think = await interaction.reply({
        embeds: [embed]
    });
    const number = Math.floor(Math.random() * (700 - 1 + 1)) + 1;
    const response = await ofetch(`https://wouldurather.io/api/question?id=${number}`);
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
    let btn = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel(options.buttons ? options.buttons.optionA : "Option A")
        .setCustomId(id1);
    let btn2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel(options.buttons ? options.buttons.optionB : "Option B")
        .setCustomId(id2);
    options.embed.description = `**Option A:** ${decode(res.questions[0])}\n**Option B:** ${decode(res.questions[1])}`;
    embed = createEmbed(options.embed);
    await think.edit({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(btn, btn2)]
    });
    const gameCollector = think.createMessageComponentCollector({
        componentType: ComponentType.Button,
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
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Option A"}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "Option B"}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            options.embed.description = `**Option A:** ${decode(res.questions[0])} (${res.percentage['1']})\n**Option B:** ${decode(res.questions[1])} (${res.percentage['2']})`;
            const _embed = createEmbed(options.embed);
            await wyr.editReply({
                embeds: [_embed],
                components: [new ActionRowBuilder().addComponents(btn, btn2)]
            });
        }
        else if (wyr.customId === id2) {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Option A"}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "Option B"}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            options.embed.description = `**Option A:** ${decode(res.questions[0])} (${res.percentage['1']})\n**Option B:** ${decode(res.questions[1])} (${res.percentage['2']})`;
            const _embed = createEmbed(options.embed);
            await wyr.editReply({
                embeds: [_embed],
                components: [new ActionRowBuilder().addComponents(btn, btn2)]
            });
        }
    });
    checkPackageUpdates("WouldYouRather", options.notifyUpdate);
};
export default WouldYouRather;
