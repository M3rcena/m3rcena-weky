# Example for Guess The Number

```js
await GuessTheNumber({
	message: interaction.message,
	embed: {
		title: interaction.options.getString('title'),
		description: interaction.options.getString('description'),
		color: interaction.options.getString('color'),
        footer: interaction.options.getString('footer'),
		timestamp: interaction.options.getBoolean('timestamp')
	},
	publicGame: interaction.options.getBoolean('publicGame'),
	number: 189,
	time: 60000,
	winMessage: {
		publicGame:
			'GG, The number which I guessed was **{{number}}**. <@{{winner}}> made it in **{{time}}**.\n\n__**Stats of the game:**__\n**Duration**: {{time}}\n**Number of participants**: {{totalparticipants}} Participants\n**Participants**: {{participants}}',
		privateGame:
			'GG, The number which I guessed was **{{number}}**. You made it in **{{time}}**.',
	},
	loseMessage:
		'Better luck next time! The number which I guessed was **{{number}}**.',
	bigNumberMessage: 'No {{author}}! My number is greater than **{{number}}**.',
	smallNumberMessage:
		'No {{author}}! My number is smaller than **{{number}}**.',
	othersMessage: 'Only <@{{author}}> can use the buttons!',
	buttonText: 'Cancel',
	ongoingMessage:
		"A game is already runnning in <#{{channel}}>. You can't start a new one!",
	returnWinner: false
});
```
