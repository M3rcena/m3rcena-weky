import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import wordList from "../data/words.json" assert { type: "json" };
import chalk from "chalk";
import stringWidth from 'string-width';
import { exec } from 'child_process';
import weky_package from "../package.json" assert { type: "json" };
import { promisify } from "util";
import { ofetch } from "ofetch";
export const getRandomString = function (length) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
};
export const createButton = function (label, disabled) {
    let style = ButtonStyle.Secondary;
    if (label === 'AC' || label === 'DC' || label === '⌫') {
        style = ButtonStyle.Danger;
    }
    else if (label === ' = ') {
        style = ButtonStyle.Success;
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
        style = ButtonStyle.Primary;
    }
    if (disabled) {
        const btn = new ButtonBuilder()
            .setLabel(label)
            .setStyle(style)
            .setDisabled();
        if (label === '\u200b') {
            btn.setCustomId(getRandomString(10));
        }
        else {
            btn.setCustomId('cal' + label);
        }
        return btn;
    }
    else {
        const btn = new ButtonBuilder().setLabel(label).setStyle(style);
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
export const addRow = function (btns) {
    const row = new ActionRowBuilder();
    for (const btn of btns) {
        row.addComponents(btn);
    }
    return row;
};
export const getRandomSentence = function (length) {
    const word = [];
    const words = wordList;
    for (let i = 0; i < length; i++) {
        word.push(words[Math.floor(Math.random() * words.length)]);
    }
    return word;
};
export const convertTime = function (time) {
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
export const checkPackageUpdates = async function (disabled) {
    if (disabled)
        return;
    try {
        const execPromise = promisify(exec);
        const { stdout } = await execPromise('npm show @m3rcena/weky version');
        if (stdout.trim().toString() > weky_package.version) {
            const msg = chalk(`New ${chalk.green('version')} of ${chalk.yellow('@m3rcena/weky')} is available!`);
            const msg2 = chalk(`${chalk.red(weky_package.version)} -> ${chalk.green(stdout.trim().toString())}`);
            const tip = chalk(`Registry: ${chalk.cyan('https://www.npmjs.com/package/@m3rcena/weky')}`);
            const install = chalk(`Run ${chalk.green(`npm i @m3rcena/weky@${stdout.trim().toString()}`)} to update!`);
            boxConsole([msg, msg2, tip, install]);
        }
    }
    catch (error) {
        console.error(error);
    }
};
export const boxConsole = function (messages) {
    let tips = [];
    let maxLen = 0;
    const defaultSpace = 4;
    const spaceWidth = stringWidth(' ');
    if (Array.isArray(messages)) {
        tips = Array.from(messages);
    }
    else {
        tips = [messages];
    }
    tips = [' ', ...tips, ' '];
    tips = tips.map((msg) => ({ val: msg, len: stringWidth(msg) }));
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
    const line = chalk.yellow('─'.repeat(maxLen));
    console.log(chalk.yellow('┌') + line + chalk.yellow('┐'));
    for (const msg of tips) {
        console.log(chalk.yellow('│') + msg + chalk.yellow('│'));
    }
    console.log(chalk.yellow('└') + line + chalk.yellow('┘'));
};
export const replaceHexCharacters = function (text) {
    const hexRegex = /&#x([a-fA-F0-9]+);/g;
    return text.replace(hexRegex, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
};
export const getButtonDilemma = async function () {
    const data = await ofetch('https://weky.miv4.com/api/wyptb', {
        method: 'GET',
    });
    return data;
};
