import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";
import { decode } from "html-entities";

import type { CustomOptions, LieSwatterTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";

interface OpenTDBResponse {
	response_code: number;
	results: {
		category: string;
		type: string;
		difficulty: string;
		question: string;
		correct_answer: string;
		incorrect_answers: string[];
	}[];
}

const activePlayers = new Set<string>();

/**
 * LieSwatter Minigame.
 * A rapid-fire trivia game where the player must determine if a statement is True or False.
 * Fetches boolean-type questions dynamically from the Open Trivia Database (OpenTDB).
 * @implements {IMinigame}
 */
export default class LieSwatter implements IMinigame {
	public id: string;
	private weky: WekyManager;
	private options: CustomOptions<LieSwatterTypes>;
	private context: CustomOptions<LieSwatterTypes>["context"];

	// Game Objects
	private gameMessage: Message | null = null;
	private timeoutTimer: NodeJS.Timeout | null = null;

	// Game State
	private isGameActive: boolean = false;
	private correctAnswer: "True" | "False" | null = null;
	private questionText: string = "";
	private gameCreatedAt: number = 0;

	// Configs
	private gameTitle: string;
	private defaultColor: number;
	private labelTrue: string;
	private labelLie: string;
	private idTrue: string;
	private idLie: string;
	private msgThink: string;
	private msgWin: string;
	private msgLose: string;
	private msgOthers: string;

	/**
	 * Initializes the LieSwatter game instance.
	 * Configures unique button identifiers, custom response messages, and visual settings.
	 * @param weky - The WekyManager instance.
	 * @param options - Configuration including button labels and custom game messages.
	 */
	constructor(weky: WekyManager, options: CustomOptions<LieSwatterTypes>) {
		this.weky = weky;
		this.options = options;
		this.context = options.context;
		this.id = weky._getContextUserID(this.context);

		// Generate unique IDs for this instance
		this.idTrue = `ls_true_${weky.getRandomString(10)}`;
		this.idLie = `ls_lie_${weky.getRandomString(10)}`;

		// Config Init
		this.gameTitle = options.embed?.title || "Lie Swatter";
		this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;

		if (!options.buttons) options.buttons = { true: "Truth", lie: "Lie" };
		this.labelTrue = options.buttons.true || "Truth";
		this.labelLie = options.buttons.lie || "Lie";
		this.msgThink = options.thinkMessage || "I am thinking...";

		// Messages
		this.msgWin =
			typeof options.winMessage === "string"
				? options.winMessage
				: "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";
		this.msgLose =
			typeof options.loseMessage === "string" ? options.loseMessage : "Better luck next time! It was a **{{answer}}**.";
		this.msgOthers =
			typeof options.othersMessage === "string" ? options.othersMessage : "Only <@{{author}}> can use the buttons!";
	}

	/**
	 * Begins the game session.
	 * Fetches a random boolean question from the OpenTDB API, handles HTML entity decoding
	 * for the question text, and initializes the game timer.
	 */
	public async start() {
		if (activePlayers.has(this.id)) return;
		activePlayers.add(this.id);
		this.isGameActive = true;

		this.gameMessage = await this.context.channel.send({
			components: [this.createGameContainer("loading", this.msgThink)],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { repliedUser: false },
		});

		try {
			const response = await fetch(`https://opentdb.com/api.php?amount=1&type=boolean`);
			const result = (await response.json()) as OpenTDBResponse;

			if (!result.results || result.results.length === 0) {
				return this.endGame("error", this.options.errors?.noResult || "API returned no results.");
			}

			const questionData = result.results[0];
			this.questionText = decode(questionData.question);
			this.correctAnswer = questionData.correct_answer as "True" | "False";
		} catch (e) {
			return this.endGame("error", this.options.errors?.failedFetch || "Failed to fetch question from API.");
		}

		this.weky._EventManager.register(this);
		this.gameCreatedAt = Date.now();

		await this.gameMessage!.edit({
			components: [this.createGameContainer("active", this.questionText)],
			flags: MessageFlags.IsComponentsV2,
		});

		const timeLimit = this.options.time || 60000;
		this.timeoutTimer = setTimeout(() => {
			if (this.isGameActive) this.endGame("timeout", this.options.timesUpMessage || "");
		}, timeLimit);
	}

	// =========================================================================
	// EVENT ROUTER METHODS
	// =========================================================================

	/**
	 * Event handler for button interactions.
	 * Verifies user identity, compares the selected button (Truth/Lie) against the correct answer,
	 * and triggers the end-game state.
	 * @param interaction - The Discord Interaction object.
	 */
	public async onInteraction(interaction: Interaction) {
		if (!interaction.isButton()) return;

		if (interaction.user.id !== this.id) {
			if (interaction.message.id === this.gameMessage?.id) {
				return interaction.reply({
					content: this.msgOthers.replace("{{author}}", this.id),
					flags: [MessageFlags.Ephemeral],
				});
			}
			return;
		}

		if (interaction.message.id !== this.gameMessage?.id) return;

		await interaction.deferUpdate();

		const chosenAnswer = interaction.customId === this.idTrue ? "True" : "False";
		const isCorrect = chosenAnswer === this.correctAnswer;

		return this.endGame(isCorrect ? "won" : "lost");
	}

	// =========================================================================
	// UI & HELPERS
	// =========================================================================

	/**
	 * Concludes the game session.
	 * Cleans up event listeners and timers, calculates the final result,
	 * and updates the UI to reveal the correct answer.
	 * @param state - The result of the game.
	 * @param extraText - Optional text to append (used for timeout explanations).
	 * @private
	 */
	private async endGame(state: "won" | "lost" | "timeout" | "error", extraText?: string) {
		if (!this.isGameActive && state !== "error") return;
		this.isGameActive = false;

		if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
		activePlayers.delete(this.id);
		this.weky._EventManager.unregister(this.id);

		const correctLabel = this.correctAnswer === "True" ? this.labelTrue : this.labelLie;
		let finalText = "";

		if (state === "won") {
			const timeTaken = this.weky.convertTime(Date.now() - this.gameCreatedAt);
			finalText = this.msgWin.replace("{{answer}}", correctLabel).replace("{{time}}", timeTaken);
		} else if (state === "lost") {
			finalText = this.msgLose.replace("{{answer}}", correctLabel);
		} else if (state === "timeout") {
			finalText = extraText
				? extraText.replace("{{correctLabel}}", correctLabel)
				: `**Time's up!**\nIt was actually **${correctLabel}**.`;
		} else if (state === "error") {
			finalText = extraText || "Unknown Error";
		}

		if (this.gameMessage) {
			try {
				await this.gameMessage.edit({
					components: [this.createGameContainer(state, finalText, this.correctAnswer || undefined)],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
	}

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
	private createGameContainer(
		state: "loading" | "active" | "won" | "lost" | "timeout" | "error",
		text: string,
		correctAnswer?: "True" | "False"
	): ContainerBuilder {
		const container = new ContainerBuilder();
		let content = "";

		switch (state) {
			case "loading":
				container.setAccentColor(this.defaultColor);
				content = this.options.states?.loading
					? this.options.states.loading.replace("{{text}}", text)
					: `## ${this.gameTitle}\n> 🔄 ${text}`;
				break;

			case "active":
				container.setAccentColor(this.defaultColor);
				content = this.options.states?.active
					? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{text}}", text)
					: `## ${this.gameTitle}\n> ${text}\n\nIs this statement **True** or a **Lie**?`;
				break;

			case "won":
				container.setAccentColor(0x57f287);
				content = this.options.states?.won
					? this.options.states.won.replace("{{gameTitle}}", this.gameTitle).replace("{{text}}", text)
					: `## ${this.gameTitle}\n> ${text}`;
				break;

			case "lost":
			case "timeout":
				container.setAccentColor(0xed4245);
				content = this.options.states?.lost
					? this.options.states.lost.replace("{{gameTitle}}", this.gameTitle).replace("{{text}}", text)
					: `## ${this.gameTitle}\n> ${text}`;
				break;

			case "error":
				container.setAccentColor(0xff0000);
				content = this.options.states?.error
					? this.options.states.error.replace("{{text}}", text)
					: `## ❌ Error\n> ${text}`;
				break;
		}

		container.addTextDisplayComponents((t) => t.setContent(content));

		if (state !== "loading" && state !== "error") {
			let styleTrue = ButtonStyle.Primary;
			let styleLie = ButtonStyle.Primary;
			let disabled = false;

			if (state !== "active") {
				disabled = true;
				if (correctAnswer === "True") {
					styleTrue = ButtonStyle.Success;
					styleLie = ButtonStyle.Secondary;
				} else {
					styleTrue = ButtonStyle.Secondary;
					styleLie = ButtonStyle.Success;
				}
			}

			const btnTrue = new ButtonBuilder()
				.setCustomId(this.idTrue)
				.setLabel(this.labelTrue)
				.setStyle(styleTrue)
				.setDisabled(disabled);

			const btnLie = new ButtonBuilder()
				.setCustomId(this.idLie)
				.setLabel(this.labelLie)
				.setStyle(styleLie)
				.setDisabled(disabled);

			container.addActionRowComponents((row) => row.setComponents(btnTrue, btnLie));
		}

		return container;
	}
}
