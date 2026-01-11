import type { CustomOptions, GuessTheNumberTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const GuessTheNumber: (weky: WekyManager, options: CustomOptions<GuessTheNumberTypes>) => Promise<import("discord.js").Message<true>>;
export default GuessTheNumber;
