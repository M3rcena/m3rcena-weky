import chalk from "chalk";
import DiscordJS from "discord.js";

/**
 * 
 * Interaction Minigames
 * 
 */
import mini2048 from "./minigames/Interaction/2024";
import Calculator from "./minigames/Interaction/Calculator";
import ChaosWords from "./minigames/Interaction/ChaosWords";
import FastType from "./minigames/Interaction/FastType";
import Fight from "./minigames/Interaction/Fight";
import GuessTheNumber from "./minigames/Interaction/GuessTheNumber";
import Hangman from "./minigames/Interaction/Hangman";
import LieSwatter from "./minigames/Interaction/LieSwatter";
import NeverHaveIEver from "./minigames/Interaction/NeverHaveIEver";
import QuickClick from "./minigames/Interaction/QuickClick";
import ShuffleGuess from "./minigames/Interaction/ShuffleGuess";
import Snake from "./minigames/Interaction/Snake";
import WillYouPressTheButton from "./minigames/Interaction/WillYouPressTheButton";
import WouldYouRather from "./minigames/Interaction/WouldYouRather";
/**
 * 
 * Message Minigames
 * 
 */
import mini2048Message from "./minigames/Message/2024";
import CalculatorMessage from "./minigames/Message/Calculator";
import ChaosWordsMessage from "./minigames/Message/ChaosWords";
import FastTypeMessage from "./minigames/Message/FastType";
import FightMessage from "./minigames/Message/Fight";
import GuessTheNumberMessage from "./minigames/Message/GuessTheNumber";
import HangmanMessage from "./minigames/Message/Hangman";
import LieSwatterMessage from "./minigames/Message/LieSwatter";
import NeverHaveIEverMessage from "./minigames/Message/NeverHaveIEver";
import QuickClickMessage from "./minigames/Message/QuickClick";
import ShuffleGuessMessage from "./minigames/Message/ShuffleGuess";
import SnakeMessage from "./minigames/Message/Snake";
import WillYouPressTheButtonMessage from "./minigames/Message/WillYouPressTheButton";
import WouldYouRatherMessage from "./minigames/Message/WouldYouRather";

import type { Types2048, CalcTypes, ChaosTypes, FastTypeTypes, FightTypes, GuessTheNumberTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, WillYouPressTheButtonTypes, WouldYouRatherTypes, ShuffleGuessTypes, SnakeTypes } from "./Types";
export class WekyManager {
    private client: DiscordJS.Client;

    constructor(client: DiscordJS.Client) {
        if (!(client instanceof DiscordJS.Client)) throw new SyntaxError(`${chalk.red("[WekyManager]")} Invalid DiscordJS Client.`)
        this.client = client
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
    async create2048(options: Types2048) {
        if (options.interaction) {
            return await mini2048(options);
        } else if (options.message) {
            return await mini2048Message(options);
        }
    };

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
    async createCalculator(options: CalcTypes) {
        if (options.interaction) {
            return await Calculator(options);
        } else if (options.message) {
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
    async createChaosWords(options: ChaosTypes) {
        if (options.interaction) {
            return await ChaosWords(options);
        } else if (options.message) {
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
    async createFastType(options: FastTypeTypes) {
        if (options.interaction) {
            return await FastType(options);
        } else if (options.message) {
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
    async createFight(options: FightTypes) {
        if (options.interaction) {
            return await Fight(options);
        } else if (options.message) {
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
    async createGuessTheNumber(options: GuessTheNumberTypes) {
        if (options.interaction) {
            return await GuessTheNumber(options);
        } else if (options.message) {
            return await GuessTheNumberMessage(options);
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
    async createHangman(options: HangmanTypes) {
        if (options.interaction) {
            return await Hangman(options);
        } else if (options.message) {
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
    async createLieSwatter(options: LieSwatterTypes) {
        if (options.interaction) {
            return await LieSwatter(options);
        } else if (options.message) {
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
    async createNeverHaveIEver(options: NeverHaveIEverTypes) {
        if (options.interaction) {
            return await NeverHaveIEver(options);
        } else if (options.message) {
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
    async createQuickClick(options: QuickClickTypes) {
        if (options.interaction) {
            return await QuickClick(options);
        } else if (options.message) {
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
    async createShuffleGuess(options: ShuffleGuessTypes) {
        if (options.interaction) {
            return await ShuffleGuess(options);
        } else if (options.message) {
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
    async createSnake(options: SnakeTypes) {
        if (options.interaction) {
            return await Snake(options);
        } else if (options.message) {
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
    async createWillYouPressTheButton(options: WillYouPressTheButtonTypes) {
        if (options.interaction) {
            return await WillYouPressTheButton(options);
        } else if (options.message) {
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
    async createWouldYouRather(options: WouldYouRatherTypes) {
        if (options.interaction) {
            return await WouldYouRather(options);
        } else if (options.message) {
            return await WouldYouRatherMessage(options);
        }
    }
};