"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const activePlayers = new Set();
/**
 * Snake Minigame.
 * A Discord-based implementation of the classic arcade game.
 * Uses an external NetworkManager to handle game state logic (movement, collisions, food)
 * and generates a dynamic image of the board for every turn.
 * [Image of snake game retro grid interface]
 * @implements {IMinigame}
 */
class Snake {
    id;
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    timeoutTimer = null;
    timeLimit;
    // Game State
    isGameActive = false;
    gameID = "-1";
    userIcon = "";
    // Configs
    gameTitle;
    defaultColor;
    emojiUp;
    emojiDown;
    emojiLeft;
    emojiRight;
    /**
     * Initializes the Snake game instance.
     * Configures the game title, theme colors, and directional emojis for the controller.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button emojis and custom colors.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        this.gameTitle = options.embed?.title || "Snake";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
        this.emojiUp = options.emojis?.up || "⬆️";
        this.emojiDown = options.emojis?.down || "⬇️";
        this.emojiLeft = options.emojis?.left || "⬅️";
        this.emojiRight = options.emojis?.right || "➡️";
    }
    /**
     * Begins the game session.
     * 1. Checks for active sessions.
     * 2. Calls the API to initialize a new Snake game state.
     * 3. Fetches the initial board image.
     * 4. Sends the game interface to the channel.
     *
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
        this.gameID = await this.weky.NetworkManager.createSnakeGame(this.id, username);
        if (this.gameID === "-1") {
            return this.endGame("error", {
                error: this.options.errors?.couldNotCreateGame
                    ? this.options.errors.couldNotCreateGame
                    : "Could not create game.",
            });
        }
        const initialImg = await this.weky.NetworkManager.getSnakeBoardImage(this.gameID, this.userIcon);
        if (!initialImg) {
            return this.endGame("error", {
                error: this.options.errors?.failedToGenerateBoard
                    ? this.options.errors.failedToGenerateBoard
                    : "Failed to generate board.",
            });
        }
        this.weky._EventManager.register(this);
        await this.gameMessage.edit({
            components: [this.createGameContainer("active", { image: "snake-board.png" })],
            files: [initialImg],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
        this.timeLimit = this.options.time || 600_000;
        this.resetTimeout();
    }
    // =========================================================================
    // EVENT ROUTER METHODS
    // =========================================================================
    /**
     * Central event handler for the game loop.
     * Processes directional inputs (Up/Down/Left/Right), sends the move to the API,
     * checks for Game Over/Win conditions, and updates the board image.
     *
     * @param interaction - The Discord Interaction object.
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
        if (interaction.customId === "weky_snake_quit") {
            await interaction.deferUpdate();
            return this.endGame("quit");
        }
        const direction = this.mapDirection(interaction.customId);
        if (!direction)
            return;
        await interaction.deferUpdate();
        this.resetTimeout();
        const moveResult = await this.weky.NetworkManager.moveSnake(this.gameID, direction);
        if (!moveResult) {
            return interaction.followUp({
                content: this.options.errors?.connectionError ? this.options.errors.connectionError : "Connection error!",
                flags: [discord_js_1.MessageFlags.Ephemeral],
            });
        }
        if (moveResult.gameOver || moveResult.won) {
            return this.endGame("gameover");
        }
        const newImg = await this.weky.NetworkManager.getSnakeBoardImage(this.gameID, this.userIcon);
        if (newImg) {
            try {
                await this.gameMessage.edit({
                    files: [newImg],
                    components: [this.createGameContainer("active", { image: "snake-board.png" })],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    // =========================================================================
    // UI & HELPERS
    // =========================================================================
    /**
     * Resets the inactivity timer.
     * Called after every valid interaction to ensure the game stays active
     * as long as the player is playing.
     * @private
     */
    resetTimeout() {
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        this.timeoutTimer = setTimeout(() => {
            this.endGame("timeout");
        }, this.timeLimit);
    }
    /**
     * Concludes the game session.
     * Cleans up the database session via API, removes listeners, and displays
     * the final board state (showing where the collision occurred).
     * @param state - The reason for game termination.
     * @param details - Optional error details.
     * @private
     */
    async endGame(state, details) {
        if (!this.isGameActive && state !== "error")
            return;
        this.isGameActive = false;
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        activePlayers.delete(this.id);
        this.weky._EventManager.unregister(this.id);
        let finalImg = null;
        if (state !== "error" && this.gameID !== "-1") {
            finalImg = await this.weky.NetworkManager.getSnakeBoardImage(this.gameID, this.userIcon);
        }
        if (this.gameID !== "-1") {
            await this.weky.NetworkManager.endSnakeGame(this.gameID);
        }
        if (this.gameMessage) {
            try {
                await this.gameMessage.edit({
                    components: [
                        this.createGameContainer(state, { image: finalImg ? "snake-board.png" : undefined, ...details }),
                    ],
                    files: finalImg ? [finalImg] : [],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Maps the button custom IDs to API-compatible direction strings.
     * @param customId - The ID of the clicked button.
     * @returns The direction string or empty string if invalid.
     * @private
     */
    mapDirection(customId) {
        switch (customId) {
            case "weky_snake_up":
                return "UP";
            case "weky_snake_down":
                return "DOWN";
            case "weky_snake_left":
                return "LEFT";
            case "weky_snake_right":
                return "RIGHT";
            default:
                return "";
        }
    }
    /**
     * Constructs the visual interface.
     * Arranges the buttons in a specific layout to mimic a D-Pad (Directional Pad)
     * using Discord ActionRows.
     *
     * @param state - The current game state.
     * @param details - Dynamic data for the embed or image.
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
                    : `## ${this.gameTitle}\n> Use the buttons below to control the snake!`;
                break;
            case "gameover":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.gameover
                    ? this.options.states.gameover
                    : `## 💀 Game Over\n> You hit a wall or yourself!`;
                break;
            case "quit":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.quit ? this.options.states.quit : `## 🛑 Game Stopped\n> You quit the game.`;
                break;
            case "timeout":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.timeout
                    ? this.options.states.timeout
                    : `## ⏱️ Time's Up\n> Game session expired.`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = this.options.states?.error?.main
                    ? this.options.states.error.main.replace("{{error}}", details?.error || this.options.states?.error?.unknownError
                        ? this.options.states.error.unknownError
                        : "Unknown error occurred.")
                    : `## ❌ Error\n> ${details?.error || this.options.states?.error?.unknownError
                        ? this.options.states.error.unknownError
                        : "Unknown error occurred."}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (details?.image) {
            const gallery = new discord_js_1.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "active") {
            const up = new discord_js_1.ButtonBuilder().setStyle(discord_js_1.ButtonStyle.Primary).setLabel(this.emojiUp).setCustomId("weky_snake_up");
            const down = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setLabel(this.emojiDown)
                .setCustomId("weky_snake_down");
            const left = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setLabel(this.emojiLeft)
                .setCustomId("weky_snake_left");
            const right = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setLabel(this.emojiRight)
                .setCustomId("weky_snake_right");
            const stop = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(this.options.quitButton ? this.options.quitButton : "Quit")
                .setCustomId("weky_snake_quit")
                .setEmoji("🛑");
            const dis1 = new discord_js_1.ButtonBuilder()
                .setLabel(`\u200b`)
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setCustomId("weky_snake_dis1")
                .setDisabled(true);
            const dis2 = new discord_js_1.ButtonBuilder()
                .setLabel(`\u200b`)
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setCustomId("weky_snake_dis2")
                .setDisabled(true);
            container.addActionRowComponents((row) => row.setComponents(dis1, up, dis2, stop));
            container.addActionRowComponents((row) => row.setComponents(left, down, right));
        }
        return container;
    }
}
exports.default = Snake;
