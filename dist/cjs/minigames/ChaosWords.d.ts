import { Interaction, Message } from "discord.js";
import type { ChaosTypes, CustomOptions, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * ChaosWords Minigame.
 * A word-finding puzzle where players must identify specific words hidden within a randomized string of characters.
 * @implements {IMinigame}
 */
export default class ChaosWords implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private words;
    private chaosArray;
    private gameState;
    private isGameActive;
    private gameCreatedAt;
    private cancelId;
    private gameTitle;
    private defaultColor;
    private maxTries;
    private timeLimit;
    /**
     * Initializes the ChaosWords game instance.
     * Sets up game configuration, difficulty settings (max tries, time limit), and unique identifiers.
     * @param weky - The WekyManager instance.
     * @param options - Custom configuration including word list, max tries, and UI settings.
     */
    constructor(weky: WekyManager, options: CustomOptions<ChaosTypes>);
    /**
     * Starts the game session.
     * Fetches or utilizes provided words, generates the "chaos string" by mixing words with random characters,
     * sends the initial game message, and registers the global event listeners.
     */
    start(): Promise<Message<true>>;
    /**
     * Handles incoming chat messages from the player.
     * Checks if the message content matches a hidden word, updates the game state (found/remaining words),
     * tracks attempts, and determines win/loss conditions.
     * @param message - The Discord Message object.
     */
    onMessage(message: Message): Promise<void>;
    /**
     * Handles button interactions (specifically the Cancel button).
     * Verifies user identity and terminates the game if requested.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void>;
    /**
     * Concludes the game session.
     * Unregisters listeners, clears timers, removes the player from active sessions,
     * and triggers the final UI update based on the game result.
     * @param state - The final state of the game (won, lost, etc.).
     * @param details - Optional metadata like time taken to complete.
     * @private
     */
    private endGame;
    /**
     * Updates the game message to reflect the current state.
     * Re-renders the embed content, chaos string, and status feedback (correct/wrong guess).
     * @param state - The current game state to render.
     * @param details - Dynamic data for the UI (feedback messages, time, etc.).
     * @private
     */
    private updateUI;
    /**
     * Constructs the visual representation of the game.
     * Generates the "Chaos String" display, word progress counters, and status messages
     * based on the current game phase.
     * @param state - The current game state (active, won, lost, etc.).
     * @param details - Dynamic text for feedback and results.
     * @returns {ContainerBuilder} The constructed container ready for the Discord API.
     * @private
     */
    private createGameContainer;
}
