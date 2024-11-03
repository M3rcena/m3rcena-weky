import chalk from "chalk";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import words from "../data/words.json";
import { checkPackageUpdates, createHangman } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
const Hangman = async (options) => {
    OptionsChecking(options, "Hangman");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    ;
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] Hangman Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] Hangman Error:") + " No channel found.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    let wrongs = 0;
    let at = new AttachmentBuilder(await createHangman(wrongs), {
        name: "game.png"
    });
    let word = words[Math.floor(Math.random() * words.length)];
    let used = [];
    let embed = new EmbedBuilder()
        .setTitle(options.embed.title ? options.embed.title : "Hangman Game")
        .setDescription(options.embed.description ? options.embed.description.replace(`{{word}}`, `\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}`) :
        `Type a character to guess the word\n\n\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}\`\`\``)
        .setColor(options.embed.color ? options.embed.color : "Blue")
        .setImage("attachment://game.png")
        .setTimestamp(options.embed.timestamp ? Date.now() : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
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
    const msg = await interaction.reply({
        files: [at],
        embeds: [embed],
    });
    const channel = await interaction.channel;
    const col = channel.createMessageCollector({
        filter: (m) => m.author.id === id,
        time: options.time ? options.time : 180000
    });
    const handleMsgDelete = (m, msg) => {
        if (m.id === msg.id)
            col.stop("msgDelete");
    };
    if ("token" in msg) {
        msg.edit = (data) => msg.editReply(data);
    }
    else {
        client.on("messageDelete", handleMsgDelete.bind(null, msg));
    }
    col.on('collect', async (msg2) => {
        const char = msg2.content[0]?.toLowerCase();
        if (!/[a-z]/i.test(char))
            return msg2.reply("You have to **provide** a **letter**, **not** a **number/symbol**!").then(m => setTimeout(() => {
                if (m.deletable)
                    m.delete();
            }, 5000));
        if (used.includes(char))
            return msg2.reply("You have **already** used this **letter**!").then(m => setTimeout(() => {
                if (m.deletable)
                    m.delete();
            }, 5000));
        used.push(char);
        if (!word.includes(char)) {
            wrongs++;
        }
        ;
        let done = word.split("").every(v => used.includes(v));
        let description = wrongs === 6 || done ? `You ${done ? "won" : "lost"} the game, The word was **${word}**` : `Type a character to guess the word\n\n\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}\`\`\``;
        at = new AttachmentBuilder(await createHangman(wrongs), {
            name: "game.png"
        });
        embed = new EmbedBuilder()
            .setTitle(options.embed.title ? options.embed.title : "Hangman Game")
            .setDescription(description)
            .setColor(options.embed.color ? options.embed.color : wrongs === 6 ? "#ff0000" : done ? "Green" : "Blue")
            .setImage("attachment://game.png")
            .setTimestamp(options.embed.timestamp ? Date.now() : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
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
        await msg.edit({
            files: [at],
            embeds: [embed]
        }).catch((e) => {
            col.stop();
            throw e;
        });
        if (wrongs === 6 || done) {
            col.stop();
        }
        ;
    });
    col.on('end', async (s, r) => {
        client.off("messageDelete", handleMsgDelete.bind(null, msg));
        if (r === "time") {
            let embed = new EmbedBuilder()
                .setTitle("⛔ Game Ended")
                .setDescription(`\`\`\`You took too much time to respond\`\`\``)
                .setColor("Red")
                .setTimestamp();
            await msg.edit({
                attachments: [],
                files: [],
                embeds: [embed]
            }).catch((e) => {
                throw e;
            });
        }
    });
    checkPackageUpdates("Hangman", options.notifyUpdate);
};
export default Hangman;
