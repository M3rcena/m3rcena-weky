import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";
import { WekyManager } from "../src/index.js";

const TOKEN = process.env.DISCORD_TOKEN || "YOUR_BOT_TOKEN_HERE";
const CLIENT_ID = process.env.CLIENT_ID || "YOUR_CLIENT_ID_HERE";
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageTyping],
});

let weky: WekyManager;

// Define Slash Commands for all 17 Minigames
const commands = [
  new SlashCommandBuilder().setName("2048").setDescription("Play 2048 in Discord!"),
  new SlashCommandBuilder().setName("calculator").setDescription("Open the Scientific Calculator"),
  new SlashCommandBuilder().setName("chaoswords").setDescription("Play Chaos Words word-finder"),
  new SlashCommandBuilder()
    .setName("fasttype")
    .setDescription("Test your typing speed (WPM)")
    .addStringOption((opt) => opt.setName("difficulty").setDescription("Difficulty level").addChoices({ name: "Easy", value: "easy" }, { name: "Medium", value: "medium" }, { name: "Hard", value: "hard" })),
  new SlashCommandBuilder()
    .setName("fight")
    .setDescription("Challenge someone to an RPG turn-based duel!")
    .addUserOption((opt) => opt.setName("opponent").setDescription("Target opponent").setRequired(true)),
  new SlashCommandBuilder()
    .setName("gtn")
    .setDescription("Guess The Number")
    .addBooleanOption((opt) => opt.setName("public").setDescription("Allow everyone to guess?")),
  new SlashCommandBuilder().setName("gtp").setDescription("Who's That Pokémon? (Canvas Silhouette)"),
  new SlashCommandBuilder()
    .setName("hangman")
    .setDescription("Play Hangman with canvas gallows")
    .addStringOption((opt) => opt.setName("category").setDescription("Word Category").addChoices({ name: "Animals", value: "Animals" }, { name: "Countries", value: "Countries" }, { name: "Technology", value: "Technology" }, { name: "Gaming", value: "Gaming" }, { name: "Food", value: "Food" })),
  new SlashCommandBuilder().setName("lieswatter").setDescription("True or Lie rapid-fire trivia"),
  new SlashCommandBuilder().setName("nhie").setDescription("Never Have I Ever group voting"),
  new SlashCommandBuilder().setName("quickclick").setDescription("Test your reaction time in milliseconds"),
  new SlashCommandBuilder().setName("shuffle").setDescription("Unscramble the secret word"),
  new SlashCommandBuilder().setName("snake").setDescription("Play retro Snake arcade game!"),
  new SlashCommandBuilder().setName("wyptb").setDescription("Will You Press The Button?"),
  new SlashCommandBuilder().setName("wyr").setDescription("Would You Rather?"),
  new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock Paper Scissors")
    .addUserOption((opt) => opt.setName("opponent").setDescription("Opponent user (Leave blank for Bot)")),
  new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Play Tic Tac Toe 3x3 against a friend")
    .addUserOption((opt) => opt.setName("opponent").setDescription("Target opponent").setRequired(true)),
];

client.once(Events.ClientReady, async (c) => {
  console.log(`🎮 [Weky Bot] Logged in as ${c.user.tag}!`);

  weky = new WekyManager(c, {
    notifyUpdates: true,
    embedColor: "#5865F2",
    defaultTimeout: 60_000,
    unauthorizedMessage: "⛔ Only the game initiator can interact with these buttons!",
  });

  // Attach lifecycle event listeners
  weky.on("gameStart", ({ game, user, channelId }) => {
    console.log(`[Weky Event] 🟢 ${user?.username || "Unknown"} started minigame "${game}" in channel <#${channelId}>`);
  });

  weky.on("gameOver", ({ game, user, outcome, score, timeElapsed }) => {
    console.log(`[Weky Event] 🏁 ${user?.username || "Unknown"} finished "${game}" (outcome: ${outcome}, score: ${score}, elapsed: ${timeElapsed}ms)`);
  });

  weky.on("gameError", ({ game, error }) => {
    console.error(`[Weky Event] ❌ Error in "${game}":`, error);
  });

  weky.on("unauthorizedClick", ({ game, user }) => {
    console.warn(`[Weky Event] ⚠️ ${user?.username || "Someone"} clicked an unauthorized button on "${game}"`);
  });

  // Auto-register slash commands if credentials provided
  if (TOKEN !== "YOUR_BOT_TOKEN_HERE" && CLIENT_ID !== "YOUR_CLIENT_ID_HERE") {
    const rest = new REST({ version: "10" }).setToken(TOKEN);
    try {
      if (GUILD_ID) {
        console.log(`Registering slash commands to Guild ID: ${GUILD_ID}...`);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
          body: commands.map((cmd) => cmd.toJSON()),
        });
        console.log(`Successfully registered all 17 minigame slash commands to guild ${GUILD_ID}!`);
      } else {
        console.log("Registering global slash commands (may take up to 1 hour to propagate)...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands.map((cmd) => cmd.toJSON()),
        });
        console.log("Successfully registered all 17 minigame global slash commands!");
      }
    } catch (err) {
      console.error("Failed to register application commands:", err);
    }
  }
});

// Slash Command Handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === "2048") {
      await weky.create2048({ context: interaction });
    } else if (commandName === "calculator") {
      await weky.createCalculator({ context: interaction });
    } else if (commandName === "chaoswords") {
      await weky.createChaosWords({ context: interaction });
    } else if (commandName === "fasttype") {
      const difficulty = (interaction.options.getString("difficulty") as any) || "medium";
      await weky.createFastType({ context: interaction, difficulty });
    } else if (commandName === "fight") {
      const opponent = interaction.options.getUser("opponent", true);
      await weky.createFight({ context: interaction, opponent });
    } else if (commandName === "gtn") {
      const isPublic = interaction.options.getBoolean("public") ?? false;
      await weky.createGuessTheNumber({ context: interaction, publicGame: isPublic });
    } else if (commandName === "gtp") {
      await weky.createGuessThePokemon({ context: interaction });
    } else if (commandName === "hangman") {
      const category = interaction.options.getString("category") || undefined;
      await weky.createHangman({ context: interaction, category });
    } else if (commandName === "lieswatter") {
      await weky.createLieSwatter({ context: interaction });
    } else if (commandName === "nhie") {
      await weky.createNeverHaveIEver({ context: interaction });
    } else if (commandName === "quickclick") {
      await weky.createQuickClick({ context: interaction });
    } else if (commandName === "shuffle") {
      await weky.createShuffleGuess({ context: interaction });
    } else if (commandName === "snake") {
      await weky.createSnake({ context: interaction });
    } else if (commandName === "wyptb") {
      await weky.createWillYouPressTheButton({ context: interaction });
    } else if (commandName === "wyr") {
      await weky.createWouldYouRather({ context: interaction });
    } else if (commandName === "rps") {
      const opponent = interaction.options.getUser("opponent") || undefined;
      await weky.createRPS({ context: interaction, opponent });
    } else if (commandName === "tictactoe") {
      const opponent = interaction.options.getUser("opponent", true);
      await weky.createTicTacToe({ context: interaction, opponent });
    }
  } catch (err) {
    console.error(`Error executing /${commandName}:`, err);
  }
});

// Message (Prefix: "w!") Handler
client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot || !msg.content.startsWith("w!")) return;

  const args = msg.content.slice(2).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  try {
    if (command === "2048") await weky.create2048({ context: msg });
    if (command === "calculator" || command === "calc") await weky.createCalculator({ context: msg });
    if (command === "chaoswords" || command === "chaos") await weky.createChaosWords({ context: msg });
    if (command === "fasttype") await weky.createFastType({ context: msg });
    if (command === "fight") {
      const opponent = msg.mentions.users.first();
      if (!opponent) return msg.reply("Please mention an opponent to fight! e.g. `w!fight @User`");
      await weky.createFight({ context: msg, opponent });
    }
    if (command === "gtn") await weky.createGuessTheNumber({ context: msg, publicGame: true });
    if (command === "gtp") await weky.createGuessThePokemon({ context: msg });
    if (command === "hangman") await weky.createHangman({ context: msg });
    if (command === "lieswatter") await weky.createLieSwatter({ context: msg });
    if (command === "nhie") await weky.createNeverHaveIEver({ context: msg });
    if (command === "quickclick") await weky.createQuickClick({ context: msg });
    if (command === "shuffle") await weky.createShuffleGuess({ context: msg });
    if (command === "snake") await weky.createSnake({ context: msg });
    if (command === "wyptb") await weky.createWillYouPressTheButton({ context: msg });
    if (command === "wyr") await weky.createWouldYouRather({ context: msg });
    if (command === "rps") await weky.createRPS({ context: msg, opponent: msg.mentions.users.first() });
    if (command === "tictactoe" || command === "ttt") {
      const opponent = msg.mentions.users.first();
      if (!opponent) return msg.reply("Please mention an opponent! e.g. `w!ttt @User`");
      await weky.createTicTacToe({ context: msg, opponent });
    }
  } catch (err) {
    console.error(`Error executing w!${command}:`, err);
  }
});

if (TOKEN && TOKEN !== "YOUR_BOT_TOKEN_HERE") {
  client.login(TOKEN);
} else {
  console.log(`
ℹ️  No DISCORD_TOKEN provided.
To test the live bot interactively in Discord:
1. Create a .env file from .env.example:
   cp .env.example .env
2. Fill in your DISCORD_TOKEN, CLIENT_ID, and GUILD_ID (for instant slash commands).
3. Run:
   npm run test:bot
`);
}
