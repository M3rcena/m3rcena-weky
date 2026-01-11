import { Message } from "discord.js";
import type { ChaosTypes, CustomOptions } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const ChaosWords: (weky: WekyManager, options: CustomOptions<ChaosTypes>) => Promise<Message<true>>;
export default ChaosWords;
