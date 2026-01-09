import chalk from "chalk";

export class LoggerManager {
	constructor() {}

	/**
	 * Display and Error on console
	 * @param gameName Name of minigame which has the Error
	 * @param message What error should I display in console
	 */
	public createError(gameName: string, message: string): boolean {
		console.error(`${chalk.red(`[@m3rcena/weky] ${gameName} Error:`)} ${message}`);
		return true;
	}

	/**
	 * Display a TypeError on console
	 * @param gameName Name of minigame which has the TypeError
	 * @param message What error should I display in console
	 */
	public createTypeError(gameName: string, message: string): boolean {
		console.error(`${chalk.red(`[@m3rcena/weky] ${gameName} TypeError:`)} ${message}`);
		return true;
	}
}
