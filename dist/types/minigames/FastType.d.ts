import { Interaction, Message, Typing } from "discord.js";
import type { CustomOptions, FastTypeTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * FastType Minigame.
 * A competitive speed-typing test where players must transcribe a sentence accurately
 * to calculate their Words Per Minute (WPM). Includes an anti-cheat mechanism based on typing events.
 * @implements {IMinigame}
 */
export default class FastType implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private sentence;
    private hasStartedTyping;
    private gameCreatedAt;
    private cancelId;
    private timeoutTimer;
    private isGameActive;
    private gameTitle;
    private defaultColor;
    private btnText;
    private msgWin;
    private msgLose;
    private msgTimeout;
    private msgCheat;
    /**
     * Initializes the FastType game instance.
     * Sets up configuration for difficulty, custom sentences, anti-cheat messages, and UI styling.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including difficulty ('easy', 'medium', 'hard') or custom sentence.
     */
    constructor(weky: WekyManager, options: CustomOptions<FastTypeTypes>);
    /**
     * Begins the game session.
     * Fetches the challenge sentence (locally or via API), initializes the anti-cheat flag,
     * sends the initial game interface, and starts the countdown timer.
     */
    start(): Promise<void>;
    /**
     * Event handler for Discord typing indicators.
     * **Anti-Cheat Mechanism:** Verifies that the user actually triggered a typing event
     * before sending the message, preventing instant copy-paste or bot automation.
     * @param typing - The Discord Typing state.
     */
    onTypingStart(typing: Typing): void;
    /**
     * Event handler for incoming messages.
     * Compares the user's input against the target sentence.
     * Calculates WPM (assuming 5 characters per word) and time taken upon success.
     * @param message - The Discord Message object.
     */
    onMessage(message: Message): void;
    /**
     * Event handler for button interactions.
     * Manages the 'Cancel' button logic to safely abort the active session.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): void;
    /**
     * Concludes the game session.
     * Unregisters listeners, clears timeouts, removes the player from the active set,
     * and updates the UI with the final results or error state.
     * @param state - The reason for game termination.
     * @param data - Dynamic data for the results (WPM, time taken, sentence).
     * @private
     */
    private endGame;
    /**
     * Constructs the visual game interface.
     * Generates Embeds and Buttons dynamically based on the current game state
     * (e.g., displaying the sentence during 'Active', or stats during 'Won').
     * @param state - The current game state.
     * @param data - Data required to populate the embed fields.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
