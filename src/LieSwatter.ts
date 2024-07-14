import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, ComponentType, EmbedBuilder, Message } from "discord.js";
import { LieSwatterTypes } from "../typings";
import chalk from "chalk";
import { checkPackageUpdates, convertTime, getRandomString } from "../functions/functions.js";
import { decode } from "html-entities";
import { OptionsChecking } from "../functions/OptionChecking.js";

const LieSwatter = async (options: LieSwatterTypes) => {
    // Check types
    OptionsChecking(options, "LieSwatter")

    let interaction;

    if (options.interaction instanceof Message) {
        interaction: Message
        interaction = options.interaction;
    } else if (options.interaction instanceof ChatInputCommandInteraction) {
        interaction: ChatInputCommandInteraction
        interaction = options.interaction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] LieSwatter Error:") + " No interaction provided.");

    let client: Client = options.client;
    // Check if the embed object is provided

    let id: string = "";
    if (options.interaction instanceof Message) {
        id = options.interaction.author.id;
    } else if (options.interaction instanceof ChatInputCommandInteraction) {
        id = options.interaction.user.id;
    };

    const id1 =
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20);

    const id2 = getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20);

    if (!options.winMessage) options.winMessage = "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";

    if (typeof options.winMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Win message must be a string.");
    };

    if (!options.loseMessage) options.loseMessage = "Better luck next time! It was a **{{answer}}**.";

    if (typeof options.loseMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Lose message must be a string.");
    };

    if (!options.othersMessage) options.othersMessage = "Only <@{{author}}> can use the buttons!";
    if (typeof options.othersMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Others message must be a string.");
    };

    if (!options.buttons) options.buttons = {
        true: "Truth",
        lie: "Lie"
    };

    if (typeof options.buttons !== "object") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Buttons must be an object.");
    };

    if (!options.buttons.true) options.buttons.true = "Truth";
    if (typeof options.buttons.true !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " True button text must be a string.");
    };

    if (!options.buttons.lie) options.buttons.lie = "Lie";
    if (typeof options.buttons.lie !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Lie button text must be a string.");
    };

    if (!options.thinkMessage) options.thinkMessage = "I am thinking...";
    if (typeof options.thinkMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Think message must be a string.");
    };

    let embed = new EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.thinkMessage)
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
    }
    const msg = await interaction.reply({
        embeds: [embed]
    });

    const result = await fetch(
        `https://opentdb.com/api.php?amount=1&type=boolean`,
    ).then((res) => res.json());

    const question = result.results[0];

    let answer: string;
    let winningID: string;
    if (question.correct_answer === "True") {
        winningID = id1;
        answer = options.buttons.true;
    } else {
        winningID = id2;
        answer = options.buttons.lie;
    };

    let btn1 = new ButtonBuilder()
        .setCustomId(id1)
        .setLabel(options.buttons.true)
        .setStyle(ButtonStyle.Primary);

    let btn2 = new ButtonBuilder()
        .setCustomId(id2)
        .setLabel(options.buttons.lie)
        .setStyle(ButtonStyle.Primary);

    embed = new EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(decode(question.question))
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? new Date() : null)
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
    };

    await msg.edit({
        embeds: [embed],
        components: [
            { type: 1, components: [btn1, btn2] }
        ]
    });

    const gameCreatedAt = Date.now();
    const gameCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
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
            btn1 = new ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();

            btn2 = new ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();
            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(ButtonStyle.Success);
                btn2.setStyle(ButtonStyle.Danger);
            } else {
                btn1.setStyle(ButtonStyle.Danger);
                btn2.setStyle(ButtonStyle.Success);
            }

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }]
            });
            const time = convertTime(Date.now() - gameCreatedAt);

            const winEmbed = new EmbedBuilder()
                .setDescription(
                    `${options.winMessage ?
                        options.winMessage
                            .replace(`{{answer}}`, decode(answer))
                            .replace(`{{time}}`, time) :
                        `GG, It was a **${decode(answer)}**. You got it correct in **${time}**.`
                    }`
                )
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.author) {
                winEmbed.setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                });
            };

            if (options.embed.footer) {
                winEmbed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            await interaction.reply({
                embeds: [winEmbed]
            });
        } else {
            btn1 = new ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();

            btn2 = new ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();

            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(ButtonStyle.Success);
                btn2.setStyle(ButtonStyle.Danger);
            } else {
                btn1.setStyle(ButtonStyle.Danger);
                btn2.setStyle(ButtonStyle.Success);
            }

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }]
            });

            const lostEmbed = new EmbedBuilder()
                .setDescription(
                    `${options.loseMessage ? 
                        options.loseMessage.replace('{{answer}}', decode(answer)) :
                        `Better luck next time! It was a **${decode(answer)}**.`
                    }`
                )
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.author) {
                lostEmbed.setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                });
            };

            if (options.embed.footer) {
                lostEmbed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            interaction.reply({
                embeds: [lostEmbed]
            })
        }
    });

    gameCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
            btn1 = new ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();

            btn2 = new ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();

            if (winningID === id1) {
                btn1.setStyle(ButtonStyle.Success);
                btn2.setStyle(ButtonStyle.Danger);
            } else {
                btn1.setStyle(ButtonStyle.Danger);
                btn2.setStyle(ButtonStyle.Success);
            }

            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }]
            });

            const lostEmbed = new EmbedBuilder()
                .setDescription(
                    `${options.loseMessage ?
                        options.loseMessage.replace('{{answer}}', decode(answer)) :
                        `**You run out of Time**\nBetter luck next time! It was a **${decode(answer)}**.`
                    }`
                )
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.author) {
                lostEmbed.setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                });
            };

            if (options.embed.footer) {
                lostEmbed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            interaction.reply({
                embeds: [lostEmbed]
            });
        }
    })

    checkPackageUpdates();
};

export default LieSwatter;
