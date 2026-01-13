import { Interaction, Message } from "discord.js";
import type { CustomOptions, SnakeTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * Snake Minigame.
 * A Discord-based implementation of the classic arcade game.
 * Uses an external NetworkManager to handle game state logic (movement, collisions, food)
 * and generates a dynamic image of the board for every turn.
 * [Image of snake game retro grid interface]
 * @implements {IMinigame}
 */
export default class Snake implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private timeLimit;
    private isGameActive;
    private gameID;
    private userIcon;
    private gameTitle;
    private defaultColor;
    private emojiUp;
    private emojiDown;
    private emojiLeft;
    private emojiRight;
    /**
     * Initializes the Snake game instance.
     * Configures the game title, theme colors, and directional emojis for the controller.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button emojis and custom colors.
     */
    constructor(weky: WekyManager, options: CustomOptions<SnakeTypes>);
    /**
     * Begins the game session.
     * 1. Checks for active sessions.
     * 2. Calls the API to initialize a new Snake game state.
     * 3. Fetches the initial board image.
     * 4. Sends the game interface to the channel.
     *
     */
    start(): Promise<void>;
    /**
     * Central event handler for the game loop.
     * Processes directional inputs (Up/Down/Left/Right), sends the move to the API,
     * checks for Game Over/Win conditions, and updates the board image.
     *
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | Message<boolean> | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Resets the inactivity timer.
     * Called after every valid interaction to ensure the game stays active
     * as long as the player is playing.
     * @private
     */
    private resetTimeout;
    /**
     * Concludes the game session.
     * Cleans up the database session via API, removes listeners, and displays
     * the final board state (showing where the collision occurred).
     * @param state - The reason for game termination.
     * @param details - Optional error details.
     * @private
     */
    private endGame;
    /**
     * Maps the button custom IDs to API-compatible direction strings.
     * @param customId - The ID of the clicked button.
     * @returns The direction string or empty string if invalid.
     * @private
     */
    private mapDirection;
    /**
     * Constructs the visual interface.
     * Arranges the buttons in a specific layout to mimic a D-Pad (Directional Pad)
     * using Discord ActionRows.
     *
     * @param state - The current game state.
     * @param details - Dynamic data for the embed or image.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
