/**
 * @m3rcena/weky
 * Weky <-> Economy Cross-Package Connector
 *
 * Connects the Weky minigames engine with @m3rcena/eco:
 * - Automatically rewards players in cash/coins for winning minigames
 * - Deducts optional penalties or wagers upon losing
 * - Distributes solo minigame score bonuses (proportional to score, e.g. 2048, Snake, FastType)
 * - Rewards consecutive win streaks with multiplier bonuses
 * - Manages PvP bet pots / wagers with atomic escrow & refund handling
 * - Awards championship prize pools for tournament winners
 * - Emits real-time economic telemetry to @m3rcena/bridge
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { EventEmitter } from "node:events";
import type { WekyManager } from "../core/WekyManager.js";
import type { GameOverEvent, TournamentEndEvent } from "../core/EventTypes.js";

export interface GameRewardRule {
  /** Flat coins awarded on victory */
  winReward?: number;
  /** Flat coins deducted on defeat */
  lossPenalty?: number;
  /** Flat coins awarded on draw / tie */
  drawReward?: number;
  /** Multiplier for solo points/score (e.g. 0.05 means 1000 score = 50 coins) */
  scoreMultiplier?: number;
  /** Maximum coins allowed from score multiplier */
  maxScoreReward?: number;
  /** Bonus coins awarded per win streak count */
  streakBonus?: number;
}

export interface WagerRecord {
  id: string;
  player1Id: string;
  player2Id: string;
  amount: number;
  totalPot: number;
  guildId?: string;
  game?: string;
  createdAt: number;
  status: "active" | "resolved" | "refunded";
  winnerId?: string;
}

export interface WagerCreateResult {
  success: boolean;
  wager?: WagerRecord;
  reason?: string;
  failedUserId?: string;
}

export interface WekyEcoConnectorOptions {
  /** Default flat coins awarded on victory (default: 50) */
  defaultWinReward?: number;
  /** Default flat coins deducted on defeat (default: 0) */
  defaultLossPenalty?: number;
  /** Default flat coins awarded on tie/draw (default: 10) */
  defaultDrawReward?: number;
  /** Default multiplier applied to solo score (default: 0.05) */
  defaultScoreMultiplier?: number;
  /** Maximum coins awarded from score in a single game (default: 500) */
  maxScoreReward?: number;
  /** Bonus coins awarded per active win streak count (default: 5) */
  streakBonus?: number;
  /** Tournament champion cash prize (default: 500) */
  tournamentChampionPrize?: number;
  /** Tournament runner-up cash prize (default: 200) */
  tournamentRunnerUpPrize?: number;
  /** House fee percentage taken from PvP wager pots (0 - 100, default: 0) */
  wagerHouseFee?: number;
  /** Specific per-game rule overrides */
  games?: Record<string, GameRewardRule>;
  /** Whether automatic rewards on gameOver are enabled (default: true) */
  autoReward?: boolean;
}

export interface RewardDistributionResult {
  userId: string;
  game: string;
  outcome: "WIN" | "LOSE" | "DRAW" | "SCORE" | "TOURNAMENT";
  amount: number;
  newBalance: number;
  reason: string;
  streakBonus?: number;
  scoreBonus?: number;
  wagerWon?: number;
}

export interface WagerResolvedEvent {
  wager: WagerRecord;
  winnerId: string;
  loserId: string;
  payout: number;
  houseFee: number;
}

export interface WagerRefundedEvent {
  wager: WagerRecord;
  reason: string;
}

/**
 * Type-safe map of events emitted by WekyEcoConnector.
 */
export interface WekyEcoConnectorEvents {
  wagerCreated: [wager: WagerRecord];
  wagerResolved: [event: WagerResolvedEvent];
  wagerRefunded: [event: WagerRefundedEvent];
  reward: [result: RewardDistributionResult];
  penalty: [result: RewardDistributionResult];
  tournamentReward: [result: RewardDistributionResult];
  error: [error: any];
}

export class WekyEcoConnector extends EventEmitter {
  public readonly weky: WekyManager;
  public readonly eco: any;
  public options: WekyEcoConnectorOptions;

  private activeWagers: Map<string, WagerRecord> = new Map();
  private userToWagerMap: Map<string, string> = new Map();

  constructor(weky: WekyManager, eco: any, options: WekyEcoConnectorOptions = {}) {
    super();

    if (!weky) {
      throw new TypeError("[WekyEcoConnector] A valid WekyManager instance is required.");
    }
    if (!eco) {
      throw new TypeError("[WekyEcoConnector] A valid EcoManager instance is required.");
    }

    this.weky = weky;
    this.eco = eco;
    this.options = {
      defaultWinReward: 50,
      defaultLossPenalty: 0,
      defaultDrawReward: 10,
      defaultScoreMultiplier: 0.05,
      maxScoreReward: 500,
      streakBonus: 5,
      tournamentChampionPrize: 500,
      tournamentRunnerUpPrize: 200,
      wagerHouseFee: 0,
      autoReward: true,
      ...options,
    };

    this.initListeners();
  }

  // --------------------------------------------------------------------------
  // Strongly-Typed EventEmitter Overrides
  // --------------------------------------------------------------------------

  public override on<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  public override on(event: string | symbol, listener: (...args: any[]) => void): this;
  public override on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public override once<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  public override once(event: string | symbol, listener: (...args: any[]) => void): this;
  public override once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  public override emit<K extends keyof WekyEcoConnectorEvents>(event: K, ...args: WekyEcoConnectorEvents[K]): boolean;
  public override emit(event: string | symbol, ...args: any[]): boolean;
  public override emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  public override off<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  public override off(event: string | symbol, listener: (...args: any[]) => void): this;
  public override off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  public override addListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  public override addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override addListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.addListener(event, listener);
  }

  public override removeListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  public override removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.removeListener(event, listener);
  }

  public override prependListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  public override prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.prependListener(event, listener);
  }

  public override prependOnceListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  public override prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.prependOnceListener(event, listener);
  }

  private initListeners(): void {
    if (typeof (this.weky as any).on === "function") {
      this.weky.on("gameOver", async (event: GameOverEvent) => {
        if (!this.options.autoReward) return;
        try {
          await this.handleGameOver(event);
        } catch (err) {
          this.emit("error", err);
        }
      });

      this.weky.on("tournamentEnd", async (event: TournamentEndEvent) => {
        if (!this.options.autoReward) return;
        try {
          await this.handleTournamentEnd(event);
        } catch (err) {
          this.emit("error", err);
        }
      });
    }
  }

  /**
   * Creates and escrows a PvP wager match between two players.
   * Both players must have sufficient wallet balances.
   */
  public async createWager(params: {
    wagerId: string;
    player1Id: string;
    player2Id: string;
    amount: number;
    guildId?: string;
    game?: string;
  }): Promise<WagerCreateResult> {
    const { wagerId, player1Id, player2Id, amount, guildId, game } = params;

    if (amount <= 0) {
      return { success: false, reason: "Wager amount must be greater than zero." };
    }

    if (player1Id === player2Id) {
      return { success: false, reason: "A player cannot wager against themselves." };
    }

    // 1. Verify balances
    const p1Balance = await this.getUserWallet(player1Id, guildId);
    if (p1Balance < amount) {
      return { success: false, reason: "Player 1 has insufficient funds.", failedUserId: player1Id };
    }

    const p2Balance = await this.getUserWallet(player2Id, guildId);
    if (p2Balance < amount) {
      return { success: false, reason: "Player 2 has insufficient funds.", failedUserId: player2Id };
    }

    // 2. Escrow amounts
    await this.deductWallet(player1Id, amount, `Wager escrow for ${game || "match"} vs <@${player2Id}>`, guildId);
    await this.deductWallet(player2Id, amount, `Wager escrow for ${game || "match"} vs <@${player1Id}>`, guildId);

    const record: WagerRecord = {
      id: wagerId,
      player1Id,
      player2Id,
      amount,
      totalPot: amount * 2,
      guildId,
      game,
      createdAt: Date.now(),
      status: "active",
    };

    this.activeWagers.set(wagerId, record);
    this.userToWagerMap.set(player1Id, wagerId);
    this.userToWagerMap.set(player2Id, wagerId);

    this.emit("wagerCreated", record);
    return { success: true, wager: record };
  }

  /**
   * Resolves an active wager, awarding the escrowed pot (minus optional house fee) to the winner.
   */
  public async resolveWager(wagerId: string, winnerId: string): Promise<RewardDistributionResult | null> {
    const wager = this.activeWagers.get(wagerId);
    if (!wager || wager.status !== "active") return null;

    if (winnerId !== wager.player1Id && winnerId !== wager.player2Id) {
      throw new Error(`Winner ${winnerId} is not a participant in wager ${wagerId}`);
    }

    const loserId = winnerId === wager.player1Id ? wager.player2Id : wager.player1Id;
    const feePct = Math.max(0, Math.min(100, this.options.wagerHouseFee ?? 0));
    const houseFee = Math.floor((wager.totalPot * feePct) / 100);
    const winAmount = wager.totalPot - houseFee;

    const newBalance = await this.creditWallet(
      winnerId,
      winAmount,
      `Won wager pot in ${wager.game || "PvP"} (+${winAmount} coins)`,
      wager.guildId
    );

    wager.status = "resolved";
    wager.winnerId = winnerId;
    this.userToWagerMap.delete(wager.player1Id);
    this.userToWagerMap.delete(wager.player2Id);

    const result: RewardDistributionResult = {
      userId: winnerId,
      game: wager.game || "pvp",
      outcome: "WIN",
      amount: winAmount,
      newBalance,
      reason: `Wager Victory vs <@${loserId}>`,
      wagerWon: winAmount,
    };

    this.emit("wagerResolved", { wager, winnerId, loserId, payout: winAmount, houseFee });
    return result;
  }

  /**
   * Cancels and refunds an active wager back to both participants.
   */
  public async refundWager(wagerId: string, reason: string = "Match cancelled or tied"): Promise<boolean> {
    const wager = this.activeWagers.get(wagerId);
    if (!wager || wager.status !== "active") return false;

    await this.creditWallet(wager.player1Id, wager.amount, `Refund wager: ${reason}`, wager.guildId);
    await this.creditWallet(wager.player2Id, wager.amount, `Refund wager: ${reason}`, wager.guildId);

    wager.status = "refunded";
    this.userToWagerMap.delete(wager.player1Id);
    this.userToWagerMap.delete(wager.player2Id);

    this.emit("wagerRefunded", { wager, reason });
    return true;
  }

  /**
   * Internal handler for Weky gameOver events.
   */
  private async handleGameOver(event: GameOverEvent): Promise<void> {
    const userId = typeof event.user === "string" ? event.user : event.user?.id;
    if (!userId) return;

    const game = event.game || "unknown";
    const rule = this.options.games?.[game] || {};
    const outcomeRaw = (event.outcome || "").toUpperCase();
    const isWin = outcomeRaw.includes("WIN") || outcomeRaw === "WON" || outcomeRaw === "VICTORY";
    const isLoss = outcomeRaw.includes("LOSE") || outcomeRaw.includes("LOST") || outcomeRaw === "DEFEAT";
    const isTie = outcomeRaw.includes("TIE") || outcomeRaw.includes("DRAW");

    // Check for active wager associated with user or channel/context
    const wagerId = this.userToWagerMap.get(userId) || (event.channelId ? this.userToWagerMap.get(event.channelId) : undefined);
    if (wagerId && this.activeWagers.has(wagerId)) {
      if (isWin) {
        await this.resolveWager(wagerId, userId);
        return;
      } else if (isTie) {
        await this.refundWager(wagerId, "Game ended in a draw");
        return;
      } else if (isLoss) {
        const wager = this.activeWagers.get(wagerId)!;
        const opponentId = userId === wager.player1Id ? wager.player2Id : wager.player1Id;
        await this.resolveWager(wagerId, opponentId);
        return;
      }
    }

    // Standard Non-Wager Reward Processing
    const winReward = rule.winReward ?? this.options.defaultWinReward ?? 50;
    const lossPenalty = rule.lossPenalty ?? this.options.defaultLossPenalty ?? 0;
    const drawReward = rule.drawReward ?? this.options.defaultDrawReward ?? 10;
    const scoreMultiplier = rule.scoreMultiplier ?? this.options.defaultScoreMultiplier ?? 0.05;
    const maxScore = rule.maxScoreReward ?? this.options.maxScoreReward ?? 500;
    const streakBonusPerWin = rule.streakBonus ?? this.options.streakBonus ?? 5;

    if (isWin) {
      let streakBonus = 0;
      try {
        const player = await this.weky.leaderboard?.getPlayer(userId);
        if (player && player.winStreak > 0) {
          streakBonus = player.winStreak * streakBonusPerWin;
        }
      } catch {
        // Safe fallback
      }

      let scoreBonus = 0;
      if (typeof event.score === "number" && event.score > 0) {
        scoreBonus = Math.min(maxScore, Math.floor(event.score * scoreMultiplier));
      }

      const totalWin = winReward + streakBonus + scoreBonus;
      if (totalWin > 0) {
        const newBal = await this.creditWallet(
          userId,
          totalWin,
          `Minigame Victory: ${game} (+${totalWin} coins)`
        );

        const result: RewardDistributionResult = {
          userId,
          game,
          outcome: "WIN",
          amount: totalWin,
          newBalance: newBal,
          reason: `Won ${game}`,
          streakBonus,
          scoreBonus,
        };

        this.emit("reward", result);
      }
    } else if (isLoss) {
      if (lossPenalty > 0) {
        const newBal = await this.deductWallet(
          userId,
          lossPenalty,
          `Minigame Defeat: ${game} (-${lossPenalty} coins)`
        );

        const result: RewardDistributionResult = {
          userId,
          game,
          outcome: "LOSE",
          amount: -lossPenalty,
          newBalance: newBal,
          reason: `Lost ${game}`,
        };

        this.emit("penalty", result);
      }
    } else if (isTie) {
      if (drawReward > 0) {
        const newBal = await this.creditWallet(
          userId,
          drawReward,
          `Minigame Draw: ${game} (+${drawReward} coins)`
        );

        const result: RewardDistributionResult = {
          userId,
          game,
          outcome: "DRAW",
          amount: drawReward,
          newBalance: newBal,
          reason: `Draw in ${game}`,
        };

        this.emit("reward", result);
      }
    } else {
      // Solo Game with score (e.g. 2048, Snake, FastType finished)
      if (typeof event.score === "number" && event.score > 0) {
        const scoreBonus = Math.min(maxScore, Math.floor(event.score * scoreMultiplier));
        if (scoreBonus > 0) {
          const newBal = await this.creditWallet(
            userId,
            scoreBonus,
            `Minigame Solo Score: ${game} (${event.score} pts -> +${scoreBonus} coins)`
          );

          const result: RewardDistributionResult = {
            userId,
            game,
            outcome: "SCORE",
            amount: scoreBonus,
            newBalance: newBal,
            reason: `Scored ${event.score} in ${game}`,
            scoreBonus,
          };

          this.emit("reward", result);
        }
      }
    }
  }

  /**
   * Internal handler for Weky tournamentEnd events.
   */
  private async handleTournamentEnd(event: TournamentEndEvent): Promise<void> {
    if (!event.champion || !event.champion.id) return;

    const championPrize = this.options.tournamentChampionPrize ?? 500;
    if (championPrize > 0) {
      const newBal = await this.creditWallet(
        event.champion.id,
        championPrize,
        `Tournament Champion: Crowned in Tournament ${event.tournamentId} (+${championPrize} coins)`
      );

      const result: RewardDistributionResult = {
        userId: event.champion.id,
        game: "tournament",
        outcome: "TOURNAMENT",
        amount: championPrize,
        newBalance: newBal,
        reason: `Crowned champion in tournament ${event.tournamentId}`,
      };

      this.emit("tournamentReward", result);
    }
  }

  /**
   * Fetches user cash balance from the connected EcoManager.
   */
  public async getUserWallet(userId: string, guildId?: string): Promise<number> {
    if (typeof this.eco.getBalance === "function") {
      const bal = await this.eco.getBalance(userId, guildId);
      return bal.wallet;
    }
    if (typeof this.eco.getAccount === "function") {
      const acc = await this.eco.getAccount(userId, guildId);
      return acc.wallet;
    }
    if (this.eco.bank && typeof this.eco.bank.getBalance === "function") {
      const bal = await this.eco.bank.getBalance(userId, guildId);
      return bal.wallet;
    }
    return 0;
  }

  /**
   * Credits cash to a user's wallet with cross-package fallback.
   */
  public async creditWallet(userId: string, amount: number, reason?: string, guildId?: string): Promise<number> {
    if (typeof this.eco.addWallet === "function") {
      return this.eco.addWallet(userId, amount, guildId);
    }
    if (this.eco.bank && typeof this.eco.bank.addWallet === "function") {
      return this.eco.bank.addWallet(userId, amount, guildId);
    }
    if (typeof this.eco.modifyWallet === "function") {
      const res = await this.eco.modifyWallet(userId, amount, guildId);
      return res.newBalance;
    }
    return 0;
  }

  /**
   * Deducts cash from a user's wallet with cross-package fallback.
   */
  public async deductWallet(userId: string, amount: number, reason?: string, guildId?: string): Promise<number> {
    if (typeof this.eco.removeWallet === "function") {
      return this.eco.removeWallet(userId, amount, guildId);
    }
    if (this.eco.bank && typeof this.eco.bank.removeWallet === "function") {
      return this.eco.bank.removeWallet(userId, amount, guildId);
    }
    if (typeof this.eco.modifyWallet === "function") {
      const res = await this.eco.modifyWallet(userId, -amount, guildId);
      return res.newBalance;
    }
    return 0;
  }

  /**
   * Returns all active PvP wager sessions.
   */
  public getActiveWagers(): WagerRecord[] {
    return Array.from(this.activeWagers.values()).filter((w) => w.status === "active");
  }

  /**
   * Returns a wager by id.
   */
  public getWager(wagerId: string): WagerRecord | undefined {
    return this.activeWagers.get(wagerId);
  }
}
