import { Message } from "discord.js";
import type { FightTypes } from "../Types";
declare const Fight: (options: FightTypes) => Promise<void | import("discord.js").OmitPartialGroupDMChannel<Message<boolean>>>;
export default Fight;
