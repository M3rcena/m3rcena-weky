import {
	ButtonInteraction,
	ContainerBuilder,
	Interaction,
	LabelBuilder,
	Message,
	MessageFlags,
	ModalBuilder,
	ModalSubmitInteraction,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { evaluate, format } from "mathjs";

import type { CalcTypes, CustomOptions, IMinigame } from "../Types/index.js";
import type { WekyManager } from "../index.js";
import type { Matrix, Unit, Complex, BigNumber } from "mathjs";

const activePlayers = new Set<string>();

type MathJsResult = number | string | Complex | BigNumber | Unit | Matrix | boolean;

interface CalculationResult {
	result: MathJsResult | null;
	error: string | null;
}

interface ModalOpConfig {
	title: string;
	label: string;
	funcName: string;
	isSuffix?: boolean;
}

const MAIN_KEYS = [
	"DC",
	"RND",
	"SIN",
	"COS",
	"TAN",
	"^",
	"LG",
	"LN",
	"(",
	")",
	"SQRT",
	"AC",
	"⌫",
	"%",
	"÷",
	"x!",
	"7",
	"8",
	"9",
	"x",
];
const SEC_KEYS = ["1/x", "4", "5", "6", " - ", "π", "1", "2", "3", " + ", "ans", "e", "0", ".", "="];
const INVALID_START_KEYS = ["⌫", "AC", "=", "x", "÷", "%", "^", "x!", ")"];

/**
 * Advanced Scientific Calculator Minigame.
 * Features a dual-message UI with support for complex mathematical operations via Math.js.
 * @implements {IMinigame}
 */
export default class Calculator implements IMinigame {
	public id: string;
	private weky: WekyManager;
	private options: CustomOptions<CalcTypes>;
	private context: CustomOptions<CalcTypes>["context"];

	// Game Objects
	private msg1: Message | null = null;
	private msg2: Message | null = null;
	private timeoutTimer: NodeJS.Timeout | null = null;

	// Calculator State
	private currentExpression: string = " ";
	private lastAnswer: string = "";
	private isFinished: boolean = false;
	private hasCalculated: boolean = false;
	private isGameActive: boolean = false;

	// Configurations
	private accentColor: number;
	private MODAL_OPERATIONS: Record<string, ModalOpConfig>;

	/**
	 * Initializes the Calculator game instance.
	 * Configures the operation maps for modal inputs (sin, cos, log, etc) and sets UI preferences.
	 * @param weky - The WekyManager instance.
	 * @param options - Custom configuration for the calculator (appearance, labels, error messages).
	 */
	constructor(weky: WekyManager, options: CustomOptions<CalcTypes>) {
		this.weky = weky;
		this.options = options;
		this.context = options.context;
		this.id = weky._getContextUserID(this.context);
		this.accentColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;

		this.MODAL_OPERATIONS = {
			calLG: {
				title: options.operationTitles?.logarithm || "Logarithm",
				label: options.oporationLabels?.logarithm || "logarithm 10",
				funcName: "log10",
			},
			calSQRT: {
				title: options.operationTitles?.squareRoot || "Square Root",
				label: options.oporationLabels?.squareRoot || "square root",
				funcName: "sqrt",
			},
			calRND: {
				title: options.operationTitles?.round || "Round",
				label: options.oporationLabels?.round || "round",
				funcName: "round",
			},
			calSIN: {
				title: options.operationTitles?.sine || "Sine",
				label: options.oporationLabels?.sine || "sine",
				funcName: "sin",
			},
			calCOS: {
				title: options.operationTitles?.cosine || "Cosine",
				label: options.oporationLabels?.cosine || "cosine",
				funcName: "cos",
			},
			calTAN: {
				title: options.operationTitles?.tangent || "Tangent",
				label: options.oporationLabels?.tangent || "tangent",
				funcName: "tan",
			},
			calLN: {
				title: options.operationTitles?.naturalLogarithm || "Natural Logarithm",
				label: options.oporationLabels?.naturalLogarithm || "natural logarithm",
				funcName: "log",
			},
			"cal1/x": {
				title: options.operationTitles?.reciprocal || "Reciprocal",
				label: options.oporationLabels?.reciprocal || "reciprocal",
				funcName: "1/",
			},
			"calx!": {
				title: options.operationTitles?.factorial || "Factorial",
				label: options.oporationLabels?.factorial || "factorial",
				funcName: "!",
				isSuffix: true,
			},
		};
	}

	/**
	 * Launches the game session.
	 * Deploys the dual-message UI (Main Keys and Secondary Keys), registers event listeners,
	 * and initializes the inactivity timer.
	 */
	public async start() {
		if (activePlayers.has(this.id)) return;
		activePlayers.add(this.id);
		this.isGameActive = true;

		this.msg1 = await this.context.channel.send({
			components: [this.buildRows(MAIN_KEYS)],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { repliedUser: false },
		});

		this.msg2 = await this.context.channel.send({
			components: [this.buildRows(SEC_KEYS)],
			flags: MessageFlags.IsComponentsV2,
		});

		this.weky._EventManager.register(this);

		this.resetTimeout();
	}

	// =========================================================================
	// EVENT ROUTER METHODS
	// =========================================================================

	/**
	 * Central event handler for the calculator.
	 * Processes button clicks, routes modal triggers for complex operations, handles
	 * specific calculator functions (AC, DEL, EQ), and updates the display.
	 * @param interaction - The received Discord Interaction.
	 */
	public async onInteraction(interaction: Interaction) {
		if (!interaction.isButton()) return;

		if (interaction.user.id !== this.id) {
			if (interaction.message.id === this.msg1?.id || interaction.message.id === this.msg2?.id) {
				return interaction.reply({
					content: this.options.othersMessage
						? this.options.othersMessage.replace("{{authorTag}}", `<@${this.id}>`)
						: `Only <@${this.id}> can use this calculator!`,
					flags: [MessageFlags.Ephemeral],
				});
			}
			return;
		}

		if (interaction.message.id !== this.msg1?.id && interaction.message.id !== this.msg2?.id) return;

		this.resetTimeout();

		const id = interaction.customId;
		const rawValue = id.replace("cal", "");

		if (id in this.MODAL_OPERATIONS) {
			const op = this.MODAL_OPERATIONS[id];
			const inputNum = await this.handleModal(interaction, op);
			if (inputNum) {
				this.currentExpression += op.isSuffix ? `${inputNum}${op.funcName}` : `${op.funcName}(${inputNum})`;
				await this.updateUI();
			}
			return;
		}

		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferUpdate();
		}

		switch (true) {
			case id === "calDC":
				return this.endGame();

			case id === "calAC":
				this.currentExpression = " ";
				break;

			case id === "cal⌫":
				if (!this.currentExpression || this.currentExpression === " ") break;
				this.currentExpression = this.currentExpression.endsWith(" ")
					? this.currentExpression.slice(0, -3)
					: this.currentExpression.slice(0, -1);
				if (this.currentExpression === "") this.currentExpression = " ";
				break;

			case id === "cal=":
				if (!this.currentExpression.trim()) return;
				const { result, error } = this.calculateResult(this.currentExpression);

				if (result !== null) {
					this.lastAnswer = format(result, { precision: 14 });
					this.currentExpression += ` = ${this.lastAnswer}`;
					this.hasCalculated = true;
					await this.updateUI(true);
					this.currentExpression = " ";
				} else {
					this.currentExpression = error || "Error";
					await this.updateUI(true);
					this.currentExpression = " ";
				}
				return;

			case id === "calπ":
				this.currentExpression += "pi";
				break;
			case id === "cale":
				this.currentExpression += "e";
				break;
			case id === "calans":
				if (this.hasCalculated) {
					this.currentExpression += this.lastAnswer;
				}
				break;

			case id === "calx":
				this.currentExpression += " * ";
				break;
			case id === "cal÷":
				this.currentExpression += " / ";
				break;

			default:
				this.currentExpression += rawValue;
				break;
		}

		await this.updateUI();
	}

	// =========================================================================
	// LOGIC & UI HELPERS
	// =========================================================================

	/**
	 * Resets the session inactivity timer.
	 * Automatically ends the game if no interaction occurs within 5 minutes.
	 * @private
	 */
	private resetTimeout() {
		if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
		this.timeoutTimer = setTimeout(() => {
			this.endGame();
		}, 300_000);
	}

	/**
	 * Concludes the game session.
	 * Unregisters listeners, cleans up memory, and updates the UI to show the session ended state.
	 * @private
	 */
	private async endGame() {
		if (!this.isGameActive) return;
		this.isGameActive = false;

		this.isFinished = true;
		this.weky._EventManager.unregister(this.id);
		activePlayers.delete(this.id);
		if (this.timeoutTimer) clearTimeout(this.timeoutTimer);

		this.currentExpression = this.options.sessionEndMessage
			? this.options.sessionEndMessage
			: "Calculator session ended.";

		await this.updateUI();
	}

	/**
	 * Refreshes the Discord messages to reflect the current calculator state.
	 * Updates both the primary (Msg1) and secondary (Msg2) keypads.
	 * @param forceEmpty - If true, forces the display to appear empty (used during resets).
	 * @private
	 */
	private async updateUI(forceEmpty: boolean = false) {
		if (!this.msg1) return;

		const p1 = this.msg1.edit({
			components: [this.buildRows(MAIN_KEYS, forceEmpty)],
			flags: MessageFlags.IsComponentsV2,
		});

		const p2 =
			this.msg2 && this.msg2.editable
				? this.msg2.edit({
						components: [this.buildRows(SEC_KEYS, forceEmpty)],
						flags: MessageFlags.IsComponentsV2,
				  })
				: Promise.resolve();

		await Promise.all([p1, p2]).catch(() => {});
	}

	/**
	 * Safe wrapper around the Math.js evaluation engine.
	 * Validates results against constraints (NaN, Infinity, Magnitude limits).
	 * @param input - The mathematical expression string to evaluate.
	 * @returns {CalculationResult} An object containing the computed result or an error message.
	 * @private
	 */
	private calculateResult(input: string): CalculationResult {
		try {
			const result = evaluate(input) as MathJsResult;

			if (typeof result === "number") {
				if (isNaN(result))
					return {
						result: null,
						error: this.options.errorMessages?.invalidCalculation
							? this.options.errorMessages.invalidCalculation
							: "Invalid calculation (NaN)",
					};
				if (!isFinite(result))
					return {
						result: null,
						error: this.options.errorMessages?.infiniteResult
							? this.options.errorMessages.infiniteResult
							: "Result is infinite",
					};
				if (Math.abs(result) > 1e15)
					return {
						result: null,
						error: this.options.errorMessages?.largeResult
							? this.options.errorMessages.largeResult
							: "Result too large",
					};
			}
			return { result, error: null };
		} catch (e) {
			// @ts-ignore
			const errorCode = Buffer.from("UG93ZXJlZCBieSBNM3JjZW5h", "base64").toString("utf-8");

			return {
				result: null,
				error: this.options.errorMessages?.invalidCalculation
					? this.options.errorMessages.invalidCalculation
					: "Invalid calculation",
			};
		}
	}

	/**
	 * Manages the Modal interaction flow for operations requiring specific numeric input (e.g., sin(x), log(x)).
	 * @param interaction - The button interaction that triggered the modal.
	 * @param config - Configuration metadata for the specific mathematical operation.
	 * @returns {Promise<string | null>} The user's input string, or null if the interaction failed/timed out.
	 * @private
	 */
	private async handleModal(interaction: ButtonInteraction, config: ModalOpConfig): Promise<string | null> {
		const modalId = config.title;
		const modalCustomId = `md${modalId}_${Date.now()}`;

		const modal = new ModalBuilder().setTitle(modalId).setCustomId(modalCustomId);

		const input = new TextInputBuilder()
			.setCustomId(`input${modalId}`)
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const textDisplay = new TextDisplayBuilder().setContent(
			this.options.modals?.display
				? this.options.modals.display.replace(
						"{{currentExpression}}",
						this.currentExpression === " "
							? `\`\`\`${this.options.modals?.noPromptYet ? this.options.modals.noPromptYet : "No Prompt Yet"}\`\`\``
							: this.getDisplay()
				  )
				: `## Current Calculation:\n${this.currentExpression === " " ? "```No Prompt Yet```" : this.getDisplay()}`
		);

		modal
			.addTextDisplayComponents(textDisplay)
			.addLabelComponents(
				new LabelBuilder()
					.setLabel(
						this.options.modals?.labels
							? this.options.modals.labels.replace("{{label}}", config.label)
							: `Enter number for ${config.label}`
					)
					.setTextInputComponent(input)
			);

		await interaction.showModal(modal);

		try {
			const submitted = await interaction.awaitModalSubmit({
				filter: (i: ModalSubmitInteraction) => i.customId === modalCustomId && i.user.id === this.id,
				time: 300_000,
			});

			await submitted.deferUpdate();
			return submitted.fields.getTextInputValue(`input${modalId}`);
		} catch {
			return null;
		}
	}

	/**
	 * Formats the current expression into a Discord Markdown code block.
	 * @returns {string} The formatted display string.
	 * @private
	 */
	private getDisplay(): string {
		return `\`\`\`\n${this.currentExpression}\n\`\`\``;
	}

	/**
	 * Constructs the visual container and button rows for the calculator interface.
	 * Handles button disabling logic based on game state (e.g., preventing invalid start keys).
	 * @param keys - Array of button keys to render in this container.
	 * @param forceEmpty - Whether to treat the display as empty for button logic.
	 * @returns {ContainerBuilder} The constructed container with action rows.
	 * @private
	 */
	private buildRows(keys: string[], forceEmpty: boolean = false): ContainerBuilder {
		const container = new ContainerBuilder().setAccentColor(this.accentColor);
		const isEmpty = this.currentExpression.trim() === "" || forceEmpty;

		if (keys === MAIN_KEYS) {
			container.addTextDisplayComponents((td) => td.setContent(this.getDisplay()));
		}

		for (let i = 0; i < keys.length; i += 5) {
			const chunk = keys.slice(i, i + 5);
			const buttons = chunk.map((k) => {
				let isDisabled = this.isFinished;

				if (!isDisabled) {
					if (k === "ans" && !this.hasCalculated) {
						isDisabled = true;
					}

					if (isEmpty && INVALID_START_KEYS.includes(k)) {
						isDisabled = true;
					}
				}

				return isDisabled ? this.weky._createDisabledButton(k, true) : this.weky._createButton(k, false);
			});

			// @ts-ignore
			const labelsCode = Buffer.from("UG93ZXJlZCBieSBNM3JjZW5h", "base64").toString("utf-8");
			container.addActionRowComponents((row) => row.setComponents(...buttons));
		}
		return container;
	}
}
