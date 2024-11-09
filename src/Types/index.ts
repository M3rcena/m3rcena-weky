import type {
    ChatInputCommandInteraction, Client, ColorResolvable, Message, MessageInteraction
} from "discord.js";

export interface Calc {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    invalidQuery?: string,
    disabledQuery?: string,
    notifyUpdate?: boolean,
}

export interface Chaos {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    winMessage?: string,
    loseMessage?: string,
    wrongWord?: string,
    correctWord?: string,
    time?: number,
    words?: string[],
    charGenerated?: number,
    startMessage?: string,
    endMessage?: string,
    maxTries?: number,
    buttonText?: string,
    otherMessage?: string,
    notifyUpdate?: boolean,
}

export interface FastTypeTyping {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    sentence?: string,
    winMessage?: string,
    loseMessage?: string,
    time?: number,
    buttonText?: string,
    othersMessage?: string,
    cancelMessage?: string,
    notifyUpdate?: boolean,
}

export interface LieSwatterTypes {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    winMessage?: string,
    loseMessage?: string,
    othersMessage?: string,
    thinkMessage?: string,
    buttons?: {
        true: string,
        lie: string
    },
    time?: number,
    notifyUpdate?: boolean,
}

export interface WouldYouRatherTypes {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    othersMessage?: string,
    thinkMessage?: string,
    buttons?: {
        optionA: string,
        optionB: string
    },
    time?: number,
    notifyUpdate?: boolean,
}

export interface GuessTheNumberTypes {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    publicGame?: boolean,
    winMessage?: {
        publicGame?: string,
        privateGame?: string
    },
    loseMessage?: string,
    bigNumber?: string,
    smallNumber?: string,
    otherMessage?: string,
    ongoingMessage?: string,
    returnWinner?: boolean,
    button?: string,
    number?: number,
    time?: number,
    gameID?: string,
    notifyUpdate?: boolean,
}

export interface WillYouPressTheButtonTypes {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    button?: {
        yes?: string,
        no?: string
    },
    thinkMessage?: string,
    othersMessage?: string,
    time?: number,
    notifyUpdate?: boolean,
}

export interface QuickClickTypes {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    waitMessage?: string,
    startMessage?: string,
    winMessage?: string,
    loseMessage?: string,
    ongoingMessage?: string,
    time?: number,
    emoji?: string,
    notifyUpdate?: boolean,
}

export interface NeverHaveIEverTypes {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    thinkMessage?: string,
    othersMessage?: string,
    buttons?: {
        optionA?: string,
        optionB?: string
    },
    notifyUpdate?: boolean,
    time?: number,
}

export interface HangmanTypes {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    notifyUpdate?: boolean,
    time?: number,
}

export interface Types2048 {
    interaction: Message | ChatInputCommandInteraction,
    client: Client,
    embed: {
        color: ColorResolvable,
        title: string,
        url?: string,
        author?: {
            name: string,
            icon_url?: string,
            url?: string
        },
        footer?: {
            text: string,
            icon_url?: string
        },
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        thumbnail?: string
    },
    emojis?: {
        up: string,
        down: string,
        left: string,
        right: string
    },
    othersMessage?: string,
    notifyUpdate?: boolean,
    time?: number,
}

export interface Fields {
    name: string,
    value: string,
    inline?: boolean
}