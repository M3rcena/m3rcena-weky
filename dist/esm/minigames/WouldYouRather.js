import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags } from "discord.js";
import { ofetch } from "ofetch";
const activePlayers = new Set();
/**
 * WouldYouRather Minigame.
 * A social choice game where players choose between two difficult scenarios.
 * Fetches questions dynamically from an external API and displays global statistics
 * after the player makes a choice to show how their opinion compares to others.
 *
 * @implements {IMinigame}
 */
export default class WouldYouRather {
    id;
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    timeoutTimer = null;
    // Game State
    isGameActive = false;
    data = null;
    // Configs
    gameTitle;
    defaultColor;
    labelA;
    labelB;
    idA;
    idB;
    msgThink;
    msgOthers;
    /**
     * Initializes the game instance.
     * Sets up unique button identifiers to prevent conflicts and applies custom configuration
     * for UI labels ("Option A", "Option B") and theme colors.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including button labels and custom messages.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        // Generate IDs
        this.idA = `wyr_a_${weky.getRandomString(10)}`;
        this.idB = `wyr_b_${weky.getRandomString(10)}`;
        // Config Init
        this.gameTitle = options.embed?.title || "Would You Rather?";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
        const buttons = options.buttons || { optionA: "Option A", optionB: "Option B" };
        this.labelA = buttons.optionA;
        this.labelB = buttons.optionB;
        this.msgThink = options.thinkMessage || "Thinking...";
        this.msgOthers = options.othersMessage || "Only <@{{author}}> can use the buttons!";
    }
    /**
     * Begins the game session.
     * 1. Generates a random page offset to ensure question variety.
     * 2. Fetches a "Would You Rather" scenario from the external API (io.wyr.app).
     * 3. Parses the options and raw vote counts.
     * 4. Displays the interactive prompt to the user.
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
            const pageOffset = Math.floor(Math.random() * 690);
            const apiResponse = await ofetch(`https://io.wyr.app/api/v1/statements/en/easy?pageOffset=${pageOffset}&pageSize=1`, { timeout: 5000, retry: 1 });
            const statement = apiResponse.statements[0];
            if (!statement || statement.phrase.length < 2) {
                return this.endGame("error");
            }
            this.data = {
                option1: statement.phrase[0].text,
                option2: statement.phrase[1].text,
                count1: statement.phrase[0].count,
                count2: statement.phrase[1].count,
            };
        }
        catch (e) {
            return this.endGame("error");
        }
        this.weky._EventManager.register(this);
        await this.gameMessage.edit({
            components: [
                this.createGameContainer("active", {
                    option1: this.data.option1,
                    option2: this.data.option2,
                }),
            ],
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
     * Captures the user's choice (Option A or Option B), validates the user identity,
     * and immediately triggers the result display phase.
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
        const choice = interaction.customId === this.idA ? "A" : "B";
        return this.endGame("result", { userChoice: choice });
    }
    // =========================================================================
    // UI & HELPERS
    // =========================================================================
    /**
     * Concludes the game session.
     * Calculates the vote percentages for both options based on the API data (Option Count / Total Count),
     * updates the UI to show these statistics, and visually highlights the user's choice.
     *
     * @param state - The outcome of the session.
     * @param data - The user's selection (A/B).
     * @private
     */
    async endGame(state, data) {
        if (!this.isGameActive && state !== "error")
            return;
        this.isGameActive = false;
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        activePlayers.delete(this.id);
        this.weky._EventManager.unregister(this.id);
        if (this.gameMessage) {
            try {
                let stats = { a: "0%", b: "0%" };
                if (this.data) {
                    const total = this.data.count1 + this.data.count2 || 1;
                    stats = {
                        a: ((this.data.count1 / total) * 100).toFixed(1) + "%",
                        b: ((this.data.count2 / total) * 100).toFixed(1) + "%",
                    };
                }
                await this.gameMessage.edit({
                    components: [
                        this.createGameContainer(state, {
                            option1: this.data?.option1,
                            option2: this.data?.option2,
                            stats,
                            userChoice: data?.userChoice,
                        }),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Utility method to format API response strings.
     * Capitalizes the first letter of the provided text for cleaner UI presentation.
     * @param val - The string to format (can be undefined if API fails).
     * @returns {string} The capitalized string or an empty string if input is invalid.
     * @private
     */
    capitalizeFirstLetter(val) {
        if (!val)
            return "";
        return val.charAt(0).toUpperCase() + String(val).slice(1);
    }
    /**
     * Constructs the visual interface.
     * Generates the Embed displaying the two scenarios.
     * In the "Result" state, it reformats the embed to display statistical data (percentages)
     * and disables the interaction buttons.
     * @param state - The current game state.
     * @param data - Dynamic data including option text and calculated stats.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    createGameContainer(state, data) {
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
                        .replace("{{option1}}", this.capitalizeFirstLetter(data.option1))
                        .replace("{{option2}}", this.capitalizeFirstLetter(data.option2))
                    : `## ${this.gameTitle}\n> 🅰️ **${this.capitalizeFirstLetter(data.option1)}**\n\n**OR**\n\n> 🅱️ **${this.capitalizeFirstLetter(data.option2)}**`;
                break;
            case "result":
                container.setAccentColor(0x57f287); // Green
                content = this.options.states?.result
                    ? this.options.states.result
                        .replace("{{gameTitle}}", this.gameTitle)
                        .replace("{{option1}}", this.capitalizeFirstLetter(data.option1))
                        .replace("{{option2}}", this.capitalizeFirstLetter(data.option2))
                        .replace("{{stats1}}", data.stats.a)
                        .replace("{{stats2}}", data.stats.b)
                        .replace("{{userChoice}}", data.userChoice)
                    : `## ${this.gameTitle}\n> 🅰️ **${this.capitalizeFirstLetter(data.option1)}**\n> 📊 ${data.stats.a}\n\n**OR**\n\n> 🅱️ **${this.capitalizeFirstLetter(data.option2)}**\n> 📊 ${data.stats.b}\n\n**You chose:** Option ${data.userChoice}`;
                break;
            case "timeout":
                container.setAccentColor(0x99aab5); // Grey
                content = this.options.states?.timeout
                    ? this.options.states.timeout.replace("{{gameTitle}}", this.gameTitle)
                    : `## ${this.gameTitle}\n> ⏳ Time's up! You didn't choose.`;
                break;
            case "error":
                container.setAccentColor(0xff0000); // Red
                content = this.options.states?.error ? this.options.states.error : `## ❌ Error\n> Failed to fetch question.`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (state === "active" || state === "result") {
            const isResult = state === "result";
            const txtA = isResult ? `${this.labelA} (${data.stats?.a})` : this.labelA;
            const txtB = isResult ? `${this.labelB} (${data.stats?.b})` : this.labelB;
            let styleA = ButtonStyle.Primary;
            let styleB = ButtonStyle.Primary;
            if (isResult) {
                if (data.userChoice === "A") {
                    styleA = ButtonStyle.Success;
                    styleB = ButtonStyle.Secondary;
                }
                else {
                    styleA = ButtonStyle.Secondary;
                    styleB = ButtonStyle.Success;
                }
            }
            const btnA = new ButtonBuilder().setStyle(styleA).setLabel(txtA).setCustomId(this.idA).setDisabled(isResult);
            const btnB = new ButtonBuilder().setStyle(styleB).setLabel(txtB).setCustomId(this.idB).setDisabled(isResult);
            container.addActionRowComponents((row) => row.setComponents(btnA, btnB));
        }
        return container;
    }
}
