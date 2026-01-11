import type { WekyManager } from "../index.js";
import type { CustomOptions, HangmanTypes } from "../Types/index.js";

const Hangman = async (weky: WekyManager, options: CustomOptions<HangmanTypes>) => {
	const context = options.context;

	const id = weky._getContextUserID(context);
	const author = context.user || context.author;
	const username = author.username;
	const userIcon = author.displayAvatarURL({ extension: "png" });

	const gameID = await weky.NetworkManager.createHangmanGame(id, username);
	if (gameID === "-1") {
		return context.channel.send("Failed to start the game. Please try again later.");
	}

	let attachment = await weky.NetworkManager.getHangmanBoardImage(gameID, userIcon);
	if (!attachment) {
		return context.channel.send("Failed to generate game image.");
	}

	const msg = await context.channel.send({
		files: [attachment],
	});

	const col = context.channel.createMessageCollector({
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

		const response = await weky.NetworkManager.guessHangman(gameID, char);

		if (!response) {
			return weky._LoggerManager.createError("Hangman", "API failed to respond to guess.");
		}

		if (!response.success) {
			const warning = await context.channel.send(`${author}, ${response.message}`);
			setTimeout(() => warning.delete().catch(() => {}), 3000);
			return;
		}

		const { game } = response;

		attachment = await weky.NetworkManager.getHangmanBoardImage(gameID, userIcon);

		await msg
			.edit({
				files: [attachment!],
			})
			.catch((e) => {
				col.stop();
				throw e;
			});

		if (game.gameOver) {
			await weky.NetworkManager.endHangmanGame(gameID);
			col.stop("finished");
		}
	});

	col.on("end", async (_, r) => {
		if (r === "time") {
			await weky.NetworkManager.endHangmanGame(gameID);

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
