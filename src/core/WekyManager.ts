import { Client } from "discord.js";
import { EventManager } from "./EventManager.js";
import { CalcTypes, ChaosTypes, FastTypeTypes, FightTypes, GuessTheNumberTypes, GuessThePokemonTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, RPSTypes, ShuffleGuessTypes, SnakeTypes, TicTacToeTypes, Types2048, WillYouPressTheButtonTypes, WouldYouRatherTypes } from "./Types.js";

// Game Imports
import { Calculator } from "../games/Calculator.js";
import { ChaosWords } from "../games/ChaosWords.js";
import { FastType } from "../games/FastType.js";
import { Fight } from "../games/Fight.js";
import { Game2048 } from "../games/Game2048.js";
import { GuessTheNumber } from "../games/GuessTheNumber.js";
import { GuessThePokemon } from "../games/GuessThePokemon.js";
import { Hangman } from "../games/Hangman.js";
import { LieSwatter } from "../games/LieSwatter.js";
import { NeverHaveIEver } from "../games/NeverHaveIEver.js";
import { QuickClick } from "../games/QuickClick.js";
import { RockPaperScissors } from "../games/RockPaperScissors.js";
import { ShuffleGuess } from "../games/ShuffleGuess.js";
import { Snake } from "../games/Snake.js";
import { TicTacToe } from "../games/TicTacToe.js";
import { WillYouPressTheButton } from "../games/WillYouPressTheButton.js";
import { WouldYouRather } from "../games/WouldYouRather.js";

// Helpers
import { formatTime, getRandomString, shuffleArray, shuffleString } from "../utils/Helpers.js";

export interface WekyManagerOptions {
  /** Optional API key for legacy compatibility */
  apiKey?: string;
  /** Whether to log package notifications */
  notifyUpdates?: boolean;
}

/**
 * Main manager class for the `@m3rcena/weky` Discord minigames engine.
 */
export class WekyManager {
  public _client: Client;
  public _eventManager: EventManager;

  /**
   * Initializes the WekyManager.
   * @param client The Discord.js Client instance.
   * @param legacyApiKeyOrOptions Optional API key or config object.
   * @param legacyNotifyUpdates Optional flag for update notifications.
   */
  constructor(client: Client, legacyApiKeyOrOptions?: string | WekyManagerOptions, legacyNotifyUpdates?: boolean) {
    if (!client || !(client instanceof Client)) {
      throw new TypeError("[WekyManager] A valid Discord.js Client instance is required.");
    }

    this._client = client;
    this._eventManager = new EventManager(this._client);
  }

  /* -------------------------------------------------------------------------- */
  /* MINIGAMES CREATION METHODS                                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Starts a new **2048** minigame session.
   */
  public async create2048(options: Types2048): Promise<void> {
    const game = new Game2048(this, options);
    await game.start();
  }

  /**
   * Starts a new **Calculator** session with safe mathematical evaluation.
   */
  public async createCalculator(options: CalcTypes): Promise<void> {
    const game = new Calculator(this, options);
    await game.start();
  }

  /**
   * Starts a new **Chaos Words** minigame session.
   */
  public async createChaosWords(options: ChaosTypes): Promise<void> {
    const game = new ChaosWords(this, options);
    await game.start();
  }

  /**
   * Starts a new **Fast Type** speed typing challenge.
   */
  public async createFastType(options: FastTypeTypes): Promise<void> {
    const game = new FastType(this, options);
    await game.start();
  }

  /**
   * Starts a new turn-based **Fight** duel RPG between two players.
   */
  public async createFight(options: FightTypes): Promise<void> {
    const game = new Fight(this, options);
    await game.start();
  }

  /**
   * Starts a new **Guess The Number** game (Solo or Public).
   */
  public async createGuessTheNumber(options: GuessTheNumberTypes): Promise<void> {
    const game = new GuessTheNumber(this, options);
    await game.start();
  }

  /**
   * Starts a new **Guess The Pokemon** game featuring native canvas silhouettes.
   */
  public async createGuessThePokemon(options: GuessThePokemonTypes): Promise<void> {
    const game = new GuessThePokemon(this, options);
    await game.start();
  }

  /**
   * Starts a new **Hangman** game featuring high-resolution canvas gallows.
   */
  public async createHangman(options: HangmanTypes): Promise<void> {
    const game = new Hangman(this, options);
    await game.start();
  }

  /**
   * Starts a new **Lie Swatter** true-or-false trivia quiz.
   */
  public async createLieSwatter(options: LieSwatterTypes): Promise<void> {
    const game = new LieSwatter(this, options);
    await game.start();
  }

  /**
   * Starts a new **Never Have I Ever** interactive party voting game.
   */
  public async createNeverHaveIEver(options: NeverHaveIEverTypes): Promise<void> {
    const game = new NeverHaveIEver(this, options);
    await game.start();
  }

  /**
   * Starts a new **Quick Click** reaction speed test.
   */
  public async createQuickClick(options: QuickClickTypes): Promise<void> {
    const game = new QuickClick(this, options);
    await game.start();
  }

  /**
   * Starts a new **Shuffle Guess** word unscramble puzzle.
   */
  public async createShuffleGuess(options: ShuffleGuessTypes): Promise<void> {
    const game = new ShuffleGuess(this, options);
    await game.start();
  }

  /**
   * Starts a new **Snake** arcade game featuring retro canvas graphics.
   */
  public async createSnake(options: SnakeTypes): Promise<void> {
    const game = new Snake(this, options);
    await game.start();
  }

  /**
   * Starts a new **Will You Press The Button?** dilemma game.
   */
  public async createWillYouPressTheButton(options: WillYouPressTheButtonTypes): Promise<void> {
    const game = new WillYouPressTheButton(this, options);
    await game.start();
  }

  /**
   * Starts a new **Would You Rather?** dilemma game.
   */
  public async createWouldYouRather(options: WouldYouRatherTypes): Promise<void> {
    const game = new WouldYouRather(this, options);
    await game.start();
  }

  /**
   * Starts a new **Rock Paper Scissors** game (Solo vs Bot or 2-Player).
   */
  public async createRPS(options: RPSTypes): Promise<void> {
    const game = new RockPaperScissors(this, options);
    await game.start();
  }

  public async createRockPaperScissors(options: RPSTypes): Promise<void> {
    return this.createRPS(options);
  }

  /**
   * Starts a new interactive **Tic Tac Toe** match.
   */
  public async createTicTacToe(options: TicTacToeTypes): Promise<void> {
    const game = new TicTacToe(this, options);
    await game.start();
  }

  /* -------------------------------------------------------------------------- */
  /* UTILITY HELPERS                                                            */
  /* -------------------------------------------------------------------------- */

  public _getContextUserID(context: any): string {
    if (!context) return "";
    if (context.author?.id) return context.author.id;
    if (context.user?.id) return context.user.id;
    if (context.member?.id) return context.member.id;
    return "";
  }

  public getRandomString(length: number = 8, prefix: string = "weky_"): string {
    return getRandomString(length, prefix);
  }

  public convertTime(timeMs: number): string {
    return formatTime(timeMs);
  }

  public shuffleString(str: string): string {
    return shuffleString(str);
  }

  public shuffleArray<T>(arr: T[]): T[] {
    return shuffleArray(arr);
  }
}
