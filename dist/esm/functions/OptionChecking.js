import chalk from "chalk";
import { Client } from "discord.js";
const URL_PATTERN = /^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$/;
const createError = (gameName, message) => new Error(`${chalk.red(`[@m3rcena/weky] ${gameName} Error:`)} ${message}`);
const createTypeError = (gameName, message) => new TypeError(`${chalk.red(`[@m3rcena/weky] ${gameName} Error:`)} ${message}`);
const validateUrl = (url, gameName, context) => {
    if (typeof url !== "string") {
        throw createTypeError(gameName, `${context} must be a string.`);
    }
    if (!URL_PATTERN.test(url)) {
        throw createError(gameName, `${context} must be a valid URL.`);
    }
};
const validateString = (value, gameName, fieldName, maxLength) => {
    if (typeof value !== "string") {
        throw createTypeError(gameName, `${fieldName} must be a string.`);
    }
    if (maxLength && value.length > maxLength) {
        throw createError(gameName, `${fieldName} length must be less than ${maxLength} characters.`);
    }
};
const validateEmbedFields = (fields, gameName) => {
    if (!Array.isArray(fields)) {
        throw createTypeError(gameName, "Embed fields must be an array.");
    }
    fields.forEach(field => {
        if (typeof field !== "object") {
            throw createTypeError(gameName, "Embed field must be an object.");
        }
        if (!field.name) {
            throw createError(gameName, "No embed field name provided.");
        }
        validateString(field.name, gameName, "Field name", 256);
        if (!field.value) {
            throw createError(gameName, "No embed field value provided.");
        }
        validateString(field.value, gameName, "Field value", 1024);
        if (field.inline !== undefined && typeof field.inline !== "boolean") {
            throw createTypeError(gameName, "Embed field inline must be a boolean.");
        }
    });
};
const validateEmbedAuthor = (author, gameName) => {
    if (typeof author !== "object") {
        throw createTypeError(gameName, "Embed author must be an object.");
    }
    if (!author.name) {
        throw createError(gameName, "No embed author name provided.");
    }
    if (author.icon_url) {
        validateUrl(author.icon_url, gameName, "Embed author icon URL");
    }
    if (author.url) {
        validateUrl(author.url, gameName, "Embed author URL");
    }
};
export function OptionsChecking(options, GameName) {
    if (!options) {
        throw createError(GameName, "No options provided.");
    }
    if (typeof options !== "object") {
        throw createTypeError(GameName, "Options must be an object.");
    }
    // Basic validations
    if (!options.interaction) {
        throw createError(GameName, "No interaction provided.");
    }
    if (!options.client) {
        throw createError(GameName, "No client provided.");
    }
    if (!(options.client instanceof Client)) {
        throw createError(GameName, "Client must be a Discord Client.");
    }
    // Embed validations
    if (!options.embed) {
        throw createError(GameName, "No embed options provided.");
    }
    if (typeof options.embed !== "object") {
        throw createTypeError(GameName, "Embed options must be an object.");
    }
    if (!options.embed.color) {
        throw createError(GameName, "No embed color provided.");
    }
    if (!options.embed.title) {
        throw createError(GameName, "No embed title provided.");
    }
    validateString(options.embed.title, GameName, "Embed title", 256);
    if (options.embed.url) {
        validateUrl(options.embed.url, GameName, "Embed URL");
    }
    if (options.embed.author) {
        validateEmbedAuthor(options.embed.author, GameName);
    }
    if (options.embed.description) {
        validateString(options.embed.description, GameName, "Embed description", 4096);
    }
    if (options.embed.fields) {
        validateEmbedFields(options.embed.fields, GameName);
    }
    if (options.embed.image) {
        validateUrl(options.embed.image, GameName, "Embed image");
    }
    if (options.embed.timestamp && !(options.embed.timestamp instanceof Date)) {
        throw createTypeError(GameName, "Embed timestamp must be a date.");
    }
}
