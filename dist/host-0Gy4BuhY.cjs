const require_rolldown_runtime = require("./rolldown-runtime-CmQyd0Gu.cjs");
const require_resolver = require("./resolver.cjs");
let _napi_rs_canvas = require("@napi-rs/canvas");
let _m3rcena_bridge = require("@m3rcena/bridge");
let node_http = require("node:http");
node_http = require_rolldown_runtime.__toESM(node_http);
// src/version.ts
const version = "14.28.1-1";
const VERSION = version;
const WEKY_VERSION = version;
// src/utils/MathEvaluator.ts
var MathEvaluator = class {
	static factorial(n) {
		if (!Number.isInteger(n) || n < 0) throw new Error("Factorial is only defined for non-negative integers");
		if (n > 170) throw new Error("Factorial overflow (max 170)");
		if (n === 0 || n === 1) return 1;
		let res = 1;
		for (let i = 2; i <= n; i++) res *= i;
		return res;
	}
	/**
	* Evaluates a mathematical expression safely.
	* @param expression The mathematical string.
	* @param lastAnswer The previous answer value for 'ans'.
	*/
	static evaluate(expression, lastAnswer = 0) {
		try {
			if (!expression || expression.trim().length === 0) return {
				result: null,
				formatted: "0",
				error: "Empty expression"
			};
			let clean = expression.replace(/×/g, "*").replace(/x/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").trim();
			const tokens = this.tokenize(clean, lastAnswer);
			const rpn = this.toRPN(tokens);
			const result = this.evaluateRPN(rpn);
			if (!Number.isFinite(result)) return {
				result: null,
				formatted: "Error",
				error: "Result is infinite or undefined"
			};
			return {
				result,
				formatted: this.formatNumber(result)
			};
		} catch (err) {
			return {
				result: null,
				formatted: "Error",
				error: err.message || "Invalid expression"
			};
		}
	}
	static formatNumber(n) {
		if (Number.isInteger(n)) return n.toString();
		return parseFloat(n.toFixed(10)).toString();
	}
	static tokenize(expr, lastAnswer) {
		const tokens = [];
		let i = 0;
		while (i < expr.length) {
			const char = expr[i];
			if (/\s/.test(char)) {
				i++;
				continue;
			}
			if (/\d/.test(char) || char === "." && /\d/.test(expr[i + 1] || "")) {
				let numStr = "";
				while (i < expr.length && (/[\d.]/.test(expr[i]) || expr[i] === "e" && /[\d+-]/.test(expr[i + 1] || ""))) {
					numStr += expr[i];
					i++;
				}
				tokens.push(parseFloat(numStr));
				continue;
			}
			if (/[a-zA-Z]/.test(char)) {
				let ident = "";
				while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
					ident += expr[i].toLowerCase();
					i++;
				}
				if (ident === "pi") tokens.push(Math.PI);
				else if (ident === "e") tokens.push(Math.E);
				else if (ident === "ans") tokens.push(lastAnswer);
				else if ([
					"sin",
					"cos",
					"tan",
					"sqrt",
					"log",
					"log10",
					"ln",
					"round",
					"abs"
				].includes(ident)) tokens.push(ident);
				else throw new Error(`Unknown function or symbol: ${ident}`);
				continue;
			}
			if (char === "+" || char === "-" || char === "*" || char === "/" || char === "^" || char === "%" || char === "!" || char === "(" || char === ")") {
				if (char === "-") {
					const prev = tokens[tokens.length - 1];
					if (tokens.length === 0 || prev === "(" || typeof prev === "string" && prev !== "!") {
						tokens.push("u-");
						i++;
						continue;
					}
				}
				tokens.push(char);
				i++;
				continue;
			}
			throw new Error(`Invalid character: '${char}'`);
		}
		return tokens;
	}
	static toRPN(tokens) {
		const output = [];
		const stack = [];
		const precedence = {
			"+": 1,
			"-": 1,
			"*": 2,
			"/": 2,
			"%": 2,
			"^": 3,
			"u-": 4,
			"!": 5
		};
		const isRightAssociative = (op) => op === "^" || op === "u-";
		for (const token of tokens) if (typeof token === "number") output.push(token);
		else if ([
			"sin",
			"cos",
			"tan",
			"sqrt",
			"log",
			"log10",
			"ln",
			"round",
			"abs"
		].includes(token)) stack.push(token);
		else if (token === "(") stack.push(token);
		else if (token === ")") {
			while (stack.length > 0 && stack[stack.length - 1] !== "(") output.push(stack.pop());
			if (stack.length === 0) throw new Error("Mismatched parentheses");
			stack.pop();
			if (stack.length > 0 && [
				"sin",
				"cos",
				"tan",
				"sqrt",
				"log",
				"log10",
				"ln",
				"round",
				"abs"
			].includes(stack[stack.length - 1])) output.push(stack.pop());
		} else {
			const op = token;
			while (stack.length > 0 && stack[stack.length - 1] !== "(" && (!isRightAssociative(op) && precedence[stack[stack.length - 1]] >= precedence[op] || isRightAssociative(op) && precedence[stack[stack.length - 1]] > precedence[op])) output.push(stack.pop());
			stack.push(op);
		}
		while (stack.length > 0) {
			const top = stack.pop();
			if (top === "(" || top === ")") throw new Error("Mismatched parentheses");
			output.push(top);
		}
		return output;
	}
	static evaluateRPN(rpn) {
		const stack = [];
		for (const token of rpn) {
			if (typeof token === "number") {
				stack.push(token);
				continue;
			}
			switch (token) {
				case "u-":
					if (stack.length < 1) throw new Error("Invalid unary minus syntax");
					stack.push(-stack.pop());
					break;
				case "!":
					if (stack.length < 1) throw new Error("Invalid factorial syntax");
					stack.push(this.factorial(stack.pop()));
					break;
				case "+": {
					if (stack.length < 2) throw new Error("Invalid addition syntax");
					const b = stack.pop();
					const a = stack.pop();
					stack.push(a + b);
					break;
				}
				case "-": {
					if (stack.length < 2) throw new Error("Invalid subtraction syntax");
					const b = stack.pop();
					const a = stack.pop();
					stack.push(a - b);
					break;
				}
				case "*": {
					if (stack.length < 2) throw new Error("Invalid multiplication syntax");
					const b = stack.pop();
					const a = stack.pop();
					stack.push(a * b);
					break;
				}
				case "/": {
					if (stack.length < 2) throw new Error("Invalid division syntax");
					const b = stack.pop();
					const a = stack.pop();
					if (b === 0) throw new Error("Cannot divide by zero");
					stack.push(a / b);
					break;
				}
				case "%": {
					if (stack.length < 2) throw new Error("Invalid modulo syntax");
					const b = stack.pop();
					const a = stack.pop();
					if (b === 0) throw new Error("Cannot divide by zero");
					stack.push(a % b);
					break;
				}
				case "^": {
					if (stack.length < 2) throw new Error("Invalid exponent syntax");
					const b = stack.pop();
					const a = stack.pop();
					if (b > 1e3 || a > 100 && b > 100) throw new Error("Exponent too large");
					stack.push(Math.pow(a, b));
					break;
				}
				case "sin":
					if (stack.length < 1) throw new Error("Missing argument for sin");
					stack.push(Math.sin(stack.pop()));
					break;
				case "cos":
					if (stack.length < 1) throw new Error("Missing argument for cos");
					stack.push(Math.cos(stack.pop()));
					break;
				case "tan":
					if (stack.length < 1) throw new Error("Missing argument for tan");
					stack.push(Math.tan(stack.pop()));
					break;
				case "sqrt": {
					if (stack.length < 1) throw new Error("Missing argument for sqrt");
					const val = stack.pop();
					if (val < 0) throw new Error("Cannot calculate square root of a negative number");
					stack.push(Math.sqrt(val));
					break;
				}
				case "log":
				case "log10": {
					if (stack.length < 1) throw new Error("Missing argument for log");
					const val = stack.pop();
					if (val <= 0) throw new Error("Logarithm argument must be positive");
					stack.push(Math.log10(val));
					break;
				}
				case "ln": {
					if (stack.length < 1) throw new Error("Missing argument for ln");
					const val = stack.pop();
					if (val <= 0) throw new Error("Logarithm argument must be positive");
					stack.push(Math.log(val));
					break;
				}
				case "round":
					if (stack.length < 1) throw new Error("Missing argument for round");
					stack.push(Math.round(stack.pop()));
					break;
				case "abs":
					if (stack.length < 1) throw new Error("Missing argument for abs");
					stack.push(Math.abs(stack.pop()));
					break;
				default: throw new Error(`Unknown operator: ${token}`);
			}
		}
		if (stack.length !== 1) throw new Error("Invalid expression");
		return stack[0];
	}
};
// src/data/words.ts
const HANGMAN_CATEGORIES = {
	Animals: [
		"elephant",
		"alligator",
		"chimpanzee",
		"dolphin",
		"flamingo",
		"kangaroo",
		"hedgehog",
		"chameleon",
		"penguin",
		"leopard",
		"octopus",
		"platypus",
		"giraffe",
		"rhinoceros",
		"gorilla",
		"cheetah",
		"crocodile",
		"squirrel",
		"badger",
		"tortoise",
		"armadillo",
		"jellyfish",
		"seahorse",
		"woodpecker",
		"porcupine",
		"hippopotamus",
		"anteater",
		"wolverine",
		"koala",
		"panther"
	],
	Countries: [
		"australia",
		"brazil",
		"canada",
		"denmark",
		"egypt",
		"finland",
		"germany",
		"hungary",
		"iceland",
		"japan",
		"kenya",
		"mexico",
		"norway",
		"portugal",
		"switzerland",
		"thailand",
		"ukraine",
		"vietnam",
		"argentina",
		"belgium",
		"colombia",
		"greece",
		"indonesia",
		"ireland",
		"madagascar",
		"netherlands",
		"philippines",
		"singapore",
		"sweden",
		"turkey"
	],
	Technology: [
		"typescript",
		"javascript",
		"discord",
		"algorithm",
		"database",
		"compiler",
		"frontend",
		"backend",
		"encryption",
		"framework",
		"interface",
		"kubernetes",
		"microservice",
		"python",
		"repository",
		"firewall",
		"bandwidth",
		"protocol",
		"cybersecurity",
		"middleware",
		"debugger",
		"variable",
		"container",
		"terminal",
		"asynchronous",
		"functional",
		"recursion",
		"hardware",
		"software",
		"processor"
	],
	Gaming: [
		"minecraft",
		"nintendo",
		"playstation",
		"pokemon",
		"controller",
		"graphics",
		"joystick",
		"speedrun",
		"respawn",
		"multiplayer",
		"adventure",
		"quest",
		"portal",
		"assassin",
		"overwatch",
		"fortnite",
		"zelda",
		"warcraft",
		"sandbox",
		"inventory",
		"stealth",
		"headshot",
		"checkpoint",
		"dungeon",
		"platformer",
		"retro",
		"emulator",
		"champion",
		"bossfight",
		"achievement"
	],
	Food: [
		"spaghetti",
		"hamburger",
		"croissant",
		"burrito",
		"chocolate",
		"pancake",
		"sandwich",
		"cheesecake",
		"barbecue",
		"mushroom",
		"avocado",
		"lasagna",
		"doughnut",
		"pineapple",
		"waffle",
		"guacamole",
		"macaroni",
		"quesadilla",
		"dumpling",
		"smoothie",
		"meatball",
		"casserole",
		"biscuit",
		"marshmallow"
	]
};
const COMMON_WORDS = [
	"ability",
	"accident",
	"accurate",
	"activity",
	"adventure",
	"airport",
	"alphabet",
	"ancient",
	"apartment",
	"applause",
	"architect",
	"argument",
	"astronaut",
	"athlete",
	"audience",
	"balloon",
	"battery",
	"beautiful",
	"bicycle",
	"birthday",
	"blanket",
	"breakfast",
	"brilliant",
	"building",
	"calendar",
	"camera",
	"captain",
	"carousel",
	"castle",
	"celebrate",
	"century",
	"champion",
	"chemical",
	"chocolate",
	"circus",
	"climate",
	"clothes",
	"collector",
	"community",
	"compass",
	"concert",
	"courage",
	"creative",
	"curious",
	"customer",
	"daughter",
	"daylight",
	"diamond",
	"dictionary",
	"dinosaur",
	"discovery",
	"distance",
	"dolphin",
	"dragon",
	"drawing",
	"education",
	"electric",
	"element",
	"emergency",
	"emotion",
	"energy",
	"engine",
	"enormous",
	"envelope",
	"evening",
	"exercise",
	"explosion",
	"factory",
	"famous",
	"fantastic",
	"feather",
	"festival",
	"fireworks",
	"flavor",
	"fortune",
	"freedom",
	"friendly",
	"galaxy",
	"garden",
	"gentle",
	"glacier",
	"governor",
	"gravity",
	"grocery",
	"guitar",
	"happiness",
	"harmony",
	"harvest",
	"headline",
	"helicopter",
	"heritage",
	"history",
	"horizon",
	"hospital",
	"humidity",
	"hurricane",
	"iceberg",
	"illusion",
	"imagination",
	"industry",
	"infinite",
	"ingredient",
	"instrument",
	"island",
	"journey",
	"jungle",
	"keyboard",
	"kingdom",
	"kitchen",
	"landscape",
	"laughter",
	"library",
	"lightning",
	"location",
	"luggage",
	"machine",
	"magazine",
	"magical",
	"magnet",
	"mammal",
	"mansion",
	"marathon",
	"meadow",
	"mechanic",
	"medicine",
	"melody",
	"memory",
	"midnight",
	"mineral",
	"miracle",
	"monument",
	"morning",
	"mountain",
	"museum",
	"musician",
	"mystery",
	"natural",
	"navigator",
	"necklace",
	"neighborhood",
	"notebook",
	"novel",
	"nuclear",
	"observatory",
	"ocean",
	"officer",
	"olympics",
	"orchestra",
	"ordinary",
	"organism",
	"original",
	"oxygen",
	"package",
	"painting",
	"palace",
	"paradise",
	"passenger",
	"passport",
	"pattern",
	"peaceful",
	"perfume",
	"phantom",
	"photograph",
	"physics",
	"pioneer",
	"planet",
	"platform",
	"pleasant",
	"polar",
	"portrait",
	"powerful",
	"precious",
	"president",
	"princess",
	"pyramid",
	"quantum",
	"question",
	"radiant",
	"rainbow",
	"reaction",
	"reception",
	"record",
	"reflection",
	"republic",
	"rescue",
	"reservoir",
	"restaurant",
	"revolution",
	"rhythm",
	"rocket",
	"safari",
	"satellite",
	"scenario",
	"science",
	"scissors",
	"sculpture",
	"season",
	"secret",
	"shadow",
	"shelter",
	"skeleton",
	"skyline",
	"solitary",
	"solution",
	"spectrum",
	"stadium",
	"statue",
	"submarine",
	"sunshine",
	"surprise",
	"symphony",
	"talent",
	"telescope",
	"theater",
	"thunder",
	"tomorrow",
	"tornado",
	"treasure",
	"triangle",
	"triumph",
	"tropical",
	"umbrella",
	"universe",
	"vacation",
	"valuable",
	"vehicle",
	"velvet",
	"victory",
	"village",
	"vintage",
	"volcano",
	"voyage",
	"warrior",
	"waterfall",
	"weather",
	"whisper",
	"wildlife",
	"wizard",
	"wonder",
	"xylophone",
	"yesterday",
	"zealous",
	"zodiac"
];
function getRandomWord() {
	return COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
}
function getRandomWords(count) {
	return [...COMMON_WORDS].sort(() => .5 - Math.random()).slice(0, count);
}
function getRandomHangmanWord(category) {
	const catNames = Object.keys(HANGMAN_CATEGORIES);
	const selectedCat = category && HANGMAN_CATEGORIES[category] ? category : catNames[Math.floor(Math.random() * catNames.length)];
	const words = HANGMAN_CATEGORIES[selectedCat];
	return {
		word: words[Math.floor(Math.random() * words.length)].toUpperCase(),
		category: selectedCat
	};
}
// src/canvas/CanvasUtils.ts
var CanvasUtils = class {
	/**
	* Draws a rounded rectangle path.
	*/
	static roundRectPath(ctx, x, y, w, h, r) {
		let tl = 0, tr = 0, br = 0, bl = 0;
		if (typeof r === "number") tl = tr = br = bl = r;
		else if (Array.isArray(r)) [tl, tr = tl, br = tl, bl = tr] = r;
		ctx.beginPath();
		ctx.moveTo(x + tl, y);
		ctx.lineTo(x + w - tr, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
		ctx.lineTo(x + w, y + h - br);
		ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
		ctx.lineTo(x + bl, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
		ctx.lineTo(x, y + tl);
		ctx.quadraticCurveTo(x, y, x + tl, y);
		ctx.closePath();
	}
	/**
	* Fills a rounded rectangle with optional fill and stroke.
	*/
	static fillRoundedRect(ctx, x, y, w, h, r, fillStyle, strokeStyle, lineWidth = 1) {
		ctx.save();
		this.roundRectPath(ctx, x, y, w, h, r);
		ctx.fillStyle = fillStyle;
		ctx.fill();
		if (strokeStyle) {
			ctx.strokeStyle = strokeStyle;
			ctx.lineWidth = lineWidth;
			ctx.stroke();
		}
		ctx.restore();
	}
	/**
	* Safely loads and draws a circular avatar with optional border and glow.
	*/
	static async drawCircularAvatar(ctx, url, x, y, radius, borderColor, borderWidth = 3) {
		try {
			if (!url) return;
			const avatar = await (0, _napi_rs_canvas.loadImage)(url);
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
			ctx.restore();
			if (borderColor && borderWidth > 0) {
				ctx.save();
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.strokeStyle = borderColor;
				ctx.lineWidth = borderWidth;
				ctx.shadowColor = borderColor;
				ctx.shadowBlur = 8;
				ctx.stroke();
				ctx.restore();
			}
		} catch {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = "#3a3c42";
			ctx.fill();
			if (borderColor) {
				ctx.strokeStyle = borderColor;
				ctx.lineWidth = borderWidth;
				ctx.stroke();
			}
			ctx.restore();
		}
	}
	/**
	* Draws a badge with rounded corners and centered text.
	*/
	static drawBadge(ctx, text, x, y, w, h, bgColor, textColor = "#ffffff", font = "bold 14px sans-serif") {
		this.fillRoundedRect(ctx, x, y, w, h, h / 2, bgColor);
		ctx.save();
		ctx.fillStyle = textColor;
		ctx.font = font;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, x + w / 2, y + h / 2);
		ctx.restore();
	}
	/**
	* Draws a shiny vector gold coin icon at (x, y) with radius r.
	* Completely avoids server font emoji missing tofu glyphs.
	*/
	static drawCoinIcon(ctx, x, y, r = 10) {
		ctx.save();
		const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
		grad.addColorStop(0, "#ffe066");
		grad.addColorStop(1, "#d48806");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
		ctx.lineWidth = Math.max(1, r / 6);
		ctx.beginPath();
		ctx.arc(x, y, r * .72, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = "#fff4b8";
		ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("¢", x, y + .5);
		ctx.restore();
	}
	/**
	* Safely cleans text by stripping Unicode emojis and symbols that render as tofu `[?]` boxes on Linux servers.
	*/
	static cleanText(text) {
		if (!text) return "";
		return text.replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{FE00}-\u{FE0F}]/gu, "").replace(/\s+/g, " ").trim();
	}
	/**
	* Draws a crisp vector checkmark badge at (cx, cy).
	*/
	static drawCheckmarkIcon(ctx, cx, cy, radius = 8, bgColor = "#57f287", checkColor = "#0b0f19") {
		ctx.save();
		ctx.fillStyle = bgColor;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = checkColor;
		ctx.lineWidth = Math.max(1.5, radius / 4);
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.beginPath();
		ctx.moveTo(cx - radius * .45, cy);
		ctx.lineTo(cx - radius * .1, cy + radius * .4);
		ctx.lineTo(cx + radius * .45, cy - radius * .35);
		ctx.stroke();
		ctx.restore();
	}
	/**
	* Draws a vector 5-point star icon at (cx, cy).
	*/
	static drawStarIcon(ctx, cx, cy, spikes = 5, outerRadius = 7, innerRadius = 3.5, color = "#ffd700") {
		ctx.save();
		let rot = Math.PI / 2 * 3;
		let x = cx;
		let y = cy;
		const step = Math.PI / spikes;
		ctx.beginPath();
		ctx.moveTo(cx, cy - outerRadius);
		for (let i = 0; i < spikes; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			ctx.lineTo(x, y);
			rot += step;
			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			ctx.lineTo(x, y);
			rot += step;
		}
		ctx.lineTo(cx, cy - outerRadius);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
		ctx.restore();
	}
	/**
	* Draws a sleek vector flame icon at (cx, cy).
	*/
	static drawFlameIcon(ctx, cx, cy, size = 10, color = "#ff8c38") {
		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(cx, cy - size * .9);
		ctx.quadraticCurveTo(cx + size * .7, cy - size * .2, cx + size * .5, cy + size * .5);
		ctx.quadraticCurveTo(cx + size * .2, cy + size * .9, cx, cy + size * .9);
		ctx.quadraticCurveTo(cx - size * .2, cy + size * .9, cx - size * .5, cy + size * .5);
		ctx.quadraticCurveTo(cx - size * .7, cy - size * .2, cx, cy - size * .9);
		ctx.fill();
		ctx.fillStyle = "#ffe066";
		ctx.beginPath();
		ctx.arc(cx, cy + size * .35, size * .3, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
	/**
	* Draws a clean vector crown icon at (cx, cy).
	*/
	static drawCrownIcon(ctx, cx, cy, width = 14, height = 9, color = "#ffd700") {
		ctx.save();
		ctx.fillStyle = color;
		const halfW = width / 2;
		const topY = cy - height / 2;
		const botY = cy + height / 2;
		ctx.beginPath();
		ctx.moveTo(cx - halfW, topY);
		ctx.lineTo(cx - halfW * .5, topY + height * .45);
		ctx.lineTo(cx, topY);
		ctx.lineTo(cx + halfW * .5, topY + height * .45);
		ctx.lineTo(cx + halfW, topY);
		ctx.lineTo(cx + halfW * .75, botY);
		ctx.lineTo(cx - halfW * .75, botY);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
};
// src/canvas/RenderFight.ts
var RenderFight = class {
	/**
	* Sanitizes text for Canvas rendering by stripping markdown asterisks,
	* resolving Discord user mentions into actual usernames, and removing
	* unicode emoji sequences that cause missing glyph '▯' (tofu) boxes.
	*/
	static cleanText(text, players = []) {
		if (!text) return "";
		let clean = text;
		for (const p of players) if (p.id) clean = clean.replace(new RegExp(`<@!?${p.id}>`, "g"), p.username);
		clean = clean.replace(/<@!?\d+>/g, "@Player");
		clean = clean.replace(/\*\*(.*?)\*\*/g, "$1");
		clean = clean.replace(/\*(.*?)\*/g, "$1");
		clean = clean.replace(/__(.*?)__/g, "$1");
		clean = clean.replace(/~~(.*?)~~/g, "$1");
		clean = clean.replace(/`(.*?)`/g, "$1");
		clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu, "");
		return clean.replace(/\s+/g, " ").trim();
	}
	/**
	* Renders the initial Fight Challenge / Request card.
	*/
	static async renderRequestCard(challenger, opponent, customTexts) {
		const W = 900;
		const H = 520;
		const canvas = new _napi_rs_canvas.Canvas(W, H);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
		bg.addColorStop(0, "#161b26");
		bg.addColorStop(.65, "#0d1017");
		bg.addColorStop(1, "#07080c");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
		ctx.lineWidth = 1;
		for (let x = 40; x < W; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, H);
			ctx.stroke();
		}
		for (let y = 40; y < H; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(W, y);
			ctx.stroke();
		}
		CanvasUtils.fillRoundedRect(ctx, 24, 24, 852, 472, 24, "rgba(255,255,255,0.015)", "rgba(0, 245, 160, 0.25)", 1.5);
		ctx.save();
		ctx.font = "bold 38px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#00f5a0";
		ctx.shadowColor = "rgba(0, 245, 160, 0.6)";
		ctx.shadowBlur = 18;
		const reqTitle = CanvasUtils.cleanText(customTexts?.title || "DUEL CHALLENGE");
		ctx.fillText(reqTitle, W / 2, 75);
		ctx.restore();
		await CanvasUtils.drawCircularAvatar(ctx, challenger.avatarUrl, 230, 240, 80, "#00f5a0", 5);
		await CanvasUtils.drawCircularAvatar(ctx, opponent.avatarUrl, 670, 240, 80, "#ff2d55", 5);
		const vsX = W / 2;
		CanvasUtils.fillRoundedRect(ctx, 406, 196, 88, 88, 20, "#121620", "rgba(255, 255, 255, 0.2)", 2);
		ctx.save();
		ctx.font = "bold 42px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#ffffff";
		ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
		ctx.shadowBlur = 12;
		const vsText = CanvasUtils.cleanText(customTexts?.vsText || "VS");
		ctx.fillText(vsText, vsX, 242);
		ctx.restore();
		const drawPlayerInfo = (name, role, x, color) => {
			CanvasUtils.fillRoundedRect(ctx, x - 130, 345, 260, 68, 16, "rgba(18, 22, 30, 0.85)", color, 1.5);
			CanvasUtils.drawBadge(ctx, role, x - 55, 355, 110, 22, color, "#000000", "bold 11px sans-serif");
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 20px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			const truncated = name.length > 15 ? name.slice(0, 14) + "…" : name;
			ctx.fillText(truncated, x, 396);
		};
		drawPlayerInfo(challenger.username, "CHALLENGER", 230, "#00f5a0");
		drawPlayerInfo(opponent.username, "OPPONENT", 670, "#ff2d55");
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.font = "15px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const reqSub = CanvasUtils.cleanText(customTexts?.subtitle || "Awaiting opponent to accept duel...");
		ctx.fillText(reqSub, W / 2, 455);
		return canvas.toBuffer("image/png");
	}
	/**
	* Renders the dynamic Battle Arena card with health bars, coins, and current turn indicators.
	*/
	static async renderBattleCard(player1, player2, currentTurnUserId, announcement = "Battle in progress!", customTexts) {
		const W = 900;
		const H = 620;
		const canvas = new _napi_rs_canvas.Canvas(W, H);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 580);
		bg.addColorStop(0, "#161b24");
		bg.addColorStop(.65, "#0e1118");
		bg.addColorStop(1, "#07090d");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
		ctx.lineWidth = 1;
		for (let x = 40; x < W; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, H);
			ctx.stroke();
		}
		const cleanAnnouncement = this.cleanText(customTexts?.title || announcement, [player1, player2]) || "Duel in progress!";
		CanvasUtils.fillRoundedRect(ctx, 40, 24, 820, 60, 16, "rgba(18, 22, 30, 0.88)", "rgba(255, 255, 255, 0.12)", 1.5);
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 20px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
		ctx.shadowBlur = 8;
		const truncatedAnnouncement = cleanAnnouncement.length > 68 ? cleanAnnouncement.slice(0, 66) + "…" : cleanAnnouncement;
		ctx.fillText(truncatedAnnouncement, W / 2, 54);
		ctx.restore();
		const isP1Turn = player1.id === currentTurnUserId;
		const isP2Turn = player2.id === currentTurnUserId;
		await this.drawFighterPanel(ctx, player1, 45, 110, 365, 475, isP1Turn, "#00f5a0", customTexts);
		await this.drawFighterPanel(ctx, player2, 490, 110, 365, 475, isP2Turn, "#ff2d55", customTexts);
		const vsX = W / 2;
		CanvasUtils.fillRoundedRect(ctx, 418, 308, 64, 64, 16, "#121620", "rgba(255, 255, 255, 0.2)", 1.5);
		ctx.save();
		ctx.font = "bold 28px sans-serif";
		ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const vsLabel = CanvasUtils.cleanText(customTexts?.vsText || "VS");
		ctx.fillText(vsLabel, vsX, 341);
		ctx.restore();
		return canvas.toBuffer("image/png");
	}
	static async drawFighterPanel(ctx, player, x, y, w, h, isTurn, themeColor, customTexts) {
		const borderColor = isTurn ? themeColor : "rgba(255, 255, 255, 0.08)";
		const borderWidth = isTurn ? 2.5 : 1;
		CanvasUtils.fillRoundedRect(ctx, x, y, w, h, 22, "rgba(16, 20, 28, 0.9)", borderColor, borderWidth);
		if (isTurn) {
			ctx.save();
			ctx.shadowColor = themeColor;
			ctx.shadowBlur = 14;
			CanvasUtils.drawBadge(ctx, "ACTIVE TURN", x + w / 2 - 65, y + 18, 130, 26, themeColor, "#000000", "bold 12px sans-serif");
			ctx.restore();
		}
		const avatarY = y + (isTurn ? 104 : 85);
		await CanvasUtils.drawCircularAvatar(ctx, player.avatarUrl, x + w / 2, avatarY, 52, isTurn ? themeColor : "rgba(255,255,255,0.2)", 3);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 22px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const nameY = avatarY + 74;
		const truncated = player.username.length > 15 ? player.username.slice(0, 14) + "…" : player.username;
		ctx.fillText(truncated, x + w / 2, nameY);
		const maxHp = player.maxHealth || 100;
		const currentHp = Math.max(0, Math.min(maxHp, player.health));
		const hpRatio = maxHp > 0 ? currentHp / maxHp : 0;
		const hpY = nameY + 28;
		const barW = w - 44;
		const barX = x + 22;
		const barH = 26;
		CanvasUtils.fillRoundedRect(ctx, barX, hpY, barW, barH, 13, "#212530", "rgba(255,255,255,0.06)", 1);
		if (currentHp > 0) {
			const fillW = Math.max(barH, barW * hpRatio);
			const hpGrad = ctx.createLinearGradient(barX, hpY, barX + fillW, hpY);
			if (hpRatio > .5) {
				hpGrad.addColorStop(0, "#00f5a0");
				hpGrad.addColorStop(1, "#00b862");
			} else if (hpRatio > .25) {
				hpGrad.addColorStop(0, "#ffb700");
				hpGrad.addColorStop(1, "#ff7700");
			} else {
				hpGrad.addColorStop(0, "#ff2d55");
				hpGrad.addColorStop(1, "#c00028");
			}
			CanvasUtils.fillRoundedRect(ctx, barX, hpY, fillW, barH, 13, hpGrad);
		}
		const hpLabel = CanvasUtils.cleanText(customTexts?.hpLabel || "HP");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 13px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(`${currentHp} / ${maxHp} ${hpLabel}`, x + w / 2, hpY + barH / 2 + 1);
		const statsY = hpY + 48;
		const coinLabel = CanvasUtils.cleanText(customTexts?.coinLabel || "Coins");
		const coinStr = `${player.coins} ${coinLabel}`;
		ctx.font = "bold 16px sans-serif";
		const coinStartX = x + (w - (28 + ctx.measureText(coinStr).width)) / 2;
		CanvasUtils.drawCoinIcon(ctx, coinStartX + 10, statsY, 10);
		ctx.fillStyle = "#ffd700";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(coinStr, coinStartX + 26, statsY);
		const actionY = statsY + 30;
		CanvasUtils.fillRoundedRect(ctx, barX, actionY, barW, 44, 12, "rgba(255, 255, 255, 0.03)", "rgba(255,255,255,0.07)", 1);
		ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
		ctx.font = "14px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const cleanAction = this.cleanText(player.lastAction || "Awaiting action...", [player]);
		ctx.fillText(cleanAction, x + w / 2, actionY + 22);
		if (player.activeEffects && player.activeEffects.length > 0) {
			const effectY = actionY + 54;
			const cleanEffects = player.activeEffects.map((e) => this.cleanText(e, [player])).join(" • ");
			CanvasUtils.fillRoundedRect(ctx, barX, effectY - 12, barW, 26, 8, "rgba(0, 247, 255, 0.1)", "rgba(0, 247, 255, 0.35)", 1);
			ctx.fillStyle = "#00f7ff";
			ctx.font = "bold 12px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`BUFF: ${cleanEffects}`, x + w / 2, effectY + 1);
		}
	}
	/**
	* Renders the Victory or Game Over card.
	*/
	static async renderOutcomeCard(winner, loser, type = "WIN", customTexts) {
		const W = 900;
		const H = 540;
		const canvas = new _napi_rs_canvas.Canvas(W, H);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
		if (type === "WIN") {
			bg.addColorStop(0, "#122618");
			bg.addColorStop(.65, "#0b140e");
			bg.addColorStop(1, "#060807");
		} else if (type === "SURRENDER") {
			bg.addColorStop(0, "#281b10");
			bg.addColorStop(.65, "#140e08");
			bg.addColorStop(1, "#080706");
		} else {
			bg.addColorStop(0, "#261318");
			bg.addColorStop(.65, "#140a0d");
			bg.addColorStop(1, "#080607");
		}
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
		ctx.lineWidth = 1;
		for (let x = 40; x < W; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, H);
			ctx.stroke();
		}
		const themeColor = type === "WIN" ? "#00f5a0" : type === "SURRENDER" ? "#ffb700" : "#ff2d55";
		CanvasUtils.fillRoundedRect(ctx, 24, 24, 852, 492, 24, "rgba(255,255,255,0.015)", themeColor, 1.5);
		ctx.save();
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		let titleText = customTexts?.title || (type === "SURRENDER" ? "SURRENDER" : type === "DENIED" ? "CHALLENGE DECLINED" : type === "TIMEOUT" ? "TIME'S UP" : "VICTORY");
		let subtitleText = customTexts?.subtitle || (type === "SURRENDER" ? "The opponent surrendered." : type === "DENIED" ? "The duel invitation was rejected." : type === "TIMEOUT" ? "The duel timed out due to inactivity." : "Wins the battle!");
		ctx.shadowColor = themeColor;
		ctx.shadowBlur = 22;
		ctx.fillStyle = themeColor;
		ctx.font = "bold 52px sans-serif";
		ctx.fillText(titleText, W / 2, 85);
		ctx.restore();
		if (type === "WIN" || type === "SURRENDER") {
			await CanvasUtils.drawCircularAvatar(ctx, winner.avatarUrl, W / 2, 250, 90, themeColor, 6);
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 34px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(winner.username, W / 2, 380);
			ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
			ctx.font = "20px sans-serif";
			ctx.fillText(subtitleText, W / 2, 422);
		} else {
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 24px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(subtitleText, W / 2, 280);
		}
		return canvas.toBuffer("image/png");
	}
};
// src/canvas/Render2048.ts
const CANVAS_SIZE$1 = 800;
const GRID_SIZE = 560;
const GRID_Y_START$1 = 180;
const CELL_SIZE = 120;
const TILE_COLORS = {
	0: {
		main: "#cdc1b4",
		shadow: "#bdad9e",
		text: "transparent"
	},
	2: {
		main: "#eee4da",
		shadow: "#ded0c1",
		text: "#776e65"
	},
	4: {
		main: "#ede0c8",
		shadow: "#decbb0",
		text: "#776e65"
	},
	8: {
		main: "#f2b179",
		shadow: "#e69c5c",
		text: "#f9f6f2"
	},
	16: {
		main: "#f59563",
		shadow: "#e67e45",
		text: "#f9f6f2"
	},
	32: {
		main: "#f67c5f",
		shadow: "#e36040",
		text: "#f9f6f2"
	},
	64: {
		main: "#f65e3b",
		shadow: "#d6421e",
		text: "#f9f6f2"
	},
	128: {
		main: "#edcf72",
		shadow: "#dcc059",
		text: "#f9f6f2"
	},
	256: {
		main: "#edcc61",
		shadow: "#dcb946",
		text: "#f9f6f2"
	},
	512: {
		main: "#edc850",
		shadow: "#dcb438",
		text: "#f9f6f2"
	},
	1024: {
		main: "#edc53f",
		shadow: "#dbb227",
		text: "#f9f6f2"
	},
	2048: {
		main: "#edc22e",
		shadow: "#dfb216",
		text: "#f9f6f2"
	}
};
function getTileColors(val) {
	if (TILE_COLORS[val]) return TILE_COLORS[val];
	return {
		main: "#3c3a32",
		shadow: "#292721",
		text: "#f9f6f2"
	};
}
var Render2048 = class {
	static async renderBoard(board, score, username, avatarUrl, state) {
		const canvas = new _napi_rs_canvas.Canvas(CANVAS_SIZE$1, CANVAS_SIZE$1);
		const ctx = canvas.getContext("2d");
		const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE$1);
		bgGrad.addColorStop(0, "#1e2024");
		bgGrad.addColorStop(1, "#2b2d33");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, CANVAS_SIZE$1, CANVAS_SIZE$1);
		await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, "#00f7ff", 4);
		CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 26px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		const truncatedName = username.length > 14 ? username.slice(0, 13) + "…" : username;
		ctx.fillText(truncatedName, 146, 75);
		const scoreBoxW = 200;
		const scoreBoxX = 560;
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#15171c");
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#1e2129");
		ctx.fillStyle = "#00f7ff";
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("SCORE", 660, 45);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 34px sans-serif";
		ctx.fillText(String(score), 660, 70);
		const gridX = 120;
		CanvasUtils.fillRoundedRect(ctx, gridX, 188, GRID_SIZE, GRID_SIZE, 18, "#9e9183");
		CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START$1, GRID_SIZE, GRID_SIZE, 18, "#bbada0");
		for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
			const val = board[row][col];
			const x = 136 + col * 136;
			const y = 196 + row * 136;
			const colors = getTileColors(val);
			CanvasUtils.fillRoundedRect(ctx, x, y + 5, CELL_SIZE, CELL_SIZE, 10, colors.shadow);
			CanvasUtils.fillRoundedRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 10, colors.main);
			if (val > 0) {
				ctx.fillStyle = colors.text;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.font = `bold ${val > 1e3 ? 46 : val > 100 ? 54 : 64}px sans-serif`;
				ctx.fillText(String(val), x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 2);
			}
		}
		if (state && state !== "active") {
			ctx.save();
			CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START$1, GRID_SIZE, 568, 18, "rgba(15, 17, 20, 0.82)");
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (state === "won") {
				ctx.shadowColor = "#ffcc00";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#ffcc00";
				ctx.font = "bold 72px sans-serif";
				ctx.fillText("VICTORY!", CANVAS_SIZE$1 / 2, 440);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "28px sans-serif";
				ctx.fillText("You reached 2048!", CANVAS_SIZE$1 / 2, 510);
			} else {
				const title = state === "quit" ? "GAME STOPPED" : state === "timeout" ? "TIME'S UP" : "GAME OVER";
				ctx.shadowColor = "#ff4444";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#ff4444";
				ctx.font = "bold 68px sans-serif";
				ctx.fillText(title, CANVAS_SIZE$1 / 2, 440);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "28px sans-serif";
				ctx.fillText(`Final Score: ${score}`, CANVAS_SIZE$1 / 2, 510);
			}
			ctx.restore();
		}
		return canvas.toBuffer("image/png");
	}
};
// src/canvas/RenderPokemon.ts
const TYPE_COLORS = {
	normal: "#a8a878",
	fire: "#f08030",
	water: "#6890f0",
	electric: "#f8d030",
	grass: "#78c850",
	ice: "#98d8d8",
	fighting: "#c03028",
	poison: "#a040a0",
	ground: "#e0c068",
	flying: "#a890f0",
	psychic: "#f85888",
	bug: "#a8b820",
	rock: "#b8a038",
	ghost: "#705898",
	dragon: "#7038f8",
	dark: "#705848",
	steel: "#b8b8d0",
	fairy: "#ee99ac"
};
var RenderPokemon = class {
	static async renderCard(pokemon, revealed = false) {
		const canvas = new _napi_rs_canvas.Canvas(800, 500);
		const ctx = canvas.getContext("2d");
		const primaryType = (pokemon.types[0] || "normal").toLowerCase();
		const typeColor = TYPE_COLORS[primaryType] || "#00f7ff";
		const bg = ctx.createRadialGradient(250, 250, 50, 400, 250, 500);
		bg.addColorStop(0, "#19243b");
		bg.addColorStop(1, "#0a0e17");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, 800, 500);
		ctx.save();
		ctx.strokeStyle = "rgba(0, 247, 255, 0.08)";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.arc(260, 250, 190, 0, Math.PI * 2);
		ctx.stroke();
		ctx.strokeStyle = "rgba(0, 247, 255, 0.04)";
		ctx.lineWidth = 14;
		ctx.beginPath();
		ctx.arc(260, 250, 160, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
		try {
			const img = await (0, _napi_rs_canvas.loadImage)(pokemon.imageUrl);
			const targetW = 320;
			const targetH = 320;
			const spriteX = 260 - targetW / 2;
			const spriteY = 250 - targetH / 2;
			if (!revealed) {
				const offCanvas = new _napi_rs_canvas.Canvas(targetW, targetH);
				const offCtx = offCanvas.getContext("2d");
				offCtx.drawImage(img, 0, 0, targetW, targetH);
				offCtx.globalCompositeOperation = "source-in";
				offCtx.fillStyle = "#111726";
				offCtx.fillRect(0, 0, targetW, targetH);
				ctx.save();
				ctx.shadowColor = "rgba(0, 247, 255, 0.4)";
				ctx.shadowBlur = 24;
				ctx.drawImage(offCanvas, spriteX, spriteY);
				ctx.restore();
			} else {
				ctx.save();
				ctx.shadowColor = typeColor;
				ctx.shadowBlur = 26;
				ctx.drawImage(img, spriteX, spriteY, targetW, targetH);
				ctx.restore();
			}
		} catch {
			ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
			ctx.beginPath();
			ctx.arc(260, 250, 90, 0, Math.PI * 2);
			ctx.fill();
		}
		const rightX = 520;
		ctx.fillStyle = "#00f7ff";
		ctx.font = "bold 22px sans-serif";
		ctx.textAlign = "left";
		ctx.fillText("WHO'S THAT POKÉMON?", rightX, 100);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 44px sans-serif";
		if (revealed) ctx.fillText(pokemon.name, rightX, 160);
		else ctx.fillText("???", rightX, 160);
		let badgeX = rightX;
		for (const type of pokemon.types) {
			const color = TYPE_COLORS[type.toLowerCase()] || "#777777";
			CanvasUtils.drawBadge(ctx, type.toUpperCase(), badgeX, 200, 100, 32, color, "#ffffff", "bold 13px sans-serif");
			badgeX += 112;
		}
		CanvasUtils.fillRoundedRect(ctx, rightX, 260, 250, 170, 16, "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.1)", 1);
		ctx.fillStyle = "#8b949e";
		ctx.font = "bold 13px sans-serif";
		ctx.fillText("ABILITIES", 536, 290);
		ctx.fillStyle = "#e0e6ed";
		ctx.font = "16px sans-serif";
		const abilityText = pokemon.abilities.slice(0, 3).join(", ") || "Unknown";
		ctx.fillText(abilityText, 536, 320);
		ctx.fillStyle = "#8b949e";
		ctx.font = "bold 13px sans-serif";
		ctx.fillText(revealed ? "STATUS" : "HINT", 536, 365);
		ctx.fillStyle = revealed ? "#00ff88" : "#ffaa00";
		ctx.font = "bold 16px sans-serif";
		ctx.fillText(revealed ? "Identified!" : "Type your guess in chat!", 536, 395);
		return canvas.toBuffer("image/png");
	}
};
// src/canvas/RenderHangman.ts
var RenderHangman = class {
	static async renderCard(wrongGuessesCount, displayWord, guessedLetters, username, avatarUrl, gameOver = false, won = false, fullWord) {
		const canvas = new _napi_rs_canvas.Canvas(800, 500);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(400, 250, 50, 400, 250, 500);
		bg.addColorStop(0, "#2c303a");
		bg.addColorStop(1, "#15171d");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, 800, 500);
		await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 60, 55, 35, "#00ff88", 3);
		CanvasUtils.fillRoundedRect(ctx, 110, 32, 220, 46, 14, "rgba(255,255,255,0.06)");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 20px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		const truncated = username.length > 13 ? username.slice(0, 12) + "…" : username;
		ctx.fillText(truncated, 124, 55);
		ctx.fillStyle = "rgba(0,0,0,0.3)";
		ctx.beginPath();
		ctx.ellipse(230, 420, 130, 24, 0, 0, Math.PI * 2);
		ctx.fill();
		this.drawWoodenBeam(ctx, 110, 420, 350, 420, 14);
		this.drawWoodenBeam(ctx, 150, 420, 150, 100, 14);
		this.drawWoodenBeam(ctx, 150, 100, 310, 100, 14);
		this.drawWoodenBeam(ctx, 150, 170, 210, 100, 12);
		ctx.strokeStyle = "#c29b62";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(310, 100);
		ctx.lineTo(310, 150);
		ctx.stroke();
		const ropeEndX = 310;
		if (wrongGuessesCount >= 1) {
			ctx.save();
			ctx.fillStyle = "#e0e6ed";
			ctx.beginPath();
			ctx.arc(ropeEndX, 175, 25, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = "#8b949e";
			ctx.lineWidth = 3;
			ctx.stroke();
			if (wrongGuessesCount >= 6) {
				ctx.strokeStyle = "#ff3355";
				ctx.lineWidth = 2.5;
				this.drawX(ctx, 300, 170, 6);
				this.drawX(ctx, 320, 170, 6);
			}
			ctx.restore();
		}
		if (wrongGuessesCount >= 2) this.drawLimb(ctx, ropeEndX, 200, ropeEndX, 300, 7, "#e0e6ed");
		if (wrongGuessesCount >= 3) this.drawLimb(ctx, ropeEndX, 220, 270, 265, 6, "#e0e6ed");
		if (wrongGuessesCount >= 4) this.drawLimb(ctx, ropeEndX, 220, 350, 265, 6, "#e0e6ed");
		if (wrongGuessesCount >= 5) this.drawLimb(ctx, ropeEndX, 300, 275, 370, 6, "#e0e6ed");
		if (wrongGuessesCount >= 6) this.drawLimb(ctx, ropeEndX, 300, 345, 370, 6, "#e0e6ed");
		const rightCenterX = 580;
		ctx.fillStyle = "#8b949e";
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("SECRET WORD", rightCenterX, 130);
		ctx.fillStyle = "#ffffff";
		ctx.font = `bold ${displayWord.length > 18 ? 32 : displayWord.length > 12 ? 38 : 46}px monospace`;
		ctx.fillText(displayWord, rightCenterX, 185);
		const remaining = Math.max(0, 6 - wrongGuessesCount);
		const livesColor = remaining > 3 ? "#00ff88" : remaining > 1 ? "#ffaa00" : "#ff3355";
		CanvasUtils.drawBadge(ctx, `${remaining} / 6 LIVES REMAINING`, 470, 240, 220, 32, "rgba(0,0,0,0.3)", livesColor, "bold 13px sans-serif");
		const wrongLetters = guessedLetters.filter((l) => !displayWord.includes(l));
		if (wrongLetters.length > 0) {
			ctx.fillStyle = "#ff5555";
			ctx.font = "bold 15px sans-serif";
			ctx.fillText("INCORRECT GUESSES", rightCenterX, 310);
			CanvasUtils.fillRoundedRect(ctx, 420, 335, 320, 54, 12, "rgba(0, 0, 0, 0.35)");
			ctx.fillStyle = "#ff8899";
			ctx.font = "bold 24px monospace";
			ctx.fillText(wrongLetters.join("  "), rightCenterX, 363);
		}
		if (gameOver) {
			ctx.save();
			ctx.fillStyle = "rgba(10, 12, 16, 0.8)";
			ctx.fillRect(0, 0, 800, 500);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (won) {
				ctx.shadowColor = "#00ff88";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#00ff88";
				ctx.font = "bold 64px sans-serif";
				ctx.fillText("VICTORY!", 400, 210);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "24px sans-serif";
				ctx.fillText(`Word: ${fullWord || displayWord.replace(/ /g, "")}`, 400, 280);
			} else {
				ctx.shadowColor = "#ff3355";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#ff3355";
				ctx.font = "bold 64px sans-serif";
				ctx.fillText("GAME OVER", 400, 210);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "24px sans-serif";
				ctx.fillText(`The word was: ${fullWord || displayWord.replace(/ /g, "")}`, 400, 280);
			}
			ctx.restore();
		}
		return canvas.toBuffer("image/png");
	}
	static drawWoodenBeam(ctx, x1, y1, x2, y2, width) {
		ctx.save();
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.strokeStyle = "#5d4037";
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	}
	static drawLimb(ctx, x1, y1, x2, y2, width, color) {
		ctx.save();
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	}
	static drawX(ctx, cx, cy, size) {
		ctx.beginPath();
		ctx.moveTo(cx - size, cy - size);
		ctx.lineTo(cx + size, cy + size);
		ctx.moveTo(cx + size, cy - size);
		ctx.lineTo(cx - size, cy + size);
		ctx.stroke();
	}
};
// src/canvas/RenderSnake.ts
const CANVAS_SIZE = 800;
const GRID_CONTAINER = 560;
const GRID_Y_START = 180;
const COLORS = {
	bgTop: "#15181e",
	bgBot: "#21252d",
	boardBg: "#0b0d10",
	snakeHead: "#00ff88",
	snakeBody: "#00b862",
	snakeBodyAlt: "#00a155",
	food: "#ff3355",
	gridLines: "#1b1e25"
};
var RenderSnake = class {
	static async renderBoard(snake, food, direction, score, gridSize, username, avatarUrl, isGameOver = false, overlayTitle) {
		const canvas = new _napi_rs_canvas.Canvas(CANVAS_SIZE, CANVAS_SIZE);
		const ctx = canvas.getContext("2d");
		const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
		bgGrad.addColorStop(0, COLORS.bgTop);
		bgGrad.addColorStop(1, COLORS.bgBot);
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
		await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, COLORS.snakeHead, 4);
		CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 26px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		const truncatedName = username.length > 14 ? username.slice(0, 13) + "…" : username;
		ctx.fillText(truncatedName, 146, 75);
		const scoreBoxW = 200;
		const scoreBoxX = 560;
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#101217");
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#191d24");
		ctx.fillStyle = COLORS.snakeHead;
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("SCORE", 660, 45);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 34px sans-serif";
		ctx.fillText(String(score), 660, 70);
		const cellSize = GRID_CONTAINER / gridSize;
		const gridX = 120;
		CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_CONTAINER, GRID_CONTAINER, 16, COLORS.boardBg);
		ctx.strokeStyle = COLORS.gridLines;
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let i = 1; i < gridSize; i++) {
			ctx.moveTo(gridX + i * cellSize, GRID_Y_START);
			ctx.lineTo(gridX + i * cellSize, 740);
			ctx.moveTo(gridX, GRID_Y_START + i * cellSize);
			ctx.lineTo(680, GRID_Y_START + i * cellSize);
		}
		ctx.stroke();
		const foodX = gridX + food.x * cellSize + cellSize / 2;
		const foodY = GRID_Y_START + food.y * cellSize + cellSize / 2;
		ctx.save();
		ctx.fillStyle = COLORS.food;
		ctx.shadowColor = COLORS.food;
		ctx.shadowBlur = 16;
		ctx.beginPath();
		ctx.arc(foodX, foodY, cellSize / 2.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		snake.forEach((part, index) => {
			const px = gridX + part.x * cellSize;
			const py = GRID_Y_START + part.y * cellSize;
			const pad = 1.5;
			if (index === 0) {
				ctx.save();
				ctx.shadowColor = COLORS.snakeHead;
				ctx.shadowBlur = 12;
				CanvasUtils.fillRoundedRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, 5, COLORS.snakeHead);
				ctx.restore();
				this.drawEyes(ctx, px, py, cellSize, direction);
			} else {
				const bodyColor = index % 2 === 0 ? COLORS.snakeBody : COLORS.snakeBodyAlt;
				CanvasUtils.fillRoundedRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, 4, bodyColor);
			}
		});
		if (isGameOver) {
			ctx.save();
			CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_CONTAINER, GRID_CONTAINER, 16, "rgba(10, 12, 16, 0.82)");
			ctx.shadowColor = "#ff3355";
			ctx.shadowBlur = 24;
			ctx.fillStyle = "#ff3355";
			ctx.font = "bold 68px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(overlayTitle || "GAME OVER", CANVAS_SIZE / 2, 440);
			ctx.shadowBlur = 0;
			ctx.fillStyle = "#ffffff";
			ctx.font = "26px sans-serif";
			ctx.fillText(`Final Length: ${snake.length} | Score: ${score}`, CANVAS_SIZE / 2, 505);
			ctx.restore();
		}
		return canvas.toBuffer("image/png");
	}
	static drawEyes(ctx, x, y, size, dir) {
		ctx.fillStyle = "#111111";
		const offset = size / 3.8;
		let eye1 = {
			x: 0,
			y: 0
		};
		let eye2 = {
			x: 0,
			y: 0
		};
		if (dir === "UP") {
			eye1 = {
				x: x + offset,
				y: y + offset
			};
			eye2 = {
				x: x + size - offset,
				y: y + offset
			};
		} else if (dir === "DOWN") {
			eye1 = {
				x: x + offset,
				y: y + size - offset
			};
			eye2 = {
				x: x + size - offset,
				y: y + size - offset
			};
		} else if (dir === "LEFT") {
			eye1 = {
				x: x + offset,
				y: y + offset
			};
			eye2 = {
				x: x + offset,
				y: y + size - offset
			};
		} else {
			eye1 = {
				x: x + size - offset,
				y: y + offset
			};
			eye2 = {
				x: x + size - offset,
				y: y + size - offset
			};
		}
		const eyeRadius = Math.max(2, size / 10);
		ctx.beginPath();
		ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
		ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
		ctx.fill();
	}
};
// src/canvas/RenderLeaderboard.ts
/**
* Canvas Leaderboard Renderer
* Generates an eSports-grade High-Score poster using @napi-rs/canvas.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var RenderLeaderboard = class {
	static async render(options) {
		const entries = options.entries.slice(0, 10);
		const width = 1e3;
		const rowHeight = 54;
		const headerHeight = 175;
		const height = Math.max(540, headerHeight + entries.length * 64 + 28 + 35);
		const canvas = (0, _napi_rs_canvas.createCanvas)(width, height);
		const ctx = canvas.getContext("2d");
		const bgGrad = ctx.createLinearGradient(0, 0, width, height);
		bgGrad.addColorStop(0, "#080b12");
		bgGrad.addColorStop(.4, "#0d1322");
		bgGrad.addColorStop(1, "#06080d");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, width, height);
		const aura = ctx.createRadialGradient(width / 2, 80, 20, width / 2, 80, 480);
		aura.addColorStop(0, "rgba(88, 101, 242, 0.16)");
		aura.addColorStop(.5, "rgba(0, 247, 255, 0.05)");
		aura.addColorStop(1, "rgba(0, 0, 0, 0)");
		ctx.fillStyle = aura;
		ctx.fillRect(0, 0, width, 320);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
		ctx.lineWidth = 1;
		for (let x = 0; x < width; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		for (let y = 0; y < height; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		CanvasUtils.fillRoundedRect(ctx, 12, 12, 976, height - 24, 20, "transparent", "rgba(88, 101, 242, 0.2)", 1.5);
		const headerTitle = CanvasUtils.cleanText(options.title || "ARCADE CHAMPIONSHIP");
		const headerSub = CanvasUtils.cleanText(options.subtitle || (options.gameName ? `TOP PLAYERS • ${options.gameName.toUpperCase()}` : "GLOBAL LEADERBOARD • REAL-TIME"));
		const topBarGrad = ctx.createLinearGradient(48, 0, 952, 0);
		topBarGrad.addColorStop(0, "#5865f2");
		topBarGrad.addColorStop(.5, "#00f7ff");
		topBarGrad.addColorStop(1, "#ffd700");
		ctx.fillStyle = topBarGrad;
		ctx.fillRect(48, 20, 904, 3);
		const categoryBadge = CanvasUtils.cleanText(options.texts?.categoryBadge || "HALL OF FAME");
		CanvasUtils.fillRoundedRect(ctx, 42, 34, 160, 28, 14, "rgba(88, 101, 242, 0.22)", "#5865f2", 1.2);
		CanvasUtils.drawStarIcon(ctx, 60, 48, 5, 6, 3, "#5865f2");
		ctx.fillStyle = "#5865f2";
		ctx.font = "bold 12px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(categoryBadge, 73, 48);
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 34px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
		ctx.shadowBlur = 12;
		ctx.fillText(headerTitle, 42, 94);
		ctx.restore();
		ctx.save();
		ctx.fillStyle = "#8a91a0";
		ctx.font = "bold 13px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(headerSub, 44, 125);
		ctx.restore();
		const countBadge = options.texts?.topContendersBadge ? CanvasUtils.cleanText(options.texts.topContendersBadge.replace(/\{\{count\}\}/g, String(entries.length))) : `${entries.length} TOP CONTENDERS`;
		CanvasUtils.fillRoundedRect(ctx, 792, 80, 165, 30, 15, "rgba(255, 255, 255, 0.04)", "rgba(255, 255, 255, 0.12)", 1);
		ctx.fillStyle = "#00f7ff";
		ctx.font = "bold 11px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(countBadge, 874, 95);
		const colY = 152;
		ctx.fillStyle = "#555b6a";
		ctx.font = "bold 11px sans-serif";
		ctx.textAlign = "left";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.rankColumn || "RANK"), 48, colY);
		ctx.fillText(CanvasUtils.cleanText(options.texts?.playerColumn || "PLAYER"), 143, colY);
		ctx.fillText(CanvasUtils.cleanText(options.texts?.recordColumn || "RECORD / STREAK"), 610, colY);
		ctx.textAlign = "right";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.scoreColumn || "SCORE / ELO"), 948, colY);
		const startY = headerHeight;
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			const y = startY + i * 64;
			const isTop1 = entry.rank === 1;
			const isTop2 = entry.rank === 2;
			const isTop3 = entry.rank === 3;
			let cardBg = "rgba(18, 24, 38, 0.65)";
			let cardBorder = "rgba(255, 255, 255, 0.07)";
			let rankColor = "#ffffff";
			let rankBg = "rgba(255, 255, 255, 0.08)";
			let scoreColor = "#00f7ff";
			if (isTop1) {
				cardBg = "rgba(255, 215, 0, 0.11)";
				cardBorder = "rgba(255, 215, 0, 0.75)";
				rankColor = "#0a0c12";
				rankBg = "#ffd700";
				scoreColor = "#ffd700";
			} else if (isTop2) {
				cardBg = "rgba(200, 215, 235, 0.09)";
				cardBorder = "rgba(200, 215, 235, 0.65)";
				rankColor = "#0a0c12";
				rankBg = "#c5d2e0";
				scoreColor = "#e6edf5";
			} else if (isTop3) {
				cardBg = "rgba(205, 127, 50, 0.09)";
				cardBorder = "rgba(205, 127, 50, 0.65)";
				rankColor = "#ffffff";
				rankBg = "#cd7f32";
				scoreColor = "#e8a05c";
			}
			CanvasUtils.fillRoundedRect(ctx, 38, y, 924, rowHeight, 12, cardBg, cardBorder, isTop1 ? 2 : 1.2);
			const badgeW = 38;
			const badgeH = 28;
			const badgeX = 50;
			const badgeY = y + 13;
			CanvasUtils.fillRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 7, rankBg);
			ctx.fillStyle = rankColor;
			ctx.font = "bold 13px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (isTop1) {
				CanvasUtils.drawCrownIcon(ctx, 69, badgeY + 7, 12, 7, "#7a5901");
				ctx.fillText("1", 69, badgeY + badgeH / 2 + 5);
			} else ctx.fillText(`#${entry.rank}`, 69, badgeY + badgeH / 2);
			const avatarRadius = 19;
			const avatarX = 118;
			const avatarY = y + rowHeight / 2;
			if (entry.avatarUrl) {
				const borderColor = isTop1 ? "#ffd700" : isTop2 ? "#c5d2e0" : isTop3 ? "#cd7f32" : "#5865f2";
				await CanvasUtils.drawCircularAvatar(ctx, entry.avatarUrl, avatarX, avatarY, avatarRadius, borderColor, 2.5);
			} else {
				ctx.save();
				ctx.beginPath();
				ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
				ctx.fillStyle = "#252b38";
				ctx.fill();
				ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
				ctx.stroke();
				ctx.restore();
			}
			ctx.fillStyle = isTop1 ? "#ffd700" : "#ffffff";
			ctx.font = isTop1 ? "bold 18px sans-serif" : "bold 16px sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			const maxNameLen = 17;
			const cleanName = CanvasUtils.cleanText(entry.username) || entry.username;
			const displayName = cleanName.length > maxNameLen ? cleanName.slice(0, 16) + "…" : cleanName;
			ctx.fillText(displayName, 151, y + rowHeight / 2);
			const statsX = 610;
			if (entry.streak && entry.streak > 1) {
				CanvasUtils.fillRoundedRect(ctx, statsX, y + 15, 105, 24, 12, "rgba(255, 107, 0, 0.18)", "#ff6b00", 1);
				CanvasUtils.drawFlameIcon(ctx, 626, y + rowHeight / 2, 6, "#ff8c38");
				ctx.fillStyle = "#ff8c38";
				ctx.font = "bold 11px sans-serif";
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				const streakText = options.texts?.streakSuffix || "STREAK";
				ctx.fillText(`${entry.streak} ${streakText}`, 637, y + rowHeight / 2);
				if (entry.stats) {
					ctx.fillStyle = "#7c8392";
					ctx.font = "12px sans-serif";
					ctx.textAlign = "left";
					ctx.fillText(CanvasUtils.cleanText(entry.stats), 725, y + rowHeight / 2);
				}
			} else {
				ctx.fillStyle = "#8e95a5";
				ctx.font = "14px sans-serif";
				ctx.textAlign = "left";
				ctx.fillText(CanvasUtils.cleanText(entry.stats) || "—", statsX, y + rowHeight / 2);
			}
			const scoreStr = typeof entry.scoreOrElo === "number" ? entry.scoreOrElo.toLocaleString() : String(entry.scoreOrElo);
			ctx.save();
			ctx.fillStyle = scoreColor;
			ctx.font = "bold 19px monospace";
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			if (isTop1) {
				ctx.shadowColor = "rgba(255, 215, 0, 0.4)";
				ctx.shadowBlur = 8;
			}
			ctx.fillText(scoreStr, 944, y + rowHeight / 2);
			ctx.restore();
		}
		const footerY = height - 16;
		ctx.fillStyle = "#484f60";
		ctx.font = "11px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const footer = CanvasUtils.cleanText(options.texts?.footer || "Powered by @m3rcena/weky • Modern Discord Minigames Engine");
		ctx.fillText(footer, width / 2, footerY);
		return canvas.toBuffer("image/png");
	}
};
// src/canvas/RenderShareCard.ts
/**
* "Share & Flex" Gamer Score Card Generator
* Generates an eSports-grade holographic match victory / performance pass using @napi-rs/canvas.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var RenderShareCard = class {
	static async render(options) {
		const width = 840;
		const height = 480;
		const canvas = (0, _napi_rs_canvas.createCanvas)(width, height);
		const ctx = canvas.getContext("2d");
		const accent = options.accentColor || "#00f7ff";
		const bgGrad = ctx.createLinearGradient(0, 0, width, height);
		bgGrad.addColorStop(0, "#070a12");
		bgGrad.addColorStop(.45, "#0d1526");
		bgGrad.addColorStop(1, "#05070d");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, width, height);
		const leftAura = ctx.createRadialGradient(160, 220, 20, 160, 220, 280);
		leftAura.addColorStop(0, "rgba(0, 247, 255, 0.12)");
		leftAura.addColorStop(.6, "rgba(88, 101, 242, 0.05)");
		leftAura.addColorStop(1, "rgba(0, 0, 0, 0)");
		ctx.fillStyle = leftAura;
		ctx.fillRect(0, 0, width, height);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
		ctx.lineWidth = 1;
		for (let x = 0; x < width; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		for (let y = 0; y < height; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		CanvasUtils.fillRoundedRect(ctx, 14, 14, 812, 452, 20, "transparent", accent, 1.8);
		const drawBracket = (cx, cy, dx, dy) => {
			ctx.strokeStyle = accent;
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(cx, cy + dy * 16);
			ctx.lineTo(cx, cy);
			ctx.lineTo(cx + dx * 16, cy);
			ctx.stroke();
		};
		drawBracket(24, 24, 1, 1);
		drawBracket(816, 24, -1, 1);
		drawBracket(24, 456, 1, -1);
		drawBracket(816, 456, -1, -1);
		CanvasUtils.fillRoundedRect(ctx, 44, 30, 170, 28, 14, "rgba(88, 101, 242, 0.22)", "#5865f2", 1.2);
		ctx.fillStyle = "#5865f2";
		ctx.font = "bold 12px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(options.gameName.toUpperCase(), 129, 44);
		const verifiedText = CanvasUtils.cleanText(options.texts?.verifiedStamp || "VERIFIED COMPETITIVE MATCH");
		ctx.font = "bold 12px sans-serif";
		const textWidth = ctx.measureText(verifiedText).width;
		const textRight = 794;
		const textLeft = textRight - textWidth;
		CanvasUtils.drawCheckmarkIcon(ctx, textLeft - 13, 44, 7, "#57f287", "#070a12");
		ctx.fillStyle = "#57f287";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillText(verifiedText, textRight, 44);
		const headline = CanvasUtils.cleanText(options.headline || "MATCH PERFORMANCE PASS");
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 26px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
		ctx.shadowBlur = 10;
		ctx.fillText(headline, 44, 86);
		ctx.restore();
		const profileW = 230;
		const profileH = 320;
		const profileX = 44;
		const profileY = 113;
		CanvasUtils.fillRoundedRect(ctx, profileX, profileY, profileW, profileH, 16, "rgba(16, 22, 36, 0.75)", "rgba(255, 255, 255, 0.08)", 1.2);
		const avatarX = 159;
		const avatarY = 188;
		const avatarRadius = 52;
		if (options.avatarUrl) await CanvasUtils.drawCircularAvatar(ctx, options.avatarUrl, avatarX, avatarY, avatarRadius, accent, 4);
		else {
			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#252b38";
			ctx.fill();
			ctx.strokeStyle = accent;
			ctx.lineWidth = 4;
			ctx.shadowColor = accent;
			ctx.shadowBlur = 12;
			ctx.stroke();
			ctx.restore();
		}
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 22px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const maxName = 14;
		const rawUser = CanvasUtils.cleanText(options.username) || options.username;
		const displayName = rawUser.length > maxName ? rawUser.slice(0, 13) + "…" : rawUser;
		ctx.fillText(displayName, avatarX, 266);
		const rawBadge = CanvasUtils.cleanText(options.rankBadge || "ARCADE PRO") || "ARCADE PRO";
		CanvasUtils.fillRoundedRect(ctx, 84, 286, 150, 26, 13, "rgba(255, 215, 0, 0.16)", "#ffd700", 1.2);
		CanvasUtils.drawStarIcon(ctx, 103, 299, 5, 5, 2.5, "#ffd700");
		ctx.fillStyle = "#ffd700";
		ctx.font = "bold 12px sans-serif";
		ctx.fillText(rawBadge, 167, 299);
		ctx.fillStyle = "#656e80";
		ctx.font = "bold 10px monospace";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.authenticatedSub || "WEKY AUTHENTICATED"), avatarX, 332);
		const rightX = 294;
		CanvasUtils.fillRoundedRect(ctx, rightX, profileY, 502, 95, 14, "rgba(18, 26, 44, 0.85)", "rgba(0, 247, 255, 0.35)", 1.5);
		ctx.fillStyle = "#7b8599";
		ctx.font = "bold 11px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.primaryHighlight || "PRIMARY HIGHLIGHT"), 316, 129);
		const cleanPrimaryScore = CanvasUtils.cleanText(options.primaryScore) || options.primaryScore;
		ctx.save();
		ctx.fillStyle = accent;
		ctx.font = "bold 38px monospace";
		ctx.shadowColor = accent;
		ctx.shadowBlur = 14;
		ctx.fillText(cleanPrimaryScore, 316, 151);
		ctx.restore();
		const defaultStats = [
			{
				label: "RANK TIER",
				value: rawBadge,
				color: "#ffd700"
			},
			{
				label: "STREAK",
				value: "ACTIVE STREAK",
				color: "#ff8c38"
			},
			{
				label: "ENGINE",
				value: "WEKY 14.28",
				color: "#00f7ff"
			},
			{
				label: "STATUS",
				value: "VERIFIED MATCH",
				color: "#57f287"
			}
		];
		const statsToRender = (options.stats && options.stats.length >= 2 ? options.stats : defaultStats).slice(0, 4);
		const cardW = 244;
		const cardH = 74;
		const gridY = 228;
		for (let i = 0; i < statsToRender.length; i++) {
			const stat = statsToRender[i];
			const col = i % 2;
			const row = Math.floor(i / 2);
			const cardX = rightX + col * 258;
			const cardY = gridY + row * 86;
			CanvasUtils.fillRoundedRect(ctx, cardX, cardY, cardW, cardH, 10, "rgba(16, 22, 36, 0.7)", "rgba(255, 255, 255, 0.08)", 1);
			ctx.fillStyle = "#656e80";
			ctx.font = "bold 11px sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";
			ctx.fillText(CanvasUtils.cleanText(stat.label).toUpperCase(), cardX + 16, cardY + 14);
			ctx.fillStyle = stat.color || "#ffffff";
			ctx.font = "bold 18px monospace";
			ctx.fillText(CanvasUtils.cleanText(stat.value), cardX + 16, cardY + 38);
		}
		const bottomY = 454;
		ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
		for (let bx = 44; bx < 248; bx += 4) {
			const bH = bx % 8 === 0 ? 14 : bx % 6 === 0 ? 10 : 6;
			ctx.fillRect(bx, bottomY - bH / 2, 2, bH);
		}
		ctx.fillStyle = "#4a5263";
		ctx.font = "11px monospace";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		const footerText = CanvasUtils.cleanText(options.texts?.footer || "WEKY-PASSPORT • AUTHENTICATED BY @M3RCENA/WEKY ENGINE");
		ctx.fillText(footerText, 794, bottomY);
		return canvas.toBuffer("image/png");
	}
};
// src/canvas/WekyCanvas.ts
/**
* Centralized graphics and card generation suite for `@m3rcena/weky`.
* Ideal for web dashboards, REST APIs, custom UIs, and external webhooks.
*/
var WekyCanvas = class {
	/**
	* Converts an image Buffer into a web-ready Data URL string (`data:image/png;base64,...`).
	* Can be directly used in HTML `<img src="..." />` or frontend frameworks (React, Vue, Svelte).
	*/
	static toDataURL(buffer, mime = "image/png") {
		return `data:${mime};base64,${buffer.toString("base64")}`;
	}
	/**
	* Converts an image Buffer into a base64 encoded string.
	*/
	static toBase64(buffer) {
		return buffer.toString("base64");
	}
	/**
	* Fight Duel canvas card renderers.
	*/
	static fight = {
		/**
		* Renders a Challenge / Request card between two players.
		*/
		request: (challenger, opponent) => {
			return RenderFight.renderRequestCard(challenger, opponent);
		},
		/**
		* Renders an active battle arena card showing both fighters, health bars, coins, and current turn indicator.
		*/
		battle: (player1, player2, currentTurnUserId, announcement) => {
			return RenderFight.renderBattleCard(player1, player2, currentTurnUserId, announcement);
		},
		/**
		* Renders the battle outcome card (Victory, Surrender, Denied, Timeout).
		*/
		outcome: (winner, loser, type) => {
			return RenderFight.renderOutcomeCard(winner, loser, type);
		}
	};
	/**
	* 2048 game board card renderer.
	*/
	static game2048(board, score, username, avatarUrl, state) {
		return Render2048.renderBoard(board, score, username, avatarUrl, state);
	}
	/**
	* Snake game board card renderer.
	*/
	static snake(snake, food, direction, score, gridSize, username, avatarUrl, isGameOver, overlayTitle) {
		return RenderSnake.renderBoard(snake, food, direction, score, gridSize, username, avatarUrl, isGameOver, overlayTitle);
	}
	/**
	* Hangman gallows and word card renderer.
	*/
	static hangman(wrongGuessesCount, displayWord, guessedLetters, username = "Player", avatarUrl = "", gameOver = false, won = false, fullWord) {
		return RenderHangman.renderCard(wrongGuessesCount, displayWord, guessedLetters, username, avatarUrl, gameOver, won, fullWord);
	}
	/**
	* Pokemon silhouette / revealed card renderer.
	*/
	static pokemon(pokemon, reveal = false) {
		return RenderPokemon.renderCard({
			name: pokemon.name,
			imageUrl: pokemon.imageUrl || pokemon.image || "",
			types: pokemon.types || ["Normal"],
			abilities: pokemon.abilities || [],
			id: pokemon.id
		}, reveal);
	}
};
// src/engines/Game2048Engine.ts
/**
* Headless 2048 game engine for web dashboards, custom bots, and REST/WebSocket APIs.
*/
var Game2048Engine = class {
	board = [];
	score = 0;
	hasWon = false;
	isGameOver = false;
	moveCount = 0;
	username;
	avatarUrl;
	constructor(options) {
		this.username = options?.username || "Player";
		this.avatarUrl = options?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
		this.reset();
	}
	/**
	* Resets the game to an initial state with 2 spawned tiles.
	*/
	reset() {
		this.board = Array(4).fill(0).map(() => Array(4).fill(0));
		this.score = 0;
		this.hasWon = false;
		this.isGameOver = false;
		this.moveCount = 0;
		this.spawnTile();
		this.spawnTile();
	}
	/**
	* Spawns a random tile (2 with 90% probability, 4 with 10% probability).
	*/
	spawnTile() {
		const empty = [];
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (this.board[r][c] === 0) empty.push({
			r,
			c
		});
		if (empty.length > 0) {
			const spot = empty[Math.floor(Math.random() * empty.length)];
			this.board[spot.r][spot.c] = Math.random() < .9 ? 2 : 4;
		}
	}
	/**
	* Performs a slide move in the specified direction.
	* @returns `true` if the board moved/changed, `false` otherwise.
	*/
	move(direction) {
		if (this.isGameOver) return false;
		let moved = false;
		let scoreGained = 0;
		let newBoard = this.board.map((row) => [...row]);
		const processRow = (row) => {
			let filtered = row.filter((v) => v !== 0);
			let merged = [];
			for (let i = 0; i < filtered.length; i++) if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
				const combined = filtered[i] * 2;
				merged.push(combined);
				scoreGained += combined;
				i++;
			} else merged.push(filtered[i]);
			while (merged.length < 4) merged.push(0);
			return merged;
		};
		if (direction === "LEFT") newBoard = newBoard.map((row) => {
			const nr = processRow(row);
			if (nr.join(",") !== row.join(",")) moved = true;
			return nr;
		});
		else if (direction === "RIGHT") newBoard = newBoard.map((row) => {
			const rev = [...row].reverse();
			const nr = processRow(rev);
			if (nr.join(",") !== rev.join(",")) moved = true;
			return nr.reverse();
		});
		else if (direction === "UP") {
			let trans = this.transpose(newBoard);
			trans = trans.map((row) => {
				const nr = processRow(row);
				if (nr.join(",") !== row.join(",")) moved = true;
				return nr;
			});
			newBoard = this.transpose(trans);
		} else if (direction === "DOWN") {
			let trans = this.transpose(newBoard);
			trans = trans.map((row) => {
				const rev = [...row].reverse();
				const nr = processRow(rev);
				if (nr.join(",") !== rev.join(",")) moved = true;
				return nr.reverse();
			});
			newBoard = this.transpose(trans);
		}
		if (moved) {
			this.board = newBoard;
			this.score += scoreGained;
			this.moveCount++;
			this.spawnTile();
			if (!this.hasWon && this.checkWon()) this.hasWon = true;
			if (this.checkGameOver()) this.isGameOver = true;
		}
		return moved;
	}
	transpose(matrix) {
		return matrix[0].map((_, col) => matrix.map((row) => row[col]));
	}
	checkWon() {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (this.board[r][c] >= 2048) return true;
		return false;
	}
	checkGameOver() {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
			if (this.board[r][c] === 0) return false;
			if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return false;
			if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return false;
		}
		return true;
	}
	/**
	* Returns a snapshot of the current game state.
	*/
	getState() {
		return {
			board: this.board.map((r) => [...r]),
			score: this.score,
			hasWon: this.hasWon,
			isGameOver: this.isGameOver,
			moveCount: this.moveCount
		};
	}
	/**
	* Returns control buttons suitable for web dashboards or UI rendering.
	*/
	getControls() {
		const disabled = this.isGameOver;
		return [{ components: [
			{
				id: "blank_1",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "up",
				label: "Up",
				emoji: "⬆️",
				style: "primary",
				disabled
			},
			{
				id: "blank_2",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "quit",
				label: "Quit",
				emoji: "🛑",
				style: "danger",
				disabled
			}
		] }, { components: [
			{
				id: "left",
				label: "Left",
				emoji: "⬅️",
				style: "primary",
				disabled
			},
			{
				id: "down",
				label: "Down",
				emoji: "⬇️",
				style: "primary",
				disabled
			},
			{
				id: "right",
				label: "Right",
				emoji: "➡️",
				style: "primary",
				disabled
			}
		] }];
	}
	/**
	* Renders the current board as a PNG buffer.
	*/
	async renderCard(customState) {
		const state = customState || (this.hasWon ? "won" : this.isGameOver ? "gameover" : "active");
		return Render2048.renderBoard(this.board, this.score, this.username, this.avatarUrl, state);
	}
	/**
	* Renders the current board directly as a Data URL string (`data:image/png;base64,...`).
	*/
	async renderDataURL(customState) {
		const buffer = await this.renderCard(customState);
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/SnakeEngine.ts
/**
* Headless Snake game engine for web dashboards and custom APIs.
*/
var SnakeEngine = class {
	snake = [];
	food = {
		x: 0,
		y: 0
	};
	direction = "RIGHT";
	score = 0;
	isGameOver = false;
	gridSize;
	username;
	avatarUrl;
	constructor(options) {
		this.gridSize = options?.gridSize || 15;
		this.username = options?.username || "Player";
		this.avatarUrl = options?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
		this.reset();
	}
	/**
	* Resets the snake game to starting state.
	*/
	reset() {
		const center = Math.floor(this.gridSize / 2);
		this.snake = [
			{
				x: center,
				y: center
			},
			{
				x: center - 1,
				y: center
			},
			{
				x: center - 2,
				y: center
			}
		];
		this.direction = "RIGHT";
		this.score = 0;
		this.isGameOver = false;
		this.spawnFood();
	}
	spawnFood() {
		let valid = false;
		while (!valid) {
			const fx = Math.floor(Math.random() * this.gridSize);
			const fy = Math.floor(Math.random() * this.gridSize);
			if (!this.snake.some((part) => part.x === fx && part.y === fy)) {
				this.food = {
					x: fx,
					y: fy
				};
				valid = true;
			}
		}
	}
	/**
	* Moves the snake one step in the specified direction.
	* Prevents instant reverse into own neck.
	*/
	move(newDir) {
		if (this.isGameOver) return false;
		if ({
			UP: "DOWN",
			DOWN: "UP",
			LEFT: "RIGHT",
			RIGHT: "LEFT"
		}[this.direction] === newDir) newDir = this.direction;
		this.direction = newDir;
		const head = { ...this.snake[0] };
		switch (newDir) {
			case "UP":
				head.y -= 1;
				break;
			case "DOWN":
				head.y += 1;
				break;
			case "LEFT":
				head.x -= 1;
				break;
			case "RIGHT": head.x += 1;
		}
		if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
			this.isGameOver = true;
			return false;
		}
		if (this.snake.some((part, i) => {
			if (i === this.snake.length - 1 && !(head.x === this.food.x && head.y === this.food.y)) return false;
			return part.x === head.x && part.y === head.y;
		})) {
			this.isGameOver = true;
			return false;
		}
		this.snake.unshift(head);
		if (head.x === this.food.x && head.y === this.food.y) {
			this.score += 1;
			this.spawnFood();
		} else this.snake.pop();
		return true;
	}
	/**
	* Sets next direction without immediately advancing.
	*/
	changeDirection(newDir) {
		if ({
			UP: "DOWN",
			DOWN: "UP",
			LEFT: "RIGHT",
			RIGHT: "LEFT"
		}[this.direction] !== newDir) this.direction = newDir;
	}
	/**
	* Advances snake by one frame/step. Ideal for timer loops.
	*/
	step(dir) {
		return {
			isAlive: this.move(dir || this.direction),
			isGameOver: this.isGameOver,
			score: this.score
		};
	}
	/**
	* Returns current snapshot of the snake state.
	*/
	getState() {
		return {
			snake: this.snake.map((p) => ({ ...p })),
			food: { ...this.food },
			score: this.score,
			length: this.snake.length,
			direction: this.direction,
			isGameOver: this.isGameOver
		};
	}
	/**
	* Returns control buttons schema.
	*/
	getControls() {
		const disabled = this.isGameOver;
		return [{ components: [
			{
				id: "blank_1",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "up",
				label: "Up",
				emoji: "⬆️",
				style: "primary",
				disabled
			},
			{
				id: "blank_2",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "quit",
				label: "Quit",
				emoji: "🛑",
				style: "danger",
				disabled
			}
		] }, { components: [
			{
				id: "left",
				label: "Left",
				emoji: "⬅️",
				style: "primary",
				disabled
			},
			{
				id: "down",
				label: "Down",
				emoji: "⬇️",
				style: "primary",
				disabled
			},
			{
				id: "right",
				label: "Right",
				emoji: "➡️",
				style: "primary",
				disabled
			}
		] }];
	}
	/**
	* Renders the current snake board as a PNG buffer.
	*/
	async renderCard(overlayTitle) {
		return RenderSnake.renderBoard(this.snake, this.food, this.direction, this.score, this.gridSize, this.username, this.avatarUrl, this.isGameOver, overlayTitle);
	}
	/**
	* Renders the snake board as a Data URL string.
	*/
	async renderDataURL(overlayTitle) {
		const buffer = await this.renderCard(overlayTitle);
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/FightEngine.ts
/**
* Headless Fight Duel RPG engine for web dashboards and custom APIs.
*/
var FightEngine = class {
	p1;
	p2;
	currentTurnId;
	phase = "REQUEST";
	lastAnnouncement = "Duel requested!";
	winner;
	loser;
	endReason;
	constructor(options) {
		const defaultHp = options.startHealth ?? 100;
		this.p1 = {
			id: options.player1.id,
			username: options.player1.username,
			avatarUrl: options.player1.avatarUrl || "",
			health: options.player1.health ?? defaultHp,
			coins: options.player1.coins ?? 0,
			lastAction: "Challenged opponent",
			activeEffects: []
		};
		this.p2 = {
			id: options.player2.id,
			username: options.player2.username,
			avatarUrl: options.player2.avatarUrl || "",
			health: options.player2.health ?? defaultHp,
			coins: options.player2.coins ?? 0,
			lastAction: "Awaiting start",
			activeEffects: []
		};
		this.currentTurnId = this.p1.id;
		if (options.initialPhase === "REQUEST") {
			this.phase = "REQUEST";
			this.lastAnnouncement = "Duel requested!";
		} else {
			this.phase = "FIGHT";
			this.lastAnnouncement = `The duel begins! It's ${this.p1.username}'s turn!`;
		}
	}
	/**
	* Accepts the challenge and transitions to FIGHT phase.
	*/
	acceptChallenge() {
		this.phase = "FIGHT";
		this.currentTurnId = Math.random() < .5 ? this.p1.id : this.p2.id;
		const starter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
		this.lastAnnouncement = `The duel begins! It's ${starter.username}'s turn!`;
	}
	/**
	* Universal action method accepting either (action, playerId) or (playerId, action) and case-insensitive strings.
	*/
	action(playerId, actionType) {
		let act = actionType.toLowerCase();
		if (act === "attack") act = "hit";
		const res = this.performAction(act, playerId);
		return {
			success: res.success,
			message: res.message,
			announcement: this.lastAnnouncement,
			isGameOver: res.isGameOver,
			winnerId: res.winnerId
		};
	}
	/**
	* Performs a combat action for a fighter.
	*/
	performAction(action, playerId) {
		if (this.phase === "REQUEST") return {
			success: false,
			message: "Duel has not started yet. Call acceptChallenge() first."
		};
		if (this.phase === "ENDED") return {
			success: false,
			message: "Duel has already ended."
		};
		if (playerId !== this.p1.id && playerId !== this.p2.id) return {
			success: false,
			message: "User is not a combatant in this duel."
		};
		if (action === "surrender") {
			this.winner = playerId === this.p1.id ? this.p2 : this.p1;
			this.loser = playerId === this.p1.id ? this.p1 : this.p2;
			this.phase = "ENDED";
			this.endReason = "SURRENDER";
			this.lastAnnouncement = `${this.loser.username} surrendered! ${this.winner.username} wins!`;
			return {
				success: true,
				message: this.lastAnnouncement,
				isGameOver: this.phase === "ENDED",
				winnerId: this.winner?.id
			};
		}
		if (playerId !== this.currentTurnId) return {
			success: false,
			message: "It is not this player's turn."
		};
		const attacker = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
		const defender = this.currentTurnId === this.p1.id ? this.p2 : this.p1;
		if (action === "hit" || action === "heavy") {
			const isHeavy = action === "heavy";
			let damage = isHeavy ? Math.floor(Math.random() * 18) + 18 : Math.floor(Math.random() * 13) + 10;
			if (isHeavy && Math.random() < .25) {
				attacker.lastAction = "Missed Heavy Attack!";
				this.lastAnnouncement = `${attacker.username} swung hard but missed!`;
				attacker.coins += 5;
			} else {
				if (attacker.activeEffects?.includes("2x Damage")) {
					damage *= 2;
					attacker.activeEffects = attacker.activeEffects.filter((e) => e !== "2x Damage");
				}
				if (defender.activeEffects?.includes("Shield")) {
					damage = Math.floor(damage / 2);
					defender.activeEffects = defender.activeEffects.filter((e) => e !== "Shield");
				}
				defender.health = Math.max(0, defender.health - damage);
				attacker.coins += isHeavy ? 15 : 10;
				attacker.lastAction = `${isHeavy ? "Heavy Hit" : "Hit"} for ${damage} DMG`;
				this.lastAnnouncement = `${attacker.username} used ${isHeavy ? "Heavy Attack" : "Normal Attack"} dealing ${damage} damage!`;
			}
		} else if (action === "heal") {
			if (attacker.health >= 85) {
				this.lastAnnouncement = `${attacker.username} tried to heal, but HP is already high!`;
				attacker.lastAction = "Heal failed (High HP)";
			} else {
				const heal = Math.floor(Math.random() * 11) + 15;
				attacker.health = Math.min(100, attacker.health + heal);
				attacker.coins += 5;
				attacker.lastAction = `Healed +${heal} HP`;
				this.lastAnnouncement = `${attacker.username} healed for +${heal} HP!`;
			}
		} else if (action === "shield") {
			if (attacker.coins < 25) return {
				success: false,
				message: "Not enough coins for Shield (requires 25)."
			};
			attacker.coins -= 25;
			if (!attacker.activeEffects) attacker.activeEffects = [];
			if (!attacker.activeEffects.includes("Shield")) attacker.activeEffects.push("Shield");
			attacker.lastAction = "Activated Shield";
			this.lastAnnouncement = `${attacker.username} activated a Shield! (-50% damage taken)`;
		} else if (action === "double") {
			if (attacker.coins < 30) return {
				success: false,
				message: "Not enough coins for 2x Damage (requires 30)."
			};
			attacker.coins -= 30;
			if (!attacker.activeEffects) attacker.activeEffects = [];
			if (!attacker.activeEffects.includes("2x Damage")) attacker.activeEffects.push("2x Damage");
			attacker.lastAction = "Activated 2x DMG";
			this.lastAnnouncement = `${attacker.username} activated 2x Damage for next attack!`;
		}
		if (defender.health <= 0) {
			this.winner = attacker;
			this.loser = defender;
			this.phase = "ENDED";
			this.endReason = "WIN";
			this.lastAnnouncement = `${attacker.username} knocked out ${defender.username} and won!`;
		} else this.currentTurnId = defender.id;
		return {
			success: true,
			message: this.lastAnnouncement,
			isGameOver: this.phase === "ENDED",
			winnerId: this.winner?.id
		};
	}
	/**
	* Returns current combat state.
	*/
	getState() {
		return {
			p1: {
				...this.p1,
				activeEffects: [...this.p1.activeEffects || []]
			},
			p2: {
				...this.p2,
				activeEffects: [...this.p2.activeEffects || []]
			},
			currentTurnId: this.currentTurnId,
			phase: this.phase,
			lastAnnouncement: this.lastAnnouncement,
			winner: this.winner ? { ...this.winner } : void 0,
			loser: this.loser ? { ...this.loser } : void 0,
			endReason: this.endReason
		};
	}
	/**
	* Returns control buttons suitable for web dashboard or custom bot.
	*/
	getControls(playerId) {
		const isPlayerTurn = !playerId || playerId === this.currentTurnId;
		const isFightPhase = this.phase === "FIGHT";
		const disabled = !isFightPhase || !isPlayerTurn;
		const activePlayer = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
		const canShield = !disabled && activePlayer.coins >= 25;
		const canDouble = !disabled && activePlayer.coins >= 30;
		return [{ components: [
			{
				id: "hit",
				label: "Attack",
				emoji: "⚔️",
				style: "primary",
				disabled
			},
			{
				id: "heavy",
				label: "Heavy Attack",
				emoji: "💥",
				style: "primary",
				disabled
			},
			{
				id: "heal",
				label: "Heal (+15-25 HP)",
				emoji: "💚",
				style: "success",
				disabled
			}
		] }, { components: [
			{
				id: "shield",
				label: "Shield (25¢)",
				emoji: "🛡️",
				style: "secondary",
				disabled: !canShield
			},
			{
				id: "double",
				label: "2x Damage (30¢)",
				emoji: "⚡",
				style: "secondary",
				disabled: !canDouble
			},
			{
				id: "surrender",
				label: "Surrender",
				emoji: "🏳️",
				style: "danger",
				disabled: !isFightPhase
			}
		] }];
	}
	/**
	* Renders the current fight arena card as a PNG buffer.
	*/
	async renderCard() {
		if (this.phase === "REQUEST") return RenderFight.renderRequestCard(this.p1, this.p2);
		if (this.phase === "ENDED" && this.winner) return RenderFight.renderOutcomeCard(this.winner, this.loser, this.endReason);
		return RenderFight.renderBattleCard(this.p1, this.p2, this.currentTurnId, this.lastAnnouncement);
	}
	/**
	* Renders the current fight card as a Data URL string.
	*/
	async renderDataURL() {
		const buffer = await this.renderCard();
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/TicTacToeEngine.ts
/**
* Headless Tic Tac Toe engine for dashboards and web interfaces.
*/
var TicTacToeEngine = class {
	board = Array(9).fill(null);
	playerX;
	playerO;
	currentTurnId;
	winner = null;
	isDraw = false;
	isGameOver = false;
	constructor(options) {
		this.playerX = options?.playerX || {
			id: "X",
			username: "Player X"
		};
		this.playerO = options?.playerO || {
			id: "O",
			username: "Player O"
		};
		this.currentTurnId = this.playerX.id;
	}
	reset() {
		this.board = Array(9).fill(null);
		this.currentTurnId = this.playerX.id;
		this.winner = null;
		this.isDraw = false;
		this.isGameOver = false;
	}
	/**
	* Places a mark on the board. Supports (row, col) or flat index (0-8).
	* Automatically uses currentTurnId if playerId is omitted.
	*/
	move(rowOrIndex, colOrPlayerId, playerId) {
		let index;
		let actualPlayerId;
		if (typeof colOrPlayerId === "number") {
			index = rowOrIndex * 3 + colOrPlayerId;
			actualPlayerId = playerId || this.currentTurnId;
		} else {
			index = rowOrIndex;
			actualPlayerId = colOrPlayerId || this.currentTurnId;
		}
		return {
			success: this.place(index, actualPlayerId).success,
			winner: this.winner,
			isWon: !!this.winner,
			isDraw: this.isDraw,
			isGameOver: this.isGameOver
		};
	}
	place(index, playerId) {
		if (this.isGameOver || index < 0 || index > 8 || this.board[index] !== null) return { success: false };
		if (playerId !== this.currentTurnId) return { success: false };
		const symbol = playerId === this.playerX.id ? "X" : "O";
		this.board[index] = symbol;
		if (this.checkWin(symbol)) {
			this.winner = playerId;
			this.isGameOver = true;
			return {
				success: true,
				winner: playerId
			};
		}
		if (this.board.every((cell) => cell !== null)) {
			this.isDraw = true;
			this.isGameOver = true;
			return {
				success: true,
				isDraw: true
			};
		}
		this.currentTurnId = playerId === this.playerX.id ? this.playerO.id : this.playerX.id;
		return { success: true };
	}
	checkWin(symbol) {
		return [
			[
				0,
				1,
				2
			],
			[
				3,
				4,
				5
			],
			[
				6,
				7,
				8
			],
			[
				0,
				3,
				6
			],
			[
				1,
				4,
				7
			],
			[
				2,
				5,
				8
			],
			[
				0,
				4,
				8
			],
			[
				2,
				4,
				6
			]
		].some(([a, b, c]) => this.board[a] === symbol && this.board[b] === symbol && this.board[c] === symbol);
	}
	getState() {
		return {
			board: [...this.board],
			currentTurnId: this.currentTurnId,
			winner: this.winner,
			isDraw: this.isDraw,
			isGameOver: this.isGameOver
		};
	}
	getControls() {
		const rows = [];
		for (let r = 0; r < 3; r++) {
			const components = [];
			for (let c = 0; c < 3; c++) {
				const idx = r * 3 + c;
				const val = this.board[idx];
				components.push({
					id: String(idx),
					label: val || " ",
					emoji: val === "X" ? "❌" : val === "O" ? "⭕" : void 0,
					style: val === "X" ? "danger" : val === "O" ? "primary" : "secondary",
					disabled: this.isGameOver || val !== null
				});
			}
			rows.push({ components });
		}
		return rows;
	}
};
// src/engines/HangmanEngine.ts
/**
* Headless Hangman word puzzle engine for dashboards and web interfaces.
*/
var HangmanEngine = class {
	word = "";
	guessedLetters = [];
	mistakes = 0;
	maxMistakes;
	isWon = false;
	isGameOver = false;
	constructor(options) {
		this.maxMistakes = options?.maxMistakes || 6;
		this.word = (options?.word || getRandomWord()).toUpperCase().trim();
	}
	/**
	* Resets the game with an optional new word.
	*/
	reset(newWord) {
		this.word = (newWord || getRandomWord()).toUpperCase().trim();
		this.guessedLetters = [];
		this.mistakes = 0;
		this.isWon = false;
		this.isGameOver = false;
	}
	/**
	* Makes a letter guess.
	*/
	guess(letter) {
		if (this.isGameOver) return {
			correct: false,
			isWon: this.isWon,
			isGameOver: true
		};
		const char = letter.toUpperCase().trim();
		if (!char || char.length !== 1 || this.guessedLetters.includes(char)) return {
			correct: false,
			isWon: this.isWon,
			isGameOver: this.isGameOver
		};
		this.guessedLetters.push(char);
		const isMatch = this.word.includes(char);
		if (!isMatch) {
			this.mistakes++;
			if (this.mistakes >= this.maxMistakes) this.isGameOver = true;
		} else if (this.word.split("").every((c) => c === " " || this.guessedLetters.includes(c))) {
			this.isWon = true;
			this.isGameOver = true;
		}
		return {
			correct: isMatch,
			isWon: this.isWon,
			isGameOver: this.isGameOver
		};
	}
	/**
	* Returns current game state.
	*/
	getState() {
		const masked = this.word.split("").map((c) => c === " " ? " " : this.guessedLetters.includes(c) ? c : "_").join(" ");
		return {
			word: this.word,
			maskedWord: masked,
			guessedLetters: [...this.guessedLetters],
			mistakes: this.mistakes,
			maxMistakes: this.maxMistakes,
			isWon: this.isWon,
			isGameOver: this.isGameOver
		};
	}
	/**
	* Returns keyboard layout controls schema for web dashboards.
	*/
	getControls() {
		const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
		const rows = [];
		const rowSizes = [
			7,
			7,
			6,
			6
		];
		let offset = 0;
		for (const size of rowSizes) {
			const chunk = letters.slice(offset, offset + size);
			offset += size;
			const components = chunk.map((letter) => {
				const isGuessed = this.guessedLetters.includes(letter);
				return {
					id: letter,
					label: letter,
					style: isGuessed && this.word.includes(letter) ? "success" : isGuessed ? "danger" : "secondary",
					disabled: this.isGameOver || isGuessed
				};
			});
			rows.push({ components });
		}
		return rows;
	}
	/**
	* Renders the Hangman canvas board as a PNG buffer.
	*/
	async renderCard(username = "Player", avatarUrl = "") {
		const masked = this.getState().maskedWord;
		return RenderHangman.renderCard(this.mistakes, masked, this.guessedLetters, username, avatarUrl, this.isGameOver, this.isWon, this.word);
	}
	/**
	* Renders the Hangman board as a Data URL string.
	*/
	async renderDataURL(username = "Player", avatarUrl = "") {
		const buffer = await this.renderCard(username, avatarUrl);
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/CalculatorEngine.ts
const STANDARD_KEYS = [
	"DC",
	"(",
	")",
	"⌫",
	"AC",
	"7",
	"8",
	"9",
	"÷",
	"^",
	"4",
	"5",
	"6",
	"x",
	"SQRT",
	"1",
	"2",
	"3",
	" - ",
	" + ",
	"2nd",
	"0",
	".",
	"ans",
	"="
];
const SCIENTIFIC_KEYS = [
	"DC",
	"SIN",
	"COS",
	"TAN",
	"AC",
	"LG",
	"LN",
	"x!",
	"1/x",
	"⌫",
	"RND",
	"π",
	"e",
	"÷",
	"x",
	"(",
	")",
	"%",
	" - ",
	" + ",
	"2nd",
	"0",
	".",
	"ans",
	"="
];
const INVALID_START_KEYS = [
	"⌫",
	"AC",
	"=",
	"x",
	"÷",
	"%",
	"^",
	"x!"
];
/**
* Headless Calculator engine for web dashboards and custom clients.
*/
var CalculatorEngine = class {
	expression = " ";
	lastAnswer = "";
	hasCalculated = false;
	is2nd = false;
	constructor() {}
	/**
	* Toggles between standard arithmetic keypad and 2nd / scientific keypad.
	*/
	toggle2nd() {
		this.is2nd = !this.is2nd;
		return this.is2nd;
	}
	/**
	* Clears the current expression (AC).
	*/
	clear() {
		this.expression = " ";
	}
	/**
	* Erases the last character or token (Backspace).
	*/
	backspace() {
		if (!this.expression || this.expression === " ") return;
		this.expression = this.expression.endsWith(" ") ? this.expression.slice(0, -3) : this.expression.slice(0, -1);
		if (this.expression === "") this.expression = " ";
	}
	/**
	* Alias for input(key).
	*/
	press(key) {
		return this.input(key);
	}
	/**
	* Handles button click or input.
	*/
	input(key) {
		if (key === "2nd") {
			this.toggle2nd();
			return;
		}
		if (key === "AC") {
			this.clear();
			return;
		}
		if (key === "⌫") {
			this.backspace();
			return;
		}
		if (key === "=") return this.calculate();
		let token = key;
		if (token === "×" || token === "*") token = "x";
		if (token === "+") token = " + ";
		if (token === "-") token = " - ";
		this.expression += token;
	}
	/**
	* Calculates the current expression safely using MathEvaluator.
	*/
	calculate() {
		if (!this.expression.trim()) return { error: "Empty expression" };
		const clean = this.expression.replace(/x/g, "*").replace(/÷/g, "/").replace(/π/g, "pi").replace(/ans/g, this.lastAnswer || "0").trim();
		const evalResult = MathEvaluator.evaluate(clean, Number(this.lastAnswer) || 0);
		if (evalResult.error) {
			this.expression = "Error";
			return { error: evalResult.error };
		}
		const res = evalResult.formatted;
		this.expression = String(res);
		this.lastAnswer = String(res);
		this.hasCalculated = true;
		return { result: res };
	}
	/**
	* Returns a snapshot of the calculator's current state.
	*/
	getState() {
		const modeTag = this.is2nd ? " [2nd / SCI]" : "";
		return {
			expression: this.expression,
			display: `${this.expression}${modeTag}`,
			lastAnswer: this.lastAnswer,
			is2nd: this.is2nd,
			hasCalculated: this.hasCalculated
		};
	}
	/**
	* Returns the 5x5 keypad controls schema for dashboard rendering.
	*/
	getControls() {
		const keys = this.is2nd ? SCIENTIFIC_KEYS : STANDARD_KEYS;
		const isEmpty = this.expression.trim() === "";
		const rows = [];
		for (let i = 0; i < keys.length; i += 5) {
			const components = keys.slice(i, i + 5).map((k) => {
				let disabled = false;
				if (k === "ans" && !this.hasCalculated) disabled = true;
				else if (isEmpty && INVALID_START_KEYS.includes(k)) disabled = true;
				let style = "secondary";
				if (k === "=") style = "success";
				else if (k === "2nd") style = this.is2nd ? "success" : "primary";
				else if (k === "AC" || k === "DC") style = "danger";
				else if ([
					"x",
					"÷",
					" - ",
					" + ",
					"^",
					"%"
				].includes(k)) style = "primary";
				return {
					id: k,
					label: k,
					emoji: k === "DC" ? "🛑" : void 0,
					style,
					disabled
				};
			});
			rows.push({ components });
		}
		return rows;
	}
};
// src/bridge/WekyBridgeRouter.ts
/**
* @m3rcena/weky
* Weky Bridge Package Router & Decoupled State API.
* Provides unified HTTP endpoints and WebSocket routing for headless minigames,
* raw state inspection, live cross-platform moves, and visual Canvas card rendering.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
const WEKY_GAME_CATALOG = [
	{
		id: "2048",
		name: "2048",
		description: "Slide and merge numbered tiles on a 4x4 grid to reach the 2048 tile.",
		minPlayers: 1,
		maxPlayers: 1,
		category: "puzzle",
		controls: [
			"UP",
			"DOWN",
			"LEFT",
			"RIGHT"
		],
		canvasSupported: true
	},
	{
		id: "snake",
		name: "Snake",
		description: "Navigate the classic snake, eat apples, grow longer and avoid collisions.",
		minPlayers: 1,
		maxPlayers: 1,
		category: "arcade",
		controls: [
			"UP",
			"DOWN",
			"LEFT",
			"RIGHT"
		],
		canvasSupported: true
	},
	{
		id: "fight",
		name: "Fight (PvP & Boss Battle)",
		description: "Turn-based arena fighting game with health bars, critical strikes, and heals.",
		minPlayers: 1,
		maxPlayers: 2,
		category: "action",
		controls: [
			"hit",
			"heavy",
			"heal",
			"shield",
			"surrender"
		],
		canvasSupported: true
	},
	{
		id: "tictactoe",
		name: "Tic Tac Toe",
		description: "Classic 3x3 grid alignment duel against another player or AI.",
		minPlayers: 1,
		maxPlayers: 2,
		category: "strategy",
		controls: [
			"cell_0",
			"cell_1",
			"cell_2",
			"cell_3",
			"cell_4",
			"cell_5",
			"cell_6",
			"cell_7",
			"cell_8"
		],
		canvasSupported: false
	},
	{
		id: "hangman",
		name: "Hangman",
		description: "Guess the hidden mystery word letter by letter before running out of lives.",
		minPlayers: 1,
		maxPlayers: 1,
		category: "word",
		controls: ["letter_guess"],
		canvasSupported: true
	},
	{
		id: "calculator",
		name: "Scientific Calculator",
		description: "Interactive arithmetic calculator with expression evaluation.",
		minPlayers: 1,
		maxPlayers: 1,
		category: "utility",
		controls: ["num_0"],
		canvasSupported: false
	}
];
var WekyBridgeRouter = class {
	name = "weky";
	basePath = "/api/weky";
	description = "Universal headless minigame engine, state synchronization, and canvas card generator.";
	version = version;
	bridge;
	constructor(bridge) {
		this.bridge = bridge;
	}
	async handleRequest(req) {
		const path = req.subPath.replace(/\/+$/, "") || "/";
		const method = req.method.toUpperCase();
		if (path === "/games" && method === "GET") return {
			status: 200,
			body: {
				games: WEKY_GAME_CATALOG,
				activeCount: this.bridge.getActiveSessions().length
			}
		};
		if (path === "/games/start" && method === "POST") {
			const body = req.body || {};
			const game = (body.game || "").toLowerCase();
			const playerId = body.playerId || "guest";
			const username = body.username || "Guest Player";
			const avatarUrl = body.avatarUrl;
			const sessionId = `weky_${game}_${Math.random().toString(36).substring(2, 8)}`;
			let engine = null;
			let initialState = null;
			let players = [{
				id: playerId,
				username,
				avatarUrl,
				platform: body.platform || "dashboard"
			}];
			if (game === "2048") {
				engine = new Game2048Engine({
					username,
					avatarUrl
				});
				initialState = engine.getState();
			} else if (game === "snake") {
				engine = new SnakeEngine({
					username,
					avatarUrl
				});
				initialState = engine.getState();
			} else if (game === "fight") {
				const opponentId = body.opponentId || "bot";
				const opponentName = body.opponentName || "Cyber Gladiator";
				engine = new FightEngine({
					player1: {
						id: playerId,
						username,
						avatarUrl
					},
					player2: {
						id: opponentId,
						username: opponentName,
						avatarUrl: body.opponentAvatarUrl
					}
				});
				initialState = engine.getState();
				players.push({
					id: opponentId,
					username: opponentName,
					avatarUrl: body.opponentAvatarUrl,
					platform: "dashboard"
				});
			} else if (game === "tictactoe") {
				const opponentId = body.opponentId || "ai";
				const opponentName = body.opponentName || "Antigravity AI";
				engine = new TicTacToeEngine({
					playerX: {
						id: playerId,
						username
					},
					playerO: {
						id: opponentId,
						username: opponentName
					}
				});
				initialState = engine.getState();
				players.push({
					id: opponentId,
					username: opponentName,
					avatarUrl: void 0,
					platform: "dashboard"
				});
			} else if (game === "hangman") {
				engine = new HangmanEngine();
				initialState = engine.getState();
			} else if (game === "calculator") {
				engine = new CalculatorEngine();
				initialState = engine.getState();
			} else return {
				status: 400,
				body: { error: `Unsupported game "${game}". Available: 2048, snake, fight, tictactoe, hangman, calculator` }
			};
			const session = {
				id: sessionId,
				game,
				platform: "dashboard",
				players,
				currentTurnId: playerId,
				state: initialState,
				engine,
				createdAt: Date.now(),
				lastUpdated: Date.now(),
				isGameOver: false,
				onMove: async (move) => {
					let res;
					if (game === "2048") res = {
						success: engine.move(move.action.toUpperCase()),
						state: engine.getState(),
						isGameOver: engine.getState().isGameOver
					};
					else if (game === "snake") res = {
						success: engine.changeDirection(move.action.toUpperCase()),
						state: engine.getState(),
						isGameOver: engine.getState().isGameOver
					};
					else if (game === "fight") res = engine.action(move.playerId, move.action, move.payload);
					else if (game === "tictactoe") res = engine.playTurn(move.playerId, parseInt(move.payload?.index ?? move.action.replace("cell_", ""), 10));
					else if (game === "hangman") res = engine.guess(move.action || move.payload?.letter);
					else if (game === "calculator") res = engine.press(move.action);
					else res = {
						success: false,
						error: "Unsupported game move"
					};
					return res;
				}
			};
			this.bridge.registerSession(session);
			return {
				status: 201,
				body: {
					success: true,
					sessionId,
					game,
					state: initialState,
					players
				}
			};
		}
		if (path === "/games/action" && method === "POST") {
			const { sessionId, playerId, action, payload } = req.body || {};
			if (!sessionId || !action) return {
				status: 400,
				body: { error: "Missing sessionId or action in request body." }
			};
			const result = await this.bridge.dispatchMove(sessionId, {
				playerId: playerId || "guest",
				action,
				payload,
				sourcePlatform: req.body?.platform || "dashboard"
			});
			return {
				status: result.success ? 200 : 400,
				body: result
			};
		}
		if (path.startsWith("/games/") && method === "GET") {
			const sessionId = path.replace("/games/", "");
			const session = this.bridge.getSession(sessionId);
			if (!session) return {
				status: 404,
				body: { error: `Session "${sessionId}" not found.` }
			};
			return {
				status: 200,
				body: {
					id: session.id,
					game: session.game,
					platform: session.platform,
					players: session.players,
					currentTurnId: session.currentTurnId,
					state: session.state,
					isGameOver: session.isGameOver,
					winnerId: session.winnerId,
					lastUpdated: session.lastUpdated
				}
			};
		}
		if (path === "/cards/render" && method === "GET") {
			const type = (req.query.type || req.query.card || "").toLowerCase();
			try {
				let buffer = null;
				const username = req.query.username || "Player";
				const avatarUrl = req.query.avatarUrl || "";
				if (type === "2048") {
					const score = parseInt(req.query.score || "0", 10);
					const boardJson = req.query.board ? JSON.parse(req.query.board) : [
						[
							2,
							4,
							8,
							16
						],
						[
							32,
							64,
							128,
							256
						],
						[
							512,
							1024,
							2048,
							0
						],
						[
							0,
							0,
							0,
							0
						]
					];
					buffer = await Render2048.renderBoard(boardJson, score, username, avatarUrl);
				} else if (type === "snake") {
					const score = parseInt(req.query.score || "0", 10);
					buffer = await RenderSnake.renderBoard([
						{
							x: 7,
							y: 7
						},
						{
							x: 6,
							y: 7
						},
						{
							x: 5,
							y: 7
						}
					], {
						x: 10,
						y: 7
					}, "RIGHT", score, 15, username, avatarUrl);
				} else if (type === "fight") {
					const p1Hp = parseInt(req.query.p1Hp || "90", 10);
					const p2Hp = parseInt(req.query.p2Hp || "45", 10);
					buffer = await RenderFight.renderBattleCard({
						id: "p1",
						username: req.query.p1 || req.query.p1Name || username,
						avatarUrl: req.query.p1Avatar || avatarUrl,
						health: p1Hp,
						maxHealth: 100,
						coins: 50
					}, {
						id: "p2",
						username: req.query.p2 || req.query.p2Name || "Dragon Boss",
						avatarUrl: req.query.p2Avatar || "",
						health: p2Hp,
						maxHealth: 100,
						coins: 50
					}, "p1", req.query.action || "⚔️ Hero used Heavy Strike for 24 damage!");
				} else if (type === "hangman") {
					const word = req.query.word || "DEVELOPER";
					const guessed = (req.query.guessed || "E,O,L").split(",");
					buffer = await RenderHangman.renderCard(parseInt(req.query.mistakes || "2", 10), word, guessed, username, avatarUrl);
				} else if (type === "pokemon") buffer = await RenderPokemon.renderCard({
					name: req.query.name || req.query.pokemon || "Pikachu",
					types: ["Electric"],
					abilities: ["Static", "Lightning Rod"],
					imageUrl: req.query.imageUrl || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
					id: 25
				}, req.query.revealed === "true");
				else if (type === "share") buffer = await RenderShareCard.render({
					gameName: req.query.game || "Weky Arcade",
					username,
					avatarUrl,
					primaryScore: req.query.score || "4,096",
					headline: req.query.outcome || "VICTORY 👑",
					stats: [{
						label: "Score",
						value: req.query.score || "4,096"
					}, {
						label: "Outcome",
						value: req.query.outcome || "VICTORY"
					}]
				});
				else if (type === "leaderboard") buffer = await RenderLeaderboard.render({
					title: req.query.title || "Arcade Championship Leaderboard",
					gameName: "Arcade",
					entries: [
						{
							rank: 1,
							username: "MasterGamer",
							scoreOrElo: 14500,
							avatarUrl
						},
						{
							rank: 2,
							username: "NeonNinja",
							scoreOrElo: 11200
						},
						{
							rank: 3,
							username: "PixelQueen",
							scoreOrElo: 9800
						}
					]
				});
				if (buffer) return {
					status: 200,
					body: buffer,
					isBuffer: true,
					contentType: "image/png"
				};
				return {
					status: 400,
					body: { error: `Invalid card type "${type}". Available: 2048, snake, fight, hangman, pokemon, share, leaderboard` }
				};
			} catch (err) {
				return {
					status: 500,
					body: { error: `Card rendering error: ${err?.message || err}` }
				};
			}
		}
		if (path === "/overview" && method === "GET") return {
			status: 200,
			body: await this.bridge.getDashboardOverview()
		};
		return null;
	}
	async handleAction(action) {
		if (!action.sessionId) return {
			success: false,
			error: "Action missing sessionId"
		};
		return this.bridge.dispatchMove(action.sessionId, {
			playerId: action.playerId,
			action: action.action,
			payload: action.payload,
			sourcePlatform: action.sourcePlatform
		});
	}
};
// src/bridge/WekyBridge.ts
/**
* Weky Cross-Platform Bridge & Dashboard Gateway
* Connects Discord minigame instances with Headless Engines and Web Dashboards,
* enabling real-time game state synchronization, cross-platform move execution,
* and unified leaderboard data access.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var WekyBridge = class {
	sessions = /* @__PURE__ */ new Map();
	wekyManager;
	m3rcenaBridge;
	router;
	constructor(wekyManager, customBridge) {
		this.wekyManager = wekyManager;
		this.m3rcenaBridge = customBridge || new _m3rcena_bridge.M3rcenaBridge();
		this.router = new WekyBridgeRouter(this);
		this.m3rcenaBridge.mountPackage(this.router);
		this.m3rcenaBridge.registerModule("games", async (action) => {
			const res = await this.dispatchMove(action.sessionId || "", {
				playerId: action.playerId,
				action: action.action,
				payload: action.payload,
				sourcePlatform: action.sourcePlatform || "dashboard"
			});
			return {
				success: res.success,
				state: res.state,
				nextTurnId: res.nextTurnId,
				isEnded: res.isGameOver,
				winnerId: res.winnerId,
				announcement: res.announcement,
				soundKey: res.soundKey,
				soundUrl: res.soundUrl,
				error: res.error
			};
		});
	}
	/**
	* Returns the underlying M3rcenaBridge instance.
	*/
	getM3rcenaBridge() {
		return this.m3rcenaBridge;
	}
	/**
	* Replaces or connects an existing M3rcenaBridge instance.
	*/
	setM3rcenaBridge(bridge) {
		this.m3rcenaBridge = bridge;
		if (this.m3rcenaBridge && typeof this.m3rcenaBridge.mountPackage === "function") {
			this.m3rcenaBridge.mountPackage(this.router);
			this.m3rcenaBridge.registerModule("games", async (action) => {
				const res = await this.dispatchMove(action.sessionId || "", {
					playerId: action.playerId,
					action: action.action,
					payload: action.payload,
					sourcePlatform: action.sourcePlatform || "dashboard"
				});
				return {
					success: res.success,
					state: res.state,
					nextTurnId: res.nextTurnId,
					isEnded: res.isGameOver,
					winnerId: res.winnerId,
					announcement: res.announcement,
					soundKey: res.soundKey,
					soundUrl: res.soundUrl,
					error: res.error
				};
			});
		}
	}
	/**
	* Registers an active game session into the cross-platform bridge.
	*/
	registerSession(session) {
		session.createdAt = session.createdAt || Date.now();
		session.lastUpdated = Date.now();
		this.sessions.set(session.id, session);
		this.m3rcenaBridge.registerSession({
			id: session.id,
			module: "games",
			type: session.game,
			platform: session.platform,
			players: session.players.map((p) => ({
				id: p.id,
				username: p.username,
				avatarUrl: p.avatarUrl,
				platform: p.platform
			})),
			currentTurnId: session.currentTurnId,
			state: session.state,
			metadata: session.metadata,
			createdAt: session.createdAt,
			lastUpdated: session.lastUpdated,
			isEnded: session.isGameOver,
			winnerId: session.winnerId,
			onAction: async (action) => {
				const res = await this.dispatchMove(action.sessionId || session.id, {
					playerId: action.playerId,
					action: action.action,
					payload: action.payload,
					sourcePlatform: action.sourcePlatform || "dashboard"
				});
				return {
					success: res.success,
					state: res.state,
					nextTurnId: res.nextTurnId,
					isEnded: res.isGameOver,
					winnerId: res.winnerId,
					announcement: res.announcement,
					soundKey: res.soundKey,
					soundUrl: res.soundUrl,
					error: res.error
				};
			},
			renderSnapshot: session.renderSnapshot || (session.engine && typeof session.engine.renderDataURL === "function" ? () => session.engine.renderDataURL() : void 0)
		}).catch?.(() => {});
		if (this.wekyManager && typeof this.wekyManager.emit === "function") this.wekyManager.emit("bridgeSync", {
			sessionId: session.id,
			game: session.game,
			state: session.state,
			source: session.platform,
			timestamp: Date.now()
		});
	}
	/**
	* Unregisters a game session upon termination.
	*/
	unregisterSession(sessionId) {
		this.sessions.delete(sessionId);
		this.m3rcenaBridge.unregisterSession(sessionId);
	}
	/**
	* Retrieves a session by ID.
	*/
	getSession(sessionId) {
		return this.sessions.get(sessionId);
	}
	/**
	* Returns all active, uncompleted sessions.
	*/
	getActiveSessions() {
		return Array.from(this.sessions.values()).filter((s) => !s.isGameOver);
	}
	/**
	* Returns all registered sessions regardless of status.
	*/
	getAllSessions() {
		return Array.from(this.sessions.values());
	}
	/**
	* Returns all sessions where a specific user is a participant.
	*/
	getSessionsForPlayer(playerId) {
		return Array.from(this.sessions.values()).filter((s) => s.players.some((p) => p.id === playerId));
	}
	/**
	* Updates state for a session and synchronizes it with bridge listeners.
	*/
	syncState(sessionId, newState, source = "internal") {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		session.state = newState;
		session.lastUpdated = Date.now();
		this.m3rcenaBridge.updateSessionState(sessionId, newState, source).catch?.(() => {});
		if (this.wekyManager && typeof this.wekyManager.emit === "function") this.wekyManager.emit("bridgeSync", {
			sessionId: session.id,
			game: session.game,
			state: newState,
			source,
			timestamp: Date.now()
		});
	}
	/**
	* Dispatches a cross-platform move to an active game session.
	* Can be invoked from Web Dashboards, REST APIs, or Discord bots.
	*/
	async dispatchMove(sessionId, move) {
		const session = this.sessions.get(sessionId);
		if (!session) return {
			success: false,
			state: null,
			error: `Session "${sessionId}" not found`
		};
		if (session.isGameOver) return {
			success: false,
			state: session.state,
			error: "Session has already ended"
		};
		let result;
		if (session.onMove) result = await session.onMove(move);
		else if (session.engine && typeof session.engine.action === "function") {
			const engineRes = session.engine.action(move.playerId, move.action, move.payload);
			result = {
				success: engineRes.success,
				state: session.engine.getState(),
				nextTurnId: session.engine.getState().currentTurn,
				isGameOver: engineRes.isGameOver,
				winnerId: engineRes.winnerId,
				announcement: engineRes.announcement
			};
		} else return {
			success: false,
			state: session.state,
			error: "No move handler registered for session"
		};
		if (result.success) {
			session.state = result.state ?? session.state;
			session.lastUpdated = Date.now();
			if (result.nextTurnId) session.currentTurnId = result.nextTurnId;
			if (result.isGameOver) {
				session.isGameOver = true;
				session.winnerId = result.winnerId;
			}
			if (this.wekyManager?.soundboard && typeof this.wekyManager.soundboard.getSoundUrl === "function") {
				let soundKey = "action";
				if (result.isGameOver) soundKey = result.winnerId ? "victory" : "tie";
				else if (move.action === "hit" || move.action === "heavy") soundKey = "hit";
				else if (move.action === "heal") soundKey = "heal";
				else if (move.action === "eat" || session.game === "snake") soundKey = "eat";
				const soundUrl = this.wekyManager.soundboard.getSoundUrl(soundKey);
				result.soundKey = soundKey;
				result.soundUrl = soundUrl;
				const targetUserIds = session.players.map((p) => p.id);
				const movingPlayer = session.players.find((p) => p.id === move.playerId);
				this.wekyManager.soundboard.triggerSound(soundKey, {
					sessionId: session.id,
					game: session.game,
					userId: move.playerId,
					username: movingPlayer?.username,
					targetUserIds
				});
				this.m3rcenaBridge.dispatchAudioCue({
					sound: soundKey,
					userId: move.playerId,
					targetUserIds,
					module: "games"
				});
			}
			if (this.wekyManager && typeof this.wekyManager.emit === "function") {
				this.wekyManager.emit("crossPlatformMove", {
					sessionId: session.id,
					game: session.game,
					playerId: move.playerId,
					action: move.action,
					payload: move.payload,
					platform: move.sourcePlatform
				});
				this.wekyManager.emit("bridgeSync", {
					sessionId: session.id,
					game: session.game,
					state: session.state,
					source: move.sourcePlatform,
					timestamp: Date.now()
				});
			}
		}
		return result;
	}
	/**
	* Ends an active game session and flags it as completed.
	*/
	endSession(sessionId, outcome = {}) {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		session.isGameOver = true;
		session.winnerId = outcome.winnerId;
		session.lastUpdated = Date.now();
		this.m3rcenaBridge.endSession(sessionId, outcome).catch?.(() => {});
	}
	/**
	* Renders a live visual snapshot of the session (Canvas image Buffer or Data URL).
	*/
	async renderSessionSnapshot(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return null;
		if (session.renderSnapshot) return await session.renderSnapshot();
		if (session.engine && typeof session.engine.renderDataURL === "function") return await session.engine.renderDataURL();
		if (session.engine && typeof session.engine.renderBuffer === "function") return await session.engine.renderBuffer();
		return null;
	}
	/**
	* Returns a high-level overview of live games, active sessions, and leaderboard data for Web Dashboards.
	*/
	async getDashboardOverview() {
		const activeSessions = this.getActiveSessions().map((s) => ({
			id: s.id,
			game: s.game,
			platform: s.platform,
			players: s.players.map((p) => ({
				id: p.id,
				username: p.username,
				platform: p.platform
			})),
			currentTurnId: s.currentTurnId,
			lastUpdated: s.lastUpdated,
			isGameOver: s.isGameOver
		}));
		let topContenders = [];
		let totalPlayers = 0;
		if (this.wekyManager && this.wekyManager.leaderboard) {
			topContenders = (await this.wekyManager.leaderboard.getTopByElo(5)).map((p, index) => ({
				rank: index + 1,
				username: p.username,
				elo: p.elo,
				wins: p.wins,
				winStreak: p.winStreak
			}));
			totalPlayers = (await this.wekyManager.leaderboard.exportData()).length;
		}
		return {
			activeGamesCount: activeSessions.length,
			totalLeaderboardPlayers: totalPlayers,
			activeSessions,
			topContenders
		};
	}
	/**
	* Exports full state dump of active sessions and leaderboard data for external database syncing.
	*/
	async exportAllState() {
		const sessions = Array.from(this.sessions.values()).map((s) => ({
			...s,
			engine: void 0,
			onMove: void 0,
			renderSnapshot: void 0
		}));
		let leaderboard;
		if (this.wekyManager?.leaderboard) leaderboard = await this.wekyManager.leaderboard.exportData();
		return {
			sessions,
			leaderboard
		};
	}
	/**
	* Imports state dump from an external database or dashboard backend.
	*/
	async importAllState(data) {
		if (data.sessions) for (const s of data.sessions) this.sessions.set(s.id, s);
		if (data.leaderboard && this.wekyManager?.leaderboard) await this.wekyManager.leaderboard.importData(data.leaderboard);
	}
	/**
	* Notifies the bridge/soundboard that a user is actively connected on the web dashboard.
	*/
	setDashboardUserOnline(userId, isOnline = true) {
		if (isOnline) this.m3rcenaBridge.setUserOnline(userId, "dashboard");
		else this.m3rcenaBridge.setUserOffline(userId);
		if (this.wekyManager?.soundboard && typeof this.wekyManager.soundboard.setDashboardUserOnline === "function") this.wekyManager.soundboard.setDashboardUserOnline(userId, isOnline);
	}
	/**
	* Returns whether a user is currently verified as online/active on the web dashboard.
	*/
	isUserOnDashboard(userId) {
		if (this.m3rcenaBridge.isUserOnline(userId)) return true;
		if (this.wekyManager?.soundboard && typeof this.wekyManager.soundboard.isUserOnDashboard === "function") return this.wekyManager.soundboard.isUserOnDashboard(userId);
		return false;
	}
};
// src/host.ts
/**
* @m3rcena/weky - Standalone Local Submodule Host Service
*
* Runs the Weky Arcade Engine locally when cloned via Git submodules.
* Supports both Headless HTTP Arcade Server mode and interactive Discord Bot mode.
* Automatically connects to local @m3rcena/bridge if detected.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
async function hostWeky(options = {}) {
	const port = options.port ?? parseInt(process.env.PORT || process.env.WEKY_PORT || "4001", 10);
	options.bridgeUrl ?? process.env.BRIDGE_URL;
	require_resolver.printResolutionSummary();
	const router = new WekyBridge().router;
	const resolutions = require_resolver.getAllPackageResolutions();
	if (resolutions["@m3rcena/bridge"].status !== "missing") try {
		if ((await import(resolutions["@m3rcena/bridge"].path)).M3rcenaBridge) console.log(`[m3rcena-weky] 🌉 Found @m3rcena/bridge (${resolutions["@m3rcena/bridge"].status}). Ready for bridge mount.`);
	} catch {}
	const server = node_http.default.createServer(async (req, res) => {
		const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
		const pathname = url.pathname;
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		if (req.method === "OPTIONS") {
			res.writeHead(204);
			res.end();
			return;
		}
		if (pathname === "/health" || pathname === "/") {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({
				status: "healthy",
				package: "@m3rcena/weky",
				mode: "local-submodule-host",
				version,
				uptime: process.uptime(),
				canvasEngine: "@napi-rs/canvas (blazingly fast Rust renderer)"
			}, null, 2));
			return;
		}
		if (pathname === "/catalog") {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ games: [
				{
					id: "2048",
					name: "2048",
					mode: "singleplayer",
					canvas: true
				},
				{
					id: "snake",
					name: "Snake",
					mode: "singleplayer",
					canvas: true
				},
				{
					id: "fight",
					name: "Fight",
					mode: "pvp",
					canvas: true
				},
				{
					id: "tictactoe",
					name: "TicTacToe",
					mode: "pvp",
					canvas: false
				},
				{
					id: "calculator",
					name: "Calculator",
					mode: "utility",
					canvas: false
				},
				{
					id: "hangman",
					name: "Hangman",
					mode: "word",
					canvas: true
				},
				{
					id: "guess-pokemon",
					name: "Guess The Pokemon",
					mode: "trivia",
					canvas: true
				},
				{
					id: "trivia",
					name: "Trivia",
					mode: "quiz",
					canvas: false
				},
				{
					id: "minesweeper",
					name: "Minesweeper",
					mode: "puzzle",
					canvas: false
				},
				{
					id: "connect4",
					name: "Connect4",
					mode: "pvp",
					canvas: false
				}
			] }, null, 2));
			return;
		}
		if (pathname === "/render/pokemon") try {
			const buf = await RenderPokemon.renderCard({
				name: "Pikachu",
				types: ["electric"],
				abilities: ["static"],
				imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
			}, url.searchParams.get("reveal") === "true");
			res.writeHead(200, { "Content-Type": "image/png" });
			res.end(buf);
			return;
		} catch (err) {
			res.writeHead(500, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: err.message }));
			return;
		}
		if (pathname.startsWith("/weky/") || pathname.startsWith("/api/weky")) {
			const bridgeReq = {
				method: req.method ?? "GET",
				url: req.url || "/",
				path: pathname,
				subPath: pathname.replace(/^\/(?:api\/)?weky/, ""),
				params: {},
				headers: req.headers,
				query: Object.fromEntries(url.searchParams.entries())
			};
			const handled = await router.handleRequest(bridgeReq);
			if (handled) {
				res.writeHead(handled.status, {
					"Content-Type": handled.contentType || "application/json",
					...handled.headers || {}
				});
				if (Buffer.isBuffer(handled.body)) res.end(handled.body);
				else if (typeof handled.body === "string") res.end(handled.body);
				else res.end(JSON.stringify(handled.body));
				return;
			}
		}
		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({
			error: "Route not found",
			path: pathname
		}));
	});
	await new Promise((resolve) => {
		server.listen(port, () => resolve());
	});
	console.log(`
┌────────────────────────────────────────────────────────────────────────┐
│  🕹️  M3RCENA WEKY LOCAL HOST SERVICE                                   │
│  Arcade Engine running on http://localhost:${port.toString().padEnd(27)}│
│  - Health API:     http://localhost:${port}/health                        │
│  - Games Catalog:  http://localhost:${port}/catalog                       │
│  - Canvas Preview: http://localhost:${port}/render/pokemon                │
│  Ready to host minigames locally via Submodule!                        │
└────────────────────────────────────────────────────────────────────────┘
`);
	return {
		server,
		router,
		port
	};
}
if (process.argv[1]?.endsWith("host.ts") || process.argv[1]?.endsWith("host.js")) hostWeky().catch((err) => {
	console.error("[m3rcena-weky host] Fatal error:", err);
	process.exit(1);
});
Object.defineProperty(exports, "COMMON_WORDS", {
	enumerable: true,
	get: function() {
		return COMMON_WORDS;
	}
});
Object.defineProperty(exports, "CalculatorEngine", {
	enumerable: true,
	get: function() {
		return CalculatorEngine;
	}
});
Object.defineProperty(exports, "CanvasUtils", {
	enumerable: true,
	get: function() {
		return CanvasUtils;
	}
});
Object.defineProperty(exports, "FightEngine", {
	enumerable: true,
	get: function() {
		return FightEngine;
	}
});
Object.defineProperty(exports, "Game2048Engine", {
	enumerable: true,
	get: function() {
		return Game2048Engine;
	}
});
Object.defineProperty(exports, "HANGMAN_CATEGORIES", {
	enumerable: true,
	get: function() {
		return HANGMAN_CATEGORIES;
	}
});
Object.defineProperty(exports, "HangmanEngine", {
	enumerable: true,
	get: function() {
		return HangmanEngine;
	}
});
Object.defineProperty(exports, "MathEvaluator", {
	enumerable: true,
	get: function() {
		return MathEvaluator;
	}
});
Object.defineProperty(exports, "Render2048", {
	enumerable: true,
	get: function() {
		return Render2048;
	}
});
Object.defineProperty(exports, "RenderFight", {
	enumerable: true,
	get: function() {
		return RenderFight;
	}
});
Object.defineProperty(exports, "RenderHangman", {
	enumerable: true,
	get: function() {
		return RenderHangman;
	}
});
Object.defineProperty(exports, "RenderLeaderboard", {
	enumerable: true,
	get: function() {
		return RenderLeaderboard;
	}
});
Object.defineProperty(exports, "RenderPokemon", {
	enumerable: true,
	get: function() {
		return RenderPokemon;
	}
});
Object.defineProperty(exports, "RenderShareCard", {
	enumerable: true,
	get: function() {
		return RenderShareCard;
	}
});
Object.defineProperty(exports, "RenderSnake", {
	enumerable: true,
	get: function() {
		return RenderSnake;
	}
});
Object.defineProperty(exports, "SnakeEngine", {
	enumerable: true,
	get: function() {
		return SnakeEngine;
	}
});
Object.defineProperty(exports, "TicTacToeEngine", {
	enumerable: true,
	get: function() {
		return TicTacToeEngine;
	}
});
Object.defineProperty(exports, "VERSION", {
	enumerable: true,
	get: function() {
		return VERSION;
	}
});
Object.defineProperty(exports, "WEKY_GAME_CATALOG", {
	enumerable: true,
	get: function() {
		return WEKY_GAME_CATALOG;
	}
});
Object.defineProperty(exports, "WEKY_VERSION", {
	enumerable: true,
	get: function() {
		return WEKY_VERSION;
	}
});
Object.defineProperty(exports, "WekyBridge", {
	enumerable: true,
	get: function() {
		return WekyBridge;
	}
});
Object.defineProperty(exports, "WekyBridgeRouter", {
	enumerable: true,
	get: function() {
		return WekyBridgeRouter;
	}
});
Object.defineProperty(exports, "WekyCanvas", {
	enumerable: true,
	get: function() {
		return WekyCanvas;
	}
});
Object.defineProperty(exports, "getRandomHangmanWord", {
	enumerable: true,
	get: function() {
		return getRandomHangmanWord;
	}
});
Object.defineProperty(exports, "getRandomWord", {
	enumerable: true,
	get: function() {
		return getRandomWord;
	}
});
Object.defineProperty(exports, "getRandomWords", {
	enumerable: true,
	get: function() {
		return getRandomWords;
	}
});
Object.defineProperty(exports, "hostWeky", {
	enumerable: true,
	get: function() {
		return hostWeky;
	}
});
Object.defineProperty(exports, "version", {
	enumerable: true,
	get: function() {
		return version;
	}
});

//# sourceMappingURL=host-0Gy4BuhY.cjs.map