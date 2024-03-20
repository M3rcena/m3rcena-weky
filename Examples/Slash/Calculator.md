# Example for Calculator

```js
await Calculator({
    message: interaction.message,
    embed: {
        title: interaction.options.getString('title'),
        color: interaction.options.getString('color'),
        footer: interaction.options.getString('footer'),
        timestamp: interaction.options.getBoolean('timestamp')
    },
    disabledQuery: interaction.options.getString('disabledQuery'),
    invalidQuery: interaction.options.getString('invalidQuery'),
    othersMessage: interaction.options.getString('otherMessage')
});
```