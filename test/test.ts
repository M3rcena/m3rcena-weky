import { Client, Collection, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

// Change this to "../src/index" if you are testing the package locally
import { WekyManager } from "@m3rcena/weky";

// --- CONFIGURATION ---
const CONFIG = {
	DISCORD_TOKEN: "YOUR_DISCORD_BOT_TOKEN_HERE",
	// Replace with your actual client ID (Right click bot -> Copy ID)
	CLIENT_ID: "YOUR_CLIENT_ID_HERE",
	// Replace with your Weky API key if required, or keep dummy if valid
	WEKY_API_KEY: "YOUR_WEKY_API_KEY_HERE",
};

export interface ExtendedClient extends Client {
	commands: Collection<string, any>;
	wekyManager: WekyManager;
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageTyping,
	],
}) as ExtendedClient;

// --- SLASH COMMAND DEFINITIONS ---
const commands = [
	new SlashCommandBuilder().setName("2048").setDescription("Play 2048"),
	new SlashCommandBuilder().setName("calculator").setDescription("Use the calculator"),
	new SlashCommandBuilder().setName("chaoswords").setDescription("Play Chaos Words"),
	new SlashCommandBuilder().setName("fasttype").setDescription("Play Fast Type"),
	new SlashCommandBuilder()
		.setName("fight")
		.setDescription("Fight someone")
		.addUserOption((opt) => opt.setName("opponent").setDescription("The user to fight").setRequired(true)),
	new SlashCommandBuilder().setName("gtn").setDescription("Guess The Number"),
	new SlashCommandBuilder().setName("gtp").setDescription("Guess The Pokemon"),
	new SlashCommandBuilder().setName("hangman").setDescription("Play Hangman"),
	new SlashCommandBuilder().setName("lieswatter").setDescription("Play Lie Swatter"),
	new SlashCommandBuilder().setName("nhie").setDescription("Never Have I Ever"),
	new SlashCommandBuilder().setName("quickclick").setDescription("Play Quick Click"),
	new SlashCommandBuilder().setName("shuffle").setDescription("Play Shuffle Guess"),
	new SlashCommandBuilder().setName("snake").setDescription("Play Snake"),
	new SlashCommandBuilder().setName("wyptb").setDescription("Will You Press The Button"),
	new SlashCommandBuilder().setName("wyr").setDescription("Would You Rather"),
];

// --- INITIALIZATION & REGISTRATION ---
client.on("ready", async (cl) => {
	console.log(`${cl.user.username} is ready`);

	// Initialize Weky Manager
	client.wekyManager = new WekyManager(cl, CONFIG.WEKY_API_KEY, false);
	client.wekyManager.NetworkManager.init();

	// Initialize Network Manager (if required by your version)
	// client.wekyManager.NetworkManager.init();

	// Register Slash Commands
	const rest = new REST({ version: "10" }).setToken(CONFIG.DISCORD_TOKEN);

	try {
		console.log("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), {
			body: commands,
		});
		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error("Error registering commands:", error);
	}
});

// --- SLASH COMMAND HANDLER ---
client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	try {
		if (commandName === "2048") {
			await client.wekyManager.create2048({
				context: interaction,
				embed: { color: "Blurple", title: "2048 | M3rcena" },
			});
		}

		if (commandName === "calculator") {
			await client.wekyManager.createCalculator({
				context: interaction,
				embed: { color: "Blurple" },
			});
		}

		if (commandName === "chaoswords") {
			await client.wekyManager.createChaosWords({
				context: interaction,
				embed: { color: "Blurple", title: "Chaos Words | M3rcena" },
			});
		}

		if (commandName === "fasttype") {
			await client.wekyManager.createFastType({
				context: interaction,
				embed: { color: "Blurple", title: "Fast Type | M3rcena" },
			});
		}

		if (commandName === "fight") {
			const user = interaction.options.getUser("opponent");
			const opponent = await interaction.guild?.members.fetch(user!.id);
			if (opponent) {
				await client.wekyManager.createFight({
					context: interaction,
					opponent: opponent,
				});
			}
		}

		if (commandName === "gtn") {
			await client.wekyManager.createGuessTheNumber({
				context: interaction,
				embed: { color: "Blurple", title: "Guess The Number | M3rcena" },
				publicGame: true,
			});
		}

		if (commandName === "gtp") {
			await client.wekyManager.createGuessThePokemon({
				context: interaction,
				embed: { color: "Blurple", title: "Guess The Pokemon | M3rcena" },
			});
		}

		if (commandName === "hangman") {
			await client.wekyManager.createHangman({
				context: interaction,
				embed: { color: "Blurple", title: "Hangman | M3rcena" },
			});
		}

		if (commandName === "lieswatter") {
			await client.wekyManager.createLieSwatter({
				context: interaction,
				embed: { color: "Blurple", title: "Lie Swatter | M3rcena" },
			});
		}

		if (commandName === "nhie") {
			await client.wekyManager.createNeverHaveIEver({
				context: interaction,
				embed: { color: "Blurple", title: "Never Have I Ever | M3rcena" },
			});
		}

		if (commandName === "quickclick") {
			await client.wekyManager.createQuickClick({
				context: interaction,
				embed: { title: "Quick Click | M3rcena" },
			});
		}

		if (commandName === "shuffle") {
			await client.wekyManager.createShuffleGuess({
				context: interaction,
				embed: { color: "Blurple", title: "Shuffle Guess | M3rcena" },
			});
		}

		if (commandName === "snake") {
			await client.wekyManager.createSnake({
				context: interaction,
				embed: { color: "Blurple", title: "Snake | M3rcena" },
			});
		}

		if (commandName === "wyptb") {
			await client.wekyManager.createWillYouPressTheButton({
				context: interaction,
				embed: { color: "Blurple", title: "Will You Press The Button | M3rcena" },
			});
		}

		if (commandName === "wyr") {
			await client.wekyManager.createWouldYouRather({
				context: interaction,
				embed: { color: "Blurple", title: "Would You Rather | M3rcena" },
			});
		}
	} catch (err) {
		console.error("Error starting game:", err);
		if (!interaction.replied) interaction.reply({ content: "Failed to start game.", ephemeral: true });
	}
});

// --- MESSAGE COMMAND HANDLER ---
client.on("messageCreate", async (msg) => {
	if (msg.author.bot) return;

	if (msg.content === "w!2048") {
		client.wekyManager.create2048({
			context: msg,
			embed: { title: "2048 | M3rcena Development", color: "Blurple" },
		});
	}

	if (msg.content === "w!calculator") {
		client.wekyManager.createCalculator({
			context: msg,
			embed: { color: "Blurple" },
		});
	}

	if (msg.content === "w!chaoswords") {
		client.wekyManager.createChaosWords({
			context: msg,
			embed: { color: "Blurple", title: "Chaos Words | M3rcena Development" },
		});
	}

	if (msg.content === "w!fasttype") {
		client.wekyManager.createFastType({
			context: msg,
			embed: { color: "Blurple", title: "Fast Type | M3rcena Development" },
		});
	}

	if (msg.content.startsWith("w!fight")) {
		const opponent = msg.mentions.users.first();
		if (!opponent) return;

		const guildOpponent = await msg.guild?.members.fetch(opponent.id);
		if (!guildOpponent) return;

		client.wekyManager.createFight({
			context: msg,
			opponent: guildOpponent,
		});
	}

	if (msg.content === "w!gtn") {
		client.wekyManager.createGuessTheNumber({
			context: msg,
			embed: { color: "Blurple", title: "Guess The Number | M3rcena Development" },
			publicGame: true,
		});
	}

	if (msg.content === "w!gtp") {
		client.wekyManager.createGuessThePokemon({
			context: msg,
			embed: { color: "Blurple", title: "Guess The Pokemon | M3rcena Development" },
		});
	}

	if (msg.content === "w!hangman") {
		client.wekyManager.createHangman({
			context: msg,
			embed: { color: "Blurple", title: "Hangman | M3rcena Development" },
		});
	}

	if (msg.content === "w!lie-swatter") {
		client.wekyManager.createLieSwatter({
			context: msg,
			embed: { color: "Blurple", title: "Lie Swatter | M3rcena Development" },
		});
	}

	if (msg.content === "w!nhie") {
		client.wekyManager.createNeverHaveIEver({
			context: msg,
			embed: { color: "Blurple", title: "Never Have I Ever | M3rcena Development" },
		});
	}

	if (msg.content === "w!quickclick") {
		client.wekyManager.createQuickClick({
			context: msg,
			embed: { title: "Quick Click | M3rcena Development" },
		});
	}

	if (msg.content === "w!shuffle") {
		client.wekyManager.createShuffleGuess({
			context: msg,
			embed: { color: "Blurple", title: "Shuffle Guess | M3rcena Development" },
		});
	}

	if (msg.content === "w!snake") {
		client.wekyManager.createSnake({
			context: msg,
			embed: { color: "Blurple", title: "Snake | M3rcena Development" },
		});
	}

	if (msg.content === "w!wyptb") {
		client.wekyManager.createWillYouPressTheButton({
			context: msg,
			embed: { color: "Blurple", title: "Will You Press The Button | M3rcena Development" },
		});
	}

	if (msg.content === "w!wyr") {
		client.wekyManager.createWouldYouRather({
			context: msg,
			embed: { color: "Blurple", title: "Would You Rather | M3rcena Development" },
		});
	}
});

client.login(CONFIG.DISCORD_TOKEN);
