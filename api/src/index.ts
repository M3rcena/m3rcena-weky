import compression from "compression";
import "dotenv/config";
import express, { NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { Logger } from "logger-ts-node";
import cors from "cors";

import DataHandler from "./functions/DataHandler";

import MainRoute from "./routes/Main/api";
import FastType from "./routes/FastType/api";
import Fight from "./routes/Fight/api";
import Game2048 from "./routes/2048/api";
import Hangman from "./routes/Hangman/api";

import Web from "./routes/Web/api";

const app = express();
const port = process.env.PORT;

export const database = new DataHandler();

const authenticateApiKey = (req: express.Request, res: express.Response, next: NextFunction) => {
	const botID = req.headers["x-bot-id"] as string;
	const apiKey = req.headers["x-api-key"] as string;

	const webBypass = req.headers["x-web-bypass"] as string;

	if (webBypass === process.env.SecurityWebCode) {
		next();
		return;
	}

	if (!botID || !apiKey) {
		return res.status(401).json({ error: "Missing authentication headers." });
	}

	const isValid = database.validateApiKey(botID, apiKey);

	if (!isValid) {
		res.status(403).json({ error: "Invalid API Key or Bot ID" });
		return;
	}

	database.incrementUsage(botID, "totalRequests");

	next();
};

app.set("tryst proxy", 1);

const limiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	max: 1000000,
	standardHeaders: true,
	legacyHeaders: false,
});

app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

app.use(limiter);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authenticateApiKey);

app.use("/api/v1", MainRoute);
app.use("/api/v1/FastType", FastType);
app.use("/api/v1/Fight", Fight);
app.use("/api/v1/Web", Web);
app.use("/api/v1/2048", Game2048);
app.use("/api/v1/Hangman", Hangman);

app.listen(port, () => Logger.info(`Server is listening on port ${port}`));
