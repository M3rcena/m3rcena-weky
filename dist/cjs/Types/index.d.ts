import type { ChatInputCommandInteraction, Client, ColorResolvable, EmbedFooterData, Message, User } from "discord.js";
export interface Calc {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    invalidQuery?: string;
    disabledQuery?: string;
    notifyUpdate?: boolean;
}
export interface Chaos {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
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
    notifyUpdate?: boolean;
}
export interface FastTypeTyping {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    sentence?: string;
    winMessage?: string;
    loseMessage?: string;
    time?: number;
    buttonText?: string;
    othersMessage?: string;
    cancelMessage?: string;
    notifyUpdate?: boolean;
}
export interface LieSwatterTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
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
    notifyUpdate?: boolean;
}
export interface WouldYouRatherTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    othersMessage?: string;
    thinkMessage?: string;
    buttons?: {
        optionA: string;
        optionB: string;
    };
    time?: number;
    notifyUpdate?: boolean;
}
export interface GuessTheNumberTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    publicGame?: boolean;
    winMessage?: {
        publicGame?: string;
        privateGame?: string;
    };
    loseMessage?: string;
    bigNumber?: string;
    smallNumber?: string;
    otherMessage?: string;
    ongoingMessage?: string;
    returnWinner?: boolean;
    button?: string;
    number?: number;
    time?: number;
    gameID?: string;
    notifyUpdate?: boolean;
}
export interface WillYouPressTheButtonTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    button?: {
        yes?: string;
        no?: string;
    };
    thinkMessage?: string;
    othersMessage?: string;
    time?: number;
    notifyUpdate?: boolean;
}
export interface QuickClickTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    waitMessage?: string;
    startMessage?: string;
    winMessage?: string;
    loseMessage?: string;
    ongoingMessage?: string;
    time?: number;
    emoji?: string;
    notifyUpdate?: boolean;
}
export interface NeverHaveIEverTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    thinkMessage?: string;
    othersMessage?: string;
    buttons?: {
        optionA?: string;
        optionB?: string;
    };
    notifyUpdate?: boolean;
    time?: number;
}
export interface HangmanTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    notifyUpdate?: boolean;
    time?: number;
}
export interface Types2048 {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    embed: Embeds;
    emojis?: {
        up: string;
        down: string;
        left: string;
        right: string;
    };
    othersMessage?: string;
    notifyUpdate?: boolean;
    time?: number;
}
export interface ShuffleGuessTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
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
    notifyUpdate?: boolean;
}
export interface SnakeTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
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
    notifyUpdate?: boolean;
}
export interface FightTypes {
    interaction: Message | ChatInputCommandInteraction;
    client: Client;
    opponent: User;
    embed: Embeds;
    buttons?: {
        hit?: string;
        heal?: string;
        cancel?: string;
        accept?: string;
        deny?: string;
    };
    acceptMessage?: string;
    winMessage?: string;
    endMessage?: string;
    cancelMessage?: string;
    fightMessage?: string;
    othersMessage?: string;
    opponentsTurnMessage?: string;
    highHealthMessage?: string;
    lowHealthMessage?: string;
    returnWinner?: boolean;
    dmgMin?: number;
    dmgMax?: number;
    healMin?: number;
    healMax?: number;
    time?: number;
    notifyUpdate?: boolean;
}
export interface Embeds {
    color?: ColorResolvable;
    title?: string;
    url?: string;
    author?: {
        name?: string;
        icon_url?: string;
        url?: string;
    };
    footer?: EmbedFooterData;
    description?: string;
    fields?: Fields[];
    image?: string;
    timestamp?: Date;
    thumbnail?: string;
}
export interface Fields {
    name: string;
    value: string;
    inline?: boolean;
}
