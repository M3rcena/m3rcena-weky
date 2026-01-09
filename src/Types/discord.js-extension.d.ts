import "discord.js";

declare module "discord.js" {
	export interface MessagePayload {
		ephemeral?: boolean;
	}
	export interface MessageReplyOptions {
		ephemeral?: boolean;
	}

	interface ExtendedChatInputCommandInteraction extends ChatInputCommandInteraction<"cached"> {
		author: User;
		attachments: Collection<string, Attachment>;
		mentions: MessageMentions;
		args: string[];
	}

	interface ExtendedMessage extends Message<true> {
		user: User;
		member: GuildMember;
	}

	interface Context extends ExtendedChatInputCommandInteraction, ExtendedMessage {
		channel: TextBasedChannel;
	}
}
