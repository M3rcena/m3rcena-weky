import { Interaction, Message } from "discord.js";
import type { CustomOptions, FightTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
/**
 * Turn-based Combat Minigame.
 * Features a challenge system, real-time HP/Coin tracking, and an in-game shop for powerups (Shields, Damage Boosts).
 * Relies heavily on the NetworkManager for state persistence and image generation.
 * @implements {IMinigame}
 */
export default class Fight implements IMinigame {
    id: string;
    private weky;
    private options;
    private context;
    private gameMessage;
    private opponent;
    private challenger;
    private gameId;
    private timeoutTimer;
    private isGameActive;
    private phase;
    private POWERUPS;
    private btnHit;
    private btnHeal;
    private btnCancel;
    private btnAccept;
    private btnDeny;
    private msgWrongUser;
    private msgOpponentTurn;
    private msgHighHp;
    private msgLowHp;
    private defaultColor;
    /**
     * Initializes the Fight game instance.
     * Configures game mechanics, button labels, custom messages, and defines the available powerups.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including opponent data, UI colors, and custom text.
     */
    constructor(weky: WekyManager, options: CustomOptions<FightTypes>);
    /**
     * Initiates the challenge sequence.
     * Validates opponent availability, generates the visual challenge card, and prompts
     * the target user to accept or deny the duel.
     */
    start(): Promise<boolean | Message<true>>;
    /**
     * Central event handler for game interactions.
     * Routes actions based on the current game phase (Challenge vs Combat) and enforces
     * turn-based order to prevent out-of-turn actions.
     * @param interaction - The Discord Interaction object.
     */
    onInteraction(interaction: Interaction): Promise<void | Message<boolean> | import("discord.js").InteractionResponse<boolean>>;
    /**
     * Transitions the game from the 'Challenge' phase to the active 'Combat' phase.
     * Generates the initial battle status card and updates the UI controls.
     * @private
     */
    private startFightLoop;
    /**
     * Executes the 'Attack' action.
     * Calculates damage based on RNG and active powerups (e.g., Double Damage, Shields),
     * updates player stats, and checks for win conditions.
     * @param interaction - The button interaction.
     * @private
     */
    private handleHit;
    /**
     * Executes the 'Heal' action.
     * Restores health to the current player, respecting the maximum HP cap (100) and
     * the minimum HP requirement logic.
     * @param interaction - The button interaction.
     * @private
     */
    private handleHeal;
    /**
     * Processes the 'Surrender' action.
     * Allows a player to forfeit the match, provided their HP is above the specific threshold (anti-ragequit).
     * @param interaction - The button interaction.
     * @private
     */
    private handleSurrender;
    /**
     * Processes shop interactions.
     * Deducts coins and applies the selected status effect (Shield, Damage Boost, or Heal) to the player.
     * @param interaction - The button interaction.
     * @private
     */
    private handlePowerup;
    private handleDeny;
    /**
     * Advances the game state to the next round.
     * Updates the database turn pointer, regenerates the battle interface image, and refreshes the message.
     * @private
     */
    private nextTurn;
    /**
     * Resets the game inactivity timer.
     * Triggers 'timeout' end state if expired.
     * @private
     */
    private resetTimeout;
    /**
     * Handles game expiration logic.
     * Triggered when a player fails to act within the time limit, resulting in a timeout card generation.
     * @private
     */
    private handleTimeout;
    /**
     * Concludes the game session.
     * Cleans up database records, removes listeners, and displays the final result (Win/Loss/Timeout)
     * with the appropriate generated image.
     * @private
     */
    private endGame;
    /**
     * Constructs the dynamic UI container.
     * Generates ActionRows based on the current game state (e.g., showing 'Accept/Deny' in request phase,
     * or 'Hit/Heal/Shop' in active phase).
     * @param state - The current game state.
     * @param details - Optional details for error messages or image attachments.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    private createGameContainer;
}
