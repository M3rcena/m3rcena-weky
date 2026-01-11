import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags } from "discord.js";
import { decode } from "html-entities";
const LieSwatter = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    if (!options.winMessage)
        options.winMessage = "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";
    if (typeof options.winMessage !== "string") {
        return weky._LoggerManager.createTypeError("LieSwatter", "Win message must be a string.");
    }
    if (!options.loseMessage)
        options.loseMessage = "Better luck next time! It was a **{{answer}}**.";
    if (typeof options.loseMessage !== "string") {
        return weky._LoggerManager.createTypeError("LieSwatter", "Lose message must be a string.");
    }
    if (!options.othersMessage)
        options.othersMessage = "Only <@{{author}}> can use the buttons!";
    if (typeof options.othersMessage !== "string") {
        return weky._LoggerManager.createTypeError("LieSwatter", "Others message must be a string.");
    }
    if (!options.buttons)
        options.buttons = { true: "Truth", lie: "Lie" };
    if (typeof options.buttons !== "object") {
        return weky._LoggerManager.createTypeError("LieSwatter", "Buttons must be an object.");
    }
    const labelTrue = options.buttons.true || "Truth";
    const labelLie = options.buttons.lie || "Lie";
    const thinkMessage = options.thinkMessage || "I am thinking...";
    const gameTitle = options.embed.title || "Lie Swatter";
    const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;
    const idTrue = `ls_true_${weky.getRandomString(10)}`;
    const idLie = `ls_lie_${weky.getRandomString(10)}`;
    const createGameContainer = (state, text, correctAnswer) => {
        const container = new ContainerBuilder();
        let content = "";
        switch (state) {
            case "loading":
                container.setAccentColor(defaultColor);
                content = `## ${gameTitle}\n> 🔄 ${text}`;
                break;
            case "active":
                container.setAccentColor(defaultColor);
                content = `## ${gameTitle}\n> ${text}\n\nIs this statement **True** or a **Lie**?`;
                break;
            case "won":
                container.setAccentColor(0x57f287);
                content = `## ${gameTitle}\n> ${text}`;
                break;
            case "lost":
            case "timeout":
                container.setAccentColor(0xed4245);
                content = `## ${gameTitle}\n> ${text}`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = `## ❌ Error\n> ${text}`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (state !== "loading" && state !== "error") {
            let styleTrue = ButtonStyle.Primary;
            let styleLie = ButtonStyle.Primary;
            let disabled = false;
            if (state !== "active") {
                disabled = true;
                if (correctAnswer === "True") {
                    styleTrue = ButtonStyle.Success;
                    styleLie = ButtonStyle.Secondary;
                }
                else {
                    styleTrue = ButtonStyle.Secondary;
                    styleLie = ButtonStyle.Success;
                }
            }
            const btnTrue = new ButtonBuilder()
                .setCustomId(idTrue)
                .setLabel(labelTrue)
                .setStyle(styleTrue)
                .setDisabled(disabled);
            const btnLie = new ButtonBuilder().setCustomId(idLie).setLabel(labelLie).setStyle(styleLie).setDisabled(disabled);
            container.addActionRowComponents((row) => row.setComponents(btnTrue, btnLie));
        }
        return container;
    };
    const msg = await context.channel.send({
        components: [createGameContainer("loading", thinkMessage)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    let result;
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=1&type=boolean`);
        result = (await response.json());
    }
    catch (e) {
        return await msg.edit({
            components: [createGameContainer("error", "Failed to fetch question from API.")],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    if (!result.results || result.results.length === 0) {
        return await msg.edit({
            components: [createGameContainer("error", "API returned no results.")],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    const questionData = result.results[0];
    const questionText = decode(questionData.question);
    const correctAnswerRaw = questionData.correct_answer;
    const correctLabel = correctAnswerRaw === "True" ? labelTrue : labelLie;
    await msg.edit({
        components: [createGameContainer("active", questionText)],
        flags: MessageFlags.IsComponentsV2,
    });
    const gameCreatedAt = Date.now();
    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: options.time || 60000,
    });
    collector.on("collect", async (interaction) => {
        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: options.othersMessage
                    ? options.othersMessage.replace(`{{author}}`, userId)
                    : "Only <@" + userId + "> can use the buttons!",
                flags: [MessageFlags.Ephemeral],
            });
        }
        await interaction.deferUpdate();
        const chosenAnswer = interaction.customId === idTrue ? "True" : "False";
        const isCorrect = chosenAnswer === correctAnswerRaw;
        collector.stop(isCorrect ? "won" : "lost");
        const timeTaken = weky.convertTime(Date.now() - gameCreatedAt);
        if (isCorrect) {
            const winText = options.winMessage?.replace(`{{answer}}`, correctLabel).replace(`{{time}}`, timeTaken);
            await msg.edit({
                components: [createGameContainer("won", winText, correctAnswerRaw)],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        else {
            const loseText = options.loseMessage?.replace("{{answer}}", correctLabel);
            await msg.edit({
                components: [createGameContainer("lost", loseText, correctAnswerRaw)],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    });
    collector.on("end", async (_, reason) => {
        if (reason === "time") {
            const loseText = `**Time's up!**\nIt was actually **${correctLabel}**.`;
            try {
                await msg.edit({
                    components: [createGameContainer("timeout", loseText, correctAnswerRaw)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    });
};
export default LieSwatter;
