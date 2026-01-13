import { Interaction } from "discord.js";
import type { CustomOptions, WouldYouRatherTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * WouldYouRather Minigame.
 * A social choice game where players choose between two difficult scenarios.
 * Fetches questions dynamically from an external API and displays global statistics
 * after the player makes a choice to show how their opinion compares to others.
 *
 * @implements {IMinigame}
 */
export default class WouldYouRather implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private data;
    private gameTitle;
    private defaultColor;
    private labelA;
    private labelB;
    private idA;
    private idB;
    private msgThink;
    private msgOthers;
    /**
     * Initializes the game instance.
     * Sets up unique button identifiers to prevent conflicts and applies custom configuration
     * for UI labels ("Option A", "Option B") and theme colors.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button labels and custom messages.
     */
    constructor(weky: WekyManager, options: CustomOptions<WouldYouRatherTypes>);
    /**
     * Begins the game session.
     * 1. Generates a random page offset to ensure question variety.
     * 2. Fetches a "Would You Rather" scenario from the external API (io.wyr.app).
     * 3. Parses the options and raw vote counts.
     * 4. Displays the interactive prompt to the user.
     */
    start(): Promise<void>;
    /**
     * Event handler for button interactions.
     * Captures the user's choice (Option A or Option B), validates the user identity,
     * and immediately triggers the result display phase.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Concludes the game session.
     * Calculates the vote percentages for both options based on the API data (Option Count / Total Count),
     * updates the UI to show these statistics, and visually highlights the user's choice.
     *
     * @param state - The outcome of the session.
     * @param data - The user's selection (A/B).
     * @private
     */
    private endGame;
    /**
     * Utility method to format API response strings.
     * Capitalizes the first letter of the provided text for cleaner UI presentation.
     * @param val - The string to format (can be undefined if API fails).
     * @returns {string} The capitalized string or an empty string if input is invalid.
     * @private
     */
    private capitalizeFirstLetter;
    /**
     * Constructs the visual interface.
     * Generates the Embed displaying the two scenarios.
     * In the "Result" state, it reformats the embed to display statistical data (percentages)
     * and disables the interaction buttons.
     * @param state - The current game state.
     * @param data - Dynamic data including option text and calculated stats.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
