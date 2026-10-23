# 📖 @m3rcena/weky Comprehensive API Documentation

Welcome to the definitive documentation for **`@m3rcena/weky`** (v14.27.0).

This document covers everything you need to know: architecture, installation, event listeners, the universal context adapter, full option references for all 17 minigames, headless engines for web dashboards, and the standalone canvas hub.

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
6. [Headless Game Engines (`WekyEngine`) for Web Dashboards](#6-headless-game-engines-wekyengine-for-web-dashboards)
7. [Standalone Canvas Hub (`WekyCanvas`)](#7-standalone-canvas-hub-wekycanvas)
8. [Safe Mathematical Evaluator (`MathEvaluator`)](#8-safe-mathematical-evaluator-mathevaluator)
9. [Built-in Datasets & Word Banks](#9-built-in-datasets--word-banks)
10. [Pure JavaScript Type Safety & Autocomplete](#10-pure-javascript-type-safety--autocomplete)
11. [Troubleshooting & Best Practices](#11-troubleshooting--best-practices)

---

## 1. Architecture & Design Principles

`@m3rcena/weky` v14.27.0 is a complete re-engineering of the original `weky` library:

- **Strict Discord.js Version Alignment:** We mirror the Discord.js version numbering (e.g., `14.27.0`). This guarantees exact API parity, zero peer-dependency conflicts, and instant support for Discord's newest features.
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

### Global Event Hooks

`WekyManager` extends Node's `EventEmitter` and broadcasts four core lifecycle events:

```typescript
// 1. Fired whenever any minigame starts
weky.on("gameStart", ({ game, user, channelId }) => {
  console.log(`[WEKY] ${user.username} started ${game} in channel ${channelId}`);
});

// 2. Fired when a game concludes (Victory, Defeat, Timeout, Surrender)
weky.on("gameOver", ({ game, user, outcome, score, timeElapsed }) => {
  console.log(`[WEKY] ${user.username} finished ${game}: ${outcome} (Score: ${score}, Time: ${timeElapsed}ms)`);
  // Award XP or coins in your database here!
});

// 3. Fired if an unhandled error occurs during execution
weky.on("gameError", ({ game, error, context }) => {
  console.error(`[WEKY ERROR] ${game} threw an error:`, error);
});

// 4. Fired when an unauthorized user clicks a game button
weky.on("unauthorizedClick", ({ game, user, interaction }) => {
  console.warn(`[WEKY] ${user.username} tried clicking controls for ${game}`);
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

## 6. Headless Game Engines (`WekyEngine`) for Web Dashboards

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

## 7. Standalone Canvas Hub (`WekyCanvas`)

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

## 8. Safe Mathematical Evaluator (`MathEvaluator`)

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

## 9. Built-in Datasets & Word Banks

Access rich curated collections directly in your bot:

```typescript
import { getRandomWord, getRandomSentence, getRandomTriviaFact, getRandomWYR, getRandomWYPTB, getRandomNHIE, POPULAR_POKEMONS } from "@m3rcena/weky";

console.log(getRandomWord()); // "avalanche"
console.log(getRandomSentence("hard")); // "Tardigrades can survive..."
console.log(getRandomTriviaFact()); // { statement: "...", isTrue: true }
console.log(getRandomWYR()); // { optionA: "...", optionB: "..." }
```

---

## 10. Pure JavaScript Type Safety & Autocomplete

Using pure JavaScript instead of TypeScript? You don't have to sacrifice IntelliSense!

- **No annotations in your code:** Write normal `.js` files.
- **Full IDE Autocomplete:** VS Code, Cursor, and WebStorm automatically load bundled `.d.ts` maps from `package.json`.
- **Typo Protection:** Misspelled option keys or invalid parameters are highlighted automatically.

---

## 11. Troubleshooting & Best Practices

| Issue                                     | Cause                                              | Solution                                                                                                                                               |
| :---------------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPONENT_MAX_TOTAL_COMPONENTS_EXCEEDED` | Discord limits messages to 40 components           | Keep total buttons + rows $\le 40$. In `@m3rcena/weky` v14.27.0, all layouts are strictly engineered under this threshold.                             |
| Missing Gateway Intent error              | Bot lacks `MessageContent` or `GuildMessageTyping` | Enable `MessageContent` and `GuildMessageTyping` in the Discord Developer Portal under Bot > Privileged Gateway Intents.                               |
| Canvas emojis rendering as boxes (`▯`)    | Server OS lacks color emoji fonts                  | `@m3rcena/weky` renders pure vector canvas graphics (`drawCoinIcon`) and typography badges to ensure universal rendering on Linux and Windows servers. |

---

<p align="center">
  <b>@m3rcena/weky v14.27.0</b> • Designed and engineered with ❤️ by <b>M3rcena</b>
</p>
