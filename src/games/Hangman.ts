import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, LabelBuilder, MediaGalleryBuilder, Message, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { RenderHangman } from "../canvas/RenderHangman.js";
import { BaseGame } from "../core/BaseGame.js";
import { HangmanTypes } from "../core/Types.js";
import { getRandomHangmanWord } from "../data/words.js";
import { getRandomString } from "../utils/Helpers.js";

export class Hangman extends BaseGame<HangmanTypes> {
  private targetWord: string = "";
  private category: string = "General";
  private displayWord: string = "";
  private guessedLetters: string[] = [];
  private wrongGuesses: number = 0;
  private maxMistakes: number = 6;
  private btnPrefix: string;
  private modalId: string;
  private gameTitle: string;
  private quitButtonLabel: string;

  constructor(manager: any, options: HangmanTypes) {
    super(manager, options, "hangman");
    this.btnPrefix = getRandomString(6, "hang_");
    this.modalId = `${this.btnPrefix}modal`;
    this.gameTitle = options.embed?.title || "Hangman";
    this.defaultColor = this.resolveColor(options.embed?.color);
    this.quitButtonLabel = options.quitButton || "Quit Game";
    this.maxMistakes = options.maxMistakes ?? 6;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 180_000;
  }

  public async start(): Promise<void> {
    if (this.options.word) {
      this.targetWord = this.options.word.toUpperCase().trim();
      this.category = this.options.category || "Custom";
    } else {
      const selected = getRandomHangmanWord(this.options.category);
      this.targetWord = selected.word;
      this.category = selected.category;
    }

    this.updateDisplayWord();
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    const loadingContainer = this.createGameContainer("loading");
    await this.ctx.sendInitial({
      components: [loadingContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    const buffer = await this.renderImage();
    const attachment = new AttachmentBuilder(buffer, { name: "hangman-board.png" });

    const activeContainer = this.createGameContainer("active", { image: "hangman-board.png" });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame("timeout"));
  }

  private updateDisplayWord(): void {
    this.displayWord = this.targetWord
      .split("")
      .map((char) => {
        if (!/[A-Z]/.test(char)) return char;
        return this.guessedLetters.includes(char) ? char : "_";
      })
      .join(" ");
  }

  private async renderImage(gameOver: boolean = false, won: boolean = false): Promise<Buffer> {
    const avatar = this.ctx.user.displayAvatarURL({ extension: "png", size: 128 });
    return await RenderHangman.renderCard(this.wrongGuesses, this.displayWord, this.guessedLetters, this.ctx.user.username, avatar, gameOver, won, this.targetWord);
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isButton()) {
      if (interaction.message.id !== this.ctx.gameMessage?.id) return;
      if (!this.isAuthorized(interaction)) return;

      const customId = interaction.customId;
      if (!customId.startsWith(this.btnPrefix)) return;

      const action = customId.replace(this.btnPrefix, "");

      if (action === "quit") {
        await interaction.deferUpdate().catch(() => {});
        await this.endGame("quit");
        return;
      }

      if (action === "guess") {
        const modal = new ModalBuilder().setCustomId(this.modalId).setTitle("Hangman Guess");

        const textInput = new TextInputBuilder().setCustomId("guess_input").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(this.targetWord.length).setRequired(true).setPlaceholder("e.g. A or the full word");

        const label = new LabelBuilder().setLabel("Enter a single letter or full word guess").setTextInputComponent(textInput);

        modal.addLabelComponents(label);
        await interaction.showModal(modal).catch(() => {});
        return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId !== this.modalId) return;
      if (interaction.user.id !== this.ctx.userId) return;

      await interaction.deferUpdate().catch(() => {});
      const input = interaction.fields.getTextInputValue("guess_input").toUpperCase().trim();
      await this.processGuess(input);
    }
  }

  public async onMessage(message: Message): Promise<void> {
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;

    const content = message.content.toUpperCase().trim();
    if (!content || content.startsWith("/") || content.startsWith("!")) return;

    if (content.length === 1 || content.length === this.targetWord.length) {
      if (message.deletable) await message.delete().catch(() => {});
      await this.processGuess(content);
    }
  }

  private async processGuess(guess: string): Promise<void> {
    this.resetTimeout(() => this.endGame("timeout"));

    if (guess.length > 1) {
      if (guess === this.targetWord) {
        this.guessedLetters = Array.from(new Set([...this.guessedLetters, ...this.targetWord.split("")]));
        this.updateDisplayWord();
        await this.endGame("won");
      } else {
        this.wrongGuesses += 1;
        if (this.wrongGuesses >= this.maxMistakes) {
          await this.endGame("lost");
        } else {
          await this.refreshBoard(`❌ **${guess}** is not the word! (-1 Life)`);
        }
      }
      return;
    }

    const letter = guess;
    if (this.guessedLetters.includes(letter)) {
      await this.refreshBoard(`⚠️ Letter **${letter}** has already been guessed!`);
      return;
    }

    this.guessedLetters.push(letter);

    if (this.targetWord.includes(letter)) {
      this.updateDisplayWord();
      const allRevealed = this.targetWord.split("").every((c) => !/[A-Z]/.test(c) || this.guessedLetters.includes(c));
      if (allRevealed) {
        await this.endGame("won");
      } else {
        await this.refreshBoard(`✅ Good guess! Letter **${letter}** is in the word!`);
      }
    } else {
      this.wrongGuesses += 1;
      if (this.wrongGuesses >= this.maxMistakes) {
        await this.endGame("lost");
      } else {
        await this.refreshBoard(`❌ Letter **${letter}** is not in the word! (-1 Life)`);
      }
    }
  }

  private async refreshBoard(statusNotice?: string): Promise<void> {
    const buffer = await this.renderImage();
    const attachment = new AttachmentBuilder(buffer, { name: "hangman-board.png" });

    const container = this.createGameContainer("active", {
      image: "hangman-board.png",
      statusNotice,
    });

    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private async endGame(state: "won" | "lost" | "quit" | "timeout" | "error", errorMsg?: string): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state, this.wrongGuesses);

    const isWon = state === "won";
    const isOver = state === "lost" || state === "quit" || state === "timeout";
    const buffer = await this.renderImage(isOver, isWon);
    const attachment = new AttachmentBuilder(buffer, { name: "hangman-board.png" });

    const container = this.createGameContainer(state, {
      word: this.targetWord,
      image: "hangman-board.png",
      error: errorMsg,
    });

    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "loading" | "active" | "won" | "lost" | "quit" | "timeout" | "error", details?: { error?: string; image?: string; word?: string; statusNotice?: string }): ContainerBuilder {
    const stateColors: Record<string, number> = {
      loading: this.defaultColor,
      active: this.defaultColor,
      won: 0x57f287,
      lost: 0xed4245,
      quit: 0xed4245,
      timeout: 0xed4245,
      error: 0xff0000,
    };
    const container = this.createContainer(stateColors[state]);
    let content = "";
    const revealedWord = details?.word || this.targetWord;

    switch (state) {
      case "loading":
        content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 Starting game...`;
        break;

      case "active":
        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> **Category:** \`${this.category}\`\n> Click **Guess Letter / Word** or type your guess directly in the chat!\n${details?.statusNotice ? `\n> ${details.statusNotice}` : ""}`;
        break;

      case "won":
        content = this.options.states?.won ? this.options.states.won.replace("{{word}}", revealedWord) : `## 🎉 Victory!\n> You guessed the word: **${revealedWord}**!`;
        break;

      case "lost":
        content = this.options.states?.lost ? this.options.states.lost.replace("{{word}}", revealedWord) : `## 💀 Game Over\n> The word was: **${revealedWord}**`;
        break;

      case "quit":
        content = this.options.states?.quit ? this.options.states.quit.replace("{{word}}", revealedWord) : `## 🛑 Game Stopped\n> You quit the game. The word was **${revealedWord}**`;
        break;

      case "timeout":
        content = this.options.states?.timeout ? this.options.states.timeout.replace("{{word}}", revealedWord) : `## ⏱️ Time's Up\n> Session expired. The word was: **${revealedWord}**`;
        break;

      case "error":
        content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown error.") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
        break;
    }

    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    if (details?.image) {
      const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }

    if (state === "active") {
      const guessBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}guess`).setLabel("Guess Letter / Word").setEmoji("💡").setStyle(ButtonStyle.Primary);

      const quitBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}quit`).setLabel(this.quitButtonLabel).setEmoji("🛑").setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(guessBtn, quitBtn);
      container.addActionRowComponents(row);
    }

    return container;
  }
}
