"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WekyManager = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const _2048_1 = tslib_1.__importDefault(require("./minigames/2048.js"));
const Calculator_1 = tslib_1.__importDefault(require("./minigames/Calculator.js"));
const ChaosWords_1 = tslib_1.__importDefault(require("./minigames/ChaosWords.js"));
const FastType_1 = tslib_1.__importDefault(require("./minigames/FastType.js"));
const GuessTheNumber_1 = tslib_1.__importDefault(require("./minigames/GuessTheNumber.js"));
const Hangman_1 = tslib_1.__importDefault(require("./minigames/Hangman.js"));
const LieSwatter_1 = tslib_1.__importDefault(require("./minigames/LieSwatter.js"));
const NeverHaveIEver_1 = tslib_1.__importDefault(require("./minigames/NeverHaveIEver.js"));
const QuickClick_1 = tslib_1.__importDefault(require("./minigames/QuickClick.js"));
const WillYouPressTheButton_1 = tslib_1.__importDefault(require("./minigames/WillYouPressTheButton.js"));
const WouldYouRather_1 = tslib_1.__importDefault(require("./minigames/WouldYouRather.js"));
class WekyManager {
    client;
    constructor(client) {
        if (!(client instanceof discord_js_1.default.Client))
            throw new SyntaxError(`${chalk_1.default.red("[WekyManager]")} Invalid DiscordJS Client.`);
        this.client = client;
    }
    /**
     *
     * @param options The options for the 2048 game.
     * @returns
     */
    async create2048(options) {
        return await (0, _2048_1.default)(options);
    }
    /**
     *
     * @param options The options for the calculator game.
     * @returns
     */
    async createCalculator(options) {
        return await (0, Calculator_1.default)(options);
    }
    /**
     *
     * @param options The options for the chaos words game.
     * @returns
     */
    async createChaosWords(options) {
        return await (0, ChaosWords_1.default)(options);
    }
    /**
     *
     * @param options The options for the fast type game.
     * @returns
     */
    async createFastType(options) {
        return await (0, FastType_1.default)(options);
    }
    /**
     *
     * @param options The options for the guess the number game.
     * @returns
     */
    async createGuessTheNumber(options) {
        return await (0, GuessTheNumber_1.default)(options);
    }
    /**
     *
     * @param options The options for the hangman game.
     * @returns
     */
    async createHangman(options) {
        return await (0, Hangman_1.default)(options);
    }
    /**
     *
     * @param options The options for the lie swatter game.
     * @returns
     */
    async createLieSwatter(options) {
        return await (0, LieSwatter_1.default)(options);
    }
    /**
     *
     * @param options The options for the never have i ever game.
     * @returns
     */
    async createNeverHaveIEver(options) {
        return await (0, NeverHaveIEver_1.default)(options);
    }
    /**
     *
     * @param options The options for the quick click game.
     * @returns
     */
    async createQuickClick(options) {
        return await (0, QuickClick_1.default)(options);
    }
    /**
     *
     * @param options The options for the will you press the button game.
     * @returns
     *
     */
    async createWillYouPressTheButton(options) {
        return await (0, WillYouPressTheButton_1.default)(options);
    }
    /**
     *
     * @param options The options for the would you rather game.
     * @returns
     */
    async createWouldYouRather(options) {
        return await (0, WouldYouRather_1.default)(options);
    }
}
exports.WekyManager = WekyManager;
;
