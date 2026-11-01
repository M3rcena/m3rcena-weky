/**
 * ELO & High-Score Leaderboard Engine
 * Provides plug-and-play ELO rating calculations, streak tracking, and score storage.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

export interface LeaderboardPlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  highestStreak: number;
  scores: Record<string, number>;
  lastPlayed: number;
}

export interface EloChangeResult {
  p1Change: number;
  p2Change: number;
  p1NewElo: number;
  p2NewElo: number;
}

export interface LeaderboardStorageAdapter {
  get(userId: string): Promise<LeaderboardPlayer | undefined> | LeaderboardPlayer | undefined;
  set(userId: string, data: LeaderboardPlayer): Promise<void> | void;
  getAll(): Promise<LeaderboardPlayer[]> | LeaderboardPlayer[];
}

export interface CustomPointingMatchContext {
  p1: LeaderboardPlayer;
  p2: LeaderboardPlayer;
  result: "p1" | "p2" | "draw";
  game?: string;
  kFactor?: number;
}

export interface CustomPointingScoreContext {
  player: LeaderboardPlayer;
  game: string;
  score: number;
}

export type CustomPointingMatchHandler = (
  ctx: CustomPointingMatchContext
) => EloChangeResult | { p1Change: number; p2Change: number; p1NewElo?: number; p2NewElo?: number };

export type CustomPointingScoreHandler = (
  ctx: CustomPointingScoreContext
) => number;

export interface LeaderboardPointingOptions {
  /** Optional custom pointing calculation function for PvP matches */
  calculateMatchPoints?: CustomPointingMatchHandler;
  /** Optional flat points awarded on a victory */
  winPoints?: number;
  /** Optional flat points deducted on a defeat */
  lossPoints?: number;
  /** Optional flat points awarded on a draw */
  drawPoints?: number;
  /** Optional bonus points awarded per active streak number */
  streakBonus?: number;
  /** Optional custom pointing calculation function for solo game scores */
  calculateSoloPoints?: CustomPointingScoreHandler;
}

export interface LeaderboardManagerOptions {
  /** Default starting ELO for new players (default: 1200) */
  defaultElo?: number;
  /** Default K-factor for ELO variance (default: 32) */
  kFactor?: number;
  /** Custom persistent storage adapter (e.g. Database, Quick.db, Enmap, SQLite) */
  storageAdapter?: LeaderboardStorageAdapter;
  /** Optional developer-defined custom pointing formula (falls back to standard FIDE ELO if omitted) */
  pointing?: LeaderboardPointingOptions;
  /** Optional reference to WekyManager for event telemetry */
  wekyManager?: any;
}

export class LeaderboardManager {
  private players: Map<string, LeaderboardPlayer> = new Map();
  public defaultElo: number;
  public defaultKFactor: number;
  public pointing?: LeaderboardPointingOptions;
  private storageAdapter?: LeaderboardStorageAdapter;
  public wekyManager?: any;

  constructor(options: LeaderboardManagerOptions = {}) {
    this.defaultElo = options.defaultElo ?? 1200;
    this.defaultKFactor = options.kFactor ?? 32;
    this.storageAdapter = options.storageAdapter;
    this.pointing = options.pointing;
    this.wekyManager = options.wekyManager;
  }

  /**
   * Calculates ELO rating adjustments using the standard international FIDE ELO formula.
   *
   * @param playerElo Rating of Player 1
   * @param opponentElo Rating of Player 2
   * @param outcome 1 for player 1 win, 0.5 for draw, 0 for player 1 loss
   * @param kFactor Weight factor (default: 32)
   */
  public static calculateElo(
    playerElo: number,
    opponentElo: number,
    outcome: 1 | 0.5 | 0,
    kFactor: number = 32
  ): EloChangeResult {
    const expectedP1 = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const expectedP2 = 1 - expectedP1;

    const actualP1 = outcome;
    const actualP2 = 1 - outcome;

    const p1Change = Math.round(kFactor * (actualP1 - expectedP1));
    const p2Change = Math.round(kFactor * (actualP2 - expectedP2));

    return {
      p1Change,
      p2Change,
      p1NewElo: Math.max(100, playerElo + p1Change),
      p2NewElo: Math.max(100, opponentElo + p2Change),
    };
  }

  /**
   * Retrieves or initializes stats for a player.
   */
  public async getPlayer(
    userId: string,
    username: string = "Unknown Player",
    avatarUrl?: string
  ): Promise<LeaderboardPlayer> {
    if (this.storageAdapter) {
      const stored = await this.storageAdapter.get(userId);
      if (stored) {
        if (username !== "Unknown Player") stored.username = username;
        if (avatarUrl) stored.avatarUrl = avatarUrl;
        return stored;
      }
    }

    let player = this.players.get(userId);
    if (!player) {
      player = {
        id: userId,
        username,
        avatarUrl,
        elo: this.defaultElo,
        wins: 0,
        losses: 0,
        draws: 0,
        winStreak: 0,
        highestStreak: 0,
        scores: {},
        lastPlayed: Date.now(),
      };
      this.players.set(userId, player);
      if (this.storageAdapter) {
        await this.storageAdapter.set(userId, player);
      }
    } else {
      if (username !== "Unknown Player") player.username = username;
      if (avatarUrl) player.avatarUrl = avatarUrl;
    }

    return player;
  }

  /**
   * Records a 1v1 match outcome between two players and updates their ratings and streaks.
   * If custom pointing is configured (or passed in options), it executes the developer formula;
   * otherwise it defaults to international FIDE ELO.
   */
  public async recordMatch(
    p1Id: string,
    p2Id: string,
    result: "p1" | "p2" | "draw",
    options: {
      p1Username?: string;
      p2Username?: string;
      p1Avatar?: string;
      p2Avatar?: string;
      game?: string;
      kFactor?: number;
      pointing?: LeaderboardPointingOptions;
    } = {}
  ): Promise<EloChangeResult> {
    const p1 = await this.getPlayer(p1Id, options.p1Username, options.p1Avatar);
    const p2 = await this.getPlayer(p2Id, options.p2Username, options.p2Avatar);

    const oldP1Elo = p1.elo;
    const oldP2Elo = p2.elo;

    const pointing = options.pointing || this.pointing;
    let eloResult: EloChangeResult;

    if (pointing?.calculateMatchPoints) {
      const customRes = pointing.calculateMatchPoints({
        p1,
        p2,
        result,
        game: options.game,
        kFactor: options.kFactor ?? this.defaultKFactor,
      });
      eloResult = {
        p1Change: customRes.p1Change,
        p2Change: customRes.p2Change ?? 0,
        p1NewElo: customRes.p1NewElo ?? Math.max(0, p1.elo + customRes.p1Change),
        p2NewElo: customRes.p2NewElo ?? Math.max(0, p2.elo + (customRes.p2Change ?? 0)),
      };
    } else if (pointing?.winPoints !== undefined) {
      const p1Bonus = result === "p1" ? (p1.winStreak * (pointing.streakBonus || 0)) : 0;
      const p2Bonus = result === "p2" ? (p2.winStreak * (pointing.streakBonus || 0)) : 0;
      const p1Change = result === "p1" ? pointing.winPoints + p1Bonus : result === "draw" ? (pointing.drawPoints ?? 0) : -(pointing.lossPoints ?? 0);
      const p2Change = result === "p2" ? pointing.winPoints + p2Bonus : result === "draw" ? (pointing.drawPoints ?? 0) : -(pointing.lossPoints ?? 0);
      eloResult = {
        p1Change,
        p2Change,
        p1NewElo: Math.max(0, p1.elo + p1Change),
        p2NewElo: Math.max(0, p2.elo + p2Change),
      };
    } else {
      const k = options.kFactor ?? this.defaultKFactor;
      const outcome = result === "p1" ? 1 : result === "draw" ? 0.5 : 0;
      eloResult = LeaderboardManager.calculateElo(p1.elo, p2.elo, outcome, k);
    }

    p1.elo = eloResult.p1NewElo;
    p2.elo = eloResult.p2NewElo;
    p1.lastPlayed = Date.now();
    p2.lastPlayed = Date.now();

    if (result === "p1") {
      p1.wins++;
      p1.winStreak++;
      if (p1.winStreak > p1.highestStreak) p1.highestStreak = p1.winStreak;
      p2.losses++;
      p2.winStreak = 0;
    } else if (result === "p2") {
      p2.wins++;
      p2.winStreak++;
      if (p2.winStreak > p2.highestStreak) p2.highestStreak = p2.winStreak;
      p1.losses++;
      p1.winStreak = 0;
    } else {
      p1.draws++;
      p2.draws++;
      p1.winStreak = 0;
      p2.winStreak = 0;
    }

    if (this.storageAdapter) {
      await this.storageAdapter.set(p1.id, p1);
      await this.storageAdapter.set(p2.id, p2);
    }

    // Emit telemetry events if WekyManager is connected
    if (this.wekyManager && typeof this.wekyManager.emit === "function") {
      this.wekyManager.emit("leaderboardUpdate", {
        userId: p1.id,
        username: p1.username,
        game: options.game || "pvp",
        oldValue: oldP1Elo,
        newValue: p1.elo,
        change: eloResult.p1Change,
        isWin: result === "p1",
        streak: p1.winStreak,
      });
      this.wekyManager.emit("leaderboardUpdate", {
        userId: p2.id,
        username: p2.username,
        game: options.game || "pvp",
        oldValue: oldP2Elo,
        newValue: p2.elo,
        change: eloResult.p2Change,
        isWin: result === "p2",
        streak: p2.winStreak,
      });
    }

    return eloResult;
  }

  /**
   * Records a solo arcade score (e.g. 2048, Snake, FastType).
   * Updates player's personal best if beaten.
   */
  public async recordScore(
    userId: string,
    game: string,
    score: number,
    options: { username?: string; avatarUrl?: string; pointing?: LeaderboardPointingOptions } = {}
  ): Promise<{ isPersonalBest: boolean; previousBest: number; newBest: number; awardedPoints: number }> {
    const player = await this.getPlayer(userId, options.username, options.avatarUrl);
    const previousBest = player.scores[game] || 0;

    const pointing = options.pointing || this.pointing;
    const finalScore = pointing?.calculateSoloPoints
      ? pointing.calculateSoloPoints({ player, game, score })
      : score;

    const isPersonalBest = finalScore > previousBest;

    if (isPersonalBest || player.scores[game] === undefined) {
      player.scores[game] = finalScore;
    }
    player.lastPlayed = Date.now();

    if (this.storageAdapter) {
      await this.storageAdapter.set(player.id, player);
    }

    if (this.wekyManager && typeof this.wekyManager.emit === "function") {
      this.wekyManager.emit("leaderboardUpdate", {
        userId: player.id,
        username: player.username,
        game,
        oldValue: previousBest,
        newValue: player.scores[game],
        change: finalScore - previousBest,
        isWin: isPersonalBest,
        streak: player.winStreak,
      });
    }

    return {
      isPersonalBest,
      previousBest,
      newBest: player.scores[game],
      awardedPoints: finalScore,
    };
  }

  /**
   * Exports all leaderboard player records as a raw JSON serializable array (for web dashboards).
   */
  public async exportData(): Promise<LeaderboardPlayer[]> {
    const all = this.storageAdapter ? await this.storageAdapter.getAll() : Array.from(this.players.values());
    return JSON.parse(JSON.stringify(all));
  }

  /**
   * Imports or merges an external array of player records into the leaderboard (e.g. from a web dashboard database).
   */
  public async importData(data: LeaderboardPlayer[]): Promise<void> {
    for (const player of data) {
      this.players.set(player.id, player);
      if (this.storageAdapter) {
        await this.storageAdapter.set(player.id, player);
      }
    }
  }

  /**
   * Returns top players sorted by ELO rating.
   */
  public async getTopByElo(limit: number = 10): Promise<LeaderboardPlayer[]> {
    const all = this.storageAdapter ? await this.storageAdapter.getAll() : Array.from(this.players.values());
    return all.sort((a, b) => b.elo - a.elo).slice(0, limit);
  }

  /**
   * Returns top players for a specific solo minigame by high score.
   */
  public async getTopByScore(
    game: string,
    limit: number = 10
  ): Promise<{ rank: number; player: LeaderboardPlayer; score: number }[]> {
    const all = this.storageAdapter ? await this.storageAdapter.getAll() : Array.from(this.players.values());
    return all
      .filter((p) => p.scores[game] !== undefined)
      .sort((a, b) => (b.scores[game] || 0) - (a.scores[game] || 0))
      .slice(0, limit)
      .map((player, index) => ({
        rank: index + 1,
        player,
        score: player.scores[game] || 0,
      }));
  }

  /**
   * Clears all in-memory leaderboard records.
   */
  public reset(): void {
    this.players.clear();
  }
}

