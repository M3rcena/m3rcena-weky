/**
 * TicTacToe AI Engine
 * Implements Minimax with depth penalty for optimal play,
 * plus medium and easy heuristic modes.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

export type TicTacToeCell = "X" | "O" | null;
export type TicTacToeDifficulty = "easy" | "medium" | "hard" | "unbeatable";

export class TicTacToeAI {
  private static readonly WINNING_COMBOS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  /**
   * Finds the best move index (0-8) for the AI.
   * @param board The current 3x3 board state.
   * @param aiSymbol The symbol of the AI ('X' or 'O').
   * @param difficulty AI difficulty level.
   */
  public static getBestMove(
    board: TicTacToeCell[],
    aiSymbol: "X" | "O" = "O",
    difficulty: TicTacToeDifficulty = "hard"
  ): number {
    const humanSymbol = aiSymbol === "X" ? "O" : "X";
    const availableMoves = this.getAvailableMoves(board);

    if (availableMoves.length === 0) return -1;
    if (availableMoves.length === 9) return 4; // Center is mathematically optimal opening

    if (difficulty === "easy") {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (difficulty === "medium") {
      // 50% chance to play optimal, otherwise check for immediate win/block
      if (Math.random() < 0.5) {
        return this.minimaxBestMove(board, aiSymbol, humanSymbol);
      }

      // Check immediate winning move
      for (const move of availableMoves) {
        board[move] = aiSymbol;
        if (this.checkWinner(board) === aiSymbol) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }

      // Check immediate block
      for (const move of availableMoves) {
        board[move] = humanSymbol;
        if (this.checkWinner(board) === humanSymbol) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }

      // Center preference or random
      if (board[4] === null) return 4;
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // "hard" or "unbeatable": 100% Minimax
    return this.minimaxBestMove(board, aiSymbol, humanSymbol);
  }

  private static minimaxBestMove(
    board: TicTacToeCell[],
    aiSymbol: "X" | "O",
    humanSymbol: "X" | "O"
  ): number {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (const move of this.getAvailableMoves(board)) {
      board[move] = aiSymbol;
      const score = this.minimax(board, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
      board[move] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private static minimax(
    board: TicTacToeCell[],
    depth: number,
    isMaximizing: boolean,
    aiSymbol: "X" | "O",
    humanSymbol: "X" | "O",
    alpha: number,
    beta: number
  ): number {
    const winner = this.checkWinner(board);
    if (winner === aiSymbol) return 10 - depth;
    if (winner === humanSymbol) return depth - 10;
    if (this.isBoardFull(board)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of this.getAvailableMoves(board)) {
        board[move] = aiSymbol;
        const evaluation = this.minimax(board, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
        board[move] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of this.getAvailableMoves(board)) {
        board[move] = humanSymbol;
        const evaluation = this.minimax(board, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
        board[move] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  public static checkWinner(board: TicTacToeCell[]): TicTacToeCell {
    for (const [a, b, c] of this.WINNING_COMBOS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  public static isBoardFull(board: TicTacToeCell[]): boolean {
    return board.every((cell) => cell !== null);
  }

  public static getAvailableMoves(board: TicTacToeCell[]): number[] {
    const moves: number[] = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) moves.push(i);
    }
    return moves;
  }
}

