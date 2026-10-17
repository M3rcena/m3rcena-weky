import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { WouldYouRatherTypes } from "../core/Types.js";
import { getRandomWYR, WYRDilemma } from "../data/dilemmas.js";
import { getRandomString, safeResolveColor } from "../utils/Helpers.js";

export class WouldYouRather extends BaseGame<WouldYouRatherTypes> {
  private dilemma: WYRDilemma;
  private btnPrefix: string;
  private gameTitle: string;
  private defaultColor: number;
  private labelA: string;
  private labelB: string;

  constructor(manager: any, options: WouldYouRatherTypes) {
    super(manager, options, "wyr");
    this.btnPrefix = getRandomString(6, "wyr_");
    this.gameTitle = options.embed?.title || "Would You Rather?";
    this.defaultColor = safeResolveColor(options.embed?.color, 0x5865f2);
    this.labelA = options.buttons?.optionA || "Option A";
    this.labelB = options.buttons?.optionB || "Option B";
    this.dilemma = getRandomWYR();
    this.defaultTimeout = options.time || 60_000;
  }

  public async start(): Promise<void> {
    this.isActive = true;
    this.manager._eventManager.register(this);

    const container = this.createGameContainer("active");

    await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame());
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    await interaction.deferUpdate().catch(() => {});
    const choice = customId.replace(this.btnPrefix, "") as "A" | "B";

    await this.endGame(choice);
  }

  private async endGame(choice?: "A" | "B"): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const state = choice ? "result" : "timeout";
    const container = this.createGameContainer(state, choice);

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "result" | "timeout", choice?: "A" | "B"): ContainerBuilder {
    const container = new ContainerBuilder();
    let content = "";

    const totalVotes = this.dilemma.stats.votesA + this.dilemma.stats.votesB;
    const pctA = Math.round((this.dilemma.stats.votesA / totalVotes) * 100);
    const pctB = Math.round((this.dilemma.stats.votesB / totalVotes) * 100);

    switch (state) {
      case "active":
        container.setAccentColor(this.defaultColor);
        content = `## ${this.gameTitle}\n` + `> **Would you rather...**\n\n` + `🅰️ **Option A:**\n> ${this.dilemma.optionA}\n\n` + `*— OR —*\n\n` + `🅱️ **Option B:**\n> ${this.dilemma.optionB}\n\n` + `*Choose your fate below!*`;
        break;

      case "result":
        container.setAccentColor(choice === "A" ? 0x5865f2 : 0x57f287);
        const chosenText = choice === "A" ? this.dilemma.optionA : this.dilemma.optionB;
        content = `## ${this.gameTitle}\n` + `> 👉 You chose **Option ${choice}**: "${chosenText}"\n\n` + `📊 **Community Consensus:**\n` + `🅰️ **Option A (${pctA}%):**\n> ${this.dilemma.optionA}\n\n` + `🅱️ **Option B (${pctB}%):**\n> ${this.dilemma.optionB}`;
        break;

      case "timeout":
        container.setAccentColor(0xed4245);
        content = `## ${this.gameTitle}\n` + `> ⏱️ Time's up! You took too long to choose.\n\n` + `📊 **Community Consensus:**\n` + `🅰️ **Option A (${pctA}%):**\n> ${this.dilemma.optionA}\n\n` + `🅱️ **Option B (${pctB}%):**\n> ${this.dilemma.optionB}`;
        break;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));

    const isResult = state === "result" || state === "timeout";
    const labelA = isResult ? `${this.labelA} (${pctA}%)` : this.labelA;
    const labelB = isResult ? `${this.labelB} (${pctB}%)` : this.labelB;

    let styleA = ButtonStyle.Primary;
    let styleB = ButtonStyle.Primary;

    if (isResult) {
      if (choice === "A") {
        styleA = ButtonStyle.Success;
        styleB = ButtonStyle.Secondary;
      } else if (choice === "B") {
        styleA = ButtonStyle.Secondary;
        styleB = ButtonStyle.Success;
      }
    }

    const btnA = new ButtonBuilder().setCustomId(`${this.btnPrefix}A`).setLabel(labelA).setEmoji("🅰️").setStyle(styleA).setDisabled(isResult);

    const btnB = new ButtonBuilder().setCustomId(`${this.btnPrefix}B`).setLabel(labelB).setEmoji("🅱️").setStyle(styleB).setDisabled(isResult);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnA, btnB);
    container.addActionRowComponents(row);

    return container;
  }
}
