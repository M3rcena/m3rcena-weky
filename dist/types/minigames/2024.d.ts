import type { CustomOptions, Types2048 } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const mini2048: (weky: WekyManager, options: CustomOptions<Types2048>) => Promise<import("discord.js").OmitPartialGroupDMChannel<import("discord.js").Message<true>>>;
export default mini2048;
