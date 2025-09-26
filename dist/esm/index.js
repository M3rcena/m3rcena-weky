import chalk from "chalk";
import DiscordJS from "discord.js";
/**
 *
 * Interaction Minigames
 *
 */
import mini2048 from "./minigames/Interaction/2024.js";
import Calculator from "./minigames/Interaction/Calculator.js";
import ChaosWords from "./minigames/Interaction/ChaosWords.js";
import FastType from "./minigames/Interaction/FastType.js";
import Fight from "./minigames/Interaction/Fight.js";
import GuessTheNumber from "./minigames/Interaction/GuessTheNumber.js";
import GuessThePokemon from "./minigames/Interaction/GuessThePokemon.js";
import Hangman from "./minigames/Interaction/Hangman.js";
import LieSwatter from "./minigames/Interaction/LieSwatter.js";
import NeverHaveIEver from "./minigames/Interaction/NeverHaveIEver.js";
import QuickClick from "./minigames/Interaction/QuickClick.js";
import ShuffleGuess from "./minigames/Interaction/ShuffleGuess.js";
import Snake from "./minigames/Interaction/Snake.js";
import WillYouPressTheButton from "./minigames/Interaction/WillYouPressTheButton.js";
import WouldYouRather from "./minigames/Interaction/WouldYouRather.js";
/**
 *
 * Message Minigames
 *
 */
import mini2048Message from "./minigames/Message/2024.js";
import CalculatorMessage from "./minigames/Message/Calculator.js";
import ChaosWordsMessage from "./minigames/Message/ChaosWords.js";
import FastTypeMessage from "./minigames/Message/FastType.js";
import FightMessage from "./minigames/Message/Fight.js";
import GuessTheNumberMessage from "./minigames/Message/GuessTheNumber.js";
import GuessThePokemonMessage from "./minigames/Message/GuessThePokemon.js";
import HangmanMessage from "./minigames/Message/Hangman.js";
import LieSwatterMessage from "./minigames/Message/LieSwatter.js";
import NeverHaveIEverMessage from "./minigames/Message/NeverHaveIEver.js";
import QuickClickMessage from "./minigames/Message/QuickClick.js";
import ShuffleGuessMessage from "./minigames/Message/ShuffleGuess.js";
import SnakeMessage from "./minigames/Message/Snake.js";
import WillYouPressTheButtonMessage from "./minigames/Message/WillYouPressTheButton.js";
import WouldYouRatherMessage from "./minigames/Message/WouldYouRather.js";
export class WekyManager {
    client;
    constructor(client) {
        if (!(client instanceof DiscordJS.Client))
            throw new TypeError(`${chalk.red("[WekyManager]")} Invalid DiscordJS Client.`);
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
        if (options.interaction) {
            return await mini2048(options);
        }
        else if (options.message) {
            return await mini2048Message(options);
        }
    }
    ;
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
        if (options.interaction) {
            return await Calculator(options);
        }
        else if (options.message) {
            return await CalculatorMessage(options);
        }
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
        if (options.interaction) {
            return await ChaosWords(options);
        }
        else if (options.message) {
            return await ChaosWordsMessage(options);
        }
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
        if (options.interaction) {
            return await FastType(options);
        }
        else if (options.message) {
            return await FastTypeMessage(options);
        }
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createFight(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createFight(options) {
        if (options.interaction) {
            return await Fight(options);
        }
        else if (options.message) {
            return await FightMessage(options);
        }
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
        if (options.interaction) {
            return await GuessTheNumber(options);
        }
        else if (options.message) {
            return await GuessTheNumberMessage(options);
        }
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createGuessThePokemon(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createGuessThePokemon(options) {
        if (options.interaction) {
            return await GuessThePokemon(options);
        }
        else if (options.message) {
            return await GuessThePokemonMessage(options);
        }
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
        if (options.interaction) {
            return await Hangman(options);
        }
        else if (options.message) {
            return await HangmanMessage(options);
        }
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
        if (options.interaction) {
            return await LieSwatter(options);
        }
        else if (options.message) {
            return await LieSwatterMessage(options);
        }
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
        if (options.interaction) {
            return await NeverHaveIEver(options);
        }
        else if (options.message) {
            return await NeverHaveIEverMessage(options);
        }
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
        if (options.interaction) {
            return await QuickClick(options);
        }
        else if (options.message) {
            return await QuickClickMessage(options);
        }
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
        if (options.interaction) {
            return await ShuffleGuess(options);
        }
        else if (options.message) {
            return await ShuffleGuessMessage(options);
        }
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
     * import { WekyManager } from "weky";
     * import DiscordJS from "discord.js";
     *
     * const client = new DiscordJS.Client();
     *
     * const weky = new WekyManager(client);
     *
     * weky.createSnake(); // You can also pass options.
     * ```
     *
     * @copyright All rights reserved. M3rcena Development
     */
    async createSnake(options) {
        if (options.interaction) {
            return await Snake(options);
        }
        else if (options.message) {
            return await SnakeMessage(options);
        }
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
        if (options.interaction) {
            return await WillYouPressTheButton(options);
        }
        else if (options.message) {
            return await WillYouPressTheButtonMessage(options);
        }
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
        if (options.interaction) {
            return await WouldYouRather(options);
        }
        else if (options.message) {
            return await WouldYouRatherMessage(options);
        }
    }
}
;
