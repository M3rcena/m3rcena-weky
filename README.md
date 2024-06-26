<p align="center"><img width="100px"
   style="margin-bottom:-6px" src="https://cdn.discordapp.com/avatars/809496186905165834/7dbf02cb782c7111b817f329cac0257a.png" /></p>
<h1 align="center">Weky</h1>
<p align="center">
   <a href="https://www.npmjs.com/package/@m3rcena/weky"><img src="https://img.shields.io/npm/v/%40m3rcena%2Fweky" /></a>
   <a href="https://m3rcena.gitbook.io/docs/"><img src="https://img.shields.io/badge/Documentation-Yes-amiajokegreen.svg?style=flat-square" /></a>
   <a href="https://github.com/M3rcena/m3rcena-weky/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/%40m3rcena%2Fweky" /></a>
   <br>
   <a href="https://www.npmjs.com/package/@m3rcena/weky"><img src="https://nodei.co/npm/@m3rcena/weky.png?downloadRank=true&downloads=true&downloadRank=true&stars=true" /></a>
</p>

## What is weky?
- A fun npm package to play games within Discord with buttons!
- looking for examples? click here: [Examples](https://github.com/M3rcena/m3rcena-weky/tree/main/Examples)

## Features
- 🧑 Beginner friendly
- 🎉 Easy to use
- ✨ Simple
- 🔘 Discord Buttons
- 🤖 Supports Discord.js V14
- and much more!

## Install the package 📥
```sh
npm install @m3rcena/weky
```

## Example ✏️

#### Discord.js v14.0.0

### Common-JS
```js
const Discord = require('discord.js');
const client = new Discord.Client();
const { Calculator } = require('@m3rcena/weky/dist/index.js'); // temporary

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
	if (message.content === '!calculator') {
		await Calculator({
			message: message,
			embed: {
				title: 'Calculator | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true,
			},
			disabledQuery: 'Calculator is disabled!',
			invalidQuery: 'The provided equation is invalid!',
			othersMessage: 'Only <@{{author}}> can use the buttons!',
		});
	}
});

client.login('DISCORD_BOT_TOKEN');
```

### Module:
```mjs
import Discord from 'discord.js';
const client = new Discord.Client();
import { Calculator } from '@m3rcena/weky/';

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
	if (message.content === '!calculator') {
		await Calculator({
			message: message,
			embed: {
				title: 'Calculator | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true,
			},
			disabledQuery: 'Calculator is disabled!',
			invalidQuery: 'The provided equation is invalid!',
			othersMessage: 'Only <@{{author}}> can use the buttons!',
		});
	}
});

client.login('DISCORD_BOT_TOKEN');
```

## Result 📤
<img src="https://i.imgur.com/DEdhHHd.png">

## Contributing 🤝
- Contributions, issues and feature requests are welcome!
- Feel free to check **[issues page](https://github.com/M3rcena/m3rcena-weky/issues)**.

## Developers 👨‍💻
- **[Face#5454](https://github.com/face-hh)**
- **[Sujal Goel#7602](https://github.com/sujalgoel)**
- **[rayz#4986](https://github.com/rayzdev)**
- **[d4rk.s0ul](https://github.com/M3rcena)**

## Discord 📰
<img src="https://discordapp.com/api/guilds/1224358764463783987/widget.png?style=banner4" alt="Discord"/>
