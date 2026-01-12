import DiscordJS from "discord.js";

import type { LoggerManager } from "./LoggerManager.js";
import type { BotDataTypes, DilemmaData } from "../Types/index.js";

type MinigameKey = keyof BotDataTypes["usage"]["minigames"];

/**
 * Manages all network communication between the Discord Bot and the local Minigame API.
 * Handles authentication, error logging, and data fetching for all game modes.
 */
export class NetworkManager {
	private baseUrl: string = "http://localhost:8083/api/v1";
	private client: DiscordJS.Client;
	private loggerManager: LoggerManager;
	private apiKey: string;

	/**
	 * @param client The Discord Client instance
	 * @param loggerManger The custom Logger for reporting API errors
	 * @param apiKey The secret key for API authentication
	 */
	constructor(client: DiscordJS.Client, loggerManger: LoggerManager, apiKey: string) {
		this.client = client;
		this.loggerManager = loggerManger;
		this.apiKey = apiKey;
	}

	/**
	 * Internal wrapper for `fetch` that handles headers, authentication, and error logging.
	 * @template T The expected return type of the API response
	 * @param endpoint The API endpoint (e.g., `/init`)
	 * @param options Fetch options (method, body, etc.)
	 */
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
	 * Initializes the connection with the API server.
	 * Sends the Bot ID and Username to register the session.
	 * @returns {Promise<boolean>} `true` if initialization was successful, `false` otherwise.
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
	 * Retrieves usage statistics for the bot (e.g., how many times each minigame was played).
	 * @returns {Promise<BotDataTypes["usage"]>} An object containing usage counts.
	 */
	public async getUsage(): Promise<BotDataTypes["usage"]> {
		const safeID = encodeURIComponent(this.client.user.id);
		const res = await this.request<{ usage: BotDataTypes["usage"] }>(`/usage/${safeID}`);
		return res.usage;
	}

	/**
	 * Increments the usage counter for a specific minigame.
	 * @param minigame The key of the minigame to increment (e.g., 'fight', 'snake')
	 *
	 * @internal
	 * THIS IS A REQUEST FOR THE PACKAGE. DO NOT USE MANUALLY!
	 *
	 * @returns {Promise<boolean>} `true` if successful.
	 */
	public async _increaseUsage(minigame: MinigameKey): Promise<boolean> {
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
	 * Fetches a random list of words (used for ChaosWords).
	 * @param length The number of words/length of sentence to generate.
	 * @returns {Promise<string[]>} An array of random words.
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
	 * Fetches a specific sentence for the FastType minigame.
	 * @param {string} difficulty The difficulty level ('easy', 'medium', 'hard')
	 * @returns {Promise<string>} The sentence to type.
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

	/* -------------------------------------------------------------------------- */
	/* FIGHT MINIGAME REQUESTS                           						  */
	/* -------------------------------------------------------------------------- */

	/**
	 * Initializes a new Fight game session in the database.
	 * @param challengerID Discord ID of the user starting the fight
	 * @param challengerUsername Username of the challenger
	 * @param opponentID Discord ID of the user being challenged
	 * @param opponentUsername Username of the opponent
	 * @returns {Promise<string>} The unique Game ID, or error message on failure.
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
	 * Deletes a Fight game session from the API/Database.
	 * @param {string} gameID The ID of the active fight
	 * @returns {Promise<boolean>} `true` if successfully removed.
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
	 * Checks if a specific user is currently participating in an active fight.
	 * @param {string} playerID The Discord ID of the user
	 * @returns {Promise<boolean>} `true` if they are in a game, `false` otherwise.
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
	 * Generates the main gameplay image (card) showing health, avatars, and stats.
	 * @param {string} gameID The ID of the Fight Game
	 * @param {string} challengerIcon URL to Challenger's avatar
	 * @param {string} opponentIcon URL to Opponent's avatar
	 * @returns {Promise<DiscordJS.AttachmentBuilder | null>} An image attachment ready to send.
	 */
	public async makeMainCard(
		gameID: string,
		challengerIcon: string,
		opponentIcon: string
	): Promise<DiscordJS.AttachmentBuilder> {
		try {
			const res = await this.request<{ mainCardBuffer: string }>(`/Fight/makeMainCard`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					challengerIcon,
					opponentIcon,
				}),
			});

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.mainCardBuffer, "base64"), { name: "fight-card.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Request Card: ${error}`);
			return null;
		}
	}

	/**
	 * Generates the initial challenge image sent to the opponent.
	 * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Request image attachment.
	 */
	public async makeRequestCard(
		challengerUsername: string,
		challengerIcon: string,
		opponentUsername: string,
		opponentIcon: string
	): Promise<DiscordJS.AttachmentBuilder> {
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

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.requestCardBuffer, "base64"), {
				name: "fight-request.png",
			});
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Request Card: ${error}`);
			return null;
		}
	}

	/**
	 * Generates the image displayed when a challenge is rejected.
	 * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Deny image attachment.
	 */
	public async makeDenyCard(
		challengerUsername: string,
		challengerIcon: string,
		opponentUsername: string,
		opponentIcon: string
	): Promise<DiscordJS.AttachmentBuilder> {
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

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.denyCardBuffer, "base64"), { name: "fight-deny.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Deny Card: ${error}`);
			return null;
		}
	}

	/**
	 * Generates the image displayed when a player surrenders.
	 * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Surrender image attachment.
	 */
	public async makeSurrenderCard(
		winnerUsername: string,
		winnerIcon: string,
		surrenderUsername: string,
		surrenderIcon: string
	): Promise<DiscordJS.AttachmentBuilder> {
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

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.surrenderCardBuffer, "base64"), {
				name: "fight-surrender.png",
			});
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Surrender Card: ${error}`);
			// @ts-ignore
			const variable = Buffer.from("UG93ZXJlZCBieSBNM3JjZW5h", "base64").toString("utf-8");
			return null;
		}
	}

	/**
	 * Generates the victory image when a player's HP hits 0.
	 * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Win image attachment.
	 */
	public async makeWinCard(
		winnerUsername: string,
		winnerIcon: string,
		loserUsername: string,
		loserIcon: string
	): Promise<DiscordJS.AttachmentBuilder> {
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

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.winCardBuffer, "base64"), { name: "fight-winner.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Winner Card: ${error}`);
			return null;
		}
	}

	/**
	 * Generates the image displayed when the invite timer runs out.
	 * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Timeout image attachment.
	 */
	public async makeTimeOutCard(
		challengerUsername: string,
		challengerIcon: string,
		opponentUsername: string,
		opponentIcon: string
	): Promise<DiscordJS.AttachmentBuilder> {
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

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.timeoutCardBuffer, "base64"), {
				name: "fight-timeout.png",
			});
		} catch (error) {
			this.loggerManager.createError("API", `Failed to create a Timeout Card: ${error}`);
			return null;
		}
	}

	/**
	 * Retrieves the data of the player whose turn it currently is.
	 * @param {string} gameID The ID of the Fight Game
	 * @returns {Promise<{ turn: number; username: string; userID: string } | null>}
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
	 * Swaps the current turn to the other player in the database.
	 * @param {string} gameID The ID of the Fight Game
	 * @returns {Promise<boolean>} `true` if successful.
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

	/**
	 * Retrieves the full stats of a specific player in a game.
	 * @param gameID The active game ID
	 * @param isOpponent `true` to fetch the Opponent, `false` to fetch the Challenger
	 * @returns {Promise<Object | null>} The player object containing health, coins, effects, etc.
	 */
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

	/**
	 * Updates the stats of both players in the database after an action (attack/heal/powerup).
	 * @param gameID The active game ID
	 * @param player1 The updated object for the Challenger
	 * @param player2 The updated object for the Opponent
	 * @returns {Promise<boolean>} `true` if the update was successful.
	 */
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

	/* -------------------------------------------------------------------------- */
	/* 2048 MINIGAME REQUESTS                           						  */
	/* -------------------------------------------------------------------------- */

	/**
	 * Initializes a new 2048 game session.
	 * @returns {Promise<string>} The Game ID, or "-1" on failure.
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
	 * Processes a move direction in 2048 and returns the new board state.
	 * @param direction The direction to slide tiles ("UP", "DOWN", "LEFT", "RIGHT")
	 * @returns {Promise<Object | null>} The updated board state, score, and flags for win/loss.
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
	 * Generates an image representation of the current 2048 grid.
	 */
	public async get2048BoardImage(gameID: string, userIcon: string): Promise<DiscordJS.AttachmentBuilder | null> {
		try {
			const res = await this.request<{ cardBuffer: string }>(`/2048/getBoardImage`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					userIcon,
				}),
			});

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "2048-board.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to generate 2048 board: ${error}`);
			return null;
		}
	}

	/**
	 * Manually ends a 2048 game and cleans up the database.
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

	/* -------------------------------------------------------------------------- */
	/* HANGMAN MINIGAME REQUESTS                          						  */
	/* -------------------------------------------------------------------------- */

	/**
	 * Starts a new Hangman game session with a random word.
	 * @returns {Promise<string>} The Game ID or "-1" on failure.
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
	 * Processes a letter guess for Hangman.
	 * @param letter The single character being guessed.
	 * @returns {Promise<Object | null>} The result of the guess and updated game state.
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
	 * Generates the visual board image for Hangman (showing the hangman drawing and letters).
	 */
	public async getHangmanBoardImage(gameID: string, userIcon: string): Promise<DiscordJS.AttachmentBuilder | null> {
		try {
			const res = await this.request<{ cardBuffer: string }>(`/Hangman/getBoardImage`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					userIcon,
				}),
			});

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "hangman-board.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to generate Hangman board: ${error}`);
			return null;
		}
	}

	/**
	 * Manually ends a Hangman game and cleans up.
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

	/* -------------------------------------------------------------------------- */
	/* WILL YOU PRESS THE BUTTON MINIGAME REQUESTS             					  */
	/* -------------------------------------------------------------------------- */

	/**
	 * Fetches a RANDOM dilemma (question, result, and stats) from the API.
	 * @returns {Promise<DilemmaData | null>} The dilemma data or null on failure.
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
	 * Fetches a SPECIFIC dilemma by ID.
	 * @param {string | number} code The specific ID of the dilemma.
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

	/* -------------------------------------------------------------------------- */
	/* SNAKE MINIGAME REQUESTS                     							      */
	/* -------------------------------------------------------------------------- */

	/**
	 * Starts a new Snake Game session.
	 * @returns {Promise<string>} The Game ID or "-1" on failure.
	 */
	public async createSnakeGame(playerID: string, username: string): Promise<string> {
		try {
			const res = await this.request<{ gameID: string }>(`/Snake/createGame`, {
				method: "POST",
				body: JSON.stringify({
					playerID,
					username,
				}),
			});

			return res.gameID;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to start Snake game: ${error}`);
			return "-1";
		}
	}

	/**
	 * Moves the Snake in the specified direction for the next tick.
	 * @param direction "UP", "DOWN", "LEFT", "RIGHT"
	 * @returns {Promise<Object | null>} The updated score and game state.
	 */
	public async moveSnake(
		gameID: string,
		direction: "UP" | "DOWN" | "LEFT" | "RIGHT"
	): Promise<{
		score: number;
		gameOver: boolean;
		won: boolean;
	} | null> {
		try {
			const res = await this.request<{
				score: number;
				gameOver: boolean;
				won: boolean;
			}>(`/Snake/move`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					direction,
				}),
			});

			return res;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to move in Snake: ${error}`);
			return null;
		}
	}

	/**
	 * Generates the visual board image for Snake (grid, apple, and snake body).
	 */
	public async getSnakeBoardImage(gameID: string, userIcon: string): Promise<DiscordJS.AttachmentBuilder | null> {
		try {
			const res = await this.request<{ cardBuffer: string }>(`/Snake/getBoardImage`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
					userIcon,
				}),
			});

			return new DiscordJS.AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "snake-board.png" });
		} catch (error) {
			this.loggerManager.createError("API", `Failed to generate Snake board: ${error}`);
			return null;
		}
	}

	/**
	 * Manually ends the Snake game and cleans up the session.
	 */
	public async endSnakeGame(gameID: string): Promise<boolean> {
		try {
			const res = await this.request<{ removed: boolean }>(`/Snake/endGame`, {
				method: "POST",
				body: JSON.stringify({
					gameID,
				}),
			});

			return res.removed;
		} catch (error) {
			this.loggerManager.createError("API", `Failed to end Snake game: ${error}`);
			return false;
		}
	}
}
