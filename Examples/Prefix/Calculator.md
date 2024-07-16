# Example for Calculator

### Common JS

```ts
const { Calculator } = require("@m3rcena/weky");
```

### ES Module

```ts
import { Calculator } from "@m3rcena/weky";
```

### Usage

```ts
await Calculator({
    interaction: message, // Your message on messageCreate.
    client: client, // Your Discord Client
    embed: {
        color: "Blurple", // Could be "Random"
        title: "Calculator | M3rcena Development",
        url: "https://m3rcena.gitbook.io/docs", // Optional
        author: { // Optional
            name: "My Author"
            icon_url: "https://github.com/M3rcena/m3rcena-weky/blob/main/assets/logo.png", // Optional
            url: "https://m3rcena.gitbook.io/docs" // Optional
        },
        description: "Custom Description", // Optional
        fields: {[ // Optional
            {
                name: `Test Field`,
                value: `Test Value`
            }
        ]},
        image: "https://github.com/M3rcena/m3rcena-weky/blob/main/assets/logo.png", // Optional
        timestamp: new Date(),
        footer: { // Footer is optional
			text: '©️ M3rcena Development',
            icon_url: "https://github.com/M3rcena/m3rcena-weky/blob/main/assets/logo.png" // Optional
		},
        thumbnail: "Updated at" // Optional
    },
    invalidQuery: "Invalid Number given", // Optional
    disabledQuery: "The calculator has been disabled" // Optional
});
```
