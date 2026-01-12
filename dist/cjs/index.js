"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WekyManager = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const util_1 = require("util");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const child_process_1 = require("child_process");
const string_width_1 = tslib_1.__importDefault(require("string-width"));
const crypto_1 = require("crypto");
const NetworkManager_js_1 = require("./handlers/NetworkManager.js");
const LoggerManager_js_1 = require("./handlers/LoggerManager.js");
const package_json_1 = tslib_1.__importDefault(require("../package.json"));
/**
 *
 * Minigames Imports
 *
 */
const _2024_js_1 = tslib_1.__importDefault(require("./minigames/2024.js"));
const Calculator_js_1 = tslib_1.__importDefault(require("./minigames/Calculator.js"));
const ChaosWords_js_1 = tslib_1.__importDefault(require("./minigames/ChaosWords.js"));
const FastType_js_1 = tslib_1.__importDefault(require("./minigames/FastType.js"));
const Fight_js_1 = tslib_1.__importDefault(require("./minigames/Fight.js"));
const GuessTheNumber_js_1 = tslib_1.__importDefault(require("./minigames/GuessTheNumber.js"));
const GuessThePokemon_js_1 = tslib_1.__importDefault(require("./minigames/GuessThePokemon.js"));
const Hangman_js_1 = tslib_1.__importDefault(require("./minigames/Hangman.js"));
const LieSwatter_js_1 = tslib_1.__importDefault(require("./minigames/LieSwatter.js"));
const NeverHaveIEver_js_1 = tslib_1.__importDefault(require("./minigames/NeverHaveIEver.js"));
const QuickClick_js_1 = tslib_1.__importDefault(require("./minigames/QuickClick.js"));
const ShuffleGuess_js_1 = tslib_1.__importDefault(require("./minigames/ShuffleGuess.js"));
const Snake_js_1 = tslib_1.__importDefault(require("./minigames/Snake.js"));
const WillYouPressTheButton_js_1 = tslib_1.__importDefault(require("./minigames/WillYouPressTheButton.js"));
const WouldYouRather_js_1 = tslib_1.__importDefault(require("./minigames/WouldYouRather.js"));
/**
 *
 * CONSTANT VARIABLES USED FOR CALCULATOR UI LOGIC
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
    text: "©️ M3rcena Development",
    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png",
};
/**
 * The main manager class for the `@m3rcena/weky` package.
 * This class handles the initialization of minigames, validation of options,
 * and communication with the Weky API via the NetworkManager.
 *
 * @copyright All rights reserved. M3rcena Development
 */
class WekyManager {
    /**
     * The Discord Client instance.
     * @internal This is for internal use by minigames.
     */
    _client;
    notifyUpdates;
    isInitilized = false;
    apiKey;
    URL_PATTERN = /^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$/;
    /**
     * Handles API requests to the Weky backend.
     */
    NetworkManager;
    /**
     * Handles error and type error logging to the console.
     * @internal
     */
    _LoggerManager;
    /**
     * Initialize the WekyManager.
     * @param {DiscordJS.Client} client The Discord.js Client instance.
     * @param {string} apiKey Your Weky API Key.
     * @param {boolean} notifyUpdates Whether to log a message in the console if a new version of the package is available.
     */
    constructor(client, apiKey, notifyUpdates) {
        // TODO: Enable again after finishing testing
        // if (!(client instanceof DiscordJS.Client))
        // 	throw new TypeError(`${chalk.red("[WekyManager]")} Invalid DiscordJS Client.`);
        this._client = client;
        this.notifyUpdates = notifyUpdates;
        this.apiKey = apiKey;
        this._LoggerManager = new LoggerManager_js_1.LoggerManager();
        this.NetworkManager = new NetworkManager_js_1.NetworkManager(this._client, this._LoggerManager, this.apiKey);
    }
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
    async create2048(options) {
        this.checkPackageUpdates("2048");
        if (this.OptionsChecking(options, "2048"))
            return;
        return await (0, _2024_js_1.default)(this, options);
    }
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
    async createCalculator(options) {
        this.NetworkManager._increaseUsage("calculator");
        this.checkPackageUpdates("Calculator");
        if (this.OptionsChecking(options, "Calculator"))
            return;
        return await (0, Calculator_js_1.default)(this, options);
    }
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
    async createChaosWords(options) {
        this.NetworkManager._increaseUsage("chaosWords");
        this.checkPackageUpdates("ChaosWords");
        if (this.OptionsChecking(options, "ChaosWords"))
            return;
        return await (0, ChaosWords_js_1.default)(this, options);
    }
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
    async createFastType(options) {
        this.checkPackageUpdates("FastType");
        if (this.OptionsChecking(options, "FastType"))
            return;
        if (!this._client.options.intents.has(discord_js_1.default.GatewayIntentBits.GuildMessageTyping)) {
            const channel = options.context.channel;
            return channel.send({
                embeds: [
                    this._createErrorEmbed("Config", "The owner hasn't activated `GuildMessageTyping` intent on their bot! Please notify them."),
                ],
            });
        }
        return await (0, FastType_js_1.default)(this, options);
    }
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
    async createFight(options) {
        this.checkPackageUpdates("Fight");
        if (this.OptionsChecking(options, "Fight"))
            return;
        return await (0, Fight_js_1.default)(this, options);
    }
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
    async createGuessTheNumber(options) {
        this.NetworkManager._increaseUsage("guessTheNumber");
        this.checkPackageUpdates("GuessTheNumber");
        if (this.OptionsChecking(options, "GuessTheNumber"))
            return;
        return await (0, GuessTheNumber_js_1.default)(this, options);
    }
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
    async createGuessThePokemon(options) {
        this.NetworkManager._increaseUsage("guessThePokemon");
        this.checkPackageUpdates("GuessThePokemon");
        if (this.OptionsChecking(options, "GuessThePokemon"))
            return;
        return await (0, GuessThePokemon_js_1.default)(this, options);
    }
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
    async createHangman(options) {
        this.checkPackageUpdates("Hangman");
        if (this.OptionsChecking(options, "Hangman"))
            return;
        return await (0, Hangman_js_1.default)(this, options);
    }
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
    async createLieSwatter(options) {
        this.NetworkManager._increaseUsage("lieSwatter");
        this.checkPackageUpdates("LieSwatter");
        if (this.OptionsChecking(options, "LieSwatter"))
            return;
        return await (0, LieSwatter_js_1.default)(this, options);
    }
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
    async createNeverHaveIEver(options) {
        this.NetworkManager._increaseUsage("neverHaveIEver");
        this.checkPackageUpdates("NeverHaveIEver");
        if (this.OptionsChecking(options, "NeverHaveIEver"))
            return;
        return await (0, NeverHaveIEver_js_1.default)(this, options);
    }
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
    async createQuickClick(options) {
        this.NetworkManager._increaseUsage("quickClick");
        this.checkPackageUpdates("QuickClick");
        if (this.OptionsChecking(options, "QuickClick"))
            return;
        return await (0, QuickClick_js_1.default)(this, options);
    }
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
    async createShuffleGuess(options) {
        this.NetworkManager._increaseUsage("shuffleGuess");
        this.checkPackageUpdates("ShuffleGuess");
        if (this.OptionsChecking(options, "ShuffleGuess"))
            return;
        return await (0, ShuffleGuess_js_1.default)(this, options);
    }
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
    async createSnake(options) {
        this.checkPackageUpdates("Snake");
        if (this.OptionsChecking(options, "Snake"))
            return;
        return await (0, Snake_js_1.default)(this, options);
    }
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
    async createWillYouPressTheButton(options) {
        this.NetworkManager._increaseUsage("willYouPressTheButton");
        this.checkPackageUpdates("WillYouPressTheButton");
        if (this.OptionsChecking(options, "WillYouPressTheButton"))
            return;
        return await (0, WillYouPressTheButton_js_1.default)(this, options);
    }
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
    async createWouldYouRather(options) {
        this.NetworkManager._increaseUsage("wouldYouRather");
        this.checkPackageUpdates("WouldYouRather");
        if (this.OptionsChecking(options, "WouldYouRather"))
            return;
        return await (0, WouldYouRather_js_1.default)(this, options);
    }
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
    async getUsage() {
        if (!this.isInitilized)
            return "You can use that function once the Bot is Ready";
        return await this.NetworkManager.getUsage();
    }
    /* -------------------------------------------------------------------------- */
    /* PRIVATE VALIDATION HELPERS                        						  */
    /* -------------------------------------------------------------------------- */
    validateURL(url, gameName, context) {
        if (typeof url !== "string") {
            return this._LoggerManager.createTypeError(gameName, `${context} must be a string.`);
        }
        if (!this.URL_PATTERN.test(url)) {
            return this._LoggerManager.createError(gameName, `${context} must be a valid URL.`);
        }
    }
    validateString(value, gameName, fieldName, maxLength) {
        if (typeof value !== "string") {
            return this._LoggerManager.createTypeError(gameName, `${fieldName} must be a string.`);
        }
        if (maxLength && value.length > maxLength) {
            return this._LoggerManager.createError(gameName, `${fieldName} length must be less than ${maxLength} characters.`);
        }
    }
    validateEmbedFields(fields, gameName) {
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
            if (this.validateString(field.name, gameName, "Field name", 256))
                return true;
            if (!field.value) {
                return this._LoggerManager.createError(gameName, "No embed field value provided.");
            }
            if (this.validateString(field.value, gameName, "Field value", 1024))
                return true;
            if (field.inline !== undefined && typeof field.inline !== "boolean") {
                return this._LoggerManager.createTypeError(gameName, "Embed field inline must be a boolean.");
            }
        });
    }
    validateEmbedAuthor(author, gameName) {
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
    validateEmbed(embed, GameName) {
        if (typeof embed !== "object") {
            return this._LoggerManager.createTypeError(GameName, "Embed options must be an object.");
        }
        if (embed.color) {
            try {
                const color = discord_js_1.default.resolveColor(embed.color);
                if (!color)
                    return this._LoggerManager.createError(GameName, "Embed Color does not exist.");
            }
            catch {
                return this._LoggerManager.createError(GameName, "Embed Color does not exist or was invalid.");
            }
        }
        if (embed.title) {
            return this.validateString(embed.title, GameName, "Embed title", 256);
        }
        if (embed.url) {
            return this.validateURL(embed.url, GameName, "Embed URL");
        }
        if (embed.author) {
            return this.validateEmbedAuthor(embed.author, GameName);
        }
        if (embed.description) {
            return this.validateString(embed.description, GameName, "Embed description", 4096);
        }
        if (embed.fields) {
            return this.validateEmbedFields(embed.fields, GameName);
        }
        if (embed.image) {
            return this.validateURL(embed.image, GameName, "Embed image");
        }
        if (embed.timestamp && !(embed.timestamp instanceof Date)) {
            return this._LoggerManager.createTypeError(GameName, "Embed timestamp must be a date.");
        }
    }
    /**
     * Centralized options validator for all minigames.
     * Ensures context, guild, channel, and embed configurations are valid.
     */
    OptionsChecking(options, GameName) {
        this._deferContext(options.context);
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
        if (options.embed) {
            return this.validateEmbed(options.embed, GameName);
        }
    }
    /* -------------------------------------------------------------------------- */
    /* PACKAGE UPDATES                    							              */
    /* -------------------------------------------------------------------------- */
    boxConsole(messages) {
        let tips = [];
        let maxLen = 0;
        const defaultSpace = 4;
        const spaceWidth = (0, string_width_1.default)(" ");
        if (Array.isArray(messages)) {
            tips = Array.from(messages);
        }
        else {
            tips = [messages];
        }
        tips = [" ", ...tips, " "];
        tips = tips.map((msg) => ({ val: msg, len: (0, string_width_1.default)(msg) }));
        // @ts-ignore
        const variable = Buffer.from("UG93ZXJlZCBieSBNM3JjZW5h", "base64").toString("utf-8");
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
        const line = chalk_1.default.yellow("─".repeat(maxLen));
        console.log(chalk_1.default.yellow("┌") + line + chalk_1.default.yellow("┐"));
        for (const msg of tips) {
            console.log(chalk_1.default.yellow("│") + msg + chalk_1.default.yellow("│"));
        }
        console.log(chalk_1.default.yellow("└") + line + chalk_1.default.yellow("┘"));
    }
    async checkPackageUpdates(name) {
        if (!this.notifyUpdates)
            return;
        try {
            const execPromise = (0, util_1.promisify)(child_process_1.exec);
            const { stdout } = await execPromise("npm show @m3rcena/weky version");
            if (stdout.trim().toString() > package_json_1.default.version) {
                const advertise = (0, chalk_1.default)(`Are you using ${chalk_1.default.red(name)}? Don't lose out on new features!`);
                const msg = (0, chalk_1.default)(`New ${chalk_1.default.green("version")} of ${chalk_1.default.yellow("@m3rcena/weky")} is available!`);
                const msg2 = (0, chalk_1.default)(`${chalk_1.default.red(package_json_1.default.version)} -> ${chalk_1.default.green(stdout.trim().toString())}`);
                const tip = (0, chalk_1.default)(`Registry: ${chalk_1.default.cyan("https://www.npmjs.com/package/@m3rcena/weky")}`);
                const install = (0, chalk_1.default)(`Run ${chalk_1.default.green(`npm i @m3rcena/weky@${stdout.trim().toString()}`)} to update!`);
                this.boxConsole([advertise, msg, msg2, tip, install]);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    /* -------------------------------------------------------------------------- */
    /* CONTEXT BASED HELPERS                       							      */
    /* -------------------------------------------------------------------------- */
    /**
     * @internal Internal helper to defer the interaction if it's a Slash Command.
     */
    _deferContext(context) {
        if (!context.isChatInputCommand)
            return;
        context.deferReply().then(() => {
            context.deleteReply();
        });
    }
    /**
     * @internal Internal helper to safely get the user ID from any context (Command or Interaction).
     */
    _getContextUserID(context) {
        return context.author?.id || context.user?.id || context.member?.id;
    }
    /* -------------------------------------------------------------------------- */
    /* EXTERNAL PUBLIC UTILS   							                          */
    /* -------------------------------------------------------------------------- */
    /**
     * Generates a random string used for unique Button Custom IDs.
     * @param length The length of the random string (excluding the 'weky_' prefix).
     * @returns {string} e.g. "weky_A1B2C3D4"
     */
    getRandomString(length) {
        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const randomBytesArray = new Uint8Array(length);
        (0, crypto_1.randomBytes)(length).forEach((byte, index) => {
            randomBytesArray[index] = byte % randomChars.length;
        });
        let result = "weky_";
        for (let i = 0; i < length; i++) {
            result += randomChars.charAt(randomBytesArray[i]);
        }
        return result;
    }
    /**
     * Converts milliseconds into a human-readable string.
     * @param time Time in milliseconds.
     * @returns {string} e.g. "1 day, 2 hours, 30 minutes"
     */
    convertTime(time) {
        const absoluteSeconds = Math.floor((time / 1000) % 60);
        const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
        const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
        const absoluteDays = Math.floor(time / (1000 * 60 * 60 * 24));
        const d = absoluteDays ? (absoluteDays === 1 ? "1 day" : `${absoluteDays} days`) : null;
        const h = absoluteHours ? (absoluteHours === 1 ? "1 hour" : `${absoluteHours} hours`) : null;
        const m = absoluteMinutes ? (absoluteMinutes === 1 ? "1 minute" : `${absoluteMinutes} minutes`) : null;
        const s = absoluteSeconds ? (absoluteSeconds === 1 ? "1 second" : `${absoluteSeconds} seconds`) : null;
        const absoluteTime = [];
        if (d)
            absoluteTime.push(d);
        if (h)
            absoluteTime.push(h);
        if (m)
            absoluteTime.push(m);
        if (s)
            absoluteTime.push(s);
        return absoluteTime.join(", ");
    }
    /**
     * Shuffles the characters of a string randomly.
     * @param string The input string to shuffle.
     * @returns {string} The shuffled string.
     */
    shuffleString(string) {
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
     * Randomly shuffles the elements of an array.
     * @param array The array to shuffle.
     * @returns {T[]} The shuffled array.
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    /* -------------------------------------------------------------------------- */
    /* CALCULATOR BUTTON HELPERS            						              */
    /* -------------------------------------------------------------------------- */
    getButtonStyle(label) {
        if (DANGER_KEYS.has(label))
            return discord_js_1.default.ButtonStyle.Danger;
        if (SUCCESS_KEYS.has(label))
            return discord_js_1.default.ButtonStyle.Success;
        if (PRIMARY_KEYS.has(label))
            return discord_js_1.default.ButtonStyle.Primary;
        return discord_js_1.default.ButtonStyle.Secondary;
    }
    /**
     * @internal Creates a calculator button with the correct style based on the label.
     */
    _createButton(label, disabled) {
        const style = this.getButtonStyle(label);
        const isSpacer = label === "\u200b";
        const btn = new discord_js_1.default.ButtonBuilder()
            .setLabel(label)
            .setStyle(style)
            .setCustomId(isSpacer ? this.getRandomString(10) : "cal" + label);
        if (disabled || isSpacer) {
            btn.setDisabled(true);
        }
        return btn;
    }
    /**
     * @internal Creates a disabled calculator button (used for locked states).
     */
    _createDisabledButton(label, lock) {
        const style = this.getButtonStyle(label);
        const isSpacer = label === "\u200b";
        const btn = new discord_js_1.default.ButtonBuilder()
            .setLabel(label)
            .setStyle(style)
            .setCustomId(isSpacer ? this.getRandomString(10) : "cal" + label);
        if (isSpacer || lock || DISABLED_ON_LOCK.has(label)) {
            btn.setDisabled(true);
        }
        return btn;
    }
    /* -------------------------------------------------------------------------- */
    /* EMBED GENERATION HELPERS 						                          */
    /* -------------------------------------------------------------------------- */
    /**
     * @internal Internal helper to create a standardized Embed based on user options.
     */
    _createEmbed(embedOptions, noFields = false) {
        const embed = new discord_js_1.default.EmbedBuilder()
            .setTitle(embedOptions.title || null)
            .setDescription(embedOptions.description || null)
            .setColor(embedOptions.color || "Blurple")
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
     * @internal Internal helper to create a standardized Error Embed.
     */
    _createErrorEmbed(type, errorMessage) {
        return new discord_js_1.default.EmbedBuilder()
            .setTitle(`${type.toUpperCase()} ERROR`)
            .setColor("Red")
            .setTimestamp()
            .setDescription(errorMessage ? errorMessage : "An unexpected error occurred.")
            .setFooter({ text: "If unexpected please report this to the developer." });
    }
}
exports.WekyManager = WekyManager;
