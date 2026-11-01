/**
 * @m3rcena/weky
 * Enterprise Prisma Storage Adapter for Player ELO, High Scores, and Tournaments.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import fs from "node:fs";
import path from "node:path";
import { LeaderboardPlayer, LeaderboardStorageAdapter } from "../leaderboard/LeaderboardManager.js";

/**
 * Prisma Schema snippet that developers can paste into their schema.prisma.
 */
export const PRISMA_WEKY_MODEL = `
// Added by @m3rcena/weky
model WekyPlayer {
  id            String   @id
  username      String
  avatarUrl     String?
  elo           Float    @default(1200)
  wins          Int      @default(0)
  losses        Int      @default(0)
  draws         Int      @default(0)
  winStreak     Int      @default(0)
  highestStreak Int      @default(0)
  scores        String   @default("{}")
  data          String
  updatedAt     DateTime @updatedAt

  @@index([elo])
}

model WekyTournament {
  id        String   @id
  game      String
  state     String
  winnerId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`.trim();

/**
 * Automatically inspects and appends Weky models to a schema.prisma file if missing.
 * @param schemaPath Path to schema.prisma (default: "prisma/schema.prisma")
 * @returns True if models were appended, false if already present or schema file not found.
 */
export function applyPrismaWekyModel(schemaPath: string = "prisma/schema.prisma"): boolean {
  try {
    const resolved = path.resolve(process.cwd(), schemaPath);
    if (!fs.existsSync(resolved)) {
      return false;
    }
    const content = fs.readFileSync(resolved, "utf-8");
    if (content.includes("model WekyPlayer")) {
      return false; // Already present
    }
    const updated = `${content.trim()}\n\n${PRISMA_WEKY_MODEL}\n`;
    fs.writeFileSync(resolved, updated, "utf-8");
    return true;
  } catch (err) {
    console.error("[applyPrismaWekyModel] Failed to append model to schema:", err);
    return false;
  }
}

export interface PrismaWekyStorageOptions {
  /** The PrismaClient instance provided by the bot */
  client: any;
  /** Property name of the player model on the client (default: "wekyPlayer") */
  playerModel?: string;
  /** Property name of the tournament model on the client (default: "wekyTournament") */
  tournamentModel?: string;
  /** Table name in database for players (default: "WekyPlayer") */
  playerTable?: string;
  /** Table name in database for tournaments (default: "WekyTournament") */
  tournamentTable?: string;
  /** Automatically run table migration on connection if missing (default: true) */
  autoMigrate?: boolean;
}

export class PrismaWekyStorage implements LeaderboardStorageAdapter {
  private client: any;
  private playerModel: string;
  private tournamentModel: string;
  private playerTable: string;
  private tournamentTable: string;
  private autoMigrate: boolean;
  private migrated = false;

  constructor(options: any | PrismaWekyStorageOptions) {
    if (options && options.client) {
      this.client = options.client;
      this.playerModel = options.playerModel || "wekyPlayer";
      this.tournamentModel = options.tournamentModel || "wekyTournament";
      this.playerTable = options.playerTable || "WekyPlayer";
      this.tournamentTable = options.tournamentTable || "WekyTournament";
      this.autoMigrate = options.autoMigrate ?? true;
    } else {
      this.client = options;
      this.playerModel = "wekyPlayer";
      this.tournamentModel = "wekyTournament";
      this.playerTable = "WekyPlayer";
      this.tournamentTable = "WekyTournament";
      this.autoMigrate = true;
    }
  }

  private async ensureMigrated(): Promise<void> {
    if (this.migrated || !this.autoMigrate || !this.client) return;
    this.migrated = true;

    if (this.client[this.playerModel]) {
      return;
    }

    if (typeof this.client.$executeRawUnsafe === "function") {
      try {
        await this.client.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "${this.playerTable}" (
            "id" VARCHAR(191) PRIMARY KEY,
            "username" VARCHAR(191) NOT NULL,
            "avatarUrl" TEXT,
            "elo" DOUBLE PRECISION NOT NULL DEFAULT 1200,
            "wins" INTEGER NOT NULL DEFAULT 0,
            "losses" INTEGER NOT NULL DEFAULT 0,
            "draws" INTEGER NOT NULL DEFAULT 0,
            "winStreak" INTEGER NOT NULL DEFAULT 0,
            "highestStreak" INTEGER NOT NULL DEFAULT 0,
            "scores" TEXT NOT NULL DEFAULT '{}',
            "data" TEXT NOT NULL,
            "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await this.client.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "${this.tournamentTable}" (
            "id" VARCHAR(191) PRIMARY KEY,
            "game" VARCHAR(191) NOT NULL,
            "state" TEXT NOT NULL,
            "winnerId" VARCHAR(191),
            "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {
        try {
          await this.client.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS ${this.playerTable} (
              id TEXT PRIMARY KEY,
              username TEXT NOT NULL,
              avatarUrl TEXT,
              elo REAL DEFAULT 1200,
              wins INTEGER DEFAULT 0,
              losses INTEGER DEFAULT 0,
              draws INTEGER DEFAULT 0,
              winStreak INTEGER DEFAULT 0,
              highestStreak INTEGER DEFAULT 0,
              scores TEXT DEFAULT '{}',
              data TEXT NOT NULL,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await this.client.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS ${this.tournamentTable} (
              id TEXT PRIMARY KEY,
              game TEXT NOT NULL,
              state TEXT NOT NULL,
              winnerId TEXT,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
        } catch {
          // Ignore
        }
      }
    }
  }

  public async get(userId: string): Promise<LeaderboardPlayer | undefined> {
    await this.ensureMigrated();
    const delegate = this.client[this.playerModel];

    if (delegate && typeof delegate.findUnique === "function") {
      try {
        const record = await delegate.findUnique({ where: { id: userId } });
        if (!record || !record.data) return undefined;
        return typeof record.data === "string" ? JSON.parse(record.data) : record.data;
      } catch {
        // Fallback
      }
    }

    if (typeof this.client.$queryRawUnsafe === "function") {
      try {
        const rows: any[] = await this.client.$queryRawUnsafe(
          `SELECT data FROM "${this.playerTable}" WHERE id = $1 LIMIT 1`,
          userId
        );
        if (rows && rows.length > 0 && rows[0].data) {
          return JSON.parse(rows[0].data);
        }
      } catch {
        try {
          const rows: any[] = await this.client.$queryRawUnsafe(
            `SELECT data FROM ${this.playerTable} WHERE id = ? LIMIT 1`,
            userId
          );
          if (rows && rows.length > 0 && rows[0].data) {
            return JSON.parse(rows[0].data);
          }
        } catch {
          return undefined;
        }
      }
    }

    return undefined;
  }

  public async set(userId: string, data: LeaderboardPlayer): Promise<void> {
    await this.ensureMigrated();
    const serialized = JSON.stringify(data);
    const scores = JSON.stringify(data.scores || {});

    const delegate = this.client[this.playerModel];
    if (delegate && typeof delegate.upsert === "function") {
      try {
        await delegate.upsert({
          where: { id: userId },
          update: {
            username: data.username || "Player",
            avatarUrl: data.avatarUrl || null,
            elo: data.elo ?? 1200,
            wins: data.wins ?? 0,
            losses: data.losses ?? 0,
            draws: data.draws ?? 0,
            winStreak: data.winStreak ?? 0,
            highestStreak: data.highestStreak ?? 0,
            scores,
            data: serialized,
            updatedAt: new Date(),
          },
          create: {
            id: userId,
            username: data.username || "Player",
            avatarUrl: data.avatarUrl || null,
            elo: data.elo ?? 1200,
            wins: data.wins ?? 0,
            losses: data.losses ?? 0,
            draws: data.draws ?? 0,
            winStreak: data.winStreak ?? 0,
            highestStreak: data.highestStreak ?? 0,
            scores,
            data: serialized,
            updatedAt: new Date(),
          },
        });
        return;
      } catch {
        // Fallback to raw query
      }
    }

    if (typeof this.client.$executeRawUnsafe === "function") {
      try {
        await this.client.$executeRawUnsafe(
          `
          INSERT INTO "${this.playerTable}" (
            "id", "username", "avatarUrl", "elo", "wins", "losses", "draws", "winStreak", "highestStreak", "scores", "data", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          ON CONFLICT ("id") DO UPDATE SET
            "username" = EXCLUDED."username",
            "avatarUrl" = EXCLUDED."avatarUrl",
            "elo" = EXCLUDED."elo",
            "wins" = EXCLUDED."wins",
            "losses" = EXCLUDED."losses",
            "draws" = EXCLUDED."draws",
            "winStreak" = EXCLUDED."winStreak",
            "highestStreak" = EXCLUDED."highestStreak",
            "scores" = EXCLUDED."scores",
            "data" = EXCLUDED."data",
            "updatedAt" = NOW()
          `,
          userId,
          data.username || "Player",
          data.avatarUrl || null,
          data.elo ?? 1200,
          data.wins ?? 0,
          data.losses ?? 0,
          data.draws ?? 0,
          data.winStreak ?? 0,
          data.highestStreak ?? 0,
          scores,
          serialized
        );
      } catch {
        await this.client.$executeRawUnsafe(
          `
          INSERT INTO ${this.playerTable} (
            id, username, avatarUrl, elo, wins, losses, draws, winStreak, highestStreak, scores, data, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            username = excluded.username,
            avatarUrl = excluded.avatarUrl,
            elo = excluded.elo,
            wins = excluded.wins,
            losses = excluded.losses,
            draws = excluded.draws,
            winStreak = excluded.winStreak,
            highestStreak = excluded.highestStreak,
            scores = excluded.scores,
            data = excluded.data,
            updatedAt = CURRENT_TIMESTAMP
          `,
          userId,
          data.username || "Player",
          data.avatarUrl || null,
          data.elo ?? 1200,
          data.wins ?? 0,
          data.losses ?? 0,
          data.draws ?? 0,
          data.winStreak ?? 0,
          data.highestStreak ?? 0,
          scores,
          serialized
        );
      }
    }
  }

  public async getAll(): Promise<LeaderboardPlayer[]> {
    await this.ensureMigrated();
    const delegate = this.client[this.playerModel];

    if (delegate && typeof delegate.findMany === "function") {
      try {
        const records = await delegate.findMany({ orderBy: { elo: "desc" } });
        return records
          .map((r: any) => (typeof r.data === "string" ? JSON.parse(r.data) : r.data))
          .filter(Boolean);
      } catch {
        // Fallback
      }
    }

    if (typeof this.client.$queryRawUnsafe === "function") {
      try {
        const rows: any[] = await this.client.$queryRawUnsafe(`SELECT data FROM ${this.playerTable} ORDER BY elo DESC`);
        return rows.map((r) => JSON.parse(r.data)).filter(Boolean);
      } catch {
        return [];
      }
    }

    return [];
  }
}
