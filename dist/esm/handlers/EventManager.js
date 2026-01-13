/**
 * Manages the routing of global Discord events to active minigame instances.
 * @remarks
 * This class implements an Event Multiplexer pattern. Instead of attaching a new listener
 * to the `DiscordJS.Client` for every active game (which causes MaxListenersExceededWarning),
 * this manager listens once globally and dispatches events to the relevant active games.
 */
export class EventManager {
    /** The Discord Client instance. */
    client;
    /** The registry of currently active minigames. */
    activeGames = [];
    /**
     * Creates an instance of the EventManager.
     * @param client - The initialized Discord.js Client.
     */
    constructor(client) {
        this.client = client;
        this.initializeGlobalListeners();
    }
    /**
     * Initializes the permanent event listeners on the Discord Client.
     * These listeners persist for the lifetime of the bot to route events.
     * @private
     */
    initializeGlobalListeners() {
        // typingStart Listener
        this.client.on("typingStart", (typing) => {
            for (const game of this.activeGames) {
                if (game.onTypingStart) {
                    game.onTypingStart(typing);
                }
            }
        });
        // messageCreate Listener
        this.client.on("messageCreate", (message) => {
            for (const game of this.activeGames) {
                if (game.onMessage) {
                    game.onMessage(message);
                }
            }
        });
        // interactionCreate Listener
        this.client.on("interactionCreate", (interaction) => {
            for (const game of this.activeGames) {
                if (game.onInteraction) {
                    game.onInteraction(interaction);
                }
            }
        });
    }
    /**
     * Registers a minigame to receive global events.
     * @param game - The minigame instance implementing the {@link IMinigame} interface.
     * @remarks This method prevents duplicate registrations based on the game's `id`.
     */
    register(game) {
        // Prevent duplicates
        if (!this.activeGames.find((g) => g.id === game.id)) {
            this.activeGames.push(game);
        }
    }
    /**
     * Unregisters a minigame, stopping it from receiving future events.
     * @param gameId - The unique identifier of the minigame to remove.
     */
    unregister(gameId) {
        this.activeGames = this.activeGames.filter((g) => g.id !== gameId);
    }
}
