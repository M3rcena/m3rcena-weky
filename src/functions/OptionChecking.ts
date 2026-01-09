import { resolveColor } from "discord.js";

import type {
	CalcTypes,
	ChaosTypes,
	FastTypeTypes,
	GuessTheNumberTypes,
	HangmanTypes,
	LieSwatterTypes,
	NeverHaveIEverTypes,
	QuickClickTypes,
	WillYouPressTheButtonTypes,
	WouldYouRatherTypes,
	Types2048,
	ShuffleGuessTypes,
	SnakeTypes,
	FightTypes,
	GuessThePokemonTypes,
} from "../Types/index.js";
import { LoggerManager } from "../handlers/Logger.js";

const URL_PATTERN = /^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$/;

const validateUrl = (url: string, gameName: string, context: string, loggerManager: LoggerManager): boolean | null => {
	if (typeof url !== "string") {
		return loggerManager.createTypeError(gameName, `${context} must be a string.`);
	}
	if (!URL_PATTERN.test(url)) {
		return loggerManager.createError(gameName, `${context} must be a valid URL.`);
	}
};

const validateString = (
	value: string,
	gameName: string,
	fieldName: string,
	loggerManager: LoggerManager,
	maxLength?: number
): boolean | null => {
	if (typeof value !== "string") {
		return loggerManager.createTypeError(gameName, `${fieldName} must be a string.`);
	}
	if (maxLength && value.length > maxLength) {
		return loggerManager.createError(gameName, `${fieldName} length must be less than ${maxLength} characters.`);
	}
};

const validateEmbedFields = (fields: any[], gameName: string, loggerManager: LoggerManager): boolean => {
	if (!Array.isArray(fields)) {
		return loggerManager.createTypeError(gameName, "Embed fields must be an array.");
	}

	fields.forEach((field) => {
		if (typeof field !== "object") {
			return loggerManager.createTypeError(gameName, "Embed field must be an object.");
		}

		if (!field.name) {
			return loggerManager.createError(gameName, "No embed field name provided.");
		}
		if (validateString(field.name, gameName, "Field name", loggerManager, 256)) return true;

		if (!field.value) {
			return loggerManager.createError(gameName, "No embed field value provided.");
		}
		if (validateString(field.value, gameName, "Field value", loggerManager, 1024)) return true;

		if (field.inline !== undefined && typeof field.inline !== "boolean") {
			return loggerManager.createTypeError(gameName, "Embed field inline must be a boolean.");
		}
	});
};

const validateEmbedAuthor = (author: any, gameName: string, loggerManager: LoggerManager): boolean => {
	if (typeof author !== "object") {
		return loggerManager.createTypeError(gameName, "Embed author must be an object.");
	}

	if (!author.name) {
		return loggerManager.createError(gameName, "No embed author name provided.");
	}

	if (author.icon_url) {
		return validateUrl(author.icon_url, gameName, "Embed author icon URL", loggerManager);
	}

	if (author.url) {
		return validateUrl(author.url, gameName, "Embed author URL", loggerManager);
	}
};

export function OptionsChecking(
	options:
		| Types2048
		| CalcTypes
		| ChaosTypes
		| FastTypeTypes
		| GuessTheNumberTypes
		| GuessThePokemonTypes
		| HangmanTypes
		| LieSwatterTypes
		| NeverHaveIEverTypes
		| QuickClickTypes
		| ShuffleGuessTypes
		| SnakeTypes
		| WillYouPressTheButtonTypes
		| WouldYouRatherTypes,
	GameName: string,
	loggerManager: LoggerManager
): boolean {
	if (!options) {
		return loggerManager.createError(GameName, "No options provided.");
	}

	if (typeof options !== "object") {
		return loggerManager.createTypeError(GameName, "Options must be an object.");
	}

	// Basic validations
	if (!options.context) {
		return loggerManager.createError(GameName, "No Context provided.");
	}

	// Embed validations
	if (options.embed) {
		if (typeof options.embed !== "object") {
			return loggerManager.createTypeError(GameName, "Embed options must be an object.");
		}

		try {
			const color = resolveColor(options.embed.color);
			if (!color) return loggerManager.createError(GameName, "Embed Color does not exist.");
		} catch {
			return loggerManager.createError(GameName, "Embed Color does not exist or was invalid.");
		}

		if (options.embed.title) {
			return validateString(options.embed.title, GameName, "Embed title", loggerManager, 256);
		}

		if (options.embed.url) {
			return validateUrl(options.embed.url, GameName, "Embed URL", loggerManager);
		}

		if (options.embed.author) {
			return validateEmbedAuthor(options.embed.author, GameName, loggerManager);
		}

		if (options.embed.description) {
			return validateString(options.embed.description, GameName, "Embed description", loggerManager, 4096);
		}

		if (options.embed.fields) {
			return validateEmbedFields(options.embed.fields, GameName, loggerManager);
		}

		if (options.embed.image) {
			return validateUrl(options.embed.image, GameName, "Embed image", loggerManager);
		}

		if (options.embed.timestamp && !(options.embed.timestamp instanceof Date)) {
			return loggerManager.createTypeError(GameName, "Embed timestamp must be a date.");
		}
	}
}
