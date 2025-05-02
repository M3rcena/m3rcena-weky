import chalk from "chalk";
import {
	ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder,
	MessageFlags, User
} from "discord.js";

import {
	getDeniedCard, getMainCard, getRequestCard, getSurrenderCard, getTimeoutCard
} from "../../functions/fightCards.js";
import { checkPackageUpdates } from "../../functions/functions.js";
import { OptionsChecking } from "../../functions/OptionChecking.js";

import type { PlayerData, PowerUp } from "../../Types/fight";
import type { FightTypes } from "../../Types";

const data = new Set();

// Define available powerups
const POWERUPS: PowerUp[] = [
    {
        id: 'double-damage',
        label: '2x Damage',
        style: ButtonStyle.Danger,
        cost: 30,
        effect: (player, opponent) => {
            player.activeEffects.push('Double Damage (Next Attack)');
            return `${player.member.username} will deal double damage on their next attack!`;
        }
    },
    {
        id: 'shield',
        label: 'Shield',
        style: ButtonStyle.Secondary,
        cost: 25,
        effect: (player, opponent) => {
            player.activeEffects.push('Shield (Next Attack)');
            return `${player.member.username} will take half damage from the next attack!`;
        }
    },
    {
        id: 'heal-boost',
        label: 'Heal Boost',
        style: ButtonStyle.Success,
        cost: 20,
        effect: (player, opponent) => {
            player.health += 30;
            if (player.health > 100) player.health = 100;
            return `${player.member.username} received a 30 HP healing boost!`;
        }
    }
];

const Fight = async (options: FightTypes) => {
    OptionsChecking(options, "Fight");

    let interaction = options.interaction;

    if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " No interaction provided.");

    if (!interaction.channel.isSendable()) throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Channel is not sendable.");

    if (interaction.channel.isDMBased()) throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Channel is a DM.");

    let id = interaction.user.id;

    if (!interaction.guild) {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Guild is not available in this interaction.");
    };

    if (!options.buttons) options.buttons = {};
    if (typeof options.buttons !== "object") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Buttons must be an object.");
    };

    if (!options.buttons.hit) options.buttons.hit = "Hit";
    if (typeof options.buttons.hit !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Hit button text must be a string.");
    };

    if (!options.buttons.heal) options.buttons.heal = "Heal";
    if (typeof options.buttons.heal !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Heal button text must be a string.");
    };

    if (!options.buttons.cancel) options.buttons.cancel = "Surrender";
    if (typeof options.buttons.cancel !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Cancel button text must be a string.");
    };

    if (!options.buttons.accept) options.buttons.accept = "Accept";
    if (typeof options.buttons.accept !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Accept button text must be a string.");
    };

    if (!options.buttons.deny) options.buttons.deny = "Deny";
    if (typeof options.buttons.deny !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Deny button text must be a string.");
    };

    if (!options.acceptMessage) options.acceptMessage = "<@{{challenger}}> has challenged <@{{opponent}}> for a fight!";
    if (typeof options.acceptMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Accept message must be a string.");
    };

    if (!options.winMessage) options.winMessage = "GG, <@{{winner}}> won the fight!";
    if (typeof options.winMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Win message must be a string.");
    };

    if (!options.endMessage) options.endMessage = "<@{{opponent}}> didn't answer in time. So, I dropped the game!";
    if (typeof options.endMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " End message must be a string.");
    };

    if (!options.cancelMessage) options.cancelMessage = "<@{{opponent}}> refused to have a fight with you!";
    if (typeof options.cancelMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Cancel message must be a string.");
    };

    if (!options.fightMessage) options.fightMessage = "{{player}} you go first!";
    if (typeof options.fightMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Fight message must be a string.");
    };

    if (!options.othersMessage) options.othersMessage = "Only {{author}} can use the buttons!";
    if (typeof options.othersMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Others message must be a string.");
    };

    if (!options.opponentsTurnMessage) options.opponentsTurnMessage = "Please wait for your opponents move!";
    if (typeof options.opponentsTurnMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Opponents turn message must be a string.");
    };

    if (!options.highHealthMessage) options.highHealthMessage = "You cannot heal if your HP is above 80!";
    if (typeof options.highHealthMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " High health message must be a string.");
    };

    if (!options.lowHealthMessage) options.lowHealthMessage = "You cannot cancel the fight if your HP is below 50!";
    if (typeof options.lowHealthMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Low health message must be a string.");
    };

    if (!options.returnWinner) options.returnWinner = false;
    if (typeof options.returnWinner !== "boolean") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Return winner must be a boolean.");
    };

    if (!options.opponent) {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Opponent is missing from the options.")
    };

    if (!(options.opponent as User).username) {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Opponent option must be User.");
    }

    if (id === options.opponent.id) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Fight Error")
                    .setColor("Red")
                    .setDescription("Hey there!\n\nIt's not fun to fight yourself!")
                    .setTimestamp()
            ],
        });
    };

    if (data.has(id) || data.has(options.opponent.id)) return;

    data.add(id);
    data.add(options.opponent.id);

    const challenger = interaction.user;
    const opponent = options.opponent;

    // Initialize player data
    const player1: PlayerData = {
        member: challenger,
        health: 100,
        lastAttack: '',
        coins: 50, // Starting coins
        skipNextTurn: false,
        activeEffects: [],
        specialButtons: []
    };

    const player2: PlayerData = {
        member: opponent,
        health: 100,
        lastAttack: '',
        coins: 50, // Starting coins
        skipNextTurn: false,
        activeEffects: [],
        specialButtons: []
    };

    const requestCard = await getRequestCard(challenger, opponent);

    // Create accept/deny buttons
    const accept = new ButtonBuilder()
        .setLabel(options.buttons.accept)
        .setStyle(ButtonStyle.Success)
        .setCustomId('fight_accept');

    const deny = new ButtonBuilder()
        .setLabel(options.buttons.deny)
        .setStyle(ButtonStyle.Danger)
        .setCustomId('fight_deny');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(accept, deny);

    const embed = new EmbedBuilder()
        .setColor(options.embed.color ? options.embed.color : "Blurple")
        .setImage("attachment://fight-request.png")
        .setTimestamp(options.embed.timestamp);

    const msg = await interaction.reply({
        embeds: [embed],
        files: [requestCard],
        components: [row]
    });

    // Create button collector for accept/deny
    const filter = (i: ButtonInteraction) => i.user.id === opponent.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 30000, componentType: ComponentType.Button });

    collector.on('collect', async (interaction) => {
        if (interaction.customId === 'fight_deny') {
            const deniedCard = await getDeniedCard(challenger, opponent);
            const deniedEmbed = new EmbedBuilder()
                .setColor('Red')
                .setImage('attachment://fight-denied.png')
                .setTimestamp();
            data.delete(id);
            data.delete(opponent.id);
            await interaction.update({
                content: null,
                embeds: [deniedEmbed],
                components: [],
                files: [deniedCard]
            });
            collector.stop();
            return;
        }

        if (interaction.customId === 'fight_accept') {
            await startFight(interaction, options, player1, player2);
            collector.stop();
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            const timeoutCard = await getTimeoutCard(challenger, opponent);
            const timeoutEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setImage('attachment://fight-timeout.png')
                .setTimestamp();
            data.delete(id);
            data.delete(opponent.id);
            msg.edit({
                content: null,
                embeds: [timeoutEmbed],
                components: [],
                files: [timeoutCard]
            });
        }
    });

    checkPackageUpdates("Fight", options.notifyUpdate);
};

async function startFight(interaction: ButtonInteraction, options: FightTypes, player1: PlayerData, player2: PlayerData) {
    let currentPlayer = player1;
    let opponent = player2;

    // Create action buttons
    const hit = new ButtonBuilder()
        .setLabel(options.buttons.hit)
        .setStyle(ButtonStyle.Danger)
        .setCustomId('fight_hit');

    const heal = new ButtonBuilder()
        .setLabel(options.buttons.heal)
        .setStyle(ButtonStyle.Success)
        .setCustomId('fight_heal');

    const surrender = new ButtonBuilder()
        .setLabel(options.buttons.cancel)
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('fight_surrender');

    // Create powerup buttons
    const powerupButtons = POWERUPS.map(powerup =>
        new ButtonBuilder()
            .setLabel(`${powerup.label} (${powerup.cost}🪙)`)
            .setStyle(powerup.style)
            .setCustomId(`powerup_${powerup.id}`)
    );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(hit, heal, surrender);
    const powerupRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...powerupButtons);

    // Update the fight status
    const gameCard = await getMainCard(player1, player2);
    const gameEmbed = new EmbedBuilder()
        .setColor(options.embed.color ?? "Blurple")
        .setImage("attachment://fight-status.png")
        .setDescription(`It's ${currentPlayer.member.username}'s turn!`);

    const msg = await interaction.update({
        embeds: [gameEmbed],
        files: [gameCard],
        components: [actionRow, powerupRow]
    });

    // Create game collector
    const filter = (i: ButtonInteraction) => i.user.id === currentPlayer.member.id;
    const collector = msg.createMessageComponentCollector({ filter });

    collector.on('collect', async (i: ButtonInteraction) => {
        await i.deferUpdate();

        if (i.user.id !== currentPlayer.member.id) {
            i.followUp({
                content: options.opponentsTurnMessage,
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        // Handle different actions
        if (i.customId === 'fight_hit') {
            let damage = Math.floor(Math.random() * 20) + 10;

            // Check for double damage effect
            if (currentPlayer.activeEffects.includes('Double Damage (Next Attack)')) {
                damage *= 2;
                currentPlayer.activeEffects = currentPlayer.activeEffects.filter(effect => effect !== 'Double Damage (Next Attack)');
            }

            // Check for shield effect
            if (opponent.activeEffects.includes('Shield (Next Attack)')) {
                damage = Math.floor(damage / 2);
                opponent.activeEffects = opponent.activeEffects.filter(effect => effect !== 'Shield (Next Attack)');
            }

            opponent.health -= damage;
            currentPlayer.coins += 10;

            if (opponent.health <= 0) {
                // Game Over
                const winEmbed = new EmbedBuilder()
                    .setColor(options.embed.color ?? "Blurple")
                    .setDescription(options.winMessage.replace('{{winner}}', currentPlayer.member.id));
                data.delete(player1.member.id);
                data.delete(player2.member.id);
                await i.editReply({
                    embeds: [winEmbed],
                    components: [],
                    files: []
                });
                collector.stop();
                return;
            }
        } else if (i.customId === 'fight_heal') {
            if (currentPlayer.health >= 80) {
                i.followUp({
                    content: options.highHealthMessage,
                    flags: [MessageFlags.Ephemeral]
                });
                return;
            }

            const healAmount = Math.floor(Math.random() * 20) + 10;
            currentPlayer.health += healAmount;
            if (currentPlayer.health > 100) currentPlayer.health = 100;
        } else if (i.customId === 'fight_surrender') {
            if (currentPlayer.health < 50) {
                i.followUp({
                    content: options.lowHealthMessage,
                    flags: [MessageFlags.Ephemeral]
                });
                return;
            }
            const surrenderCard = await getSurrenderCard(currentPlayer.member, opponent.member);
            const surrenderEmbed = new EmbedBuilder()
                .setColor('Red')
                .setImage('attachment://fight-surrender.png')
                .setTimestamp();
            data.delete(player1.member.id);
            data.delete(player2.member.id);
            await i.editReply({
                embeds: [surrenderEmbed],
                components: [],
                files: [surrenderCard]
            });
            collector.stop();
            return;
        } else if (i.customId.startsWith('powerup_')) {
            const powerupId = i.customId.split('_')[1];
            const powerup = POWERUPS.find(p => p.id === powerupId);

            if (powerup && currentPlayer.coins >= powerup.cost) {
                currentPlayer.coins -= powerup.cost;
                const effectMessage = powerup.effect(currentPlayer, opponent);
                await i.followUp({
                    content: effectMessage,
                    flags: [MessageFlags.Ephemeral]
                });
            } else {
                await i.followUp({
                    content: "You don't have enough coins for this powerup!",
                    flags: [MessageFlags.Ephemeral]
                });
                return;
            }
        }

        // Switch turns
        [currentPlayer, opponent] = [opponent, currentPlayer];

        // Update game state
        const newGameCard = await getMainCard(player1, player2);
        const newGameEmbed = new EmbedBuilder()
            .setColor(options.embed.color ?? "Blurple")
            .setImage("attachment://fight-status.png")
            .setDescription(`It's ${currentPlayer.member.username}'s turn!`);

        await i.editReply({
            embeds: [newGameEmbed],
            files: [newGameCard],
            components: [actionRow, powerupRow]
        });
    });
}

export default Fight;