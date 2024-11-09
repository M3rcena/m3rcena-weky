import chalk from "chalk";
import DiscordJS from "discord.js";

import mini2048 from "./minigames/2048";
import Calculator from "./minigames/Calculator";
import ChaosWords from "./minigames/ChaosWords";
import FastType from "./minigames/FastType";
import GuessTheNumber from "./minigames/GuessTheNumber";
import Hangman from "./minigames/Hangman";
import LieSwatter from "./minigames/LieSwatter";
import NeverHaveIEver from "./minigames/NeverHaveIEver";
import QuickClick from "./minigames/QuickClick";
import WillYouPressTheButton from "./minigames/WillYouPressTheButton";
import WouldYouRather from "./minigames/WouldYouRather";

import type { Types2048, Calc, Chaos, FastTypeTyping, GuessTheNumberTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, WillYouPressTheButtonTypes, WouldYouRatherTypes } from "./Types/index";
export class WekyManager {
    private client: DiscordJS.Client;

    constructor(client: DiscordJS.Client) {
        if (!(client instanceof DiscordJS.Client)) throw new SyntaxError(`${chalk.red("[WekyManager]")} Invalid DiscordJS Client.`)
        this.client = client
    }

    /**
     * 
     * @param options The options for the 2048 game.
     * @returns 
     */
    async create2048(options: Types2048) {
        return await mini2048(options);
    }

    /**
     * 
     * @param options The options for the calculator game.
     * @returns
     */
    async createCalculator(options: Calc) {
        return await Calculator(options);
    }

    /**
     * 
     * @param options The options for the chaos words game.
     * @returns 
     */
    async createChaosWords(options: Chaos) {
        return await ChaosWords(options);
    }

    /**
     * 
     * @param options The options for the fast type game.
     * @returns 
     */
    async createFastType(options: FastTypeTyping) {
        return await FastType(options);
    }

    /**
     * 
     * @param options The options for the guess the number game.
     * @returns 
     */
    async createGuessTheNumber(options: GuessTheNumberTypes) {
        return await GuessTheNumber(options);
    }

    /**
     * 
     * @param options The options for the hangman game.
     * @returns 
     */
    async createHangman(options: HangmanTypes) {
        return await Hangman(options);
    }

    /**
     * 
     * @param options The options for the lie swatter game.
     * @returns 
     */
    async createLieSwatter(options: LieSwatterTypes) {
        return await LieSwatter(options);
    }

    /**
     * 
     * @param options The options for the never have i ever game.
     * @returns
     */
    async createNeverHaveIEver(options: NeverHaveIEverTypes) {
        return await NeverHaveIEver(options);
    }

    /**
     * 
     * @param options The options for the quick click game.
     * @returns 
     */
    async createQuickClick(options: QuickClickTypes) {
        return await QuickClick(options);
    }

    /**
     * 
     * @param options The options for the will you press the button game.
     * @returns
     * 
     */
    async createWillYouPressTheButton(options: WillYouPressTheButtonTypes) {
        return await WillYouPressTheButton(options);
    }

    /**
     * 
     * @param options The options for the would you rather game.
     * @returns 
     */
    async createWouldYouRather(options: WouldYouRatherTypes) {
        return await WouldYouRather(options);
    }
};