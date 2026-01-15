import express from "express";
import fs from "fs/promises";
import path from "path";
import { database } from "../..";

const router = express.Router();

router.get("/getText", async (req, res) => {
	try {
		const difficulty = req.query.difficulty as string;
		const botID = req.headers["x-bot-id"] as string;

		const allowedDifficulties = ["easy", "medium", "hard"];
		if (!difficulty || !allowedDifficulties.includes(difficulty)) {
			return res.status(400).json({
				error: "Invalid difficulty. Please provide 'ease', 'medium', or 'hard'.",
			});
		}

		const filePath = path.join(process.cwd(), "assets", `${difficulty}Text.txt`);

		const fileContent = await fs.readFile(filePath, "utf-8");

		const sentenceRegex = /[^.!?]+[.!?]+/g;
		const matches = fileContent.match(sentenceRegex);

		const sentences = matches ? matches.map((s) => s.trim()).filter((s) => s.length > 0) : [];

		if (sentences.length === 0) {
			return res.status(404).json({ error: "No sentences found in file." });
		}

		const randomIndex = Math.floor(Math.random() * sentences.length);
		const randomSentence = sentences[randomIndex];

		await database.incrementUsage(botID, "minigames", 1, "fastType");

		return res.status(200).json({
			sentence: randomSentence,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Failed to retrieve text." });
	}
});

export default router;
