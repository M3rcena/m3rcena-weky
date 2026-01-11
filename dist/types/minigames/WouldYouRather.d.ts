import type { CustomOptions, WouldYouRatherTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const WouldYouRather: (weky: WekyManager, options: CustomOptions<WouldYouRatherTypes>) => Promise<import("discord.js").OmitPartialGroupDMChannel<import("discord.js").Message<true>>>;
export default WouldYouRather;
