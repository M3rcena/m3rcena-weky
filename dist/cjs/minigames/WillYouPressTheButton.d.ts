import { Interaction } from "discord.js";
import type { CustomOptions, WillYouPressTheButtonTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * WillYouPressTheButton Minigame.
 * A dilemma-based social game where users are presented with a scenario (a benefit)
 * and a caveat (a consequence). Users must decide whether to "press the button"
 * and see how their choice compares to global statistics.
 * @implements {IMinigame}
 */
export default class WillYouPressTheButton implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private apiData;
    private gameTitle;
    private defaultColor;
    private labelYes;
    private labelNo;
    private idYes;
    private idNo;
    private msgThink;
    private msgOthers;
    /**
     * Initializes the game instance.
     * Configures unique button IDs, theme settings, and custom messages for the dilemma interface.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button labels and response text.
     */
    constructor(weky: WekyManager, options: CustomOptions<WillYouPressTheButtonTypes>);
    /**
     * Begins the game session.
     * Fetches a new dilemma from the Weky NetworkManager, parses the question and stats,
     * and displays the interactive prompt to the user.
     */
    start(): Promise<void>;
    /**
     * Event handler for button interactions.
     * Captures the user's decision (Yes/No), validates the user identity,
     * and proceeds to display the results comparison.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Concludes the game session.
     * Cleans up event listeners and timers.
     * Updates the UI to show the global statistics (percentage of people who agreed/disagreed)
     * alongside the user's choice.
     * @param state - The outcome of the session.
     * @param data - The user's selection (Yes/No).
     * @private
     */
    private endGame;
    /**
     * Constructs the visual interface.
     * Generates the Embed displaying the Dilemma (Question + Result) and the decision buttons.
     * Handles the visual transition from "Active" (choosing) to "Result" (showing statistics).
     * @param state - The current game state.
     * @param data - Dynamic data including the dilemma text and global stats.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
