import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { QuickClickTypes } from "../core/Types.js";
import { clamp, getRandomString } from "../utils/Helpers.js";

export class QuickClick extends BaseGame<QuickClickTypes> {
  private targetIndex: number = 0;
  private btnPrefix: string;
  private isWaiting: boolean = true;
  private waitTimer: NodeJS.Timeout | null = null;
  private emoji: string;
  private gameTitle: string;

  private buttonCount: number;
  private minDelay: number;
  private maxDelay: number;

  constructor(manager: any, options: QuickClickTypes) {
    super(manager, options, "quickclick");
    this.btnPrefix = getRandomString(6, "qc_");
    this.emoji = options.emoji || "⚡";
    this.gameTitle = options.embed?.title || "Quick Click";
    this.defaultColor = this.resolveColor(options.embed?.color);
    this.buttonCount = clamp(options.buttonCount ?? 20, 1, 25);
    this.minDelay = options.minDelay ?? 2000;
    this.maxDelay = options.maxDelay ?? 6000;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 10_000;
  }

  public async start(): Promise<void> {
    this.targetIndex = Math.floor(Math.random() * this.buttonCount);
    this.isWaiting = true;
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    const container = this.createGameContainer("waiting");

    await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    const delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
    this.waitTimer = setTimeout(() => {
      this.triggerActiveState();
    }, delay);
  }

  private async triggerActiveState(): Promise<void> {
    if (!this.isActive) return;

    const container = this.createGameContainer("active");

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.isWaiting = false;
    this.startTime = Date.now();

    this.resetTimeout(() => this.endGame("timeout"));
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    if (this.isWaiting) {
      await interaction.deferUpdate().catch(() => {});
      await this.endGame("early");
      return;
    }

    const clickedIndex = parseInt(customId.replace(this.btnPrefix, ""), 10);
    if (clickedIndex === this.targetIndex) {
      // interaction.createdTimestamp is recorded by Discord servers at the moment of click
      const clickTimestamp = interaction.createdTimestamp || Date.now();
      const rawDelta = Math.max(1, clickTimestamp - this.startTime);

      // Compensate for one-way WebSocket gateway latency (ping / 2)
      const wsPing = (interaction.client as any)?.ws?.ping ?? 0;
      const transitEstimate = wsPing > 0 ? Math.round(wsPing / 2) : 0;
      const reactionTimeMs = Math.max(1, rawDelta - transitEstimate);

      await interaction.deferUpdate().catch(() => {});
      await this.endGame("won", reactionTimeMs);
    }
  }

  private async endGame(reason: "won" | "early" | "timeout", reactionMs?: number): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    if (this.waitTimer) {
      clearTimeout(this.waitTimer);
      this.waitTimer = null;
    }
    this.emitEnd(reason, reactionMs ? Math.round(reactionMs) : 0);

    const container = this.createGameContainer(reason, reactionMs);

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  public override destroy(): void {
    super.destroy();
    if (this.waitTimer) {
      clearTimeout(this.waitTimer);
      this.waitTimer = null;
    }
  }

  private createGameContainer(state: "waiting" | "active" | "won" | "early" | "timeout", reactionMs?: number): ContainerBuilder {
    const stateColors: Record<string, number> = {
      waiting: this.defaultColor,
      active: this.defaultColor,
      won: 0x57f287,
      early: 0xed4245,
      timeout: 0xed4245,
    };
    const container = this.createContainer(stateColors[state]);
    let content = "";

    switch (state) {
      case "waiting":
        content = `## ${this.gameTitle}\n` + `> ⏳ ${this.options.waitMessage || `Get ready! The **${this.emoji}** button will appear randomly...`}`;
        break;

      case "active":
        content = `## ${this.gameTitle}\n` + `> 🔥 **CLICK NOW!** Find and click the **${this.emoji}** button as fast as you can!`;
        break;

      case "won":
        const sec = ((reactionMs || 0) / 1000).toFixed(3);
        content = `## ⚡ Blazing Fast Reaction!\n` + `> 🏆 **GG <@${this.ctx.userId}>!**\n` + `> You clicked the button in **${reactionMs}ms** (\`${sec}s\`)!\n` + `> *(Network latency compensated)*`;
        break;

      case "early":
        content = `## ❌ Too Early!\n` + `> You clicked before the button appeared! Patience is a virtue.`;
        break;

      case "timeout":
        content = `## ⏱️ Time's Up!\n` + `> ${this.options.loseMessage || "Time expired! You weren't fast enough."}`;
        break;
    }

    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    const allDisabled = state !== "active";
    const showTarget = state === "active" || state === "won";
    let btnIndex = 0;

    for (let r = 0; r < 5; r++) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      let addedInRow = 0;
      for (let c = 0; c < 5; c++) {
        if (btnIndex >= this.buttonCount) break;
        const isTarget = btnIndex === this.targetIndex;
        const btn = new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}${btnIndex}`)
          .setLabel(isTarget && showTarget ? this.emoji : "\u200b")
          .setStyle(isTarget && showTarget ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setDisabled(allDisabled ? true : !isTarget);

        row.addComponents(btn);
        btnIndex++;
        addedInRow++;
      }
      if (addedInRow > 0) {
        container.addActionRowComponents(row);
      }
    }

    return container;
  }
}
