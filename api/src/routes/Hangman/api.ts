import express from "express";
import words from "../../../assets/words.json";
import { database } from "../..";
import { getHangmanCard } from "../../functions/HangmanCards";

const router = express.Router();

router.post("/createGame", async (req, res) => {
	const { playerID, username }: { playerID: string; username: string } = req.body;
	const botID = req.headers["x-bot-id"] as string;

	const word = words[Math.floor(Math.random() * words.length)];
	const gameId = await database.createHangman(playerID, username, word);

	await database.incrementUsage(botID, "minigames", 1, "hangman");

	return res.status(200).send({ gameID: gameId });
});

router.post("/guess", async (req, res) => {
	const { gameID, letter }: { gameID: string; letter: string } = req.body;

	if (!gameID || !letter) return res.status(400).send({ error: "Missing data" });

	try {
		const result = await database.guessHangman(gameID, letter);
		return res.status(200).send(result);
	} catch (e) {
		return res.status(404).send({ error: "Game not found" });
	}
});

router.post("/getBoardImage", async (req, res) => {
	const { gameID, userIcon } = req.body;

	const game = await database.getHangman(gameID);
	if (!game) return res.status(404).send({ error: "Game not found" });

	const buffer = await getHangmanCard(
		game.wrongGuesses,
		game.displayWord,
		game.guessedLetters,
		game.username,
		userIcon,
		game.gameOver,
		game.won
	);

	return res.status(200).send({ cardBuffer: buffer });
});

router.post("/endGame", async (req, res) => {
	const { gameID } = req.body;
	await database.removeHangman(gameID);
	return res.status(200).send({ success: true });
});

export default router;
