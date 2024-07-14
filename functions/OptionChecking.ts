import chalk from "chalk";
import { Calc, Chaos, FastTypeTyping, LieSwatterTypes } from "../typings";
import { Client } from "discord.js";

export function OptionsChecking(options: Calc | Chaos | FastTypeTyping | LieSwatterTypes, GameName: string) {
    const URLPattern = new RegExp("^https:\\/\\/([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(:[0-9]+)?(\\/.*)?$");
    if (!options) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No options provided.");

    if (typeof options !== "object") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} TypeError:`) + " Options must be an object.");

    // Check if the interaction object is provided
    if (!options.interaction) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No interaction provided.");

    if (typeof options.interaction !== "object") {
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} TypeError:`) + " Interaction must be an object.");
    };

    if (!options.client) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No client provided.");

    if (!options.client as unknown as Object instanceof Client) {
        throw new Error(chalk.red("[@m3rcena/weky] Calculator TypeError:") + " Client must be a Discord Client.");
    };

    if (!options.embed) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed options provided.");

    // Check if embed object is provided
    if (typeof options.embed !== "object") {
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed options must be an object.");
    };

    if (!options.embed.color) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed color provided.");

    if (!options.embed.title) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed title provided.");
    if (options.embed.title) {
        if (typeof options.embed.title !== "string") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed title must be a string.");
        if (options.embed.title.length > 256) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed title length must be less than 256 characters.");
    }

    if (options.embed.url) {
        if (typeof options.embed.url !== "string") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed URL must be a string.");
        if (!URLPattern.test(options.embed.url)) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed URL must be a valid URL.");
    };

    if (options.embed.author) {
        if (typeof options.embed.author !== "object") {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author must be an object.");
        };

        if (!options.embed.author.name) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed author name provided.");

        if (options.embed.author.icon_url) {
            if (typeof options.embed.author.icon_url !== "string") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author icon URL must be a string.");
            else if (!URLPattern.test(options.embed.author.icon_url)) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Invalid embed author icon URL.");
        };

        if (options.embed.author.url) {
            if (typeof options.embed.author.url !== "string") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author URL must be a string.");
            else if (!URLPattern.test(options.embed.author.url)) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author URL must be a valid URL.");
        };
    };

    if (options.embed.description) {
        if (typeof options.embed.description !== "string") {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed description must be a string.");
        } else if (options.embed.description.length > 4096) {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed description length must less than 4096 characters.")
        }
    };

    if (options.embed.fields) {
        if (!Array.isArray(options.embed.fields)) {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed fields must be an array.");
        };

        for (const field of options.embed.fields) {
            if (typeof field !== "object") {
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed field must be an object.");
            };

            if (!field.name) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed field name provided.");

            if (field.name) {
                if (typeof field.name !== "string") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field name must be a string.");
                if (field.name.length > 256) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field name must be 256 characters fewer in length.");
            }

            if (!field.value) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed field value provided.");

            if (field.value) {
                if (typeof field.value !== "string") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field value must be a string.");
                if (field.value.length > 256) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field value must be 1024 characters fewer in length.");
            }

            if (field.inline && typeof field.inline !== "boolean") {
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed field inline must be a boolean.");
            };
        };
    };

    if (options.embed.image) {
        if (typeof options.embed.image !== "string") throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed image must be a string.");
        else if (!URLPattern.test(options.embed.image)) throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed image must be a valid URL.");
    };

    if (options.embed.timestamp && !(options.embed.timestamp instanceof Date)) {
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed timestamp must be a date.");
    };
}