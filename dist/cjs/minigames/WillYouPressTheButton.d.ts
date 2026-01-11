import type { CustomOptions, WillYouPressTheButtonTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const WillYouPressTheButton: (weky: WekyManager, options: CustomOptions<WillYouPressTheButtonTypes>) => Promise<import("discord.js").OmitPartialGroupDMChannel<import("discord.js").Message<true>>>;
export default WillYouPressTheButton;
