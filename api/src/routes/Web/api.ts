import express from "express";
import { database } from "../..";
import "dotenv/config";

const router = express.Router();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

router.post("/createAPIKey", (req, res) => {
	const { botID, apiKey, apiName, ownerID } = req.body;

	if (!botID || !apiKey || !apiName || !ownerID) {
		return res.status(400).json({
			success: false,
			error: "Missing required fields: botID, apiKey, apiName, ownerID",
		});
	}

	const success = database.createAPIKey(botID, apiKey, apiName, ownerID);

	if (success) {
		return res.status(201).json({
			success: true,
			message: "API Key created successfully.",
		});
	} else {
		return res.status(409).json({
			success: false,
			error: "Failed to create key. Bot ID is likely already taken.",
		});
	}
});

router.post("/getAllAPIKeys", (req, res) => {
	const { ownerID } = req.body;

	if (!ownerID) {
		return res.status(400).json({ success: false, error: "Missing required field: ownerID" });
	}

	const keys = database.getAllAPIKeys(ownerID);

	const newKeys = keys.map((key) => {
		const bot = database.get(key.botID);

		if (bot) {
			const usage = bot.usage.totalRequests;

			return {
				...key,
				usage,
			};
		} else {
			return key;
		}
	});

	if (keys !== null) {
		return res.status(200).json({ success: true, data: newKeys });
	} else {
		return res.status(404).json({ success: false, error: "Owner not found or no keys exist." });
	}
});

router.post("/updateAPIKey", (req, res) => {
	const { ownerID, botID, newApiKey, newApiName } = req.body;

	if (!ownerID || !botID) {
		return res.status(400).json({ success: false, error: "Missing required fields: ownerID, botID" });
	}

	if (newApiKey === undefined && newApiName === undefined) {
		return res.status(400).json({ success: false, error: "No update data provided." });
	}

	const success = database.updateAPIKey(ownerID, botID, newApiKey || null, newApiName || null);

	if (success) {
		return res.status(200).json({ success: true, message: "API Key updated successfully." });
	} else {
		return res.status(404).json({ success: false, error: "Update failed. Key not found." });
	}
});

router.post("/removeAPIKey", (req, res) => {
	const { ownerID, botID } = req.body;

	if (!ownerID || !botID) {
		return res.status(400).json({ success: false, error: "Missing required fields: ownerID, botID" });
	}

	const success = database.removeAPIKey(ownerID, botID);

	if (success) {
		return res.status(200).json({ success: true, message: "API Key deleted successfully." });
	} else {
		return res.status(404).json({ success: false, error: "Delete failed. Key not found." });
	}
});

router.post("/discord-auth", async (req, res) => {
	const { code } = req.body;

	if (!code) {
		return res.status(400).send("No code provided");
	}

	try {
		const params = new URLSearchParams({
			grant_type: "authorization_code",
			code: code,
			redirect_uri: DISCORD_REDIRECT_URI,
		});

		const response = await fetch("https://discord.com/api/v10/oauth2/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${btoa(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`)}`,
			},
			body: params,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Discord API Error:", errorText);
			return res.status(response.status).send(errorText);
		}

		const tokenData = (await response.json()) as { token_type: string; access_token: string };

		const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
			headers: {
				Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
			},
		});

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			console.error(errorText);
			return res.status(userResponse.status).send(errorText);
		}

		const userData = await userResponse.json();

		return res.status(200).send({
			user: userData,
		});
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
});

export default router;
