import express from "express";
import { fetchDilemma } from "../../functions/wyptb";
import { database } from "../..";

const router = express.Router();

/**
 * GET /
 * Returns a RANDOM dilemma
 */
router.get("/", async (req, res) => {
	try {
		const botID = req.headers["x-bot-id"] as string;

		const data = await fetchDilemma();

		database.incrementUsage(botID, "minigames", 1, "willYouPressTheButton");

		res.json(data);
	} catch (error: any) {
		res.status(500).json({ error: "Failed to fetch random dilemma", details: error.message });
	}
});

/**
 * GET /:code
 * Returns a SPECIFIC dilemma by ID
 */
router.get("/:code", async (req, res) => {
	try {
		const botID = req.headers["x-bot-id"] as string;

		const { code } = req.params;
		const data = await fetchDilemma(code);

		database.incrementUsage(botID, "minigames", 1, "willYouPressTheButton");

		res.json(data);
	} catch (error: any) {
		res.status(500).json({ error: "Failed to fetch dilemma", details: error.message });
	}
});

export default router;
