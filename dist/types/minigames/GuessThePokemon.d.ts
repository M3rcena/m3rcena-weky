import type { CustomOptions, GuessThePokemonTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const GuessThePokemon: (weky: WekyManager, options: CustomOptions<GuessThePokemonTypes>) => Promise<boolean | import("discord.js").OmitPartialGroupDMChannel<import("discord.js").Message<true>>>;
export default GuessThePokemon;
