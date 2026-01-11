import { Message } from "discord.js";
import type { CustomOptions, HangmanTypes } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const Hangman: (weky: WekyManager, options: CustomOptions<HangmanTypes>) => Promise<import("discord.js").OmitPartialGroupDMChannel<Message<true>>>;
export default Hangman;
