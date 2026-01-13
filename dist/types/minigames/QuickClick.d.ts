import { Interaction, Message } from "discord.js";
import type { CustomOptions, QuickClickTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * QuickClick Minigame.
 * A reaction-based game where a 5x5 grid of disabled buttons is displayed.
 * After a random interval, one button becomes active, and the first player to click it wins.
 * @implements {IMinigame}
 */
export default class QuickClick implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private waitTimer;
    private gameTimer;
    private isGameActive;
    private buttons;
    private winningIndex;
    private gameCreatedAt;
    private winningButtonId;
    private gameTitle;
    private emoji;
    private messages;
    /**
     * Initializes the QuickClick game instance.
     * Sets up the game configuration, including the target emoji, time limits,
     * and custom victory/defeat messages.
     * @param weky - The WekyManager instance.
     * @param options - Configuration options for the game.
     */
    constructor(weky: WekyManager, options: CustomOptions<QuickClickTypes>);
    /**
     * Begins the game session.
     * Enforces concurrency limits (one game per channel/user), generates the initial
     * 5x5 grid of disabled buttons, and starts the random "waiting" timer.
     */
    start(): Promise<Message<true>>;
    /**
     * Transitions the game from "Waiting" to "Active".
     * Selects a random button from the grid, enables it, applies the target emoji,
     * and starts the reaction timer.
     * @private
     */
    private activateGame;
    /**
     * Event handler for button interactions.
     * Detects if the user clicked the correct "active" button.
     * Calculates the reaction time and triggers the win state if correct.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void>;
    /**
     * Concludes the game session.
     * Cleans up timers and active status sets. Updates the grid to reflect
     * the outcome (highlighting the correct button in green on win).
     * @param state - The final game state (won/lost).
     * @param data - Metadata for the results (winner ID, time taken).
     * @private
     */
    private endGame;
    /**
     * Constructs the visual interface.
     * Generates the Embed and the 5x5 ActionRow grid of buttons.
     * Handles the visual state changes between Waiting, Active, and Finished phases.
     * @param state - The current game state.
     * @param data - Dynamic data for the UI.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
