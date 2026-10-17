import { GameControlRow } from "../core/ControlTypes.js";

export interface TicTacToeEngineOptions {
  playerX: { id: string; username: string };
  playerO: { id: string; username: string };
}

export interface TicTacToeState {
  board: (string | null)[];
  currentTurnId: string;
  winner: string | null;
  isDraw: boolean;
  isGameOver: boolean;
}

/**
 * Headless Tic Tac Toe engine for dashboards and web interfaces.
 */
export class TicTacToeEngine {
  private board: (string | null)[] = Array(9).fill(null);
  private playerX: { id: string; username: string };
  private playerO: { id: string; username: string };
  private currentTurnId: string;
  private winner: string | null = null;
  private isDraw: boolean = false;
  private isGameOver: boolean = false;

  constructor(options?: TicTacToeEngineOptions) {
    this.playerX = options?.playerX || { id: "X", username: "Player X" };
    this.playerO = options?.playerO || { id: "O", username: "Player O" };
    this.currentTurnId = this.playerX.id;
  }

  public reset(): void {
    this.board = Array(9).fill(null);
    this.currentTurnId = this.playerX.id;
    this.winner = null;
    this.isDraw = false;
    this.isGameOver = false;
  }

  /**
   * Places a mark on the board. Supports (row, col) or flat index (0-8).
   * Automatically uses currentTurnId if playerId is omitted.
   */
  public move(rowOrIndex: number, colOrPlayerId?: number | string, playerId?: string): { success: boolean; winner?: string | null; isDraw?: boolean; isWon?: boolean; isGameOver?: boolean } {
    let index: number;
    let actualPlayerId: string;

    if (typeof colOrPlayerId === "number") {
      index = rowOrIndex * 3 + colOrPlayerId;
      actualPlayerId = playerId || this.currentTurnId;
    } else {
      index = rowOrIndex;
      actualPlayerId = (colOrPlayerId as string) || this.currentTurnId;
    }

    const res = this.place(index, actualPlayerId);
    return {
      success: res.success,
      winner: this.winner,
      isWon: !!this.winner,
      isDraw: this.isDraw,
      isGameOver: this.isGameOver,
    };
  }

  public place(index: number, playerId: string): { success: boolean; winner?: string; isDraw?: boolean } {
    if (this.isGameOver || index < 0 || index > 8 || this.board[index] !== null) {
      return { success: false };
    }
    if (playerId !== this.currentTurnId) {
      return { success: false };
    }

    const symbol = playerId === this.playerX.id ? "X" : "O";
    this.board[index] = symbol;

    if (this.checkWin(symbol)) {
      this.winner = playerId;
      this.isGameOver = true;
      return { success: true, winner: playerId };
    }

    if (this.board.every((cell) => cell !== null)) {
      this.isDraw = true;
      this.isGameOver = true;
      return { success: true, isDraw: true };
    }

    this.currentTurnId = playerId === this.playerX.id ? this.playerO.id : this.playerX.id;
    return { success: true };
  }

  private checkWin(symbol: string): boolean {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // cols
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ];
    return lines.some(([a, b, c]) => this.board[a] === symbol && this.board[b] === symbol && this.board[c] === symbol);
  }

  public getState(): TicTacToeState {
    return {
      board: [...this.board],
      currentTurnId: this.currentTurnId,
      winner: this.winner,
      isDraw: this.isDraw,
      isGameOver: this.isGameOver,
    };
  }

  public getControls(): GameControlRow[] {
    const rows: GameControlRow[] = [];
    for (let r = 0; r < 3; r++) {
      const components = [];
      for (let c = 0; c < 3; c++) {
        const idx = r * 3 + c;
        const val = this.board[idx];
        components.push({
          id: String(idx),
          label: val || " ",
          emoji: val === "X" ? "❌" : val === "O" ? "⭕" : undefined,
          style: val === "X" ? ("danger" as const) : val === "O" ? ("primary" as const) : ("secondary" as const),
          disabled: this.isGameOver || val !== null,
        });
      }
      rows.push({ components });
    }
    return rows;
  }
}
