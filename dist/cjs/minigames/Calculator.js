"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const mathjs_1 = require("mathjs");
const functions_1 = require("../functions/functions.js");
const OptionChecking_1 = require("../functions/OptionChecking.js");
const Calculator = async (options) => {
    // Validate calculator options
    (0, OptionChecking_1.OptionsChecking)(options, "Calculator");
    let interaction = options.interaction;
    if (!interaction)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] Calculator Error:") + " No interaction provided.");
    let client = options.client;
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
    let disabled = true;
    let lastInput;
    const createButtonRows = (textArray, isDisabled) => {
        const rows = [];
        let currentRow = [];
        textArray.forEach((text, index) => {
            currentRow.push(isDisabled ? (0, functions_1.createDisabledButton)(text) : (0, functions_1.createButton)(text, false));
            if (currentRow.length === 5 || index === textArray.length - 1) {
                rows.push((0, functions_1.addRow)([...currentRow]));
                currentRow = [];
            }
        });
        return rows;
    };
    // Handle modal inputs for special operations (log, sin, etc.)
    const handleModalInput = async (interact, modalId, operation) => {
        const modal = new discord_js_1.ModalBuilder()
            .setTitle(modalId)
            .setCustomId(`md${modalId}`);
        const input = new discord_js_1.TextInputBuilder()
            .setCustomId(`number${modalId}`)
            .setLabel(`Enter the number for ${operation}`)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(input));
        await interact.showModal(modal);
        return new Promise((resolve) => {
            const modalHandler = async (modal) => {
                if (!modal.isModalSubmit() || modal.customId !== `md${modalId}`)
                    return;
                client.off('interactionCreate', modalHandler);
                await modal.deferUpdate();
                resolve(modal.fields.getTextInputValue(`number${modalId}`));
            };
            client.on('interactionCreate', modalHandler);
            setTimeout(() => client.off('interactionCreate', modalHandler), 300000);
        });
    };
    // Process calculations using mathjs
    const handleCalculation = (input) => {
        try {
            const result = (0, mathjs_1.evaluate)(input);
            return { result, error: null };
        }
        catch (e) {
            return { result: null, error: options.invalidQuery || 'Invalid calculation' };
        }
    };
    // Create initial button layouts
    const row = createButtonRows(text, true);
    const row2 = createButtonRows(text2, true);
    // Set up calculator display
    options.embed.description = stringify;
    let embed = (0, functions_1.createEmbed)(options.embed);
    if (!interaction.channel || !interaction.channel.isTextBased() || !interaction.channel.isSendable()) {
        throw new Error(chalk_1.default.red("[@m3rcena/weky] Calculator Error:") + " Interaction must be a text-based channel.");
    }
    const channel = interaction.channel;
    if (interaction.author) {
        // Message-based calculator setup
        let msgInteraction = interaction;
        await msgInteraction.reply({
            embeds: [embed],
            components: row,
            allowedMentions: { repliedUser: false }
        }).then(async (msg) => {
            let msg2 = await channel.send({
                components: row2,
            });
            async function edit() {
                options.embed.description = stringify;
                let _embed = (0, functions_1.createEmbed)(options.embed);
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                    });
                }
                else {
                    await msgInteraction.reply({
                        content: `An error occured while trying to edit the calculator.`
                    });
                }
                ;
            }
            ;
            async function lock(disabled) {
                let _embed = (0, functions_1.createEmbed)(options.embed);
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                        components: [],
                    });
                }
                else {
                    await msgInteraction.reply({
                        content: `An error occured while trying to lock the calculator.`
                    });
                }
                if (msg2.deletable)
                    msg2.delete();
            }
            ;
            async function enableButtons() {
                disabled = false;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push((0, functions_1.createButton)(text[i], false));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push((0, functions_1.addRow)(btn));
                        }
                        ;
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await msgInteraction.reply({
                                content: `An error occured while trying to enable the buttons.`
                            });
                        }
                        ;
                    }
                }
                ;
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push((0, functions_1.createButton)(text2[z], false));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push((0, functions_1.addRow)(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
                ;
            }
            ;
            async function disableButtons() {
                disabled = true;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push((0, functions_1.createDisabledButton)(text[i]));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push((0, functions_1.addRow)(btn));
                        }
                        ;
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await msgInteraction.reply({
                                content: `An error occured while trying to disable the buttons.`
                            });
                        }
                        ;
                    }
                }
                ;
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push((0, functions_1.createDisabledButton)(text2[z]));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push((0, functions_1.addRow)(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
                ;
            }
            let id = msgInteraction.author.id;
            const calc = channel.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 300000,
            });
            let answer = '0';
            calc.on('collect', async (interact) => {
                if (interact.user.id !== id) {
                    return interact.reply({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setTitle(options.embed.title ? options.embed.title : 'Error | Weky Calculator')
                                .setDescription(`You are not allowed to interact with this calculator as you are not the user who initiated the command.\n\n**Note:** This calculator is only for the user <@${id}>`)
                                .setColor('Red')
                                .setTimestamp(options.embed.timestamp ? new Date() : null)
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
                    && interact.customId !== 'calx!')
                    await interact.deferUpdate();
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
                        }
                        else {
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
                }
                else if ((disabled === false && lastInput === null || lastInput === undefined) && interact.customId !== "calDC") {
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
    }
    else {
        // Slash command calculator setup
        let cmdInteraction = interaction;
        await cmdInteraction.editReply({
            embeds: [embed],
            components: row,
            allowedMentions: { repliedUser: false }
        }).then(async (msg) => {
            let msg2 = await channel.send({
                components: row2,
            });
            async function edit() {
                let _embed = (0, functions_1.createEmbed)(options.embed);
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                    });
                }
                else {
                    await cmdInteraction.editReply({
                        content: `An error occured while trying to edit the calculator.`
                    });
                }
            }
            ;
            async function lock(disabled) {
                let _embed = (0, functions_1.createEmbed)(options.embed);
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                        components: [],
                    });
                }
                else {
                    await cmdInteraction.editReply({
                        content: `An error occured while trying to lock the calculator.`
                    });
                }
                if (msg2.deletable)
                    msg2.delete();
            }
            ;
            async function enableButtons() {
                disabled = false;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push((0, functions_1.createButton)(text[i], false));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push((0, functions_1.addRow)(btn));
                        }
                        ;
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await cmdInteraction.editReply({
                                content: `An error occured while trying to enable the buttons.`
                            });
                        }
                        ;
                    }
                }
                ;
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push((0, functions_1.createButton)(text2[z], false));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push((0, functions_1.addRow)(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
                ;
            }
            ;
            async function disableButtons() {
                disabled = true;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push((0, functions_1.createDisabledButton)(text[i]));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push((0, functions_1.addRow)(btn));
                        }
                        ;
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await cmdInteraction.editReply({
                                content: `An error occured while trying to disable the buttons.`
                            });
                        }
                        ;
                    }
                }
                ;
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push((0, functions_1.createDisabledButton)(text2[z]));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push((0, functions_1.addRow)(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
                ;
            }
            let id = cmdInteraction.user.id;
            const calc = channel.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 300000,
            });
            let answer = '0';
            calc.on('collect', async (interact) => {
                if (interact.user.id !== id) {
                    return interact.reply({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setTitle(options.embed.title ? options.embed.title : 'Error | Weky Calculator')
                                .setDescription(`You are not allowed to interact with this calculator as you are not the user who initiated the command.\n\n**Note:** This calculator is only for the user <@${id}>`)
                                .setColor('Red')
                                .setTimestamp(options.embed.timestamp ? new Date() : null)
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
                    && interact.customId !== 'calx!')
                    await interact.deferUpdate();
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
                            stringify = '```\n' + str + '\n```';
                            edit();
                            str = ' ';
                            stringify = '```\n' + str + '\n```';
                        }
                        else {
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
                }
                else if ((disabled === false && lastInput === null || lastInput === undefined) && interact.customId !== "calDC") {
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
    }
    // Check for package updates
    (0, functions_1.checkPackageUpdates)("Calculator", options.notifyUpdate);
};
exports.default = Calculator;
