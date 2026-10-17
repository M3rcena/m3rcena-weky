import type { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, EmbedFooterData, GuildMember, Interaction, Message, User } from "discord.js";

/**
 * Universal game context accepting either Slash Commands / Button Interactions or Prefix Messages.
 */
export type GameContextInput = ChatInputCommandInteraction | ButtonInteraction | Message | any;

/**
 * Common configuration options shared by all games.
 */
export interface BaseGameOptions {
  /** The Discord Interaction or Message context */
  context: GameContextInput;
  /** Custom embed/container styling */
  embed?: {
    title?: string;
    color?: ColorResolvable;
    footer?: EmbedFooterData;
    timestamp?: boolean | Date;
  };
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
  maxTries?: number;
  charGenerated?: number;
  cancelButton?: string;
  failedFetchMessage?: string;
  wordAlreadyFound?: string;
  correctWord?: string;
  wrongWord?: string;
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

/**
 * Fast Type Game Options
 */
export interface FastTypeTypes extends BaseGameOptions {
  sentence?: string;
  difficulty?: "easy" | "medium" | "hard";
  cancelButton?: string;
  winMessage?: string;
  loseMessage?: string;
  timeoutMessage?: string;
  cheatMessage?: string;
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
  opponent: GuildMember | User;
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
  wrongUserFight?: string;
  opponentsTurnMessage?: string;
  highHealthMessage?: string;
  lowHealthMessage?: string;
  cannotFightYourselfMessage?: string;
  playerAlreadyInFight?: string;
}

/**
 * Guess The Number Options
 */
export interface GuessTheNumberTypes extends BaseGameOptions {
  number?: number;
  min?: number;
  max?: number;
  publicGame?: boolean;
  giveUpButton?: string;
  ongoingMessage?: string;
  winMessage?: {
    publicGame?: string;
    privateGame?: string;
  };
  loseMessage?: string;
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

/**
 * Hangman Game Options
 */
export interface HangmanTypes extends BaseGameOptions {
  word?: string;
  category?: string;
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
    failedToGenerate?: string;
    noApiResponse?: string;
  };
}

/**
 * Lie Swatter Options
 */
export interface LieSwatterTypes extends BaseGameOptions {
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
}

/**
 * Quick Click Options
 */
export interface QuickClickTypes extends BaseGameOptions {
  emoji?: string;
  waitMessage?: string;
  startMessage?: string;
  winMessage?: string;
  loseMessage?: string;
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
 * Snake Game Options
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
}

/**
 * Will You Press The Button Options
 */
export interface WillYouPressTheButtonTypes extends BaseGameOptions {
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

/**
 * Would You Rather Options
 */
export interface WouldYouRatherTypes extends BaseGameOptions {
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

/**
 * Rock Paper Scissors Options
 */
export interface RPSTypes extends BaseGameOptions {
  opponent?: GuildMember | User;
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
  emojis?: {
    x?: string;
    o?: string;
    blank?: string;
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
