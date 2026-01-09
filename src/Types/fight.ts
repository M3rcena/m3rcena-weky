import { ButtonStyle } from "discord.js";

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
