import DiscordJS from "discord.js";
import { promisify } from "util";
import chalk from "chalk";
import { exec } from "child_process";
import stringWidth from "string-width";
import { randomBytes } from "crypto";

import { NetworkManager } from "./handlers/NetworkManager.js";
import { LoggerManager } from "./handlers/Logger.js";
import weky_package from "../package.json";

/**
 *
 * Minigames
 *
 */
import mini2048 from "./minigames/2024.js";
import Calculator from "./minigames/Calculator.js";
import ChaosWords from "./minigames/ChaosWords.js";
import FastType from "./minigames/FastType.js";
import Fight from "./minigames/Fight.js";
import GuessTheNumber from "./minigames/GuessTheNumber.js";
import GuessThePokemon from "./minigames/GuessThePokemon.js";
import Hangman from "./minigames/Hangman.js";
import LieSwatter from "./minigames/LieSwatter.js";
import NeverHaveIEver from "./minigames/NeverHaveIEver.js";
import QuickClick from "./minigames/QuickClick.js";
import ShuffleGuess from "./minigames/ShuffleGuess.js";
import Snake from "./minigames/Snake.js";
import WillYouPressTheButton from "./minigames/WillYouPressTheButton.js";
import WouldYouRather from "./minigames/WouldYouRather.js";

import type {
	Types2048,
	CalcTypes,
	ChaosTypes,
	FastTypeTypes,
	FightTypes,
	GuessTheNumberTypes,
	HangmanTypes,
	LieSwatterTypes,
	NeverHaveIEverTypes,
	QuickClickTypes,
	WillYouPressTheButtonTypes,
	WouldYouRatherTypes,
	ShuffleGuessTypes,
	SnakeTypes,
	GuessThePokemonTypes,
	BotDataTypes,
	Fields,
	Author,
	Embeds,
	CustomOptions,
} from "./Types/index.js";

/**
 *
 * CONSTANT VARIABLES USED IN THE HELPERS / FUNCTIONS
 *
 */
const DANGER_KEYS = new Set(["AC", "DC", "⌫"]);
const SUCCESS_KEYS = new Set([" = "]);
const PRIMARY_KEYS = new Set([
	"(",
	")",
	"^",
	"%",
	"÷",
	"x",
	" - ",
	" + ",
	".",
	"RND",
	"SIN",
	"COS",
	"TAN",
	"LG",
	"LN",
	"SQRT",
	"x!",
	"1/x",
	"π",
	"e",
	"ans",
]);
const DISABLED_ON_LOCK = new Set(["^", "%", "÷", "AC", "⌫", "x!", "x", "1/x"]);
const defaultFooter = {
	text: "©️ M3rcena Development | Powered by Mivator",
	iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png",
};

export class WekyManager {
	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _client: DiscordJS.Client;

	private notifyUpdates: boolean;
	private isInitilized: boolean = false;
	private apiKey: string;

	private URL_PATTERN = /^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$/;

	public NetworkManager: NetworkManager;

	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _LoggerManager: LoggerManager;

	constructor(client: DiscordJS.Client, apiKey: string, notifyUpdates: boolean) {
		// TODO: Enable again after finishing testing
		// if (!(client instanceof DiscordJS.Client))
		// 	throw new TypeError(`${chalk.red("[WekyManager]")} Invalid DiscordJS Client.`);
		this._client = client;
		this.notifyUpdates = notifyUpdates;
		this.apiKey = apiKey;

		this._LoggerManager = new LoggerManager();
		this.NetworkManager = new NetworkManager(this._client, this._LoggerManager, this.apiKey);
	}

	/**
	 *
	 * Creates a new instance of the 2048 game.
	 *
	 * @param options The options for the 2048 game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.create2048(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async create2048(options: Types2048) {
		this.checkPackageUpdates("2048");
		this.OptionsChecking(options, "2048");

		return await mini2048(this, options as CustomOptions<Types2048>);
	}

	/**
	 *
	 * Creates a new instance of the Calculator game.
	 *
	 * @param options The options for the Calculator game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createCalculator(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createCalculator(options: CalcTypes) {
		this.NetworkManager.increaseUsage("calculator");
		this.checkPackageUpdates("Calculator");
		this.OptionsChecking(options, "Calculator");

		return await Calculator(this, options as CustomOptions<CalcTypes>);
	}

	/**
	 *
	 * Create a new instance of the Chaos Words game.
	 *
	 * @param options The options for the Chaos Words game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createChaosWords(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createChaosWords(options: ChaosTypes) {
		this.NetworkManager.increaseUsage("chaosWords");
		this.checkPackageUpdates("ChaosWords");
		this.OptionsChecking(options, "ChaosWords");

		return await ChaosWords(this, options as CustomOptions<ChaosTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Fast Type game.
	 *
	 * @param options The options for the Fast Type game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createFastType(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createFastType(options: FastTypeTypes) {
		this.checkPackageUpdates("FastType");
		this.OptionsChecking(options, "FastType");

		return await FastType(this, options as CustomOptions<FastTypeTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Fight game.
	 *
	 * @param options The options for the Fight game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createFight(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createFight(options: FightTypes) {
		this.checkPackageUpdates("Fight");
		this.OptionsChecking(options, "Fight");

		return await Fight(this, options as CustomOptions<FightTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Guess The Number game.
	 *
	 * @param options The options for the Guess The Number game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createGuessTheNumber(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createGuessTheNumber(options: GuessTheNumberTypes) {
		this.NetworkManager.increaseUsage("guessTheNumber");
		this.checkPackageUpdates("GuessTheNumber");
		this.OptionsChecking(options, "GuessTheNumber");

		return await GuessTheNumber(this, options as CustomOptions<GuessTheNumberTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Guess The Pokemon game.
	 *
	 * @param options The options for the Guess The Pokemon game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createGuessThePokemon(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createGuessThePokemon(options: GuessThePokemonTypes) {
		this.NetworkManager.increaseUsage("guessThePokemon");
		this.checkPackageUpdates("GuessThePokemon");
		this.OptionsChecking(options, "GuessThePokemon");

		return await GuessThePokemon(this, options as CustomOptions<GuessThePokemonTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Hangman game.
	 *
	 * @param options The options for the Hangman game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createHangman(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createHangman(options: HangmanTypes) {
		this.checkPackageUpdates("Hangman");
		this.OptionsChecking(options, "Hangman");

		return await Hangman(this, options as CustomOptions<HangmanTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Lie Swatter game.
	 *
	 * @param options The options for the Lie Swatter game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createLieSwatter(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createLieSwatter(options: LieSwatterTypes) {
		this.NetworkManager.increaseUsage("lieSwatter");
		this.checkPackageUpdates("LieSwatter");
		this.OptionsChecking(options, "LieSwatter");

		return await LieSwatter(this, options as CustomOptions<LieSwatterTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Never Have I Ever game.
	 *
	 * @param options The options for the Never Have I Ever game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createNeverHaveIEver(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createNeverHaveIEver(options: NeverHaveIEverTypes) {
		this.NetworkManager.increaseUsage("neverHaveIEver");
		this.checkPackageUpdates("NeverHaveIEver");
		this.OptionsChecking(options, "NeverHaveIEver");

		return await NeverHaveIEver(this, options as CustomOptions<NeverHaveIEverTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Quick Click game.
	 *
	 * @param options The options for the Quick Click game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createQuickClick(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createQuickClick(options: QuickClickTypes) {
		this.NetworkManager.increaseUsage("quickClick");
		this.checkPackageUpdates("QuickClick");
		this.OptionsChecking(options, "QuickClick");

		return await QuickClick(this, options as CustomOptions<QuickClickTypes>);
	}

	/**
	 *
	 * Creates a new instance of the Shuffle Guess game.
	 *
	 * @param options The options for the Shuffle Guess game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createShuffleGuess(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createShuffleGuess(options: ShuffleGuessTypes) {
		this.checkPackageUpdates("ShuffleGuess");
		this.OptionsChecking(options, "ShuffleGuess");

		return await ShuffleGuess(options);
	}

	/**
	 *
	 * Creates a new instance of the Snake game.
	 *
	 * @param options The options for the Snake game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createSnake(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createSnake(options: SnakeTypes) {
		this.checkPackageUpdates("Snake");
		this.OptionsChecking(options, "Snake");

		return await Snake(options);
	}

	/**
	 *
	 * Creates a new instance of the Will You Press The Button game.
	 *
	 * @param options The options for the Will You Press The Button game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createWillYouPressTheButton(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createWillYouPressTheButton(options: WillYouPressTheButtonTypes) {
		this.checkPackageUpdates("WillYouPressTheButton");
		this.OptionsChecking(options, "WillYouPressTheButton");

		return await WillYouPressTheButton(options);
	}

	/**
	 *
	 * Creates a new instance of the Would You Rather game.
	 *
	 * @param options The options for the Would You Rather game.
	 * @returns
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * weky.createWouldYouRather(); // You can also pass options.
	 * ```
	 *
	 * @copyright All rights reserved. M3rcena Development
	 */
	async createWouldYouRather(options: WouldYouRatherTypes) {
		this.checkPackageUpdates("WouldYouRather");
		this.OptionsChecking(options, "WouldYouRather");

		return await WouldYouRather(options);
	}

	/**
	 *
	 * Get your Bot Usage of all the Minigames and API Requests
	 *
	 * @returns { Promise<BotDataTypes["usage"]> }
	 *
	 * @example
	 * ```js
	 * import { WekyManager } from "@m3rcena/weky";
	 * import DiscordJS from "discord.js";
	 *
	 * const client = new DiscordJS.Client();
	 *
	 * const weky = new WekyManager(client, true);
	 *
	 * console.log(weky.getUsage());
	 * ```
	 *
	 * @copyright All rights reserverd. M3rcena Development
	 */
	async getUsage(): Promise<string | BotDataTypes["usage"] | null> {
		if (!this.isInitilized) return "You can use that function once the Bot is Ready";
		return await this.NetworkManager.getUsage();
	}

	/**
	 * PRIVATE HELPERS
	 *
	 * USED ONLY BY THE CLASS TO VALIDATE OPTIONS AND MAKE SURE THE MINIGAMES ARE STARTING WITH NO ISSUES
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */

	/**
	 *
	 * PRIVATE HELPERS FOR CHECKING OPTIONS
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */

	private validateURL(url: string, gameName: string, context: string): boolean | null {
		if (typeof url !== "string") {
			return this._LoggerManager.createTypeError(gameName, `${context} must be a string.`);
		}
		if (!this.URL_PATTERN.test(url)) {
			return this._LoggerManager.createError(gameName, `${context} must be a valid URL.`);
		}
	}

	private validateString(value: string, gameName: string, fieldName: string, maxLength?: number): boolean | null {
		if (typeof value !== "string") {
			return this._LoggerManager.createTypeError(gameName, `${fieldName} must be a string.`);
		}
		if (maxLength && value.length > maxLength) {
			return this._LoggerManager.createError(
				gameName,
				`${fieldName} length must be less than ${maxLength} characters.`
			);
		}
	}

	private validateEmbedFields(fields: Fields[], gameName: string): boolean {
		if (!Array.isArray(fields)) {
			return this._LoggerManager.createTypeError(gameName, "Embed fields must be an array.");
		}

		fields.forEach((field) => {
			if (typeof field !== "object") {
				return this._LoggerManager.createTypeError(gameName, "Embed field must be an object.");
			}

			if (!field.name) {
				return this._LoggerManager.createError(gameName, "No embed field name provided.");
			}
			if (this.validateString(field.name, gameName, "Field name", 256)) return true;

			if (!field.value) {
				return this._LoggerManager.createError(gameName, "No embed field value provided.");
			}
			if (this.validateString(field.value, gameName, "Field value", 1024)) return true;

			if (field.inline !== undefined && typeof field.inline !== "boolean") {
				return this._LoggerManager.createTypeError(gameName, "Embed field inline must be a boolean.");
			}
		});
	}

	private validateEmbedAuthor(author: Author, gameName: string): boolean {
		if (typeof author !== "object") {
			return this._LoggerManager.createTypeError(gameName, "Embed author must be an object.");
		}

		if (!author.name) {
			return this._LoggerManager.createError(gameName, "No embed author name provided.");
		}

		if (author.icon_url) {
			return this.validateURL(author.icon_url, gameName, "Embed author icon URL");
		}

		if (author.url) {
			return this.validateURL(author.url, gameName, "Embed author URL");
		}
	}

	private OptionsChecking(
		options:
			| Types2048
			| CalcTypes
			| ChaosTypes
			| FastTypeTypes
			| FightTypes
			| GuessTheNumberTypes
			| GuessThePokemonTypes
			| HangmanTypes
			| LieSwatterTypes
			| NeverHaveIEverTypes
			| QuickClickTypes
			| ShuffleGuessTypes
			| SnakeTypes
			| WillYouPressTheButtonTypes
			| WouldYouRatherTypes,
		GameName: string
	): boolean {
		if (!options) {
			return this._LoggerManager.createError(GameName, "No options provided.");
		}

		if (typeof options !== "object") {
			return this._LoggerManager.createTypeError(GameName, "Options must be an object.");
		}

		// Basic validations
		if (!options.context) {
			return this._LoggerManager.createError(GameName, "No Context provided.");
		}

		if (!options.context.guild) {
			return this._LoggerManager.createError(GameName, "The minigame should be in a guild!");
		}

		if (!options.context.channel || !options.context.channel.isSendable()) {
			return this._LoggerManager.createError(GameName, "The channel is either unsendable or is a DM Channel");
		}

		// Embed validations
		if ("embed" in options && options.embed) {
			if (typeof options.embed !== "object") {
				return this._LoggerManager.createTypeError(GameName, "Embed options must be an object.");
			}

			try {
				const color = DiscordJS.resolveColor(options.embed.color);
				if (!color) return this._LoggerManager.createError(GameName, "Embed Color does not exist.");
			} catch {
				return this._LoggerManager.createError(GameName, "Embed Color does not exist or was invalid.");
			}

			if (options.embed.title) {
				return this.validateString(options.embed.title, GameName, "Embed title", 256);
			}

			if (options.embed.url) {
				return this.validateURL(options.embed.url, GameName, "Embed URL");
			}

			if (options.embed.author) {
				return this.validateEmbedAuthor(options.embed.author, GameName);
			}

			if (options.embed.description) {
				return this.validateString(options.embed.description, GameName, "Embed description", 4096);
			}

			if (options.embed.fields) {
				return this.validateEmbedFields(options.embed.fields, GameName);
			}

			if (options.embed.image) {
				return this.validateURL(options.embed.image, GameName, "Embed image");
			}

			if (options.embed.timestamp && !(options.embed.timestamp instanceof Date)) {
				return this._LoggerManager.createTypeError(GameName, "Embed timestamp must be a date.");
			}
		}

		this._deferContext(options.context);
	}

	/**
	 *
	 * PRIVATE HELPERS TO CHECK FOR PACKAGE UPDATES
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */

	private boxConsole(messages: string[]): void {
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
	}

	private async checkPackageUpdates(name: string): Promise<void> {
		if (!this.notifyUpdates) return;
		try {
			const execPromise = promisify(exec);
			const { stdout } = await execPromise("npm show @m3rcena/weky version");

			if (stdout.trim().toString() > weky_package.version) {
				const advertise = chalk(`Are you using ${chalk.red(name)}? Don't lose out on new features!`);

				const msg = chalk(`New ${chalk.green("version")} of ${chalk.yellow("@m3rcena/weky")} is available!`);

				const msg2 = chalk(`${chalk.red(weky_package.version)} -> ${chalk.green(stdout.trim().toString())}`);
				const tip = chalk(`Registry: ${chalk.cyan("https://www.npmjs.com/package/@m3rcena/weky")}`);

				const install = chalk(`Run ${chalk.green(`npm i @m3rcena/weky@${stdout.trim().toString()}`)} to update!`);

				this.boxConsole([advertise, msg, msg2, tip, install]);
			}
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 *
	 * CONTEXT BASED PRIVATE HELPERS
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */

	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _deferContext(context: DiscordJS.Context): void {
		if (!context.isChatInputCommand) return;

		context.deferReply().then(() => {
			context.deleteReply();
		});
	}

	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _getContextUserID(context: DiscordJS.Context): string {
		return context.author?.id || context.user?.id || context.member?.id;
	}

	/**
	 *
	 * External Functions used in Minigames
	 *
	 */

	/**
	 *
	 * Get a Random String
	 *
	 * @param length How big you want the string to be (It doesn't include "weky_")
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */
	public getRandomString(length: number) {
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
	}

	/**
	 *
	 * Convert a time into a String
	 *
	 * @param time The time you want to convert
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */
	public convertTime(time: number): string {
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
	}

	/**
	 *
	 * Shuffles all string chars to a random string
	 *
	 * @param string The string you want to shuffle
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */
	public shuffleString(string: string): string {
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
	}

	/**
	 *
	 * Shuffles an array
	 *
	 * @param array The array you want to shuffle
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */
	public shuffleArray<T>(array: T[]): T[] {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}

	/**
	 *
	 * PRIVATE HELPERS FOR CALCULATOR BUTTONS
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */
	private getButtonStyle(label: string): DiscordJS.ButtonStyle {
		if (DANGER_KEYS.has(label)) return DiscordJS.ButtonStyle.Danger;
		if (SUCCESS_KEYS.has(label)) return DiscordJS.ButtonStyle.Success;
		if (PRIMARY_KEYS.has(label)) return DiscordJS.ButtonStyle.Primary;
		return DiscordJS.ButtonStyle.Secondary;
	}

	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _createButton(label: string, disabled: boolean): DiscordJS.ButtonBuilder {
		const style = this.getButtonStyle(label);
		const isSpacer = label === "\u200b";

		const btn = new DiscordJS.ButtonBuilder()
			.setLabel(label)
			.setStyle(style)
			.setCustomId(isSpacer ? this.getRandomString(10) : "cal" + label);

		if (disabled || isSpacer) {
			btn.setDisabled(true);
		}

		return btn;
	}

	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _createDisabledButton(label: string, lock: boolean): DiscordJS.ButtonBuilder {
		const style = this.getButtonStyle(label);
		const isSpacer = label === "\u200b";

		const btn = new DiscordJS.ButtonBuilder()
			.setLabel(label)
			.setStyle(style)
			.setCustomId(isSpacer ? this.getRandomString(10) : "cal" + label);

		if (isSpacer || lock || DISABLED_ON_LOCK.has(label)) {
			btn.setDisabled(true);
		}

		return btn;
	}

	/**
	 *
	 * PRIVATE HELPERS FOR EMBEDS
	 *
	 * @copyright All rights reservered. M3rcena Development
	 */

	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _createEmbed(embedOptions: Embeds, noFields: boolean = false): DiscordJS.EmbedBuilder {
		const embed = new DiscordJS.EmbedBuilder()
			.setTitle(embedOptions.title || null)
			.setDescription(embedOptions.description || null)
			.setColor((embedOptions.color as DiscordJS.ColorResolvable) || "Blurple")
			.setURL(embedOptions.url || null)
			.setThumbnail(embedOptions.thumbnail || null)
			.setImage(embedOptions.image || null)
			.setFooter(embedOptions.footer || defaultFooter);

		if (embedOptions.timestamp) {
			embed.setTimestamp(embedOptions.timestamp === true ? new Date() : embedOptions.timestamp);
		}

		if (embedOptions.author) {
			embed.setAuthor({
				name: embedOptions.author.name,
				iconURL: embedOptions.author.icon_url || undefined,
				url: embedOptions.author.url || undefined,
			});
		}

		if (!noFields && embedOptions.fields && embedOptions.fields.length > 0) {
			embed.setFields(embedOptions.fields);
		}

		return embed;
	}

	/**
	 *
	 * @internal
	 * This is for internal use by minigames only. Do not use this manually.
	 *
	 */
	public _createErrorEmbed(type: string, errorMessage?: string): DiscordJS.EmbedBuilder {
		return new DiscordJS.EmbedBuilder()
			.setTitle(`${type.toUpperCase()} ERROR`)
			.setColor("Red")
			.setTimestamp()
			.setDescription(errorMessage ? errorMessage : "An unexpected error occurred.")
			.setFooter({ text: "If unexpected please report this to the developer." });
	}
}
