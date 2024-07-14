# Example for ChaosWords

### Common js
```ts
const { ChaosWords } = require('@m3rcena/weky');
```

### ES Module
```ts
import { ChaosWords } from '@m3rcena/weky';
```

### Usage
```ts
await ChaosWords({
    interaction: message,
    client: client,
    embed: {
        color: "Blurple",
        title: "ChaosWords | M3rcena Development",
        // Optional
        url: "https://m3rcena.gitbook.io/docs"
        author: {
            name: "My Author"
            // Optional
            icon_url: "https://github.com/M3rcena/m3rcena-weky/blob/main/assets/logo.png"
            url: "https://m3rcena.gitbook.io/docs"
        },
        description: "Custom Description",
        fields: {[
            {
                name: `Test Field`,
                value: `Test Value`
            }
        ]},
        image: "https://github.com/M3rcena/m3rcena-weky/blob/main/assets/logo.png",
        timestamp: new Date()
        footer: {
			text: '©️ M3rcena Development'
            // Optional
            icon_url: "https://github.com/M3rcena/m3rcena-weky/blob/main/assets/logo.png"
		},
        thumbnail: "Updated at"
    },
    // Optional
    winMessage: "You just won",
    loseMessage: "Better luck next time!",
    wrongWord: "You provided wrong word",
    correctWord: "That was correct",
    time: 120000,
    words: ["Apple", "Banana"],
    charGenerated: 320,
    startMessage: "Lets begin!",
    endMessage: "Game Over!",
    maxTries: 10,
    buttonText: "Cancel",
    otherMessage: "This is not your game!"
});
```