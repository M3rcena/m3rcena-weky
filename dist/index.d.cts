import { ActionRowBuilder, AttachmentBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Client, ColorResolvable, ContainerBuilder, EmbedBuilder, EmbedFooterData, Guild, GuildMember, GuildTextBasedChannel, Interaction, MediaGalleryBuilder, Message, MessageFlags, TextBasedChannel, User } from "discord.js";
import { EventEmitter } from "events";
import { SKRSContext2D } from "@napi-rs/canvas";
export declare const version = "14.28.0";
export declare const VERSION = "14.28.0";
export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
  imageUrl: string;
}
export type PokemonEntry = PokemonData;
export declare const POPULAR_POKEMONS: PokemonData[];
export declare function fetchRandomPokemon(): Promise<PokemonData>;
/**
 * Global Event Multiplexer.
 * Attaches a single listener to the Discord Client to dispatch events to all active minigames
 * without triggering EventEmitter MaxListenersExceeded warnings or memory leaks.
 */
export declare class EventManager {
  private client;
  private activeGames;
  private initialized;
  constructor(client: Client);
  private initListeners;
  register(game: IMinigame): void;
  unregister(gameId: string): void;
  isRegistered(gameId: string): boolean;
  getActiveCount(): number;
}
export interface GameStartEvent {
  /** The minigame key (e.g. "fight", "tictactoe", "snake", "tournament") */
  game: string;
  /** The Discord user who started the game */
  user: User | GuildMember;
  /** The channel ID where the game was launched */
  channelId?: string;
  /** Timestamp when game started */
  timestamp: number;
}
export interface GameOverEvent {
  /** The minigame key */
  game: string;
  /** The Discord user who played */
  user: User | GuildMember;
  /** Game outcome string (e.g. "won", "lost", "draw", "timeout", "aborted", "finished") */
  outcome: string;
  /** Score or final points achieved */
  score: number;
  /** Duration of the game in milliseconds */
  timeElapsed: number;
  /** Timestamp when game finished */
  timestamp: number;
}
export interface GameErrorEvent {
  /** The minigame key */
  game: string;
  /** The error object or reason */
  error: any;
  /** Context adapter or interaction context */
  context?: any;
}
export interface UnauthorizedClickEvent {
  /** The minigame key */
  game: string;
  /** The user who attempted the unauthorized button click */
  user: User;
  /** The Discord interaction */
  interaction: Interaction;
}
export interface LeaderboardUpdateEvent {
  /** The player user ID */
  userId: string;
  /** The player's username */
  username: string;
  /** Minigame key or category */
  game: string;
  /** Rating or score before this update */
  oldValue: number;
  /** Rating or score after this update */
  newValue: number;
  /** Change delta (+ or -) */
  change: number;
  /** Whether the match was a victory for this player */
  isWin: boolean;
  /** Current active win streak */
  streak: number;
}
export interface TournamentMatchEvent {
  /** Unique tournament ID */
  tournamentId: string;
  /** Current bracket round number (1, 2, 3...) */
  round: number;
  /** Match identifier (e.g. "1_0") */
  matchId: string;
  /** Player 1 details */
  p1: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  /** Player 2 details */
  p2: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  /** Winner ID if completed */
  winnerId?: string;
  /** Detailed match summary or defeat reason */
  outcomeDetail?: string;
  /** Short score text (e.g. "3-1", "WIN") */
  scoreText?: string;
}
export interface TournamentEndEvent {
  /** Unique tournament ID */
  tournamentId: string;
  /** Crowned champion details if finished normally */
  champion?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  /** Reason tournament finished ("finished", "timeout", "aborted") */
  reason: "finished" | "timeout" | "aborted" | string;
  /** Duration in milliseconds */
  duration: number;
}
export interface CrossPlatformMoveEvent {
  /** Session identifier */
  sessionId: string;
  /** Game key */
  game: string;
  /** Player ID making the move */
  playerId: string;
  /** Move action key */
  action: string;
  /** Additional action payload */
  payload?: any;
  /** Platform origin of the move */
  platform: "discord" | "dashboard" | "web" | "api";
}
export interface BridgeSyncEvent {
  /** Session identifier */
  sessionId: string;
  /** Minigame key */
  game: string;
  /** Serialized game state */
  state: any;
  /** Originating system */
  source: string;
  /** Timestamp */
  timestamp: number;
}
/**
 * Type-safe map associating WekyManager event names with their exact parameter tuples.
 */
export interface WekyEvents {
  gameStart: [event: GameStartEvent];
  gameOver: [event: GameOverEvent];
  gameError: [event: GameErrorEvent];
  unauthorizedClick: [event: UnauthorizedClickEvent];
  leaderboardUpdate: [event: LeaderboardUpdateEvent];
  tournamentMatchStart: [event: TournamentMatchEvent];
  tournamentMatchEnd: [event: TournamentMatchEvent];
  tournamentEnd: [event: TournamentEndEvent];
  crossPlatformMove: [event: CrossPlatformMoveEvent];
  bridgeSync: [event: BridgeSyncEvent];
}
interface ArcadeHubCustomTexts {
  /** Custom description text */
  description?: string;
  /** Select menu placeholder (default: "🎮 Select a Minigame to Launch...") */
  selectPlaceholder?: string;
  /** Label for random game button (default: "🎲 Random Game") */
  randomButton?: string;
  /** Label for close button (default: "Close Cabinet") */
  closeButton?: string;
  /** Notice shown when closed by user */
  closedNotice?: string;
  /** Notice shown when expired due to inactivity */
  expiredNotice?: string;
}
interface ArcadeHubOptions extends BaseGameOptions {
  /** Optional custom banner image URL */
  bannerUrl?: string;
  /** Custom title for the arcade launcher */
  title?: string;
  /** Games to exclude from the launcher */
  exclude?: string[];
  /** Custom callback when a game is selected */
  onSelect?: (gameKey: string, context: ContextAdapter) => Promise<void> | void;
  /** Optional custom text labels */
  texts?: ArcadeHubCustomTexts;
}
interface ArcadeGameEntry {
  key: string;
  name: string;
  emoji: string;
  category: "Classic Arcade" | "PvP Duels" | "Brain & Puzzles" | "Party & Social";
  description: string;
}
export declare const ARCADE_GAMES: ArcadeGameEntry[];
export declare class ArcadeHub extends BaseGame<ArcadeHubOptions> {
  private btnPrefix;
  private selectMenuId;
  private selectedCategory;
  constructor(manager: any, options: ArcadeHubOptions);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private launchGame;
  private endHub;
  private createHubContainer;
}
/**
 * Canvas Tournament Bracket Renderer
 * Generates an eSports-style visual bracket chart using @napi-rs/canvas.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
interface BracketParticipant {
  id: string;
  username: string;
  avatarUrl?: string;
  score?: number;
}
interface BracketMatch {
  id: string;
  round: number;
  matchIndex: number;
  p1?: BracketParticipant;
  p2?: BracketParticipant;
  winnerId?: string;
  scoreText?: string;
  outcomeDetail?: string;
}
interface BracketRenderOptions {
  title?: string;
  gameName: string;
  rounds: number;
  matches: BracketMatch[];
  champion?: BracketParticipant;
}
export declare class RenderBracket {
  /**
   * Generates a high-definition tournament bracket image buffer.
   */
  static render(options: BracketRenderOptions): Promise<Buffer>;
  private static drawMatchCard;
  private static drawParticipantRow;
}
interface TournamentCustomTexts {
  /** Label for the play match button (default: "⚔️ Play My Match") */
  playButton?: string;
  /** Label for the bracket refresh button (default: "🔄 Refresh Bracket") */
  refreshButton?: string;
  /** Label for the abort button (default: "Abort Tournament") */
  abortButton?: string;
  /** Label for manual advance button (default: "👑 Advance Match") */
  manualAdvanceButton?: string;
  /** Label for crowning champion button in finals (default: "👑 Advance / Crown Champion") */
  crownChampionButton?: string;
  /** Header title for active bracket (default: "🏆 {{title}} • Round {{round}}") */
  bracketHeader?: string;
  /** Header title for grand finals (default: "👑 {{title}} • Grand Finals") */
  finalsHeader?: string;
  /** Header title when champion is crowned (default: "🏆 TOURNAMENT CHAMPION CROWNED!") */
  championHeader?: string;
}
interface TournamentOptions extends BaseGameOptions {
  /** Tournament discipline ("rps", "tictactoe", "fight", or custom game name) */
  game?: "rps" | "tictactoe" | "fight" | "custom" | string;
  /** Participant array (4 to 16 players) */
  players: (User | GuildMember)[];
  /** Tournament title */
  title?: string;
  /** When true, tournament progress is manually advanced by the organizer rather than game-specific */
  manual?: boolean;
  /** Optional custom text labels and headers */
  texts?: TournamentCustomTexts;
}
interface TournamentMatchSession {
  match: BracketMatch;
  round: number;
  p1: BracketParticipant;
  p2: BracketParticipant;
  status: "waiting_opponent" | "in_progress" | "completed";
  p1Ready: boolean;
  p2Ready: boolean;
  p1Interaction?: any;
  p2Interaction?: any;
  readyTimeoutTimer?: NodeJS.Timeout;
  afkTimer?: NodeJS.Timeout;
  currentTurnId: string;
  winnerId?: string;
  outcomeDetail?: string;
  scoreText?: string;
  tttBoard?: (string | null)[];
  rpsP1Choice?: "rock" | "paper" | "scissors";
  rpsP2Choice?: "rock" | "paper" | "scissors";
  rpsMessage?: string;
  fightP1Hp?: number;
  fightP2Hp?: number;
  fightP1Coins?: number;
  fightP2Coins?: number;
  fightP1Shield?: boolean;
  fightP2Shield?: boolean;
  fightCombatLog?: string;
}
interface GrandFinalsSession {
  match: BracketMatch;
  p1: BracketParticipant;
  p2: BracketParticipant;
  currentTurnId: string;
  winnerId?: string;
  outcomeDetail?: string;
  scoreText?: string;
  afkTimer?: NodeJS.Timeout;
  tttBoard?: (string | null)[];
  rpsP1Choice?: "rock" | "paper" | "scissors";
  rpsP2Choice?: "rock" | "paper" | "scissors";
  rpsMessage?: string;
  fightP1Hp?: number;
  fightP2Hp?: number;
  fightP1Coins?: number;
  fightP2Coins?: number;
  fightP1Shield?: boolean;
  fightP2Shield?: boolean;
  fightCombatLog?: string;
}
interface ManualMatchInput {
  round: number;
  matchIndex: number;
  p1Username: string;
  p1AvatarUrl?: string;
  p2Username: string;
  p2AvatarUrl?: string;
  winnerUsername?: string;
  scoreText?: string;
  outcomeDetail?: string;
}
interface ManualTournamentOptions {
  title?: string;
  gameName?: string;
  rounds?: number;
  players?: string[];
  matches: ManualMatchInput[];
  championUsername?: string;
}
export declare class TournamentManager extends BaseGame<TournamentOptions> {
  private btnPrefix;
  private participants;
  private matches;
  private numRounds;
  private currentRound;
  private champion?;
  private isManualMode;
  private gameTitle;
  private activeSessions;
  private gfSession?;
  private gfAfkTimer?;
  constructor(manager: any, options: TournamentOptions);
  private setupBrackets;
  start(): Promise<void>;
  /**
   * Resets the tournament inactivity timer (clock).
   * Refreshes the full defaultTimeout (10 mins or options.time) whenever an interaction occurs.
   */
  private resetTournamentTimeout;
  onInteraction(interaction: Interaction): Promise<void>;
  /**
   * Dispatches the manual advance modal/control menu to the organizer.
   */
  private handleManualMenu;
  /**
   * Handles manual winner selection by the organizer.
   */
  private handleManualAdvanceSelection;
  /**
   * Handles a player pressing "Play My Match" on the main bracket board.
   */
  private handlePlayerJoinMatch;
  /**
   * Handles user interaction inside an ephemeral preliminary match.
   */
  private handleEphemeralMatchInteraction;
  /**
   * Handles user interaction in the live, public Grand Finals in the channel.
   */
  private handleGrandFinalsInteraction;
  /**
   * Handles Walkover / Forfeit if a player is AFK.
   */
  private handleWalkover;
  /**
   * Advances the winner into the next bracket node.
   */
  private advanceWinnerInBracket;
  /**
   * Manually advances a specific match with a winner and optional outcome detail text.
   * Works for ANY game or bracket type.
   */
  progressMatch(matchId: string, winnerId: string, outcomeDetail?: string): Promise<void>;
  /**
   * Manually advances the next pending match in the current round.
   */
  progressNextMatch(winnerId?: string, outcomeDetail?: string): Promise<BracketMatch | null>;
  /**
   * Static helper to generate a visual tournament progress bracket image manually without running live games.
   */
  static generateBracketProgress(options: ManualTournamentOptions): Promise<Buffer>;
  getMatches(): BracketMatch[];
  getPendingMatches(): BracketMatch[];
  /**
   * Checks if all matches in the active round are done, advancing to the next round or Grand Finals.
   */
  private checkRoundCompletion;
  /**
   * Initializes the Grand Finals session when preliminary rounds complete.
   */
  private initGrandFinals;
  private resetSessionAfkTimer;
  private resetGrandFinalsAfkTimer;
  private createMatchSession;
  private checkTTTWin;
  private checkRPSWinner;
  private executeFightAction;
  /**
   * Renders the interactive match container for an ephemeral match session.
   */
  private renderMatchContainer;
  /**
   * Renders the outcome container shown to players when an ephemeral match concludes,
   * with explicit detail on how the player won or was defeated.
   */
  private renderMatchResultContainer;
  /**
   * Renders the interactive container for the live Grand Finals in the main channel.
   */
  private renderGrandFinalsContainer;
  /**
   * Renders and updates the main tournament channel message.
   */
  private renderAndDisplay;
  private deliverMessage;
  private clearAllTimers;
  private endTournament;
}
/**
 * ELO & High-Score Leaderboard Engine
 * Provides plug-and-play ELO rating calculations, streak tracking, and score storage.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
interface LeaderboardPlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  highestStreak: number;
  scores: Record<string, number>;
  lastPlayed: number;
}
interface EloChangeResult {
  p1Change: number;
  p2Change: number;
  p1NewElo: number;
  p2NewElo: number;
}
interface LeaderboardStorageAdapter {
  get(userId: string): Promise<LeaderboardPlayer | undefined> | LeaderboardPlayer | undefined;
  set(userId: string, data: LeaderboardPlayer): Promise<void> | void;
  getAll(): Promise<LeaderboardPlayer[]> | LeaderboardPlayer[];
}
interface CustomPointingMatchContext {
  p1: LeaderboardPlayer;
  p2: LeaderboardPlayer;
  result: "p1" | "p2" | "draw";
  game?: string;
  kFactor?: number;
}
interface CustomPointingScoreContext {
  player: LeaderboardPlayer;
  game: string;
  score: number;
}
type CustomPointingMatchHandler = (ctx: CustomPointingMatchContext) => EloChangeResult | {
  p1Change: number;
  p2Change: number;
  p1NewElo?: number;
  p2NewElo?: number;
};
type CustomPointingScoreHandler = (ctx: CustomPointingScoreContext) => number;
interface LeaderboardPointingOptions {
  /** Optional custom pointing calculation function for PvP matches */
  calculateMatchPoints?: CustomPointingMatchHandler;
  /** Optional flat points awarded on a victory */
  winPoints?: number;
  /** Optional flat points deducted on a defeat */
  lossPoints?: number;
  /** Optional flat points awarded on a draw */
  drawPoints?: number;
  /** Optional bonus points awarded per active streak number */
  streakBonus?: number;
  /** Optional custom pointing calculation function for solo game scores */
  calculateSoloPoints?: CustomPointingScoreHandler;
}
interface LeaderboardManagerOptions {
  /** Default starting ELO for new players (default: 1200) */
  defaultElo?: number;
  /** Default K-factor for ELO variance (default: 32) */
  kFactor?: number;
  /** Custom persistent storage adapter (e.g. Database, Quick.db, Enmap, SQLite) */
  storageAdapter?: LeaderboardStorageAdapter;
  /** Optional developer-defined custom pointing formula (falls back to standard FIDE ELO if omitted) */
  pointing?: LeaderboardPointingOptions;
  /** Optional reference to WekyManager for event telemetry */
  wekyManager?: any;
}
export declare class LeaderboardManager {
  private players;
  defaultElo: number;
  defaultKFactor: number;
  pointing?: LeaderboardPointingOptions;
  private storageAdapter?;
  wekyManager?: any;
  constructor(options?: LeaderboardManagerOptions);
  /**
   * Calculates ELO rating adjustments using the standard international FIDE ELO formula.
   *
   * @param playerElo Rating of Player 1
   * @param opponentElo Rating of Player 2
   * @param outcome 1 for player 1 win, 0.5 for draw, 0 for player 1 loss
   * @param kFactor Weight factor (default: 32)
   */
  static calculateElo(playerElo: number, opponentElo: number, outcome: 1 | 0.5 | 0, kFactor?: number): EloChangeResult;
  /**
   * Retrieves or initializes stats for a player.
   */
  getPlayer(userId: string, username?: string, avatarUrl?: string): Promise<LeaderboardPlayer>;
  /**
   * Records a 1v1 match outcome between two players and updates their ratings and streaks.
   * If custom pointing is configured (or passed in options), it executes the developer formula;
   * otherwise it defaults to international FIDE ELO.
   */
  recordMatch(p1Id: string, p2Id: string, result: "p1" | "p2" | "draw", options?: {
    p1Username?: string;
    p2Username?: string;
    p1Avatar?: string;
    p2Avatar?: string;
    game?: string;
    kFactor?: number;
    pointing?: LeaderboardPointingOptions;
  }): Promise<EloChangeResult>;
  /**
   * Records a solo arcade score (e.g. 2048, Snake, FastType).
   * Updates player's personal best if beaten.
   */
  recordScore(userId: string, game: string, score: number, options?: {
    username?: string;
    avatarUrl?: string;
    pointing?: LeaderboardPointingOptions;
  }): Promise<{
    isPersonalBest: boolean;
    previousBest: number;
    newBest: number;
    awardedPoints: number;
  }>;
  /**
   * Exports all leaderboard player records as a raw JSON serializable array (for web dashboards).
   */
  exportData(): Promise<LeaderboardPlayer[]>;
  /**
   * Imports or merges an external array of player records into the leaderboard (e.g. from a web dashboard database).
   */
  importData(data: LeaderboardPlayer[]): Promise<void>;
  /**
   * Returns top players sorted by ELO rating.
   */
  getTopByElo(limit?: number): Promise<LeaderboardPlayer[]>;
  /**
   * Returns top players for a specific solo minigame by high score.
   */
  getTopByScore(game: string, limit?: number): Promise<{
    rank: number;
    player: LeaderboardPlayer;
    score: number;
  }[]>;
  /**
   * Clears all in-memory leaderboard records.
   */
  reset(): void;
}
/**
 * Canvas Leaderboard Renderer
 * Generates an eSports-grade High-Score poster using @napi-rs/canvas.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
interface LeaderboardEntry {
  rank: number;
  userId?: string;
  username: string;
  avatarUrl?: string;
  scoreOrElo: number | string;
  stats?: string;
  streak?: number;
}
interface LeaderboardCustomTexts {
  /** Text shown in top-left badge pill (default: "HALL OF FAME") */
  categoryBadge?: string;
  /** Text template shown in top-right contenders badge (default: "${count} TOP CONTENDERS") */
  topContendersBadge?: string;
  /** Column header for rank (default: "RANK") */
  rankColumn?: string;
  /** Column header for player (default: "PLAYER") */
  playerColumn?: string;
  /** Column header for record / streak (default: "RECORD / STREAK") */
  recordColumn?: string;
  /** Column header for score / elo (default: "SCORE / ELO") */
  scoreColumn?: string;
  /** Streak pill suffix (default: "STREAK") */
  streakSuffix?: string;
  /** Footer branding watermark (default: "Powered by @m3rcena/weky • Modern Discord Minigames Engine") */
  footer?: string;
}
interface RenderLeaderboardOptions {
  title?: string;
  subtitle?: string;
  gameName?: string;
  entries: LeaderboardEntry[];
  accentColor?: string;
  texts?: LeaderboardCustomTexts;
}
export declare class RenderLeaderboard {
  static render(options: RenderLeaderboardOptions): Promise<Buffer>;
}
/**
 * "Share & Flex" Gamer Score Card Generator
 * Generates an eSports-grade holographic match victory / performance pass using @napi-rs/canvas.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
interface ShareCardStat {
  label: string;
  value: string;
  color?: string;
}
interface ShareCardCustomTexts {
  /** Verified stamp in top right (default: "VERIFIED COMPETITIVE MATCH") */
  verifiedStamp?: string;
  /** Subtitle under avatar (default: "WEKY AUTHENTICATED") */
  authenticatedSub?: string;
  /** Label for top right highlight box (default: "PRIMARY HIGHLIGHT") */
  primaryHighlight?: string;
  /** Bottom footer watermark (default: "WEKY-PASSPORT • AUTHENTICATED BY @M3RCENA/WEKY ENGINE") */
  footer?: string;
}
interface RenderShareCardOptions {
  /** The player's username */
  username: string;
  /** Avatar image URL */
  avatarUrl?: string;
  /** Minigame title or discipline (e.g. "Snake Arcade", "Fight RPG", "TicTacToe") */
  gameName: string;
  /** Main outcome or highlight (e.g. "VICTORY 👑", "HIGH SCORE 🌟", "MATCH COMPLETE") */
  headline?: string;
  /** Primary metric (e.g. "28,450 PTS" or "VICTORY (+32 ELO)") */
  primaryScore: string;
  /** Rank badge or tier (e.g. "GRANDMASTER", "DIAMOND TIER", "ARCADE PRO") */
  rankBadge?: string;
  /** Additional 2 to 4 key statistics to display in the metric grid */
  stats?: ShareCardStat[];
  /** Optional custom theme accent color (hex) */
  accentColor?: string;
  /** Optional custom text labels */
  texts?: ShareCardCustomTexts;
}
export declare class RenderShareCard {
  static render(options: RenderShareCardOptions): Promise<Buffer>;
}
interface SoundboardConfig {
  enabled?: boolean;
  sounds?: {
    victory?: string;
    defeat?: string;
    countdown?: string;
    action?: string;
  };
}
interface SoundboardPlayResult {
  success: boolean;
  error?: string;
  soundId?: string;
}
export declare class SoundboardManager {
  private client;
  private config;
  constructor(client: Client, config?: SoundboardConfig);
  /**
   * Safely plays a soundboard sound in the given voice channel with diagnostic details.
   */
  playSoundWithResult(channelId: string, soundTypeOrId: "victory" | "defeat" | "countdown" | "action" | string, sourceGuildId?: string): Promise<SoundboardPlayResult>;
  /**
   * Safely plays a soundboard sound in the given voice channel.
   * If soundboard is disabled or bot lacks permissions, fails silently without crashing.
   */
  playSound(channelId: string, soundTypeOrId: "victory" | "defeat" | "countdown" | "action" | string, sourceGuildId?: string): Promise<boolean>;
}
interface BridgePlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  platform: "discord" | "dashboard" | "web" | "api";
}
interface CrossPlatformMove {
  playerId: string;
  action: string;
  payload?: any;
  sourcePlatform: "discord" | "dashboard" | "web" | "api";
}
interface BridgeMoveResult {
  success: boolean;
  state: any;
  nextTurnId?: string;
  isGameOver?: boolean;
  winnerId?: string;
  announcement?: string;
  error?: string;
}
interface BridgeSession<TState = any> {
  /** Unique session ID */
  id: string;
  /** Minigame key (e.g. "tictactoe", "fight", "snake", "2048") */
  game: string;
  /** Platform hosting or participating in the match */
  platform: "discord" | "dashboard" | "hybrid";
  /** Players participating in this session */
  players: BridgePlayer[];
  /** Current player turn ID (if turn-based) */
  currentTurnId?: string;
  /** Current serializable game state */
  state: TState;
  /** Optional linked Headless Engine instance */
  engine?: any;
  /** Arbitrary session metadata */
  metadata?: Record<string, any>;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  lastUpdated: number;
  /** Whether the session has concluded */
  isGameOver: boolean;
  /** Winner ID if concluded */
  winnerId?: string;
  /** Callback invoked when a cross-platform move is dispatched */
  onMove?: (move: CrossPlatformMove) => Promise<BridgeMoveResult> | BridgeMoveResult;
  /** Callback to render current canvas snapshot */
  renderSnapshot?: () => Promise<Buffer | string> | Buffer | string;
}
interface DashboardOverview {
  activeGamesCount: number;
  totalLeaderboardPlayers: number;
  activeSessions: {
    id: string;
    game: string;
    platform: "discord" | "dashboard" | "hybrid";
    players: {
      id: string;
      username: string;
      platform: string;
    }[];
    currentTurnId?: string;
    lastUpdated: number;
    isGameOver: boolean;
  }[];
  topContenders: {
    rank: number;
    username: string;
    elo: number;
    wins: number;
    winStreak: number;
  }[];
}
export declare class WekyBridge {
  private sessions;
  wekyManager?: any;
  constructor(wekyManager?: any);
  /**
   * Registers an active game session into the cross-platform bridge.
   */
  registerSession(session: BridgeSession): void;
  /**
   * Unregisters a game session upon termination.
   */
  unregisterSession(sessionId: string): void;
  /**
   * Retrieves a session by ID.
   */
  getSession(sessionId: string): BridgeSession | undefined;
  /**
   * Returns all active, uncompleted sessions.
   */
  getActiveSessions(): BridgeSession[];
  /**
   * Returns all registered sessions regardless of status.
   */
  getAllSessions(): BridgeSession[];
  /**
   * Returns all sessions where a specific user is a participant.
   */
  getSessionsForPlayer(playerId: string): BridgeSession[];
  /**
   * Updates state for a session and synchronizes it with bridge listeners.
   */
  syncState(sessionId: string, newState: any, source?: string): void;
  /**
   * Dispatches a cross-platform move to an active game session.
   * Can be invoked from Web Dashboards, REST APIs, or Discord bots.
   */
  dispatchMove(sessionId: string, move: CrossPlatformMove): Promise<BridgeMoveResult>;
  /**
   * Ends an active game session and flags it as completed.
   */
  endSession(sessionId: string, outcome?: {
    winnerId?: string;
    reason?: string;
  }): void;
  /**
   * Renders a live visual snapshot of the session (Canvas image Buffer or Data URL).
   */
  renderSessionSnapshot(sessionId: string): Promise<Buffer | string | null>;
  /**
   * Returns a high-level overview of live games, active sessions, and leaderboard data for Web Dashboards.
   */
  getDashboardOverview(): Promise<DashboardOverview>;
  /**
   * Exports full state dump of active sessions and leaderboard data for external database syncing.
   */
  exportAllState(): Promise<{
    sessions: BridgeSession[];
    leaderboard?: LeaderboardPlayer[];
  }>;
  /**
   * Imports state dump from an external database or dashboard backend.
   */
  importAllState(data: {
    sessions?: BridgeSession[];
    leaderboard?: LeaderboardPlayer[];
  }): Promise<void>;
}
/**
 * Options for initializing the WekyManager.
 */
interface WekyManagerOptions {
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
}
/**
 * Main manager class for the `@m3rcena/weky` Discord minigames engine.
 * Extends EventEmitter to broadcast game lifecycle telemetry:
 * - `gameStart`: ({ game, user, channelId })
 * - `gameOver`: ({ game, user, outcome, score, timeElapsed })
 * - `gameError`: ({ game, error, context })
 * - `unauthorizedClick`: ({ game, user, interaction })
 */
export declare class WekyManager extends EventEmitter {
  _client: Client;
  _eventManager: EventManager;
  defaultTimeout: number;
  embedColor?: ColorResolvable;
  unauthorizedMessage?: string;
  notifyUpdates: boolean;
  soundboard: SoundboardManager;
  leaderboard: LeaderboardManager;
  bridge: WekyBridge;
  /**
   * Initializes the WekyManager.
   * @param client The Discord.js Client instance.
   * @param options Optional configuration object or legacy notifyUpdates boolean.
   * @param notifyUpdatesParam Legacy parameter for update notifications.
   */
  constructor(client: Client, options?: WekyManagerOptions | string | boolean, notifyUpdatesParam?: boolean);
  on<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  once<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;
  emit<K extends keyof WekyEvents>(event: K, ...args: WekyEvents[K]): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;
  off<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  addListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  removeListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
  /**
   * Manually checks for newer versions of @m3rcena/weky.
   */
  checkUpdates(gameName?: string): Promise<void>;
  /** Backwards compatibility accessor */
  get _EventManager(): EventManager;
  /**
   * Starts a new **2048** minigame session.
   */
  create2048(options: Types2048): Promise<void>;
  /**
   * Starts a new **Calculator** session with safe mathematical evaluation.
   */
  createCalculator(options: CalcTypes): Promise<void>;
  /**
   * Starts a new **Chaos Words** minigame session.
   */
  createChaosWords(options: ChaosTypes): Promise<void>;
  /**
   * Starts a new **Fast Type** speed typing challenge.
   */
  createFastType(options: FastTypeTypes): Promise<void>;
  /**
   * Starts a new turn-based **Fight** duel RPG between two players.
   */
  createFight(options: FightTypes): Promise<void>;
  /**
   * Starts a new **Guess The Number** game (Solo or Public).
   */
  createGuessTheNumber(options: GuessTheNumberTypes): Promise<void>;
  /**
   * Starts a new **Guess The Pokemon** game featuring native canvas silhouettes.
   */
  createGuessThePokemon(options: GuessThePokemonTypes): Promise<void>;
  /**
   * Starts a new **Hangman** game featuring high-resolution canvas gallows.
   */
  createHangman(options: HangmanTypes): Promise<void>;
  /**
   * Starts a new **Lie Swatter** true-or-false trivia quiz.
   */
  createLieSwatter(options: LieSwatterTypes): Promise<void>;
  /**
   * Starts a new **Never Have I Ever** interactive party voting game.
   */
  createNeverHaveIEver(options: NeverHaveIEverTypes): Promise<void>;
  /**
   * Starts a new **Quick Click** reaction speed test.
   */
  createQuickClick(options: QuickClickTypes): Promise<void>;
  /**
   * Starts a new **Shuffle Guess** word unscramble puzzle.
   */
  createShuffleGuess(options: ShuffleGuessTypes): Promise<void>;
  /**
   * Starts a new **Snake** arcade game featuring retro canvas graphics.
   */
  createSnake(options: SnakeTypes): Promise<void>;
  /**
   * Starts a new **Will You Press The Button?** dilemma game.
   */
  createWillYouPressTheButton(options: WillYouPressTheButtonTypes): Promise<void>;
  /**
   * Starts a new **Would You Rather?** dilemma game.
   */
  createWouldYouRather(options: WouldYouRatherTypes): Promise<void>;
  /**
   * Starts a new **Rock Paper Scissors** game (Solo vs Bot or 2-Player).
   */
  createRPS(options: RPSTypes): Promise<void>;
  /** Alias for createRPS */
  createRockPaperScissors(options: RPSTypes): Promise<void>;
  /**
   * Starts a new interactive **Tic Tac Toe** match.
   */
  createTicTacToe(options: TicTacToeTypes): Promise<void>;
  /**
   * Starts a new **Arcade Hub** central minigames launcher cabinet.
   */
  createArcadeHub(options: ArcadeHubOptions): Promise<void>;
  /**
   * Starts a new automated or manual **Tournament** bracket championship (4 to 16 players).
   */
  createTournament(options: TournamentOptions): Promise<TournamentManager>;
  /**
   * Generates tournament bracket progress manually for any game or custom competition.
   */
  generateTournamentProgress(options: ManualTournamentOptions): Promise<Buffer>;
  /**
   * Generates a tournament bracket canvas chart image buffer.
   */
  renderTournamentBracket(options: BracketRenderOptions): Promise<Buffer>;
  /**
   * Generates a high-score arcade leaderboard card image buffer.
   */
  renderLeaderboard(options: RenderLeaderboardOptions): Promise<Buffer>;
  /**
   * Generates a "Share & Flex" gamer score card image buffer.
   */
  renderShareCard(options: RenderShareCardOptions): Promise<Buffer>;
  /**
   * Launches any minigame by key (used by ArcadeHub and custom launchers).
   */
  launchGameByKey(gameKey: string, contextOrOptions: any): Promise<void>;
  _getContextUserID(context: any): string;
  getRandomString(length?: number, prefix?: string): string;
  convertTime(timeMs: number): string;
  shuffleString(str: string): string;
  shuffleArray<T>(arr: T[]): T[];
  /**
   * Builds an EmbedBuilder instance with defaults applied.
   */
  _createEmbed(embedOptions?: Partial<Embeds>, noFields?: boolean): EmbedBuilder;
  /**
   * Retrieves dashboard overview metrics, live sessions, and leaderboard data for Web Dashboards.
   */
  getDashboardOverview(): Promise<DashboardOverview>;
  /**
   * Dispatches a cross-platform move from Web Dashboard, REST API, or Discord.
   */
  dispatchCrossPlatformMove(sessionId: string, move: CrossPlatformMove): Promise<BridgeMoveResult>;
  /**
   * Registers an external or hybrid game session with the cross-platform bridge.
   */
  registerCrossPlatformSession(session: BridgeSession): void;
}
/**
 * Universal game context accepting either Slash Commands / Button Interactions or Prefix Messages.
 */
export type GameContextInput = ChatInputCommandInteraction | ButtonInteraction | Message | any;
/**
 * Customizable Embed specifications compatible with Discord.js and Components V2.
 */
export interface Embeds {
  color?: ColorResolvable;
  title?: string;
  url?: string;
  author?: Author;
  footer?: EmbedFooterData;
  description?: string;
  fields?: Fields[];
  image?: string;
  timestamp?: Date | boolean;
  thumbnail?: string;
}
export interface Author {
  name: string;
  icon_url?: string;
  url?: string;
}
export interface Fields {
  name: string;
  value: string;
  inline?: boolean;
}
/**
 * Legacy wrapper type preserved for backwards compatibility with earlier versions.
 */
export type CustomOptions<T> = T & {
  context: {
    channel: GuildTextBasedChannel;
    guild: NonNullable<any>;
  };
};
/**
 * Common configuration options shared by all games.
 */
export interface BaseGameOptions {
  /** The Discord Interaction or Message context */
  context: GameContextInput;
  /** Custom embed/container styling */
  embed?: Partial<Embeds>;
  /** Timeout in milliseconds before game expires */
  time?: number;
  /** Message displayed when an unauthorized user clicks a game button */
  othersMessage?: string;
}
/**
 * 2048 Game Options
 */
export interface Types2048 extends BaseGameOptions {
  emojis?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
  loadingMessage?: string;
  activeMessage?: string;
  wonMessage?: string;
  gameoverMessage?: string;
  quitMessage?: string;
  timeoutMessage?: string;
  errorMessage?: string;
  quitButton?: string;
}
/**
 * Scientific Calculator Options
 */
export interface CalcTypes extends BaseGameOptions {
  invalidQuery?: string;
  disabledQuery?: string;
  operationTitles?: {
    logarithm?: string;
    squareRoot?: string;
    round?: string;
    sine?: string;
    cosine?: string;
    tangent?: string;
    naturalLogarithm?: string;
    reciprocal?: string;
    factorial?: string;
  };
  oporationLabels?: {
    logarithm?: string;
    squareRoot?: string;
    round?: string;
    sine?: string;
    cosine?: string;
    tangent?: string;
    naturalLogarithm?: string;
    reciprocal?: string;
    factorial?: string;
  };
  errorMessages?: {
    invalidCalculation?: string;
    infiniteResult?: string;
    largeResult?: string;
  };
  modals?: {
    display?: string;
    labels?: string;
    noPromptYet?: string;
  };
  sessionEndMessage?: string;
}
/**
 * Chaos Words Game Options
 */
export interface ChaosTypes extends BaseGameOptions {
  words?: string[];
  maxWords?: number;
  maxTries?: number;
  charCount?: number;
  charGenerated?: number;
  cancelButton?: string;
  buttonText?: string;
  failedFetchMessage?: string;
  wordAlreadyFound?: string;
  correctWord?: string;
  wrongWord?: string;
  winMessage?: string;
  loseMessage?: string;
  states?: {
    active?: string;
    correct?: string;
    wrong?: string;
    repeat?: string;
    won?: {
      winMessage?: string;
      winContent?: string;
    };
    lost?: {
      loseMessage?: string;
      loseContent?: string;
    };
    timeout?: string;
    cancelled?: string;
    chaosString?: string;
    wordsFound?: {
      main?: string;
      noneYet?: string;
    };
    missingWords?: string;
    tries?: string;
    timeRemaining?: string;
  };
}
/** Alias for ChaosTypes */
export type ChaosWordsTypes = ChaosTypes;
/**
 * Fast Type Game Options
 */
export interface FastTypeTypes extends BaseGameOptions {
  sentence?: string;
  difficulty?: "easy" | "medium" | "hard";
  checkCheating?: boolean;
  cancelButton?: string;
  buttonText?: string;
  cancelMessage?: string;
  winMessage?: string;
  loseMessage?: string;
  timeoutMessage?: string;
  cheatMessage?: string;
  failedFetchError?: string;
  states?: {
    loading?: string;
    active?: string;
    won?: string;
    lost?: string;
    cheat?: string;
    timeout?: string;
    cancelled?: string;
    error?: {
      main?: string;
      details?: string;
    };
  };
}
/**
 * Fight Minigame Power-Up Configuration
 */
export interface FightPowerUp {
  id: string;
  label: string;
  style?: ButtonStyle;
  cost: number;
  effectMessage?: string;
  replyMessage?: string;
  description?: string;
}
/**
 * Fight Game Options
 */
export interface FightTypes extends BaseGameOptions {
  opponent?: GuildMember | User;
  ai?: boolean;
  boss?: "dragon" | "cyber_knight" | "shadow_goblin";
  startHealth?: number;
  damageMax?: number;
  coins?: number;
  buttons?: {
    hit?: string;
    heavy?: string;
    heal?: string;
    cancel?: string;
    accept?: string;
    deny?: string;
  };
  powerups?: {
    doubleDamage?: {
      label?: string;
      effectMessage?: string;
      replyMessage?: string;
    };
    shield?: {
      label?: string;
      effectMessage?: string;
      replyMessage?: string;
    };
    healBoost?: {
      label?: string;
      replyMessage?: string;
    };
  };
  states?: {
    request?: string;
    active?: string;
    won?: string;
    surrender?: string;
    deny?: string;
    timeout?: string;
    error?: {
      main?: string;
      uknownError?: string;
    };
  };
  failedRequestCardGeneration?: string;
  notEnoughtCoins?: string;
  wrongUserFight?: string;
  opponentsTurnMessage?: string;
  highHealthMessage?: string;
  lowHealthMessage?: string;
  cannotFightYourselfMessage?: string;
  playerAlreadyInFight?: string;
}
/** Legacy powerup interface */
export interface PowerUp {
  id: string;
  label?: string;
  name?: string;
  description?: string;
  style?: ButtonStyle;
  cost?: number;
  effect?: (player: PlayerData, playerUsername: string) => string;
}
/** Legacy player data interface */
export interface PlayerData {
  memberId?: string;
  id?: string;
  username?: string;
  name?: string;
  health: number;
  maxHealth?: number;
  lastAttack?: string;
  coins?: number;
  skipNextTurn?: boolean;
  activeEffects?: string[];
  specialButtons?: string[];
  powerUps?: PowerUp[];
}
/**
 * Guess The Number Options
 */
export interface GuessTheNumberTypes extends BaseGameOptions {
  number?: number;
  min?: number;
  max?: number;
  publicGame?: boolean;
  publicMode?: boolean;
  giveUpButton?: string;
  button?: string;
  ongoingMessage?: string;
  winMessage?: {
    publicGame?: string;
    privateGame?: string;
  } | string;
  loseMessage?: string;
  bigNumber?: string;
  biggerNumberMessage?: string;
  smallNumber?: string;
  smallerNumberMeesage?: string;
  otherMessage?: string;
  states?: {
    active?: string;
    higher?: string;
    lower?: string;
    won?: string;
    lost?: string;
  };
}
/**
 * Guess The Pokemon Options
 */
export interface GuessThePokemonTypes extends BaseGameOptions {
  pokemon?: PokemonEntry;
  giveUpButton?: string;
  winMessage?: string;
  loseMessage?: string;
  incorrectMessage?: string;
  thinkMessage?: string;
  states?: {
    loading?: string;
    active?: string;
    wrong?: string;
    won?: string;
    lost?: string;
    error?: string;
  };
}
export interface GuessThePokemonData {
  name: string;
  sprites?: {
    other?: {
      home?: {
        front_default?: string;
      };
    };
  };
}
/**
 * Hangman Game Options
 */
export interface HangmanTypes extends BaseGameOptions {
  word?: string;
  category?: string;
  maxMistakes?: number;
  quitButton?: string;
  states?: {
    loading?: string;
    active?: string;
    won?: string;
    lost?: string;
    quit?: string;
    timeout?: string;
    error?: {
      main?: string;
      unknownError?: string;
    };
  };
  errors?: {
    failedToStart?: string;
    connectionError?: string;
  };
}
/**
 * Lie Swatter Options
 */
export interface LieSwatterTypes extends BaseGameOptions {
  statement?: string;
  isTrue?: boolean;
  explanation?: string;
  buttons?: {
    true?: string;
    lie?: string;
  };
  winMessage?: string;
  loseMessage?: string;
  thinkMessage?: string;
  timesUpMessage?: string;
  states?: {
    loading?: string;
    active?: string;
    won?: string;
    lost?: string;
    error?: string;
  };
}
/**
 * Never Have I Ever Options
 */
export interface NeverHaveIEverTypes extends BaseGameOptions {
  statement?: string;
  buttons?: {
    optionA?: string;
    optionB?: string;
  };
  thinkMessage?: string;
  states?: {
    loading?: string;
    active?: string;
    yes?: string;
    no?: string;
    timeout?: string;
    error?: string;
  };
  errors?: {
    failedFetch?: string;
    noResult?: string;
  };
}
/**
 * Quick Click Options
 */
export interface QuickClickTypes extends BaseGameOptions {
  buttonCount?: number;
  minDelay?: number;
  maxDelay?: number;
  emoji?: string;
  waitMessage?: string;
  startMessage?: string;
  winMessage?: string;
  loseMessage?: string;
  ongoingMessage?: string;
  errors?: {
    main?: string;
    gameAlreadyRunning?: string;
  };
  states?: {
    waiting?: string;
    active?: string;
    won?: string;
    lost?: string;
  };
}
/**
 * Shuffle Guess Options
 */
export interface ShuffleGuessTypes extends BaseGameOptions {
  word?: string;
  buttons?: {
    reshuffle?: string;
    cancel?: string;
  };
  mainContent?: string;
  winMessage?: string;
  loseMessage?: string;
  startMessage?: string;
  incorrectMessage?: string;
}
/**
 * Snake Point Interface
 */
export interface Point {
  x: number;
  y: number;
}
/**
 * Retro Snake Options
 */
export interface SnakeTypes extends BaseGameOptions {
  gridSize?: number;
  emojis?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
  quitButton?: string;
  states?: {
    loading?: string;
    active?: string;
    gameover?: string;
    quit?: string;
    timeout?: string;
    error?: {
      main?: string;
      unknownError?: string;
    };
  };
  errors?: {
    couldNotCreateGame?: string;
    failedToGenerateBoard?: string;
    connectionError?: string;
  };
}
export interface SnakeGameTypes {
  gameID: string;
  playerID: string;
  username: string;
  score: number;
  snake: Point[];
  food: Point;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  gridSize: number;
  gameOver: boolean;
}
/**
 * Will You Press The Button Options
 */
export interface WillYouPressTheButtonTypes extends BaseGameOptions {
  perk?: string;
  consequence?: string;
  button?: {
    yes?: string;
    no?: string;
  };
  buttons?: {
    yes?: string;
    no?: string;
  };
  yesPress?: string;
  noPress?: string;
  thinkMessage?: string;
  states?: {
    loading?: string;
    active?: string;
    result?: string;
    timeout?: string;
    error?: string;
  };
}
export interface DilemmaData {
  id: string;
  url: string;
  question: string;
  result: string;
  stats: {
    yes: {
      percentage: string;
      count: string;
    };
    no: {
      percentage: string;
      count: string;
    };
  };
}
/** Alias for WillYouPressTheButtonTypes */
export type WYPTBTypes = WillYouPressTheButtonTypes;
/**
 * Would You Rather Options
 */
export interface WouldYouRatherTypes extends BaseGameOptions {
  optionA?: string;
  optionB?: string;
  buttonA?: string;
  buttonB?: string;
  buttons?: {
    optionA?: string;
    optionB?: string;
  };
  thinkMessage?: string;
  states?: {
    loading?: string;
    active?: string;
    result?: string;
    timeout?: string;
    error?: string;
  };
}
/** Alias for WouldYouRatherTypes */
export type WYRTypes = WouldYouRatherTypes;
/**
 * Rock Paper Scissors Options
 */
export interface RPSTypes extends BaseGameOptions {
  opponent?: GuildMember | User;
  difficulty?: "easy" | "medium" | "hard";
  buttons?: {
    rock?: string;
    paper?: string;
    scissors?: string;
    accept?: string;
    deny?: string;
  };
}
/**
 * Tic Tac Toe Options
 */
export interface TicTacToeTypes extends BaseGameOptions {
  opponent?: GuildMember | User;
  ai?: boolean;
  difficulty?: "easy" | "medium" | "hard" | "unbeatable";
  emojis?: {
    x?: string;
    o?: string;
    blank?: string;
  };
}
/**
 * Legacy bot usage data interface
 */
export interface BotDataTypes {
  botID: string;
  botName: string;
  secretKey: string;
  usage: {
    minigames: Record<string, number>;
    inits: number;
    totalRequests: number;
  };
}
/**
 * Internal interface for minigame lifecycle
 */
export interface IMinigame {
  id: string;
  start(): Promise<any>;
  destroy(): void;
  onInteraction?(interaction: Interaction): Promise<void> | void;
  onMessage?(message: Message): Promise<void> | void;
  onTypingStart?(typing: any): Promise<void> | void;
}
type ComponentBuilderType = ActionRowBuilder<any> | ContainerBuilder | any;
interface ContextSendOptions {
  content?: string;
  embeds?: EmbedBuilder[];
  components?: ComponentBuilderType[];
  files?: (AttachmentBuilder | Buffer | {
    attachment: Buffer | string;
    name?: string;
  })[];
  flags?: MessageFlags | number;
}
export declare class ContextAdapter {
  raw: GameContextInput;
  user: User;
  userId: string;
  member: GuildMember | null;
  guild: Guild | null;
  channel: TextBasedChannel;
  client: Client;
  isInteraction: boolean;
  isMessage: boolean;
  gameMessage: Message | null;
  constructor(context: GameContextInput);
  static from(context: GameContextInput): ContextAdapter;
  /**
   * Resolves appropriate message flags, ensuring MessageFlags.IsComponentsV2
   * is automatically attached whenever ContainerBuilder is present.
   */
  private resolveFlags;
  /**
   * Sends the initial game interface message.
   * Handles interaction replies (using withResponse: true), deferred states, and message channels transparently.
   */
  sendInitial(options: ContextSendOptions): Promise<Message>;
  /**
   * Updates the game message safely with Components V2 support.
   */
  edit(options: ContextSendOptions): Promise<void>;
  /**
   * Sends an ephemeral reply to an interaction if a non-player attempts to interact.
   * Uses modern flags: MessageFlags.Ephemeral instead of deprecated ephemeral: true.
   */
  static replyEphemeral(interaction: any, content: string): Promise<void>;
  /**
   * Safely deletes the game message.
   */
  delete(): Promise<void>;
}
export declare abstract class BaseGame<T extends BaseGameOptions> implements IMinigame {
  id: string;
  gameKey: string;
  ctx: ContextAdapter;
  options: T;
  manager: any;
  isActive: boolean;
  defaultColor: number;
  protected startTime: number;
  protected timeoutTimer: NodeJS.Timeout | null;
  protected defaultTimeout: number;
  constructor(manager: any, options: T, gameKey: string);
  abstract start(): Promise<any>;
  /**
   * Safely resolves a color according to the hierarchy:
   * 1. Explicit override color passed
   * 2. options.embed.color
   * 3. manager.embedColor
   * 4. fallback color
   */
  resolveColor(color?: ColorResolvable | string | number | null, fallback?: number): number;
  /**
   * Resets the inactivity timeout.
   */
  protected resetTimeout(callback?: () => void, customMs?: number): void;
  /**
   * Safely clears the timeout timer.
   */
  protected clearTimer(): void;
  /**
   * Default timeout handler. Can be overridden by subclasses.
   */
  protected onTimeout(): void;
  /**
   * Helper to construct a Components V2 ContainerBuilder with accent color.
   * If the user provided an embed.color, it is strictly prioritized across all states.
   */
  createContainer(stateAccentColor?: number): ContainerBuilder;
  /**
   * Helper to construct a Components V2 MediaGalleryBuilder for attachments.
   */
  protected createMediaGallery(attachmentUrlOrName: string): MediaGalleryBuilder;
  /**
   * Applies custom embed properties (author, description, fields, footer, timestamp)
   * to markdown text displayed inside a Components V2 Container.
   */
  applyEmbedDecorations(container: ContainerBuilder, content: string): string;
  /**
   * Emits the gameStart lifecycle event on WekyManager and registers session with the bridge.
   */
  protected emitStart(): void;
  /**
   * Emits the gameOver lifecycle event on WekyManager and updates the bridge session.
   */
  protected emitEnd(outcome: string, score?: number): void;
  /**
   * Emits the gameError lifecycle event on WekyManager.
   */
  protected emitError(error: any): void;
  /**
   * Standardized Embed builder for backwards compatibility.
   */
  protected createEmbed(description?: string, titleOverride?: string): EmbedBuilder;
  /**
   * Checks if the interacting user is the game owner. If not, replies with othersMessage.
   */
  protected isAuthorized(interaction: Interaction, allowedUserIds?: string[]): boolean;
  /**
   * Terminates and cleans up the minigame instance.
   */
  destroy(): void;
  onInteraction?(interaction: Interaction): Promise<void> | void;
  onMessage?(message: Message): Promise<void> | void;
  onTypingStart?(typing: any): Promise<void> | void;
}
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
  };
  /**
   * Performs a combat action for a fighter.
   */
  performAction(action: "hit" | "heavy" | "heal" | "shield" | "double" | "surrender", playerId: string): {
    success: boolean;
    message: string;
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
export type { ArcadeGameEntry, ArcadeHubCustomTexts, ArcadeHubOptions, BossProfile, BracketMatch, BracketParticipant, BracketRenderOptions, BridgeMoveResult, BridgePlayer, BridgeSession, CalculatorState, ContextSendOptions, CrossPlatformMove, CustomPointingMatchContext, CustomPointingMatchHandler, CustomPointingScoreContext, CustomPointingScoreHandler, DashboardOverview, EloChangeResult, EvaluationResult, FightCardCustomTexts, FightEngineOptions, FightPlayerInfo, FightState, Game2048EngineOptions, Game2048State, GrandFinalsSession, HangmanEngineOptions, HangmanState, LeaderboardCustomTexts, LeaderboardEntry, LeaderboardManagerOptions, LeaderboardPlayer, LeaderboardPointingOptions, LeaderboardStorageAdapter, ManualMatchInput, ManualTournamentOptions, RenderLeaderboardOptions, RenderShareCardOptions, ShareCardCustomTexts, ShareCardStat, SnakeEngineOptions, SnakeState, SoundboardConfig, TicTacToeDifficulty, TicTacToeEngineOptions, TicTacToeState, TournamentCustomTexts, TournamentMatchSession, TournamentOptions, WekyManagerOptions };
//# sourceMappingURL=index.d.cts.map