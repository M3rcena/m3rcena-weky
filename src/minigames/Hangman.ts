import { getContextUserID } from "../functions/context.js";

import type { HangmanTypes } from "../Types";
import type { NetworkManager } from "../handlers/NetworkManager";
import type { LoggerManager } from "../handlers/Logger.js";

const Hangman = async (networkManager: NetworkManager, options: HangmanTypes, loggerManager: LoggerManager) => {
	let context = options.context;

	if (!context.channel || !context.channel.isSendable() || context.channel.isDMBased())
		return loggerManager.createError("Hangman", "No channel found or the channel is not eligible for this game!");

	const id = getContextUserID(context);
	const author = context.user || context.author;
	const username = author.username;
	const userIcon = author.displayAvatarURL({ extension: "png" });

	const gameID = await networkManager.createHangmanGame(id, username);
	if (gameID === "-1") {
		return context.channel.send("Failed to start the game. Please try again later.");
	}

	let attachment = await networkManager.getHangmanBoardImage(gameID, userIcon);
	if (!attachment) {
		return context.channel.send("Failed to generate game image.");
	}

	const msg = await context.channel.send({
		files: [attachment],
	});

	const channel = context.channel;
	const col = channel.createMessageCollector({
		filter: (m) => m.author.id === id,
		time: options.time ? options.time : 180_000,
	});

	col.on("collect", async (msg2) => {
		if (context.channel.isDMBased()) return;

		const char = msg2.content[0]?.toLowerCase();

		if (msg2.deletable) await msg2.delete().catch(() => {});

		if (!char || !/[a-z]/i.test(char)) {
			const warning = await context.channel.send(`${author}, please provide a **single letter**!`);
			setTimeout(() => warning.delete().catch(() => {}), 3000);
			return;
		}

		const response = await networkManager.guessHangman(gameID, char);

		if (!response) {
			return loggerManager.createError("Hangman", "API failed to respond to guess.");
		}

		if (!response.success) {
			const warning = await context.channel.send(`${author}, ${response.message}`);
			setTimeout(() => warning.delete().catch(() => {}), 3000);
			return;
		}

		const { game } = response;

		attachment = await networkManager.getHangmanBoardImage(gameID, userIcon);

		await msg
			.edit({
				files: [attachment!],
			})
			.catch((e) => {
				col.stop();
				throw e;
			});

		if (game.gameOver) {
			await networkManager.endHangmanGame(gameID);
			col.stop("finished");
		}
	});

	col.on("end", async (s, r) => {
		if (r === "time") {
			await networkManager.endHangmanGame(gameID);

			await msg
				.edit({
					content: "⛔ **Game Ended:** You took too much time to respond.",
					files: [],
				})
				.catch(() => {});
		}
	});
};

export default Hangman;
