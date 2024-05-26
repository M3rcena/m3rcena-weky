/* eslint-disable no-useless-escape */

import flipMap from "./data/flip";
import tinyMap from './data/tiny';
import bentMap from './data/bent';
import copyMap from './data/copy';
import chalk from 'chalk';

export const bent = async function (str:string) {
	let c = '';
	for (let a, d = 0, e = str.length; d < e; d++) {
		(a = bentMap[str.charAt(d)]),
			typeof a == 'undefined' && (a = str.charAt(d)),
			(c += a);
	}
	return c;
};

export const flip = async function (str:any) {
	const c:object[] = [];
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

export const mirror = async function (str:any) {
	let c:object[] = [];
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

export const randomCase = async function (string:any) {
	let result = '';
	if (!string) throw new TypeError(`${chalk.red('Weky Error:')} A string was not specified.`);
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

export const randomizeNumber = async function (start:number, end:number) {
	if (!start) throw new TypeError(`${chalk.red('Weky Error:')} A number was not specified.`);
	if (!end) throw new TypeError(`${chalk.red('Weky Error:')} A number was not specified.`);
	if (typeof start !== 'number' && typeof end !== 'number') {
		throw new TypeError(`${chalk.red('Weky Error:')} Provided number data is Invalid`);
	}
	const res = Math.floor(Math.random() * (end - start + 1) + start);
	return res;
};

export const randomizeString = async function (array:object[]) {
	if (!array) throw new TypeError(`${chalk.red('Weky Error:')} A array was not specified.`);
	if (typeof array !== 'object') {
		throw new TypeError(`${chalk.red('Weky Error:')} The provided array is invalid.`);
	}
	const res = Math.floor(Math.random() * array.length);
	return array[res];
};

export const reverseText = async function (string:string) {
	return string.split('').reverse().join('');
};

export const tinyCaptial = async function (str:string) {
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

export const vaporwave = async function (string:string) {
	return string
		.replace(/[a-zA-Z0-9!\?\.'";:\]\[}{\)\(@#\$%\^&\*\-_=\+`~><]/g, (char) =>
			String.fromCharCode(0xfee0 + char.charCodeAt(0)),
		)
		.replace(/ /g, '　');
};

let Snake, Fight, Trivia, FastType, QuickClick, ChaosWords, LieSwatter, Calculator, ShuffleGuess, GuessTheNumber, NeverHaveIEver, WouldYouRather, GuessThePokemon, RockPaperScissors, WillYouPressTheButton, TicTacToe;
	Snake = import('./src/v14/Snake');
	Fight = import('./src/v14/Fight');
	Trivia = import('./src/v14/Trivia');
	FastType = import('./src/v14/FastType');
	QuickClick = import('./src/v14/QuickClick');
	ChaosWords = import('./src/v14/ChaosWords');
	LieSwatter = import('./src/v14/LieSwatter');
	Calculator = import('./src/v14/Calculator');
	ShuffleGuess = import('./src/v14/ShuffleGuess');
	GuessTheNumber = import('./src/v14/GuessTheNumber');
	NeverHaveIEver = import('./src/v14/NeverHaveIEver');
	WouldYouRather = import('./src/v14/WouldYouRather');
	GuessThePokemon = import('./src/v14/GuessThePokemon');
	RockPaperScissors = import('./src/v14/RockPaperScissors');
	WillYouPressTheButton = import('./src/v14/WillYouPressTheButton');
	TicTacToe = import('./src/v14/TicTacToe');

export { Snake, Fight, Trivia, FastType, QuickClick, ChaosWords, LieSwatter, Calculator, ShuffleGuess, GuessTheNumber, NeverHaveIEver, WouldYouRather, GuessThePokemon, RockPaperScissors, WillYouPressTheButton };