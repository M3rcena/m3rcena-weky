import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ContainerBuilder, Interaction, LabelBuilder, Message, MessageFlags, ModalBuilder, ModalSubmitInteraction, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { ContextAdapter } from "../core/ContextAdapter.js";
import { CalcTypes } from "../core/Types.js";
import { MathEvaluator } from "../utils/MathEvaluator.js";

const STANDARD_KEYS = ["DC", "(", ")", "⌫", "AC", "7", "8", "9", "÷", "^", "4", "5", "6", "x", "SQRT", "1", "2", "3", " - ", " + ", "2nd", "0", ".", "ans", "="];

const SCIENTIFIC_KEYS = ["DC", "SIN", "COS", "TAN", "AC", "LG", "LN", "x!", "1/x", "⌫", "RND", "π", "e", "÷", "x", "(", ")", "%", " - ", " + ", "2nd", "0", ".", "ans", "="];

const INVALID_START_KEYS = ["⌫", "AC", "=", "x", "÷", "%", "^", "x!"];

interface ModalOpConfig {
  title: string;
  label: string;
  funcName: string;
  isSuffix?: boolean;
}

export class Calculator extends BaseGame<CalcTypes> {
  private msg1: Message | null = null;
  private currentExpression: string = " ";
  private lastAnswer: string = "";
  private hasCalculated: boolean = false;
  private isFinished: boolean = false;
  private is2nd: boolean = false;
  private accentColor: number;
  private modalOperations: Record<string, ModalOpConfig>;

  constructor(manager: any, options: CalcTypes) {
    super(manager, options, "calc");
    this.accentColor = this.resolveColor(options.embed?.color);
    this.defaultTimeout = options.time || manager?.defaultTimeout || 300_000;

    this.modalOperations = {
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

  public async start(): Promise<void> {
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    const container = this.buildContainer();

    this.msg1 = await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame());
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;

    if (interaction.user.id !== this.ctx.userId) {
      if (interaction.message.id === this.msg1?.id) {
        const othersMsg = this.options.othersMessage ? this.options.othersMessage.replace("{{authorTag}}", `<@${this.ctx.userId}>`) : `Only <@${this.ctx.userId}> can use this calculator!`;
        ContextAdapter.replyEphemeral(interaction, othersMsg);
      }
      return;
    }

    if (interaction.message.id !== this.msg1?.id) return;

    this.resetTimeout(() => this.endGame());

    const id = interaction.customId;
    const rawValue = id.replace("cal", "");

    if (id === "cal2nd") {
      this.is2nd = !this.is2nd;
      await interaction.deferUpdate().catch(() => {});
      await this.updateUI();
      return;
    }

    if (id in this.modalOperations) {
      const op = this.modalOperations[id];
      const inputNum = await this.handleModal(interaction, op);
      if (inputNum) {
        this.currentExpression += op.isSuffix ? `${inputNum}${op.funcName}` : `${op.funcName}(${inputNum})`;
        await this.updateUI();
      }
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate().catch(() => {});
    }

    switch (true) {
      case id === "calDC":
        return this.endGame();

      case id === "calAC":
        this.currentExpression = " ";
        break;

      case id === "cal⌫":
        if (!this.currentExpression || this.currentExpression === " ") break;
        this.currentExpression = this.currentExpression.endsWith(" ") ? this.currentExpression.slice(0, -3) : this.currentExpression.slice(0, -1);
        if (this.currentExpression === "") this.currentExpression = " ";
        break;

      case id === "cal=":
        if (!this.currentExpression.trim()) return;
        const res = this.calculate(this.currentExpression);
        if (res.error) {
          this.currentExpression = res.error;
          await this.updateUI(true);
          this.currentExpression = " ";
          return;
        } else {
          this.currentExpression = String(res.result);
          this.lastAnswer = String(res.result);
          this.hasCalculated = true;
        }
        break;

      default:
        this.currentExpression += rawValue;
        break;
    }

    await this.updateUI();
  }

  private calculate(expr: string): { result: number | string | null; error: string | null } {
    let clean = expr
      .replace(/x/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/ans/g, this.lastAnswer || "0")
      .trim();

    try {
      const evalResult = MathEvaluator.evaluate(clean, Number(this.lastAnswer) || 0);
      if (evalResult.error) {
        return {
          result: null,
          error: this.options.errorMessages?.invalidCalculation || "Invalid calculation",
        };
      }
      return {
        result: evalResult.formatted,
        error: null,
      };
    } catch {
      return {
        result: null,
        error: this.options.errorMessages?.invalidCalculation || "Invalid calculation",
      };
    }
  }

  private async handleModal(interaction: ButtonInteraction, config: ModalOpConfig): Promise<string | null> {
    const modalId = `md_${config.funcName}_${Date.now()}`;
    const modal = new ModalBuilder().setTitle(config.title).setCustomId(modalId);

    const input = new TextInputBuilder().setCustomId(`input_${config.funcName}`).setStyle(TextInputStyle.Short).setRequired(true);

    const textDisplay = new TextDisplayBuilder().setContent(this.options.modals?.display ? this.options.modals.display.replace("{{currentExpression}}", this.currentExpression === " " ? `\`\`\`${this.options.modals?.noPromptYet || "No Prompt Yet"}\`\`\`` : this.getDisplay()) : `## Current Calculation:\n${this.currentExpression === " " ? "```No Prompt Yet```" : this.getDisplay()}`);

    const label = new LabelBuilder().setLabel(this.options.modals?.labels ? this.options.modals.labels.replace("{{label}}", config.label) : `Enter number for ${config.label}`).setTextInputComponent(input);

    modal.addTextDisplayComponents(textDisplay);
    modal.addLabelComponents(label);

    await interaction.showModal(modal).catch(() => {});

    try {
      const submitted = await interaction.awaitModalSubmit({
        filter: (i: ModalSubmitInteraction) => i.customId === modalId && i.user.id === this.ctx.userId,
        time: 120_000,
      });

      await submitted.deferUpdate().catch(() => {});
      return submitted.fields.getTextInputValue(`input_${config.funcName}`);
    } catch {
      return null;
    }
  }

  private async updateUI(forceEmpty: boolean = false): Promise<void> {
    if (this.msg1) {
      const container = this.buildContainer(forceEmpty);
      await this.msg1
        .edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        })
        .catch(() => {});
    }
  }

  private async endGame(): Promise<void> {
    if (this.isFinished) return;
    this.isFinished = true;
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd("closed");

    const endMsg = this.options.sessionEndMessage || "Calculator Session Closed";

    if (this.msg1) {
      const container = this.createContainer(this.accentColor);
      let content = `\`\`\`\n${endMsg}\n\`\`\``;
      content = this.applyEmbedDecorations(container, content);
      container.addTextDisplayComponents((t) => t.setContent(content));
      const keys = this.is2nd ? SCIENTIFIC_KEYS : STANDARD_KEYS;
      this.addButtonsToContainer(container, keys, true);

      await this.msg1.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }
  }

  private getDisplay(): string {
    const modeTag = this.is2nd ? "  [2nd / SCI]" : "";
    return `\`\`\`fix\n${this.currentExpression}${modeTag}\n\`\`\``;
  }

  private buildContainer(forceEmpty: boolean = false): ContainerBuilder {
    const container = this.createContainer(this.accentColor);
    const header = this.options.embed?.title ? `## ${this.options.embed.title}\n` : "";
    let content = `${header}${this.getDisplay()}`;
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    const keys = this.is2nd ? SCIENTIFIC_KEYS : STANDARD_KEYS;
    this.addButtonsToContainer(container, keys, forceEmpty);
    return container;
  }

  private addButtonsToContainer(container: ContainerBuilder, keys: string[], forceEmpty: boolean = false): void {
    const isEmpty = this.currentExpression.trim() === "" || forceEmpty;

    for (let i = 0; i < keys.length; i += 5) {
      const chunk = keys.slice(i, i + 5);
      const buttons = chunk.map((k) => {
        let isDisabled = this.isFinished;

        if (!isDisabled) {
          if (k === "2nd") {
            isDisabled = false;
          } else if (k === "ans" && !this.hasCalculated) {
            isDisabled = true;
          } else if (isEmpty && INVALID_START_KEYS.includes(k)) {
            isDisabled = true;
          }
        }

        const btn = new ButtonBuilder().setLabel(k).setCustomId(`cal${k}`).setDisabled(isDisabled);

        if (k === "=") {
          btn.setStyle(ButtonStyle.Success);
        } else if (k === "2nd") {
          btn.setStyle(this.is2nd ? ButtonStyle.Success : ButtonStyle.Primary);
        } else if (k === "AC") {
          btn.setStyle(ButtonStyle.Danger);
        } else if (k === "DC") {
          btn.setStyle(ButtonStyle.Danger).setEmoji("🛑");
        } else if (["x", "÷", " - ", " + ", "^", "%"].includes(k)) {
          btn.setStyle(ButtonStyle.Primary);
        } else {
          btn.setStyle(ButtonStyle.Secondary);
        }

        return btn;
      });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
      container.addActionRowComponents(row);
    }
  }
}
