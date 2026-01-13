import { Interaction, Message } from "discord.js";
import type { CustomOptions, ShuffleGuessTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * ShuffleGuess Minigame.
 * A word puzzle where a target word is scrambled, and the player must unscramble it
 * within a time limit. Features a "Reshuffle" button to help visualize different combinations.
 * @implements {IMinigame}
 */
export default class ShuffleGuess implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private currentScramble;
    private correctWord;
    private gameCreatedAt;
    private gameTitle;
    private defaultColor;
    private reshuffleId;
    private cancelId;
    private btnLabels;
    private messages;
    /**
     * Initializes the ShuffleGuess game instance.
     * Sets up configuration for word selection (custom or random), time limits,
     * and customizes the "Reshuffle" and "Cancel" buttons.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including the target word (optional) and UI text.
     */
    constructor(weky: WekyManager, options: CustomOptions<ShuffleGuessTypes>);
    /**
     * Begins the game session.
     * Selects a word (custom or random), scrambles the letters, displays the UI,
     * and initializes the countdown timer.
     */
    start(): Promise<boolean>;
    /**
     * Event handler for user guesses.
     * Listens for chat messages, compares them against the original word,
     * and triggers the win condition if they match.
     * @param message - The Discord Message object.
     */
    onMessage(message: Message): Promise<void>;
    /**
     * Event handler for button interactions.
     * Manages the "Reshuffle" (re-randomize current letters) and "Cancel" actions.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Concludes the game session.
     * Cleans up resources, unregisters listeners, and displays the final result/answer.
     * @param state - The outcome (correct/lost).
     * @param details - Optional metadata (time taken).
     * @private
     */
    private endGame;
    /**
     * Updates the game message during active play.
     * Used to display "Wrong Guess" feedback or update the scrambled text after a "Reshuffle".
     * @param state - The current game state.
     * @param feedback - Feedback text to display in the embed.
     * @private
     */
    private updateUI;
    /**
     * Constructs the visual interface.
     * Generates the Embed showing the scrambled word and the ActionRow with control buttons.
     * @param state - The current game state.
     * @param scrambledWord - The current permutation of the target word.
     * @param feedback - Optional feedback text.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
