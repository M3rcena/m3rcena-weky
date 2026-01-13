import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags } from "discord.js";
const activeChannels = new Set();
const activeUsers = new Set();
/**
 * QuickClick Minigame.
 * A reaction-based game where a 5x5 grid of disabled buttons is displayed.
 * After a random interval, one button becomes active, and the first player to click it wins.
 * @implements {IMinigame}
 */
export default class QuickClick {
    id;
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    waitTimer = null;
    gameTimer = null;
    // Game State
    isGameActive = false;
    buttons = [];
    winningIndex = -1;
    gameCreatedAt = 0;
    winningButtonId = "weky_correct";
    // Configs
    gameTitle;
    emoji;
    messages;
    /**
     * Initializes the QuickClick game instance.
     * Sets up the game configuration, including the target emoji, time limits,
     * and custom victory/defeat messages.
     * @param weky - The WekyManager instance.
     * @param options - Configuration options for the game.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        this.gameTitle = options.embed?.title || "Quick Click";
        this.emoji = options.emoji || "👆";
        this.messages = {
            wait: options.waitMessage || "The buttons may appear anytime now...",
            start: options.startMessage || "Find the **{{emoji}}** button! You have **{{time}}**!",
            win: options.winMessage || "🏆 GG <@{{winner}}>! You pressed it in **{{time}}s**.",
            lose: options.loseMessage || "❌ Time's up! No one pressed the button.",
            ongoing: options.ongoingMessage || "A game is already running in <#{{channel}}>. Finish that first!",
        };
    }
    /**
     * Begins the game session.
     * Enforces concurrency limits (one game per channel/user), generates the initial
     * 5x5 grid of disabled buttons, and starts the random "waiting" timer.
     */
    async start() {
        const channelId = this.context.channel.id;
        if (activeChannels.has(channelId)) {
            const errorText = this.messages.ongoing.replace("{{channel}}", channelId);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents((text) => text.setContent(this.options.errors?.main
                ? this.options.errors.main.replace("{{error}}", errorText)
                : `## ❌ Error\n${errorText}`));
            return this.context.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
        if (activeUsers.has(this.id)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents((text) => text.setContent(this.options.errors?.gameAlreadyRunning
                ? this.options.errors.gameAlreadyRunning
                : `## ❌ Error\n> You already have a game running! Finish that one first.`));
            return this.context.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
        activeChannels.add(channelId);
        activeUsers.add(this.id);
        this.isGameActive = true;
        this.buttons = [];
        for (let i = 0; i < 25; i++) {
            this.buttons.push(new ButtonBuilder()
                .setLabel("\u200b")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(this.weky.getRandomString(20))
                .setDisabled(true));
        }
        this.gameMessage = await this.context.channel.send({
            components: [this.createGameContainer("waiting")],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        this.weky._EventManager.register(this);
        const waitTime = Math.floor(Math.random() * 5000) + 1000;
        this.waitTimer = setTimeout(() => this.activateGame(), waitTime);
    }
    /**
     * Transitions the game from "Waiting" to "Active".
     * Selects a random button from the grid, enables it, applies the target emoji,
     * and starts the reaction timer.
     * @private
     */
    async activateGame() {
        if (!this.gameMessage)
            return this.endGame("lost");
        this.gameCreatedAt = Date.now();
        this.winningIndex = Math.floor(Math.random() * this.buttons.length);
        this.buttons[this.winningIndex]
            .setStyle(ButtonStyle.Primary)
            .setEmoji(this.emoji)
            .setCustomId(this.winningButtonId)
            .setDisabled(false);
        const timeString = this.weky.convertTime(this.options.time || 60000);
        try {
            await this.gameMessage.edit({
                components: [this.createGameContainer("active", { timeLeft: timeString })],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        catch (e) {
            return this.endGame("lost");
        }
        const timeLimit = this.options.time || 60000;
        this.gameTimer = setTimeout(() => {
            if (this.isGameActive)
                this.endGame("lost");
        }, timeLimit);
    }
    // =========================================================================
    // EVENT ROUTER METHODS
    // =========================================================================
    /**
     * Event handler for button interactions.
     * Detects if the user clicked the correct "active" button.
     * Calculates the reaction time and triggers the win state if correct.
     * @param interaction - The Discord Interaction object.
     */
    async onInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.customId === this.winningButtonId) {
            if (interaction.message.id !== this.gameMessage?.id)
                return;
            await interaction.deferUpdate();
            const timeTaken = ((Date.now() - this.gameCreatedAt) / 1000).toFixed(2);
            return this.endGame("won", {
                winner: interaction.user.id,
                timeTaken: timeTaken,
            });
        }
    }
    // =========================================================================
    // UI & HELPERS
    // =========================================================================
    /**
     * Concludes the game session.
     * Cleans up timers and active status sets. Updates the grid to reflect
     * the outcome (highlighting the correct button in green on win).
     * @param state - The final game state (won/lost).
     * @param data - Metadata for the results (winner ID, time taken).
     * @private
     */
    async endGame(state, data) {
        if (!this.isGameActive)
            return;
        this.isGameActive = false;
        if (this.waitTimer)
            clearTimeout(this.waitTimer);
        if (this.gameTimer)
            clearTimeout(this.gameTimer);
        activeChannels.delete(this.context.channel.id);
        activeUsers.delete(this.id);
        this.weky._EventManager.unregister(this.id);
        if (state === "won") {
            this.buttons[this.winningIndex].setDisabled(true).setStyle(ButtonStyle.Success);
        }
        else {
            this.buttons[this.winningIndex].setDisabled(true).setStyle(ButtonStyle.Secondary);
        }
        if (this.gameMessage) {
            try {
                await this.gameMessage.edit({
                    components: [this.createGameContainer(state, data)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Constructs the visual interface.
     * Generates the Embed and the 5x5 ActionRow grid of buttons.
     * Handles the visual state changes between Waiting, Active, and Finished phases.
     * @param state - The current game state.
     * @param data - Dynamic data for the UI.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    createGameContainer(state, data) {
        const container = new ContainerBuilder();
        let content = "";
        switch (state) {
            case "waiting":
                container.setAccentColor(0x5865f2);
                content = this.options.states?.waiting
                    ? this.options.states.waiting
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{messagesWait}}", this.messages.wait)
                    : `## ${this.gameTitle}\n> ⏳ ${this.messages.wait}`;
                break;
            case "active":
                container.setAccentColor(0x5865f2);
                const startText = this.messages.start
                    .replace("{{time}}", data?.timeLeft || "60s")
                    .replace("{{emoji}}", this.emoji);
                content = this.options.states?.active
                    ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{startText}}", startText)
                    : `## ${this.gameTitle}\n${startText}`;
                break;
            case "won":
                container.setAccentColor(0x57f287);
                const winText = this.messages.win
                    .replace("{{winner}}", data?.winner || "")
                    .replace("{{time}}", data?.timeTaken || "0");
                content = this.options.states?.won
                    ? this.options.states.won.replace("{{gameTitle}}", this.gameTitle).replace("{{winText}}", winText)
                    : `## ${this.gameTitle}\n> ${winText}`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.lost
                    ? this.options.states.lost
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{messagesLose}}", this.messages.lose)
                    : `## ${this.gameTitle}\n> ${this.messages.lose}`;
                break;
        }
        container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(content));
        if (this.buttons.length > 0) {
            for (let i = 0; i < 5; i++) {
                const rowButtons = this.buttons.slice(i * 5, (i + 1) * 5);
                if (rowButtons.length > 0) {
                    container.addActionRowComponents((actionRow) => actionRow.setComponents(...rowButtons));
                }
            }
        }
        return container;
    }
}
