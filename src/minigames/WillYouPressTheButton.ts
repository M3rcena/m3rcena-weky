import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";

import type { CustomOptions, WillYouPressTheButtonTypes, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const activePlayers = new Set<string>();

interface WYPTBData {
	question: string;
	result: string;
	stats: {
		yes: { percentage: string };
		no: { percentage: string };
	};
}

/**
 * WillYouPressTheButton Minigame.
 * A dilemma-based social game where users are presented with a scenario (a benefit)
 * and a caveat (a consequence). Users must decide whether to "press the button"
 * and see how their choice compares to global statistics.
 * @implements {IMinigame}
 */
export default class WillYouPressTheButton implements IMinigame {
	public id: string;
	private weky: WekyManager;
	private options: CustomOptions<WillYouPressTheButtonTypes>;
	private context: CustomOptions<WillYouPressTheButtonTypes>["context"];

	// Game Objects
	private gameMessage: Message | null = null;
	private timeoutTimer: NodeJS.Timeout | null = null;

	// Game State
	private isGameActive: boolean = false;
	private apiData: WYPTBData | null = null;

	// Configs
	private gameTitle: string;
	private defaultColor: number;
	private labelYes: string;
	private labelNo: string;
	private idYes: string;
	private idNo: string;
	private msgThink: string;
	private msgOthers: string;

	/**
	 * Initializes the game instance.
	 * Configures unique button IDs, theme settings, and custom messages for the dilemma interface.
	 * @param weky - The WekyManager instance.
	 * @param options - Configuration including button labels and response text.
	 */
	constructor(weky: WekyManager, options: CustomOptions<WillYouPressTheButtonTypes>) {
		this.weky = weky;
		this.options = options;
		this.context = options.context;
		this.id = weky._getContextUserID(this.context);

		// Generate IDs
		this.idYes = `wyptb_yes_${weky.getRandomString(10)}`;
		this.idNo = `wyptb_no_${weky.getRandomString(10)}`;

		// Config Init
		this.gameTitle = options.embed?.title || "Will You Press The Button?";
		this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0xed4245;

		if (!options.button) options.button = {};
		this.labelYes = options.button.yes || "Yes";
		this.labelNo = options.button.no || "No";
		this.msgThink = options.thinkMessage || "Thinking...";
		this.msgOthers = options.othersMessage || "Only <@{{author}}> can use the buttons!";
	}

	/**
	 * Begins the game session.
	 * Fetches a new dilemma from the Weky NetworkManager, parses the question and stats,
	 * and displays the interactive prompt to the user.
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

		try {
			this.apiData = await this.weky.NetworkManager.getWillYouPressTheButton();
			if (!this.apiData) {
				return this.endGame("error");
			}
		} catch (e) {
			return this.endGame("error");
		}

		this.weky._EventManager.register(this);

		const qText = this.apiData.question.charAt(0).toUpperCase() + this.apiData.question.slice(1);
		const rText = this.apiData.result.charAt(0).toUpperCase() + this.apiData.result.slice(1);

		this.apiData.question = qText;
		this.apiData.result = rText;

		await this.gameMessage!.edit({
			components: [this.createGameContainer("active", { question: qText, result: rText })],
			flags: MessageFlags.IsComponentsV2,
		});

		const timeLimit = this.options.time || 60000;
		this.timeoutTimer = setTimeout(() => {
			if (this.isGameActive) this.endGame("timeout");
		}, timeLimit);
	}

	// =========================================================================
	// EVENT ROUTER METHODS
	// =========================================================================

	/**
	 * Event handler for button interactions.
	 * Captures the user's decision (Yes/No), validates the user identity,
	 * and proceeds to display the results comparison.
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

		const choice = interaction.customId === this.idYes ? "yes" : "no";
		return this.endGame("result", { userChoice: choice });
	}

	// =========================================================================
	// UI & HELPERS
	// =========================================================================

	/**
	 * Concludes the game session.
	 * Cleans up event listeners and timers.
	 * Updates the UI to show the global statistics (percentage of people who agreed/disagreed)
	 * alongside the user's choice.
	 * @param state - The outcome of the session.
	 * @param data - The user's selection (Yes/No).
	 * @private
	 */
	private async endGame(state: "result" | "timeout" | "error", data?: { userChoice?: "yes" | "no" }) {
		if (!this.isGameActive && state !== "error") return;
		this.isGameActive = false;

		if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
		activePlayers.delete(this.id);
		this.weky._EventManager.unregister(this.id);

		if (this.gameMessage) {
			try {
				const containerData = {
					question: this.apiData?.question,
					result: this.apiData?.result,
					stats: this.apiData
						? {
								yes: this.apiData.stats.yes.percentage,
								no: this.apiData.stats.no.percentage,
						  }
						: undefined,
					userChoice: data?.userChoice,
				};

				await this.gameMessage.edit({
					components: [this.createGameContainer(state, containerData)],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
	}

	/**
	 * Constructs the visual interface.
	 * Generates the Embed displaying the Dilemma (Question + Result) and the decision buttons.
	 * Handles the visual transition from "Active" (choosing) to "Result" (showing statistics).
	 * @param state - The current game state.
	 * @param data - Dynamic data including the dilemma text and global stats.
	 * @returns {ContainerBuilder} The constructed container.
	 * @private
	 */
	private createGameContainer(
		state: "loading" | "active" | "result" | "error" | "timeout",
		data: {
			question?: string;
			result?: string;
			stats?: { yes: string; no: string };
			userChoice?: "yes" | "no";
		}
	): ContainerBuilder {
		const container = new ContainerBuilder();
		let content = "";

		switch (state) {
			case "loading":
				container.setAccentColor(this.defaultColor);
				content = this.options.states?.loading
					? this.options.states.loading
							.replace("{{gameTitle}}", this.gameTitle)
							.replace("{{thinkMessage}}", this.msgThink)
					: `## ${this.gameTitle}\n> 🔄 ${this.msgThink}`;
				break;

			case "active":
				container.setAccentColor(this.defaultColor);
				content = this.options.states?.active
					? this.options.states.active
							.replace("{{gameTitle}}", this.gameTitle)
							.replace("{{question}}", data.question!)
							.replace("{{result}}", data.result!)
					: `## ${this.gameTitle}\n` + `> ${data.question}\n\n` + `**BUT**\n\n` + `> ${data.result}`;
				break;

			case "result":
				container.setAccentColor(data.userChoice === "yes" ? 0x57f287 : 0xed4245);
				content = this.options.states?.result
					? this.options.states.result
							.replace("{{gameTitle}}", this.gameTitle)
							.replace("{{question}}", data.question!)
							.replace("{{result}}", data.result!)
							.replace(
								"{{chose}}",
								data.userChoice === "yes"
									? this.options.yesPress
										? this.options.yesPress
										: "Yes! Press it!"
									: this.options.noPress
									? this.options.noPress
									: "No! Don't press!"
							)
					: `## ${this.gameTitle}\n> ${data.question}\n\n**BUT**\n\n> ${data.result}\n\n**You chose:** ${
							data.userChoice === "yes"
								? this.options.yesPress
									? this.options.yesPress
									: "Yes! Press it!"
								: this.options.noPress
								? this.options.noPress
								: "No! Don't press!"
					  }`;
				break;

			case "timeout":
				container.setAccentColor(0x99aab5);
				content = this.options.states?.timeout
					? this.options.states.timeout.replace("{{gameTitle}}", this.gameTitle)
					: `## ${this.gameTitle}\n> ⏳ Time's up! You didn't decide.`;
				break;

			case "error":
				container.setAccentColor(0xff0000);
				content = this.options.states?.error ? this.options.states.error : `## ❌ Error\n> Failed to fetch a dilemma.`;
				break;
		}

		container.addTextDisplayComponents((t) => t.setContent(content));

		if (state === "active" || state === "result") {
			const isResult = state === "result";

			const txtYes = isResult ? `${this.labelYes} (${data.stats?.yes})` : this.labelYes;
			const txtNo = isResult ? `${this.labelNo} (${data.stats?.no})` : this.labelNo;

			let styleYes = ButtonStyle.Success;
			let styleNo = ButtonStyle.Danger;

			if (isResult) {
				if (data.userChoice === "yes") styleNo = ButtonStyle.Secondary;
				if (data.userChoice === "no") styleYes = ButtonStyle.Secondary;
			}

			const btnYes = new ButtonBuilder()
				.setStyle(styleYes)
				.setLabel(txtYes)
				.setCustomId(this.idYes)
				.setDisabled(isResult);

			const btnNo = new ButtonBuilder().setStyle(styleNo).setLabel(txtNo).setCustomId(this.idNo).setDisabled(isResult);

			container.addActionRowComponents((row) => row.setComponents(btnYes, btnNo));
		}

		return container;
	}
}
