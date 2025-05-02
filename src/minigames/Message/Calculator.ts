import chalk from "chalk";
import {
	ActionRowBuilder, ButtonBuilder, Client, ComponentType, EmbedBuilder, MessageFlags,
	ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle
} from "discord.js";
import { evaluate } from "mathjs";

import {
	addRow, checkPackageUpdates, createButton, createDisabledButton, createEmbed
} from "../../functions/functions.js";
import { OptionsChecking } from "../../functions/OptionChecking.js";

import type { CalcTypes } from "../../Types";

const Calculator = async (options: CalcTypes) => {
    // Validate calculator options
    OptionsChecking(options, "Calculator");

    let message = options.message;

    if (!message) throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " No message provided.");

    let client: Client = options.client;

    let str = ' ';
    let stringify = '```\n' + str + '\n```';

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
    ];

    let disabled: boolean = true;
    let lastInput: string | null | undefined;

    const createButtonRows = (textArray: string[], isDisabled: boolean) => {
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        let currentRow: ButtonBuilder[] = [];

        textArray.forEach((text, index) => {
            currentRow.push(isDisabled ? createDisabledButton(text) : createButton(text, false));

            if (currentRow.length === 5 || index === textArray.length - 1) {
                rows.push(addRow([...currentRow]));
                currentRow = [];
            }
        });

        return rows;
    };

    // Handle modal inputs for special operations (log, sin, etc.)
    const handleModalInput = async (interact: any, modalId: string, operation: string) => {
        const modal = new ModalBuilder()
            .setTitle(modalId)
            .setCustomId(`md${modalId}`);

        const input = new TextInputBuilder()
            .setCustomId(`number${modalId}`)
            .setLabel(`Enter the number for ${operation}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
        await interact.showModal(modal);

        return new Promise((resolve) => {
            const modalHandler = async (modal: ModalSubmitInteraction) => {
                if (!modal.isModalSubmit() || modal.customId !== `md${modalId}`) return;

                client.off('interactionCreate', modalHandler);
                await modal.deferUpdate();
                resolve(modal.fields.getTextInputValue(`number${modalId}`));
            };

            client.on('interactionCreate', modalHandler);
            setTimeout(() => client.off('interactionCreate', modalHandler), 300000);
        });
    };

    // Process calculations using mathjs
    const handleCalculation = (input: string) => {
        try {
            const result = evaluate(input);
            return { result, error: null };
        } catch (e) {
            return { result: null, error: options.invalidQuery || 'Invalid calculation' };
        }
    };

    // Create initial button layouts
    const row = createButtonRows(text, true);
    const row2 = createButtonRows(text2, true);

    // Set up calculator display
    options.embed.description = stringify;
    let embed = createEmbed(options.embed);

    if (!message.channel || !message.channel.isTextBased() || !message.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " Message must be a text-based channel.");
    }

    const channel = message.channel;


    // Message-based calculator setup
    await message.reply({
        embeds: [embed],
        components: row,
        allowedMentions: { repliedUser: false }
    }).then(async (msg) => {
        let msg2 = await channel.send({
            components: row2,
        });
        async function edit() {
            options.embed.description = stringify;
            let _embed = createEmbed(options.embed);

            if (msg.editable) {
                await msg.edit({
                    embeds: [_embed],
                })
            } else {
                await message.reply({
                    content: `An error occured while trying to edit the calculator.`
                });
            };
        };

        async function lock(disabled: boolean) {
            let _embed = createEmbed(options.embed);

            if (msg.editable) {
                await msg.edit({
                    embeds: [_embed],
                    components: [],
                });
            } else {
                await message.reply({
                    content: `An error occured while trying to lock the calculator.`
                });
            }

            if (msg2.deletable) msg2.delete();
        };

        async function enableButtons() {
            disabled = false;
            let cur = 0;

            const customRow: ActionRowBuilder<ButtonBuilder>[] = [];
            const customButton: ButtonBuilder[][] = new Array([], [], [], [], []);
            for (let i = 0; i < text.length; i++) {
                if (customButton[cur].length === 5) cur++;
                customButton[cur].push(
                    createButton(text[i], false),
                );
                if (i === text.length - 1) {
                    for (const btn of customButton) {
                        customRow.push(addRow(btn))
                    };

                    if (msg.editable) {
                        await msg.edit({
                            components: customRow
                        });
                    } else {
                        await message.reply({
                            content: `An error occured while trying to enable the buttons.`
                        });
                    };
                }
            };

            cur = 0;
            const customRow2: ActionRowBuilder<ButtonBuilder>[] = [];
            const customButtons: ButtonBuilder[][] = new Array([], []);
            for (let z = 0; z < text2.length; z++) {
                if (customButtons[cur].length === 5) cur++;
                customButtons[cur].push(
                    createButton(text2[z], false),
                );
                if (z === text2.length - 1) {
                    for (const btns of customButtons) customRow2.push(addRow(btns));

                    await msg2.edit({
                        components: customRow2
                    })
                }
            };
        };

        async function disableButtons() {
            disabled = true;

            let cur = 0;

            const customRow: ActionRowBuilder<ButtonBuilder>[] = [];
            const customButton: ButtonBuilder[][] = new Array([], [], [], [], []);
            for (let i = 0; i < text.length; i++) {
                if (customButton[cur].length === 5) cur++;
                customButton[cur].push(
                    createDisabledButton(text[i]),
                );
                if (i === text.length - 1) {
                    for (const btn of customButton) {
                        customRow.push(addRow(btn))
                    };

                    if (msg.editable) {
                        await msg.edit({
                            components: customRow
                        });
                    } else {
                        await message.reply({
                            content: `An error occured while trying to disable the buttons.`
                        });
                    };
                }
            };

            cur = 0;
            const customRow2: ActionRowBuilder<ButtonBuilder>[] = [];
            const customButtons: ButtonBuilder[][] = new Array([], []);
            for (let z = 0; z < text2.length; z++) {
                if (customButtons[cur].length === 5) cur++;
                customButtons[cur].push(
                    createDisabledButton(text2[z]),
                );
                if (z === text2.length - 1) {
                    for (const btns of customButtons) customRow2.push(addRow(btns));

                    await msg2.edit({
                        components: customRow2
                    })
                }
            };
        }

        let id = message.author.id;

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
                            .setTimestamp(options.embed.timestamp ? new Date() : null)
                    ],
                    flags: [MessageFlags.Ephemeral]
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

            switch (interact.customId) {
                case 'calAC':
                    lastInput = null;
                    str = ' ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;

                case 'calx':
                    lastInput = interact.customId;
                    str += ' * ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;

                case 'cal÷':
                    lastInput = interact.customId;
                    str += ' / ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;

                case 'cal⌫':
                    if (str === ' ' || str === '' || str === null || str === undefined) {
                        lastInput = null;
                        return;
                    }
                    lastInput = interact.customId;
                    if (str.slice(0, -1) === ' ' || str.slice(0, -1) === '' || str.slice(0, -1) === null || str.slice(0, -1) === undefined) {
                        lastInput = null;
                    }
                    str = str.slice(-1) === ' ' ? str.slice(0, -3) : str.slice(0, -1);
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;

                case 'calLG':
                case 'calSQRT':
                case 'calRND':
                case 'calSIN':
                case 'calCOS':
                case 'calTAN':
                case 'calLN':
                case 'cal1/x':
                case 'calx!': {
                    const operationMap = {
                        calLG: ['Log', 'logarithm 10', 'log10'],
                        calSQRT: ['Sqrt', 'square root', 'sqrt'],
                        calRND: ['Rnd', 'round', 'round'],
                        calSIN: ['Sin', 'sine', 'sin'],
                        calCOS: ['Cos', 'cosine', 'cos'],
                        calTAN: ['Tan', 'tangent', 'tan'],
                        calLN: ['Ln', 'natural logarithm', 'log'],
                        'cal1/x': ['Reciprocal', 'reciprocal', '1/'],
                        'calx!': ['Factorial', 'factorial', '!']
                    };

                    const [modalTitle, operation, func] = operationMap[interact.customId];
                    const number = await handleModalInput(interact, modalTitle, operation);
                    if (number) {
                        str += func === '!' ? number + func : `${func}(${number})`;
                        stringify = '```\n' + str + '\n```';
                        lastInput = interact.customId;
                        edit();
                    }
                    break;
                }

                case 'calπ':
                    lastInput = interact.customId;
                    str += 'pi';
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;

                case 'cale':
                    lastInput = interact.customId;
                    str += 'e';
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;

                case 'calans':
                    lastInput = interact.customId;
                    str += `${answer}`;
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;

                case 'cal=':
                    lastInput = null;
                    if (str === ' ' || str === '' || str === null || str === undefined) {
                        return;
                    }
                    const { result, error } = handleCalculation(str);
                    if (result !== null) {
                        answer = result;
                        str += ' = ' + result;
                    } else {
                        str = error;
                        answer = '0';
                    }
                    stringify = '```\n' + str + '\n```';
                    edit();
                    str = ' ';
                    stringify = '```\n' + str + '\n```';
                    break;

                case 'calDC':
                    calc.stop();
                    break;

                default:
                    lastInput = interact.customId;
                    str += interact.customId.replace('cal', '');
                    stringify = '```\n' + str + '\n```';
                    edit();
                    break;
            }

            if (disabled === true && lastInput !== null && lastInput !== undefined) {
                enableButtons();
            } else if ((disabled === false && lastInput === null || lastInput === undefined) && interact.customId !== "calDC") {
                disableButtons();
            }
        });

        calc.on('end', async () => {
            str = 'Calculator has been stopped';
            stringify = '```\n' + str + '\n```';
            edit();
            lock(true);
        });
    });

    // Check for package updates
    checkPackageUpdates("Calculator", options.notifyUpdate);
};

export default Calculator;
