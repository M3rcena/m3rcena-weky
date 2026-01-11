import type { ButtonStyle } from "discord.js";

export interface BotDataTypes {
	botID: string;
	botName: string;
	usage: {
		minigames: {
			mini2024: number;
			calculator: number;
			chaosWords: number;
			fastType: number;
			fight: number;
			guessTheNumber: number;
			guessThePokemon: number;
			hangman: number;
			lieSwatter: number;
			neverHaveIEver: number;
			quickClick: number;
			shuffleGuess: number;
			snake: number;
			willYouPressTheButton: number;
			wouldYouRather: number;
		};
		inits: number;
		totalRequests: number;
	};
}

export interface APIKeys {
	keys: {
		apiKey: string;
		botID: string;
		apiKeyName: string;
	}[];
}

/**
 * FIGHT TYPES
 */
export interface PowerUp {
	id: string;
	label: string;
	style: ButtonStyle;
	cost: number;
	effect: (player: FightDataTypes, opponent: FightDataTypes) => string;
}

export interface FightPlayerType {
	memberId: string;
	username: string;
	health: number;
	lastAttack: string;
	coins: number;
	skipNextTurn: boolean;
	activeEffects: string[];
	specialButtons: string[];
}

export interface FightDataTypes {
	players: FightPlayerType[];
	turn: number;
	createdAt: number;
}

/**
 * 2048 TYPES
 */
export interface Game2048Types {
	gameID: string;
	playerID: string;
	username: string;
	score: number;
	board: number[][];
	gameOver: boolean;
	won: boolean;
}

/**
 * HANGMAN TYPES
 */
export interface HangmanGameTypes {
	gameID: string;
	playerID: string;
	username: string;
	word: string; // The secret word
	displayWord: string; // The word with blanks (e.g., "_ E _ T")
	guessedLetters: string[];
	wrongGuesses: number;
	gameOver: boolean;
	won: boolean;
}

/**
 * WILL YOU PRESS THE BUTTON TYPES
 */
export interface DilemmaData {
	id: string;
	url: string;
	question: string;
	result: string;
	stats: {
		yes: { percentage: string; count: string };
		no: { percentage: string; count: string };
	};
}

/**
 * SNAKE TYPES
 */
export interface Point {
	x: number;
	y: number;
}

export interface SnakeGameTypes {
	gameID: string;
	playerID: string;
	username: string;
	score: number;
	snake: Point[];
	food: Point;
	direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
	gridSize: number;
	gameOver: boolean;
}
