/**
 * @m3rcena/weky
 * Native SQLite Storage Adapter using node:sqlite (Node.js >= 22.0.0).
 * Provides fast, zero-dependency, transactional local database storage for
 * player ELO ratings, solo high scores, win streaks, and tournament brackets.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { LeaderboardPlayer, LeaderboardStorageAdapter } from "../leaderboard/LeaderboardManager.js";

export interface SqliteWekyStorageOptions {
  /** Database file path on disk (default: "./weky.sqlite") */
  path?: string;
  /** Whether to enable WAL mode for high concurrency (default: true) */
  walMode?: boolean;
}

export class SqliteWekyStorage implements LeaderboardStorageAdapter {
  private db: DatabaseSync;
  public readonly dbPath: string;

  constructor(options: string | SqliteWekyStorageOptions = "./weky.sqlite") {
    const rawPath = typeof options === "string" ? options : options.path || "./weky.sqlite";
    this.dbPath = path.resolve(process.cwd(), rawPath);

    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new DatabaseSync(this.dbPath);

    const wal = typeof options === "object" ? options.walMode ?? true : true;
    if (wal) {
      try {
        this.db.exec("PRAGMA journal_mode = WAL;");
      } catch {
        // Safe ignore
      }
    }

    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS weky_players (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        avatar_url TEXT,
        elo REAL NOT NULL DEFAULT 1200,
        wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0,
        draws INTEGER NOT NULL DEFAULT 0,
        win_streak INTEGER NOT NULL DEFAULT 0,
        highest_streak INTEGER NOT NULL DEFAULT 0,
        scores TEXT NOT NULL DEFAULT '{}',
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weky_tournaments (
        id TEXT PRIMARY KEY,
        game TEXT NOT NULL,
        state TEXT NOT NULL,
        winner_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_weky_elo ON weky_players (elo DESC);
      CREATE INDEX IF NOT EXISTS idx_weky_wins ON weky_players (wins DESC);
      CREATE INDEX IF NOT EXISTS idx_weky_streak ON weky_players (win_streak DESC);
      CREATE INDEX IF NOT EXISTS idx_weky_updated ON weky_players (updated_at DESC);
    `);
  }

  public async get(userId: string): Promise<LeaderboardPlayer | undefined> {
    const stmt = this.db.prepare("SELECT data FROM weky_players WHERE id = ? LIMIT 1");
    const row = stmt.get(userId) as { data: string } | undefined;
    if (!row || !row.data) return undefined;

    try {
      return JSON.parse(row.data) as LeaderboardPlayer;
    } catch {
      return undefined;
    }
  }

  public async set(userId: string, data: LeaderboardPlayer): Promise<void> {
    const now = Date.now();
    const payload = JSON.stringify(data);
    const scoresPayload = JSON.stringify(data.scores || {});

    const stmt = this.db.prepare(`
      INSERT INTO weky_players (
        id, username, avatar_url, elo, wins, losses, draws, win_streak, highest_streak, scores, data, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        username = excluded.username,
        avatar_url = excluded.avatar_url,
        elo = excluded.elo,
        wins = excluded.wins,
        losses = excluded.losses,
        draws = excluded.draws,
        win_streak = excluded.win_streak,
        highest_streak = excluded.highest_streak,
        scores = excluded.scores,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      userId,
      data.username || "Player",
      data.avatarUrl || null,
      data.elo ?? 1200,
      data.wins ?? 0,
      data.losses ?? 0,
      data.draws ?? 0,
      data.winStreak ?? 0,
      data.highestStreak ?? 0,
      scoresPayload,
      payload,
      now
    );
  }

  public async getAll(): Promise<LeaderboardPlayer[]> {
    const stmt = this.db.prepare("SELECT data FROM weky_players ORDER BY elo DESC");
    const rows = stmt.all() as { data: string }[];
    const result: LeaderboardPlayer[] = [];

    for (const r of rows) {
      try {
        if (r && r.data) {
          result.push(JSON.parse(r.data));
        }
      } catch {
        // Skip corrupted row
      }
    }
    return result;
  }

  public async saveTournament(id: string, game: string, state: any, winnerId?: string): Promise<void> {
    const now = Date.now();
    const serialized = JSON.stringify(state);

    const stmt = this.db.prepare(`
      INSERT INTO weky_tournaments (id, game, state, winner_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        state = excluded.state,
        winner_id = excluded.winner_id,
        updated_at = excluded.updated_at
    `);

    stmt.run(id, game, serialized, winnerId || null, now, now);
  }

  public async getTournament(id: string): Promise<any | null> {
    const stmt = this.db.prepare("SELECT state FROM weky_tournaments WHERE id = ? LIMIT 1");
    const row = stmt.get(id) as { state: string } | undefined;
    if (!row || !row.state) return null;

    try {
      return JSON.parse(row.state);
    } catch {
      return null;
    }
  }

  /**
   * Closes the SQLite database connection.
   */
  public close(): void {
    try {
      this.db.close();
    } catch {
      // Safe ignore
    }
  }
}
