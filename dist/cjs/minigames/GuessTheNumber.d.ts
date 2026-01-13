import { Interaction, Message } from "discord.js";
import type { CustomOptions, GuessTheNumberTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * GuessTheNumber Minigame.
 * A classic logic puzzle where players attempt to guess a randomly generated number.
 * Supports both **Private** (single-player) and **Public** (channel-wide) modes,
 * featuring a dynamic "High/Low" range tracking system.
 * @implements {IMinigame}
 */
export default class GuessTheNumber implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private targetNumber;
    private currentMin;
    private currentMax;
    private participants;
    private isPublic;
    private gameCreatedAt;
    private gameTitle;
    private defaultColor;
    private cancelId;
    private winMsgPublic;
    private winMsgPrivate;
    /**
     * Initializes the game instance.
     * Determines the target number, calculates the initial difficulty range,
     * and configures victory messages based on the game mode (Public vs Private).
     * @param weky - The WekyManager instance.
     * @param options - Configuration including target number, time limits, and mode settings.
     */
    constructor(weky: WekyManager, options: CustomOptions<GuessTheNumberTypes>);
    /**
     * Starts the game session.
     * Enforces concurrency limits (one public game per channel / one private game per user),
     * sends the initial interface, and begins the countdown timer.
     */
    start(): Promise<Message<true>>;
    /**
     * Core game logic handler.
     * Parses integers from chat messages, compares them against the target number,
     * dynamically narrows the "Current Range" (Min/Max), and provides "Higher/Lower" feedback.
     * @param message - The Discord Message object.
     */
    onMessage(message: Message): Promise<void>;
    /**
     * Handles button interactions (specifically "Give Up").
     * Validates the user (ensuring only the owner can cancel in private games)
     * and triggers the end-game sequence.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Concludes the game session.
     * Cleans up static registries (Public/Private locks), removes event listeners,
     * clears timers, and updates the UI with the final result.
     * @param state - The result of the game.
     * @param data - Metadata for the victory screen (Winner ID, Time taken).
     * @private
     */
    private endGame;
    /**
     * Refreshes the game message to provide feedback on the last guess.
     * Updates the embed to show "Higher" or "Lower" and displays the new valid number range.
     * @param state - The directional hint state.
     * @param data - The number that was just guessed.
     * @private
     */
    private updateUI;
    /**
     * Constructs the visual interface.
     * Generates Embeds dynamically to show the current hint range (e.g., "1 - 500"),
     * the time remaining, and the game status (Active/Won/Lost).
     * @param state - The current game state.
     * @param data - Dynamic data for populating the embed fields.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
