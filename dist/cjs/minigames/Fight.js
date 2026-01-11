"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const POWERUPS = [
    {
        id: "double-damage",
        label: "2x Damage",
        style: discord_js_1.ButtonStyle.Danger,
        cost: 30,
        effect: (player, playerUsername) => {
            player.activeEffects.push("Double Damage (Next Attack)");
            return `${playerUsername} will deal double damage on their next attack!`;
        },
    },
    {
        id: "shield",
        label: "Shield",
        style: discord_js_1.ButtonStyle.Secondary,
        cost: 25,
        effect: (player, playerUsername) => {
            player.activeEffects.push("Shield (Next Attack)");
            return `${playerUsername} will take half damage from the next attack!`;
        },
    },
    {
        id: "heal-boost",
        label: "Heal Boost",
        style: discord_js_1.ButtonStyle.Success,
        cost: 20,
        effect: (player, playerUsername) => {
            player.health += 30;
            if (player.health > 100)
                player.health = 100;
            return `${playerUsername} received a 30 HP healing boost!`;
        },
    },
];
const Fight = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    if (!options.buttons)
        options.buttons = {};
    const btnHit = options.buttons.hit || "Hit";
    const btnHeal = options.buttons.heal || "Heal";
    const btnCancel = options.buttons.cancel || "Surrender";
    const btnAccept = options.buttons.accept || "Accept";
    const btnDeny = options.buttons.deny || "Deny";
    const msgWrongUser = options.wrongUserFight || "**This is not your Game!**";
    const msgOpponentTurn = options.opponentsTurnMessage || "**Please wait for your opponents move!**";
    const msgHighHp = options.highHealthMessage || "You cannot heal if your HP is above 80!";
    const msgLowHp = options.lowHealthMessage || "You cannot cancel the fight if your HP is below 50!";
    const defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0xed4245;
    if (!options.opponent || !options.opponent.user) {
        return weky._LoggerManager.createError("Fight", "Opponent must be a valid GuildMember.");
    }
    if (userId === options.opponent.id) {
        return context.channel.send("You cannot fight yourself!");
    }
    const challenger = await context.guild?.members.fetch(userId);
    const opponent = options.opponent;
    if (!challenger)
        return;
    if ((await weky.NetworkManager.checkPlayerFightStatus(challenger.id)) ||
        (await weky.NetworkManager.checkPlayerFightStatus(opponent.id))) {
        return context.channel.send("One of the players is already in a fight!");
    }
    const createGameContainer = (state, details) => {
        const container = new discord_js_1.ContainerBuilder();
        let content = "";
        switch (state) {
            case "request":
                container.setAccentColor(0xfee75c); // Yellow
                content = `## ⚔️ Challenge!\n> <@${challenger.id}> challenged <@${opponent.id}> to a fight!`;
                break;
            case "active":
                container.setAccentColor(defaultColor);
                content = `## ⚔️ Fighting...\n> Use buttons to fight or buy powerups!`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                content = `## 🏆 Fight Ended\n> We have a winner!`;
                break;
            case "surrender":
                container.setAccentColor(0xed4245); // Red
                content = `## 🏳️ Surrendered\n> The fight was forfeited.`;
                break;
            case "deny":
                container.setAccentColor(0xed4245); // Red
                content = `## 🚫 Denied\n> The challenge was rejected.`;
                break;
            case "timeout":
                container.setAccentColor(0x99aab5); // Grey
                content = `## ⏱️ Time's Up\n> The session expired.`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = `## ❌ Error\n> ${details?.error || "Unknown error."}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (details?.image) {
            const gallery = new discord_js_1.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "request") {
            const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel(btnAccept).setStyle(discord_js_1.ButtonStyle.Success).setCustomId("fight_accept"), new discord_js_1.ButtonBuilder().setLabel(btnDeny).setStyle(discord_js_1.ButtonStyle.Danger).setCustomId("fight_deny"));
            container.addActionRowComponents(row);
        }
        else if (state === "active") {
            const mainRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel(btnHit).setStyle(discord_js_1.ButtonStyle.Danger).setCustomId("fight_hit"), new discord_js_1.ButtonBuilder().setLabel(btnHeal).setStyle(discord_js_1.ButtonStyle.Success).setCustomId("fight_heal"), new discord_js_1.ButtonBuilder().setLabel(btnCancel).setStyle(discord_js_1.ButtonStyle.Secondary).setCustomId("fight_surrender"));
            container.addActionRowComponents(mainRow);
            const powerupRow = new discord_js_1.ActionRowBuilder().addComponents(POWERUPS.map((p) => new discord_js_1.ButtonBuilder().setLabel(`${p.label} (${p.cost}🪙)`).setStyle(p.style).setCustomId(`powerup_${p.id}`)));
            container.addActionRowComponents(powerupRow);
        }
        return container;
    };
    const requestCard = await weky.NetworkManager.makeRequestCard(challenger.user.username, challenger.displayAvatarURL({ extension: "png", size: 256 }), opponent.user.username, opponent.displayAvatarURL({ extension: "png", size: 256 }));
    if (!requestCard)
        return context.channel.send("Failed to generate request card.");
    const msg = await context.channel.send({
        components: [createGameContainer("request", { image: "fight-request.png" })],
        files: [requestCard],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    });
    const gameId = await weky.NetworkManager.createGame(challenger.id, challenger.user.username, opponent.id, opponent.user.username);
    const reqCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: options.time || 60000,
    });
    reqCollector.on("collect", async (interaction) => {
        if (interaction.user.id !== opponent.id) {
            return interaction.reply({ content: msgWrongUser, flags: [discord_js_1.MessageFlags.Ephemeral] });
        }
        if (interaction.customId === "fight_deny") {
            await interaction.deferUpdate();
            reqCollector.stop("deny");
            const denyCard = await weky.NetworkManager.makeDenyCard(challenger.user.username, challenger.displayAvatarURL({ extension: "png", size: 256 }), opponent.user.username, opponent.displayAvatarURL({ extension: "png", size: 256 }));
            await weky.NetworkManager.removeGame(gameId);
            await msg.edit({
                components: [createGameContainer("deny", { image: "fight-deny.png" })],
                files: denyCard ? [denyCard] : [],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
            return;
        }
        if (interaction.customId === "fight_accept") {
            await interaction.deferUpdate();
            reqCollector.stop("accept");
            await startFight(msg, gameId);
        }
    });
    reqCollector.on("end", async (collected, reason) => {
        if (reason === "time" && collected.size === 0) {
            const timeoutCard = await weky.NetworkManager.makeTimeOutCard(challenger.user.username, challenger.displayAvatarURL({ extension: "png", size: 256 }), opponent.user.username, opponent.displayAvatarURL({ extension: "png", size: 256 }));
            await weky.NetworkManager.removeGame(gameId);
            await msg
                .edit({
                components: [createGameContainer("timeout", { image: "fight-timeout.png" })],
                files: timeoutCard ? [timeoutCard] : [],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            })
                .catch(() => { });
        }
    });
    async function startFight(message, gameID) {
        const gameCard = await weky.NetworkManager.makeMainCard(gameID, challenger.displayAvatarURL({ extension: "png", size: 256 }), opponent.displayAvatarURL({ extension: "png", size: 256 }));
        await message.edit({
            components: [createGameContainer("active", { image: "fight-card.png" })],
            files: [gameCard],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
        const collector = message.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
            time: 300000,
        });
        collector.on("collect", async (i) => {
            if (i.user.id !== challenger.id && i.user.id !== opponent.id) {
                return i.reply({ content: msgWrongUser, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            const turn = await weky.NetworkManager.getTurn(gameID);
            if (i.user.id !== turn.userID) {
                return i.reply({ content: msgOpponentTurn, flags: [discord_js_1.MessageFlags.Ephemeral] });
            }
            await i.deferUpdate();
            const player = await weky.NetworkManager.getPlayer(gameID, false);
            const enemy = await weky.NetworkManager.getPlayer(gameID, true);
            const playerMember = await i.guild?.members.fetch(player.memberId);
            const enemyMember = await i.guild?.members.fetch(enemy.memberId);
            if (!playerMember || !enemyMember)
                return;
            if (i.customId === "fight_hit") {
                let damage = Math.floor(Math.random() * 20) + 10;
                if (player.activeEffects.includes("Double Damage (Next Attack)")) {
                    damage *= 2;
                    player.activeEffects = player.activeEffects.filter((e) => e !== "Double Damage (Next Attack)");
                }
                if (enemy.activeEffects.includes("Shield (Next Attack)")) {
                    damage = Math.floor(damage / 2);
                    enemy.activeEffects = enemy.activeEffects.filter((e) => e !== "Shield (Next Attack)");
                }
                enemy.health -= damage;
                player.coins += 10;
                const updated = await weky.NetworkManager.updatePlayers(gameID, player, enemy);
                if (!updated)
                    return i.followUp({ content: "API Error", flags: [discord_js_1.MessageFlags.Ephemeral] });
                if (enemy.health <= 0) {
                    collector.stop("won");
                    const winCard = await weky.NetworkManager.makeWinCard(playerMember.user.username, playerMember.displayAvatarURL({ extension: "png", size: 256 }), enemyMember.user.username, enemyMember.displayAvatarURL({ extension: "png", size: 256 }));
                    await weky.NetworkManager.removeGame(gameID);
                    return message.edit({
                        components: [createGameContainer("won", { image: "fight-winner.png" })],
                        files: [winCard],
                        flags: discord_js_1.MessageFlags.IsComponentsV2,
                    });
                }
            }
            else if (i.customId === "fight_heal") {
                if (player.health >= 80) {
                    return i.followUp({ content: msgHighHp, flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                const healAmt = Math.floor(Math.random() * 20) + 10;
                player.health = Math.min(100, player.health + healAmt);
                await weky.NetworkManager.updatePlayers(gameID, player, enemy);
            }
            else if (i.customId === "fight_surrender") {
                if (player.health < 50) {
                    return i.followUp({ content: msgLowHp, flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                collector.stop("surrender");
                const surrenderCard = await weky.NetworkManager.makeSurrenderCard(enemyMember.user.username, enemyMember.displayAvatarURL({ extension: "png", size: 256 }), playerMember.user.username, playerMember.displayAvatarURL({ extension: "png", size: 256 }));
                await weky.NetworkManager.removeGame(gameID);
                return message.edit({
                    components: [createGameContainer("surrender", { image: "fight-surrender.png" })],
                    files: [surrenderCard],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            else if (i.customId.startsWith("powerup_")) {
                const pId = i.customId.split("_")[1];
                const powerup = POWERUPS.find((p) => p.id === pId);
                if (powerup && player.coins >= powerup.cost) {
                    player.coins -= powerup.cost;
                    const msg = powerup.effect(player, playerMember.user.username);
                    await weky.NetworkManager.updatePlayers(gameID, player, enemy);
                    await i.followUp({ content: msg, flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
                else {
                    return i.followUp({ content: "Not enough coins!", flags: [discord_js_1.MessageFlags.Ephemeral] });
                }
            }
            await weky.NetworkManager.changeTurn(gameID);
            const newCard = await weky.NetworkManager.makeMainCard(gameID, challenger.displayAvatarURL({ extension: "png", size: 256 }), opponent.displayAvatarURL({ extension: "png", size: 256 }));
            await message.edit({
                components: [createGameContainer("active", { image: "fight-card.png" })],
                files: [newCard],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        });
    }
};
exports.default = Fight;
