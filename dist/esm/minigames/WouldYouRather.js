import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags } from "discord.js";
import { ofetch } from "ofetch";
const WouldYouRather = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    const buttons = options.buttons || { optionA: "Option A", optionB: "Option B" };
    const labelA = buttons.optionA;
    const labelB = buttons.optionB;
    const thinkMessage = options.thinkMessage || "Thinking...";
    const othersMessage = options.othersMessage || "Only <@{{author}}> can use the buttons!";
    const gameTitle = options.embed.title || "Would You Rather?";
    const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;
    const idA = `wyr_a_${weky.getRandomString(10)}`;
    const idB = `wyr_b_${weky.getRandomString(10)}`;
    const createGameContainer = (state, data) => {
        const container = new ContainerBuilder();
        let content = "";
        switch (state) {
            case "loading":
                container.setAccentColor(defaultColor);
                content = options.states?.loading
                    ? options.states.loading.replace("{{gameTitle}}", gameTitle).replace("{{thinkMessage}}", thinkMessage)
                    : `## ${gameTitle}\n> 🔄 ${thinkMessage}`;
                break;
            case "active":
                container.setAccentColor(defaultColor);
                content = options.states?.active
                    ? options.states.active
                        .replace("{{gameTitle}}", gameTitle)
                        .replace("{{option1}}", capitalizeFirstLetter(data.option1))
                        .replace("{{option2}}", capitalizeFirstLetter(data.option2))
                    : `## ${gameTitle}\n> 🅰️ **${capitalizeFirstLetter(data.option1)}**\n\n**OR**\n\n> 🅱️ **${capitalizeFirstLetter(data.option2)}**`;
                break;
            case "result":
                container.setAccentColor(0x57f287); // Green
                content = options.states?.result
                    ? options.states.result
                        .replace("{{gameTitle}}", gameTitle)
                        .replace("{{option1}}", capitalizeFirstLetter(data.option1))
                        .replace("{{option2}}", capitalizeFirstLetter(data.option2))
                        .replace("{{stats1}}", data.stats?.a)
                        .replace("{{stats2}}", data.stats?.b)
                        .replace("{{userChoice}}", data.userChoice)
                    : `## ${gameTitle}\n> 🅰️ **${capitalizeFirstLetter(data.option1)}**\n> 📊 ${data.stats?.a}\n\n**OR**\n\n> 🅱️ **${capitalizeFirstLetter(data.option2)}**\n> 📊 ${data.stats?.b}\n\n**You chose:** Option ${data.userChoice}`;
                break;
            case "timeout":
                container.setAccentColor(0x99aab5); // Grey
                content = options.states?.timeout
                    ? options.states.timeout.replace("{{gameTitle}}", gameTitle)
                    : `## ${gameTitle}\n> ⏳ Time's up! You didn't choose.`;
                break;
            case "error":
                container.setAccentColor(0xff0000); // Red
                content = options.states?.error ? options.states.error : `## ❌ Error\n> Failed to fetch question.`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (state === "active" || state === "result") {
            const isResult = state === "result";
            const txtA = isResult ? `${labelA} (${data.stats?.a})` : labelA;
            const txtB = isResult ? `${labelB} (${data.stats?.b})` : labelB;
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
            const btnA = new ButtonBuilder().setStyle(styleA).setLabel(txtA).setCustomId(idA).setDisabled(isResult);
            const btnB = new ButtonBuilder().setStyle(styleB).setLabel(txtB).setCustomId(idB).setDisabled(isResult);
            container.addActionRowComponents((row) => row.setComponents(btnA, btnB));
        }
        return container;
    };
    const msg = await context.channel.send({
        components: [createGameContainer("loading", {})],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const pageOffset = Math.floor(Math.random() * 690);
    let apiData;
    try {
        apiData = await ofetch(`https://io.wyr.app/api/v1/statements/en/easy?pageOffset=${pageOffset}&pageSize=1`, {
            timeout: 5000,
            retry: 1,
        });
    }
    catch (e) {
        return await msg.edit({
            components: [createGameContainer("error", {})],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    const statement = apiData.statements[0];
    if (!statement || statement.phrase.length < 2) {
        return await msg.edit({
            components: [createGameContainer("error", {})],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    const opt1 = statement.phrase[0].text;
    const opt2 = statement.phrase[1].text;
    const v1 = statement.phrase[0].count;
    const v2 = statement.phrase[1].count;
    const total = v1 + v2 || 1;
    const p1 = ((v1 / total) * 100).toFixed(1) + "%";
    const p2 = ((v2 / total) * 100).toFixed(1) + "%";
    await msg.edit({
        components: [createGameContainer("active", { option1: opt1, option2: opt2 })],
        flags: MessageFlags.IsComponentsV2,
    });
    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: options.time || 60000,
    });
    collector.on("collect", async (interaction) => {
        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: othersMessage.replace("{{author}}", userId),
                flags: [MessageFlags.Ephemeral],
            });
        }
        await interaction.deferUpdate();
        const choice = interaction.customId === idA ? "A" : "B";
        collector.stop("answered");
        await msg.edit({
            components: [
                createGameContainer("result", {
                    option1: opt1,
                    option2: opt2,
                    stats: { a: p1, b: p2 },
                    userChoice: choice,
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    });
    collector.on("end", async (_collected, reason) => {
        if (reason === "time") {
            try {
                await msg.edit({
                    components: [createGameContainer("timeout", {})],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    });
};
function capitalizeFirstLetter(val) {
    return val.charAt(0).toUpperCase() + String(val).slice(1);
}
export default WouldYouRather;
