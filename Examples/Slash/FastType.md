# Example for Fast Type

```js
await FastType({
    message: interaction.message,
    embed: {
        title: interaction.options.getString('title'),
        description: interaction.options.getString('description'),
        color: interaction.options.getString('color'),
        footer: interaction.options.getString('footer'),
        timestamp: interaction.options.getBoolean('timestamp')
    },
    sentence: interaction.options.getString('sentence'),
    winMessage: interaction.options.getString('winMessage'),
    loseMessage: interaction.options.getString('loseMessage'),
    cancelMessage: interaction.options.getString('cancelMessage'),
    time: interaction.options.getInteger('time'),
    buttonText: interaction.options.getString('buttonText'),
    othersMessage: interaction.options.getString('othersMessage')
});
```