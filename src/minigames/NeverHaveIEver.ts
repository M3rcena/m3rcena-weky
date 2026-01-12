import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags } from "discord.js";

import type { CustomOptions, NeverHaveIEverTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";

interface ApiResponse {
	statement: string;
}

const NeverHaveIEver = async (weky: WekyManager, options: CustomOptions<NeverHaveIEverTypes>) => {
	const context = options.context;
	const userId = weky._getContextUserID(context);

	if (!options.thinkMessage) options.thinkMessage = "I am thinking...";
	if (typeof options.thinkMessage !== "string") {
		return weky._LoggerManager.createTypeError("NeverHaveIEver", "thinkMessage must be a string.");
	}

	if (!options.othersMessage) options.othersMessage = "Only <@{{author}}> can use the buttons!";
	if (typeof options.othersMessage !== "string") {
		return weky._LoggerManager.createTypeError("NeverHaveIEver", "othersMessage must be a string.");
	}

	if (!options.buttons) options.buttons = {};
	if (typeof options.buttons !== "object") {
		return weky._LoggerManager.createTypeError("NeverHaveIEver", "buttons must be an object.");
	}

	const labelYes = options.buttons.optionA || "Yes";
	const labelNo = options.buttons.optionB || "No";

	const gameTitle = options.embed.title || "Never Have I Ever";
	const defaultColor = typeof options.embed.color === "number" ? options.embed.color : 0x5865f2;

	const idYes = `nhie_yes_${weky.getRandomString(10)}`;
	const idNo = `nhie_no_${weky.getRandomString(10)}`;

	const createGameContainer = (
		state: "loading" | "active" | "yes" | "no" | "timeout" | "error",
		statementText: string
	) => {
		const container = new ContainerBuilder();
		let content = "";

		switch (state) {
			case "loading":
				container.setAccentColor(defaultColor);
				content = options.states?.loading
					? options.states.loading.replace("{{gameTitle}}", gameTitle).replace("{{thinkMessage}}", options.thinkMessage)
					: `## ${gameTitle}\n> 🔄 ${options.thinkMessage}`;
				break;

			case "active":
				container.setAccentColor(defaultColor);
				content = options.states?.active
					? options.states.active.replace("{{gameTitle}}", gameTitle).replace("{{statementText}}", statementText)
					: `## ${gameTitle}\n> ${statementText}`;
				break;

			case "yes":
				container.setAccentColor(0x57f287);
				content = options.states?.yes
					? options.states.yes.replace("{{gameTitle}}", gameTitle).replace("{{statementText}}", statementText)
					: `## ${gameTitle}\n> ${statementText}\n\n✅ **I have done this.**`;
				break;

			case "no":
				container.setAccentColor(0xed4245);
				content = options.states?.no
					? options.states.no.replace("{{gameTitle}}", gameTitle).replace("{{statementText}}", statementText)
					: `## ${gameTitle}\n> ${statementText}\n\n❌ **I have never done this.**`;
				break;

			case "timeout":
				container.setAccentColor(0x99aab5);
				content = options.states?.timeout
					? options.states.timeout.replace("{{gameTitle}}", gameTitle).replace("{{statementText}}", statementText)
					: `## ${gameTitle}\n> ${statementText}\n\n⏳ **Time's up!**`;
				break;

			case "error":
				container.setAccentColor(0xff0000);
				content = options.states?.error
					? options.states.error.replace("{{statementText}}", statementText)
					: `## ❌ Error\n> ${statementText}`;
				break;
		}

		container.addTextDisplayComponents((text) => text.setContent(content));

		if (state !== "loading" && state !== "error") {
			const btnYes = new ButtonBuilder()
				.setLabel(labelYes)
				.setStyle(state === "yes" ? ButtonStyle.Success : ButtonStyle.Primary)
				.setCustomId(idYes)
				.setDisabled(state !== "active");

			const btnNo = new ButtonBuilder()
				.setLabel(labelNo)
				.setStyle(state === "no" ? ButtonStyle.Danger : ButtonStyle.Secondary)
				.setCustomId(idNo)
				.setDisabled(state !== "active");

			container.addActionRowComponents((row) => row.setComponents(btnYes, btnNo));
		}

		return container;
	};

	const msg = await context.channel.send({
		components: [createGameContainer("loading", "")],
		flags: MessageFlags.IsComponentsV2,
		allowedMentions: { repliedUser: false },
	});

	let statement = "";
	try {
		const res = await fetch("https://api.nhie.io/v2/statements/next?language=en&category=harmless");
		const data = (await res.json()) as ApiResponse;
		statement = data.statement ? data.statement.trim() : "";
	} catch (e) {
		return await msg.edit({
			components: [
				createGameContainer(
					"error",
					options.errors?.failedFetch ? options.errors.failedFetch : "Failed to fetch statement from API."
				),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	if (!statement) {
		return await msg.edit({
			components: [
				createGameContainer("error", options.errors?.noResult ? options.errors.noResult : "API returned no statement."),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	await msg.edit({
		components: [createGameContainer("active", statement)],
		flags: MessageFlags.IsComponentsV2,
	});

	const collector = msg.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: options.time || 60000,
	});

	collector.on("collect", async (interaction) => {
		if (interaction.user.id !== userId) {
			return interaction.reply({
				content: options.othersMessage
					? options.othersMessage.replace("{{author}}", userId)
					: `Only <@${userId}> can use the buttons!`,
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();

		if (interaction.customId === idYes) {
			collector.stop("yes");
			await msg.edit({
				components: [createGameContainer("yes", statement)],
				flags: MessageFlags.IsComponentsV2,
			});
		} else if (interaction.customId === idNo) {
			collector.stop("no");
			await msg.edit({
				components: [createGameContainer("no", statement)],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	});

	collector.on("end", async (_collected, reason) => {
		if (reason === "time") {
			try {
				await msg.edit({
					components: [createGameContainer("timeout", statement)],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {}
		}
	});
};

export default NeverHaveIEver;
