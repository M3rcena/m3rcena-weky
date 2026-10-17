import { ChatInputCommandInteraction, ButtonInteraction, Message, ColorResolvable, EmbedFooterData, Interaction, GuildMember, User, ButtonStyle, Guild, TextBasedChannel, Client, EmbedBuilder, ActionRowBuilder, ContainerBuilder, AttachmentBuilder, MessageFlags, MediaGalleryBuilder } from 'discord.js';
import { SKRSContext2D } from '@napi-rs/canvas';

/**
 * Universal game context accepting either Slash Commands / Button Interactions or Prefix Messages.
 */
type GameContextInput = ChatInputCommandInteraction | ButtonInteraction | Message | any;
/**
 * Common configuration options shared by all games.
 */
interface BaseGameOptions {
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
interface FastTypeTypes extends BaseGameOptions {
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
interface GuessTheNumberTypes extends BaseGameOptions {
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
interface GuessThePokemonTypes extends BaseGameOptions {
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
interface HangmanTypes extends BaseGameOptions {
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
interface LieSwatterTypes extends BaseGameOptions {
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
interface QuickClickTypes extends BaseGameOptions {
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
 * Snake Game Options
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
}
/**
 * Will You Press The Button Options
 */
interface WillYouPressTheButtonTypes extends BaseGameOptions {
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
interface WouldYouRatherTypes extends BaseGameOptions {
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
interface RPSTypes extends BaseGameOptions {
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
interface TicTacToeTypes extends BaseGameOptions {
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
interface IMinigame {
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
    ctx: ContextAdapter;
    options: T;
    manager: any;
    isActive: boolean;
    protected timeoutTimer: NodeJS.Timeout | null;
    protected defaultTimeout: number;
    constructor(manager: any, options: T, gameKey: string);
    abstract start(): Promise<any>;
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
     */
    protected createContainer(accentColor?: number): ContainerBuilder;
    /**
     * Helper to construct a Components V2 MediaGalleryBuilder for attachments.
     */
    protected createMediaGallery(attachmentUrlOrName: string): MediaGalleryBuilder;
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

interface WekyManagerOptions {
    /** Optional API key for legacy compatibility */
    apiKey?: string;
    /** Whether to log package notifications */
    notifyUpdates?: boolean;
}
/**
 * Main manager class for the `@m3rcena/weky` Discord minigames engine.
 */
declare class WekyManager {
    _client: Client;
    _eventManager: EventManager;
    /**
     * Initializes the WekyManager.
     * @param client The Discord.js Client instance.
     * @param legacyApiKeyOrOptions Optional API key or config object.
     * @param legacyNotifyUpdates Optional flag for update notifications.
     */
    constructor(client: Client, legacyApiKeyOrOptions?: string | WekyManagerOptions, legacyNotifyUpdates?: boolean);
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
    createRockPaperScissors(options: RPSTypes): Promise<void>;
    /**
     * Starts a new interactive **Tic Tac Toe** match.
     */
    createTicTacToe(options: TicTacToeTypes): Promise<void>;
    _getContextUserID(context: any): string;
    getRandomString(length?: number, prefix?: string): string;
    convertTime(timeMs: number): string;
    shuffleString(str: string): string;
    shuffleArray<T>(arr: T[]): T[];
}

declare class Calculator extends BaseGame<CalcTypes> {
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

declare class ChaosWords extends BaseGame<ChaosTypes> {
    private words;
    private remainingWords;
    private foundWords;
    private chaosArray;
    private chaosString;
    private triesLeft;
    private maxTries;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: ChaosTypes);
    start(): Promise<void>;
    private generateChaosString;
    onInteraction(interaction: Interaction): Promise<void>;
    onMessage(message: Message): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class FastType extends BaseGame<FastTypeTypes> {
    private sentence;
    private startTime;
    private hasTyped;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: FastTypeTypes);
    start(): Promise<void>;
    onTypingStart(typing: any): void;
    onInteraction(interaction: Interaction): Promise<void>;
    onMessage(message: Message): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class Fight extends BaseGame<FightTypes> {
    private opponentUser;
    private opponentMember;
    private phase;
    private p1;
    private p2;
    private currentTurnId;
    private btnPrefix;
    private lastAnnouncement;
    private defaultColor;
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

declare class Game2048 extends BaseGame<Types2048> {
    private board;
    private score;
    private hasWon;
    private isGameOver;
    private gameTitle;
    private defaultColor;
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

declare class GuessTheNumber extends BaseGame<GuessTheNumberTypes> {
    private targetNumber;
    private currentMin;
    private currentMax;
    private attempts;
    private participants;
    private startTime;
    private isPublic;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: GuessTheNumberTypes);
    start(): Promise<void>;
    onInteraction(interaction: Interaction): Promise<void>;
    onMessage(message: Message): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class GuessThePokemon extends BaseGame<GuessThePokemonTypes> {
    private pokemon;
    private btnPrefix;
    private modalId;
    private startTime;
    private gameTitle;
    private defaultColor;
    private giveUpButtonLabel;
    constructor(manager: any, options: GuessThePokemonTypes);
    start(): Promise<void>;
    onInteraction(interaction: Interaction): Promise<void>;
    onMessage(message: Message): Promise<void>;
    private processGuess;
    private endGame;
    private createGameContainer;
}

declare class Hangman extends BaseGame<HangmanTypes> {
    private targetWord;
    private category;
    private displayWord;
    private guessedLetters;
    private wrongGuesses;
    private btnPrefix;
    private modalId;
    private gameTitle;
    private defaultColor;
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

declare class LieSwatter extends BaseGame<LieSwatterTypes> {
    private fact;
    private startTime;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    private labelTrue;
    private labelLie;
    constructor(manager: any, options: LieSwatterTypes);
    start(): Promise<void>;
    onInteraction(interaction: Interaction): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class NeverHaveIEver extends BaseGame<NeverHaveIEverTypes> {
    private statement;
    private haveVoters;
    private neverVoters;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: NeverHaveIEverTypes);
    start(): Promise<void>;
    onInteraction(interaction: Interaction): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class QuickClick extends BaseGame<QuickClickTypes> {
    private targetIndex;
    private btnPrefix;
    private isWaiting;
    private startTime;
    private waitTimer;
    private emoji;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: QuickClickTypes);
    start(): Promise<void>;
    private triggerActiveState;
    onInteraction(interaction: Interaction): Promise<void>;
    private endGame;
    destroy(): void;
    private createGameContainer;
}

declare class RockPaperScissors extends BaseGame<RPSTypes> {
    private opponentUser;
    private isVsBot;
    private p1Move;
    private p2Move;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: RPSTypes);
    start(): Promise<void>;
    onInteraction(interaction: Interaction): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class ShuffleGuess extends BaseGame<ShuffleGuessTypes> {
    private targetWord;
    private scrambled;
    private startTime;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: ShuffleGuessTypes);
    start(): Promise<void>;
    private getValidScramble;
    onInteraction(interaction: Interaction): Promise<void>;
    onMessage(message: Message): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class Snake extends BaseGame<SnakeTypes> {
    private snake;
    private food;
    private direction;
    private gridSize;
    private score;
    private isGameOver;
    private gameTitle;
    private defaultColor;
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

declare class TicTacToe extends BaseGame<TicTacToeTypes> {
    private opponentUser;
    private board;
    private currentTurnId;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    constructor(manager: any, options: TicTacToeTypes);
    start(): Promise<void>;
    onInteraction(interaction: Interaction): Promise<void>;
    private checkWinner;
    private endGame;
    private createGameContainer;
}

declare class WillYouPressTheButton extends BaseGame<WillYouPressTheButtonTypes> {
    private dilemma;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
    private labelYes;
    private labelNo;
    constructor(manager: any, options: WillYouPressTheButtonTypes);
    start(): Promise<void>;
    onInteraction(interaction: Interaction): Promise<void>;
    private endGame;
    private createGameContainer;
}

declare class WouldYouRather extends BaseGame<WouldYouRatherTypes> {
    private dilemma;
    private btnPrefix;
    private gameTitle;
    private defaultColor;
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
interface GameControlItem {
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
interface GameControlRow {
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
declare class RenderFight {
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
    }): Promise<Buffer>;
    /**
     * Renders the dynamic Battle Arena card with health bars, coins, and current turn indicators.
     */
    static renderBattleCard(player1: FightPlayerInfo, player2: FightPlayerInfo, currentTurnUserId: string, announcement?: string): Promise<Buffer>;
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
    }, type?: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT"): Promise<Buffer>;
}

/**
 * Centralized graphics and card generation suite for `@m3rcena/weky`.
 * Ideal for web dashboards, REST APIs, custom UIs, and external webhooks.
 */
declare class WekyCanvas {
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
declare class CalculatorEngine {
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
declare class FightEngine {
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
declare class Game2048Engine {
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
declare class HangmanEngine {
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
declare class SnakeEngine {
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
declare class TicTacToeEngine {
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
declare class WekyEngine {
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

declare class CanvasUtils {
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
}

declare class Render2048 {
    static renderBoard(board: number[][], score: number, username: string, avatarUrl: string, state?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer>;
}

declare class RenderHangman {
    static renderCard(wrongGuessesCount: number, displayWord: string, guessedLetters: string[], username: string, avatarUrl: string, gameOver?: boolean, won?: boolean, fullWord?: string): Promise<Buffer>;
    private static drawWoodenBeam;
    private static drawLimb;
    private static drawX;
}

declare class RenderPokemon {
    static renderCard(pokemon: {
        name: string;
        types: string[];
        abilities: string[];
        imageUrl: string;
        id?: number;
    }, revealed?: boolean): Promise<Buffer>;
}

declare class RenderSnake {
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
declare function getRandomString(length?: number, prefix?: string): string;
/**
 * Converts milliseconds into a clean human-readable duration string.
 * @param ms Duration in milliseconds.
 */
declare function formatTime(ms: number): string;
/**
 * Randomly shuffles characters in a string.
 */
declare function shuffleString(str: string): string;
/**
 * Randomly shuffles an array using Fisher-Yates algorithm.
 */
declare function shuffleArray<T>(array: T[]): T[];
/**
 * Safely resolves any Discord color (Hex, Name, Number).
 */
declare function safeResolveColor(color?: ColorResolvable | string | number | null, fallback?: number): number;
/**
 * Clamps a number between min and max.
 */
declare function clamp(value: number, min: number, max: number): number;

/**
 * Ultra-safe, AST-free mathematical expression parser and evaluator.
 * No eval(), no Function constructor, completely immune to code injection.
 */
interface EvaluationResult {
    result: number | null;
    formatted: string;
    error?: string;
}
declare class MathEvaluator {
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

interface WYPTBDilemma {
    question: string;
    consequence: string;
    stats: {
        yes: string;
        no: string;
    };
}
interface WYRDilemma {
    optionA: string;
    optionB: string;
    stats: {
        votesA: number;
        votesB: number;
    };
}
declare const WYPTB_DILEMMAS: WYPTBDilemma[];
declare const WYR_DILEMMAS: WYRDilemma[];
declare function getRandomWYPTB(): WYPTBDilemma;
declare function getRandomWYR(): WYRDilemma;

interface PokemonData {
    id: number;
    name: string;
    types: string[];
    abilities: string[];
    imageUrl: string;
}
declare const POPULAR_POKEMONS: PokemonData[];
declare function fetchRandomPokemon(): Promise<PokemonData>;

declare const EASY_SENTENCES: string[];
declare const MEDIUM_SENTENCES: string[];
declare const HARD_SENTENCES: string[];
declare function getRandomSentence(difficulty?: "easy" | "medium" | "hard"): string;

interface TriviaFact {
    statement: string;
    isTrue: boolean;
    explanation: string;
}
declare const TRIVIA_FACTS: TriviaFact[];
declare const NEVER_HAVE_I_EVER_PROMPTS: string[];
declare function getRandomTriviaFact(): TriviaFact;
declare function getRandomNHIE(): string;

declare const HANGMAN_CATEGORIES: Record<string, string[]>;
declare const COMMON_WORDS: string[];
declare function getRandomWord(): string;
declare function getRandomWords(count: number): string[];
declare function getRandomHangmanWord(category?: string): {
    word: string;
    category: string;
};

/**
 * @m3rcena/weky
 * The ultimate modern Discord minigames engine.
 * Powered by @napi-rs/canvas, hybrid Slash/Message contexts, and zero external dependencies.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
declare const version = "14.27.0";
declare const VERSION = "14.27.0";

export { BaseGame, type BaseGameOptions, COMMON_WORDS, type CalcTypes, Calculator, CalculatorEngine, type CalculatorState, CanvasUtils, type ChaosTypes, ChaosWords, ContextAdapter, type ContextSendOptions, EASY_SENTENCES, type EvaluationResult, EventManager, FastType, type FastTypeTypes, Fight, FightEngine, type FightEngineOptions, type FightPlayerInfo, type FightPowerUp, type FightState, type FightTypes, Game2048, Game2048Engine, type Game2048EngineOptions, type Game2048State, type GameContextInput, type GameControlItem, type GameControlRow, GuessTheNumber, type GuessTheNumberTypes, GuessThePokemon, type GuessThePokemonTypes, HANGMAN_CATEGORIES, HARD_SENTENCES, Hangman, HangmanEngine, type HangmanEngineOptions, type HangmanState, type HangmanTypes, type IMinigame, LieSwatter, type LieSwatterTypes, MEDIUM_SENTENCES, MathEvaluator, NEVER_HAVE_I_EVER_PROMPTS, NeverHaveIEver, type NeverHaveIEverTypes, POPULAR_POKEMONS, type PokemonData, QuickClick, type QuickClickTypes, type RPSTypes, Render2048, RenderFight, RenderHangman, RenderPokemon, RenderSnake, RockPaperScissors, ShuffleGuess, type ShuffleGuessTypes, Snake, SnakeEngine, type SnakeEngineOptions, type SnakeState, type SnakeTypes, TRIVIA_FACTS, TicTacToe, TicTacToeEngine, type TicTacToeEngineOptions, type TicTacToeState, type TicTacToeTypes, type TriviaFact, type Types2048, VERSION, type WYPTBDilemma, WYPTB_DILEMMAS, type WYRDilemma, WYR_DILEMMAS, WekyCanvas, WekyEngine, WekyManager, type WekyManagerOptions, WillYouPressTheButton, type WillYouPressTheButtonTypes, WouldYouRather, type WouldYouRatherTypes, clamp, fetchRandomPokemon, formatTime, getRandomHangmanWord, getRandomNHIE, getRandomSentence, getRandomString, getRandomTriviaFact, getRandomWYPTB, getRandomWYR, getRandomWord, getRandomWords, safeResolveColor, shuffleArray, shuffleString, version };
