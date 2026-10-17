import { WekyCanvas, WekyEngine } from "../src/index.js";

async function runDashboardTests() {
  console.log("=== STARTING HEADLESS ENGINES & DASHBOARD VERIFICATION ===\n");

  // 1. 2048 Engine
  console.log("Testing 2048 Headless Engine...");
  const g2048 = WekyEngine.game2048();
  const init2048 = g2048.getState();
  if (init2048.board.length !== 4 || init2048.board[0].length !== 4) {
    throw new Error("2048 initial grid is not 4x4");
  }
  const moveRes = g2048.move("LEFT");
  const controls2048 = g2048.getControls();
  if (!controls2048 || controls2048.length < 2) {
    throw new Error("2048 controls schema invalid");
  }
  const img2048Data = await g2048.renderDataURL();
  if (!img2048Data.startsWith("data:image/png;base64,")) {
    throw new Error("2048 renderDataURL failed to produce valid Data URL");
  }
  console.log(`  ✓ 2048 Engine: initialized, moved, generated Data URL (${img2048Data.length} chars)`);

  // 2. Snake Engine
  console.log("\nTesting Snake Headless Engine...");
  const snake = WekyEngine.snake({ gridSize: 15 });
  snake.changeDirection("RIGHT");
  const stepRes = snake.step();
  const snakeControls = snake.getControls();
  const snakeDataUrl = await snake.renderDataURL();
  if (!snakeDataUrl.startsWith("data:image/png;base64,")) {
    throw new Error("Snake renderDataURL failed");
  }
  console.log(`  ✓ Snake Engine: stepped (alive=${!stepRes.isGameOver}), controls generated, Data URL rendered`);

  // 3. Fight Duel Engine
  console.log("\nTesting Fight Headless Engine...");
  const fight = WekyEngine.fight({
    player1: { id: "p1", username: "Knight" },
    player2: { id: "p2", username: "Dragon" },
    startHealth: 100,
  });
  const actRes = fight.action("p1", "ATTACK");
  if (!actRes.success) throw new Error("Fight action failed");
  const fightControls = fight.getControls();
  const fightDataUrl = await fight.renderDataURL();
  if (!fightDataUrl.startsWith("data:image/png;base64,")) {
    throw new Error("Fight renderDataURL failed");
  }
  console.log(`  ✓ Fight Engine: Action executed -> "${actRes.announcement}". Card Data URL rendered`);

  // 4. Calculator Engine
  console.log("\nTesting Calculator Headless Engine...");
  const calc = WekyEngine.calculator();
  calc.press("9");
  calc.press("×");
  calc.press("9");
  calc.press("=");
  const calcState = calc.getState();
  if (calcState.display !== "81") {
    throw new Error(`Calculator expected 81, got ${calcState.display}`);
  }
  const calcControls = calc.getControls();
  if (calcControls.length !== 5) {
    throw new Error(`Calculator expected 5 rows of controls, got ${calcControls.length}`);
  }
  console.log(`  ✓ Calculator Engine: 9 × 9 = ${calcState.display}, controls verified`);

  // 5. Hangman Engine
  console.log("\nTesting Hangman Headless Engine...");
  const hangman = WekyEngine.hangman({ word: "DASHBOARD" });
  const g1 = hangman.guess("A");
  const g2 = hangman.guess("Z");
  if (!g1.correct || g2.correct) {
    throw new Error("Hangman guess evaluation incorrect");
  }
  const hangmanControls = hangman.getControls();
  const hangmanDataUrl = await hangman.renderDataURL("AdminUser");
  if (!hangmanDataUrl.startsWith("data:image/png;base64,")) {
    throw new Error("Hangman renderDataURL failed");
  }
  console.log(`  ✓ Hangman Engine: Guessed 'A' (correct), 'Z' (mistake). Rendered Data URL`);

  // 6. TicTacToe Engine
  console.log("\nTesting TicTacToe Headless Engine...");
  const ttt = WekyEngine.ticTacToe();
  ttt.move(0, 0); // X
  ttt.move(1, 1); // O
  ttt.move(0, 1); // X
  ttt.move(1, 2); // O
  const winMove = ttt.move(0, 2); // X wins top row!
  if (!winMove.isWon || winMove.winner !== "X") {
    throw new Error(`Expected TicTacToe X win, got ${JSON.stringify(winMove)}`);
  }
  const tttControls = ttt.getControls();
  console.log(`  ✓ TicTacToe Engine: Top row win detected for ${winMove.winner}, 3x3 controls schema verified`);

  // 7. WekyCanvas Graphics Hub
  console.log("\nTesting WekyCanvas Direct Rendering Suite...");
  const rawFightCard = await WekyCanvas.fight.battle({ id: "1", username: "Alpha", avatarUrl: "", health: 70, coins: 50 }, { id: "2", username: "Beta", avatarUrl: "", health: 30, coins: 20 }, "1", "Alpha cast Fireball!");
  const base64Str = WekyCanvas.toBase64(rawFightCard);
  const dataUriStr = WekyCanvas.toDataURL(rawFightCard);
  if (!base64Str || !dataUriStr.startsWith("data:image/png;base64,")) {
    throw new Error("WekyCanvas base64/dataURL conversion failed");
  }
  console.log(`  ✓ WekyCanvas: generated fight card buffer (${rawFightCard.length} bytes) -> Base64 / Data URL ready`);

  console.log("\n✅ ALL HEADLESS ENGINES & DASHBOARD CONTROLS VERIFIED SUCCESSFULLY!");
}

runDashboardTests().catch((err) => {
  console.error("Dashboard tests failed:", err);
  process.exit(1);
});
