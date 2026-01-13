import DiscordJS from "discord.js";

import type { IMinigame } from "../Types/index.js";

/**
 * Manages the routing of global Discord events to active minigame instances.
 * @remarks
 * This class implements an Event Multiplexer pattern. Instead of attaching a new listener
 * to the `DiscordJS.Client` for every active game (which causes MaxListenersExceededWarning),
 * this manager listens once globally and dispatches events to the relevant active games.
 */
export class EventManager {
	/** The Discord Client instance. */
	private client: DiscordJS.Client;

	/** The registry of currently active minigames. */
	private activeGames: IMinigame[] = [];

	/**
	 * Creates an instance of the EventManager.
	 * @param client - The initialized Discord.js Client.
	 */
	constructor(client: DiscordJS.Client) {
		this.client = client;
		this.initializeGlobalListeners();
	}

	/**
	 * Initializes the permanent event listeners on the Discord Client.
	 * These listeners persist for the lifetime of the bot to route events.
	 * @private
	 */
	private initializeGlobalListeners() {
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
	public register(game: IMinigame) {
		// Prevent duplicates
		if (!this.activeGames.find((g) => g.id === game.id)) {
			this.activeGames.push(game);
		}
	}

	/**
	 * Unregisters a minigame, stopping it from receiving future events.
	 * @param gameId - The unique identifier of the minigame to remove.
	 */
	public unregister(gameId: string) {
		this.activeGames = this.activeGames.filter((g) => g.id !== gameId);
	}
}
