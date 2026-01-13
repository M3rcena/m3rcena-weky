import { Interaction } from "discord.js";
import type { CustomOptions, NeverHaveIEverTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * NeverHaveIEver Minigame.
 * A social party game where the bot presents a random "Never Have I Ever" statement
 * fetched from an external API. Players respond using buttons to admit or deny the statement.
 * @implements {IMinigame}
 */
export default class NeverHaveIEver implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private statement;
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
     * Generates unique interaction IDs for buttons to prevent conflicts and applies custom configuration
     * for embeds, buttons labels, and text.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button labels and custom messages.
     */
    constructor(weky: WekyManager, options: CustomOptions<NeverHaveIEverTypes>);
    /**
     * Begins the game session.
     * Fetches a random statement from the API (category: harmless), handles potential API errors,
     * and displays the interactive game message to the user.
     */
    start(): Promise<void>;
    /**
     * Event handler for button interactions.
     * Routes the "Yes" (I have done this) and "No" (I have never done this) inputs
     * to the end game logic.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Concludes the game session.
     * Cleans up event listeners, stops the timeout timer, and updates the UI
     * to reflect the user's choice (or error/timeout state).
     * @param state - The final outcome of the game.
     * @param errorMsg - Optional detail string if an error occurred.
     * @private
     */
    private endGame;
    /**
     * Constructs the visual interface.
     * Generates the Embed displaying the statement and the ActionRow containing the
     * "Yes" and "No" buttons. dynamic styling is applied based on the final selection.
     * @param state - The current game state.
     * @param statementText - The "Never Have I Ever" statement to display.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
