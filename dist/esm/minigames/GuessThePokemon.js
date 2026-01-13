import { ButtonBuilder, ButtonStyle, ContainerBuilder, MediaGalleryBuilder, MessageFlags, } from "discord.js";
import fetch from "node-fetch";
const activePlayers = new Set();
/**
 * GuessThePokemon Minigame.
 * A trivia game where players must identify a Pokémon based on its elemental types and abilities.
 * Fetches real-time data and images from the PokéAPI (Gen 1-8).
 * @implements {IMinigame}
 */
export default class GuessThePokemon {
    id;
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    timeoutTimer = null;
    // Game State
    isGameActive = false;
    pokemonData = null;
    gameCreatedAt = 0;
    // Configs
    gameTitle;
    defaultColor;
    cancelId;
    btnText;
    msgThink;
    msgWin;
    msgLose;
    msgIncorrect;
    /**
     * Initializes the GuessThePokemon game instance.
     * Configures game settings, custom response messages (Win/Lose/Think), and initializes the unique game ID.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including time limits and custom text.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        this.cancelId = `gtp_cancel_${weky.getRandomString(10)}`;
        // Config Init
        this.gameTitle = options.embed?.title || "Guess The Pokémon";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
        this.btnText = options.giveUpButton || "Give Up";
        // Messages (with defaults)
        this.msgThink = typeof options.thinkMessage === "string" ? options.thinkMessage : "Thinking...";
        this.msgWin =
            typeof options.winMessage === "string"
                ? options.winMessage
                : "GG! It was **{{answer}}**. You got it in **{{time}}**.";
        this.msgLose =
            typeof options.loseMessage === "string" ? options.loseMessage : "Better luck next time! It was **{{answer}}**.";
        this.msgIncorrect =
            typeof options.incorrectMessage === "string"
                ? options.incorrectMessage
                : "No, it's not **{{answer}}**! Try again.";
    }
    /**
     * Begins the game session.
     * Fetches a random Pokémon (ID 1-898) from the PokéAPI, parses its attributes (Types/Abilities),
     * and displays the challenge embed. Handles API connection errors gracefully.
     */
    async start() {
        if (activePlayers.has(this.id))
            return;
        activePlayers.add(this.id);
        this.isGameActive = true;
        this.gameMessage = await this.context.channel.send({
            components: [this.createGameContainer("loading", {})],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        try {
            const randomNumber = Math.floor(Math.random() * 898) + 1;
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomNumber}`);
            if (!res.ok)
                throw new Error("API Error");
            const data = (await res.json());
            this.pokemonData = {
                name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
                abilities: data.abilities.map((item) => `\`${item.ability.name}\``).join(", "),
                types: data.types.map((item) => `\`${item.type.name}\``).join(", "),
                image: data.sprites.other.home.front_default,
            };
        }
        catch (e) {
            return this.endGame("error");
        }
        this.weky._EventManager.register(this);
        this.gameCreatedAt = Date.now();
        await this.gameMessage.edit({
            components: [
                this.createGameContainer("active", {
                    types: this.pokemonData.types,
                    abilities: this.pokemonData.abilities,
                    timeLeft: this.weky.convertTime(this.options.time || 60000),
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
        const timeLimit = this.options.time || 60000;
        this.timeoutTimer = setTimeout(() => {
            if (this.isGameActive)
                this.endGame("lost");
        }, timeLimit);
    }
    // =========================================================================
    // EVENT ROUTER METHODS
    // =========================================================================
    /**
     * Event handler for user messages.
     * Compares the user's input against the target Pokémon name (case-insensitive).
     * Triggers the win condition on a match, or updates the UI with "Wrong Guess" feedback on failure.
     * @param message - The Discord Message object.
     */
    async onMessage(message) {
        if (message.channelId !== this.context.channel.id)
            return;
        if (message.author.id !== this.id)
            return;
        if (!this.pokemonData)
            return;
        const guess = message.content.toLowerCase().trim();
        const correctName = this.pokemonData.name.toLowerCase();
        if (message.deletable)
            await message.delete().catch(() => { });
        if (guess === correctName) {
            const timeTaken = this.weky.convertTime(Date.now() - this.gameCreatedAt);
            return this.endGame("won", { timeTaken });
        }
        else {
            await this.updateUI("wrong", { wrongGuess: message.content });
        }
    }
    /**
     * Event handler for button interactions.
     * Manages the "Give Up" button logic to allow the player to forfeit the session immediately.
     * @param interaction - The Discord Interaction object.
     */
    async onInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.user.id !== this.id)
            return;
        if (interaction.message.id !== this.gameMessage?.id)
            return;
        if (interaction.customId === this.cancelId) {
            await interaction.deferUpdate();
            return this.endGame("lost");
        }
    }
    // =========================================================================
    // UI & HELPERS
    // =========================================================================
    /**
     * Concludes the game session.
     * Cleans up event listeners, stops timers, and updates the interface with the final result.
     * Reveals the answer and image if the game was won or lost.
     * @param state - The result of the game.
     * @param details - Optional metadata (e.g., time taken).
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
        if (this.gameMessage) {
            try {
                await this.gameMessage.edit({
                    components: [this.createGameContainer(state, details)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Refreshes the game message with new state information.
     * Primarily used to display "Wrong Guess" feedback while keeping the game active.
     * @param state - The current game state.
     * @param details - Data regarding the incorrect guess.
     * @private
     */
    async updateUI(state, details) {
        if (!this.gameMessage || !this.pokemonData)
            return;
        try {
            await this.gameMessage.edit({
                components: [
                    this.createGameContainer(state, {
                        ...details,
                        types: this.pokemonData.types,
                        abilities: this.pokemonData.abilities,
                        timeLeft: this.weky.convertTime(this.options.time || 60000),
                    }),
                ],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        catch (e) { }
    }
    /**
     * Constructs the visual interface for the game.
     * Generates the Embed (displaying Types/Abilities hints), Control Buttons, and
     * attaches the Pokémon image via MediaGallery upon game completion.
     * @param state - The current game state.
     * @param data - Dynamic data for the embed (Clues, Time, Answer).
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    createGameContainer(state, data) {
        const container = new ContainerBuilder();
        let content = "";
        const name = this.pokemonData?.name || "Unknown";
        const image = this.pokemonData?.image;
        switch (state) {
            case "loading":
                container.setAccentColor(this.defaultColor);
                content = this.options.states?.loading
                    ? this.options.states.loading
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{thinkMessage}}", this.msgThink)
                    : `## ${this.gameTitle}\n> 🔄 ${this.msgThink}`;
                break;
            case "active":
                container.setAccentColor(this.defaultColor);
                content = this.options.states?.active
                    ? this.options.states.active
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{types}}", data.types)
                        .replace("{{abilities}}", data.abilities)
                        .replace("{{time}}", data.timeLeft || "")
                    : `## ${this.gameTitle}\n**Types:** ${data.types}\n**Abilities:** ${data.abilities}\n\n> ⏳ Time: **${data.timeLeft || ""}**\n> Type your guess in the chat!`;
                break;
            case "wrong":
                container.setAccentColor(0xed4245); // Red
                const wrongMsg = this.msgIncorrect.replace("{{answer}}", data.wrongGuess || "that");
                content = this.options.states?.wrong
                    ? this.options.states.wrong
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{types}}", data.types)
                        .replace("{{abilities}}", data.abilities)
                        .replace("{{wrongMsg}}", wrongMsg)
                    : `## ${this.gameTitle}\n**Types:** ${data.types}\n**Abilities:** ${data.abilities}\n\n> ❌ **${wrongMsg}**`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                const winMsg = this.msgWin.replace("{{answer}}", name).replace("{{time}}", data.timeTaken);
                content = this.options.states?.won
                    ? this.options.states.won.replace("{{winMsg}}", winMsg)
                    : `## 🏆 You caught it!\n> ${winMsg}`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                const loseMsg = this.msgLose.replace("{{answer}}", name);
                content = this.options.states?.lost
                    ? this.options.states.lost.replace("{{loseMsg}}", loseMsg)
                    : `## ❌ Game Over\n> ${loseMsg}`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = this.options.states?.error
                    ? this.options.states.error
                    : `## ❌ Error\n> Failed to fetch Pokémon data.`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if ((state === "won" || state === "lost") && image) {
            const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(image));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "active" || state === "wrong") {
            const btnCancel = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(this.btnText)
                .setCustomId(this.cancelId);
            container.addActionRowComponents((row) => row.setComponents(btnCancel));
        }
        return container;
    }
}
