import type { FightTypes } from "../../Types";
declare const Fight: (options: FightTypes) => Promise<import("discord.js").InteractionResponse<boolean>>;
export default Fight;
