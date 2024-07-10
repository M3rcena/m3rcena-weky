import { ChatInputCommandInteraction, ColorResolvable, Message, MessageInteraction } from "discord.js";
interface Calc {
    interaction : Message | ChatInputCommandInteraction,
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
        fields?: {
            name: string,
            value: string,
            inline?: boolean
        }[],
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
}