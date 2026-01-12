import type {
	ButtonStyle,
	ColorResolvable,
	Context,
	EmbedFooterData,
	GuildMember,
	GuildTextBasedChannel,
} from "discord.js";

// TODO: TRY TO MAKE THE PICK<EMBEDS> OPTIONAL

/**
 * 2048 TYPES
 */
export interface Types2048 {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	emojis?: {
		up: string;
		down: string;
		left: string;
		right: string;
	};

	loadingMessage?: string;
	activeMessage?: string;
	wonMessage?: string;
	gameoverMessage?: string;
	quitMessage?: string;
	timeoutMessage?: string;
	errorMessage?: string;

	time?: number;
}

/**
 * CALCULATOR TYPES
 */
export interface CalcTypes {
	context: Context;
	embed: Pick<Embeds, "color">;

	operationTitles?: {
		logarithm?: string;
		squareRoot?: string;
		round?: string;
		sine?: string;
		cosine?: string;
		tangent?: string;
		naturalLogarithm?: string;
		reciprocal?: string;
		factorial?: string;
	};

	oporationLabels?: {
		logarithm?: string;
		squareRoot?: string;
		round?: string;
		sine?: string;
		cosine?: string;
		tangent?: string;
		naturalLogarithm?: string;
		reciprocal?: string;
		factorial?: string;
	};

	errorMessages?: {
		invalidCalculation?: string;
		infiniteResult?: string;
		largeResult?: string;
	};

	modals?: {
		display?: string;
		labels?: string;
		noPromptYet?: string;
	};

	sessionEndMessage?: string;
	othersMessage?: string;
}

/**
 * CHAOS WORDS TYPES
 */
export interface ChaosTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	failedFetchMessage?: string;

	states?: {
		active?: string;
		correct?: string;
		wrong?: string;
		repeat?: string;
		won?: {
			winMessage?: string;
			winContent?: string;
		};
		lost?: {
			loseMessage?: string;
			loseContent?: string;
		};
		timeout?: string;
		cancelled?: string;

		chaosString?: string;
		wordsFound?: {
			main?: string;
			noneYet?: string;
		};
		missingWords?: string;
		tries?: string;
		timeRemaining?: string;
	};

	cancelButton?: string;

	wordAlreadyFound?: string;
	correctWord?: string;
	wrongWord?: string;

	charGenerated?: number;
	words?: string[];
	maxTries?: number;
	time?: number;
}

/**
 * FAST TYPE TYPES
 */
export interface FastTypeTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	sentence?: string;
	difficulty?: "easy" | "medium" | "hard";
	time?: number;

	winMessage?: string;
	loseMessage?: string;
	timeoutMessage?: string;
	cheatMessage?: string;

	states?: {
		loading?: string;
		active?: string;
		won?: string;
		lost?: string;
		cheat?: string;
		timeout?: string;
		cancelled?: string;
		error?: {
			main?: string;
			details?: string;
		};
	};

	failedFetchError?: string;

	cancelButton?: string;
}

/**
 * FIGHT TYPES
 */
export interface FightTypes {
	context: Context;
	opponent: GuildMember;
	embed?: Pick<Embeds, "color">;
	time?: number;

	powerups?: {
		doubleDamage?: {
			label?: string;
			effectMessage?: string;
			replyMessage?: string;
		};
		shield?: {
			label?: string;
			effectMessage?: string;
			replyMessage?: string;
		};
		healBoost?: {
			label?: string;
			replyMessage?: string;
		};
	};

	buttons?: {
		hit?: string;
		heal?: string;
		cancel?: string;
		accept?: string;
		deny?: string;
	};

	states?: {
		request?: string;
		active?: string;
		won?: string;
		surrender?: string;
		deny?: string;
		timeout?: string;
		error?: {
			main?: string;
			uknownError?: string;
		};
	};

	failedRequestCardGeneration?: string;
	notEnoughtCoins?: string;

	wrongUserFight?: string;
	opponentsTurnMessage?: string;
	highHealthMessage?: string;
	lowHealthMessage?: string;
	playerAlreadyInFight?: string;
}

export interface PowerUp {
	id: string;
	label: string;
	style: ButtonStyle;
	cost: number;
	effect: (player: PlayerData, playerUsername: string) => string;
}

export interface PlayerData {
	memberId: string;
	username: string;
	health: number;
	lastAttack: string;
	coins: number;
	skipNextTurn: boolean;
	activeEffects: string[];
	specialButtons: string[];
}

/**
 * GUESS THE NUMBER TYPES
 */
export interface GuessTheNumberTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	publicGame?: boolean;
	time?: number;
	number?: number;

	states?: {
		active?: string;
		higher?: string;
		won?: string;
		lower?: string;
		lost?: string;
	};

	giveUpButton?: string;

	ongoingMessage?: string;
	winMessage?: {
		publicGame?: string;
		privateGame?: string;
	};
	loseMessage?: string;
	otherMessage?: string;
}

/**
 * GUESS THE POKEMON TYPES
 */
export interface GuessThePokemonTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;
	time?: number;

	states?: {
		loading?: string;
		active?: string;
		wrong?: string;
		won?: string;
		lost?: string;
		error?: string;
	};

	giveUpButton?: string;

	thinkMessage?: string;
	winMessage?: string;
	loseMessage?: string;
	incorrectMessage?: string;
}

export interface GuessThePokemonData {
	abilities: {
		ability: {
			name: string;
			url: string;
		};
		is_hidden: boolean;
		slot: number;
	}[];
	base_experience: number;
	forms: {
		name: string;
		url: string;
	}[];
	types: {
		slot: number;
		type: {
			name: string;
			url: string;
		};
	}[];
	name: string;
	sprites: {
		other: {
			home: {
				front_default: string;
			};
		};
	};
}

/**
 * HANGMAN TYPES
 */
export interface HangmanTypes {
	context: Context;
	embed?: Pick<Embeds, "title" | "color">;
	time?: number;

	states?: {
		loading?: string;
		active?: string;
		won?: string;
		lost?: string;
		quit?: string;
		timeout?: string;
		error?: {
			main?: string;
			unknownError?: string;
		};
	};

	errors?: {
		failedToStart?: string;
		failedToGenerate?: string;
		noApiResponse?: string;
	};

	othersMessage?: string;
}

/**
 * LIE SWATTER TYPES
 */
export interface LieSwatterTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	winMessage?: string;
	loseMessage?: string;
	othersMessage?: string;
	thinkMessage?: string;
	timesUpMessage?: string;

	states?: {
		loading?: string;
		active?: string;
		won?: string;
		lost?: string;
		error?: string;
	};

	errors?: {
		failedFetch?: string;
		noResult?: string;
	};

	buttons?: {
		true: string;
		lie: string;
	};

	time?: number;
}

/**
 * NEVER HAVE I EVER TYPES
 */
export interface NeverHaveIEverTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	thinkMessage?: string;
	othersMessage?: string;

	states?: {
		loading?: string;
		active?: string;
		yes?: string;
		no?: string;
		timeout?: string;
		error?: string;
	};

	buttons?: {
		optionA?: string;
		optionB?: string;
	};

	errors?: {
		failedFetch?: string;
		noResult?: string;
	};

	time?: number;
}

/**
 * QUICK CLICK TYPES
 */
export interface QuickClickTypes {
	context: Context;
	embed: Pick<Embeds, "title">;

	waitMessage?: string;
	startMessage?: string;
	winMessage?: string;
	loseMessage?: string;
	ongoingMessage?: string;

	errors?: {
		main?: string;
		gameAlreadyRunning?: string;
	};

	states?: {
		waiting?: string;
		active?: string;
		won?: string;
		lost?: string;
	};

	time?: number;
	emoji?: string;
}

/**
 * SHUFFLE GUESS TYPES
 */
export interface ShuffleGuessTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	buttons?: {
		cancel?: string;
		reshuffle?: string;
	};

	mainContent?: string;

	winMessage?: string;
	loseMessage?: string;
	othersMessage?: string;
	startMessage?: string;
	incorrectMessage?: string;

	word?: string;
	time?: number;
}

/**
 * SNAKE TYPES
 */
export interface SnakeTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	emojis?: {
		up: string;
		down: string;
		left: string;
		right: string;
	};

	states?: {
		loading?: string;
		active?: string;
		gameover?: string;
		quit?: string;
		timeout?: string;
		error?: {
			main?: string;
			unknownError?: string;
		};
	};

	errors?: {
		couldNotCreateGame?: string;
		failedToGenerateBoard?: string;
		connectionError?: string;
	};

	othersMessage?: string;

	time?: number;
}
export interface Point {
	x: number;
	y: number;
}

export interface SnakeGameTypes {
	gameID: string;
	playerID: string;
	username: string;
	score: number;
	snake: Point[];
	food: Point;
	direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
	gridSize: number;
	gameOver: boolean;
}

/**
 * WILL YOU PRESS THE BUTTON TYPES
 */
export interface WillYouPressTheButtonTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	states?: {
		loading?: string;
		active?: string;
		result?: string;
		timeout?: string;
		error?: string;
	};

	button?: {
		yes?: string;
		no?: string;
	};

	yesPress?: string;
	noPress?: string;

	thinkMessage?: string;
	othersMessage?: string;

	time?: number;
}

export interface DilemmaData {
	id: string;
	url: string;
	question: string;
	result: string;
	stats: {
		yes: { percentage: string; count: string };
		no: { percentage: string; count: string };
	};
}

/**
 * WOULD YOU RATHER TYPES
 */
export interface WouldYouRatherTypes {
	context: Context;
	embed: Pick<Embeds, "title" | "color">;

	othersMessage?: string;
	thinkMessage?: string;

	buttons?: {
		optionA: string;
		optionB: string;
	};

	states?: {
		loading?: string;
		active?: string;
		result?: string;
		timeout?: string;
		error?: string;
	};

	time?: number;
}

/**
 * CUSTOMIZABLE EMBEDS TYPES
 */
export interface Embeds {
	color: ColorResolvable;
	title: string;
	url?: string;
	author?: Author;
	footer?: EmbedFooterData;
	description?: string;
	fields?: Fields[];
	image?: string;
	timestamp?: Date | boolean;
	thumbnail?: string;
}

export interface Author {
	name: string;
	icon_url?: string;
	url?: string;
}

export interface Fields {
	name: string;
	value: string;
	inline?: boolean;
}

/**
 * MANAGER RELATED TYPES
 */
export type CustomOptions<T> = T & {
	context: {
		channel: GuildTextBasedChannel;
		guild: NonNullable<Context["guild"]>;
	};
};

export interface BotDataTypes {
	botID: string;
	botName: string;
	secretKey: string;
	usage: {
		minigames: {
			mini2024: number;
			calculator: number;
			chaosWords: number;
			fastType: number;
			fight: number;
			guessTheNumber: number;
			guessThePokemon: number;
			hangman: number;
			lieSwatter: number;
			neverHaveIEver: number;
			quickClick: number;
			shuffleGuess: number;
			snake: number;
			willYouPressTheButton: number;
			wouldYouRather: number;
		};
		inits: number;
		totalRequests: number;
	};
}
