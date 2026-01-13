import DiscordJS from "discord.js";
import type { IMinigame } from "../Types/index.js";
/**
 * Manages the routing of global Discord events to active minigame instances.
 * @remarks
 * This class implements an Event Multiplexer pattern. Instead of attaching a new listener
 * to the `DiscordJS.Client` for every active game (which causes MaxListenersExceededWarning),
 * this manager listens once globally and dispatches events to the relevant active games.
 */
export declare class EventManager {
    /** The Discord Client instance. */
    private client;
    /** The registry of currently active minigames. */
    private activeGames;
    /**
     * Creates an instance of the EventManager.
     * @param client - The initialized Discord.js Client.
     */
    constructor(client: DiscordJS.Client);
    /**
     * Initializes the permanent event listeners on the Discord Client.
     * These listeners persist for the lifetime of the bot to route events.
     * @private
     */
    private initializeGlobalListeners;
    /**
     * Registers a minigame to receive global events.
     * @param game - The minigame instance implementing the {@link IMinigame} interface.
     * @remarks This method prevents duplicate registrations based on the game's `id`.
     */
    register(game: IMinigame): void;
    /**
     * Unregisters a minigame, stopping it from receiving future events.
     * @param gameId - The unique identifier of the minigame to remove.
     */
    unregister(gameId: string): void;
}
