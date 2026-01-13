import { Interaction } from "discord.js";
import type { CustomOptions, LieSwatterTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * LieSwatter Minigame.
 * A rapid-fire trivia game where the player must determine if a statement is True or False.
 * Fetches boolean-type questions dynamically from the Open Trivia Database (OpenTDB).
 * @implements {IMinigame}
 */
export default class LieSwatter implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private timeoutTimer;
    private isGameActive;
    private correctAnswer;
    private questionText;
    private gameCreatedAt;
    private gameTitle;
    private defaultColor;
    private labelTrue;
    private labelLie;
    private idTrue;
    private idLie;
    private msgThink;
    private msgWin;
    private msgLose;
    private msgOthers;
    /**
     * Initializes the LieSwatter game instance.
     * Configures unique button identifiers, custom response messages, and visual settings.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button labels and custom game messages.
     */
    constructor(weky: WekyManager, options: CustomOptions<LieSwatterTypes>);
    /**
     * Begins the game session.
     * Fetches a random boolean question from the OpenTDB API, handles HTML entity decoding
     * for the question text, and initializes the game timer.
     */
    start(): Promise<void>;
    /**
     * Event handler for button interactions.
     * Verifies user identity, compares the selected button (Truth/Lie) against the correct answer,
     * and triggers the end-game state.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Concludes the game session.
     * Cleans up event listeners and timers, calculates the final result,
     * and updates the UI to reveal the correct answer.
     * @param state - The result of the game.
     * @param extraText - Optional text to append (used for timeout explanations).
     * @private
     */
    private endGame;
    /**
     * Constructs the visual interface.
     * Generates the Embed (displaying the question) and ActionRows (True/False buttons).
     * Dynamically colors buttons (Green/Grey) to reveal the correct answer upon game completion.
     * @param state - The current game state.
     * @param text - The content to display (Question or Result message).
     * @param correctAnswer - Used to highlight the correct button at the end of the game.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
