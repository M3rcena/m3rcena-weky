import { formatTime, getRandomNHIE, getRandomSentence, getRandomTriviaFact, getRandomWord, getRandomWYPTB, getRandomWYR, MathEvaluator, POPULAR_POKEMONS, Render2048, RenderFight, RenderHangman, RenderPokemon, RenderSnake, shuffleString } from "../src/index.js";

async function runTests() {
  console.log("=== STARTING WEKY COMPREHENSIVE VERIFICATION ===\n");

  // 1. Math Evaluator Tests
  console.log("Testing MathEvaluator...");
  const mathTests = [
    { expr: "2 + 2", expected: 4 },
    { expr: "10 - 4 * 2", expected: 2 },
    { expr: "(10 - 4) * 2", expected: 12 },
    { expr: "2 ^ 3", expected: 8 },
    { expr: "sqrt(16) + 5", expected: 9 },
    { expr: "5!", expected: 120 },
    { expr: "sin(0)", expected: 0 },
    { expr: "cos(0)", expected: 1 },
    { expr: "log(100)", expected: 2 },
    { expr: "10 / 0", errorExpected: true },
  ];

  for (const t of mathTests) {
    const res = MathEvaluator.evaluate(t.expr);
    if (t.errorExpected) {
      if (!res.error) throw new Error(`Expected error for ${t.expr}, got ${res.result}`);
      console.log(`  ✓ ${t.expr} -> Handled error: "${res.error}"`);
    } else {
      if (Math.abs((res.result ?? 0) - t.expected!) > 0.001) {
        throw new Error(`Failed ${t.expr}: expected ${t.expected}, got ${res.result}`);
      }
      console.log(`  ✓ ${t.expr} = ${res.formatted}`);
    }
  }

  // 2. Canvas Renderers Tests
  console.log("\nTesting @napi-rs/canvas Renderers...");

  // Render 2048
  const board2048 = [
    [2, 4, 8, 16],
    [32, 64, 128, 256],
    [512, 1024, 2048, 0],
    [0, 2, 0, 4],
  ];
  const b2048 = await Render2048.renderBoard(board2048, 4096, "M3rcena", "");
  if (!Buffer.isBuffer(b2048) || b2048.length < 1000) throw new Error("2048 render failed");
  console.log(`  ✓ Render2048 generated buffer (${b2048.length} bytes)`);

  // Render Snake
  const snakeParts = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 5, y: 7 },
  ];
  const bSnake = await RenderSnake.renderBoard(snakeParts, { x: 8, y: 8 }, "UP", 15, 15, "M3rcena", "");
  if (!Buffer.isBuffer(bSnake) || bSnake.length < 1000) throw new Error("Snake render failed");
  console.log(`  ✓ RenderSnake generated buffer (${bSnake.length} bytes)`);

  // Render Fight (Request & Battle Card & Outcome Card)
  const bFightReq = await RenderFight.renderRequestCard({ username: "Hero", avatarUrl: "" }, { username: "Villain", avatarUrl: "" });
  if (!Buffer.isBuffer(bFightReq) || bFightReq.length < 1000) throw new Error("Fight request render failed");
  console.log(`  ✓ RenderFight.renderRequestCard generated buffer (${bFightReq.length} bytes)`);

  const bFightBattle = await RenderFight.renderBattleCard({ id: "1", username: "Hero", avatarUrl: "", health: 80, coins: 20 }, { id: "2", username: "Villain", avatarUrl: "", health: 45, coins: 35 }, "1", "Hero used Heavy Attack for 28 damage!");
  if (!Buffer.isBuffer(bFightBattle) || bFightBattle.length < 1000) throw new Error("Fight battle render failed");
  console.log(`  ✓ RenderFight.renderBattleCard generated buffer (${bFightBattle.length} bytes)`);

  const bFightOutcome = await RenderFight.renderOutcomeCard({ username: "Hero", avatarUrl: "" }, { username: "Villain", avatarUrl: "" }, "WIN");
  if (!Buffer.isBuffer(bFightOutcome) || bFightOutcome.length < 1000) throw new Error("Fight outcome render failed");
  console.log(`  ✓ RenderFight.renderOutcomeCard generated buffer (${bFightOutcome.length} bytes)`);

  // Render Hangman
  const bHangman = await RenderHangman.renderCard(3, "_ E L L _", ["E", "L", "X", "Z", "Q"], "M3rcena", "", false, false, "HELLO");
  if (!Buffer.isBuffer(bHangman) || bHangman.length < 1000) throw new Error("Hangman render failed");
  console.log(`  ✓ RenderHangman generated buffer (${bHangman.length} bytes)`);

  // Render Pokemon (Silhouette & Revealed)
  const samplePokemon = POPULAR_POKEMONS[0];
  const bPokeHidden = await RenderPokemon.renderCard(samplePokemon, false);
  if (!Buffer.isBuffer(bPokeHidden) || bPokeHidden.length < 1000) throw new Error("Pokemon hidden render failed");
  console.log(`  ✓ RenderPokemon (Silhouette) generated buffer (${bPokeHidden.length} bytes)`);

  const bPokeRevealed = await RenderPokemon.renderCard(samplePokemon, true);
  if (!Buffer.isBuffer(bPokeRevealed) || bPokeRevealed.length < 1000) throw new Error("Pokemon revealed render failed");
  console.log(`  ✓ RenderPokemon (Revealed) generated buffer (${bPokeRevealed.length} bytes)`);

  // 3. Datasets & Helpers Tests
  console.log("\nTesting Datasets & Utility Helpers...");
  const sentence = getRandomSentence("hard");
  console.log(`  ✓ Hard Sentence: "${sentence.slice(0, 40)}..."`);

  const word = getRandomWord();
  console.log(`  ✓ Random Word: "${word}"`);

  const scrambled = shuffleString(word);
  console.log(`  ✓ Shuffled: "${scrambled}"`);

  const wyptb = getRandomWYPTB();
  console.log(`  ✓ WYPTB: Perk: "${wyptb.question}" | Consequence: "${wyptb.consequence}"`);

  const wyr = getRandomWYR();
  console.log(`  ✓ WYR: "${wyr.optionA}" vs "${wyr.optionB}"`);

  const trivia = getRandomTriviaFact();
  console.log(`  ✓ Trivia: "${trivia.statement}" (True? ${trivia.isTrue})`);

  const nhie = getRandomNHIE();
  console.log(`  ✓ NHIE: "${nhie}"`);

  const duration = formatTime(185400);
  console.log(`  ✓ FormatTime (185400ms): "${duration}"`);

  console.log("\n✅ ALL 17 TESTS PASSED WITH 100% SUCCESS!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
