/**
 * @m3rcena/weky
 * The ultimate modern Discord minigames engine.
 * Powered by @napi-rs/canvas, hybrid Slash/Message contexts, and zero external dependencies.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

export const version = "14.27.0";
export const VERSION = "14.27.0";

// Core Manager and Adapters
export { BaseGame } from "./core/BaseGame.js";
export { ContextAdapter, type ContextSendOptions } from "./core/ContextAdapter.js";
export { EventManager } from "./core/EventManager.js";
export * from "./core/Types.js";
export { WekyManager, type WekyManagerOptions } from "./core/WekyManager.js";

// Game Classes
export { Calculator } from "./games/Calculator.js";
export { ChaosWords } from "./games/ChaosWords.js";
export { FastType } from "./games/FastType.js";
export { Fight } from "./games/Fight.js";
export { Game2048 } from "./games/Game2048.js";
export { GuessTheNumber } from "./games/GuessTheNumber.js";
export { GuessThePokemon } from "./games/GuessThePokemon.js";
export { Hangman } from "./games/Hangman.js";
export { LieSwatter } from "./games/LieSwatter.js";
export { NeverHaveIEver } from "./games/NeverHaveIEver.js";
export { QuickClick } from "./games/QuickClick.js";
export { RockPaperScissors } from "./games/RockPaperScissors.js";
export { ShuffleGuess } from "./games/ShuffleGuess.js";
export { Snake } from "./games/Snake.js";
export { TicTacToe } from "./games/TicTacToe.js";
export { WillYouPressTheButton } from "./games/WillYouPressTheButton.js";
export { WouldYouRather } from "./games/WouldYouRather.js";

// Control and Dashboard Types
export * from "./core/ControlTypes.js";

// Web Dashboard & Headless Engines
export { WekyCanvas } from "./canvas/WekyCanvas.js";
export { CalculatorEngine, FightEngine, Game2048Engine, HangmanEngine, SnakeEngine, TicTacToeEngine, WekyEngine, type CalculatorState, type FightEngineOptions, type FightState, type Game2048EngineOptions, type Game2048State, type HangmanEngineOptions, type HangmanState, type SnakeEngineOptions, type SnakeState, type TicTacToeEngineOptions, type TicTacToeState } from "./engines/WekyEngine.js";

// Canvas Renderers
export { CanvasUtils } from "./canvas/CanvasUtils.js";
export { Render2048 } from "./canvas/Render2048.js";
export { RenderFight, type FightPlayerInfo } from "./canvas/RenderFight.js";
export { RenderHangman } from "./canvas/RenderHangman.js";
export { RenderPokemon } from "./canvas/RenderPokemon.js";
export { RenderSnake } from "./canvas/RenderSnake.js";

// Utilities
export { clamp, formatTime, getRandomString, safeResolveColor, shuffleArray, shuffleString } from "./utils/Helpers.js";
export { MathEvaluator, type EvaluationResult } from "./utils/MathEvaluator.js";

// Datasets
export * from "./data/dilemmas.js";
export * from "./data/pokemons.js";
export * from "./data/sentences.js";
export * from "./data/trivia.js";
export * from "./data/words.js";
