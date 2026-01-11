import type { CustomOptions, LieSwatterTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const LieSwatter: (weky: WekyManager, options: CustomOptions<LieSwatterTypes>) => Promise<boolean | import("discord.js").OmitPartialGroupDMChannel<import("discord.js").Message<true>>>;
export default LieSwatter;
