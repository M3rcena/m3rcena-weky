import type { ColorResolvable, Context, EmbedFooterData, GuildMember, GuildTextBasedChannel } from "discord.js";

export interface CalcTypes {
	context: Context;
	embed: Embeds;
	invalidQuery?: string;
	disabledQuery?: string;
}

export interface ChaosTypes {
	context: Context;
	embed: Embeds;
	winMessage?: string;
	loseMessage?: string;
	wrongWord?: string;
	correctWord?: string;
	time?: number;
	words?: string[];
	charGenerated?: number;
	startMessage?: string;
	endMessage?: string;
	maxTries?: number;
	buttonText?: string;
	otherMessage?: string;
}

export interface FastTypeTypes {
	context: Context;
	embed: Embeds;
	sentence?: string;
	difficulty?: string;
	winMessage?: string;
	loseMessage?: string;
	time?: number;
	buttonText?: string;
	othersMessage?: string;
	cancelMessage?: string;
}

export interface LieSwatterTypes {
	context: Context;
	embed: Embeds;
	winMessage?: string;
	loseMessage?: string;
	othersMessage?: string;
	thinkMessage?: string;
	buttons?: {
		true: string;
		lie: string;
	};
	time?: number;
}

export interface WouldYouRatherTypes {
	context: Context;
	embed: Embeds;
	othersMessage?: string;
	thinkMessage?: string;
	buttons?: {
		optionA: string;
		optionB: string;
	};
	time?: number;
}

export interface GuessTheNumberTypes {
	context: Context;
	embed: Embeds;
	publicGame?: boolean;
	winMessage?: {
		publicGame?: string;
		privateGame?: string;
	};
	loseMessage?: string;
	otherMessage?: string;
	ongoingMessage?: string;
	biggerNumberMessage?: string;
	smallerNumberMeesage?: string;
	button?: string;
	number?: number;
	time?: number;
}

export interface WillYouPressTheButtonTypes {
	context: Context;
	embed: Embeds;
	button?: {
		yes?: string;
		no?: string;
	};
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

export interface QuickClickTypes {
	context: Context;
	embed: Embeds;
	waitMessage?: string;
	startMessage?: string;
	winMessage?: string;
	loseMessage?: string;
	ongoingMessage?: string;
	time?: number;
	emoji?: string;
}

export interface NeverHaveIEverTypes {
	context: Context;
	embed: Embeds;
	thinkMessage?: string;
	othersMessage?: string;
	buttons?: {
		optionA?: string;
		optionB?: string;
	};

	time?: number;
}

export interface HangmanTypes {
	context: Context;
	time?: number;
}

export interface Types2048 {
	context: Context;
	embed: Embeds;
	emojis?: {
		up: string;
		down: string;
		left: string;
		right: string;
	};
	othersMessage?: string;

	time?: number;
}

export interface ShuffleGuessTypes {
	context: Context;
	embed: Embeds;
	buttons?: {
		cancel?: string;
		reshuffle?: string;
	};
	winMessage?: string;
	loseMessage?: string;
	othersMessage?: string;
	startMessage?: string;
	incorrectMessage?: string;
	word?: string;
	time?: number;
}

export interface SnakeTypes {
	context: Context;
	embed: Embeds;
	emojis?: {
		up: string;
		down: string;
		left: string;
		right: string;
		stop: string;
		board: string;
		food: string;
	};
	snake?: {
		head: string;
		body: string;
		tail: string;
		skull: string;
	};
	time?: number;
}

export interface FightTypes {
	context: Context;
	opponent: GuildMember;
	buttons?: {
		hit?: string;
		heal?: string;
		cancel?: string;
		accept?: string;
		deny?: string;
	};
	wrongUserFight?: string;
	opponentsTurnMessage?: string;
	highHealthMessage?: string;
	lowHealthMessage?: string;
	dmgMin?: number;
	dmgMax?: number;
	healMin?: number;
	healMax?: number;
	time?: number;
}

export interface GuessThePokemonTypes {
	context: Context;
	embed: Embeds;
	thinkMessage?: string;
	othersMessage?: string;
	winMessage?: string;
	loseMessage?: string;
	incorrectMessage?: string;
	time?: number;
	buttonText?: string;
}

export interface Embeds {
	color?: ColorResolvable;
	title?: string;
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
