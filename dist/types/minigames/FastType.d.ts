import { Message } from "discord.js";
import type { CustomOptions, FastTypeTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const FastType: (weky: WekyManager, options: CustomOptions<FastTypeTypes>) => Promise<import("discord.js").OmitPartialGroupDMChannel<Message<true>>>;
export default FastType;
