import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { SqliteWekyStorage } from "../src/storage/SqliteWekyStorage.js";
import { JsonWekyStorage } from "../src/storage/JsonWekyStorage.js";
import { PrismaWekyStorage, PRISMA_WEKY_MODEL, applyPrismaWekyModel } from "../src/storage/PrismaWekyStorage.js";
import { WekyDatabaseHandler, resolveWekyStorage } from "../src/storage/WekyDatabaseHandler.js";
import { LeaderboardManager, LeaderboardPlayer } from "../src/leaderboard/LeaderboardManager.js";

async function runDatabaseTests() {
  console.log("▶ Testing @m3rcena/weky Database Storage Adapters...");

  const testDbDir = path.resolve(process.cwd(), "test-data-weky");
  if (!fs.existsSync(testDbDir)) fs.mkdirSync(testDbDir, { recursive: true });

  const sqlitePath = path.join(testDbDir, "weky_test.sqlite");
  const jsonPath = path.join(testDbDir, "weky_test.json");
  const schemaPath = path.join(testDbDir, "schema.prisma");

  if (fs.existsSync(sqlitePath)) fs.unlinkSync(sqlitePath);
  if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
  if (fs.existsSync(schemaPath)) fs.unlinkSync(schemaPath);

  // 1. SQLite Storage Tests
  console.log("  Testing SqliteWekyStorage (node:sqlite)...");
  const sqlite = new SqliteWekyStorage(sqlitePath);

  const samplePlayer: LeaderboardPlayer = {
    id: "user_123",
    username: "EliteGamer",
    avatarUrl: "https://example.com/avatar.png",
    elo: 1450,
    wins: 12,
    losses: 3,
    draws: 1,
    winStreak: 4,
    highestStreak: 6,
    scores: { "2048": 8192, snake: 450 },
    lastPlayed: Date.now(),
  };

  await sqlite.set("user_123", samplePlayer);
  const fetched = await sqlite.get("user_123");
  assert.ok(fetched, "Player should be retrieved from SQLite");
  assert.strictEqual(fetched.id, "user_123");
  assert.strictEqual(fetched.username, "EliteGamer");
  assert.strictEqual(fetched.elo, 1450);
  assert.strictEqual(fetched.scores["2048"], 8192);

  // Tournament persistence
  await sqlite.saveTournament("tourn_1", "fight", { round: 2, status: "active" }, "user_123");
  const tourn = await sqlite.getTournament("tourn_1");
  assert.ok(tourn, "Tournament should be saved in SQLite");
  assert.strictEqual(tourn.round, 2);

  const allPlayers = await sqlite.getAll();
  assert.strictEqual(allPlayers.length, 1);
  sqlite.close();
  console.log("  ✔ SqliteWekyStorage passed!");

  // 2. JsonWekyStorage Tests
  console.log("  Testing JsonWekyStorage...");
  const jsonStorage = new JsonWekyStorage(jsonPath);
  await jsonStorage.set("user_456", {
    id: "user_456",
    username: "CasualPlayer",
    elo: 1100,
    wins: 2,
    losses: 5,
    draws: 0,
    winStreak: 0,
    highestStreak: 1,
    scores: { fasttype: 95 },
    lastPlayed: Date.now(),
  });

  const fetchedJson = await jsonStorage.get("user_456");
  assert.ok(fetchedJson, "Player should be retrieved from JSON file");
  assert.strictEqual(fetchedJson.username, "CasualPlayer");
  assert.strictEqual(fetchedJson.scores.fasttype, 95);
  console.log("  ✔ JsonWekyStorage passed!");

  // 3. WekyDatabaseHandler Factory
  console.log("  Testing WekyDatabaseHandler factory & resolveWekyStorage...");
  const adapterSqlite = WekyDatabaseHandler.create("sqlite");
  assert.ok(adapterSqlite instanceof SqliteWekyStorage);
  (adapterSqlite as SqliteWekyStorage).close();

  const adapterJson = WekyDatabaseHandler.create("json");
  assert.ok(adapterJson instanceof JsonWekyStorage);

  const adapterMemory = WekyDatabaseHandler.create("memory");
  assert.strictEqual(adapterMemory, undefined);

  const resolved = resolveWekyStorage({ database: "json" });
  assert.ok(resolved instanceof JsonWekyStorage);
  console.log("  ✔ WekyDatabaseHandler passed!");

  // 4. Prisma Schema Auto-Migration
  console.log("  Testing Prisma schema auto-generation...");
  fs.writeFileSync(schemaPath, 'datasource db { provider = "postgresql" }\n\ngenerator client { provider = "prisma-client-js" }\n');
  const applied = applyPrismaWekyModel(schemaPath);
  assert.strictEqual(applied, true, "Should append models to schema");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  assert.ok(schemaContent.includes("model WekyPlayer"));
  assert.ok(schemaContent.includes("model WekyTournament"));

  const reapplied = applyPrismaWekyModel(schemaPath);
  assert.strictEqual(reapplied, false, "Should not duplicate models");
  console.log("  ✔ Prisma schema generation passed!");

  // 5. LeaderboardManager Integration with SQLite
  console.log("  Testing LeaderboardManager backed by SqliteWekyStorage...");
  const lbStorage = new SqliteWekyStorage(sqlitePath);
  const lb = new LeaderboardManager({ storageAdapter: lbStorage });

  await lb.recordScore("user_123", "2048", 16384, "EliteGamer");
  const p1 = await lb.getPlayer("user_123");
  assert.strictEqual(p1.scores["2048"], 16384);

  const topPlayers = await lb.getTopByScore("2048");
  assert.ok(topPlayers.length >= 1);
  assert.strictEqual(topPlayers[0].player.username, "EliteGamer");
  lbStorage.close();
  console.log("  ✔ LeaderboardManager SQLite integration passed!");

  // Clean up
  try {
    fs.rmSync(testDbDir, { recursive: true, force: true });
  } catch {}

  console.log("🎉 All @m3rcena/weky Database Tests Passed Successfully!");
}

runDatabaseTests().catch((err) => {
  console.error("❌ Database tests failed:", err);
  process.exit(1);
});
