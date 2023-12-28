/* eslint-disable no-useless-escape */

import flipMap from './data/flip.mjs';
import tinyMap from './data/tiny.mjs';
import bentMap from './data/bent.mjs';
import copyMap from './data/copy.mjs';
import * as DJSPackage from 'discord.js/package.json' assert { type: 'json' };

const DJSVersion = DJSPackage.version;

export const bent = async function (str) {
	let c = '';
	for (let a, d = 0, e = str.length; d < e; d++) {
		(a = bentMap[str.charAt(d)]),
			typeof a == 'undefined' && (a = str.charAt(d)),
			(c += a);
	}
	return c;
};

export const flip = async function (str) {
	const c = [];
	for (let a, d = 0, e = str.length; d < e; d++) {
		(a = str.charAt(d)),
			d > 0 &&
				(a == '\u0324' || a == '\u0317' || a == '\u0316' || a == '\u032e')
				? ((a = flipMap[str.charAt(d - 1) + a]), c.pop())
				: ((a = flipMap[a]), typeof a == 'undefined' && (a = str.charAt(d))),
			c.push(a);
	}
	return c.reverse().join('');
};

export const mirror = async function (str) {
	let c = [];
	const d = [];
	for (let a, e = 0, f = str.length; e < f; e++) {
		(a = str.charAt(e)),
			e > 0 &&
				(a == '\u0308' || a == '\u0300' || a == '\u0301' || a == '\u0302')
				? ((a = copyMap[str.charAt(e - 1) + a]), c.pop())
				: ((a = copyMap[a]), typeof a == 'undefined' && (a = str.charAt(e))),
			a == '\n' ? (d.push(c.reverse().join('')), (c = [])) : c.push(a);
	}
	d.push(c.reverse().join(''));
	return d.join('\n');
};

export const randomCase = async function (string) {
	let result = '';
	if (!string) throw new TypeError('Weky Error: A string was not specified.');
	if (typeof string !== 'string') {
		throw new TypeError('Weky Error: Provided string is Invalid.');
	}
	for (const i in string) {
		const Random = Math.floor(Math.random() * 2);
		result += Random == 1 ? string[i].toLowerCase() : string[i].toUpperCase();
	}
	return result;
};

export const randomHexColor = async function () {
	return (
		'#' +
		('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
	);
};

export const randomizeNumber = async function (start, end) {
	if (!start) throw new TypeError('Weky Error: A number was not specified.');
	if (!end) throw new TypeError('Weky Error: A number was not specified.');
	if (typeof start !== 'number' && typeof end !== 'number') {
		throw new TypeError('Weky Error: Provided number data is Invalid');
	}
	const res = Math.floor(Math.random() * (end - start + 1) + start);
	return res;
};

export const randomizeString = async function (array) {
	if (!array) throw new TypeError('Weky Error: A array was not specified.');
	if (typeof array !== 'object') {
		throw new TypeError('Weky Error: The provided array is invalid.');
	}
	const res = Math.floor(Math.random() * array.length);
	return array[res];
};

export const reverseText = async function (string) {
	return string.split('').reverse().join('');
};

export const tinyCaptial = async function (str) {
	let c = '',
		a;
	str = str.toUpperCase();
	for (let d = 0, e = str.length; d < e; d++) {
		(a = tinyMap[str.charAt(d)]),
			typeof a == 'undefined' && (a = str.charAt(d)),
			(c += a);
	}
	return c;
};

export const vaporwave = async function (string) {
	return string
		.replace(/[a-zA-Z0-9!\?\.'";:\]\[}{\)\(@#\$%\^&\*\-_=\+`~><]/g, (char) =>
			String.fromCharCode(0xfee0 + char.charCodeAt(0)),
		)
		.replace(/ /g, '　');
};

let Sudo, Snake, Fight, Trivia, FastType, QuickFind, QuickClick, ChaosWords, LieSwatter, Calculator, ShuffleGuess, GuessTheNumber, NeverHaveIEver, WouldYouRather, GuessThePokemon, RockPaperScissors, WillYouPressTheButton;
// if (DJSVersion => 14) {
	Sudo = import('./src/v14/Sudo.mjs');
	Snake = import('./src/v14/Snake.mjs');
	Fight = import('./src/v14/Fight.mjs');
	Trivia = import('./src/v14/Trivia.mjs');
	FastType = import('./src/v14/FastType.mjs');
	QuickFind = import('./src/v14/QuickFind.mjs');
	QuickClick = import('./src/v14/QuickClick.mjs');
	ChaosWords = import('./src/v14/ChaosWords.mjs');
	LieSwatter = import('./src/v14/LieSwatter.mjs');
	Calculator = import('./src/v14/Calculator.mjs');
	ShuffleGuess = import('./src/v14/ShuffleGuess.mjs');
	GuessTheNumber = import('./src/v14/GuessTheNumber.mjs');
	NeverHaveIEver = import('./src/v14/NeverHaveIEver.mjs');
	WouldYouRather = import('./src/v14/WouldYouRather.mjs');
	GuessThePokemon = import('./src/v14/GuessThePokemon.mjs');
	RockPaperScissors = import('./src/v14/RockPaperScissors.mjs');
	WillYouPressTheButton = import('./src/v14/WillYouPressTheButton.mjs');
// } else {
// 	console.log("[Weky Error]: Discord.JS should be ^v14");
// }

export { Sudo, Snake, Fight, Trivia, FastType, QuickFind, QuickClick, ChaosWords, LieSwatter, Calculator, ShuffleGuess, GuessTheNumber, NeverHaveIEver, WouldYouRather, GuessThePokemon, RockPaperScissors, WillYouPressTheButton };