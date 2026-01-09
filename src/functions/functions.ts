import axios, { AxiosRequestConfig } from "axios";
import chalk from "chalk";
import { load } from "cheerio";
import { exec } from "child_process";
import { randomBytes } from "crypto";
import { ActionRowBuilder, BufferResolvable, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { ofetch } from "ofetch";
import stringWidth from "string-width";
import { promisify } from "util";

import { createCanvas } from "@napi-rs/canvas";

import weky_package from "../../package.json";
import wordList from "../data/words.json";

import type { Embeds } from "../Types";

export const getRandomString = function (length: number) {
	const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const randomBytesArray = new Uint8Array(length);
	randomBytes(length).forEach((byte, index) => {
		randomBytesArray[index] = byte % randomChars.length;
	});

	let result = "weky_";
	for (let i = 0; i < length; i++) {
		result += randomChars.charAt(randomBytesArray[i]);
	}
	return result;
};

export const createButton = function (label: string, disabled: boolean) {
	let style = ButtonStyle.Secondary;
	if (label === "AC" || label === "DC" || label === "⌫") {
		style = ButtonStyle.Danger;
	} else if (label === " = ") {
		style = ButtonStyle.Success;
	} else if (
		label === "(" ||
		label === ")" ||
		label === "^" ||
		label === "%" ||
		label === "÷" ||
		label === "x" ||
		label === " - " ||
		label === " + " ||
		label === "." ||
		label === "RND" ||
		label === "SIN" ||
		label === "COS" ||
		label === "TAN" ||
		label === "LG" ||
		label === "LN" ||
		label === "SQRT" ||
		label === "x!" ||
		label === "1/x" ||
		label === "π" ||
		label === "e" ||
		label === "ans"
	) {
		style = ButtonStyle.Primary;
	}
	if (disabled) {
		const btn = new ButtonBuilder().setLabel(label).setStyle(style).setDisabled();
		if (label === "\u200b") {
			btn.setCustomId(getRandomString(10));
		} else {
			btn.setCustomId("cal" + label);
		}
		return btn;
	} else {
		const btn = new ButtonBuilder().setLabel(label).setStyle(style);
		if (label === "\u200b") {
			btn.setDisabled();
			btn.setCustomId(getRandomString(10));
		} else {
			btn.setCustomId("cal" + label);
		}
		return btn;
	}
};

export const createDisabledButton = function (label: string, lock: boolean) {
	let style = ButtonStyle.Secondary;
	if (label === "AC" || label === "DC" || label === "⌫") {
		style = ButtonStyle.Danger;
	} else if (label === " = ") {
		style = ButtonStyle.Success;
	} else if (
		label === "(" ||
		label === ")" ||
		label === "^" ||
		label === "%" ||
		label === "÷" ||
		label === "x" ||
		label === " - " ||
		label === " + " ||
		label === "." ||
		label === "RND" ||
		label === "SIN" ||
		label === "COS" ||
		label === "TAN" ||
		label === "LG" ||
		label === "LN" ||
		label === "SQRT" ||
		label === "x!" ||
		label === "1/x" ||
		label === "π" ||
		label === "e" ||
		label === "ans"
	) {
		style = ButtonStyle.Primary;
	}

	const btn = new ButtonBuilder().setLabel(label).setStyle(style);
	if (label === "\u200b") {
		btn.setDisabled();
		btn.setCustomId(getRandomString(10));
	} else {
		btn.setCustomId("cal" + label);
	}

	const disabledLabels = ["^", "%", "÷", "AC", "⌫", "x!", "x", "1/x"];
	if (disabledLabels.includes(label) || lock) {
		btn.setDisabled(true);
	}
	return btn;
};

export const addRow = function (btns: ButtonBuilder[]) {
	const row = new ActionRowBuilder<ButtonBuilder>();
	for (const btn of btns) {
		row.addComponents(btn);
	}
	return row;
};

export const getRandomSentence = function (length: number) {
	const word = [];
	const words: string[] = wordList;

	for (let i = 0; i < length; i++) {
		word.push(words[Math.floor(Math.random() * words.length)]);
	}

	return word;
};

export const convertTime = function (time: number) {
	const absoluteSeconds = Math.floor((time / 1000) % 60);
	const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
	const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
	const absoluteDays = Math.floor(time / (1000 * 60 * 60 * 24));

	const d = absoluteDays ? (absoluteDays === 1 ? "1 day" : `${absoluteDays} days`) : null;

	const h = absoluteHours ? (absoluteHours === 1 ? "1 hour" : `${absoluteHours} hours`) : null;

	const m = absoluteMinutes ? (absoluteMinutes === 1 ? "1 minute" : `${absoluteMinutes} minutes`) : null;

	const s = absoluteSeconds ? (absoluteSeconds === 1 ? "1 second" : `${absoluteSeconds} seconds`) : null;

	const absoluteTime = [];
	if (d) absoluteTime.push(d);
	if (h) absoluteTime.push(h);
	if (m) absoluteTime.push(m);
	if (s) absoluteTime.push(s);
	return absoluteTime.join(", ");
};

export const checkPackageUpdates = async function (name: string, notifyUpdate?: boolean) {
	if (notifyUpdate === false) return;
	try {
		const execPromise = promisify(exec);
		const { stdout } = await execPromise("npm show @m3rcena/weky version");

		if (stdout.trim().toString() > weky_package.version) {
			const advertise = chalk(`Are you using ${chalk.red(name)}? Don't lose out on new features!`);

			const msg = chalk(`New ${chalk.green("version")} of ${chalk.yellow("@m3rcena/weky")} is available!`);

			const msg2 = chalk(`${chalk.red(weky_package.version)} -> ${chalk.green(stdout.trim().toString())}`);
			const tip = chalk(`Registry: ${chalk.cyan("https://www.npmjs.com/package/@m3rcena/weky")}`);

			const install = chalk(`Run ${chalk.green(`npm i @m3rcena/weky@${stdout.trim().toString()}`)} to update!`);

			boxConsole([advertise, msg, msg2, tip, install]);
		}
	} catch (error) {
		console.error(error);
	}
};

export const boxConsole = function (messages: string[]) {
	let tips = [];
	let maxLen = 0;
	const defaultSpace = 4;
	const spaceWidth = stringWidth(" ");
	if (Array.isArray(messages)) {
		tips = Array.from(messages);
	} else {
		tips = [messages];
	}
	tips = [" ", ...tips, " "];
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
		return " ".repeat(i) + val + " ".repeat(j);
	});
	const line = chalk.yellow("─".repeat(maxLen));
	console.log(chalk.yellow("┌") + line + chalk.yellow("┐"));
	for (const msg of tips) {
		console.log(chalk.yellow("│") + msg + chalk.yellow("│"));
	}
	console.log(chalk.yellow("└") + line + chalk.yellow("┘"));
};

export const replaceHexCharacters = function (text: string) {
	const hexRegex = /&#x([a-fA-F0-9]+);/g;

	return text.replace(hexRegex, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
};

export const getButtonDilemma = async function () {
	const data = await ofetch("https://weky.miv4.com/api/wyptb", {
		method: "GET",
	});
	return data;
};

export const shuffleArray = function (array: any[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
};

export const fetchhtml = async function (url: string) {
	const options: AxiosRequestConfig<any> = {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
			referer: "https://www.google.com/",
		},
	};

	const html = await axios.get(url, options);
	return load(html.data);
};

export const shuffleString = function (string: string) {
	const seed = Date.now();
	const str = string.split("");
	const length = str.length;
	for (let i = length - 1; i > 0; i--) {
		const j = Math.floor((Math.random() * seed) % (i + 1));
		const tmp = str[i];
		str[i] = str[j];
		str[j] = tmp;
	}
	return str.join("");
};

export const randomHexColor = function () {
	return "#" + ("000000" + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
};

const defaultFooter = {
	text: "©️ M3rcena Development | Powered by Mivator",
	iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png",
};
export const createEmbed = (embedOptions: Embeds, noFields: boolean = false): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setTitle(embedOptions.title)
		.setDescription(embedOptions.description ?? null)
		.setColor(embedOptions.color ?? "Blurple")
		.setURL(embedOptions.url || null)
		.setThumbnail(embedOptions.thumbnail || null)
		.addFields(noFields ? [] : embedOptions.fields || [])
		.setImage(embedOptions.image || null)
		.setTimestamp(embedOptions.timestamp ? new Date() : null)
		.setFooter(embedOptions.footer || defaultFooter);

	if (embedOptions.author) {
		embed.setAuthor({
			name: embedOptions.author.name,
			iconURL: embedOptions.author.icon_url,
			url: embedOptions.author.url,
		});
	}

	return embed;
};

export const ErrorEmbed = (type: string): EmbedBuilder => {
	const embed = new EmbedBuilder().setTitle(`${type.toUpperCase()} ERROR`).setColor("Red").setTimestamp();

	return embed;
};
