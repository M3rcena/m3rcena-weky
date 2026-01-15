import express from "express";
import { database } from "../..";
import {
	getDeniedCard,
	getMainCard,
	getRequestCard,
	getSurrenderCard,
	getTimeoutCard,
	getWinCard,
} from "../../functions/FightCards";
import { FightPlayerType } from "../../Types";

const router = express.Router();

router.post("/createGame", async (req, res) => {
	const {
		challengerID,
		challengerUsername,
		opponentID,
		opponentUsername,
	}: { challengerID: string; challengerUsername: string; opponentID: string; opponentUsername: string } = req.body;
	const botID = req.headers["x-bot-id"] as string;

	const gameId = await database.createFight(challengerID, challengerUsername, opponentID, opponentUsername);

	await database.incrementUsage(botID, "minigames", 1, "fight");

	if (gameId) {
		return res.status(200).send({
			gameID: gameId,
		});
	} else {
		return res.status(200).send({
			gameID: "-1",
		});
	}
});

router.get("/removeGame", async (req, res) => {
	const gameID = req.query.gameID as string;

	const removed = await database.removeFight(gameID);

	return res.status(200).send({
		removed,
	});
});

router.post("/isInGame", async (req, res) => {
	const { playerID }: { playerID: string } = req.body;

	return res.status(200).send({
		isInGame: await database.isPlayerInFight(playerID),
	});
});

router.post("/makeMainCard", async (req, res) => {
	const { gameID, challengerIcon, opponentIcon }: { gameID: string; challengerIcon: string; opponentIcon: string } =
		req.body;

	if (!gameID || !challengerIcon || !opponentIcon) return;

	const gameData = await database.getFight(gameID);

	const cardBuffer = await getMainCard(
		gameData.players[0],
		challengerIcon,
		gameData.players[1],
		opponentIcon,
		gameData.players[gameData.turn].memberId
	);

	return res.status(200).send({
		mainCardBuffer: cardBuffer,
	});
});

router.post("/makeRequestCard", async (req, res) => {
	const {
		challengerUsername,
		challengerIcon,
		opponentUsername,
		opponentIcon,
	}: { challengerUsername: string; challengerIcon: string; opponentUsername: string; opponentIcon: string } = req.body;

	if (!challengerUsername || !challengerIcon || !opponentUsername || !opponentIcon) return;

	const cardBuffer = await getRequestCard(challengerUsername, challengerIcon, opponentUsername, opponentIcon);

	return res.status(200).send({
		requestCardBuffer: cardBuffer,
	});
});

router.post("/makeDenyCard", async (req, res) => {
	const {
		challengerUsername,
		challengerIcon,
		opponentUsername,
		opponentIcon,
	}: { challengerUsername: string; challengerIcon: string; opponentUsername: string; opponentIcon: string } = req.body;

	if (!challengerUsername || !challengerIcon || !opponentUsername || !opponentIcon) return;

	const cardBuffer = await getDeniedCard(challengerUsername, challengerIcon, opponentUsername, opponentIcon);

	return res.status(200).send({
		denyCardBuffer: cardBuffer,
	});
});

router.post("/makeSurrenderCard", async (req, res) => {
	const {
		winnerUsername,
		winnerIcon,
		surrenderUsername,
		surrenderIcon,
	}: { winnerUsername: string; winnerIcon: string; surrenderUsername: string; surrenderIcon: string } = req.body;

	if (!winnerUsername || !winnerIcon || !surrenderUsername || !surrenderIcon) return;

	const cardBuffer = await getSurrenderCard(winnerUsername, winnerIcon, surrenderUsername, surrenderIcon);

	return res.status(200).send({
		surrenderCardBuffer: cardBuffer,
	});
});

router.post("/makeWinCard", async (req, res) => {
	const {
		winnerUsername,
		winnerIcon,
		loserUsername,
		loserIcon,
	}: { winnerUsername: string; winnerIcon: string; loserUsername: string; loserIcon: string } = req.body;

	if (!winnerUsername || !winnerIcon || !loserUsername || !loserIcon) return;

	const cardBuffer = await getWinCard(winnerUsername, winnerIcon, loserUsername, loserIcon);

	return res.status(200).send({
		winCardBuffer: cardBuffer,
	});
});

router.post("/makeTimeOutCard", async (req, res) => {
	const {
		challengerUsername,
		challengerIcon,
		opponentUsername,
		opponentIcon,
	}: { challengerUsername: string; challengerIcon: string; opponentUsername: string; opponentIcon: string } = req.body;

	if (!challengerUsername || !challengerIcon || !opponentUsername || !opponentIcon) return;

	const cardBuffer = await getTimeoutCard(challengerUsername, challengerIcon, opponentUsername, opponentIcon);

	return res.status(200).send({
		timeoutCardBuffer: cardBuffer,
	});
});

router.get("/getTurn", async (req, res) => {
	const gameID = req.query.gameID as string;

	const { username, userID } = await database.getTurn(gameID);

	return res.status(200).send({
		username,
		userID,
	});
});

router.get("/changeTurn", async (req, res) => {
	const gameID = req.query.gameID as string;

	const changed = await database.changeTurn(gameID);

	return res.status(200).send({
		changed,
	});
});

router.post("/getPlayer", async (req, res) => {
	const { gameID, isOpponent }: { gameID: string; isOpponent: boolean } = req.body;

	const player = await database.getPlayer(gameID, isOpponent);

	return res.status(200).send({
		player,
	});
});

router.post("/updatePlayers", async (req, res) => {
	const { gameID, player1, player2 }: { gameID: string; player1: FightPlayerType; player2: FightPlayerType } = req.body;

	const updated = await database.updatePlayers(gameID, player1, player2);

	return res.status(200).send({
		updated,
	});
});

export default router;
