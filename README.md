<p align="center">
    <img width="100px" style="margin-bottom:-6px" src="./assets//logo.png" />
</p>
<h1 align="center">Weky</h1>
<p style="font-size:16px"><b>A fun npm package to play games within Discord with buttons!</b></p>
<br>
<p align="center">
    <img src="https://madewithlove.now.sh/gr?heart=true&template=for-the-badge" alt="Made with love in Greece">
    <img alt="Made with TypeScript" src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white">
    <br>
    <a href="https://www.npmjs.com/package/@m3rcena/weky">
      <img src="https://img.shields.io/npm/v/%40m3rcena%2Fweky?maxAge=3600&style=for-the-badge&logo=npm&logoColor=red" alt="NPM version" />
    </a>
    <a href="https://www.npmjs.com/package/@m3rcena/weky">
      <img src="https://img.shields.io/npm/d18m/%40m3rcena%2Fweky?maxAge=3600&style=for-the-badge&logo=npm&logoColor=red" alt="NPM downloads" />
    </a>
    <a href="https://m3rcena.gitbook.io/m3rcena-weky">
      <img src="https://img.shields.io/badge/Documation-%230288D1.svg?style=for-the-badge&logo=gitbook&logoColor=white" alt="Get Started Now">
    </a>
    <br>
    <a href="https://www.npmjs.com/package/@m3rcena/weky"><img src="https://nodei.co/npm/@m3rcena/weky.png?downloads=true&stars=true" alt="npm install lavalink-client" /></a>
</p>
<br><br>

# Install

Latest stable Version: **`v10.1.0`**

<details><summary>👉 via NPM</summary>

```bash
npm install --save @m3rcena/weky
```

</details>

# Documentation
Check out the [Documentation](https://m3rcena.gitbook.io/docs)

# Used in:
<a href="https://discord.com/users/1068868597398650971/"><img src="https://discord.c99.nl/widget/theme-3/1068868597398650971.png" /></a>

# Features
- 🧑 Beginner friendly

- 🎉 Easy to use

- 🔘 Discord Buttons

- 🤖 Supports Discord.js v14

- ✂ Fully Customizable

- and much more!

# Usage 📚

<details><summary>👉 CommonJS</summary>

```js
const { Client, GatewayIntentBits } = require("discord.js");

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
    client.wekyManager = new WekyManager(cl); // Initialize Weky Manager
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
});

client.login('Your bot Token');
```

</details>

<details><summary>👉 ESM (Module)</summary>

```ts
import { Client, GatewayIntentBits } from "discord.js";

import { WekyManager } from "@m3rcena/weky";

export interface ExtendedClient extends Client {
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
    client.wekyManager = new WekyManager(cl); // Initialize Weky Manager
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
            }
        })
    };
});

client.login("Your bot token");
```

</details>

# Result 📤
<img src="./assets//calculator.png">

# Contributing 🤝
- Contributions, issues and feature requests are welcome!
- Feel free to check [issues page](https://github.com/M3rcena/m3rcena-weky/issues)

# Support ❔
<iframe src="https://discord.com/widget?id=1224358764463783987&theme=dark" width="350" height="350" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>

# Developers 👨‍💻
<a href="https://discord.com/users/682983233851228161/"><img src="https://discord.c99.nl/widget/theme-3/682983233851228161.png" /></a>

# Contributors
<a href="https://discord.com/users/498094279793704991/"><img src="https://discord.c99.nl/widget/theme-3/498094279793704991.png" /></a><br>
<a href="https://discord.com/users/1139406664584409159/"><img src="https://discord.c99.nl/widget/theme-3/1139406664584409159.png" /></a><br>
<a href="https://discord.com/users/1072592763427754034/"><img src="https://discord.c99.nl/widget/theme-3/1072592763427754034.png" /></a>