import chalk from "chalk";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { checkPackageUpdates, createEmbed, getButtonDilemma, getRandomString } from "../../functions/functions.js";
import { OptionsChecking } from "../../functions/OptionChecking.js";
const WillYouPressTheButton = async (options) => {
    // Options Check
    OptionsChecking(options, "WillYouPressTheButton");
    let message = options.message;
    if (!message)
        throw new Error(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " No message provided.");
    if (!message.channel || !message.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " No channel provided in message.");
    let id = message.author.id;
    if (!options.button)
        options.button = {};
    if (typeof options.embed !== 'object') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " embed must be an object.");
    }
    ;
    if (!options.button.yes)
        options.button.yes = 'Yes';
    if (typeof options.button.yes !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " button.yes must be a string.");
    }
    ;
    if (!options.button.no)
        options.button.no = 'No';
    if (typeof options.button.no !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " button.no must be a string.");
    }
    ;
    if (!options.thinkMessage)
        options.thinkMessage = 'I am thinking';
    if (typeof options.thinkMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " thinkMessage must be a string.");
    }
    ;
    if (!options.othersMessage) {
        options.othersMessage = 'Only <@{{author}}> can use the buttons!';
    }
    ;
    if (typeof options.othersMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " othersMessage must be a string.");
    }
    ;
    if (!options.embed.description) {
        options.embed.description = '```{{statement1}}```\n**but**\n\n```{{statement2}}```';
    }
    ;
    if (typeof options.embed.description !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " embed.description must be a string.");
    }
    ;
    const id1 = getRandomString(20) +
        '-' +
        getRandomString(20);
    const id2 = getRandomString(20) +
        '-' +
        getRandomString(20);
    let oldDescription = options.embed.description ?? "```{{statement1}}```\n**but**\n\n```{{statement2}}```";
    options.embed.title = options.embed.title ?? "Will You Press The Button?";
    options.embed.description = options.thinkMessage ? options.thinkMessage : "I am thinking";
    let embed = createEmbed(options.embed);
    const think = await message.reply({
        embeds: [embed],
    });
    const fetchedData = await getButtonDilemma();
    const res = {
        questions: [fetchedData.question, fetchedData.result],
        percentage: {
            1: fetchedData.yesNo.yes.persend,
            2: fetchedData.yesNo.no.persend,
        }
    };
    let btn = new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(options.button.yes)
        .setCustomId(id1);
    let btn2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(options.button.no)
        .setCustomId(id2);
    options.embed.description = oldDescription.replace('{{statement1}}', res.questions[0].charAt(0).toUpperCase() + res.questions[0].slice(1)).replace('{{statement2}}', res.questions[1].charAt(0).toUpperCase() + res.questions[1].slice(1));
    embed = createEmbed(options.embed);
    await think.edit({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(btn, btn2)]
    });
    const gameCollector = think.createMessageComponentCollector({
        time: options.time ? options.time : 60000,
    });
    gameCollector.on('collect', async (wyptb) => {
        if (wyptb.user.id !== id) {
            return wyptb.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `Only <@${id}> can use the buttons!`,
                flags: [MessageFlags.Ephemeral]
            });
        }
        ;
        await wyptb.deferUpdate();
        if (wyptb.customId === id1) {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel(`${options.button ? options.button.yes ? options.button.yes : 'Yes' : 'Yes'} (${res.percentage['1']})`)
                .setDisabled()
                .setCustomId(id1);
            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(`${options.button ? options.button.no ? options.button.no : 'No' : 'No'} (${res.percentage['2']})`)
                .setDisabled()
                .setCustomId(id2);
            gameCollector.stop();
            embed.setTimestamp(new Date());
            await wyptb.editReply({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(btn, btn2)]
            });
        }
        else if (wyptb.customId === id2) {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(`${options.button ? options.button.yes ? options.button.yes : 'Yes' : 'Yes'} (${res.percentage['1']})`)
                .setDisabled()
                .setCustomId(id1);
            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel(`${options.button ? options.button.no ? options.button.no : 'No' : 'No'} (${res.percentage['2']})`)
                .setDisabled()
                .setCustomId(id2);
            gameCollector.stop();
            embed.setTimestamp(new Date());
            await wyptb.editReply({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(btn, btn2)]
            });
        }
    });
    checkPackageUpdates("WillYouPressTheButton", options.notifyUpdate);
};
export default WillYouPressTheButton;
