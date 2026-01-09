import DiscordJS from "discord.js";

import { NetworkManager } from "./handlers/NetworkManager.js";
import { LoggerManager } from "./handlers/Logger.js";
import { checkPackageUpdates } from "./functions/functions.js";

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
} from "./Types/index.js";

export class WekyManager {
	private client: DiscordJS.Client;
	private notifyUpdates: boolean;
	private isInitilized: boolean = false;
	private apiKey: string;

	public NetworkManager: NetworkManager;
	private LoggerManager: LoggerManager;

	constructor(client: DiscordJS.Client, apiKey: string, notifyUpdates: boolean) {
		// TODO: Enable again after finishing testing
		// if (!(client instanceof DiscordJS.Client))
		// 	throw new TypeError(`${chalk.red("[WekyManager]")} Invalid DiscordJS Client.`);
		this.client = client;
		this.notifyUpdates = notifyUpdates;
		this.apiKey = apiKey;

		this.LoggerManager = new LoggerManager();
		this.NetworkManager = new NetworkManager(client, this.LoggerManager, this.apiKey);
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
		checkPackageUpdates("2048", this.notifyUpdates);
		return await mini2048(this.NetworkManager, options, this.LoggerManager);
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
		checkPackageUpdates("Calculator", this.notifyUpdates);
		return await Calculator(this.client, options, this.LoggerManager);
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
		checkPackageUpdates("ChaosWords", this.notifyUpdates);
		return await ChaosWords(options, this.LoggerManager);
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
		checkPackageUpdates("FastType", this.notifyUpdates);
		return await FastType(this.NetworkManager, options, this.LoggerManager);
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
		checkPackageUpdates("Fight", this.notifyUpdates);
		return await Fight(this.NetworkManager, options, this.LoggerManager);
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
		checkPackageUpdates("GuessTheNumber", this.notifyUpdates);
		return await GuessTheNumber(options, this.LoggerManager);
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
		checkPackageUpdates("GuessThePokemon", this.notifyUpdates);
		return await GuessThePokemon(options, this.LoggerManager);
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
		checkPackageUpdates("Hangman", this.notifyUpdates);
		return await Hangman(this.NetworkManager, options, this.LoggerManager);
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
		checkPackageUpdates("LieSwatter", this.notifyUpdates);
		return await LieSwatter(options, this.LoggerManager);
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
		checkPackageUpdates("NeverHaveIEver", this.notifyUpdates);
		return await NeverHaveIEver(this.client, options, this.LoggerManager);
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
		checkPackageUpdates("QuickClick", this.notifyUpdates);
		return await QuickClick(options);
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
		checkPackageUpdates("ShuffleGuess", this.notifyUpdates);
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
		checkPackageUpdates("Snake", this.notifyUpdates);
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
		checkPackageUpdates("WillYouPressTheButton", this.notifyUpdates);
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
		checkPackageUpdates("WouldYouRather", this.notifyUpdates);
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
}
