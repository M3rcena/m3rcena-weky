import { ChatInputCommandInteraction, Client, ColorResolvable, Message, MessageInteraction } from "discord.js";
interface Calc {
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
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        footer?: {
            text: string,
            icon_url?: string
        },
        thumbnail?: string
    },
    invalidQuery?: string,
    disabledQuery?: string,
};

interface Chaos {
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
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        footer?: {
            text: string,
            icon_url?: string
        },
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
};

interface FastTypeTyping {
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
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        footer?: {
            text: string,
            icon_url?: string
        },
        thumbnail?: string
    },
    sentence?: string,
    winMessage?: string,
    loseMessage?: string,
    time?: number,
    buttonText?: string,
    othersMessage?: string,
    cancelMessage?: string,
};

interface LieSwatterTypes {
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
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        footer?: {
            text: string,
            icon_url?: string
        },
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
};

interface WouldYouRatherTypes {
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
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        footer?: {
            text: string,
            icon_url?: string
        },
        thumbnail?: string
    },
    othersMessage?: string,
    thinkMessage?: string,
    buttons?: {
        optionA: string,
        optionB: string
    },
    time?: number,
};

interface GuessTheNumberTypes {
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
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        footer?: {
            text: string,
            icon_url?: string
        },
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
};

interface WillYouPressTheButtonTypes {
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
        description?: string,
        fields?: Fields[],
        image?: string,
        timestamp?: Date,
        footer?: {
            text: string,
            icon_url?: string
        },
        thumbnail?: string
    },
    button?: {
        yes?: string,
        no?: string
    },
    thinkMessage?: string,
    othersMessage?: string,
    time?: number,
}

interface Fields {
    name: string,
    value: string,
    inline?: boolean
};