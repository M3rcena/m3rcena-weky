import chalk from "chalk";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Canvas, loadImage } from "@napi-rs/canvas";
import { checkPackageUpdates } from "../functions/functions.js";
import { OptionsChecking } from "../functions/OptionChecking.js";
const data = new Set();
const Fight = async (options) => {
    return console.log("UNDER DEVELOPMENT");
    OptionsChecking(options, "Fight");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " No interaction provided.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    ;
    if (!interaction.guild) {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Guild is not available in this interaction.");
    }
    ;
    if (!interaction.channel || !interaction.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Channel is not available in this interaction.");
    }
    ;
    if (!options.buttons)
        options.buttons = {};
    if (typeof options.buttons !== "object") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Buttons must be an object.");
    }
    ;
    if (!options.buttons.hit)
        options.buttons.hit = "Hit";
    if (typeof options.buttons.hit !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Hit button text must be a string.");
    }
    ;
    if (!options.buttons.heal)
        options.buttons.heal = "Heal";
    if (typeof options.buttons.heal !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Heal button text must be a string.");
    }
    ;
    if (!options.buttons.cancel)
        options.buttons.cancel = "Surrender";
    if (typeof options.buttons.cancel !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Cancel button text must be a string.");
    }
    ;
    if (!options.buttons.accept)
        options.buttons.accept = "Accept";
    if (typeof options.buttons.accept !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Accept button text must be a string.");
    }
    ;
    if (!options.buttons.deny)
        options.buttons.deny = "Deny";
    if (typeof options.buttons.deny !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Deny button text must be a string.");
    }
    ;
    if (!options.acceptMessage)
        options.acceptMessage = "<@{{challenger}}> has challenged <@{{opponent}}> for a fight!";
    if (typeof options.acceptMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Accept message must be a string.");
    }
    ;
    if (!options.winMessage)
        options.winMessage = "GG, <@{{winner}}> won the fight!";
    if (typeof options.winMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Win message must be a string.");
    }
    ;
    if (!options.endMessage)
        options.endMessage = "<@{{opponent}}> didn't answer in time. So, I dropped the game!";
    if (typeof options.endMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " End message must be a string.");
    }
    ;
    if (!options.cancelMessage)
        options.cancelMessage = "<@{{opponent}}> refused to have a fight with you!";
    if (typeof options.cancelMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Cancel message must be a string.");
    }
    ;
    if (!options.fightMessage)
        options.fightMessage = "{{player}} you go first!";
    if (typeof options.fightMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Fight message must be a string.");
    }
    ;
    if (!options.othersMessage)
        options.othersMessage = "Only {{author}} can use the buttons!";
    if (typeof options.othersMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Others message must be a string.");
    }
    ;
    if (!options.opponentsTurnMessage)
        options.opponentsTurnMessage = "Please wait for your opponents move!";
    if (typeof options.opponentsTurnMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Opponents turn message must be a string.");
    }
    ;
    if (!options.highHealthMessage)
        options.highHealthMessage = "You cannot heal if your HP is above 80!";
    if (typeof options.highHealthMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " High health message must be a string.");
    }
    ;
    if (!options.lowHealthMessage)
        options.lowHealthMessage = "You cannot cancel the fight if your HP is below 50!";
    if (typeof options.lowHealthMessage !== "string") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Low health message must be a string.");
    }
    ;
    if (!options.returnWinner)
        options.returnWinner = false;
    if (typeof options.returnWinner !== "boolean") {
        throw new TypeError(chalk.red("[@m3rcena/weky] Fight Error:") + " Return winner must be a boolean.");
    }
    ;
    if (!options.opponent) {
        throw new Error(chalk.red("[@m3rcena/weky] Fight Error:") + " Opponent is missing from the options.");
    }
    ;
    if (!options.opponent.username) {
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
    }
    ;
    if (data.has(id) || data.has(options.opponent.id))
        return;
    data.add(id);
    data.add(options.opponent.id);
    const challenger = interaction.author || interaction.user;
    const opponent = options.opponent;
    const requestCard = await getRequestCard(challenger, opponent);
    const embed = new EmbedBuilder()
        .setColor(options.embed.color ? options.embed.color : "Blurple")
        .setImage("attachment://fight-request.png")
        .setTimestamp(options.embed.timestamp);
    const msg = await interaction.reply({
        embeds: [embed],
        files: [requestCard],
    });
    checkPackageUpdates("Fight", options.notifyUpdate);
};
async function getRequestCard(challenger, opponent) {
    // Create canvas with 800x250 dimensions
    const canvas = new Canvas(800, 250);
    const ctx = canvas.getContext('2d');
    // Set blurple background
    ctx.fillStyle = '#5865F2'; // Discord blurple color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Add decorative elements
    ctx.fillStyle = '#4752C4'; // Darker blurple for design
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(800, 0);
    ctx.lineTo(800, 50);
    ctx.lineTo(0, 80);
    ctx.closePath();
    ctx.fill();
    // Add title text
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('FIGHT REQUEST', 400, 45);
    // Load and draw avatars
    const [challengerAvatar, opponentAvatar] = await Promise.all([
        loadImage(challenger.displayAvatarURL({ extension: 'png', size: 256 })),
        loadImage(opponent.displayAvatarURL({ extension: 'png', size: 256 }))
    ]);
    // Draw challenger avatar (left)
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 125, 80, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(challengerAvatar, 120, 45, 160, 160);
    ctx.restore();
    // Draw opponent avatar (right)
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 125, 80, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(opponentAvatar, 520, 45, 160, 160);
    ctx.restore();
    // Draw VS text with shadow
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#4752C4';
    ctx.fillText('VS', 402, 147); // Shadow
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('VS', 400, 145);
    // Draw names with titles
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('CHALLENGER', 200, 190);
    ctx.fillText('OPPONENT', 600, 190);
    ctx.font = '24px Arial';
    ctx.fillText(challenger.username, 200, 220);
    ctx.fillText(opponent.username, 600, 220);
    return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: 'fight-request.png' });
}
async function getMainCard(player1, player2) {
    const canvas = new Canvas(1000, 300);
    const ctx = canvas.getContext('2d');
    // Set background
    ctx.fillStyle = '#2F3136';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Load avatars
    const [avatar1, avatar2] = await Promise.all([
        loadImage(player1.member.displayAvatarURL({ extension: 'png', size: 256 })),
        loadImage(player2.member.displayAvatarURL({ extension: 'png', size: 256 }))
    ]);
    // Draw player 1 section (left)
    ctx.drawImage(avatar1, 50, 50, 100, 100);
    // Health bar player 1
    ctx.fillStyle = '#3B3B3B';
    ctx.fillRect(170, 60, 300, 30);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(170, 60, (player1.health / 100) * 300, 30);
    // Player 1 stats
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${player1.member.username} - HP: ${player1.health}`, 170, 120);
    ctx.fillText(`Coins: ${player1.coins}`, 170, 145);
    // Draw player 2 section (right)
    ctx.drawImage(avatar2, 850, 50, 100, 100);
    // Health bar player 2
    ctx.fillStyle = '#3B3B3B';
    ctx.fillRect(530, 60, 300, 30);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(530, 60, (player2.health / 100) * 300, 30);
    // Player 2 stats
    ctx.textAlign = 'right';
    ctx.fillText(`${player2.member.username} - HP: ${player2.health}`, 830, 120);
    ctx.fillText(`Coins: ${player2.coins}`, 830, 145);
    // Draw active effects
    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    ctx.fillText('Active Effects:', 50, 200);
    player1.activeEffects.forEach((effect, i) => {
        ctx.fillText(`• ${effect}`, 50, 225 + (i * 25));
    });
    ctx.textAlign = 'right';
    ctx.fillText('Active Effects:', 950, 200);
    player2.activeEffects.forEach((effect, i) => {
        ctx.fillText(`• ${effect}`, 950, 225 + (i * 25));
    });
    return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: 'fight-status.png' });
}
export default Fight;
