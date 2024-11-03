'use strict';

var chalk = require('chalk');
var discord_js = require('discord.js');
var mathjs = require('mathjs');
var child_process = require('child_process');
var ofetch = require('ofetch');
var stringWidth = require('string-width');
var util = require('util');
var canvas = require('@napi-rs/canvas');
var htmlEntities = require('html-entities');

function OptionsChecking(options, GameName) {
    const URLPattern = new RegExp("^https:\\/\\/([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(:[0-9]+)?(\\/.*)?$");
    if (!options)
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No options provided.");
    if (typeof options !== "object")
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} TypeError:`) + " Options must be an object.");
    if (!options.interaction)
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No interaction provided.");
    if (typeof options.interaction !== "object") {
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} TypeError:`) + " Interaction must be an object.");
    }
    if (!options.client)
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No client provided.");
    if (!options.client instanceof discord_js.Client) {
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} TypeError:`) + " Client must be a Discord Client.");
    }
    if (!options.embed)
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed options provided.");
    if (typeof options.embed !== "object") {
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed options must be an object.");
    }
    if (!options.embed.color)
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed color provided.");
    if (!options.embed.title)
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed title provided.");
    if (options.embed.title) {
        if (typeof options.embed.title !== "string")
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed title must be a string.");
        if (options.embed.title.length > 256)
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed title length must be less than 256 characters.");
    }
    if (options.embed.url) {
        if (typeof options.embed.url !== "string")
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed URL must be a string.");
        if (!URLPattern.test(options.embed.url))
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed URL must be a valid URL.");
    }
    if (options.embed.author) {
        if (typeof options.embed.author !== "object") {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author must be an object.");
        }
        if (!options.embed.author.name)
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed author name provided.");
        if (options.embed.author.icon_url) {
            if (typeof options.embed.author.icon_url !== "string")
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author icon URL must be a string.");
            else if (!URLPattern.test(options.embed.author.icon_url))
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Invalid embed author icon URL.");
        }
        if (options.embed.author.url) {
            if (typeof options.embed.author.url !== "string")
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author URL must be a string.");
            else if (!URLPattern.test(options.embed.author.url))
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed author URL must be a valid URL.");
        }
    }
    if (options.embed.description) {
        if (typeof options.embed.description !== "string") {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed description must be a string.");
        }
        else if (options.embed.description.length > 4096) {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed description length must less than 4096 characters.");
        }
    }
    if (options.embed.fields) {
        if (!Array.isArray(options.embed.fields)) {
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed fields must be an array.");
        }
        for (const field of options.embed.fields) {
            if (typeof field !== "object") {
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed field must be an object.");
            }
            if (!field.name)
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed field name provided.");
            if (field.name) {
                if (typeof field.name !== "string")
                    throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field name must be a string.");
                if (field.name.length > 256)
                    throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field name must be 256 characters fewer in length.");
            }
            if (!field.value)
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " No embed field value provided.");
            if (field.value) {
                if (typeof field.value !== "string")
                    throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field value must be a string.");
                if (field.value.length > 256)
                    throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Field value must be 1024 characters fewer in length.");
            }
            if (field.inline && typeof field.inline !== "boolean") {
                throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed field inline must be a boolean.");
            }
        }
    }
    if (options.embed.image) {
        if (typeof options.embed.image !== "string")
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed image must be a string.");
        else if (!URLPattern.test(options.embed.image))
            throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed image must be a valid URL.");
    }
    if (options.embed.timestamp && !(options.embed.timestamp instanceof Date)) {
        throw new Error(chalk.red(`[@m3rcena/weky] ${GameName} Error:`) + " Embed timestamp must be a date.");
    }
}

const mini2048 = async (options) => {
    OptionsChecking(options, "2048");
    let interaction = options.interaction;
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No interaction provided.");
    options.client;
    if (!interaction.channel)
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No channel found on Interaction.");
    if (!interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " Channel is not sendable.");
    if (!interaction.guild)
        throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + " No guild found on Interaction.");
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    const msg = await interaction.reply({ content: "Starting the game...", fetchReply: true, allowedMentions: { repliedUser: false } });
    const gameData = await fetch(`https://weky.miv4.com/api/2048/new`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id,
            guild: interaction.guild.id,
            channel: interaction.channel.id,
            message: msg.id,
        })
    }).then(res => res.json());
    if (gameData.error && gameData.error !== "Id already exists") {
        if (msg.editable) {
            const embed = new discord_js.EmbedBuilder()
                .setTitle("Failed to start the game.")
                .setDescription(`\`\`\`${gameData.error}\`\`\``)
                .setColor("Red")
                .setTimestamp(new Date());
            return await msg.edit({ content: ``, embeds: [embed] });
        }
    }
    else if (gameData.error && gameData.error === "Id already exists") {
        const embed = new discord_js.EmbedBuilder()
            .setTitle("Failed to start the game.")
            .setDescription(`You already have a game running!`)
            .setColor("Red")
            .setTimestamp(new Date());
        new discord_js.ButtonBuilder()
            .setStyle(discord_js.ButtonStyle.Danger)
            .setLabel("Quit Game")
            .setCustomId("quit")
            .setEmoji("🛑");
        const msg = await interaction.reply({ content: ``, embeds: [embed], ephemeral: true });
        const collector = msg.createMessageComponentCollector({
            time: 60000,
            componentType: discord_js.ComponentType.Button
        });
        collector.on("collect", async (btn) => {
            if (btn.user.id !== id) {
                return btn.reply({ content: "This is not your game!", ephemeral: true });
            }
            if (btn.customId === "quit") {
                collector.stop("quit");
            }
        });
        collector.on("end", async (_, reason) => {
            if (reason === "quit") {
                const del = await fetch(`https://weky.miv4.com/api/2048/${id}/quit`, {
                    method: "GET"
                }).then(res => res.json());
                if (del.error) {
                    throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + ` Failed to delete the game data: ${del.error}`);
                }
                const embed = new discord_js.EmbedBuilder()
                    .setTitle("Game Stopped!")
                    .setDescription(`You have stopped the game.`)
                    .setColor("Red")
                    .setTimestamp(new Date());
                return await msg.edit({ content: ``, embeds: [embed], components: [] }).catch(() => { });
            }
            return msg.delete().catch(() => { });
        });
    }
    const img = new discord_js.AttachmentBuilder(Buffer.from(gameData.grid), {
        name: "2048.png"
    });
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title || "2048 Game")
        .setDescription(options.embed.description?.replace(`{{score}}`, `${gameData.data.score}`).replace(`{{id}}`, `${gameData.data.id}`) || `ID: \`${gameData.data.id}\`\nScore: \`${gameData.data.score}\``)
        .setImage(`attachment://2048.png`)
        .setColor(options.embed.color || "Blurple")
        .setTimestamp(options.embed.timestamp ? new Date() : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    const up = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.up || "⬆️" : "⬆️")
        .setCustomId("up");
    const down = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.down || "⬇️" : "⬇️")
        .setCustomId("down");
    const left = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.left || "⬅️" : "⬅️")
        .setCustomId("left");
    const right = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Secondary)
        .setLabel(options.emojis ? options.emojis.right || "➡️" : "➡️")
        .setCustomId("right");
    const stop = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Danger)
        .setLabel("Quit Game")
        .setCustomId("quit")
        .setEmoji("🛑");
    const row = new discord_js.ActionRowBuilder().addComponents(left, up, down, right);
    const row2 = new discord_js.ActionRowBuilder().addComponents(stop);
    if (!msg.editable)
        return;
    await msg.edit({
        content: `React with the buttons to play the game!`,
        embeds: [embed],
        components: [row, row2],
        files: [img]
    });
    const collector = msg.createMessageComponentCollector({
        time: options.time || 600_000,
        componentType: discord_js.ComponentType.Button
    });
    collector.on("collect", async (btn) => {
        if (btn.user.id !== id) {
            return btn.reply({ content: "This is not your game!", ephemeral: true });
        }
        if (btn.customId === "quit") {
            return collector.stop("quit");
        }
        const data = await fetch(`https://weky.miv4.com/api/2048/${btn.user.id}/${btn.customId}`, {
            method: "GET"
        }).then(res => res.json());
        if (data.error) {
            const embed = new discord_js.EmbedBuilder()
                .setTitle("Failed to make a move.")
                .setDescription(`\`\`\`${data.error}\`\`\``)
                .setColor("Red")
                .setTimestamp(new Date());
            return await btn.reply({ content: ``, embeds: [embed] });
        }
        if (data.gameover) {
            return collector.stop("gameover");
        }
        const img = new discord_js.AttachmentBuilder(Buffer.from(data.data.grid), {
            name: "2048.png"
        });
        const embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title || "2048 Game")
            .setDescription(options.embed.description?.replace(`{{score}}`, `${data.data.score}`).replace(`{{id}}`, `${data.data.id}`) || `ID: \`${data.data.id}\`\nScore: \`${data.data.score}\``)
            .setImage(`attachment://2048.png`)
            .setColor(options.embed.color || "Blurple")
            .setTimestamp(options.embed.timestamp ? new Date() : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.author) {
            embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        await btn.update({
            content: ``,
            embeds: [embed],
            components: [row, row2],
            files: [img]
        });
    });
    collector.on("end", async (_, reason) => {
        const data = await fetch(`https://weky.miv4.com/api/2048/${id}/get`, {
            method: "GET"
        }).then(res => res.json());
        const img = new discord_js.AttachmentBuilder(Buffer.from(data.grid), {
            name: "2048.png"
        });
        const score = data.data.score;
        embed.setTitle("Game Over!")
            .setDescription(`You scored \`${score}\` points!`)
            .setImage(`attachment://2048.png`)
            .setColor("Red");
        await msg.edit({
            content: ``,
            embeds: [embed],
            components: [],
            files: [img]
        });
        const del = await fetch(`https://weky.miv4.com/api/2048/${id}/quit`, {
            method: "GET"
        }).then(res => res.json());
        if (del.error) {
            throw new Error(chalk.red("[@m3rcena/weky] 2048 Error:") + ` Failed to delete the game data: ${del.error}`);
        }
    });
};

var words = [
	"ability",
	"able",
	"aboard",
	"about",
	"above",
	"accept",
	"accident",
	"according",
	"account",
	"accurate",
	"acres",
	"across",
	"act",
	"action",
	"active",
	"activity",
	"actual",
	"actually",
	"add",
	"addition",
	"additional",
	"adjective",
	"adult",
	"adventure",
	"advice",
	"affect",
	"afraid",
	"after",
	"afternoon",
	"again",
	"against",
	"age",
	"ago",
	"agree",
	"ahead",
	"aid",
	"air",
	"airplane",
	"alike",
	"alive",
	"all",
	"allow",
	"almost",
	"alone",
	"along",
	"aloud",
	"alphabet",
	"already",
	"also",
	"although",
	"am",
	"among",
	"amount",
	"ancient",
	"angle",
	"angry",
	"animal",
	"announced",
	"another",
	"answer",
	"ants",
	"any",
	"anybody",
	"anyone",
	"anything",
	"anyway",
	"anywhere",
	"apart",
	"apartment",
	"appearance",
	"apple",
	"applied",
	"appropriate",
	"are",
	"area",
	"arm",
	"army",
	"around",
	"arrange",
	"arrangement",
	"arrive",
	"arrow",
	"art",
	"article",
	"as",
	"aside",
	"ask",
	"asleep",
	"at",
	"ate",
	"atmosphere",
	"atom",
	"atomic",
	"attached",
	"attack",
	"attempt",
	"attention",
	"audience",
	"author",
	"automobile",
	"available",
	"average",
	"avoid",
	"aware",
	"away",
	"baby",
	"back",
	"bad",
	"badly",
	"bag",
	"balance",
	"ball",
	"balloon",
	"band",
	"bank",
	"bar",
	"bare",
	"bark",
	"barn",
	"base",
	"baseball",
	"basic",
	"basis",
	"basket",
	"bat",
	"battle",
	"be",
	"bean",
	"bear",
	"beat",
	"beautiful",
	"beauty",
	"became",
	"because",
	"become",
	"becoming",
	"bee",
	"been",
	"before",
	"began",
	"beginning",
	"begun",
	"behavior",
	"behind",
	"being",
	"believed",
	"bell",
	"belong",
	"below",
	"belt",
	"bend",
	"beneath",
	"bent",
	"beside",
	"best",
	"bet",
	"better",
	"between",
	"beyond",
	"bicycle",
	"bigger",
	"biggest",
	"bill",
	"birds",
	"birth",
	"birthday",
	"bit",
	"bite",
	"black",
	"blank",
	"blanket",
	"blew",
	"blind",
	"block",
	"blood",
	"blow",
	"blue",
	"board",
	"boat",
	"body",
	"bone",
	"book",
	"border",
	"born",
	"both",
	"bottle",
	"bottom",
	"bound",
	"bow",
	"bowl",
	"box",
	"boy",
	"brain",
	"branch",
	"brass",
	"brave",
	"bread",
	"break",
	"breakfast",
	"breath",
	"breathe",
	"breathing",
	"breeze",
	"brick",
	"bridge",
	"brief",
	"bright",
	"bring",
	"broad",
	"broke",
	"broken",
	"brother",
	"brought",
	"brown",
	"brush",
	"buffalo",
	"build",
	"building",
	"built",
	"buried",
	"burn",
	"burst",
	"bus",
	"bush",
	"business",
	"busy",
	"but",
	"butter",
	"buy",
	"by",
	"cabin",
	"cage",
	"cake",
	"call",
	"calm",
	"came",
	"camera",
	"camp",
	"can",
	"canal",
	"cannot",
	"cap",
	"capital",
	"captain",
	"captured",
	"car",
	"carbon",
	"card",
	"care",
	"careful",
	"carefully",
	"carried",
	"carry",
	"case",
	"cast",
	"castle",
	"cat",
	"catch",
	"cattle",
	"caught",
	"cause",
	"cave",
	"cell",
	"cent",
	"center",
	"central",
	"century",
	"certain",
	"certainly",
	"chain",
	"chair",
	"chamber",
	"chance",
	"change",
	"changing",
	"chapter",
	"character",
	"characteristic",
	"charge",
	"chart",
	"check",
	"cheese",
	"chemical",
	"chest",
	"chicken",
	"chief",
	"child",
	"children",
	"choice",
	"choose",
	"chose",
	"chosen",
	"church",
	"circle",
	"circus",
	"citizen",
	"city",
	"class",
	"classroom",
	"claws",
	"clay",
	"clean",
	"clear",
	"clearly",
	"climate",
	"climb",
	"clock",
	"close",
	"closely",
	"closer",
	"cloth",
	"clothes",
	"clothing",
	"cloud",
	"club",
	"coach",
	"coal",
	"coast",
	"coat",
	"coffee",
	"cold",
	"collect",
	"college",
	"colony",
	"color",
	"column",
	"combination",
	"combine",
	"come",
	"comfortable",
	"coming",
	"command",
	"common",
	"community",
	"company",
	"compare",
	"compass",
	"complete",
	"completely",
	"complex",
	"composed",
	"composition",
	"compound",
	"concerned",
	"condition",
	"congress",
	"connected",
	"consider",
	"consist",
	"consonant",
	"constantly",
	"construction",
	"contain",
	"continent",
	"continued",
	"contrast",
	"control",
	"conversation",
	"cook",
	"cookies",
	"cool",
	"copper",
	"copy",
	"corn",
	"corner",
	"correct",
	"correctly",
	"cost",
	"cotton",
	"could",
	"count",
	"country",
	"couple",
	"courage",
	"course",
	"court",
	"cover",
	"cow",
	"cowboy",
	"crack",
	"cream",
	"create",
	"creature",
	"crew",
	"crop",
	"cross",
	"crowd",
	"cry",
	"cup",
	"curious",
	"current",
	"curve",
	"customs",
	"cut",
	"cutting",
	"daily",
	"damage",
	"dance",
	"danger",
	"dangerous",
	"dark",
	"darkness",
	"date",
	"daughter",
	"dawn",
	"day",
	"dead",
	"deal",
	"dear",
	"death",
	"decide",
	"declared",
	"deep",
	"deeply",
	"deer",
	"definition",
	"degree",
	"depend",
	"depth",
	"describe",
	"desert",
	"design",
	"desk",
	"detail",
	"determine",
	"develop",
	"development",
	"diagram",
	"diameter",
	"did",
	"die",
	"differ",
	"difference",
	"different",
	"difficult",
	"difficulty",
	"dig",
	"dinner",
	"direct",
	"direction",
	"directly",
	"dirt",
	"dirty",
	"disappear",
	"discover",
	"discovery",
	"discuss",
	"discussion",
	"disease",
	"dish",
	"distance",
	"distant",
	"divide",
	"division",
	"do",
	"doctor",
	"does",
	"dog",
	"doing",
	"doll",
	"dollar",
	"done",
	"donkey",
	"door",
	"dot",
	"double",
	"doubt",
	"down",
	"dozen",
	"draw",
	"drawn",
	"dream",
	"dress",
	"drew",
	"dried",
	"drink",
	"drive",
	"driven",
	"driver",
	"driving",
	"drop",
	"dropped",
	"drove",
	"dry",
	"duck",
	"due",
	"dug",
	"dull",
	"during",
	"dust",
	"duty",
	"each",
	"eager",
	"ear",
	"earlier",
	"early",
	"earn",
	"earth",
	"easier",
	"easily",
	"east",
	"easy",
	"eat",
	"eaten",
	"edge",
	"education",
	"effect",
	"effort",
	"egg",
	"eight",
	"either",
	"electric",
	"electricity",
	"element",
	"elephant",
	"eleven",
	"else",
	"empty",
	"end",
	"enemy",
	"energy",
	"engine",
	"engineer",
	"enjoy",
	"enough",
	"enter",
	"entire",
	"entirely",
	"environment",
	"equal",
	"equally",
	"equator",
	"equipment",
	"escape",
	"especially",
	"essential",
	"establish",
	"even",
	"evening",
	"event",
	"eventually",
	"ever",
	"every",
	"everybody",
	"everyone",
	"everything",
	"everywhere",
	"evidence",
	"exact",
	"exactly",
	"examine",
	"example",
	"excellent",
	"except",
	"exchange",
	"excited",
	"excitement",
	"exciting",
	"exclaimed",
	"exercise",
	"exist",
	"expect",
	"experience",
	"experiment",
	"explain",
	"explanation",
	"explore",
	"express",
	"expression",
	"extra",
	"eye",
	"face",
	"facing",
	"fact",
	"factor",
	"factory",
	"failed",
	"fair",
	"fairly",
	"fall",
	"fallen",
	"familiar",
	"family",
	"famous",
	"far",
	"farm",
	"farmer",
	"farther",
	"fast",
	"fastened",
	"faster",
	"fat",
	"father",
	"favorite",
	"fear",
	"feathers",
	"feature",
	"fed",
	"feed",
	"feel",
	"feet",
	"fell",
	"fellow",
	"felt",
	"fence",
	"few",
	"fewer",
	"field",
	"fierce",
	"fifteen",
	"fifth",
	"fifty",
	"fight",
	"fighting",
	"figure",
	"fill",
	"film",
	"final",
	"finally",
	"find",
	"fine",
	"finest",
	"finger",
	"finish",
	"fire",
	"fireplace",
	"firm",
	"first",
	"fish",
	"five",
	"fix",
	"flag",
	"flame",
	"flat",
	"flew",
	"flies",
	"flight",
	"floating",
	"floor",
	"flow",
	"flower",
	"fly",
	"fog",
	"folks",
	"follow",
	"food",
	"foot",
	"football",
	"for",
	"force",
	"foreign",
	"forest",
	"forget",
	"forgot",
	"forgotten",
	"form",
	"former",
	"fort",
	"forth",
	"forty",
	"forward",
	"fought",
	"found",
	"four",
	"fourth",
	"fox",
	"frame",
	"free",
	"freedom",
	"frequently",
	"fresh",
	"friend",
	"friendly",
	"frighten",
	"frog",
	"from",
	"front",
	"frozen",
	"fruit",
	"fuel",
	"full",
	"fully",
	"fun",
	"function",
	"funny",
	"fur",
	"furniture",
	"further",
	"future",
	"gain",
	"game",
	"garage",
	"garden",
	"gas",
	"gasoline",
	"gate",
	"gather",
	"gave",
	"general",
	"generally",
	"gentle",
	"gently",
	"get",
	"getting",
	"giant",
	"gift",
	"girl",
	"give",
	"given",
	"giving",
	"glad",
	"glass",
	"globe",
	"go",
	"goes",
	"gold",
	"golden",
	"gone",
	"good",
	"goose",
	"got",
	"government",
	"grabbed",
	"grade",
	"gradually",
	"grain",
	"grandfather",
	"grandmother",
	"graph",
	"grass",
	"gravity",
	"gray",
	"great",
	"greater",
	"greatest",
	"greatly",
	"green",
	"grew",
	"ground",
	"group",
	"grow",
	"grown",
	"growth",
	"guard",
	"guess",
	"guide",
	"gulf",
	"gun",
	"habit",
	"had",
	"hair",
	"half",
	"halfway",
	"hall",
	"hand",
	"handle",
	"handsome",
	"hang",
	"happen",
	"happened",
	"happily",
	"happy",
	"harbor",
	"hard",
	"harder",
	"hardly",
	"has",
	"hat",
	"have",
	"having",
	"hay",
	"he",
	"headed",
	"heading",
	"health",
	"heard",
	"hearing",
	"heart",
	"heat",
	"heavy",
	"height",
	"held",
	"hello",
	"help",
	"helpful",
	"her",
	"herd",
	"here",
	"herself",
	"hidden",
	"hide",
	"high",
	"higher",
	"highest",
	"highway",
	"hill",
	"him",
	"himself",
	"his",
	"history",
	"hit",
	"hold",
	"hole",
	"hollow",
	"home",
	"honor",
	"hope",
	"horn",
	"horse",
	"hospital",
	"hot",
	"hour",
	"house",
	"how",
	"however",
	"huge",
	"human",
	"hundred",
	"hung",
	"hungry",
	"hunt",
	"hunter",
	"hurried",
	"hurry",
	"hurt",
	"husband",
	"ice",
	"idea",
	"identity",
	"if",
	"ill",
	"image",
	"imagine",
	"immediately",
	"importance",
	"important",
	"impossible",
	"improve",
	"in",
	"inch",
	"include",
	"including",
	"income",
	"increase",
	"indeed",
	"independent",
	"indicate",
	"individual",
	"industrial",
	"industry",
	"influence",
	"information",
	"inside",
	"instance",
	"instant",
	"instead",
	"instrument",
	"interest",
	"interior",
	"into",
	"introduced",
	"invented",
	"involved",
	"iron",
	"is",
	"island",
	"it",
	"its",
	"itself",
	"jack",
	"jar",
	"jet",
	"job",
	"join",
	"joined",
	"journey",
	"joy",
	"judge",
	"jump",
	"jungle",
	"just",
	"keep",
	"kept",
	"key",
	"kids",
	"kill",
	"kind",
	"kitchen",
	"knew",
	"knife",
	"know",
	"knowledge",
	"known",
	"label",
	"labor",
	"lack",
	"lady",
	"laid",
	"lake",
	"lamp",
	"land",
	"language",
	"large",
	"larger",
	"largest",
	"last",
	"late",
	"later",
	"laugh",
	"law",
	"lay",
	"layers",
	"lead",
	"leader",
	"leaf",
	"learn",
	"least",
	"leather",
	"leave",
	"leaving",
	"led",
	"left",
	"leg",
	"length",
	"lesson",
	"let",
	"letter",
	"level",
	"library",
	"lie",
	"life",
	"lift",
	"light",
	"like",
	"likely",
	"limited",
	"line",
	"lion",
	"lips",
	"liquid",
	"list",
	"listen",
	"little",
	"live",
	"living",
	"load",
	"local",
	"locate",
	"location",
	"log",
	"lonely",
	"long",
	"longer",
	"look",
	"loose",
	"lose",
	"loss",
	"lost",
	"lot",
	"loud",
	"love",
	"lovely",
	"low",
	"lower",
	"luck",
	"lucky",
	"lunch",
	"lungs",
	"lying",
	"machine",
	"machinery",
	"mad",
	"made",
	"magic",
	"magnet",
	"mail",
	"main",
	"mainly",
	"major",
	"make",
	"making",
	"man",
	"managed",
	"manner",
	"manufacturing",
	"many",
	"map",
	"mark",
	"market",
	"married",
	"mass",
	"massage",
	"master",
	"material",
	"mathematics",
	"matter",
	"may",
	"maybe",
	"me",
	"meal",
	"mean",
	"means",
	"meant",
	"measure",
	"meat",
	"medicine",
	"meet",
	"melted",
	"member",
	"memory",
	"men",
	"mental",
	"merely",
	"met",
	"metal",
	"method",
	"mice",
	"middle",
	"might",
	"mighty",
	"mile",
	"military",
	"milk",
	"mill",
	"mind",
	"mine",
	"minerals",
	"minute",
	"mirror",
	"missing",
	"mission",
	"mistake",
	"mix",
	"mixture",
	"model",
	"modern",
	"molecular",
	"moment",
	"money",
	"monkey",
	"month",
	"mood",
	"moon",
	"more",
	"morning",
	"most",
	"mostly",
	"mother",
	"motion",
	"motor",
	"mountain",
	"mouse",
	"mouth",
	"move",
	"movement",
	"movie",
	"moving",
	"mud",
	"muscle",
	"music",
	"musical",
	"must",
	"my",
	"myself",
	"mysterious",
	"nails",
	"name",
	"nation",
	"national",
	"native",
	"natural",
	"naturally",
	"nature",
	"near",
	"nearby",
	"nearer",
	"nearest",
	"nearly",
	"necessary",
	"neck",
	"needed",
	"needle",
	"needs",
	"negative",
	"neighbor",
	"neighborhood",
	"nervous",
	"nest",
	"never",
	"new",
	"news",
	"newspaper",
	"next",
	"nice",
	"night",
	"nine",
	"no",
	"nobody",
	"nodded",
	"noise",
	"none",
	"noon",
	"nor",
	"north",
	"nose",
	"not",
	"note",
	"noted",
	"nothing",
	"notice",
	"noun",
	"now",
	"number",
	"numeral",
	"nuts",
	"object",
	"observe",
	"obtain",
	"occasionally",
	"occur",
	"ocean",
	"of",
	"off",
	"offer",
	"office",
	"officer",
	"official",
	"oil",
	"old",
	"older",
	"oldest",
	"on",
	"once",
	"one",
	"only",
	"onto",
	"open",
	"operation",
	"opinion",
	"opportunity",
	"opposite",
	"or",
	"orange",
	"orbit",
	"order",
	"ordinary",
	"organization",
	"organized",
	"origin",
	"original",
	"other",
	"ought",
	"our",
	"ourselves",
	"out",
	"outer",
	"outline",
	"outside",
	"over",
	"own",
	"owner",
	"oxygen",
	"pack",
	"package",
	"page",
	"paid",
	"pain",
	"paint",
	"pair",
	"palace",
	"pale",
	"pan",
	"paper",
	"paragraph",
	"parallel",
	"parent",
	"park",
	"part",
	"particles",
	"particular",
	"particularly",
	"partly",
	"parts",
	"party",
	"pass",
	"passage",
	"past",
	"path",
	"pattern",
	"pay",
	"peace",
	"pen",
	"pencil",
	"people",
	"per",
	"percent",
	"perfect",
	"perfectly",
	"perhaps",
	"period",
	"person",
	"personal",
	"pet",
	"phrase",
	"physical",
	"piano",
	"pick",
	"picture",
	"pictured",
	"pie",
	"piece",
	"pig",
	"pile",
	"pilot",
	"pine",
	"pink",
	"pipe",
	"pitch",
	"place",
	"plain",
	"plan",
	"plane",
	"planet",
	"planned",
	"planning",
	"plant",
	"plastic",
	"plate",
	"plates",
	"play",
	"pleasant",
	"please",
	"pleasure",
	"plenty",
	"plural",
	"plus",
	"pocket",
	"poem",
	"poet",
	"poetry",
	"point",
	"pole",
	"police",
	"policeman",
	"political",
	"pond",
	"pony",
	"pool",
	"poor",
	"popular",
	"population",
	"porch",
	"port",
	"position",
	"positive",
	"possible",
	"possibly",
	"post",
	"pot",
	"potatoes",
	"pound",
	"pour",
	"powder",
	"power",
	"powerful",
	"practical",
	"practice",
	"prepare",
	"present",
	"president",
	"press",
	"pressure",
	"pretty",
	"prevent",
	"previous",
	"price",
	"pride",
	"primitive",
	"principal",
	"principle",
	"printed",
	"private",
	"prize",
	"probably",
	"problem",
	"process",
	"produce",
	"product",
	"production",
	"program",
	"progress",
	"promised",
	"proper",
	"properly",
	"property",
	"protection",
	"proud",
	"prove",
	"provide",
	"public",
	"pull",
	"pupil",
	"pure",
	"purple",
	"purpose",
	"push",
	"put",
	"putting",
	"quarter",
	"queen",
	"question",
	"quick",
	"quickly",
	"quiet",
	"quietly",
	"quite",
	"rabbit",
	"race",
	"radio",
	"railroad",
	"rain",
	"raise",
	"ran",
	"ranch",
	"range",
	"rapidly",
	"rate",
	"rather",
	"raw",
	"rays",
	"reach",
	"read",
	"reader",
	"ready",
	"real",
	"realize",
	"rear",
	"reason",
	"recall",
	"receive",
	"recent",
	"recently",
	"recognize",
	"record",
	"red",
	"refer",
	"refused",
	"region",
	"regular",
	"related",
	"relationship",
	"religious",
	"remain",
	"remarkable",
	"remember",
	"remove",
	"repeat",
	"replace",
	"replied",
	"report",
	"represent",
	"require",
	"research",
	"respect",
	"rest",
	"result",
	"return",
	"review",
	"rhyme",
	"rhythm",
	"rice",
	"rich",
	"ride",
	"riding",
	"right",
	"ring",
	"rise",
	"rising",
	"river",
	"road",
	"roar",
	"rock",
	"rocket",
	"rocky",
	"rod",
	"roll",
	"roof",
	"room",
	"root",
	"rope",
	"rose",
	"rough",
	"round",
	"route",
	"row",
	"rubbed",
	"rubber",
	"rule",
	"ruler",
	"run",
	"running",
	"rush",
	"sad",
	"saddle",
	"safe",
	"safety",
	"said",
	"sail",
	"sale",
	"salmon",
	"salt",
	"same",
	"sand",
	"sang",
	"sat",
	"satellites",
	"satisfied",
	"save",
	"saved",
	"saw",
	"say",
	"scale",
	"scared",
	"scene",
	"school",
	"science",
	"scientific",
	"scientist",
	"score",
	"screen",
	"sea",
	"search",
	"season",
	"seat",
	"second",
	"secret",
	"section",
	"see",
	"seed",
	"seeing",
	"seems",
	"seen",
	"seldom",
	"select",
	"selection",
	"sell",
	"send",
	"sense",
	"sent",
	"sentence",
	"separate",
	"series",
	"serious",
	"serve",
	"service",
	"sets",
	"setting",
	"settle",
	"settlers",
	"seven",
	"several",
	"shade",
	"shadow",
	"shake",
	"shaking",
	"shall",
	"shallow",
	"shape",
	"share",
	"sharp",
	"she",
	"sheep",
	"sheet",
	"shelf",
	"shells",
	"shelter",
	"shine",
	"shinning",
	"ship",
	"shirt",
	"shoe",
	"shoot",
	"shop",
	"shore",
	"short",
	"shorter",
	"shot",
	"should",
	"shoulder",
	"shout",
	"show",
	"shown",
	"shut",
	"sick",
	"sides",
	"sight",
	"sign",
	"signal",
	"silence",
	"silent",
	"silk",
	"silly",
	"silver",
	"similar",
	"simple",
	"simplest",
	"simply",
	"since",
	"sing",
	"single",
	"sink",
	"sister",
	"sit",
	"sitting",
	"situation",
	"six",
	"size",
	"skill",
	"skin",
	"sky",
	"slabs",
	"slave",
	"sleep",
	"slept",
	"slide",
	"slight",
	"slightly",
	"slip",
	"slipped",
	"slope",
	"slow",
	"slowly",
	"small",
	"smaller",
	"smallest",
	"smell",
	"smile",
	"smoke",
	"smooth",
	"snake",
	"snow",
	"so",
	"soap",
	"social",
	"society",
	"soft",
	"softly",
	"soil",
	"solar",
	"sold",
	"soldier",
	"solid",
	"solution",
	"solve",
	"some",
	"somebody",
	"somehow",
	"someone",
	"something",
	"sometime",
	"somewhere",
	"son",
	"song",
	"soon",
	"sort",
	"sound",
	"source",
	"south",
	"southern",
	"space",
	"speak",
	"special",
	"species",
	"specific",
	"speech",
	"speed",
	"spell",
	"spend",
	"spent",
	"spider",
	"spin",
	"spirit",
	"spite",
	"split",
	"spoken",
	"sport",
	"spread",
	"spring",
	"square",
	"stage",
	"stairs",
	"stand",
	"standard",
	"star",
	"stared",
	"start",
	"state",
	"statement",
	"station",
	"stay",
	"steady",
	"steam",
	"steel",
	"steep",
	"stems",
	"step",
	"stepped",
	"stick",
	"stiff",
	"still",
	"stock",
	"stomach",
	"stone",
	"stood",
	"stop",
	"stopped",
	"store",
	"storm",
	"story",
	"stove",
	"straight",
	"strange",
	"stranger",
	"straw",
	"stream",
	"street",
	"strength",
	"stretch",
	"strike",
	"string",
	"strip",
	"strong",
	"stronger",
	"struck",
	"structure",
	"struggle",
	"stuck",
	"student",
	"studied",
	"studying",
	"subject",
	"substance",
	"success",
	"successful",
	"such",
	"sudden",
	"suddenly",
	"sugar",
	"suggest",
	"suit",
	"sum",
	"summer",
	"sun",
	"sunlight",
	"supper",
	"supply",
	"support",
	"suppose",
	"sure",
	"surface",
	"surprise",
	"surrounded",
	"swam",
	"sweet",
	"swept",
	"swim",
	"swimming",
	"swing",
	"swung",
	"syllable",
	"symbol",
	"system",
	"table",
	"tail",
	"take",
	"taken",
	"tales",
	"talk",
	"tall",
	"tank",
	"tape",
	"task",
	"taste",
	"taught",
	"tax",
	"tea",
	"teach",
	"teacher",
	"team",
	"tears",
	"teeth",
	"telephone",
	"television",
	"tell",
	"temperature",
	"ten",
	"tent",
	"term",
	"terrible",
	"test",
	"than",
	"thank",
	"that",
	"thee",
	"them",
	"themselves",
	"then",
	"theory",
	"there",
	"therefore",
	"these",
	"they",
	"thick",
	"thin",
	"thing",
	"think",
	"third",
	"thirty",
	"this",
	"those",
	"thou",
	"though",
	"thought",
	"thousand",
	"thread",
	"three",
	"threw",
	"throat",
	"through",
	"throughout",
	"throw",
	"thrown",
	"thumb",
	"thus",
	"thy",
	"tide",
	"tie",
	"tight",
	"tightly",
	"till",
	"time",
	"tin",
	"tiny",
	"tip",
	"tired",
	"title",
	"to",
	"tobacco",
	"today",
	"together",
	"told",
	"tomorrow",
	"tone",
	"tongue",
	"tonight",
	"too",
	"took",
	"tool",
	"top",
	"topic",
	"torn",
	"total",
	"touch",
	"toward",
	"tower",
	"town",
	"toy",
	"trace",
	"track",
	"trade",
	"traffic",
	"trail",
	"train",
	"transportation",
	"trap",
	"travel",
	"treated",
	"tree",
	"triangle",
	"tribe",
	"trick",
	"tried",
	"trip",
	"troops",
	"tropical",
	"trouble",
	"truck",
	"trunk",
	"truth",
	"try",
	"tube",
	"tune",
	"turn",
	"twelve",
	"twenty",
	"twice",
	"two",
	"type",
	"typical",
	"uncle",
	"under",
	"underline",
	"understanding",
	"unhappy",
	"union",
	"unit",
	"universe",
	"unknown",
	"unless",
	"until",
	"unusual",
	"up",
	"upon",
	"upper",
	"upward",
	"us",
	"use",
	"useful",
	"using",
	"usual",
	"usually",
	"valley",
	"valuable",
	"value",
	"vapor",
	"variety",
	"various",
	"vast",
	"vegetable",
	"verb",
	"vertical",
	"very",
	"vessels",
	"victory",
	"view",
	"village",
	"visit",
	"visitor",
	"voice",
	"volume",
	"vote",
	"vowel",
	"voyage",
	"wagon",
	"wait",
	"walk",
	"wall",
	"want",
	"war",
	"warm",
	"warn",
	"was",
	"wash",
	"waste",
	"watch",
	"water",
	"wave",
	"way",
	"we",
	"weak",
	"wealth",
	"wear",
	"weather",
	"week",
	"weigh",
	"weight",
	"welcome",
	"well",
	"went",
	"were",
	"west",
	"western",
	"wet",
	"whale",
	"what",
	"whatever",
	"wheat",
	"wheel",
	"when",
	"whenever",
	"where",
	"wherever",
	"whether",
	"which",
	"while",
	"whispered",
	"whistle",
	"white",
	"who",
	"whole",
	"whom",
	"whose",
	"why",
	"wide",
	"widely",
	"wife",
	"wild",
	"will",
	"willing",
	"win",
	"wind",
	"window",
	"wing",
	"winter",
	"wire",
	"wise",
	"wish",
	"with",
	"within",
	"without",
	"wolf",
	"women",
	"won",
	"wonder",
	"wonderful",
	"wood",
	"wooden",
	"wool",
	"word",
	"wore",
	"work",
	"worker",
	"world",
	"worried",
	"worry",
	"worse",
	"worth",
	"would",
	"wrapped",
	"write",
	"writer",
	"writing",
	"written",
	"wrong",
	"wrote",
	"yard",
	"year",
	"yellow",
	"yes",
	"yesterday",
	"yet",
	"you",
	"young",
	"younger",
	"your",
	"yourself",
	"youth",
	"zero",
	"zebra",
	"zipper",
	"zoo",
	"zulu"
];

var name = "@m3rcena/weky";
var version = "9.1.0";
var description = "A fun npm package to play games within Discord with buttons!";
var main = "./dist/index.js";
var type = "module";
var scripts = {
	test: "npx tsx --tsconfig ./tsconfig.json ./test/test.ts",
	"test-cjs": "nodemon test/index.cjs",
	build: "npx rollup --config rollup.config.ts --configPlugin @rollup/plugin-typescript"
};
var keywords = [
	"weky",
	"discord-games"
];
var homepage = "https://github.com/M3rcena/m3rcena-weky#readme";
var bugs = {
	url: "https://github.com/M3rcena/m3rcena-weky/issues"
};
var author = "d4rk.s0ul";
var repository = {
	type: "git",
	url: "git+https://github.com/M3rcena/m3rcena-weky.git"
};
var contributors = [
	{
		name: "vuthanhtrung2010",
		email: "vuthanhtrungsuper@gmail.com"
	},
	{
		name: "alex-724",
		email: "sahandsame31@gmail.com"
	}
];
var dependencies = {
	"@napi-rs/canvas": "^0.1.58",
	axios: "^1.7.2",
	chalk: "^4.1.2",
	cheerio: "^1.0.0-rc.12",
	"discord.js": "^14.16.2",
	"html-entities": "^2.5.2",
	mathjs: "^13.0.2",
	"node-fetch": "^3.3.2",
	ofetch: "^1.3.4",
	"string-width": "^4.2.3",
	typescript: "^5.5.3",
	util: "^0.12.5"
};
var devDependencies = {
	"@rollup/plugin-commonjs": "^28.0.0",
	"@rollup/plugin-json": "^6.1.0",
	"@rollup/plugin-node-resolve": "^15.2.3",
	"@rollup/plugin-typescript": "^12.1.0",
	"@types/node-fetch": "^2.6.11",
	nodemon: "^3.1.4",
	rollup: "^4.18.1"
};
var directories = {
	test: "test"
};
var license = "ISC";
var exports$1 = {
	"import": "./dist/esm/index.js",
	require: "./dist/common/index.cjs"
};
var weky_package = {
	name: name,
	version: version,
	description: description,
	main: main,
	type: type,
	scripts: scripts,
	keywords: keywords,
	homepage: homepage,
	bugs: bugs,
	author: author,
	repository: repository,
	contributors: contributors,
	dependencies: dependencies,
	devDependencies: devDependencies,
	directories: directories,
	license: license,
	exports: exports$1
};

const getRandomString = function (length) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
};
const createButton = function (label, disabled) {
    let style = discord_js.ButtonStyle.Secondary;
    if (label === 'AC' || label === 'DC' || label === '⌫') {
        style = discord_js.ButtonStyle.Danger;
    }
    else if (label === ' = ') {
        style = discord_js.ButtonStyle.Success;
    }
    else if (label === '(' ||
        label === ')' ||
        label === '^' ||
        label === '%' ||
        label === '÷' ||
        label === 'x' ||
        label === ' - ' ||
        label === ' + ' ||
        label === '.' ||
        label === 'RND' ||
        label === 'SIN' ||
        label === 'COS' ||
        label === 'TAN' ||
        label === 'LG' ||
        label === 'LN' ||
        label === 'SQRT' ||
        label === 'x!' ||
        label === '1/x' ||
        label === 'π' ||
        label === 'e' ||
        label === 'ans') {
        style = discord_js.ButtonStyle.Primary;
    }
    {
        const btn = new discord_js.ButtonBuilder().setLabel(label).setStyle(style);
        if (label === '\u200b') {
            btn.setDisabled();
            btn.setCustomId(getRandomString(10));
        }
        else {
            btn.setCustomId('cal' + label);
        }
        return btn;
    }
};
const createDisabledButton = function (label) {
    let style = discord_js.ButtonStyle.Secondary;
    if (label === 'AC' || label === 'DC' || label === '⌫') {
        style = discord_js.ButtonStyle.Danger;
    }
    else if (label === ' = ') {
        style = discord_js.ButtonStyle.Success;
    }
    else if (label === '(' ||
        label === ')' ||
        label === '^' ||
        label === '%' ||
        label === '÷' ||
        label === 'x' ||
        label === ' - ' ||
        label === ' + ' ||
        label === '.' ||
        label === 'RND' ||
        label === 'SIN' ||
        label === 'COS' ||
        label === 'TAN' ||
        label === 'LG' ||
        label === 'LN' ||
        label === 'SQRT' ||
        label === 'x!' ||
        label === '1/x' ||
        label === 'π' ||
        label === 'e' ||
        label === 'ans') {
        style = discord_js.ButtonStyle.Primary;
    }
    const btn = new discord_js.ButtonBuilder().setLabel(label).setStyle(style);
    if (label === '\u200b') {
        btn.setDisabled();
        btn.setCustomId(getRandomString(10));
    }
    else {
        btn.setCustomId('cal' + label);
    }
    const disabledLabels = ["^", "%", '÷', 'AC', '⌫', 'x!', 'x', '1/x'];
    if (disabledLabels.includes(label)) {
        btn.setDisabled(true);
    }
    return btn;
};
const addRow = function (btns) {
    const row = new discord_js.ActionRowBuilder();
    for (const btn of btns) {
        row.addComponents(btn);
    }
    return row;
};
const getRandomSentence = function (length) {
    const word = [];
    const words$1 = words;
    for (let i = 0; i < length; i++) {
        word.push(words$1[Math.floor(Math.random() * words$1.length)]);
    }
    return word;
};
const convertTime = function (time) {
    const absoluteSeconds = Math.floor((time / 1000) % 60);
    const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
    const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const absoluteDays = Math.floor((time / (1000 * 60 * 60 * 24)));
    const d = absoluteDays
        ? absoluteDays === 1
            ? '1 day'
            : `${absoluteDays} days`
        : null;
    const h = absoluteHours
        ? absoluteHours === 1
            ? '1 hour'
            : `${absoluteHours} hours`
        : null;
    const m = absoluteMinutes
        ? absoluteMinutes === 1
            ? '1 minute'
            : `${absoluteMinutes} minutes`
        : null;
    const s = absoluteSeconds
        ? absoluteSeconds === 1
            ? '1 second'
            : `${absoluteSeconds} seconds`
        : null;
    const absoluteTime = [];
    if (d)
        absoluteTime.push(d);
    if (h)
        absoluteTime.push(h);
    if (m)
        absoluteTime.push(m);
    if (s)
        absoluteTime.push(s);
    return absoluteTime.join(', ');
};
const checkPackageUpdates = async function (name, notifyUpdate) {
    if (notifyUpdate === false)
        return;
    try {
        const execPromise = util.promisify(child_process.exec);
        const { stdout } = await execPromise('npm show @m3rcena/weky version');
        if (stdout.trim().toString() > weky_package.version) {
            const advertise = chalk(`Are you using ${chalk.red(name)}? Don't lose out on new features!`);
            const msg = chalk(`New ${chalk.green('version')} of ${chalk.yellow('@m3rcena/weky')} is available!`);
            const msg2 = chalk(`${chalk.red(weky_package.version)} -> ${chalk.green(stdout.trim().toString())}`);
            const tip = chalk(`Registry: ${chalk.cyan('https://www.npmjs.com/package/@m3rcena/weky')}`);
            const install = chalk(`Run ${chalk.green(`npm i @m3rcena/weky@${stdout.trim().toString()}`)} to update!`);
            boxConsole([advertise, msg, msg2, tip, install]);
        }
    }
    catch (error) {
        console.error(error);
    }
};
const boxConsole = function (messages) {
    let tips = [];
    let maxLen = 0;
    const defaultSpace = 4;
    const spaceWidth = stringWidth(' ');
    if (Array.isArray(messages)) {
        tips = Array.from(messages);
    }
    else {
        tips = [messages];
    }
    tips = [' ', ...tips, ' '];
    tips = tips.map((msg) => ({ val: msg, len: stringWidth(msg) }));
    maxLen = tips.reduce((len, tip) => {
        maxLen = Math.max(len, tip.len);
        return maxLen;
    }, maxLen);
    maxLen += spaceWidth * 2 * defaultSpace;
    tips = tips.map(({ val, len }) => {
        let i = 0;
        let j = 0;
        while (len + i * 2 * spaceWidth < maxLen) {
            i++;
        }
        j = i;
        while (j > 0 && len + i * spaceWidth + j * spaceWidth > maxLen) {
            j--;
        }
        return ' '.repeat(i) + val + ' '.repeat(j);
    });
    const line = chalk.yellow('─'.repeat(maxLen));
    console.log(chalk.yellow('┌') + line + chalk.yellow('┐'));
    for (const msg of tips) {
        console.log(chalk.yellow('│') + msg + chalk.yellow('│'));
    }
    console.log(chalk.yellow('└') + line + chalk.yellow('┘'));
};
const getButtonDilemma = async function () {
    const data = await ofetch.ofetch('https://weky.miv4.com/api/wyptb', {
        method: 'GET',
    });
    return data;
};
const shuffleArray = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};
const createHangman = async function (state = 0) {
    return new Promise((res) => {
        const canvas$1 = canvas.createCanvas(300, 350);
        const ctx = canvas$1.getContext('2d');
        ctx.lineWidth = 5;
        createLine(ctx, 50, 330, 150, 330);
        createLine(ctx, 100, 330, 100, 50);
        createLine(ctx, 100, 50, 200, 50);
        createLine(ctx, 200, 50, 200, 80);
        ctx.strokeStyle = state < 1 ? "#a3a3a3" : "#000000";
        ctx.beginPath();
        ctx.arc(200, 100, 20, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        createLine(ctx, 200, 120, 200, 200, state < 2 ? "#a3a3a3" : "#000000");
        createLine(ctx, 200, 150, 170, 130, state < 3 ? "#a3a3a3" : "#000000");
        createLine(ctx, 200, 150, 230, 130, state < 4 ? "#a3a3a3" : "#000000");
        createLine(ctx, 200, 200, 180, 230, state < 5 ? "#a3a3a3" : "#000000");
        createLine(ctx, 200, 200, 220, 230, state < 6 ? "#a3a3a3" : "#000000");
        res(canvas$1.toBuffer("image/png"));
    });
};
function createLine(ctx, fromX, fromY, toX, toY, color = "#000000") {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.closePath();
}

const Calculator = async (options) => {
    OptionsChecking(options, "Calculator");
    let interaction = options.interaction;
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " No interaction provided.");
    let client = options.client;
    let str = ' ';
    let stringify = '```\n' + str + '\n```';
    const row = [];
    const row2 = [];
    const button = new Array([], [], [], [], []);
    const buttons = new Array([], []);
    const text = [
        'DC',
        'RND',
        'SIN',
        'COS',
        'TAN',
        '^',
        'LG',
        'LN',
        '(',
        ')',
        'SQRT',
        '%',
        '÷',
        'AC',
        '⌫',
        'x!',
        '7',
        '8',
        '9',
        'x',
        '1/x',
        '4',
        '5',
        '6',
        ' - ',
    ];
    const text2 = [
        'π',
        '1',
        '2',
        '3',
        ' + ',
        'ans',
        'e',
        '0',
        '.',
        '='
    ];
    let current = 0;
    let disabled = true;
    let lastInput;
    for (let i = 0; i < text.length; i++) {
        if (button[current].length === 5)
            current++;
        button[current].push(createDisabledButton(text[i]));
        if (i === text.length - 1) {
            for (const btn of button)
                row.push(addRow(btn));
        }
    }
    current = 0;
    for (let z = 0; z < text2.length; z++) {
        if (buttons[current].length === 5)
            current++;
        buttons[current].push(createDisabledButton(text2[z]));
        if (z === text2.length - 1) {
            for (const btns of buttons)
                row2.push(addRow(btns));
        }
    }
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(stringify)
        .setColor(options.embed.color)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .addFields(options.embed.fields ? options.embed.fields : [])
        .setImage(options.embed.image ? options.embed.image : null)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        const author = ({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
        embed.setAuthor(author);
    }
    if (!interaction.channel || !interaction.channel.isTextBased() || !interaction.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " Interaction must be a text-based channel.");
    }
    const channel = interaction.channel;
    if (interaction.author) {
        let msgInteraction = interaction;
        await msgInteraction.reply({
            embeds: [embed],
            components: row,
            allowedMentions: { repliedUser: false }
        }).then(async (msg) => {
            let msg2 = await channel.send({
                components: row2,
            });
            async function edit() {
                let _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(stringify)
                    .setColor(options.embed.color)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .addFields(options.embed.fields ? options.embed.fields : [])
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setTimestamp(new Date())
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    const author = ({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                    _embed.setAuthor(author);
                }
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                    });
                }
                else {
                    await msgInteraction.reply({
                        content: `An error occured while trying to edit the calculator.`
                    });
                }
            }
            async function lock(disabled) {
                let _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(stringify)
                    .setColor(options.embed.color)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .addFields(options.embed.fields ? options.embed.fields : [])
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setTimestamp(new Date())
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    const author = ({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                    _embed.setAuthor(author);
                }
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                        components: [],
                    });
                }
                else {
                    await msgInteraction.reply({
                        content: `An error occured while trying to lock the calculator.`
                    });
                }
                if (msg2.deletable)
                    msg2.delete();
            }
            async function enableButtons() {
                disabled = false;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push(createButton(text[i]));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push(addRow(btn));
                        }
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await msgInteraction.reply({
                                content: `An error occured while trying to enable the buttons.`
                            });
                        }
                    }
                }
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push(createButton(text2[z]));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push(addRow(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
            }
            async function disableButtons() {
                disabled = true;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push(createDisabledButton(text[i]));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push(addRow(btn));
                        }
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await msgInteraction.reply({
                                content: `An error occured while trying to disable the buttons.`
                            });
                        }
                    }
                }
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push(createDisabledButton(text2[z]));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push(addRow(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
            }
            let id = msgInteraction.author.id;
            const calc = channel.createMessageComponentCollector({
                componentType: discord_js.ComponentType.Button,
                time: 300000,
            });
            let answer = '0';
            calc.on('collect', async (interact) => {
                if (interact.user.id !== id) {
                    return interact.reply({
                        embeds: [
                            new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title ? options.embed.title : 'Error | Weky Calculator')
                                .setDescription(`You are not allowed to interact with this calculator as you are not the user who initiated the command.\n\n**Note:** This calculator is only for the user <@${id}>`)
                                .setColor('Red')
                                .setTimestamp(new Date())
                        ],
                        ephemeral: true
                    });
                }
                if (interact.customId !== 'calLG'
                    && interact.customId !== 'calSQRT'
                    && interact.customId !== 'calRND'
                    && interact.customId !== 'calSIN'
                    && interact.customId !== 'calCOS'
                    && interact.customId !== 'calTAN'
                    && interact.customId !== 'calLN'
                    && interact.customId !== 'cal1/x'
                    && interact.customId !== 'calx!')
                    await interact.deferUpdate();
                if (interact.customId === 'calAC') {
                    lastInput = null;
                    str = ' ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'calx') {
                    lastInput = interact.customId;
                    str += ' * ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cal÷') {
                    lastInput = interact.customId;
                    str += ' / ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cal⌫') {
                    if (str === ' ' || str === '' || str === null || str === undefined) {
                        lastInput = null;
                        return;
                    }
                    else {
                        lastInput = interact.customId;
                        if (str.slice(0, -1) === ' ' || str.slice(0, -1) === '' || str.slice(0, -1) === null || str.slice(0, -1) === undefined) {
                            lastInput = null;
                        }
                        if (str.slice(-1) === ' ') {
                            str = str.slice(0, -3);
                        }
                        else {
                            str = str.slice(0, -1);
                        }
                        stringify = '```\n' + str + '\n```';
                        edit();
                    }
                }
                else if (interact.customId === 'calLG') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Logarithm 10 (log10)')
                        .setCustomId('mdLog');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberLog')
                        .setLabel('Enter the number to log10')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdLog') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberLog');
                            try {
                                str += 'log10(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calSQRT') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Square Root')
                        .setCustomId('mdSqrt');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberSqrt')
                        .setLabel('Enter the number to square root')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdSqrt') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberSqrt');
                            try {
                                str += 'sqrt(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calRND') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Round Number')
                        .setCustomId('mdRnd');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberRnd')
                        .setLabel('Enter the number to round')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdRnd') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberRnd');
                            try {
                                str += 'round(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calSIN') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Sine')
                        .setCustomId('mdSin');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberSin')
                        .setLabel('Enter the number to find the sine')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdSin') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberSin');
                            try {
                                str += 'sin(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calCOS') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Cosine')
                        .setCustomId('mdCos');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberCos')
                        .setLabel('Enter the number to find the cosine')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdCos') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberCos');
                            try {
                                str += 'cos(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calTAN') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Tangent')
                        .setCustomId('mdTan');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberTan')
                        .setLabel('Enter the number to find the tangent')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdTan') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberTan');
                            try {
                                str += 'tan(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calLN') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Natural Logarithm (log)')
                        .setCustomId('mdLn');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberLn')
                        .setLabel('Enter the number for natural logarithm')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdLn') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberLn');
                            try {
                                str += 'log(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'cal1/x') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Reciprocal')
                        .setCustomId('mdReciprocal');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberReciprocal')
                        .setLabel('Enter the number to find the reciprocal')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdReciprocal') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberReciprocal');
                            try {
                                str += '1/(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calx!') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Factorial')
                        .setCustomId('mdFactorial');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberFactorial')
                        .setLabel('Enter the number to find the factorial')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdFactorial') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberFactorial');
                            try {
                                str += number + '!';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calπ') {
                    lastInput = interact.customId;
                    str += 'pi';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cale') {
                    lastInput = interact.customId;
                    str += 'e';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'calans') {
                    lastInput = interact.customId;
                    str += `${answer}`;
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cal=') {
                    lastInput = null;
                    if (str === ' ' || str === '' || str === null || str === undefined) {
                        return;
                    }
                    else {
                        try {
                            answer = mathjs.evaluate(str);
                            str += ' = ' + mathjs.evaluate(str);
                            stringify = '```\n' + str + '\n```';
                            edit();
                            str = ' ';
                            stringify = '```\n' + str + '\n```';
                        }
                        catch (e) {
                            if (options.invalidQuery === undefined) {
                                return;
                            }
                            else {
                                str = options.invalidQuery;
                                answer = '0';
                                stringify = '```\n' + str + '\n```';
                                edit();
                                str = ' ';
                                stringify = '```\n' + str + '\n```';
                            }
                        }
                    }
                }
                else if (interact.customId === 'calDC') {
                    calc.stop();
                }
                else {
                    lastInput = interact.customId;
                    str += interact.customId.replace('cal', '');
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                if (disabled === true && lastInput !== null && lastInput !== undefined) {
                    enableButtons();
                }
                else if ((disabled === false && lastInput === null || lastInput === undefined) && interact.customId !== "calDC") {
                    disableButtons();
                }
                else if (disabled === false && lastInput !== null || lastInput !== undefined) {
                    return;
                }
            });
            calc.on('end', async () => {
                str = 'Calculator has been stopped';
                stringify = '```\n' + str + '\n```';
                edit();
                lock();
            });
        });
    }
    else {
        let cmdInteraction = interaction;
        await cmdInteraction.editReply({
            embeds: [embed],
            components: row,
            allowedMentions: { repliedUser: false }
        }).then(async (msg) => {
            let msg2 = await channel.send({
                components: row2,
            });
            async function edit() {
                let _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(stringify)
                    .setColor(options.embed.color)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .addFields(options.embed.fields ? options.embed.fields : [])
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setTimestamp(new Date())
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    const author = ({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                    _embed.setAuthor(author);
                }
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                    });
                }
                else {
                    await cmdInteraction.editReply({
                        content: `An error occured while trying to edit the calculator.`
                    });
                }
            }
            async function lock(disabled) {
                let _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(stringify)
                    .setColor(options.embed.color)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .addFields(options.embed.fields ? options.embed.fields : [])
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setTimestamp(new Date())
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    const author = ({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                    _embed.setAuthor(author);
                }
                if (msg.editable) {
                    await msg.edit({
                        embeds: [_embed],
                        components: [],
                    });
                }
                else {
                    await cmdInteraction.editReply({
                        content: `An error occured while trying to lock the calculator.`
                    });
                }
                if (msg2.deletable)
                    msg2.delete();
            }
            async function enableButtons() {
                disabled = false;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push(createButton(text[i]));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push(addRow(btn));
                        }
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await cmdInteraction.editReply({
                                content: `An error occured while trying to enable the buttons.`
                            });
                        }
                    }
                }
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push(createButton(text2[z]));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push(addRow(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
            }
            async function disableButtons() {
                disabled = true;
                let cur = 0;
                const customRow = [];
                const customButton = new Array([], [], [], [], []);
                for (let i = 0; i < text.length; i++) {
                    if (customButton[cur].length === 5)
                        cur++;
                    customButton[cur].push(createDisabledButton(text[i]));
                    if (i === text.length - 1) {
                        for (const btn of customButton) {
                            customRow.push(addRow(btn));
                        }
                        if (msg.editable) {
                            await msg.edit({
                                components: customRow
                            });
                        }
                        else {
                            await cmdInteraction.editReply({
                                content: `An error occured while trying to disable the buttons.`
                            });
                        }
                    }
                }
                cur = 0;
                const customRow2 = [];
                const customButtons = new Array([], []);
                for (let z = 0; z < text2.length; z++) {
                    if (customButtons[cur].length === 5)
                        cur++;
                    customButtons[cur].push(createDisabledButton(text2[z]));
                    if (z === text2.length - 1) {
                        for (const btns of customButtons)
                            customRow2.push(addRow(btns));
                        await msg2.edit({
                            components: customRow2
                        });
                    }
                }
            }
            let id = cmdInteraction.user.id;
            const calc = channel.createMessageComponentCollector({
                componentType: discord_js.ComponentType.Button,
                time: 300000,
            });
            let answer = '0';
            calc.on('collect', async (interact) => {
                if (interact.user.id !== id) {
                    return interact.reply({
                        embeds: [
                            new discord_js.EmbedBuilder()
                                .setTitle(options.embed.title ? options.embed.title : 'Error | Weky Calculator')
                                .setDescription(`You are not allowed to interact with this calculator as you are not the user who initiated the command.\n\n**Note:** This calculator is only for the user <@${id}>`)
                                .setColor('Red')
                                .setTimestamp(new Date())
                        ],
                        ephemeral: true
                    });
                }
                if (interact.customId !== 'calLG'
                    && interact.customId !== 'calSQRT'
                    && interact.customId !== 'calRND'
                    && interact.customId !== 'calSIN'
                    && interact.customId !== 'calCOS'
                    && interact.customId !== 'calTAN'
                    && interact.customId !== 'calLN'
                    && interact.customId !== 'cal1/x'
                    && interact.customId !== 'calx!')
                    await interact.deferUpdate();
                if (interact.customId === 'calAC') {
                    lastInput = null;
                    str = ' ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'calx') {
                    lastInput = interact.customId;
                    str += ' * ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cal÷') {
                    lastInput = interact.customId;
                    str += ' / ';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cal⌫') {
                    if (str === ' ' || str === '' || str === null || str === undefined) {
                        lastInput = null;
                        return;
                    }
                    else {
                        lastInput = interact.customId;
                        if (str.slice(0, -1) === ' ' || str.slice(0, -1) === '' || str.slice(0, -1) === null || str.slice(0, -1) === undefined) {
                            lastInput = null;
                        }
                        if (str.slice(-1) === ' ') {
                            str = str.slice(0, -3);
                        }
                        else {
                            str = str.slice(0, -1);
                        }
                        stringify = '```\n' + str + '\n```';
                        edit();
                    }
                }
                else if (interact.customId === 'calLG') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Logarithm 10 (log10)')
                        .setCustomId('mdLog');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberLog')
                        .setLabel('Enter the number to log10')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdLog') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberLog');
                            try {
                                str += 'log10(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calSQRT') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Square Root')
                        .setCustomId('mdSqrt');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberSqrt')
                        .setLabel('Enter the number to square root')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdSqrt') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberSqrt');
                            try {
                                str += 'sqrt(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calRND') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Round Number')
                        .setCustomId('mdRnd');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberRnd')
                        .setLabel('Enter the number to round')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdRnd') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberRnd');
                            try {
                                str += 'round(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calSIN') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Sine')
                        .setCustomId('mdSin');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberSin')
                        .setLabel('Enter the number to find the sine')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdSin') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberSin');
                            try {
                                str += 'sin(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calCOS') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Cosine')
                        .setCustomId('mdCos');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberCos')
                        .setLabel('Enter the number to find the cosine')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdCos') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberCos');
                            try {
                                str += 'cos(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calTAN') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Tangent')
                        .setCustomId('mdTan');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberTan')
                        .setLabel('Enter the number to find the tangent')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdTan') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberTan');
                            try {
                                str += 'tan(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calLN') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Natural Logarithm (log)')
                        .setCustomId('mdLn');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberLn')
                        .setLabel('Enter the number for natural logarithm')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdLn') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberLn');
                            try {
                                str += 'log(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'cal1/x') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Reciprocal')
                        .setCustomId('mdReciprocal');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberReciprocal')
                        .setLabel('Enter the number to find the reciprocal')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdReciprocal') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberReciprocal');
                            try {
                                str += '1/(' + number + ')';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calx!') {
                    const modal = new discord_js.ModalBuilder()
                        .setTitle('Factorial')
                        .setCustomId('mdFactorial');
                    const input = new discord_js.TextInputBuilder()
                        .setCustomId('numberFactorial')
                        .setLabel('Enter the number to find the factorial')
                        .setStyle(discord_js.TextInputStyle.Short)
                        .setRequired(true);
                    const actionRow = new discord_js.ActionRowBuilder().addComponents(input);
                    modal.addComponents(actionRow);
                    await interact.showModal(modal);
                    client.on('interactionCreate', async (modal) => {
                        if (!modal.isModalSubmit())
                            return;
                        if (modal.customId === 'mdFactorial') {
                            modal.deferUpdate();
                            const number = modal.fields.getTextInputValue('numberFactorial');
                            try {
                                str += number + '!';
                                stringify = '```\n' + str + '\n```';
                                lastInput = interact.customId;
                                edit();
                            }
                            catch (e) {
                                str = 'Invalid Number';
                                stringify = '```\n' + str + '\n```';
                                edit();
                            }
                        }
                    });
                }
                else if (interact.customId === 'calπ') {
                    lastInput = interact.customId;
                    str += 'pi';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cale') {
                    lastInput = interact.customId;
                    str += 'e';
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'calans') {
                    lastInput = interact.customId;
                    str += `${answer}`;
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                else if (interact.customId === 'cal=') {
                    lastInput = null;
                    if (str === ' ' || str === '' || str === null || str === undefined) {
                        return;
                    }
                    else {
                        try {
                            answer = mathjs.evaluate(str);
                            str += ' = ' + mathjs.evaluate(str);
                            stringify = '```\n' + str + '\n```';
                            edit();
                            str = ' ';
                            stringify = '```\n' + str + '\n```';
                        }
                        catch (e) {
                            if (options.invalidQuery === undefined) {
                                return;
                            }
                            else {
                                str = options.invalidQuery;
                                answer = '0';
                                stringify = '```\n' + str + '\n```';
                                edit();
                                str = ' ';
                                stringify = '```\n' + str + '\n```';
                            }
                        }
                    }
                }
                else if (interact.customId === 'calDC') {
                    calc.stop();
                }
                else {
                    lastInput = interact.customId;
                    str += interact.customId.replace('cal', '');
                    stringify = '```\n' + str + '\n```';
                    edit();
                }
                if (disabled === true && lastInput !== null && lastInput !== undefined) {
                    enableButtons();
                }
                else if ((disabled === false && lastInput === null || lastInput === undefined) && interact.customId !== "calDC") {
                    disableButtons();
                }
                else if (disabled === false && lastInput !== null || lastInput !== undefined) {
                    return;
                }
            });
            calc.on('end', async () => {
                str = 'Calculator has been stopped';
                stringify = '```\n' + str + '\n```';
                edit();
                lock();
            });
        });
    }
    checkPackageUpdates("Calculator", options.notifyUpdate);
};

const data$2 = new Set();
const ChaosWords = async (options) => {
    OptionsChecking(options, "ChaosWords");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");
    if (!interaction.channel)
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No channel found on Interaction.");
    if (!interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " Channel is not sendable.");
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    if (data$2.has(id))
        return;
    data$2.add(id);
    const ids = getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);
    let tries = 0;
    const array = [];
    let remaining = 0;
    const guessed = [];
    let words = options.words ? options.words : getRandomSentence(Math.floor(Math.random() * 6) + 2);
    let charGenerated = options.charGenerated ? options.charGenerated : options.words ? options.words.join('').length - 1 : 0;
    if (words.join('').length > charGenerated) {
        charGenerated = words.join('').length - 1;
    }
    for (let i = 0; i < charGenerated; i++) {
        array.push('abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyz'.length)));
    }
    words.forEach((e) => {
        array.splice(Math.floor(Math.random() * array.length), 0, e);
    });
    let fields = [];
    if (!options.embed.fields) {
        fields = [
            {
                name: 'Sentence:',
                value: array.join('')
            },
            {
                name: 'Words Founds:',
                value: `${remaining} / ${words.length}`
            },
            {
                name: 'Words Found / Remaining:',
                value: `${guessed.join(', ')}`
            },
            {
                name: 'Words:',
                value: words.join(', ')
            }
        ];
    }
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.embed.description ?
        options.embed.description.replace('{{time}}', convertTime(options.time ? options.time : 60000)) :
        `You have **${convertTime(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    if (!options.embed.fields) {
        fields = [
            {
                name: 'Sentence:',
                value: array.join('')
            },
            {
                name: 'Words Founds:',
                value: `${remaining} / ${words.length}`
            },
            {
                name: 'Words Found / Remaining:',
                value: `${guessed.join(', ')}`
            },
            {
                name: 'Words:',
                value: words.join(', ')
            }
        ];
        let _field = [];
        fields.map((field, index) => {
            if (index < 2) {
                _field.push({
                    name: `${field.name}`,
                    value: `${field.value}`
                });
            }
        });
        embed.setFields(_field);
    }
    let btn1 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Danger)
        .setLabel(options.buttonText ? options.buttonText : "Cancel")
        .setCustomId(ids);
    const msg = await interaction.reply({
        embeds: [embed],
        components: [{ type: 1, components: [btn1] }]
    });
    const gameCreatedAt = Date.now();
    const filter = (m) => m.author.id === id;
    let game;
    if (interaction instanceof discord_js.Message) {
        game = await interaction.channel.createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        });
    }
    else {
        if (!interaction.channel || !interaction.channel.isTextBased())
            return;
        game = interaction.channel.createMessageCollector({
            filter,
            time: options.time ? options.time : 60000
        });
    }
    if (!interaction.channel || !interaction.channel.isSendable())
        return;
    game.on('collect', async (mes) => {
        if (words === undefined)
            return;
        const condition = words.includes(mes.content.toLowerCase()) &&
            !guessed.includes(mes.content.toLowerCase());
        if (condition) {
            remaining++;
            array.splice(array.indexOf(mes.content.toLowerCase()), 1);
            guessed.push(mes.content.toLowerCase());
            let _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.embed.description ?
                options.embed.description.replace('{{time}}', convertTime(options.time ? options.time : 60000)) :
                `You have **${convertTime(options.time ? options.time : 60000)}** to find the correct words in the chaos above.`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            else {
                fields = [
                    {
                        name: 'Sentence:',
                        value: array.join('')
                    },
                    {
                        name: 'Words Founds:',
                        value: `${remaining} / ${words.length}`
                    },
                    {
                        name: 'Words Found / Remaining:',
                        value: `${guessed.join(', ')}`
                    },
                    {
                        name: 'Words:',
                        value: words.join(', ')
                    }
                ];
                let _field = [];
                fields.map((field, index) => {
                    if (index < 3) {
                        _field.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                });
                _embed.setFields(_field);
            }
            btn1 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setCustomId(ids);
            await msg.edit({
                embeds: [_embed],
                components: [{ type: 1, components: [btn1] }]
            });
            if (remaining === words.length) {
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                btn1 = new discord_js.ButtonBuilder()
                    .setStyle(discord_js.ButtonStyle.Danger)
                    .setLabel(options.buttonText ? options.buttonText : "Cancel")
                    .setDisabled()
                    .setCustomId(ids);
                await msg.edit({
                    embeds: [embed],
                    components: [{
                            type: 1,
                            components: [btn1]
                        }]
                });
                const time = convertTime(Date.now() - gameCreatedAt);
                let __embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.winMessage ? options.winMessage.replace('{{time}}', time) : `You found all the words in **${time}**`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    __embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    __embed.setFields(options.embed.fields);
                }
                else {
                    fields = [
                        {
                            name: 'Sentence:',
                            value: array.join('')
                        },
                        {
                            name: 'Words Founds:',
                            value: `${remaining} / ${words.length}`
                        },
                        {
                            name: 'Words Found / Remaining:',
                            value: `${guessed.join(', ')}`
                        },
                        {
                            name: 'Words:',
                            value: words.join(', ')
                        }
                    ];
                    let _field = [];
                    fields.map((field, index) => {
                        if (index === 0) {
                            _field.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                        else if (index === 3) {
                            _field.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                    });
                    __embed.setFields(_field);
                }
                await msg.edit({
                    embeds: [__embed],
                    components: []
                });
                await interaction.channel.send({
                    embeds: [__embed],
                });
                data$2.delete(id);
                return game.stop();
            }
            const __embed = new discord_js.EmbedBuilder()
                .setDescription(`
                    ${options.correctWord ?
                options.correctWord
                    .replace('{{word}}', mes.content.toLowerCase())
                    .replace('{{remaining}}', `${words.length - remaining}`)
                : `GG, **${mes.content.toLowerCase()}** was correct! You have to find **${words.length - remaining}** more word(s).`}
                    `)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            mes.reply({
                embeds: [__embed],
            });
        }
        else {
            tries++;
            if (tries === (options.maxTries ? options.maxTries : 10)) {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                else {
                    fields = [
                        {
                            name: 'Sentence:',
                            value: array.join('')
                        },
                        {
                            name: 'Words Founds:',
                            value: `${remaining} / ${words.length}`
                        },
                        {
                            name: 'Words Found / Remaining:',
                            value: `${guessed.join(', ')}`
                        },
                        {
                            name: 'Words:',
                            value: words.join(', ')
                        }
                    ];
                    let _fields = [];
                    fields.map((field, index) => {
                        if (index === 0) {
                            _fields.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                        else if (index === 3) {
                            _fields.push({
                                name: `${field.name}`,
                                value: `${field.value}`
                            });
                        }
                    });
                    _embed.setFields(_fields);
                }
                btn1 = new discord_js.ButtonBuilder()
                    .setStyle(discord_js.ButtonStyle.Danger)
                    .setLabel(options.buttonText ? options.buttonText : "Cancel")
                    .setDisabled()
                    .setCustomId(ids);
                await msg.edit({
                    embeds: [_embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                await interaction.channel.send({
                    embeds: [_embed],
                });
                data$2.delete(id);
                return game.stop();
            }
            const _embed = new discord_js.EmbedBuilder()
                .setDescription(`
                    ${options.wrongWord ?
                options.wrongWord.replace(`{{remaining_tries}}`, `${options.maxTries ? options.maxTries : 10 - tries}`) :
                `**${mes.content.toLowerCase()}** is not the correct word. You have **${options.maxTries ? options.maxTries : 10 - tries}** tries left.`}
                    `)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            mes.reply({
                embeds: [_embed],
            });
        }
    });
    game.on('end', (mes, reason) => {
        if (reason === 'time') {
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(options.loseMessage ? options.loseMessage : `You failed to find all the words in time.`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            else {
                fields = [
                    {
                        name: 'Sentence:',
                        value: array.join('')
                    },
                    {
                        name: 'Words Founds:',
                        value: `${remaining} / ${words.length}`
                    },
                    {
                        name: 'Words Found / Remaining:',
                        value: `${guessed.join(', ')}`
                    },
                    {
                        name: 'Words:',
                        value: words.join(', ')
                    }
                ];
                let _fields = [];
                fields.map((field, index) => {
                    if (index === 0) {
                        _fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                    else if (index === 3) {
                        _fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                });
                _embed.setFields(_fields);
                let __fields = [];
                fields.map((field, index) => {
                    if (index < 2) {
                        __fields.push({
                            name: `${field.name}`,
                            value: `${field.value}`
                        });
                    }
                });
                embed.setFields(__fields);
            }
            btn1 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }]
            });
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            data$2.delete(id);
            interaction.channel.send({
                embeds: [_embed],
            });
        }
    });
    const gameCollector = msg.createMessageComponentCollector({
        componentType: discord_js.ComponentType.Button,
    });
    gameCollector.on('collect', async (button) => {
        await button.deferUpdate();
        btn1 = new discord_js.ButtonBuilder()
            .setStyle(discord_js.ButtonStyle.Danger)
            .setLabel(options.buttonText ? options.buttonText : "Cancel")
            .setDisabled()
            .setCustomId(ids);
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        else {
            fields = [
                {
                    name: 'Sentence:',
                    value: array.join('')
                },
                {
                    name: 'Words Founds:',
                    value: `${remaining} / ${words.length}`
                },
                {
                    name: 'Words Found / Remaining:',
                    value: `${guessed.join(', ')}`
                },
                {
                    name: 'Words:',
                    value: words.join(', ')
                }
            ];
            let _fields = [];
            fields.map((field, index) => {
                if (index < 2) {
                    _fields.push({
                        name: `${field.name}`,
                        value: `${field.value}`
                    });
                }
            });
            embed.setFields(_fields);
        }
        await msg.edit({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }]
        });
        const _embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.loseMessage ? options.loseMessage : `The game has been stopped by <@${id}>`)
            .setColor(options.embed.color)
            .setTimestamp(options.embed.timestamp ? new Date() : null)
            .setURL(options.embed.url ? options.embed.url : null)
            .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
            .setImage(options.embed.image ? options.embed.image : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.author) {
            _embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (!interaction.channel || !interaction.channel.isSendable())
            return;
        await interaction.channel.send({
            embeds: [_embed],
        });
        data$2.delete(id);
        gameCollector.stop();
        return game.stop();
    });
    checkPackageUpdates("ChaosWords", options.notifyUpdate);
};

const data$1 = new Set();
const FastType = async (options) => {
    OptionsChecking(options, "FastType");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " Interaction channel is not provided.");
    options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    if (data$1.has(id))
        return;
    data$1.add(id);
    const ids = getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20);
    if (!options.sentence) {
        options.sentence = getRandomSentence(Math.floor(Math.random() * 20) + 3)
            .toString()
            .split(',').join(' ');
    }
    const sentence = options.sentence;
    const gameCreatedAt = Date.now();
    let btn1 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Danger)
        .setLabel(options.buttonText ? options.buttonText : "Cancel")
        .setCustomId(ids);
    const embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(`${options.embed.description ?
        options.embed.description.replace('{{time}}', convertTime(options.time ? options.time : 60000)) :
        `You have **${convertTime(options.time ? options.time : 60000)}** to type the sentence below.`}`)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    else {
        embed.addFields({ name: 'Sentence:', value: `${sentence}` });
    }
    const msg = await interaction.reply({
        embeds: [embed],
        components: [{ type: 1, components: [btn1] }],
    });
    if (!interaction.channel || !interaction.channel.isTextBased()) {
        throw new Error(chalk.red("[@m3rcena/weky] FastTyoe Error: ") + "Interaction channel is not a text channel.");
    }
    const collector = await interaction.channel.createMessageCollector({
        filter: (m) => !m.author.bot && m.author.id === id,
        time: options.time ? options.time : 60000
    });
    collector.on("collect", async (mes) => {
        if (mes.content.toLowerCase().trim() === sentence.toLowerCase()) {
            const time = Date.now() - gameCreatedAt;
            const minute = (time / 1000 / 60) % 60;
            const wpm = mes.content.toLowerCase().trim().length / 5 / minute;
            const _embed = new discord_js.EmbedBuilder()
                .setDescription(options.winMessage ?
                options.winMessage
                    .replace('time', convertTime(time))
                    .replace('wpm', wpm.toFixed(2))
                : `You have typed the sentence correctly in **${convertTime(time)}** with **${wpm.toFixed(2)}** WPM.`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await interaction.channel.send({ embeds: [_embed] });
            btn1 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            collector.stop(mes.author.username);
            data$1.delete(id);
        }
        else {
            const _embed = new discord_js.EmbedBuilder()
                .setDescription(options.loseMessage ? options.loseMessage : "Better Luck Next Time!")
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await interaction.channel.send({ embeds: [_embed] });
            collector.stop(mes.author.username);
            data$1.delete(id);
            btn1 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
        }
    });
    collector.on('end', async (_collected, reason) => {
        if (reason === 'time') {
            const _embed = new discord_js.EmbedBuilder()
                .setDescription(options.loseMessage ? options.loseMessage : "Better Luck Next Time!")
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await interaction.channel.send({ embeds: [_embed] });
            btn1 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(options.buttonText ? options.buttonText : "Cancel")
                .setDisabled()
                .setCustomId(ids);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1] }],
            });
            data$1.delete(id);
        }
    });
    const gameCollector = msg.createMessageComponentCollector({
        componentType: discord_js.ComponentType.Button,
    });
    gameCollector.on("collect", async (button) => {
        if (button.user.id !== id) {
            return button.reply({
                content: options.othersMessage ? options.othersMessage.replace('{{author}}', id) : `This button is for <@${id}>`,
                ephemeral: true
            });
        }
        btn1 = new discord_js.ButtonBuilder()
            .setStyle(discord_js.ButtonStyle.Danger)
            .setLabel(options.buttonText ? options.buttonText : "Cancel")
            .setDisabled()
            .setCustomId(ids);
        embed.setTimestamp(options.embed.timestamp ? new Date() : null);
        await msg.edit({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }],
        });
        button.reply({
            content: options.cancelMessage ? options.cancelMessage : "Game has been cancelled.",
            ephemeral: true
        });
        gameCollector.stop();
        data$1.delete(id);
        return collector.stop();
    });
    checkPackageUpdates("FastType", options.notifyUpdate);
};

const db = new Map();
const data = new Set();
const currentGames$1 = new Object();
const GuessTheNumber = async (options) => {
    OptionsChecking(options, 'GuessTheNumber');
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] ChaosWords Error:") + " No interaction provided.");
    options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    if (!interaction.guild) {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " Guild is not available in this interaction.");
    }
    if (!interaction.channel || !interaction.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " Channel is not available in this interaction.");
    }
    if (!options.ongoingMessage) {
        options.ongoingMessage = "A game is already running in <#{{channel}}>. Try again later!";
    }
    if (typeof options.ongoingMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " ongoingMessage must be a string.");
    }
    if (!options.returnWinner) {
        options.returnWinner = false;
    }
    if (typeof options.returnWinner !== 'boolean') {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " returnWinner must be a boolean.");
    }
    if (!options.winMessage)
        options.winMessage = {};
    let winMessage = options.winMessage;
    if (typeof winMessage !== 'object') {
        throw new TypeError('Weky Error: winMessage must be an object.');
    }
    let winMessagePublicGame;
    if (!options.winMessage.publicGame) {
        winMessagePublicGame =
            'GG, The number which I guessed was **{{number}}**. <@{{winner}}> made it in **{{time}}**.\n\n__**Stats of the game:**__\n**Duration**: {{time}}\n**Number of participants**: {{totalparticipants}} Participants\n**Participants**: {{participants}}';
    }
    else {
        winMessagePublicGame = options.winMessage.publicGame;
    }
    if (typeof winMessagePublicGame !== 'string') {
        throw new TypeError('Weky Error: winMessage must be a string.');
    }
    let winMessagePrivateGame;
    if (!options.winMessage.privateGame) {
        winMessagePrivateGame =
            'GG, The number which I guessed was **{{number}}**. You made it in **{{time}}**.';
    }
    else {
        winMessagePrivateGame = options.winMessage.privateGame;
    }
    if (typeof winMessagePrivateGame !== 'string') {
        throw new TypeError('Weky Error: winMessage must be a string.');
    }
    const ids = getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);
    let number;
    if (!options.number) {
        number = Math.floor(Math.random() * 1000);
    }
    else {
        number = options.number;
    }
    if (typeof number !== "number") {
        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " number must be a number.");
    }
    if (options.publicGame) {
        const participants = [];
        if (currentGames$1[interaction.guild.id]) {
            let embed = new discord_js.EmbedBuilder()
                .setDescription(options.ongoingMessage.replace(/{{channel}}/g, currentGames$1[`${interaction.guild.id}_channel`]))
                .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (options.embed.fields) {
                embed.setFields(options.embed.fields);
            }
            return await interaction.reply({
                embeds: [embed]
            });
        }
        let embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(`${options.embed.description ?
            options.embed.description.replace(/{{time}}/g, convertTime(options.time ? options.time : 60000)) :
            "You have **{{time}}** to guess the number.".replace(/{{time}}/g, convertTime(options.time ? options.time : 60000))}`)
            .setColor(options.embed.color)
            .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
            .setURL(options.embed.url ? options.embed.url : null)
            .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
            .setImage(options.embed.image ? options.embed.image : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.author) {
            embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        let btn1 = new discord_js.ButtonBuilder()
            .setStyle(discord_js.ButtonStyle.Danger)
            .setLabel(options.button ? options.button : "Cancel")
            .setCustomId(ids);
        const msg = await interaction.reply({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }]
        });
        const gameCreatedAt = Date.now();
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => !m.author.bot,
            time: options.time ? options.time : 60000
        });
        const gameCollector = msg.createMessageComponentCollector({
            componentType: discord_js.ComponentType.Button,
        });
        currentGames$1[interaction.guild.id] = true;
        currentGames$1[`${interaction.guild.id}_channel`] = interaction.channel.id;
        const guildId = interaction.guild.id;
        collector.on('collect', async (_msg) => {
            if (!participants.includes(_msg.author.id)) {
                participants.push(_msg.author.id);
            }
            const parsedNumber = parseInt(_msg.content, 10);
            if (parsedNumber === number) {
                const time = convertTime(Date.now() - gameCreatedAt);
                let _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(`
                        ${winMessagePublicGame
                    .replace(/{{number}}/g, number.toString())
                    .replace(/{{winner}}/g, _msg.author.id)
                    .replace(/{{time}}/g, time)
                    .replace(/{{totalparticipants}}/g, `${participants.length}`)
                    .replace(/{{participants}}/g, participants.map((p) => '<@' + p + '>').join(', '))}`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                _msg.reply({ embeds: [_embed] });
                gameCollector.stop();
                collector.stop();
                if (options.returnWinner) {
                    if (!options.gameID) {
                        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " gameID must be provided.");
                    }
                    if (typeof options.gameID !== "string") {
                        throw new Error(chalk.red("[@m3rcena/weky] GuessTheNumber Error:") + " gameID must be a string.");
                    }
                    db.set(`GuessTheNumber_${guildId}_${options.gameID}`, _msg.author.id);
                }
            }
            if (parseInt(_msg.content) < number) {
                let _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.bigNumber ?
                    options.bigNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is bigger than **${parsedNumber}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                _msg.reply({ embeds: [_embed] });
            }
            if (parseInt(_msg.content) > number) {
                let _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.smallNumber ?
                    options.smallNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is smaller than **${parsedNumber}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                _msg.reply({ embeds: [_embed] });
            }
        });
        gameCollector.on('collect', async (button) => {
            if (button.user.id !== id) {
                return button.reply({
                    content: options.otherMessage ?
                        options.otherMessage.replace(/{{author}}/g, id) :
                        "This is not your game!",
                    ephemeral: true,
                });
            }
            await button.deferUpdate();
            if (button.customId === ids) {
                btn1.setDisabled(true);
                gameCollector.stop();
                collector.stop();
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number/g, `${number}`) :
                    `The number was **${number}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                msg.edit({ embeds: [_embed] });
            }
        });
        collector.on('end', async (_collected, reason) => {
            delete currentGames$1[guildId];
            if (reason === 'time') {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number}}/g, `${number}`) :
                    `The number was **${number}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                return interaction.channel.send({ embeds: [_embed] });
            }
        });
    }
    else {
        if (data.has(id))
            return;
        data.add(id);
        const embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.embed.description ?
            options.embed.description.replace(/{{time}}/g, convertTime(options.time ? options.time : 60000)) :
            "You have **{{time}}** to guess the number.".replace(/{{time}}/g, convertTime(options.time ? options.time : 60000)))
            .setColor(options.embed.color)
            .setTimestamp(options.embed.timestamp ? new Date() : null)
            .setURL(options.embed.url ? options.embed.url : null)
            .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
            .setImage(options.embed.image ? options.embed.image : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.author) {
            embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        let btn1 = new discord_js.ButtonBuilder()
            .setStyle(discord_js.ButtonStyle.Danger)
            .setLabel(options.button ? options.button : "Cancel")
            .setCustomId(ids);
        const msg = await interaction.reply({
            embeds: [embed],
            components: [{ type: 1, components: [btn1] }]
        });
        const gameCreatedAt = Date.now();
        const collector = await interaction.channel.createMessageCollector({
            filter: (m) => m.author.id === id,
            time: options.time ? options.time : 60000
        });
        const gameCollector = msg.createMessageComponentCollector({
            componentType: discord_js.ComponentType.Button,
        });
        collector.on('collect', async (_msg) => {
            if (_msg.author.id !== id)
                return;
            const parsedNumber = parseInt(_msg.content, 10);
            if (parsedNumber === number) {
                const time = convertTime(Date.now() - gameCreatedAt);
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(winMessagePrivateGame
                    .replace(/{{time}}/g, time)
                    .replace(/{{number}}/g, `${number}`))
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                await _msg.reply({ embeds: [_embed] });
                gameCollector.stop();
                collector.stop();
            }
            if (parseInt(_msg.content) < number) {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.bigNumber ?
                    options.bigNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is bigger than **${parsedNumber}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                await _msg.reply({ embeds: [_embed] });
            }
            if (parseInt(_msg.content) > number) {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.smallNumber ?
                    options.smallNumber
                        .replace(/{{author}}/g, _msg.author.toString())
                        .replace(/{{number}}/g, `${parsedNumber}`) :
                    `The number is smaller than **${parsedNumber}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                await _msg.reply({ embeds: [_embed] });
            }
        });
        gameCollector.on('collect', async (button) => {
            if (button.user.id !== id) {
                return button.reply({
                    content: options.otherMessage ?
                        options.otherMessage.replace(/{{author}}/g, id) :
                        "This is not your game!",
                    ephemeral: true,
                });
            }
            await button.deferUpdate();
            if (button.customId === ids) {
                btn1.setDisabled(true);
                gameCollector.stop();
                collector.stop();
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number}}/g, `${number}`) :
                    `The number was **${number}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                await msg.edit({ embeds: [_embed] });
            }
        });
        collector.on('end', async (_collected, reason) => {
            if (reason === 'time') {
                const _embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ?
                    options.loseMessage.replace(/{{number}}/g, `${number}`) :
                    `The number was **${number}**!`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    _embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    _embed.setFields(options.embed.fields);
                }
                btn1.setDisabled(true);
                embed.setTimestamp(options.embed.timestamp ? new Date() : null);
                await msg.edit({
                    embeds: [embed],
                    components: [{ type: 1, components: [btn1] }]
                });
                if (!interaction.channel || !interaction.channel.isSendable())
                    return;
                return interaction.channel.send({ embeds: [_embed] });
            }
            data.delete(id);
        });
    }
    checkPackageUpdates("GuessTheNumber", options.notifyUpdate);
};

const Hangman = async (options) => {
    OptionsChecking(options, "Hangman");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] Hangman Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] Hangman Error:") + " No channel found.");
    let client = options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    let wrongs = 0;
    let at = new discord_js.AttachmentBuilder(await createHangman(wrongs), {
        name: "game.png"
    });
    let word = words[Math.floor(Math.random() * words.length)];
    let used = [];
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title ? options.embed.title : "Hangman Game")
        .setDescription(options.embed.description ? options.embed.description.replace(`{{word}}`, `\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}`) :
        `Type a character to guess the word\n\n\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}\`\`\``)
        .setColor(options.embed.color ? options.embed.color : "Blue")
        .setImage("attachment://game.png")
        .setTimestamp(options.embed.timestamp ? Date.now() : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    const msg = await interaction.reply({
        files: [at],
        embeds: [embed],
    });
    const channel = await interaction.channel;
    const col = channel.createMessageCollector({
        filter: (m) => m.author.id === id,
        time: options.time ? options.time : 180000
    });
    const handleMsgDelete = (m, msg) => {
        if (m.id === msg.id)
            col.stop("msgDelete");
    };
    if ("token" in msg) {
        msg.edit = (data) => msg.editReply(data);
    }
    else {
        client.on("messageDelete", handleMsgDelete.bind(null, msg));
    }
    col.on('collect', async (msg2) => {
        const char = msg2.content[0]?.toLowerCase();
        if (!/[a-z]/i.test(char))
            return msg2.reply("You have to **provide** a **letter**, **not** a **number/symbol**!").then(m => setTimeout(() => {
                if (m.deletable)
                    m.delete();
            }, 5000));
        if (used.includes(char))
            return msg2.reply("You have **already** used this **letter**!").then(m => setTimeout(() => {
                if (m.deletable)
                    m.delete();
            }, 5000));
        used.push(char);
        if (!word.includes(char)) {
            wrongs++;
        }
        let done = word.split("").every(v => used.includes(v));
        let description = wrongs === 6 || done ? `You ${done ? "won" : "lost"} the game, The word was **${word}**` : `Type a character to guess the word\n\n\`\`\`${word.split("").map(v => used.includes(v) ? v.toUpperCase() : "_").join(" ")}\`\`\``;
        at = new discord_js.AttachmentBuilder(await createHangman(wrongs), {
            name: "game.png"
        });
        embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title ? options.embed.title : "Hangman Game")
            .setDescription(description)
            .setColor(options.embed.color ? options.embed.color : wrongs === 6 ? "#ff0000" : done ? "Green" : "Blue")
            .setImage("attachment://game.png")
            .setTimestamp(options.embed.timestamp ? Date.now() : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.author) {
            embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        await msg.edit({
            files: [at],
            embeds: [embed]
        }).catch((e) => {
            col.stop();
            throw e;
        });
        if (wrongs === 6 || done) {
            col.stop();
        }
    });
    col.on('end', async (s, r) => {
        client.off("messageDelete", handleMsgDelete.bind(null, msg));
        if (r === "time") {
            let embed = new discord_js.EmbedBuilder()
                .setTitle("⛔ Game Ended")
                .setDescription(`\`\`\`You took too much time to respond\`\`\``)
                .setColor("Red")
                .setTimestamp();
            await msg.edit({
                attachments: [],
                files: [],
                embeds: [embed]
            }).catch((e) => {
                throw e;
            });
        }
    });
    checkPackageUpdates("Hangman", options.notifyUpdate);
};

const LieSwatter = async (options) => {
    OptionsChecking(options, "LieSwatter");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter Error:") + " No channel found.");
    options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    const id1 = getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20);
    const id2 = getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20);
    if (!options.winMessage)
        options.winMessage = "GG, It was a **{{answer}}**. You got it correct in **{{time}}**.";
    if (typeof options.winMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Win message must be a string.");
    }
    if (!options.loseMessage)
        options.loseMessage = "Better luck next time! It was a **{{answer}}**.";
    if (typeof options.loseMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Lose message must be a string.");
    }
    if (!options.othersMessage)
        options.othersMessage = "Only <@{{author}}> can use the buttons!";
    if (typeof options.othersMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Others message must be a string.");
    }
    if (!options.buttons)
        options.buttons = {
            true: "Truth",
            lie: "Lie"
        };
    if (typeof options.buttons !== "object") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Buttons must be an object.");
    }
    if (!options.buttons.true)
        options.buttons.true = "Truth";
    if (typeof options.buttons.true !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " True button text must be a string.");
    }
    if (!options.buttons.lie)
        options.buttons.lie = "Lie";
    if (typeof options.buttons.lie !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Lie button text must be a string.");
    }
    if (!options.thinkMessage)
        options.thinkMessage = "I am thinking...";
    if (typeof options.thinkMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] LieSwatter TypeError:") + " Think message must be a string.");
    }
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.thinkMessage)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    const msg = await interaction.reply({
        embeds: [embed]
    });
    const result = await fetch(`https://opentdb.com/api.php?amount=1&type=boolean`).then((res) => res.json());
    const question = result.results[0];
    let answer;
    let winningID;
    if (question.correct_answer === "True") {
        winningID = id1;
        answer = options.buttons.true;
    }
    else {
        winningID = id2;
        answer = options.buttons.lie;
    }
    let btn1 = new discord_js.ButtonBuilder()
        .setCustomId(id1)
        .setLabel(options.buttons.true)
        .setStyle(discord_js.ButtonStyle.Primary);
    let btn2 = new discord_js.ButtonBuilder()
        .setCustomId(id2)
        .setLabel(options.buttons.lie)
        .setStyle(discord_js.ButtonStyle.Primary);
    embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(htmlEntities.decode(question.question))
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? new Date() : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    await msg.edit({
        embeds: [embed],
        components: [
            { type: 1, components: [btn1, btn2] }
        ]
    });
    const gameCreatedAt = Date.now();
    const gameCollector = msg.createMessageComponentCollector({
        componentType: discord_js.ComponentType.Button,
        time: 60000
    });
    gameCollector.on("collect", async (button) => {
        if (button.user.id !== id) {
            return button.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace(`{{author}}`, id) :
                    "Only <@" + id + "> can use the buttons!",
                ephemeral: true
            });
        }
        await button.deferUpdate();
        if (button.customId === winningID) {
            btn1 = new discord_js.ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();
            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(discord_js.ButtonStyle.Success);
                btn2.setStyle(discord_js.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js.ButtonStyle.Danger);
                btn2.setStyle(discord_js.ButtonStyle.Success);
            }
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }]
            });
            const time = convertTime(Date.now() - gameCreatedAt);
            const winEmbed = new discord_js.EmbedBuilder()
                .setDescription(`${options.winMessage ?
                options.winMessage
                    .replace(`{{answer}}`, htmlEntities.decode(answer))
                    .replace(`{{time}}`, time) :
                `GG, It was a **${htmlEntities.decode(answer)}**. You got it correct in **${time}**.`}`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            const username = options.interaction.author ? options.interaction.author.username : options.interaction.user.username;
            const iconUrl = options.interaction.author ? options.interaction.author.displayAvatarURL() : options.interaction.user.displayAvatarURL();
            if (options.embed.author) {
                winEmbed.setAuthor({
                    name: username,
                    iconURL: iconUrl
                });
            }
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            await interaction.channel.send({
                embeds: [winEmbed]
            });
        }
        else {
            btn1 = new discord_js.ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();
            gameCollector.stop();
            if (winningID === id1) {
                btn1.setStyle(discord_js.ButtonStyle.Success);
                btn2.setStyle(discord_js.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js.ButtonStyle.Danger);
                btn2.setStyle(discord_js.ButtonStyle.Success);
            }
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }]
            });
            const lostEmbed = new discord_js.EmbedBuilder()
                .setDescription(`${options.loseMessage ?
                options.loseMessage.replace('{{answer}}', htmlEntities.decode(answer)) :
                `Better luck next time! It was a **${htmlEntities.decode(answer)}**.`}`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            const username = options.interaction.author ? options.interaction.author.username : options.interaction.user.username;
            const iconUrl = options.interaction.author ? options.interaction.author.displayAvatarURL() : options.interaction.user.displayAvatarURL();
            if (options.embed.author) {
                lostEmbed.setAuthor({
                    name: username,
                    iconURL: iconUrl
                });
            }
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            await interaction.channel.send({
                embeds: [lostEmbed]
            });
        }
    });
    gameCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
            btn1 = new discord_js.ButtonBuilder()
                .setCustomId(id1)
                .setLabel(options.buttons ? options.buttons.true : "Truth")
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setCustomId(id2)
                .setLabel(options.buttons ? options.buttons.lie : "Lie")
                .setDisabled();
            if (winningID === id1) {
                btn1.setStyle(discord_js.ButtonStyle.Success);
                btn2.setStyle(discord_js.ButtonStyle.Danger);
            }
            else {
                btn1.setStyle(discord_js.ButtonStyle.Danger);
                btn2.setStyle(discord_js.ButtonStyle.Success);
            }
            embed.setTimestamp(options.embed.timestamp ? new Date() : null);
            await msg.edit({
                embeds: [embed],
                components: [{ type: 1, components: [btn1, btn2] }]
            });
            const lostEmbed = new discord_js.EmbedBuilder()
                .setDescription(`${options.loseMessage ?
                options.loseMessage.replace('{{answer}}', htmlEntities.decode(answer)) :
                `**You run out of Time**\nBetter luck next time! It was a **${htmlEntities.decode(answer)}**.`}`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            const username = options.interaction.author ? options.interaction.author.username : options.interaction.user.username;
            const iconUrl = options.interaction.author ? options.interaction.author.displayAvatarURL() : options.interaction.user.displayAvatarURL();
            if (options.embed.author) {
                lostEmbed.setAuthor({
                    name: username,
                    iconURL: iconUrl
                });
            }
            if (!interaction.channel || !interaction.channel.isSendable())
                return;
            await interaction.channel.send({
                embeds: [lostEmbed]
            });
        }
    });
    checkPackageUpdates("LieSwatter", options.notifyUpdate);
};

const NeverHaveIEver = async (options) => {
    OptionsChecking(options, "NeverHaveIEver");
    let interaction = options.interaction;
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " No interaction provided.");
    options.client;
    if (!options.thinkMessage)
        options.thinkMessage = "I am thinking";
    if (typeof options.thinkMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " thinkMessage must be a string.");
    }
    if (!options.othersMessage) {
        options.othersMessage = "Only <@{{author}}> can use the buttons!";
    }
    if (typeof options.othersMessage !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " othersMessage must be a string.");
    }
    if (!options.buttons)
        options.buttons = {};
    if (typeof options.buttons !== "object") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " buttons must be an object.");
    }
    if (!options.buttons.optionA)
        options.buttons.optionA = "Yes";
    if (typeof options.buttons.optionA !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " button must be a string.");
    }
    if (!options.buttons.optionB)
        options.buttons.optionB = "No";
    if (typeof options.buttons.optionB !== "string") {
        throw new Error(chalk.red("[@m3rcena/weky] NeverHaveIEver Error:") + " button must be a string.");
    }
    const id1 = getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20);
    const id2 = getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20) +
        "-" +
        getRandomString(20);
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.thinkMessage ? options.thinkMessage : "I am thinking...")
        .setColor(options.embed.color)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    const think = await interaction.reply({
        embeds: [embed]
    });
    let { statement } = await fetch("https://api.boozee.app/v2/statements/next?language=en&category=harmless")
        .then((res) => res.json());
    statement = statement.trim();
    let btn = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(options.buttons.optionA ? options.buttons.optionA : "Yes")
        .setCustomId(id1);
    let btn2 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(options.buttons.optionB ? options.buttons.optionB : "No")
        .setCustomId(id2);
    embed
        .setTitle(options.embed.title)
        .setDescription(statement)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    await think.edit({
        embeds: [embed],
        components: [{
                type: 1,
                components: [btn, btn2]
            }]
    });
    const gameCollector = think.createMessageComponentCollector({
        componentType: discord_js.ComponentType.Button,
        time: options.time ? options.time : 60000
    });
    gameCollector.on("collect", async (nhie) => {
        if (nhie.user.id !== id) {
            return nhie.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `Only <@${id}> can use the buttons!`,
                ephemeral: true,
            });
        }
        await nhie.deferUpdate();
        if (nhie.customId === id1) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            await think.edit({
                embeds: [embed],
                components: [{
                        type: 1,
                        components: [btn, btn2]
                    }]
            });
        }
        else if (nhie.customId === id2) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            await think.edit({
                embeds: [embed],
                components: [{
                        type: 1,
                        components: [btn, btn2]
                    }]
            });
        }
    });
    gameCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Yes"} (Yes)`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "No"} (No)`)
                .setCustomId(id2)
                .setDisabled();
            embed.setDescription(statement + "\n\n**The game has ended!**");
            await think.edit({
                embeds: [embed],
                components: [{
                        type: 1,
                        components: [btn, btn2]
                    }]
            });
        }
    });
    checkPackageUpdates("NeverHaveIEver", options.notifyUpdate);
};

const currentGames = {};
const QuickClick = async (options) => {
    OptionsChecking(options, 'GuessTheNumber');
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Channel is not available in this interaction.");
    if (!interaction.guild) {
        throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Guild is not available in this interaction.");
    }
    if (!interaction.channel || !interaction.channel.isSendable()) {
        throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Channel is not available in this interaction.");
    }
    options.client;
    if (options.interaction.author) {
        options.interaction.author.id;
    }
    else {
        options.interaction.user.id;
    }
    if (!options.time)
        options.time = 60000;
    if (options.time < 10000) {
        throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Time argument must be greater than 10 Seconds (in ms i.e. 10000).");
    }
    if (!options.waitMessage)
        options.waitMessage = 'The buttons may appear anytime now!';
    if (typeof options.waitMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " waitMessage must be a string");
    }
    if (!options.startMessage)
        options.startMessage = 'First person to press the correct button will win. You have **{{time}}**!';
    if (typeof options.startMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " startMessage must be a string");
    }
    if (!options.winMessage)
        options.winMessage = 'GG, <@{{winner}}> pressed the button in **{{time}} seconds**.';
    if (typeof options.winMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " winMessage must be a string");
    }
    if (!options.loseMessage)
        options.loseMessage = 'No one pressed the button in time. So, I dropped the game!';
    if (typeof options.loseMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " loseMessage must be a string");
    }
    if (!options.emoji)
        options.emoji = '👆';
    if (typeof options.emoji !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " emoji must be a string");
    }
    if (!options.ongoingMessage)
        options.ongoingMessage = 'A game is already runnning in <#{{channel}}>. You can\'t start a new one!';
    if (typeof options.ongoingMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] QuickClick Error:") + " ongoingMessage must be a string");
    }
    if (currentGames[interaction.guild.id]) {
        let embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.ongoingMessage ? options.ongoingMessage.replace('{{channel}}', `${currentGames[`${interaction.guild.id}_channel`]}`) : `A game is already runnning in <#${currentGames[`${interaction.guild.id}_channel`]}>. You can\'t start a new one!`)
            .setColor(options.embed.color)
            .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
            .setURL(options.embed.url ? options.embed.url : null)
            .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
            .setImage(options.embed.image ? options.embed.image : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.author) {
            embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (options.embed.fields) {
            embed.setFields(options.embed.fields);
        }
        return interaction.reply({ embeds: [embed] });
    }
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.waitMessage ? options.waitMessage : 'The buttons may appear anytime now!')
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    const msg = await interaction.reply({ embeds: [embed] });
    currentGames[interaction.guild.id] = true;
    currentGames[`${interaction.guild.id}_channel`] = interaction.channel.id;
    setTimeout(async function () {
        const rows = [];
        const buttons = [];
        const gameCreatedAt = Date.now();
        for (let i = 0; i < 24; i++) {
            buttons.push(new discord_js.ButtonBuilder()
                .setDisabled()
                .setLabel('\u200b')
                .setStyle(discord_js.ButtonStyle.Primary)
                .setCustomId(getRandomString(20)));
        }
        buttons.push(new discord_js.ButtonBuilder()
            .setStyle(discord_js.ButtonStyle.Primary)
            .setEmoji(options.emoji ? options.emoji : '👆')
            .setCustomId('CORRECT'));
        shuffleArray(buttons);
        for (let i = 0; i < 5; i++) {
            rows.push(new discord_js.ActionRowBuilder());
        }
        rows.forEach((row, i) => {
            row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
        });
        let _embed = new discord_js.EmbedBuilder()
            .setTitle(options.embed.title)
            .setDescription(options.startMessage ? options.startMessage.replace('{{time}}', convertTime(options.time ? options.time : 60000)) : `First person to press the correct button will win. You have **${convertTime(options.time ? options.time : 60000)}**!`)
            .setColor(options.embed.color)
            .setTimestamp(options.embed.timestamp ? new Date() : null)
            .setURL(options.embed.url ? options.embed.url : null)
            .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
            .setImage(options.embed.image ? options.embed.image : null)
            .setFooter({
            text: "©️ M3rcena Development | Powered by Mivator",
            iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
        });
        if (options.embed.author) {
            _embed.setAuthor({
                name: options.embed.author.name,
                iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                url: options.embed.author.url ? options.embed.author.url : undefined
            });
        }
        if (options.embed.fields) {
            _embed.setFields(options.embed.fields);
        }
        await msg.edit({
            embeds: [_embed],
            components: rows,
        });
        const Collector = msg.createMessageComponentCollector({
            filter: (fn) => fn.message.id === msg.id,
            time: options.time,
        });
        Collector.on('collect', async (button) => {
            if (!interaction.guild) {
                throw new Error(chalk.red("[@m3rcena/weky] QuickClick Error:") + " Guild is not available in this interaction.");
            }
            if (button.customId === 'CORRECT') {
                await button.deferUpdate();
                Collector.stop();
                buttons.forEach((element) => {
                    element.setDisabled();
                });
                rows.length = 0;
                for (let i = 0; i < 5; i++) {
                    rows.push(new discord_js.ActionRowBuilder());
                }
                rows.forEach((row, i) => {
                    row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
                });
                let __embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.winMessage ? options.winMessage
                    .replace('{{winner}}', button.user.id)
                    .replace('{{time}}', `${(Date.now() - gameCreatedAt) / 1000}`)
                    : `GG, <@${button.user.id}> pressed the button in **${(Date.now() - gameCreatedAt) / 1000} seconds**.`)
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    __embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    __embed.setFields(options.embed.fields);
                }
                await msg.edit({
                    embeds: [__embed],
                    components: rows,
                });
            }
            return delete currentGames[interaction.guild.id];
        });
        Collector.on('end', async (_msg, reason) => {
            if (reason === 'time') {
                buttons.forEach((element) => {
                    element.setDisabled();
                });
                rows.length = 0;
                for (let i = 0; i < 5; i++) {
                    rows.push(new discord_js.ActionRowBuilder());
                }
                rows.forEach((row, i) => {
                    row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
                });
                let __embed = new discord_js.EmbedBuilder()
                    .setTitle(options.embed.title)
                    .setDescription(options.loseMessage ? options.loseMessage
                    : 'No one pressed the button in time. So, I dropped the game!')
                    .setColor(options.embed.color)
                    .setTimestamp(options.embed.timestamp ? new Date() : null)
                    .setURL(options.embed.url ? options.embed.url : null)
                    .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                    .setImage(options.embed.image ? options.embed.image : null)
                    .setFooter({
                    text: "©️ M3rcena Development | Powered by Mivator",
                    iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
                });
                if (options.embed.author) {
                    __embed.setAuthor({
                        name: options.embed.author.name,
                        iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                        url: options.embed.author.url ? options.embed.author.url : undefined
                    });
                }
                if (options.embed.fields) {
                    __embed.setFields(options.embed.fields);
                }
                await msg.edit({
                    embeds: [__embed],
                    components: rows,
                });
                if (!interaction.guild) {
                    return;
                }
                return delete currentGames[interaction.guild.id];
            }
        });
    }, Math.floor(Math.random() * 5000) + 1000);
    checkPackageUpdates('QuickClick', options.notifyUpdate);
};

const WillYouPressTheButton = async (options) => {
    OptionsChecking(options, "WillYouPressTheButton");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No channel provided in interaction.");
    options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    if (!options.button)
        options.button = {};
    if (typeof options.embed !== 'object') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " embed must be an object.");
    }
    if (!options.button.yes)
        options.button.yes = 'Yes';
    if (typeof options.button.yes !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " button.yes must be a string.");
    }
    if (!options.button.no)
        options.button.no = 'No';
    if (typeof options.button.no !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " button.no must be a string.");
    }
    if (!options.thinkMessage)
        options.thinkMessage = 'I am thinking';
    if (typeof options.thinkMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " thinkMessage must be a string.");
    }
    if (!options.othersMessage) {
        options.othersMessage = 'Only <@{{author}}> can use the buttons!';
    }
    if (typeof options.othersMessage !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " othersMessage must be a string.");
    }
    if (!options.embed.description) {
        options.embed.description = '```{{statement1}}```\n**but**\n\n```{{statement2}}```';
    }
    if (typeof options.embed.description !== 'string') {
        throw new TypeError(chalk.red("[@m3rcena/weky] WillYouPressTheButton Error:") + " embed.description must be a string.");
    }
    const id1 = getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);
    const id2 = getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);
    let embed = new discord_js.EmbedBuilder()
        .setTitle(`${options.thinkMessage}...`)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
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
    let btn = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Success)
        .setLabel(options.button.yes)
        .setCustomId(id1);
    let btn2 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Danger)
        .setLabel(options.button.no)
        .setCustomId(id2);
    embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(`${options.embed.description
        .replace('{{statement1}}', res.questions[0].charAt(0).toUpperCase() +
        res.questions[0].slice(1))
        .replace('{{statement2}}', res.questions[1].charAt(0).toUpperCase() +
        res.questions[1].slice(1))}`)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? new Date() : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
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
        }
        await wyptb.deferUpdate();
        if (wyptb.customId === id1) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Success)
                .setLabel(`${options.button ? options.button.yes ? options.button.yes : 'Yes' : 'Yes'} (${res.percentage['1']})`)
                .setDisabled()
                .setCustomId(id1);
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
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
        else if (wyptb.customId === id2) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Danger)
                .setLabel(`${options.button ? options.button.yes ? options.button.yes : 'Yes' : 'Yes'} (${res.percentage['1']})`)
                .setDisabled()
                .setCustomId(id1);
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Success)
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
    });
    checkPackageUpdates("WillYouPressTheButton", options.notifyUpdate);
};

const WouldYouRather = async (options) => {
    OptionsChecking(options, "WouldYouRather");
    let interaction;
    if (options.interaction.author) {
        interaction = options.interaction;
    }
    else {
        interaction = options.interaction;
    }
    if (!interaction)
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No interaction provided.");
    if (!interaction.channel || !interaction.channel.isSendable())
        throw new Error(chalk.red("[@m3rcena/weky] FastType Error:") + " No channel provided in interaction.");
    options.client;
    let id = "";
    if (options.interaction.author) {
        id = options.interaction.author.id;
    }
    else {
        id = options.interaction.user.id;
    }
    const id1 = getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);
    const id2 = getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20) +
        '-' +
        getRandomString(20);
    let embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(options.thinkMessage ?
        options.thinkMessage :
        `I am thinking...`)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? options.embed.timestamp : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
        });
    }
    if (options.embed.fields) {
        embed.setFields(options.embed.fields);
    }
    const think = await interaction.reply({
        embeds: [embed]
    });
    const number = Math.floor(Math.random() * (700 - 1 + 1)) + 1;
    const response = await ofetch.ofetch(`https://wouldurather.io/api/question?id=${number}`);
    const data = response;
    const res = {
        questions: [data.option1, data.option2],
        percentage: {
            1: ((parseInt(data.option1Votes) /
                (parseInt(data.option1Votes) + parseInt(data.option2Votes))) *
                100).toFixed(2) + '%',
            2: ((parseInt(data.option2Votes) /
                (parseInt(data.option1Votes) + parseInt(data.option2Votes))) *
                100).toFixed(2) + '%',
        },
    };
    let btn = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(options.buttons ? options.buttons.optionA : "Option A")
        .setCustomId(id1);
    let btn2 = new discord_js.ButtonBuilder()
        .setStyle(discord_js.ButtonStyle.Primary)
        .setLabel(options.buttons ? options.buttons.optionB : "Option B")
        .setCustomId(id2);
    embed = new discord_js.EmbedBuilder()
        .setTitle(options.embed.title)
        .setDescription(`**Option A:** ${htmlEntities.decode(res.questions[0])}\n**Option B:** ${htmlEntities.decode(res.questions[1])}`)
        .setColor(options.embed.color)
        .setTimestamp(options.embed.timestamp ? new Date() : null)
        .setURL(options.embed.url ? options.embed.url : null)
        .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
        .setImage(options.embed.image ? options.embed.image : null)
        .setFooter({
        text: "©️ M3rcena Development | Powered by Mivator",
        iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
    });
    if (options.embed.author) {
        embed.setAuthor({
            name: options.embed.author.name,
            iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
            url: options.embed.author.url ? options.embed.author.url : undefined
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
        componentType: discord_js.ComponentType.Button,
        time: options.time ? options.time : undefined
    });
    gameCollector.on('collect', async (wyr) => {
        if (wyr.user.id !== id) {
            return wyr.reply({
                content: options.othersMessage ?
                    options.othersMessage.replace('{{author}}', id) :
                    `This is not your game!`,
                ephemeral: true
            });
        }
        await wyr.deferUpdate();
        if (wyr.customId === id1) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Option A"}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "Option B"}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(`**Option A:** ${htmlEntities.decode(res.questions[0])} (${res.percentage['1']})\n**Option B:** ${htmlEntities.decode(res.questions[1])} (${res.percentage['2']})`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            await wyr.editReply({
                embeds: [_embed],
                components: [
                    {
                        type: 1,
                        components: [btn, btn2]
                    }
                ]
            });
        }
        else if (wyr.customId === id2) {
            btn = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Secondary)
                .setLabel(`${options.buttons ? options.buttons.optionA : "Option A"}` + ` (${res.percentage['1']})`)
                .setCustomId(id1)
                .setDisabled();
            btn2 = new discord_js.ButtonBuilder()
                .setStyle(discord_js.ButtonStyle.Primary)
                .setLabel(`${options.buttons ? options.buttons.optionB : "Option B"}` + ` (${res.percentage['2']})`)
                .setCustomId(id2)
                .setDisabled();
            gameCollector.stop();
            const _embed = new discord_js.EmbedBuilder()
                .setTitle(options.embed.title)
                .setDescription(`**Option A:** ${htmlEntities.decode(res.questions[0])} (${res.percentage['1']})\n**Option B:** ${htmlEntities.decode(res.questions[1])} (${res.percentage['2']})`)
                .setColor(options.embed.color)
                .setTimestamp(options.embed.timestamp ? new Date() : null)
                .setURL(options.embed.url ? options.embed.url : null)
                .setThumbnail(options.embed.thumbnail ? options.embed.thumbnail : null)
                .setImage(options.embed.image ? options.embed.image : null)
                .setFooter({
                text: "©️ M3rcena Development | Powered by Mivator",
                iconURL: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/refs/heads/main/assets/logo.png"
            });
            if (options.embed.author) {
                _embed.setAuthor({
                    name: options.embed.author.name,
                    iconURL: options.embed.author.icon_url ? options.embed.author.icon_url : undefined,
                    url: options.embed.author.url ? options.embed.author.url : undefined
                });
            }
            if (options.embed.fields) {
                _embed.setFields(options.embed.fields);
            }
            await wyr.editReply({
                embeds: [_embed],
                components: [
                    {
                        type: 1,
                        components: [btn, btn2]
                    }
                ]
            });
        }
    });
    checkPackageUpdates("WouldYouRather", options.notifyUpdate);
};

exports.Calculator = Calculator;
exports.ChaosWords = ChaosWords;
exports.FastType = FastType;
exports.GuessTheNumber = GuessTheNumber;
exports.Hangman = Hangman;
exports.LieSwatter = LieSwatter;
exports.NeverHaveIEver = NeverHaveIEver;
exports.QuickClick = QuickClick;
exports.WillYouPressTheButton = WillYouPressTheButton;
exports.WouldYouRather = WouldYouRather;
exports.mini2048 = mini2048;
