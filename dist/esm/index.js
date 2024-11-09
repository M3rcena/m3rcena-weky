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
     * @param options The options for the 2048 game.
     * @returns
     */
    async create2048(options) {
        return await mini2048(options);
    }
    /**
     *
     * @param options The options for the calculator game.
     * @returns
     */
    async createCalculator(options) {
        return await Calculator(options);
    }
    /**
     *
     * @param options The options for the chaos words game.
     * @returns
     */
    async createChaosWords(options) {
        return await ChaosWords(options);
    }
    /**
     *
     * @param options The options for the fast type game.
     * @returns
     */
    async createFastType(options) {
        return await FastType(options);
    }
    /**
     *
     * @param options The options for the guess the number game.
     * @returns
     */
    async createGuessTheNumber(options) {
        return await GuessTheNumber(options);
    }
    /**
     *
     * @param options The options for the hangman game.
     * @returns
     */
    async createHangman(options) {
        return await Hangman(options);
    }
    /**
     *
     * @param options The options for the lie swatter game.
     * @returns
     */
    async createLieSwatter(options) {
        return await LieSwatter(options);
    }
    /**
     *
     * @param options The options for the never have i ever game.
     * @returns
     */
    async createNeverHaveIEver(options) {
        return await NeverHaveIEver(options);
    }
    /**
     *
     * @param options The options for the quick click game.
     * @returns
     */
    async createQuickClick(options) {
        return await QuickClick(options);
    }
    /**
     *
     * @param options The options for the will you press the button game.
     * @returns
     *
     */
    async createWillYouPressTheButton(options) {
        return await WillYouPressTheButton(options);
    }
    /**
     *
     * @param options The options for the would you rather game.
     * @returns
     */
    async createWouldYouRather(options) {
        return await WouldYouRather(options);
    }
}
;
