import DiscordJS, { AttachmentBuilder } from "discord.js";
import { LoggerManager } from "./Logger.js";

import type { BotDataTypes, DilemmaData } from "src/Types/index.js";

type MinigameKey = keyof BotDataTypes["usage"]["minigames"];

export class NetworkManager {
	private baseUrl: string = "http://localhost:8083/api/v1";
	private client: DiscordJS.Client;
	private loggerManager: LoggerManager;
	private apiKey: string;

	constructor(client: DiscordJS.Client, loggerManger: LoggerManager, apiKey: string) {
		this.client = client;
		this.loggerManager = loggerManger;
		this.apiKey = apiKey;
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const headers: HeadersInit = {
			"Content-Type": "application/json",
			"x-bot-id": this.client.user.id,
			"x-api-key": this.apiKey,
			...options.headers,
		};

		const response = await fetch(url, { ...options, headers, cache: "no-cache" });

		if (!response.ok) {
			const errorBody = await response.json().catch(() => ({}));
			this.loggerManager.createError(`API`, `[${response.status}]: ${errorBody.error || response.statusText}`);
		}

		return response.json() as Promise<T>;
	}

	/**
	 * Initialize Manager with API
	 */
	public async init(): Promise<boolean> {
		try {
			const botID = this.client.user.id;
			const botName = this.client.user.username;

			const res = await this.request<{ success: boolean }>(`/init?botID=${botID}&botName=${botName}`);

			if (res.success) {
				return true;
			}
			return false;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to init bot: ${error}`);
			return false;
		}
	}

	/**
	 * Get a specific usage stat (e.g. minigames)
	 */
	public async getUsage(): Promise<BotDataTypes["usage"]> {
		const safeID = encodeURIComponent(this.client.user.id);
		const res = await this.request<{ usage: BotDataTypes["usage"] }>(`/usage/${safeID}`);
		return res.usage;
	}

	/**
	 * Increase usage on specific minigame
	 */
	public async increaseUsage(minigame: MinigameKey): Promise<boolean> {
		try {
			const res = await this.request<{ success: boolean }>(`/increaseUsage`, {
				method: "POST",
				body: JSON.stringify({
					minigame,
				}),
			});

			return res.success;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to increase minigame usage`);
			return false;
		}
	}

	/**
	 *
	 * Get a random list of words
	 *
	 * @param length How big you want the Random Words Sentence to be
	 * @returns
	 */
	public async getRandomSentence(length: number): Promise<string[]> {
		try {
			const res = await this.request<{ word: string[] }>(`/getRandomSentence?length=${length}`);

			return res.word;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to get a random Sentence`);
		}
	}

	/**
	 * Get a random sentence for the FastType minigame
	 * @param {string} difficulty 'easy', 'medium', 'hard'
	 */
	public async getText(difficulty: string): Promise<string> {
		try {
			const safeDifficulty = encodeURIComponent(difficulty);

			const res = await this.request<{ sentence: string }>(`/FastType/getText?difficulty=${safeDifficulty}`);

			return res.sentence;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to get sentence: ${error}`);
			return "No sentence provided by the API. Please try again!";
		}
	}

	/**
	 *
	 * FIGHT MINIGAME NETWORK REQUESTS
	 *
	 */

	/**
	 * Create a Fight Game between two players
	 * @returns Game ID {string}
	 */
	public async createGame(
		challengerID: string,
		challengerUsername: string,
		opponentID: string,
		opponentUsername: string
	): Promise<string> {
		try {
			const res = await this.request<{ gameID: string }>(`/Fight/createGame`, {
				method: "POST",
				body: JSON.stringify({
					challengerID,
					challengerUsername,
					opponentID,
					opponentUsername,
				}),
			});

			return res.gameID;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to start the Fight game: ${error}`);
			return "Failed to start game! Please try again.";
		}
	}

	/**
	 * Remove Specific Game from the API
	 * @param {string} gameID The Game ID provided in the Fight
	 * @returns {boolean} Returns True if it successfully remove it
	 */
	public async removeGame(gameID: string): Promise<boolean> {
		try {
			const res = await this.request<{ removed: boolean }>(`/Fight/removeGame?gameID=${gameID}`);

			return res.removed;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to remove the Fight Game from the API: ${error}`);
			return false;
		}
	}

	/**
	 * Check if a user is already in a fight
	 * @param {string} playerID User who you want to check
	 * @returns {Boolean}
	 */
	public async checkPlayerFightStatus(playerID: string): Promise<boolean> {
		try {
			const res = await this.request<{ isInGame: boolean }>(`/Fight/isInGame`, {
				method: "POST",
				body: JSON.stringify({
					playerID,
				}),
			});

			return res.isInGame;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to check if user is in game: ${error}`);
			return null;
		}
	}

	/**
	 * Get a Request Card for the Fight Game!
	 * @param {string} gameID The ID of the Fight Game
	 * @param {string} challengerIcon Icon of the Challenger
	 * @param {string} opponentIcon Icon of the Opponent
	 * @returns {AttachmentBuilder} The Requested Card
	 */
	public async makeMainCard(gameID: string, challengerIcon: string, opponentIcon: string): Promise<AttachmentBuilder> {
		try {
			const res = await this.request<{ mainCardBuffer: string }>(`/Fight/makeMainCard`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					challengerIcon,
					opponentIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.mainCardBuffer, "base64"), { name: "fight-card.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Request Card: ${error}`);
			return null;
		}
	}

	/**
	 * Get a Request Card for the Fight Game!
	 * @param {string} challengerUsername Username of the Challenger
	 * @param {string} challengerIcon Icon of the Challenger
	 * @param {string} opponentUsername Username of the Opponent
	 * @param {string} opponentIcon Icon of the Opponent
	 * @returns {AttachmentBuilder} The Requested Card
	 */
	public async makeRequestCard(
		challengerUsername: string,
		challengerIcon: string,
		opponentUsername: string,
		opponentIcon: string
	): Promise<AttachmentBuilder> {
		try {
			const res = await this.request<{ requestCardBuffer: string }>(`/Fight/makeRequestCard`, {
				method: "POST",
				body: JSON.stringify({
					challengerUsername,
					challengerIcon,
					opponentUsername,
					opponentIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.requestCardBuffer, "base64"), {
				name: "fight-request.png",
			});
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Request Card: ${error}`);
			return null;
		}
	}

	/**
	 * Get a Denied Card for the Fight Game!
	 * @param {string} challengerUsername Username of the Challenger
	 * @param {string} challengerIcon Icon of the Challenger
	 * @param {string} opponentUsername Username of the Opponent
	 * @param {string} opponentIcon Icon of the Opponent
	 * @returns {AttachmentBuilder} The Denied Card
	 */
	public async makeDenyCard(
		challengerUsername: string,
		challengerIcon: string,
		opponentUsername: string,
		opponentIcon: string
	): Promise<AttachmentBuilder> {
		try {
			const res = await this.request<{ denyCardBuffer: string }>(`/Fight/makeDenyCard`, {
				method: "POST",
				body: JSON.stringify({
					challengerUsername,
					challengerIcon,
					opponentUsername,
					opponentIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.denyCardBuffer, "base64"), { name: "fight-deny.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Deny Card: ${error}`);
			return null;
		}
	}

	/**
	 * Get a Surrender Card for the Fight Game!
	 * @param {string} winnerUsername Username of the Winner
	 * @param {string} winnerIcon Icon of the Winner
	 * @param {string} surrenderUsername Username of the Surrender
	 * @param {string} surrenderIcon Icon of the Surrender
	 * @returns {AttachmentBuilder} The Surrender Card
	 */
	public async makeSurrenderCard(
		winnerUsername: string,
		winnerIcon: string,
		surrenderUsername: string,
		surrenderIcon: string
	): Promise<AttachmentBuilder> {
		try {
			const res = await this.request<{ surrenderCardBuffer: string }>(`/Fight/makeSurrenderCard`, {
				method: "POST",
				body: JSON.stringify({
					winnerUsername,
					winnerIcon,
					surrenderUsername,
					surrenderIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.surrenderCardBuffer, "base64"), { name: "fight-surrender.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Surrender Card: ${error}`);
			return null;
		}
	}

	/**
	 * Get a Win Card for the Fight Game!
	 * @param {string} winnerUsername Username of the Winner
	 * @param {string} winnerIcon Icon of the Winner
	 * @param {string} loserUsername Username of the Loser
	 * @param {string} loserIcon Icon of the Loser
	 * @returns {AttachmentBuilder} The Winner Card
	 */
	public async makeWinCard(
		winnerUsername: string,
		winnerIcon: string,
		loserUsername: string,
		loserIcon: string
	): Promise<AttachmentBuilder> {
		try {
			const res = await this.request<{ winCardBuffer: string }>(`/Fight/makeWinCard`, {
				method: "POST",
				body: JSON.stringify({
					winnerUsername,
					winnerIcon,
					loserUsername,
					loserIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.winCardBuffer, "base64"), { name: "fight-winner.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Winner Card: ${error}`);
			return null;
		}
	}

	/**
	 * Get a Denied Card for the Fight Game!
	 * @param {string} challengerUsername Username of the Challenger
	 * @param {string} challengerIcon Icon of the Challenger
	 * @param {string} opponentUsername Username of the Opponent
	 * @param {string} opponentIcon Icon of the Opponent
	 * @returns {AttachmentBuilder} The Denied Card
	 */
	public async makeTimeOutCard(
		challengerUsername: string,
		challengerIcon: string,
		opponentUsername: string,
		opponentIcon: string
	): Promise<AttachmentBuilder> {
		try {
			const res = await this.request<{ timeoutCardBuffer: string }>(`/Fight/makeTimeOutCard`, {
				method: "POST",
				body: JSON.stringify({
					challengerUsername,
					challengerIcon,
					opponentUsername,
					opponentIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.timeoutCardBuffer, "base64"), { name: "fight-timeout.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Timeout Card: ${error}`);
			return null;
		}
	}

	/**
	 * Get the user whos turn is in the Fight
	 * @param {string} gameID The ID of the Fight Game
	 */
	public async getTurn(gameID: string): Promise<{ turn: number; username: string; userID: string }> {
		try {
			const res = await this.request<{ turn: number; username: string; userID: string }>(
				`/Fight/getTurn?gameID=${gameID}`
			);

			return { turn: res.turn, username: res.username, userID: res.userID };
		} catch (error) {
			this.loggerManager.createError("API", `Failed to get the user's turn: ${error}`);
			return null;
		}
	}

	/**
	 * Change the Turn of the game
	 * @param {string} gameID The ID of the Fight Game
	 * @returns {boolean} Returns `True` if it was successfull
	 */
	public async changeTurn(gameID: string): Promise<boolean> {
		try {
			const res = await this.request<{ changed: boolean }>(`/Fight/changeTurn?gameID=${gameID}`);

			return res.changed;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to change user's turn: ${error}`);
			return null;
		}
	}

	public async getPlayer(
		gameID: string,
		isOpponent: boolean
	): Promise<{
		memberId: string;
		username: string;
		health: number;
		lastAttack: string;
		coins: number;
		skipNextTurn: boolean;
		activeEffects: string[];
		specialButtons: string[];
	}> {
		try {
			const res = await this.request<{
				player: {
					memberId: string;
					username: string;
					health: number;
					lastAttack: string;
					coins: number;
					skipNextTurn: boolean;
					activeEffects: string[];
					specialButtons: string[];
				};
			}>(`/Fight/getPlayer`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					isOpponent,
				}),
			});

			return res.player;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to get player: ${error}`);
			return null;
		}
	}

	public async updatePlayers(
		gameID: string,
		player1: {
			memberId: string;
			username: string;
			health: number;
			lastAttack: string;
			coins: number;
			skipNextTurn: boolean;
			activeEffects: string[];
			specialButtons: string[];
		},
		player2: {
			memberId: string;
			username: string;
			health: number;
			lastAttack: string;
			coins: number;
			skipNextTurn: boolean;
			activeEffects: string[];
			specialButtons: string[];
		}
	): Promise<boolean> {
		try {
			const res = await this.request<{ updated: boolean }>(`/Fight/updatePlayers`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					player1,
					player2,
				}),
			});

			return res.updated;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to update players: ${error}`);
			return false;
		}
	}

	/**
	 *
	 * 2048 MINIGAME NETWORK REQUESTS
	 *
	 */

	/**
	 * Start a new 2048 Game
	 * @returns The Game ID
	 */
	public async create2048Game(playerID: string, username: string): Promise<string> {
		try {
			const res = await this.request<{ gameID: string }>(`/2048/createGame`, {
				method: "POST",
				body: JSON.stringify({
					playerID,
					username,
				}),
			});

			return res.gameID;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to start 2048 game: ${error}`);
			return "-1";
		}
	}

	/**
	 * Make a move in 2048
	 * @param direction "UP", "DOWN", "LEFT", "RIGHT"
	 */
	public async move2048(
		gameID: string,
		direction: string
	): Promise<{
		board: number[][];
		score: number;
		moved: boolean;
		gameOver: boolean;
		won: boolean;
	} | null> {
		try {
			const res = await this.request<{
				board: number[][];
				score: number;
				moved: boolean;
				gameOver: boolean;
				won: boolean;
			}>(`/2048/move`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					direction,
				}),
			});

			return res;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to move in 2048: ${error}`);
			return null;
		}
	}

	/**
	 * Get the visual board image for 2048
	 */
	public async get2048BoardImage(gameID: string, userIcon: string): Promise<AttachmentBuilder | null> {
		try {
			const res = await this.request<{ cardBuffer: string }>(`/2048/getBoardImage`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					userIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "2048-board.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to generate 2048 board: ${error}`);
			return null;
		}
	}

	/**
	 * End a 2048 game manually (cleanup)
	 */
	public async end2048Game(gameID: string): Promise<boolean> {
		try {
			const res = await this.request<{ removed: boolean }>(`/2048/endGame`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
				}),
			});

			return res.removed;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to end 2048 game: ${error}`);
			return false;
		}
	}

	/**
	 *
	 * HANGMAN MINIGAME NETWORK REQUESTS
	 *
	 */

	/**
	 * Start a new Hangman Game
	 * @returns The Game ID
	 */
	public async createHangmanGame(playerID: string, username: string): Promise<string> {
		try {
			const res = await this.request<{ gameID: string }>(`/Hangman/createGame`, {
				method: "POST",
				body: JSON.stringify({
					playerID,
					username,
				}),
			});

			return res.gameID;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to start Hangman game: ${error}`);
			return "-1";
		}
	}

	/**
	 * Make a guess in Hangman
	 * @param letter The single character being guessed
	 */
	public async guessHangman(
		gameID: string,
		letter: string
	): Promise<{
		success: boolean;
		message: string;
		game: {
			gameID: string;
			playerID: string;
			username: string;
			word: string;
			displayWord: string;
			guessedLetters: string[];
			wrongGuesses: number;
			gameOver: boolean;
			won: boolean;
		};
	} | null> {
		try {
			const res = await this.request<{
				success: boolean;
				message: string;
				game: any; // Matches HangmanGameTypes structure from API
			}>(`/Hangman/guess`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					letter,
				}),
			});

			return res;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to guess in Hangman: ${error}`);
			return null;
		}
	}

	/**
	 * Get the visual board image for Hangman
	 */
	public async getHangmanBoardImage(gameID: string, userIcon: string): Promise<AttachmentBuilder | null> {
		try {
			const res = await this.request<{ cardBuffer: string }>(`/Hangman/getBoardImage`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					userIcon,
				}),
			});

			return new AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "hangman-board.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to generate Hangman board: ${error}`);
			return null;
		}
	}

	/**
	 * End a Hangman game manually (cleanup)
	 */
	public async endHangmanGame(gameID: string): Promise<boolean> {
		try {
			const res = await this.request<{ success: boolean }>(`/Hangman/endGame`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
				}),
			});

			return res.success;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to end Hangman game: ${error}`);
			return false;
		}
	}

	/**
	 * WILL YOU PRESS THE BUTTON MINIGAME REQUESTS
	 */

	/**
	 * Get a RANDOM dilemma for Will You Press The Button?
	 * @returns {Promise<DilemmaData | null>}
	 */
	public async getWillYouPressTheButton(): Promise<DilemmaData | null> {
		try {
			const res = await this.request<DilemmaData>(`/WillYouPressTheButton/`);
			return res;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to get random WYPTB dilemma: ${error}`);
			return null;
		}
	}

	/**
	 * Get a SPECIFIC dilemma by ID for Will You Press The Button?
	 * @param {string | number} code The ID of the dilemma (e.g. 12345)
	 * @returns {Promise<DilemmaData | null>}
	 */
	public async getWillYouPressTheButtonID(code: string | number): Promise<DilemmaData | null> {
		try {
			const res = await this.request<DilemmaData>(`/WillYouPressTheButton/${code}`);
			return res;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to get WYPTB dilemma ${code}: ${error}`);
			return null;
		}
	}
}
