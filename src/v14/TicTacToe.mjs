import { ButtonStyle, EmbedBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import chalk from 'chalk';

/**
 * TicTacToe Game for your Bot!
 * @param {Object} options - Options for the TicTacToe Game
 * 
 * @param {String} options.xEmoji - Emoji for Player 1
 * @param {String} options.oEmoji - Emoji for Player 2
 * 
 * @param {String} options.xColor - Color for Player 1
 * @param {String} options.oColor - Color for Player 2
 * 
 * @param {DiscordUser} options.opponent - The opponent
 * 
 * @param {Message} options.message - The message object
 * 
 * @returns {Promise<void>}
 * @copyright All rights Reserved. Weky Development
 */

export default async (options) => {
    if (!options.xEmoji) {
        options.xEmoji = "❌"
    };
    if (!options.oEmoji) {
        options.oEmoji = "⭕"
    };
    if (!options.xColor) {
        options.xColor = "Primary"
    };
    if (!options.oColor) {
        options.oColor = "Primary"
    };
    if (!options.opponent) throw new TypeError(`${chalk.red('Weky Error:')} Missing argument: opponent | Type: DiscordUser`)
    if (!options.message) throw new TypeError(`${chalk.red('Weky Error:')} Missing argument: message | Type Message`)

    let [a1, a2, a3, b1, b2, b3, c1, c2, c3] = getBoarder();
    let [a11, a22, a33, b11, b22, b33, c11, c22, c33] = getIds();
    let [A1, A2, A3, B1, B2, B3, C1, C2, C3] = getButtons();
    const author = options.message.author.id;
    const member = options.opponent;
    const authorName = options.message.author.username;
    const gameData = [{
        member: options.message.author,
        em: options.xEmoji,
        color: options.xColor
    },
    {
        member: member,
        em: options.oEmoji,
        color: options.oColor
    }
    ];
    let player = Math.floor(Math.random() * gameData.length);
    const midDuel = new Set();

    if (midDuel.has(author)) {
        return options.message.reply(`You're currently in a duel`)
    } else if (midDuel.has(member.id)) {
        return options.message.reply(`<@${member.id}> is currently in a duel`)
    }
    if (member.id === options.message.client.user.id) {
        return options.message.reply("You can't duel me.")
    }

    let Embed;
    if (player == 0) {
        Embed = new EmbedBuilder()
            .setTitle(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
            .setDescription(`It is ${authorName}'s Turn!`)
            .setColor(3426654)
    } else {
        Embed = new EmbedBuilder()
            .setTitle(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
            .setDescription(`It is ${options.opponent.username}'s Turn!`)
            .setColor(3426654)
    }

    options.message.reply({
        embeds: [Embed],
        components: [
            new ActionRowBuilder().addComponents([A1, A2, A3]),
            new ActionRowBuilder().addComponents([B1, B2, B3]),
            new ActionRowBuilder().addComponents([C1, C2, C3]),
        ]
    }).then(async (msg) => {
        midDuel.add(author)
        midDuel.add(member.id)
        const gameCollector = msg.createMessageComponentCollector({
            filter: (i) => i.isButton() && i.user && (i.user.id == options.message.author.id || i.user.id == options.opponent.id) && i.message.author.id == options.message.client.user.id,
        });



        gameCollector.on('collect', async btn => {
            if (btn.customId == a11 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate();
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) {
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        a1 = gameData[player].em;
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    A1 = new ButtonBuilder()
                        .setCustomId(a11)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == a22 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        a2 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    A2 = new ButtonBuilder()
                        .setCustomId(a22)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == a33 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        a3 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    A3 = new ButtonBuilder()
                        .setCustomId(a33)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == b11 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {

                    try {
                        b1 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    B1 = new ButtonBuilder()
                        .setCustomId(b11)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == b22 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        b2 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    B2 = new ButtonBuilder()
                        .setCustomId(b22)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == b33 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        b3 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    B3 = new ButtonBuilder()
                        .setCustomId(b33)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == c11 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        c1 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    C1 = new ButtonBuilder()
                        .setCustomId(c11)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == c22 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        c2 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    C2 = new ButtonBuilder()
                        .setCustomId(c22)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()


                }
            } else if (btn.customId == c33 && gameData[player].member.id === btn.user.id) {
                btn.deferUpdate()
                if (btn.label == options.oEmoji || btn.label == options.xEmoji) { // User tries to place at an already claimed spot
                    btn.message.update('That spot is already occupied.')
                } else {
                    try {
                        c3 = gameData[player].em
                        if (
                            (a1 == options.xEmoji && b1 == options.xEmoji && c1 == options.xEmoji || a1 == options.oEmoji && b1 == options.oEmoji && c1 == options.oEmoji) ||
                            (a2 == options.xEmoji && b2 == options.xEmoji && c2 == options.xEmoji || a2 == options.oEmoji && b2 == options.oEmoji && c2 == options.oEmoji) ||
                            (a3 == options.xEmoji && b3 == options.xEmoji && c3 == options.xEmoji || a3 == options.oEmoji && b3 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && a2 == options.xEmoji && a3 == options.xEmoji || a1 == options.oEmoji && a2 == options.oEmoji && a3 == options.oEmoji) ||
                            (b1 == options.xEmoji && b2 == options.xEmoji && b3 == options.xEmoji || b1 == options.oEmoji && b2 == options.oEmoji && b3 == options.oEmoji) ||
                            (c1 == options.xEmoji && c2 == options.xEmoji && c3 == options.xEmoji || c1 == options.oEmoji && c2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a1 == options.xEmoji && b2 == options.xEmoji && c3 == options.xEmoji || a1 == options.oEmoji && b2 == options.oEmoji && c3 == options.oEmoji) ||
                            (a3 == options.xEmoji && b2 == options.xEmoji && c1 == options.xEmoji || a3 == options.oEmoji && b2 == options.oEmoji && c1 == options.oEmoji)
                        ) {
                            options.message.reply(`${gameData[player].member} wins!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)
                        } else if (a1 !== '⬜' && a2 !== '⬜' && a3 !== '⬜' && b1 !== '⬜' && b2 !== '⬜' && b3 !== '⬜' && c1 !== '⬜' && c2 !== '⬜' && c3 !== '⬜') {
                            options.message.reply(`It's a **Tie**!`)
                            gameCollector.stop()
                            midDuel.delete(author)
                            midDuel.delete(member.id)

                        }
                    } catch (e) {
                        console.log(e.stack ? e.stack : e)
                    }
                    player = (player + 1) % 2;
                    if (player == 0) {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                            .setColor(3426654)
                    } else {
                        Embed = new EmbedBuilder()
                            .setDescription(`🎮 ${authorName} VS __**${options.opponent.username}**__ 🎮`)
                            .setColor(3426654)
                    }
                    C3 = new ButtonBuilder()
                        .setCustomId(c33)
                        .setStyle(`${gameData[player].color}`)
                        .setEmoji(gameData[player].em)
                        .setDisabled()

                }
            } else {
                return btn.reply({
                    content: ':x: **Wait for opponent.**',
                    ephemeral: true
                })
            }
            //only edi the message if not the else executed
            msg.edit({
                embeds: [Embed],
                components: [
                    new ActionRowBuilder().addComponents([A1, A2, A3]),
                    new ActionRowBuilder().addComponents([B1, B2, B3]),
                    new ActionRowBuilder().addComponents([C1, C2, C3]),
                ]
            })
        })

        gameCollector.on("end", async btn => {
            msg.edit({
                embeds: [Embed],
                components: [
                    new ActionRowBuilder().addComponents([A1.setDisabled(), A2.setDisabled(), A3.setDisabled()]),
                    new ActionRowBuilder().addComponents([B1.setDisabled(), B2.setDisabled(), B3.setDisabled()]),
                    new ActionRowBuilder().addComponents([C1.setDisabled(), C2.setDisabled(), C3.setDisabled()]),
                ]
            }).catch(console.log)
        })

    })

    function getBoarder() {
        return ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
    }

    function getIds() {
        return ["A1-1",
            "A2-2",
            "A3-3",
            "B1-1",
            "B2-2",
            "B3-3",
            "C1-1",
            "C2-2",
            "C3-3"
        ];
    }

    function getButtons() {
        return [
            new ButtonBuilder()
                .setCustomId(a11)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(a22)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(a33)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(b11)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(b22)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(b33)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(c11)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(c22)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~'),
            new ButtonBuilder()
                .setCustomId(c33)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('~')
        ]
    }
}