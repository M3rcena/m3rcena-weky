'use strict';

var chalk = require('chalk');
var discord_js = require('discord.js');
var mathjs = require('mathjs');

const getRandomString = function (length) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
};
const createButton = function (label, disabled) {
    let style = discord_js.ButtonStyle.Primary;
    if (label === 'AC' || label === 'DC' || label === '⌫') {
        style = discord_js.ButtonStyle.Success;
    }
    else if (label === '=') {
        style = discord_js.ButtonStyle.Danger;
    }
    else if (label === '(' ||
        label === ')' ||
        label === '^' ||
        label === '%' ||
        label === '÷' ||
        label === 'x' ||
        label === '-' ||
        label === '+' ||
        label === '.') {
        style = discord_js.ButtonStyle.Primary;
    }
    {
        const btn = new discord_js.ButtonBuilder().setLabel(label).setStyle(style);
        if (label === '\u200b') {
            btn.setDisabled();
            btn.setCustomId(getRandomString(10));
        }
        else {
            btn.setCustomId('cal' + label);
        }
        return btn;
    }
};
const addRow = function (btns) {
    const row = new discord_js.ActionRowBuilder();
    for (const btn of btns) {
        row.addComponents(btn);
    }
    return row;
};

const Calculator = async (options) => {
    if (!options)
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No options provided.");
    if (typeof options !== "object")
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Options must be an object.");
    let interaction;
    if (!options.interaction)
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No interaction provided.");
    if (typeof options.interaction !== "object") {
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Interaction must be an object.");
    }
    if (options.interaction instanceof discord_js.Message) {
        interaction = options.interaction;
    }
    else if (options.interaction instanceof discord_js.ChatInputCommandInteraction) {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No interaction provided.");
    if (!options.client)
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No client provided.");
    if (typeof options.client !== "object") {
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Client must be an object.");
    }
    let client = options.client;
    if (!options.embed)
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No embed options provided.");
    if (typeof options.embed !== "object") {
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed options must be an object.");
    }
    if (!options.embed.color)
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No embed color provided.");
    if (!options.embed.title)
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No embed title provided.");
    if (options.embed.url && typeof options.embed.url !== "string") {
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed URL must be a string.");
    }
    if (options.embed.author) {
        if (typeof options.embed.author !== "object") {
            throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed author must be an object.");
        }
        if (!options.embed.author.name)
            throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No embed author name provided.");
        if (options.embed.author.icon_url && typeof options.embed.author.icon_url !== "string") {
            throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed author icon URL must be a string.");
        }
        if (options.embed.author.url && typeof options.embed.author.url !== "string") {
            throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed author URL must be a string.");
        }
    }
    if (options.embed.description && typeof options.embed.description !== "string") {
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed description must be a string.");
    }
    if (options.embed.fields) {
        if (!Array.isArray(options.embed.fields)) {
            throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed fields must be an array.");
        }
        for (const field of options.embed.fields) {
            if (typeof field !== "object") {
                throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed field must be an object.");
            }
            if (!field.name)
                throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No embed field name provided.");
            if (!field.value)
                throw new Error(chalk.red("[@m3rcena/Weky Error]") + " No embed field value provided.");
            if (field.inline && typeof field.inline !== "boolean") {
                throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed field inline must be a boolean.");
            }
        }
    }
    if (options.embed.image && typeof options.embed.image !== "string") {
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed image must be a string.");
    }
    if (options.embed.timestamp && !(options.embed.timestamp instanceof Date)) {
        throw new Error(chalk.red("[@m3rcena/Weky Error]") + " Embed timestamp must be a date.");
    }
    let str = ' ';
    let stringify = '```\n' + str + '\n```';
    const row = [];
    const button = new Array([], [], [], [], []);
    new Array([], [], [], [], []);
    const text = [
        '(',
        ')',
        '^',
        '%',
        'AC',
        '7',
        '8',
        '9',
        '÷',
        'DC',
        '4',
        '5',
        '6',
        'x',
        '⌫',
        '1',
        '2',
        '3',
        ' - ',
        'LOG',
        '.',
        '0',
        '=',
        ' + ',
        'SQRT',
    ];
    let current = 0;
    for (let i = 0; i < text.length; i++) {
        if (button[current].length === 5)
            current++;
        button[current].push(createButton(text[i]));
        if (i === text.length - 1) {
            for (const btn of button)
                row.push(addRow(btn));
        }
    }
    const iconURL = options.embed.footer ? options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined : undefined;
    let embed = new discord_js.EmbedBuilder()
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
        });
        embed.setAuthor(author);
    }
    if (options.embed.footer) {
        const footer = ({
            text: options.embed.footer.text,
            iconURL: iconURL ? iconURL : undefined
        });
        embed.setFooter(footer);
    }
    options.interaction.reply({
        embeds: [embed],
        components: row,
    }).then(async (msg) => {
        async function edit() {
            let _embed = new discord_js.EmbedBuilder()
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
                });
                _embed.setAuthor(author);
            }
            if (options.embed.footer) {
                const footer = ({
                    text: options.embed.footer.text,
                    iconURL: iconURL ? iconURL : undefined
                });
                _embed.setFooter(footer);
            }
            msg.edit({
                embeds: [_embed],
                components: row,
            });
        }
        async function lock(disabled) {
            let _embed = new discord_js.EmbedBuilder()
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
                });
                _embed.setAuthor(author);
            }
            if (options.embed.footer) {
                const footer = ({
                    text: options.embed.footer.text,
                    iconURL: iconURL ? iconURL : undefined
                });
                _embed.setFooter(footer);
            }
            msg.edit({
                embeds: [_embed],
                components: [],
            });
        }
        let id;
        if (interaction instanceof discord_js.Message) {
            id = interaction.author.id;
        }
        else if (interaction instanceof discord_js.ChatInputCommandInteraction) {
            id = interaction.user.id;
        }
        const calc = msg.createMessageComponentCollector({
            componentType: discord_js.ComponentType.Button,
            time: 300000,
            filter: (interacted) => interacted.user.id === id,
        });
        calc.on('collect', async (interact) => {
            if (interact.customId !== 'calLOG' && interact.customId !== 'calSQRT')
                await interact.deferUpdate();
            if (interact.customId === 'calAC') {
                str = ' ';
                stringify = '```\n' + str + '\n```';
                edit();
            }
            else if (interact.customId === 'calx') {
                str += ' * ';
                stringify = '```\n' + str + '\n```';
                edit();
            }
            else if (interact.customId === 'cal÷') {
                str += ' / ';
                stringify = '```\n' + str + '\n```';
                edit();
            }
            else if (interact.customId === 'cal⌫') {
                if (str === ' ' || str === '' || str === null || str === undefined) {
                    return;
                }
                else {
                    str.slice(0, -1);
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
            }
            else if (interact.customId === 'cal=') {
                if (str === ' ' || str === '' || str === null || str === undefined) {
                    return;
                }
                else {
                    try {
                        str += ' = ' + mathjs.evaluate(str);
                        stringify = '```\n' + str + '\n```';
                        edit();
                        str = ' ';
                        stringify = '```\n' + str + '\n```';
                    }
                    catch (e) {
                        if (options.invalidQuery === undefined) {
                            return;
                        }
                        else {
                            str = options.invalidQuery;
                            stringify = '```\n' + str + '\n```';
                            edit();
                            str = ' ';
                            stringify = '```\n' + str + '\n```';
                        }
                    }
                }
            }
            else if (interact.customId === 'calDC') {
                str = "Disabled Calculator";
                stringify = '```\n' + str + '\n```';
                edit();
                calc.stop();
            }
            else if (interact.customId === 'calLOG') {
                const modal = new discord_js.ModalBuilder()
                    .setTitle('Logarithm')
                    .setCustomId('mdLog');
                const input = new discord_js.TextInputBuilder()
                    .setCustomId('numberLog')
                    .setLabel('Enter the number to log')
                    .setStyle(discord_js.TextInputStyle.Short)
                    .setRequired(true);
                const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                modal.addComponents(actionRow);
                await interact.showModal(modal);
                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit())
                        return;
                    if (modal.customId === 'mdLog') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberLog');
                        try {
                            str += 'log(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                        catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            }
            else if (interact.customId === 'calSQRT') {
                const modal = new discord_js.ModalBuilder()
                    .setTitle('Square Root')
                    .setCustomId('mdSqrt');
                const input = new discord_js.TextInputBuilder()
                    .setCustomId('numberSqrt')
                    .setLabel('Enter the number to square root')
                    .setStyle(discord_js.TextInputStyle.Short)
                    .setRequired(true);
                const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                modal.addComponents(actionRow);
                await interact.showModal(modal);
                client.on('interactionCreate', async (modal) => {
                    if (!modal.isModalSubmit())
                        return;
                    if (modal.customId === 'mdSqrt') {
                        modal.deferUpdate();
                        const number = modal.fields.getTextInputValue('numberSqrt');
                        try {
                            str += 'sqrt(' + number + ')';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                        catch (e) {
                            str = 'Invalid Number';
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    }
                });
            }
            else {
                str += interact.customId.replace('cal', '');
                stringify = '```\n' + str + '\n```';
                edit();
            }
        });
        calc.on('end', async () => {
            str = 'Calculator has been stopped';
            stringify = '```\n' + str + '\n```';
            edit();
            lock();
        });
    });
};

exports.Calculator = Calculator;
