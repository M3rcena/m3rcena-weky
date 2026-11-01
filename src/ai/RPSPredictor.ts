/**
 * Rock Paper Scissors Psychological AI Engine
 * Uses win-stay / lose-shift psychological heuristic tracking
 * to intelligently counter human move habits.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

export type RPSMove = "rock" | "paper" | "scissors";

export class RPSPredictor {
  private static readonly BEATS: Record<RPSMove, RPSMove> = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  private static readonly COUNTERS: Record<RPSMove, RPSMove> = {
    rock: "paper",
    paper: "scissors",
    scissors: "rock",
  };

  /**
   * Predicts the player's next move and returns the best counter.
   * @param playerHistory Array of moves the player has previously made.
   * @param lastPlayerOutcome Whether the player won, lost, or tied in the previous round.
   * @param difficulty "easy" (random), "medium" (frequency counter), "hard" (heuristic predictor).
   */
  public static getCounterMove(
    playerHistory: RPSMove[] = [],
    lastPlayerOutcome?: "win" | "lose" | "tie",
    difficulty: "easy" | "medium" | "hard" = "hard"
  ): RPSMove {
    const allMoves: RPSMove[] = ["rock", "paper", "scissors"];

    if (difficulty === "easy" || playerHistory.length === 0) {
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }

    if (difficulty === "medium") {
      // Counter the most frequently played move
      const counts: Record<RPSMove, number> = { rock: 0, paper: 0, scissors: 0 };
      for (const m of playerHistory) counts[m]++;
      let mostPlayed: RPSMove = "rock";
      for (const m of allMoves) {
        if (counts[m] > counts[mostPlayed]) mostPlayed = m;
      }
      return this.COUNTERS[mostPlayed];
    }

    // Hard / Heuristic:
    const lastMove = playerHistory[playerHistory.length - 1];

    if (lastPlayerOutcome === "win") {
      // Win-stay tendency: player is likely to repeat the winning move
      return this.COUNTERS[lastMove];
    } else if (lastPlayerOutcome === "lose") {
      // Lose-shift tendency: player usually shifts to the move that would have beaten the opponent
      // e.g. If player played Rock and lost to Paper, player often switches to Paper or Scissors
      const likelyMove = this.COUNTERS[lastMove];
      return this.COUNTERS[likelyMove];
    }

    // Fallback: pick the counter to what hasn't been played recently
    return this.COUNTERS[lastMove];
  }
}

