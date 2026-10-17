import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { LieSwatterTypes } from "../core/Types.js";
import { getRandomTriviaFact, TriviaFact } from "../data/trivia.js";
import { formatTime, getRandomString, safeResolveColor } from "../utils/Helpers.js";

export class LieSwatter extends BaseGame<LieSwatterTypes> {
  private fact: TriviaFact;
  private startTime: number = 0;
  private btnPrefix: string;
  private gameTitle: string;
  private defaultColor: number;
  private labelTrue: string;
  private labelLie: string;

  constructor(manager: any, options: LieSwatterTypes) {
    super(manager, options, "lieswatter");
    this.btnPrefix = getRandomString(6, "ls_");
    this.gameTitle = options.embed?.title || "Lie Swatter";
    this.defaultColor = safeResolveColor(options.embed?.color, 0x5865f2);
    this.labelTrue = options.buttons?.true || "Truth";
    this.labelLie = options.buttons?.lie || "Lie";
    this.fact = getRandomTriviaFact();
    this.defaultTimeout = options.time || 45_000;
  }

  public async start(): Promise<void> {
    this.startTime = Date.now();
    this.isActive = true;
    this.manager._eventManager.register(this);

    const container = this.createGameContainer("active");

    await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame("timeout"));
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    await interaction.deferUpdate().catch(() => {});
    const chosen = customId.replace(this.btnPrefix, "");
    const userGuessIsTrue = chosen === "true";

    const isCorrect = userGuessIsTrue === this.fact.isTrue;
    await this.endGame(isCorrect ? "won" : "lost");
  }

  private async endGame(state: "won" | "lost" | "timeout"): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const elapsed = formatTime(Date.now() - this.startTime);
    const container = this.createGameContainer(state, { timeTaken: elapsed });

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "won" | "lost" | "timeout", data?: { timeTaken?: string }): ContainerBuilder {
    const container = new ContainerBuilder();
    let content = "";
    const correctLabel = this.fact.isTrue ? this.labelTrue : this.labelLie;

    switch (state) {
      case "active":
        container.setAccentColor(this.defaultColor);
        content = `## ${this.gameTitle}\n> "${this.fact.statement}"\n\nIs this statement a **${this.labelTrue}** or a **${this.labelLie}**?`;
        break;

      case "won":
        container.setAccentColor(0x57f287);
        const winText = this.options.winMessage ? this.options.winMessage.replace("{{answer}}", correctLabel).replace("{{time}}", data?.timeTaken || "0s") : `🏆 Spot on! It was indeed **${correctLabel}**! Answered in **${data?.timeTaken || "0s"}**.`;
        content = `## ${this.gameTitle}\n> ${winText}\n\n📖 **Fact:** ${this.fact.explanation}`;
        break;

      case "lost":
        container.setAccentColor(0xed4245);
        const loseText = this.options.loseMessage ? this.options.loseMessage.replace("{{answer}}", correctLabel) : `💀 Swatted! It was actually **${correctLabel}**.`;
        content = `## ${this.gameTitle}\n> ${loseText}\n\n📖 **Fact:** ${this.fact.explanation}`;
        break;

      case "timeout":
        container.setAccentColor(0xed4245);
        content = `## ${this.gameTitle}\n> ⏱️ Time's up! It was actually **${correctLabel}**.\n\n📖 **Fact:** ${this.fact.explanation}`;
        break;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));

    const isResult = state !== "active";
    const trueBtn = new ButtonBuilder()
      .setCustomId(`${this.btnPrefix}true`)
      .setLabel(this.labelTrue)
      .setEmoji("✅")
      .setStyle(isResult ? (this.fact.isTrue ? ButtonStyle.Success : ButtonStyle.Secondary) : ButtonStyle.Success)
      .setDisabled(isResult);

    const lieBtn = new ButtonBuilder()
      .setCustomId(`${this.btnPrefix}false`)
      .setLabel(this.labelLie)
      .setEmoji("❌")
      .setStyle(isResult ? (!this.fact.isTrue ? ButtonStyle.Success : ButtonStyle.Secondary) : ButtonStyle.Danger)
      .setDisabled(isResult);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(trueBtn, lieBtn);
    container.addActionRowComponents(row);

    return container;
  }
}
