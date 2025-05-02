import { AttachmentBuilder, User } from "discord.js";
import { PlayerData } from "../Types/fight";
export declare function getRequestCard(challenger: User, opponent: User): Promise<AttachmentBuilder>;
export declare function getMainCard(player1: PlayerData, player2: PlayerData): Promise<AttachmentBuilder>;
export declare function getSurrenderCard(player: User, winner: User): Promise<AttachmentBuilder>;
export declare function getDeniedCard(challenger: User, opponent: User): Promise<AttachmentBuilder>;
export declare function getTimeoutCard(challenger: User, opponent: User): Promise<AttachmentBuilder>;
