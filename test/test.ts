import { Client, Collection, GatewayIntentBits } from "discord.js";
import Calculator from "../src/Calculator";
import ChaosWords from "../src/ChaosWords";
import FastType from "../src/FastType";
import LieSwatter from "../src/LieSwatter";
import WouldYouRather from "../src/WouldYouRather";
import GuessTheNumber from "../src/GuessTheNumber";
import QuickClick from "../src/QuickClick";

export interface ExtendedClient extends Client {
    commands: Collection<string, any>;
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
    ]
}) as ExtendedClient;

client.on("ready", async () => {
    console.log("Bot is ready");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content === "!calculator") {
        Calculator({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Calculator | M3rcena Development",
                footer: {
					text: '©️ M3rcena Development'
				},
				timestamp: new Date(),
            }
        })
    };

    if (message.content === '!chaoswords') {
        ChaosWords({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Chaos Words | M3rcena Development",
                footer: {
                    text: '©️ M3rcena Development'
                },
                timestamp: new Date(),
            }
        })
    }

    if (message.content === "!fasttype") {
        FastType({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Fast Type | M3rcena Development",
                footer: {
                    text: '©️ M3rcena Development'
                },
                timestamp: new Date(),
            }
        })
    };

    if (message.content === "!lie-swatter") {
        LieSwatter({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Lie Swatter | M3rcena Development",
                footer: {
                    text: '©️ M3rcena Development'
                },
                timestamp: new Date(),
            }
        })
    };

    if (message.content === "!wyr") {
        WouldYouRather({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Lie Swatter | M3rcena Development",
                footer: {
                    text: '©️ M3rcena Development'
                },
                timestamp: new Date(),
            }
        })
    };

    if (message.content === "!gtn") {
        GuessTheNumber({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Guess The Number | M3rcena Development",
                footer: {
                    text: '©️ M3rcena Development'
                },
                timestamp: new Date(),
            },
            publicGame: true
        })
    };

    if (message.content === '!quickclick') {
        QuickClick({
            interaction: message,
            client: client,
            embed: {
                color: "Blurple",
                title: "Quick Click | M3rcena Development",
                footer: {
                    text: '©️ M3rcena Development'
                },
                timestamp: new Date(),
            }
        })
    };
});

client.login('TOKEN_HERE');