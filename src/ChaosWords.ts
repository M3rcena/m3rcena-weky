import { ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Client, ComponentType, EmbedBuilder, Message } from "discord.js";
import type { Chaos, Fields } from "../typings"
import chalk from "chalk";
import { convertTime, getRandomSentence, getRandomString } from "../functions/functions.js";
const data = new Set();

const ChaosWords = async (options: Chaos) => {
    // Check if the options object is provided
    if (!options) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No options provided.");

    if (typeof options !== "object") throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Options must be an object.");

    // Check if the interaction object is provided
    let interaction;
    if (!options.interaction) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");

    if (typeof options.interaction !== "object") {
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Interaction must be an object.");
    };

    if (options.interaction instanceof Message) {
        interaction: Message
        interaction = options.interaction;
    } else if (options.interaction instanceof ChatInputCommandInteraction) {
        interaction: ChatInputCommandInteraction
        interaction = options.interaction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");

    if (!options.client) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No client provided.");

    if (!options.client as unknown as Object instanceof Client) {
        throw new Error(chalk.red("[@m3rcena/weky] Calculator TypeError:") + " Client must be a Discord Client.");
    };

    let client: Client = options.client;
    // Check if the embed object is provided

    if (!options.embed) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No embed options provided.");

    if (typeof options.embed !== "object") {
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed options must be an object.");
    };

    if (!options.embed.color) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No embed color provided.");

    if (!options.embed.title) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No embed title provided.");

    if (options.embed.url && typeof options.embed.url !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed URL must be a string.");
    };

    if (options.embed.author) {
        if (typeof options.embed.author !== "object") {
            throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed author must be an object.");
        };

        if (!options.embed.author.name) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No embed author name provided.");

        if (options.embed.author.icon_url && typeof options.embed.author.icon_url !== "string") {
            throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed author icon URL must be a string.");
        };

        if (options.embed.author.url && typeof options.embed.author.url !== "string") {
            throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed author URL must be a string.");
        };
    };

    if (options.embed.description && typeof options.embed.description !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed description must be a string.");
    };

    if (options.embed.fields) {
        if (!Array.isArray(options.embed.fields)) {
            throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed fields must be an array.");
        };

        for (const field of options.embed.fields) {
            if (typeof field !== "object") {
                throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed field must be an object.");
            };

            if (!field.name) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No embed field name provided.");

            if (!field.value) throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No embed field value provided.");

            if (field.inline && typeof field.inline !== "boolean") {
                throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed field inline must be a boolean.");
            };
        };
    };

    if (options.embed.image && typeof options.embed.image !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed image must be a string.");
    };

    if (options.embed.timestamp && !(options.embed.timestamp instanceof Date)) {
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords TypeError:") + " Embed timestamp must be a date.");
    };

    let id: string = "";
    if (options.interaction instanceof Message) {
        id = options.interaction.author.id;
    } else if (options.interaction instanceof ChatInputCommandInteraction) {
        id = options.interaction.user.id;
    }

    if (data.has(id)) return;
    data.add(id);

    const ids =
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
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

    const arr = array.join('');

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

    let embed = new EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(
            options.embed.description ?
                options.embed.description.replace('{{time}}', convertTime(options.time ? options.time : 60000)) :
                `You have **${convertTime(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`
        )
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)

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
        components: [{ type: 1, components: [btn1] }]
    });

    const gameCreatedAt = Date.now();
    const filter = (m: Message) => m.author.id === id;
    let game;
    if (interaction instanceof Message) {
        game = await interaction.channel.createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        })
    } else {
        if (!interaction.channel || !interaction.channel.isTextBased()) return;
        game = interaction.channel.createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        });
    };

    game.on('collect', async (mes: Message) => {
        if (words === undefined) return;
        const condition =
            words.includes(mes.content.toLowerCase()) &&
            !guessed.includes(mes.content.toLowerCase());

        if (condition) {
            remaining++;
            array.splice(array.indexOf(mes.content.toLowerCase()), 1);
            guessed.push(mes.content.toLowerCase());
            let _embed = new EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(
                    options.embed.description ?
                        options.embed.description.replace(
                            '{{time}}',
                            convertTime(options.time ? options.time : 60000)
                        ) :
                        `You have **${convertTime(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`
                )
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)

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

            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
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

            msg.edit({
                embeds: [_embed],
                components: [{ type: 1, components: [btn1] }]
            });

            if (remaining === words.length) {
                btn1 = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(options.buttonText ? options.buttonText : "Cancel")
                    .setDisabled()
                    .setCustomId(ids);

                msg.edit({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [btn1]
                    }]
                });

                const time = convertTime(Date.now() - gameCreatedAt);
                let __embed = new EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.winMessage ? options.winMessage.replace('{{time}}', time) : `You found all the words in **${time}**`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null);

                if (options.embed.author) {
                    __embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                };

                if (options.embed.footer) {
                    __embed.setFooter({
                        text: options.embed.footer.text,
                        iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                    });
                };

                if (options.embed.fields) {
                    __embed.setFields(options.embed.fields);
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

                msg.edit({
                    embeds: [__embed],
                    components: []
                });

                interaction.reply({
                    embeds: [__embed],
                })
                data.delete(id);
                return game.stop();
            }

            const __embed = new EmbedBuilder()
                .setDescription(`
                    ${options.correctWord ?
                        options.correctWord
                            .replace('{{word}}', mes.content.toLowerCase())
                            .replace('{{remaining}}', `${words.length - remaining}`)
                        : `GG, **${mes.content.toLowerCase()}** was correct! You have to find **${words.length - remaining}** more word(s).`}
                    `)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null);

            if (options.embed.footer) {
                __embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            mes.reply({
                embeds: [__embed],
            });
        } else {
            tries++;
            if (tries === (options.maxTries ? options.maxTries : 10)) {
                const _embed = new EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`)
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

                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
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

                msg.edit({
                    embeds: [_embed],
                    components: [{ type: 1, components: [btn1] }]
                });

                interaction.reply({
                    embeds: [_embed],
                });
                data.delete(id);
                return game.stop();
            };
            const _embed = new EmbedBuilder()
                .setDescription(`
                    ${options.wrongWord ?
                        options.wrongWord.replace(
                            `{{remaining_tries}}`,
                            `${options.maxTries ? options.maxTries : 10 - tries}`
                        ) :
                        `**${mes.content.toLowerCase()}** is not the correct word. You have **${options.maxTries ? options.maxTries : 10 - tries}** tries left.`}
                    `)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null);

            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            }

            mes.reply({
                embeds: [_embed],
            });
        }
    });

    game.on('end', (mes, reason: string) => {
        if (reason === 'time') {
            const _embed = new EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`)
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

            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
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
                components: [{ type: 1, components: [btn1] }]
            });

            data.delete(id);
            interaction.reply({
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
        
        msg.edit({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }]
        });

        const _embed = new EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.loseMessage ? options.loseMessage : `The game has been stopped by <@${id}>`)
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

        interaction.reply({
            embeds: [_embed],
        });
        data.delete(id);
        gameCollector.stop();
        return game.stop();
    })
};

export default ChaosWords;