import chalk from "chalk";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

import { checkPackageUpdates, getRandomString } from "../functions/functions";
import { OptionsChecking } from "../functions/OptionChecking";

import type { ButtonInteraction, ChatInputCommandInteraction, Client, Message } from "discord.js";
import type { FightTypes } from "../Types";
const data = new Set();

const Fight = async (options: FightTypes) => {
    OptionsChecking(options, "Fight");

    let interaction;

    if ((options.interaction as Message).author) {
        interaction = options.interaction as Message;
    } else {
        interaction = options.interaction as ChatInputCommandInteraction;
    }

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " No interaction provided.");

    let client: Client = options.client;

    let id: string = "";
    if ((options.interaction as Message).author) {
        id = (options.interaction as Message).author.id;
    } else {
        id = (options.interaction as ChatInputCommandInteraction).user.id;
    };

    if (!interaction.guild) {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Guild is not available in this interaction.");
    };

    if (!interaction.channel || !interaction.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Channel is not available in this interaction.");
    };

    if (!options.buttons) options.buttons = {};
    if (typeof options.buttons !== "object") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Buttons must be an object.");
    };

    if (!options.buttons.hit) options.buttons.hit = "Hit";
    if (typeof options.buttons.hit !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Hit button text must be a string.");
    };

    if (!options.buttons.heal) options.buttons.heal = "Heal";
    if (typeof options.buttons.heal !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Heal button text must be a string.");
    };

    if (!options.buttons.cancel) options.buttons.cancel = "Cancel";
    if (typeof options.buttons.cancel !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Cancel button text must be a string.");
    };

    if (!options.buttons.accept) options.buttons.accept = "Accept";
    if (typeof options.buttons.accept !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Accept button text must be a string.");
    };

    if (!options.buttons.deny) options.buttons.deny = "Deny";
    if (typeof options.buttons.deny !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Deny button text must be a string.");
    };

    if (!options.acceptMessage) options.acceptMessage = "<@{{challenger}}> has challenged <@{{opponent}}> for a fight!";
    if (typeof options.acceptMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Accept message must be a string.");
    };

    if (!options.winMessage) options.winMessage = "GG, <@{{winner}}> won the fight!";
    if (typeof options.winMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Win message must be a string.");
    };

    if (!options.endMessage) options.endMessage = "<@{{opponent}}> didn't answer in time. So, I dropped the game!";
    if (typeof options.endMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " End message must be a string.");
    };

    if (!options.cancelMessage) options.cancelMessage = "<@{{opponent}}> refused to have a fight with you!";
    if (typeof options.cancelMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Cancel message must be a string.");
    };

    if (!options.fightMessage) options.fightMessage = "{{player}} you go first!";
    if (typeof options.fightMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Fight message must be a string.");
    };

    if (!options.othersMessage) options.othersMessage = "Only {{author}} can use the buttons!";
    if (typeof options.othersMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Others message must be a string.");
    };

    if (!options.opponentsTurnMessage) options.opponentsTurnMessage = "Please wait for your opponents move!";
    if (typeof options.opponentsTurnMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Opponents turn message must be a string.");
    };

    if (!options.highHealthMessage) options.highHealthMessage = "You cannot heal if your HP is above 80!";
    if (typeof options.highHealthMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " High health message must be a string.");
    };

    if (!options.lowHealthMessage) options.lowHealthMessage = "You cannot cancel the fight if your HP is below 50!";
    if (typeof options.lowHealthMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Low health message must be a string.");
    };

    if (!options.returnWinner) options.returnWinner = false;
    if (typeof options.returnWinner !== "boolean") {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Return winner must be a boolean.");
    };

    if (data.has(id) || data.has(options.opponent.id)) return;

    data.add(id);
    data.add(options.opponent.id);

    const id1 = 
        getRandomString(20) +
        "-" +
        getRandomString(20);

    const id2 = 
        getRandomString(20) +
        "-" +
        getRandomString(20);

    const id3 = 
        getRandomString(20) +
        "-" +
        getRandomString(20);

    const opponent = options.opponent;
    const challenger = await client.users.fetch(id);

    if (opponent.bot || opponent.id === challenger.id) return;

    let acceptButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(options.buttons.accept)
        .setCustomId('weky_accept');

    let denyButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(options.buttons.deny)
        .setCustomId('weky_deny');

    let component = new ActionRowBuilder<ButtonBuilder>().addComponents([acceptButton, denyButton]);

    let embed = new EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(
            options.acceptMessage
                .replace("{{challenger}}", challenger.id)
                .replace("{{opponent}}", opponent.id),
        )
        .setColor(options.embed.color ?? "Blurple")
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });

    if (options.embed.footer) {
        embed.setFooter({
            text: options.embed.footer.text,
            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
        });
    };

    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    };

    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    };

    const question = await (interaction as Message || interaction as ChatInputCommandInteraction).reply({
        embeds: [embed],
        components: [component]
    });

    const collector = await question.createMessageComponentCollector({
        filter: (bt: ButtonInteraction) => bt.customId === "weky_accept" || bt.customId === "weky_deny",
        time: 60000,
    });

    collector.on("collect", async (_btn:ButtonInteraction) => {
        if (!_btn.inCachedGuild()) return;
        if (_btn.member.id !== opponent.id) {
            return _btn.reply({
                content: options.othersMessage.replace(
                    "{{author}}",
                    `<@${opponent.id}>`,
                ),
                ephemeral: true,
            });
        }

        await _btn.deferUpdate();

        if (_btn.customId === "weky_deny") {
            acceptButton = new ButtonBuilder()
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel(options.buttons.accept)
                .setCustomId("weky_accept");

            denyButton = new ButtonBuilder()
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttons.deny)
                .setCustomId("weky_deny");

            component = new ActionRowBuilder<ButtonBuilder>().addComponents([acceptButton, denyButton]);

            let emd = new EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.cancelMessage.replace("{{opponent}}", opponent.id))
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.footer) {
                emd.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            if (options.embed.author) {
                emd.setAuthor({
                    name: options.embed.author.name,
                });
            };

            if (options.embed.fields) {
                emd.setFields(options.embed.fields);
            };

            collector.stop();
            data.delete(id);
            data.delete(opponent.id);

            return question.edit({
                embeds: [emd],
                components: [component]
            });
        } else if (_btn.customId === "weky_accept") {
            collector.stop();
            const challengerHealth = 100;
            const opponentHealth = 100;
            const challengerLastAttack = "heal";
            const opponentLastAttack = "heal";

            const gameData = [
                {
                    member: challenger,
                    health: challengerHealth,
                    lastAttack: challengerLastAttack,
                },
                {
                    member: opponent,
                    health: opponentHealth,
                    lastAttack: opponentLastAttack,
                },
            ];

            let player = Math.floor(Math.random() * gameData.length);

            let btn1 = new ButtonBuilder()
                .setLabel(options.buttons.hit)
                .setCustomId(id1)
                .setStyle(ButtonStyle.Danger);
            
            let btn2 = new ButtonBuilder()
                .setLabel(options.buttons.heal)
                .setCustomId(id2)
                .setStyle(ButtonStyle.Success);

            let btn3 = new ButtonBuilder()
                .setLabel(options.buttons.cancel)
                .setCustomId(id3)
                .setStyle(ButtonStyle.Secondary);

            let row = new ActionRowBuilder<ButtonBuilder>().addComponents([btn1, btn2, btn3]);

            let _embed = new EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.fightMessage.replace("{{player}}", gameData[player].member.username))
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };
            
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                });
            };

            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            };

            question.edit({
                embeds: [_embed],
                components: [row]
            });

            const checkHealth = (member:number) => {
                if (gameData[member].health <= 0) return true;
                else return false;
            };

            const gameCollector = question.createMessageComponentCollector({
                filter: (btn:ButtonInteraction) => btn.customId === id1 || btn.customId === id2 || btn.customId === id3,
                time: options.time ? options.time : 300000,
            });

            gameCollector.on("collect", async (btn) => {
                if (!btn.inCachedGuild()) return;
                if (gameData.some((x) => x.member.id === btn.member.id)) {
                    if (!checkHealth(player)) {
                        const mbr = btn.member;
                        if (btn.customId === id1) {
                            if (mbr.id !== gameData[player].member.id) {
                                return btn.reply({
                                    content: options.opponentsTurnMessage,
                                    ephemeral: true,
                                });
                            }
                            await btn.deferUpdate();
                            let randNumb = Math.floor(Math.random() * options.dmgMax) + options.dmgMin || Math.floor(Math.random() * 15) + 4;
                            const tempPlayer = (player + 1) % 2;
                            if (gameData[tempPlayer].lastAttack === "heal") {
                                randNumb = Math.floor(randNumb / 2);
                            };

                            gameData[tempPlayer].health -= randNumb;
                            gameData[player].lastAttack = "attack";
                            if (gameData[player].member.id === id) {
                                let __embed = new EmbedBuilder()
                                    .setTitle(options.embed.title)
                                    .setDescription(
                                        `(:punch:) ${gameData[player].member.username} — ${gameData[player].health} HP - **versus** - **${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP`,
                                    )
                                    .setColor(options.embed.color ?? "Blurple")
                                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                                    .setURL(options.embed.url ? options.embed.url : null)
                                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                                    .setImage(options.embed.image ? options.embed.image : null);

                                if (options.embed.footer) {
                                    __embed.setFooter({
                                        text: options.embed.footer.text,
                                        iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                                    });
                                };

                                if (options.embed.author) {
                                    __embed.setAuthor({
                                        name: options.embed.author.name,
                                    });
                                };

                                if (options.embed.fields) {
                                    __embed.setFields(options.embed.fields);
                                };

                                question.edit({
                                    embeds: [__embed],
                                    components: [row]
                                });
                            } else if (gameData[player].member.id === opponent.id) {
                                let __embed = new EmbedBuilder()
                                    .setTitle(options.embed.title)
                                    .setDescription(
                                        `**${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP - **versus** - ${gameData[player].member.username} — ${gameData[player].health} HP (:punch:)`,
                                    )
                                    .setColor(options.embed.color ?? "Blurple")
                                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                                    .setURL(options.embed.url ? options.embed.url : null)
                                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                                    .setImage(options.embed.image ? options.embed.image : null);

                                if (options.embed.footer) {
                                    __embed.setFooter({
                                        text: options.embed.footer.text,
                                        iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                                    });
                                };

                                if (options.embed.author) {
                                    __embed.setAuthor({
                                        name: options.embed.author.name,
                                    });
                                };

                                if (options.embed.fields) {
                                    __embed.setFields(options.embed.fields);
                                };

                                question.edit({
                                    embeds: [__embed],
                                    components: [row]
                                });
                            }

                            player = (player + 1) % 2;
                        } else if (btn.customId === id2) {
                            if (mbr.id !== gameData[player].member.id) {
                                return btn.reply({
                                    content: options.opponentsTurnMessage,
                                    ephemeral: true,
                                });
                            };

                            if (gameData[player].health > 80) {
                                return btn.reply({
                                    content: options.highHealthMessage,
                                    ephemeral: true,
                                });
                            } else {
                                await btn.deferUpdate();
                                let randNumb = Math.floor(Math.random() * options.healMax) + options.healMin || Math.floor(Math.random() * 15) + 4;
                                const tempPlayer = (player + 1) % 2;

                                if (gameData[tempPlayer].lastAttack === "heal") {
                                    randNumb = Math.floor(randNumb / 2);
                                };

                                gameData[player].health += randNumb;
                                gameData[player].lastAttack = "heal";

                                if (gameData[player].member.id === id) {
                                    let __embed = new EmbedBuilder()
                                        .setTitle(options.embed.title)
                                        .setDescription(
                                            `(:hearts:) ${gameData[player].member.username} — ${gameData[player].health} HP - **versus** - **${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP`,
                                        )
                                        .setColor(options.embed.color ?? "Blurple")
                                        .setTimestamp(options.embed.timestamp ? new Date() : null)
                                        .setURL(options.embed.url ? options.embed.url : null)
                                        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                                        .setImage(options.embed.image ? options.embed.image : null);

                                    if (options.embed.footer) {
                                        __embed.setFooter({
                                            text: options.embed.footer.text,
                                            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                                        });
                                    };

                                    if (options.embed.author) {
                                        __embed.setAuthor({
                                            name: options.embed.author.name,
                                        });
                                    };

                                    if (options.embed.fields) {
                                        __embed.setFields(options.embed.fields);
                                    };

                                    question.edit({
                                        embeds: [__embed],
                                        components: [row]
                                    });
                                } else if (gameData[player].member.id === opponent.id) {
                                    let __embed = new EmbedBuilder()
                                        .setTitle(options.embed.title)
                                        .setDescription(
                                            `**${gameData[tempPlayer].member.username}** — ${gameData[tempPlayer].health} HP - **versus** - ${gameData[player].member.username} — ${gameData[player].health} HP (:hearts:)`,
                                        )
                                        .setColor(options.embed.color ?? "Blurple")
                                        .setTimestamp(options.embed.timestamp ? new Date() : null)
                                        .setURL(options.embed.url ? options.embed.url : null)
                                        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                                        .setImage(options.embed.image ? options.embed.image : null);

                                    if (options.embed.footer) {
                                        __embed.setFooter({
                                            text: options.embed.footer.text,
                                            iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                                        });
                                    };

                                    if (options.embed.author) {
                                        __embed.setAuthor({
                                            name: options.embed.author.name,
                                        });
                                    };

                                    if (options.embed.fields) {
                                        __embed.setFields(options.embed.fields);
                                    };

                                    question.edit({
                                        embeds: [__embed],
                                        components: [row]
                                    });
                                }

                                player = (player + 1) % 2;
                            }
                        } else if (btn.customId === id3) {
                            if (mbr.id !== gameData[player].member.id) {
                                return btn.reply({
                                    content: options.opponentsTurnMessage,
                                    ephemeral: true,
                                });
                            };

                            if (gameData[player].health < 50) {
                                return btn.reply({
                                    content: options.lowHealthMessage,
                                    ephemeral: true,
                                });
                            } else {
                                await btn.deferUpdate();

                                btn1 = new ButtonBuilder()
                                    .setDisabled()
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel(options.buttons.hit)
                                    .setCustomId(id1);

                                btn2 = new ButtonBuilder()
                                    .setDisabled()
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel(options.buttons.heal)
                                    .setCustomId(id2);

                                btn3 = new ButtonBuilder()
                                    .setDisabled()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setLabel(options.buttons.cancel)
                                    .setCustomId(id3);

                                row = new ActionRowBuilder<ButtonBuilder>().addComponents([btn1, btn2, btn3]);

                                gameCollector.stop();
                                data.delete(id);
                                data.delete(opponent.id);

                                let __embed = new EmbedBuilder()
                                    .setTitle(options.embed.title)
                                    .setDescription(
                                        options.cancelMessage.replace("{{opponent}}", gameData[player].member.id)
                                    )
                                    .setColor(options.embed.color ?? "Blurple")
                                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                                    .setURL(options.embed.url ? options.embed.url : null)
                                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                                    .setImage(options.embed.image ? options.embed.image : null);

                                if (options.embed.footer) {
                                    __embed.setFooter({
                                        text: options.embed.footer.text,
                                        iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                                    });
                                };

                                if (options.embed.author) {
                                    __embed.setAuthor({
                                        name: options.embed.author.name,
                                    });
                                };

                                if (options.embed.fields) {
                                    __embed.setFields(options.embed.fields);
                                };

                                question.edit({
                                    embeds: [__embed],
                                    components: [row]
                                });
                            }
                        }
                        if (checkHealth(player)) {
                            btn1 = new ButtonBuilder()
                                .setDisabled()
                                .setStyle(ButtonStyle.Danger)
                                .setLabel(options.buttons.hit)
                                .setCustomId(id1);

                            btn2 = new ButtonBuilder()
                                .setDisabled()
                                .setStyle(ButtonStyle.Success)
                                .setLabel(options.buttons.heal)
                                .setCustomId(id2);

                            btn3 = new ButtonBuilder()
                                .setDisabled()
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel(options.buttons.cancel)
                                .setCustomId(id3);

                            row = new ActionRowBuilder<ButtonBuilder>().addComponents([btn1, btn2, btn3]);

                            gameCollector.stop();

                            data.delete(id);
                            data.delete(opponent.id);

                            const tempPlayer = (player + 1) % 2;
                            
                            let __embed = new EmbedBuilder()
                                .setTitle(options.embed.title)
                                .setDescription(
                                    options.winMessage.replace("{{winner}}", gameData[tempPlayer].member.id)
                                )
                                .setColor(options.embed.color ?? "Blurple")
                                .setTimestamp(options.embed.timestamp ? new Date() : null)
                                .setURL(options.embed.url ? options.embed.url : null)
                                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                                .setImage(options.embed.image ? options.embed.image : null);

                            if (options.embed.footer) {
                                __embed.setFooter({
                                    text: options.embed.footer.text,
                                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                                });
                            };

                            if (options.embed.author) {
                                __embed.setAuthor({
                                    name: options.embed.author.name,
                                });
                            };

                            if (options.embed.fields) {
                                __embed.setFields(options.embed.fields);
                            };

                            question.edit({
                                embeds: [__embed],
                                components: [row]
                            });
                        }
                    } else {
                        btn1 = new ButtonBuilder()
                            .setDisabled()
                            .setStyle(ButtonStyle.Danger)
                            .setLabel(options.buttons.hit)
                            .setCustomId(id1);

                        btn2 = new ButtonBuilder()
                            .setDisabled()
                            .setStyle(ButtonStyle.Success)
                            .setLabel(options.buttons.heal)
                            .setCustomId(id2);

                        btn3 = new ButtonBuilder()
                            .setDisabled()
                            .setStyle(ButtonStyle.Secondary)
                            .setLabel(options.buttons.cancel)
                            .setCustomId(id3);

                        gameCollector.stop();

                        data.delete(id);
                        data.delete(opponent.id);

                        const tempPlayer = (player + 1) % 2;

                        let __embed = new EmbedBuilder()
                            .setTitle(options.embed.title)
                            .setDescription(
                                options.winMessage.replace("{{winner}}", gameData[tempPlayer].member.id)
                            )
                            .setColor(options.embed.color ?? "Blurple")
                            .setTimestamp(options.embed.timestamp ? new Date() : null)
                            .setURL(options.embed.url ? options.embed.url : null)
                            .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                            .setImage(options.embed.image ? options.embed.image : null);

                        if (options.embed.footer) {
                            __embed.setFooter({
                                text: options.embed.footer.text,
                                iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                            });
                        };
                        
                        if (options.embed.author) {
                            __embed.setAuthor({
                                name: options.embed.author.name,
                            });
                        };

                        if (options.embed.fields) {
                            __embed.setFields(options.embed.fields);
                        };

                        question.edit({
                            embeds: [__embed],
                            components: [row]
                        });
                    }
                } else {
                    return btn.reply({
                        content: options.othersMessage.replace("{{author}}", `<@${challenger.id}> and <@${opponent.id}>`),
                        ephemeral: true,
                    })
                }
            });

            gameCollector.on("end", async (msg, reason) => {
                if (reason === 'time') {
                    btn1 = new ButtonBuilder()
                        .setDisabled()
                        .setStyle(ButtonStyle.Danger)
                        .setLabel(options.buttons.hit)
                        .setCustomId(id1);

                    btn2 = new ButtonBuilder()
                        .setDisabled()
                        .setStyle(ButtonStyle.Success)
                        .setLabel(options.buttons.heal)
                        .setCustomId(id2);

                    btn3 = new ButtonBuilder()
                        .setDisabled()
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel(options.buttons.cancel)
                        .setCustomId(id3);

                    row = new ActionRowBuilder<ButtonBuilder>().addComponents([btn1, btn2, btn3]);

                    data.delete(id);
                    data.delete(opponent.id);

                    return question.edit({
                        components: [row]
                    });
                }
            })
        }
    });

    collector.on('end', async (msg, reason) => {
        if (reason === 'time') {
            acceptButton = new ButtonBuilder()
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel(options.buttons.accept)
                .setCustomId('weky_accept');

            denyButton = new ButtonBuilder()
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel(options.buttons.deny)
                .setCustomId('weky_deny');

            component = new ActionRowBuilder<ButtonBuilder>().addComponents([acceptButton, denyButton]);

            let _embed = new EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.endMessage.replace("{{opponent}}", opponent.id))
                .setColor(options.embed.color ?? "Blurple")
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null);

            if (options.embed.footer) {
                _embed.setFooter({
                    text: options.embed.footer.text,
                    iconURL: options.embed.footer.icon_url ? options.embed.footer.icon_url : undefined
                });
            };

            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                });
            };

            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            };

            data.delete(id);
            data.delete(opponent.id);

            return question.edit({
                embeds: [_embed],
                components: [component]
            });
        }
    });

    checkPackageUpdates("Fight", options.notifyUpdate);
};

export default Fight;