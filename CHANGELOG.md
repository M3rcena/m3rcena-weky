# Changelog

All notable changes to the [`@m3rcena/weky`](https://github.com/M3rcena/m3rcena-weky) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [14.28.0] - 2026-11-01

### 🚀 Major Release: Discord.js 14.28.0 Parity & Next-Gen Arcade Suite

#### Added

- **Discord.js v14.28.0 Parity & TypeScript 7**: Full compatibility upgrade with Discord.js `14.28.0` and TypeScript `7.0.2`. Migrated build pipeline from `tsup` to modern `tsdown` powered by Rolldown.
- **Feature 1: The Arcade Hub (`ArcadeHub` & `weky.createArcadeHub`)**:
  - Centralized, interactive minigames launcher cabinet grouping all 17 minigames into 4 organized categories (*Classic Arcade*, *PvP Duels*, *Brain & Puzzles*, *Party & Social*).
  - Uses Discord Components V2 Containers with interactive `StringSelectMenuBuilder`, quick random game launcher button, and game filtering (`options.exclude`).
  - Added `gameOptions` dictionary: Deeply customize cards, embed titles, text prompts, and settings for each individual game when launched through the Arcade Hub.
  - Added Interactive Setup Screen (`configureBeforeLaunch: true`): Players can configure AI difficulty, select RPG bosses, categories, grid sizes, or toggle between Solo vs Boss and PvP Duels with friend selection via `UserSelectMenuBuilder` before launching.
  - Added `weky.launchGameByKey(gameKey, context)` universal dispatch router.
- **Feature 2: Automated Tournament & Canvas Bracket Engine (`TournamentManager` & `RenderBracket`)**:
  - Single-elimination automated championship system supporting 4 to 16 players with real-time `@napi-rs/canvas` bracket generation.
  - Simultaneous preliminary rounds using ephemeral interactive sessions with synchronized state and anti-AFK timeout protection (auto-reset on interaction).
  - Standalone bracket image generation via `weky.generateTournamentProgress(...)` and manual tournament match advancement via `progressMatch(...)`.
  - Live public Grand Finals hosted directly in the channel with championship coronation.
- **Feature 3: Intelligent AI Opponents & RPG Boss Duels**:
  - Full support for both **Player-vs-Player (PvP)** duels and **Solo AI/Boss** fights across `/fight`, `w!fight`, `/arcade`, and `/tournament`.
  - **Tic Tac Toe**: Unbeatable Minimax AI (`"unbeatable"` / `"hard"`), heuristic blocking (`"medium"`), and casual (`"easy"`).
  - **Fight RPG**: Solo boss fights against 3 unique tactical bosses (`Dragon Sovereign`, `Cyber Knight`, `Shadow Goblin`) with special attacks, dialogue, and coin theft.
  - **Rock Paper Scissors**: Psychological Markov/heuristic AI predicting human player move habits.
- **Feature 4: Web Dashboard MP3 Soundboard Engine (`SoundboardManager`)**:
  - Transitioned soundboard to high-fidelity, zero-latency MP3 audio tracks designed for Web Dashboards and headless game engines.
  - Synthesized 11 authentic 44.1 kHz, 128 kbps MP3 files bundled in `assets/sounds/` (`victory`, `defeat`, `hit`, `heavy_hit`, `heal`, `eat`, `countdown`, `gamestart`, `tie`, `action`, `win_streak`).
  - **Player-Scoped Audio Routing**: `dashboardSound` events now carry `userId`, `username`, and `targetUserIds` so dashboards route sounds exclusively to the active player's browser session without broadcasting to all users.
  - **Active Presence Filtering (`requireActiveDashboardUser`)**: Added optional dashboard presence tracking via `setDashboardUserOnline(userId, isOnline)`. When `requireActiveDashboardUser: true` is configured, sounds will only trigger when the player is verified active on the dashboard, skipping unnecessary audio processing for pure Discord interactions.
- **Feature 5: Plug-and-Play ELO & Canvas Leaderboards (`LeaderboardManager` & `RenderLeaderboard`)**:
  - Mathematical ELO calculation using standard international FIDE formulas with customizable K-factors.
  - Custom Developer Pointing System: Configure optional static points (`winPoints`, `lossPoints`, `tiePoints`) or dynamic custom pointing formulas (`calculatePoints: (player, match) => ...`).
  - High-resolution cyberpunk/neon arcade leaderboard card renderer drawing top 10 player ranks, circular avatars, medals, and streaks.
- **Feature 6: "Share & Flex" Gamer Score Cards (`RenderShareCard`)**:
  - Collectible, holographic-style match victory and score ticket generator using `@napi-rs/canvas`.
  - Displays large player avatar, neon rank tier badge, primary score hero box, customizable 2x2 metric stat grid, and verification barcode.
- **Feature 7: Cross-Platform Bridge & Headless Dashboard Sync (`WekyBridge`)**:
  - Bidirectional bridge connecting Discord bot game sessions with web dashboards in real time.
  - Dispatch moves, synchronize board state, query game overviews, and broadcast audio events across platforms.
- **Feature 8: Strongly-Typed Event Emitters**:
  - Replaced `any` callback signatures with strict TypeScript types for all `WekyManager` lifecycle hooks (`gameStart`, `gameOver`, `gameError`, `unauthorizedClick`, `dashboardSound`).

#### Fixed

- **Bot Loss Event Outcome Bug**: Fixed an issue where losing to a Bot or Boss in `Fight`, `TicTacToe`, or `RockPaperScissors` recorded `outcome: "WIN"` on the player's event. The outcome now accurately emits `"LOSE"` or `"lost"` with correct winner/loser mapping, properly decrementing ELO and resetting win streaks.
- **Tournament Inactivity Timeout**: Interactive game moves now refresh and reset the tournament timeout timer to prevent ongoing championships from timing out mid-game.
- **Discord Application Command Option Order**: Reordered slash command options in example/test bot so required parameters precede optional ones in compliance with Discord API Form Body constraints.

---

## [14.27.0-1] - 2026-10-23

### ️ Fixes, Regressions Resolution & Enhancements

#### Fixed & Restored

- **Full Embed & Brand Color Customization**:
  - Restored full support for `embed.color` accepting Hex strings (`"#5865F2"`), raw numbers (`0x5865F2`), or Discord named colors (`"Blurple"`, `"Green"`, etc.).
  - Added color resolution hierarchy: `Explicit Override` $\rightarrow$ `options.embed.color` $\rightarrow$ `manager.embedColor` $\rightarrow$ `Theme Default`.
  - Added `applyEmbedDecorations()` to render custom `title`, `description`, `author`, `footer`, `fields`, `timestamp`, and `thumbnail` cleanly inside Discord Components V2 containers.
- **Terminal Update Notifier Box**:
  - Restored the startup update notification. If a newer package version is on npm, a styled yellow terminal box alerts the developer with registry links and the update command.
  - Added `notifyUpdates?: boolean` setting to `WekyManagerOptions` (enabled by default).
  - Added `weky.checkUpdates()` manual inspection method.
- **Wired Missing Game Parameters from Documentation**:
  - **Fight**: Wired `startHealth`, `coins`, and `damageMax`.
  - **Fast Type**: Wired `checkCheating` (anti-paste typing detector) and `buttonText`.
  - **Chaos Words**: Wired `maxWords`, `charCount`, and `buttonText`.
  - **Guess The Number**: Wired `publicMode`, `min`, `max`, and `button` labels.
  - **Guess The Pokémon**: Wired `pokemon` custom entry override.
  - **Hangman**: Wired `maxMistakes` and `quitButton`.
  - **Lie Swatter**: Wired custom `statement`, `isTrue`, and `explanation`.
  - **Never Have I Ever**: Wired custom `statement`.
  - **Quick Click**: Wired `buttonCount`, `minDelay`, and `maxDelay`.
  - **Snake**: Wired `gridSize` (10–20).
  - **Will You Press The Button**: Wired custom `perk` and `consequence`.
  - **Would You Rather**: Wired custom `optionA`, `optionB`, and button labels.
- **Restored Historical Types from Git**:
  - `Embeds`, `Author`, `Fields`, `CustomOptions<T>`
  - `PowerUp`, `PlayerData`, `Point`
  - `SnakeGameTypes`, `DilemmaData`, `GuessThePokemonData`, `BotDataTypes`
  - Type aliases `ChaosWordsTypes`, `WYPTBTypes`, `WYRTypes`
- **WekyManager Configuration & Telemetry**:
  - Added `embedColor`, `defaultTimeout`, `unauthorizedMessage`, and `notifyUpdates` to `WekyManagerOptions`.
  - Extended `WekyManager` with Node's `EventEmitter` broadcasting:
    - `gameStart`: `{ game, user, channelId }`
    - `gameOver`: `{ game, user, outcome, score, timeElapsed }`
    - `gameError`: `{ game, error, context }`
    - `unauthorizedClick`: `{ game, user, interaction }`
  - Preserved backward-compatible constructor signatures: `new WekyManager(client, options)`, `new WekyManager(client, boolean)`, and `new WekyManager(client, apiKey, boolean)`.

---

## [14.27.0] - 2026-10-17

### 🚀 Major Ground-Up Modernization (Discord.js v14 Parity)

#### Added

- **Discord Components V2 Native**: Replaced deprecated embeds and action rows with modern Discord Components V2 (`ContainerBuilder`, `MediaGalleryBuilder`, `MessageFlags.IsComponentsV2`).
- **Rust-Powered Canvas Graphics**: Integrated in-memory `@napi-rs/canvas` rendering (<10ms local generation) replacing previous external HTTP APIs and PostgreSQL requirements.
- **Universal ContextAdapter**: Automatic handling of `ChatInputCommandInteraction`, `ButtonInteraction`, and prefix `Message` contexts.
- **Headless Minigame Engines (`WekyEngine`)**: Run minigame logic outside Discord in web dashboards (Next.js, React, Express REST APIs, Electron) with framework-agnostic `GameControlRow[]` schema.
- **17 Minigames Catalog**: Complete suite of 17 minigames including 2048, Snake, Fight RPG, Hangman, Guess The Pokémon, Scientific Calculator, Fast Type, Chaos Words, Guess The Number, Lie Swatter, Never Have I Ever, Quick Click, Shuffle Guess, Will You Press The Button, Would You Rather, Rock Paper Scissors, and Tic Tac Toe.

#### Removed

- Removed external API requirements (`apiKey`), Express backend server, and database round-trips; all minigames run 100% locally.

---

## [11.1.0] - 2024-11-20

### Changed

- Updated npm-publish CI workflow for Node.js 24 and OIDC id-token permissions.
- Minor interaction handling improvements across active minigames.

---

## [11.0.0] - [11.0.2] - 2024-11-15

### Added

- Added `GuessThePokemon` silhouette minigame function.
- Enhanced type definitions for `Fight` and `ChaosWords`.
- Added peer dependency configuration for `discord.js@^14.0.0`.

---

## [10.4.0] - [10.4.2] - 2024-11-10

### Added

- Integrated `createEmbed` utility for unified embed management across games.
- Added message return types for `NeverHaveIEver` and `Fight`.

### Fixed

- Fixed module import paths for 2048 and other game components.
- Added active effects and buff displays in Fight duel canvas.

---

## [10.0.0] - [10.3.1] - 2024-11-09

### Added

- Dynamic embed timestamp formatting.
- Safe mathematical expression evaluator updates.

### Fixed

- Resolved duplicate footer check errors.
- Improved game collector cleanup on channel deletion.

---

## [9.0.0] - [9.1.0] - 2024-09-18

### Performance

- Optimized canvas rendering pipeline for faster image dispatch.

### Fixed

- Fixed Hangman `ChatInputCommandInteraction` reply defer errors.

---

## [8.4.0] - [8.9.2] - 2024-07-13

### Added

- Terminal box notification banner alerting users when a new package version is available on npm.
- Added `notifyUpdates` setting to disable or enable terminal updates.
- Added `LieSwatter` trivia minigame.

### Fixed

- Fixed Calculator uncaught stop exceptions.
- Added embed color customization to `NeverHaveIEver`.
- Addressed CommonJS and ESM dual-import compatibility across bundlers.

---

## [8.0.0] - [8.3.0] - 2024-07-10

### Added

- Initial TypeScript rewrite with full `.d.ts` declaration generation.
- Added `ChaosWords` scrambled word search challenge.
- Performance optimizations and memory leak fixes in game collectors.
