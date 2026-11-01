# 📖 @m3rcena/weky Comprehensive API Documentation

> 📚 **Official GitHub Wiki**: The full, categorized documentation, tutorials, and deep-dive guides are organized in the **[M3rcena Official Wiki](https://github.com/M3rcena/m3rcena-weky/wiki)**:
> - **[Weky Overview](https://github.com/M3rcena/m3rcena-weky/wiki/Weky-Overview)**
> - **[All 17 Minigames Catalog](https://github.com/M3rcena/m3rcena-weky/wiki/Weky-Minigames-Catalog)**
> - **[Next-Gen Arcade Suite](https://github.com/M3rcena/m3rcena-weky/wiki/Weky-Arcade-Suite)**
> - **[Headless Engine & Canvas Card APIs](https://github.com/M3rcena/m3rcena-weky/wiki/Weky-Headless-and-Canvas-APIs)**

Welcome to the definitive documentation for **`@m3rcena/weky`** (v14.28.0).

This document covers everything you need to know: architecture, installation, event listeners, the universal context adapter, full option references for all 17 minigames, the v14.28.0 Next-Gen Arcade Suite (Hub, Tournaments, AI Opponents & Bosses, Soundboard, ELO Leaderboards, and Gamer Cards), headless engines for web dashboards, and the standalone canvas hub.

---

## 📑 Table of Contents

1. [Architecture & Design Principles](#1-architecture--design-principles)
2. [Installation & Setup](#2-installation--setup)
3. [The Core Manager: `WekyManager`](#3-the-core-manager-wekymanager)
4. [Universal Context System: `ContextAdapter`](#4-universal-context-system-contextadapter)
5. [Complete Minigame Catalog (All 17 Minigames)](#5-complete-minigame-catalog)
   - [5.1. 2048 (`create2048`)](#51-2048)
   - [5.2. Scientific Calculator (`createCalculator`)](#52-scientific-calculator)
   - [5.3. Chaos Words (`createChaosWords`)](#53-chaos-words)
   - [5.4. Fast Type (`createFastType`)](#54-fast-type)
   - [5.5. Fight RPG Duel (`createFight`)](#55-fight-rpg-duel)
   - [5.6. Guess The Number (`createGuessTheNumber`)](#56-guess-the-number)
   - [5.7. Guess The Pokémon (`createGuessThePokemon`)](#57-guess-the-pokémon)
   - [5.8. Hangman (`createHangman`)](#58-hangman)
   - [5.9. Lie Swatter (`createLieSwatter`)](#59-lie-swatter)
   - [5.10. Never Have I Ever (`createNeverHaveIEver`)](#510-never-have-i-ever)
   - [5.11. Quick Click (`createQuickClick`)](#511-quick-click)
   - [5.12. Rock Paper Scissors (`createRPS`)](#512-rock-paper-scissors)
   - [5.13. Shuffle Guess (`createShuffleGuess`)](#513-shuffle-guess)
   - [5.14. Retro Snake (`createSnake`)](#514-retro-snake)
   - [5.15. Tic-Tac-Toe (`createTicTacToe`)](#515-tic-tac-toe)
   - [5.16. Will You Press The Button? (`createWillYouPressTheButton`)](#516-will-you-press-the-button)
   - [5.17. Would You Rather? (`createWouldYouRather`)](#517-would-you-rather)
6. [Next-Gen Arcade Suite (v14.28.0 Features)](#6-next-gen-arcade-suite-v14280-features)
   - [6.1. The Arcade Hub Launcher (`createArcadeHub`)](#61-the-arcade-hub-launcher)
   - [6.2. Automated Tournaments & Canvas Brackets (`createTournament`)](#62-automated-tournaments--canvas-brackets)
   - [6.3. Intelligent AI Opponents & RPG Bosses](#63-intelligent-ai-opponents--rpg-bosses)
   - [6.4. Dashboard Audio & MP3 Soundboard Engine (`SoundboardManager`)](#64-dashboard-audio--mp3-soundboard-engine-soundboardmanager)
   - [6.5. Plug-and-Play ELO & Canvas Leaderboards (`LeaderboardManager`)](#65-plug-and-play-elo--canvas-leaderboards)
   - [6.6. 'Share & Flex' Gamer Score Cards (`RenderShareCard`)](#66-share--flex-gamer-score-cards)
   - [6.7. Cross-Platform Bridge & Headless Dashboard Gateway (`WekyBridge`)](#67-cross-platform-bridge--headless-dashboard-gateway-wekybridge)
7. [Headless Game Engines (`WekyEngine`) for Web Dashboards](#7-headless-game-engines-wekyengine-for-web-dashboards)
8. [Standalone Canvas Hub (`WekyCanvas`)](#8-standalone-canvas-hub-wekycanvas)
9. [Safe Mathematical Evaluator (`MathEvaluator`)](#9-safe-mathematical-evaluator-mathevaluator)
10. [Built-in Datasets & Word Banks](#10-built-in-datasets--word-banks)
11. [Pure JavaScript Type Safety & Autocomplete](#11-pure-javascript-type-safety--autocomplete)
12. [Troubleshooting & Best Practices](#12-troubleshooting--best-practices)

---

## 1. Architecture & Design Principles

`@m3rcena/weky` v14.28.0 is a complete re-engineering of the original `weky` library:

- **Strict Discord.js Version Alignment:** We mirror the Discord.js version numbering (e.g., `14.28.0`). This guarantees exact API parity, zero peer-dependency conflicts, and instant support for Discord's newest features.
- **Components V2 Native:** Built from the ground up for Discord Components V2 using `ContainerBuilder`, `MediaGalleryBuilder`, and `MessageFlags.IsComponentsV2`.
- **Rust-Powered Canvas (`@napi-rs/canvas`):** Generates photorealistic high-definition game cards in memory in under 10 milliseconds.
- **Zero External Server/Database Dependencies:** All state machines, image generation, and data pools run locally inside your bot or app.
- **Dual-Mode Headless Support:** Play inside Discord channels via slash/message commands OR embed directly into web dashboards (React, Next.js, Express, Vue) using headless engines.

---

## 2. Installation & Setup

### Package Managers

```bash
# npm
npm install @m3rcena/weky @napi-rs/canvas discord.js

# pnpm
pnpm add @m3rcena/weky @napi-rs/canvas discord.js

# yarn
yarn add @m3rcena/weky @napi-rs/canvas discord.js

# bun
bun add @m3rcena/weky @napi-rs/canvas discord.js
```

### Discord Bot Client Configuration

For text-based minigames (`FastType`, `ChaosWords`, `GuessThePokemon`), your bot requires the following **Gateway Intents**:

```typescript
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { WekyManager } from "@m3rcena/weky";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Required for FastType & chat-based guesses
    GatewayIntentBits.GuildMessageTyping, // Required for FastType anti-cheat detection
  ],
});

export const weky = new WekyManager(client);

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user?.tag}!`);
});

client.login("YOUR_DISCORD_BOT_TOKEN");
```

---

## 3. The Core Manager: `WekyManager`

`WekyManager` is the unified entry point. It wraps all 17 minigames and provides global event hooks for telemetry, analytics, database logging, or XP leveling systems.

### Constructor Options

```typescript
const weky = new WekyManager(client, {
  defaultTimeout: 60_000, // Default game timeout (ms)
  embedColor: "#5865F2", // Default brand color
  unauthorizedMessage: "⛔ Only the game initiator can interact with these buttons!",
  notifyUpdates: true, // Log styled alert box in console when a new package version is on npm (default: true)
});
```

#### Flexible Constructor Signatures

`WekyManager` supports flexible initialization to maintain 100% backwards compatibility:

```typescript
// 1. Recommended: Options object
new WekyManager(client, { defaultTimeout, embedColor, unauthorizedMessage, notifyUpdates });

// 2. Boolean toggle: Enable or disable update notification box
new WekyManager(client, false);

// 3. Legacy signature: Backwards compatible with older versions
new WekyManager(client, "apiKey", false);
```

### Terminal Update Notification Box

When `notifyUpdates` is active (default), `WekyManager` automatically queries the npm registry upon bot startup without blocking execution. If an update is detected, an alert box is rendered to your console:

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

You can also trigger manual checks in code via:

```typescript
await weky.checkUpdates();
```

### Global Event Hooks (Strongly-Typed)

`WekyManager` extends Node's `EventEmitter` with **strict TypeScript parameter types**—parameters are automatically typed instead of `any`:

```typescript
// 1. Fired whenever any minigame starts
weky.on("gameStart", (event) => {
  // event is GameStartEvent: { game: string, user: User, channelId?: string, timestamp: number }
  console.log(`[WEKY] ${event.user.username} started ${event.game} in channel ${event.channelId}`);
});

// 2. Fired when a game concludes (Victory, Defeat, Timeout, Surrender)
weky.on("gameOver", (event) => {
  // event is GameOverEvent: { game: string, user: User, outcome: string, score: number, timeElapsed: number, timestamp: number }
  console.log(`[WEKY] ${event.user.username} finished ${event.game}: ${event.outcome} (Score: ${event.score}, Time: ${event.timeElapsed}ms)`);
});

// 3. Fired on leaderboard rating or score updates
weky.on("leaderboardUpdate", (event) => {
  // event is LeaderboardUpdateEvent: { userId: string, username: string, game: string, oldValue: number, newValue: number, change: number, isWin: boolean, streak: number }
  console.log(`[LEADERBOARD] ${event.username} rating changed by ${event.change} -> ${event.newValue}`);
});

// 4. Fired on cross-platform moves (Discord <-> Web Dashboard)
weky.on("crossPlatformMove", (event) => {
  // event is CrossPlatformMoveEvent: { sessionId: string, game: string, playerId: string, action: string, platform: "discord" | "dashboard" | "web" | "api" }
  console.log(`[BRIDGE] Move received from ${event.platform} for ${event.game}`);
});

// 5. Fired if an unhandled error occurs during execution
weky.on("gameError", (event) => {
  console.error(`[WEKY ERROR] ${event.game} threw an error:`, event.error);
});

// 6. Fired when an unauthorized user clicks a game button
weky.on("unauthorizedClick", (event) => {
  console.warn(`[WEKY] ${event.user.username} tried clicking controls for ${event.game}`);
});
```

---

## 4. Universal Context System: `ContextAdapter`

`@m3rcena/weky` introduces the universal `ContextAdapter`. You can pass either:

- A `ChatInputCommandInteraction` (Slash command)
- A `ButtonInteraction`
- A standard prefix `Message`

The adapter automatically detects:

1. Whether an interaction is already deferred or replied to (`reply()` vs `editReply()`).
2. Discord Components V2 flag management (`MessageFlags.IsComponentsV2`).
3. Dual file attachment streaming directly into the message or container.

---

## 5. Complete Minigame Catalog

Every game accepts a `context` parameter and optional customization properties. Below is the exhaustive reference for each of the 17 games.

---

### 5.1. 2048

Slide and combine numbered tiles on a 4x4 grid using directional buttons. Renders a native high-tech cyber-dark canvas board.

#### Options (`Types2048`)

| Option            | Type               | Default                               | Description                  |
| :---------------- | :----------------- | :------------------------------------ | :--------------------------- |
| `context`         | `GameContextInput` | **Required**                          | The Interaction or Message   |
| `time`            | `number`           | `120000`                              | Game timeout in milliseconds |
| `embed.title`     | `string`           | `"2048 Arcade"`                       | Container title              |
| `embed.color`     | `ColorResolvable`  | `"Blurple"`                           | Border / accent color        |
| `emojis.up`       | `string`           | `"⬆️"`                                | Up button emoji              |
| `emojis.down`     | `string`           | `"⬇️"`                                | Down button emoji            |
| `emojis.left`     | `string`           | `"⬅️"`                                | Left button emoji            |
| `emojis.right`    | `string`           | `"➡️"`                                | Right button emoji           |
| `quitButton`      | `string`           | `"Quit Game"`                         | Quit button label            |
| `wonMessage`      | `string`           | `"🎉 Legendary! You reached 2048!"`   | Win message                  |
| `gameoverMessage` | `string`           | `"💀 Game Over! No moves remaining."` | Loss message                 |

#### Code Example

```typescript
await weky.create2048({
  context: interaction,
  time: 120_000,
  embed: { title: "2048 Master", color: "#00ff88" },
});
```

---

### 5.2. Scientific Calculator

A responsive Discord calculator featuring a 25-button 5x5 matrix keypad, a `2nd` scientific mode toggle, formula modals, and safe AST-free math parsing.

#### Features

- **Arithmetic:** `+`, `-`, `×`, `÷`, `%`, `^`, `SQRT`
- **Scientific Mode (`2nd`):** `sin`, `cos`, `tan`, `log`, `ln`, `x!`, `1/x`, `rnd`, `π`, `e`
- **Strict Discord 40-Component Limit:** Keypad contains exactly 32 components (31 buttons + 1 display inside 1 container), avoiding Discord error 50035.

#### Options (`CalcTypes`)

| Option        | Type               | Default                   | Description                |
| :------------ | :----------------- | :------------------------ | :------------------------- |
| `context`     | `GameContextInput` | **Required**              | The Interaction or Message |
| `embed.title` | `string`           | `"Scientific Calculator"` | Container title            |
| `embed.color` | `ColorResolvable`  | `"Blurple"`               | Accent color               |
| `time`        | `number`           | `300000`                  | Inactivity timeout         |

#### Code Example

```typescript
await weky.createCalculator({
  context: interaction,
  embed: { title: "Scientific Calculator Pro", color: "Blurple" },
});
```

---

### 5.3. Chaos Words

Search for hidden words inside a scrambled sentence. When players discover and type a word into chat, the word is dynamically crossed out and removed from the target list!

#### Options (`ChaosWordsTypes`)

| Option        | Type               | Default              | Description                      |
| :------------ | :----------------- | :------------------- | :------------------------------- |
| `context`     | `GameContextInput` | **Required**         | The Interaction or Message       |
| `words`       | `string[]`         | _Random 4-word pool_ | Target words to find             |
| `maxWords`    | `number`           | `4`                  | Number of words to uncover       |
| `charCount`   | `number`           | `18`                 | Total length of scrambled string |
| `time`        | `number`           | `60000`              | Time limit in milliseconds       |
| `embed.title` | `string`           | `"Chaos Words"`      | Container title                  |

#### Code Example

```typescript
await weky.createChaosWords({
  context: interaction,
  maxWords: 4,
  time: 60_000,
});
```

---

### 5.4. Fast Type

Accurately measures typing speed in Words Per Minute (WPM) and accuracy percentage. Includes **Discord Gateway typing detector** anti-cheat to detect and disqualify copy-pasters.

#### Options (`FastTypeTypes`)

| Option          | Type                           | Default           | Description                     |
| :-------------- | :----------------------------- | :---------------- | :------------------------------ |
| `context`       | `GameContextInput`             | **Required**      | The Interaction or Message      |
| `difficulty`    | `'easy' \| 'medium' \| 'hard'` | `'medium'`        | Text complexity                 |
| `sentence`      | `string`                       | _Random sentence_ | Custom sentence override        |
| `checkCheating` | `boolean`                      | `true`            | Enforces typing indicator check |
| `time`          | `number`                       | `60000`           | Typing window in ms             |

#### Code Example

```typescript
await weky.createFastType({
  context: interaction,
  difficulty: "hard",
  checkCheating: true,
});
```

---

### 5.5. Fight RPG Duel

A 2-player turn-based arena battle with vector canvas cards, dynamic multi-stop HP gradients, coin economy, and power-up buffs.

#### Combat Actions

- **Attack (⚔️):** Normal strike (10–22 dmg, awards coins).
- **Heavy Attack (💥):** High-risk, high-reward strike (18–35 dmg, 25% miss chance).
- **Heal (💚):** Restores 15–25 HP (requires coins or free turn).
- **Shield (🛡️):** Halves all incoming damage on next enemy turn (25 coins).
- **2x Damage (⚡):** Doubles attack damage on next strike (30 coins).
- **Surrender (🏳️):** Concedes victory to the opponent.

#### Options (`FightTypes`)

| Option        | Type                  | Default          | Description                  |
| :------------ | :-------------------- | :--------------- | :--------------------------- |
| `context`     | `GameContextInput`    | **Required**     | The Interaction or Message   |
| `opponent`    | `User \| GuildMember` | **Required**     | Opponent fighter             |
| `startHealth` | `number`              | `100`            | Starting HP for both players |
| `damageMax`   | `number`              | `24`             | Maximum damage ceiling       |
| `coins`       | `number`              | `20`             | Starting coin pouch          |
| `embed.title` | `string`              | `"Battle Arena"` | Card header title            |

#### Code Example

```typescript
const opponent = interaction.options.getUser("opponent");

await weky.createFight({
  context: interaction,
  opponent: opponent,
  startHealth: 100,
  coins: 25,
});
```

---

### 5.6. Guess The Number

Guess a randomly chosen secret number within a specified numeric range. Bot provides higher/lower feedback after each attempt.

#### Options (`GuessTheNumberTypes`)

| Option       | Type               | Default      | Description                          |
| :----------- | :----------------- | :----------- | :----------------------------------- |
| `context`    | `GameContextInput` | **Required** | The Interaction or Message           |
| `min`        | `number`           | `1`          | Lowest possible number               |
| `max`        | `number`           | `100`        | Highest possible number              |
| `publicMode` | `boolean`          | `false`      | If true, anyone in channel can guess |
| `time`       | `number`           | `60000`      | Inactivity timeout                   |

#### Code Example

```typescript
await weky.createGuessTheNumber({
  context: interaction,
  min: 1,
  max: 500,
  publicMode: false,
});
```

---

### 5.7. Guess The Pokémon

Classic "Who's that Pokémon?" game. Renders a black silhouette against an authentic Pokédex backdrop, then reveals the full-color Pokémon upon victory or timeout!

#### Options (`GuessThePokemonTypes`)

| Option        | Type               | Default                  | Description                |
| :------------ | :----------------- | :----------------------- | :------------------------- |
| `context`     | `GameContextInput` | **Required**             | The Interaction or Message |
| `time`        | `number`           | `60000`                  | Time limit in ms           |
| `pokemon`     | `PokemonEntry`     | _Random Gen 1-9 Pokémon_ | Custom Pokémon override    |
| `embed.title` | `string`           | `"Who's That Pokémon?"`  | Card title                 |

#### Code Example

```typescript
await weky.createGuessThePokemon({
  context: interaction,
  time: 45_000,
});
```

---

### 5.8. Hangman

Features photorealistic wooden gallows, limb drawings, and masked word blanks. Includes categories for Animals, Technology, Countries, Food, and Gaming, or custom word lists.

#### Options (`HangmanTypes`)

| Option        | Type               | Default       | Description                |
| :------------ | :----------------- | :------------ | :------------------------- |
| `context`     | `GameContextInput` | **Required**  | The Interaction or Message |
| `category`    | `string`           | `"Random"`    | Word category              |
| `word`        | `string`           | _Random Word_ | Custom secret word         |
| `maxMistakes` | `number`           | `6`           | Max allowed wrong letters  |
| `time`        | `number`           | `120000`      | Inactivity timeout         |

#### Code Example

```typescript
await weky.createHangman({
  context: interaction,
  category: "Technology",
  maxMistakes: 6,
});
```

---

### 5.9. Lie Swatter

Fast-paced true or false trivia. Players must determine whether an astonishing statement is fact or fiction.

#### Options (`LieSwatterTypes`)

| Option        | Type               | Default              | Description                |
| :------------ | :----------------- | :------------------- | :------------------------- |
| `context`     | `GameContextInput` | **Required**         | The Interaction or Message |
| `statement`   | `string`           | _Curated statement_  | Custom fact/lie statement  |
| `isTrue`      | `boolean`          | _Statement validity_ | Whether statement is true  |
| `explanation` | `string`           | _Fact explanation_   | Shown upon answer          |
| `time`        | `number`           | `30000`              | Answering window in ms     |

#### Code Example

```typescript
await weky.createLieSwatter({
  context: interaction,
  time: 30_000,
});
```

---

### 5.10. Never Have I Ever

Social party game! Displays embarrassing or surprising confessions with live group percentage votes.

#### Options (`NeverHaveIEverTypes`)

| Option      | Type               | Default              | Description                |
| :---------- | :----------------- | :------------------- | :------------------------- |
| `context`   | `GameContextInput` | **Required**         | The Interaction or Message |
| `statement` | `string`           | _Curated confession_ | Custom statement           |
| `time`      | `number`           | `60000`              | Voting duration            |

#### Code Example

```typescript
await weky.createNeverHaveIEver({
  context: interaction,
  time: 60_000,
});
```

---

### 5.11. Quick Click

High-intensity reaction speed challenge. Measures exact reaction latency down to the millisecond, with **client-to-bot WebSocket latency compensation** for fairness.

#### Options (`QuickClickTypes`)

| Option        | Type               | Default      | Description                          |
| :------------ | :----------------- | :----------- | :----------------------------------- |
| `context`     | `GameContextInput` | **Required** | The Interaction or Message           |
| `buttonCount` | `number`           | `20`         | Number of decoy buttons              |
| `minDelay`    | `number`           | `2000`       | Min random wait before active button |
| `maxDelay`    | `number`           | `6000`       | Max random wait before active button |
| `time`        | `number`           | `10000`      | Reaction window                      |

#### Code Example

```typescript
await weky.createQuickClick({
  context: interaction,
  buttonCount: 20, // Max grid buttons
});
```

---

### 5.12. Rock Paper Scissors

Play classic Rock-Paper-Scissors either against the AI bot or against another server member.

#### Options (`RPSTypes`)

| Option     | Type                  | Default               | Description                |
| :--------- | :-------------------- | :-------------------- | :------------------------- |
| `context`  | `GameContextInput`    | **Required**          | The Interaction or Message |
| `opponent` | `User \| GuildMember` | _None (Plays vs Bot)_ | Opponent user for PvP      |
| `time`     | `number`              | `45000`               | Inactivity timeout         |

#### Code Example

```typescript
await weky.createRPS({
  context: interaction,
  opponent: interaction.options.getUser("opponent"), // Omit for AI mode
});
```

---

### 5.13. Shuffle Guess

Unscramble a mixed-up word. Includes a "Reshuffle" button to help players spot the anagram pattern.

#### Options (`ShuffleGuessTypes`)

| Option    | Type               | Default       | Description                |
| :-------- | :----------------- | :------------ | :------------------------- |
| `context` | `GameContextInput` | **Required**  | The Interaction or Message |
| `word`    | `string`           | _Random word_ | Secret target word         |
| `time`    | `number`           | `60000`       | Guessing window in ms      |

#### Code Example

```typescript
await weky.createShuffleGuess({
  context: interaction,
  time: 60_000,
});
```

---

### 5.14. Retro Snake

Classic arcade Snake on a customizable grid. Features D-pad controls, glowing fruit generation, score counter, and collision physics rendered on canvas.

#### Options (`SnakeTypes`)

| Option        | Type               | Default         | Description                |
| :------------ | :----------------- | :-------------- | :------------------------- |
| `context`     | `GameContextInput` | **Required**    | The Interaction or Message |
| `gridSize`    | `number`           | `15`            | Grid dimension (10–20)     |
| `time`        | `number`           | `120000`        | Inactivity timeout         |
| `embed.title` | `string`           | `"Retro Snake"` | Card header title          |

#### Code Example

```typescript
await weky.createSnake({
  context: interaction,
  gridSize: 15,
});
```

---

### 5.15. Tic-Tac-Toe

Turn-based 3x3 strategy grid match against another player with live turn tracking and winning line detection.

#### Options (`TicTacToeTypes`)

| Option     | Type                  | Default      | Description                |
| :--------- | :-------------------- | :----------- | :------------------------- |
| `context`  | `GameContextInput`    | **Required** | The Interaction or Message |
| `opponent` | `User \| GuildMember` | **Required** | Opponent player            |
| `time`     | `number`              | `60000`      | Turn timeout               |

#### Code Example

```typescript
await weky.createTicTacToe({
  context: interaction,
  opponent: interaction.options.getUser("opponent"),
});
```

---

### 5.16. Will You Press The Button?

Moral dilemma generator. Presents an incredible perk coupled with a catastrophic side effect, displaying live community choice percentages.

#### Options (`WYPTBTypes`)

| Option        | Type               | Default               | Description                |
| :------------ | :----------------- | :-------------------- | :------------------------- |
| `context`     | `GameContextInput` | **Required**          | The Interaction or Message |
| `perk`        | `string`           | _Curated perk_        | Custom upside              |
| `consequence` | `string`           | _Curated consequence_ | Custom downside            |
| `time`        | `number`           | `45000`               | Voting duration            |

#### Code Example

```typescript
await weky.createWillYouPressTheButton({
  context: interaction,
  time: 45_000,
});
```

---

### 5.17. Would You Rather?

Philosophical choice dilemma pitting Option A against Option B with community voting percentages.

#### Options (`WYRTypes`)

| Option    | Type               | Default            | Description                |
| :-------- | :----------------- | :----------------- | :------------------------- |
| `context` | `GameContextInput` | **Required**       | The Interaction or Message |
| `optionA` | `string`           | _Curated Choice A_ | Custom Choice A            |
| `optionB` | `string`           | _Curated Choice B_ | Custom Choice B            |
| `time`    | `number`           | `45000`            | Voting duration            |

#### Code Example

```typescript
await weky.createWouldYouRather({
  context: interaction,
  time: 45_000,
});
```

---

## 6. Next-Gen Arcade Suite (v14.28.0 Features)

### 6.1. The Arcade Hub Launcher

`ArcadeHub` provides a unified Discord interactive cabinet interface grouping all 17 minigames into 4 clean categories:
- **Classic Arcade**: 2048, Snake
- **PvP Duels**: Fight RPG, Tic Tac Toe, Rock Paper Scissors
- **Brain & Puzzles**: Hangman, Who's That Pokémon?, Scientific Calculator, Fast Type, Chaos Words, Shuffle Guess, Lie Swatter
- **Party & Social**: Guess The Number, Never Have I Ever, Will You Press The Button?, Would You Rather?, Quick Click

#### Options (`ArcadeHubOptions`)

| Option                  | Type                                                            | Default                         | Description                         |
| :---------------------- | :-------------------------------------------------------------- | :------------------------------ | :---------------------------------- |
| `context`               | `GameContextInput`                                              | **Required**                    | The Interaction or Message          |
| `title`                 | `string`                                                        | `"🕹️ Weky Mini-Arcade Cabinet"` | Custom header title                 |
| `bannerUrl`             | `string`                                                        | `undefined`                     | Optional banner image URL           |
| `exclude`               | `string[]`                                                      | `[]`                            | Minigame keys to exclude            |
| `gameOptions`           | `Record<string, any>`                                           | `{}`                            | Game-specific options & text dicts  |
| `configureBeforeLaunch` | `boolean`                                                       | `false`                         | Interactive setup screen (buttons)  |
| `onSelect`              | `(gameKey: string, context: ContextAdapter) => Promise<void>`   | `undefined`                     | Custom callback when a game is chosen|
| `texts`                 | `ArcadeHubCustomTexts`                                          | `{}`                            | Custom button & notice labels       |
| `time`                  | `number`                                                        | `120000`                        | Inactivity timeout (ms)             |

#### Code Example: Interactive Setup & Deep Game Text Customization

```typescript
await weky.createArcadeHub({
  context: interaction,
  title: "Official Discord Championship Arcade",
  // 1. Enable interactive match setup with buttons before launch:
  configureBeforeLaunch: true,
  // 2. Customize texts and settings for games launched from the arcade:
  gameOptions: {
    tictactoe: {
      difficulty: "unbeatable", // Default AI difficulty
      embed: { title: "Arcade Coliseum TicTacToe" },
      texts: {
        playerTurn: "It's your turn, champion!",
        botTurn: "The Minimax AI is plotting...",
      },
    },
    fight: {
      startHealth: 250,
      damageMax: 40,
      boss: "dragon",
      embed: { title: "Dragon Slayer Boss Gauntlet" },
    },
    snake: {
      gridSize: 18, // Large canvas grid
    },
    fasttype: {
      difficulty: "hard",
    },
  },
  // 3. Customize cabinet labels:
  texts: {
    selectPlaceholder: "🎯 Choose Your Battle Discipline...",
    randomButton: "🎲 Spin the Wheel (Random Game)",
    setupTitle: "🕹️ Match Configuration: {game}",
    startButton: "⚔️ Enter the Arena",
    backButton: "◀️ Return to Cabinet",
  },
});
```

---

### 6.2. Automated Tournaments & Canvas Brackets

`TournamentManager` runs single-elimination championships (4 to 16 players) with eSports-style `@napi-rs/canvas` bracket charts rendered in real time.

#### How It Works:
1. **Simultaneous Ephemeral Preliminary Rounds**:
   - All matches in the active round take place **at the same time** rather than waiting match-by-match.
   - When a player clicks **"⚔️ Play My Match"**, a private ephemeral game session opens waiting for the opponent.
   - As soon as the opponent also clicks **"⚔️ Play My Match"**, both players' ephemerals synchronously initialize with live interactive Components V2 buttons.
   - As moves are played, both players' private ephemerals update in real time with synchronized board state.
2. **Anti-AFK & Timeout Protection**:
   - **Ready-Up Timeout (60s)**: If an opponent does not join within 60 seconds, the active player wins by Walkover / Forfeit.
   - **Turn Inactivity Timeout (45s)**: If a player does not make a move on their turn within 45 seconds, the match is forfeited to the active player.
3. **Detailed Victory & Defeat Reason Tracking**:
   - Each match records the exact outcome details (e.g. *3-in-a-row across Top Row*, *ROCK defeated SCISSORS*, *Knockout with Heavy Strike (54 HP remaining)*, or *Walkover / 45s AFK*).
   - Displayed inside both players' match result screens, on the active match status board, and embedded directly onto the canvas bracket!

4. **Manual & Non-Game-Specific Tournaments**:
   - Run tournaments for **any game or competition** (e.g. *Valorant*, *Chess*, *Smash Bros*, *FIFA*, *Rocket League*, or custom IRL events).
   - Set `manual: true` or `game: "custom"` (or any custom game title). The organizer can use the interactive **"👑 Advance Match"** button directly on the tournament board to report match results and advance players.
   - Programmatic control via `tournament.progressMatch(matchId, winnerId, outcomeDetail)`.

5. **Live Public Grand Finals**:
   - The final round is **not ephemeral**! The Grand Finals is hosted directly on the public tournament message in the channel with live interactive buttons, allowing the entire server to watch the championship match in real time.
   - The winner is crowned **Tournament Champion** with custom gold-accented canvas bracket celebration!

#### Options (`TournamentOptions`)

| Option     | Type                            | Default                          | Description                         |
| :--------- | :------------------------------ | :------------------------------- | :---------------------------------- |
| `context`  | `GameContextInput`              | **Required**                     | The Interaction or Message          |
| `game`     | `"rps" \| "tictactoe" \| "fight" \| "custom" \| string` | `"tictactoe"`    | Game discipline or custom title     |
| `players`  | `(User \| GuildMember)[]`       | **Required** (4–16 players)      | Participant array                   |
| `title`    | `string`                        | `"Championship Tournament"`      | Tournament title                    |
| `manual`   | `boolean`                       | `false`                          | Enable manual winner progression    |

#### Code Example: Interactive Game Tournament

```typescript
await weky.createTournament({
  context: interaction,
  game: "fight",
  players: [user1, user2, user3, user4, user5, user6, user7, user8],
  title: "Grand Battle Arena Tournament 🏆",
});
```

#### Code Example: Non-Game-Specific Manual Tournament

```typescript
// Run a custom tournament for any game with organizer manual match reporting
await weky.createTournament({
  context: interaction,
  game: "Super Smash Bros",
  manual: true,
  players: [p1, p2, p3, p4],
  title: "Smash Arena Invitational 🏆",
});
```

#### Standalone Manual Bracket Progress Generator (`weky.generateTournamentProgress`)

Generate high-definition tournament progress bracket images on demand for ANY game or event without starting an active bot session:

```typescript
const buffer = await weky.generateTournamentProgress({
  title: "Valorant Masters",
  gameName: "Valorant",
  rounds: 2,
  matches: [
    { round: 1, matchIndex: 0, p1Username: "Sentinels", p2Username: "Fnatic", winnerUsername: "Sentinels", scoreText: "13-9", outcomeDetail: "Ascent 13-9" },
    { round: 1, matchIndex: 1, p1Username: "PaperRex", p2Username: "LOUD", winnerUsername: "PaperRex", scoreText: "13-11", outcomeDetail: "Haven 13-11" },
    { round: 2, matchIndex: 0, p1Username: "Sentinels", p2Username: "PaperRex", winnerUsername: "Sentinels", scoreText: "3-1", outcomeDetail: "Grand Finals 3-1" },
  ],
  championUsername: "Sentinels",
});
```

---

### 6.3. Intelligent AI Opponents & RPG Bosses

`@m3rcena/weky` v14.28.0 eliminates the need for a second human player across competitive duels:

- **Tic Tac Toe Minimax AI**:
  - `difficulty: "unbeatable"`: Uses full depth-penalized Minimax algorithm. Impossible to defeat.
  - `difficulty: "hard"`: Tactical Minimax evaluation.
  - `difficulty: "medium"`: Smart heuristic blocking and winning move detection.
  - `difficulty: "easy"`: Casual random move placement.

```typescript
await weky.createTicTacToe({
  context: interaction,
  ai: true,
  difficulty: "unbeatable",
});
```

- **Fight RPG Bosses**:
  - Challenge 3 custom scripted tactical bosses:
    - `"dragon"` (`Dragon Sovereign`): Ancient Pyromancer with high health (160 HP) and devastating Inferno Breath.
    - `"cyber_knight"` (`Cyber Knight`): Protocol MK-VII with EMP Overcharge that pierces and disables shields.
    - `"shadow_goblin"` (`Shadow Goblin`): Greed Master who pickpockets coins during combat and lands rapid critical strikes.

```typescript
await weky.createFight({
  context: interaction,
  ai: true,
  boss: "dragon",
});
```

- **Rock Paper Scissors Psychological AI**:
  - Predicts human choices via psychological win-stay / lose-shift heuristics:

```typescript
await weky.createRPS({
  context: interaction,
  difficulty: "hard", // "easy" | "medium" | "hard"
});
```

---

### 6.4. Dashboard Audio & MP3 Soundboard Engine (`SoundboardManager`)

`SoundboardManager` provides MP3 audio feedback for **Web Dashboards**, **Headless Game Engines**, and **Cross-Platform Bridge** gameplay. Because Discord players primarily play minigames directly in text channels without voice channels, soundboard audio is purpose-built for web dashboards using zero-latency MP3 audio tracks.

When games are played or synchronized via `WekyBridge`, the engine automatically selects and attaches appropriate MP3 audio cues (`victory`, `defeat`, `hit`, `heal`, `eat`, `action`, `tie`) and emits `dashboardSound` events in real-time.

```typescript
import { WekyManager, DEFAULT_DASHBOARD_SOUNDS } from "@m3rcena/weky";

// 1. Initialize with optional presence filtering or custom MP3 URLs:
const weky = new WekyManager(client, {
  soundboard: {
    enabled: true,
    volume: 0.8,
    // Only emit audio cues if the user is verified as online/active on the dashboard:
    requireActiveDashboardUser: true,
    sounds: {
      victory: "https://your-dashboard.com/sounds/victory.mp3", // Custom override
      hit: "/assets/sounds/hit.mp3",
    },
  },
});

// 2. Track dashboard presence (e.g., when a user connects/disconnects via WebSocket):
weky.soundboard.setDashboardUserOnline(user.id, true);  // User opened web tab
weky.soundboard.setDashboardUserOnline(user.id, false); // User closed web tab

// 3. User-Scoped Audio Delivery (Listen to real-time audio cues):
// Events carry userId, username, and targetUserIds so the dashboard knows EXACTLY who should hear the sound!
weky.on("dashboardSound", ({ soundKey, soundUrl, volume, game, userId, targetUserIds }) => {
  // Scoped routing: Only transmit the audio cue to the specific user's browser socket!
  for (const targetId of targetUserIds || [userId]) {
    userSocketMap.get(targetId)?.emit("play_sound", { soundKey, soundUrl, volume });
  }
});

// 4. Web Dashboard Client Integration:
// Get the audio manifest for preloading:
const manifest = weky.soundboard.getAudioManifest();

// Or generate the ready-to-inject client script for your web page:
const scriptHtml = weky.soundboard.generateDashboardAudioScript({ defaultVolume: 0.8 });
// In the browser, any move can play audio instantly:
// window.WekyAudio.play("victory");
```

---

### 6.5. Plug-and-Play ELO & Canvas Leaderboards

`LeaderboardManager` calculates international FIDE ELO ratings and records high scores with optional custom database persistence, **custom developer pointing formulas**, and **custom card labels**:

```typescript
// 1. Initialize with optional custom pointing system:
const weky = new WekyManager(client, {
  leaderboard: {
    defaultElo: 1200,
    // Optional Developer Custom Pointing:
    pointing: {
      winPoints: 50,    // Flat win points (if not using dynamic formula)
      lossPoints: 20,   // Flat loss deduction
      drawPoints: 10,   // Flat draw points
      streakBonus: 5,   // +5 extra points per active streak
      // OR define a custom formula function:
      calculateMatchPoints: (ctx) => ({
        p1Change: ctx.result === "p1" ? 100 : -40,
        p2Change: ctx.result === "p1" ? -40 : 100,
      }),
      calculateSoloPoints: (ctx) => ctx.score * 1.5, // Custom solo score formula
    },
  },
});

// Record a 1v1 match outcome:
const { p1NewElo, p2NewElo, p1Change, p2Change } = await weky.leaderboard.recordMatch(
  winnerId,
  loserId,
  "p1",
  { p1Username: "Alice", p2Username: "Bob", kFactor: 32 }
);

// Record solo arcade score:
await weky.leaderboard.recordScore(userId, "snake", 1850);

// Generate a High-Score Poster Canvas Image with customizable texts:
const buffer = await weky.renderLeaderboard({
  title: "ARCADE CHAMPIONSHIP",
  subtitle: "SEASON 1 • TOP PLAYERS",
  entries: [
    { rank: 1, username: "Alice", scoreOrElo: "1,520 ELO", streak: 7 },
    { rank: 2, username: "Bob", scoreOrElo: "1,440 ELO", stats: "22W - 5L" },
  ],
  texts: {
    categoryBadge: "HALL OF FAME",
    topContendersBadge: "{{count}} TOP CONTENDERS",
    rankColumn: "RANK",
    playerColumn: "PLAYER",
    recordColumn: "RECORD / STREAK",
    scoreColumn: "SCORE / ELO",
    streakSuffix: "STREAK",
    footer: "Powered by @m3rcena/weky • Modern Discord Minigames Engine",
  },
});
```

---

### 6.6. 'Share & Flex' Gamer Score Cards

`RenderShareCard` creates collectible holographic-styled victory passes:

```typescript
const shareCardBuffer = await weky.renderShareCard({
  username: "ShadowBlade",
  avatarUrl: user.displayAvatarURL({ extension: "png" }),
  gameName: "Fight RPG Duel",
  headline: "CHAMPIONSHIP VICTORY 👑",
  primaryScore: "VICTORY (+32 ELO)",
  rankBadge: "DIAMOND TIER",
  stats: [
    { label: "ROUND TURNS", value: "8 Turns", color: "#5865f2" },
    { label: "CRITICAL HITS", value: "3", color: "#57f287" },
    { label: "COINS WON", value: "+45 🪙", color: "#ffd700" },
    { label: "HEALTH REMAINING", value: "72%", color: "#00f7ff" },
  ],
});
```

---

### 6.7. Cross-Platform Bridge & Headless Dashboard Gateway (`WekyBridge`)

`WekyBridge` acts as a bidirectional synchronization layer between active Discord bot game sessions and external web dashboards or REST/WebSocket backends:

- **Unified Session Registry**: Query active game sessions across both Discord and web.
- **Cross-Platform Move Dispatch**: Web players can play moves (`bridge.dispatchMove(...)`) that update Discord games and trigger targeted audio events.
- **Presence Tracking**: Notify Weky when players open the web dashboard (`bridge.setDashboardUserOnline(userId, true/false)`).
- **State Export & Import**: Sync full live match states and leaderboards with external databases (MongoDB, PostgreSQL, Redis).

```typescript
// 1. Get the unified dashboard overview:
const overview = await weky.bridge.getDashboardOverview();
console.log(`Active games: ${overview.activeGamesCount}`);

// 2. Dispatch a cross-platform move from a web client:
const result = await weky.bridge.dispatchMove(sessionId, {
  playerId: user.id,
  action: "hit",
  sourcePlatform: "dashboard",
});

// 3. Mark user online when they connect via WebSocket:
weky.bridge.setDashboardUserOnline(user.id, true);
```

---

## 7. Headless Game Engines (`WekyEngine`) for Web Dashboards

`WekyEngine` lets you run minigames entirely outside Discord—inside Next.js web apps, Express REST APIs, React web frontends, or Electron dashboards.

### Available Engines

- `WekyEngine.game2048(options?)`
- `WekyEngine.snake(options?)`
- `WekyEngine.fight(options)`
- `WekyEngine.calculator()`
- `WekyEngine.hangman(options?)`
- `WekyEngine.ticTacToe(options?)`

### Universal Control Schema (`GameControlRow[]`)

Every engine provides a `getControls()` method returning a framework-agnostic button layout:

```typescript
export interface GameControlItem {
  id: string;
  label: string;
  emoji?: string;
  style: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
}

export interface GameControlRow {
  components: GameControlItem[];
}
```

### Full Express & React Dashboard Example

#### Backend (`server.js`)

```javascript
const express = require("express");
const { WekyEngine } = require("@m3rcena/weky");

const app = express();
app.use(express.json());

const session = WekyEngine.game2048();

app.post("/api/game/move", async (req, res) => {
  const { direction } = req.body; // "UP" | "DOWN" | "LEFT" | "RIGHT"
  session.move(direction);

  res.json({
    state: session.getState(),
    controls: session.getControls(),
    image: await session.renderDataURL("DashboardUser"),
  });
});

app.listen(3000, () => console.log("Dashboard API running on port 3000"));
```

#### Frontend (`GameCard.jsx`)

```jsx
export default function GameCard({ imageUrl, controls, onMove }) {
  return (
    <div className="game-card">
      <img src={imageUrl} alt="Game Board" />
      <div className="keypad">
        {controls.map((row, rIdx) => (
          <div key={rIdx} className="row">
            {row.components.map((btn) => (
              <button key={btn.id} className={`btn btn-${btn.style}`} disabled={btn.disabled} onClick={() => onMove(btn.id)}>
                {btn.emoji} {btn.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Standalone Canvas Hub (`WekyCanvas`)

`WekyCanvas` allows generating game graphic cards on demand without needing an active game session:

```javascript
import { WekyCanvas } from "@m3rcena/weky";

// 1. Render Fight Card
const fightBuffer = await WekyCanvas.fight.battle({ id: "1", username: "Knight", avatarUrl: "https://...", health: 85, coins: 30 }, { id: "2", username: "Dragon", avatarUrl: "https://...", health: 40, coins: 15 }, "1", "Knight swung for 25 damage!");

// 2. Convert to web-ready Data URL or Base64 string
const dataUrl = WekyCanvas.toDataURL(fightBuffer); // data:image/png;base64,...
const base64 = WekyCanvas.toBase64(fightBuffer);
```

---

## 9. Cross-Platform Bridge & Web Dashboard Gateway (`WekyBridge`)

The `WekyBridge` directly links your Discord bot with your Web Dashboard or backend REST/WebSocket server, enabling **cross-platform play** (e.g. Player 1 on Discord vs Player 2 on a web browser) and live synchronization of games and leaderboards:

```typescript
// 1. Access the bridge directly from your WekyManager instance:
const bridge = weky.bridge;

// 2. Query real-time dashboard overview metrics for web UI:
const overview = await weky.getDashboardOverview();
console.log(overview);
// {
//   activeGamesCount: 4,
//   totalLeaderboardPlayers: 180,
//   activeSessions: [ ... ],
//   topContenders: [ ... ]
// }

// 3. Dispatch a move made on the Web Dashboard to an active Discord game:
const moveResult = await weky.dispatchCrossPlatformMove("session_123", {
  playerId: "web_user_456",
  action: "attack",
  sourcePlatform: "dashboard",
});

// 4. Export or import full leaderboard JSON for database backups or external sync:
const rawLeaderboard = await weky.leaderboard.exportData();
await weky.leaderboard.importData(rawLeaderboard);
```

---

## 10. Safe Mathematical Evaluator (`MathEvaluator`)

Built-in safe mathematical parser powering the calculator and math minigames.

- **Zero `eval()` or `Function()` calls**: Immune to arbitrary code execution or sandbox escapes.
- **Supported operators:** `+`, `-`, `*`, `/`, `^`, `%`, `!`
- **Supported functions:** `sqrt`, `sin`, `cos`, `tan`, `log`, `ln`, `abs`, `round`

```typescript
import { MathEvaluator } from "@m3rcena/weky";

const result = MathEvaluator.evaluate("sqrt(16) + 5 * 2");
console.log(result); // { result: 14, formatted: "14", error: null }
```

---

## 11. Built-in Datasets & Word Banks

Access rich curated collections directly in your bot:

```typescript
import { getRandomWord, getRandomSentence, getRandomTriviaFact, getRandomWYR, getRandomWYPTB, getRandomNHIE, POPULAR_POKEMONS } from "@m3rcena/weky";

console.log(getRandomWord()); // "avalanche"
console.log(getRandomSentence("hard")); // "Tardigrades can survive..."
console.log(getRandomTriviaFact()); // { statement: "...", isTrue: true }
console.log(getRandomWYR()); // { optionA: "...", optionB: "..." }
```

---

## 12. Pure JavaScript Type Safety & Autocomplete

Using pure JavaScript instead of TypeScript? You don't have to sacrifice IntelliSense!

- **No annotations in your code:** Write normal `.js` files.
- **Full IDE Autocomplete:** VS Code, Cursor, and WebStorm automatically load bundled `.d.ts` maps from `package.json`.
- **Typo Protection:** Misspelled option keys or invalid parameters are highlighted automatically.

---

## 13. Troubleshooting & Best Practices

| Issue                                     | Cause                                              | Solution                                                                                                                                               |
| :---------------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPONENT_MAX_TOTAL_COMPONENTS_EXCEEDED` | Discord limits messages to 40 components           | Keep total buttons + rows $\le 40$. In `@m3rcena/weky` v14.28.0, all layouts are strictly engineered under this threshold.                             |
| Missing Gateway Intent error              | Bot lacks `MessageContent` or `GuildMessageTyping` | Enable `MessageContent` and `GuildMessageTyping` in the Discord Developer Portal under Bot > Privileged Gateway Intents.                               |
| Canvas emojis rendering as boxes (`▯`)    | Server OS lacks color emoji fonts                  | `@m3rcena/weky` renders pure vector canvas graphics (`drawCoinIcon`) and typography badges to ensure universal rendering on Linux and Windows servers. |

---

<p align="center">
  <b>@m3rcena/weky v14.28.0</b> • Designed and engineered with ❤️ by <b>M3rcena</b>
</p>
