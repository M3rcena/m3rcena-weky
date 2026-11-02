import { $ as WYRTypes, $t as GameStartEvent, A as FastTypeTypes, At as ManualMatchInput, B as LieSwatterTypes, Bt as ARCADE_GAMES, C as BotDataTypes, Ct as ShareCardCustomTexts, D as CustomOptions, Dt as RenderLeaderboard, E as ChaosWordsTypes, Et as LeaderboardEntry, F as GuessTheNumberTypes, Ft as TournamentOptions, G as QuickClickTypes, Gt as BaseGame, H as PlayerData, Ht as ArcadeHub, I as GuessThePokemonData, It as BracketMatch, J as SnakeGameTypes, Jt as BridgeSyncEvent, K as RPSTypes, Kt as ContextAdapter, L as GuessThePokemonTypes, Lt as BracketParticipant, M as FightPowerUp, Mt as TournamentCustomTexts, N as FightTypes, Nt as TournamentManager, O as DilemmaData, Ot as RenderLeaderboardOptions, P as GameContextInput, Pt as TournamentMatchSession, Q as WYPTBTypes, Qt as GameOverEvent, R as HangmanTypes, Rt as BracketRenderOptions, S as BaseGameOptions, St as RenderShareCardOptions, T as ChaosTypes, Tt as LeaderboardCustomTexts, U as Point, Ut as ArcadeHubCustomTexts, V as NeverHaveIEverTypes, Vt as ArcadeGameEntry, W as PowerUp, Wt as ArcadeHubOptions, X as TicTacToeTypes, Xt as DashboardSoundEvent, Y as SnakeTypes, Yt as CrossPlatformMoveEvent, Z as Types2048, Zt as GameErrorEvent, _ as LeaderboardManagerOptions, _t as SoundboardConfig, a as BridgeMoveResult, an as EventManager, at as GameRewardRule, b as LeaderboardStorageAdapter, bt as SoundboardPlayResult, c as CrossPlatformMove, cn as PokemonEntry, ct as WagerRecord, d as CustomPointingMatchContext, dt as WekyEcoConnector, en as LeaderboardUpdateEvent, et as WekyDatabaseConfig, f as CustomPointingMatchHandler, ft as WekyEcoConnectorEvents, g as LeaderboardManager, gt as DashboardSoundEntry, h as EloChangeResult, ht as DEFAULT_DISCORD_SOUNDS, i as WekyBridgeRouter, in as WekyEvents, it as WekyManagerOptions, j as Fields, jt as ManualTournamentOptions, k as Embeds, kt as GrandFinalsSession, l as DashboardOverview, ln as fetchRandomPokemon, lt as WagerRefundedEvent, m as CustomPointingScoreHandler, mt as DEFAULT_DASHBOARD_SOUNDS, n as hostWeky, nn as TournamentMatchEvent, nt as WouldYouRatherTypes, o as BridgePlayer, on as POPULAR_POKEMONS, ot as RewardDistributionResult, p as CustomPointingScoreContext, pt as WekyEcoConnectorOptions, q as ShuffleGuessTypes, qt as ContextSendOptions, r as WEKY_GAME_CATALOG, rn as UnauthorizedClickEvent, rt as WekyManager, s as BridgeSession, sn as PokemonData, st as WagerCreateResult, t as HostWekyOptions, tn as TournamentEndEvent, tt as WillYouPressTheButtonTypes, u as WekyBridge, ut as WagerResolvedEvent, v as LeaderboardPlayer, vt as SoundboardManager, w as CalcTypes, wt as ShareCardStat, x as Author, xt as RenderShareCard, y as LeaderboardPointingOptions, yt as SoundboardPlayOptions, z as IMinigame, zt as RenderBracket } from "./host-Dt3vjAeQ.cjs";
import { M3rcenaPackageName, M3rcenaResolverConfig, PackageResolution, ResolverOptions, findProjectRoot, generateTsConfigPaths, getAllPackageResolutions, isTypeScriptRuntime, loadResolverConfig, printResolutionSummary, resolvePackage } from "./resolver.cjs";
import { M3rcenaBridge } from "@m3rcena/bridge";
import { ColorResolvable, Interaction, Message } from "discord.js";
import { SKRSContext2D } from "@napi-rs/canvas";
export declare const version = "14.28.0";
export declare const VERSION = "14.28.0";
export declare class Calculator extends BaseGame<CalcTypes> {
  private msg1;
  private currentExpression;
  private lastAnswer;
  private hasCalculated;
  private isFinished;
  private is2nd;
  private accentColor;
  private modalOperations;
  constructor(manager: any, options: CalcTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private calculate;
  private handleModal;
  private updateUI;
  private endGame;
  private getDisplay;
  private buildContainer;
  private addButtonsToContainer;
}
export declare class ChaosWords extends BaseGame<ChaosTypes> {
  private words;
  private remainingWords;
  private foundWords;
  private chaosArray;
  private chaosString;
  private triesLeft;
  private maxTries;
  private btnPrefix;
  private gameTitle;
  constructor(manager: any, options: ChaosTypes);
  start(): Promise<void>;
  private generateChaosString;
  onInteraction(interaction: Interaction): Promise<void>;
  onMessage(message: Message): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class FastType extends BaseGame<FastTypeTypes> {
  private sentence;
  private hasTyped;
  private btnPrefix;
  private gameTitle;
  private checkCheating;
  constructor(manager: any, options: FastTypeTypes);
  start(): Promise<void>;
  onTypingStart(typing: any): void;
  onInteraction(interaction: Interaction): Promise<void>;
  onMessage(message: Message): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class Fight extends BaseGame<FightTypes> {
  private opponentUser;
  private opponentMember;
  private phase;
  private isVsBoss;
  private bossProfile;
  private p1;
  private p2;
  private currentTurnId;
  private btnPrefix;
  private lastAnnouncement;
  constructor(manager: any, options: FightTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private startBattle;
  private handleHit;
  private handleHeal;
  private handleShield;
  private handleDoubleDamage;
  private updateBattleInterface;
  /**
   * Returns serializable battle state for Cross-Platform Bridge & Web Dashboard.
   */
  getSerializableState(): any;
  /**
   * Executes a cross-platform battle action from Bridge / Dashboard.
   */
  handleCrossPlatformMove(move: any): Promise<any>;
  private endGame;
  private createGameContainer;
}
export declare class Game2048 extends BaseGame<Types2048> {
  private board;
  private score;
  private hasWon;
  private isGameOver;
  private gameTitle;
  private emojiUp;
  private emojiDown;
  private emojiLeft;
  private emojiRight;
  private quitButtonLabel;
  private idUp;
  private idDown;
  private idLeft;
  private idRight;
  private idQuit;
  constructor(manager: any, options: Types2048);
  start(): Promise<void>;
  private initBoard;
  private spawnTile;
  private renderBoardImage;
  onInteraction(interaction: Interaction): Promise<void>;
  /**
   * Returns serializable 2048 board state for Cross-Platform Bridge & Web Dashboard.
   */
  getSerializableState(): any;
  /**
   * Executes a directional cross-platform move from Bridge / Dashboard.
   */
  handleCrossPlatformMove(move: any): Promise<any>;
  private move;
  private transpose;
  private checkWon;
  private checkGameOver;
  private endGame;
  private createGameContainer;
}
export declare class GuessTheNumber extends BaseGame<GuessTheNumberTypes> {
  private targetNumber;
  private currentMin;
  private currentMax;
  private attempts;
  private participants;
  private isPublic;
  private btnPrefix;
  private gameTitle;
  constructor(manager: any, options: GuessTheNumberTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  onMessage(message: Message): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class GuessThePokemon extends BaseGame<GuessThePokemonTypes> {
  private pokemon;
  private btnPrefix;
  private modalId;
  private gameTitle;
  private giveUpButtonLabel;
  constructor(manager: any, options: GuessThePokemonTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  onMessage(message: Message): Promise<void>;
  private processGuess;
  private endGame;
  private createGameContainer;
}
export declare class Hangman extends BaseGame<HangmanTypes> {
  private targetWord;
  private category;
  private displayWord;
  private guessedLetters;
  private wrongGuesses;
  private maxMistakes;
  private btnPrefix;
  private modalId;
  private gameTitle;
  private quitButtonLabel;
  constructor(manager: any, options: HangmanTypes);
  start(): Promise<void>;
  private updateDisplayWord;
  private renderImage;
  onInteraction(interaction: Interaction): Promise<void>;
  onMessage(message: Message): Promise<void>;
  private processGuess;
  private refreshBoard;
  private endGame;
  private createGameContainer;
}
export declare class LieSwatter extends BaseGame<LieSwatterTypes> {
  private fact;
  private btnPrefix;
  private gameTitle;
  private labelTrue;
  private labelLie;
  constructor(manager: any, options: LieSwatterTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class NeverHaveIEver extends BaseGame<NeverHaveIEverTypes> {
  private statement;
  private haveVoters;
  private neverVoters;
  private btnPrefix;
  private gameTitle;
  constructor(manager: any, options: NeverHaveIEverTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class QuickClick extends BaseGame<QuickClickTypes> {
  private targetIndex;
  private btnPrefix;
  private isWaiting;
  private waitTimer;
  private emoji;
  private gameTitle;
  private buttonCount;
  private minDelay;
  private maxDelay;
  constructor(manager: any, options: QuickClickTypes);
  start(): Promise<void>;
  private triggerActiveState;
  onInteraction(interaction: Interaction): Promise<void>;
  private endGame;
  destroy(): void;
  private createGameContainer;
}
export declare class RockPaperScissors extends BaseGame<RPSTypes> {
  private opponentUser;
  private isVsBot;
  private p1Move;
  private p2Move;
  private btnPrefix;
  private gameTitle;
  private difficulty;
  constructor(manager: any, options: RPSTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class ShuffleGuess extends BaseGame<ShuffleGuessTypes> {
  private targetWord;
  private scrambled;
  private btnPrefix;
  private gameTitle;
  constructor(manager: any, options: ShuffleGuessTypes);
  start(): Promise<void>;
  private getValidScramble;
  onInteraction(interaction: Interaction): Promise<void>;
  onMessage(message: Message): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class Snake extends BaseGame<SnakeTypes> {
  private snake;
  private food;
  private direction;
  private gridSize;
  private score;
  private isGameOver;
  private gameTitle;
  private emojiUp;
  private emojiDown;
  private emojiLeft;
  private emojiRight;
  private quitButtonLabel;
  private idUp;
  private idDown;
  private idLeft;
  private idRight;
  private idQuit;
  constructor(manager: any, options: SnakeTypes);
  start(): Promise<void>;
  private initGame;
  private spawnFood;
  private move;
  private renderBoardImage;
  onInteraction(interaction: Interaction): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class TicTacToe extends BaseGame<TicTacToeTypes> {
  private opponentUser;
  private board;
  private currentTurnId;
  private btnPrefix;
  private gameTitle;
  private isVsAi;
  private difficulty;
  constructor(manager: any, options: TicTacToeTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  /**
   * Returns serializable game state for Cross-Platform Bridge & Web Dashboard.
   */
  getSerializableState(): any;
  /**
   * Executes a cross-platform move dispatched from the Bridge or Web Dashboard.
   */
  handleCrossPlatformMove(move: any): Promise<any>;
  private checkWinner;
  private endGame;
  private createGameContainer;
}
export declare class WillYouPressTheButton extends BaseGame<WillYouPressTheButtonTypes> {
  private dilemma;
  private btnPrefix;
  private gameTitle;
  private labelYes;
  private labelNo;
  constructor(manager: any, options: WillYouPressTheButtonTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private endGame;
  private createGameContainer;
}
export declare class WouldYouRather extends BaseGame<WouldYouRatherTypes> {
  private dilemma;
  private btnPrefix;
  private gameTitle;
  private labelA;
  private labelB;
  constructor(manager: any, options: WouldYouRatherTypes);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private endGame;
  private createGameContainer;
}
/**
 * Universal Game Control item for web dashboards, custom UI, and Discord components.
 */
export interface GameControlItem {
  /** Unique action or control identifier (e.g. 'up', 'hit', 'cal7') */
  id: string;
  /** Visible label on the button */
  label: string;
  /** Optional icon or emoji */
  emoji?: string;
  /** Button color theme / visual intent */
  style: "primary" | "secondary" | "success" | "danger";
  /** Whether the control button is currently disabled */
  disabled: boolean;
}
/**
 * Row containing a list of control items (matches a keypad row or Discord ActionRow).
 */
export interface GameControlRow {
  components: GameControlItem[];
}
interface FightPlayerInfo {
  id: string;
  username: string;
  avatarUrl: string;
  health: number;
  maxHealth?: number;
  coins: number;
  lastAction?: string;
  activeEffects?: string[];
}
interface FightCardCustomTexts {
  title?: string;
  subtitle?: string;
  vsText?: string;
  hpLabel?: string;
  coinLabel?: string;
}
export declare class RenderFight {
  /**
   * Sanitizes text for Canvas rendering by stripping markdown asterisks,
   * resolving Discord user mentions into actual usernames, and removing
   * unicode emoji sequences that cause missing glyph '▯' (tofu) boxes.
   */
  static cleanText(text: string, players?: {
    id?: string;
    username: string;
  }[]): string;
  /**
   * Renders the initial Fight Challenge / Request card.
   */
  static renderRequestCard(challenger: {
    username: string;
    avatarUrl: string;
  }, opponent: {
    username: string;
    avatarUrl: string;
  }, customTexts?: FightCardCustomTexts): Promise<Buffer>;
  /**
   * Renders the dynamic Battle Arena card with health bars, coins, and current turn indicators.
   */
  static renderBattleCard(player1: FightPlayerInfo, player2: FightPlayerInfo, currentTurnUserId: string, announcement?: string, customTexts?: FightCardCustomTexts): Promise<Buffer>;
  private static drawFighterPanel;
  /**
   * Renders the Victory or Game Over card.
   */
  static renderOutcomeCard(winner: {
    username: string;
    avatarUrl: string;
  }, loser?: {
    username: string;
    avatarUrl: string;
  }, type?: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT", customTexts?: FightCardCustomTexts): Promise<Buffer>;
}
/**
 * Centralized graphics and card generation suite for `@m3rcena/weky`.
 * Ideal for web dashboards, REST APIs, custom UIs, and external webhooks.
 */
export declare class WekyCanvas {
  /**
   * Converts an image Buffer into a web-ready Data URL string (`data:image/png;base64,...`).
   * Can be directly used in HTML `<img src="..." />` or frontend frameworks (React, Vue, Svelte).
   */
  static toDataURL(buffer: Buffer, mime?: string): string;
  /**
   * Converts an image Buffer into a base64 encoded string.
   */
  static toBase64(buffer: Buffer): string;
  /**
   * Fight Duel canvas card renderers.
   */
  static readonly fight: {
    /**
     * Renders a Challenge / Request card between two players.
     */
    request: (challenger: {
      username: string;
      avatarUrl: string;
    }, opponent: {
      username: string;
      avatarUrl: string;
    }) => Promise<Buffer>;
    /**
     * Renders an active battle arena card showing both fighters, health bars, coins, and current turn indicator.
     */
    battle: (player1: FightPlayerInfo, player2: FightPlayerInfo, currentTurnUserId: string, announcement?: string) => Promise<Buffer>;
    /**
     * Renders the battle outcome card (Victory, Surrender, Denied, Timeout).
     */
    outcome: (winner: {
      username: string;
      avatarUrl: string;
    }, loser?: {
      username: string;
      avatarUrl: string;
    }, type?: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT") => Promise<Buffer>;
  };
  /**
   * 2048 game board card renderer.
   */
  static game2048(board: number[][], score: number, username: string, avatarUrl: string, state?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer>;
  /**
   * Snake game board card renderer.
   */
  static snake(snake: {
    x: number;
    y: number;
  }[], food: {
    x: number;
    y: number;
  }, direction: "UP" | "DOWN" | "LEFT" | "RIGHT", score: number, gridSize: number, username: string, avatarUrl: string, isGameOver?: boolean, overlayTitle?: string): Promise<Buffer>;
  /**
   * Hangman gallows and word card renderer.
   */
  static hangman(wrongGuessesCount: number, displayWord: string, guessedLetters: string[], username?: string, avatarUrl?: string, gameOver?: boolean, won?: boolean, fullWord?: string): Promise<Buffer>;
  /**
   * Pokemon silhouette / revealed card renderer.
   */
  static pokemon(pokemon: {
    name: string;
    imageUrl?: string;
    image?: string;
    types?: string[];
    abilities?: string[];
    id?: number;
  }, reveal?: boolean): Promise<Buffer>;
}
interface CalculatorState {
  expression: string;
  display: string;
  lastAnswer: string;
  is2nd: boolean;
  hasCalculated: boolean;
}
/**
 * Headless Calculator engine for web dashboards and custom clients.
 */
export declare class CalculatorEngine {
  private expression;
  private lastAnswer;
  private hasCalculated;
  private is2nd;
  constructor();
  /**
   * Toggles between standard arithmetic keypad and 2nd / scientific keypad.
   */
  toggle2nd(): boolean;
  /**
   * Clears the current expression (AC).
   */
  clear(): void;
  /**
   * Erases the last character or token (Backspace).
   */
  backspace(): void;
  /**
   * Alias for input(key).
   */
  press(key: string): {
    result?: number | string;
    error?: string;
  } | void;
  /**
   * Handles button click or input.
   */
  input(key: string): {
    result?: number | string;
    error?: string;
  } | void;
  /**
   * Calculates the current expression safely using MathEvaluator.
   */
  calculate(): {
    result?: number | string;
    error?: string;
  };
  /**
   * Returns a snapshot of the calculator's current state.
   */
  getState(): CalculatorState;
  /**
   * Returns the 5x5 keypad controls schema for dashboard rendering.
   */
  getControls(): GameControlRow[];
}
interface FightEngineOptions {
  player1: {
    id: string;
    username: string;
    avatarUrl?: string;
    health?: number;
    coins?: number;
  };
  player2: {
    id: string;
    username: string;
    avatarUrl?: string;
    health?: number;
    coins?: number;
  };
  startHealth?: number;
  initialPhase?: "REQUEST" | "FIGHT";
}
interface FightState {
  p1: FightPlayerInfo;
  p2: FightPlayerInfo;
  currentTurnId: string;
  phase: "REQUEST" | "FIGHT" | "ENDED";
  lastAnnouncement: string;
  winner?: FightPlayerInfo;
  loser?: FightPlayerInfo;
  endReason?: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT";
}
/**
 * Headless Fight Duel RPG engine for web dashboards and custom APIs.
 */
export declare class FightEngine {
  private p1;
  private p2;
  private currentTurnId;
  private phase;
  private lastAnnouncement;
  private winner?;
  private loser?;
  private endReason?;
  constructor(options: FightEngineOptions);
  /**
   * Accepts the challenge and transitions to FIGHT phase.
   */
  acceptChallenge(): void;
  /**
   * Universal action method accepting either (action, playerId) or (playerId, action) and case-insensitive strings.
   */
  action(playerId: string, actionType: string): {
    success: boolean;
    message: string;
    announcement: string;
    isGameOver?: boolean;
    winnerId?: string;
  };
  /**
   * Performs a combat action for a fighter.
   */
  performAction(action: "hit" | "heavy" | "heal" | "shield" | "double" | "surrender", playerId: string): {
    success: boolean;
    message: string;
    isGameOver?: boolean;
    winnerId?: string;
  };
  /**
   * Returns current combat state.
   */
  getState(): FightState;
  /**
   * Returns control buttons suitable for web dashboard or custom bot.
   */
  getControls(playerId?: string): GameControlRow[];
  /**
   * Renders the current fight arena card as a PNG buffer.
   */
  renderCard(): Promise<Buffer>;
  /**
   * Renders the current fight card as a Data URL string.
   */
  renderDataURL(): Promise<string>;
}
interface Game2048EngineOptions {
  username?: string;
  avatarUrl?: string;
}
interface Game2048State {
  board: number[][];
  score: number;
  hasWon: boolean;
  isGameOver: boolean;
  moveCount: number;
}
/**
 * Headless 2048 game engine for web dashboards, custom bots, and REST/WebSocket APIs.
 */
export declare class Game2048Engine {
  private board;
  private score;
  private hasWon;
  private isGameOver;
  private moveCount;
  private username;
  private avatarUrl;
  constructor(options?: Game2048EngineOptions);
  /**
   * Resets the game to an initial state with 2 spawned tiles.
   */
  reset(): void;
  /**
   * Spawns a random tile (2 with 90% probability, 4 with 10% probability).
   */
  private spawnTile;
  /**
   * Performs a slide move in the specified direction.
   * @returns `true` if the board moved/changed, `false` otherwise.
   */
  move(direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): boolean;
  private transpose;
  private checkWon;
  private checkGameOver;
  /**
   * Returns a snapshot of the current game state.
   */
  getState(): Game2048State;
  /**
   * Returns control buttons suitable for web dashboards or UI rendering.
   */
  getControls(): GameControlRow[];
  /**
   * Renders the current board as a PNG buffer.
   */
  renderCard(customState?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer>;
  /**
   * Renders the current board directly as a Data URL string (`data:image/png;base64,...`).
   */
  renderDataURL(customState?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<string>;
}
interface HangmanEngineOptions {
  word?: string;
  maxMistakes?: number;
}
interface HangmanState {
  word: string;
  maskedWord: string;
  guessedLetters: string[];
  mistakes: number;
  maxMistakes: number;
  isWon: boolean;
  isGameOver: boolean;
}
/**
 * Headless Hangman word puzzle engine for dashboards and web interfaces.
 */
export declare class HangmanEngine {
  private word;
  private guessedLetters;
  private mistakes;
  private maxMistakes;
  private isWon;
  private isGameOver;
  constructor(options?: HangmanEngineOptions);
  /**
   * Resets the game with an optional new word.
   */
  reset(newWord?: string): void;
  /**
   * Makes a letter guess.
   */
  guess(letter: string): {
    correct: boolean;
    isWon: boolean;
    isGameOver: boolean;
  };
  /**
   * Returns current game state.
   */
  getState(): HangmanState;
  /**
   * Returns keyboard layout controls schema for web dashboards.
   */
  getControls(): GameControlRow[];
  /**
   * Renders the Hangman canvas board as a PNG buffer.
   */
  renderCard(username?: string, avatarUrl?: string): Promise<Buffer>;
  /**
   * Renders the Hangman board as a Data URL string.
   */
  renderDataURL(username?: string, avatarUrl?: string): Promise<string>;
}
interface SnakeEngineOptions {
  gridSize?: number;
  username?: string;
  avatarUrl?: string;
}
interface SnakeState {
  snake: {
    x: number;
    y: number;
  }[];
  food: {
    x: number;
    y: number;
  };
  score: number;
  length: number;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  isGameOver: boolean;
}
/**
 * Headless Snake game engine for web dashboards and custom APIs.
 */
export declare class SnakeEngine {
  private snake;
  private food;
  private direction;
  private score;
  private isGameOver;
  private gridSize;
  private username;
  private avatarUrl;
  constructor(options?: SnakeEngineOptions);
  /**
   * Resets the snake game to starting state.
   */
  reset(): void;
  private spawnFood;
  /**
   * Moves the snake one step in the specified direction.
   * Prevents instant reverse into own neck.
   */
  move(newDir: "UP" | "DOWN" | "LEFT" | "RIGHT"): boolean;
  /**
   * Sets next direction without immediately advancing.
   */
  changeDirection(newDir: "UP" | "DOWN" | "LEFT" | "RIGHT"): void;
  /**
   * Advances snake by one frame/step. Ideal for timer loops.
   */
  step(dir?: "UP" | "DOWN" | "LEFT" | "RIGHT"): {
    isAlive: boolean;
    isGameOver: boolean;
    score: number;
  };
  /**
   * Returns current snapshot of the snake state.
   */
  getState(): SnakeState;
  /**
   * Returns control buttons schema.
   */
  getControls(): GameControlRow[];
  /**
   * Renders the current snake board as a PNG buffer.
   */
  renderCard(overlayTitle?: string): Promise<Buffer>;
  /**
   * Renders the snake board as a Data URL string.
   */
  renderDataURL(overlayTitle?: string): Promise<string>;
}
interface TicTacToeEngineOptions {
  playerX: {
    id: string;
    username: string;
  };
  playerO: {
    id: string;
    username: string;
  };
}
interface TicTacToeState {
  board: (string | null)[];
  currentTurnId: string;
  winner: string | null;
  isDraw: boolean;
  isGameOver: boolean;
}
/**
 * Headless Tic Tac Toe engine for dashboards and web interfaces.
 */
export declare class TicTacToeEngine {
  private board;
  private playerX;
  private playerO;
  private currentTurnId;
  private winner;
  private isDraw;
  private isGameOver;
  constructor(options?: TicTacToeEngineOptions);
  reset(): void;
  /**
   * Places a mark on the board. Supports (row, col) or flat index (0-8).
   * Automatically uses currentTurnId if playerId is omitted.
   */
  move(rowOrIndex: number, colOrPlayerId?: number | string, playerId?: string): {
    success: boolean;
    winner?: string | null;
    isDraw?: boolean;
    isWon?: boolean;
    isGameOver?: boolean;
  };
  place(index: number, playerId: string): {
    success: boolean;
    winner?: string;
    isDraw?: boolean;
  };
  private checkWin;
  getState(): TicTacToeState;
  getControls(): GameControlRow[];
}
/**
 * Unified Headless Engine Factory for web dashboards, REST APIs, and custom bots.
 */
export declare class WekyEngine {
  /**
   * Instantiates a headless 2048 game session.
   */
  static create2048(options?: Game2048EngineOptions): Game2048Engine;
  /**
   * Instantiates a headless Snake game session.
   */
  static createSnake(options?: SnakeEngineOptions): SnakeEngine;
  /**
   * Instantiates a headless Fight Duel RPG session.
   */
  static createFight(options: FightEngineOptions): FightEngine;
  /**
   * Instantiates a headless Hangman game session.
   */
  static createHangman(options?: HangmanEngineOptions): HangmanEngine;
  /**
   * Instantiates a headless Calculator session.
   */
  static createCalculator(): CalculatorEngine;
  /**
   * Instantiates a headless Tic Tac Toe session.
   */
  static createTicTacToe(options?: TicTacToeEngineOptions): TicTacToeEngine;
  static game2048: typeof WekyEngine.create2048;
  static snake: typeof WekyEngine.createSnake;
  static fight: typeof WekyEngine.createFight;
  static hangman: typeof WekyEngine.createHangman;
  static calculator: typeof WekyEngine.createCalculator;
  static ticTacToe: typeof WekyEngine.createTicTacToe;
}
/**
 * TicTacToe AI Engine
 * Implements Minimax with depth penalty for optimal play,
 * plus medium and easy heuristic modes.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
type TicTacToeCell = "X" | "O" | null;
type TicTacToeDifficulty = "easy" | "medium" | "hard" | "unbeatable";
export declare class TicTacToeAI {
  private static readonly WINNING_COMBOS;
  /**
   * Finds the best move index (0-8) for the AI.
   * @param board The current 3x3 board state.
   * @param aiSymbol The symbol of the AI ('X' or 'O').
   * @param difficulty AI difficulty level.
   */
  static getBestMove(board: TicTacToeCell[], aiSymbol?: "X" | "O", difficulty?: TicTacToeDifficulty): number;
  private static minimaxBestMove;
  private static minimax;
  static checkWinner(board: TicTacToeCell[]): TicTacToeCell;
  static isBoardFull(board: TicTacToeCell[]): boolean;
  static getAvailableMoves(board: TicTacToeCell[]): number[];
}
/**
 * Fight RPG AI & Boss Engine
 * Pre-configured tactical bosses and automated decision trees.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
interface BossProfile {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  maxHealth: number;
  damageMin: number;
  damageMax: number;
  coins: number;
  dialogueIntro: string;
  dialogueVictory: string;
  dialogueDefeat: string;
  specialMoveName: string;
  specialMoveEffect: (boss: any, player: any) => {
    damage: number;
    message: string;
  };
}
export declare const FIGHT_BOSSES: Record<string, BossProfile>;
export declare class FightAI {
  /**
   * Decides the tactical action for the AI/Boss on its turn.
   */
  static decideAction(aiPlayer: any, humanPlayer: any, bossProfile?: BossProfile): "attack" | "heavy" | "heal" | "shield" | "special";
}
/**
 * Rock Paper Scissors Psychological AI Engine
 * Uses win-stay / lose-shift psychological heuristic tracking
 * to intelligently counter human move habits.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
type RPSMove = "rock" | "paper" | "scissors";
export declare class RPSPredictor {
  private static readonly BEATS;
  private static readonly COUNTERS;
  /**
   * Predicts the player's next move and returns the best counter.
   * @param playerHistory Array of moves the player has previously made.
   * @param lastPlayerOutcome Whether the player won, lost, or tied in the previous round.
   * @param difficulty "easy" (random), "medium" (frequency counter), "hard" (heuristic predictor).
   */
  static getCounterMove(playerHistory?: RPSMove[], lastPlayerOutcome?: "win" | "lose" | "tie", difficulty?: "easy" | "medium" | "hard"): RPSMove;
}
interface SqliteWekyStorageOptions {
  /** Database file path on disk (default: "./weky.sqlite") */
  path?: string;
  /** Whether to enable WAL mode for high concurrency (default: true) */
  walMode?: boolean;
}
export declare class SqliteWekyStorage implements LeaderboardStorageAdapter {
  private db;
  readonly dbPath: string;
  constructor(options?: string | SqliteWekyStorageOptions);
  private initTables;
  get(userId: string): Promise<LeaderboardPlayer | undefined>;
  set(userId: string, data: LeaderboardPlayer): Promise<void>;
  getAll(): Promise<LeaderboardPlayer[]>;
  saveTournament(id: string, game: string, state: any, winnerId?: string): Promise<void>;
  getTournament(id: string): Promise<any | null>;
  /**
   * Closes the SQLite database connection.
   */
  close(): void;
}
/**
 * Prisma Schema snippet that developers can paste into their schema.prisma.
 */
export declare const PRISMA_WEKY_MODEL: string;
/**
 * Automatically inspects and appends Weky models to a schema.prisma file if missing.
 * @param schemaPath Path to schema.prisma (default: "prisma/schema.prisma")
 * @returns True if models were appended, false if already present or schema file not found.
 */
export declare function applyPrismaWekyModel(schemaPath?: string): boolean;
interface PrismaWekyStorageOptions {
  /** The PrismaClient instance provided by the bot */
  client: any;
  /** Property name of the player model on the client (default: "wekyPlayer") */
  playerModel?: string;
  /** Property name of the tournament model on the client (default: "wekyTournament") */
  tournamentModel?: string;
  /** Table name in database for players (default: "WekyPlayer") */
  playerTable?: string;
  /** Table name in database for tournaments (default: "WekyTournament") */
  tournamentTable?: string;
  /** Automatically run table migration on connection if missing (default: true) */
  autoMigrate?: boolean;
}
export declare class PrismaWekyStorage implements LeaderboardStorageAdapter {
  private client;
  private playerModel;
  private tournamentModel;
  private playerTable;
  private tournamentTable;
  private autoMigrate;
  private migrated;
  constructor(options: any | PrismaWekyStorageOptions);
  private ensureMigrated;
  get(userId: string): Promise<LeaderboardPlayer | undefined>;
  set(userId: string, data: LeaderboardPlayer): Promise<void>;
  getAll(): Promise<LeaderboardPlayer[]>;
}
export declare class JsonWekyStorage implements LeaderboardStorageAdapter {
  private filePath;
  private cache;
  private loaded;
  constructor(filePath?: string);
  private ensureLoaded;
  private persist;
  get(userId: string): Promise<LeaderboardPlayer | undefined>;
  set(userId: string, data: LeaderboardPlayer): Promise<void>;
  getAll(): Promise<LeaderboardPlayer[]>;
}
export declare class WekyDatabaseHandler {
  /**
   * Instantiates the requested storage adapter based on developer configuration.
   */
  static create(config?: WekyDatabaseConfig): LeaderboardStorageAdapter | undefined;
  /**
   * Automatically appends Weky models to schema.prisma if missing.
   */
  static applyPrismaSchema(schemaPath?: string): boolean;
}
/**
 * Resolves a LeaderboardStorageAdapter from an existing storageAdapter or database config.
 */
export declare function resolveWekyStorage(options?: {
  storageAdapter?: LeaderboardStorageAdapter;
  database?: WekyDatabaseConfig;
}): LeaderboardStorageAdapter | undefined;
export declare class CanvasUtils {
  /**
   * Draws a rounded rectangle path.
   */
  static roundRectPath(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number | number[]): void;
  /**
   * Fills a rounded rectangle with optional fill and stroke.
   */
  static fillRoundedRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number, fillStyle: SKRSContext2D["fillStyle"], strokeStyle?: SKRSContext2D["strokeStyle"], lineWidth?: number): void;
  /**
   * Safely loads and draws a circular avatar with optional border and glow.
   */
  static drawCircularAvatar(ctx: SKRSContext2D, url: string, x: number, y: number, radius: number, borderColor?: string, borderWidth?: number): Promise<void>;
  /**
   * Draws a badge with rounded corners and centered text.
   */
  static drawBadge(ctx: SKRSContext2D, text: string, x: number, y: number, w: number, h: number, bgColor: string, textColor?: string, font?: string): void;
  /**
   * Draws a shiny vector gold coin icon at (x, y) with radius r.
   * Completely avoids server font emoji missing tofu glyphs.
   */
  static drawCoinIcon(ctx: SKRSContext2D, x: number, y: number, r?: number): void;
  /**
   * Safely cleans text by stripping Unicode emojis and symbols that render as tofu `[?]` boxes on Linux servers.
   */
  static cleanText(text?: string | null): string;
  /**
   * Draws a crisp vector checkmark badge at (cx, cy).
   */
  static drawCheckmarkIcon(ctx: SKRSContext2D, cx: number, cy: number, radius?: number, bgColor?: string, checkColor?: string): void;
  /**
   * Draws a vector 5-point star icon at (cx, cy).
   */
  static drawStarIcon(ctx: SKRSContext2D, cx: number, cy: number, spikes?: number, outerRadius?: number, innerRadius?: number, color?: string): void;
  /**
   * Draws a sleek vector flame icon at (cx, cy).
   */
  static drawFlameIcon(ctx: SKRSContext2D, cx: number, cy: number, size?: number, color?: string): void;
  /**
   * Draws a clean vector crown icon at (cx, cy).
   */
  static drawCrownIcon(ctx: SKRSContext2D, cx: number, cy: number, width?: number, height?: number, color?: string): void;
}
export declare class Render2048 {
  static renderBoard(board: number[][], score: number, username: string, avatarUrl: string, state?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer>;
}
export declare class RenderHangman {
  static renderCard(wrongGuessesCount: number, displayWord: string, guessedLetters: string[], username: string, avatarUrl: string, gameOver?: boolean, won?: boolean, fullWord?: string): Promise<Buffer>;
  private static drawWoodenBeam;
  private static drawLimb;
  private static drawX;
}
export declare class RenderPokemon {
  static renderCard(pokemon: {
    name: string;
    types: string[];
    abilities: string[];
    imageUrl: string;
    id?: number;
  }, revealed?: boolean): Promise<Buffer>;
}
export declare class RenderSnake {
  static renderBoard(snake: {
    x: number;
    y: number;
  }[], food: {
    x: number;
    y: number;
  }, direction: "UP" | "DOWN" | "LEFT" | "RIGHT", score: number, gridSize: number, username: string, avatarUrl: string, isGameOver?: boolean, overlayTitle?: string): Promise<Buffer>;
  private static drawEyes;
}
/**
 * Generates a cryptographically secure random string with a prefix.
 * @param length Length of the random suffix.
 * @param prefix Optional prefix for the customId (default "weky_").
 */
export declare function getRandomString(length?: number, prefix?: string): string;
/**
 * Converts milliseconds into a clean human-readable duration string.
 * @param ms Duration in milliseconds.
 */
export declare function formatTime(ms: number): string;
/**
 * Randomly shuffles characters in a string.
 */
export declare function shuffleString(str: string): string;
/**
 * Randomly shuffles an array using Fisher-Yates algorithm.
 */
export declare function shuffleArray<T>(array: T[]): T[];
/**
 * Safely resolves any Discord color (Hex, Name, Number).
 */
export declare function safeResolveColor(color?: ColorResolvable | string | number | null, fallback?: number): number;
/**
 * Clamps a number between min and max.
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Ultra-safe, AST-free mathematical expression parser and evaluator.
 * No eval(), no Function constructor, completely immune to code injection.
 */
interface EvaluationResult {
  result: number | null;
  formatted: string;
  error?: string;
}
export declare class MathEvaluator {
  private static factorial;
  /**
   * Evaluates a mathematical expression safely.
   * @param expression The mathematical string.
   * @param lastAnswer The previous answer value for 'ans'.
   */
  static evaluate(expression: string, lastAnswer?: number): EvaluationResult;
  private static formatNumber;
  private static tokenize;
  private static toRPN;
  private static evaluateRPN;
}
/**
 * Utility functions for update checking and terminal box notifications.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
/**
 * Strips ANSI color escape codes to compute visible string length.
 */
export declare function stripAnsi(str: string): string;
/**
 * Renders an array of text messages inside a styled terminal box.
 */
export declare function boxConsole(messages: string[]): void;
/**
 * Compares two semantic version strings.
 * Returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2.
 */
export declare function compareSemver(v1: string, v2: string): number;
/**
 * Fetches the latest published version of `@m3rcena/weky` from the npm registry.
 */
export declare function fetchLatestVersion(): Promise<string | null>;
/**
 * Checks if a newer version of `@m3rcena/weky` is available and logs the notification box.
 * @param currentVersion Current running package version.
 * @param disabled If true, update checking is bypassed.
 * @param gameName Optional name of the game being executed.
 */
export declare function checkPackageUpdates(currentVersion: string, disabled?: boolean, gameName?: string): Promise<void>;
export interface WYPTBDilemma {
  question: string;
  consequence: string;
  stats: {
    yes: string;
    no: string;
  };
}
export interface WYRDilemma {
  optionA: string;
  optionB: string;
  stats: {
    votesA: number;
    votesB: number;
  };
}
export declare const WYPTB_DILEMMAS: WYPTBDilemma[];
export declare const WYR_DILEMMAS: WYRDilemma[];
export declare function getRandomWYPTB(): WYPTBDilemma;
export declare function getRandomWYR(): WYRDilemma;
export declare const EASY_SENTENCES: string[];
export declare const MEDIUM_SENTENCES: string[];
export declare const HARD_SENTENCES: string[];
export declare function getRandomSentence(difficulty?: "easy" | "medium" | "hard"): string;
export interface TriviaFact {
  statement: string;
  isTrue: boolean;
  explanation: string;
}
export declare const TRIVIA_FACTS: TriviaFact[];
export declare const NEVER_HAVE_I_EVER_PROMPTS: string[];
export declare function getRandomTriviaFact(): TriviaFact;
export declare function getRandomNHIE(): string;
export declare const HANGMAN_CATEGORIES: Record<string, string[]>;
export declare const COMMON_WORDS: string[];
export declare function getRandomWord(): string;
export declare function getRandomWords(count: number): string[];
export declare function getRandomHangmanWord(category?: string): {
  word: string;
  category: string;
};
export { ARCADE_GAMES, type ArcadeGameEntry, ArcadeHub, type ArcadeHubCustomTexts, type ArcadeHubOptions, Author, BaseGame, BaseGameOptions, type BossProfile, BotDataTypes, type BracketMatch, type BracketParticipant, type BracketRenderOptions, type BridgeMoveResult, type BridgePlayer, type BridgeSession, BridgeSyncEvent, CalcTypes, type CalculatorState, ChaosTypes, ChaosWordsTypes, ContextAdapter, type ContextSendOptions, type CrossPlatformMove, CrossPlatformMoveEvent, CustomOptions, type CustomPointingMatchContext, type CustomPointingMatchHandler, type CustomPointingScoreContext, type CustomPointingScoreHandler, DEFAULT_DASHBOARD_SOUNDS, DEFAULT_DISCORD_SOUNDS, type DashboardOverview, type DashboardSoundEntry, DashboardSoundEvent, DilemmaData, type EloChangeResult, Embeds, type EvaluationResult, EventManager, FastTypeTypes, Fields, type FightCardCustomTexts, type FightEngineOptions, type FightPlayerInfo, FightPowerUp, type FightState, FightTypes, type Game2048EngineOptions, type Game2048State, GameContextInput, GameErrorEvent, GameOverEvent, type GameRewardRule, GameStartEvent, type GrandFinalsSession, GuessTheNumberTypes, GuessThePokemonData, GuessThePokemonTypes, type HangmanEngineOptions, type HangmanState, HangmanTypes, HostWekyOptions, IMinigame, type LeaderboardCustomTexts, type LeaderboardEntry, LeaderboardManager, type LeaderboardManagerOptions, type LeaderboardPlayer, type LeaderboardPointingOptions, type LeaderboardStorageAdapter, LeaderboardUpdateEvent, LieSwatterTypes, M3rcenaBridge, M3rcenaPackageName, M3rcenaResolverConfig, type ManualMatchInput, type ManualTournamentOptions, NeverHaveIEverTypes, POPULAR_POKEMONS, PackageResolution, PlayerData, Point, PokemonData, PokemonEntry, PowerUp, type PrismaWekyStorageOptions, QuickClickTypes, RPSTypes, RenderBracket, RenderLeaderboard, type RenderLeaderboardOptions, RenderShareCard, type RenderShareCardOptions, ResolverOptions, type RewardDistributionResult, type ShareCardCustomTexts, type ShareCardStat, ShuffleGuessTypes, type SnakeEngineOptions, SnakeGameTypes, type SnakeState, SnakeTypes, type SoundboardConfig, SoundboardManager, type SoundboardPlayOptions, type SoundboardPlayResult, type SqliteWekyStorageOptions, type TicTacToeDifficulty, type TicTacToeEngineOptions, type TicTacToeState, TicTacToeTypes, type TournamentCustomTexts, TournamentEndEvent, TournamentManager, TournamentMatchEvent, type TournamentMatchSession, type TournamentOptions, Types2048, UnauthorizedClickEvent, WEKY_GAME_CATALOG, WYPTBTypes, WYRTypes, type WagerCreateResult, type WagerRecord, type WagerRefundedEvent, type WagerResolvedEvent, WekyBridge, WekyBridgeRouter, WekyDatabaseConfig, WekyEcoConnector, type WekyEcoConnectorEvents, type WekyEcoConnectorOptions, WekyEvents, WekyManager, type WekyManagerOptions, WillYouPressTheButtonTypes, WouldYouRatherTypes, fetchRandomPokemon, findProjectRoot, generateTsConfigPaths, getAllPackageResolutions, hostWeky, isTypeScriptRuntime, loadResolverConfig, printResolutionSummary, resolvePackage };
//# sourceMappingURL=index.d.cts.map