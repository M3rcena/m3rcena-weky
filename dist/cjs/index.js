"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WekyManager = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
/**
 *
 * Interaction Minigames
 *
 */
const _2024_1 = tslib_1.__importDefault(require("./minigames/Interaction/2024.js"));
const Calculator_1 = tslib_1.__importDefault(require("./minigames/Interaction/Calculator.js"));
const ChaosWords_1 = tslib_1.__importDefault(require("./minigames/Interaction/ChaosWords.js"));
const FastType_1 = tslib_1.__importDefault(require("./minigames/Interaction/FastType.js"));
const Fight_1 = tslib_1.__importDefault(require("./minigames/Interaction/Fight.js"));
const GuessTheNumber_1 = tslib_1.__importDefault(require("./minigames/Interaction/GuessTheNumber.js"));
const GuessThePokemon_1 = tslib_1.__importDefault(require("./minigames/Interaction/GuessThePokemon.js"));
const Hangman_1 = tslib_1.__importDefault(require("./minigames/Interaction/Hangman.js"));
const LieSwatter_1 = tslib_1.__importDefault(require("./minigames/Interaction/LieSwatter.js"));
const NeverHaveIEver_1 = tslib_1.__importDefault(require("./minigames/Interaction/NeverHaveIEver.js"));
const QuickClick_1 = tslib_1.__importDefault(require("./minigames/Interaction/QuickClick.js"));
const ShuffleGuess_1 = tslib_1.__importDefault(require("./minigames/Interaction/ShuffleGuess.js"));
const Snake_1 = tslib_1.__importDefault(require("./minigames/Interaction/Snake.js"));
const WillYouPressTheButton_1 = tslib_1.__importDefault(require("./minigames/Interaction/WillYouPressTheButton.js"));
const WouldYouRather_1 = tslib_1.__importDefault(require("./minigames/Interaction/WouldYouRather.js"));
/**
 *
 * Message Minigames
 *
 */
const _2024_2 = tslib_1.__importDefault(require("./minigames/Message/2024.js"));
const Calculator_2 = tslib_1.__importDefault(require("./minigames/Message/Calculator.js"));
const ChaosWords_2 = tslib_1.__importDefault(require("./minigames/Message/ChaosWords.js"));
const FastType_2 = tslib_1.__importDefault(require("./minigames/Message/FastType.js"));
const Fight_2 = tslib_1.__importDefault(require("./minigames/Message/Fight.js"));
const GuessTheNumber_2 = tslib_1.__importDefault(require("./minigames/Message/GuessTheNumber.js"));
const GuessThePokemon_2 = tslib_1.__importDefault(require("./minigames/Message/GuessThePokemon.js"));
const Hangman_2 = tslib_1.__importDefault(require("./minigames/Message/Hangman.js"));
const LieSwatter_2 = tslib_1.__importDefault(require("./minigames/Message/LieSwatter.js"));
const NeverHaveIEver_2 = tslib_1.__importDefault(require("./minigames/Message/NeverHaveIEver.js"));
const QuickClick_2 = tslib_1.__importDefault(require("./minigames/Message/QuickClick.js"));
const ShuffleGuess_2 = tslib_1.__importDefault(require("./minigames/Message/ShuffleGuess.js"));
const Snake_2 = tslib_1.__importDefault(require("./minigames/Message/Snake.js"));
const WillYouPressTheButton_2 = tslib_1.__importDefault(require("./minigames/Message/WillYouPressTheButton.js"));
const WouldYouRather_2 = tslib_1.__importDefault(require("./minigames/Message/WouldYouRather.js"));
class WekyManager {
    client;
    constructor(client) {
        if (!(client instanceof discord_js_1.default.Client))
            throw new TypeError(`${chalk_1.default.red("[WekyManager]")} Invalid DiscordJS Client.`);
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
            return await (0, _2024_1.default)(options);
        }
        else if (options.message) {
            return await (0, _2024_2.default)(options);
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
            return await (0, Calculator_1.default)(options);
        }
        else if (options.message) {
            return await (0, Calculator_2.default)(options);
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
            return await (0, ChaosWords_1.default)(options);
        }
        else if (options.message) {
            return await (0, ChaosWords_2.default)(options);
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
            return await (0, FastType_1.default)(options);
        }
        else if (options.message) {
            return await (0, FastType_2.default)(options);
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
            return await (0, Fight_1.default)(options);
        }
        else if (options.message) {
            return await (0, Fight_2.default)(options);
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
            return await (0, GuessTheNumber_1.default)(options);
        }
        else if (options.message) {
            return await (0, GuessTheNumber_2.default)(options);
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
            return await (0, GuessThePokemon_1.default)(options);
        }
        else if (options.message) {
            return await (0, GuessThePokemon_2.default)(options);
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
            return await (0, Hangman_1.default)(options);
        }
        else if (options.message) {
            return await (0, Hangman_2.default)(options);
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
            return await (0, LieSwatter_1.default)(options);
        }
        else if (options.message) {
            return await (0, LieSwatter_2.default)(options);
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
            return await (0, NeverHaveIEver_1.default)(options);
        }
        else if (options.message) {
            return await (0, NeverHaveIEver_2.default)(options);
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
            return await (0, QuickClick_1.default)(options);
        }
        else if (options.message) {
            return await (0, QuickClick_2.default)(options);
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
            return await (0, ShuffleGuess_1.default)(options);
        }
        else if (options.message) {
            return await (0, ShuffleGuess_2.default)(options);
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
            return await (0, Snake_1.default)(options);
        }
        else if (options.message) {
            return await (0, Snake_2.default)(options);
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
            return await (0, WillYouPressTheButton_1.default)(options);
        }
        else if (options.message) {
            return await (0, WillYouPressTheButton_2.default)(options);
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
            return await (0, WouldYouRather_1.default)(options);
        }
        else if (options.message) {
            return await (0, WouldYouRather_2.default)(options);
        }
    }
}
exports.WekyManager = WekyManager;
;
