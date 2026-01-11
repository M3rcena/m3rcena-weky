import DiscordJS from "discord.js";
import type { LoggerManager } from "./LoggerManager.js";
import type { BotDataTypes, DilemmaData } from "../Types/index.js";
type MinigameKey = keyof BotDataTypes["usage"]["minigames"];
/**
 * Manages all network communication between the Discord Bot and the local Minigame API.
 * Handles authentication, error logging, and data fetching for all game modes.
 */
export declare class NetworkManager {
    private baseUrl;
    private client;
    private loggerManager;
    private apiKey;
    /**
     * @param client The Discord Client instance
     * @param loggerManger The custom Logger for reporting API errors
     * @param apiKey The secret key for API authentication
     */
    constructor(client: DiscordJS.Client, loggerManger: LoggerManager, apiKey: string);
    /**
     * Internal wrapper for `fetch` that handles headers, authentication, and error logging.
     * @template T The expected return type of the API response
     * @param endpoint The API endpoint (e.g., `/init`)
     * @param options Fetch options (method, body, etc.)
     */
    private request;
    /**
     * Initializes the connection with the API server.
     * Sends the Bot ID and Username to register the session.
     * @returns {Promise<boolean>} `true` if initialization was successful, `false` otherwise.
     */
    init(): Promise<boolean>;
    /**
     * Retrieves usage statistics for the bot (e.g., how many times each minigame was played).
     * @returns {Promise<BotDataTypes["usage"]>} An object containing usage counts.
     */
    getUsage(): Promise<BotDataTypes["usage"]>;
    /**
     * Increments the usage counter for a specific minigame.
     * @param minigame The key of the minigame to increment (e.g., 'fight', 'snake')
     *
     * @internal
     * THIS IS A REQUEST FOR THE PACKAGE. DO NOT USE MANUALLY!
     *
     * @returns {Promise<boolean>} `true` if successful.
     */
    _increaseUsage(minigame: MinigameKey): Promise<boolean>;
    /**
     * Fetches a random list of words (used for ChaosWords).
     * @param length The number of words/length of sentence to generate.
     * @returns {Promise<string[]>} An array of random words.
     */
    getRandomSentence(length: number): Promise<string[]>;
    /**
     * Fetches a specific sentence for the FastType minigame.
     * @param {string} difficulty The difficulty level ('easy', 'medium', 'hard')
     * @returns {Promise<string>} The sentence to type.
     */
    getText(difficulty: string): Promise<string>;
    /**
     * Initializes a new Fight game session in the database.
     * @param challengerID Discord ID of the user starting the fight
     * @param challengerUsername Username of the challenger
     * @param opponentID Discord ID of the user being challenged
     * @param opponentUsername Username of the opponent
     * @returns {Promise<string>} The unique Game ID, or error message on failure.
     */
    createGame(challengerID: string, challengerUsername: string, opponentID: string, opponentUsername: string): Promise<string>;
    /**
     * Deletes a Fight game session from the API/Database.
     * @param {string} gameID The ID of the active fight
     * @returns {Promise<boolean>} `true` if successfully removed.
     */
    removeGame(gameID: string): Promise<boolean>;
    /**
     * Checks if a specific user is currently participating in an active fight.
     * @param {string} playerID The Discord ID of the user
     * @returns {Promise<boolean>} `true` if they are in a game, `false` otherwise.
     */
    checkPlayerFightStatus(playerID: string): Promise<boolean>;
    /**
     * Generates the main gameplay image (card) showing health, avatars, and stats.
     * @param {string} gameID The ID of the Fight Game
     * @param {string} challengerIcon URL to Challenger's avatar
     * @param {string} opponentIcon URL to Opponent's avatar
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} An image attachment ready to send.
     */
    makeMainCard(gameID: string, challengerIcon: string, opponentIcon: string): Promise<DiscordJS.AttachmentBuilder>;
    /**
     * Generates the initial challenge image sent to the opponent.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Request image attachment.
     */
    makeRequestCard(challengerUsername: string, challengerIcon: string, opponentUsername: string, opponentIcon: string): Promise<DiscordJS.AttachmentBuilder>;
    /**
     * Generates the image displayed when a challenge is rejected.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Deny image attachment.
     */
    makeDenyCard(challengerUsername: string, challengerIcon: string, opponentUsername: string, opponentIcon: string): Promise<DiscordJS.AttachmentBuilder>;
    /**
     * Generates the image displayed when a player surrenders.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Surrender image attachment.
     */
    makeSurrenderCard(winnerUsername: string, winnerIcon: string, surrenderUsername: string, surrenderIcon: string): Promise<DiscordJS.AttachmentBuilder>;
    /**
     * Generates the victory image when a player's HP hits 0.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Win image attachment.
     */
    makeWinCard(winnerUsername: string, winnerIcon: string, loserUsername: string, loserIcon: string): Promise<DiscordJS.AttachmentBuilder>;
    /**
     * Generates the image displayed when the invite timer runs out.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Timeout image attachment.
     */
    makeTimeOutCard(challengerUsername: string, challengerIcon: string, opponentUsername: string, opponentIcon: string): Promise<DiscordJS.AttachmentBuilder>;
    /**
     * Retrieves the data of the player whose turn it currently is.
     * @param {string} gameID The ID of the Fight Game
     * @returns {Promise<{ turn: number; username: string; userID: string } | null>}
     */
    getTurn(gameID: string): Promise<{
        turn: number;
        username: string;
        userID: string;
    }>;
    /**
     * Swaps the current turn to the other player in the database.
     * @param {string} gameID The ID of the Fight Game
     * @returns {Promise<boolean>} `true` if successful.
     */
    changeTurn(gameID: string): Promise<boolean>;
    /**
     * Retrieves the full stats of a specific player in a game.
     * @param gameID The active game ID
     * @param isOpponent `true` to fetch the Opponent, `false` to fetch the Challenger
     * @returns {Promise<Object | null>} The player object containing health, coins, effects, etc.
     */
    getPlayer(gameID: string, isOpponent: boolean): Promise<{
        memberId: string;
        username: string;
        health: number;
        lastAttack: string;
        coins: number;
        skipNextTurn: boolean;
        activeEffects: string[];
        specialButtons: string[];
    }>;
    /**
     * Updates the stats of both players in the database after an action (attack/heal/powerup).
     * @param gameID The active game ID
     * @param player1 The updated object for the Challenger
     * @param player2 The updated object for the Opponent
     * @returns {Promise<boolean>} `true` if the update was successful.
     */
    updatePlayers(gameID: string, player1: {
        memberId: string;
        username: string;
        health: number;
        lastAttack: string;
        coins: number;
        skipNextTurn: boolean;
        activeEffects: string[];
        specialButtons: string[];
    }, player2: {
        memberId: string;
        username: string;
        health: number;
        lastAttack: string;
        coins: number;
        skipNextTurn: boolean;
        activeEffects: string[];
        specialButtons: string[];
    }): Promise<boolean>;
    /**
     * Initializes a new 2048 game session.
     * @returns {Promise<string>} The Game ID, or "-1" on failure.
     */
    create2048Game(playerID: string, username: string): Promise<string>;
    /**
     * Processes a move direction in 2048 and returns the new board state.
     * @param direction The direction to slide tiles ("UP", "DOWN", "LEFT", "RIGHT")
     * @returns {Promise<Object | null>} The updated board state, score, and flags for win/loss.
     */
    move2048(gameID: string, direction: string): Promise<{
        board: number[][];
        score: number;
        moved: boolean;
        gameOver: boolean;
        won: boolean;
    } | null>;
    /**
     * Generates an image representation of the current 2048 grid.
     */
    get2048BoardImage(gameID: string, userIcon: string): Promise<DiscordJS.AttachmentBuilder | null>;
    /**
     * Manually ends a 2048 game and cleans up the database.
     */
    end2048Game(gameID: string): Promise<boolean>;
    /**
     * Starts a new Hangman game session with a random word.
     * @returns {Promise<string>} The Game ID or "-1" on failure.
     */
    createHangmanGame(playerID: string, username: string): Promise<string>;
    /**
     * Processes a letter guess for Hangman.
     * @param letter The single character being guessed.
     * @returns {Promise<Object | null>} The result of the guess and updated game state.
     */
    guessHangman(gameID: string, letter: string): Promise<{
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
    } | null>;
    /**
     * Generates the visual board image for Hangman (showing the hangman drawing and letters).
     */
    getHangmanBoardImage(gameID: string, userIcon: string): Promise<DiscordJS.AttachmentBuilder | null>;
    /**
     * Manually ends a Hangman game and cleans up.
     */
    endHangmanGame(gameID: string): Promise<boolean>;
    /**
     * Fetches a RANDOM dilemma (question, result, and stats) from the API.
     * @returns {Promise<DilemmaData | null>} The dilemma data or null on failure.
     */
    getWillYouPressTheButton(): Promise<DilemmaData | null>;
    /**
     * Fetches a SPECIFIC dilemma by ID.
     * @param {string | number} code The specific ID of the dilemma.
     * @returns {Promise<DilemmaData | null>}
     */
    getWillYouPressTheButtonID(code: string | number): Promise<DilemmaData | null>;
    /**
     * Starts a new Snake Game session.
     * @returns {Promise<string>} The Game ID or "-1" on failure.
     */
    createSnakeGame(playerID: string, username: string): Promise<string>;
    /**
     * Moves the Snake in the specified direction for the next tick.
     * @param direction "UP", "DOWN", "LEFT", "RIGHT"
     * @returns {Promise<Object | null>} The updated score and game state.
     */
    moveSnake(gameID: string, direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): Promise<{
        score: number;
        gameOver: boolean;
        won: boolean;
    } | null>;
    /**
     * Generates the visual board image for Snake (grid, apple, and snake body).
     */
    getSnakeBoardImage(gameID: string, userIcon: string): Promise<DiscordJS.AttachmentBuilder | null>;
    /**
     * Manually ends the Snake game and cleans up the session.
     */
    endSnakeGame(gameID: string): Promise<boolean>;
}
export {};
