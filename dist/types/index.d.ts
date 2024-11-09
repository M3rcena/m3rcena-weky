import DiscordJS from "discord.js";
import type { Types2048, Calc, Chaos, FastTypeTyping, GuessTheNumberTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, WillYouPressTheButtonTypes, WouldYouRatherTypes } from "./Types/index";
export declare class WekyManager {
    private client;
    constructor(client: DiscordJS.Client);
    /**
     *
     * @param options The options for the 2048 game.
     * @returns
     */
    create2048(options: Types2048): Promise<DiscordJS.OmitPartialGroupDMChannel<DiscordJS.Message<boolean>>>;
    /**
     *
     * @param options The options for the calculator game.
     * @returns
     */
    createCalculator(options: Calc): Promise<void>;
    /**
     *
     * @param options The options for the chaos words game.
     * @returns
     */
    createChaosWords(options: Chaos): Promise<void>;
    /**
     *
     * @param options The options for the fast type game.
     * @returns
     */
    createFastType(options: FastTypeTyping): Promise<void>;
    /**
     *
     * @param options The options for the guess the number game.
     * @returns
     */
    createGuessTheNumber(options: GuessTheNumberTypes): Promise<any>;
    /**
     *
     * @param options The options for the hangman game.
     * @returns
     */
    createHangman(options: HangmanTypes): Promise<void>;
    /**
     *
     * @param options The options for the lie swatter game.
     * @returns
     */
    createLieSwatter(options: LieSwatterTypes): Promise<void>;
    /**
     *
     * @param options The options for the never have i ever game.
     * @returns
     */
    createNeverHaveIEver(options: NeverHaveIEverTypes): Promise<void>;
    /**
     *
     * @param options The options for the quick click game.
     * @returns
     */
    createQuickClick(options: QuickClickTypes): Promise<any>;
    /**
     *
     * @param options The options for the will you press the button game.
     * @returns
     *
     */
    createWillYouPressTheButton(options: WillYouPressTheButtonTypes): Promise<void>;
    /**
     *
     * @param options The options for the would you rather game.
     * @returns
     */
    createWouldYouRather(options: WouldYouRatherTypes): Promise<void>;
}
