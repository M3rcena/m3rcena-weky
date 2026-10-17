import { CalculatorEngine } from "./CalculatorEngine.js";
import { FightEngine, FightEngineOptions } from "./FightEngine.js";
import { Game2048Engine, Game2048EngineOptions } from "./Game2048Engine.js";
import { HangmanEngine, HangmanEngineOptions } from "./HangmanEngine.js";
import { SnakeEngine, SnakeEngineOptions } from "./SnakeEngine.js";
import { TicTacToeEngine, TicTacToeEngineOptions } from "./TicTacToeEngine.js";

export { CalculatorEngine, CalculatorState } from "./CalculatorEngine.js";
export { FightEngine, FightEngineOptions, FightState } from "./FightEngine.js";
export { Game2048Engine, Game2048EngineOptions, Game2048State } from "./Game2048Engine.js";
export { HangmanEngine, HangmanEngineOptions, HangmanState } from "./HangmanEngine.js";
export { SnakeEngine, SnakeEngineOptions, SnakeState } from "./SnakeEngine.js";
export { TicTacToeEngine, TicTacToeEngineOptions, TicTacToeState } from "./TicTacToeEngine.js";

/**
 * Unified Headless Engine Factory for web dashboards, REST APIs, and custom bots.
 */
export class WekyEngine {
  /**
   * Instantiates a headless 2048 game session.
   */
  public static create2048(options?: Game2048EngineOptions): Game2048Engine {
    return new Game2048Engine(options);
  }

  /**
   * Instantiates a headless Snake game session.
   */
  public static createSnake(options?: SnakeEngineOptions): SnakeEngine {
    return new SnakeEngine(options);
  }

  /**
   * Instantiates a headless Fight Duel RPG session.
   */
  public static createFight(options: FightEngineOptions): FightEngine {
    return new FightEngine(options);
  }

  /**
   * Instantiates a headless Hangman game session.
   */
  public static createHangman(options?: HangmanEngineOptions): HangmanEngine {
    return new HangmanEngine(options);
  }

  /**
   * Instantiates a headless Calculator session.
   */
  public static createCalculator(): CalculatorEngine {
    return new CalculatorEngine();
  }

  /**
   * Instantiates a headless Tic Tac Toe session.
   */
  public static createTicTacToe(options?: TicTacToeEngineOptions): TicTacToeEngine {
    return new TicTacToeEngine(options);
  }

  // Aliases for concise instantiation
  public static game2048 = WekyEngine.create2048;
  public static snake = WekyEngine.createSnake;
  public static fight = WekyEngine.createFight;
  public static hangman = WekyEngine.createHangman;
  public static calculator = WekyEngine.createCalculator;
  public static ticTacToe = WekyEngine.createTicTacToe;
}
