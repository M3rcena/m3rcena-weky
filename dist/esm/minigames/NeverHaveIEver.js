import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags } from "discord.js";
const activePlayers = new Set();
/**
 * NeverHaveIEver Minigame.
 * A social party game where the bot presents a random "Never Have I Ever" statement
 * fetched from an external API. Players respond using buttons to admit or deny the statement.
 * @implements {IMinigame}
 */
export default class NeverHaveIEver {
    id;
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    timeoutTimer = null;
    // Game State
    isGameActive = false;
    statement = "";
    // Configs
    gameTitle;
    defaultColor;
    labelYes;
    labelNo;
    idYes;
    idNo;
    msgThink;
    msgOthers;
    /**
     * Initializes the game instance.
     * Generates unique interaction IDs for buttons to prevent conflicts and applies custom configuration
     * for embeds, buttons labels, and text.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button labels and custom messages.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        // Generate IDs
        this.idYes = `nhie_yes_${weky.getRandomString(10)}`;
        this.idNo = `nhie_no_${weky.getRandomString(10)}`;
        // Config Init
        this.gameTitle = options.embed?.title || "Never Have I Ever";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
        if (!options.buttons)
            options.buttons = {};
        this.labelYes = options.buttons.optionA || "Yes";
        this.labelNo = options.buttons.optionB || "No";
        this.msgThink = typeof options.thinkMessage === "string" ? options.thinkMessage : "I am thinking...";
        this.msgOthers =
            typeof options.othersMessage === "string" ? options.othersMessage : "Only <@{{author}}> can use the buttons!";
    }
    /**
     * Begins the game session.
     * Fetches a random statement from the API (category: harmless), handles potential API errors,
     * and displays the interactive game message to the user.
     */
    async start() {
        if (activePlayers.has(this.id))
            return;
        activePlayers.add(this.id);
        this.isGameActive = true;
        this.gameMessage = await this.context.channel.send({
            components: [this.createGameContainer("loading", "")],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        try {
            const res = await fetch("https://api.nhie.io/v2/statements/next?language=en&category=harmless");
            const data = (await res.json());
            this.statement = data.statement ? data.statement.trim() : "";
            if (!this.statement) {
                return this.endGame("error", this.options.errors?.noResult || "API returned no statement.");
            }
        }
        catch (e) {
            return this.endGame("error", this.options.errors?.failedFetch || "Failed to fetch statement from API.");
        }
        this.weky._EventManager.register(this);
        await this.gameMessage.edit({
            components: [this.createGameContainer("active", this.statement)],
            flags: MessageFlags.IsComponentsV2,
        });
        const timeLimit = this.options.time || 60000;
        this.timeoutTimer = setTimeout(() => {
            if (this.isGameActive)
                this.endGame("timeout");
        }, timeLimit);
    }
    // =========================================================================
    // EVENT ROUTER METHODS
    // =========================================================================
    /**
     * Event handler for button interactions.
     * Routes the "Yes" (I have done this) and "No" (I have never done this) inputs
     * to the end game logic.
     * @param interaction - The Discord Interaction object.
     */
    async onInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.user.id !== this.id) {
            if (interaction.message.id === this.gameMessage?.id) {
                return interaction.reply({
                    content: this.msgOthers.replace("{{author}}", this.id),
                    flags: [MessageFlags.Ephemeral],
                });
            }
            return;
        }
        if (interaction.message.id !== this.gameMessage?.id)
            return;
        await interaction.deferUpdate();
        if (interaction.customId === this.idYes) {
            return this.endGame("yes");
        }
        else if (interaction.customId === this.idNo) {
            return this.endGame("no");
        }
    }
    // =========================================================================
    // UI & HELPERS
    // =========================================================================
    /**
     * Concludes the game session.
     * Cleans up event listeners, stops the timeout timer, and updates the UI
     * to reflect the user's choice (or error/timeout state).
     * @param state - The final outcome of the game.
     * @param errorMsg - Optional detail string if an error occurred.
     * @private
     */
    async endGame(state, errorMsg) {
        if (!this.isGameActive && state !== "error")
            return;
        this.isGameActive = false;
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        activePlayers.delete(this.id);
        this.weky._EventManager.unregister(this.id);
        const textToShow = state === "error" ? errorMsg || "Unknown Error" : this.statement;
        if (this.gameMessage) {
            try {
                await this.gameMessage.edit({
                    components: [this.createGameContainer(state, textToShow)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Constructs the visual interface.
     * Generates the Embed displaying the statement and the ActionRow containing the
     * "Yes" and "No" buttons. dynamic styling is applied based on the final selection.
     * @param state - The current game state.
     * @param statementText - The "Never Have I Ever" statement to display.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    createGameContainer(state, statementText) {
        const container = new ContainerBuilder();
        let content = "";
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
                        .replace("{{statementText}}", statementText)
                    : `## ${this.gameTitle}\n> ${statementText}`;
                break;
            case "yes":
                container.setAccentColor(0x57f287);
                content = this.options.states?.yes
                    ? this.options.states.yes.replace("{{gameTitle}}", this.gameTitle).replace("{{statementText}}", statementText)
                    : `## ${this.gameTitle}\n> ${statementText}\n\n✅ **I have done this.**`;
                break;
            case "no":
                container.setAccentColor(0xed4245);
                content = this.options.states?.no
                    ? this.options.states.no.replace("{{gameTitle}}", this.gameTitle).replace("{{statementText}}", statementText)
                    : `## ${this.gameTitle}\n> ${statementText}\n\n❌ **I have never done this.**`;
                break;
            case "timeout":
                container.setAccentColor(0x99aab5);
                content = this.options.states?.timeout
                    ? this.options.states.timeout
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{statementText}}", statementText)
                    : `## ${this.gameTitle}\n> ${statementText}\n\n⏳ **Time's up!**`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = this.options.states?.error
                    ? this.options.states.error.replace("{{statementText}}", statementText)
                    : `## ❌ Error\n> ${statementText}`;
                break;
        }
        container.addTextDisplayComponents((text) => text.setContent(content));
        if (state !== "loading" && state !== "error") {
            const btnYes = new ButtonBuilder()
                .setLabel(this.labelYes)
                .setStyle(state === "yes" ? ButtonStyle.Success : ButtonStyle.Primary)
                .setCustomId(this.idYes)
                .setDisabled(state !== "active");
            const btnNo = new ButtonBuilder()
                .setLabel(this.labelNo)
                .setStyle(state === "no" ? ButtonStyle.Danger : ButtonStyle.Secondary)
                .setCustomId(this.idNo)
                .setDisabled(state !== "active");
            container.addActionRowComponents((row) => row.setComponents(btnYes, btnNo));
        }
        return container;
    }
}
