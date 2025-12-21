import chalk from "chalk";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageFlags } from "discord.js";

import { checkPackageUpdates, createEmbed } from "../../functions/functions.js";
import { OptionsChecking } from "../../functions/OptionChecking.js";

import type { Types2048 } from "../../Types/";
import type { Client } from "discord.js";

// Main game function that handles the 2048 game logic
const mini2048 = async (options: Types2048) => {
  // Validate the provided options
  OptionsChecking(options, "2048");

  let message = options.message;

  if (!message) throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No message provided.");

  let client: Client = options.client;

  if (!message.channel) throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No channel found on Message.");

  if (!message.channel.isSendable()) throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " Channel is not sendable.");

  if (!message.guild) throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No guild found on Message.");

  let id: string = message.author.id;

  // TODO: FIX THE API
  return await message.reply({ content: "GAME CURRENTLY DISABLED DUE TO API ISSUES!" });
  // Initialize the game by sending a loading message
  const msg = await message.reply({ content: "Starting the game...", allowedMentions: { repliedUser: false } });

  let originalDescription = options.embed.description;

  // Create a new game instance by calling the API
  const gameData: any = await fetch(`https://weky.miv4.com/api/2048/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      guild: message.guild.id,
      channel: message.channel.id,
      message: msg.id,
    }),
  }).then((res) => res.json());

  // Handle error cases for existing games
  if (gameData.error && gameData.error !== "Id already exists") {
    if (msg.editable) {
      const embed = new EmbedBuilder()
        .setTitle("Failed to start the game.")
        .setDescription(`\`\`\`${gameData.error}\`\`\``)
        .setColor("Red")
        .setTimestamp(options.embed.timestamp ? new Date() : null);
      return await msg.edit({ content: ``, embeds: [embed] });
    }
  } else if (gameData.error && gameData.error === "Id already exists") {
    const embed = new EmbedBuilder()
      .setTitle("Failed to start the game.")
      .setDescription(`You already have a game running!`)
      .setColor("Red")
      .setTimestamp(options.embed.timestamp ? new Date() : null);

    const msg = await message.reply({ content: ``, embeds: [embed] });

    // Set up collector for the "quit" button
    const collector = msg.createMessageComponentCollector({
      time: 60000,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (btn) => {
      if (btn.user.id !== id) {
        return btn.reply({ content: "This is not your game!", flags: [MessageFlags.Ephemeral] });
      }

      if (btn.customId === "quit") {
        collector.stop("quit");
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "quit") {
        const del: any = await fetch(`https://weky.miv4.com/api/2048/${id}/quit`, {
          method: "GET",
        }).then((res) => res.json());

        if (del.error) {
          throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + ` Failed to delete the game data: ${del.error}`);
        }

        const embed = new EmbedBuilder()
          .setTitle("Game Stopped!")
          .setDescription(`You have stopped the game.`)
          .setColor("Red")
          .setTimestamp(options.embed.timestamp ? new Date() : null);

        return await msg.edit({ content: ``, embeds: [embed], components: [] }).catch(() => {});
      }

      return msg.delete().catch(() => {});
    });
  }

  // Create the game board image from the API response
  const img = new AttachmentBuilder(Buffer.from(gameData.grid), {
    name: "2048.png",
  });

  // Set up the game embed with score and ID
  options.embed.description = originalDescription?.replace(`{{score}}`, `${gameData.data.score}`).replace(`{{id}}`, `${gameData.data.id}`) || `ID: \`${gameData.data.id}\`\nScore: \`${gameData.data.score}\``;
  options.embed.image = "attachment://2048.png";
  let embed = createEmbed(options.embed);

  // Create game control buttons (up, down, left, right, quit)
  const up = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.emojis ? options.emojis.up || "⬆️" : "⬆️")
    .setCustomId("weky_up");

  const down = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.emojis ? options.emojis.down || "⬇️" : "⬇️")
    .setCustomId("weky_down");

  const left = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.emojis ? options.emojis.left || "⬅️" : "⬅️")
    .setCustomId("weky_left");

  const right = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.emojis ? options.emojis.right || "➡️" : "➡️")
    .setCustomId("weky_right");

  const stop = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel("Quit Game").setCustomId("weky_quit").setEmoji("🛑");

  // Create button rows for the game controls
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(left, up, down, right);
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(stop);

  // Update the message with the game board and controls
  if (!msg.editable) return;

  await msg.edit({
    content: `React with the buttons to play the game!`,
    embeds: [embed],
    components: [row, row2],
    files: [img],
  });

  // Set up the main game collector to handle button interactions
  const collector = msg.createMessageComponentCollector({
    time: options.time || 600_000, // 10 minutes
    componentType: ComponentType.Button,
  });

  // Handle button clicks during gameplay
  collector.on("collect", async (btn) => {
    // Verify the correct player is clicking
    if (btn.user.id !== id) {
      return btn.reply({ content: "This is not your game!", flags: [MessageFlags.Ephemeral] });
    }

    if (btn.customId === "weky_quit") {
      return collector.stop("quit");
    }

    // Handle game moves by calling the API
    const data: any = await fetch(`https://weky.miv4.com/api/2048/${btn.user.id}/${btn.customId.split("_")[1]}`, {
      method: "GET",
    }).then((res) => res.json());

    if (data.error) {
      const embed = new EmbedBuilder()
        .setTitle("Failed to make a move.")
        .setDescription(`\`\`\`${data.error}\`\`\``)
        .setColor("Red")
        .setTimestamp(options.embed.timestamp ? new Date() : null);
      return await btn.reply({ content: ``, embeds: [embed] });
    }

    if (data.gameover) {
      return collector.stop("gameover");
    }

    // Create the game board image from the API response
    const img = new AttachmentBuilder(Buffer.from(data.data.grid), {
      name: "2048.png",
    });

    // Set up the game embed with score and ID
    options.embed.description = originalDescription?.replace(`{{score}}`, `${data.data.score}`).replace(`{{id}}`, `${data.data.id}`) || `ID: \`${data.data.id}\`\nScore: \`${data.data.score}\``;
    const embed = createEmbed(options.embed);

    // Update the message with the game board and controls
    await btn.update({
      content: ``,
      embeds: [embed],
      components: [row, row2],
      files: [img],
    });
  });

  // Handle game end conditions
  collector.on("end", async (_, reason) => {
    // Get final game state
    const data: any = await fetch(`https://weky.miv4.com/api/2048/${id}/get`, {
      method: "GET",
    }).then((res) => res.json());

    // Create the game board image from the API response
    const img = new AttachmentBuilder(Buffer.from(data.grid), {
      name: "2048.png",
    });

    // Update embed with final score
    const score = data.data.score;
    embed.setTitle("Game Over!").setDescription(`You scored \`${score}\` points!`).setImage(`attachment://2048.png`).setColor("Red");

    // Update the message with the game board and controls
    await msg.edit({
      content: ``,
      embeds: [embed],
      components: [],
      files: [img],
    });

    // Clean up game data from the API
    const del: any = await fetch(`https://weky.miv4.com/api/2048/${id}/quit`, {
      method: "GET",
    }).then((res) => res.json());

    if (del.error) {
      throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + ` Failed to delete the game data: ${del.error}`);
    }
  });

  checkPackageUpdates("2048", options.notifyUpdate);
};

export default mini2048;
