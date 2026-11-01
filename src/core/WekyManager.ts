import { Client, ColorResolvable, EmbedBuilder } from "discord.js";
import { EventEmitter } from "events";
import { EventManager } from "./EventManager.js";
import { ContextAdapter } from "./ContextAdapter.js";
import { CalcTypes, ChaosTypes, Embeds, FastTypeTypes, FightTypes, GuessTheNumberTypes, GuessThePokemonTypes, HangmanTypes, LieSwatterTypes, NeverHaveIEverTypes, QuickClickTypes, RPSTypes, ShuffleGuessTypes, SnakeTypes, TicTacToeTypes, Types2048, WillYouPressTheButtonTypes, WouldYouRatherTypes } from "./Types.js";
import { WekyEvents } from "./EventTypes.js";

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

// Hub, Tournament, Leaderboard, Audio, Bridge
import { ArcadeHub, ArcadeHubOptions } from "../hub/ArcadeHub.js";
import { TournamentManager, TournamentOptions, ManualTournamentOptions } from "../tournament/TournamentManager.js";
import { RenderBracket, BracketRenderOptions } from "../tournament/RenderBracket.js";
import { LeaderboardManager, LeaderboardManagerOptions, LeaderboardPointingOptions, LeaderboardStorageAdapter } from "../leaderboard/LeaderboardManager.js";
import { RenderLeaderboard, RenderLeaderboardOptions } from "../canvas/RenderLeaderboard.js";
import { RenderShareCard, RenderShareCardOptions } from "../canvas/RenderShareCard.js";
import { SoundboardManager, SoundboardConfig } from "../soundboard/SoundboardManager.js";
import { WekyBridge, BridgeSession, CrossPlatformMove, BridgeMoveResult, DashboardOverview } from "../bridge/WekyBridge.js";
import { WekyDatabaseConfig } from "./Types.js";
import { resolveWekyStorage } from "../storage/WekyDatabaseHandler.js";
import { WekyEcoConnector, WekyEcoConnectorOptions } from "../connector/WekyEcoConnector.js";

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
  /** Soundboard configuration for triggering Discord soundboard audio */
  soundboard?: SoundboardConfig;
  /** Leaderboard & ELO rating configuration */
  leaderboard?: LeaderboardManagerOptions;
  /** Cross-platform dashboard bridge instance from `@m3rcena/bridge` or custom `WekyBridge` */
  bridge?: any;
  /** Persistent database storage configuration ("sqlite" | "prisma" | "json" | "memory" | object config) */
  database?: WekyDatabaseConfig;
  /** Custom persistent storage adapter implementing LeaderboardStorageAdapter */
  storageAdapter?: LeaderboardStorageAdapter;
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
  public soundboard: SoundboardManager;
  public leaderboard: LeaderboardManager;
  public storage?: LeaderboardStorageAdapter;
  public bridge: WekyBridge;

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

    const customBridge = options && typeof options === "object" ? options.bridge : undefined;
    if (customBridge) {
      if (customBridge instanceof WekyBridge) {
        this.bridge = customBridge;
        this.bridge.wekyManager = this;
      } else {
        this.bridge = new WekyBridge(this, customBridge);
      }
    } else {
      this.bridge = new WekyBridge(this);
    }

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

    const sbConfig = options && typeof options === "object" ? options.soundboard : undefined;
    this.soundboard = new SoundboardManager(this._client, sbConfig, this);

    const rawOptions = options && typeof options === "object" ? options : undefined;
    const lbConfig = rawOptions?.leaderboard;
    const dbConfig = rawOptions?.database || lbConfig?.database;
    const customStorage = rawOptions?.storageAdapter || lbConfig?.storageAdapter;
    const resolvedStorage = resolveWekyStorage({
      storageAdapter: customStorage,
      database: dbConfig,
    });
    this.storage = resolvedStorage;
    this.leaderboard = new LeaderboardManager({
      ...lbConfig,
      storageAdapter: resolvedStorage,
      wekyManager: this,
    });

    if (this.notifyUpdates) {
      checkPackageUpdates(version, false).catch(() => {});
    }
  }

  /**
   * Connects the Weky minigames engine with @m3rcena/eco.
   * Enables automated coin payouts, streak bonuses, score multipliers, PvP wager bets, and tournament prize pools.
   */
  public connectEco(eco: any, connectorOptions?: WekyEcoConnectorOptions): WekyEcoConnector {
    return new WekyEcoConnector(this, eco, connectorOptions);
  }

  // --------------------------------------------------------------------------
  // STRONGLY-TYPED EVENT EMITTER OVERRIDES (No more 'any' types!)
  // --------------------------------------------------------------------------

  public override on<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  public override on(event: string | symbol, listener: (...args: any[]) => void): this;
  public override on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public override once<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  public override once(event: string | symbol, listener: (...args: any[]) => void): this;
  public override once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  public override emit<K extends keyof WekyEvents>(event: K, ...args: WekyEvents[K]): boolean;
  public override emit(event: string | symbol, ...args: any[]): boolean;
  public override emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  public override off<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  public override off(event: string | symbol, listener: (...args: any[]) => void): this;
  public override off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  public override addListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  public override addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override addListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.addListener(event, listener);
  }

  public override removeListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  public override removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.removeListener(event, listener);
  }

  public override prependListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  public override prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.prependListener(event, listener);
  }

  public override prependOnceListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  public override prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
  public override prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.prependOnceListener(event, listener);
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

  /**
   * Starts a new **Arcade Hub** central minigames launcher cabinet.
   */
  public async createArcadeHub(options: ArcadeHubOptions): Promise<void> {
    const hub = new ArcadeHub(this, options);
    await hub.start();
  }

  /**
   * Starts a new automated or manual **Tournament** bracket championship (4 to 16 players).
   */
  public async createTournament(options: TournamentOptions): Promise<TournamentManager> {
    const tournament = new TournamentManager(this, options);
    await tournament.start();
    return tournament;
  }

  /**
   * Generates tournament bracket progress manually for any game or custom competition.
   */
  public async generateTournamentProgress(options: ManualTournamentOptions): Promise<Buffer> {
    return TournamentManager.generateBracketProgress(options);
  }

  /**
   * Generates a tournament bracket canvas chart image buffer.
   */
  public async renderTournamentBracket(options: BracketRenderOptions): Promise<Buffer> {
    return RenderBracket.render(options);
  }

  /**
   * Generates a high-score arcade leaderboard card image buffer.
   */
  public async renderLeaderboard(options: RenderLeaderboardOptions): Promise<Buffer> {
    return RenderLeaderboard.render(options);
  }

  /**
   * Generates a "Share & Flex" gamer score card image buffer.
   */
  public async renderShareCard(options: RenderShareCardOptions): Promise<Buffer> {
    return RenderShareCard.render(options);
  }

  /**
   * Launches any minigame by key (used by ArcadeHub and custom launchers).
   */
  public async launchGameByKey(gameKey: string, contextOrOptions: any): Promise<void> {
    const rawContext =
      contextOrOptions instanceof ContextAdapter
        ? contextOrOptions.raw
        : contextOrOptions?.context ||
          contextOrOptions?.interaction ||
          contextOrOptions?.message ||
          contextOrOptions;

    const specificGameOpts =
      contextOrOptions?.gameOptions?.[gameKey.toLowerCase()] ||
      contextOrOptions?.gameConfigs?.[gameKey.toLowerCase()] ||
      {};

    const baseOpts = {
      context: rawContext,
      ...specificGameOpts,
      ...(typeof contextOrOptions === "object" && !(contextOrOptions instanceof ContextAdapter)
        ? contextOrOptions
        : {}),
      ...specificGameOpts,
    };

    switch (gameKey.toLowerCase()) {
      case "2048":
        return this.create2048(baseOpts);
      case "calculator":
        return this.createCalculator(baseOpts);
      case "chaoswords":
        return this.createChaosWords(baseOpts);
      case "fasttype":
        return this.createFastType(baseOpts);
      case "fight":
        return this.createFight({
          ai: baseOpts.opponent ? false : (baseOpts.ai ?? true),
          boss: baseOpts.boss || "dragon",
          ...baseOpts,
        });
      case "gtn":
      case "guessthenumber":
        return this.createGuessTheNumber(baseOpts);
      case "gtp":
      case "guessthepokemon":
        return this.createGuessThePokemon(baseOpts);
      case "hangman":
        return this.createHangman(baseOpts);
      case "lieswatter":
        return this.createLieSwatter(baseOpts);
      case "nhie":
      case "neverhaveiever":
        return this.createNeverHaveIEver(baseOpts);
      case "quickclick":
        return this.createQuickClick(baseOpts);
      case "rps":
      case "rockpaperscissors":
        return this.createRPS(baseOpts);
      case "shuffleguess":
        return this.createShuffleGuess(baseOpts);
      case "snake":
        return this.createSnake(baseOpts);
      case "tictactoe":
        return this.createTicTacToe({
          ai: baseOpts.opponent ? false : (baseOpts.ai ?? true),
          difficulty: baseOpts.difficulty || "medium",
          ...baseOpts,
        });
      case "wyptb":
      case "willyoupressthebutton":
        return this.createWillYouPressTheButton(baseOpts);
      case "wyr":
      case "wouldyourather":
        return this.createWouldYouRather(baseOpts);
      default:
        throw new Error(`[WekyManager] Unknown game key: ${gameKey}`);
    }
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

  /* -------------------------------------------------------------------------- */
  /* CROSS-PLATFORM BRIDGE & DASHBOARD GATEWAY                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Retrieves dashboard overview metrics, live sessions, and leaderboard data for Web Dashboards.
   */
  public async getDashboardOverview(): Promise<DashboardOverview> {
    return await this.bridge.getDashboardOverview();
  }

  /**
   * Dispatches a cross-platform move from Web Dashboard, REST API, or Discord.
   */
  public async dispatchCrossPlatformMove(sessionId: string, move: CrossPlatformMove): Promise<BridgeMoveResult> {
    return await this.bridge.dispatchMove(sessionId, move);
  }

  /**
   * Registers an external or hybrid game session with the cross-platform bridge.
   */
  public registerCrossPlatformSession(session: BridgeSession): void {
    this.bridge.registerSession(session);
  }

  /**
   * Package router reference for @m3rcena/bridge mounting.
   */
  public get router(): any {
    return this.bridge.router;
  }

  /**
   * Universal router getter for @m3rcena/bridge.
   */
  public toBridgeRouter(): any {
    return this.bridge.router;
  }

  /**
   * Connects this WekyManager instance with an M3rcenaBridge controller.
   * Enables: weky.connectBridge(bridge) or bridge.use(weky).
   */
  public connectBridge(bridge: any): this {
    this.setBridge(bridge);
    return this;
  }

  /**
   * Connects or replaces the dashboard bridge with an M3rcenaBridge instance.
   */
  public setBridge(bridge: any): void {
    if (bridge instanceof WekyBridge) {
      this.bridge = bridge;
      this.bridge.wekyManager = this;
    } else {
      this.bridge.setM3rcenaBridge(bridge);
    }
  }
}
