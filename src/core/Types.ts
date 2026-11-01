import type { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, EmbedFooterData, GuildMember, GuildTextBasedChannel, Interaction, Message, User } from "discord.js";
import type { PokemonEntry } from "../data/pokemons.js";

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
  winMessage?:
    | {
        publicGame?: string;
        privateGame?: string;
      }
    | string;
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
    yes: { percentage: string; count: string };
    no: { percentage: string; count: string };
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

export type { WekyManagerOptions } from "./WekyManager.js";
export type { ArcadeHubOptions, ArcadeGameEntry, ArcadeHubCustomTexts } from "../hub/ArcadeHub.js";
export type { TournamentOptions } from "../tournament/TournamentManager.js";
export type { BracketParticipant, BracketMatch, BracketRenderOptions } from "../tournament/RenderBracket.js";
export type { LeaderboardPlayer, EloChangeResult, LeaderboardStorageAdapter, LeaderboardManagerOptions } from "../leaderboard/LeaderboardManager.js";
export type { LeaderboardEntry, RenderLeaderboardOptions } from "../canvas/RenderLeaderboard.js";
export type { ShareCardStat, RenderShareCardOptions } from "../canvas/RenderShareCard.js";
export type { SoundboardConfig, SoundboardPlayOptions, SoundboardPlayResult, DashboardSoundEntry } from "../soundboard/SoundboardManager.js";
