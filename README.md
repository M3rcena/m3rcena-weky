<div align="center">
  <img src="./assets/logo.png" alt="Weky Logo" width="220" />
  <h1>@m3rcena/weky</h1>
  <h3>The Ultimate Discord.js v14 Minigames Engine</h3>
  <p>
    <b>Blazingly Fast Native Graphics. Strictly Typed. Zero External Server Dependencies.</b><br>
    The completely remade, modern game engine for Discord bots.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/@m3rcena/weky">
      <img src="https://img.shields.io/npm/v/@m3rcena/weky?style=for-the-badge&color=crimson" alt="NPM Version" />
    </a>
    <a href="https://www.npmjs.com/package/@m3rcena/weky">
      <img src="https://img.shields.io/npm/dt/@m3rcena/weky?style=for-the-badge&color=success" alt="Downloads" />
    </a>
    <a href="https://discord.gg/U4E2Pn2wyn">
      <img src="https://img.shields.io/discord/1447491639550410796?style=for-the-badge&label=Support&color=5865F2" alt="Discord Support" />
    </a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Discord.js-v14%20Ready-5865F2?style=flat-square&logo=discord" alt="DJS v14" />
    <img src="https://img.shields.io/badge/Canvas-@napi--rs/canvas-orange?style=flat-square&logo=rust" alt="@napi-rs/canvas" />
    <img src="https://img.shields.io/badge/TypeScript-100%25-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/License-Apache--2.0-green?style=flat-square" alt="Apache-2.0" />
  </p>
</div>

---

## ⚡ What's New in v14.28.0?

> **Versioning Notice**: `@m3rcena/weky` strictly mirrors the version numbering of **`discord.js`** (now `14.28.0`). Whenever Discord.js releases updates, `@m3rcena/weky` releases an identical version to ensure 100% API parity, zero peer-dependency conflicts, and instantaneous support for Discord's newest features like **Components V2**.

Version 14.28.0 introduces 7 major, ground-breaking features that elevate Discord gaming beyond simple bot commands:

1. 🕹️ **The Arcade Hub (`weky.createArcadeHub`)**: Centralized launcher grouping all 17 minigames into 4 clean categories with dropdown menus, in-arcade game customization (`gameOptions`), and interactive pre-launch match setup screens (`configureBeforeLaunch: true`) with difficulty, boss, and PvP opponent selection.
2. 🏆 **Automated Tournament & Canvas Bracket Engine (`weky.createTournament`)**: Single-elimination eSports tournaments (4 to 16 players) with live `@napi-rs/canvas` bracket charts, simultaneous preliminary rounds, and public Grand Finals.
3. 🤖 **Intelligent AI Opponents & RPG Boss Duels**: Play solo against Minimax TicTacToe AI, psychological RPS predictors, or battle 3 unique RPG bosses (*Dragon Sovereign*, *Cyber Knight*, *Shadow Goblin*) in Fight!
4. 🔊 **Web Dashboard MP3 Soundboard Engine (`weky.soundboard`)**: High-fidelity zero-latency bundled MP3 audio tracks with player-scoped targeting (`targetUserIds`, `userId`) and active dashboard presence filtering (`requireActiveDashboardUser`).
5. 📈 **Plug-and-Play ELO & Canvas Leaderboards (`weky.leaderboard`, `weky.renderLeaderboard`)**: Mathematical ELO rating calculation with developer custom pointing and neon high-score poster generation.
6. 🎟️ **"Share & Flex" Gamer Score Cards (`weky.renderShareCard`)**: Collectible holographic gamer victory tickets with custom stats and rank badges.
7. 🌐 **Cross-Platform Bridge (`WekyBridge`)**: Bidirectional real-time state synchronization connecting Discord bot minigames with web dashboards.

---

## 🌟 v14.28.0 Spotlight Features & Examples

### 🕹️ 1. The Arcade Hub Launcher

Launch a complete arcade cabinet interface in one line of code! Players can browse games by category (*Classic Arcade*, *PvP Duels*, *Brain & Puzzles*, *Party & Social*), click "🎲 Random Game", or configure their match settings with interactive buttons before launching:

```typescript
// /arcade Slash Command or Message
await weky.createArcadeHub({
  context: interaction, // or message
  title: "Official Community Arcade Cabinet",
  configureBeforeLaunch: true, // Interactive setup screen with difficulty/boss/PvP buttons
  gameOptions: {
    fight: { startHealth: 250, embed: { title: "Arcade Colosseum Fight" } },
    tictactoe: { difficulty: "unbeatable", embed: { title: "Arcade TicTacToe" } },
    snake: { gridSize: 18 },
  },
});
```

### 🏆 2. Automated Tournaments & Canvas Brackets

Organize seamless 4 to 16-player championships with auto-generated visual brackets:

```typescript
await weky.createTournament({
  context: interaction,
  game: "tictactoe", // "tictactoe" | "rps" | "fight"
  players: [player1, player2, player3, player4], // User or GuildMember array
  title: "Autumn Invitational Cup 🏆",
});
```

### 🤖 3. Intelligent AI Opponents & Boss Fights

No opponent online? Play solo against intelligent AI engines!

```typescript
// Unbeatable Minimax Tic Tac Toe
await weky.createTicTacToe({
  context: interaction,
  ai: true,
  difficulty: "unbeatable", // "easy" | "medium" | "hard" | "unbeatable"
});

// Turn-Based RPG Fight vs Dragon Sovereign Boss
await weky.createFight({
  context: interaction,
  ai: true,
  boss: "dragon", // "dragon" | "cyber_knight" | "shadow_goblin"
});

// Psychological Rock Paper Scissors
await weky.createRPS({
  context: interaction,
  difficulty: "hard", // Heuristic win-stay / lose-shift predictor
});
```

### 📈 4. Plug-and-Play ELO & Canvas Leaderboards

Calculate ELO ratings with standard FIDE formulas and render high-res arcade posters:

```typescript
// 1. Record a 1v1 match outcome
const eloResult = await weky.leaderboard.recordMatch(
  winner.id,
  loser.id,
  "p1",
  { p1Username: winner.username, p2Username: loser.username }
);
console.log(`Winner ELO: ${eloResult.p1NewElo} (+${eloResult.p1Change})`);

// 2. Render an eSports-style High-Score Poster
const buffer = await weky.renderLeaderboard({
  title: "GLOBAL TOURNAMENT RANKINGS",
  subtitle: "SEASON 1 • TOP PLAYERS",
  entries: [
    { rank: 1, username: "Alice", scoreOrElo: "1,485 ELO", streak: 5 },
    { rank: 2, username: "Bob", scoreOrElo: "1,420 ELO", stats: "14W - 2L" },
  ],
});
```

### 🎟️ 5. "Share & Flex" Gamer Score Cards

Generate collectible gamer passports and victory tickets:

```typescript
const ticketBuffer = await weky.renderShareCard({
  username: interaction.user.username,
  avatarUrl: interaction.user.displayAvatarURL({ extension: "png" }),
  gameName: "Retro Snake",
  headline: "NEW RECORD ACHIEVED! 🏆",
  primaryScore: "28,450 PTS",
  rankBadge: "GRANDMASTER",
  stats: [
    { label: "DIFFICULTY", value: "INSANE", color: "#ff4444" },
    { label: "APPLES", value: "94", color: "#57f287" },
    { label: "TIME", value: "11m 40s", color: "#00f7ff" },
    { label: "ACCURACY", value: "99.1%", color: "#ffd700" },
  ],
});
```

---

---

## 📚 Complete Documentation & Changelog

Looking for exhaustive options, callback signatures, headless engine hooks, or canvas rendering methods for all 17 minigames?

- 📖 **[Read the Full Documentation (DOCUMENTATION.md)](./DOCUMENTATION.md)**
- 📋 **[View Version History & Changelog (CHANGELOG.md)](./CHANGELOG.md)**

---

## 📦 Installation

```bash
npm install @m3rcena/weky @napi-rs/canvas discord.js
# or
yarn add @m3rcena/weky @napi-rs/canvas discord.js
# or
pnpm add @m3rcena/weky @napi-rs/canvas discord.js
```

---

## 🚀 Quick Start

### 1. Initialize the Weky Manager

```typescript
import { Client, GatewayIntentBits } from "discord.js";
import { WekyManager } from "@m3rcena/weky";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageTyping],
});

let weky: WekyManager;

client.once("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online!`);
  // Initialize Weky with custom brand color, timeout, and update notifier
  weky = new WekyManager(c, {
    embedColor: "#5865F2", // Default brand color for all games
    defaultTimeout: 60_000, // Default timeout (ms)
    notifyUpdates: true, // Alerts in console when a new package version is on npm
  });
});

client.login("YOUR_BOT_TOKEN");
```

### 2. Run Games (Works with Slash Commands & Messages)

Our universal `ContextAdapter` works automatically with `ChatInputCommandInteraction`, `ButtonInteraction`, or standard `Message`!

```typescript
// Inside your Slash Command or Message event:
await weky.create2048({
  context: interaction, // or message
  embed: {
    title: "2048 Challenge",
    color: "#5865F2", // Accepts Hex, Number (0x5865F2), or Discord color names
  },
});
```

### 3. Terminal Update Notifier Box

When `notifyUpdates` is enabled (default), Weky automatically checks the npm registry in the background and alerts you in your console if an update is available:

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         New version of @m3rcena/weky is available!          │
│                     14.27.0 -> 14.28.0                      │
│    Registry: https://www.npmjs.com/package/@m3rcena/weky    │
│         Run npm i @m3rcena/weky@14.28.0 to update!          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 Available Minigames (17 Games)

| Game                           | Method                             | Description                                              | Graphics             |
| :----------------------------- | :--------------------------------- | :------------------------------------------------------- | :------------------- |
| **2048**                       | `weky.create2048`                  | Slide and merge tiles to reach 2048                      | 🎨 `@napi-rs/canvas` |
| **Snake**                      | `weky.createSnake`                 | Retro arcade snake with D-pad controls                   | 🎨 `@napi-rs/canvas` |
| **Fight RPG**                  | `weky.createFight`                 | 2-player turn-based battle with weapons & power-ups      | 🎨 `@napi-rs/canvas` |
| **Hangman**                    | `weky.createHangman`               | Guess words before the gallows are completed             | 🎨 `@napi-rs/canvas` |
| **Guess The Pokémon**          | `weky.createGuessThePokemon`       | Iconic "Who's that Pokémon?" silhouette quiz             | 🎨 `@napi-rs/canvas` |
| **Scientific Calculator**      | `weky.createCalculator`            | Full keypad calculator with formula modals               | 📟 Interactive UI    |
| **Fast Type**                  | `weky.createFastType`              | Speed typing challenge with WPM calculation & anti-cheat | ⚡ Speed test        |
| **Chaos Words**                | `weky.createChaosWords`            | Search and uncover words embedded in scrambled text      | 🧩 Puzzle            |
| **Guess The Number**           | `weky.createGuessTheNumber`        | High/Low range clues in Solo or Channel-wide mode        | 🔢 Logic             |
| **Lie Swatter**                | `weky.createLieSwatter`            | Rapid-fire Truth or Lie trivia with explanations         | 🧠 Trivia            |
| **Never Have I Ever**          | `weky.createNeverHaveIEver`        | Group voting party game with live percentages            | 👥 Social            |
| **Quick Click**                | `weky.createQuickClick`            | Reaction speed game measured in milliseconds             | ⏱️ Reaction          |
| **Shuffle Guess**              | `weky.createShuffleGuess`          | Unscramble scrambled word with reshuffle option          | 🔀 Word puzzle       |
| **Will You Press The Button?** | `weky.createWillYouPressTheButton` | Moral dilemmas with global community stats               | 🔘 Dilemma           |
| **Would You Rather?**          | `weky.createWouldYouRather`        | Option A vs Option B with live community votes           | 🅰️🅱️ Choice          |
| **Rock Paper Scissors**        | `weky.createRPS`                   | Play against the Bot or challenge another user           | 🪨📄✂️ Dual mode     |
| **Tic Tac Toe**                | `weky.createTicTacToe`             | Interactive 3x3 turn-based grid match                    | ❌⭕ Strategy        |

---

## 📖 Detailed Game Examples

### 🟢 1. 2048

Slide numbered tiles on a 4x4 grid using directional buttons. Built-in high performance canvas rendering.

```typescript
await weky.create2048({
  context: interaction,
  embed: { title: "2048 Arcade", color: "Blurple" },
  time: 120_000,
});
```

### 🐍 2. Snake

Play the classic snake arcade game directly inside Discord. Features directional movement, glowing apple generation, collision detection, and score tracking.

```typescript
await weky.createSnake({
  context: interaction,
  gridSize: 15,
  embed: { title: "Retro Snake", color: "Green" },
});
```

### ⚔️ 3. Turn-Based RPG Fight

Challenge an opponent to a duel! Includes HP bars, coin collection, regular and heavy attacks, heals, shield power-ups, double damage buffs, and surrender options.

```typescript
const opponent = interaction.options.getUser("opponent");

await weky.createFight({
  context: interaction,
  opponent: opponent,
  embed: { title: "Battle Arena" },
});
```

### 🔎 4. Who's That Pokémon?

Generates a dark Pokémon silhouette on an authentic Pokédex card. Players guess via chat or modal, revealing the vibrant full-color Pokémon upon victory or timeout!

```typescript
await weky.createGuessThePokemon({
  context: interaction,
  embed: { title: "Who's That Pokémon?" },
  time: 60_000,
});
```

### 🪢 5. Hangman

Features realistic wooden gallows and stickman drawing. Supports categories like Animals, Countries, Technology, Gaming, and Food, or custom words!

```typescript
await weky.createHangman({
  context: interaction,
  category: "Technology", // or custom word: { word: "DISCORD" }
});
```

### 🔢 6. Scientific Calculator

A safe, full-featured Discord calculator with standard digits, brackets, power, sqrt, trigonometric functions (sin, cos, tan), log, and modal formula inputs.

```typescript
await weky.createCalculator({
  context: interaction,
  embed: { title: "Scientific Calculator", color: "Blurple" },
});
```

### ⚡ 7. Fast Type

Calculate exact Words Per Minute (WPM) with easy, medium, or hard difficulty text.

```typescript
await weky.createFastType({
  context: interaction,
  difficulty: "medium", // 'easy' | 'medium' | 'hard'
});
```

---

## 🌐 Web Dashboard & Headless Engines

`@m3rcena/weky` isn't just for Discord bots! You can power web dashboards, mobile apps, Electron desktop apps, and REST/WebSocket APIs with our **headless game engines** and **standalone canvas hub**—with **zero Discord dependencies required**.

### 🎮 Headless Engine Factory (`WekyEngine`)

Run game logic, handle moves, and extract framework-agnostic UI control schemas:

```javascript
import { WekyEngine } from "@m3rcena/weky";

// 1. Initialize Headless 2048 Game
const game2048 = WekyEngine.game2048();

// Move tiles ("UP" | "DOWN" | "LEFT" | "RIGHT")
game2048.move("LEFT");

// Current game state
console.log(game2048.getState());
// -> { board: [[2, 4, ...], ...], score: 64, isGameOver: false, isWon: false }

// Universal UI Controls Schema (ideal for React, Vue, Svelte, or HTML buttons)
const controls = game2048.getControls();
// -> [{ components: [{ id: "UP", label: "▲", style: "primary", disabled: false }] }]

// Render high-res canvas directly to web-ready Data URL
const cardDataUrl = await game2048.renderDataURL();
// -> "data:image/png;base64,iVBORw0KGgoAAAANSUh..."
```

### 🎨 Direct Canvas Rendering (`WekyCanvas`)

Render any minigame card directly into PNG buffers, base64 strings, or data URLs:

```javascript
import { WekyCanvas } from "@m3rcena/weky";

// Render Battle Card between two players
const buffer = await WekyCanvas.fight.battle({ id: "1", username: "Knight", avatarUrl: "https://...", health: 85, coins: 30 }, { id: "2", username: "Dragon", avatarUrl: "https://...", health: 40, coins: 15 }, "1", "Knight used Heavy Attack for 28 damage!");

// Convert to web-ready Data URL for <img src="..." />
const dataUrl = WekyCanvas.toDataURL(buffer);
```

---

## 💡 Pure JavaScript Type Safety & Autocomplete

Using vanilla JavaScript instead of TypeScript? You still get **100% strict autocomplete, inline hover docs, and IntelliSense** in VS Code, WebStorm, and Cursor!

- **No type annotations needed in your code**: Write standard CommonJS `require` or ESM `import`.
- **Zero build step required for JS consumers**: Emitted `.cjs` and `.js` code is pure JavaScript.
- **Rich parameter suggestions**: Full option types, emojis, and callback signatures autocomplete automatically via bundled `.d.ts` and `.d.mts` declaration maps.

---

## 🛠️ Testing & Development

Run the automated verification suite across all math parsers, canvas renderers, Components V2, and headless dashboard engines:

```bash
npm run test
```

Start the interactive testing bot:

```bash
npm run test:bot
```

Build dual ESM/CJS distribution:

```bash
npm run build
```

---

## 📄 License

Distributed under the **Apache-2.0 License**. See [LICENSE](./LICENSE) for details.

---

<p align="center">
  Engineered with ❤️ by <b>M3rcena</b>
</p>
