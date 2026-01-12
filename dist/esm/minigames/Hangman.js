import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MediaGalleryBuilder, MessageFlags, } from "discord.js";
const Hangman = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    const member = await context.guild?.members.fetch(userId);
    const username = member?.user.username || "Player";
    const userIcon = member?.user.displayAvatarURL({ extension: "png" }) || "";
    const gameTitle = options.embed?.title || "Hangman";
    const defaultColor = typeof options.embed?.color === "number" ? options.embed.color : 0x5865f2;
    const createGameContainer = (state, details) => {
        const container = new ContainerBuilder();
        let content = "";
        switch (state) {
            case "loading":
                container.setAccentColor(defaultColor);
                content = options.states?.loading
                    ? options.states.loading.replace("{{gameTitle}}", gameTitle)
                    : `## ${gameTitle}\n> 🔄 Starting game...`;
                break;
            case "active":
                container.setAccentColor(defaultColor);
                content = options.states?.active
                    ? options.states.active.replace("{{gameTitle}}", gameTitle)
                    : `## ${gameTitle}\n> Type a letter in the chat to guess!`;
                break;
            case "won":
                container.setAccentColor(0x57f287); // Green
                content = options.states?.won
                    ? options.states.won.replace("{{word}}", details?.word)
                    : `## 🎉 Victory!\n> You guessed the word: **${details?.word}**`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                content = options.states?.lost
                    ? options.states.lost.replace("{{word}}", details?.word)
                    : `## 💀 Game Over\n> The word was: **${details?.word}**`;
                break;
            case "quit":
                container.setAccentColor(0xed4245); // Red
                content = options.states?.quit
                    ? options.states.quit.replace("{{word}}", details?.word)
                    : `## 🛑 Game Stopped\n> You quit the game. The word was: **${details?.word}**`;
                break;
            case "timeout":
                container.setAccentColor(0xed4245); // Red
                content = options.states?.timeout
                    ? options.states.timeout.replace("{{word}}", details?.word)
                    : `## ⏱️ Time's Up\n> Session expired. The word was: **${details?.word}**`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = options.states?.error?.main
                    ? options.states.error.main.replace("{{error}}", details?.error || options.states?.error?.unknownError
                        ? options.states.error.unknownError
                        : "Unknown error.")
                    : `## ❌ Error\n> ${details?.error || options.states?.error?.unknownError
                        ? options.states.error.unknownError
                        : "Unknown error."}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (details?.image) {
            const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
            container.addMediaGalleryComponents(gallery);
        }
        if (state === "active") {
            const quitBtn = new ButtonBuilder()
                .setLabel("Quit Game")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("hangman_quit")
                .setEmoji("🛑");
            container.addActionRowComponents((row) => row.setComponents(quitBtn));
        }
        return container;
    };
    const msg = await context.channel.send({
        components: [createGameContainer("loading")],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const gameID = await weky.NetworkManager.createHangmanGame(userId, username);
    if (gameID === "-1") {
        return await msg.edit({
            components: [
                createGameContainer("error", {
                    error: options.errors?.failedToStart ? options.errors.failedToStart : "Failed to start game.",
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    let attachment = await weky.NetworkManager.getHangmanBoardImage(gameID, userIcon);
    if (!attachment) {
        return await msg.edit({
            components: [
                createGameContainer("error", {
                    error: options.errors?.failedToGenerate ? options.errors.failedToGenerate : "Failed to generate game board.",
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    await msg.edit({
        components: [createGameContainer("active", { image: "hangman-board.png" })],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
    });
    const time = options.time || 180_000;
    const chatCollector = context.channel.createMessageCollector({
        filter: (m) => m.author.id === userId && !m.author.bot,
        time: time,
    });
    const btnCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: time,
    });
    let isGameOver = false;
    let finalWord = "Unknown";
    btnCollector.on("collect", async (interaction) => {
        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: options.othersMessage ? options.othersMessage : "This is not your game!",
                flags: [MessageFlags.Ephemeral],
            });
        }
        if (interaction.customId === "hangman_quit") {
            await interaction.deferUpdate();
            isGameOver = true;
            chatCollector.stop("quit");
            btnCollector.stop();
            await weky.NetworkManager.endHangmanGame(gameID);
            await msg.edit({
                components: [createGameContainer("quit", { word: finalWord !== "Unknown" ? finalWord : "Hidden" })],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    });
    chatCollector.on("collect", async (message) => {
        if (isGameOver)
            return;
        const char = message.content.trim().charAt(0).toLowerCase();
        if (!char || !/[a-z]/i.test(char)) {
            if (message.deletable)
                await message.delete().catch(() => { });
            return;
        }
        if (message.deletable)
            await message.delete().catch(() => { });
        const response = await weky.NetworkManager.guessHangman(gameID, char);
        if (!response) {
            isGameOver = true;
            chatCollector.stop("error");
            btnCollector.stop();
            return msg.edit({
                components: [
                    createGameContainer("error", {
                        error: options.errors?.noApiResponse ? options.errors.noApiResponse : "API did not respond.",
                    }),
                ],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        if (!response.success) {
            const warning = await context.channel.send(`${member}, ${response.message}`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }
        const { game } = response;
        finalWord = game.word;
        attachment = await weky.NetworkManager.getHangmanBoardImage(gameID, userIcon);
        if (game.gameOver) {
            isGameOver = true;
            chatCollector.stop(game.won ? "won" : "lost");
            btnCollector.stop();
            await weky.NetworkManager.endHangmanGame(gameID);
            await msg.edit({
                components: [
                    createGameContainer(game.won ? "won" : "lost", {
                        image: "hangman-board.png",
                        word: game.word,
                    }),
                ],
                files: attachment ? [attachment] : [],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        else {
            await msg.edit({
                components: [createGameContainer("active", { image: "hangman-board.png" })],
                files: attachment ? [attachment] : [],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    });
    chatCollector.on("end", async (_, reason) => {
        if (reason === "time") {
            isGameOver = true;
            btnCollector.stop();
            await weky.NetworkManager.endHangmanGame(gameID);
            await msg
                .edit({
                components: [createGameContainer("timeout", { word: finalWord !== "Unknown" ? finalWord : "Hidden" })],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            })
                .catch(() => { });
        }
    });
};
export default Hangman;
