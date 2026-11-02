import http from "node:http";
import { BridgeAction, BridgePackageRouter, BridgeRequest, BridgeResponse, M3rcenaBridge } from "@m3rcena/bridge";
import { ActionRowBuilder, AttachmentBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Client, ColorResolvable, ContainerBuilder, EmbedBuilder, EmbedFooterData, Guild, GuildMember, GuildTextBasedChannel, Interaction, MediaGalleryBuilder, Message, MessageFlags, TextBasedChannel, User } from "discord.js";
import { EventEmitter } from "events";
import { EventEmitter as EventEmitter$1 } from "node:events";
interface PokemonData {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
  imageUrl: string;
}
type PokemonEntry = PokemonData;
declare const POPULAR_POKEMONS: PokemonData[];
declare function fetchRandomPokemon(): Promise<PokemonData>;
/**
 * Global Event Multiplexer.
 * Attaches a single listener to the Discord Client to dispatch events to all active minigames
 * without triggering EventEmitter MaxListenersExceeded warnings or memory leaks.
 */
declare class EventManager {
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
interface GameStartEvent {
  /** The minigame key (e.g. "fight", "tictactoe", "snake", "tournament") */
  game: string;
  /** The Discord user who started the game */
  user: User | GuildMember;
  /** The channel ID where the game was launched */
  channelId?: string;
  /** Timestamp when game started */
  timestamp: number;
}
interface GameOverEvent {
  /** The minigame key */
  game: string;
  /** The Discord user who played */
  user: User | GuildMember;
  /** Game outcome string (e.g. "WIN", "LOSE", "won", "lost", "tie", "timeout", "aborted", "finished") */
  outcome: string;
  /** Score or final points achieved */
  score: number;
  /** Duration of the game in milliseconds */
  timeElapsed: number;
  /** Timestamp when game finished */
  timestamp: number;
  /** Optional winner participant */
  winner?: any;
  /** Optional loser participant */
  loser?: any;
  [key: string]: any;
}
interface GameErrorEvent {
  /** The minigame key */
  game: string;
  /** The error object or reason */
  error: any;
  /** Context adapter or interaction context */
  context?: any;
}
interface UnauthorizedClickEvent {
  /** The minigame key */
  game: string;
  /** The user who attempted the unauthorized button click */
  user: User;
  /** The Discord interaction */
  interaction: Interaction;
}
interface LeaderboardUpdateEvent {
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
interface TournamentMatchEvent {
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
interface TournamentEndEvent {
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
interface CrossPlatformMoveEvent {
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
interface BridgeSyncEvent {
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
interface DashboardSoundEvent {
  /** Session ID if associated with an active game session */
  sessionId?: string;
  /** Minigame key (e.g. "fight", "snake", "2048") */
  game?: string;
  /** Primary user ID playing or triggering the action */
  userId?: string;
  /** Username of the primary player */
  username?: string;
  /** Target user IDs who should hear this sound on their dashboard (e.g. player and opponent in PvP) */
  targetUserIds?: string[];
  /** Audio cue key (e.g. "victory", "defeat", "action", "hit", "heal", "eat") */
  soundKey: string;
  /** MP3 audio URL */
  soundUrl: string;
  /** Playback volume between 0.0 and 1.0 */
  volume: number;
  /** Event timestamp */
  timestamp: number;
}
/**
 * Type-safe map associating WekyManager event names with their exact parameter tuples.
 */
interface WekyEvents {
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
  dashboardSound: [event: DashboardSoundEvent];
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
declare class ContextAdapter {
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
declare abstract class BaseGame<T extends BaseGameOptions> implements IMinigame {
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
   * Returns a serializable representation of current game state for Bridge/Dashboard sync.
   */
  getSerializableState?(): any;
  /**
   * Handles an incoming cross-platform action dispatched from the Bridge/Dashboard.
   */
  handleCrossPlatformMove?(move: any): Promise<any> | any;
  /**
   * Synchronizes current game state with the bridge and connected dashboards.
   */
  syncBridgeState(customState?: any): void;
  /**
   * Emits the gameStart lifecycle event on WekyManager and registers session with the bridge.
   */
  protected emitStart(): void;
  /**
   * Emits the gameOver lifecycle event on WekyManager and updates the bridge session.
   */
  protected emitEnd(outcome: string, score?: number, extra?: Record<string, any>): void;
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
interface ArcadeHubCustomTexts {
  /** Custom description text for main arcade screen */
  description?: string;
  /** Select menu placeholder (default: "🎮 Select a Minigame to Launch...") */
  selectPlaceholder?: string;
  /** Label for random game button (default: "🎲 Surprise Me (Random Game)") */
  randomButton?: string;
  /** Label for close button (default: "❌ Close Arcade") */
  closeButton?: string;
  /** Notice shown when closed by user */
  closedNotice?: string;
  /** Notice shown when expired due to inactivity */
  expiredNotice?: string;
  /** Setup screen title template (default: "🕹️ Match Setup: {game}") */
  setupTitle?: string;
  /** Setup screen description text */
  setupDescription?: string;
  /** Start button label on setup screen (default: "▶️ Launch Game") */
  startButton?: string;
  /** Back button label on setup screen (default: "◀️ Back to Cabinet") */
  backButton?: string;
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
  /**
   * Game-specific options and text customizations passed down to minigames
   * when launched from the Arcade Hub.
   *
   * Example:
   * ```typescript
   * gameOptions: {
   *   tictactoe: { difficulty: "unbeatable", texts: { playerTurn: "Your move!" } },
   *   fight: { boss: "dragon", startHealth: 200 },
   *   snake: { gridSize: 18 }
   * }
   * ```
   */
  gameOptions?: Record<string, any>;
  /**
   * When true, displays an interactive setup screen (difficulty, opponent, boss, mode)
   * with buttons before launching the selected game.
   */
  configureBeforeLaunch?: boolean;
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
declare const ARCADE_GAMES: ArcadeGameEntry[];
declare class ArcadeHub extends BaseGame<ArcadeHubOptions> {
  private btnPrefix;
  private selectMenuId;
  private state;
  private pendingGameKey?;
  private pendingConfig;
  constructor(manager: any, options: ArcadeHubOptions);
  start(): Promise<void>;
  onInteraction(interaction: Interaction): Promise<void>;
  private openConfigScreen;
  private launchGame;
  private endHub;
  private createHubContainer;
  private createConfigContainer;
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
declare class RenderBracket {
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
declare class TournamentManager extends BaseGame<TournamentOptions> {
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
declare class RenderLeaderboard {
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
declare class RenderShareCard {
  static render(options: RenderShareCardOptions): Promise<Buffer>;
}
interface DashboardSoundEntry {
  key: string;
  name: string;
  category: "general" | "victory" | "defeat" | "combat" | "retro";
  url: string;
  description: string;
}
interface SoundboardConfig {
  /** Whether dashboard soundboard playback is enabled (default: true) */
  enabled?: boolean;
  /** Default playback volume between 0.0 and 1.0 (default: 0.8) */
  volume?: number;
  /** Custom developer MP3 URLs or relative asset paths mapped to sound event keys */
  sounds?: Record<string, string>;
  /**
   * When enabled, soundboard audio events will only be triggered and emitted if the player
   * (or at least one target player) is verified as actively online on the web dashboard.
   * If players are only interacting inside Discord text channels without an open dashboard tab, the sound is skipped.
   * (default: false)
   */
  requireActiveDashboardUser?: boolean;
}
interface SoundboardPlayOptions {
  /** Volume override for this playback event (0.0 to 1.0) */
  volume?: number;
  /** Associated bridge session ID */
  sessionId?: string;
  /** Associated minigame key */
  game?: string;
  /** Primary user ID playing or triggering the action */
  userId?: string;
  /** Username of the primary player */
  username?: string;
  /** Target user IDs who should hear this sound on their dashboard (e.g. player and opponent in PvP) */
  targetUserIds?: string[];
  [key: string]: any;
}
interface SoundboardPlayResult {
  success: boolean;
  soundKey?: string;
  soundUrl?: string;
  volume?: number;
  platform: "dashboard";
  error?: string;
}
/** Built-in high-quality MP3 audio library for Web Dashboards */
declare const DEFAULT_DASHBOARD_SOUNDS: Record<string, DashboardSoundEntry>;
/** Backwards-compatible alias */
declare const DEFAULT_DISCORD_SOUNDS: {
  id: string;
  name: string;
  emoji: string;
}[];
declare class SoundboardManager {
  private client;
  private config;
  private activeDashboardUsers;
  wekyManager?: any;
  constructor(client: Client, config?: SoundboardConfig, wekyManager?: any);
  /**
   * Returns whether dashboard audio is enabled.
   */
  get isEnabled(): boolean;
  /**
   * Returns default playback volume (0.0 to 1.0).
   */
  get volume(): number;
  /**
   * Retrieves the MP3 sound URL for a given event key.
   * If a custom URL was provided in config, it takes precedence over built-in defaults.
   */
  getSoundUrl(soundKey: string): string;
  /**
   * Retrieves a registered sound entry by key.
   */
  getSound(soundKey: string): DashboardSoundEntry | undefined;
  /**
   * Returns all available sound entries as a dictionary.
   */
  getAllSounds(): Record<string, DashboardSoundEntry>;
  /**
   * Generates a lightweight JSON manifest of all MP3 audio tracks for Web Dashboards.
   */
  getAudioManifest(): Record<string, {
    name: string;
    url: string;
    category: string;
  }>;
  /**
   * Returns the directory path containing the bundled MP3 audio files.
   * Useful for web servers (Express/Fastify/Next.js) serving static audio files.
   */
  getSoundsDirectory(): string;
  /**
   * Returns the local file path for an MP3 audio asset if it exists on disk.
   */
  getLocalSoundPath(soundKey: string): string;
  /**
   * Registers or unregisters a user as actively connected/present on the web dashboard.
   * Web dashboards can invoke this via WebSockets/SSE to notify Weky that a user is actively listening.
   */
  setDashboardUserOnline(userId: string, isOnline?: boolean): void;
  /**
   * Checks whether a specific user is currently active/online on the web dashboard.
   */
  isUserOnDashboard(userId: string): boolean;
  /**
   * Returns an array of user IDs currently registered as active on the web dashboard.
   */
  getActiveDashboardUsers(): string[];
  /**
   * Clears all registered active dashboard users.
   */
  clearActiveDashboardUsers(): void;
  /**
   * Triggers a dashboard audio sound cue, dispatching a `dashboardSound` lifecycle event.
   * If `requireActiveDashboardUser: true` is configured, sounds will only be triggered if
   * the player (or one of the target users) is currently active on the web dashboard.
   */
  triggerSound(soundKey: string, meta?: SoundboardPlayOptions): DashboardSoundEvent | null;
  /**
   * Returns a ready-to-use HTML/JavaScript client-side script snippet that web dashboards
   * can include to automatically play MP3 sounds on user interactions and WebSocket events.
   */
  generateDashboardAudioScript(options?: {
    autoPlay?: boolean;
    defaultVolume?: number;
  }): string;
  /**
   * Safely plays a soundboard sound for dashboards.
   * Fully backwards compatible with existing minigame call sites.
   */
  playSoundWithResult(channelOrKey: string, soundTypeOrId?: string, options?: SoundboardPlayOptions | string): Promise<SoundboardPlayResult>;
  /**
   * Safely plays a soundboard sound.
   */
  playSound(channelOrKey: string, soundTypeOrId?: string, options?: SoundboardPlayOptions | string): Promise<boolean>;
  /**
   * Backwards-compatible stubs for previous voice channel controls.
   */
  isConnectedTo(): boolean;
  joinVoice(): Promise<null>;
  leaveVoice(): boolean;
  destroy(): void;
}
interface GameRewardRule {
  /** Flat coins awarded on victory */
  winReward?: number;
  /** Flat coins deducted on defeat */
  lossPenalty?: number;
  /** Flat coins awarded on draw / tie */
  drawReward?: number;
  /** Multiplier for solo points/score (e.g. 0.05 means 1000 score = 50 coins) */
  scoreMultiplier?: number;
  /** Maximum coins allowed from score multiplier */
  maxScoreReward?: number;
  /** Bonus coins awarded per win streak count */
  streakBonus?: number;
}
interface WagerRecord {
  id: string;
  player1Id: string;
  player2Id: string;
  amount: number;
  totalPot: number;
  guildId?: string;
  game?: string;
  createdAt: number;
  status: "active" | "resolved" | "refunded";
  winnerId?: string;
}
interface WagerCreateResult {
  success: boolean;
  wager?: WagerRecord;
  reason?: string;
  failedUserId?: string;
}
interface WekyEcoConnectorOptions {
  /** Default flat coins awarded on victory (default: 50) */
  defaultWinReward?: number;
  /** Default flat coins deducted on defeat (default: 0) */
  defaultLossPenalty?: number;
  /** Default flat coins awarded on tie/draw (default: 10) */
  defaultDrawReward?: number;
  /** Default multiplier applied to solo score (default: 0.05) */
  defaultScoreMultiplier?: number;
  /** Maximum coins awarded from score in a single game (default: 500) */
  maxScoreReward?: number;
  /** Bonus coins awarded per active win streak count (default: 5) */
  streakBonus?: number;
  /** Tournament champion cash prize (default: 500) */
  tournamentChampionPrize?: number;
  /** Tournament runner-up cash prize (default: 200) */
  tournamentRunnerUpPrize?: number;
  /** House fee percentage taken from PvP wager pots (0 - 100, default: 0) */
  wagerHouseFee?: number;
  /** Specific per-game rule overrides */
  games?: Record<string, GameRewardRule>;
  /** Whether automatic rewards on gameOver are enabled (default: true) */
  autoReward?: boolean;
}
interface RewardDistributionResult {
  userId: string;
  game: string;
  outcome: "WIN" | "LOSE" | "DRAW" | "SCORE" | "TOURNAMENT";
  amount: number;
  newBalance: number;
  reason: string;
  streakBonus?: number;
  scoreBonus?: number;
  wagerWon?: number;
}
interface WagerResolvedEvent {
  wager: WagerRecord;
  winnerId: string;
  loserId: string;
  payout: number;
  houseFee: number;
}
interface WagerRefundedEvent {
  wager: WagerRecord;
  reason: string;
}
/**
 * Type-safe map of events emitted by WekyEcoConnector.
 */
interface WekyEcoConnectorEvents {
  wagerCreated: [wager: WagerRecord];
  wagerResolved: [event: WagerResolvedEvent];
  wagerRefunded: [event: WagerRefundedEvent];
  reward: [result: RewardDistributionResult];
  penalty: [result: RewardDistributionResult];
  tournamentReward: [result: RewardDistributionResult];
  error: [error: any];
}
declare class WekyEcoConnector extends EventEmitter$1 {
  readonly weky: WekyManager;
  readonly eco: any;
  options: WekyEcoConnectorOptions;
  private activeWagers;
  private userToWagerMap;
  constructor(weky: WekyManager, eco: any, options?: WekyEcoConnectorOptions);
  on<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  once<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;
  emit<K extends keyof WekyEcoConnectorEvents>(event: K, ...args: WekyEcoConnectorEvents[K]): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;
  off<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  addListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  removeListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
  prependListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
  prependOnceListener<K extends keyof WekyEcoConnectorEvents>(event: K, listener: (...args: WekyEcoConnectorEvents[K]) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
  private initListeners;
  /**
   * Creates and escrows a PvP wager match between two players.
   * Both players must have sufficient wallet balances.
   */
  createWager(params: {
    wagerId: string;
    player1Id: string;
    player2Id: string;
    amount: number;
    guildId?: string;
    game?: string;
  }): Promise<WagerCreateResult>;
  /**
   * Resolves an active wager, awarding the escrowed pot (minus optional house fee) to the winner.
   */
  resolveWager(wagerId: string, winnerId: string): Promise<RewardDistributionResult | null>;
  /**
   * Cancels and refunds an active wager back to both participants.
   */
  refundWager(wagerId: string, reason?: string): Promise<boolean>;
  /**
   * Internal handler for Weky gameOver events.
   */
  private handleGameOver;
  /**
   * Internal handler for Weky tournamentEnd events.
   */
  private handleTournamentEnd;
  /**
   * Fetches user cash balance from the connected EcoManager.
   */
  getUserWallet(userId: string, guildId?: string): Promise<number>;
  /**
   * Credits cash to a user's wallet with cross-package fallback.
   */
  creditWallet(userId: string, amount: number, reason?: string, guildId?: string): Promise<number>;
  /**
   * Deducts cash from a user's wallet with cross-package fallback.
   */
  deductWallet(userId: string, amount: number, reason?: string, guildId?: string): Promise<number>;
  /**
   * Returns all active PvP wager sessions.
   */
  getActiveWagers(): WagerRecord[];
  /**
   * Returns a wager by id.
   */
  getWager(wagerId: string): WagerRecord | undefined;
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
declare class WekyManager extends EventEmitter {
  _client: Client;
  _eventManager: EventManager;
  defaultTimeout: number;
  embedColor?: ColorResolvable;
  unauthorizedMessage?: string;
  notifyUpdates: boolean;
  soundboard: SoundboardManager;
  leaderboard: LeaderboardManager;
  storage?: LeaderboardStorageAdapter;
  bridge: WekyBridge;
  /**
   * Initializes the WekyManager.
   * @param client The Discord.js Client instance.
   * @param options Optional configuration object or legacy notifyUpdates boolean.
   * @param notifyUpdatesParam Legacy parameter for update notifications.
   */
  constructor(client: Client, options?: WekyManagerOptions | string | boolean, notifyUpdatesParam?: boolean);
  /**
   * Connects the Weky minigames engine with @m3rcena/eco.
   * Enables automated coin payouts, streak bonuses, score multipliers, PvP wager bets, and tournament prize pools.
   */
  connectEco(eco: any, connectorOptions?: WekyEcoConnectorOptions): WekyEcoConnector;
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
  prependListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
  prependOnceListener<K extends keyof WekyEvents>(event: K, listener: (...args: WekyEvents[K]) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
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
  /**
   * Package router reference for @m3rcena/bridge mounting.
   */
  get router(): any;
  /**
   * Universal router getter for @m3rcena/bridge.
   */
  toBridgeRouter(): any;
  /**
   * Connects this WekyManager instance with an M3rcenaBridge controller.
   * Enables: weky.connectBridge(bridge) or bridge.use(weky).
   */
  connectBridge(bridge: any): this;
  /**
   * Connects or replaces the dashboard bridge with an M3rcenaBridge instance.
   */
  setBridge(bridge: any): void;
}
/**
 * Universal game context accepting either Slash Commands / Button Interactions or Prefix Messages.
 */
type GameContextInput = ChatInputCommandInteraction | ButtonInteraction | Message | any;
/**
 * Customizable Embed specifications compatible with Discord.js and Components V2.
 */
interface Embeds {
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
interface Author {
  name: string;
  icon_url?: string;
  url?: string;
}
interface Fields {
  name: string;
  value: string;
  inline?: boolean;
}
/**
 * Legacy wrapper type preserved for backwards compatibility with earlier versions.
 */
type CustomOptions<T> = T & {
  context: {
    channel: GuildTextBasedChannel;
    guild: NonNullable<any>;
  };
};
/**
 * Common configuration options shared by all games.
 */
interface BaseGameOptions {
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
interface Types2048 extends BaseGameOptions {
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
interface CalcTypes extends BaseGameOptions {
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
interface ChaosTypes extends BaseGameOptions {
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
type ChaosWordsTypes = ChaosTypes;
/**
 * Fast Type Game Options
 */
interface FastTypeTypes extends BaseGameOptions {
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
interface FightPowerUp {
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
interface FightTypes extends BaseGameOptions {
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
interface PowerUp {
  id: string;
  label?: string;
  name?: string;
  description?: string;
  style?: ButtonStyle;
  cost?: number;
  effect?: (player: PlayerData, playerUsername: string) => string;
}
/** Legacy player data interface */
interface PlayerData {
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
interface GuessTheNumberTypes extends BaseGameOptions {
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
interface GuessThePokemonTypes extends BaseGameOptions {
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
interface GuessThePokemonData {
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
interface HangmanTypes extends BaseGameOptions {
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
interface LieSwatterTypes extends BaseGameOptions {
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
interface NeverHaveIEverTypes extends BaseGameOptions {
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
interface QuickClickTypes extends BaseGameOptions {
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
interface ShuffleGuessTypes extends BaseGameOptions {
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
interface Point {
  x: number;
  y: number;
}
/**
 * Retro Snake Options
 */
interface SnakeTypes extends BaseGameOptions {
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
interface SnakeGameTypes {
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
interface WillYouPressTheButtonTypes extends BaseGameOptions {
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
interface DilemmaData {
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
type WYPTBTypes = WillYouPressTheButtonTypes;
/**
 * Would You Rather Options
 */
interface WouldYouRatherTypes extends BaseGameOptions {
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
type WYRTypes = WouldYouRatherTypes;
/**
 * Rock Paper Scissors Options
 */
interface RPSTypes extends BaseGameOptions {
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
interface TicTacToeTypes extends BaseGameOptions {
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
interface BotDataTypes {
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
interface IMinigame {
  id: string;
  start(): Promise<any>;
  destroy(): void;
  onInteraction?(interaction: Interaction): Promise<void> | void;
  onMessage?(message: Message): Promise<void> | void;
  onTypingStart?(typing: any): Promise<void> | void;
}
/**
 * Universal database storage configuration for @m3rcena/weky.
 * Supports zero-dependency native SQLite (node:sqlite), Prisma ORM, JSON file persistence, or in-memory.
 */
type WekyDatabaseConfig = "sqlite" | "memory" | "json" | {
  type: "sqlite";
  path?: string;
  walMode?: boolean;
} | {
  type: "prisma";
  client: any;
  model?: string;
  autoMigrate?: boolean;
} | {
  type: "json";
  path?: string;
} | {
  type: "memory";
};
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
  /** Database configuration ("sqlite" | "prisma" | "json" | "memory" | object config) */
  database?: WekyDatabaseConfig;
  /** Optional developer-defined custom pointing formula (falls back to standard FIDE ELO if omitted) */
  pointing?: LeaderboardPointingOptions;
  /** Optional reference to WekyManager for event telemetry */
  wekyManager?: any;
}
declare class LeaderboardManager {
  private players;
  defaultElo: number;
  defaultKFactor: number;
  pointing?: LeaderboardPointingOptions;
  storageAdapter?: LeaderboardStorageAdapter;
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
  soundKey?: string;
  soundUrl?: string;
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
declare class WekyBridge {
  private sessions;
  wekyManager?: any;
  m3rcenaBridge: M3rcenaBridge;
  router: WekyBridgeRouter;
  constructor(wekyManager?: any, customBridge?: M3rcenaBridge);
  /**
   * Returns the underlying M3rcenaBridge instance.
   */
  getM3rcenaBridge(): M3rcenaBridge;
  /**
   * Replaces or connects an existing M3rcenaBridge instance.
   */
  setM3rcenaBridge(bridge: M3rcenaBridge): void;
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
  /**
   * Notifies the bridge/soundboard that a user is actively connected on the web dashboard.
   */
  setDashboardUserOnline(userId: string, isOnline?: boolean): void;
  /**
   * Returns whether a user is currently verified as online/active on the web dashboard.
   */
  isUserOnDashboard(userId: string): boolean;
}
declare const WEKY_GAME_CATALOG: {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  category: string;
  controls: string[];
  canvasSupported: boolean;
}[];
declare class WekyBridgeRouter implements BridgePackageRouter {
  name: string;
  basePath: string;
  description: string;
  version: string;
  private bridge;
  constructor(bridge: WekyBridge);
  handleRequest(req: BridgeRequest): Promise<BridgeResponse | null>;
  handleAction(action: BridgeAction): Promise<any>;
}
interface HostWekyOptions {
  port?: number;
  bridgeUrl?: string;
  discordToken?: string;
}
declare function hostWeky(options?: HostWekyOptions): Promise<{
  server: http.Server;
  router: WekyBridgeRouter;
  port: number;
}>;
export { WYRTypes as $, GameStartEvent as $t, FastTypeTypes as A, ManualMatchInput as At, LieSwatterTypes as B, ARCADE_GAMES as Bt, BotDataTypes as C, ShareCardCustomTexts as Ct, CustomOptions as D, RenderLeaderboard as Dt, ChaosWordsTypes as E, LeaderboardEntry as Et, GuessTheNumberTypes as F, TournamentOptions as Ft, QuickClickTypes as G, BaseGame as Gt, PlayerData as H, ArcadeHub as Ht, GuessThePokemonData as I, BracketMatch as It, SnakeGameTypes as J, BridgeSyncEvent as Jt, RPSTypes as K, ContextAdapter as Kt, GuessThePokemonTypes as L, BracketParticipant as Lt, FightPowerUp as M, TournamentCustomTexts as Mt, FightTypes as N, TournamentManager as Nt, DilemmaData as O, RenderLeaderboardOptions as Ot, GameContextInput as P, TournamentMatchSession as Pt, WYPTBTypes as Q, GameOverEvent as Qt, HangmanTypes as R, BracketRenderOptions as Rt, BaseGameOptions as S, RenderShareCardOptions as St, ChaosTypes as T, LeaderboardCustomTexts as Tt, Point as U, ArcadeHubCustomTexts as Ut, NeverHaveIEverTypes as V, ArcadeGameEntry as Vt, PowerUp as W, ArcadeHubOptions as Wt, TicTacToeTypes as X, DashboardSoundEvent as Xt, SnakeTypes as Y, CrossPlatformMoveEvent as Yt, Types2048 as Z, GameErrorEvent as Zt, LeaderboardManagerOptions as _, SoundboardConfig as _t, BridgeMoveResult as a, EventManager as an, GameRewardRule as at, LeaderboardStorageAdapter as b, SoundboardPlayResult as bt, CrossPlatformMove as c, PokemonEntry as cn, WagerRecord as ct, CustomPointingMatchContext as d, WekyEcoConnector as dt, LeaderboardUpdateEvent as en, WekyDatabaseConfig as et, CustomPointingMatchHandler as f, WekyEcoConnectorEvents as ft, LeaderboardManager as g, DashboardSoundEntry as gt, EloChangeResult as h, DEFAULT_DISCORD_SOUNDS as ht, WekyBridgeRouter as i, WekyEvents as in, WekyManagerOptions as it, Fields as j, ManualTournamentOptions as jt, Embeds as k, GrandFinalsSession as kt, DashboardOverview as l, fetchRandomPokemon as ln, WagerRefundedEvent as lt, CustomPointingScoreHandler as m, DEFAULT_DASHBOARD_SOUNDS as mt, hostWeky as n, TournamentMatchEvent as nn, WouldYouRatherTypes as nt, BridgePlayer as o, POPULAR_POKEMONS as on, RewardDistributionResult as ot, CustomPointingScoreContext as p, WekyEcoConnectorOptions as pt, ShuffleGuessTypes as q, ContextSendOptions as qt, WEKY_GAME_CATALOG as r, UnauthorizedClickEvent as rn, WekyManager as rt, BridgeSession as s, PokemonData as sn, WagerCreateResult as st, HostWekyOptions as t, TournamentEndEvent as tn, WillYouPressTheButtonTypes as tt, WekyBridge as u, WagerResolvedEvent as ut, LeaderboardPlayer as v, SoundboardManager as vt, CalcTypes as w, ShareCardStat as wt, Author as x, RenderShareCard as xt, LeaderboardPointingOptions as y, SoundboardPlayOptions as yt, IMinigame as z, RenderBracket as zt };
//# sourceMappingURL=host-Dt3vjAeQ.d.cts.map