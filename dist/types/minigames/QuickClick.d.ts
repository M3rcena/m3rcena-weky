import type { CustomOptions, QuickClickTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const QuickClick: (weky: WekyManager, options: CustomOptions<QuickClickTypes>) => Promise<import("discord.js").Message<true>>;
export default QuickClick;
