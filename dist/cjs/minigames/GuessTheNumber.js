"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const data = new Set();
const currentGames = new Object();
const GuessTheNumber = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    const channelId = context.channel.id;
    const isPublic = options.publicGame ?? false;
    if (!options.ongoingMessage) {
        options.ongoingMessage = "A game is already running in <#{{channel}}>. Try again later!";
    }
    if (!options.winMessage)
        options.winMessage = {};
    const winMsgPublic = options.winMessage.publicGame ||
        "GG! The number was **{{number}}**. <@{{winner}}> guessed it in **{{time}}**.\n\n__**Stats:**__\n**Participants:** {{totalparticipants}}";
    const winMsgPrivate = options.winMessage.privateGame || "GG! The number was **{{number}}**. You guessed it in **{{time}}**.";
    let number = options.number;
    if (typeof number !== "number") {
        number = Math.floor(Math.random() * 1000) + 1;
    }
    let min = 0;
    let max = number * (Math.floor(Math.random() * 5) + 2);
    const gameTitle = options.embed.title || "Guess The Number";
    const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;
    const cancelId = `gtn_cancel_${weky.getRandomString(10)}`;
    const createGameContainer = (state, gameData) => {
        const container = new discord_js_1.ContainerBuilder();
        let content = "";
        switch (state) {
            case "active":
                container.setAccentColor(defaultColor); // Blurple
                content = options.states?.active
                    ? options.states.active
                        .replace("{{gameTitle}}", gameTitle)
                        .replace("{{time}}", weky.convertTime(options.time || 60000))
                        .replace("{{hintRange}}", `\`${gameData.min ?? min}\` - \`${gameData.max ?? max}\``)
                    : `## ${gameTitle}\n> 🔢 I'm thinking of a number...\n> ⏳ Time: **${weky.convertTime(options.time || 60000)}**\n\n**Hint Range:** \`${gameData.min ?? min}\` - \`${gameData.max ?? max}\`\nType your guess in the chat!`;
                break;
            case "higher":
                container.setAccentColor(0xfee75c); // Yellow
                content = options.states?.higher
                    ? options.states.higher
                        .replace("{{gameTitle}}", gameTitle)
                        .replace("{{guess}}", gameData.guess.toString())
                        .replace("{{currentRange}}", `\`${gameData.min}\` - \`${gameData.max}\``)
                    : `## ${gameTitle}\n> 🔼 The number is **HIGHER** than **${gameData.guess}**!\n\n**Current Range:** \`${gameData.min}\` - \`${gameData.max}\``;
                break;
            case "lower":
                container.setAccentColor(0xe67e22); // Orange
                content = options.states?.lower
                    ? options.states.lower
                        .replace("{{gameTitle}}", gameTitle)
                        .replace("{{guess}}", gameData.guess.toString())
                        .replace("{{currentRange}}", `\`${gameData.min}\` - \`${gameData.max}\``)
                    : `## ${gameTitle}\n> 🔽 The number is **LOWER** than **${gameData.guess}**!\n\n**Current Range:** \`${gameData.min}\` - \`${gameData.max}\``;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                let winText = isPublic ? winMsgPublic : winMsgPrivate;
                winText = winText
                    .replace("{{number}}", `${number}`)
                    .replace("{{winner}}", gameData.winner || "")
                    .replace("{{time}}", gameData.timeTaken || "")
                    .replace("{{totalparticipants}}", `${gameData.participants?.length || 1}`);
                content = options.states?.won
                    ? options.states.won.replace("{{winText}}", winText)
                    : `## 🏆 Correct!\n> ${winText}`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                const loseText = (options.loseMessage || "The number was **{{number}}**.").replace("{{number}}", `${number}`);
                content = options.states?.lost
                    ? options.states.lost.replace("{{loseText}}", loseText)
                    : `## ❌ Game Over\n> ${loseText}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (state === "active" || state === "higher" || state === "lower") {
            const btnCancel = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.giveUpButton || "Give Up")
                .setCustomId(cancelId);
            container.addActionRowComponents((row) => row.setComponents(btnCancel));
        }
        return container;
    };
    if (isPublic && currentGames[context.guild.id]) {
        const msg = options.ongoingMessage.replace("{{channel}}", currentGames[`${context.guild.id}_channel`]);
        const errorContainer = new discord_js_1.ContainerBuilder()
            .setAccentColor(0xff0000)
            .addTextDisplayComponents((t) => t.setContent(`## ❌ Error\n> ${msg}`));
        return context.channel.send({ components: [errorContainer], flags: discord_js_1.MessageFlags.IsComponentsV2 });
    }
    if (!isPublic) {
        if (data.has(userId))
            return;
        data.add(userId);
    }
    else {
        currentGames[context.guild.id] = true;
        currentGames[`${context.guild.id}_channel`] = channelId;
    }
    const msg = await context.channel.send({
        components: [createGameContainer("active", { min, max })],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    });
    const gameCreatedAt = Date.now();
    const participants = [];
    const msgCollector = context.channel.createMessageCollector({
        filter: (m) => (isPublic ? !m.author.bot : m.author.id === userId),
        time: options.time || 60000,
    });
    const btnCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: options.time || 60000,
    });
    msgCollector.on("collect", async (collectedMsg) => {
        if (isPublic && !participants.includes(collectedMsg.author.id)) {
            participants.push(collectedMsg.author.id);
        }
        const guess = parseInt(collectedMsg.content, 10);
        if (isNaN(guess))
            return;
        if (collectedMsg.deletable)
            await collectedMsg.delete().catch(() => { });
        if (guess === number) {
            msgCollector.stop("won");
            btnCollector.stop();
            const timeTaken = weky.convertTime(Date.now() - gameCreatedAt);
            await msg.edit({
                components: [
                    createGameContainer("won", {
                        winner: collectedMsg.author.id,
                        timeTaken,
                        participants,
                    }),
                ],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
        else {
            let state = "active";
            if (guess < number) {
                state = "higher";
                if (guess > min)
                    min = guess;
            }
            else {
                state = "lower";
                if (guess < max)
                    max = guess;
            }
            await msg.edit({
                components: [
                    createGameContainer(state, {
                        guess,
                        min,
                        max,
                    }),
                ],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
    });
    btnCollector.on("collect", async (btn) => {
        if (btn.user.id !== userId) {
            return btn.reply({
                content: options.otherMessage?.replace("{{author}}", userId) || "This is not your game!",
                flags: [discord_js_1.MessageFlags.Ephemeral],
            });
        }
        await btn.deferUpdate();
        if (btn.customId === cancelId) {
            msgCollector.stop("cancelled");
            btnCollector.stop();
            await msg.edit({
                components: [createGameContainer("lost", {})],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
    });
    msgCollector.on("end", async (_collected, reason) => {
        if (!isPublic)
            data.delete(userId);
        else
            delete currentGames[context.guild.id];
        if (reason === "time") {
            btnCollector.stop();
            try {
                await msg.edit({
                    components: [createGameContainer("lost", {})],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    });
};
exports.default = GuessTheNumber;
