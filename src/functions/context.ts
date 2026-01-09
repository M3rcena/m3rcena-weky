import { Context } from "discord.js";

export const deferContext = (context: Context): void => {
	if (!context.isChatInputCommand) return;

	context.deferReply().then(() => {
		context.deleteReply();
	});
};

export const getContextUserID = (context: Context): string => {
	return context.author?.id || context.user?.id || context.member?.id;
};
