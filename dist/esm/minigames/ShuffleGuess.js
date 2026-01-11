import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags } from "discord.js";
const data = new Set();
const ShuffleGuess = async (weky, options) => {
    const context = options.context;
    const id = weky._getContextUserID(context);
    if (!options.word) {
        options.word = (await weky.NetworkManager.getRandomSentence(1))[0];
    }
    if (!options.time)
        options.time = 60000;
    if (isNaN(options.time) || options.time < 10000) {
        return weky._LoggerManager.createError("ShuffleGuess", "time must be greater than 10 Seconds (in ms i.e. 10000)");
    }
    if (options.time && typeof options.time !== "number") {
        return weky._LoggerManager.createError("ShuffleGuess", "Time must be a number.");
    }
    const btnLabels = {
        reshuffle: options.buttons?.reshuffle || "Reshuffle",
        cancel: options.buttons?.cancel || "Cancel",
    };
    const messages = {
        start: options.startMessage || "The word is **{{word}}**! You have **{{time}}** to guess it.",
        win: options.winMessage || "✅ **Correct!** You guessed **{{word}}** in **{{time}}**.",
        lose: options.loseMessage || "❌ **Game Over!** The word was **{{answer}}**.",
        incorrect: options.incorrectMessage || "❌ **Wrong!** That is not the word.",
    };
    data.add(id);
    const reshuffleId = `shuffle_${weky.getRandomString(10)}`;
    const cancelId = `cancel_${weky.getRandomString(10)}`;
    let currentScramble = weky.shuffleString(options.word.toString());
    const gameCreatedAt = Date.now();
    let isGameActive = true;
    const createGameContainer = (state, scrambledWord, feedback = "") => {
        let color = 0x5865f2;
        if (state === "correct")
            color = 0x57f287;
        if (state === "wrong" || state === "lost")
            color = 0xed4245;
        if (typeof options.embed.color === "number" && state === "playing")
            color = options.embed.color;
        const container = new ContainerBuilder().setAccentColor(color);
        let mainContent = options.embed.title || `## Shuffle Guess\n`;
        if (state === "playing" || state === "wrong") {
            const timeStr = weky.convertTime(options.time);
            const desc = messages.start
                .replace("{{word}}", `\`${scrambledWord.toUpperCase()}\``)
                .replace("{{time}}", timeStr);
            mainContent += `${desc}\n\n`;
            if (state === "wrong" && feedback) {
                mainContent += `> ${feedback}`;
            }
            else {
                mainContent += `Type your guess in the chat!`;
            }
        }
        else if (state === "correct") {
            mainContent += feedback;
        }
        else if (state === "lost") {
            mainContent += feedback;
        }
        container.addTextDisplayComponents((text) => text.setContent(mainContent));
        const btnReshuffle = new ButtonBuilder()
            .setLabel(btnLabels.reshuffle)
            .setStyle(ButtonStyle.Primary)
            .setCustomId(reshuffleId)
            .setDisabled(!isGameActive);
        const btnCancel = new ButtonBuilder()
            .setLabel(btnLabels.cancel)
            .setStyle(ButtonStyle.Danger)
            .setCustomId(cancelId)
            .setDisabled(!isGameActive);
        container.addActionRowComponents((row) => row.setComponents(btnReshuffle, btnCancel));
        return container;
    };
    const msg = await context.channel.send({
        components: [createGameContainer("playing", currentScramble)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const messageCollector = context.channel.createMessageCollector({
        filter: (m) => m.author.id === id,
        time: options.time,
    });
    const componentCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: options.time,
    });
    messageCollector.on("collect", async (collectedMsg) => {
        if (!isGameActive)
            return;
        if (collectedMsg.system)
            return;
        if (collectedMsg.deletable)
            await collectedMsg.delete().catch(() => { });
        const guess = collectedMsg.content.toLowerCase().trim();
        const correctWord = options.word.toString().toLowerCase().trim();
        if (guess === correctWord) {
            isGameActive = false;
            messageCollector.stop("winner");
            componentCollector.stop("winner");
            const timeTaken = weky.convertTime(Date.now() - gameCreatedAt);
            const winText = messages.win.replace("{{word}}", `\`${options.word}\``).replace("{{time}}", timeTaken);
            await msg.edit({
                components: [createGameContainer("correct", currentScramble, winText)],
                flags: MessageFlags.IsComponentsV2,
            });
            data.delete(id);
        }
        else {
            const incorrectText = messages.incorrect;
            await msg.edit({
                components: [createGameContainer("wrong", currentScramble, incorrectText)],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    });
    componentCollector.on("collect", async (interaction) => {
        if (interaction.user.id !== id) {
            return interaction.reply({
                content: options.othersMessage?.replace("{{author}}", id) || `Only <@${id}> can play!`,
                flags: [MessageFlags.Ephemeral],
            });
        }
        await interaction.deferUpdate();
        if (interaction.customId === reshuffleId) {
            currentScramble = weky.shuffleString(options.word.toString());
            await msg.edit({
                components: [createGameContainer("playing", currentScramble)],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        else if (interaction.customId === cancelId) {
            isGameActive = false;
            messageCollector.stop("cancel");
            componentCollector.stop("cancel");
            const loseText = messages.lose.replace("{{answer}}", `\`${options.word}\``);
            await msg.edit({
                components: [createGameContainer("lost", currentScramble, loseText)],
                flags: MessageFlags.IsComponentsV2,
            });
            data.delete(id);
        }
    });
    messageCollector.on("end", async (_collected, reason) => {
        if (reason === "time") {
            isGameActive = false;
            componentCollector.stop();
            data.delete(id);
            const loseText = messages.lose.replace("{{answer}}", `\`${options.word}\``);
            if (msg.editable) {
                await msg.edit({
                    components: [createGameContainer("lost", currentScramble, loseText)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }
    });
};
export default ShuffleGuess;
