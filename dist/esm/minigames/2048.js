import chalk from "chalk";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
const mini2048 = async (options) => {
    OptionsChecking(options, "2048");
    let interaction = options.interaction;
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No interaction provided.");
    let client = options.client;
    if (!interaction.channel)
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No channel found on Interaction.");
    if (!interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " Channel is not sendable.");
    if (!interaction.guild)
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No guild found on Interaction.");
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    const msg = await interaction.reply({ content: "Starting the game...", fetchReply: true, allowedMentions: { repliedUser: false } });
    const gameData = await fetch(`https://weky.miv4.com/api/2048/new`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id,
            guild: interaction.guild.id,
            channel: interaction.channel.id,
            message: msg.id,
        })
    }).then(res => res.json());
    if (gameData.error && gameData.error !== "Id already exists") {
        if (msg.editable) {
            const embed = new EmbedBuilder()
                .setTitle("Failed to start the game.")
                .setDescription(`\`\`\`${gameData.error}\`\`\``)
                .setColor("Red")
                .setTimestamp(new Date());
            return await msg.edit({ content: ``, embeds: [embed] });
        }
        ;
    }
    else if (gameData.error && gameData.error === "Id already exists") {
        const embed = new EmbedBuilder()
            .setTitle("Failed to start the game.")
            .setDescription(`You already have a game running!`)
            .setColor("Red")
            .setTimestamp(new Date());
        const stop = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Quit Game")
            .setCustomId("quit")
            .setEmoji("🛑");
        const msg = await interaction.reply({ content: ``, embeds: [embed], ephemeral: true });
        const collector = msg.createMessageComponentCollector({
            time: 60000,
            componentType: ComponentType.Button
        });
        collector.on("collect", async (btn) => {
            if (btn.user.id !== id) {
                return btn.reply({ content: "This is not your game!", ephemeral: true });
            }
            ;
            if (btn.customId === "quit") {
                collector.stop("quit");
            }
            ;
        });
        collector.on("end", async (_, reason) => {
            if (reason === "quit") {
                const del = await fetch(`https://weky.miv4.com/api/2048/${id}/quit`, {
                    method: "GET"
                }).then(res => res.json());
                if (del.error) {
                    throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + ` Failed to delete the game data: ${del.error}`);
                }
                ;
                const embed = new EmbedBuilder()
                    .setTitle("Game Stopped!")
                    .setDescription(`You have stopped the game.`)
                    .setColor("Red")
                    .setTimestamp(new Date());
                return await msg.edit({ content: ``, embeds: [embed], components: [] }).catch(() => { });
            }
            ;
            return msg.delete().catch(() => { });
        });
    }
    const img = new AttachmentBuilder(Buffer.from(gameData.grid), {
        name: "2048.png"
    });
    let embed = new EmbedBuilder()
        .setTitle(options.embed.title || "2048 Game")
        .setDescription(options.embed.description?.replace(`{{score}}`, `${gameData.data.score}`).replace(`{{id}}`, `${gameData.data.id}`) || `ID: \`${gameData.data.id}\`\nScore: \`${gameData.data.score}\``)
        .setImage(`attachment://2048.png`)
        .setColor(options.embed.color || "Blurple")
        .setTimestamp(options.embed.timestamp ? new Date() : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.footer) {
        embed.setFooter({
            text: options.embed.footer.text,
            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
        });
    }
    ;
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    ;
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    ;
    const up = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.up || "⬆️" : "⬆️")
        .setCustomId("up");
    const down = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.down || "⬇️" : "⬇️")
        .setCustomId("down");
    const left = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.left || "⬅️" : "⬅️")
        .setCustomId("left");
    const right = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.right || "➡️" : "➡️")
        .setCustomId("right");
    const stop = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel("Quit Game")
        .setCustomId("quit")
        .setEmoji("🛑");
    const row = new ActionRowBuilder().addComponents(left, up, down, right);
    const row2 = new ActionRowBuilder().addComponents(stop);
    if (!msg.editable)
        return;
    await msg.edit({
        content: `React with the buttons to play the game!`,
        embeds: [embed],
        components: [row, row2],
        files: [img]
    });
    const collector = msg.createMessageComponentCollector({
        time: options.time || 600_000, // 10 minutes
        componentType: ComponentType.Button
    });
    collector.on("collect", async (btn) => {
        if (btn.user.id !== id) {
            return btn.reply({ content: "This is not your game!", ephemeral: true });
        }
        ;
        if (btn.customId === "quit") {
            return collector.stop("quit");
        }
        ;
        const data = await fetch(`https://weky.miv4.com/api/2048/${btn.user.id}/${btn.customId}`, {
            method: "GET"
        }).then(res => res.json());
        if (data.error) {
            const embed = new EmbedBuilder()
                .setTitle("Failed to make a move.")
                .setDescription(`\`\`\`${data.error}\`\`\``)
                .setColor("Red")
                .setTimestamp(new Date());
            return await btn.reply({ content: ``, embeds: [embed] });
        }
        ;
        if (data.gameover) {
            return collector.stop("gameover");
        }
        ;
        const img = new AttachmentBuilder(Buffer.from(data.data.grid), {
            name: "2048.png"
        });
        const embed = new EmbedBuilder()
            .setTitle(options.embed.title || "2048 Game")
            .setDescription(options.embed.description?.replace(`{{score}}`, `${data.data.score}`).replace(`{{id}}`, `${data.data.id}`) || `ID: \`${data.data.id}\`\nScore: \`${data.data.score}\``)
            .setImage(`attachment://2048.png`)
            .setColor(options.embed.color || "Blurple")
            .setTimestamp(options.embed.timestamp ? new Date() : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.footer) {
            embed.setFooter({
                text: options.embed.footer.text,
                iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
            });
        }
        ;
        if (options.embed.author) {
            embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        ;
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        ;
        await btn.update({
            content: ``,
            embeds: [embed],
            components: [row, row2],
            files: [img]
        });
    });
    collector.on("end", async (_, reason) => {
        const data = await fetch(`https://weky.miv4.com/api/2048/${id}/get`, {
            method: "GET"
        }).then(res => res.json());
        const img = new AttachmentBuilder(Buffer.from(data.grid), {
            name: "2048.png"
        });
        const score = data.data.score;
        embed.setTitle("Game Over!")
            .setDescription(`You scored \`${score}\` points!`)
            .setImage(`attachment://2048.png`)
            .setColor("Red");
        await msg.edit({
            content: ``,
            embeds: [embed],
            components: [],
            files: [img]
        });
        const del = await fetch(`https://weky.miv4.com/api/2048/${id}/quit`, {
            method: "GET"
        }).then(res => res.json());
        if (del.error) {
            throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + ` Failed to delete the game data: ${del.error}`);
        }
        ;
    });
};
export default mini2048;
