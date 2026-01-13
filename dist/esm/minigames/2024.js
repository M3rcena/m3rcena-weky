import { ButtonBuilder, ButtonStyle, ContainerBuilder, MediaGalleryBuilder, MessageFlags, } from "discord.js";
const activePlayers = new Set();
/**
 * Implementation of the classic 2048 puzzle game as a Discord minigame.
 * @implements {IMinigame}
 */
export default class mini2048 {
    id;
    weky;
    options;
    context;
    // Game State
    gameMessage = null;
    gameID = "-1";
    currentScore = 0;
    userIcon = "";
    isGameActive = false;
    timeoutTimer = null;
    timeLimit;
    // Configs
    gameTitle;
    defaultColor;
    emojiUp;
    emojiDown;
    emojiLeft;
    emojiRight;
    /**
     * Creates an instance of the 2048 minigame.
     * @param weky - The main WekyManager instance.
     * @param options - Configuration options for the game (embeds, emojis, time limits).
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        this.gameTitle = options.embed?.title || "2048";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
        this.emojiUp = options.emojis?.up || "⬆️";
        this.emojiDown = options.emojis?.down || "⬇️";
        this.emojiLeft = options.emojis?.left || "⬅️";
        this.emojiRight = options.emojis?.right || "➡️";
    }
    /**
     * Initializes the game session.
     * Checks for active sessions, generates the initial board image, sends the game message,
     * and registers the game with the EventManager.
     * @returns {Promise<void>}
     */
    async start() {
        if (activePlayers.has(this.id))
            return;
        activePlayers.add(this.id);
        this.isGameActive = true;
        const member = await this.context.guild.members.fetch(this.id).catch(null);
        const username = member?.user.username || "Player";
        this.userIcon = member?.user.displayAvatarURL({ extension: "png" }) || "";
        this.gameMessage = await this.context.channel.send({
            components: [this.createGameContainer("loading")],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        this.gameID = await this.weky.NetworkManager.create2048Game(this.id, username);
        if (this.gameID === "-1") {
            return this.endGame("error", { error: "Could not create game." });
        }
        const initialImg = await this.weky.NetworkManager.get2048BoardImage(this.gameID, this.userIcon);
        if (!initialImg) {
            await this.weky.NetworkManager.end2048Game(this.gameID);
            return this.endGame("error", { error: "Failed to generate board." });
        }
        this.weky._EventManager.register(this);
        await this.gameMessage.edit({
            components: [this.createGameContainer("active", { image: "2048-board.png", score: this.currentScore })],
            files: [initialImg],
            flags: MessageFlags.IsComponentsV2,
        });
        this.timeLimit = this.options.time || 600_000;
        this.resetTimeout();
    }
    // =========================================================================
    // ROUTER METHODS
    // =========================================================================
    /**
     * Handles incoming Discord interactions (button clicks).
     * Routes logic for game moves (up, down, left, right) or quitting.
     * @param interaction - The interaction object from Discord.
     */
    async onInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.user.id !== this.id) {
            if (interaction.message.id === this.gameMessage?.id) {
                return interaction.reply({
                    content: this.options.othersMessage ? this.options.othersMessage : "This is not your game!",
                    flags: [MessageFlags.Ephemeral],
                });
            }
            return;
        }
        if (interaction.message.id !== this.gameMessage?.id)
            return;
        if (interaction.customId === "weky_2048_quit") {
            await interaction.deferUpdate();
            return this.endGame("quit");
        }
        this.resetTimeout();
        const direction = this.mapDirection(interaction.customId);
        if (!direction)
            return;
        await interaction.deferUpdate();
        const moveResult = await this.weky.NetworkManager.move2048(this.gameID, direction);
        if (!moveResult) {
            return interaction.followUp({ content: "Connection error!", flags: [MessageFlags.Ephemeral] });
        }
        if (!moveResult.moved && !moveResult.gameOver) {
            return;
        }
        this.currentScore = moveResult.score;
        if (moveResult.gameOver || moveResult.won) {
            return this.endGame(moveResult.won ? "won" : "gameover");
        }
        const newImg = await this.weky.NetworkManager.get2048BoardImage(this.gameID, this.userIcon);
        if (newImg) {
            try {
                await this.gameMessage.edit({
                    files: [newImg],
                    components: [this.createGameContainer("active", { image: "2048-board.png", score: this.currentScore })],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    // =========================================================================
    // HELPERS
    // =========================================================================
    /**
     * Resets the game inactivity timer.
     * Triggers 'timeout' end state if expired.
     * @private
     */
    resetTimeout() {
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        this.timeoutTimer = setTimeout(() => {
            if (this.isGameActive)
                this.endGame("timeout");
        }, this.timeLimit);
    }
    /**
     * Concludes the game, cleans up resources, and updates the final UI message.
     * @param state - The reason for ending the game (won, gameover, quit, timeout, error).
     * @param details - Optional details such as specific error messages.
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
            finalImg = await this.weky.NetworkManager.get2048BoardImage(this.gameID, this.userIcon);
        }
        if (this.gameID !== "-1") {
            await this.weky.NetworkManager.end2048Game(this.gameID);
        }
        if (this.gameMessage) {
            try {
                await this.gameMessage.edit({
                    components: [
                        this.createGameContainer(state, {
                            image: finalImg ? "2048-board.png" : undefined,
                            score: this.currentScore,
                            error: details?.error,
                        }),
                    ],
                    files: finalImg ? [finalImg] : [],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Maps the button custom ID to the direction string expected by the game logic.
     * @param customId - The interaction custom ID.
     * @returns The direction string ("UP", "DOWN", "LEFT", "RIGHT") or empty string.
     * @private
     */
    mapDirection(customId) {
        switch (customId) {
            case "weky_2048_up":
                return "UP";
            case "weky_2048_down":
                return "DOWN";
            case "weky_2048_left":
                return "LEFT";
            case "weky_2048_right":
                return "RIGHT";
            default:
                return "";
        }
    }
    /**
     * Constructs the message container (Embeds/Buttons) based on the current game state.
     * @param state - The current state of the game (loading, active, won, etc).
     * @param details - Dynamic data to display (score, image attachment name, error text).
     * @returns A constructed ContainerBuilder.
     * @private
     */
    createGameContainer(state, details) {
        const container = new ContainerBuilder();
        let content = "";
        const score = details?.score || 0;
        switch (state) {
            case "loading":
                container.setAccentColor(this.defaultColor);
                content = this.options.loadingMessage
                    ? this.options.loadingMessage.replace("{{gameTitle}}", this.gameTitle)
                    : `## ${this.gameTitle}\n> 🔄 Starting game...`;
                break;
            case "active":
                container.setAccentColor(this.defaultColor);
                content = this.options.activeMessage
                    ? this.options.activeMessage.replace("{{gameTitle}}", this.gameTitle).replace("{{score}}", score.toString())
                    : `## ${this.gameTitle}\n> Combine the tiles to reach **2048**!\n\n**Score:** \`${score}\``;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                content = this.options.wonMessage
                    ? this.options.wonMessage.replace("{{score}}", score.toString())
                    : `## 🎉 You Won!\n> You reached the **2048** tile!\n\n**Final Score:** \`${score}\``;
                break;
            case "gameover":
                container.setAccentColor(0xed4245); // Red
                content = this.options.gameoverMessage
                    ? this.options.gameoverMessage.replace("{{score}}", score.toString())
                    : `## 💀 Game Over\n> No more moves available.\n\n**Final Score:** \`${score}\``;
                break;
            case "quit":
                container.setAccentColor(0xed4245); // Red
                content = this.options.quitMessage
                    ? this.options.quitMessage.replace("{{score}}", score.toString())
                    : `## 🛑 Game Stopped\n> You quit the game.\n\n**Final Score:** \`${score}\``;
                break;
            case "timeout":
                container.setAccentColor(0xed4245); // Red
                content = this.options.timeoutMessage
                    ? this.options.timeoutMessage.replace("{{score}}", score.toString())
                    : `## ⏱️ Time's Up\n> Game session expired.\n\n**Final Score:** \`${score}\``;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = this.options.errorMessage
                    ? this.options.errorMessage.replace("{{error}}", details?.error || "Uknown")
                    : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (details?.image) {
            const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "active") {
            const up = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiUp).setCustomId("weky_2048_up");
            const down = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(this.emojiDown)
                .setCustomId("weky_2048_down");
            const left = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(this.emojiLeft)
                .setCustomId("weky_2048_left");
            const right = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(this.emojiRight)
                .setCustomId("weky_2048_right");
            const stop = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel("Quit")
                .setCustomId("weky_2048_quit")
                .setEmoji("🛑");
            const dis1 = new ButtonBuilder()
                .setLabel(`\u200b`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("dis1")
                .setDisabled(true);
            const dis2 = new ButtonBuilder()
                .setLabel(`\u200b`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("dis2")
                .setDisabled(true);
            container.addActionRowComponents((row) => row.setComponents(dis1, up, dis2, stop));
            container.addActionRowComponents((row) => row.setComponents(left, down, right));
        }
        return container;
    }
}
