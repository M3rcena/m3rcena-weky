import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, MediaGalleryBuilder, MessageFlags } from "discord.js";
import { RenderSnake } from "../canvas/RenderSnake.js";
import { BaseGame } from "../core/BaseGame.js";
import { SnakeTypes } from "../core/Types.js";
import { clamp, getRandomString } from "../utils/Helpers.js";

interface Point {
  x: number;
  y: number;
}

export class Snake extends BaseGame<SnakeTypes> {
  private snake: Point[] = [];
  private food: Point = { x: 0, y: 0 };
  private direction: "UP" | "DOWN" | "LEFT" | "RIGHT" = "UP";
  private gridSize: number = 15;
  private score: number = 0;
  private isGameOver: boolean = false;
  private gameTitle: string;

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

  constructor(manager: any, options: SnakeTypes) {
    super(manager, options, "snake");
    const uid = getRandomString(6, "snake_");
    this.idUp = `${uid}_up`;
    this.idDown = `${uid}_down`;
    this.idLeft = `${uid}_left`;
    this.idRight = `${uid}_right`;
    this.idQuit = `${uid}_quit`;

    this.gameTitle = options.embed?.title || "Snake";
    this.defaultColor = this.resolveColor(options.embed?.color);
    this.gridSize = clamp(options.gridSize || 15, 10, 20);

    this.emojiUp = options.emojis?.up || "⬆️";
    this.emojiDown = options.emojis?.down || "⬇️";
    this.emojiLeft = options.emojis?.left || "⬅️";
    this.emojiRight = options.emojis?.right || "➡️";
    this.quitButtonLabel = options.quitButton || "Quit";

    this.defaultTimeout = options.time || manager?.defaultTimeout || 300_000;
  }

  public async start(): Promise<void> {
    this.initGame();
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    const loadingContainer = this.createGameContainer("loading");
    await this.ctx.sendInitial({
      components: [loadingContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    const buffer = await this.renderBoardImage();
    const attachment = new AttachmentBuilder(buffer, { name: "snake-board.png" });

    const activeContainer = this.createGameContainer("active", { image: "snake-board.png" });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame("timeout"));
  }

  private initGame(): void {
    const startX = Math.floor(this.gridSize / 2);
    const startY = Math.floor(this.gridSize / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX, y: startY + 1 },
      { x: startX, y: startY + 2 },
    ];
    this.direction = "UP";
    this.score = 0;
    this.isGameOver = false;
    this.spawnFood();
  }

  private spawnFood(): void {
    let valid = false;
    while (!valid) {
      const fx = Math.floor(Math.random() * this.gridSize);
      const fy = Math.floor(Math.random() * this.gridSize);
      const occupied = this.snake.some((p) => p.x === fx && p.y === fy);
      if (!occupied) {
        this.food = { x: fx, y: fy };
        valid = true;
      }
    }
  }

  private move(newDir: "UP" | "DOWN" | "LEFT" | "RIGHT"): boolean {
    const opposites: Record<string, string> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    if (opposites[this.direction] === newDir) {
      newDir = this.direction;
    }

    this.direction = newDir;
    const head = { ...this.snake[0] };

    switch (newDir) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    // Check Wall Collisions
    if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
      this.isGameOver = true;
      return false;
    }

    // Check Self Collision
    const hitBody = this.snake.some((part, i) => {
      if (i === this.snake.length - 1 && !(head.x === this.food.x && head.y === this.food.y)) return false;
      return part.x === head.x && part.y === head.y;
    });

    if (hitBody) {
      this.isGameOver = true;
      return false;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 1;
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    return true;
  }

  private async renderBoardImage(overlayTitle?: string): Promise<Buffer> {
    const userAvatar = this.ctx.user.displayAvatarURL({ extension: "png", size: 128 });
    return RenderSnake.renderBoard(this.snake, this.food, this.direction, this.score, this.gridSize, this.ctx.user.username, userAvatar, this.isGameOver, overlayTitle);
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

    let nextDir: "UP" | "DOWN" | "LEFT" | "RIGHT" | null = null;
    if (id === this.idUp) nextDir = "UP";
    else if (id === this.idDown) nextDir = "DOWN";
    else if (id === this.idLeft) nextDir = "LEFT";
    else if (id === this.idRight) nextDir = "RIGHT";

    if (!nextDir) return;

    await interaction.deferUpdate().catch(() => {});
    this.resetTimeout(() => this.endGame("timeout"));

    const alive = this.move(nextDir);
    const buffer = await this.renderBoardImage();
    const attachment = new AttachmentBuilder(buffer, { name: "snake-board.png" });

    if (!alive || this.isGameOver) {
      return this.endGame("gameover", { image: "snake-board.png", score: this.score }, attachment);
    }

    const container = this.createGameContainer("active", { image: "snake-board.png", score: this.score });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private async endGame(state: "gameover" | "quit" | "timeout" | "error", details?: { image?: string; score?: number; error?: string }, attachment?: AttachmentBuilder): Promise<void> {
    this.isActive = false;
    this.isGameOver = true;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state, this.score);

    if (!attachment && state !== "error") {
      const overlayTitle = state === "quit" ? "GAME STOPPED" : state === "timeout" ? "TIME'S UP" : "GAME OVER";
      const buffer = await this.renderBoardImage(overlayTitle);
      attachment = new AttachmentBuilder(buffer, { name: "snake-board.png" });
    }

    const container = this.createGameContainer(state, details || { score: this.score, image: "snake-board.png" });
    const files = attachment ? [attachment] : [];

    await this.ctx.edit({
      components: [container],
      files,
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "loading" | "active" | "gameover" | "quit" | "timeout" | "error", details?: { error?: string; image?: string; score?: number }): ContainerBuilder {
    const stateColors: Record<string, number> = {
      loading: this.defaultColor,
      active: this.defaultColor,
      gameover: 0xed4245,
      quit: 0xed4245,
      timeout: 0xed4245,
      error: 0xff0000,
    };
    const container = this.createContainer(stateColors[state]);
    let content = "";
    const score = details?.score ?? this.score;

    switch (state) {
      case "loading":
        content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 Starting game...`;
        break;

      case "active":
        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{score}}", score.toString()).replace("{{length}}", this.snake.length.toString()) : `## ${this.gameTitle}\n> Eat food and avoid crashing!\n\n**Score:** \`${score}\` | **Length:** \`${this.snake.length}\``;
        break;

      case "gameover":
        content = this.options.states?.gameover ? this.options.states.gameover.replace("{{score}}", score.toString()) : `## 💀 Game Over\n> The snake crashed!\n\n**Final Score:** \`${score}\``;
        break;

      case "quit":
        content = this.options.states?.quit ? this.options.states.quit.replace("{{score}}", score.toString()) : `## 🛑 Game Stopped\n> You quit the game.\n\n**Final Score:** \`${score}\``;
        break;

      case "timeout":
        content = this.options.states?.timeout ? this.options.states.timeout.replace("{{score}}", score.toString()) : `## ⏱️ Time's Up\n> Game session expired.\n\n**Final Score:** \`${score}\``;
        break;

      case "error":
        content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
        break;
    }

    content = this.applyEmbedDecorations(container, content);
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
