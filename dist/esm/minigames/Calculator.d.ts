import { Interaction } from "discord.js";
import type { CalcTypes, CustomOptions, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * Advanced Scientific Calculator Minigame.
 * Features a dual-message UI with support for complex mathematical operations via Math.js.
 * @implements {IMinigame}
 */
export default class Calculator implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private msg1;
    private msg2;
    private timeoutTimer;
    private currentExpression;
    private lastAnswer;
    private isFinished;
    private hasCalculated;
    private isGameActive;
    private accentColor;
    private MODAL_OPERATIONS;
    /**
     * Initializes the Calculator game instance.
     * Configures the operation maps for modal inputs (sin, cos, log, etc) and sets UI preferences.
     * @param weky - The WekyManager instance.
     * @param options - Custom configuration for the calculator (appearance, labels, error messages).
     */
    constructor(weky: WekyManager, options: CustomOptions<CalcTypes>);
    /**
     * Launches the game session.
     * Deploys the dual-message UI (Main Keys and Secondary Keys), registers event listeners,
     * and initializes the inactivity timer.
     */
    start(): Promise<void>;
    /**
     * Central event handler for the calculator.
     * Processes button clicks, routes modal triggers for complex operations, handles
     * specific calculator functions (AC, DEL, EQ), and updates the display.
     * @param interaction - The received Discord Interaction.
     */
    onInteraction(interaction: Interaction): Promise<void | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Resets the session inactivity timer.
     * Automatically ends the game if no interaction occurs within 5 minutes.
     * @private
     */
    private resetTimeout;
    /**
     * Concludes the game session.
     * Unregisters listeners, cleans up memory, and updates the UI to show the session ended state.
     * @private
     */
    private endGame;
    /**
     * Refreshes the Discord messages to reflect the current calculator state.
     * Updates both the primary (Msg1) and secondary (Msg2) keypads.
     * @param forceEmpty - If true, forces the display to appear empty (used during resets).
     * @private
     */
    private updateUI;
    /**
     * Safe wrapper around the Math.js evaluation engine.
     * Validates results against constraints (NaN, Infinity, Magnitude limits).
     * @param input - The mathematical expression string to evaluate.
     * @returns {CalculationResult} An object containing the computed result or an error message.
     * @private
     */
    private calculateResult;
    /**
     * Manages the Modal interaction flow for operations requiring specific numeric input (e.g., sin(x), log(x)).
     * @param interaction - The button interaction that triggered the modal.
     * @param config - Configuration metadata for the specific mathematical operation.
     * @returns {Promise<string | null>} The user's input string, or null if the interaction failed/timed out.
     * @private
     */
    private handleModal;
    /**
     * Formats the current expression into a Discord Markdown code block.
     * @returns {string} The formatted display string.
     * @private
     */
    private getDisplay;
    /**
     * Constructs the visual container and button rows for the calculator interface.
     * Handles button disabling logic based on game state (e.g., preventing invalid start keys).
     * @param keys - Array of button keys to render in this container.
     * @param forceEmpty - Whether to treat the display as empty for button logic.
     * @returns {ContainerBuilder} The constructed container with action rows.
     * @private
     */
    private buildRows;
}
