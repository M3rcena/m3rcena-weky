import chalk from "chalk";
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ComponentType, MessageFlags
} from "discord.js";

import { checkPackageUpdates, createEmbed, getRandomString } from "../../functions/functions.js";
import { OptionsChecking } from "../../functions/OptionChecking.js";

import type { NeverHaveIEverTypes } from "../../Types";

const NeverHaveIEver = async (options: NeverHaveIEverTypes) => {
    // Check type
    OptionsChecking(options, "NeverHaveIEver");

    // Check if the interaction object is provided
    let interaction = options.interaction;

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " No interaction provided.");

    let client: Client = options.client;

    if (!options.thinkMessage) options.thinkMessage = "I am thinking";
    if (typeof options.thinkMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " thinkMessage must be a string.");
    };

    if (!options.othersMessage) {
        options.othersMessage = "Only <@{{author}}> can use the buttons!";
    };
    if (typeof options.othersMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " othersMessage must be a string.");
    };

    if (!options.buttons) options.buttons = {};
    if (typeof options.buttons !== "object") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " buttons must be an object.");
    };

    if (!options.buttons.optionA) options.buttons.optionA = "Yes";
    if (typeof options.buttons.optionA !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " button must be a string.");
    };

    if (!options.buttons.optionB) options.buttons.optionB = "No";
    if (typeof options.buttons.optionB !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " button must be a string.");
    };

    const id1 =
        getRandomString(20) +
        "-" +
        getRandomString(20);

    const id2 =
        getRandomString(20) +
        "-" +
        getRandomString(20);

    let id = interaction.user.id;

    options.embed.description = options.thinkMessage ? options.thinkMessage : "I am thinking..."
    let embed = createEmbed(options.embed);

    const think = await interaction.reply({
        embeds: [embed]
    });

    interface ApiResponse {
        statement: string;
    }

    let { statement } = await fetch("https://api.nhie.io/v2/statements/next?language=en&category=harmless")
        .then((res) => res.json() as Promise<ApiResponse>);

    if (!statement) {
        let owner = await client.users.fetch("682983233851228161");

        if (owner) {
            await owner.send({
                content: "NHIE API is down, please fix it as soon as possible!"
            }).catch(() => { });
        };

        return await think.edit({
            content: "Failed to fetch statement from API",
            embeds: [],
            components: []
        });
    }

    statement = statement.trim();

    let btn = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel(options.buttons.optionA ? options.buttons.optionA : "Yes")
        .setCustomId(id1);

    let btn2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel(options.buttons.optionB ? options.buttons.optionB : "No")
        .setCustomId(id2);

    options.embed.description = statement;
    embed = createEmbed(options.embed);

    await think.edit({
        embeds: [embed],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn, btn2)]
    });

    const gameCollector = think.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: options.time ? options.time : 60000
    });

    gameCollector.on("collect", async (nhie) => {
        if (nhie.user.id !== id) {
            return nhie.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace(
                        '{{author}}',
                        id
                    ) :
                    `Only <@${id}> can use the buttons!`,
                flags: [MessageFlags.Ephemeral]
            });
        };

        await nhie.deferUpdate();

        if (nhie.customId === id1) {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();

            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();

            gameCollector.stop();
            await think.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn, btn2)]
            });
        } else if (nhie.customId === id2) {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();

            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();

            gameCollector.stop();
            await think.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn, btn2)]
            });
        };
    });

    gameCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();

            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();

            embed.setDescription(statement + "\n\n**The game has ended!**");

            await think.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn, btn2)]
            });
        };
    })

    checkPackageUpdates("NeverHaveIEver", options.notifyUpdate);
};

export default NeverHaveIEver;