import type { CustomOptions, SnakeTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const Snake: (weky: WekyManager, options: CustomOptions<SnakeTypes>) => Promise<import("discord.js").OmitPartialGroupDMChannel<import("discord.js").Message<true>>>;
export default Snake;
