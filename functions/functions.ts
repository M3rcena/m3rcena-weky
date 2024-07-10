import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

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