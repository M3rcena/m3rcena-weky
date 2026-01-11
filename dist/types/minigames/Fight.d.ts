import type { CustomOptions, FightTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const Fight: (weky: WekyManager, options: CustomOptions<FightTypes>) => Promise<boolean | import("discord.js").Message<true>>;
export default Fight;
