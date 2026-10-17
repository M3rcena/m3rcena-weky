import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, MediaGalleryBuilder, MessageFlags } from "discord.js";
import { Render2048 } from "../canvas/Render2048.js";
import { BaseGame } from "../core/BaseGame.js";
import { Types2048 } from "../core/Types.js";
import { getRandomString, safeResolveColor } from "../utils/Helpers.js";

export class Game2048 extends BaseGame<Types2048> {
  private board: number[][] = [];
  private score: number = 0;
  private hasWon: boolean = false;
  private isGameOver: boolean = false;
  private gameTitle: string;
  private defaultColor: number;

  private emojiUp: string;
  private emojiDown: string;
  private emojiLeft: string;
  private emojiRight: string;
  private quitButtonLabel: string;

  private idUp: string;
  private idDown: string;
  private idLeft: string;
  private idRight: string;
  private idQuit: string;

  constructor(manager: any, options: Types2048) {
    super(manager, options, "2048");
    const uid = getRandomString(6, "2048_");
    this.idUp = `${uid}_up`;
    this.idDown = `${uid}_down`;
    this.idLeft = `${uid}_left`;
    this.idRight = `${uid}_right`;
    this.idQuit = `${uid}_quit`;

    this.gameTitle = options.embed?.title || "2048";
    this.defaultColor = safeResolveColor(options.embed?.color, 0x5865f2);

    this.emojiUp = options.emojis?.up || "⬆️";
    this.emojiDown = options.emojis?.down || "⬇️";
    this.emojiLeft = options.emojis?.left || "⬅️";
    this.emojiRight = options.emojis?.right || "➡️";
    this.quitButtonLabel = options.quitButton || "Quit";

    this.defaultTimeout = options.time || 300_000;
  }

  public async start(): Promise<void> {
    this.initBoard();
    this.isActive = true;
    this.manager._eventManager.register(this);

    const initialContainer = this.createGameContainer("loading");
    await this.ctx.sendInitial({
      components: [initialContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    const boardBuffer = await this.renderBoardImage();
    const attachment = new AttachmentBuilder(boardBuffer, { name: "2048-board.png" });

    const activeContainer = this.createGameContainer("active", { image: "2048-board.png", score: this.score });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame("timeout"));
  }

  private initBoard(): void {
    this.board = Array(4)
      .fill(0)
      .map(() => Array(4).fill(0));
    this.score = 0;
    this.hasWon = false;
    this.isGameOver = false;

    this.spawnTile();
    this.spawnTile();
  }

  private spawnTile(): void {
    const empty: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const spot = empty[Math.floor(Math.random() * empty.length)];
      this.board[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  private async renderBoardImage(endingState?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer> {
    const avatar = this.ctx.user.displayAvatarURL({ extension: "png", size: 128 });
    const state = endingState || (this.hasWon ? "won" : this.isGameOver ? "gameover" : "active");
    return Render2048.renderBoard(this.board, this.score, this.ctx.user.username, avatar, state);
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;

    if (!this.isAuthorized(interaction)) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;

    const id = interaction.customId;
    if (id === this.idQuit) {
      await interaction.deferUpdate().catch(() => {});
      return this.endGame("quit");
    }

    let direction: "UP" | "DOWN" | "LEFT" | "RIGHT" | null = null;
    if (id === this.idUp) direction = "UP";
    else if (id === this.idDown) direction = "DOWN";
    else if (id === this.idLeft) direction = "LEFT";
    else if (id === this.idRight) direction = "RIGHT";

    if (!direction) return;

    await interaction.deferUpdate().catch(() => {});
    this.resetTimeout(() => this.endGame("timeout"));

    const moved = this.move(direction);
    if (!moved) return;

    const buffer = await this.renderBoardImage();
    const attachment = new AttachmentBuilder(buffer, { name: "2048-board.png" });

    if (this.hasWon) {
      return this.endGame("won", { image: "2048-board.png", score: this.score }, attachment);
    }
    if (this.isGameOver) {
      return this.endGame("gameover", { image: "2048-board.png", score: this.score }, attachment);
    }

    const container = this.createGameContainer("active", { image: "2048-board.png", score: this.score });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private move(direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): boolean {
    let moved = false;
    let scoreGained = 0;
    let newBoard = this.board.map((row) => [...row]);

    const processRow = (row: number[]): number[] => {
      let filtered = row.filter((v) => v !== 0);
      let merged: number[] = [];
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const combined = filtered[i] * 2;
          merged.push(combined);
          scoreGained += combined;
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      return merged;
    };

    if (direction === "LEFT") {
      newBoard = newBoard.map((row) => {
        const nr = processRow(row);
        if (nr.join(",") !== row.join(",")) moved = true;
        return nr;
      });
    } else if (direction === "RIGHT") {
      newBoard = newBoard.map((row) => {
        const rev = [...row].reverse();
        const nr = processRow(rev);
        if (nr.join(",") !== rev.join(",")) moved = true;
        return nr.reverse();
      });
    } else if (direction === "UP") {
      let trans = this.transpose(newBoard);
      trans = trans.map((row) => {
        const nr = processRow(row);
        if (nr.join(",") !== row.join(",")) moved = true;
        return nr;
      });
      newBoard = this.transpose(trans);
    } else if (direction === "DOWN") {
      let trans = this.transpose(newBoard);
      trans = trans.map((row) => {
        const rev = [...row].reverse();
        const nr = processRow(rev);
        if (nr.join(",") !== rev.join(",")) moved = true;
        return nr.reverse();
      });
      newBoard = this.transpose(trans);
    }

    if (moved) {
      this.board = newBoard;
      this.score += scoreGained;
      this.spawnTile();

      if (!this.hasWon && this.checkWon()) this.hasWon = true;
      if (this.checkGameOver()) this.isGameOver = true;
    }

    return moved;
  }

  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, col) => matrix.map((row) => row[col]));
  }

  private checkWon(): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] >= 2048) return true;
      }
    }
    return false;
  }

  private checkGameOver(): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) return false;
        if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return false;
        if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return false;
      }
    }
    return true;
  }

  private async endGame(state: "won" | "gameover" | "quit" | "timeout" | "error", details?: { image?: string; score?: number; error?: string }, attachment?: AttachmentBuilder): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    if (!attachment && state !== "error") {
      const buffer = await this.renderBoardImage(state);
      attachment = new AttachmentBuilder(buffer, { name: "2048-board.png" });
    }

    const container = this.createGameContainer(state, details || { score: this.score, image: "2048-board.png" });
    const files = attachment ? [attachment] : [];

    await this.ctx.edit({
      components: [container],
      files,
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "loading" | "active" | "won" | "gameover" | "quit" | "timeout" | "error", details?: { error?: string; image?: string; score?: number }): ContainerBuilder {
    const container = new ContainerBuilder();
    let content = "";
    const score = details?.score ?? this.score;

    switch (state) {
      case "loading":
        container.setAccentColor(this.defaultColor);
        content = this.options.loadingMessage ? this.options.loadingMessage.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 Starting game...`;
        break;

      case "active":
        container.setAccentColor(this.defaultColor);
        content = this.options.activeMessage ? this.options.activeMessage.replace("{{gameTitle}}", this.gameTitle).replace("{{score}}", score.toString()) : `## ${this.gameTitle}\n> Combine the tiles to reach **2048**!\n\n**Score:** \`${score}\``;
        break;

      case "won":
        container.setAccentColor(0x57f287);
        content = this.options.wonMessage ? this.options.wonMessage.replace("{{score}}", score.toString()) : `## 🎉 You Won!\n> You reached the **2048** tile!\n\n**Final Score:** \`${score}\``;
        break;

      case "gameover":
        container.setAccentColor(0xed4245);
        content = this.options.gameoverMessage ? this.options.gameoverMessage.replace("{{score}}", score.toString()) : `## 💀 Game Over\n> No more moves available.\n\n**Final Score:** \`${score}\``;
        break;

      case "quit":
        container.setAccentColor(0xed4245);
        content = this.options.quitMessage ? this.options.quitMessage.replace("{{score}}", score.toString()) : `## 🛑 Game Stopped\n> You quit the game.\n\n**Final Score:** \`${score}\``;
        break;

      case "timeout":
        container.setAccentColor(0xed4245);
        content = this.options.timeoutMessage ? this.options.timeoutMessage.replace("{{score}}", score.toString()) : `## ⏱️ Time's Up\n> Game session expired.\n\n**Final Score:** \`${score}\``;
        break;

      case "error":
        container.setAccentColor(0xff0000);
        content = this.options.errorMessage ? this.options.errorMessage.replace("{{error}}", details?.error || "Unknown") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
        break;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));

    if (details?.image) {
      const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }

    if (state !== "loading" && state !== "error") {
      const isDisabled = state !== "active";
      const up = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiUp).setCustomId(this.idUp).setDisabled(isDisabled);
      const down = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiDown).setCustomId(this.idDown).setDisabled(isDisabled);
      const left = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiLeft).setCustomId(this.idLeft).setDisabled(isDisabled);
      const right = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiRight).setCustomId(this.idRight).setDisabled(isDisabled);
      const quit = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.quitButtonLabel).setCustomId(this.idQuit).setEmoji("🛑").setDisabled(isDisabled);

      const dis1 = new ButtonBuilder().setLabel("\u200b").setStyle(ButtonStyle.Secondary).setCustomId("dis1").setDisabled(true);
      const dis2 = new ButtonBuilder().setLabel("\u200b").setStyle(ButtonStyle.Secondary).setCustomId("dis2").setDisabled(true);

      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(dis1, up, dis2, quit);
      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(left, down, right);

      container.addActionRowComponents(row1);
      container.addActionRowComponents(row2);
    }

    return container;
  }
}
