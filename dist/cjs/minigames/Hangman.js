"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const activePlayers = new Set();
/**
 * Hangman Minigame.
 * A classic word-guessing game where players suggest letters to reveal a hidden word.
 * Features dynamic board image generation (drawing the stick figure) via the NetworkManager.
 * @implements {IMinigame}
 */
class Hangman {
    id;
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    timeoutTimer = null;
    // Game State
    isGameActive = false;
    gameID = "-1";
    finalWord = "Unknown";
    userIcon = "";
    // Configs
    gameTitle;
    defaultColor;
    /**
     * Initializes the Hangman game instance.
     * Configures the game title, theme colors, and user identity.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including embed customization and time limits.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        // Config Init
        this.gameTitle = options.embed?.title || "Hangman";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
    }
    /**
     * Begins the game session.
     * Requests a new game state from the backend (fetching a random word), generates the initial
     * empty board image, and deploys the game interface to the Discord channel.
     */
    async start() {
        if (activePlayers.has(this.id))
            return;
        activePlayers.add(this.id);
        this.isGameActive = true;
        const member = await this.context.guild?.members.fetch(this.id).catch(null);
        const username = member?.user.username || "Player";
        this.userIcon = member?.user.displayAvatarURL({ extension: "png" }) || "";
        this.gameMessage = await this.context.channel.send({
            components: [this.createGameContainer("loading")],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        this.gameID = await this.weky.NetworkManager.createHangmanGame(this.id, username);
        if (this.gameID === "-1") {
            return this.endGame("error", {
                error: this.options.errors?.failedToStart ? this.options.errors.failedToStart : "Failed to start game.",
            });
        }
        const attachment = await this.weky.NetworkManager.getHangmanBoardImage(this.gameID, this.userIcon);
        if (!attachment) {
            return this.endGame("error", {
                error: this.options.errors?.failedToGenerate
                    ? this.options.errors.failedToGenerate
                    : "Failed to generate game board.",
            });
        }
        this.weky._EventManager.register(this);
        await this.gameMessage.edit({
            components: [this.createGameContainer("active", { image: "hangman-board.png" })],
            files: [attachment],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
        const timeLimit = this.options.time || 180_000;
        this.timeoutTimer = setTimeout(() => {
            if (this.isGameActive)
                this.endGame("timeout");
        }, timeLimit);
    }
    // =========================================================================
    // EVENT ROUTER METHODS
    // =========================================================================
    /**
     * Event handler for letter guesses.
     * Validates that the input is a single alphabetical character, submits the guess to the API,
     * updates the visual board state, and checks for win/loss conditions.
     * @param message - The Discord Message object.
     */
    async onMessage(message) {
        if (message.channelId !== this.context.channel.id)
            return;
        if (message.author.id !== this.id)
            return;
        if (message.author.bot)
            return;
        const char = message.content.trim().charAt(0).toLowerCase();
        if (!char || !/[a-z]/i.test(char)) {
            if (message.content.length === 1 && message.deletable)
                await message.delete().catch(() => { });
            return;
        }
        if (message.deletable)
            await message.delete().catch(() => { });
        const response = await this.weky.NetworkManager.guessHangman(this.gameID, char);
        if (!response) {
            return this.endGame("error", {
                error: this.options.errors?.noApiResponse ? this.options.errors.noApiResponse : "API did not respond.",
            });
        }
        if (!response.success) {
            const warning = await this.context.channel.send(`<@${this.id}>, ${response.message}`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }
        const { game } = response;
        this.finalWord = game.word;
        const attachment = await this.weky.NetworkManager.getHangmanBoardImage(this.gameID, this.userIcon);
        if (game.gameOver) {
            await this.endGame(game.won ? "won" : "lost", { image: "hangman-board.png", word: game.word }, attachment);
        }
        else {
            if (this.gameMessage) {
                await this.gameMessage.edit({
                    components: [this.createGameContainer("active", { image: "hangman-board.png" })],
                    files: attachment ? [attachment] : [],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
        }
    }
    /**
     * Event handler for letter guesses.
     * Validates that the input is a single alphabetical character, submits the guess to the API,
     * updates the visual board state, and checks for win/loss conditions.
     * @param message - The Discord Message object.
     */
    async onInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.user.id !== this.id) {
            if (interaction.message.id === this.gameMessage?.id) {
                return interaction.reply({
                    content: this.options.othersMessage ? this.options.othersMessage : "This is not your game!",
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
            }
            return;
        }
        if (interaction.message.id !== this.gameMessage?.id)
            return;
        if (interaction.customId === "hangman_quit") {
            await interaction.deferUpdate();
            return this.endGame("quit");
        }
    }
    // =========================================================================
    // UI & HELPERS
    // =========================================================================
    /**
     * Concludes the game session.
     * Cleans up event listeners, removes the session from the database, and updates the UI
     * to reveal the hidden word and the final board state.
     * @param state - The reason for game termination (won, lost, quit, timeout).
     * @param details - Final game data (the word, the final image).
     * @param attachment - The final generated image file.
     * @private
     */
    async endGame(state, details, attachment) {
        if (!this.isGameActive && state !== "error")
            return;
        this.isGameActive = false;
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        activePlayers.delete(this.id);
        this.weky._EventManager.unregister(this.id);
        if (this.gameID !== "-1") {
            await this.weky.NetworkManager.endHangmanGame(this.gameID);
        }
        const wordToShow = details?.word || (this.finalWord !== "Unknown" ? this.finalWord : "Hidden");
        if (this.gameMessage) {
            try {
                await this.gameMessage.edit({
                    components: [this.createGameContainer(state, { ...details, word: wordToShow })],
                    files: attachment ? [attachment] : [],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Constructs the visual interface.
     * Generates the Embed state (showing the prompt or final result) and attaches the
     * dynamic Hangman drawing.
     * @param state - The current game state.
     * @param details - Data to populate the embed (hidden/revealed word).
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    createGameContainer(state, details) {
        const container = new discord_js_1.ContainerBuilder();
        let content = "";
        switch (state) {
            case "loading":
                container.setAccentColor(this.defaultColor);
                content = this.options.states?.loading
                    ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle)
                    : `## ${this.gameTitle}\n> 🔄 Starting game...`;
                break;
            case "active":
                container.setAccentColor(this.defaultColor);
                content = this.options.states?.active
                    ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle)
                    : `## ${this.gameTitle}\n> Type a letter in the chat to guess!`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                content = this.options.states?.won
                    ? this.options.states.won.replace("{{word}}", details?.word)
                    : `## 🎉 Victory!\n> You guessed the word: **${details?.word}**`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.lost
                    ? this.options.states.lost.replace("{{word}}", details?.word)
                    : `## 💀 Game Over\n> The word was: **${details?.word}**`;
                break;
            case "quit":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.quit
                    ? this.options.states.quit.replace("{{word}}", details?.word)
                    : `## 🛑 Game Stopped\n> You quit the game. The word is **${details?.word}**`;
                break;
            case "timeout":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.timeout
                    ? this.options.states.timeout.replace("{{word}}", details?.word)
                    : `## ⏱️ Time's Up\n> Session expired. The word was: **${details?.word}**`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = this.options.states?.error?.main
                    ? this.options.states.error.main.replace("{{error}}", details?.error || this.options.states?.error?.unknownError
                        ? this.options.states.error.unknownError
                        : "Unknown error.")
                    : `## ❌ Error\n> ${details?.error || this.options.states?.error?.unknownError
                        ? this.options.states.error.unknownError
                        : "Unknown error."}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (details?.image) {
            const gallery = new discord_js_1.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "active") {
            const quitBtn = new discord_js_1.ButtonBuilder()
                .setLabel(this.options.quitButton ? this.options.quitButton : "Quit Game")
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setCustomId("hangman_quit")
                .setEmoji("🛑");
            container.addActionRowComponents((row) => row.setComponents(quitBtn));
        }
        return container;
    }
}
exports.default = Hangman;
