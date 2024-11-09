const { Client, Collection, GatewayIntentBits } = require("discord.js");

const { WekyManager }= require("@m3rcena/weky");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

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
});

client.login('Your bot token');