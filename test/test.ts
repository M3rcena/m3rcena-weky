import { Client, Collection, GatewayIntentBits } from "discord.js";

import { WekyManager } from "@m3rcena/weky";

export interface ExtendedClient extends Client {
    commands: Collection<string, any>;
    wekyManager: WekyManager;
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
}) as ExtendedClient;

client.on("ready", async (cl) => {
    console.log("Bot is ready");
    client.wekyManager = new WekyManager(cl);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content === "w!calculator") {
        client.wekyManager.createCalculator({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Calculator | M3rcena Development",
                timestamp: new Date(),
            }
        })
    };

    if (message.content === 'w!chaoswords') {
        client.wekyManager.createChaosWords({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Chaos Words | M3rcena Development",
                timestamp: new Date(),
            }
        })
    }

    if (message.content === "w!fasttype") {
        client.wekyManager.createFastType({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Fast Type | M3rcena Development",
                timestamp: new Date(),
            }
        })
    };

    if (message.content.startsWith("w!fight")) {
        const opponent = message.mentions.users.first();
        if (!opponent) return;
        client.wekyManager.createFight({
            interaction: message,
            client: client,
            opponent: opponent,
            embed: {
                color: "Blurple",
                title: "Fight | M3rcena Development",
                timestamp: new Date(),
            }
        })
    };

    if (message.content === "w!lie-swatter") {
        client.wekyManager.createLieSwatter({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Lie Swatter | M3rcena Development",
                timestamp: new Date(),
            }
        })
    };

    if (message.content === "w!wyr") {
        client.wekyManager.createWouldYouRather({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Lie Swatter | M3rcena Development",
                timestamp: new Date(),
            }
        })
    };

    if (message.content === "w!gtn") {
        client.wekyManager.createGuessTheNumber({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Guess The Number | M3rcena Development",
                timestamp: new Date(),
            },
            publicGame: true
        })
    };

    if (message.content === "w!wyptb") {
        client.wekyManager.createWillYouPressTheButton({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Will You Press The Button | M3rcena Development",
                timestamp: new Date(),
            }
        })
    };

    if (message.content === 'w!quickclick') {
        client.wekyManager.createQuickClick({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Quick Click | M3rcena Development",
                timestamp: new Date(),
            }
        })
    };

    if (message.content === 'w!nhie') {
        client.wekyManager.createNeverHaveIEver({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Never Have I Ever | M3rcena Development",
                timestamp: new Date(),
            },
        });
    };

    if (message.content === 'w!hangman') {
        client.wekyManager.createHangman({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Hangman | M3rcena Development",
                timestamp: new Date(),
            }
        });
    };

    if (message.content === 'w!2048') {
        client.wekyManager.create2048({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "2048 | M3rcena Development",
            }
        });
    };

    if (message.content === 'w!shuffle') {
        client.wekyManager.createShuffleGuess({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Shuffle Guess | M3rcena Development",
            }
        });
    };

    if (message.content === 'w!snake') {
        client.wekyManager.createSnake({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Snake | M3rcena Development",
            }
        });
    };
});

client.login("Your bot token");