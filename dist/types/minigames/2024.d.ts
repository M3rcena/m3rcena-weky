import { Interaction, Message } from "discord.js";
import type { CustomOptions, IMinigame, Types2048 } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * Implementation of the classic 2048 puzzle game as a Discord minigame.
 * @implements {IMinigame}
 */
export default class mini2048 implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private gameID;
    private currentScore;
    private userIcon;
    private isGameActive;
    private timeoutTimer;
    private timeLimit;
    private gameTitle;
    private defaultColor;
    private emojiUp;
    private emojiDown;
    private emojiLeft;
    private emojiRight;
    /**
     * Creates an instance of the 2048 minigame.
     * @param weky - The main WekyManager instance.
     * @param options - Configuration options for the game (embeds, emojis, time limits).
     */
    constructor(weky: WekyManager, options: CustomOptions<Types2048>);
    /**
     * Initializes the game session.
     * Checks for active sessions, generates the initial board image, sends the game message,
     * and registers the game with the EventManager.
     * @returns {Promise<void>}
     */
    start(): Promise<void>;
    /**
     * Handles incoming Discord interactions (button clicks).
     * Routes logic for game moves (up, down, left, right) or quitting.
     * @param interaction - The interaction object from Discord.
     */
    onInteraction(interaction: Interaction): Promise<void | Message<boolean> | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Resets the game inactivity timer.
     * Triggers 'timeout' end state if expired.
     * @private
     */
    private resetTimeout;
    /**
     * Concludes the game, cleans up resources, and updates the final UI message.
     * @param state - The reason for ending the game (won, gameover, quit, timeout, error).
     * @param details - Optional details such as specific error messages.
     * @private
     */
    private endGame;
    /**
     * Maps the button custom ID to the direction string expected by the game logic.
     * @param customId - The interaction custom ID.
     * @returns The direction string ("UP", "DOWN", "LEFT", "RIGHT") or empty string.
     * @private
     */
    private mapDirection;
    /**
     * Constructs the message container (Embeds/Buttons) based on the current game state.
     * @param state - The current state of the game (loading, active, won, etc).
     * @param details - Dynamic data to display (score, image attachment name, error text).
     * @returns A constructed ContainerBuilder.
     * @private
     */
    private createGameContainer;
}
