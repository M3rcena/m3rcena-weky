import type { CustomOptions, ShuffleGuessTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const ShuffleGuess: (weky: WekyManager, options: CustomOptions<ShuffleGuessTypes>) => Promise<boolean>;
export default ShuffleGuess;
