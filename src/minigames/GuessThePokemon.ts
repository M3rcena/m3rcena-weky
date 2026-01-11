import { ButtonBuilder, ButtonStyle } from "discord.js";
import fetch from "node-fetch";

import type { CustomOptions, GuessThePokemonData, GuessThePokemonTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";

const gameData = new Set();

const GuessThePokemon = async (weky: WekyManager, options: CustomOptions<GuessThePokemonTypes>) => {
	let context = options.context;

	if (!options.thinkMessage) options.thinkMessage = "Thinking";
	if (typeof options.thinkMessage !== "string") {
		return weky._LoggerManager.createTypeError("GuessThePokemon", "thinkMessage should be string");
	}

	if (!options.embed.description)
		options.embed.description =
			"**Type:**\n{{type}}\n\n**Abilities:**\n{{abilities}}\n\nYou only have **{{time}}** to guess the pokémon.";

	if (!options.winMessage) options.winMessage = "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";
	if (typeof options.winMessage !== "string") {
		return weky._LoggerManager.createTypeError("GuessTheNumber", "winMessage must be a string");
	}

	if (!options.loseMessage) options.loseMessage = "Try again! The answer was **{{answer}}**.";
	if (typeof options.loseMessage !== "string") {
		return weky._LoggerManager.createTypeError("GuessThePokemon", "loseMessage must be a string");
	}

	if (!options.incorrectMessage)
		options.incorrectMessage = "The pokemon we are looking for is not **{{answer}}**! Try again.";
	if (typeof options.incorrectMessage !== "string") {
		return weky._LoggerManager.createTypeError("GuessThePokemon", "incorrectMessage must be a string");
	}

	const userId = weky._getContextUserID(context);

	if (gameData.has(userId)) return;
	gameData.add(userId);

	const id = weky.getRandomString(20) + "-" + weky.getRandomString(20) + "-" + weky.getRandomString(20);

	const think = await context.channel.send({
		embeds: [weky._createEmbed(options.embed).setTitle(`${options.thinkMessage}...`).setDescription(`\u200b`)],
	});

	const randomNumber = Math.floor(Math.random() * 801);

	const data = (await fetch(`http://pokeapi.co/api/v2/pokemon/${randomNumber}`).then((res) =>
		res.json()
	)) as GuessThePokemonData;

	const abilities = data.abilities.map((item) => item.ability.name);
	const seperatedAbilities = abilities.join(", ");

	const types = data.types.map((item) => item.type.name);
	const seperatedTypes = types.join(", ");

	let btn1 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setLabel(options.buttonText ?? "Cancel")
		.setCustomId(id);

	const embed = weky._createEmbed(options.embed).setDescription(
		options.embed.description
			.replace("{{type}}", seperatedTypes)
			.replace("{{abilities}}", seperatedAbilities)
			.replace("{{time}}", options.time ? `${options.time}` : `1 Minute`)
	);

	await think.edit({
		embeds: [embed],
		components: [{ type: 1, components: [btn1] }],
	});

	const gameCreatedAt = Date.now();

	const collector = context.channel.createMessageCollector({
		filter: (m) => m.author.id === userId,
		time: options.time ?? 60000,
	});

	collector.on("collect", async (msg) => {
		const content = msg.content;

		await msg.delete();

		if (content.toLowerCase() === data.name) {
			const _embed = weky
				._createEmbed(options.embed)
				.setDescription(
					options.winMessage
						.replace("{{answer}}", data.name.charAt(0).toUpperCase() + data.name.slice(1))
						.replace("{{time}}", weky.convertTime(Date.now() - gameCreatedAt))
				)
				.setImage(data.sprites.other.home.front_default);

			await think.edit({
				embeds: [_embed],
				components: [],
			});

			collector.stop();
			gameData.delete(userId);
		} else {
			const _embed = weky
				._createEmbed(options.embed)
				.setDescription(options.incorrectMessage.replace("{{answer}}", msg.content.toLowerCase()))
				.setColor("Red");

			think.edit({
				embeds: [embed, _embed],
			});
		}
	});

	const gameCollector = think.createMessageComponentCollector({
		filter: (inter) => inter.user.id === userId,
		time: options.time ?? 60000,
	});

	gameCollector.on("collect", async (button) => {
		await button.deferUpdate();

		if (button.customId === id) {
			gameCollector.stop();
			collector.stop();
			gameData.delete(userId);

			const _embed = weky
				._createEmbed(options.embed)
				.setDescription(
					options.loseMessage.replace("{{answer}}", data.name.charAt(0).toUpperCase() + data.name.slice(1))
				)
				.setColor("Red")
				.setImage(data.sprites.other.home.front_default);

			think.edit({
				embeds: [_embed],
				components: [],
			});
		}
	});

	collector.on("end", async (_msg, reason) => {
		if (reason === "time") {
			gameCollector.stop();
			collector.stop();
			gameData.delete(userId);

			const _embed = weky
				._createEmbed(options.embed)
				.setDescription(
					options.loseMessage.replace("{{answer}}", data.name.charAt(0).toUpperCase() + data.name.slice(1))
				)
				.setImage(data.sprites.other.home.front_default);

			think.edit({
				embeds: [_embed],
				components: [],
			});
		}
	});
};

export default GuessThePokemon;
