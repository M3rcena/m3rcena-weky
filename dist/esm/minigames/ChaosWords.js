import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags } from "discord.js";
const activePlayers = new Set();
/**
 * ChaosWords Minigame.
 * A word-finding puzzle where players must identify specific words hidden within a randomized string of characters.
 * @implements {IMinigame}
 */
export default class ChaosWords {
    id;
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    timeoutTimer = null;
    // Game State
    words = [];
    chaosArray = [];
    gameState = {
        remaining: [],
        found: [],
        tries: 0,
    };
    isGameActive = false;
    gameCreatedAt = 0;
    // Configs
    cancelId;
    gameTitle;
    defaultColor;
    maxTries;
    timeLimit;
    /**
     * Initializes the ChaosWords game instance.
     * Sets up game configuration, difficulty settings (max tries, time limit), and unique identifiers.
     * @param weky - The WekyManager instance.
     * @param options - Custom configuration including word list, max tries, and UI settings.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        this.cancelId = `chaos_cancel_${weky.getRandomString(10)}`;
        // Config Init
        this.gameTitle = options.embed?.title || "Chaos Words";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
        this.maxTries = options.maxTries || 10;
        this.timeLimit = options.time || 60000;
    }
    /**
     * Starts the game session.
     * Fetches or utilizes provided words, generates the "chaos string" by mixing words with random characters,
     * sends the initial game message, and registers the global event listeners.
     */
    async start() {
        if (activePlayers.has(this.id))
            return;
        activePlayers.add(this.id);
        this.isGameActive = true;
        this.words = this.options.words || [];
        if (this.words.length === 0) {
            try {
                const fetchedWords = await this.weky.NetworkManager.getRandomSentence(Math.floor(Math.random() * 3) + 2);
                this.words = fetchedWords.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
                this.words = this.words.filter((w) => w.length > 0);
            }
            catch (e) {
                this.endGame("error");
                return this.context.channel.send(this.options.failedFetchMessage ? this.options.failedFetchMessage : "Failed to fetch words.");
            }
        }
        else {
            this.words = this.words.map((w) => w.toLowerCase());
        }
        this.gameState.remaining = [...this.words];
        this.gameState.found = [];
        this.gameState.tries = 0;
        const totalWordLength = this.words.join("").length;
        const charCount = this.options.charGenerated || totalWordLength + 5;
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < charCount; i++) {
            this.chaosArray.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
        }
        this.words.forEach((word) => {
            const insertPos = Math.floor(Math.random() * this.chaosArray.length);
            this.chaosArray.splice(insertPos, 0, word);
        });
        this.gameMessage = await this.context.channel.send({
            components: [this.createGameContainer("active")],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        this.weky._EventManager.register(this);
        this.gameCreatedAt = Date.now();
        this.timeoutTimer = setTimeout(() => {
            if (this.isGameActive)
                this.endGame("timeout");
        }, this.timeLimit);
    }
    // =========================================================================
    // EVENT ROUTER METHODS
    // =========================================================================
    /**
     * Handles incoming chat messages from the player.
     * Checks if the message content matches a hidden word, updates the game state (found/remaining words),
     * tracks attempts, and determines win/loss conditions.
     * @param message - The Discord Message object.
     */
    async onMessage(message) {
        if (message.channelId !== this.context.channel.id)
            return;
        if (message.author.id !== this.id)
            return;
        if (message.author.bot)
            return;
        const guess = message.content.toLowerCase().trim();
        if (message.deletable)
            await message.delete().catch(() => { });
        if (this.gameState.found.includes(guess)) {
            await this.updateUI("repeat", {
                feedback: this.options.wordAlreadyFound
                    ? this.options.wordAlreadyFound.replace("{{guess}}", guess)
                    : `You already found "${guess}"!`,
            });
            return;
        }
        if (this.gameState.remaining.includes(guess)) {
            this.gameState.found.push(guess);
            this.gameState.remaining = this.gameState.remaining.filter((w) => w !== guess);
            const indexInChaos = this.chaosArray.indexOf(guess);
            if (indexInChaos > -1) {
                this.chaosArray.splice(indexInChaos, 1);
            }
            if (this.gameState.remaining.length === 0) {
                const timeTaken = this.weky.convertTime(Date.now() - this.gameCreatedAt);
                return this.endGame("won", { timeTaken });
            }
            const correctMsg = this.options.correctWord
                ? this.options.correctWord
                    .replace("{{guess}}", guess)
                    .replace("{{remaining}}", `${this.gameState.remaining.length}`)
                : `Correct! **${guess}** was found.`;
            await this.updateUI("correct", { feedback: correctMsg });
        }
        else {
            this.gameState.tries++;
            if (this.gameState.tries >= this.maxTries) {
                return this.endGame("lost");
            }
            const wrongMsg = this.options.wrongWord
                ? this.options.wrongWord
                    .replace("{{guess}}", guess)
                    .replace("{{remaining_tries}}", `${this.maxTries - this.gameState.tries}`)
                : `**${guess}** is not in the text!`;
            await this.updateUI("wrong", { feedback: wrongMsg });
        }
    }
    /**
     * Handles button interactions (specifically the Cancel button).
     * Verifies user identity and terminates the game if requested.
     * @param interaction - The Discord Interaction object.
     */
    async onInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.user.id !== this.id)
            return;
        if (interaction.customId !== this.cancelId)
            return;
        await interaction.deferUpdate();
        return this.endGame("cancelled");
    }
    // =========================================================================
    // UI & HELPERS
    // =========================================================================
    /**
     * Concludes the game session.
     * Unregisters listeners, clears timers, removes the player from active sessions,
     * and triggers the final UI update based on the game result.
     * @param state - The final state of the game (won, lost, etc.).
     * @param details - Optional metadata like time taken to complete.
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
        if (state === "error")
            return;
        await this.updateUI(state, details);
    }
    /**
     * Updates the game message to reflect the current state.
     * Re-renders the embed content, chaos string, and status feedback (correct/wrong guess).
     * @param state - The current game state to render.
     * @param details - Dynamic data for the UI (feedback messages, time, etc.).
     * @private
     */
    async updateUI(state, details) {
        if (!this.gameMessage)
            return;
        try {
            await this.gameMessage.edit({
                components: [this.createGameContainer(state, details)],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        catch (e) { }
    }
    /**
     * Constructs the visual representation of the game.
     * Generates the "Chaos String" display, word progress counters, and status messages
     * based on the current game phase.
     * @param state - The current game state (active, won, lost, etc.).
     * @param details - Dynamic text for feedback and results.
     * @returns {ContainerBuilder} The constructed container ready for the Discord API.
     * @private
     */
    createGameContainer(state, details) {
        const container = new ContainerBuilder();
        let content = "";
        switch (state) {
            case "active":
                container.setAccentColor(this.defaultColor);
                content = this.options.states?.active
                    ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle)
                    : `## ${this.gameTitle}\n> Find the hidden words in the text below!`;
                break;
            case "correct":
                container.setAccentColor(0x57f287); // Green
                content = this.options.states?.correct
                    ? this.options.states.correct
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{detailsFeedback}}", details?.feedback)
                    : `## ${this.gameTitle}\n> ✅ **${details?.feedback}**`;
                break;
            case "wrong":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.wrong
                    ? this.options.states.wrong
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{detailsFeedback}}", details?.feedback)
                    : `## ${this.gameTitle}\n> ❌ ${details?.feedback}`;
                break;
            case "repeat":
                container.setAccentColor(0xfee75c); // Yellow
                content = this.options.states?.repeat
                    ? this.options.states.repeat
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{detailsFeedback}}", details?.feedback)
                    : `## ${this.gameTitle}\n> ⚠️ **${details?.feedback}**`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                const winMsg = this.options.states?.won?.winMessage
                    ? this.options.states.won.winMessage.replace("{{timeTaken}}", details?.timeTaken || "")
                    : `You found all words in **${details?.timeTaken || ""}**!`;
                content = this.options.states?.won?.winContent
                    ? this.options.states.won.winMessage.replace("{{winMsg}}", winMsg)
                    : `## 🏆 You Won!\n> ${winMsg}`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                const loseMsg = this.options.states?.lost?.loseMessage
                    ? this.options.states.lost.loseMessage
                    : "You failed to find all words.";
                content = this.options.states?.lost?.loseContent
                    ? this.options.states.lost.loseContent.replace("{{loseMsg}}", loseMsg)
                    : `## ❌ Game Over\n> ${loseMsg}`;
                break;
            case "timeout":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.timeout
                    ? this.options.states.timeout
                    : `## ⏱️ Time's Up\n> You ran out of time!`;
                break;
            case "cancelled":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.cancelled
                    ? this.options.states.cancelled
                    : `## 🚫 Cancelled\n> Game ended by player.`;
                break;
        }
        if (state !== "cancelled") {
            const currentChaosString = this.chaosArray.join("");
            content += this.options.states?.chaosString
                ? this.options.states.chaosString.replace("{{currentChaosString}}", currentChaosString)
                : `\n\n**Chaos String:**\n\`\`\`text\n${currentChaosString}\n\`\`\``;
            content += this.options.states?.wordsFound?.main
                ? this.options.states?.wordsFound.main
                    .replace("{{totalFound}}", `${this.gameState.found.length}/${this.words.length}`)
                    .replace("{{wordList}}}", this.gameState.found.length > 0
                    ? this.gameState.found.map((w) => `\`${w}\``).join(", ")
                    : this.options.states?.wordsFound?.noneYet
                        ? this.options.states.wordsFound.noneYet
                        : "_None yet_")
                : `\n**Words Found (${this.gameState.found.length}/${this.words.length}):**\n` +
                    `${this.gameState.found.length > 0 ? this.gameState.found.map((w) => `\`${w}\``).join(", ") : "_None yet_"}`;
            if (state === "won") {
            }
            else if (state === "lost" || state === "timeout") {
                content += this.options.states?.missingWords
                    ? this.options.states.missingWords.replace("{{words}}", this.gameState.remaining.map((w) => `\`${w}\``).join(", "))
                    : `\n\n**Missing Words:**\n${this.gameState.remaining.map((w) => `\`${w}\``).join(", ")}`;
            }
            else {
                content += this.options.states?.tries
                    ? this.options.states.tries.replace("{{totalTries}}", `${this.gameState.tries}/${this.maxTries}`)
                    : `\n\n**Tries:** ${this.gameState.tries}/${this.maxTries}`;
                content += this.options.states?.timeRemaining
                    ? this.options.states.timeRemaining.replace("{{time}}", this.weky.convertTime(this.timeLimit))
                    : `\n> ⏳ Time Remaining: **${this.weky.convertTime(this.timeLimit)}**`;
            }
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (state === "active" || state === "correct" || state === "wrong" || state === "repeat") {
            const btnCancel = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(this.options.cancelButton || "Cancel")
                .setCustomId(this.cancelId);
            container.addActionRowComponents((row) => row.setComponents(btnCancel));
        }
        return container;
    }
}
