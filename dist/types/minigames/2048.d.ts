import type { Types2048 } from '../Types';
import type { Message } from "discord.js";
declare const mini2048: (options: Types2048) => Promise<import("discord.js").OmitPartialGroupDMChannel<Message<boolean>>>;
export default mini2048;
