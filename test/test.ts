import { Client, Collection, GatewayIntentBits } from "discord.js";
import Calculator from "../src/Calculator";
import ChaosWords from "../src/ChaosWords";
import FastType from "../src/FastType";
import LieSwatter from "../src/LieSwatter";

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
});

client.login('TOKEN_HERE');