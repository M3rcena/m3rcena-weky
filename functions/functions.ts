import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import wordList from "../data/words.json" assert { type: "json" };

export const getRandomString = function (length:number) {
	const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
	}
	return result;
};

export const createButton = function(label:string, disabled: boolean) {
    let style = ButtonStyle.Primary;
    if (label === 'AC' || label === 'DC' || label === '⌫') {
		style = ButtonStyle.Success;
	} else if (label === '=') {
		style = ButtonStyle.Danger;
	} else if (
		label === '(' ||
		label === ')' ||
		label === '^' ||
		label === '%' ||
		label === '÷' ||
		label === 'x' ||
		label === '-' ||
		label === '+' ||
		label === '.'
	) {
		style = ButtonStyle.Primary;
	}
	if (disabled) {
		const btn = new ButtonBuilder()
			.setLabel(label)
			.setStyle(style)
			.setDisabled();
		if (label === '\u200b') {
			btn.setCustomId(getRandomString(10));
		} else {
			btn.setCustomId('cal' + label);
		}
		return btn;
	} else {
		const btn = new ButtonBuilder().setLabel(label).setStyle(style);
		if (label === '\u200b') {
			btn.setDisabled();
			btn.setCustomId(getRandomString(10));
		} else {
			btn.setCustomId('cal' + label);
		}
		return btn;
	}
};

export const addRow = function(btns:ButtonBuilder[]) {
	const row = new ActionRowBuilder<ButtonBuilder>();
	for (const btn of btns) {
		row.addComponents(btn);
	}
	return row;
};

export const getRandomSentence = function(length:number) {
	const word = []
	const words: string[] = wordList;

	for (let i = 0; i < length; i++) {
		word.push(words[Math.floor(Math.random() * words.length)])
	}

	return word;
}

export const convertTime = function(time:number) {
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
	if (d) absoluteTime.push(d);
	if (h) absoluteTime.push(h);
	if (m) absoluteTime.push(m);
	if (s) absoluteTime.push(s);
	return absoluteTime.join(', ');
};