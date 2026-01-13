import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";

import type { CustomOptions, GuessTheNumberTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const activePrivatePlayers = new Set<string>();
const currentPublicGames: Record<string, string> = {};

/**
 * GuessTheNumber Minigame.
 * A classic logic puzzle where players attempt to guess a randomly generated number.
 * Supports both **Private** (single-player) and **Public** (channel-wide) modes,
 * featuring a dynamic "High/Low" range tracking system.
 * @implements {IMinigame}
 */
export default class GuessTheNumber implements IMinigame {
	public id: string;
	private weky: WekyManager;
	private options: CustomOptions<GuessTheNumberTypes>;
	private context: CustomOptions<GuessTheNumberTypes>["context"];

	// Game Objects
	private gameMessage: Message | null = null;
	private timeoutTimer: NodeJS.Timeout | null = null;

	// Game State
	private isGameActive: boolean = false;
	private targetNumber: number;
	private currentMin: number = 0;
	private currentMax: number;
	private participants: string[] = [];
	private isPublic: boolean;
	private gameCreatedAt: number = 0;

	// Configs
	private gameTitle: string;
	private defaultColor: number;
	private cancelId: string;
	private winMsgPublic: string;
	private winMsgPrivate: string;

	/**
	 * Initializes the game instance.
	 * Determines the target number, calculates the initial difficulty range,
	 * and configures victory messages based on the game mode (Public vs Private).
	 * @param weky - The WekyManager instance.
	 * @param options - Configuration including target number, time limits, and mode settings.
	 */
	constructor(weky: WekyManager, options: CustomOptions<GuessTheNumberTypes>) {
		this.weky = weky;
		this.options = options;
		this.context = options.context;
		this.id = weky._getContextUserID(this.context);
		this.isPublic = options.publicGame ?? false;
		this.cancelId = `gtn_cancel_${weky.getRandomString(10)}`;

		// Initialize Number Logic
		this.targetNumber = typeof options.number === "number" ? options.number : Math.floor(Math.random() * 1000) + 1;
		this.currentMax = this.targetNumber * (Math.floor(Math.random() * 5) + 2);

		// Config Init
		this.gameTitle = options.embed?.title || "Guess The Number";
		this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;

		// Messages
		if (!options.winMessage) options.winMessage = {};
		this.winMsgPublic =
			options.winMessage.publicGame ||
			"GG! The number was **{{number}}**. <@{{winner}}> guessed it in **{{time}}**.\n\n__**Stats:**__\n**Participants:** {{totalparticipants}}";
		this.winMsgPrivate =
			options.winMessage.privateGame || "GG! The number was **{{number}}**. You guessed it in **{{time}}**.";
	}

	/**
	 * Starts the game session.
	 * Enforces concurrency limits (one public game per channel / one private game per user),
	 * sends the initial interface, and begins the countdown timer.
	 */
	public async start() {
		if (this.isPublic && currentPublicGames[this.context.guild.id]) {
			const channelId = currentPublicGames[this.context.guild.id];
			const msgTemplate =
				this.options.ongoingMessage || "A game is already running in <#{{channel}}>. Try again later!";
			const msg = msgTemplate.replace("{{channel}}", channelId);

			const errorContainer = new ContainerBuilder()
				.setAccentColor(0xff0000)
				.addTextDisplayComponents((t) => t.setContent(`## ❌ Error\n> ${msg}`));

			return this.context.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
		}

		if (!this.isPublic) {
			if (activePrivatePlayers.has(this.id)) return;
			activePrivatePlayers.add(this.id);
		} else {
			currentPublicGames[this.context.guild.id] = this.context.channel.id;
		}

		this.isGameActive = true;

		this.gameMessage = await this.context.channel.send({
			components: [this.createGameContainer("active")],
			flags: MessageFlags.IsComponentsV2,
		});

		this.weky._EventManager.register(this);
		this.gameCreatedAt = Date.now();

		const timeLimit = this.options.time || 60000;
		this.timeoutTimer = setTimeout(() => {
			if (this.isGameActive) this.endGame("lost");
		}, timeLimit);
	}

	// =========================================================================
	// EVENT ROUTER METHODS
	// =========================================================================

	/**
	 * Core game logic handler.
	 * Parses integers from chat messages, compares them against the target number,
	 * dynamically narrows the "Current Range" (Min/Max), and provides "Higher/Lower" feedback.
	 * @param message - The Discord Message object.
	 */
	public async onMessage(message: Message) {
		if (message.channelId !== this.context.channel.id) return;

		if (this.isPublic) {
			if (message.author.bot) return;
		} else {
			if (message.author.id !== this.id) return;
		}

		if (this.isPublic && !this.participants.includes(message.author.id)) {
			this.participants.push(message.author.id);
		}

		const guess = parseInt(message.content, 10);
		if (isNaN(guess)) return;

		if (message.deletable) await message.delete().catch(() => {});

		if (guess === this.targetNumber) {
			const timeTaken = this.weky.convertTime(Date.now() - this.gameCreatedAt);
			return this.endGame("won", {
				winnerId: message.author.id,
				timeTaken,
			});
		}

		let state: "higher" | "lower" = "active" as any;

		if (guess < this.targetNumber) {
			state = "higher";
			if (guess > this.currentMin) this.currentMin = guess;
		} else {
			state = "lower";
			if (guess < this.currentMax) this.currentMax = guess;
		}

		await this.updateUI(state, { guess });
	}

	/**
	 * Handles button interactions (specifically "Give Up").
	 * Validates the user (ensuring only the owner can cancel in private games)
	 * and triggers the end-game sequence.
	 * @param interaction - The Discord Interaction object.
	 */
	public async onInteraction(interaction: Interaction) {
		if (!interaction.isButton()) return;

		if (interaction.user.id !== this.id) {
			if (interaction.message.id === this.gameMessage?.id) {
				return interaction.reply({
					content: this.options.otherMessage?.replace("{{author}}", this.id) || "This is not your game!",
					flags: [MessageFlags.Ephemeral],
				});
			}
			return;
		}

		if (interaction.message.id !== this.gameMessage?.id) return;
		if (interaction.customId !== this.cancelId) return;

		await interaction.deferUpdate();
		return this.endGame("lost");
	}

	// =========================================================================
	// UI & HELPERS
	// =========================================================================

	/**
	 * Concludes the game session.
	 * Cleans up static registries (Public/Private locks), removes event listeners,
	 * clears timers, and updates the UI with the final result.
	 * @param state - The result of the game.
	 * @param data - Metadata for the victory screen (Winner ID, Time taken).
	 * @private
	 */
	private async endGame(state: "won" | "lost", data?: { winnerId?: string; timeTaken?: string }) {
		if (!this.isGameActive) return;
		this.isGameActive = false;

		if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
		this.weky._EventManager.unregister(this.id);

		if (!this.isPublic) {
			activePrivatePlayers.delete(this.id);
		} else {
			delete currentPublicGames[this.context.guild.id];
		}

		if (this.gameMessage) {
			try {
				await this.gameMessage.edit({
					components: [this.createGameContainer(state, data)],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
	}

	/**
	 * Refreshes the game message to provide feedback on the last guess.
	 * Updates the embed to show "Higher" or "Lower" and displays the new valid number range.
	 * @param state - The directional hint state.
	 * @param data - The number that was just guessed.
	 * @private
	 */
	private async updateUI(state: "active" | "higher" | "lower", data?: { guess?: number }) {
		if (!this.gameMessage) return;
		try {
			await this.gameMessage.edit({
				components: [this.createGameContainer(state, data)],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (e) {}
	}

	/**
	 * Constructs the visual interface.
	 * Generates Embeds dynamically to show the current hint range (e.g., "1 - 500"),
	 * the time remaining, and the game status (Active/Won/Lost).
	 * @param state - The current game state.
	 * @param data - Dynamic data for populating the embed fields.
	 * @returns {ContainerBuilder} The constructed container.
	 * @private
	 */
	private createGameContainer(
		state: "active" | "won" | "lost" | "higher" | "lower",
		data?: {
			guess?: number;
			winnerId?: string;
			timeTaken?: string;
		}
	): ContainerBuilder {
		const container = new ContainerBuilder();
		let content = "";

		switch (state) {
			case "active":
				container.setAccentColor(this.defaultColor);
				content = this.options.states?.active
					? this.options.states.active
							.replace("{{gameTitle}}", this.gameTitle)
							.replace("{{time}}", this.weky.convertTime(this.options.time || 60000))
							.replace("{{hintRange}}", `\`${this.currentMin}\` - \`${this.currentMax}\``)
					: `## ${this.gameTitle}\n> 🔢 I'm thinking of a number...\n> ⏳ Time: **${this.weky.convertTime(
							this.options.time || 60000
					  )}**\n\n**Hint Range:** \`${this.currentMin}\` - \`${this.currentMax}\`\nType your guess in the chat!`;
				break;

			case "higher":
				container.setAccentColor(0xfee75c); // Yellow
				content = this.options.states?.higher
					? this.options.states.higher
							.replace("{{gameTitle}}", this.gameTitle)
							.replace("{{guess}}", data?.guess?.toString() || "?")
							.replace("{{currentRange}}", `\`${this.currentMin}\` - \`${this.currentMax}\``)
					: `## ${this.gameTitle}\n> 🔼 The number is **HIGHER** than **${data?.guess}**!\n\n**Current Range:** \`${this.currentMin}\` - \`${this.currentMax}\``;
				break;

			case "lower":
				container.setAccentColor(0xe67e22); // Orange
				content = this.options.states?.lower
					? this.options.states.lower
							.replace("{{gameTitle}}", this.gameTitle)
							.replace("{{guess}}", data?.guess?.toString() || "?")
							.replace("{{currentRange}}", `\`${this.currentMin}\` - \`${this.currentMax}\``)
					: `## ${this.gameTitle}\n> 🔽 The number is **LOWER** than **${data?.guess}**!\n\n**Current Range:** \`${this.currentMin}\` - \`${this.currentMax}\``;
				break;

			case "won":
				container.setAccentColor(0x57f287); // Green
				let winText = this.isPublic ? this.winMsgPublic : this.winMsgPrivate;
				winText = winText
					.replace("{{number}}", `${this.targetNumber}`)
					.replace("{{winner}}", data?.winnerId || "")
					.replace("{{time}}", data?.timeTaken || "")
					.replace("{{totalparticipants}}", `${this.participants.length || 1}`);

				content = this.options.states?.won
					? this.options.states.won.replace("{{winText}}", winText)
					: `## 🏆 Correct!\n> ${winText}`;
				break;

			case "lost":
				container.setAccentColor(0xed4245); // Red
				const loseText = (this.options.loseMessage || "The number was **{{number}}**.").replace(
					"{{number}}",
					`${this.targetNumber}`
				);
				content = this.options.states?.lost
					? this.options.states.lost.replace("{{loseText}}", loseText)
					: `## ❌ Game Over\n> ${loseText}`;
				break;
		}

		container.addTextDisplayComponents((t) => t.setContent(content));

		if (state === "active" || state === "higher" || state === "lower") {
			const btnCancel = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(this.options.giveUpButton || "Give Up")
				.setCustomId(this.cancelId);

			container.addActionRowComponents((row) => row.setComponents(btnCancel));
		}

		return container;
	}
}
