import { Client, ColorResolvable, EmbedBuilder } from "discord.js";
import { EventEmitter } from "events";
import { EventManager } from "./EventManager.js";
import { CalcTypes, ChaosTypes, Embeds, FastTypeTypes, FightTypes, GuessTheNumberTypes, GuessThePokemonTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, RPSTypes, ShuffleGuessTypes, SnakeTypes, TicTacToeTypes, Types2048, WillYouPressTheButtonTypes, WouldYouRatherTypes } from "./Types.js";

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
import { formatTime, getRandomString, safeResolveColor, shuffleArray, shuffleString } from "../utils/Helpers.js";
import { checkPackageUpdates } from "../utils/Notifier.js";
import { version } from "../version.js";

/**
 * Options for initializing the WekyManager.
 */
export interface WekyManagerOptions {
  /** Global default timeout in milliseconds for all games (default: 60,000) */
  defaultTimeout?: number;
  /** Global default brand or embed accent color */
  embedColor?: ColorResolvable;
  /** Global default message when an unauthorized user interacts with a game */
  unauthorizedMessage?: string;
  /** Whether to log a notification box in the console if a new version of the package is available (default: true) */
  notifyUpdates?: boolean;
}

/**
 * Main manager class for the `@m3rcena/weky` Discord minigames engine.
 * Extends EventEmitter to broadcast game lifecycle telemetry:
 * - `gameStart`: ({ game, user, channelId })
 * - `gameOver`: ({ game, user, outcome, score, timeElapsed })
 * - `gameError`: ({ game, error, context })
 * - `unauthorizedClick`: ({ game, user, interaction })
 */
export class WekyManager extends EventEmitter {
  public _client: Client;
  public _eventManager: EventManager;
  public defaultTimeout: number = 60_000;
  public embedColor?: ColorResolvable;
  public unauthorizedMessage?: string;
  public notifyUpdates: boolean = true;

  /**
   * Initializes the WekyManager.
   * @param client The Discord.js Client instance.
   * @param options Optional configuration object or legacy notifyUpdates boolean.
   * @param notifyUpdatesParam Legacy parameter for update notifications.
   */
  constructor(client: Client, options?: WekyManagerOptions | string | boolean, notifyUpdatesParam?: boolean) {
    super();

    if (!client || (!(client instanceof Client) && typeof (client as any).on !== "function")) {
      throw new TypeError("[WekyManager] A valid Discord.js Client instance is required.");
    }

    this._client = client;
    this._eventManager = new EventManager(this._client);

    if (typeof options === "boolean") {
      this.notifyUpdates = options;
    } else if (typeof options === "string") {
      // Legacy constructor: new WekyManager(client, apiKey, notifyUpdates)
      this.notifyUpdates = typeof notifyUpdatesParam === "boolean" ? notifyUpdatesParam : true;
    } else if (options && typeof options === "object") {
      if (typeof options.defaultTimeout === "number") {
        this.defaultTimeout = options.defaultTimeout;
      }
      if (options.embedColor !== undefined) {
        this.embedColor = options.embedColor;
      }
      if (typeof options.unauthorizedMessage === "string") {
        this.unauthorizedMessage = options.unauthorizedMessage;
      }
      if (typeof options.notifyUpdates === "boolean") {
        this.notifyUpdates = options.notifyUpdates;
      }
    }

    if (this.notifyUpdates) {
      checkPackageUpdates(version, false).catch(() => {});
    }
  }

  /**
   * Manually checks for newer versions of @m3rcena/weky.
   */
  public async checkUpdates(gameName?: string): Promise<void> {
    await checkPackageUpdates(version, !this.notifyUpdates, gameName);
  }

  /** Backwards compatibility accessor */
  public get _EventManager(): EventManager {
    return this._eventManager;
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

  /** Alias for createRPS */
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

  /**
   * Builds an EmbedBuilder instance with defaults applied.
   */
  public _createEmbed(embedOptions: Partial<Embeds> = {}, noFields: boolean = false): EmbedBuilder {
    const embed = new EmbedBuilder();
    if (embedOptions.title) embed.setTitle(embedOptions.title);
    if (embedOptions.description) embed.setDescription(embedOptions.description);
    if (embedOptions.url) embed.setURL(embedOptions.url);
    if (embedOptions.thumbnail) embed.setThumbnail(embedOptions.thumbnail);
    if (embedOptions.image) embed.setImage(embedOptions.image);

    const color = embedOptions.color || this.embedColor;
    embed.setColor(safeResolveColor(color, 0x5865f2));

    if (embedOptions.footer) embed.setFooter(embedOptions.footer);
    if (embedOptions.timestamp) {
      embed.setTimestamp(embedOptions.timestamp === true ? new Date() : new Date(embedOptions.timestamp));
    }
    if (embedOptions.author) {
      embed.setAuthor({
        name: embedOptions.author.name,
        iconURL: embedOptions.author.icon_url,
        url: embedOptions.author.url,
      });
    }
    if (!noFields && embedOptions.fields && embedOptions.fields.length > 0) {
      embed.setFields(embedOptions.fields);
    }
    return embed;
  }
}
