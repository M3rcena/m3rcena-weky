import DiscordJS from "discord.js";
import type { Types2048, CalcTypes, ChaosTypes, FastTypeTypes, FightTypes, GuessTheNumberTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, WillYouPressTheButtonTypes, WouldYouRatherTypes, ShuffleGuessTypes, SnakeTypes, GuessThePokemonTypes } from "./Types/index.js";
export declare class WekyManager {
    private client;
    constructor(client: DiscordJS.Client);
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
    create2048(options: Types2048): Promise<void | DiscordJS.Message<boolean>>;
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
    createCalculator(options: CalcTypes): Promise<void>;
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
    createChaosWords(options: ChaosTypes): Promise<void>;
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
    createFastType(options: FastTypeTypes): Promise<void>;
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
    createFight(options: FightTypes): Promise<DiscordJS.InteractionResponse<boolean> | DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<boolean>>>;
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
    createGuessTheNumber(options: GuessTheNumberTypes): Promise<void>;
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
    createGuessThePokemon(options: GuessThePokemonTypes): Promise<void>;
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
    createHangman(options: HangmanTypes): Promise<void>;
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
    createLieSwatter(options: LieSwatterTypes): Promise<void>;
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
    createNeverHaveIEver(options: NeverHaveIEverTypes): Promise<DiscordJS.Message<boolean>>;
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
    createQuickClick(options: QuickClickTypes): Promise<DiscordJS.InteractionResponse<boolean> | DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<boolean>>>;
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
    createShuffleGuess(options: ShuffleGuessTypes): Promise<void>;
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
    createSnake(options: SnakeTypes): Promise<void>;
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
    createWillYouPressTheButton(options: WillYouPressTheButtonTypes): Promise<void>;
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
    createWouldYouRather(options: WouldYouRatherTypes): Promise<void>;
}
