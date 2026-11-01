/**
 * @m3rcena/weky
 * Unified Database Handler and Factory for SQLite, Prisma, JSON, and Memory storage.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { LeaderboardStorageAdapter } from "../leaderboard/LeaderboardManager.js";
import { SqliteWekyStorage, SqliteWekyStorageOptions } from "./SqliteWekyStorage.js";
import { PrismaWekyStorage, PrismaWekyStorageOptions, PRISMA_WEKY_MODEL, applyPrismaWekyModel } from "./PrismaWekyStorage.js";
import { JsonWekyStorage } from "./JsonWekyStorage.js";
import { WekyDatabaseConfig } from "../core/Types.js";

export class WekyDatabaseHandler {
  /**
   * Instantiates the requested storage adapter based on developer configuration.
   */
  public static create(config?: WekyDatabaseConfig): LeaderboardStorageAdapter | undefined {
    if (!config || config === "memory") {
      return undefined; // In-memory default in LeaderboardManager
    }

    if (config === "sqlite") {
      return new SqliteWekyStorage("./weky.sqlite");
    }

    if (config === "json") {
      return new JsonWekyStorage("./weky-data.json");
    }

    if (typeof config === "object") {
      if (config.type === "sqlite") {
        return new SqliteWekyStorage(config.path || "./weky.sqlite");
      }

      if (config.type === "prisma") {
        return new PrismaWekyStorage({
          client: config.client,
          playerModel: config.model || "wekyPlayer",
          autoMigrate: config.autoMigrate ?? true,
        });
      }

      if (config.type === "json") {
        return new JsonWekyStorage(config.path || "./weky-data.json");
      }

      if (config.type === "memory") {
        return undefined;
      }
    }

    return undefined;
  }

  /**
   * Automatically appends Weky models to schema.prisma if missing.
   */
  public static applyPrismaSchema(schemaPath: string = "prisma/schema.prisma"): boolean {
    return applyPrismaWekyModel(schemaPath);
  }
}

/**
 * Resolves a LeaderboardStorageAdapter from an existing storageAdapter or database config.
 */
export function resolveWekyStorage(options?: {
  storageAdapter?: LeaderboardStorageAdapter;
  database?: WekyDatabaseConfig;
}): LeaderboardStorageAdapter | undefined {
  if (options?.storageAdapter) {
    return options.storageAdapter;
  }
  if (options?.database) {
    return WekyDatabaseHandler.create(options.database);
  }
  return undefined;
}
