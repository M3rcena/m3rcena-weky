import express from "express";
import { database } from "../..";
import { getSnakeBoard } from "../../functions/SnakeCards";

const router = express.Router();

router.post("/createGame", async (req, res) => {
	const { playerID, username }: { playerID: string; username: string } = req.body;
	const botID = req.headers["x-bot-id"] as string;

	const gameId = database.createSnake(playerID, username);
	database.incrementUsage(botID, "minigames", 1, "snake");

	if (gameId) {
		return res.status(200).send({ gameID: gameId });
	} else {
		return res.status(200).send({ gameID: "-1" });
	}
});

router.post("/move", async (req, res) => {
	const { gameID, direction }: { gameID: string; direction: "UP" | "DOWN" | "LEFT" | "RIGHT" } = req.body;

	if (!gameID || !direction) return res.status(400).send({ error: "Missing data" });

	try {
		const gameState = database.moveSnake(gameID, direction);

		return res.status(200).send({
			score: gameState.score,
			gameOver: gameState.gameOver,
			won: false,
		});
	} catch (e) {
		return res.status(404).send({ error: "Game not found or finished" });
	}
});

router.post("/getBoardImage", async (req, res) => {
	const { gameID, userIcon }: { gameID: string; userIcon: string } = req.body;

	const gameData = database.getSnake(gameID);
	if (!gameData) return res.status(404).send({ error: "Game not found" });

	const cardBuffer = await getSnakeBoard(gameData.username, userIcon, gameData);

	return res.status(200).send({
		cardBuffer: cardBuffer,
	});
});

router.post("/endGame", async (req, res) => {
	const { gameID } = req.body;
	const removed = database.removeSnake(gameID);
	return res.status(200).send({ removed });
});

export default router;
