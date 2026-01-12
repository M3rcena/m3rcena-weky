"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkManager = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
/**
 * Manages all network communication between the Discord Bot and the local Minigame API.
 * Handles authentication, error logging, and data fetching for all game modes.
 */
class NetworkManager {
    baseUrl = "http://localhost:8083/api/v1";
    client;
    loggerManager;
    apiKey;
    /**
     * @param client The Discord Client instance
     * @param loggerManger The custom Logger for reporting API errors
     * @param apiKey The secret key for API authentication
     */
    constructor(client, loggerManger, apiKey) {
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
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
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
        return response.json();
    }
    /**
     * Initializes the connection with the API server.
     * Sends the Bot ID and Username to register the session.
     * @returns {Promise<boolean>} `true` if initialization was successful, `false` otherwise.
     */
    async init() {
        try {
            const botID = this.client.user.id;
            const botName = this.client.user.username;
            const res = await this.request(`/init?botID=${botID}&botName=${botName}`);
            if (res.success) {
                return true;
            }
            return false;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to init bot: ${error}`);
            return false;
        }
    }
    /**
     * Retrieves usage statistics for the bot (e.g., how many times each minigame was played).
     * @returns {Promise<BotDataTypes["usage"]>} An object containing usage counts.
     */
    async getUsage() {
        const safeID = encodeURIComponent(this.client.user.id);
        const res = await this.request(`/usage/${safeID}`);
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
    async _increaseUsage(minigame) {
        try {
            const res = await this.request(`/increaseUsage`, {
                method: "POST",
                body: JSON.stringify({
                    minigame,
                }),
            });
            return res.success;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to increase minigame usage`);
            return false;
        }
    }
    /**
     * Fetches a random list of words (used for ChaosWords).
     * @param length The number of words/length of sentence to generate.
     * @returns {Promise<string[]>} An array of random words.
     */
    async getRandomSentence(length) {
        try {
            const res = await this.request(`/getRandomSentence?length=${length}`);
            return res.word;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to get a random Sentence`);
        }
    }
    /**
     * Fetches a specific sentence for the FastType minigame.
     * @param {string} difficulty The difficulty level ('easy', 'medium', 'hard')
     * @returns {Promise<string>} The sentence to type.
     */
    async getText(difficulty) {
        try {
            const safeDifficulty = encodeURIComponent(difficulty);
            const res = await this.request(`/FastType/getText?difficulty=${safeDifficulty}`);
            return res.sentence;
        }
        catch (error) {
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
    async createGame(challengerID, challengerUsername, opponentID, opponentUsername) {
        try {
            const res = await this.request(`/Fight/createGame`, {
                method: "POST",
                body: JSON.stringify({
                    challengerID,
                    challengerUsername,
                    opponentID,
                    opponentUsername,
                }),
            });
            return res.gameID;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to start the Fight game: ${error}`);
            return "Failed to start game! Please try again.";
        }
    }
    /**
     * Deletes a Fight game session from the API/Database.
     * @param {string} gameID The ID of the active fight
     * @returns {Promise<boolean>} `true` if successfully removed.
     */
    async removeGame(gameID) {
        try {
            const res = await this.request(`/Fight/removeGame?gameID=${gameID}`);
            return res.removed;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to remove the Fight Game from the API: ${error}`);
            return false;
        }
    }
    /**
     * Checks if a specific user is currently participating in an active fight.
     * @param {string} playerID The Discord ID of the user
     * @returns {Promise<boolean>} `true` if they are in a game, `false` otherwise.
     */
    async checkPlayerFightStatus(playerID) {
        try {
            const res = await this.request(`/Fight/isInGame`, {
                method: "POST",
                body: JSON.stringify({
                    playerID,
                }),
            });
            return res.isInGame;
        }
        catch (error) {
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
    async makeMainCard(gameID, challengerIcon, opponentIcon) {
        try {
            const res = await this.request(`/Fight/makeMainCard`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    challengerIcon,
                    opponentIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.mainCardBuffer, "base64"), { name: "fight-card.png" });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to create a Request Card: ${error}`);
            return null;
        }
    }
    /**
     * Generates the initial challenge image sent to the opponent.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Request image attachment.
     */
    async makeRequestCard(challengerUsername, challengerIcon, opponentUsername, opponentIcon) {
        try {
            const res = await this.request(`/Fight/makeRequestCard`, {
                method: "POST",
                body: JSON.stringify({
                    challengerUsername,
                    challengerIcon,
                    opponentUsername,
                    opponentIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.requestCardBuffer, "base64"), {
                name: "fight-request.png",
            });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to create a Request Card: ${error}`);
            return null;
        }
    }
    /**
     * Generates the image displayed when a challenge is rejected.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Deny image attachment.
     */
    async makeDenyCard(challengerUsername, challengerIcon, opponentUsername, opponentIcon) {
        try {
            const res = await this.request(`/Fight/makeDenyCard`, {
                method: "POST",
                body: JSON.stringify({
                    challengerUsername,
                    challengerIcon,
                    opponentUsername,
                    opponentIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.denyCardBuffer, "base64"), { name: "fight-deny.png" });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to create a Deny Card: ${error}`);
            return null;
        }
    }
    /**
     * Generates the image displayed when a player surrenders.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Surrender image attachment.
     */
    async makeSurrenderCard(winnerUsername, winnerIcon, surrenderUsername, surrenderIcon) {
        try {
            const res = await this.request(`/Fight/makeSurrenderCard`, {
                method: "POST",
                body: JSON.stringify({
                    winnerUsername,
                    winnerIcon,
                    surrenderUsername,
                    surrenderIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.surrenderCardBuffer, "base64"), {
                name: "fight-surrender.png",
            });
        }
        catch (error) {
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
    async makeWinCard(winnerUsername, winnerIcon, loserUsername, loserIcon) {
        try {
            const res = await this.request(`/Fight/makeWinCard`, {
                method: "POST",
                body: JSON.stringify({
                    winnerUsername,
                    winnerIcon,
                    loserUsername,
                    loserIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.winCardBuffer, "base64"), { name: "fight-winner.png" });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to create a Winner Card: ${error}`);
            return null;
        }
    }
    /**
     * Generates the image displayed when the invite timer runs out.
     * @returns {Promise<DiscordJS.AttachmentBuilder | null>} The Timeout image attachment.
     */
    async makeTimeOutCard(challengerUsername, challengerIcon, opponentUsername, opponentIcon) {
        try {
            const res = await this.request(`/Fight/makeTimeOutCard`, {
                method: "POST",
                body: JSON.stringify({
                    challengerUsername,
                    challengerIcon,
                    opponentUsername,
                    opponentIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.timeoutCardBuffer, "base64"), {
                name: "fight-timeout.png",
            });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to create a Timeout Card: ${error}`);
            return null;
        }
    }
    /**
     * Retrieves the data of the player whose turn it currently is.
     * @param {string} gameID The ID of the Fight Game
     * @returns {Promise<{ turn: number; username: string; userID: string } | null>}
     */
    async getTurn(gameID) {
        try {
            const res = await this.request(`/Fight/getTurn?gameID=${gameID}`);
            return { turn: res.turn, username: res.username, userID: res.userID };
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to get the user's turn: ${error}`);
            return null;
        }
    }
    /**
     * Swaps the current turn to the other player in the database.
     * @param {string} gameID The ID of the Fight Game
     * @returns {Promise<boolean>} `true` if successful.
     */
    async changeTurn(gameID) {
        try {
            const res = await this.request(`/Fight/changeTurn?gameID=${gameID}`);
            return res.changed;
        }
        catch (error) {
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
    async getPlayer(gameID, isOpponent) {
        try {
            const res = await this.request(`/Fight/getPlayer`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    isOpponent,
                }),
            });
            return res.player;
        }
        catch (error) {
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
    async updatePlayers(gameID, player1, player2) {
        try {
            const res = await this.request(`/Fight/updatePlayers`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    player1,
                    player2,
                }),
            });
            return res.updated;
        }
        catch (error) {
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
    async create2048Game(playerID, username) {
        try {
            const res = await this.request(`/2048/createGame`, {
                method: "POST",
                body: JSON.stringify({
                    playerID,
                    username,
                }),
            });
            return res.gameID;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to start 2048 game: ${error}`);
            return "-1";
        }
    }
    /**
     * Processes a move direction in 2048 and returns the new board state.
     * @param direction The direction to slide tiles ("UP", "DOWN", "LEFT", "RIGHT")
     * @returns {Promise<Object | null>} The updated board state, score, and flags for win/loss.
     */
    async move2048(gameID, direction) {
        try {
            const res = await this.request(`/2048/move`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    direction,
                }),
            });
            return res;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to move in 2048: ${error}`);
            return null;
        }
    }
    /**
     * Generates an image representation of the current 2048 grid.
     */
    async get2048BoardImage(gameID, userIcon) {
        try {
            const res = await this.request(`/2048/getBoardImage`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    userIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "2048-board.png" });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to generate 2048 board: ${error}`);
            return null;
        }
    }
    /**
     * Manually ends a 2048 game and cleans up the database.
     */
    async end2048Game(gameID) {
        try {
            const res = await this.request(`/2048/endGame`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                }),
            });
            return res.removed;
        }
        catch (error) {
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
    async createHangmanGame(playerID, username) {
        try {
            const res = await this.request(`/Hangman/createGame`, {
                method: "POST",
                body: JSON.stringify({
                    playerID,
                    username,
                }),
            });
            return res.gameID;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to start Hangman game: ${error}`);
            return "-1";
        }
    }
    /**
     * Processes a letter guess for Hangman.
     * @param letter The single character being guessed.
     * @returns {Promise<Object | null>} The result of the guess and updated game state.
     */
    async guessHangman(gameID, letter) {
        try {
            const res = await this.request(`/Hangman/guess`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    letter,
                }),
            });
            return res;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to guess in Hangman: ${error}`);
            return null;
        }
    }
    /**
     * Generates the visual board image for Hangman (showing the hangman drawing and letters).
     */
    async getHangmanBoardImage(gameID, userIcon) {
        try {
            const res = await this.request(`/Hangman/getBoardImage`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    userIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "hangman-board.png" });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to generate Hangman board: ${error}`);
            return null;
        }
    }
    /**
     * Manually ends a Hangman game and cleans up.
     */
    async endHangmanGame(gameID) {
        try {
            const res = await this.request(`/Hangman/endGame`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                }),
            });
            return res.success;
        }
        catch (error) {
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
    async getWillYouPressTheButton() {
        try {
            const res = await this.request(`/WillYouPressTheButton/`);
            return res;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to get random WYPTB dilemma: ${error}`);
            return null;
        }
    }
    /**
     * Fetches a SPECIFIC dilemma by ID.
     * @param {string | number} code The specific ID of the dilemma.
     * @returns {Promise<DilemmaData | null>}
     */
    async getWillYouPressTheButtonID(code) {
        try {
            const res = await this.request(`/WillYouPressTheButton/${code}`);
            return res;
        }
        catch (error) {
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
    async createSnakeGame(playerID, username) {
        try {
            const res = await this.request(`/Snake/createGame`, {
                method: "POST",
                body: JSON.stringify({
                    playerID,
                    username,
                }),
            });
            return res.gameID;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to start Snake game: ${error}`);
            return "-1";
        }
    }
    /**
     * Moves the Snake in the specified direction for the next tick.
     * @param direction "UP", "DOWN", "LEFT", "RIGHT"
     * @returns {Promise<Object | null>} The updated score and game state.
     */
    async moveSnake(gameID, direction) {
        try {
            const res = await this.request(`/Snake/move`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    direction,
                }),
            });
            return res;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to move in Snake: ${error}`);
            return null;
        }
    }
    /**
     * Generates the visual board image for Snake (grid, apple, and snake body).
     */
    async getSnakeBoardImage(gameID, userIcon) {
        try {
            const res = await this.request(`/Snake/getBoardImage`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                    userIcon,
                }),
            });
            return new discord_js_1.default.AttachmentBuilder(Buffer.from(res.cardBuffer, "base64"), { name: "snake-board.png" });
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to generate Snake board: ${error}`);
            return null;
        }
    }
    /**
     * Manually ends the Snake game and cleans up the session.
     */
    async endSnakeGame(gameID) {
        try {
            const res = await this.request(`/Snake/endGame`, {
                method: "POST",
                body: JSON.stringify({
                    gameID,
                }),
            });
            return res.removed;
        }
        catch (error) {
            this.loggerManager.createError("API", `Failed to end Snake game: ${error}`);
            return false;
        }
    }
}
exports.NetworkManager = NetworkManager;
