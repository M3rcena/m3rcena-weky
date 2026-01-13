"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const activePlayers = new Set();
/**
 * Turn-based Combat Minigame.
 * Features a challenge system, real-time HP/Coin tracking, and an in-game shop for powerups (Shields, Damage Boosts).
 * Relies heavily on the NetworkManager for state persistence and image generation.
 * @implements {IMinigame}
 */
class Fight {
    id; // Challenger ID
    weky;
    options;
    context;
    // Game Objects
    gameMessage = null;
    opponent;
    challenger = null;
    gameId = null;
    timeoutTimer = null;
    // State
    isGameActive = false;
    phase = "REQUEST";
    POWERUPS;
    // Configs
    btnHit;
    btnHeal;
    btnCancel;
    btnAccept;
    btnDeny;
    msgWrongUser;
    msgOpponentTurn;
    msgHighHp;
    msgLowHp;
    defaultColor;
    /**
     * Initializes the Fight game instance.
     * Configures game mechanics, button labels, custom messages, and defines the available powerups.
     * @param weky - The WekyManager instance.
     * @param options - Configuration including opponent data, UI colors, and custom text.
     */
    constructor(weky, options) {
        this.weky = weky;
        this.options = options;
        this.context = options.context;
        this.id = weky._getContextUserID(this.context);
        this.opponent = options.opponent;
        this.btnHit = options.buttons?.hit || "Hit";
        this.btnHeal = options.buttons?.heal || "Heal";
        this.btnCancel = options.buttons?.cancel || "Surrender";
        this.btnAccept = options.buttons?.accept || "Accept";
        this.btnDeny = options.buttons?.deny || "Deny";
        this.msgWrongUser = options.wrongUserFight || "**This is not your Game!**";
        this.msgOpponentTurn = options.opponentsTurnMessage || "**Please wait for your opponents move!**";
        this.msgHighHp = options.highHealthMessage || "You cannot heal if your HP is above 80!";
        this.msgLowHp = options.lowHealthMessage || "You cannot cancel the fight if your HP is below 50!";
        this.defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0xed4245;
        this.POWERUPS = [
            {
                id: "double-damage",
                label: options.powerups?.doubleDamage?.label ? options.powerups.doubleDamage.label : "2x Damage",
                style: discord_js_1.ButtonStyle.Danger,
                cost: 30,
                effect: (player, playerUsername) => {
                    player.activeEffects.push(options.powerups?.doubleDamage?.effectMessage
                        ? options.powerups?.doubleDamage?.effectMessage
                        : "Double Damage (Next Attack)");
                    return options.powerups?.doubleDamage?.replyMessage
                        ? options.powerups.doubleDamage.replyMessage.replace("{{username}}", playerUsername)
                        : `${playerUsername} will deal double damage on their next attack!`;
                },
            },
            {
                id: "shield",
                label: options.powerups?.shield?.label ? options.powerups.shield.label : "Shield",
                style: discord_js_1.ButtonStyle.Secondary,
                cost: 25,
                effect: (player, playerUsername) => {
                    player.activeEffects.push(options.powerups?.shield?.effectMessage ? options.powerups.shield.effectMessage : "Shield (Next Attack)");
                    return options.powerups?.shield?.replyMessage
                        ? options.powerups.shield.replyMessage.replace("{{username}}", playerUsername)
                        : `${playerUsername} will take half damage from the next attack!`;
                },
            },
            {
                id: "heal-boost",
                label: options.powerups?.healBoost?.label ? options.powerups.healBoost.label : "Heal Boost",
                style: discord_js_1.ButtonStyle.Success,
                cost: 20,
                effect: (player, playerUsername) => {
                    player.health += 30;
                    if (player.health > 100)
                        player.health = 100;
                    return options.powerups?.healBoost?.replyMessage
                        ? options.powerups.healBoost.replyMessage.replace("{{username}}", playerUsername)
                        : `${playerUsername} received a 30 HP healing boost!`;
                },
            },
        ];
    }
    /**
     * Initiates the challenge sequence.
     * Validates opponent availability, generates the visual challenge card, and prompts
     * the target user to accept or deny the duel.
     */
    async start() {
        if (activePlayers.has(this.id))
            return;
        if (!this.opponent || !this.opponent.user) {
            return this.weky._LoggerManager.createError("Fight", "Opponent must be a valid GuildMember.");
        }
        if (this.id === this.opponent.id) {
            return this.context.channel.send("You cannot fight yourself!");
        }
        this.challenger = (await this.context.guild?.members.fetch(this.id)) || null;
        if (!this.challenger)
            return;
        if ((await this.weky.NetworkManager.checkPlayerFightStatus(this.challenger.id)) ||
            (await this.weky.NetworkManager.checkPlayerFightStatus(this.opponent.id))) {
            return this.context.channel.send(this.options.playerAlreadyInFight
                ? this.options.playerAlreadyInFight
                : "One of the players is already in a fight!");
        }
        activePlayers.add(this.id);
        this.isGameActive = true;
        const requestCard = await this.weky.NetworkManager.makeRequestCard(this.challenger.user.username, this.challenger.displayAvatarURL({ extension: "png", size: 256 }), this.opponent.user.username, this.opponent.displayAvatarURL({ extension: "png", size: 256 }));
        if (!requestCard) {
            activePlayers.delete(this.id);
            return this.context.channel.send(this.options.failedRequestCardGeneration
                ? this.options.failedRequestCardGeneration
                : "Failed to generate request card.");
        }
        this.gameMessage = await this.context.channel.send({
            components: [this.createGameContainer("request", { image: "fight-request.png" })],
            files: [requestCard],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        this.gameId = await this.weky.NetworkManager.createGame(this.challenger.id, this.challenger.user.username, this.opponent.id, this.opponent.user.username);
        this.weky._EventManager.register(this);
        this.resetTimeout();
    }
    // =========================================================================
    // EVENT ROUTER METHOD
    // =========================================================================
    /**
     * Central event handler for game interactions.
     * Routes actions based on the current game phase (Challenge vs Combat) and enforces
     * turn-based order to prevent out-of-turn actions.
     * @param interaction - The Discord Interaction object.
     */
    async onInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.message.id !== this.gameMessage?.id)
            return;
        if (this.phase === "REQUEST") {
            if (interaction.user.id !== this.opponent.id) {
                return interaction.reply({ content: this.msgWrongUser, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            if (interaction.customId === "fight_deny") {
                await interaction.deferUpdate();
                return this.handleDeny();
            }
            if (interaction.customId === "fight_accept") {
                await interaction.deferUpdate();
                this.phase = "FIGHT";
                this.resetTimeout();
                return this.startFightLoop();
            }
        }
        if (this.phase === "FIGHT") {
            if (interaction.user.id !== this.challenger.id && interaction.user.id !== this.opponent.id) {
                return interaction.reply({ content: this.msgWrongUser, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            const turn = await this.weky.NetworkManager.getTurn(this.gameId);
            if (interaction.user.id !== turn.userID) {
                return interaction.reply({ content: this.msgOpponentTurn, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            this.resetTimeout();
            if (interaction.customId === "fight_hit")
                return this.handleHit(interaction);
            if (interaction.customId === "fight_heal")
                return this.handleHeal(interaction);
            if (interaction.customId === "fight_surrender")
                return this.handleSurrender(interaction);
            if (interaction.customId.startsWith("powerup_"))
                return this.handlePowerup(interaction);
        }
    }
    // =========================================================================
    // GAME LOGIC HANDLERS
    // =========================================================================
    /**
     * Transitions the game from the 'Challenge' phase to the active 'Combat' phase.
     * Generates the initial battle status card and updates the UI controls.
     * @private
     */
    async startFightLoop() {
        const gameCard = await this.weky.NetworkManager.makeMainCard(this.gameId, this.challenger.displayAvatarURL({ extension: "png", size: 256 }), this.opponent.displayAvatarURL({ extension: "png", size: 256 }));
        await this.gameMessage.edit({
            components: [this.createGameContainer("active", { image: "fight-card.png" })],
            files: [gameCard],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
    }
    /**
     * Executes the 'Attack' action.
     * Calculates damage based on RNG and active powerups (e.g., Double Damage, Shields),
     * updates player stats, and checks for win conditions.
     * @param interaction - The button interaction.
     * @private
     */
    async handleHit(interaction) {
        await interaction.deferUpdate();
        const player = await this.weky.NetworkManager.getPlayer(this.gameId, false);
        const enemy = await this.weky.NetworkManager.getPlayer(this.gameId, true);
        let damage = Math.floor(Math.random() * 20) + 10;
        const doubleDmgMsg = this.options.powerups?.doubleDamage?.effectMessage || "Double Damage (Next Attack)";
        const shieldMsg = this.options.powerups?.shield?.effectMessage || "Shield (Next Attack)";
        if (player.activeEffects.includes(doubleDmgMsg)) {
            damage *= 2;
            player.activeEffects = player.activeEffects.filter((e) => e !== doubleDmgMsg);
        }
        if (enemy.activeEffects.includes(shieldMsg)) {
            damage = Math.floor(damage / 2);
            enemy.activeEffects = enemy.activeEffects.filter((e) => e !== shieldMsg);
        }
        enemy.health -= damage;
        player.coins += 10;
        const updated = await this.weky.NetworkManager.updatePlayers(this.gameId, player, enemy);
        if (!updated)
            return interaction.followUp({ content: "API Error", flags: [discord_js_1.MessageFlags.Ephemeral] });
        if (enemy.health <= 0) {
            const winner = interaction.guild?.members.cache.get(player.memberId);
            const loser = interaction.guild?.members.cache.get(enemy.memberId);
            const winCard = await this.weky.NetworkManager.makeWinCard(winner?.user.username || "Winner", winner?.displayAvatarURL({ extension: "png", size: 256 }) || "", loser?.user.username || "Loser", loser?.displayAvatarURL({ extension: "png", size: 256 }) || "");
            return this.endGame("won", { image: "fight-winner.png" }, winCard);
        }
        await this.nextTurn();
    }
    /**
     * Executes the 'Heal' action.
     * Restores health to the current player, respecting the maximum HP cap (100) and
     * the minimum HP requirement logic.
     * @param interaction - The button interaction.
     * @private
     */
    async handleHeal(interaction) {
        const player = await this.weky.NetworkManager.getPlayer(this.gameId, false);
        if (player.health >= 80) {
            return interaction.reply({ content: this.msgHighHp, flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        await interaction.deferUpdate();
        const healAmt = Math.floor(Math.random() * 20) + 10;
        player.health = Math.min(100, player.health + healAmt);
        const enemy = await this.weky.NetworkManager.getPlayer(this.gameId, true);
        await this.weky.NetworkManager.updatePlayers(this.gameId, player, enemy);
        await this.nextTurn();
    }
    /**
     * Processes the 'Surrender' action.
     * Allows a player to forfeit the match, provided their HP is above the specific threshold (anti-ragequit).
     * @param interaction - The button interaction.
     * @private
     */
    async handleSurrender(interaction) {
        const player = await this.weky.NetworkManager.getPlayer(this.gameId, false);
        if (player.health < 50) {
            return interaction.reply({ content: this.msgLowHp, flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        await interaction.deferUpdate();
        const playerMember = await interaction.guild?.members.fetch(player.memberId);
        const enemy = await this.weky.NetworkManager.getPlayer(this.gameId, true);
        const enemyMember = await interaction.guild?.members.fetch(enemy.memberId);
        const surrenderCard = await this.weky.NetworkManager.makeSurrenderCard(enemyMember?.user.username || "Winner", enemyMember?.displayAvatarURL({ extension: "png", size: 256 }) || "", playerMember?.user.username || "Surrenderer", playerMember?.displayAvatarURL({ extension: "png", size: 256 }) || "");
        return this.endGame("surrender", { image: "fight-surrender.png" }, surrenderCard);
    }
    /**
     * Processes shop interactions.
     * Deducts coins and applies the selected status effect (Shield, Damage Boost, or Heal) to the player.
     * @param interaction - The button interaction.
     * @private
     */
    async handlePowerup(interaction) {
        const pId = interaction.customId.split("_")[1];
        const powerup = this.POWERUPS.find((p) => p.id === pId);
        const player = await this.weky.NetworkManager.getPlayer(this.gameId, false);
        const enemy = await this.weky.NetworkManager.getPlayer(this.gameId, true);
        const playerMember = await interaction.guild?.members.fetch(player.memberId);
        if (powerup && player.coins >= powerup.cost) {
            player.coins -= powerup.cost;
            const msg = powerup.effect(player, playerMember?.user.username || "Player");
            await this.weky.NetworkManager.updatePlayers(this.gameId, player, enemy);
            await interaction.reply({ content: msg, flags: [discord_js_1.MessageFlags.Ephemeral] });
            await this.nextTurn();
        }
        else {
            return interaction.reply({
                content: this.options.notEnoughtCoins ? this.options.notEnoughtCoins : "Not enough coins!",
                flags: [discord_js_1.MessageFlags.Ephemeral],
            });
        }
    }
    async handleDeny() {
        const denyCard = await this.weky.NetworkManager.makeDenyCard(this.challenger.user.username, this.challenger.displayAvatarURL({ extension: "png", size: 256 }), this.opponent.user.username, this.opponent.displayAvatarURL({ extension: "png", size: 256 }));
        return this.endGame("deny", { image: "fight-deny.png" }, denyCard);
    }
    /**
     * Advances the game state to the next round.
     * Updates the database turn pointer, regenerates the battle interface image, and refreshes the message.
     * @private
     */
    async nextTurn() {
        await this.weky.NetworkManager.changeTurn(this.gameId);
        const newCard = await this.weky.NetworkManager.makeMainCard(this.gameId, this.challenger.displayAvatarURL({ extension: "png", size: 256 }), this.opponent.displayAvatarURL({ extension: "png", size: 256 }));
        await this.gameMessage.edit({
            components: [this.createGameContainer("active", { image: "fight-card.png" })],
            files: [newCard],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
    }
    // =========================================================================
    // LIFECYCLE HELPERS
    // =========================================================================
    /**
     * Resets the game inactivity timer.
     * Triggers 'timeout' end state if expired.
     * @private
     */
    resetTimeout() {
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        const time = this.phase === "REQUEST" ? this.options.time || 60000 : 300000; // 5 min for fight interactions
        this.timeoutTimer = setTimeout(() => {
            if (this.isGameActive)
                this.handleTimeout();
        }, time);
    }
    /**
     * Handles game expiration logic.
     * Triggered when a player fails to act within the time limit, resulting in a timeout card generation.
     * @private
     */
    async handleTimeout() {
        const timeoutCard = await this.weky.NetworkManager.makeTimeOutCard(this.challenger.user.username, this.challenger.displayAvatarURL({ extension: "png", size: 256 }), this.opponent.user.username, this.opponent.displayAvatarURL({ extension: "png", size: 256 }));
        this.endGame("timeout", { image: "fight-timeout.png" }, timeoutCard);
    }
    /**
     * Concludes the game session.
     * Cleans up database records, removes listeners, and displays the final result (Win/Loss/Timeout)
     * with the appropriate generated image.
     * @private
     */
    async endGame(state, details, cardFile) {
        this.isGameActive = false;
        activePlayers.delete(this.id);
        this.weky._EventManager.unregister(this.id);
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        if (this.gameId) {
            await this.weky.NetworkManager.removeGame(this.gameId);
        }
        if (this.gameMessage) {
            try {
                await this.gameMessage.edit({
                    components: [this.createGameContainer(state, details)],
                    files: cardFile ? [cardFile] : [],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    }
    /**
     * Constructs the dynamic UI container.
     * Generates ActionRows based on the current game state (e.g., showing 'Accept/Deny' in request phase,
     * or 'Hit/Heal/Shop' in active phase).
     * @param state - The current game state.
     * @param details - Optional details for error messages or image attachments.
     * @returns {ContainerBuilder} The constructed container.
     * @private
     */
    createGameContainer(state, details) {
        const container = new discord_js_1.ContainerBuilder();
        let content = "";
        switch (state) {
            case "request":
                container.setAccentColor(0xfee75c); // Yellow
                content = this.options.states?.request
                    ? this.options.states.request
                        .replace("{{challengerMention}}", `<@${this.challenger.id}>`)
                        .replace("{{opponentMention}}", `<@${this.opponent.id}>`)
                    : `## ⚔️ Challenge!\n> <@${this.challenger.id}> challenged <@${this.opponent.id}> to a fight!`;
                break;
            case "active":
                container.setAccentColor(this.defaultColor);
                content = this.options.states?.active
                    ? this.options.states.active
                    : `## ⚔️ Fighting...\n> Use buttons to fight or buy powerups!`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                content = this.options.states?.won ? this.options.states.won : `## 🏆 Fight Ended\n> We have a winner!`;
                break;
            case "surrender":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.surrender
                    ? this.options.states.surrender
                    : `## 🏳️ Surrendered\n> The fight was forfeited.`;
                break;
            case "deny":
                container.setAccentColor(0xed4245); // Red
                content = this.options.states?.deny ? this.options.states.deny : `## 🚫 Denied\n> The challenge was rejected.`;
                break;
            case "timeout":
                container.setAccentColor(0x99aab5); // Grey
                content = this.options.states?.timeout
                    ? this.options.states.timeout
                    : `## ⏱️ Time's Up\n> The session expired.`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = this.options.states?.error?.main
                    ? this.options.states.error.main.replace("{{error}}", details?.error || this.options.states?.error?.uknownError
                        ? this.options.states.error.uknownError
                        : "Unknown error.")
                    : `## ❌ Error\n> ${details?.error || this.options.states?.error?.uknownError
                        ? this.options.states.error.uknownError
                        : "Unknown error."}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (details?.image) {
            const gallery = new discord_js_1.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "request") {
            const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel(this.btnAccept).setStyle(discord_js_1.ButtonStyle.Success).setCustomId("fight_accept"), new discord_js_1.ButtonBuilder().setLabel(this.btnDeny).setStyle(discord_js_1.ButtonStyle.Danger).setCustomId("fight_deny"));
            container.addActionRowComponents(row);
        }
        else if (state === "active") {
            const mainRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel(this.btnHit).setStyle(discord_js_1.ButtonStyle.Danger).setCustomId("fight_hit"), new discord_js_1.ButtonBuilder().setLabel(this.btnHeal).setStyle(discord_js_1.ButtonStyle.Success).setCustomId("fight_heal"), new discord_js_1.ButtonBuilder().setLabel(this.btnCancel).setStyle(discord_js_1.ButtonStyle.Secondary).setCustomId("fight_surrender"));
            container.addActionRowComponents(mainRow);
            const powerupRow = new discord_js_1.ActionRowBuilder().addComponents(this.POWERUPS.map((p) => new discord_js_1.ButtonBuilder().setLabel(`${p.label} (${p.cost}🪙)`).setStyle(p.style).setCustomId(`powerup_${p.id}`)));
            container.addActionRowComponents(powerupRow);
        }
        return container;
    }
}
exports.default = Fight;
