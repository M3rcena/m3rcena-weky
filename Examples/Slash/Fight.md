# Example for Fight

```js
await Fight({
    message: interaction.message,
    opponent: interaction.message.mentions.users.first(),
    embed: {
        title: interaction.options.getString('title'),
        color: interaction.options.getString('color'),
        footer: interaction.options.getString('footer'),
        timestamp: interaction.options.getBoolean('timestamp')
    },
    buttons: {
      hit: interaction.options.getString('hit'),
      heal: interaction.options.getString('heal'),
      cancel: interaction.options.getString('cancel'),
      accept: interaction.options.getString('accept'),
      deny: interaction.options.getString('deny')
    },
    acceptMessage: interaction.options.getString('acceptMessage'),
    winMessage: interaction.options.getString('winMessage'),
    endMessage: interaction.options.getString('endMessage'),
    cancelMessage: interaction.options.getString('cancelMessage'),
    fightMessage: interaction.options.getString('fightMessage'),
    opponentsTurnMessage: interaction.options.getString('opponentsTurnMessage'),
    highHealthMessage: interaction.options.getString('highHealthMessage'),
    lowHealthMessage: interaction.options.getString('lowHealthMessage'),
    returnWinner: interaction.options.getBoolean('returnWinner'),
    othersMessage: interaction.options.getString('othersMessage')
});
```