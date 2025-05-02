import { ButtonStyle, User } from "discord.js";

export interface PowerUp {
    id: string;
    label: string;
    style: ButtonStyle;
    cost: number;
    effect: (player: PlayerData, opponent: PlayerData) => string;
}

export interface PlayerData {
    member: User;
    health: number;
    lastAttack: string;
    coins: number;
    skipNextTurn: boolean;
    activeEffects: string[];
    specialButtons: string[];
}