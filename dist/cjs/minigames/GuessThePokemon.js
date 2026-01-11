"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const gameData = new Set();
const GuessThePokemon = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    if (!options.thinkMessage)
        options.thinkMessage = "Thinking...";
    if (typeof options.thinkMessage !== "string") {
        return weky._LoggerManager.createTypeError("GuessThePokemon", "thinkMessage should be string");
    }
    if (!options.winMessage)
        options.winMessage = "GG! It was **{{answer}}**. You got it in **{{time}}**.";
    if (typeof options.winMessage !== "string") {
        return weky._LoggerManager.createTypeError("GuessThePokemon", "winMessage must be a string");
    }
    if (!options.loseMessage)
        options.loseMessage = "Better luck next time! It was **{{answer}}**.";
    if (typeof options.loseMessage !== "string") {
        return weky._LoggerManager.createTypeError("GuessThePokemon", "loseMessage must be a string");
    }
    if (!options.incorrectMessage)
        options.incorrectMessage = "No, it's not **{{answer}}**! Try again.";
    if (typeof options.incorrectMessage !== "string") {
        return weky._LoggerManager.createTypeError("GuessThePokemon", "incorrectMessage must be a string");
    }
    if (gameData.has(userId))
        return;
    gameData.add(userId);
    const gameTitle = options.embed.title || "Guess The Pokémon";
    const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;
    const cancelId = `gtp_cancel_${weky.getRandomString(10)}`;
    const btnText = options.buttonText || "Give Up";
    const createGameContainer = (state, data) => {
        const container = new discord_js_1.ContainerBuilder();
        let content = "";
        switch (state) {
            case "loading":
                container.setAccentColor(defaultColor);
                content = `## ${gameTitle}\n> 🔄 ${options.thinkMessage}`;
                break;
            case "active":
                container.setAccentColor(defaultColor);
                content =
                    `## ${gameTitle}\n` +
                        `**Types:** ${data.types}\n` +
                        `**Abilities:** ${data.abilities}\n\n` +
                        `> ⏳ Time: **${data.timeLeft || options.time}**\n` +
                        `> Type your guess in the chat!`;
                break;
            case "wrong":
                container.setAccentColor(0xed4245); // Red
                const wrongMsg = options.incorrectMessage.replace("{{answer}}", data.wrongGuess || "that");
                content =
                    `## ${gameTitle}\n` +
                        `**Types:** ${data.types}\n` +
                        `**Abilities:** ${data.abilities}\n\n` +
                        `> ❌ **${wrongMsg}**`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                const winMsg = options.winMessage.replace("{{answer}}", data.name).replace("{{time}}", data.timeTaken);
                content = `## 🏆 You caught it!\n> ${winMsg}`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                const loseMsg = options.loseMessage.replace("{{answer}}", data.name);
                content = `## ❌ Game Over\n> ${loseMsg}`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = `## ❌ Error\n> Failed to fetch Pokémon data.`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if ((state === "won" || state === "lost") && data.image) {
            const gallery = new discord_js_1.MediaGalleryBuilder().addItems((item) => item.setURL(data.image));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "active" || state === "wrong") {
            const btnCancel = new discord_js_1.ButtonBuilder().setStyle(discord_js_1.ButtonStyle.Danger).setLabel(btnText).setCustomId(cancelId);
            container.addActionRowComponents((row) => row.setComponents(btnCancel));
        }
        return container;
    };
    const msg = await context.channel.send({
        components: [createGameContainer("loading", {})],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const randomNumber = Math.floor(Math.random() * 898) + 1;
    let data;
    try {
        const res = await (0, node_fetch_1.default)(`https://pokeapi.co/api/v2/pokemon/${randomNumber}`);
        data = (await res.json());
    }
    catch (e) {
        gameData.delete(userId);
        return await msg.edit({
            components: [createGameContainer("error", {})],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
    }
    const pokemonName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    const abilities = data.abilities.map((item) => `\`${item.ability.name}\``).join(", ");
    const types = data.types.map((item) => `\`${item.type.name}\``).join(", ");
    const image = data.sprites.other.home.front_default;
    const timeString = weky.convertTime(options.time || 60000);
    await msg.edit({
        components: [createGameContainer("active", { types, abilities, timeLeft: timeString })],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    });
    const gameCreatedAt = Date.now();
    const timeLimit = options.time || 60000;
    const msgCollector = context.channel.createMessageCollector({
        filter: (m) => m.author.id === userId,
        time: timeLimit,
    });
    const btnCollector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        filter: (i) => i.user.id === userId,
        time: timeLimit,
    });
    msgCollector.on("collect", async (collectedMsg) => {
        const guess = collectedMsg.content.toLowerCase().trim();
        const correctName = data.name.toLowerCase();
        if (collectedMsg.deletable)
            await collectedMsg.delete().catch(() => { });
        if (guess === correctName) {
            msgCollector.stop("won");
            btnCollector.stop();
            gameData.delete(userId);
            const timeTaken = weky.convertTime(Date.now() - gameCreatedAt);
            await msg.edit({
                components: [
                    createGameContainer("won", {
                        name: pokemonName,
                        image,
                        timeTaken,
                    }),
                ],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
        else {
            await msg.edit({
                components: [
                    createGameContainer("wrong", {
                        types,
                        abilities,
                        wrongGuess: collectedMsg.content,
                    }),
                ],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
    });
    btnCollector.on("collect", async (btn) => {
        await btn.deferUpdate();
        if (btn.customId === cancelId) {
            msgCollector.stop("cancelled");
            btnCollector.stop();
            gameData.delete(userId);
            await msg.edit({
                components: [createGameContainer("lost", { name: pokemonName, image })],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
    });
    msgCollector.on("end", async (_collected, reason) => {
        if (reason === "time") {
            btnCollector.stop();
            gameData.delete(userId);
            try {
                await msg.edit({
                    components: [createGameContainer("lost", { name: pokemonName, image })],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    });
};
exports.default = GuessThePokemon;
