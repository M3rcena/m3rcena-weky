import chalk from "chalk";
import DiscordJS from "discord.js";
import mini2048 from "./minigames/2048.js";
import Calculator from "./minigames/Calculator.js";
import ChaosWords from "./minigames/ChaosWords.js";
import FastType from "./minigames/FastType.js";
import GuessTheNumber from "./minigames/GuessTheNumber.js";
import Hangman from "./minigames/Hangman.js";
import LieSwatter from "./minigames/LieSwatter.js";
import NeverHaveIEver from "./minigames/NeverHaveIEver.js";
import QuickClick from "./minigames/QuickClick.js";
import ShuffleGuess from "./minigames/ShuffleGuess.js";
import WillYouPressTheButton from "./minigames/WillYouPressTheButton.js";
import WouldYouRather from "./minigames/WouldYouRather.js";
export class WekyManager {
    client;
    constructor(client) {
        if (!(client instanceof DiscordJS.Client))
            throw new SyntaxError(`${chalk.red("[WekyManager]")} Invalid DiscordJS Client.`);
        this.client = client;
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.create2048(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async create2048(options) {
        return await mini2048(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createCalculator(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createCalculator(options) {
        return await Calculator(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createChaosWords(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createChaosWords(options) {
        return await ChaosWords(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createFastType(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createFastType(options) {
        return await FastType(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createGuessTheNumber(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createGuessTheNumber(options) {
        return await GuessTheNumber(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createHangman(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createHangman(options) {
        return await Hangman(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createLieSwatter(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createLieSwatter(options) {
        return await LieSwatter(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createNeverHaveIEver(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createNeverHaveIEver(options) {
        return await NeverHaveIEver(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createQuickClick(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createQuickClick(options) {
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createShuffleGuess(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createShuffleGuess(options) {
        return await ShuffleGuess(options);
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createWillYouPressTheButton(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createWillYouPressTheButton(options) {
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createWouldYouRather(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createWouldYouRather(options) {
        return await WouldYouRather(options);
    }
}
;
