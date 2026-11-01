/**
 * @m3rcena/weky
 * JSON File Storage Adapter for Leaderboards and Player Data.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import fs from "node:fs";
import path from "node:path";
import { LeaderboardPlayer, LeaderboardStorageAdapter } from "../leaderboard/LeaderboardManager.js";

export class JsonWekyStorage implements LeaderboardStorageAdapter {
  private filePath: string;
  private cache: Record<string, LeaderboardPlayer> = {};
  private loaded = false;

  constructor(filePath: string = "./weky-data.json") {
    this.filePath = path.resolve(process.cwd(), filePath);
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = await fs.promises.readFile(this.filePath, "utf-8");
        this.cache = JSON.parse(raw);
      }
    } catch {
      this.cache = {};
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(this.filePath, JSON.stringify(this.cache, null, 2), "utf-8");
    } catch (err) {
      console.error("[JsonWekyStorage] Failed to save players to disk:", err);
    }
  }

  public async get(userId: string): Promise<LeaderboardPlayer | undefined> {
    await this.ensureLoaded();
    return this.cache[userId] ? { ...this.cache[userId] } : undefined;
  }

  public async set(userId: string, data: LeaderboardPlayer): Promise<void> {
    await this.ensureLoaded();
    this.cache[userId] = { ...data };
    await this.persist();
  }

  public async getAll(): Promise<LeaderboardPlayer[]> {
    await this.ensureLoaded();
    return Object.values(this.cache).map((p) => ({ ...p }));
  }
}
