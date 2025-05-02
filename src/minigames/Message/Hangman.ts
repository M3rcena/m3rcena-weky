import chalk from "chalk";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";

import words from "../../data/words.json";
import { checkPackageUpdates, createEmbed, createHangman } from "../../functions/functions.js";
import { OptionsChecking } from "../../functions/OptionChecking.js";

import type { Client, Message } from "discord.js";
import type { HangmanTypes } from "../../Types";

const Hangman = async (options: HangmanTypes) => {
    OptionsChecking(options, "Hangman");

    let message = options.message;

    if (!message) throw new Error(chalk.red("[@m3rcena/weky] Hangman Error:") + " No message provided.");

    if (!message.channel || !message.channel.isSendable()) throw new Error(chalk.red("[@m3rcena/weky] Hangman Error:") + " No channel found.");

    let client: Client = options.client;

    let id = message.author.id;

    let wrongs = 0;
    let at = new AttachmentBuilder(await createHangman(wrongs), {
        name: "game.png"
    });
    let word = words[Math.floor(Math.random() * words.length)];
    let used: string[] = [];

    options.embed.title = options.embed.title ? options.embed.title : "Hangman Game"
    options.embed.description = options.embed.description ? options.embed.description.replace(`{{word}}`, `\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}`) : `Type a character to guess the word\n\n\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}\`\`\``;
    let embed = createEmbed(options.embed);

    const msg = await message.reply({
        files: [at],
        embeds: [embed],
    });

    const channel = await message.channel;
    const col = channel.createMessageCollector({
        filter: (m) => m.author.id === id,
        time: options.time ? options.time : 180000
    });

    const handleMsgDelete = (m: Message, msg: Message) => {
        if (m.id === msg.id) col.stop("msgDelete");
    }

    if ("token" in msg) {
        // @ts-ignore
        msg.edit = (data) => msg.editReply(data)
    } else {
        // @ts-ignore
        client.on("messageDelete", handleMsgDelete.bind(null, msg));
    }

    col.on('collect', async (msg2) => {
        const char = msg2.content[0]?.toLowerCase();

        if (!/[a-z]/i.test(char)) return msg2.reply("You have to **provide** a **letter**, **not** a **number/symbol**!").then(m => setTimeout(() => {
            if (m.deletable) m.delete();
        }, 5000));
        if (used.includes(char)) return msg2.reply("You have **already** used this **letter**!").then(m => setTimeout(() => {
            if (m.deletable) m.delete();
        }, 5000));

        used.push(char);
        if (!word.includes(char)) {
            wrongs++;
        };

        let done = word.split("").every(v => used.includes(v));
        let description = wrongs === 6 || done ? `You ${done ? "won" : "lost"} the game, The word was **${word}**` : `Type a character to guess the word\n\n\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}\`\`\``

        at = new AttachmentBuilder(await createHangman(wrongs), {
            name: "game.png"
        });

        options.embed.description = description
        options.embed.color = options.embed.color ? options.embed.color : wrongs === 6 ? "#ff0000" : done ? "Green" : "Blue"
        options.embed.image = "attachment://game.png"
        embed = createEmbed(options.embed);

        await msg.edit({
            files: [at],
            embeds: [embed]
        }).catch((e) => {
            col.stop();
            throw e;
        })

        if (wrongs === 6 || done) {
            col.stop();
        };
    });

    col.on('end', async (s, r) => {
        // @ts-ignore
        client.off("messageDelete", handleMsgDelete.bind(null, msg));

        if (r === "time") {
            let embed = new EmbedBuilder()
                .setTitle("⛔ Game Ended")
                .setDescription(`\`\`\`You took too much time to respond\`\`\``)
                .setColor("Red")
                .setTimestamp(options.embed.timestamp ? new Date() : null);

            await msg.edit({
                attachments: [],
                files: [],
                embeds: [embed]
            }).catch((e) => {
                throw e;
            })
        }
    })

    checkPackageUpdates("Hangman", options.notifyUpdate);
};

export default Hangman;