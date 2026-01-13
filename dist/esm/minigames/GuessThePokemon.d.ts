import { Interaction, Message } from "discord.js";
import type { CustomOptions, GuessThePokemonTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * GuessThePokemon Minigame.
 * A trivia game where players must identify a Pokémon based on its elemental types and abilities.
 * Fetches real-time data and images from the PokéAPI (Gen 1-8).
 * @implements {IMinigame}
 */
export default class GuessThePokemon implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private pokemonData;
    private gameCreatedAt;
    private gameTitle;
    private defaultColor;
    private cancelId;
    private btnText;
    private msgThink;
    private msgWin;
    private msgLose;
    private msgIncorrect;
    /**
     * Initializes the GuessThePokemon game instance.
     * Configures game settings, custom response messages (Win/Lose/Think), and initializes the unique game ID.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including time limits and custom text.
     */
    constructor(weky: WekyManager, options: CustomOptions<GuessThePokemonTypes>);
    /**
     * Begins the game session.
     * Fetches a random Pokémon (ID 1-898) from the PokéAPI, parses its attributes (Types/Abilities),
     * and displays the challenge embed. Handles API connection errors gracefully.
     */
    start(): Promise<void>;
    /**
     * Event handler for user messages.
     * Compares the user's input against the target Pokémon name (case-insensitive).
     * Triggers the win condition on a match, or updates the UI with "Wrong Guess" feedback on failure.
     * @param message - The Discord Message object.
     */
    onMessage(message: Message): Promise<void>;
    /**
     * Event handler for button interactions.
     * Manages the "Give Up" button logic to allow the player to forfeit the session immediately.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void>;
    /**
     * Concludes the game session.
     * Cleans up event listeners, stops timers, and updates the interface with the final result.
     * Reveals the answer and image if the game was won or lost.
     * @param state - The result of the game.
     * @param details - Optional metadata (e.g., time taken).
     * @private
     */
    private endGame;
    /**
     * Refreshes the game message with new state information.
     * Primarily used to display "Wrong Guess" feedback while keeping the game active.
     * @param state - The current game state.
     * @param details - Data regarding the incorrect guess.
     * @private
     */
    private updateUI;
    /**
     * Constructs the visual interface for the game.
     * Generates the Embed (displaying Types/Abilities hints), Control Buttons, and
     * attaches the Pokémon image via MediaGallery upon game completion.
     * @param state - The current game state.
     * @param data - Dynamic data for the embed (Clues, Time, Answer).
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
