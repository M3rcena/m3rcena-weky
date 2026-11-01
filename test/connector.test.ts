import assert from "node:assert";
import { EventEmitter } from "node:events";
import { WekyManager } from "../src/core/WekyManager.js";
import { WekyEcoConnector } from "../src/connector/WekyEcoConnector.js";

// Mock Discord Client
class MockClient extends EventEmitter {
  public user = { id: "bot_123", username: "TestBot" };
}

// Mock Economy Engine
class MockEcoManager {
  public balances: Map<string, number> = new Map();

  constructor(initial: Record<string, number> = {}) {
    for (const [k, v] of Object.entries(initial)) {
      this.balances.set(k, v);
    }
  }

  public async getBalance(userId: string) {
    const bal = this.balances.get(userId) ?? 0;
    return { wallet: bal, bank: 0, bankCapacity: 10000, netWorth: bal };
  }

  public async getAccount(userId: string) {
    const bal = this.balances.get(userId) ?? 0;
    return { id: userId, wallet: bal, bank: 0, bankCapacity: 10000 };
  }

  public async addWallet(userId: string, amount: number) {
    const cur = this.balances.get(userId) ?? 0;
    const next = cur + amount;
    this.balances.set(userId, next);
    return next;
  }

  public async removeWallet(userId: string, amount: number) {
    const cur = this.balances.get(userId) ?? 0;
    const next = Math.max(0, cur - amount);
    this.balances.set(userId, next);
    return next;
  }
}

async function runConnectorTests() {
  console.log("▶ Testing @m3rcena/weky <-> @m3rcena/eco Connector...");

  const client = new MockClient();
  const weky = new WekyManager(client as any, { notifyUpdates: false, database: "memory" });

  const eco = new MockEcoManager({
    player_1: 1000,
    player_2: 800,
    player_poor: 50,
  });

  const connector = weky.connectEco(eco, {
    defaultWinReward: 100,
    defaultLossPenalty: 30,
    defaultDrawReward: 20,
    defaultScoreMultiplier: 0.1,
    maxScoreReward: 400,
    streakBonus: 10,
    tournamentChampionPrize: 600,
    wagerHouseFee: 5, // 5% house fee
  });

  assert.ok(connector instanceof WekyEcoConnector, "connectEco should return WekyEcoConnector instance");

  // 1. PvP Wagers: Success Scenario
  console.log("  Testing PvP Wager Escrow & Resolution...");
  const wagerRes = await connector.createWager({
    wagerId: "wager_match_100",
    player1Id: "player_1",
    player2Id: "player_2",
    amount: 200,
    game: "fight",
  });

  assert.strictEqual(wagerRes.success, true);
  assert.ok(wagerRes.wager);
  assert.strictEqual(wagerRes.wager.totalPot, 400);

  // Check escrowed balances (player_1: 1000 - 200 = 800, player_2: 800 - 200 = 600)
  const p1EscrowBal = (await eco.getBalance("player_1")).wallet;
  const p2EscrowBal = (await eco.getBalance("player_2")).wallet;
  assert.strictEqual(p1EscrowBal, 800, "Player 1 should be debited 200");
  assert.strictEqual(p2EscrowBal, 600, "Player 2 should be debited 200");

  // Player 1 wins wager
  const resolveRes = await connector.resolveWager("wager_match_100", "player_1");
  assert.ok(resolveRes);
  // Total pot is 400. 5% house fee = 20. Winner gets 380.
  assert.strictEqual(resolveRes.amount, 380);
  const p1FinalBal = (await eco.getBalance("player_1")).wallet;
  assert.strictEqual(p1FinalBal, 800 + 380, "Player 1 should receive 380");
  console.log("  ✔ PvP Wager Escrow & Resolution passed!");

  // 2. PvP Wagers: Insufficient Funds
  console.log("  Testing PvP Wager Insufficient Funds Prevention...");
  const failedWager = await connector.createWager({
    wagerId: "wager_failed",
    player1Id: "player_1",
    player2Id: "player_poor", // only has 50
    amount: 100,
  });
  assert.strictEqual(failedWager.success, false);
  assert.strictEqual(failedWager.failedUserId, "player_poor");
  console.log("  ✔ PvP Wager Insufficient Funds handled correctly!");

  // 3. PvP Wagers: Refund on Draw
  console.log("  Testing PvP Wager Refund on Draw...");
  const refundWager = await connector.createWager({
    wagerId: "wager_refund_test",
    player1Id: "player_1",
    player2Id: "player_2",
    amount: 50,
  });
  assert.strictEqual(refundWager.success, true);
  await connector.refundWager("wager_refund_test", "Match tied");
  const p2AfterRefund = (await eco.getBalance("player_2")).wallet;
  assert.strictEqual(p2AfterRefund, 600, "Player 2 should be refunded the 50 coins");
  console.log("  ✔ PvP Wager Refund on Draw passed!");

  // 4. Automated Game Rewards via Events
  console.log("  Testing Automated Minigame Victory Payouts...");
  const p2BeforeWin = (await eco.getBalance("player_2")).wallet;
  weky.emit("gameOver", {
    game: "tictactoe",
    user: { id: "player_2" } as any,
    outcome: "WIN",
    score: 0,
    timeElapsed: 5000,
    timestamp: Date.now(),
  });

  // Allow event microtask to resolve
  await new Promise((r) => setTimeout(r, 50));
  const p2AfterWin = (await eco.getBalance("player_2")).wallet;
  assert.strictEqual(p2AfterWin, p2BeforeWin + 100, "Player 2 should be awarded defaultWinReward (100)");
  console.log("  ✔ Automated Minigame Victory Payouts passed!");

  // 5. Automated Solo Score Rewards (2048, Snake)
  console.log("  Testing Solo Minigame Score Multiplier Payouts...");
  const p2BeforeSolo = (await eco.getBalance("player_2")).wallet;
  weky.emit("gameOver", {
    game: "2048",
    user: { id: "player_2" } as any,
    outcome: "finished",
    score: 1500, // 1500 * 0.1 = 150 coins
    timeElapsed: 25000,
    timestamp: Date.now(),
  });

  await new Promise((r) => setTimeout(r, 50));
  const p2AfterSolo = (await eco.getBalance("player_2")).wallet;
  assert.strictEqual(p2AfterSolo, p2BeforeSolo + 150, "Player 2 should be awarded 150 coins from solo score");
  console.log("  ✔ Solo Minigame Score Multipliers passed!");

  // 6. Tournament Champion Prize
  console.log("  Testing Tournament Champion Grand Prize...");
  const p1BeforeTourn = (await eco.getBalance("player_1")).wallet;
  weky.emit("tournamentEnd", {
    tournamentId: "tourn_championship_2026",
    champion: { id: "player_1", username: "ChampionGamer" },
    reason: "finished",
    duration: 60000,
  });

  await new Promise((r) => setTimeout(r, 50));
  const p1AfterTourn = (await eco.getBalance("player_1")).wallet;
  assert.strictEqual(p1AfterTourn, p1BeforeTourn + 600, "Player 1 should receive 600 coins tournament prize");
  console.log("  ✔ Tournament Champion Grand Prize passed!");

  console.log("🎉 All @m3rcena/weky <-> @m3rcena/eco Connector Tests Passed Successfully!");
}

runConnectorTests().catch((err) => {
  console.error("❌ Connector tests failed:", err);
  process.exit(1);
});
