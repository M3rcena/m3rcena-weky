# Changelog

All notable changes to the [`@m3rcena/weky`](https://github.com/M3rcena/m3rcena-weky) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [14.28.0] - 2026-11-01

### 🚀 Major Release: Discord.js 14.28.0 Parity & Next-Gen Arcade Suite

#### Added

- **Discord.js v14.28.0 Parity**: Full compatibility upgrade with Discord.js `14.28.0`.
- **Feature 1: The Arcade Hub (`ArcadeHub` & `weky.createArcadeHub`)**:
  - Centralized, interactive minigames launcher cabinet grouping all 17 minigames into 4 organized categories (*Classic Arcade*, *PvP Duels*, *Brain & Puzzles*, *Party & Social*).
  - Uses Discord Components V2 Containers with interactive `StringSelectMenuBuilder`, quick random game launcher button, and game filtering (`options.exclude`).
  - Added `weky.launchGameByKey(gameKey, context)` universal dispatch router.
- **Feature 2: Automated Tournament & Canvas Bracket Engine (`TournamentManager` & `RenderBracket`)**:
  - Single-elimination automated championship system supporting 4 to 16 players.
  - Generates high-definition, eSports-style tournament bracket canvas diagrams with player avatars, round columns, match connectors, and live status badges (`✔ W`, `OUT`).
  - Step-by-step match progression with "Play Next Match" controls and champion crowning.
- **Feature 3: Intelligent AI Opponents & RPG Boss Duels**:
  - **Tic Tac Toe**: Unbeatable Minimax AI (`"unbeatable"` / `"hard"`), smart heuristic blocking (`"medium"`), and casual (`"easy"`). Play solo vs AI without requiring a second player.
  - **Fight RPG**: Solo boss fights against 3 unique tactical bosses (`Dragon Sovereign`, `Cyber Knight`, `Shadow Goblin`) with unique abilities, dialogues, and coin stealing.
  - **Rock Paper Scissors**: Heuristic psychological AI using win-stay / lose-shift prediction to outsmart human move habits.
- **Feature 4: Discord Soundboard & Audio SFX Integration (`SoundboardManager`)**:
  - Safe, non-intrusive soundboard sound dispatcher directly utilizing Discord's REST soundboard endpoints.
  - Fires custom audio SFX for victory, defeat, countdown, or actions with built-in permission fallback.
- **Feature 5: Plug-and-Play ELO & Canvas Leaderboards (`LeaderboardManager` & `RenderLeaderboard`)**:
  - Mathematical ELO calculation using standard international FIDE formulas with customizable K-factors.
  - Built-in tracking for wins, losses, draws, win streaks, personal best scores, and pluggable storage adapter support (`LeaderboardStorageAdapter`).
  - High-resolution cyberpunk/neon arcade leaderboard card renderer drawing top 10 player ranks, circular avatars, medals, and streaks.
- **Feature 6: "Share & Flex" Gamer Score Cards (`RenderShareCard`)**:
  - Collectible, holographic-style match victory and score ticket generator using `@napi-rs/canvas`.
  - Displays large player avatar, neon rank tier badge, primary score hero box, customizable 2x2 metric stat grid, and verification barcode.

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
