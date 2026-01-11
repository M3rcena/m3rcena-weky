import express from "express";
import { database } from "../..";
import { BotDataTypes } from "../../Types";
import words from "../../../assets/words.json";

const router = express.Router();

router.get("/init", async (req, res) => {
	const botID = req.query.botID as string;
	const botName = req.query.botName as string;

	if (!botID || !botName) {
		return res.status(400).json({ error: "Invalid request body" });
	}

	if (!database.get(botID)) {
		database.create(botID, botName);
	}

	database.incrementUsage(botID, "inits");

	return res.status(200).json({ success: true });
});

router.get("/usage/:id", async (req, res) => {
	const id = req.params.id;

	const usage = database.getField(id, "usage");

	return res.status(200).json({ usage });
});

router.post("/increaseUsage", async (req, res) => {
	type MinigameKey = keyof BotDataTypes["usage"]["minigames"];

	const { minigame }: { minigame: MinigameKey } = req.body;
	const botID = req.headers["x-bot-id"] as string;

	database.incrementUsage(botID, "minigames", 1, minigame);

	return res.status(200).send({ success: true });
});

router.get("/getRandomSentence", async (req, res) => {
	const length = req.query.length as string;

	const word: string[] = [];

	for (let i = 0; i < Number(length); i++) {
		word.push(words[Math.floor(Math.random() * words.length)]);
	}

	return res.status(200).send({ word });
});

export default router;
