import { Interaction, Message } from "discord.js";
import type { CustomOptions, HangmanTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * Hangman Minigame.
 * A classic word-guessing game where players suggest letters to reveal a hidden word.
 * Features dynamic board image generation (drawing the stick figure) via the NetworkManager.
 * @implements {IMinigame}
 */
export default class Hangman implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private gameID;
    private finalWord;
    private userIcon;
    private gameTitle;
    private defaultColor;
    /**
     * Initializes the Hangman game instance.
     * Configures the game title, theme colors, and user identity.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including embed customization and time limits.
     */
    constructor(weky: WekyManager, options: CustomOptions<HangmanTypes>);
    /**
     * Begins the game session.
     * Requests a new game state from the backend (fetching a random word), generates the initial
     * empty board image, and deploys the game interface to the Discord channel.
     */
    start(): Promise<void>;
    /**
     * Event handler for letter guesses.
     * Validates that the input is a single alphabetical character, submits the guess to the API,
     * updates the visual board state, and checks for win/loss conditions.
     * @param message - The Discord Message object.
     */
    onMessage(message: Message): Promise<void>;
    /**
     * Event handler for letter guesses.
     * Validates that the input is a single alphabetical character, submits the guess to the API,
     * updates the visual board state, and checks for win/loss conditions.
     * @param message - The Discord Message object.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Concludes the game session.
     * Cleans up event listeners, removes the session from the database, and updates the UI
     * to reveal the hidden word and the final board state.
     * @param state - The reason for game termination (won, lost, quit, timeout).
     * @param details - Final game data (the word, the final image).
     * @param attachment - The final generated image file.
     * @private
     */
    private endGame;
    /**
     * Constructs the visual interface.
     * Generates the Embed state (showing the prompt or final result) and attaches the
     * dynamic Hangman drawing.
     * @param state - The current game state.
     * @param details - Data to populate the embed (hidden/revealed word).
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
