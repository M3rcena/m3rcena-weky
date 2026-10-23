import { ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, Message, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { ChaosTypes } from "../core/Types.js";
import { getRandomWords } from "../data/words.js";
import { getRandomString } from "../utils/Helpers.js";

export class ChaosWords extends BaseGame<ChaosTypes> {
  private words: string[] = [];
  private remainingWords: string[] = [];
  private foundWords: string[] = [];
  private chaosArray: string[] = [];
  private chaosString: string = "";
  private triesLeft: number = 10;
  private maxTries: number = 10;
  private btnPrefix: string;
  private gameTitle: string;

  constructor(manager: any, options: ChaosTypes) {
    super(manager, options, "chaos");
    this.btnPrefix = getRandomString(6, "chaos_");
    this.gameTitle = options.embed?.title || "Chaos Words";
    this.defaultColor = this.resolveColor(options.embed?.color);
    this.maxTries = options.maxTries || 10;
    this.triesLeft = this.maxTries;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 60_000;
  }

  public async start(): Promise<void> {
    const wordCount = this.options.maxWords || (this.options.words && this.options.words.length) || 4;
    if (this.options.words && this.options.words.length > 0) {
      this.words = this.options.words.slice(0, wordCount).map((w) => w.toLowerCase().trim());
    } else {
      this.words = getRandomWords(wordCount).map((w) => w.toLowerCase());
    }

    this.remainingWords = [...this.words];
    this.foundWords = [];
    this.chaosString = this.generateChaosString();

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

  private generateChaosString(): string {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const totalWordLength = this.words.join("").length;
    const charCount = this.options.charCount || this.options.charGenerated || totalWordLength + 12;

    this.chaosArray = [];
    for (let i = 0; i < charCount; i++) {
      this.chaosArray.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }

    for (const word of this.words) {
      const pos = Math.floor(Math.random() * this.chaosArray.length);
      this.chaosArray.splice(pos, 0, word);
    }

    return this.chaosArray.join("");
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

    const guess = message.content.toLowerCase().trim();
    if (guess.startsWith("/") || guess.startsWith("!")) return;

    if (message.deletable) await message.delete().catch(() => {});
    this.resetTimeout(() => this.endGame("timeout"));

    if (this.foundWords.includes(guess)) {
      const container = this.createGameContainer("repeat", { feedback: `⚠️ You already found **${guess}**!` });
      await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
      return;
    }

    if (this.remainingWords.includes(guess)) {
      this.foundWords.push(guess);
      this.remainingWords = this.remainingWords.filter((w) => w !== guess);

      const indexInChaos = this.chaosArray.indexOf(guess);
      if (indexInChaos > -1) {
        this.chaosArray.splice(indexInChaos, 1);
      }
      this.chaosString = this.chaosArray.join("");

      if (this.remainingWords.length === 0) {
        await this.endGame("won");
        return;
      }

      const container = this.createGameContainer("correct", { feedback: `✅ **Correct!** You uncovered **${guess}**!` });
      await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } else {
      this.triesLeft -= 1;
      if (this.triesLeft <= 0) {
        await this.endGame("lost");
        return;
      }

      const container = this.createGameContainer("wrong", { feedback: `❌ **${guess}** is not in the hidden words! (-1 Try)` });
      await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }

  private async endGame(state: "won" | "lost" | "cancelled" | "timeout"): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state, this.foundWords.length);

    const container = this.createGameContainer(state);
    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "correct" | "wrong" | "repeat" | "won" | "lost" | "cancelled" | "timeout", details?: { feedback?: string }): ContainerBuilder {
    const stateColors: Record<string, number> = {
      active: this.defaultColor,
      correct: 0x57f287,
      wrong: 0xed4245,
      repeat: this.defaultColor,
      won: 0x57f287,
      lost: 0xed4245,
      cancelled: 0xed4245,
      timeout: 0xed4245,
    };
    const container = this.createContainer(stateColors[state]);
    let content = "";

    const wordsFoundStr = this.foundWords.length > 0 ? this.foundWords.map((w) => `\`${w}\``).join(", ") : "*None yet*";

    switch (state) {
      case "active":
      case "correct":
      case "wrong":
      case "repeat":
        content = `## ${this.gameTitle}\n`;
        if (details?.feedback) {
          content += `> ${details.feedback}\n\n`;
        }
        content += `> Find **${this.words.length}** hidden words in the scrambled text below!\n\n` + `\`\`\`fix\n${this.chaosString}\n\`\`\`\n` + `**Words Found:** ${wordsFoundStr}\n` + `**Remaining Words:** \`${this.remainingWords.length}\`\n` + `**Tries Left:** \`${this.triesLeft} / ${this.maxTries}\``;
        break;

      case "won":
        content = this.options.winMessage
          ? `## 🏆 Word Master!\n> ${this.options.winMessage}`
          : `## 🏆 Word Master!\n` + `> 🎉 **Congratulations!** You found all hidden words:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;

      case "lost":
        content = this.options.loseMessage
          ? `## ❌ Out of Tries\n> ${this.options.loseMessage}`
          : `## ❌ Out of Tries\n` + `> 💀 You ran out of attempts! The hidden words were:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;

      case "cancelled":
        content = `## 🛑 Game Cancelled\n` + `> You stopped the game. The hidden words were:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;

      case "timeout":
        content = `## ⏱️ Time's Up\n` + `> Session expired. The hidden words were:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;
    }

    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    if (state === "active" || state === "correct" || state === "wrong" || state === "repeat") {
      const cancelBtn = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(this.options.cancelButton || this.options.buttonText || "Cancel")
        .setEmoji("🛑")
        .setCustomId(`${this.btnPrefix}cancel`);
      container.addActionRowComponents((row) => row.setComponents(cancelBtn));
    }

    return container;
  }
}
