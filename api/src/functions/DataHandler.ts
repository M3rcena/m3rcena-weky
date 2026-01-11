import Enmap from "enmap";
import {
	APIKeys,
	BotDataTypes,
	FightDataTypes,
	FightPlayerType,
	Game2048Types,
	HangmanGameTypes,
	Point,
	SnakeGameTypes,
} from "../Types";
import { randomUUID } from "crypto";
import CryptoJS from "crypto-js";
import "dotenv/config";

const SECRET_KEY = process.env.SECRET_KEY;

const defaultUsages: BotDataTypes = {
	botID: "",
	botName: "",
	usage: {
		minigames: {
			mini2024: 0,
			calculator: 0,
			chaosWords: 0,
			fastType: 0,
			fight: 0,
			guessTheNumber: 0,
			guessThePokemon: 0,
			hangman: 0,
			lieSwatter: 0,
			neverHaveIEver: 0,
			quickClick: 0,
			shuffleGuess: 0,
			snake: 0,
			willYouPressTheButton: 0,
			wouldYouRather: 0,
		},
		inits: 1,
		totalRequests: 1,
	},
};

type MinigameKey = keyof BotDataTypes["usage"]["minigames"];

export default class DataHandler {
	private botData: Enmap<string, BotDataTypes>;
	private fightData: Enmap<string, FightDataTypes>;
	private apiKeyData: Enmap<string, APIKeys>;
	private game2048Data: Enmap<string, Game2048Types>;
	private hangmanData: Enmap<string, HangmanGameTypes>;
	private snakeData: Enmap<string, SnakeGameTypes>;

	constructor() {
		this.botData = new Enmap<string, BotDataTypes>({
			name: "botData",
			dataDir: "./src/db/BotData",
		});

		this.fightData = new Enmap<string, FightDataTypes>({
			name: "fightData",
			dataDir: "./src/db/Fight",
		});

		this.apiKeyData = new Enmap<string, APIKeys>({
			name: "botData",
			dataDir: "./src/db/ApiKeys",
		});

		this.game2048Data = new Enmap<string, Game2048Types>({
			name: "game2048Data",
			dataDir: "./src/db/Game2048",
		});

		this.hangmanData = new Enmap<string, HangmanGameTypes>({
			name: "hangmanData",
			dataDir: "./src/db/Hangman",
		});

		this.snakeData = new Enmap<string, SnakeGameTypes>({
			name: "snakeData",
			dataDir: "./src/db/Snake",
		});
	}

	/**
	 * Creates a new bot entry if it doesn't exist
	 * If it DOES exists, it returns the existing data.
	 */
	public create(botID: string, botName: string): BotDataTypes {
		const initialData: BotDataTypes = { ...defaultUsages, botID, botName };

		return this.botData.ensure(botID, initialData);
	}

	/**
	 * Remove a bot from the database.
	 */
	public remove(botID: string): boolean {
		if (!this.botData.has(botID)) return false;
		this.botData.delete(botID);
		return true;
	}

	/**
	 * Update a bot from the database
	 */
	public update(botID: string, newData: Partial<BotDataTypes>): BotDataTypes {
		if (!this.botData.has(botID)) return null;

		const current = this.botData.get(botID) as BotDataTypes;
		if (!current) return null;

		const updated = { ...current, ...newData };

		this.botData.set(botID, updated);
		return updated;
	}

	/**
	 * Create a new API Key
	 */
	public createAPIKey(botID: string, apiKey: string, apiName: string, ownerID: string): boolean {
		try {
			if (this.isBotIDTaken(botID)) {
				return false;
			}

			const encryptedKey = CryptoJS.AES.encrypt(apiKey, SECRET_KEY).toString();

			const newKeyEntry = {
				apiKey: encryptedKey,
				botID: botID,
				apiKeyName: apiName,
			};

			if (!this.apiKeyData.has(ownerID)) {
				this.apiKeyData.set(ownerID, {
					keys: [newKeyEntry],
				});
			} else {
				const userData = this.apiKeyData.get(ownerID) as APIKeys;

				userData.keys.push(newKeyEntry);

				this.apiKeyData.set(ownerID, userData);
			}

			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Returns ALL API keys for a specific owner, decrypted.
	 * Returns null if owner not found or error occurs.
	 */
	public getAllAPIKeys(ownerID: string): { botID: string; apiKey: string; apiKeyName: string }[] | null {
		try {
			if (!this.apiKeyData.has(ownerID)) {
				return null;
			}

			const userData = this.apiKeyData.get(ownerID) as APIKeys;

			return userData.keys.map((entry) => {
				const bytes = CryptoJS.AES.decrypt(entry.apiKey, SECRET_KEY);
				const decryptedKey = bytes.toString(CryptoJS.enc.Utf8);

				return {
					botID: entry.botID,
					apiKey: decryptedKey,
					apiKeyName: entry.apiKeyName,
				};
			});
		} catch (error) {
			console.error("Failed to fetch keys:", error);
			return null;
		}
	}

	/**
	 * Removes a specific API key by botID.
	 */
	public removeAPIKey(ownerID: string, botID: string): boolean {
		try {
			if (!this.apiKeyData.has(ownerID)) return false;

			const userData = this.apiKeyData.get(ownerID) as APIKeys;
			const initialLength = userData.keys.length;

			userData.keys = userData.keys.filter((k) => k.botID !== botID);

			if (userData.keys.length === initialLength) {
				return false;
			}

			// 3. Save update
			this.apiKeyData.set(ownerID, userData);
			return true;
		} catch (error) {
			console.error("Failed to remove key:", error);
			return false;
		}
	}

	/**
	 * Updates an existing API key.
	 * Pass 'null' for any value you do NOT want to change.
	 */
	public updateAPIKey(ownerID: string, botID: string, newApiKey: string | null, newApiName: string | null): boolean {
		try {
			if (!this.apiKeyData.has(ownerID)) return false;

			const userData = this.apiKeyData.get(ownerID) as APIKeys;

			const keyIndex = userData.keys.findIndex((k) => k.botID === botID);

			if (keyIndex === -1) return false;

			if (newApiKey !== null) {
				const encrypted = CryptoJS.AES.encrypt(newApiKey, SECRET_KEY).toString();
				userData.keys[keyIndex].apiKey = encrypted;
			}

			if (newApiName !== null) {
				userData.keys[keyIndex].apiKeyName = newApiName;
			}

			this.apiKeyData.set(ownerID, userData);
			return true;
		} catch (error) {
			console.error("Failed to update key:", error);
			return false;
		}
	}

	/**
	 * Checks if a botID is already registered by ANY owner in the database.
	 * Returns true if the botID is taken.
	 */
	public isBotIDTaken(botID: string): boolean {
		const allData = Array.from(this.apiKeyData.values()) as unknown as APIKeys[];

		for (const userData of allData) {
			if (userData && Array.isArray(userData.keys)) {
				if (userData.keys.some((key) => key.botID === botID)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Validates an API key for a specific botID.
	 * Does NOT require ownerID.
	 */
	public validateApiKey(botID: string, rawApiKey: string): boolean {
		try {
			// 1. Iterate through ALL users to find the botID
			const allData = Array.from(this.apiKeyData.values()) as unknown as APIKeys[];

			for (const userData of allData) {
				if (!userData || !userData.keys) continue;

				const targetKeyEntry = userData.keys.find((k) => k.botID === botID);

				if (targetKeyEntry) {
					const bytes = CryptoJS.AES.decrypt(targetKeyEntry.apiKey, SECRET_KEY);
					const decryptedStoredKey = bytes.toString(CryptoJS.enc.Utf8);

					return decryptedStoredKey === rawApiKey;
				}
			}

			return false;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Increases usage counter.
	 */
	public incrementUsage(botID: string, key: "totalRequests", amount?: number): number;

	public incrementUsage<K extends keyof Omit<BotDataTypes["usage"], "minigames" | "totalRequests">>(
		botID: string,
		key: K,
		amount?: number
	): number;

	public incrementUsage<K extends "minigames", M extends MinigameKey>(
		botID: string,
		key: K,
		amount: number,
		minigame: M
	): number;

	public incrementUsage(botID: string, key: string, amount: number = 1, minigame?: string): number {
		if (!this.botData.has(botID)) return -1;

		const dbPath = minigame ? `usage.${key}.${minigame}` : `usage.${key}`;

		this.botData.math(botID, "+", amount, dbPath as any);

		const data = this.botData.get(botID) as BotDataTypes | undefined;
		if (!data) return 0;

		if (minigame) {
			return (data.usage.minigames as any)[minigame];
		}
		return (data.usage as any)[key];
	}

	/**
	 * Get the full data object for a bot.
	 */
	public get(botID: string): BotDataTypes | null {
		return this.botData.get(botID) || null;
	}

	/**
	 * Get a SINGLE specific field (e.g., just the name).
	 * This is strictly typed: you can only request keys that exist in BotDataTypes.
	 */
	public getField<K extends keyof BotDataTypes>(botID: string, key: K): BotDataTypes[K] | null {
		if (!this.botData.has(botID)) return null;

		const data = this.botData.get(botID);

		if (!data) return null;

		return data[key];
	}

	/**
	 *
	 * FIGHT MINIGAME DATABASE
	 *
	 */

	/**
	 * Create a Fight minigame to the Database
	 */
	public createFight(
		challengerID: string,
		challengerUsername: string,
		opponentID: string,
		opponentUsername: string
	): string {
		const gameId = randomUUID();

		const initialData: FightDataTypes = {
			turn: 0,
			createdAt: Date.now(),
			players: [
				this.initializePlayer(challengerID, challengerUsername),
				this.initializePlayer(opponentID, opponentUsername),
			],
		};

		this.fightData.ensure(gameId, initialData);
		return gameId;
	}

	/**
	 * Remove a Fight minigame from the Database
	 */
	public removeFight(gameID: string): boolean {
		this.fightData.delete(gameID);
		return true;
	}

	/**
	 * Helper to set default stats for a player at start of fight
	 */
	private initializePlayer(memberId: string, username: string): FightPlayerType {
		return {
			memberId: memberId,
			username: username,
			health: 100,
			lastAttack: "none",
			coins: 0,
			skipNextTurn: false,
			activeEffects: [],
			specialButtons: [],
		};
	}

	/**
	 * Helper to find if a user is currently participating in any active fight.
	 */
	public isPlayerInFight(userId: string): boolean {
		return this.fightData.some((fight: FightDataTypes) => {
			return fight.players.some((player) => player.memberId === userId);
		});
	}

	/**
	 * Get a fight from the Datbase
	 */
	public getFight(gameId: string): FightDataTypes | null {
		return this.fightData.get(gameId) || null;
	}

	/**
	 * Get the Player from the Database
	 */
	public getPlayer(gameId: string, isOpponent: boolean): FightPlayerType | null {
		const fightData = this.fightData.get(gameId) as FightDataTypes;

		if (!fightData) return null;

		let player: FightPlayerType;

		if (isOpponent) {
			player = fightData.players[fightData.turn == 0 ? 1 : 0];
		} else {
			player = fightData.players[fightData.turn];
		}

		return player;
	}

	/**
	 * Get Players turn
	 */
	public getTurn(gameID: string): { turn: number; username: string; userID: string } {
		const fightData = this.fightData.get(gameID) as FightDataTypes;

		return {
			turn: fightData.turn,
			username: fightData.players[fightData.turn].username,
			userID: fightData.players[fightData.turn].memberId,
		};
	}

	/**
	 * Change Turns
	 */
	public changeTurn(gameID: string): boolean {
		const fightData = this.fightData.get(gameID) as FightDataTypes;

		if (!fightData) return false;

		fightData.turn = fightData.turn === 0 ? 1 : 0;

		this.fightData.set(gameID, fightData);
		return true;
	}

	/**
	 * Update Players
	 */
	public updatePlayers(gameID: string, player1: FightPlayerType, player2: FightPlayerType): boolean {
		const game = this.fightData.get(gameID) as FightDataTypes;

		if (!game) return false;

		const existingIds = game.players.map((p) => p.memberId);
		const incomingIds = [player1.memberId, player2.memberId];

		const isValidUpdate = incomingIds.every((id) => existingIds.includes(id));
		if (!isValidUpdate) return false;

		game.players = game.players.map((p) => (p.memberId === player1.memberId ? player1 : player2));

		this.fightData.set(gameID, game);
		return true;
	}

	/**
	 *
	 * 2048 MINIGAME DATABASE
	 *
	 */

	/**
	 * Create a new 2048 game
	 */
	public create2048(playerID: string, username: string): string {
		// 1. Check if player already has a game
		const allGames = Array.from(this.game2048Data.values()) as unknown as Game2048Types[];

		const existing = allGames.find((g) => g.playerID === playerID);

		if (existing) return existing.gameID;

		const gameID = randomUUID();

		// 2. Initialize Empty 4x4 Board
		const board = Array(4)
			.fill(0)
			.map(() => Array(4).fill(0));

		// 3. Spawn two starting numbers
		this.spawn2048Tile(board);
		this.spawn2048Tile(board);

		const initialData: Game2048Types = {
			gameID,
			playerID,
			username,
			score: 0,
			board,
			gameOver: false,
			won: false,
		};

		this.game2048Data.set(gameID, initialData);
		return gameID;
	}

	/**
	 * Get game data
	 */
	public get2048(gameID: string): Game2048Types | null {
		return this.game2048Data.get(gameID) || null;
	}

	/**
	 * Remove a game (Game Over or Quit)
	 */
	public remove2048(gameID: string): boolean {
		if (!this.game2048Data.has(gameID)) return false;
		this.game2048Data.delete(gameID);
		return true;
	}

	/**
	 * The Main Logic: Handle a move request
	 * Direction: "UP" | "DOWN" | "LEFT" | "RIGHT"
	 */
	public move2048(
		gameID: string,
		direction: string
	): {
		board: number[][];
		score: number;
		moved: boolean;
		gameOver: boolean;
		won: boolean;
	} {
		const game = this.game2048Data.get(gameID);
		if (!game) throw new Error("Game not found");
		if (game.gameOver) return { ...game, moved: false };

		let moved = false;
		let scoreGained = 0;
		let newBoard = game.board.map((row) => [...row]); // Deep copy

		// Helper to process a single row (slide & merge)
		const processRow = (row: number[]): number[] => {
			// 1. Remove zeros
			let filtered = row.filter((val) => val !== 0);
			let merged: number[] = [];

			// 2. Merge adjacent equals
			for (let i = 0; i < filtered.length; i++) {
				if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
					const combined = filtered[i] * 2;
					merged.push(combined);
					scoreGained += combined;
					i++; // Skip next element since we merged it
				} else {
					merged.push(filtered[i]);
				}
			}

			// 3. Pad with zeros back to length 4
			while (merged.length < 4) {
				merged.push(0);
			}
			return merged;
		};

		// TRANSFORM BOARD BASED ON DIRECTION
		// The strategy: Rotate/Flip board so we always just "Process Row Left", then rotate back.

		if (direction === "LEFT") {
			// Simple: Process every row
			newBoard = newBoard.map((row) => {
				const newRow = processRow(row);
				if (newRow.join(",") !== row.join(",")) moved = true;
				return newRow;
			});
		} else if (direction === "RIGHT") {
			// Reverse row -> Process -> Reverse back
			newBoard = newBoard.map((row) => {
				const reversed = [...row].reverse();
				const newRow = processRow(reversed);
				if (newRow.join(",") !== reversed.join(",")) moved = true;
				return newRow.reverse();
			});
		} else if (direction === "UP") {
			// Transpose (rows become cols) -> Process -> Transpose back
			let transposed = this.transposeMatrix(newBoard);
			transposed = transposed.map((row) => {
				const newRow = processRow(row);
				if (newRow.join(",") !== row.join(",")) moved = true;
				return newRow;
			});
			newBoard = this.transposeMatrix(transposed);
		} else if (direction === "DOWN") {
			// Transpose -> Reverse -> Process -> Reverse -> Transpose
			let transposed = this.transposeMatrix(newBoard);
			transposed = transposed.map((row) => {
				const reversed = [...row].reverse();
				const newRow = processRow(reversed);
				if (newRow.join(",") !== reversed.join(",")) moved = true;
				return newRow.reverse();
			});
			newBoard = this.transposeMatrix(transposed);
		}

		// AFTER MOVE LOGIC
		if (moved) {
			game.board = newBoard;
			game.score += scoreGained;

			// Spawn new tile
			this.spawn2048Tile(game.board);

			// Check Win Condition (First time hitting 2048)
			if (!game.won && this.hasWon(game.board)) {
				game.won = true;
			}

			// Check Game Over (No moves left)
			if (this.isGameOver(game.board)) {
				game.gameOver = true;
			}

			// Save to DB
			this.game2048Data.set(gameID, game);
		}

		return {
			board: game.board,
			score: game.score,
			moved,
			gameOver: game.gameOver,
			won: game.won,
		};
	}

	/**
	 * PRIVATE HELPER: Spawns a 2 (90%) or 4 (10%) in a random empty slot
	 */
	private spawn2048Tile(board: number[][]) {
		const emptySpots: { r: number; c: number }[] = [];
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				if (board[r][c] === 0) emptySpots.push({ r, c });
			}
		}

		if (emptySpots.length > 0) {
			const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
			board[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
		}
	}

	/**
	 * PRIVATE HELPER: Check if 2048 exists
	 */
	private hasWon(board: number[][]): boolean {
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				if (board[r][c] >= 2048) return true;
			}
		}
		return false;
	}

	/**
	 * PRIVATE HELPER: Check if no moves are possible
	 */
	private isGameOver(board: number[][]): boolean {
		// 1. Check for empty spots
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				if (board[r][c] === 0) return false;
			}
		}

		// 2. Check for any adjacent identical numbers
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				const val = board[r][c];
				// Check right
				if (c < 3 && val === board[r][c + 1]) return false;
				// Check down
				if (r < 3 && val === board[r + 1][c]) return false;
			}
		}

		return true;
	}

	/**
	 * PRIVATE HELPER: Matrix Transpose (Swap rows/cols)
	 */
	private transposeMatrix(matrix: number[][]): number[][] {
		return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
	}

	/**
	 *
	 * HANGMAN MINIGAME DATABASE
	 *
	 */

	/**
	 * Create a new Hangman game
	 */
	public createHangman(playerID: string, username: string, word: string): string {
		const allGames = Array.from(this.hangmanData.values()) as unknown as HangmanGameTypes[];

		const existing = allGames.find((g) => g.playerID === playerID);
		if (existing) return existing.gameID;

		const gameID = randomUUID();
		const displayWord = word
			.split("")
			.map((char) => (/[a-zA-Z]/.test(char) ? "_" : char))
			.join(" ");

		const initialData: HangmanGameTypes = {
			gameID,
			playerID,
			username,
			word: word.toUpperCase(),
			displayWord,
			guessedLetters: [],
			wrongGuesses: 0,
			gameOver: false,
			won: false,
		};

		this.hangmanData.set(gameID, initialData);
		return gameID;
	}

	/**
	 * Get Hangman game data
	 */
	public getHangman(gameID: string): HangmanGameTypes | null {
		return this.hangmanData.get(gameID) || null;
	}

	/**
	 * Remove a Hangman game
	 */
	public removeHangman(gameID: string): boolean {
		if (!this.hangmanData.has(gameID)) return false;
		this.hangmanData.delete(gameID);
		return true;
	}

	/**
	 * Handle a Guess
	 */
	public guessHangman(
		gameID: string,
		letter: string
	): {
		success: boolean;
		message: string;
		game: HangmanGameTypes;
	} {
		const game = this.hangmanData.get(gameID) as HangmanGameTypes;

		if (!game) throw new Error("Game not found");
		if (game.gameOver) return { success: false, message: "Game Over", game };

		const guess = letter.toUpperCase();

		if (game.guessedLetters.includes(guess)) {
			return { success: false, message: "Already guessed that letter!", game };
		}

		game.guessedLetters.push(guess);

		if (game.word.includes(guess)) {
			const newDisplay = game.word
				.split("")
				.map((char) => (game.guessedLetters.includes(char) || !/[A-Z]/.test(char) ? char : "_"))
				.join(" ");

			game.displayWord = newDisplay;

			if (!newDisplay.includes("_")) {
				game.won = true;
				game.gameOver = true;
			}
		} else {
			game.wrongGuesses++;
			if (game.wrongGuesses >= 6) {
				game.gameOver = true;
				game.displayWord = game.word.split("").join(" ");
			}
		}

		this.hangmanData.set(gameID, game);
		return { success: true, message: "Guessed", game };
	}

	/**
	 *
	 * SNAKE MINIGAME DATABASE
	 *
	 */

	/**
	 * Create a new Snake Game
	 */
	public createSnake(playerID: string, username: string): string {
		const allGames = Array.from(this.snakeData.values()) as unknown as SnakeGameTypes[];

		const existing = allGames.find((g) => g.playerID === playerID);

		if (existing) return existing.gameID;

		const gameID = randomUUID();
		const gridSize = 15;

		const startX = Math.floor(gridSize / 2);
		const startY = Math.floor(gridSize / 2);

		const snake: Point[] = [
			{ x: startX, y: startY },
			{ x: startX, y: startY + 1 },
			{ x: startX, y: startY + 2 },
		];

		const initialData: SnakeGameTypes = {
			gameID,
			playerID,
			username,
			score: 0,
			snake,
			food: this.spawnSnakeFood(snake, gridSize),
			direction: "UP",
			gridSize,
			gameOver: false,
		};

		this.snakeData.set(gameID, initialData);
		return gameID;
	}

	public getSnake(gameID: string): SnakeGameTypes | null {
		return this.snakeData.get(gameID) || null;
	}

	public removeSnake(gameID: string): boolean {
		if (!this.snakeData.has(gameID)) return false;
		this.snakeData.delete(gameID);
		return true;
	}

	/**
	 * Move Snake Logic
	 */
	public moveSnake(gameID: string, direction: "UP" | "DOWN" | "LEFT" | "RIGHT") {
		const game = this.snakeData.get(gameID);
		if (!game || game.gameOver) throw new Error("Game not valid");

		const opposites = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
		if (opposites[game.direction] === direction) {
			direction = game.direction;
		}

		const head = { ...game.snake[0] };

		switch (direction) {
			case "UP":
				head.y -= 1;
				break;
			case "DOWN":
				head.y += 1;
				break;
			case "LEFT":
				head.x -= 1;
				break;
			case "RIGHT":
				head.x += 1;
				break;
		}

		if (head.x < 0 || head.x >= game.gridSize || head.y < 0 || head.y >= game.gridSize) {
			game.gameOver = true;
			this.snakeData.set(gameID, game);
			return game;
		}

		const hitSelf = game.snake.some((part, index) => {
			if (index === game.snake.length - 1 && !(head.x === game.food.x && head.y === game.food.y)) return false;
			return part.x === head.x && part.y === head.y;
		});

		if (hitSelf) {
			game.gameOver = true;
			this.snakeData.set(gameID, game);
			return game;
		}

		game.snake.unshift(head);
		game.direction = direction;

		if (head.x === game.food.x && head.y === game.food.y) {
			game.score += 1;
			game.food = this.spawnSnakeFood(game.snake, game.gridSize);
		} else {
			game.snake.pop();
		}

		this.snakeData.set(gameID, game);
		return game;
	}

	private spawnSnakeFood(snake: Point[], size: number): Point {
		let valid = false;
		let x = 0;
		let y = 0;

		while (!valid) {
			x = Math.floor(Math.random() * size);
			y = Math.floor(Math.random() * size);

			const onSnake = snake.some((p) => p.x === x && p.y === y);
			if (!onSnake) valid = true;
		}
		return { x, y };
	}
}
