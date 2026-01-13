import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";

import type { CustomOptions, ShuffleGuessTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const activePlayers = new Set<string>();

/**
 * ShuffleGuess Minigame.
 * A word puzzle where a target word is scrambled, and the player must unscramble it
 * within a time limit. Features a "Reshuffle" button to help visualize different combinations.
 * @implements {IMinigame}
 */
export default class ShuffleGuess implements IMinigame {
	public id: string;
	private weky: WekyManager;
	private options: CustomOptions<ShuffleGuessTypes>;
	private context: CustomOptions<ShuffleGuessTypes>["context"];

	// Game Objects
	private gameMessage: Message | null = null;
	private timeoutTimer: NodeJS.Timeout | null = null;

	// Game State
	private isGameActive: boolean = false;
	private currentScramble: string = "";
	private correctWord: string = "";
	private gameCreatedAt: number = 0;

	// Configs
	private gameTitle: string;
	private defaultColor: number;
	private reshuffleId: string;
	private cancelId: string;
	private btnLabels: { reshuffle: string; cancel: string };
	private messages: { start: string; win: string; lose: string; incorrect: string };

	/**
	 * Initializes the ShuffleGuess game instance.
	 * Sets up configuration for word selection (custom or random), time limits,
	 * and customizes the "Reshuffle" and "Cancel" buttons.
	 * @param weky - The WekyManager instance.
	 * @param options - Configuration including the target word (optional) and UI text.
	 */
	constructor(weky: WekyManager, options: CustomOptions<ShuffleGuessTypes>) {
		this.weky = weky;
		this.options = options;
		this.context = options.context;
		this.id = weky._getContextUserID(this.context);

		this.reshuffleId = `shuffle_${weky.getRandomString(10)}`;
		this.cancelId = `cancel_${weky.getRandomString(10)}`;

		this.gameTitle = options.embed?.title || "Shuffle Guess";
		this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;

		this.btnLabels = {
			reshuffle: options.buttons?.reshuffle || "Reshuffle",
			cancel: options.buttons?.cancel || "Cancel",
		};

		this.messages = {
			start: options.startMessage || "The word is **{{word}}**! You have **{{time}}** to guess it.",
			win: options.winMessage || "✅ **Correct!** You guessed **{{word}}** in **{{time}}**.",
			lose: options.loseMessage || "❌ **Game Over!** The word was **{{answer}}**.",
			incorrect: options.incorrectMessage || "❌ **Wrong!** That is not the word.",
		};
	}

	/**
	 * Begins the game session.
	 * Selects a word (custom or random), scrambles the letters, displays the UI,
	 * and initializes the countdown timer.
	 */
	public async start() {
		if (activePlayers.has(this.id)) return;
		activePlayers.add(this.id);
		this.isGameActive = true;

		if (!this.options.word) {
			this.options.word = (await this.weky.NetworkManager.getRandomSentence(1))[0];
		}

		if (!this.options.time) this.options.time = 60000;
		if (isNaN(this.options.time) || this.options.time < 10000) {
			this.endGame("lost");
			return this.weky._LoggerManager.createError(
				"ShuffleGuess",
				"time must be greater than 10 Seconds (in ms i.e. 10000)"
			);
		}
		if (typeof this.options.time !== "number") {
			this.endGame("lost");
			return this.weky._LoggerManager.createError("ShuffleGuess", "Time must be a number.");
		}

		this.correctWord = this.options.word.toString();
		this.currentScramble = this.weky.shuffleString(this.correctWord);

		this.gameMessage = await this.context.channel.send({
			components: [this.createGameContainer("playing", this.currentScramble)],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { repliedUser: false },
		});

		this.weky._EventManager.register(this);
		this.gameCreatedAt = Date.now();

		this.timeoutTimer = setTimeout(() => {
			if (this.isGameActive) this.endGame("lost");
		}, this.options.time);
	}

	// =========================================================================
	// EVENT ROUTER METHODS
	// =========================================================================

	/**
	 * Event handler for user guesses.
	 * Listens for chat messages, compares them against the original word,
	 * and triggers the win condition if they match.
	 * @param message - The Discord Message object.
	 */
	public async onMessage(message: Message) {
		if (message.channelId !== this.context.channel.id) return;
		if (message.author.id !== this.id) return;
		if (message.author.bot) return;

		const guess = message.content.toLowerCase().trim();
		const target = this.correctWord.toLowerCase().trim();

		if (message.deletable) await message.delete().catch(() => {});

		if (guess === target) {
			const timeTaken = this.weky.convertTime(Date.now() - this.gameCreatedAt);
			return this.endGame("correct", { timeTaken });
		} else {
			await this.updateUI("wrong", this.messages.incorrect);
		}
	}

	/**
	 * Event handler for button interactions.
	 * Manages the "Reshuffle" (re-randomize current letters) and "Cancel" actions.
	 * @param interaction - The Discord Interaction object.
	 */
	public async onInteraction(interaction: Interaction) {
		if (!interaction.isButton()) return;

		if (interaction.user.id !== this.id) {
			if (interaction.message.id === this.gameMessage?.id) {
				return interaction.reply({
					content: this.options.othersMessage?.replace("{{author}}", this.id) || `Only <@${this.id}> can play!`,
					flags: [MessageFlags.Ephemeral],
				});
			}
			return;
		}

		if (interaction.message.id !== this.gameMessage?.id) return;

		await interaction.deferUpdate();

		if (interaction.customId === this.reshuffleId) {
			this.currentScramble = this.weky.shuffleString(this.correctWord);
			await this.updateUI("playing");
		} else if (interaction.customId === this.cancelId) {
			return this.endGame("lost");
		}
	}

	// =========================================================================
	// UI & HELPERS
	// =========================================================================

	/**
	 * Concludes the game session.
	 * Cleans up resources, unregisters listeners, and displays the final result/answer.
	 * @param state - The outcome (correct/lost).
	 * @param details - Optional metadata (time taken).
	 * @private
	 */
	private async endGame(state: "correct" | "lost", details?: { timeTaken?: string }) {
		if (!this.isGameActive) return;
		this.isGameActive = false;

		if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
		activePlayers.delete(this.id);
		this.weky._EventManager.unregister(this.id);

		let feedback = "";
		if (state === "correct") {
			feedback = this.messages.win
				.replace("{{word}}", `\`${this.correctWord}\``)
				.replace("{{time}}", details?.timeTaken || "");
		} else {
			feedback = this.messages.lose.replace("{{answer}}", `\`${this.correctWord}\``);
		}

		if (this.gameMessage) {
			try {
				await this.gameMessage.edit({
					components: [this.createGameContainer(state, this.currentScramble, feedback)],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
	}

	/**
	 * Updates the game message during active play.
	 * Used to display "Wrong Guess" feedback or update the scrambled text after a "Reshuffle".
	 * @param state - The current game state.
	 * @param feedback - Feedback text to display in the embed.
	 * @private
	 */
	private async updateUI(state: "playing" | "wrong", feedback: string = "") {
		if (!this.gameMessage) return;
		try {
			await this.gameMessage.edit({
				components: [this.createGameContainer(state, this.currentScramble, feedback)],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (e) {}
	}

	/**
	 * Constructs the visual interface.
	 * Generates the Embed showing the scrambled word and the ActionRow with control buttons.
	 * @param state - The current game state.
	 * @param scrambledWord - The current permutation of the target word.
	 * @param feedback - Optional feedback text.
	 * @returns {ContainerBuilder} The constructed container.
	 * @private
	 */
	private createGameContainer(
		state: "playing" | "correct" | "wrong" | "lost",
		scrambledWord: string,
		feedback: string = ""
	): ContainerBuilder {
		let color = 0x5865f2;
		if (state === "correct") color = 0x57f287;
		if (state === "wrong" || state === "lost") color = 0xed4245;
		if (typeof this.options.embed.color === "number" && state === "playing") color = this.defaultColor;

		const container = new ContainerBuilder().setAccentColor(color);

		let mainContent = this.gameTitle ? `## ${this.gameTitle}\n` : `## Shuffle Guess\n`;

		if (state === "playing" || state === "wrong") {
			const timeStr = this.weky.convertTime(this.options.time as number);
			const desc = this.messages.start
				.replace("{{word}}", `\`${scrambledWord.toUpperCase()}\``)
				.replace("{{time}}", timeStr);

			mainContent += `${desc}\n\n`;

			if (state === "wrong" && feedback) {
				mainContent += `> ${feedback}`;
			} else {
				mainContent += this.options.mainContent ? this.options.mainContent : `Type your guess in the chat!`;
			}
		} else if (state === "correct" || state === "lost") {
			mainContent += feedback;
		}

		container.addTextDisplayComponents((text) => text.setContent(mainContent));

		const btnReshuffle = new ButtonBuilder()
			.setLabel(this.btnLabels.reshuffle)
			.setStyle(ButtonStyle.Primary)
			.setCustomId(this.reshuffleId)
			.setDisabled(!this.isGameActive);

		const btnCancel = new ButtonBuilder()
			.setLabel(this.btnLabels.cancel)
			.setStyle(ButtonStyle.Danger)
			.setCustomId(this.cancelId)
			.setDisabled(!this.isGameActive);

		container.addActionRowComponents((row) => row.setComponents(btnReshuffle, btnCancel));

		return container;
	}
}
