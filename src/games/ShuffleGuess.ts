import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { ShuffleGuessTypes } from "../core/Types.js";
import { getRandomWord } from "../data/words.js";
import { formatTime, getRandomString, shuffleString } from "../utils/Helpers.js";

export class ShuffleGuess extends BaseGame<ShuffleGuessTypes> {
  private targetWord: string = "";
  private scrambled: string = "";
  private btnPrefix: string;
  private gameTitle: string;

  constructor(manager: any, options: ShuffleGuessTypes) {
    super(manager, options, "shuffleguess");
    this.btnPrefix = getRandomString(6, "sg_");
    this.targetWord = (options.word || getRandomWord()).toUpperCase().trim();
    this.scrambled = this.getValidScramble(this.targetWord);
    this.gameTitle = options.embed?.title || "Shuffle Guess";
    this.defaultColor = this.resolveColor(options.embed?.color);
    this.defaultTimeout = options.time || manager?.defaultTimeout || 60_000;
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

  private getValidScramble(word: string): string {
    let s = shuffleString(word);
    let attempts = 0;
    while (s === word && word.length > 2 && attempts < 10) {
      s = shuffleString(word);
      attempts++;
    }
    return s;
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    const action = customId.replace(this.btnPrefix, "");
    await interaction.deferUpdate().catch(() => {});
    this.resetTimeout(() => this.endGame("timeout"));

    if (action === "quit") {
      await this.endGame("quit");
      return;
    }

    if (action === "reshuffle") {
      this.scrambled = this.getValidScramble(this.targetWord);
      const container = this.createGameContainer("reshuffled", { feedback: "🔄 *Letters reshuffled!*" });
      await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }

  public async onMessage(message: Message): Promise<void> {
    if (!this.isActive) return;
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;

    const guess = message.content.toUpperCase().trim();
    if (guess.startsWith("/") || guess.startsWith("!")) return;

    if (message.deletable) await message.delete().catch(() => {});
    this.resetTimeout(() => this.endGame("timeout"));

    if (guess === this.targetWord) {
      await this.endGame("won");
    } else {
      const container = this.createGameContainer("wrong", { feedback: `❌ **${guess}** is not correct! Keep trying!` });
      await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }

  private async endGame(state: "won" | "quit" | "timeout"): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state);

    const elapsed = formatTime(Date.now() - this.startTime);
    const container = this.createGameContainer(state, { timeTaken: elapsed });

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "reshuffled" | "wrong" | "won" | "quit" | "timeout", data?: { feedback?: string; timeTaken?: string }): ContainerBuilder {
    const stateColors: Record<string, number> = {
      active: this.defaultColor,
      reshuffled: this.defaultColor,
      wrong: 0xed4245,
      won: 0x57f287,
      quit: 0xed4245,
      timeout: 0xed4245,
    };
    const container = this.createContainer(stateColors[state]);
    let content = "";
    const formatted = this.scrambled.split("").join("  ");

    switch (state) {
      case "active":
      case "reshuffled":
      case "wrong":
        content = `## ${this.gameTitle}\n`;
        if (data?.feedback) {
          content += `> ${data.feedback}\n\n`;
        }
        content += `> Unscramble the letters below and type your guess in chat!\n\n` + `\`\`\`fix\n${formatted}\n\`\`\`\n` + `**Word Length:** \`${this.targetWord.length} letters\``;
        break;

      case "won":
        content = `## 🎉 Word Solved!\n` + `> 🏆 **GG <@${this.ctx.userId}>!**\n> You unscrambled **${this.targetWord}** in **${data?.timeTaken || "0s"}**!`;
        break;

      case "quit":
        content = `## 🛑 Game Over\n` + `> You gave up! The secret word was **${this.targetWord}**.`;
        break;

      case "timeout":
        content = `## ⏱️ Time's Up\n` + `> Session expired. The secret word was **${this.targetWord}**.`;
        break;
    }

    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    if (state === "active" || state === "reshuffled" || state === "wrong") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}reshuffle`)
          .setLabel(this.options.buttons?.reshuffle || "Reshuffle")
          .setEmoji("🔀")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}quit`)
          .setLabel(this.options.buttons?.cancel || "Give Up")
          .setEmoji("🛑")
          .setStyle(ButtonStyle.Danger),
      );
      container.addActionRowComponents(row);
    }

    return container;
  }
}
