'use strict';

var chalk = require('chalk');

const map$3 = {
	a: '\u0250',
	b: 'q',
	c: '\u0254',
	d: 'p',
	e: '\u01dd',
	f: '\u025f',
	g: '\u0253',
	h: '\u0265',
	i: '\u0131',
	j: '\u027e',
	k: '\u029e',
	l: 'l',
	m: '\u026f',
	n: 'u',
	r: '\u0279',
	t: '\u0287',
	v: '\u028c',
	w: '\u028d',
	y: '\u028e',
	A: '\u2200',
	B: '\u1660',
	C: '\u0186',
	D: '\u15e1',
	E: '\u018e',
	F: '\u2132',
	G: '\u2141',
	J: '\u017f',
	K: '\u22ca',
	L: '\u02e5',
	M: 'W',
	P: '\u0500',
	Q: '\u038c',
	R: '\u1d1a',
	T: '\u22a5',
	U: '\u2229',
	V: '\u039b',
	Y: '\u2144',
	1: '\u21c2',
	2: '\u1105',
	3: '\u0190',
	4: '\u3123',
	5: '\u078e',
	6: '9',
	7: '\u3125',
	'&': '\u214b',
	'.': '\u02d9',
	'"': '\u201e',
	';': '\u061b',
	'[': ']',
	'(': ')',
	'{': '}',
	'?': '\u00bf',
	'!': '\u00a1',
	'\'': ',',
	'<': '>',
	'\u203e': '_',
	'\u00af': '_',
	'\u203f': '\u2040',
	'\u2045': '\u2046',
	'\u2234': '\u2235',
	'\r': '\n',
	ß: '\u1660',
	'\u0308': '\u0324',
	ä: '\u0250\u0324',
	ö: 'o\u0324',
	ü: 'n\u0324',
	Ä: '\u2200\u0324',
	Ö: 'O\u0324',
	Ü: '\u2229\u0324',
	'\u00b4': ' \u0317',
	é: '\u01dd\u0317',
	á: '\u0250\u0317',
	ó: 'o\u0317',
	ú: 'n\u0317',
	É: '\u018e\u0317',
	Á: '\u2200\u0317',
	Ó: 'O\u0317',
	Ú: '\u2229\u0317',
	'`': ' \u0316',
	è: '\u01dd\u0316',
	à: '\u0250\u0316',
	ò: 'o\u0316',
	ù: 'n\u0316',
	È: '\u018e\u0316',
	À: '\u2200\u0316',
	Ò: 'O\u0316',
	Ù: '\u2229\u0316',
	'^': ' \u032e',
	ê: '\u01dd\u032e',
	â: '\u0250\u032e',
	ô: 'o\u032e',
	û: 'n\u032e',
	Ê: '\u018e\u032e',
	Â: '\u2200\u032e',
	Ô: 'O\u032e',
	Û: '\u2229\u032e',
};

const map$2 = {
	A: '\u1d00',
	B: '\u0299',
	C: '\u1d04',
	D: '\u1d05',
	E: '\u1d07',
	F: '\ua730',
	G: '\u0262',
	H: '\u029c',
	I: '\u026a',
	J: '\u1d0a',
	K: '\u1d0b',
	L: '\u029f',
	M: '\u1d0d',
	N: '\u0274',
	O: '\u1d0f',
	P: '\u1d18',
	Q: 'Q',
	R: '\u0280',
	S: '\ua731',
	T: '\u1d1b',
	U: '\u1d1c',
	V: '\u1d20',
	W: '\u1d21',
	X: 'x',
	Y: '\u028f',
	Z: '\u1d22',
};

const map$1 = {
	a: '\u0105',
	b: '\u048d',
	c: '\u00e7',
	d: '\u056a',
	e: '\u04bd',
	f: '\u0192',
	g: '\u0581',
	h: '\u0570',
	i: '\u00ec',
	j: '\u029d',
	k: '\u049f',
	l: '\u04c0',
	m: '\u028d',
	n: '\u0572',
	o: '\u0585',
	p: '\u0584',
	q: '\u0566',
	r: '\u027e',
	s: '\u0282',
	t: '\u0567',
	u: '\u0574',
	v: '\u0475',
	w: '\u0561',
	x: '\u00d7',
	y: '\u057e',
	z: '\u0540',
	A: '\u023a',
	B: '\u03b2',
	C: '\u21bb',
	D: '\u13a0',
	E: '\u0190',
	F: '\u0191',
	G: '\u0193',
	H: '\u01f6',
	I: '\u012f',
	J: '\u0644',
	K: '\u04a0',
	L: '\ua748',
	M: '\u2c6e',
	N: '\u17a0',
	O: '\u0da7',
	P: '\u03c6',
	Q: '\u04a8',
	R: '\u0f60',
	S: '\u03da',
	T: '\u0372',
	U: '\u0531',
	V: '\u1efc',
	W: '\u0c1a',
	X: '\u10ef',
	Y: '\u04cb',
	Z: '\u0240',
	0: '\u2298',
	1: '\ud835\udfd9',
	2: '\u03e9',
	3: '\u04e0',
	4: '\u096b',
	5: '\u01bc',
	6: '\u03ec',
	7: '7',
	8: '\ud835\udfe0',
	9: '\u096f',
	'&': '\u214b',
	'(': '{',
	')': '}',
	'{': '(',
	'}': ')',
};

const map = {
	a: '\u0252',
	b: 'd',
	c: '\u0254',
	e: '\u0258',
	f: '\u13b8',
	g: '\u01eb',
	h: '\u029c',
	j: '\ua781',
	k: '\u029e',
	l: '|',
	n: '\u1d0e',
	p: 'q',
	r: '\u027f',
	s: '\ua645',
	t: '\u019a',
	y: '\u028f',
	z: '\u01b9',
	B: '\u1660',
	C: '\u0186',
	D: '\u15e1',
	E: '\u018e',
	F: '\ua7fb',
	G: '\u13ae',
	J: '\u10b1',
	K: '\u22ca',
	L: '\u2143',
	N: '\u0376',
	P: '\ua7fc',
	Q: '\u1ecc',
	R: '\u042f',
	S: '\ua644',
	Z: '\u01b8',
	1: '',
	2: '',
	3: '',
	4: '',
	5: '',
	6: '',
	7: '',
	'&': '',
	';': '',
	'[': ']',
	'(': ')',
	'{': '}',
	'?': '\u2e2e',
	'<': '>',
};

/* eslint-disable no-useless-escape */


const bent = async function (str) {
	let c = '';
	for (let a, d = 0, e = str.length; d < e; d++) {
		(a = map$1[str.charAt(d)]),
			typeof a == 'undefined' && (a = str.charAt(d)),
			(c += a);
	}
	return c;
};

const flip = async function (str) {
	const c = [];
	for (let a, d = 0, e = str.length; d < e; d++) {
		(a = str.charAt(d)),
			d > 0 &&
				(a == '\u0324' || a == '\u0317' || a == '\u0316' || a == '\u032e')
				? ((a = map$3[str.charAt(d - 1) + a]), c.pop())
				: ((a = map$3[a]), typeof a == 'undefined' && (a = str.charAt(d))),
			c.push(a);
	}
	return c.reverse().join('');
};

const mirror = async function (str) {
	let c = [];
	const d = [];
	for (let a, e = 0, f = str.length; e < f; e++) {
		(a = str.charAt(e)),
			e > 0 &&
				(a == '\u0308' || a == '\u0300' || a == '\u0301' || a == '\u0302')
				? ((a = map[str.charAt(e - 1) + a]), c.pop())
				: ((a = map[a]), typeof a == 'undefined' && (a = str.charAt(e))),
			a == '\n' ? (d.push(c.reverse().join('')), (c = [])) : c.push(a);
	}
	d.push(c.reverse().join(''));
	return d.join('\n');
};

const randomCase = async function (string) {
	let result = '';
	if (!string) throw new TypeError(`${chalk.red('Weky Error:')} A string was not specified.`);
	if (typeof string !== 'string') {
		throw new TypeError(`${chalk.red('Weky Error:')} Provided string is Invalid.`);
	}
	for (const i in string) {
		const Random = Math.floor(Math.random() * 2);
		result += Random == 1 ? string[i].toLowerCase() : string[i].toUpperCase();
	}
	return result;
};

const randomHexColor = async function () {
	return (
		'#' +
		('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
	);
};

const randomizeNumber = async function (start, end) {
	if (!start) throw new TypeError(`${chalk.red('Weky Error:')} A number was not specified.`);
	if (!end) throw new TypeError(`${chalk.red('Weky Error:')} A number was not specified.`);
	if (typeof start !== 'number' && typeof end !== 'number') {
		throw new TypeError(`${chalk.red('Weky Error:')} Provided number data is Invalid`);
	}
	const res = Math.floor(Math.random() * (end - start + 1) + start);
	return res;
};

const randomizeString = async function (array) {
	if (!array) throw new TypeError(`${chalk.red('Weky Error:')} A array was not specified.`);
	if (typeof array !== 'object') {
		throw new TypeError(`${chalk.red('Weky Error:')} The provided array is invalid.`);
	}
	const res = Math.floor(Math.random() * array.length);
	return array[res];
};

const reverseText = async function (string) {
	return string.split('').reverse().join('');
};

const tinyCaptial = async function (str) {
	let c = '',
		a;
	str = str.toUpperCase();
	for (let d = 0, e = str.length; d < e; d++) {
		(a = map$2[str.charAt(d)]),
			typeof a == 'undefined' && (a = str.charAt(d)),
			(c += a);
	}
	return c;
};

const vaporwave = async function (string) {
	return string
		.replace(/[a-zA-Z0-9!\?\.'";:\]\[}{\)\(@#\$%\^&\*\-_=\+`~><]/g, (char) =>
			String.fromCharCode(0xfee0 + char.charCodeAt(0)),
		)
		.replace(/ /g, '　');
};

exports.Snake = void 0; exports.Fight = void 0; exports.Trivia = void 0; exports.FastType = void 0; exports.QuickClick = void 0; exports.ChaosWords = void 0; exports.LieSwatter = void 0; exports.Calculator = void 0; exports.ShuffleGuess = void 0; exports.GuessTheNumber = void 0; exports.NeverHaveIEver = void 0; exports.WouldYouRather = void 0; exports.GuessThePokemon = void 0; exports.RockPaperScissors = void 0; exports.WillYouPressTheButton = void 0;
	exports.Snake = Promise.resolve().then(function () { return require('./Snake-B-sF7Hdp.js'); });
	exports.Fight = Promise.resolve().then(function () { return require('./Fight-NYxLCX77.cjs'); });
	exports.Trivia = Promise.resolve().then(function () { return require('./Trivia-cdJ3vDK2.js'); });
	exports.FastType = Promise.resolve().then(function () { return require('./FastType-BBLMG56-.cjs'); });
	exports.QuickClick = Promise.resolve().then(function () { return require('./QuickClick-36kV3Bz9.cjs'); });
	exports.ChaosWords = Promise.resolve().then(function () { return require('./ChaosWords-BOCxWTZ1.cjs'); });
	exports.LieSwatter = Promise.resolve().then(function () { return require('./LieSwatter-e9Hf0RpW.cjs'); });
	exports.Calculator = Promise.resolve().then(function () { return require('./Calculator-DfjIYxM4.js'); });
	exports.ShuffleGuess = Promise.resolve().then(function () { return require('./ShuffleGuess-BoHRWdg0.js'); });
	exports.GuessTheNumber = Promise.resolve().then(function () { return require('./GuessTheNumber-CuwMlUMy.cjs'); });
	exports.NeverHaveIEver = Promise.resolve().then(function () { return require('./NeverHaveIEver-DVH85h1i.cjs'); });
	exports.WouldYouRather = Promise.resolve().then(function () { return require('./WouldYouRather-D5W2WpZL.js'); });
	exports.GuessThePokemon = Promise.resolve().then(function () { return require('./GuessThePokemon-31-OpyMg.cjs'); });
	exports.RockPaperScissors = Promise.resolve().then(function () { return require('./RockPaperScissors-DeQLUSxj.cjs'); });
	exports.WillYouPressTheButton = Promise.resolve().then(function () { return require('./WillYouPressTheButton-BDDq3zbh.js'); });
	Promise.resolve().then(function () { return require('./TicTacToe-Co6ZdHlS.js'); });

exports.bent = bent;
exports.flip = flip;
exports.mirror = mirror;
exports.randomCase = randomCase;
exports.randomHexColor = randomHexColor;
exports.randomizeNumber = randomizeNumber;
exports.randomizeString = randomizeString;
exports.reverseText = reverseText;
exports.tinyCaptial = tinyCaptial;
exports.vaporwave = vaporwave;
