"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHangman = exports.shuffleArray = exports.getButtonDilemma = exports.replaceHexCharacters = exports.boxConsole = exports.checkPackageUpdates = exports.convertTime = exports.getRandomSentence = exports.addRow = exports.createDisabledButton = exports.createButton = exports.getRandomString = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const discord_js_1 = require("discord.js");
const ofetch_1 = require("ofetch");
const string_width_1 = tslib_1.__importDefault(require("string-width"));
const util_1 = require("util");
const canvas_1 = require("@napi-rs/canvas");
const package_json_1 = tslib_1.__importDefault(require("../../package.json"));
const words_json_1 = tslib_1.__importDefault(require("../data/words.json"));
const getRandomString = function (length) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBytesArray = new Uint8Array(length);
    (0, crypto_1.randomBytes)(length).forEach((byte, index) => {
        randomBytesArray[index] = byte % randomChars.length;
    });
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(randomBytesArray[i]);
    }
    return result;
};
exports.getRandomString = getRandomString;
const createButton = function (label, disabled) {
    let style = discord_js_1.ButtonStyle.Secondary;
    if (label === 'AC' || label === 'DC' || label === '⌫') {
        style = discord_js_1.ButtonStyle.Danger;
    }
    else if (label === ' = ') {
        style = discord_js_1.ButtonStyle.Success;
    }
    else if (label === '(' ||
        label === ')' ||
        label === '^' ||
        label === '%' ||
        label === '÷' ||
        label === 'x' ||
        label === ' - ' ||
        label === ' + ' ||
        label === '.' ||
        label === 'RND' ||
        label === 'SIN' ||
        label === 'COS' ||
        label === 'TAN' ||
        label === 'LG' ||
        label === 'LN' ||
        label === 'SQRT' ||
        label === 'x!' ||
        label === '1/x' ||
        label === 'π' ||
        label === 'e' ||
        label === 'ans') {
        style = discord_js_1.ButtonStyle.Primary;
    }
    if (disabled) {
        const btn = new discord_js_1.ButtonBuilder()
            .setLabel(label)
            .setStyle(style)
            .setDisabled();
        if (label === '\u200b') {
            btn.setCustomId((0, exports.getRandomString)(10));
        }
        else {
            btn.setCustomId('cal' + label);
        }
        return btn;
    }
    else {
        const btn = new discord_js_1.ButtonBuilder().setLabel(label).setStyle(style);
        if (label === '\u200b') {
            btn.setDisabled();
            btn.setCustomId((0, exports.getRandomString)(10));
        }
        else {
            btn.setCustomId('cal' + label);
        }
        return btn;
    }
};
exports.createButton = createButton;
const createDisabledButton = function (label) {
    let style = discord_js_1.ButtonStyle.Secondary;
    if (label === 'AC' || label === 'DC' || label === '⌫') {
        style = discord_js_1.ButtonStyle.Danger;
    }
    else if (label === ' = ') {
        style = discord_js_1.ButtonStyle.Success;
    }
    else if (label === '(' ||
        label === ')' ||
        label === '^' ||
        label === '%' ||
        label === '÷' ||
        label === 'x' ||
        label === ' - ' ||
        label === ' + ' ||
        label === '.' ||
        label === 'RND' ||
        label === 'SIN' ||
        label === 'COS' ||
        label === 'TAN' ||
        label === 'LG' ||
        label === 'LN' ||
        label === 'SQRT' ||
        label === 'x!' ||
        label === '1/x' ||
        label === 'π' ||
        label === 'e' ||
        label === 'ans') {
        style = discord_js_1.ButtonStyle.Primary;
    }
    const btn = new discord_js_1.ButtonBuilder().setLabel(label).setStyle(style);
    if (label === '\u200b') {
        btn.setDisabled();
        btn.setCustomId((0, exports.getRandomString)(10));
    }
    else {
        btn.setCustomId('cal' + label);
    }
    const disabledLabels = ["^", "%", '÷', 'AC', '⌫', 'x!', 'x', '1/x'];
    if (disabledLabels.includes(label)) {
        btn.setDisabled(true);
    }
    ;
    return btn;
};
exports.createDisabledButton = createDisabledButton;
const addRow = function (btns) {
    const row = new discord_js_1.ActionRowBuilder();
    for (const btn of btns) {
        row.addComponents(btn);
    }
    return row;
};
exports.addRow = addRow;
const getRandomSentence = function (length) {
    const word = [];
    const words = words_json_1.default;
    for (let i = 0; i < length; i++) {
        word.push(words[Math.floor(Math.random() * words.length)]);
    }
    return word;
};
exports.getRandomSentence = getRandomSentence;
const convertTime = function (time) {
    const absoluteSeconds = Math.floor((time / 1000) % 60);
    const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
    const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const absoluteDays = Math.floor((time / (1000 * 60 * 60 * 24)));
    const d = absoluteDays
        ? absoluteDays === 1
            ? '1 day'
            : `${absoluteDays} days`
        : null;
    const h = absoluteHours
        ? absoluteHours === 1
            ? '1 hour'
            : `${absoluteHours} hours`
        : null;
    const m = absoluteMinutes
        ? absoluteMinutes === 1
            ? '1 minute'
            : `${absoluteMinutes} minutes`
        : null;
    const s = absoluteSeconds
        ? absoluteSeconds === 1
            ? '1 second'
            : `${absoluteSeconds} seconds`
        : null;
    const absoluteTime = [];
    if (d)
        absoluteTime.push(d);
    if (h)
        absoluteTime.push(h);
    if (m)
        absoluteTime.push(m);
    if (s)
        absoluteTime.push(s);
    return absoluteTime.join(', ');
};
exports.convertTime = convertTime;
const checkPackageUpdates = async function (name, notifyUpdate) {
    if (notifyUpdate === false)
        return;
    try {
        const execPromise = (0, util_1.promisify)(child_process_1.exec);
        const { stdout } = await execPromise('npm show @m3rcena/weky version');
        if (stdout.trim().toString() > package_json_1.default.version) {
            const advertise = (0, chalk_1.default)(`Are you using ${chalk_1.default.red(name)}? Don't lose out on new features!`);
            const msg = (0, chalk_1.default)(`New ${chalk_1.default.green('version')} of ${chalk_1.default.yellow('@m3rcena/weky')} is available!`);
            const msg2 = (0, chalk_1.default)(`${chalk_1.default.red(package_json_1.default.version)} -> ${chalk_1.default.green(stdout.trim().toString())}`);
            const tip = (0, chalk_1.default)(`Registry: ${chalk_1.default.cyan('https://www.npmjs.com/package/@m3rcena/weky')}`);
            const install = (0, chalk_1.default)(`Run ${chalk_1.default.green(`npm i @m3rcena/weky@${stdout.trim().toString()}`)} to update!`);
            (0, exports.boxConsole)([advertise, msg, msg2, tip, install]);
        }
    }
    catch (error) {
        console.error(error);
    }
};
exports.checkPackageUpdates = checkPackageUpdates;
const boxConsole = function (messages) {
    let tips = [];
    let maxLen = 0;
    const defaultSpace = 4;
    const spaceWidth = (0, string_width_1.default)(' ');
    if (Array.isArray(messages)) {
        tips = Array.from(messages);
    }
    else {
        tips = [messages];
    }
    tips = [' ', ...tips, ' '];
    tips = tips.map((msg) => ({ val: msg, len: (0, string_width_1.default)(msg) }));
    maxLen = tips.reduce((len, tip) => {
        maxLen = Math.max(len, tip.len);
        return maxLen;
    }, maxLen);
    maxLen += spaceWidth * 2 * defaultSpace;
    tips = tips.map(({ val, len }) => {
        let i = 0;
        let j = 0;
        while (len + i * 2 * spaceWidth < maxLen) {
            i++;
        }
        j = i;
        while (j > 0 && len + i * spaceWidth + j * spaceWidth > maxLen) {
            j--;
        }
        return ' '.repeat(i) + val + ' '.repeat(j);
    });
    const line = chalk_1.default.yellow('─'.repeat(maxLen));
    console.log(chalk_1.default.yellow('┌') + line + chalk_1.default.yellow('┐'));
    for (const msg of tips) {
        console.log(chalk_1.default.yellow('│') + msg + chalk_1.default.yellow('│'));
    }
    console.log(chalk_1.default.yellow('└') + line + chalk_1.default.yellow('┘'));
};
exports.boxConsole = boxConsole;
const replaceHexCharacters = function (text) {
    const hexRegex = /&#x([a-fA-F0-9]+);/g;
    return text.replace(hexRegex, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
};
exports.replaceHexCharacters = replaceHexCharacters;
const getButtonDilemma = async function () {
    const data = await (0, ofetch_1.ofetch)('https://weky.miv4.com/api/wyptb', {
        method: 'GET',
    });
    return data;
};
exports.getButtonDilemma = getButtonDilemma;
const shuffleArray = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};
exports.shuffleArray = shuffleArray;
const createHangman = async function (state = 0) {
    return new Promise((res) => {
        const canvas = (0, canvas_1.createCanvas)(300, 350);
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 5;
        // Poll base
        createLine(ctx, 50, 330, 150, 330);
        // Poll Mid
        createLine(ctx, 100, 330, 100, 50);
        // Poll Head
        createLine(ctx, 100, 50, 200, 50);
        // Poll To Man Connector
        createLine(ctx, 200, 50, 200, 80);
        // Head
        ctx.strokeStyle = state < 1 ? "#a3a3a3" : "#000000";
        ctx.beginPath();
        ctx.arc(200, 100, 20, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        // Main Body
        createLine(ctx, 200, 120, 200, 200, state < 2 ? "#a3a3a3" : "#000000");
        // Hands
        createLine(ctx, 200, 150, 170, 130, state < 3 ? "#a3a3a3" : "#000000");
        createLine(ctx, 200, 150, 230, 130, state < 4 ? "#a3a3a3" : "#000000");
        // Legs
        createLine(ctx, 200, 200, 180, 230, state < 5 ? "#a3a3a3" : "#000000");
        createLine(ctx, 200, 200, 220, 230, state < 6 ? "#a3a3a3" : "#000000");
        res(canvas.toBuffer("image/png"));
    });
};
exports.createHangman = createHangman;
function createLine(ctx, fromX, fromY, toX, toY, color = "#000000") {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.closePath();
}
;
