"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const WillYouPressTheButton = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    if (!options.button)
        options.button = {};
    const labelYes = options.button.yes || "Yes";
    const labelNo = options.button.no || "No";
    const thinkMessage = options.thinkMessage || "Thinking...";
    const othersMessage = options.othersMessage || "Only <@{{author}}> can use the buttons!";
    const gameTitle = options.embed.title || "Will You Press The Button?";
    const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0xed4245;
    const idYes = `wyptb_yes_${weky.getRandomString(10)}`;
    const idNo = `wyptb_no_${weky.getRandomString(10)}`;
    const createGameContainer = (state, data) => {
        const container = new discord_js_1.ContainerBuilder();
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
                        .replace("{{question}}", data.question)
                        .replace("{{result}}", data.result)
                    : `## ${gameTitle}\n` + `> ${data.question}\n\n` + `**BUT**\n\n` + `> ${data.result}`;
                break;
            case "result":
                container.setAccentColor(data.userChoice === "yes" ? 0x57f287 : 0xed4245);
                content = options.states?.result
                    ? options.states.result
                        .replace("{{gameTitle}}", gameTitle)
                        .replace("{{question}}", data.question)
                        .replace("{{result}}", data.result)
                        .replace("{{chose}}", data.userChoice === "yes"
                        ? options.yesPress
                            ? options.yesPress
                            : "Yes! Press it!"
                        : options.noPress
                            ? options.noPress
                            : "No! Don't press!")
                    : `## ${gameTitle}\n> ${data.question}\n\n**BUT**\n\n> ${data.result}\n\n**You chose:** ${data.userChoice === "yes"
                        ? options.yesPress
                            ? options.yesPress
                            : "Yes! Press it!"
                        : options.noPress
                            ? options.noPress
                            : "No! Don't press!"}`;
                break;
            case "timeout":
                container.setAccentColor(0x99aab5);
                content = options.states?.timeout
                    ? options.states.timeout.replace("{{gameTitle}}", gameTitle)
                    : `## ${gameTitle}\n> ⏳ Time's up! You didn't decide.`;
                break;
            case "error":
                container.setAccentColor(0xff0000);
                content = options.states?.error ? options.states.error : `## ❌ Error\n> Failed to fetch a dilemma.`;
                break;
        }
        container.addTextDisplayComponents((t) => t.setContent(content));
        if (state === "active" || state === "result") {
            const isResult = state === "result";
            const txtYes = isResult ? `${labelYes} (${data.stats?.yes})` : labelYes;
            const txtNo = isResult ? `${labelNo} (${data.stats?.no})` : labelNo;
            let styleYes = discord_js_1.ButtonStyle.Success;
            let styleNo = discord_js_1.ButtonStyle.Danger;
            if (isResult) {
                if (data.userChoice === "yes")
                    styleNo = discord_js_1.ButtonStyle.Secondary;
                if (data.userChoice === "no")
                    styleYes = discord_js_1.ButtonStyle.Secondary;
            }
            const btnYes = new discord_js_1.ButtonBuilder().setStyle(styleYes).setLabel(txtYes).setCustomId(idYes).setDisabled(isResult);
            const btnNo = new discord_js_1.ButtonBuilder().setStyle(styleNo).setLabel(txtNo).setCustomId(idNo).setDisabled(isResult);
            container.addActionRowComponents((row) => row.setComponents(btnYes, btnNo));
        }
        return container;
    };
    const msg = await context.channel.send({
        components: [createGameContainer("loading", {})],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const apiData = await weky.NetworkManager.getWillYouPressTheButton();
    if (!apiData) {
        return await msg.edit({
            components: [createGameContainer("error", {})],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
    }
    const qText = apiData.question.charAt(0).toUpperCase() + apiData.question.slice(1);
    const rText = apiData.result.charAt(0).toUpperCase() + apiData.result.slice(1);
    await msg.edit({
        components: [createGameContainer("active", { question: qText, result: rText })],
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    });
    const collector = msg.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: options.time || 60000,
    });
    collector.on("collect", async (interaction) => {
        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: othersMessage.replace("{{author}}", userId),
                flags: [discord_js_1.MessageFlags.Ephemeral],
            });
        }
        await interaction.deferUpdate();
        const choice = interaction.customId === idYes ? "yes" : "no";
        collector.stop("answered");
        await msg.edit({
            components: [
                createGameContainer("result", {
                    question: qText,
                    result: rText,
                    stats: {
                        yes: apiData.stats.yes.percentage,
                        no: apiData.stats.no.percentage,
                    },
                    userChoice: choice,
                }),
            ],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
    });
    collector.on("end", async (_collected, reason) => {
        if (reason === "time") {
            try {
                await msg.edit({
                    components: [createGameContainer("timeout", {})],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
            catch (e) { }
        }
    });
};
exports.default = WillYouPressTheButton;
