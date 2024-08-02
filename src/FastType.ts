import { ButtonStyle, ChatInputCommandInteraction, Client, Message, EmbedBuilder, ButtonBuilder, ComponentType } from "discord.js";
import type { FastTypeTyping } from "../typings";
import chalk from "chalk";
import { checkPackageUpdates, convertTime, getRandomSentence, getRandomString } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
const data = new Set();

const FastType = async (options: FastTypeTyping) => {
    // Check type
    OptionsChecking(options, "FastType")

    // Check if the interaction object is provided
    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");

    let client: Client = options.client;

    let id: string = "";
    if ((options.interaction as Message).author) {
        id = (options.interaction as Message).author.id;
    } else {
        id = (options.interaction as ChatInputCommandInteraction).user.id;
    }

    if (data.has(id)) return;
    data.add(id);

    const ids =
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
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

    const embed = new EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(
            `${options.embed.description ?
                options.embed.description.replace(
                    '{{time}}',
                    convertTime(options.time ? options.time : 60000),
                ) :
                `You have **${convertTime(options.time ? options.time : 60000)}** to type the sentence below.`
            }`
        )
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null);

    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    };

    if (options.embed.footer) {
        embed.setFooter({
            text: options.embed.footer.text,
            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
        });
    };

    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    } else {
        embed.addFields({ name: 'Sentence:', value: `${sentence}` });
    };

    const msg = await interaction.reply({
        embeds: [embed],
        components: [{ type: 1, components: [btn1] }],
    });

    if (!interaction.channel || !interaction.channel.isTextBased()) {
        throw new Error(chalk.red("[@m3rcena/weky] FastTyoe Error: ") + "Interaction channel is not a text channel.");
    }
    const collector = await interaction.channel.createMessageCollector({
        filter: (m: Message) => !m.author.bot && m.author.id === id,
        time: options.time ? options.time : 60000
    });

    collector.on("collect", async (mes: Message) => {
        if (mes.content.toLowerCase().trim() === sentence.toLowerCase()) {
            const time = Date.now() - gameCreatedAt;
            const minute = (time / 1000 / 60) % 60;
            const wpm = mes.content.toLowerCase().trim().length / 5 / minute;
            const _embed = new EmbedBuilder()
                .setDescription(
                    options.winMessage ?
                        options.winMessage
                            .replace('time', convertTime(time))
                            .replace('wpm', wpm.toFixed(2))
                        : `You have typed the sentence correctly in **${convertTime(time)}** with **${wpm.toFixed(2)}** WPM.` 
                )
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);
                
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            };

            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            interaction.reply({ embeds: [_embed] });
            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            collector.stop(mes.author.username);
            data.delete(id);
        } else {
            const _embed = new EmbedBuilder()
                .setDescription(options.loseMessage ? options.loseMessage : "Better Luck Next Time!")
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            };

            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            interaction.reply({ embeds: [_embed] });
            collector.stop(mes.author.username);
            data.delete(id);
            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
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
            const _embed = new EmbedBuilder()
                .setDescription(options.loseMessage ? options.loseMessage : "Better Luck Next Time!")
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            };

            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            interaction.reply({ embeds: [_embed] });
            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
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
        componentType: ComponentType.Button,
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
    
    checkPackageUpdates()
};

export default FastType;
