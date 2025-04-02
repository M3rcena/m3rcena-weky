import chalk from "chalk";
import {
    ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction,
    ComponentType, DMChannel, EmbedBuilder, Message, NewsChannel, PrivateThreadChannel,
    PublicThreadChannel, StageChannel, TextChannel, VoiceChannel
} from "discord.js";

import {
    checkPackageUpdates, convertTime, createEmbed, getRandomSentence, getRandomString
} from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";

import type { Chaos, Fields } from "../Types/";

const data = new Set();

const ChaosWords = async (options: Chaos) => {
    // Check types
    OptionsChecking(options, "ChaosWords")

    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");

    if (!interaction.channel) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No channel found on Interaction.");

    if (!interaction.channel.isSendable()) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " Channel is not sendable.");

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
        '-' +
        getRandomString(20);

    let tries = 0;
    const array: string[] = [];
    let remaining = 0;
    const guessed: string[] = [];

    let words = options.words ? options.words : getRandomSentence(Math.floor(Math.random() * 6) + 2);
    let charGenerated = options.charGenerated ? options.charGenerated : options.words ? options.words.join('').length - 1 : 0;
    if (words.join('').length > charGenerated) {
        charGenerated = words.join('').length - 1;
    };

    for (let i = 0; i < charGenerated; i++) {
        array.push(
            'abcdefghijklmnopqrstuvwxyz'.charAt(
                Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyz'.length),
            ),
        );
    };

    words.forEach((e) => {
        array.splice(Math.floor(Math.random() * array.length), 0, e)
    });

    let fields: Fields[] = [];
    if (!options.embed.fields) {
        fields = [
            {
                name: 'Sentence:',
                value: array.join('')
            },
            {
                name: 'Words Founds:',
                value: `${remaining} / ${words.length}`
            },
            {
                name: 'Words Found / Remaining:',
                value: `${guessed.join(', ')}`
            },
            {
                name: 'Words:',
                value: words.join(', ')
            }
        ]
    }

    let embed = createEmbed(options.embed)
        .setDescription(
            options.embed.description ?
                options.embed.description.replace('{{time}}', convertTime(options.time ? options.time : 60000)) :
                `You have **${convertTime(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`
        );

    if (!options.embed.fields) {
        fields = [
            {
                name: 'Sentence:',
                value: array.join('')
            },
            {
                name: 'Words Founds:',
                value: `${remaining} / ${words.length}`
            },
            {
                name: 'Words Found / Remaining:',
                value: `${guessed.join(', ')}`
            },
            {
                name: 'Words:',
                value: words.join(', ')
            }
        ]

        let _field: Fields[] = [];
        fields.map((field, index) => {
            if (index < 2) {
                _field.push({
                    name: `${field.name}`,
                    value: `${field.value}`
                })
            }
        })
        embed.setFields(_field);
    }

    let btn1 = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(options.buttonText ? options.buttonText : "Cancel")
        .setCustomId(ids);

    const msg = await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)]
    });

    const gameCreatedAt = Date.now();
    const filter = (m: Message) => m.author.id === id;
    let game;
    if (interaction instanceof Message) {
        game = await (interaction.channel as TextChannel).createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        })
    } else {
        if (!interaction.channel || !interaction.channel.isTextBased()) return;
        game = (interaction.channel as VoiceChannel | TextChannel | NewsChannel | DMChannel | StageChannel | PublicThreadChannel | PrivateThreadChannel).createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        });
    };

    if (!interaction.channel || !interaction.channel.isSendable()) return;
    game.on('collect', async (mes: Message) => {
        if (words === undefined) return;
        const condition =
            words.includes(mes.content.toLowerCase()) &&
            !guessed.includes(mes.content.toLowerCase());

        if (condition) {
            remaining++;
            array.splice(array.indexOf(mes.content.toLowerCase()), 1);
            guessed.push(mes.content.toLowerCase());
            let _embed = createEmbed(options.embed)
                .setDescription(
                    options.embed.description ?
                        options.embed.description.replace(
                            '{{time}}',
                            convertTime(options.time ? options.time : 60000)
                        ) :
                        `You have **${convertTime(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`
                );

            if (!options.embed.fields) {
                fields = [
                    {
                        name: 'Sentence:',
                        value: array.join('')
                    },
                    {
                        name: 'Words Founds:',
                        value: `${remaining} / ${words.length}`
                    },
                    {
                        name: 'Words Found / Remaining:',
                        value: `${guessed.join(', ')}`
                    },
                    {
                        name: 'Words:',
                        value: words.join(', ')
                    }
                ]

                let _field: Fields[] = [];
                fields.map((field, index) => {
                    if (index < 3) {
                        _field.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        })
                    }
                })
                _embed.setFields(_field);
            };

            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setCustomId(ids);

            await msg.edit({
                embeds: [_embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)]
            });

            if (remaining === words.length) {
                if (!interaction.channel || !interaction.channel.isSendable()) return;
                btn1 = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(options.buttonText ? options.buttonText : "Cancel")
                    .setDisabled()
                    .setCustomId(ids);

                await msg.edit({
                    embeds: [embed],
                    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)]
                });

                const time = convertTime(Date.now() - gameCreatedAt);
                let __embed = createEmbed(options.embed)
                    .setDescription(options.winMessage ? options.winMessage.replace('{{time}}', time) : `You found all the words in **${time}**`);

                if (!options.embed.fields) {
                    fields = [
                        {
                            name: 'Sentence:',
                            value: array.join('')
                        },
                        {
                            name: 'Words Founds:',
                            value: `${remaining} / ${words.length}`
                        },
                        {
                            name: 'Words Found / Remaining:',
                            value: `${guessed.join(', ')}`
                        },
                        {
                            name: 'Words:',
                            value: words.join(', ')
                        }
                    ]

                    let _field: Fields[] = [];
                    fields.map((field, index) => {
                        if (index === 0) {
                            _field.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            })
                        } else if (index === 3) {
                            _field.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            })
                        }
                    })
                    __embed.setFields(_field);
                };

                await msg.edit({
                    embeds: [__embed],
                    components: []
                });

                await interaction.channel.send({
                    embeds: [__embed],
                })
                data.delete(id);
                return game.stop();
            }

            const __embed = createEmbed(options.embed, true)
                .setDescription(`
                    ${options.correctWord ?
                        options.correctWord
                            .replace('{{word}}', mes.content.toLowerCase())
                            .replace('{{remaining}}', `${words.length - remaining}`)
                        : `GG, **${mes.content.toLowerCase()}** was correct! You have to find **${words.length - remaining}** more word(s).`}
                    `);

            mes.reply({
                embeds: [__embed],
            });
        } else {
            tries++;
            if (tries === (options.maxTries ? options.maxTries : 10)) {
                const _embed = createEmbed(options.embed)
                    .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`);

                if (!options.embed.fields) {
                    fields = [
                        {
                            name: 'Sentence:',
                            value: array.join('')
                        },
                        {
                            name: 'Words Founds:',
                            value: `${remaining} / ${words.length}`
                        },
                        {
                            name: 'Words Found / Remaining:',
                            value: `${guessed.join(', ')}`
                        },
                        {
                            name: 'Words:',
                            value: words.join(', ')
                        }
                    ]

                    let _fields: Fields[] = [];
                    fields.map((field, index) => {
                        if (index === 0) {
                            _fields.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            })
                        } else if (index === 3) {
                            _fields.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            })
                        }
                    })
                    _embed.setFields(_fields);
                };

                btn1 = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(options.buttonText ? options.buttonText : "Cancel")
                    .setDisabled()
                    .setCustomId(ids);

                await msg.edit({
                    embeds: [_embed],
                    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)]
                });

                if (!interaction.channel || !interaction.channel.isSendable()) return;
                await interaction.channel.send({
                    embeds: [_embed],
                });
                data.delete(id);
                return game.stop();
            };
            const _embed = createEmbed(options.embed, true)
                .setDescription(`
                    ${options.wrongWord ?
                        options.wrongWord.replace(
                            `{{remaining_tries}}`,
                            `${options.maxTries ? options.maxTries : 10 - tries}`
                        ) :
                        `**${mes.content.toLowerCase()}** is not the correct word. You have **${options.maxTries ? options.maxTries : 10 - tries}** tries left.`}
                    `);

            mes.reply({
                embeds: [_embed],
            });
        }
    });

    game.on('end', (mes, reason: string) => {
        if (reason === 'time') {
            const _embed = createEmbed(options.embed)
                .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`);

            if (!options.embed.fields) {
                fields = [
                    {
                        name: 'Sentence:',
                        value: array.join('')
                    },
                    {
                        name: 'Words Founds:',
                        value: `${remaining} / ${words.length}`
                    },
                    {
                        name: 'Words Found / Remaining:',
                        value: `${guessed.join(', ')}`
                    },
                    {
                        name: 'Words:',
                        value: words.join(', ')
                    }
                ]

                let _fields: Fields[] = [];
                fields.map((field, index) => {
                    if (index === 0) {
                        _fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        })
                    } else if (index === 3) {
                        _fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        })
                    }
                })
                _embed.setFields(_fields);

                let __fields: Fields[] = [];
                fields.map((field, index) => {
                    if (index < 2) {
                        __fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        })
                    }
                });
                embed.setFields(__fields);
            };

            btn1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);

            msg.edit({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)]
            });

            if (!interaction.channel || !interaction.channel.isSendable()) return;
            data.delete(id);
            interaction.channel.send({
                embeds: [_embed],
            });
        }
    });

    const gameCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
    });

    gameCollector.on('collect', async (button: ButtonInteraction) => {
        await button.deferUpdate();

        btn1 = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(options.buttonText ? options.buttonText : "Cancel")
            .setDisabled()
            .setCustomId(ids);

        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        } else {
            fields = [
                {
                    name: 'Sentence:',
                    value: array.join('')
                },
                {
                    name: 'Words Founds:',
                    value: `${remaining} / ${words.length}`
                },
                {
                    name: 'Words Found / Remaining:',
                    value: `${guessed.join(', ')}`
                },
                {
                    name: 'Words:',
                    value: words.join(', ')
                }
            ]

            let _fields: Fields[] = [];
            fields.map((field, index) => {
                if (index < 2) {
                    _fields.push({
                        name: `${field.name}`,
                        value: `${field.value}`
                    })
                }
            });
            embed.setFields(_fields);
        }

        await msg.edit({
            embeds: [embed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn1)]
        });

        const _embed = createEmbed(options.embed, true)
            .setDescription(options.loseMessage ? options.loseMessage : `The game has been stopped by <@${id}>`);

        if (!interaction.channel || !interaction.channel.isSendable()) return;
        await interaction.channel.send({
            embeds: [_embed],
        });
        data.delete(id);
        gameCollector.stop();
        return game.stop();
    });

    checkPackageUpdates("ChaosWords", options.notifyUpdate);
};

export default ChaosWords;
