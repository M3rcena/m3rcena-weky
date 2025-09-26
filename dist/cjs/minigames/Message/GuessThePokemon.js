"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const builders_1 = require("@discordjs/builders");
const functions_js_1 = require("../../functions/functions.js");
const OptionChecking_js_1 = require("../../functions/OptionChecking.js");
const gameData = new Set();
const GuessThePokemon = async (options) => {
    (0, OptionChecking_js_1.OptionsChecking)(options, "GuessThePokemon");
    let message = options.message;
    if (!message)
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessThePokemon Error:") + " No Message provided.");
    if (!message.channel || !message.channel.isSendable())
        throw new Error(chalk_1.default.red("[@m3rcena/weky] GuessThePokemon Error:") + " No channel found.");
    const userId = message.author.id;
    if (gameData.has(userId))
        return;
    gameData.add(userId);
    const id = (0, functions_js_1.getRandomString)(20) +
        "-" +
        (0, functions_js_1.getRandomString)(20) +
        "-" +
        (0, functions_js_1.getRandomString)(20) +
        "-" +
        (0, functions_js_1.getRandomString)(20);
    const think = await message.reply({
        embeds: [
            (0, functions_js_1.createEmbed)(options.embed)
                .setTitle(`${options.thinkMessage}...`)
                .setDescription(``)
        ]
    });
    const randomNumber = Math.floor(Math.random() * 801);
    const data = await (0, node_fetch_1.default)(`http://pokeapi.co/api/v2/pokemon/${randomNumber}`).then(res => res.json());
    const abilities = data.abilities.map(item => item.ability.name);
    const seperatedAbilities = abilities.join(', ');
    const types = data.types.map(item => item.type.name);
    const seperatedTypes = types.join(', ');
    let btn1 = new builders_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setLabel(options.buttonText ?? "Cancel")
        .setCustomId(id);
    const embed = (0, functions_js_1.createEmbed)(options.embed)
        .setDescription(options.embed.description
        .replace('{{type}}', seperatedTypes)
        .replace('{{abilities}}', seperatedAbilities)
        .replace('{{time}}', (0, functions_js_1.convertTime)(options.time)) ??
        '**Type:**\n{{type}}\n\n**Abilities:**\n{{abilities}}\n\nYou only have **{{time}}** to guess the pokémon.'
            .replace('{{type}}', seperatedTypes)
            .replace('{{abilities}}', seperatedAbilities)
            .replace('{{time}}', (0, functions_js_1.convertTime)(options.time)));
    await think.edit({
        embeds: [embed],
        components: [{ type: 1, components: [btn1] }],
    });
    const gameCreatedAt = Date.now();
    const collector = await message.channel.createMessageCollector({
        filter: m => m.author.id === userId,
        time: options.time ?? 60000,
    });
    collector.on('collect', async (msg) => {
        if (msg.content.toLowerCase() === data.name) {
            const _embed = (0, functions_js_1.createEmbed)(options.embed)
                .setDescription(options.winMessage
                .replace('{{answer}}', data.name.charAt(0).toUpperCase() + data.name.slice(1))
                .replace('{{time}}', (0, functions_js_1.convertTime)(Date.now() - gameCreatedAt)) ?? 'GG, It was a **{{answer}}**. You got it correct in **{{time}}**.'
                .replace('{{answer}}', data.name.charAt(0).toUpperCase() + data.name.slice(1))
                .replace('{{time}}', (0, functions_js_1.convertTime)(Date.now() - gameCreatedAt)))
                .setImage(data.sprites.other.home.front_default);
            await msg.reply({
                embeds: [_embed],
            });
            btn1 = new builders_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ?? "Cancel")
                .setDisabled()
                .setCustomId(id);
            await think.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            collector.stop();
            gameData.delete(userId);
        }
        else {
            const _embed = (0, functions_js_1.createEmbed)(options.embed)
                .setDescription(options.incorrectMessage
                .replace('{{answer}}', msg.content.toLowerCase())
                .replace('{{author}}', msg.author.toString()));
            msg.reply({
                embeds: [_embed],
            }).then(msg => setTimeout(() => msg.delete(), 3000));
        }
    });
    const gameCollector = think.createMessageComponentCollector({
        filter: inter => inter.user.id === userId,
        time: options.time ?? 60000,
    });
    gameCollector.on('collect', async (button) => {
        await button.deferUpdate();
        if (button.customId === id) {
            btn1 = new builders_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ?? "Cancel")
                .setDisabled()
                .setCustomId(id);
            gameCollector.stop();
            collector.stop();
            gameData.delete(userId);
            think.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            const _embed = (0, functions_js_1.createEmbed)(options.embed)
                .setDescription(options.loseMessage.replace('{{answer}}', data.name.charAt(0).toUpperCase() + data.name.slice(1)));
            message.reply({
                embeds: [_embed],
            });
        }
    });
    collector.on('end', async (_msg, reason) => {
        if (reason === 'time') {
            btn1 = new builders_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setLabel(options.buttonText ?? "Cancel")
                .setDisabled()
                .setCustomId(id);
            gameCollector.stop();
            collector.stop();
            gameData.delete(userId);
            think.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            const _embed = (0, functions_js_1.createEmbed)(options.embed)
                .setDescription(options.loseMessage.replace('{{answer}}', data.name.charAt(0).toUpperCase() + data.name.slice(1)));
            message.reply({
                embeds: [_embed],
            });
        }
    });
};
exports.default = GuessThePokemon;
