import DiscordJS from "discord.js";
import { NetworkManager } from "./handlers/NetworkManager.js";
import { LoggerManager } from "./handlers/LoggerManager.js";
import type { Types2048, CalcTypes, ChaosTypes, FastTypeTypes, FightTypes, GuessTheNumberTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, WillYouPressTheButtonTypes, WouldYouRatherTypes, ShuffleGuessTypes, SnakeTypes, GuessThePokemonTypes, BotDataTypes, Embeds } from "./Types/index.js";
/**
 * The main manager class for the `@m3rcena/weky` package.
 * This class handles the initialization of minigames, validation of options,
 * and communication with the Weky API via the NetworkManager.
 *
 * @copyright All rights reserved. M3rcena Development
 */
export declare class WekyManager {
    /**
     * The Discord Client instance.
     * @internal This is for internal use by minigames.
     */
    _client: DiscordJS.Client;
    private notifyUpdates;
    private isInitilized;
    private apiKey;
    private URL_PATTERN;
    /**
     * Handles API requests to the Weky backend.
     */
    NetworkManager: NetworkManager;
    /**
     * Handles error and type error logging to the console.
     * @internal
     */
    _LoggerManager: LoggerManager;
    /**
     * Initialize the WekyManager.
     * @param {DiscordJS.Client} client The Discord.js Client instance.
     * @param {string} apiKey Your Weky API Key.
     * @param {boolean} notifyUpdates Whether to log a message in the console if a new version of the package is available.
     */
    constructor(client: DiscordJS.Client, apiKey: string, notifyUpdates: boolean);
    /**
     * Creates a new instance of the **2048** game.
     * Users slide tiles to combine them and reach the 2048 tile.
     *
     * @param options The configuration options for 2048.
     * @example
     * ```js
     * weky.create2048({
     * context: interaction,
     * embed: { title: '2048', color: 'Blurple' }
     * });
     * ```
     */
    create2048(options: Types2048): Promise<DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Creates a new instance of the **Calculator** utility.
     * Provides a fully functional calculator using Discord Buttons.
     *
     * @param options The configuration options for the Calculator.
     * @example
     * ```js
     * weky.createCalculator({
     * context: interaction,
     * embed: { title: 'Calculator', color: 'Blue' }
     * });
     * ```
     */
    createCalculator(options: CalcTypes): Promise<void>;
    /**
     * Creates a new instance of the **Chaos Words** game.
     * Users must unscramble a word or sentence to win.
     *
     * @param options The configuration options for Chaos Words.
     * @example
     * ```js
     * weky.createChaosWords({
     * context: interaction,
     * words: ["hello", "world"], // Optional custom words
     * maxTries: 3
     * });
     * ```
     */
    createChaosWords(options: ChaosTypes): Promise<DiscordJS.Message<true>>;
    /**
     * Creates a new instance of the **Fast Type** game.
     * Users must type a sentence faster than the time limit.
     *
     * @requires `GatewayIntentBits.GuildMessageTyping` to function correctly.
     * @param options The configuration options for Fast Type.
     * @example
     * ```js
     * weky.createFastType({
     * context: interaction,
     * sentence: "Type this fast!",
     * time: 60000
     * });
     * ```
     */
    createFastType(options: FastTypeTypes): Promise<DiscordJS.Message<true>>;
    /**
     * Creates a new instance of the **Fight** game.
     * A turn-based battle system between two users.
     *
     * @param options The configuration options for the Fight game.
     * @example
     * ```js
     * weky.createFight({
     * context: interaction,
     * opponent: targetUser,
     * embed: { title: 'Fight Arena' }
     * });
     * ```
     */
    createFight(options: FightTypes): Promise<boolean | DiscordJS.Message<true>>;
    /**
     * Creates a new instance of the **Guess The Number** game.
     * Users guess a number between a specified range.
     *
     * @param options The configuration options for Guess The Number.
     * @example
     * ```js
     * weky.createGuessTheNumber({
     * context: interaction,
     * number: 55, // Optional, randomized if not provided
     * embed: { title: 'Guess The Number' }
     * });
     * ```
     */
    createGuessTheNumber(options: GuessTheNumberTypes): Promise<DiscordJS.Message<true>>;
    /**
     * Creates a new instance of the **Guess The Pokemon** game.
     * Users must identify a Pokemon from its silhouette or image.
     *
     * @param options The configuration options for Guess The Pokemon.
     * @example
     * ```js
     * weky.createGuessThePokemon({
     * context: interaction,
     * time: 60000
     * });
     * ```
     */
    createGuessThePokemon(options: GuessThePokemonTypes): Promise<boolean | DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Creates a new instance of the **Hangman** game.
     * Users guess letters to reveal a hidden word before the hangman is drawn.
     *
     * @param options The configuration options for Hangman.
     * @example
     * ```js
     * weky.createHangman({
     * context: interaction,
     * theme: 'nature',
     * time: 60000
     * });
     * ```
     */
    createHangman(options: HangmanTypes): Promise<DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Creates a new instance of the **Lie Swatter** game.
     * Users determine if a statement is True or False.
     *
     * @param options The configuration options for Lie Swatter.
     * @example
     * ```js
     * weky.createLieSwatter({
     * context: interaction,
     * winMessage: "You won!",
     * loseMessage: "You lost!"
     * });
     * ```
     */
    createLieSwatter(options: LieSwatterTypes): Promise<boolean | DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Creates a new instance of the **Never Have I Ever** game.
     * Displays a "Never Have I Ever" statement for users to vote on.
     *
     * @param options The configuration options for Never Have I Ever.
     * @example
     * ```js
     * weky.createNeverHaveIEver({
     * context: interaction,
     * embed: { color: 'Red' }
     * });
     * ```
     */
    createNeverHaveIEver(options: NeverHaveIEverTypes): Promise<boolean | DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Creates a new instance of the **Quick Click** game.
     * Users must click the correct button faster than their opponents.
     *
     * @param options The configuration options for Quick Click.
     * @example
     * ```js
     * weky.createQuickClick({
     * context: interaction,
     * time: 10000
     * });
     * ```
     */
    createQuickClick(options: QuickClickTypes): Promise<DiscordJS.Message<true>>;
    /**
     * Creates a new instance of the **Shuffle Guess** game.
     * Users guess a word based on shuffled letters.
     *
     * @param options The configuration options for Shuffle Guess.
     * @example
     * ```js
     * weky.createShuffleGuess({
     * context: interaction,
     * word: "Discord"
     * });
     * ```
     */
    createShuffleGuess(options: ShuffleGuessTypes): Promise<boolean>;
    /**
     * Creates a new instance of the **Snake** game.
     * The classic Snake game played using Discord buttons.
     *
     * @param options The configuration options for Snake.
     * @example
     * ```js
     * weky.createSnake({
     * context: interaction,
     * emojis: { up: '🔼', down: '🔽', left: '◀️', right: '▶️' }
     * });
     * ```
     */
    createSnake(options: SnakeTypes): Promise<DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Creates a new instance of the **Will You Press The Button** game.
     * Users are presented with a dilemma and must choose to press or not.
     *
     * @param options The configuration options for Will You Press The Button.
     * @example
     * ```js
     * weky.createWillYouPressTheButton({
     * context: interaction,
     * embed: { title: 'Press the button?' }
     * });
     * ```
     */
    createWillYouPressTheButton(options: WillYouPressTheButtonTypes): Promise<DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Creates a new instance of the **Would You Rather** game.
     * Users vote between two difficult options.
     *
     * @param options The configuration options for Would You Rather.
     * @example
     * ```js
     * weky.createWouldYouRather({
     * context: interaction,
     * embed: { title: 'Would You Rather...' }
     * });
     * ```
     */
    createWouldYouRather(options: WouldYouRatherTypes): Promise<DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<true>>>;
    /**
     * Retrieves the bot's usage statistics from the API.
     * Includes data on minigames played and API requests made.
     *
     * @returns {Promise<string | BotDataTypes["usage"] | null>} The usage data object or an error string.
     * @example
     * ```js
     * const usage = await weky.getUsage();
     * console.log(usage);
     * ```
     */
    getUsage(): Promise<string | BotDataTypes["usage"] | null>;
    private validateURL;
    private validateString;
    private validateEmbedFields;
    private validateEmbedAuthor;
    /**
     * Centralized options validator for all minigames.
     * Ensures context, guild, channel, and embed configurations are valid.
     */
    private OptionsChecking;
    private boxConsole;
    private checkPackageUpdates;
    /**
     * @internal Internal helper to defer the interaction if it's a Slash Command.
     */
    _deferContext(context: DiscordJS.Context): void;
    /**
     * @internal Internal helper to safely get the user ID from any context (Command or Interaction).
     */
    _getContextUserID(context: DiscordJS.Context): string;
    /**
     * Generates a random string used for unique Button Custom IDs.
     * @param length The length of the random string (excluding the 'weky_' prefix).
     * @returns {string} e.g. "weky_A1B2C3D4"
     */
    getRandomString(length: number): string;
    /**
     * Converts milliseconds into a human-readable string.
     * @param time Time in milliseconds.
     * @returns {string} e.g. "1 day, 2 hours, 30 minutes"
     */
    convertTime(time: number): string;
    /**
     * Shuffles the characters of a string randomly.
     * @param string The input string to shuffle.
     * @returns {string} The shuffled string.
     */
    shuffleString(string: string): string;
    /**
     * Randomly shuffles the elements of an array.
     * @param array The array to shuffle.
     * @returns {T[]} The shuffled array.
     */
    shuffleArray<T>(array: T[]): T[];
    private getButtonStyle;
    /**
     * @internal Creates a calculator button with the correct style based on the label.
     */
    _createButton(label: string, disabled: boolean): DiscordJS.ButtonBuilder;
    /**
     * @internal Creates a disabled calculator button (used for locked states).
     */
    _createDisabledButton(label: string, lock: boolean): DiscordJS.ButtonBuilder;
    /**
     * @internal Internal helper to create a standardized Embed based on user options.
     */
    _createEmbed(embedOptions: Embeds, noFields?: boolean): DiscordJS.EmbedBuilder;
    /**
     * @internal Internal helper to create a standardized Error Embed.
     */
    _createErrorEmbed(type: string, errorMessage?: string): DiscordJS.EmbedBuilder;
}
