import express from "express";
import { database } from "../..";
import { getBoardCard, getGameOverCard } from "../../functions/2024Cards";

const router = express.Router();

router.post("/createGame", async (req, res) => {
	const { playerID, username }: { playerID: string; username: string } = req.body;
	const botID = req.headers["x-bot-id"] as string;

	const gameId = await database.create2048(playerID, username);
	await database.incrementUsage(botID, "minigames", 1, "mini2024");

	if (gameId) {
		return res.status(200).send({ gameID: gameId });
	} else {
		return res.status(200).send({ gameID: "-1" });
	}
});

router.post("/move", async (req, res) => {
	const { gameID, direction }: { gameID: string; direction: string } = req.body;

	if (!gameID || !direction) return res.status(400).send({ error: "Missing data" });

	const moveResult = await database.move2048(gameID, direction);

	return res.status(200).send({
		board: moveResult.board,
		score: moveResult.score,
		moved: moveResult.moved,
		gameOver: moveResult.gameOver,
		won: moveResult.won,
	});
});

router.post("/getBoardImage", async (req, res) => {
	const { gameID, userIcon }: { gameID: string; userIcon: string } = req.body;

	const gameData = await database.get2048(gameID);
	if (!gameData) return res.status(404).send({ error: "Game not found" });

	let cardBuffer: string;

	if (gameData.gameOver) {
		cardBuffer = await getGameOverCard(gameData.username, userIcon, gameData.score, gameData.board);
	} else {
		cardBuffer = await getBoardCard(gameData.username, userIcon, gameData.score, gameData.board);
	}

	return res.status(200).send({
		cardBuffer: cardBuffer,
	});
});

router.post("/endGame", async (req, res) => {
	const { gameID } = req.body;
	const removed = await database.remove2048(gameID);
	return res.status(200).send({ removed });
});

export default router;
