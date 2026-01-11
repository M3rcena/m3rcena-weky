import type { CustomOptions, NeverHaveIEverTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const NeverHaveIEver: (weky: WekyManager, options: CustomOptions<NeverHaveIEverTypes>) => Promise<boolean | import("discord.js").OmitPartialGroupDMChannel<import("discord.js").Message<true>>>;
export default NeverHaveIEver;
