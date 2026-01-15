import {
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
import { Bot, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const SECRET_KEY = process.env.SECRET_KEY || "default_secret";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
	adapter,
});

type MinigameKey = keyof BotDataTypes["usage"]["minigames"];

export default class DataHandler {
	constructor() {
		// Prisma connects lazily, no explicit init needed
	}

	/**
	 * Creates a new bot entry if it doesn't exist
	 */
	public async create(botID: string, botName: string): Promise<BotDataTypes> {
		const bot = await prisma.bot.upsert({
			where: { botID },
			update: {},
			create: {
				botID,
				botName,
			},
		});

		return this.mapPrismaBotToType(bot);
	}

	public async remove(botID: string): Promise<boolean> {
		try {
			await prisma.bot.delete({ where: { botID } });
			return true;
		} catch (e) {
			return false;
		}
	}

	public async update(botID: string, newData: Partial<BotDataTypes>): Promise<BotDataTypes> {
		try {
			const updateData: Partial<Bot> = {};
			if (newData.botName) updateData.botName = newData.botName;

			const bot = await prisma.bot.update({
				where: { botID },
				data: updateData,
			});

			return this.mapPrismaBotToType(bot);
		} catch (error) {
			return null;
		}
	}

	/**
	 * API KEY MANAGEMENT
	 */
	public async createAPIKey(botID: string, apiKey: string, apiName: string, ownerID: string): Promise<boolean> {
		try {
			const existing = await prisma.apiKey.findUnique({ where: { botID } });
			if (existing) return false;

			const encryptedKey = CryptoJS.AES.encrypt(apiKey, SECRET_KEY).toString();

			await prisma.apiKey.create({
				data: {
					ownerID,
					botID,
					apiKey: encryptedKey,
					apiKeyName: apiName,
				},
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	public async getAllAPIKeys(ownerID: string): Promise<{ botID: string; apiKey: string; apiKeyName: string }[] | null> {
		try {
			const keys = await prisma.apiKey.findMany({
				where: { ownerID },
			});

			if (!keys || keys.length === 0) return null;

			return keys.map((entry) => {
				const bytes = CryptoJS.AES.decrypt(entry.apiKey, SECRET_KEY);
				const decryptedKey = bytes.toString(CryptoJS.enc.Utf8);
				return {
					botID: entry.botID,
					apiKey: decryptedKey,
					apiKeyName: entry.apiKeyName,
				};
			});
		} catch (error) {
			return null;
		}
	}

	public async removeAPIKey(ownerID: string, botID: string): Promise<boolean> {
		try {
			const result = await prisma.apiKey.deleteMany({
				where: {
					ownerID: ownerID,
					botID: botID,
				},
			});
			return result.count > 0;
		} catch (error) {
			return false;
		}
	}

	public async updateAPIKey(
		ownerID: string,
		botID: string,
		newApiKey: string | null,
		newApiName: string | null
	): Promise<boolean> {
		try {
			const dataToUpdate: any = {};
			if (newApiKey !== null) {
				dataToUpdate.apiKey = CryptoJS.AES.encrypt(newApiKey, SECRET_KEY).toString();
			}
			if (newApiName !== null) {
				dataToUpdate.apiKeyName = newApiName;
			}

			const result = await prisma.apiKey.updateMany({
				where: { ownerID, botID },
				data: dataToUpdate,
			});

			return result.count > 0;
		} catch (error) {
			return false;
		}
	}

	public async isBotIDTaken(botID: string): Promise<boolean> {
		const count = await prisma.apiKey.count({
			where: { botID },
		});
		return count > 0;
	}

	public async validateApiKey(botID: string, rawApiKey: string): Promise<boolean> {
		try {
			const entry = await prisma.apiKey.findUnique({
				where: { botID },
			});

			if (!entry) return false;

			const bytes = CryptoJS.AES.decrypt(entry.apiKey, SECRET_KEY);
			const decryptedStoredKey = bytes.toString(CryptoJS.enc.Utf8);

			return decryptedStoredKey === rawApiKey;
		} catch (error) {
			return false;
		}
	}

	/**
	 * USAGE INCREMENTER
	 * Maps the dynamic "minigame" string to the specific database column
	 */
	public async incrementUsage(botID: string, key: "totalRequests", amount?: number): Promise<number>;
	public async incrementUsage<K extends keyof Omit<BotDataTypes["usage"], "minigames" | "totalRequests">>(
		botID: string,
		key: K,
		amount?: number
	): Promise<number>;
	public async incrementUsage<K extends "minigames", M extends MinigameKey>(
		botID: string,
		key: K,
		amount: number,
		minigame: M
	): Promise<number>;

	public async incrementUsage(botID: string, key: string, amount: number = 1, minigame?: string): Promise<number> {
		try {
			let updateQuery: any = {};

			if (minigame) {
				const colName = `usage_${minigame}`;
				updateQuery[colName] = { increment: amount };
			} else {
				updateQuery[key] = { increment: amount };
			}

			const updated = await prisma.bot.update({
				where: { botID },
				data: updateQuery,
			});

			if (minigame) {
				return (updated as any)[`usage_${minigame}`] as number;
			}
			return (updated as any)[key] as number;
		} catch (e) {
			return 0;
		}
	}

	public async get(botID: string): Promise<BotDataTypes | null> {
		const bot = await prisma.bot.findUnique({ where: { botID } });
		return bot ? this.mapPrismaBotToType(bot) : null;
	}

	public async getField<K extends keyof BotDataTypes>(botID: string, key: K): Promise<BotDataTypes[K] | null> {
		const data = await this.get(botID);
		return data ? data[key] : null;
	}

	/**
	 * FIGHT MINIGAME
	 */
	public async createFight(
		challengerID: string,
		challengerUsername: string,
		opponentID: string,
		opponentUsername: string
	): Promise<string> {
		const gameId = randomUUID();
		const players = [
			this.initializePlayer(challengerID, challengerUsername),
			this.initializePlayer(opponentID, opponentUsername),
		];

		await prisma.fightGame.create({
			data: {
				gameID: gameId,
				turn: 0,
				players: players as any,
			},
		});

		return gameId;
	}

	public async removeFight(gameID: string): Promise<boolean> {
		try {
			await prisma.fightGame.delete({ where: { gameID } });
			return true;
		} catch {
			return false;
		}
	}

	public async isPlayerInFight(userId: string): Promise<boolean> {
		const games = await prisma.fightGame.findMany();
		return games.some((g) => {
			const players = g.players as unknown as FightPlayerType[];
			return players.some((p) => p.memberId === userId);
		});
	}

	public async getFight(gameId: string): Promise<FightDataTypes | null> {
		const game = await prisma.fightGame.findUnique({ where: { gameID: gameId } });
		if (!game) return null;
		return {
			...game,
			createdAt: game.createdAt.getTime(),
			players: game.players as unknown as FightPlayerType[],
		};
	}

	public async getPlayer(gameId: string, isOpponent: boolean): Promise<FightPlayerType | null> {
		const game = await this.getFight(gameId);
		if (!game) return null;

		let player: FightPlayerType;
		if (isOpponent) {
			player = game.players[game.turn == 0 ? 1 : 0];
		} else {
			player = game.players[game.turn];
		}
		return player;
	}

	public async getTurn(gameID: string): Promise<{ turn: number; username: string; userID: string }> {
		const game = await this.getFight(gameID);
		if (!game) throw new Error("Game not found");

		return {
			turn: game.turn,
			username: game.players[game.turn].username,
			userID: game.players[game.turn].memberId,
		};
	}

	public async changeTurn(gameID: string): Promise<boolean> {
		const game = await this.getFight(gameID);
		if (!game) return false;

		const newTurn = game.turn === 0 ? 1 : 0;
		await prisma.fightGame.update({
			where: { gameID },
			data: { turn: newTurn },
		});
		return true;
	}

	public async updatePlayers(gameID: string, player1: FightPlayerType, player2: FightPlayerType): Promise<boolean> {
		const game = await this.getFight(gameID);
		if (!game) return false;

		const existingIds = game.players.map((p) => p.memberId);
		if (!existingIds.includes(player1.memberId) || !existingIds.includes(player2.memberId)) return false;

		const updatedPlayers = game.players.map((p) => (p.memberId === player1.memberId ? player1 : player2));

		await prisma.fightGame.update({
			where: { gameID },
			data: { players: updatedPlayers as any },
		});
		return true;
	}

	private initializePlayer(memberId: string, username: string): FightPlayerType {
		return {
			memberId,
			username,
			health: 100,
			lastAttack: "none",
			coins: 0,
			skipNextTurn: false,
			activeEffects: [],
			specialButtons: [],
		};
	}

	/**
	 * 2048 MINIGAME
	 */
	public async create2048(playerID: string, username: string): Promise<string> {
		const existing = await prisma.game2048.findUnique({ where: { playerID } });
		if (existing) return existing.gameID;

		const gameID = randomUUID();
		const board = Array(4)
			.fill(0)
			.map(() => Array(4).fill(0));
		this.spawn2048Tile(board);
		this.spawn2048Tile(board);

		await prisma.game2048.create({
			data: {
				gameID,
				playerID,
				username,
				score: 0,
				board: board as any,
				gameOver: false,
				won: false,
			},
		});
		return gameID;
	}

	public async get2048(gameID: string): Promise<Game2048Types | null> {
		const game = await prisma.game2048.findUnique({ where: { gameID } });
		if (!game) return null;
		return { ...game, board: game.board as number[][] };
	}

	public async remove2048(gameID: string): Promise<boolean> {
		try {
			await prisma.game2048.delete({ where: { gameID } });
			return true;
		} catch {
			return false;
		}
	}

	public async move2048(gameID: string, direction: string) {
		const game = await this.get2048(gameID);
		if (!game) throw new Error("Game not found");
		if (game.gameOver) return { ...game, moved: false };

		let moved = false;
		let scoreGained = 0;
		let newBoard = game.board.map((row) => [...row]);

		const processRow = (row: number[]): number[] => {
			let filtered = row.filter((val) => val !== 0);
			let merged: number[] = [];
			for (let i = 0; i < filtered.length; i++) {
				if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
					const combined = filtered[i] * 2;
					merged.push(combined);
					scoreGained += combined;
					i++;
				} else {
					merged.push(filtered[i]);
				}
			}
			while (merged.length < 4) merged.push(0);
			return merged;
		};

		if (direction === "LEFT") {
			newBoard = newBoard.map((row) => {
				const newRow = processRow(row);
				if (newRow.join(",") !== row.join(",")) moved = true;
				return newRow;
			});
		} else if (direction === "RIGHT") {
			newBoard = newBoard.map((row) => {
				const reversed = [...row].reverse();
				const newRow = processRow(reversed);
				if (newRow.join(",") !== reversed.join(",")) moved = true;
				return newRow.reverse();
			});
		} else if (direction === "UP") {
			let transposed = this.transposeMatrix(newBoard);
			transposed = transposed.map((row) => {
				const newRow = processRow(row);
				if (newRow.join(",") !== row.join(",")) moved = true;
				return newRow;
			});
			newBoard = this.transposeMatrix(transposed);
		} else if (direction === "DOWN") {
			let transposed = this.transposeMatrix(newBoard);
			transposed = transposed.map((row) => {
				const reversed = [...row].reverse();
				const newRow = processRow(reversed);
				if (newRow.join(",") !== reversed.join(",")) moved = true;
				return newRow.reverse();
			});
			newBoard = this.transposeMatrix(transposed);
		}

		if (moved) {
			game.board = newBoard;
			game.score += scoreGained;
			this.spawn2048Tile(game.board);

			if (!game.won && this.hasWon(game.board)) game.won = true;
			if (this.isGameOver(game.board)) game.gameOver = true;

			await prisma.game2048.update({
				where: { gameID },
				data: {
					board: game.board as any,
					score: game.score,
					won: game.won,
					gameOver: game.gameOver,
				},
			});
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
	 * HANGMAN
	 */
	public async createHangman(playerID: string, username: string, word: string): Promise<string> {
		const existing = await prisma.hangman.findUnique({ where: { playerID } });
		if (existing) return existing.gameID;

		const gameID = randomUUID();
		const displayWord = word
			.split("")
			.map((char) => (/[a-zA-Z]/.test(char) ? "_" : char))
			.join(" ");

		await prisma.hangman.create({
			data: {
				gameID,
				playerID,
				username,
				word: word.toUpperCase(),
				displayWord,
				guessedLetters: [],
				wrongGuesses: 0,
			},
		});
		return gameID;
	}

	public async getHangman(gameID: string): Promise<HangmanGameTypes | null> {
		return await prisma.hangman.findUnique({ where: { gameID } });
	}

	public async removeHangman(gameID: string): Promise<boolean> {
		try {
			await prisma.hangman.delete({ where: { gameID } });
			return true;
		} catch {
			return false;
		}
	}

	public async guessHangman(gameID: string, letter: string) {
		const game = await this.getHangman(gameID);
		if (!game) throw new Error("Game not found");
		if (game.gameOver) return { success: false, message: "Game Over", game };

		const guess = letter.toUpperCase();
		if (game.guessedLetters.includes(guess)) {
			return { success: false, message: "Already guessed that letter!", game };
		}

		const updatedLetters = [...game.guessedLetters, guess];
		let updatedDisplay = game.displayWord;
		let updatedWrong = game.wrongGuesses;
		let updatedWon = game.won;
		let updatedGameOver = game.gameOver;

		if (game.word.includes(guess)) {
			updatedDisplay = game.word
				.split("")
				.map((char) => (updatedLetters.includes(char) || !/[A-Z]/.test(char) ? char : "_"))
				.join(" ");

			if (!updatedDisplay.includes("_")) {
				updatedWon = true;
				updatedGameOver = true;
			}
		} else {
			updatedWrong++;
			if (updatedWrong >= 6) {
				updatedGameOver = true;
				updatedDisplay = game.word.split("").join(" ");
			}
		}

		const updatedGame = await prisma.hangman.update({
			where: { gameID },
			data: {
				guessedLetters: updatedLetters,
				displayWord: updatedDisplay,
				wrongGuesses: updatedWrong,
				won: updatedWon,
				gameOver: updatedGameOver,
			},
		});

		return { success: true, message: "Guessed", game: updatedGame };
	}

	/**
	 * SNAKE
	 */
	public async createSnake(playerID: string, username: string): Promise<string> {
		const existing = await prisma.snake.findUnique({ where: { playerID } });
		if (existing) return existing.gameID;

		const gameID = randomUUID();
		const gridSize = 15;
		const startX = Math.floor(gridSize / 2);
		const snake: Point[] = [
			{ x: startX, y: Math.floor(gridSize / 2) },
			{ x: startX, y: Math.floor(gridSize / 2) + 1 },
			{ x: startX, y: Math.floor(gridSize / 2) + 2 },
		];

		await prisma.snake.create({
			data: {
				gameID,
				playerID,
				username,
				snake: snake as any,
				food: this.spawnSnakeFood(snake, gridSize) as any,
				direction: "UP",
				gridSize,
				score: 0,
			},
		});
		return gameID;
	}

	public async getSnake(gameID: string): Promise<SnakeGameTypes | null> {
		const game = await prisma.snake.findUnique({ where: { gameID } });
		if (!game) return null;
		return {
			...game,
			snake: game.snake as unknown as Point[],
			food: game.food as unknown as Point,
			direction: game.direction as "UP" | "DOWN" | "LEFT" | "RIGHT",
		};
	}

	public async removeSnake(gameID: string): Promise<boolean> {
		try {
			await prisma.snake.delete({ where: { gameID } });
			return true;
		} catch {
			return false;
		}
	}

	public async moveSnake(gameID: string, direction: "UP" | "DOWN" | "LEFT" | "RIGHT") {
		let game = await this.getSnake(gameID);
		if (!game || game.gameOver) throw new Error("Game not valid");

		const opposites = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

		if (opposites[game.direction] === direction) direction = game.direction;

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

		let isGameOver = false;
		if (head.x < 0 || head.x >= game.gridSize || head.y < 0 || head.y >= game.gridSize) {
			isGameOver = true;
		}

		const hitSelf = game.snake.some((part, index) => {
			if (index === game.snake.length - 1 && !(head.x === game.food.x && head.y === game.food.y)) return false;
			return part.x === head.x && part.y === head.y;
		});
		if (hitSelf) isGameOver = true;

		if (isGameOver) {
			await prisma.snake.update({ where: { gameID }, data: { gameOver: true } });
			game.gameOver = true;
			return game;
		}

		const newSnake = [head, ...game.snake];
		let newScore = game.score;
		let newFood = game.food;

		if (head.x === game.food.x && head.y === game.food.y) {
			newScore += 1;
			newFood = this.spawnSnakeFood(newSnake, game.gridSize);
		} else {
			newSnake.pop();
		}

		const updated = await prisma.snake.update({
			where: { gameID },
			data: {
				snake: newSnake as any,
				score: newScore,
				food: newFood as any,
				direction,
			},
		});

		return { ...updated, snake: updated.snake as unknown as Point[], food: updated.food as unknown as Point };
	}

	// --- PRIVATE HELPERS ---

	// Maps the flat DB structure back to your nested Typescript object
	private mapPrismaBotToType(bot: Bot): BotDataTypes {
		return {
			botID: bot.botID,
			botName: bot.botName,
			usage: {
				inits: bot.inits,
				totalRequests: bot.totalRequests,
				minigames: {
					mini2024: bot.usage_mini2024,
					calculator: bot.usage_calculator,
					chaosWords: bot.usage_chaosWords,
					fastType: bot.usage_fastType,
					fight: bot.usage_fight,
					guessTheNumber: bot.usage_guessTheNumber,
					guessThePokemon: bot.usage_guessThePokemon,
					hangman: bot.usage_hangman,
					lieSwatter: bot.usage_lieSwatter,
					neverHaveIEver: bot.usage_neverHaveIEver,
					quickClick: bot.usage_quickClick,
					shuffleGuess: bot.usage_shuffleGuess,
					snake: bot.usage_snake,
					willYouPressTheButton: bot.usage_willYouPressTheButton,
					wouldYouRather: bot.usage_wouldYouRather,
				},
			},
		};
	}

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

	private hasWon(board: number[][]): boolean {
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				if (board[r][c] >= 2048) return true;
			}
		}
		return false;
	}

	private isGameOver(board: number[][]): boolean {
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				if (board[r][c] === 0) return false;
			}
		}
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < 4; c++) {
				const val = board[r][c];
				if (c < 3 && val === board[r][c + 1]) return false;
				if (r < 3 && val === board[r + 1][c]) return false;
			}
		}
		return true;
	}

	private transposeMatrix(matrix: number[][]): number[][] {
		return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
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
