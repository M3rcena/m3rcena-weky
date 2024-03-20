import { filter } from "mathjs";
import { randomHexColor } from "../../functions/function.mjs";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } from 'discord.js';

/**
 * Play Connect4 with someone on discord!
 * 
 * @param message - The Discord Message object.
 * @param opponent - The opponent.
 * 
 * @param embed - The embed options.
 * @param embed.title - The title of the embed.
 * @param embed.button.color.player1 - The color of the button player1.
 * @param embed.button.color.player2 - The color of the button player2.
 * @param embed.color - The color of the embed.
 * 
 * @param emojis - The emojis options.
 * @param emojis.board - The board emoji.
 * @param emojis.player1 - The player1 emoji.
 * @param emojis.player2 - The player2 emoji.
 */
export default async (options) => {
  // Basic
  if (!options.message) {
    throw new Error('[Weky Error] Message argument was not specified.');
  };
  if (typeof options.message !== 'object') {
    throw new Error('[Weky Error] Discord Message argument should be a type of object.');
  };
  if (!options.opponent) {
    throw new Error('[Weky Error] Opponent argument was not specified.');
  };

  // Embeds
  if (!options.embed.title) {
    options.embed.title = 'Connect4 | Weky Development';
  };
  if (!options.embed.button.color.player1) {
    options.embed.button.color.player1 = '#FF0000';
  };
  if (!options.embed.button.color.player2) {
    options.embed.button.color.player2 = '#FFFF00';
  };

  // Emojis
  if (!options.emojis) {
    options.emojis = {}
  };
  if (!options.emojis.board) {
    options.emojis.board = '⚪';
  };
  if (!options.emojis.player1) {
    options.emojis.player1 = '🔴';
  };
  if (!options.emojis.player2) {
    options.emojis.player2 = '🟡';
  };

  // Set Board Data
  let [id1, id2, id3, id4, id5, id6, id7, id8, id9, id10, id11, id12, id13, id14, id15, id16, id17, id18, id19, id20] = getIds();
  let [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20] = getBoard();
  let [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20] = getButtons();

  // Add User Variable for Game
  const author = options.message.author;
  const opponent = options.opponent;
  const authorName = author.username;
  const gameData = [
    {
      member: options.message.author,
      em: options.emojis.player1,
      color: options.embed.button.color.player1,
    },
    {
      member: opponent,
      em: options.emojis.player2,
      color: options.embed.button.color.player2,
    }
  ];
  let player = Math.floor(Math.random() * gameData.length);
  const midDuel = new Set();

  if (midDuel.has(author)) {
    return options.message.reply(`You're currently in a duel`)
  } else if (midDuel.has(opponent.id)) {
    return options.message.reply(`<@${opponent.id}> is currently in a duel`)
  };

  if (author.id === options.message.client.user.id) {
    return options.message.reply('You cannot play with the bot.');
  }

  let Embed;
  if (player === 0) {
    Embed = new EmbedBuilder()
                  .setTitle(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                  .setDescription(`It is ${authorName}'s Turn!`)
                  .setColor(3426654)
  } else {
    Embed = new EmbedBuilder()
                  .setTitle(`🎮 __**${authorName}**__ VS ${options.opponent.username} 🎮`)
                  .setDescription(`It is ${options.opponent.username}'s Turn!`)
                  .setColor(3426654)
  };

  options.message.reply({
    embeds: [Embed],
    components: [
      new ActionRowBuilder().addComponents([b1, b2, b3, b4, b5]),
      new ActionRowBuilder().addComponents([b6, b7, b8, b9, b10]),
      new ActionRowBuilder().addComponents([b11, b12, b13, b14, b15]),
      new ActionRowBuilder().addComponents([b16, b17, b18, b19, b20])
    ]
  }).then(async (msg) => {
    midDuel.add(author);
    midDuel.add(opponent.id);
    const gameCollector = msg.createMessageComponentCollector({
      filter: (i) => i.isButton() && i.user && (i.user.id === options.message.author.id || i.user.id === options.opponent.id) && i.message.author.id == options.message.client.user.id,
    });

    gameCollector.on('collect', async btn => {
      if (gameData[player].member.id === btn.user.id) {
        btn.deferUpdate();
        try {
            const isAuthorWinner = checkForWin(getBoard(btn.customId), options.emojis.player1);
            const isOpponentWinner = checkForWin(getBoard(btn.customId), options.emojis.player2);

            if (isAuthorWinner) {
              return btn.message.update({
                embeds: [Embed.setDescription(`**${authorName}** won the game!`).setColor(3426654)],
                components: []
              });
            } else if (isOpponentWinner) {
              return btn.message.update({
                embeds: [Embed.setDescription(`**${options.opponent.username}** won the game!`).setColor(3426654)],
                components: []
              });
            }
          } catch (e) {
            console.log(e.stack ? e.stack : e)
          }
        }
    })
  })

  function checkForWin(board, player) {
    const rows = 4;
    const cols = 5

    // Horizontal
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (board[row * cols + col] === player &&
            board[row * cols + col + 1] === player &&
            board[row * cols + col + 2] === player &&
            board[row * cols + col + 3] === player
        ) {
          return true;
        }
      }
    }

    // Vertical
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (board[row * cols + col] === player &&
            board[(row + 1) * cols + col] === player &&
            board[(row + 2) * cols + col] === player &&
            board[(row + 3) * cols + col] === player
        ) {
          return true;
        }
      }
    }

    // Diagonal
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (board[row * cols + col] === player &&
            board[(row + 1) * cols + col + 1] === player &&
            board[(row + 2) * cols + col + 2] === player &&
            board[(row + 3) * cols + col + 3] === player
        ) {
          return true;
        } // player wins upwords
        if (board[row * cols + col + 3] === player &&
            board[(row + 1) * cols + col + 2] === player &&
            board[(row + 2) * cols + col + 1] === player &&
            board[(row + 3) * cols + col] === player
        ) {
          return true;
        } // player wins downwards
      }
    }

    // Check for Tie
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '⬜') {
        return false;
      }
    }

    // If cell is full and no winner
    return true;
  }

  function getBoard() {
    return ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
  };

  function getIds() {
    "A1-1", "B1-2", "C1-3", "D1-4", "E1-5",
    "A2-1", "B2-2", "C2-3", "D2-4", "E2-5",
    "A3-1", "B3-2", "C3-3", "D3-4", "E3-5",
    "A4-1", "B4-2", "C4-3", "D4-4", "E3-5"
  };

  function getButtons() {
    return [
      new ButtonBuilder()
        .setCustomId(id1)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id2)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id3)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id4)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id5)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id6)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id7)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id8)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id9)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id10)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id11)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id12)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id13)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id14)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id15)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id16)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id17)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id18)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id19)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~'),
      new ButtonBuilder()
        .setCustomId(id20)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('~')
    ]
  };
};
