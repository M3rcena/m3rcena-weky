import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags, Typing } from "discord.js";

import type { CustomOptions, FastTypeTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const activePlayers = new Set();

/**
 * FastType Minigame.
 * A competitive speed-typing test where players must transcribe a sentence accurately
 * to calculate their Words Per Minute (WPM). Includes an anti-cheat mechanism based on typing events.
 * @implements {IMinigame}
 */
export default class FastType implements IMinigame {
	public id: string;
	private weky: WekyManager;
	private options: CustomOptions<FastTypeTypes>;
	private context: CustomOptions<FastTypeTypes>["context"];

	// Game State
	private gameMessage: Message | null = null;
	private sentence: string = "";
	private hasStartedTyping: boolean = false;
	private gameCreatedAt: number = 0;
	private cancelId: string;
	private timeoutTimer: NodeJS.Timeout | null = null;
	private isGameActive: boolean = false;

	// Configuration constants
	private gameTitle: string;
	private defaultColor: number;
	private btnText: string;
	private msgWin: string;
	private msgLose: string;
	private msgTimeout: string;
	private msgCheat: string;

	/**
	 * Initializes the FastType game instance.
	 * Sets up configuration for difficulty, custom sentences, anti-cheat messages, and UI styling.
	 * @param weky - The WekyManager instance.
	 * @param options - Configuration including difficulty ('easy', 'medium', 'hard') or custom sentence.
	 */
	constructor(weky: WekyManager, options: CustomOptions<FastTypeTypes>) {
		this.weky = weky;
		this.options = options;
		this.context = options.context;

		this.id = weky._getContextUserID(this.context);
		this.cancelId = `ft_cancel_${weky.getRandomString(10)}`;

		// Initialize Configs
		this.gameTitle = options.embed?.title || "Fast Type";
		this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
		this.btnText = options.cancelButton || "Cancel";
		this.msgWin = options.winMessage || "You typed it in **{{time}}** with **{{wpm}} WPM**!";
		this.msgLose = options.loseMessage || "You made a typo! Better luck next time.";
		this.msgTimeout = options.timeoutMessage || "You ran out of time!";
		this.msgCheat = options.cheatMessage || "⚠️ **Anti-Cheat:** You didn't type! Copy-pasting is not allowed.";
	}

	/**
	 * Begins the game session.
	 * Fetches the challenge sentence (locally or via API), initializes the anti-cheat flag,
	 * sends the initial game interface, and starts the countdown timer.
	 */
	public async start() {
		if (activePlayers.has(this.id)) return;
		activePlayers.add(this.id);
		this.isGameActive = true;

		this.gameMessage = await this.context.channel.send({
			components: [this.createGameContainer("loading", {})],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { repliedUser: false },
		});

		this.sentence = this.options.sentence || "";
		if (this.sentence === "") {
			try {
				this.sentence = await this.weky.NetworkManager.getText(
					this.options.difficulty ? this.options.difficulty.toLowerCase() : "medium"
				);
			} catch (e) {
				return this.endGame("error", {
					errorDetails: this.options.failedFetchError ? this.options.failedFetchError : "Failed to fetch sentence.",
				});
			}
		}

		if (this.sentence.includes("Please try again!")) {
			return this.endGame("error", { errorDetails: this.sentence });
		}

		this.weky._EventManager.register(this);

		await this.gameMessage!.edit({
			components: [this.createGameContainer("active", { sentence: this.sentence })],
			flags: MessageFlags.IsComponentsV2,
		});

		this.gameCreatedAt = Date.now();
		const timeLimit = this.options.time || 60000;

		this.timeoutTimer = setTimeout(() => {
			if (this.isGameActive) {
				this.endGame("timeout", { sentence: this.sentence });
			}
		}, timeLimit);
	}

	// =========================================================================
	// EVENT MANAGER HANDLERS (Router Pattern)
	// =========================================================================

	/**
	 * Event handler for Discord typing indicators.
	 * **Anti-Cheat Mechanism:** Verifies that the user actually triggered a typing event
	 * before sending the message, preventing instant copy-paste or bot automation.
	 * @param typing - The Discord Typing state.
	 */
	public onTypingStart(typing: Typing): void {
		if (typing.channel.id === this.context.channel.id && typing.user.id === this.id) {
			this.hasStartedTyping = true;
		}
	}

	/**
	 * Event handler for incoming messages.
	 * Compares the user's input against the target sentence.
	 * Calculates WPM (assuming 5 characters per word) and time taken upon success.
	 * @param message - The Discord Message object.
	 */
	public onMessage(message: Message): void {
		if (message.channelId !== this.context.channel.id) return;
		if (message.author.id !== this.id) return;
		if (message.author.bot) return;

		const input = message.content.toLowerCase().trim();
		const target = this.sentence.toLowerCase().trim();

		if (!this.hasStartedTyping) {
			this.endGame("cheat", { sentence: this.sentence });
			return;
		}

		if (input === target) {
			const timeMs = Date.now() - this.gameCreatedAt;
			const timeTaken = this.weky.convertTime(timeMs);
			const minutes = timeMs / 1000 / 60;
			const wpm = this.sentence.length / 5 / minutes;

			this.endGame("won", {
				sentence: this.sentence,
				timeTaken,
				wpm: wpm.toFixed(2),
			});
		} else {
			this.endGame("lost", { sentence: this.sentence });
		}
	}

	/**
	 * Event handler for button interactions.
	 * Manages the 'Cancel' button logic to safely abort the active session.
	 * @param interaction - The Discord Interaction object.
	 */
	public onInteraction(interaction: Interaction): void {
		if (!interaction.isButton()) return;
		if (interaction.user.id !== this.id) return;

		if (interaction.customId === this.cancelId) {
			interaction.deferUpdate().catch(() => {});
			this.endGame("cancelled", {});
		}
	}

	// =========================================================================
	// UI & HELPERS
	// =========================================================================

	/**
	 * Concludes the game session.
	 * Unregisters listeners, clears timeouts, removes the player from the active set,
	 * and updates the UI with the final results or error state.
	 * @param state - The reason for game termination.
	 * @param data - Dynamic data for the results (WPM, time taken, sentence).
	 * @private
	 */
	private async endGame(state: "won" | "lost" | "timeout" | "cancelled" | "error" | "cheat", data: any) {
		if (!this.isGameActive) return;
		this.isGameActive = false;

		if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
		activePlayers.delete(this.id);
		this.weky._EventManager.unregister(this.id);

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
	 * Constructs the visual game interface.
	 * Generates Embeds and Buttons dynamically based on the current game state
	 * (e.g., displaying the sentence during 'Active', or stats during 'Won').
	 * @param state - The current game state.
	 * @param data - Data required to populate the embed fields.
	 * @returns {ContainerBuilder} The constructed container.
	 * @private
	 */
	private createGameContainer(
		state: "loading" | "active" | "won" | "lost" | "timeout" | "cancelled" | "error" | "cheat",
		data: {
			sentence?: string;
			wpm?: string;
			timeTaken?: string;
			errorDetails?: string;
		}
	): ContainerBuilder {
		const container = new ContainerBuilder();
		let content = "";

		switch (state) {
			case "loading":
				container.setAccentColor(this.defaultColor);
				content = this.options.states?.loading
					? this.options.states.loading.replace("{{gameTitle", this.gameTitle)
					: `## ${this.gameTitle}\n> 🔄 Preparing sentence...`;
				break;

			case "active":
				container.setAccentColor(this.defaultColor);
				content = this.options.states?.active
					? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{sentence}}", data.sentence!)
					: `## ${this.gameTitle}\n> Type the sentence below as fast as you can!\n\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "won":
				container.setAccentColor(0x57f287); // Green
				const winText = this.msgWin.replace("{{time}}", data.timeTaken || "0s").replace("{{wpm}}", data.wpm || "0");

				content = this.options.states?.won
					? this.options.states.won.replace("{{winText}}", winText).replace("{{sentence}}", data.sentence!)
					: `## 🏆 Fast Fingers!\n> ${winText}\n\n**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "lost":
				container.setAccentColor(0xed4245); // Red
				content = this.options.states?.lost
					? this.options.states.lost.replace("{{msgLose}}", this.msgLose).replace("{{sentence}}", data.sentence!)
					: `## ❌ Incorrect\n> ${this.msgLose}\n\n` + `**Correct Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "cheat":
				container.setAccentColor(0xed4245); // Red
				content = this.options.states?.cheat
					? this.options.states.cheat.replace("{{msgCheat}}", this.msgCheat).replace("{{sentence}}", data.sentence!)
					: `## ⚠️ Cheat Detected\n> ${this.msgCheat}\n\n` + `**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "timeout":
				container.setAccentColor(0xed4245); // Red
				content = this.options.states?.timeout
					? this.options.states.timeout
							.replace("{{msgTimeout}}", this.msgTimeout)
							.replace("{{sentence}}", data.sentence!)
					: `## ⏱️ Time's Up\n> ${this.msgTimeout}\n\n` + `**Sentence:**\n\`\`\`text\n${data.sentence}\n\`\`\``;
				break;

			case "cancelled":
				container.setAccentColor(0xed4245); // Red
				content = this.options.states?.cancelled
					? this.options.states.cancelled.replace("{{sentence}}", data.sentence!)
					: `## 🚫 Game Cancelled\n> You ended the game.`;
				break;

			case "error":
				container.setAccentColor(0xff0000);
				content = this.options.states?.error?.main
					? this.options.states.error?.main.replace(
							"{{error}}",
							data.errorDetails || this.options.states?.error?.details
								? this.options.states.error.details!
								: "Something went wrong."
					  )
					: `## ❌ Error\n> ${
							data.errorDetails || this.options.states?.error?.details
								? this.options.states.error.details
								: "Something went wrong."
					  }`;
				break;
		}

		container.addTextDisplayComponents((t) => t.setContent(content));

		if (state === "active") {
			const btnCancel = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel(this.btnText)
				.setCustomId(this.cancelId);
			container.addActionRowComponents((row) => row.setComponents(btnCancel));
		}

		return container;
	}
}
