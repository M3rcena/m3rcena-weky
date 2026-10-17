import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { FastTypeTypes } from "../core/Types.js";
import { getRandomSentence } from "../data/sentences.js";
import { formatTime, getRandomString, safeResolveColor } from "../utils/Helpers.js";

export class FastType extends BaseGame<FastTypeTypes> {
  private sentence: string = "";
  private startTime: number = 0;
  private hasTyped: boolean = false;
  private btnPrefix: string;
  private gameTitle: string;
  private defaultColor: number;

  constructor(manager: any, options: FastTypeTypes) {
    super(manager, options, "fasttype");
    this.btnPrefix = getRandomString(6, "ft_");
    this.gameTitle = options.embed?.title || "Fast Type Challenge";
    this.defaultColor = safeResolveColor(options.embed?.color, 0x5865f2);
    this.defaultTimeout = options.time || 60_000;
  }

  public async start(): Promise<void> {
    this.sentence = this.options.sentence || getRandomSentence(this.options.difficulty || "medium");
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

  public onTypingStart(typing: any): void {
    const typingUserId = typing.user?.id || typing.userId;
    const typingChannelId = typing.channel?.id || typing.channelId;
    if (typingUserId === this.ctx.userId && typingChannelId === this.ctx.channel.id) {
      this.hasTyped = true;
    }
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;

    if (interaction.customId === `${this.btnPrefix}cancel`) {
      await interaction.deferUpdate().catch(() => {});
      await this.endGame("cancelled");
    }
  }

  public async onMessage(message: Message): Promise<void> {
    if (!this.isActive) return;
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;

    const input = message.content.trim();
    if (input.startsWith("/") || input.startsWith("!")) return;

    if (message.deletable) await message.delete().catch(() => {});

    // Anti-Cheat: User must have triggered typing event before sending the message
    if (!this.hasTyped) {
      await this.endGame("cheat");
      return;
    }

    if (input === this.sentence) {
      const elapsedMs = Date.now() - this.startTime;
      const elapsedSec = Math.max(0.5, elapsedMs / 1000);
      const minutes = elapsedSec / 60;
      const words = this.sentence.length / 5;
      const wpm = Math.round(words / minutes);

      await this.endGame("won", { timeTaken: formatTime(elapsedMs), wpm: String(wpm) });
    } else {
      const typoContainer = this.createGameContainer("typo");
      await this.ctx.edit({
        components: [typoContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  private async endGame(state: "won" | "timeout" | "cancelled" | "cheat", data?: { timeTaken?: string; wpm?: string }): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const container = this.createGameContainer(state, data);

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "loading" | "active" | "typo" | "won" | "cheat" | "timeout" | "cancelled", data?: { timeTaken?: string; wpm?: string }): ContainerBuilder {
    const container = new ContainerBuilder();
    let content = "";

    switch (state) {
      case "loading":
        container.setAccentColor(this.defaultColor);
        content = `## ${this.gameTitle}\n> 🔄 Preparing sentence...`;
        break;

      case "active":
        container.setAccentColor(this.defaultColor);
        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{sentence}}", this.sentence) : `## ${this.gameTitle}\n> Type the sentence below as fast as you can!\n\n\`\`\`text\n${this.sentence}\n\`\`\`\n\n⏳ You have **${formatTime(this.defaultTimeout)}**!`;
        break;

      case "typo":
        container.setAccentColor(0xed4245);
        content = `## ${this.gameTitle}\n> ❌ **Typo! That was not an exact match.** Try again quickly!\n\n\`\`\`text\n${this.sentence}\n\`\`\``;
        break;

      case "won":
        container.setAccentColor(0x57f287);
        const winText = this.options.winMessage ? this.options.winMessage.replace("{{time}}", data?.timeTaken || "0s").replace("{{wpm}}", data?.wpm || "0") : `You typed the sentence in **${data?.timeTaken || "0s"}** with a speed of **${data?.wpm || "0"} WPM**!`;
        content = this.options.states?.won ? this.options.states.won.replace("{{winText}}", winText).replace("{{sentence}}", this.sentence) : `## 🏆 Fast Fingers!\n> ${winText}\n\n**Sentence:**\n\`\`\`text\n${this.sentence}\n\`\`\``;
        break;

      case "cheat":
        container.setAccentColor(0xed4245);
        content = this.options.states?.cheat ? this.options.states.cheat.replace("{{sentence}}", this.sentence) : `## ⚠️ Cheat Detected\n> ${this.options.cheatMessage || "Copy-pasting is not allowed! Please type the sentence manually."}\n\n**Sentence:**\n\`\`\`text\n${this.sentence}\n\`\`\``;
        break;

      case "timeout":
        container.setAccentColor(0xed4245);
        content = this.options.states?.timeout ? this.options.states.timeout.replace("{{sentence}}", this.sentence) : `## ⏱️ Time's Up\n> ${this.options.timeoutMessage || "You ran out of time!"}\n\n**Sentence:**\n\`\`\`text\n${this.sentence}\n\`\`\``;
        break;

      case "cancelled":
        container.setAccentColor(0xed4245);
        content = this.options.states?.cancelled ? this.options.states.cancelled.replace("{{sentence}}", this.sentence) : `## 🚫 Game Cancelled\n> You cancelled the typing test.`;
        break;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));

    if (state === "active" || state === "typo") {
      const btnCancel = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(this.options.cancelButton || "Cancel")
        .setEmoji("🛑")
        .setCustomId(`${this.btnPrefix}cancel`);
      container.addActionRowComponents((row) => row.setComponents(btnCancel));
    }

    return container;
  }
}
