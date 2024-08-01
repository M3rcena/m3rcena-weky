import chalk from "chalk";
import type { Calc } from "../typings";
import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, Client, ComponentType, EmbedBuilder, Message, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createButton, getRandomString, addRow, checkPackageUpdates } from "../functions/functions.js";
import { evaluate } from "mathjs";
import { OptionsChecking } from "../functions/OptionChecking.js";

const Calculator = async (options: Calc) => {
    // Check type
    OptionsChecking(options, "Calculator")

    // Check if the interaction object is provided
    let interaction;

    if (options.interaction instanceof Message) {
        interaction: Message
        interaction = options.interaction;
    } else if (options.interaction instanceof ChatInputCommandInteraction) {
        interaction: ChatInputCommandInteraction
        interaction = options.interaction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " No interaction provided.");

    let client: Client = options.client;

    // Main calculator Program
    let str = ' ';
    let stringify = '```\n' + str + '\n```';

    const row: ActionRowBuilder<ButtonBuilder>[] = [];
    const row2: ActionRowBuilder<ButtonBuilder>[] = [];

    const button: ButtonBuilder[][] = new Array([], [], [], [], []);
    const buttons: ButtonBuilder[][] = new Array([], []);

    const text = [
        'DC',
        'RND',
        'SIN',
        'COS',
        'TAN',
        '^',
        'LG',
        'LN',
        '(',
        ')',
        'SQRT',
        '%',
        '÷',
        'AC',
        '⌫',
        'x!',
        '7',
        '8',
        '9',
        'x',
        '1/x',
        '4',
        '5',
        '6',
        ' - ',
    ];

    const text2 = [
        'π',
        '1',
        '2',
        '3',
        ' + ',
        'ans',
        'e',
        '0',
        '.',
        '='
    ]

    let cur = 0;
    let current = 0;

    for (let i = 0; i < text.length; i++) {
        if (button[current].length === 5) current++;
        button[current].push(
            createButton(text[i], false),
        );
        if (i === text.length - 1) {
            for (const btn of button) row.push(addRow(btn));
        }
    };

    current = 0;
    for (let z = 0; z < text2.length; z++) {
        if (buttons[current].length === 5) current++;
        buttons[current].push(
            createButton(text2[z], false),
        );
        if (z === text2.length - 1) {
            for (const btns of buttons) row2.push(addRow(btns));
        }
    }

    const iconURL = options.embed.footer ? options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined : undefined;
    let embed = new EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(stringify)
        .setColor(options.embed.color)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .addFields(options.embed.fields ? options.embed.fields : [])
        .setImage(options.embed.image ? options.embed.image : null)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null);

    if (options.embed.author) {
        const author = ({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        })
        embed.setAuthor(author);
    };

    if (options.embed.footer) {
        const footer = ({
            text: options.embed.footer.text,
            iconURL: iconURL ? iconURL : undefined
        })
        embed.setFooter(footer);
    }

    if (!interaction.channel || !interaction.channel.isTextBased()) {
        throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " Interaction must be a text-based channel.");
    }

    const channel = interaction.channel;


    options.interaction.reply({
        embeds: [embed],
        components: row,
        allowedMentions: { repliedUser: false }
    }).then(async (msg) => {
        let msg2 = await channel.send({
            components: row2,
        });
        async function edit() {
            let _embed = new EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(stringify)
                .setColor(options.embed.color)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .addFields(options.embed.fields ? options.embed.fields : [])
                .setImage(options.embed.image ? options.embed.image : null)
                .setTimestamp(new Date());

            if (options.embed.author) {
                const author = ({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                })
                _embed.setAuthor(author);
            };

            if (options.embed.footer) {
                const footer = ({
                    text: options.embed.footer.text,
                    iconURL: iconURL ? iconURL : undefined
                })
                _embed.setFooter(footer);
            };

            msg.edit({
                embeds: [_embed],
                components: row,
            })
        };

        async function lock(disabled: boolean) {
            let _embed = new EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(stringify)
                .setColor(options.embed.color)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .addFields(options.embed.fields ? options.embed.fields : [])
                .setImage(options.embed.image ? options.embed.image : null)
                .setTimestamp(new Date());

            if (options.embed.author) {
                const author = ({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                })
                _embed.setAuthor(author);
            };

            if (options.embed.footer) {
                const footer = ({
                    text: options.embed.footer.text,
                    iconURL: iconURL ? iconURL : undefined
                })
                _embed.setFooter(footer);
            };

            msg.edit({
                embeds: [_embed],
                components: [],
            });

            msg2.delete();
        }

        let id: string;
        if (interaction instanceof Message) {
            id = interaction.author.id;
        } else if (interaction instanceof ChatInputCommandInteraction) {
            id = interaction.user.id;
        }
        const calc = channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000,
        });

        let answer = '0';
        calc.on('collect', async (interact) => {
            if (interact.user.id !== id) {
                return interact.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(options.embed.title ? options.embed.title : 'Error | Weky Calculator')
                            .setDescription(`You are not allowed to interact with this calculator as you are not the user who initiated the command.\n\n**Note:** This calculator is only for the user <@${id}>`)
                            .setColor('Red')
                            .setTimestamp(new Date())
                    ],
                    ephemeral: true
                });
            }

            if (interact.customId !== 'calLG' 
                && interact.customId !== 'calSQRT'
                && interact.customId !== 'calRND'
                && interact.customId !== 'calSIN'
                && interact.customId !== 'calCOS'
                && interact.customId !== 'calTAN'
                && interact.customId !== 'calLN'
                && interact.customId !== 'cal1/x'
                && interact.customId !== 'calx!') await interact.deferUpdate();
            if (interact.customId === 'calAC') {
                str = ' ';
                stringify = '```\n' + str + '\n```';
                edit();
            } else if (interact.customId === 'calx') {
                str += ' * ';
                stringify = '```\n' + str + '\n```';
                edit();
            } else if (interact.customId === 'cal÷') {
                str += ' / ';
                stringify = '```\n' + str + '\n```';
                edit();
            } else if (interact.customId === 'cal⌫') {
                if (str === ' ' || str === '' || str === null || str === undefined) {
                    return;
                } else {
                    str.slice(0, -1);
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
            } else if (interact.customId === 'calLG') {
                const modal = new ModalBuilder()
                    .setTitle('Logarithm 10 (log10)')
                    .setCustomId('mdLog')

                const input = new TextInputBuilder()
                    .setCustomId('numberLog')
                    .setLabel('Enter the number to log10')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdLog') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberLog');
                        try {
                            str += 'log10(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calSQRT') {
                const modal = new ModalBuilder()
                    .setTitle('Square Root')
                    .setCustomId('mdSqrt')

                const input = new TextInputBuilder()
                    .setCustomId('numberSqrt')
                    .setLabel('Enter the number to square root')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdSqrt') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberSqrt');
                        try {
                            str += 'sqrt(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calRND') {
                const modal = new ModalBuilder()
                    .setTitle('Round Number')
                    .setCustomId('mdRnd')

                const input = new TextInputBuilder()
                    .setCustomId('numberRnd')
                    .setLabel('Enter the number to round')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdRnd') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberRnd');
                        try {
                            str += 'round(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calSIN') {
                const modal = new ModalBuilder()
                    .setTitle('Sine')
                    .setCustomId('mdSin')

                const input = new TextInputBuilder()
                    .setCustomId('numberSin')
                    .setLabel('Enter the number to find the sine')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdSin') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberSin');
                        try {
                            str += 'sin(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calCOS') {
                const modal = new ModalBuilder()
                    .setTitle('Cosine')
                    .setCustomId('mdCos')

                const input = new TextInputBuilder()
                    .setCustomId('numberCos')
                    .setLabel('Enter the number to find the cosine')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdCos') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberCos');
                        try {
                            str += 'cos(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calTAN') {
                const modal = new ModalBuilder()
                    .setTitle('Tangent')
                    .setCustomId('mdTan')

                const input = new TextInputBuilder()
                    .setCustomId('numberTan')
                    .setLabel('Enter the number to find the tangent')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdTan') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberTan');
                        try {
                            str += 'tan(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calLN') {
                const modal = new ModalBuilder()
                    .setTitle('Natural Logarithm (log)')
                    .setCustomId('mdLn')

                const input = new TextInputBuilder()
                    .setCustomId('numberLn')
                    .setLabel('Enter the number for natural logarithm')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdLn') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberLn');
                        try {
                            str += 'log(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'cal1/x') {
                const modal = new ModalBuilder()
                    .setTitle('Reciprocal')
                    .setCustomId('mdReciprocal')

                const input = new TextInputBuilder()
                    .setCustomId('numberReciprocal')
                    .setLabel('Enter the number to find the reciprocal')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdReciprocal') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberReciprocal');
                        try {
                            str += '1/(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calx!') {
                const modal = new ModalBuilder()
                    .setTitle('Factorial')
                    .setCustomId('mdFactorial')

                const input = new TextInputBuilder()
                    .setCustomId('numberFactorial')
                    .setLabel('Enter the number to find the factorial')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

                modal.addComponents(actionRow);

                await interact.showModal(modal);

                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit()) return;
                    if (modal.customId === 'mdFactorial') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberFactorial');
                        try {
                            str += number + '!';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        } catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            } else if (interact.customId === 'calπ') {
                str += 'pi';
                stringify = '```\n' + str + '\n```';
                edit();
            } else if (interact.customId === 'cale') {
                str += 'e';
                stringify = '```\n' + str + '\n```';
                edit();
            } else if (interact.customId === 'calans') {
                str += `${answer}`;
                stringify = '```\n' + str + '\n```';
                edit();
            } else if (interact.customId === 'cal=') {
                if (str === ' ' || str === '' || str === null || str === undefined) {
                    return;
                } else {
                    try {
                        answer = evaluate(str);
                        str += ' = ' + evaluate(str);
                        stringify = '```\n' + str + '\n```';
                        edit();
                        str = ' ';
                        stringify = '```\n' + str + '\n```';
                    } catch (e) {
                        if (options.invalidQuery === undefined) {
                            return;
                        } else {
                            str = options.invalidQuery;
                            answer = '0';
                            stringify = '```\n' + str + '\n```';
                            edit();
                            str = ' ';
                            stringify = '```\n' + str + '\n```';
                        }
                    }
                }
            } else if (interact.customId === 'calDC') {
                calc.stop();
            } else {
                str += interact.customId.replace('cal', '');
                stringify = '```\n' + str + '\n```';
                edit();
            }
        });

        calc.on('end', async () => {
            str = 'Calculator has been stopped';
            stringify = '```\n' + str + '\n```';
            edit();
            lock(true);
        });
    });
    
    checkPackageUpdates();
};

export default Calculator;
