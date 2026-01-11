import type { ButtonStyle, ColorResolvable, Context, EmbedFooterData, GuildMember, GuildTextBasedChannel } from "discord.js";
/**
 * 2048 TYPES
 */
export interface Types2048 {
    context: Context;
    embed: Embeds;
    emojis?: {
        up: string;
        down: string;
        left: string;
        right: string;
    };
    othersMessage?: string;
    time?: number;
}
/**
 * CALCULATOR TYPES
 */
export interface CalcTypes {
    context: Context;
    embed: Embeds;
    invalidQuery?: string;
    disabledQuery?: string;
}
/**
 * CHAOS WORDS TYPES
 */
export interface ChaosTypes {
    context: Context;
    embed: Embeds;
    winMessage?: string;
    loseMessage?: string;
    wrongWord?: string;
    correctWord?: string;
    time?: number;
    words?: string[];
    charGenerated?: number;
    startMessage?: string;
    endMessage?: string;
    maxTries?: number;
    buttonText?: string;
    otherMessage?: string;
}
/**
 * FAST TYPE TYPES
 */
export interface FastTypeTypes {
    context: Context;
    embed: Embeds;
    sentence?: string;
    difficulty?: string;
    winMessage?: string;
    loseMessage?: string;
    time?: number;
    buttonText?: string;
    othersMessage?: string;
    cancelMessage?: string;
    timeoutMessage?: string;
    cheatMessage?: string;
}
/**
 * FIGHT TYPES
 */
export interface FightTypes {
    context: Context;
    opponent: GuildMember;
    embed?: Embeds;
    buttons?: {
        hit?: string;
        heal?: string;
        cancel?: string;
        accept?: string;
        deny?: string;
    };
    wrongUserFight?: string;
    opponentsTurnMessage?: string;
    highHealthMessage?: string;
    lowHealthMessage?: string;
    dmgMin?: number;
    dmgMax?: number;
    healMin?: number;
    healMax?: number;
    time?: number;
}
export interface PowerUp {
    id: string;
    label: string;
    style: ButtonStyle;
    cost: number;
    effect: (player: PlayerData, playerUsername: string) => string;
}
export interface PlayerData {
    memberId: string;
    username: string;
    health: number;
    lastAttack: string;
    coins: number;
    skipNextTurn: boolean;
    activeEffects: string[];
    specialButtons: string[];
}
/**
 * GUESS THE NUMBER TYPES
 */
export interface GuessTheNumberTypes {
    context: Context;
    embed: Embeds;
    publicGame?: boolean;
    winMessage?: {
        publicGame?: string;
        privateGame?: string;
    };
    loseMessage?: string;
    otherMessage?: string;
    ongoingMessage?: string;
    biggerNumberMessage?: string;
    smallerNumberMeesage?: string;
    button?: string;
    number?: number;
    time?: number;
}
/**
 * GUESS THE POKEMON TYPES
 */
export interface GuessThePokemonTypes {
    context: Context;
    embed: Embeds;
    thinkMessage?: string;
    othersMessage?: string;
    winMessage?: string;
    loseMessage?: string;
    incorrectMessage?: string;
    time?: number;
    buttonText?: string;
}
export interface GuessThePokemonData {
    abilities: {
        ability: {
            name: string;
            url: string;
        };
        is_hidden: boolean;
        slot: number;
    }[];
    base_experience: number;
    forms: {
        name: string;
        url: string;
    }[];
    types: {
        slot: number;
        type: {
            name: string;
            url: string;
        };
    }[];
    name: string;
    sprites: {
        other: {
            home: {
                front_default: string;
            };
        };
    };
}
/**
 * HANGMAN TYPES
 */
export interface HangmanTypes {
    context: Context;
    embed?: Embeds;
    time?: number;
}
/**
 * LIE SWATTER TYPES
 */
export interface LieSwatterTypes {
    context: Context;
    embed: Embeds;
    winMessage?: string;
    loseMessage?: string;
    othersMessage?: string;
    thinkMessage?: string;
    buttons?: {
        true: string;
        lie: string;
    };
    time?: number;
}
/**
 * NEVER HAVE I EVER TYPES
 */
export interface NeverHaveIEverTypes {
    context: Context;
    embed: Embeds;
    thinkMessage?: string;
    othersMessage?: string;
    buttons?: {
        optionA?: string;
        optionB?: string;
    };
    time?: number;
}
/**
 * QUICK CLICK TYPES
 */
export interface QuickClickTypes {
    context: Context;
    embed: Embeds;
    waitMessage?: string;
    startMessage?: string;
    winMessage?: string;
    loseMessage?: string;
    ongoingMessage?: string;
    time?: number;
    emoji?: string;
}
/**
 * SHUFFLE GUESS TYPES
 */
export interface ShuffleGuessTypes {
    context: Context;
    embed: Embeds;
    buttons?: {
        cancel?: string;
        reshuffle?: string;
    };
    winMessage?: string;
    loseMessage?: string;
    othersMessage?: string;
    startMessage?: string;
    incorrectMessage?: string;
    word?: string;
    time?: number;
}
/**
 * SNAKE TYPES
 */
export interface SnakeTypes {
    context: Context;
    embed: Embeds;
    emojis?: {
        up: string;
        down: string;
        left: string;
        right: string;
        stop: string;
        board: string;
        food: string;
    };
    snake?: {
        head: string;
        body: string;
        tail: string;
        skull: string;
    };
    time?: number;
}
export interface Point {
    x: number;
    y: number;
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
 * WILL YOU PRESS THE BUTTON TYPES
 */
export interface WillYouPressTheButtonTypes {
    context: Context;
    embed: Embeds;
    button?: {
        yes?: string;
        no?: string;
    };
    thinkMessage?: string;
    othersMessage?: string;
    time?: number;
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
/**
 * WOULD YOU RATHER TYPES
 */
export interface WouldYouRatherTypes {
    context: Context;
    embed: Embeds;
    othersMessage?: string;
    thinkMessage?: string;
    buttons?: {
        optionA: string;
        optionB: string;
    };
    time?: number;
}
/**
 * CUSTOMIZABLE EMBEDS TYPES
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
 * MANAGER RELATED TYPES
 */
export type CustomOptions<T> = T & {
    context: {
        channel: GuildTextBasedChannel;
        guild: NonNullable<Context["guild"]>;
    };
};
export interface BotDataTypes {
    botID: string;
    botName: string;
    secretKey: string;
    usage: {
        minigames: {
            mini2024: number;
            calculator: number;
            chaosWords: number;
            fastType: number;
            fight: number;
            guessTheNumber: number;
            guessThePokemon: number;
            hangman: number;
            lieSwatter: number;
            neverHaveIEver: number;
            quickClick: number;
            shuffleGuess: number;
            snake: number;
            willYouPressTheButton: number;
            wouldYouRather: number;
        };
        inits: number;
        totalRequests: number;
    };
}
