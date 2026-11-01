/**
 * Strongly-Typed Event Payloads and Event Map for WekyManager.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { GuildMember, Interaction, User } from "discord.js";

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
  p1: { id: string; username: string; avatarUrl?: string };
  /** Player 2 details */
  p2: { id: string; username: string; avatarUrl?: string };
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
  champion?: { id: string; username: string; avatarUrl?: string };
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

export interface DashboardSoundEvent {
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
  dashboardSound: [event: DashboardSoundEvent];
}

