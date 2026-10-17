import { Render2048 } from "../canvas/Render2048.js";
import { WekyCanvas } from "../canvas/WekyCanvas.js";
import { GameControlRow } from "../core/ControlTypes.js";

export interface Game2048EngineOptions {
  username?: string;
  avatarUrl?: string;
}

export interface Game2048State {
  board: number[][];
  score: number;
  hasWon: boolean;
  isGameOver: boolean;
  moveCount: number;
}

/**
 * Headless 2048 game engine for web dashboards, custom bots, and REST/WebSocket APIs.
 */
export class Game2048Engine {
  private board: number[][] = [];
  private score: number = 0;
  private hasWon: boolean = false;
  private isGameOver: boolean = false;
  private moveCount: number = 0;
  private username: string;
  private avatarUrl: string;

  constructor(options?: Game2048EngineOptions) {
    this.username = options?.username || "Player";
    this.avatarUrl = options?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
    this.reset();
  }

  /**
   * Resets the game to an initial state with 2 spawned tiles.
   */
  public reset(): void {
    this.board = Array(4)
      .fill(0)
      .map(() => Array(4).fill(0));
    this.score = 0;
    this.hasWon = false;
    this.isGameOver = false;
    this.moveCount = 0;
    this.spawnTile();
    this.spawnTile();
  }

  /**
   * Spawns a random tile (2 with 90% probability, 4 with 10% probability).
   */
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

  /**
   * Performs a slide move in the specified direction.
   * @returns `true` if the board moved/changed, `false` otherwise.
   */
  public move(direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): boolean {
    if (this.isGameOver) return false;

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
      this.moveCount++;
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

  /**
   * Returns a snapshot of the current game state.
   */
  public getState(): Game2048State {
    return {
      board: this.board.map((r) => [...r]),
      score: this.score,
      hasWon: this.hasWon,
      isGameOver: this.isGameOver,
      moveCount: this.moveCount,
    };
  }

  /**
   * Returns control buttons suitable for web dashboards or UI rendering.
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
   * Renders the current board as a PNG buffer.
   */
  public async renderCard(customState?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer> {
    const state = customState || (this.hasWon ? "won" : this.isGameOver ? "gameover" : "active");
    return Render2048.renderBoard(this.board, this.score, this.username, this.avatarUrl, state);
  }

  /**
   * Renders the current board directly as a Data URL string (`data:image/png;base64,...`).
   */
  public async renderDataURL(customState?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<string> {
    const buffer = await this.renderCard(customState);
    return WekyCanvas.toDataURL(buffer);
  }
}
