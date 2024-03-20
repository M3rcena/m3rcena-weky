import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		// set the other intents
	],
});

import Calculator from '../src/v14/Calculator.mjs';
import ChaosWords from '../src/v14/ChaosWords.mjs';
import FastType from '../src/v14/FastType.mjs';
import Fight from '../src/v14/Fight.mjs';
import GuessTheNumber from '../src/v14/GuessTheNumber.mjs';
import GuessThePokemon from '../src/v14/GuessThePokemon.mjs';
import LieSwatter from '../src/v14/LieSwatter.mjs';
import NeverHaveIEver from '../src/v14/NeverHaveIEver.mjs';
import QuickClick from '../src/v14/QuickClick.mjs';
import RockPaperScissors from '../src/v14/RockPaperScissors.mjs';
import ShuffleGuess from '../src/v14/ShuffleGuess.mjs';
import Snake from '../src/v14/Snake.mjs';
import TicTacToe from '../src/v14/TicTacToe.mjs';
import Trivia from '../src/v14/Trivia.mjs';
import WillYouPressTheButton from '../src/v14/WillYouPressTheButton.mjs';
import WouldYouRather from '../src/v14/WouldYouRather.mjs';

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
	// Calculator
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
			client: client,
		});
	}

	// ChaosWords
	if (message.content.startsWith('!ChaosWords')) {
		await ChaosWords({
			message: message,
			embed: {
				title: 'ChaosWords | Weky Development',
				description: 'You have **{{time}}** to find the hidden words in the below sentence.',
				color: '#5865F2',
				field1: 'Sentence:',
				field2: 'Words Found/Remaining Words:',
				field3: 'Words found:',
				field4: 'Words:',
				footer: '©️ Weky Development',
				timestamp: true
			},
			winMessage: 'GG, You won! You made it in **{{time}}**.',
			loseMessage: 'Better luck next time!',
			wrongWordMessage: 'Wrong Guess! You have **{{remaining_tries}}** tries left.',
			correctWordMessage: 'GG, **{{word}}** was correct! You have to find **{{remaining}}** more word(s).',
			time: 60000,
			words: ['hello', 'these', 'are', 'words'],
			charGenerated: 17,
			maxTries: 10,
			buttonText: 'Cancel',
			othersMessage: 'Only <@{{author}}> can use the buttons!'
		});
	}

	// FastType
	if (message.content.startsWith('!fastType')) {
		await FastType({
			message: message,
			embed: {
				title: 'FastType | Weky Development',
				description: 'You have **{{time}}** to type the below sentence.',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			sentence: 'This is a sentence!',
			winMessage: 'GG, you have a wpm of **{{wpm}}** and You made it in **{{time}}**.',
			loseMessage: 'Better luck next time!',
			cancelMessage: 'You ended the game!',
			time: 60000,
			buttonText: 'Cancel',
			othersMessage: 'Only <@{{author}}> can use the buttons!'
		});
	}

	// Fight
	if (message.content.startsWith('!fight')) {
		await Fight({
			message: message,
			opponent: message.mentions.users.first(),
			embed: {
				title: 'Fight | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			buttons: {
			  hit: 'Hit',
			  heal: 'Heal',
			  cancel: 'Stop',
			  accept: 'Accept',
			  deny: 'Deny'
			},
			acceptMessage: '<@{{challenger}}> has challenged <@{{opponent}}> for a fight!',
			winMessage: 'GG, <@{{winner}}> won the fight!',
			endMessage: '<@{{opponent}}> didn\'t answer in time. So, I dropped the game!',
			cancelMessage: '<@{{opponent}}> refused to have a fight with you!',
			fightMessage: '{{player}} you go first!',
			opponentsTurnMessage: 'Please wait for your opponents move!',
			highHealthMessage: 'You cannot heal if your HP is above 80!',
			lowHealthMessage: 'You cannot cancel the fight if your HP is below 50!',
			returnWinner: false,
			othersMessage: 'Only {{author}} can use the buttons!'
		});
	}

	// GuessTheNumber
	if (message.content.startsWith('!guessTheNumber')) {
		await GuessTheNumber({
			message: message,
			embed: {
				title: 'Guess The Number | Weky Development',
				description: 'You have **{{time}}** to guess the number.',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			publicGame: true,
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
	}

	// GuessThePokemon
	if (message.content.startsWith('!guessThePokemon')) {
		await GuessThePokemon({
			message: message,
			embed: {
				title: 'Guess The Pokémon | Weky Development',
				description:
					'**Type:**\n{{type}}\n\n**Abilities:**\n{{abilities}}\n\nYou only have **{{time}}** to guess the pokémon.',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			thinkMessage: 'I am thinking',
			othersMessage: 'Only <@{{author}}> can use the buttons!',
			winMessage:
				'GG, It was a **{{answer}}**. You got it correct in **{{time}}**.',
			loseMessage: 'Better luck next time! It was a **{{answer}}**.',
			time: 60000,
			incorrectMessage: "No {{author}}! The pokémon isn't `{{answer}}`",
			buttonText: 'Cancel'
		});
	}

	// LieSwatter
	if (message.content.startsWith('!lieSwatter')) {
		await LieSwatter({
			message: message,
			embed: {
				title: 'Lie Swatter | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			thinkMessage: 'I am thinking',
			winMessage:
				'GG, It was a **{{answer}}**. You got it correct in **{{time}}**.',
			loseMessage: 'Better luck next time! It was a **{{answer}}**.',
			othersMessage: 'Only <@{{author}}> can use the buttons!',
			buttons: { true: 'Truth', lie: 'Lie' }
		});
	}

	// NeverHaveIEver
	if (message.content.startsWith('!neverHaveIEver')) {
		await NeverHaveIEver({
			message: message,
			embed: {
				title: 'Never Have I Ever | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			thinkMessage: 'I am thinking',
			othersMessage: 'Only <@{{author}}> can use the buttons!',
			buttons: { optionA: 'Yes', optionB: 'No' }
		});
	}

	// QuickClick
	if (message.content.startsWith('!quickClick')) {
		await QuickClick({
			message: message,
			embed: {
				title: 'Quick Click | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			time: 60000,
			waitMessage: 'The buttons may appear anytime now!',
			startMessage:
				'First person to press the correct button will win. You have **{{time}}**!',
			winMessage: 'GG, <@{{winner}}> pressed the button in **{{time}} seconds**.',
			loseMessage: 'No one pressed the button in time. So, I dropped the game!',
			emoji: '👆',
			ongoingMessage:
				"A game is already runnning in <#{{channel}}>. You can't start a new one!"
		});
	}

	if (message.content.startsWith('!rockPaperScissors')) {
		await RockPaperScissors({
			message: message,
			opponent: message.mentions.users.first(),
			embed: {
				title: 'Rock Paper Scissors | Weky Development',
				description: 'Press the button below to choose your element.',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			buttons: {
				rock: 'Rock',
				paper: 'Paper',
				scissors: 'Scissors',
				accept: 'Accept',
				deny: 'Deny',
			},
			time: 60000,
			acceptMessage:
				'<@{{challenger}}> has challenged <@{{opponent}}> for a game of Rock Paper and Scissors!',
			winMessage: 'GG, <@{{winner}}> won!',
			drawMessage: 'This game is deadlock!',
			endMessage: "<@{{opponent}}> didn't answer in time. So, I dropped the game!",
			timeEndMessage:
				"Both of you didn't pick something in time. So, I dropped the game!",
			cancelMessage:
				'<@{{opponent}}> refused to have a game of Rock Paper and Scissors with you!',
			choseMessage: 'You picked {{emoji}}',
			noChangeMessage: 'You cannot change your selection!',
			othersMessage: 'Only {{author}} can use the buttons!',
			returnWinner: false
		});
	}

	// ShuffleGuess
	if (message.content.startsWith('!shuffleGuess')) {
		await ShuffleGuess({
			message: message,
			embed: {
				title: 'Shuffle Guess | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			word: ['voice'],
			button: { cancel: 'Cancel', reshuffle: 'Reshuffle' },
			startMessage:
				'I shuffled a word it is **`{{word}}`**. You have **{{time}}** to find the correct word!',
			winMessage:
				'GG, It was **{{word}}**! You gave the correct answer in **{{time}}.**',
			loseMessage: 'Better luck next time! The correct answer was **{{answer}}**.',
			incorrectMessage: "No {{author}}! The word isn't `{{answer}}`",
			othersMessage: 'Only <@{{author}}> can use the buttons!',
			time: 60000
		});
	}

	// Snake
	if (message.content.startsWith('!snake')) {
		await Snake({
			message: message,
			embed: {
				title: 'Snake | Weky Development',
				description: 'GG, you scored **{{score}}** points!',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			emojis: {
				empty: '⬛',
				snakeBody: '🟩',
				food: '🍎',
				up: '⬆️',
				right: '⬅️',
				down: '⬇️',
				left: '➡️',
			},
			othersMessage: 'Only <@{{author}}> can use the buttons!',
			buttonText: 'Cancel'
		});
	}

	// TicTacToe
	if (message.content.startsWith('!TicTacToe')) {
		await TicTacToe({
			message: message,
			opponent: message.mentions.users.first()
		});
	}

	// Trivia
	if (message.content.startsWith('!Trivia')) {
		await Trivia({
			message: message,
			embed: {
				title: 'Trivia | Weky Development',
				description: 'You only have **{{time}}** to guess the answer!',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			difficulty: 'hard',
			thinkMessage: 'I am thinking',
			winMessage:
				'GG, It was **{{answer}}**. You gave the correct answer in **{{time}}**.',
			loseMessage: 'Better luck next time! The correct answer was **{{answer}}**.',
			emojis: {
				one: '1️⃣',
				two: '2️⃣',
				three: '3️⃣',
				four: '4️⃣',
			},
			othersMessage: 'Only <@{{author}}> can use the buttons!',
			returnWinner: false
		});
	}

	if (message.content.startsWith('!willYouPressTheButton')) {
		await WillYouPressTheButton({
			message: message,
			embed: {
				title: 'Will you press the button? | Weky Development',
				description: '```{{statement1}}```\n**but**\n\n```{{statement2}}```',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			button: { yes: 'Yes', no: 'No' },
			thinkMessage: 'I am thinking',
			othersMessage: 'Only <@{{author}}> can use the buttons!'
		});
	}

	if (message.content.startsWith('!wouldYouRather')) {
		await WouldYouRather({
			message: message,
			embed: {
				title: 'Would you rather... | Weky Development',
				color: '#5865F2',
				footer: '©️ Weky Development',
				timestamp: true
			},
			thinkMessage: 'I am thinking',
			othersMessage: 'Only <@{{author}}> can use the buttons!',
			buttons: { optionA: 'Option A', optionB: 'Option B' }
		});
	}
});

client.login('token');