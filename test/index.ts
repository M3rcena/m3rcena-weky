import { AttachmentBuilder, Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";
import { WekyManager } from "../src/index.js";

const TOKEN = process.env.DISCORD_TOKEN || "YOUR_BOT_TOKEN_HERE";
const CLIENT_ID = process.env.CLIENT_ID || "YOUR_CLIENT_ID_HERE";
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageTyping],
});

let weky: WekyManager;

// Define Slash Commands for all Minigames + v14.28 Features
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
    .setDescription("Play Tic Tac Toe 3x3 against a friend or AI")
    .addUserOption((opt) => opt.setName("opponent").setDescription("Target opponent (leave blank for AI)"))
    .addStringOption((opt) => opt.setName("difficulty").setDescription("AI Difficulty").addChoices({ name: "Easy", value: "easy" }, { name: "Medium", value: "medium" }, { name: "Hard", value: "hard" }, { name: "Unbeatable", value: "unbeatable" })),
  new SlashCommandBuilder().setName("arcade").setDescription("Launch the Central Arcade Hub Cabinet!"),
  new SlashCommandBuilder()
    .setName("boss")
    .setDescription("Duel an RPG Boss in solo combat!")
    .addStringOption((opt) => opt.setName("boss").setDescription("Select Boss").addChoices({ name: "Dragon Sovereign", value: "dragon" }, { name: "Cyber Knight", value: "cyber_knight" }, { name: "Shadow Goblin", value: "shadow_goblin" })),
  new SlashCommandBuilder()
    .setName("tournament")
    .setDescription("Start a tournament championship (4 to 8 players, automated or manual)")
    .addStringOption((opt) =>
      opt
        .setName("game")
        .setDescription("Tournament Game")
        .addChoices(
          { name: "Tic Tac Toe", value: "tictactoe" },
          { name: "Rock Paper Scissors", value: "rps" },
          { name: "Fight RPG", value: "fight" },
          { name: "Custom / Manual (Any Game)", value: "custom" }
        )
        .setRequired(true)
    )
    .addUserOption((opt) => opt.setName("player1").setDescription("Participant 1").setRequired(true))
    .addUserOption((opt) => opt.setName("player2").setDescription("Participant 2").setRequired(true))
    .addUserOption((opt) => opt.setName("player3").setDescription("Participant 3").setRequired(true))
    .addUserOption((opt) => opt.setName("player4").setDescription("Participant 4 (or omit to include yourself as the 4th player)"))
    .addUserOption((opt) => opt.setName("player5").setDescription("Participant 5 (optional for 8-player bracket)"))
    .addUserOption((opt) => opt.setName("player6").setDescription("Participant 6 (optional for 8-player bracket)"))
    .addUserOption((opt) => opt.setName("player7").setDescription("Participant 7 (optional for 8-player bracket)"))
    .addUserOption((opt) => opt.setName("player8").setDescription("Participant 8 (optional for 8-player bracket)"))
    .addStringOption((opt) => opt.setName("custom_game").setDescription("Name of custom discipline if Custom/Manual chosen (e.g. Chess, Smash)"))
    .addBooleanOption((opt) => opt.setName("manual").setDescription("Enable manual winner progression by organizer")),
  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the Arcade Leaderboard & High-Score poster!")
    .addStringOption((opt) => opt.setName("game").setDescription("Game or category").addChoices({ name: "Global ELO", value: "elo" }, { name: "Retro Snake", value: "snake" }, { name: "2048 Arcade", value: "2048" }, { name: "Fast Type", value: "fasttype" })),
  new SlashCommandBuilder()
    .setName("share")
    .setDescription("Generate a collectible holographic Gamer Scorecard!")
    .addStringOption((opt) => opt.setName("game").setDescription("Game name").addChoices({ name: "Retro Snake", value: "Retro Snake" }, { name: "Fight Arena", value: "Fight Arena" }, { name: "2048 Arcade", value: "2048 Arcade" }, { name: "Tic Tac Toe", value: "Tic Tac Toe" }))
    .addStringOption((opt) => opt.setName("score").setDescription("Primary score (e.g. 24,500 PTS or VICTORY)"))
    .addStringOption((opt) => opt.setName("tier").setDescription("Rank tier (e.g. GRANDMASTER or DIAMOND)")),
  new SlashCommandBuilder()
    .setName("soundboard")
    .setDescription("Test Discord Soundboard audio playback")
    .addStringOption((opt) => opt.setName("sound").setDescription("Soundboard Sound ID (or leave blank for test sound)")),
];

client.once(Events.ClientReady, async (c) => {
  console.log(`🎮 [Weky Bot] Logged in as ${c.user.tag}!`);

  weky = new WekyManager(c, {
    notifyUpdates: true,
    embedColor: "#5865F2",
    defaultTimeout: 60_000,
    unauthorizedMessage: "⛔ Only the game initiator can interact with these buttons!",
    soundboard: {
      enabled: true,
      sounds: {
        victory: "1234567890",
        defeat: "9876543210",
      },
    },
    leaderboard: {
      defaultElo: 1200,
      kFactor: 32,
    },
  });

  // Attach lifecycle event listeners
  weky.on("gameStart", ({ game, user, channelId }) => {
    console.log(`[Weky Event] 🟢 ${user?.username || "Unknown"} started minigame "${game}" in channel <#${channelId}>`);
  });

  weky.on("gameOver", async ({ game, user, outcome, score, timeElapsed }) => {
    console.log(`[Weky Event] 🏁 ${user?.username || "Unknown"} finished "${game}" (outcome: ${outcome}, score: ${score}, elapsed: ${timeElapsed}ms)`);
    if (user) {
      const avatarUrl = user.displayAvatarURL ? user.displayAvatarURL({ extension: "png" }) : undefined;
      const player = await weky.leaderboard.getPlayer(user.id, user.username, avatarUrl);

      if (typeof score === "number" && score > 0) {
        await weky.leaderboard.recordScore(user.id, game, score, {
          username: user.username,
          avatarUrl,
        });
      }

      if (outcome === "WIN" || outcome === "won") {
        player.wins++;
        player.winStreak++;
        if (player.winStreak > player.highestStreak) player.highestStreak = player.winStreak;
        player.elo += 25;
      } else if (outcome === "TIMEOUT" || outcome === "gameover" || outcome === "SURRENDER") {
        player.losses++;
        player.winStreak = 0;
        player.elo = Math.max(100, player.elo - 15);
      }
    }
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
        console.log(`Successfully registered all minigame & v14.28 slash commands to guild ${GUILD_ID}!`);
      } else {
        console.log("Registering global slash commands (may take up to 1 hour to propagate)...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands.map((cmd) => cmd.toJSON()),
        });
        console.log("Successfully registered all minigame & v14.28 global slash commands!");
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
      const opponent = interaction.options.getUser("opponent") || undefined;
      const difficulty = (interaction.options.getString("difficulty") as any) || "unbeatable";
      await weky.createTicTacToe({ context: interaction, opponent, ai: !opponent, difficulty });
    } else if (commandName === "arcade") {
      await weky.createArcadeHub({ context: interaction });
    } else if (commandName === "boss") {
      const boss = interaction.options.getString("boss") || "dragon";
      await weky.createFight({ context: interaction, ai: true, boss: boss as any });
    } else if (commandName === "tournament") {
      const selectedGame = interaction.options.getString("game") || "tictactoe";
      const customGame = interaction.options.getString("custom_game") || undefined;
      const isManual = interaction.options.getBoolean("manual") || selectedGame === "custom";
      const finalGame = selectedGame === "custom" ? (customGame || "Custom Tournament") : selectedGame;

      const p1 = interaction.options.getUser("player1", true);
      const p2 = interaction.options.getUser("player2", true);
      const p3 = interaction.options.getUser("player3", true);
      const p4 = interaction.options.getUser("player4");
      const p5 = interaction.options.getUser("player5");
      const p6 = interaction.options.getUser("player6");
      const p7 = interaction.options.getUser("player7");
      const p8 = interaction.options.getUser("player8");

      let players: User[] = [];
      if (p4) {
        players = [p1, p2, p3, p4];
        if (p5) players.push(p5);
        if (p6) players.push(p6);
        if (p7) players.push(p7);
        if (p8) players.push(p8);
      } else {
        players = [interaction.user, p1, p2, p3];
      }

      await weky.createTournament({
        context: interaction,
        game: finalGame,
        players,
        title: `${finalGame.toUpperCase()} Championship`,
        manual: isManual,
      });
    } else if (commandName === "leaderboard") {
      const game = (interaction.options.getString("game") || "elo").toLowerCase();
      const user = interaction.user;
      const avatarUrl = user.displayAvatarURL ? user.displayAvatarURL({ extension: "png" }) : undefined;

      // Ensure caller is registered in real data
      await weky.leaderboard.getPlayer(user.id, user.username, avatarUrl);

      let entries: any[] = [];

      if (game === "elo") {
        const topElo = await weky.leaderboard.getTopByElo(10);
        entries = topElo.map((p, idx) => ({
          rank: idx + 1,
          userId: p.id,
          username: p.username,
          avatarUrl: p.avatarUrl,
          scoreOrElo: `${p.elo} ELO`,
          stats: `${p.wins}W - ${p.losses}L`,
          streak: p.winStreak,
        }));
      } else {
        const topScore = await weky.leaderboard.getTopByScore(game, 10);
        if (topScore.length > 0) {
          entries = topScore.map((entry) => ({
            rank: entry.rank,
            userId: entry.player.id,
            username: entry.player.username,
            avatarUrl: entry.player.avatarUrl,
            scoreOrElo: `${entry.score.toLocaleString()} PTS`,
            streak: entry.player.winStreak,
          }));
        } else {
          const p = await weky.leaderboard.getPlayer(user.id, user.username, avatarUrl);
          const s = p.scores[game] || 0;
          entries = [
            {
              rank: 1,
              userId: p.id,
              username: p.username,
              avatarUrl: p.avatarUrl,
              scoreOrElo: `${s.toLocaleString()} PTS`,
              streak: p.winStreak,
            },
          ];
        }
      }

      const buffer = await weky.renderLeaderboard({
        title: "ARCADE CHAMPIONSHIP",
        subtitle: game === "elo" ? "TOP PLAYERS • GLOBAL ELO" : `TOP SCORES • ${game.toUpperCase()}`,
        entries,
      });
      const file = new AttachmentBuilder(buffer, { name: "leaderboard.png" });
      await interaction.reply({
        content: `🏆 **Weky Arcade Leaderboard** (${game.toUpperCase()})`,
        files: [file],
      });
    } else if (commandName === "share") {
      const user = interaction.user;
      const avatarUrl = user.displayAvatarURL ? user.displayAvatarURL({ extension: "png" }) : undefined;
      const player = await weky.leaderboard.getPlayer(user.id, user.username, avatarUrl);

      const chosenGame = interaction.options.getString("game") || "Arcade Duel";
      const gameKey = chosenGame.toLowerCase().replace(/[^a-z0-9]/g, "");
      const gameScore = player.scores[gameKey] || player.scores["snake"] || player.scores["2048"] || player.scores["fasttype"];

      const primaryScore = interaction.options.getString("score") || (gameScore ? `${gameScore.toLocaleString()} PTS` : `${player.elo} ELO`);

      let tier = "ARCADE PRO";
      if (player.elo >= 1500) tier = "GRANDMASTER";
      else if (player.elo >= 1350) tier = "DIAMOND TIER";
      else if (player.elo >= 1250) tier = "GOLD TIER";

      const rankBadge = interaction.options.getString("tier") || tier;
      const totalMatches = player.wins + player.losses;
      const winRate = totalMatches > 0 ? `${Math.round((player.wins / totalMatches) * 100)}%` : "100%";

      const stats = [
        { label: "ELO RATING", value: `${player.elo} ELO`, color: "#00f7ff" },
        { label: "RECORD", value: `${player.wins}W / ${player.losses}L`, color: "#57f287" },
        { label: "WIN STREAK", value: `${player.winStreak} STREAK`, color: "#ff8c38" },
        { label: "WIN RATE", value: winRate, color: "#ffd700" },
      ];

      const buffer = await weky.renderShareCard({
        username: player.username,
        avatarUrl: player.avatarUrl,
        gameName: chosenGame,
        headline: player.winStreak > 2 ? "WIN STREAK ON FIRE!" : "OFFICIAL MATCH SCORECARD",
        primaryScore,
        rankBadge,
        stats,
      });
      const file = new AttachmentBuilder(buffer, { name: "gamer-card.png" });
      await interaction.reply({
        content: `🎟️ **${player.username}'s Gamer Scorecard**`,
        files: [file],
      });
    } else if (commandName === "soundboard") {
      const member = interaction.member as any;
      const voiceChannel = member?.voice?.channel;

      if (!voiceChannel) {
        await interaction.reply({
          content: "⚠️ **Voice Channel Required:**\n> Discord soundboard sounds play exclusively inside **Voice Channels**.\n> Please join any voice channel in this server, then run `/soundboard` again to hear it live!",
        });
        return;
      }

      // Default to "2" which is Discord's official built-in Airhorn
      const soundId = interaction.options.getString("sound") || "2";
      const result = await weky.soundboard.playSoundWithResult(voiceChannel.id, soundId);

      if (result.success) {
        await interaction.reply({
          content: `🔊 **Soundboard sound dispatched to <#${voiceChannel.id}>!**\n> Playing sound ID \`${result.soundId}\` (${result.soundId === "2" ? "Official Discord Airhorn" : result.soundId === "1" ? "Official Discord Quack" : "Custom Sound"})!`,
        });
      } else {
        await interaction.reply({
          content: `❌ **Soundboard Notice:**\n> Reason: \`${result.error}\`\n> Target Voice Channel: <#${voiceChannel.id}>\n> **Tip:** Ensure the bot has **Use Soundboard** and **Send Soundboard Sounds** permissions in this server.`,
        });
      }
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
      await weky.createTicTacToe({ context: msg, opponent, ai: !opponent });
    }
    if (command === "arcade") await weky.createArcadeHub({ context: msg });
    if (command === "boss") await weky.createFight({ context: msg, ai: true, boss: (args[0] as any) || "dragon" });
    if (command === "tournament" || command === "tourn") {
      const mentions = Array.from(msg.mentions.users.values());
      let participants = mentions;
      if (mentions.length === 3) {
        participants = [msg.author, ...mentions];
      }
      if (participants.length < 4) {
        return msg.reply("Please mention at least 3 other players for a 4-player tournament (or mention 4 to 8 players)! e.g. `w!tournament @User1 @User2 @User3` or `w!tournament @P1 @P2 @P3 @P4`");
      }
      const rawArg = (args[0] || "tictactoe").toLowerCase();
      const isManual = rawArg === "manual" || rawArg === "custom";
      const game = isManual ? (args[1] || "Custom Tournament") : rawArg;
      await weky.createTournament({ context: msg, game, players: participants.slice(0, 8), title: `${game.toUpperCase()} Championship`, manual: isManual });
    }
    if (command === "leaderboard" || command === "lb") {
      const user = msg.author;
      const avatarUrl = user.displayAvatarURL ? user.displayAvatarURL({ extension: "png" }) : undefined;
      await weky.leaderboard.getPlayer(user.id, user.username, avatarUrl);
      const topElo = await weky.leaderboard.getTopByElo(10);
      const entries = topElo.map((p, idx) => ({
        rank: idx + 1,
        username: p.username,
        avatarUrl: p.avatarUrl,
        scoreOrElo: `${p.elo} ELO`,
        stats: `${p.wins}W - ${p.losses}L`,
        streak: p.winStreak,
      }));
      const buffer = await weky.renderLeaderboard({
        title: "ARCADE CHAMPIONSHIP",
        subtitle: "TOP PLAYERS • GLOBAL ELO",
        entries,
      });
      const file = new AttachmentBuilder(buffer, { name: "leaderboard.png" });
      await msg.reply({ content: "🏆 **Weky Arcade Leaderboard**", files: [file] });
    }
    if (command === "share") {
      const user = msg.author;
      const avatarUrl = user.displayAvatarURL ? user.displayAvatarURL({ extension: "png" }) : undefined;
      const player = await weky.leaderboard.getPlayer(user.id, user.username, avatarUrl);
      const gameName = args[0] || "Retro Snake";
      const gameKey = gameName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const gameScore = player.scores[gameKey] || player.scores["snake"] || player.scores["2048"];
      const primaryScore = gameScore ? `${gameScore.toLocaleString()} PTS` : `${player.elo} ELO`;
      const buffer = await weky.renderShareCard({
        username: player.username,
        avatarUrl: player.avatarUrl,
        gameName,
        headline: player.winStreak > 2 ? "WIN STREAK ON FIRE! 🔥" : "MATCH SCORECARD 🏆",
        primaryScore,
        rankBadge: player.elo >= 1350 ? "DIAMOND TIER" : "ARCADE PRO",
        stats: [
          { label: "ELO RATING", value: `${player.elo} ELO`, color: "#00f7ff" },
          { label: "RECORD", value: `${player.wins}W / ${player.losses}L`, color: "#57f287" },
          { label: "WIN STREAK", value: `${player.winStreak} STREAK 🔥`, color: "#ff8c38" },
          { label: "STATUS", value: "VERIFIED ✔", color: "#ffd700" },
        ],
      });
      const file = new AttachmentBuilder(buffer, { name: "share-card.png" });
      await msg.reply({ content: `🎟️ **${msg.author.username}'s Gamer Scorecard**`, files: [file] });
    }
    if (command === "soundboard" || command === "sound") {
      const member = msg.member;
      const voiceChannel = member?.voice?.channel;
      if (!voiceChannel) {
        return msg.reply("⚠️ Please join a **Voice Channel** first to test soundboard playback! e.g. join General and type `w!soundboard`");
      }
      const soundId = args[0] || "2"; // Default Airhorn
      const res = await weky.soundboard.playSoundWithResult(voiceChannel.id, soundId);
      if (res.success) {
        await msg.reply(`🔊 Playing soundboard sound ID \`${soundId}\` in <#${voiceChannel.id}>!`);
      } else {
        await msg.reply(`❌ Soundboard Error: \`${res.error}\` in <#${voiceChannel.id}>!`);
      }
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
