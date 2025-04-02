import chalk from "chalk";
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client,
	ComponentType, Message
} from "discord.js";

import {
	checkPackageUpdates, convertTime, createEmbed, getRandomString
} from "../functions/functions";
import { OptionsChecking } from "../functions/OptionChecking";

import type { GuessTheNumberTypes } from "../Types/";
const db = new Map();

const data = new Set();
const currentGames: any = new Object();

const GuessTheNumber = async (options: GuessTheNumberTypes) => {
    OptionsChecking(options, 'GuessTheNumber');

    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");

    let client: Client = options.client;

    let id: string = "";
    if ((options.interaction as Message).author) {
        id = (options.interaction as Message).author.id;
    } else {
        id = (options.interaction as ChatInputCommandInteraction).user.id;
    };

    if (!interaction.guild) {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " Guild is not available in this interaction.");
    };

    if (!interaction.channel || !interaction.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " Channel is not available in this interaction.");
    }

    if (!options.ongoingMessage) {
        options.ongoingMessage = "A game is already running in <#{{channel}}>. Try again later!";
    };
    if (typeof options.ongoingMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " ongoingMessage must be a string.");
    };

    if (!options.returnWinner) {
        options.returnWinner = false;
    };
    if (typeof options.returnWinner !== 'boolean') {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " returnWinner must be a boolean.");
    };

    if (!options.winMessage) options.winMessage = {};
    let winMessage = options.winMessage;
    if (typeof winMessage !== 'object') {
        throw new TypeError('Weky Error: winMessage must be an object.');
    }

    let winMessagePublicGame: string;
    if (!options.winMessage.publicGame) {
        winMessagePublicGame =
            'GG, The number which I guessed was **{{number}}**. <@{{winner}}> made it in **{{time}}**.\n\n__**Stats of the game:**__\n**Duration**: {{time}}\n**Number of participants**: {{totalparticipants}} Participants\n**Participants**: {{participants}}';
    } else {
        winMessagePublicGame = options.winMessage.publicGame;
    }
    if (typeof winMessagePublicGame !== 'string') {
        throw new TypeError('Weky Error: winMessage must be a string.');
    }

    let winMessagePrivateGame: string;
    if (!options.winMessage.privateGame) {
        winMessagePrivateGame =
            'GG, The number which I guessed was **{{number}}**. You made it in **{{time}}**.';
    } else {
        winMessagePrivateGame = options.winMessage.privateGame;
    }
    if (typeof winMessagePrivateGame !== 'string') {
        throw new TypeError('Weky Error: winMessage must be a string.');
    }

    const ids =
        getRandomString(20) +
        '-' +
        getRandomString(20);

    let number: number;
    if (!options.number) {
        number = Math.floor(Math.random() * 1000);
    } else {
        number = options.number;
    };
    if (typeof number !== "number") {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " number must be a number.");
    }

    const handleGame = async (isPublic: boolean) => {
        const participants: string[] = [];

        if (isPublic && currentGames[interaction.guild.id]) {
            options.embed.description = options.ongoingMessage.replace(
                /{{channel}}/g,
                currentGames[`${interaction.guild.id}_channel`]
            );
            return await interaction.reply({
                embeds: [createEmbed(options.embed)]
            });
        }

        if (!isPublic && data.has(id)) return;
        if (!isPublic) data.add(id);

        options.embed.description = options.embed.description ?
            options.embed.description.replace(/{{time}}/g, convertTime(options.time ? options.time : 60000)) :
            "You have **{{time}}** to guess the number.".replace(/{{time}}/g, convertTime(options.time ? options.time : 60000));

        const embed = createEmbed(options.embed);
        const btn1 = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(options.button ? options.button : "Cancel")
            .setCustomId(ids);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btn1);

        const msg = await (interaction as Message || interaction as ChatInputCommandInteraction).reply({
            embeds: [embed],
            components: [row]
        });

        const gameCreatedAt = Date.now();

        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => isPublic ? !m.author.bot : m.author.id === id,
            time: options.time ? options.time : 60000
        });

        const gameCollector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
        });

        if (isPublic) {
            currentGames[interaction.guild.id] = true;
            currentGames[`${interaction.guild.id}_channel`] = interaction.channel.id;
        }

        collector.on('collect', async (_msg) => {
            if (isPublic && !participants.includes(_msg.author.id)) {
                participants.push(_msg.author.id);
            }

            const parsedNumber = parseInt(_msg.content, 10);

            if (parsedNumber === number) {
                const time = convertTime(Date.now() - gameCreatedAt);
                options.embed.description = isPublic ?
                    winMessagePublicGame
                        .replace(/{{number}}/g, number.toString())
                        .replace(/{{winner}}/g, _msg.author.id)
                        .replace(/{{time}}/g, time)
                        .replace(/{{totalparticipants}}/g, `${participants.length}`)
                        .replace(/{{participants}}/g, participants.map((p) => '<@' + p + '>').join(', ')) :
                    winMessagePrivateGame
                        .replace(/{{time}}/g, time)
                        .replace(/{{number}}/g, `${number}`);

                let _embed = createEmbed(options.embed);

                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btn1);
                await msg.edit({
                    embeds: [embed],
                    components: [row]
                });
                _msg.reply({ embeds: [_embed] });

                gameCollector.stop();
                collector.stop();

                if (options.returnWinner) {
                    if (!options.gameID) {
                        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " gameID must be provided.");
                    };
                    if (typeof options.gameID !== "string") {
                        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " gameID must be a string.");
                    };
                    db.set(
                        `GuessTheNumber_${interaction.guild.id}_${options.gameID}`,
                        _msg.author.id
                    );
                }
            }

            const compareResponse = (comparison: 'bigger' | 'smaller') => {
                options.embed.description = options[comparison === 'bigger' ? 'bigNumber' : 'smallNumber'] ?
                    options[comparison === 'bigger' ? 'bigNumber' : 'smallNumber']
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is ${comparison} than **${parsedNumber}**!`;

                return _msg.reply({ embeds: [createEmbed(options.embed)] });
            };

            if (parsedNumber < number) compareResponse('bigger');
            if (parsedNumber > number) compareResponse('smaller');
        });

        gameCollector.on('collect', async (button) => {
            if (button.user.id !== id) {
                return button.reply({
                    content: options.otherMessage ?
                        options.otherMessage.replace(
                            /{{author}}/g,
                            id
                        ) :
                        "This is not your game!",
                    ephemeral: true,
                })
            }

            await button.deferUpdate();

            if (button.customId === ids) {
                btn1.setDisabled(true);
                gameCollector.stop();
                collector.stop();
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });

                options.embed.description = options.loseMessage ?
                    options.loseMessage.replace(
                        /{{number/g,
                        `${number}`) :
                    `The number was **${number}**!`
                let _embed = createEmbed(options.embed);

                msg.edit({ embeds: [_embed] });
            }
        });

        collector.on('end', async (_collected, reason) => {
            if (reason === 'time') {
                options.embed.description = options.loseMessage ?
                    options.loseMessage.replace(
                        /{{number}}/g,
                        `${number}`
                    ) :
                    `The number was **${number}**!`
                let _embed = createEmbed(options.embed);

                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btn1);
                await msg.edit({
                    embeds: [embed],
                    components: [row]
                });

                if (!interaction.channel || !interaction.channel.isSendable()) return;
                return interaction.channel.send({ embeds: [_embed] });
            }
            data.delete(id);
            currentGames[interaction.guild.id] = false;
        });
    };

    await handleGame(options.publicGame ?? false);

    checkPackageUpdates("GuessTheNumber", options.notifyUpdate);
};

export default GuessTheNumber;