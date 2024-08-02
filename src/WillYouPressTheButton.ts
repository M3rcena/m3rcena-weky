import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, EmbedBuilder, Message } from "discord.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
import { WillYouPressTheButtonTypes } from "../typings";
import chalk from "chalk";
import { getButtonDilemma, getRandomString } from "../functions/functions.js";

const WillYouPressTheButton = async (options: WillYouPressTheButtonTypes) => {
    // Options Check
    OptionsChecking(options, "WillYouPressTheButton");

    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }
    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");

    let client: Client = options.client;

    let id: string = "";
    if ((options.interaction as Message).author) {
        id = (options.interaction as Message).author.id;
    } else {
        id = (options.interaction as ChatInputCommandInteraction).user.id;
    };

    if (!options.button) options.button = {};
	if (typeof options.embed !== 'object') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " embed must be an object.");
	};

	if (!options.button.yes) options.button.yes = 'Yes';
	if (typeof options.button.yes !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " button.yes must be a string.");
	};

	if (!options.button.no) options.button.no = 'No';
	if (typeof options.button.no !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " button.no must be a string.");
	};

	if (!options.thinkMessage) options.thinkMessage = 'I am thinking';
	if (typeof options.thinkMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " thinkMessage must be a string.");
	};

	if (!options.othersMessage) {
		options.othersMessage = 'Only <@{{author}}> can use the buttons!';
	};
	if (typeof options.othersMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " othersMessage must be a string.");
	};

    if (!options.embed.description) {
        options.embed.description = '```{{statement1}}```\n**but**\n\n```{{statement2}}```';
    };
    if (typeof options.embed.description !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " embed.description must be a string.");
    };

    const id1 =
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);
        
    const id2 =
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);

    let embed = new EmbedBuilder()
        .setTitle(`${options.thinkMessage}...`)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null);

    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    };

    if (options.embed.footer) {
        embed.setFooter({
            text: options.embed.footer.text,
            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
        });
    };

    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }

    const think = await interaction.reply({
        embeds: [embed],
    });
    
    const fetchedData = await getButtonDilemma();

    const res = {
        questions: [fetchedData.question, fetchedData.result],
        percentage: {
            1: fetchedData.yesNo.yes.persend,
            2: fetchedData.yesNo.no.persend,
        }
    };

    let btn = new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(options.button.yes)
        .setCustomId(id1);

    let btn2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(options.button.no)
        .setCustomId(id2);

    embed = new EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(
            `${options.embed.description
                .replace(
                    '{{statement1}}',
                    res.questions[0].charAt(0).toUpperCase() +
                    res.questions[0].slice(1),
                )
                .replace(
                    '{{statement2}}',
                    res.questions[1].charAt(0).toUpperCase() +
                    res.questions[1].slice(1),
                )
            }`,
        )
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? new Date() : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null);

    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }

    if (options.embed.footer) {
        embed.setFooter({
            text: options.embed.footer.text,
            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
        });
    }

    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }

    await think.edit({
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [btn, btn2]
            }
        ]
    });

    const gameCollector = think.createMessageComponentCollector({
        time: options.time ? options.time : 60000,
    });

    gameCollector.on('collect', async (wyptb) => {
        if (wyptb.user.id !== id) {
            return wyptb.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `Only <@${id}> can use the buttons!`,
                ephemeral: true
            });
        };

        await wyptb.deferUpdate();

        if (wyptb.customId === id1) {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel(`${options.button ? options.button.yes ? options.button.yes : 'Yes' : 'Yes'} (${res.percentage['1']})`)
                .setDisabled()
                .setCustomId(id1);

            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(`${options.button ? options.button.no ? options.button.no : 'No' : 'No'} (${res.percentage['2']})`)
                .setDisabled()
                .setCustomId(id2);

            gameCollector.stop();
            embed.setTimestamp(new Date());
            await wyptb.editReply({
                embeds: [embed],
                components: [
                    {
                        type: 1,
                        components: [btn, btn2]
                    }
                ]
            });
        } else if (wyptb.customId === id2) {
            btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(`${options.button ? options.button.yes ? options.button.yes : 'Yes' : 'Yes'} (${res.percentage['1']})`)
                .setDisabled()
                .setCustomId(id1);

            btn2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel(`${options.button ? options.button.no ? options.button.no : 'No' : 'No'} (${res.percentage['2']})`)
                .setDisabled()
                .setCustomId(id2);

            gameCollector.stop();
            embed.setTimestamp(new Date());
            await wyptb.editReply({
                embeds: [embed],
                components: [
                    {
                        type: 1,
                        components: [btn, btn2]
                    }
                ]
            });
        }
    })
};

export default WillYouPressTheButton;