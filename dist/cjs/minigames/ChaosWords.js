"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const activePlayers = new Set();
const ChaosWords = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    if (activePlayers.has(userId))
        return;
    activePlayers.add(userId);
    const cancelId = `chaos_cancel_${weky.getRandomString(10)}`;
    const gameTitle = options.embed?.title || "Chaos Words";
    const defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
    const maxTries = options.maxTries || 10;
    const timeLimit = options.time || 60000;
    let words = options.words || [];
    if (words.length === 0) {
        try {
            const fetchedWords = await weky.NetworkManager.getRandomSentence(Math.floor(Math.random() * 3) + 2);
            words = fetchedWords.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
            words = words.filter((w) => w.length > 0);
        }
        catch (e) {
            activePlayers.delete(userId);
            return context.channel.send(options.failedFetchMessage ? options.failedFetchMessage : "Failed to fetch words.");
        }
    }
    else {
        words = words.map((w) => w.toLowerCase());
    }
    const totalWordLength = words.join("").length;
    let charCount = options.charGenerated || totalWordLength + 5;
    const chaosArray = [];
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < charCount; i++) {
        chaosArray.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }
    words.forEach((word) => {
        const insertPos = Math.floor(Math.random() * chaosArray.length);
        chaosArray.splice(insertPos, 0, word);
    });
    const gameState = {
        remaining: [...words],
        found: [],
        tries: 0,
    };
    const createGameContainer = (state, details) => {
        const container = new discord_js_1.ContainerBuilder();
        let content = "";
        switch (state) {
            case "active":
                container.setAccentColor(defaultColor);
                content = options.states?.active
                    ? options.states.active.replace("{{gameTitle}}", gameTitle)
                    : `## ${gameTitle}\n> Find the hidden words in the text below!`;
                break;
            case "correct":
                container.setAccentColor(0x57f287); // Green
                content = options.states?.correct
                    ? options.states.correct.replace("{{gameTitle}}", gameTitle).replace("{{detailsFeedback}}", details?.feedback)
                    : `## ${gameTitle}\n> ✅ **${details?.feedback}**`;
                break;
            case "wrong":
                container.setAccentColor(0xed4245); // Red
                content = options.states?.wrong
                    ? options.states.wrong.replace("{{gameTitle}}", gameTitle).replace("{{detailsFeedback}}", details?.feedback)
                    : `## ${gameTitle}\n> ❌ **${details?.feedback}**`;
                break;
            case "repeat":
                container.setAccentColor(0xfee75c); // Yellow
                content = options.states?.repeat
                    ? options.states.repeat.replace("{{gameTitle}}", gameTitle).replace("{{detailsFeedback}}", details?.feedback)
                    : `## ${gameTitle}\n> ⚠️ **${details?.feedback}**`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                const winMsg = options.states?.won?.winMessage
                    ? options.states.won.winMessage.replace("{{timeTaken}}", details.timeTaken || "")
                    : `You found all words in **${details.timeTaken || ""}**!`;
                content = options.states?.won?.winContent
                    ? options.states.won.winMessage.replace("{{winMsg}}", winMsg)
                    : `## 🏆 You Won!\n> ${winMsg}`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                const loseMsg = options.states?.lost?.loseMessage
                    ? options.states.lost.loseMessage
                    : "You failed to find all words.";
                content = options.states?.lost?.loseContent
                    ? options.states.lost.loseContent.replace("{{loseMsg}}", loseMsg)
                    : `## ❌ Game Over\n> ${loseMsg}`;
                break;
            case "timeout":
                container.setAccentColor(0xed4245); // Red
                content = options.states?.timeout ? options.states.timeout : `## ⏱️ Time's Up\n> You ran out of time!`;
                break;
            case "cancelled":
                container.setAccentColor(0xed4245); // Red
                content = options.states?.cancelled ? options.states.cancelled : `## 🚫 Cancelled\n> Game ended by player.`;
                break;
        }
        if (state !== "cancelled") {
            const currentChaosString = chaosArray.join("");
            content += options.states?.chaosString
                ? options.states.chaosString.replace("{{currentChaosString}}", currentChaosString)
                : `\n\n**Chaos String:**\n\`\`\`text\n${currentChaosString}\n\`\`\``;
            content += options.states?.wordsFound?.main
                ? options.states?.wordsFound.main
                    .replace("{{totalFound}}", `${gameState.found.length}/${words.length}`)
                    .replace("{{wordList}}}", gameState.found.length > 0
                    ? gameState.found.map((w) => `\`${w}\``).join(", ")
                    : options.states?.wordsFound?.noneYet
                        ? options.states.wordsFound.noneYet
                        : "_None yet_")
                : `\n**Words Found (${gameState.found.length}/${words.length}):**\n` +
                    `${gameState.found.length > 0 ? gameState.found.map((w) => `\`${w}\``).join(", ") : "_None yet_"}`;
            if (state === "won") {
            }
            else if (state === "lost" || state === "timeout") {
                content += options.states?.missingWords
                    ? options.states.missingWords.replace("{{words}}", gameState.remaining.map((w) => `\`${w}\``).join(", "))
                    : `\n\n**Missing Words:**\n${gameState.remaining.map((w) => `\`${w}\``).join(", ")}`;
            }
            else {
                content += options.states?.tries
                    ? options.states.tries.replace("{{totalTries}}", `${gameState.tries}/${maxTries}`)
                    : `\n\n**Tries:** ${gameState.tries}/${maxTries}`;
                content += options.states?.timeRemaining
                    ? options.states.timeRemaining.replace("{{time}}", weky.convertTime(timeLimit))
                    : `\n> ⏳ Time Remaining: **${weky.convertTime(timeLimit)}**`;
            }
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (state === "active" || state === "correct" || state === "wrong" || state === "repeat") {
            const btnCancel = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.cancelButton || "Cancel")
                .setCustomId(cancelId);
            container.addActionRowComponents((row) => row.setComponents(btnCancel));
        }
        return container;
    };
    const msg = await context.channel.send({
        components: [createGameContainer("active")],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const gameCreatedAt = Date.now();
    const msgCollector = context.channel.createMessageCollector({
        filter: (m) => !m.author.bot && m.author.id === userId,
        time: timeLimit,
    });
    const btnCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        filter: (i) => i.user.id === userId,
        time: timeLimit,
    });
    msgCollector.on("collect", async (mes) => {
        const guess = mes.content.toLowerCase().trim();
        if (mes.deletable)
            await mes.delete().catch(() => { });
        if (gameState.found.includes(guess)) {
            await msg.edit({
                components: [
                    createGameContainer("repeat", {
                        feedback: options.wordAlreadyFound
                            ? options.wordAlreadyFound.replace("{{guess}}", guess)
                            : `You already found "${guess}"!`,
                    }),
                ],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
            return;
        }
        if (gameState.remaining.includes(guess)) {
            gameState.found.push(guess);
            gameState.remaining = gameState.remaining.filter((w) => w !== guess);
            const indexInChaos = chaosArray.indexOf(guess);
            if (indexInChaos > -1) {
                chaosArray.splice(indexInChaos, 1);
            }
            if (gameState.remaining.length === 0) {
                msgCollector.stop("won");
                btnCollector.stop();
                activePlayers.delete(userId);
                const timeTaken = weky.convertTime(Date.now() - gameCreatedAt);
                await msg.edit({
                    components: [createGameContainer("won", { timeTaken })],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            else {
                const correctMsg = options.correctWord
                    ? options.correctWord.replace("{{guess}}", guess).replace("{{remaining}}", `${gameState.remaining.length}`)
                    : `Correct! **${guess}** was found.`;
                await msg.edit({
                    components: [createGameContainer("correct", { feedback: correctMsg })],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
        }
        else {
            gameState.tries++;
            if (gameState.tries >= maxTries) {
                msgCollector.stop("lost");
                btnCollector.stop();
                activePlayers.delete(userId);
                await msg.edit({
                    components: [createGameContainer("lost")],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            else {
                const wrongMsg = options.wrongWord
                    ? options.wrongWord
                        .replace("{{guess}}", guess)
                        .replace("{{remaining_tries}}", `${maxTries - gameState.tries}`)
                    : `**${guess}** is not in the text!`;
                await msg.edit({
                    components: [createGameContainer("wrong", { feedback: wrongMsg })],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
        }
    });
    btnCollector.on("collect", async (btn) => {
        if (btn.customId === cancelId) {
            await btn.deferUpdate();
            msgCollector.stop("cancelled");
            btnCollector.stop();
            activePlayers.delete(userId);
            await msg.edit({
                components: [createGameContainer("cancelled")],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
    });
    msgCollector.on("end", async (_collected, reason) => {
        if (reason === "time") {
            btnCollector.stop();
            activePlayers.delete(userId);
            try {
                await msg.edit({
                    components: [createGameContainer("timeout")],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    });
};
exports.default = ChaosWords;
