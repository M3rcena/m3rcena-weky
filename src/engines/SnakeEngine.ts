import { RenderSnake } from "../canvas/RenderSnake.js";
import { WekyCanvas } from "../canvas/WekyCanvas.js";
import { GameControlRow } from "../core/ControlTypes.js";

export interface SnakeEngineOptions {
  gridSize?: number;
  username?: string;
  avatarUrl?: string;
}

export interface SnakeState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  score: number;
  length: number;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  isGameOver: boolean;
}

/**
 * Headless Snake game engine for web dashboards and custom APIs.
 */
export class SnakeEngine {
  private snake: { x: number; y: number }[] = [];
  private food: { x: number; y: number } = { x: 0, y: 0 };
  private direction: "UP" | "DOWN" | "LEFT" | "RIGHT" = "RIGHT";
  private score: number = 0;
  private isGameOver: boolean = false;
  private gridSize: number;
  private username: string;
  private avatarUrl: string;

  constructor(options?: SnakeEngineOptions) {
    this.gridSize = options?.gridSize || 15;
    this.username = options?.username || "Player";
    this.avatarUrl = options?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
    this.reset();
  }

  /**
   * Resets the snake game to starting state.
   */
  public reset(): void {
    const center = Math.floor(this.gridSize / 2);
    this.snake = [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ];
    this.direction = "RIGHT";
    this.score = 0;
    this.isGameOver = false;
    this.spawnFood();
  }

  private spawnFood(): void {
    let valid = false;
    while (!valid) {
      const fx = Math.floor(Math.random() * this.gridSize);
      const fy = Math.floor(Math.random() * this.gridSize);
      const occupied = this.snake.some((part) => part.x === fx && part.y === fy);
      if (!occupied) {
        this.food = { x: fx, y: fy };
        valid = true;
      }
    }
  }

  /**
   * Moves the snake one step in the specified direction.
   * Prevents instant reverse into own neck.
   */
  public move(newDir: "UP" | "DOWN" | "LEFT" | "RIGHT"): boolean {
    if (this.isGameOver) return false;

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

    // Wall collision
    if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
      this.isGameOver = true;
      return false;
    }

    // Body collision
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

  /**
   * Sets next direction without immediately advancing.
   */
  public changeDirection(newDir: "UP" | "DOWN" | "LEFT" | "RIGHT"): void {
    const opposites: Record<string, string> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    if (opposites[this.direction] !== newDir) {
      this.direction = newDir;
    }
  }

  /**
   * Advances snake by one frame/step. Ideal for timer loops.
   */
  public step(dir?: "UP" | "DOWN" | "LEFT" | "RIGHT"): { isAlive: boolean; isGameOver: boolean; score: number } {
    const moved = this.move(dir || this.direction);
    return {
      isAlive: moved,
      isGameOver: this.isGameOver,
      score: this.score,
    };
  }

  /**
   * Returns current snapshot of the snake state.
   */
  public getState(): SnakeState {
    return {
      snake: this.snake.map((p) => ({ ...p })),
      food: { ...this.food },
      score: this.score,
      length: this.snake.length,
      direction: this.direction,
      isGameOver: this.isGameOver,
    };
  }

  /**
   * Returns control buttons schema.
   */
  public getControls(): GameControlRow[] {
    const disabled = this.isGameOver;
    return [
      {
        components: [
          { id: "blank_1", label: " ", style: "secondary", disabled: true },
          { id: "up", label: "Up", emoji: "⬆️", style: "primary", disabled },
          { id: "blank_2", label: " ", style: "secondary", disabled: true },
          { id: "quit", label: "Quit", emoji: "🛑", style: "danger", disabled },
        ],
      },
      {
        components: [
          { id: "left", label: "Left", emoji: "⬅️", style: "primary", disabled },
          { id: "down", label: "Down", emoji: "⬇️", style: "primary", disabled },
          { id: "right", label: "Right", emoji: "➡️", style: "primary", disabled },
        ],
      },
    ];
  }

  /**
   * Renders the current snake board as a PNG buffer.
   */
  public async renderCard(overlayTitle?: string): Promise<Buffer> {
    return RenderSnake.renderBoard(this.snake, this.food, this.direction, this.score, this.gridSize, this.username, this.avatarUrl, this.isGameOver, overlayTitle);
  }

  /**
   * Renders the snake board as a Data URL string.
   */
  public async renderDataURL(overlayTitle?: string): Promise<string> {
    const buffer = await this.renderCard(overlayTitle);
    return WekyCanvas.toDataURL(buffer);
  }
}
