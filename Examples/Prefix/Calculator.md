# Example for Calculator

### Common js
```ts
const calculator = require('@m3rcena/weky');
```

### ES Module
```ts
import calculator from '@m3rcena/weky';
```

### Usage
```ts
await Calculator({
    interaction: message,
    client: client,
    embed: {
        color: "Blurple",
        title: "Calculator | M3rcena Development",
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
    invalidQuery: "Invalid Number given"
    disabledQuery: "The calculator has been disabled"
});
```