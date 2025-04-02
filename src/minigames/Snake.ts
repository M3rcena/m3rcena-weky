import chalk from "chalk";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

import { checkPackageUpdates, createEmbed } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";

import type { ChatInputCommandInteraction, Client, Message } from "discord.js";
import type { SnakeTypes } from "../Types";

const Snake = async (options: SnakeTypes) => {
    OptionsChecking(options, "snake");

    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] Snake Error:") + " No interaction provided.");

    let client: Client = options.client;

    let id: string = "";
    if ((options.interaction as Message).author) {
        id = (options.interaction as Message).author.id;
    } else {
        id = (options.interaction as ChatInputCommandInteraction).user.id;
    };

    if (!interaction.guild) {
        throw new Error(chalk.red("[@m3rcena/weky] Snake Error:") + " Guild is not available in this interaction.");
    };

    if (!interaction.channel || !interaction.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] Snake Error:") + " Channel is not available in this interaction.");
    };

    const snake = [{ x: 5, y: 5 }];
    let apple = { x: 1, y: 1 };
    let snakeLength = 1;
    const gameBoard: string[] = [];
    let score = 0;
    let foods: string[] = ['🍎', '🍇', '🍊', '🥕', '🥝', '🌽'];
    let baseDescription = options.embed.description

    if (!options.emojis) {
        options.emojis = {
            up: "⬆️",
            down: "⬇️",
            left: "⬅️",
            right: "➡️",
            stop: "🛑",
            board: "⬛",
            food: "🍎"
        }
    };

    if (!options.snake) {
        options.snake = {
            head: "🟢",
            body: "🟩",
            tail: "🟢",
            skull: "💀"
        }
    }

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 15; x++) {
            gameBoard[y * 15 + x] = options.emojis.board ? options.emojis.board : "⬛";
        }
    };

    function getBoardContent(isSkull: boolean) {
        const emojis = options.snake ? options.snake : {
            head: "🟢",
            body: "🟩",
            tail: "🟢",
            skull: "💀"
        };

        let board = '';

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 15; x++) {
                if (x == apple.x && y == apple.y) {
                    board += options.emojis.food ? options.emojis.food : "🍎";
                    continue;
                };

                const isSnakeBody = isSnake({ x: x, y: y });
                if (isSnakeBody) {
                    const pos = snake.indexOf(isSnakeBody);
                    if (pos === 0) {
                        const isHead = (!isSkull || snakeLength >= (10 * 15));
                        board += isHead ? emojis.head : emojis.skull;
                    } else if (pos === snake.length - 1) {
                        board += emojis.tail;
                    } else {
                        board += emojis.body;
                    }
                };

                if (!isSnakeBody) {
                    board += gameBoard[y * 15 + x];
                };
            }
            board += '\n';
        };

        return board;
    };

    function isSnake(pos: { x: number, y: number }) {
        return snake.find(snake => (snake.x === pos.x && snake.y === pos.y)) ?? false;
    };

    function updateFoodLoc() {
        let applePos = { x: 0, y: 0 };
        do {
            applePos = { x: Math.floor(Math.random() * 15), y: Math.floor(Math.random() * 10) }
        } while (isSnake(applePos));

        if (!options.emojis.food) {
            options.emojis.food = "🍎";
        }

        if (foods.length) {
            options.emojis.food = foods[Math.floor(Math.random() * foods.length)];
        };

        apple = { x: applePos.x, y: applePos.y };
    };

    const emojis = options.emojis ? options.emojis : {
        up: "⬆️",
        down: "⬇️",
        left: "⬅️",
        right: "➡️",
        stop: "🛑",
        board: "⬛",
        food: "🍎"
    };

    updateFoodLoc();

    options.embed.title = options.embed.title ?? "Snake Game";
    options.embed.description = baseDescription.replace('{{score}}', score.toString()).replace('{{board}}', getBoardContent(false)) ?? `**Score:** ${score}\n\n${getBoardContent(false)}`;
    let embed = createEmbed(options.embed);

    const up = new ButtonBuilder()
        .setEmoji(emojis.up)
        .setStyle(ButtonStyle.Primary)
        .setCustomId("weky-snake_up");

    const down = new ButtonBuilder()
        .setEmoji(emojis.down)
        .setStyle(ButtonStyle.Primary)
        .setCustomId("weky-snake_down");

    const left = new ButtonBuilder()
        .setEmoji(emojis.left)
        .setStyle(ButtonStyle.Primary)
        .setCustomId("weky-snake_left");

    const right = new ButtonBuilder()
        .setEmoji(emojis.right)
        .setStyle(ButtonStyle.Primary)
        .setCustomId("weky-snake_right");

    const stop = new ButtonBuilder()
        .setEmoji(emojis.stop)
        .setStyle(ButtonStyle.Danger)
        .setCustomId("weky-snake_stop");

    const dis1 = new ButtonBuilder()
        .setLabel(`\u200b`)
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("weky-snake_dis1")
        .setDisabled(true);

    const dis2 = new ButtonBuilder()
        .setLabel(`\u200b`)
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("weky-snake_dis2")
        .setDisabled(true);

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(dis1, up, dis2, stop);
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(left, down, right);

    const msg = await options.interaction.reply({
        embeds: [embed],
        components: [row1, row2]
    });

    const collector = msg.createMessageComponentCollector({
        time: options.time ? options.time : 60000
    });

    collector.on("collect", async (btn) => {
        await btn.deferUpdate();

        if (btn.user.id !== id) {
            return btn.followUp({
                content: "This is not your game!",
                ephemeral: true
            });
        };

        const snakeHead = snake[0];

        const nextPos = { x: snakeHead.x, y: snakeHead.y };
        const buttonId = btn.customId.split("_")[1];

        if (buttonId === 'left') {
            nextPos.x = (snakeHead.x - 1);
        } else if (buttonId === 'right') {
            nextPos.x = (snakeHead.x + 1);
        } else if (buttonId === 'down') {
            nextPos.y = (snakeHead.y + 1);
        } else if (buttonId === 'up') {
            nextPos.y = (snakeHead.y - 1);
        };

        if (nextPos.x < 0 || (nextPos.x >= 15)) {
            nextPos.x = (nextPos.x < 0) ? 0 : 14;
            return collector.stop();
        };

        if (nextPos.y < 0 || (nextPos.y >= 10)) {
            nextPos.y = (nextPos.y < 0) ? 0 : 9;
            return collector.stop();
        };

        if (isSnake(nextPos) || buttonId === 'stop') {
            return collector.stop();
        } else {
            snake.unshift(nextPos);

            if (apple.x === snake[0].x && apple.y === snake[0].y) {
                score += 1;
                snakeLength += 1;
                updateFoodLoc();
            } else if (snake.length > snakeLength) {
                snake.pop();
            }

            const newBoardContent = getBoardContent(false);

            options.embed.description = baseDescription ? baseDescription.replace("{{score}}", `${score}`).replace("{{board}}", `${newBoardContent}`) : `**Score:** ${score}\n\n${newBoardContent}`;

            let embd = createEmbed(options.embed);

            return msg.edit({ embeds: [embd] });
        }
    });

    collector.on("end", async (_, reason) => {
        if (reason === 'time' || reason === 'user') {
            options.embed.description = baseDescription.replace('{{board}}', getBoardContent(true)) ?? `**Game Over!**\n\n**Score:** ${score}\n\n${getBoardContent(true)}`;
            let embed = createEmbed(options.embed);

            up.setDisabled(true);
            down.setDisabled(true);
            left.setDisabled(true);
            right.setDisabled(true);
            stop.setDisabled(true);

            dis1.setDisabled(true);
            dis2.setDisabled(true);

            const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(dis1, up, dis2, stop);
            const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(left, down, right);

            return msg.edit({
                embeds: [embed],
                components: [row1, row2]
            });
        }
    });

    checkPackageUpdates("Snake", options.notifyUpdate);
};

export default Snake;