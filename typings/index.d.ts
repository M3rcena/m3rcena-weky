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
    maxTries?: string,
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
}
interface Fields {
    name: string,
    value: string,
    inline?: boolean
}