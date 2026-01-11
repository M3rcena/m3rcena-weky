import chalk from "chalk";
/**
 * A utility manager for handling standardized logging and error reporting
 * across the `@m3rcena/weky` package.
 * * This class ensures all minigames output errors in a consistent, colored format.
 */
export class LoggerManager {
    constructor() { }
    /**
     * Logs a formatted error message to the console with a red prefix.
     * * Use this for general runtime errors, API failures, or game logic issues.
     * @param {string} gameName - The name of the minigame or system component where the error originated (e.g., "Snake", "Fight").
     * @param {string} message - The specific error details to display.
     * @returns {boolean} Always returns `true`. Useful for returning early in functions (e.g., `return logger.createError(...)`).
     * @example
     * logger.createError("Snake", "Failed to initialize game board.");
     * // Console Output: [@m3rcena/weky] Snake Error: Failed to initialize game board.
     */
    createError(gameName, message) {
        console.error(`${chalk.red(`[@m3rcena/weky] ${gameName} Error:`)} ${message}`);
        return true;
    }
    /**
     * Logs a formatted TypeError message to the console with a red prefix.
     * * Use this specifically when validating user options, types, or configuration inputs.
     * @param {string} gameName - The name of the minigame or system component where the TypeError originated.
     * @param {string} message - The validation error message to display.
     * @returns {boolean} Always returns `true`.
     * @example
     * if (typeof options.time !== 'number') {
     * return logger.createTypeError("FastType", "Time option must be a number.");
     * }
     * // Console Output: [@m3rcena/weky] FastType TypeError: Time option must be a number.
     */
    createTypeError(gameName, message) {
        console.error(`${chalk.red(`[@m3rcena/weky] ${gameName} TypeError:`)} ${message}`);
        return true;
    }
}
