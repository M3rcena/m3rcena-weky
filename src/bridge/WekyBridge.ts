/**
 * Weky Cross-Platform Bridge & Dashboard Gateway
 * Connects Discord minigame instances with Headless Engines and Web Dashboards,
 * enabling real-time game state synchronization, cross-platform move execution,
 * and unified leaderboard data access.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { CrossPlatformMoveEvent, BridgeSyncEvent } from "../core/EventTypes.js";
import { LeaderboardPlayer } from "../leaderboard/LeaderboardManager.js";

export interface BridgePlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  platform: "discord" | "dashboard" | "web" | "api";
}

export interface CrossPlatformMove {
  playerId: string;
  action: string;
  payload?: any;
  sourcePlatform: "discord" | "dashboard" | "web" | "api";
}

export interface BridgeMoveResult {
  success: boolean;
  state: any;
  nextTurnId?: string;
  isGameOver?: boolean;
  winnerId?: string;
  announcement?: string;
  soundKey?: string;
  soundUrl?: string;
  error?: string;
}

export interface BridgeSession<TState = any> {
  /** Unique session ID */
  id: string;
  /** Minigame key (e.g. "tictactoe", "fight", "snake", "2048") */
  game: string;
  /** Platform hosting or participating in the match */
  platform: "discord" | "dashboard" | "hybrid";
  /** Players participating in this session */
  players: BridgePlayer[];
  /** Current player turn ID (if turn-based) */
  currentTurnId?: string;
  /** Current serializable game state */
  state: TState;
  /** Optional linked Headless Engine instance */
  engine?: any;
  /** Arbitrary session metadata */
  metadata?: Record<string, any>;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  lastUpdated: number;
  /** Whether the session has concluded */
  isGameOver: boolean;
  /** Winner ID if concluded */
  winnerId?: string;
  /** Callback invoked when a cross-platform move is dispatched */
  onMove?: (move: CrossPlatformMove) => Promise<BridgeMoveResult> | BridgeMoveResult;
  /** Callback to render current canvas snapshot */
  renderSnapshot?: () => Promise<Buffer | string> | Buffer | string;
}

export interface DashboardOverview {
  activeGamesCount: number;
  totalLeaderboardPlayers: number;
  activeSessions: {
    id: string;
    game: string;
    platform: "discord" | "dashboard" | "hybrid";
    players: { id: string; username: string; platform: string }[];
    currentTurnId?: string;
    lastUpdated: number;
    isGameOver: boolean;
  }[];
  topContenders: {
    rank: number;
    username: string;
    elo: number;
    wins: number;
    winStreak: number;
  }[];
}

export class WekyBridge {
  private sessions: Map<string, BridgeSession> = new Map();
  public wekyManager?: any;

  constructor(wekyManager?: any) {
    this.wekyManager = wekyManager;
  }

  /**
   * Registers an active game session into the cross-platform bridge.
   */
  public registerSession(session: BridgeSession): void {
    session.createdAt = session.createdAt || Date.now();
    session.lastUpdated = Date.now();
    this.sessions.set(session.id, session);

    if (this.wekyManager && typeof this.wekyManager.emit === "function") {
      this.wekyManager.emit("bridgeSync", {
        sessionId: session.id,
        game: session.game,
        state: session.state,
        source: session.platform,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Unregisters a game session upon termination.
   */
  public unregisterSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Retrieves a session by ID.
   */
  public getSession(sessionId: string): BridgeSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Returns all active, uncompleted sessions.
   */
  public getActiveSessions(): BridgeSession[] {
    return Array.from(this.sessions.values()).filter((s) => !s.isGameOver);
  }

  /**
   * Returns all registered sessions regardless of status.
   */
  public getAllSessions(): BridgeSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Returns all sessions where a specific user is a participant.
   */
  public getSessionsForPlayer(playerId: string): BridgeSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.players.some((p) => p.id === playerId));
  }

  /**
   * Updates state for a session and synchronizes it with bridge listeners.
   */
  public syncState(sessionId: string, newState: any, source: string = "internal"): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.state = newState;
    session.lastUpdated = Date.now();

    if (this.wekyManager && typeof this.wekyManager.emit === "function") {
      this.wekyManager.emit("bridgeSync", {
        sessionId: session.id,
        game: session.game,
        state: newState,
        source,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Dispatches a cross-platform move to an active game session.
   * Can be invoked from Web Dashboards, REST APIs, or Discord bots.
   */
  public async dispatchMove(sessionId: string, move: CrossPlatformMove): Promise<BridgeMoveResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, state: null, error: `Session "${sessionId}" not found` };
    }

    if (session.isGameOver) {
      return { success: false, state: session.state, error: "Session has already ended" };
    }

    // 1. Invoke custom onMove handler if provided
    let result: BridgeMoveResult;
    if (session.onMove) {
      result = await session.onMove(move);
    } else if (session.engine && typeof session.engine.action === "function") {
      // Headless engine fallback (e.g. FightEngine)
      const engineRes = session.engine.action(move.playerId, move.action, move.payload);
      result = {
        success: engineRes.success,
        state: session.engine.getState(),
        nextTurnId: session.engine.getState().currentTurn,
        isGameOver: engineRes.isGameOver,
        winnerId: engineRes.winnerId,
        announcement: engineRes.announcement,
      };
    } else {
      return { success: false, state: session.state, error: "No move handler registered for session" };
    }

    if (result.success) {
      session.state = result.state ?? session.state;
      session.lastUpdated = Date.now();
      if (result.nextTurnId) session.currentTurnId = result.nextTurnId;
      if (result.isGameOver) {
        session.isGameOver = true;
        session.winnerId = result.winnerId;
      }

      // Attach dashboard MP3 audio cue
      if (this.wekyManager?.soundboard && typeof this.wekyManager.soundboard.getSoundUrl === "function") {
        let soundKey = "action";
        if (result.isGameOver) {
          soundKey = result.winnerId ? "victory" : "tie";
        } else if (move.action === "hit" || move.action === "heavy") {
          soundKey = "hit";
        } else if (move.action === "heal") {
          soundKey = "heal";
        } else if (move.action === "eat" || session.game === "snake") {
          soundKey = "eat";
        }

        const soundUrl = this.wekyManager.soundboard.getSoundUrl(soundKey);
        result.soundKey = soundKey;
        result.soundUrl = soundUrl;

        this.wekyManager.soundboard.triggerSound(soundKey, {
          sessionId: session.id,
          game: session.game,
        });
      }

      // Telemetry emit
      if (this.wekyManager && typeof this.wekyManager.emit === "function") {
        this.wekyManager.emit("crossPlatformMove", {
          sessionId: session.id,
          game: session.game,
          playerId: move.playerId,
          action: move.action,
          payload: move.payload,
          platform: move.sourcePlatform,
        });

        this.wekyManager.emit("bridgeSync", {
          sessionId: session.id,
          game: session.game,
          state: session.state,
          source: move.sourcePlatform,
          timestamp: Date.now(),
        });
      }
    }

    return result;
  }

  /**
   * Ends an active game session and flags it as completed.
   */
  public endSession(sessionId: string, outcome: { winnerId?: string; reason?: string } = {}): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.isGameOver = true;
    session.winnerId = outcome.winnerId;
    session.lastUpdated = Date.now();
  }

  /**
   * Renders a live visual snapshot of the session (Canvas image Buffer or Data URL).
   */
  public async renderSessionSnapshot(sessionId: string): Promise<Buffer | string | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.renderSnapshot) {
      return await session.renderSnapshot();
    }
    if (session.engine && typeof session.engine.renderDataURL === "function") {
      return await session.engine.renderDataURL();
    }
    if (session.engine && typeof session.engine.renderBuffer === "function") {
      return await session.engine.renderBuffer();
    }
    return null;
  }

  /**
   * Returns a high-level overview of live games, active sessions, and leaderboard data for Web Dashboards.
   */
  public async getDashboardOverview(): Promise<DashboardOverview> {
    const activeSessions = this.getActiveSessions().map((s) => ({
      id: s.id,
      game: s.game,
      platform: s.platform,
      players: s.players.map((p) => ({ id: p.id, username: p.username, platform: p.platform })),
      currentTurnId: s.currentTurnId,
      lastUpdated: s.lastUpdated,
      isGameOver: s.isGameOver,
    }));

    let topContenders: DashboardOverview["topContenders"] = [];
    let totalPlayers = 0;

    if (this.wekyManager && this.wekyManager.leaderboard) {
      const top = await this.wekyManager.leaderboard.getTopByElo(5);
      topContenders = top.map((p: LeaderboardPlayer, index: number) => ({
        rank: index + 1,
        username: p.username,
        elo: p.elo,
        wins: p.wins,
        winStreak: p.winStreak,
      }));
      const allPlayers = await this.wekyManager.leaderboard.exportData();
      totalPlayers = allPlayers.length;
    }

    return {
      activeGamesCount: activeSessions.length,
      totalLeaderboardPlayers: totalPlayers,
      activeSessions,
      topContenders,
    };
  }

  /**
   * Exports full state dump of active sessions and leaderboard data for external database syncing.
   */
  public async exportAllState(): Promise<{ sessions: BridgeSession[]; leaderboard?: LeaderboardPlayer[] }> {
    const sessions = Array.from(this.sessions.values()).map((s) => ({
      ...s,
      engine: undefined, // Strip non-serializable objects
      onMove: undefined,
      renderSnapshot: undefined,
    }));

    let leaderboard: LeaderboardPlayer[] | undefined;
    if (this.wekyManager?.leaderboard) {
      leaderboard = await this.wekyManager.leaderboard.exportData();
    }

    return { sessions, leaderboard };
  }

  /**
   * Imports state dump from an external database or dashboard backend.
   */
  public async importAllState(data: { sessions?: BridgeSession[]; leaderboard?: LeaderboardPlayer[] }): Promise<void> {
    if (data.sessions) {
      for (const s of data.sessions) {
        this.sessions.set(s.id, s);
      }
    }
    if (data.leaderboard && this.wekyManager?.leaderboard) {
      await this.wekyManager.leaderboard.importData(data.leaderboard);
    }
  }
}

