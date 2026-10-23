import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { GuessTheNumberTypes } from "../core/Types.js";
import { formatTime, getRandomString } from "../utils/Helpers.js";

export class GuessTheNumber extends BaseGame<GuessTheNumberTypes> {
  private targetNumber: number = 0;
  private currentMin: number = 1;
  private currentMax: number = 1000;
  private attempts: number = 0;
  private participants: Set<string> = new Set();
  private isPublic: boolean = false;
  private btnPrefix: string;
  private gameTitle: string;

  constructor(manager: any, options: GuessTheNumberTypes) {
    super(manager, options, "gtn");
    this.btnPrefix = getRandomString(6, "gtn_");
    this.isPublic = options.publicMode ?? options.publicGame ?? false;
    this.gameTitle = options.embed?.title || "Guess The Number";
    this.defaultColor = this.resolveColor(options.embed?.color);

    this.currentMin = options.min ?? 1;
    this.currentMax = options.max ?? 100;

    if (typeof options.number === "number") {
      this.targetNumber = options.number;
    } else {
      this.targetNumber = Math.floor(Math.random() * (this.currentMax - this.currentMin + 1)) + this.currentMin;
    }

    this.defaultTimeout = options.time || manager?.defaultTimeout || 120_000;
  }

  public async start(): Promise<void> {
    this.startTime = Date.now();
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

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
    if (!this.isPublic && !this.isAuthorized(interaction)) return;

    if (interaction.customId === `${this.btnPrefix}cancel`) {
      await interaction.deferUpdate().catch(() => {});
      await this.endGame("cancelled");
    }
  }

  public async onMessage(message: Message): Promise<void> {
    if (!this.isActive) return;
    if (message.channelId !== this.ctx.channel.id) return;
    if (!this.isPublic && message.author.id !== this.ctx.userId) return;

    const content = message.content.trim();
    const guess = parseInt(content, 10);
    if (isNaN(guess) || !/^\d+$/.test(content)) return;

    if (message.deletable) await message.delete().catch(() => {});
    this.resetTimeout(() => this.endGame("timeout"));

    this.attempts++;
    this.participants.add(message.author.id);

    if (guess === this.targetNumber) {
      await this.endGame("won", message.author.id);
      return;
    }

    if (guess < this.targetNumber) {
      if (guess > this.currentMin) this.currentMin = guess;
      const hint = `🔼 **${guess} is TOO LOW!** <@${message.author.id}>, try a higher number.`;
      const container = this.createGameContainer("higher", { hint });
      await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } else {
      if (guess < this.currentMax) this.currentMax = guess;
      const hint = `🔽 **${guess} is TOO HIGH!** <@${message.author.id}>, try a lower number.`;
      const container = this.createGameContainer("lower", { hint });
      await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }

  private async endGame(state: "won" | "lost" | "cancelled" | "timeout", winnerId?: string): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state, this.attempts);

    const elapsed = formatTime(Date.now() - this.startTime);
    const container = this.createGameContainer(state, { winnerId, timeTaken: elapsed });

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "higher" | "lower" | "won" | "lost" | "cancelled" | "timeout", data?: { hint?: string; winnerId?: string; timeTaken?: string }): ContainerBuilder {
    const stateColors: Record<string, number> = {
      active: this.defaultColor,
      higher: 0xfee75c,
      lower: 0xe67e22,
      won: 0x57f287,
      cancelled: 0xed4245,
      lost: 0xed4245,
      timeout: 0xed4245,
    };
    const container = this.createContainer(stateColors[state]);
    let content = "";

    const modeText = this.isPublic ? "👥 **Mode:** Public (Everyone can guess!)" : "👤 **Mode:** Solo";

    switch (state) {
      case "active":
      case "higher":
      case "lower":
        content = `## ${this.gameTitle}\n`;
        if (data?.hint) {
          content += `> ${data.hint}\n\n`;
        }
        content += `> ${modeText}\n` + `> Guess the secret number between **${this.currentMin}** and **${this.currentMax}**!\n\n` + `**Attempts:** \`${this.attempts}\` | **Participants:** \`${this.participants.size}\``;
        break;

      case "won":
        content = `## 🎯 Number Found!\n` + `> 🏆 **Congratulations <@${data?.winnerId || this.ctx.userId}>!**\n` + `> The secret number was **${this.targetNumber}**!\n\n` + `**Total Attempts:** \`${this.attempts}\` | **Time Taken:** \`${data?.timeTaken || "0s"}\` | **Participants:** \`${this.participants.size}\``;
        break;

      case "cancelled":
        content = `## 🛑 Game Cancelled\n` + `> The game was ended. The number was **${this.targetNumber}**.`;
        break;

      case "lost":
      case "timeout":
        content = `## ⏱️ Time's Up\n` + `> Game session expired. The secret number was **${this.targetNumber}**.`;
        break;
    }

    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    if (state === "active" || state === "higher" || state === "lower") {
      const giveUpBtn = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(this.options.giveUpButton || this.options.button || "Give Up")
        .setEmoji("🛑")
        .setCustomId(`${this.btnPrefix}cancel`);
      container.addActionRowComponents((row) => row.setComponents(giveUpBtn));
    }

    return container;
  }
}
