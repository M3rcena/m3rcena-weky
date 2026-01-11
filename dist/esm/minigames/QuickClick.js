import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags } from "discord.js";
const activeChannels = new Set();
const activeUsers = new Set();
const QuickClick = async (weky, options) => {
    const context = options.context;
    const userId = weky._getContextUserID(context);
    const channelId = context.channel.id;
    const messages = {
        wait: options.waitMessage || "The buttons may appear anytime now...",
        start: options.startMessage || "Find the **{{emoji}}** button! You have **{{time}}**!",
        win: options.winMessage || "🏆 GG <@{{winner}}>! You pressed it in **{{time}}s**.",
        lose: options.loseMessage || "❌ Time's up! No one pressed the button.",
        ongoing: options.ongoingMessage || "A game is already running in <#{{channel}}>. Finish that first!",
    };
    const emoji = options.emoji || "👆";
    const gameTitle = options.embed.title || "Quick Click";
    if (activeChannels.has(channelId)) {
        const errorText = messages.ongoing.replace("{{channel}}", channelId);
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff0000)
            .addTextDisplayComponents((text) => text.setContent(`## ❌ Error\n${errorText}`));
        return context.channel.send({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    if (activeUsers.has(userId)) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff0000)
            .addTextDisplayComponents((text) => text.setContent(`## ❌ Error\n> You already have a game running! Finish that one first.`));
        return context.channel.send({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    activeChannels.add(channelId);
    activeUsers.add(userId);
    const createGameContainer = (state, buttons, data) => {
        const container = new ContainerBuilder();
        let content = "";
        switch (state) {
            case "waiting":
                container.setAccentColor(0x5865f2);
                content = `## ${gameTitle}\n> ⏳ ${messages.wait}`;
                break;
            case "active":
                container.setAccentColor(0x5865f2);
                const startText = messages.start.replace("{{time}}", data?.timeLeft || "60s").replace("{{emoji}}", emoji);
                content = `## ${gameTitle}\n${startText}`;
                break;
            case "won":
                container.setAccentColor(0x57f287);
                const winText = messages.win
                    .replace("{{winner}}", data?.winner || "")
                    .replace("{{time}}", data?.timeTaken || "0");
                content = `## ${gameTitle}\n> ${winText}`;
                break;
            case "lost":
                container.setAccentColor(0xed4245); // Red
                content = `## ${gameTitle}\n> ${messages.lose}`;
                break;
        }
        container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(content));
        if (buttons.length > 0) {
            for (let i = 0; i < 5; i++) {
                const rowButtons = buttons.slice(i * 5, (i + 1) * 5);
                if (rowButtons.length > 0) {
                    container.addActionRowComponents((actionRow) => actionRow.setComponents(...rowButtons));
                }
            }
        }
        return container;
    };
    const buttons = [];
    for (let i = 0; i < 25; i++) {
        buttons.push(new ButtonBuilder()
            .setLabel("\u200b")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(weky.getRandomString(20))
            .setDisabled(true));
    }
    const msg = await context.channel.send({
        components: [createGameContainer("waiting", buttons)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    setTimeout(async function () {
        const gameCreatedAt = Date.now();
        if (!msg) {
            activeChannels.delete(channelId);
            activeUsers.delete(userId);
            return;
        }
        const winningIndex = Math.floor(Math.random() * buttons.length);
        buttons[winningIndex].setStyle(ButtonStyle.Primary).setEmoji(emoji).setCustomId("weky_correct").setDisabled(false);
        const timeString = weky.convertTime(options.time);
        try {
            await msg.edit({
                components: [createGameContainer("active", buttons, { timeLeft: timeString })],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        catch (e) {
            activeChannels.delete(channelId);
            activeUsers.delete(userId);
            return;
        }
        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: options.time,
        });
        collector.on("collect", async (interaction) => {
            if (interaction.customId === "weky_correct") {
                await interaction.deferUpdate();
                collector.stop("winner");
                const timeTaken = ((Date.now() - gameCreatedAt) / 1000).toFixed(2);
                buttons[winningIndex].setDisabled(true).setStyle(ButtonStyle.Success);
                await msg.edit({
                    components: [
                        createGameContainer("won", buttons, {
                            winner: interaction.user.id,
                            timeTaken: timeTaken,
                        }),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            else {
                await interaction.deferUpdate();
            }
        });
        collector.on("end", async (_collected, reason) => {
            activeChannels.delete(channelId);
            activeUsers.delete(userId);
            if (reason !== "winner") {
                buttons[winningIndex].setDisabled(true).setStyle(ButtonStyle.Secondary);
                try {
                    await msg.edit({
                        components: [createGameContainer("lost", buttons)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }
                catch (e) { }
            }
        });
    }, Math.floor(Math.random() * 5000) + 1000);
};
export default QuickClick;
