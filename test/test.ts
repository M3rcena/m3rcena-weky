import { Client, Collection, GatewayIntentBits } from "discord.js";

import { WekyManager } from "@m3rcena/weky";

export interface ExtendedClient extends Client {
  commands: Collection<string, any>;
  wekyManager: WekyManager;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
}) as ExtendedClient;

client.on("ready", async (cl) => {
  console.log(`${cl.user.username} is ready`);
  client.wekyManager = new WekyManager(cl);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content === "w!calculator") {
    client.wekyManager.createCalculator({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Calculator | M3rcena Development",
      },
    });
  }

  if (msg.content === "w!chaoswords") {
    client.wekyManager.createChaosWords({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Chaos Words | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!fasttype") {
    client.wekyManager.createFastType({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Fast Type | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content.startsWith("w!fight")) {
    const opponent = msg.mentions.users.first();
    if (!opponent) return;
    client.wekyManager.createFight({
      message: msg,
      client: client,
      opponent: opponent,
      embed: {
        color: "Blurple",
        title: "Fight | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!lie-swatter") {
    client.wekyManager.createLieSwatter({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Lie Swatter | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!wyr") {
    client.wekyManager.createWouldYouRather({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Would You Rather | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!gtn") {
    client.wekyManager.createGuessTheNumber({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Guess The Number | M3rcena Development",
        timestamp: new Date(),
      },
      publicGame: true,
    });
  }

  if (msg.content === "w!wyptb") {
    client.wekyManager.createWillYouPressTheButton({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Will You Press The Button | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!quickclick") {
    client.wekyManager.createQuickClick({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Quick Click | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!nhie") {
    client.wekyManager.createNeverHaveIEver({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Never Have I Ever | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!hangman") {
    client.wekyManager.createHangman({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Hangman | M3rcena Development",
        timestamp: new Date(),
      },
    });
  }

  if (msg.content === "w!2048") {
    client.wekyManager.create2048({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "2048 | M3rcena Development",
      },
    });
  }

  if (msg.content === "w!shuffle") {
    client.wekyManager.createShuffleGuess({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Shuffle Guess | M3rcena Development",
      },
    });
  }

  if (msg.content === "w!snake") {
    client.wekyManager.createSnake({
      message: msg,
      client: client,
      embed: {
        color: "Blurple",
        title: "Snake | M3rcena Development",
      },
    });
  }
});

client.login("Your Token Here!");
