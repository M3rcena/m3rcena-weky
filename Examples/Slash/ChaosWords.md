# Example for Chaos Words

```js
await ChaosWords({
    message: interaction.message,
    embed: {
        title: interaction.options.getString('title'),
        description: interaction.options.getString('description'),
        color: interaction.options.getString('color'),
        field1: interaction.options.getString('field1'),
        field2: interaction.options.getString('field2'),
        field3: interaction.options.getString('field3'),
        field4: interaction.options.getString('field4'),
        footer: interaction.options.getString('footer'),
        timestamp: interaction.options.getBoolean('timestamp')
    },
    winMessage: interaction.options.getString('winMessage'),
    loseMessage: interaction.options.getString('loseMessage'),
    wrongWordMessage: interaction.options.getString('wrongWordMessage'),
    correctWordMessage: interaction.options.getString('correctWordMessage'),
    time: interaction.options.getInteger('time'),
    words: interaction.options.getString('words').split(','),
    charGenerated: interaction.options.getInteger('charGenerated'),
    maxTries: interaction.options.getInteger('maxTries'),
    buttonText: interaction.options.getString('button'),
    othersMessage: interaction.options.getString('othersMessage')
});
```