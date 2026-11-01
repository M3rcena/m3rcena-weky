import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, ContainerBuilder, EmbedBuilder, Events, GuildMember, LabelBuilder, MediaGalleryBuilder, Message, MessageFlags, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, resolveColor } from "discord.js";
import { randomBytes } from "crypto";
import { EventEmitter } from "events";
import { Canvas, createCanvas, loadImage } from "@napi-rs/canvas";
import path, * as path$1 from "node:path";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";
// src/version.ts
const version = "14.28.0";
const VERSION = version;
// src/utils/Helpers.ts
/**
* Generates a cryptographically secure random string with a prefix.
* @param length Length of the random suffix.
* @param prefix Optional prefix for the customId (default "weky_").
*/
function getRandomString(length = 8, prefix = "weky_") {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const bytes = randomBytes(length);
	let result = prefix;
	for (let i = 0; i < length; i++) result += chars[bytes[i] % 36];
	return result;
}
/**
* Converts milliseconds into a clean human-readable duration string.
* @param ms Duration in milliseconds.
*/
function formatTime(ms) {
	if (ms < 1e3) return `${Math.round(ms)}ms`;
	const totalSeconds = Math.floor(ms / 1e3);
	const seconds = totalSeconds % 60;
	const minutes = Math.floor(totalSeconds / 60 % 60);
	const hours = Math.floor(totalSeconds / 3600);
	const days = Math.floor(hours / 24);
	const parts = [];
	if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
	if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 === 1 ? "" : "s"}`);
	if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
	return parts.join(", ");
}
/**
* Randomly shuffles characters in a string.
*/
function shuffleString(str) {
	const arr = str.split("");
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr.join("");
}
/**
* Randomly shuffles an array using Fisher-Yates algorithm.
*/
function shuffleArray(array) {
	const clone = [...array];
	for (let i = clone.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[clone[i], clone[j]] = [clone[j], clone[i]];
	}
	return clone;
}
/**
* Safely resolves any Discord color (Hex, Name, Number).
*/
function safeResolveColor(color, fallback = 5793266) {
	if (!color) return fallback;
	try {
		return resolveColor(color);
	} catch {
		return fallback;
	}
}
/**
* Clamps a number between min and max.
*/
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
// src/core/ContextAdapter.ts
var ContextAdapter = class ContextAdapter {
	raw;
	user;
	userId;
	member;
	guild;
	channel;
	client;
	isInteraction;
	isMessage;
	gameMessage = null;
	constructor(context) {
		if (context instanceof ContextAdapter) context = context.raw;
		this.raw = context;
		if (context instanceof Message) {
			this.isMessage = true;
			this.isInteraction = false;
			this.user = context.author;
			this.userId = context.author.id;
			this.member = context.member ?? null;
			this.guild = context.guild ?? null;
			this.channel = context.channel;
			this.client = context.client;
		} else {
			this.isInteraction = true;
			this.isMessage = false;
			this.user = context.user || context.author;
			this.userId = this.user?.id || context.member?.id;
			this.member = context.member ?? null;
			this.guild = context.guild ?? null;
			this.channel = context.channel;
			this.client = context.client;
		}
		if (!this.user || !this.channel) throw new Error("[ContextAdapter] Invalid Discord context: unable to resolve user or channel.");
	}
	static from(context) {
		return new ContextAdapter(context);
	}
	/**
	* Resolves appropriate message flags, ensuring MessageFlags.IsComponentsV2
	* is automatically attached whenever ContainerBuilder is present.
	*/
	resolveFlags(options) {
		let flags = typeof options.flags === "number" ? options.flags : 0;
		if (options.components?.some((c) => c instanceof ContainerBuilder || typeof c?.setAccentColor === "function" || c?.data?.type === 17)) flags |= MessageFlags.IsComponentsV2;
		return flags > 0 ? flags : void 0;
	}
	/**
	* Sends the initial game interface message.
	* Handles interaction replies (using withResponse: true), deferred states, and message channels transparently.
	*/
	async sendInitial(options) {
		const resolvedFlags = this.resolveFlags(options);
		const isV2 = !!((resolvedFlags ?? 0) & MessageFlags.IsComponentsV2);
		if (this.isInteraction) {
			const interaction = this.raw;
			if (interaction.deferred || interaction.replied) {
				const payload = {
					components: options.components,
					files: options.files,
					flags: resolvedFlags
				};
				if (!isV2) {
					if (options.content !== void 0) payload.content = options.content;
					if (options.embeds !== void 0) payload.embeds = options.embeds;
				}
				const msg = await interaction.editReply(payload);
				if (msg instanceof Message) this.gameMessage = msg;
				else if (typeof interaction.fetchReply === "function") this.gameMessage = await interaction.fetchReply().catch(() => null);
				else this.gameMessage = msg || null;
			} else {
				const payload = {
					components: options.components,
					files: options.files,
					flags: resolvedFlags,
					withResponse: true
				};
				if (!isV2) {
					if (options.content !== void 0) payload.content = options.content;
					if (options.embeds !== void 0) payload.embeds = options.embeds;
				}
				const response = await interaction.reply(payload);
				if (response && typeof response === "object" && "resource" in response && response.resource?.message) this.gameMessage = response.resource.message;
				else if (response instanceof Message || response && typeof response === "object" && "id" in response) this.gameMessage = response;
				else if (typeof interaction.fetchReply === "function") this.gameMessage = await interaction.fetchReply().catch(() => null);
				else this.gameMessage = response || null;
			}
		} else {
			const channel = this.channel;
			if (typeof channel.send !== "function") throw new Error("[ContextAdapter] The provided channel is not sendable.");
			const payload = {
				components: options.components,
				files: options.files,
				flags: resolvedFlags,
				allowedMentions: { repliedUser: false }
			};
			if (!isV2) {
				if (options.content !== void 0) payload.content = options.content;
				if (options.embeds !== void 0) payload.embeds = options.embeds;
			}
			const msg = await channel.send(payload);
			this.gameMessage = msg;
		}
		return this.gameMessage;
	}
	/**
	* Updates the game message safely with Components V2 support.
	*/
	async edit(options) {
		if (!this.gameMessage) {
			await this.sendInitial(options);
			return;
		}
		const resolvedFlags = this.resolveFlags(options);
		const isV2 = !!((resolvedFlags ?? 0) & MessageFlags.IsComponentsV2);
		const payload = {
			components: options.components ?? [],
			files: options.files ?? [],
			flags: resolvedFlags
		};
		if (!isV2) {
			payload.content = options.content ?? null;
			payload.embeds = options.embeds ?? [];
		}
		try {
			await this.gameMessage.edit(payload);
		} catch (err) {
			if (err.code !== 10008 && err.code !== 50027) {}
		}
	}
	/**
	* Sends an ephemeral reply to an interaction if a non-player attempts to interact.
	* Uses modern flags: MessageFlags.Ephemeral instead of deprecated ephemeral: true.
	*/
	static async replyEphemeral(interaction, content) {
		try {
			if (!interaction || typeof interaction.isRepliable !== "function" || !interaction.isRepliable()) return;
			if (interaction.replied || interaction.deferred) await interaction.followUp({
				content,
				flags: MessageFlags.Ephemeral
			});
			else await interaction.reply({
				content,
				flags: MessageFlags.Ephemeral
			});
		} catch {}
	}
	/**
	* Safely deletes the game message.
	*/
	async delete() {
		if (this.gameMessage && this.gameMessage.deletable) try {
			await this.gameMessage.delete();
		} catch {}
	}
};
// src/core/BaseGame.ts
var BaseGame = class {
	id;
	gameKey;
	ctx;
	options;
	manager;
	isActive = false;
	defaultColor;
	startTime = 0;
	timeoutTimer = null;
	defaultTimeout = 6e4;
	constructor(manager, options, gameKey) {
		this.manager = manager;
		this.options = options;
		this.gameKey = gameKey;
		this.ctx = ContextAdapter.from(options.context);
		this.id = `${this.ctx.userId}_${gameKey}`;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
		this.defaultColor = this.resolveColor(options.embed?.color);
	}
	/**
	* Safely resolves a color according to the hierarchy:
	* 1. Explicit override color passed
	* 2. options.embed.color
	* 3. manager.embedColor
	* 4. fallback color
	*/
	resolveColor(color, fallback = 5793266) {
		if (color) return safeResolveColor(color, fallback);
		if (this.options.embed?.color) return safeResolveColor(this.options.embed.color, fallback);
		if (this.manager?.embedColor) return safeResolveColor(this.manager.embedColor, fallback);
		return fallback;
	}
	/**
	* Resets the inactivity timeout.
	*/
	resetTimeout(callback, customMs) {
		this.clearTimer();
		const duration = customMs || this.defaultTimeout;
		this.timeoutTimer = setTimeout(() => {
			if (this.isActive) {
				if (callback) callback();
				else this.onTimeout();
			}
		}, duration);
	}
	/**
	* Safely clears the timeout timer.
	*/
	clearTimer() {
		if (this.timeoutTimer) {
			clearTimeout(this.timeoutTimer);
			this.timeoutTimer = null;
		}
	}
	/**
	* Default timeout handler. Can be overridden by subclasses.
	*/
	onTimeout() {
		this.destroy();
	}
	/**
	* Helper to construct a Components V2 ContainerBuilder with accent color.
	* If the user provided an embed.color, it is strictly prioritized across all states.
	*/
	createContainer(stateAccentColor) {
		const container = new ContainerBuilder();
		const color = this.options.embed?.color ? safeResolveColor(this.options.embed.color, this.defaultColor) : stateAccentColor !== void 0 ? stateAccentColor : this.defaultColor;
		container.setAccentColor(color);
		return container;
	}
	/**
	* Helper to construct a Components V2 MediaGalleryBuilder for attachments.
	*/
	createMediaGallery(attachmentUrlOrName) {
		const url = attachmentUrlOrName.startsWith("attachment://") ? attachmentUrlOrName : `attachment://${attachmentUrlOrName}`;
		return new MediaGalleryBuilder().addItems((item) => item.setURL(url));
	}
	/**
	* Applies custom embed properties (author, description, fields, footer, timestamp)
	* to markdown text displayed inside a Components V2 Container.
	*/
	applyEmbedDecorations(container, content) {
		let finalContent = content;
		if (this.options.embed?.author?.name) finalContent = `${this.options.embed.author.url ? `[${this.options.embed.author.name}](${this.options.embed.author.url})` : `**${this.options.embed.author.name}**`}\n\n${finalContent}`;
		if (this.options.embed?.description && !finalContent.includes(this.options.embed.description)) finalContent = `${finalContent}\n\n${this.options.embed.description}`;
		if (this.options.embed?.fields && this.options.embed.fields.length > 0) {
			const fieldsText = this.options.embed.fields.map((f) => `**${f.name}**\n${f.value}`).join("\n\n");
			finalContent = `${finalContent}\n\n${fieldsText}`;
		}
		const footerParts = [];
		if (this.options.embed?.footer?.text) footerParts.push(this.options.embed.footer.text);
		if (this.options.embed?.timestamp) {
			const date = this.options.embed.timestamp === true ? /* @__PURE__ */ new Date() : new Date(this.options.embed.timestamp);
			footerParts.push(`<t:${Math.floor(date.getTime() / 1e3)}:R>`);
		}
		if (footerParts.length > 0) finalContent = `${finalContent}\n\n- - -\n${footerParts.join(" • ")}`;
		if (this.options.embed?.thumbnail && !container.data.components?.some((c) => c.type === 18)) container.addMediaGalleryComponents(this.createMediaGallery(this.options.embed.thumbnail));
		return finalContent;
	}
	/**
	* Emits the gameStart lifecycle event on WekyManager and registers session with the bridge.
	*/
	emitStart() {
		this.startTime = Date.now();
		if (this.manager) {
			if (typeof this.manager.emit === "function") this.manager.emit("gameStart", {
				game: this.gameKey,
				user: this.ctx.user,
				channelId: this.ctx.channel?.id,
				timestamp: this.startTime
			});
			if (this.manager.bridge && typeof this.manager.bridge.registerSession === "function") this.manager.bridge.registerSession({
				id: this.id,
				game: this.gameKey,
				platform: "discord",
				players: [{
					id: this.ctx.userId,
					username: this.ctx.user?.username || "Player",
					avatarUrl: this.ctx.user?.displayAvatarURL ? this.ctx.user.displayAvatarURL({ extension: "png" }) : void 0,
					platform: "discord"
				}],
				state: {
					active: true,
					startTime: this.startTime
				},
				createdAt: this.startTime,
				lastUpdated: Date.now(),
				isGameOver: false
			});
			if (this.manager.soundboard && typeof this.manager.soundboard.triggerSound === "function") this.manager.soundboard.triggerSound("gamestart", {
				sessionId: this.id,
				game: this.gameKey
			});
		}
	}
	/**
	* Emits the gameOver lifecycle event on WekyManager and updates the bridge session.
	*/
	emitEnd(outcome, score = 0, extra = {}) {
		const timeElapsed = this.startTime > 0 ? Date.now() - this.startTime : 0;
		if (this.manager) {
			if (typeof this.manager.emit === "function") this.manager.emit("gameOver", {
				game: this.gameKey,
				user: this.ctx.user,
				outcome,
				score,
				timeElapsed,
				timestamp: Date.now(),
				...extra
			});
			if (this.manager.bridge && typeof this.manager.bridge.endSession === "function") this.manager.bridge.endSession(this.id, {
				reason: outcome,
				...extra
			});
			if (this.manager.soundboard && typeof this.manager.soundboard.triggerSound === "function") {
				const soundKey = outcome === "WIN" || outcome === "won" ? "victory" : outcome === "LOSE" || outcome === "lost" || outcome === "loss" || outcome === "gameover" ? "defeat" : outcome === "tie" ? "tie" : "action";
				this.manager.soundboard.triggerSound(soundKey, {
					sessionId: this.id,
					game: this.gameKey
				});
			}
		}
	}
	/**
	* Emits the gameError lifecycle event on WekyManager.
	*/
	emitError(error) {
		if (this.manager && typeof this.manager.emit === "function") this.manager.emit("gameError", {
			game: this.gameKey,
			error,
			context: this.ctx
		});
	}
	/**
	* Standardized Embed builder for backwards compatibility.
	*/
	createEmbed(description, titleOverride) {
		const embed = new EmbedBuilder();
		const opts = this.options.embed;
		if (titleOverride || opts?.title) embed.setTitle(titleOverride || opts.title);
		if (description || opts?.description) embed.setDescription(description || opts.description);
		embed.setColor(this.resolveColor(opts?.color));
		if (opts?.footer) embed.setFooter(opts.footer);
		if (opts?.timestamp) embed.setTimestamp(opts.timestamp === true ? /* @__PURE__ */ new Date() : new Date(opts.timestamp));
		if (opts?.author) embed.setAuthor({
			name: opts.author.name,
			iconURL: opts.author.icon_url,
			url: opts.author.url
		});
		if (opts?.fields && opts.fields.length > 0) embed.setFields(opts.fields);
		if (opts?.thumbnail) embed.setThumbnail(opts.thumbnail);
		if (opts?.image) embed.setImage(opts.image);
		if (opts?.url) embed.setURL(opts.url);
		return embed;
	}
	/**
	* Checks if the interacting user is the game owner. If not, replies with othersMessage.
	*/
	isAuthorized(interaction, allowedUserIds) {
		const userId = interaction.user.id;
		if (!(allowedUserIds || [this.ctx.userId]).includes(userId)) {
			const reply = (this.options.othersMessage || this.manager?.unauthorizedMessage || "Only <@{{author}}> can use these buttons!").replace(/\{\{author\}\}/g, this.ctx.userId);
			ContextAdapter.replyEphemeral(interaction, reply);
			if (this.manager && typeof this.manager.emit === "function") this.manager.emit("unauthorizedClick", {
				game: this.gameKey,
				user: interaction.user,
				interaction
			});
			return false;
		}
		return true;
	}
	/**
	* Terminates and cleans up the minigame instance.
	*/
	destroy() {
		this.isActive = false;
		this.clearTimer();
		if (this.manager) {
			if (this.manager._eventManager) this.manager._eventManager.unregister(this.id);
			if (this.manager.bridge && typeof this.manager.bridge.unregisterSession === "function") this.manager.bridge.unregisterSession(this.id);
		}
	}
};
// src/core/EventManager.ts
/**
* Global Event Multiplexer.
* Attaches a single listener to the Discord Client to dispatch events to all active minigames
* without triggering EventEmitter MaxListenersExceeded warnings or memory leaks.
*/
var EventManager = class {
	client;
	activeGames = /* @__PURE__ */ new Map();
	initialized = false;
	constructor(client) {
		this.client = client;
		this.initListeners();
	}
	initListeners() {
		if (this.initialized) return;
		this.initialized = true;
		this.client.on(Events.InteractionCreate, async (interaction) => {
			for (const game of this.activeGames.values()) if (game.onInteraction) try {
				await game.onInteraction(interaction);
			} catch (err) {
				console.error(`[Weky:EventManager] Error in game ${game.id} onInteraction:`, err);
			}
		});
		this.client.on(Events.MessageCreate, async (message) => {
			if (message.author.bot) return;
			for (const game of this.activeGames.values()) if (game.onMessage) try {
				await game.onMessage(message);
			} catch (err) {
				console.error(`[Weky:EventManager] Error in game ${game.id} onMessage:`, err);
			}
		});
		this.client.on(Events.TypingStart, async (typing) => {
			for (const game of this.activeGames.values()) if (game.onTypingStart) try {
				await game.onTypingStart(typing);
			} catch (err) {
				console.error(`[Weky:EventManager] Error in game ${game.id} onTypingStart:`, err);
			}
		});
	}
	register(game) {
		this.activeGames.set(game.id, game);
	}
	unregister(gameId) {
		this.activeGames.delete(gameId);
	}
	isRegistered(gameId) {
		return this.activeGames.has(gameId);
	}
	getActiveCount() {
		return this.activeGames.size;
	}
};
// src/utils/MathEvaluator.ts
var MathEvaluator = class {
	static factorial(n) {
		if (!Number.isInteger(n) || n < 0) throw new Error("Factorial is only defined for non-negative integers");
		if (n > 170) throw new Error("Factorial overflow (max 170)");
		if (n === 0 || n === 1) return 1;
		let res = 1;
		for (let i = 2; i <= n; i++) res *= i;
		return res;
	}
	/**
	* Evaluates a mathematical expression safely.
	* @param expression The mathematical string.
	* @param lastAnswer The previous answer value for 'ans'.
	*/
	static evaluate(expression, lastAnswer = 0) {
		try {
			if (!expression || expression.trim().length === 0) return {
				result: null,
				formatted: "0",
				error: "Empty expression"
			};
			let clean = expression.replace(/×/g, "*").replace(/x/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").trim();
			const tokens = this.tokenize(clean, lastAnswer);
			const rpn = this.toRPN(tokens);
			const result = this.evaluateRPN(rpn);
			if (!Number.isFinite(result)) return {
				result: null,
				formatted: "Error",
				error: "Result is infinite or undefined"
			};
			return {
				result,
				formatted: this.formatNumber(result)
			};
		} catch (err) {
			return {
				result: null,
				formatted: "Error",
				error: err.message || "Invalid expression"
			};
		}
	}
	static formatNumber(n) {
		if (Number.isInteger(n)) return n.toString();
		return parseFloat(n.toFixed(10)).toString();
	}
	static tokenize(expr, lastAnswer) {
		const tokens = [];
		let i = 0;
		while (i < expr.length) {
			const char = expr[i];
			if (/\s/.test(char)) {
				i++;
				continue;
			}
			if (/\d/.test(char) || char === "." && /\d/.test(expr[i + 1] || "")) {
				let numStr = "";
				while (i < expr.length && (/[\d.]/.test(expr[i]) || expr[i] === "e" && /[\d+-]/.test(expr[i + 1] || ""))) {
					numStr += expr[i];
					i++;
				}
				tokens.push(parseFloat(numStr));
				continue;
			}
			if (/[a-zA-Z]/.test(char)) {
				let ident = "";
				while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
					ident += expr[i].toLowerCase();
					i++;
				}
				if (ident === "pi") tokens.push(Math.PI);
				else if (ident === "e") tokens.push(Math.E);
				else if (ident === "ans") tokens.push(lastAnswer);
				else if ([
					"sin",
					"cos",
					"tan",
					"sqrt",
					"log",
					"log10",
					"ln",
					"round",
					"abs"
				].includes(ident)) tokens.push(ident);
				else throw new Error(`Unknown function or symbol: ${ident}`);
				continue;
			}
			if (char === "+" || char === "-" || char === "*" || char === "/" || char === "^" || char === "%" || char === "!" || char === "(" || char === ")") {
				if (char === "-") {
					const prev = tokens[tokens.length - 1];
					if (tokens.length === 0 || prev === "(" || typeof prev === "string" && prev !== "!") {
						tokens.push("u-");
						i++;
						continue;
					}
				}
				tokens.push(char);
				i++;
				continue;
			}
			throw new Error(`Invalid character: '${char}'`);
		}
		return tokens;
	}
	static toRPN(tokens) {
		const output = [];
		const stack = [];
		const precedence = {
			"+": 1,
			"-": 1,
			"*": 2,
			"/": 2,
			"%": 2,
			"^": 3,
			"u-": 4,
			"!": 5
		};
		const isRightAssociative = (op) => op === "^" || op === "u-";
		for (const token of tokens) if (typeof token === "number") output.push(token);
		else if ([
			"sin",
			"cos",
			"tan",
			"sqrt",
			"log",
			"log10",
			"ln",
			"round",
			"abs"
		].includes(token)) stack.push(token);
		else if (token === "(") stack.push(token);
		else if (token === ")") {
			while (stack.length > 0 && stack[stack.length - 1] !== "(") output.push(stack.pop());
			if (stack.length === 0) throw new Error("Mismatched parentheses");
			stack.pop();
			if (stack.length > 0 && [
				"sin",
				"cos",
				"tan",
				"sqrt",
				"log",
				"log10",
				"ln",
				"round",
				"abs"
			].includes(stack[stack.length - 1])) output.push(stack.pop());
		} else {
			const op = token;
			while (stack.length > 0 && stack[stack.length - 1] !== "(" && (!isRightAssociative(op) && precedence[stack[stack.length - 1]] >= precedence[op] || isRightAssociative(op) && precedence[stack[stack.length - 1]] > precedence[op])) output.push(stack.pop());
			stack.push(op);
		}
		while (stack.length > 0) {
			const top = stack.pop();
			if (top === "(" || top === ")") throw new Error("Mismatched parentheses");
			output.push(top);
		}
		return output;
	}
	static evaluateRPN(rpn) {
		const stack = [];
		for (const token of rpn) {
			if (typeof token === "number") {
				stack.push(token);
				continue;
			}
			switch (token) {
				case "u-":
					if (stack.length < 1) throw new Error("Invalid unary minus syntax");
					stack.push(-stack.pop());
					break;
				case "!":
					if (stack.length < 1) throw new Error("Invalid factorial syntax");
					stack.push(this.factorial(stack.pop()));
					break;
				case "+": {
					if (stack.length < 2) throw new Error("Invalid addition syntax");
					const b = stack.pop();
					const a = stack.pop();
					stack.push(a + b);
					break;
				}
				case "-": {
					if (stack.length < 2) throw new Error("Invalid subtraction syntax");
					const b = stack.pop();
					const a = stack.pop();
					stack.push(a - b);
					break;
				}
				case "*": {
					if (stack.length < 2) throw new Error("Invalid multiplication syntax");
					const b = stack.pop();
					const a = stack.pop();
					stack.push(a * b);
					break;
				}
				case "/": {
					if (stack.length < 2) throw new Error("Invalid division syntax");
					const b = stack.pop();
					const a = stack.pop();
					if (b === 0) throw new Error("Cannot divide by zero");
					stack.push(a / b);
					break;
				}
				case "%": {
					if (stack.length < 2) throw new Error("Invalid modulo syntax");
					const b = stack.pop();
					const a = stack.pop();
					if (b === 0) throw new Error("Cannot divide by zero");
					stack.push(a % b);
					break;
				}
				case "^": {
					if (stack.length < 2) throw new Error("Invalid exponent syntax");
					const b = stack.pop();
					const a = stack.pop();
					if (b > 1e3 || a > 100 && b > 100) throw new Error("Exponent too large");
					stack.push(Math.pow(a, b));
					break;
				}
				case "sin":
					if (stack.length < 1) throw new Error("Missing argument for sin");
					stack.push(Math.sin(stack.pop()));
					break;
				case "cos":
					if (stack.length < 1) throw new Error("Missing argument for cos");
					stack.push(Math.cos(stack.pop()));
					break;
				case "tan":
					if (stack.length < 1) throw new Error("Missing argument for tan");
					stack.push(Math.tan(stack.pop()));
					break;
				case "sqrt": {
					if (stack.length < 1) throw new Error("Missing argument for sqrt");
					const val = stack.pop();
					if (val < 0) throw new Error("Cannot calculate square root of a negative number");
					stack.push(Math.sqrt(val));
					break;
				}
				case "log":
				case "log10": {
					if (stack.length < 1) throw new Error("Missing argument for log");
					const val = stack.pop();
					if (val <= 0) throw new Error("Logarithm argument must be positive");
					stack.push(Math.log10(val));
					break;
				}
				case "ln": {
					if (stack.length < 1) throw new Error("Missing argument for ln");
					const val = stack.pop();
					if (val <= 0) throw new Error("Logarithm argument must be positive");
					stack.push(Math.log(val));
					break;
				}
				case "round":
					if (stack.length < 1) throw new Error("Missing argument for round");
					stack.push(Math.round(stack.pop()));
					break;
				case "abs":
					if (stack.length < 1) throw new Error("Missing argument for abs");
					stack.push(Math.abs(stack.pop()));
					break;
				default: throw new Error(`Unknown operator: ${token}`);
			}
		}
		if (stack.length !== 1) throw new Error("Invalid expression");
		return stack[0];
	}
};
// src/games/Calculator.ts
const STANDARD_KEYS$1 = [
	"DC",
	"(",
	")",
	"⌫",
	"AC",
	"7",
	"8",
	"9",
	"÷",
	"^",
	"4",
	"5",
	"6",
	"x",
	"SQRT",
	"1",
	"2",
	"3",
	" - ",
	" + ",
	"2nd",
	"0",
	".",
	"ans",
	"="
];
const SCIENTIFIC_KEYS$1 = [
	"DC",
	"SIN",
	"COS",
	"TAN",
	"AC",
	"LG",
	"LN",
	"x!",
	"1/x",
	"⌫",
	"RND",
	"π",
	"e",
	"÷",
	"x",
	"(",
	")",
	"%",
	" - ",
	" + ",
	"2nd",
	"0",
	".",
	"ans",
	"="
];
const INVALID_START_KEYS$1 = [
	"⌫",
	"AC",
	"=",
	"x",
	"÷",
	"%",
	"^",
	"x!"
];
var Calculator = class extends BaseGame {
	msg1 = null;
	currentExpression = " ";
	lastAnswer = "";
	hasCalculated = false;
	isFinished = false;
	is2nd = false;
	accentColor;
	modalOperations;
	constructor(manager, options) {
		super(manager, options, "calc");
		this.accentColor = this.resolveColor(options.embed?.color);
		this.defaultTimeout = options.time || manager?.defaultTimeout || 3e5;
		this.modalOperations = {
			calLG: {
				title: options.operationTitles?.logarithm || "Logarithm",
				label: options.oporationLabels?.logarithm || "logarithm 10",
				funcName: "log10"
			},
			calSQRT: {
				title: options.operationTitles?.squareRoot || "Square Root",
				label: options.oporationLabels?.squareRoot || "square root",
				funcName: "sqrt"
			},
			calRND: {
				title: options.operationTitles?.round || "Round",
				label: options.oporationLabels?.round || "round",
				funcName: "round"
			},
			calSIN: {
				title: options.operationTitles?.sine || "Sine",
				label: options.oporationLabels?.sine || "sine",
				funcName: "sin"
			},
			calCOS: {
				title: options.operationTitles?.cosine || "Cosine",
				label: options.oporationLabels?.cosine || "cosine",
				funcName: "cos"
			},
			calTAN: {
				title: options.operationTitles?.tangent || "Tangent",
				label: options.oporationLabels?.tangent || "tangent",
				funcName: "tan"
			},
			calLN: {
				title: options.operationTitles?.naturalLogarithm || "Natural Logarithm",
				label: options.oporationLabels?.naturalLogarithm || "natural logarithm",
				funcName: "log"
			},
			"cal1/x": {
				title: options.operationTitles?.reciprocal || "Reciprocal",
				label: options.oporationLabels?.reciprocal || "reciprocal",
				funcName: "1/"
			},
			"calx!": {
				title: options.operationTitles?.factorial || "Factorial",
				label: options.oporationLabels?.factorial || "factorial",
				funcName: "!",
				isSuffix: true
			}
		};
	}
	async start() {
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.buildContainer();
		this.msg1 = await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame());
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.user.id !== this.ctx.userId) {
			if (interaction.message.id === this.msg1?.id) {
				const othersMsg = this.options.othersMessage ? this.options.othersMessage.replace("{{authorTag}}", `<@${this.ctx.userId}>`) : `Only <@${this.ctx.userId}> can use this calculator!`;
				ContextAdapter.replyEphemeral(interaction, othersMsg);
			}
			return;
		}
		if (interaction.message.id !== this.msg1?.id) return;
		this.resetTimeout(() => this.endGame());
		const id = interaction.customId;
		const rawValue = id.replace("cal", "");
		if (id === "cal2nd") {
			this.is2nd = !this.is2nd;
			await interaction.deferUpdate().catch(() => {});
			await this.updateUI();
			return;
		}
		if (id in this.modalOperations) {
			const op = this.modalOperations[id];
			const inputNum = await this.handleModal(interaction, op);
			if (inputNum) {
				this.currentExpression += op.isSuffix ? `${inputNum}${op.funcName}` : `${op.funcName}(${inputNum})`;
				await this.updateUI();
			}
			return;
		}
		if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate().catch(() => {});
		switch (true) {
			case id === "calDC": return this.endGame();
			case id === "calAC":
				this.currentExpression = " ";
				break;
			case id === "cal⌫":
				if (!this.currentExpression || this.currentExpression === " ") break;
				this.currentExpression = this.currentExpression.endsWith(" ") ? this.currentExpression.slice(0, -3) : this.currentExpression.slice(0, -1);
				if (this.currentExpression === "") this.currentExpression = " ";
				break;
			case id === "cal=":
				if (!this.currentExpression.trim()) return;
				const res = this.calculate(this.currentExpression);
				if (res.error) {
					this.currentExpression = res.error;
					await this.updateUI(true);
					this.currentExpression = " ";
					return;
				} else {
					this.currentExpression = String(res.result);
					this.lastAnswer = String(res.result);
					this.hasCalculated = true;
				}
				break;
			default: this.currentExpression += rawValue;
		}
		await this.updateUI();
	}
	calculate(expr) {
		let clean = expr.replace(/x/g, "*").replace(/÷/g, "/").replace(/π/g, "pi").replace(/ans/g, this.lastAnswer || "0").trim();
		try {
			const evalResult = MathEvaluator.evaluate(clean, Number(this.lastAnswer) || 0);
			if (evalResult.error) return {
				result: null,
				error: this.options.errorMessages?.invalidCalculation || "Invalid calculation"
			};
			return {
				result: evalResult.formatted,
				error: null
			};
		} catch {
			return {
				result: null,
				error: this.options.errorMessages?.invalidCalculation || "Invalid calculation"
			};
		}
	}
	async handleModal(interaction, config) {
		const modalId = `md_${config.funcName}_${Date.now()}`;
		const modal = new ModalBuilder().setTitle(config.title).setCustomId(modalId);
		const input = new TextInputBuilder().setCustomId(`input_${config.funcName}`).setStyle(TextInputStyle.Short).setRequired(true);
		const textDisplay = new TextDisplayBuilder().setContent(this.options.modals?.display ? this.options.modals.display.replace("{{currentExpression}}", this.currentExpression === " " ? `\`\`\`${this.options.modals?.noPromptYet || "No Prompt Yet"}\`\`\`` : this.getDisplay()) : `## Current Calculation:\n${this.currentExpression === " " ? "```No Prompt Yet```" : this.getDisplay()}`);
		const label = new LabelBuilder().setLabel(this.options.modals?.labels ? this.options.modals.labels.replace("{{label}}", config.label) : `Enter number for ${config.label}`).setTextInputComponent(input);
		modal.addTextDisplayComponents(textDisplay);
		modal.addLabelComponents(label);
		await interaction.showModal(modal).catch(() => {});
		try {
			const submitted = await interaction.awaitModalSubmit({
				filter: (i) => i.customId === modalId && i.user.id === this.ctx.userId,
				time: 12e4
			});
			await submitted.deferUpdate().catch(() => {});
			return submitted.fields.getTextInputValue(`input_${config.funcName}`);
		} catch {
			return null;
		}
	}
	async updateUI(forceEmpty = false) {
		if (this.msg1) {
			const container = this.buildContainer(forceEmpty);
			await this.msg1.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			}).catch(() => {});
		}
	}
	async endGame() {
		if (this.isFinished) return;
		this.isFinished = true;
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd("closed");
		const endMsg = this.options.sessionEndMessage || "Calculator Session Closed";
		if (this.msg1) {
			const container = this.createContainer(this.accentColor);
			let content = `\`\`\`\n${endMsg}\n\`\`\``;
			content = this.applyEmbedDecorations(container, content);
			container.addTextDisplayComponents((t) => t.setContent(content));
			const keys = this.is2nd ? SCIENTIFIC_KEYS$1 : STANDARD_KEYS$1;
			this.addButtonsToContainer(container, keys, true);
			await this.msg1.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			}).catch(() => {});
		}
	}
	getDisplay() {
		const modeTag = this.is2nd ? "  [2nd / SCI]" : "";
		return `\`\`\`fix\n${this.currentExpression}${modeTag}\n\`\`\``;
	}
	buildContainer(forceEmpty = false) {
		const container = this.createContainer(this.accentColor);
		let content = `${this.options.embed?.title ? `## ${this.options.embed.title}\n` : ""}${this.getDisplay()}`;
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		const keys = this.is2nd ? SCIENTIFIC_KEYS$1 : STANDARD_KEYS$1;
		this.addButtonsToContainer(container, keys, forceEmpty);
		return container;
	}
	addButtonsToContainer(container, keys, forceEmpty = false) {
		const isEmpty = this.currentExpression.trim() === "" || forceEmpty;
		for (let i = 0; i < keys.length; i += 5) {
			const buttons = keys.slice(i, i + 5).map((k) => {
				let isDisabled = this.isFinished;
				if (!isDisabled) {
					if (k === "2nd") isDisabled = false;
					else if (k === "ans" && !this.hasCalculated) isDisabled = true;
					else if (isEmpty && INVALID_START_KEYS$1.includes(k)) isDisabled = true;
				}
				const btn = new ButtonBuilder().setLabel(k).setCustomId(`cal${k}`).setDisabled(isDisabled);
				if (k === "=") btn.setStyle(ButtonStyle.Success);
				else if (k === "2nd") btn.setStyle(this.is2nd ? ButtonStyle.Success : ButtonStyle.Primary);
				else if (k === "AC") btn.setStyle(ButtonStyle.Danger);
				else if (k === "DC") btn.setStyle(ButtonStyle.Danger).setEmoji("🛑");
				else if ([
					"x",
					"÷",
					" - ",
					" + ",
					"^",
					"%"
				].includes(k)) btn.setStyle(ButtonStyle.Primary);
				else btn.setStyle(ButtonStyle.Secondary);
				return btn;
			});
			const row = new ActionRowBuilder().addComponents(...buttons);
			container.addActionRowComponents(row);
		}
	}
};
// src/data/words.ts
const HANGMAN_CATEGORIES = {
	Animals: [
		"elephant",
		"alligator",
		"chimpanzee",
		"dolphin",
		"flamingo",
		"kangaroo",
		"hedgehog",
		"chameleon",
		"penguin",
		"leopard",
		"octopus",
		"platypus",
		"giraffe",
		"rhinoceros",
		"gorilla",
		"cheetah",
		"crocodile",
		"squirrel",
		"badger",
		"tortoise",
		"armadillo",
		"jellyfish",
		"seahorse",
		"woodpecker",
		"porcupine",
		"hippopotamus",
		"anteater",
		"wolverine",
		"koala",
		"panther"
	],
	Countries: [
		"australia",
		"brazil",
		"canada",
		"denmark",
		"egypt",
		"finland",
		"germany",
		"hungary",
		"iceland",
		"japan",
		"kenya",
		"mexico",
		"norway",
		"portugal",
		"switzerland",
		"thailand",
		"ukraine",
		"vietnam",
		"argentina",
		"belgium",
		"colombia",
		"greece",
		"indonesia",
		"ireland",
		"madagascar",
		"netherlands",
		"philippines",
		"singapore",
		"sweden",
		"turkey"
	],
	Technology: [
		"typescript",
		"javascript",
		"discord",
		"algorithm",
		"database",
		"compiler",
		"frontend",
		"backend",
		"encryption",
		"framework",
		"interface",
		"kubernetes",
		"microservice",
		"python",
		"repository",
		"firewall",
		"bandwidth",
		"protocol",
		"cybersecurity",
		"middleware",
		"debugger",
		"variable",
		"container",
		"terminal",
		"asynchronous",
		"functional",
		"recursion",
		"hardware",
		"software",
		"processor"
	],
	Gaming: [
		"minecraft",
		"nintendo",
		"playstation",
		"pokemon",
		"controller",
		"graphics",
		"joystick",
		"speedrun",
		"respawn",
		"multiplayer",
		"adventure",
		"quest",
		"portal",
		"assassin",
		"overwatch",
		"fortnite",
		"zelda",
		"warcraft",
		"sandbox",
		"inventory",
		"stealth",
		"headshot",
		"checkpoint",
		"dungeon",
		"platformer",
		"retro",
		"emulator",
		"champion",
		"bossfight",
		"achievement"
	],
	Food: [
		"spaghetti",
		"hamburger",
		"croissant",
		"burrito",
		"chocolate",
		"pancake",
		"sandwich",
		"cheesecake",
		"barbecue",
		"mushroom",
		"avocado",
		"lasagna",
		"doughnut",
		"pineapple",
		"waffle",
		"guacamole",
		"macaroni",
		"quesadilla",
		"dumpling",
		"smoothie",
		"meatball",
		"casserole",
		"biscuit",
		"marshmallow"
	]
};
const COMMON_WORDS = [
	"ability",
	"accident",
	"accurate",
	"activity",
	"adventure",
	"airport",
	"alphabet",
	"ancient",
	"apartment",
	"applause",
	"architect",
	"argument",
	"astronaut",
	"athlete",
	"audience",
	"balloon",
	"battery",
	"beautiful",
	"bicycle",
	"birthday",
	"blanket",
	"breakfast",
	"brilliant",
	"building",
	"calendar",
	"camera",
	"captain",
	"carousel",
	"castle",
	"celebrate",
	"century",
	"champion",
	"chemical",
	"chocolate",
	"circus",
	"climate",
	"clothes",
	"collector",
	"community",
	"compass",
	"concert",
	"courage",
	"creative",
	"curious",
	"customer",
	"daughter",
	"daylight",
	"diamond",
	"dictionary",
	"dinosaur",
	"discovery",
	"distance",
	"dolphin",
	"dragon",
	"drawing",
	"education",
	"electric",
	"element",
	"emergency",
	"emotion",
	"energy",
	"engine",
	"enormous",
	"envelope",
	"evening",
	"exercise",
	"explosion",
	"factory",
	"famous",
	"fantastic",
	"feather",
	"festival",
	"fireworks",
	"flavor",
	"fortune",
	"freedom",
	"friendly",
	"galaxy",
	"garden",
	"gentle",
	"glacier",
	"governor",
	"gravity",
	"grocery",
	"guitar",
	"happiness",
	"harmony",
	"harvest",
	"headline",
	"helicopter",
	"heritage",
	"history",
	"horizon",
	"hospital",
	"humidity",
	"hurricane",
	"iceberg",
	"illusion",
	"imagination",
	"industry",
	"infinite",
	"ingredient",
	"instrument",
	"island",
	"journey",
	"jungle",
	"keyboard",
	"kingdom",
	"kitchen",
	"landscape",
	"laughter",
	"library",
	"lightning",
	"location",
	"luggage",
	"machine",
	"magazine",
	"magical",
	"magnet",
	"mammal",
	"mansion",
	"marathon",
	"meadow",
	"mechanic",
	"medicine",
	"melody",
	"memory",
	"midnight",
	"mineral",
	"miracle",
	"monument",
	"morning",
	"mountain",
	"museum",
	"musician",
	"mystery",
	"natural",
	"navigator",
	"necklace",
	"neighborhood",
	"notebook",
	"novel",
	"nuclear",
	"observatory",
	"ocean",
	"officer",
	"olympics",
	"orchestra",
	"ordinary",
	"organism",
	"original",
	"oxygen",
	"package",
	"painting",
	"palace",
	"paradise",
	"passenger",
	"passport",
	"pattern",
	"peaceful",
	"perfume",
	"phantom",
	"photograph",
	"physics",
	"pioneer",
	"planet",
	"platform",
	"pleasant",
	"polar",
	"portrait",
	"powerful",
	"precious",
	"president",
	"princess",
	"pyramid",
	"quantum",
	"question",
	"radiant",
	"rainbow",
	"reaction",
	"reception",
	"record",
	"reflection",
	"republic",
	"rescue",
	"reservoir",
	"restaurant",
	"revolution",
	"rhythm",
	"rocket",
	"safari",
	"satellite",
	"scenario",
	"science",
	"scissors",
	"sculpture",
	"season",
	"secret",
	"shadow",
	"shelter",
	"skeleton",
	"skyline",
	"solitary",
	"solution",
	"spectrum",
	"stadium",
	"statue",
	"submarine",
	"sunshine",
	"surprise",
	"symphony",
	"talent",
	"telescope",
	"theater",
	"thunder",
	"tomorrow",
	"tornado",
	"treasure",
	"triangle",
	"triumph",
	"tropical",
	"umbrella",
	"universe",
	"vacation",
	"valuable",
	"vehicle",
	"velvet",
	"victory",
	"village",
	"vintage",
	"volcano",
	"voyage",
	"warrior",
	"waterfall",
	"weather",
	"whisper",
	"wildlife",
	"wizard",
	"wonder",
	"xylophone",
	"yesterday",
	"zealous",
	"zodiac"
];
function getRandomWord() {
	return COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
}
function getRandomWords(count) {
	return [...COMMON_WORDS].sort(() => .5 - Math.random()).slice(0, count);
}
function getRandomHangmanWord(category) {
	const catNames = Object.keys(HANGMAN_CATEGORIES);
	const selectedCat = category && HANGMAN_CATEGORIES[category] ? category : catNames[Math.floor(Math.random() * catNames.length)];
	const words = HANGMAN_CATEGORIES[selectedCat];
	return {
		word: words[Math.floor(Math.random() * words.length)].toUpperCase(),
		category: selectedCat
	};
}
// src/games/ChaosWords.ts
var ChaosWords = class extends BaseGame {
	words = [];
	remainingWords = [];
	foundWords = [];
	chaosArray = [];
	chaosString = "";
	triesLeft = 10;
	maxTries = 10;
	btnPrefix;
	gameTitle;
	constructor(manager, options) {
		super(manager, options, "chaos");
		this.btnPrefix = getRandomString(6, "chaos_");
		this.gameTitle = options.embed?.title || "Chaos Words";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.maxTries = options.maxTries || 10;
		this.triesLeft = this.maxTries;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
	}
	async start() {
		const wordCount = this.options.maxWords || this.options.words && this.options.words.length || 4;
		if (this.options.words && this.options.words.length > 0) this.words = this.options.words.slice(0, wordCount).map((w) => w.toLowerCase().trim());
		else this.words = getRandomWords(wordCount).map((w) => w.toLowerCase());
		this.remainingWords = [...this.words];
		this.foundWords = [];
		this.chaosString = this.generateChaosString();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	generateChaosString() {
		const alphabet = "abcdefghijklmnopqrstuvwxyz";
		const totalWordLength = this.words.join("").length;
		const charCount = this.options.charCount || this.options.charGenerated || totalWordLength + 12;
		this.chaosArray = [];
		for (let i = 0; i < charCount; i++) this.chaosArray.push(alphabet.charAt(Math.floor(Math.random() * 26)));
		for (const word of this.words) {
			const pos = Math.floor(Math.random() * this.chaosArray.length);
			this.chaosArray.splice(pos, 0, word);
		}
		return this.chaosArray.join("");
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		if (interaction.customId === `${this.btnPrefix}cancel`) {
			await interaction.deferUpdate().catch(() => {});
			await this.endGame("cancelled");
		}
	}
	async onMessage(message) {
		if (!this.isActive) return;
		if (message.channelId !== this.ctx.channel.id) return;
		if (message.author.id !== this.ctx.userId) return;
		const guess = message.content.toLowerCase().trim();
		if (guess.startsWith("/") || guess.startsWith("!")) return;
		if (message.deletable) await message.delete().catch(() => {});
		this.resetTimeout(() => this.endGame("timeout"));
		if (this.foundWords.includes(guess)) {
			const container = this.createGameContainer("repeat", { feedback: `⚠️ You already found **${guess}**!` });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
			return;
		}
		if (this.remainingWords.includes(guess)) {
			this.foundWords.push(guess);
			this.remainingWords = this.remainingWords.filter((w) => w !== guess);
			const indexInChaos = this.chaosArray.indexOf(guess);
			if (indexInChaos > -1) this.chaosArray.splice(indexInChaos, 1);
			this.chaosString = this.chaosArray.join("");
			if (this.remainingWords.length === 0) {
				await this.endGame("won");
				return;
			}
			const container = this.createGameContainer("correct", { feedback: `✅ **Correct!** You uncovered **${guess}**!` });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
		} else {
			this.triesLeft -= 1;
			if (this.triesLeft <= 0) {
				await this.endGame("lost");
				return;
			}
			const container = this.createGameContainer("wrong", { feedback: `❌ **${guess}** is not in the hidden words! (-1 Try)` });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
		}
	}
	async endGame(state) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state, this.foundWords.length);
		const container = this.createGameContainer(state);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, details) {
		const stateColors = {
			active: this.defaultColor,
			correct: 5763719,
			wrong: 15548997,
			repeat: this.defaultColor,
			won: 5763719,
			lost: 15548997,
			cancelled: 15548997,
			timeout: 15548997
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const wordsFoundStr = this.foundWords.length > 0 ? this.foundWords.map((w) => `\`${w}\``).join(", ") : "*None yet*";
		switch (state) {
			case "active":
			case "correct":
			case "wrong":
			case "repeat":
				content = `## ${this.gameTitle}\n`;
				if (details?.feedback) content += `> ${details.feedback}\n\n`;
				content += `> Find **${this.words.length}** hidden words in the scrambled text below!\n\n\`\`\`fix\n${this.chaosString}\n\`\`\`\n**Words Found:** ${wordsFoundStr}\n**Remaining Words:** \`${this.remainingWords.length}\`\n**Tries Left:** \`${this.triesLeft} / ${this.maxTries}\``;
				break;
			case "won":
				content = this.options.winMessage ? `## 🏆 Word Master!\n> ${this.options.winMessage}` : `## 🏆 Word Master!\n> 🎉 **Congratulations!** You found all hidden words:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
				break;
			case "lost":
				content = this.options.loseMessage ? `## ❌ Out of Tries\n> ${this.options.loseMessage}` : `## ❌ Out of Tries\n> 💀 You ran out of attempts! The hidden words were:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
				break;
			case "cancelled":
				content = `## 🛑 Game Cancelled\n> You stopped the game. The hidden words were:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
				break;
			case "timeout": content = `## ⏱️ Time's Up\n> Session expired. The hidden words were:\n> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (state === "active" || state === "correct" || state === "wrong" || state === "repeat") {
			const cancelBtn = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.options.cancelButton || this.options.buttonText || "Cancel").setEmoji("🛑").setCustomId(`${this.btnPrefix}cancel`);
			container.addActionRowComponents((row) => row.setComponents(cancelBtn));
		}
		return container;
	}
};
// src/data/sentences.ts
const EASY_SENTENCES = [
	"A blue whale is the biggest animal in the world, both in water and on land.",
	"Our fingerprints are very unique, and zebra and tiger stripes are just as unique.",
	"Pound cake got its name from its recipe: one pound of butter, eggs, and sugar.",
	"The femur or thigh bone is the strongest and longest bone in the human body.",
	"Giving cats candies is not a good idea because they cannot taste sweetness.",
	"Mars is a red planet because its surface contains a large amount of iron oxide.",
	"Strawberries are the only known fruit that has seeds on the outside of its skin.",
	"In Switzerland, it is illegal to own just one guinea pig because they are social.",
	"Most birds are left-handed and use their left foot to grasp food and objects.",
	"Honey never spoils and archaeologists have found edible honey thousands of years old.",
	"A group of flamingos gathered together in a flock is called a flamboyance.",
	"Octopuses have three hearts and blue blood pumped through their bodies.",
	"Bananas are curved because they grow towards the sun against gravity.",
	"Cows have best friends and get stressed when they are separated from them.",
	"Butterflies taste their food with their feet to test if plants are edible."
];
const MEDIUM_SENTENCES = [
	"While sharks kill an average of five people a year, cows kill an average of thirty-three people.",
	"Bamboo is one of the fastest-growing plants on Earth, growing up to thirty-five inches each day.",
	"Dreamt is the only common English word in the dictionary that ends with the letters mt.",
	"American black bears can actually come in colors like blonde, cinnamon, brown, white, and silver-blue.",
	"Diet soda cans float in water because artificial sweeteners are less dense than regular sugar.",
	"The largest internal organ in the human body is the liver, but the largest organ overall is skin.",
	"Winds are completely silent until they blow against an object like trees, buildings, or wires.",
	"Light from the sun takes approximately eight minutes and twenty seconds to reach the surface of Earth.",
	"The shortest commercial flight in the world lasts less than two minutes between two Scottish islands.",
	"Sea otters hold hands while sleeping so they do not drift away with ocean currents.",
	"Venus is the hottest planet in our solar system even though Mercury is much closer to the sun.",
	"Sloths can hold their breath underwater for up to forty minutes by slowing down their heart rate.",
	"The Eiffel Tower can grow more than six inches taller during summer days due to thermal expansion.",
	"A cloud of average cumulus size weighs around five hundred thousand kilograms or one million pounds.",
	"Koalas have unique fingerprints that are almost indistinguishable from human fingerprints."
];
const HARD_SENTENCES = [
	"Although the tongue is made of eight different muscles that work together seamlessly, it is not the strongest muscle in the human body.",
	"A teaspoon of neutron star material would weigh approximately six billion tons on Earth due to extreme gravitational compression.",
	"Cleopatra lived chronologically closer to the completion of the Apollo Moon landing than to the initial construction of the Great Pyramids.",
	"The immortal jellyfish Turritopsis dohrnii can biologically revert its physical cells back to polyp form when subjected to extreme stress or starvation.",
	"Sound cannot travel through the vacuum of outer space because there are not enough gas molecules or particles to carry sound vibrations.",
	"Tardigrades can survive temperatures approaching absolute zero, cosmic radiation in space, and pressures six times deeper than the Marianas Trench.",
	"The speed of light in a true vacuum is exactly two hundred ninety-nine million seven hundred ninety-two thousand four hundred fifty-eight meters per second.",
	"Every hydrogen atom present in the water molecules of our bodies was forged in the primordial nucleosynthesis minutes after the Big Bang.",
	"The Voynich Manuscript is a mysterious fifteenth-century handwritten codex inscribed in an unknown writing system that has never been deciphered.",
	"Quantum entanglement occurs when pairs of particles interact in ways such that the quantum state of each particle cannot be described independently."
];
function getRandomSentence(difficulty = "medium") {
	const list = difficulty === "easy" ? EASY_SENTENCES : difficulty === "hard" ? HARD_SENTENCES : MEDIUM_SENTENCES;
	return list[Math.floor(Math.random() * list.length)];
}
// src/games/FastType.ts
var FastType = class extends BaseGame {
	sentence = "";
	hasTyped = false;
	btnPrefix;
	gameTitle;
	checkCheating;
	constructor(manager, options) {
		super(manager, options, "fasttype");
		this.btnPrefix = getRandomString(6, "ft_");
		this.gameTitle = options.embed?.title || "Fast Type Challenge";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
		this.checkCheating = options.checkCheating ?? true;
	}
	async start() {
		this.sentence = this.options.sentence || getRandomSentence(this.options.difficulty || "medium");
		this.startTime = Date.now();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	onTypingStart(typing) {
		const typingUserId = typing.user?.id || typing.userId;
		const typingChannelId = typing.channel?.id || typing.channelId;
		if (typingUserId === this.ctx.userId && typingChannelId === this.ctx.channel.id) this.hasTyped = true;
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		if (interaction.customId === `${this.btnPrefix}cancel`) {
			await interaction.deferUpdate().catch(() => {});
			await this.endGame("cancelled");
		}
	}
	async onMessage(message) {
		if (!this.isActive) return;
		if (message.channelId !== this.ctx.channel.id) return;
		if (message.author.id !== this.ctx.userId) return;
		const input = message.content.trim();
		if (input.startsWith("/") || input.startsWith("!")) return;
		if (message.deletable) await message.delete().catch(() => {});
		if (this.checkCheating && !this.hasTyped) {
			await this.endGame("cheat");
			return;
		}
		if (input === this.sentence) {
			const elapsedMs = Date.now() - this.startTime;
			const minutes = Math.max(.5, elapsedMs / 1e3) / 60;
			const words = this.sentence.length / 5;
			const wpm = Math.round(words / minutes);
			await this.endGame("won", {
				timeTaken: formatTime(elapsedMs),
				wpm: String(wpm)
			});
		} else {
			const typoContainer = this.createGameContainer("typo");
			await this.ctx.edit({
				components: [typoContainer],
				flags: MessageFlags.IsComponentsV2
			});
		}
	}
	async endGame(state, data) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state, data?.wpm ? Number(data.wpm) : 0);
		const container = this.createGameContainer(state, data);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, data) {
		const stateColors = {
			loading: this.defaultColor,
			active: this.defaultColor,
			typo: 15548997,
			won: 5763719,
			cheat: 15548997,
			timeout: 15548997,
			cancelled: 15548997
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		switch (state) {
			case "loading":
				content = `## ${this.gameTitle}\n> 🔄 Preparing sentence...`;
				break;
			case "active":
				content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{sentence}}", this.sentence) : `## ${this.gameTitle}\n> Type the sentence below as fast as you can!\n\n\`\`\`text\n${this.sentence}\n\`\`\`\n\n⏳ You have **${formatTime(this.defaultTimeout)}**!`;
				break;
			case "typo":
				content = `## ${this.gameTitle}\n> ❌ **Typo! That was not an exact match.** Try again quickly!\n\n\`\`\`text\n${this.sentence}\n\`\`\``;
				break;
			case "won":
				const winText = this.options.winMessage ? this.options.winMessage.replace("{{time}}", data?.timeTaken || "0s").replace("{{wpm}}", data?.wpm || "0") : `You typed the sentence in **${data?.timeTaken || "0s"}** with a speed of **${data?.wpm || "0"} WPM**!`;
				content = this.options.states?.won ? this.options.states.won.replace("{{winText}}", winText).replace("{{sentence}}", this.sentence) : `## 🏆 Fast Fingers!\n> ${winText}\n\n**Sentence:**\n\`\`\`text\n${this.sentence}\n\`\`\``;
				break;
			case "cheat":
				content = this.options.states?.cheat ? this.options.states.cheat.replace("{{sentence}}", this.sentence) : `## ⚠️ Cheat Detected\n> ${this.options.cheatMessage || "Copy-pasting is not allowed! Please type the sentence manually."}\n\n**Sentence:**\n\`\`\`text\n${this.sentence}\n\`\`\``;
				break;
			case "timeout":
				content = this.options.states?.timeout ? this.options.states.timeout.replace("{{sentence}}", this.sentence) : `## ⏱️ Time's Up\n> ${this.options.timeoutMessage || "You ran out of time!"}\n\n**Sentence:**\n\`\`\`text\n${this.sentence}\n\`\`\``;
				break;
			case "cancelled": content = this.options.states?.cancelled ? this.options.states.cancelled.replace("{{sentence}}", this.sentence) : `## 🚫 Game Cancelled\n> You cancelled the typing test.`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (state === "active" || state === "typo") {
			const btnCancel = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.options.cancelButton || this.options.buttonText || "Cancel").setEmoji("🛑").setCustomId(`${this.btnPrefix}cancel`);
			container.addActionRowComponents((row) => row.setComponents(btnCancel));
		}
		return container;
	}
};
// src/ai/FightBosses.ts
/**
* Fight RPG AI & Boss Engine
* Pre-configured tactical bosses and automated decision trees.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
const FIGHT_BOSSES = {
	dragon: {
		id: "dragon_sovereign",
		name: "Dragon Sovereign",
		title: "Ancient Pyromancer",
		avatarUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
		maxHealth: 150,
		damageMin: 15,
		damageMax: 24,
		coins: 40,
		dialogueIntro: "🔥 *The ground shakes as the Dragon Sovereign lands! 'Kneel or turn to ash!'*",
		dialogueVictory: "🔥 *'Your courage was admirable, mortal, but you are merely kindling!'*",
		dialogueDefeat: "💨 *'Impossible... defeated by mere flesh and bone?!'*",
		specialMoveName: "Inferno Breath",
		specialMoveEffect: (boss, player) => {
			let dmg = Math.floor(Math.random() * 11) + 24;
			if (player.activeEffects?.includes("Shield")) {
				dmg = Math.floor(dmg * .7);
				player.activeEffects = player.activeEffects.filter((e) => e !== "Shield");
			}
			player.health = Math.max(0, player.health - dmg);
			return {
				damage: dmg,
				message: `🔥 **${boss.username} unleashes INFERNO BREATH dealing ${dmg} scorching damage!**`
			};
		}
	},
	cyber_knight: {
		id: "cyber_knight",
		name: "Cyber Knight",
		title: "Protocol MK-VII",
		avatarUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png",
		maxHealth: 135,
		damageMin: 13,
		damageMax: 22,
		coins: 35,
		dialogueIntro: "⚡ *Sensors active. Target acquired. Commencing combat protocol.*",
		dialogueVictory: "⚡ *Threat neutralized. Target combat readiness: 0%.*",
		dialogueDefeat: "⚡ *Critical system failure... Re-routing power to emergency beacon.*",
		specialMoveName: "EMP Overcharge",
		specialMoveEffect: (boss, player) => {
			const dmg = Math.floor(Math.random() * 9) + 20;
			player.health = Math.max(0, player.health - dmg);
			player.activeEffects = [];
			return {
				damage: dmg,
				message: `⚡ **${boss.username} fires an EMP OVERCHARGE for ${dmg} damage, overloading your systems and stripping all buffs!**`
			};
		}
	},
	shadow_goblin: {
		id: "shadow_goblin",
		name: "Shadow Goblin",
		title: "Greed Master",
		avatarUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/302.png",
		maxHealth: 120,
		damageMin: 11,
		damageMax: 19,
		coins: 55,
		dialogueIntro: "🗡️ *Hehehe! What shiny coins you got there! Hand 'em over or bleed!*",
		dialogueVictory: "💰 *Hehehe! Thanks for the loot, chump! All mine now!*",
		dialogueDefeat: "💨 *Gahh! My loot! I'll be back for this, you brute!*",
		specialMoveName: "Coin Heist & Backstab",
		specialMoveEffect: (boss, player) => {
			const stolen = Math.min(player.coins, Math.floor(Math.random() * 9) + 10);
			player.coins -= stolen;
			boss.coins += stolen;
			const dmg = Math.floor(Math.random() * 7) + 16;
			player.health = Math.max(0, player.health - dmg);
			return {
				damage: dmg,
				message: `🗡️ **${boss.username} strikes for ${dmg} damage and pickpockets ${stolen} coins from your pouch!**`
			};
		}
	}
};
FIGHT_BOSSES["knight"] = FIGHT_BOSSES["cyber_knight"];
FIGHT_BOSSES["goblin"] = FIGHT_BOSSES["shadow_goblin"];
var FightAI = class {
	/**
	* Decides the tactical action for the AI/Boss on its turn.
	*/
	static decideAction(aiPlayer, humanPlayer, bossProfile) {
		if (humanPlayer.activeEffects?.includes("2x Damage")) {
			if (aiPlayer.coins >= 25 && !aiPlayer.activeEffects?.includes("Shield") && Math.random() < .6) return "shield";
			if (bossProfile && Math.random() < .4) return "special";
		}
		if (bossProfile && Math.random() < .28) return "special";
		if (aiPlayer.health < 45 && aiPlayer.coins >= 25 && !aiPlayer.activeEffects?.includes("Shield") && Math.random() < .45) return Math.random() < .6 ? "shield" : "heal";
		if (humanPlayer.health <= 30 && Math.random() < .6) return "heavy";
		return Math.random() < .4 ? "heavy" : "attack";
	}
};
// src/canvas/CanvasUtils.ts
var CanvasUtils = class {
	/**
	* Draws a rounded rectangle path.
	*/
	static roundRectPath(ctx, x, y, w, h, r) {
		let tl = 0, tr = 0, br = 0, bl = 0;
		if (typeof r === "number") tl = tr = br = bl = r;
		else if (Array.isArray(r)) [tl, tr = tl, br = tl, bl = tr] = r;
		ctx.beginPath();
		ctx.moveTo(x + tl, y);
		ctx.lineTo(x + w - tr, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
		ctx.lineTo(x + w, y + h - br);
		ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
		ctx.lineTo(x + bl, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
		ctx.lineTo(x, y + tl);
		ctx.quadraticCurveTo(x, y, x + tl, y);
		ctx.closePath();
	}
	/**
	* Fills a rounded rectangle with optional fill and stroke.
	*/
	static fillRoundedRect(ctx, x, y, w, h, r, fillStyle, strokeStyle, lineWidth = 1) {
		ctx.save();
		this.roundRectPath(ctx, x, y, w, h, r);
		ctx.fillStyle = fillStyle;
		ctx.fill();
		if (strokeStyle) {
			ctx.strokeStyle = strokeStyle;
			ctx.lineWidth = lineWidth;
			ctx.stroke();
		}
		ctx.restore();
	}
	/**
	* Safely loads and draws a circular avatar with optional border and glow.
	*/
	static async drawCircularAvatar(ctx, url, x, y, radius, borderColor, borderWidth = 3) {
		try {
			if (!url) return;
			const avatar = await loadImage(url);
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
			ctx.restore();
			if (borderColor && borderWidth > 0) {
				ctx.save();
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.strokeStyle = borderColor;
				ctx.lineWidth = borderWidth;
				ctx.shadowColor = borderColor;
				ctx.shadowBlur = 8;
				ctx.stroke();
				ctx.restore();
			}
		} catch {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = "#3a3c42";
			ctx.fill();
			if (borderColor) {
				ctx.strokeStyle = borderColor;
				ctx.lineWidth = borderWidth;
				ctx.stroke();
			}
			ctx.restore();
		}
	}
	/**
	* Draws a badge with rounded corners and centered text.
	*/
	static drawBadge(ctx, text, x, y, w, h, bgColor, textColor = "#ffffff", font = "bold 14px sans-serif") {
		this.fillRoundedRect(ctx, x, y, w, h, h / 2, bgColor);
		ctx.save();
		ctx.fillStyle = textColor;
		ctx.font = font;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, x + w / 2, y + h / 2);
		ctx.restore();
	}
	/**
	* Draws a shiny vector gold coin icon at (x, y) with radius r.
	* Completely avoids server font emoji missing tofu glyphs.
	*/
	static drawCoinIcon(ctx, x, y, r = 10) {
		ctx.save();
		const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
		grad.addColorStop(0, "#ffe066");
		grad.addColorStop(1, "#d48806");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
		ctx.lineWidth = Math.max(1, r / 6);
		ctx.beginPath();
		ctx.arc(x, y, r * .72, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = "#fff4b8";
		ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("¢", x, y + .5);
		ctx.restore();
	}
	/**
	* Safely cleans text by stripping Unicode emojis and symbols that render as tofu `[?]` boxes on Linux servers.
	*/
	static cleanText(text) {
		if (!text) return "";
		return text.replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{FE00}-\u{FE0F}]/gu, "").replace(/\s+/g, " ").trim();
	}
	/**
	* Draws a crisp vector checkmark badge at (cx, cy).
	*/
	static drawCheckmarkIcon(ctx, cx, cy, radius = 8, bgColor = "#57f287", checkColor = "#0b0f19") {
		ctx.save();
		ctx.fillStyle = bgColor;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = checkColor;
		ctx.lineWidth = Math.max(1.5, radius / 4);
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.beginPath();
		ctx.moveTo(cx - radius * .45, cy);
		ctx.lineTo(cx - radius * .1, cy + radius * .4);
		ctx.lineTo(cx + radius * .45, cy - radius * .35);
		ctx.stroke();
		ctx.restore();
	}
	/**
	* Draws a vector 5-point star icon at (cx, cy).
	*/
	static drawStarIcon(ctx, cx, cy, spikes = 5, outerRadius = 7, innerRadius = 3.5, color = "#ffd700") {
		ctx.save();
		let rot = Math.PI / 2 * 3;
		let x = cx;
		let y = cy;
		const step = Math.PI / spikes;
		ctx.beginPath();
		ctx.moveTo(cx, cy - outerRadius);
		for (let i = 0; i < spikes; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			ctx.lineTo(x, y);
			rot += step;
			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			ctx.lineTo(x, y);
			rot += step;
		}
		ctx.lineTo(cx, cy - outerRadius);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
		ctx.restore();
	}
	/**
	* Draws a sleek vector flame icon at (cx, cy).
	*/
	static drawFlameIcon(ctx, cx, cy, size = 10, color = "#ff8c38") {
		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(cx, cy - size * .9);
		ctx.quadraticCurveTo(cx + size * .7, cy - size * .2, cx + size * .5, cy + size * .5);
		ctx.quadraticCurveTo(cx + size * .2, cy + size * .9, cx, cy + size * .9);
		ctx.quadraticCurveTo(cx - size * .2, cy + size * .9, cx - size * .5, cy + size * .5);
		ctx.quadraticCurveTo(cx - size * .7, cy - size * .2, cx, cy - size * .9);
		ctx.fill();
		ctx.fillStyle = "#ffe066";
		ctx.beginPath();
		ctx.arc(cx, cy + size * .35, size * .3, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
	/**
	* Draws a clean vector crown icon at (cx, cy).
	*/
	static drawCrownIcon(ctx, cx, cy, width = 14, height = 9, color = "#ffd700") {
		ctx.save();
		ctx.fillStyle = color;
		const halfW = width / 2;
		const topY = cy - height / 2;
		const botY = cy + height / 2;
		ctx.beginPath();
		ctx.moveTo(cx - halfW, topY);
		ctx.lineTo(cx - halfW * .5, topY + height * .45);
		ctx.lineTo(cx, topY);
		ctx.lineTo(cx + halfW * .5, topY + height * .45);
		ctx.lineTo(cx + halfW, topY);
		ctx.lineTo(cx + halfW * .75, botY);
		ctx.lineTo(cx - halfW * .75, botY);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
};
// src/canvas/RenderFight.ts
var RenderFight = class {
	/**
	* Sanitizes text for Canvas rendering by stripping markdown asterisks,
	* resolving Discord user mentions into actual usernames, and removing
	* unicode emoji sequences that cause missing glyph '▯' (tofu) boxes.
	*/
	static cleanText(text, players = []) {
		if (!text) return "";
		let clean = text;
		for (const p of players) if (p.id) clean = clean.replace(new RegExp(`<@!?${p.id}>`, "g"), p.username);
		clean = clean.replace(/<@!?\d+>/g, "@Player");
		clean = clean.replace(/\*\*(.*?)\*\*/g, "$1");
		clean = clean.replace(/\*(.*?)\*/g, "$1");
		clean = clean.replace(/__(.*?)__/g, "$1");
		clean = clean.replace(/~~(.*?)~~/g, "$1");
		clean = clean.replace(/`(.*?)`/g, "$1");
		clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu, "");
		return clean.replace(/\s+/g, " ").trim();
	}
	/**
	* Renders the initial Fight Challenge / Request card.
	*/
	static async renderRequestCard(challenger, opponent, customTexts) {
		const W = 900;
		const H = 520;
		const canvas = new Canvas(W, H);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
		bg.addColorStop(0, "#161b26");
		bg.addColorStop(.65, "#0d1017");
		bg.addColorStop(1, "#07080c");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
		ctx.lineWidth = 1;
		for (let x = 40; x < W; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, H);
			ctx.stroke();
		}
		for (let y = 40; y < H; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(W, y);
			ctx.stroke();
		}
		CanvasUtils.fillRoundedRect(ctx, 24, 24, 852, 472, 24, "rgba(255,255,255,0.015)", "rgba(0, 245, 160, 0.25)", 1.5);
		ctx.save();
		ctx.font = "bold 38px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#00f5a0";
		ctx.shadowColor = "rgba(0, 245, 160, 0.6)";
		ctx.shadowBlur = 18;
		const reqTitle = CanvasUtils.cleanText(customTexts?.title || "DUEL CHALLENGE");
		ctx.fillText(reqTitle, W / 2, 75);
		ctx.restore();
		await CanvasUtils.drawCircularAvatar(ctx, challenger.avatarUrl, 230, 240, 80, "#00f5a0", 5);
		await CanvasUtils.drawCircularAvatar(ctx, opponent.avatarUrl, 670, 240, 80, "#ff2d55", 5);
		const vsX = W / 2;
		CanvasUtils.fillRoundedRect(ctx, 406, 196, 88, 88, 20, "#121620", "rgba(255, 255, 255, 0.2)", 2);
		ctx.save();
		ctx.font = "bold 42px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#ffffff";
		ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
		ctx.shadowBlur = 12;
		const vsText = CanvasUtils.cleanText(customTexts?.vsText || "VS");
		ctx.fillText(vsText, vsX, 242);
		ctx.restore();
		const drawPlayerInfo = (name, role, x, color) => {
			CanvasUtils.fillRoundedRect(ctx, x - 130, 345, 260, 68, 16, "rgba(18, 22, 30, 0.85)", color, 1.5);
			CanvasUtils.drawBadge(ctx, role, x - 55, 355, 110, 22, color, "#000000", "bold 11px sans-serif");
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 20px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			const truncated = name.length > 15 ? name.slice(0, 14) + "…" : name;
			ctx.fillText(truncated, x, 396);
		};
		drawPlayerInfo(challenger.username, "CHALLENGER", 230, "#00f5a0");
		drawPlayerInfo(opponent.username, "OPPONENT", 670, "#ff2d55");
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.font = "15px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const reqSub = CanvasUtils.cleanText(customTexts?.subtitle || "Awaiting opponent to accept duel...");
		ctx.fillText(reqSub, W / 2, 455);
		return canvas.toBuffer("image/png");
	}
	/**
	* Renders the dynamic Battle Arena card with health bars, coins, and current turn indicators.
	*/
	static async renderBattleCard(player1, player2, currentTurnUserId, announcement = "Battle in progress!", customTexts) {
		const W = 900;
		const H = 620;
		const canvas = new Canvas(W, H);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 580);
		bg.addColorStop(0, "#161b24");
		bg.addColorStop(.65, "#0e1118");
		bg.addColorStop(1, "#07090d");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
		ctx.lineWidth = 1;
		for (let x = 40; x < W; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, H);
			ctx.stroke();
		}
		const cleanAnnouncement = this.cleanText(customTexts?.title || announcement, [player1, player2]) || "Duel in progress!";
		CanvasUtils.fillRoundedRect(ctx, 40, 24, 820, 60, 16, "rgba(18, 22, 30, 0.88)", "rgba(255, 255, 255, 0.12)", 1.5);
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 20px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
		ctx.shadowBlur = 8;
		const truncatedAnnouncement = cleanAnnouncement.length > 68 ? cleanAnnouncement.slice(0, 66) + "…" : cleanAnnouncement;
		ctx.fillText(truncatedAnnouncement, W / 2, 54);
		ctx.restore();
		const isP1Turn = player1.id === currentTurnUserId;
		const isP2Turn = player2.id === currentTurnUserId;
		await this.drawFighterPanel(ctx, player1, 45, 110, 365, 475, isP1Turn, "#00f5a0", customTexts);
		await this.drawFighterPanel(ctx, player2, 490, 110, 365, 475, isP2Turn, "#ff2d55", customTexts);
		const vsX = W / 2;
		CanvasUtils.fillRoundedRect(ctx, 418, 308, 64, 64, 16, "#121620", "rgba(255, 255, 255, 0.2)", 1.5);
		ctx.save();
		ctx.font = "bold 28px sans-serif";
		ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const vsLabel = CanvasUtils.cleanText(customTexts?.vsText || "VS");
		ctx.fillText(vsLabel, vsX, 341);
		ctx.restore();
		return canvas.toBuffer("image/png");
	}
	static async drawFighterPanel(ctx, player, x, y, w, h, isTurn, themeColor, customTexts) {
		const borderColor = isTurn ? themeColor : "rgba(255, 255, 255, 0.08)";
		const borderWidth = isTurn ? 2.5 : 1;
		CanvasUtils.fillRoundedRect(ctx, x, y, w, h, 22, "rgba(16, 20, 28, 0.9)", borderColor, borderWidth);
		if (isTurn) {
			ctx.save();
			ctx.shadowColor = themeColor;
			ctx.shadowBlur = 14;
			CanvasUtils.drawBadge(ctx, "ACTIVE TURN", x + w / 2 - 65, y + 18, 130, 26, themeColor, "#000000", "bold 12px sans-serif");
			ctx.restore();
		}
		const avatarY = y + (isTurn ? 104 : 85);
		await CanvasUtils.drawCircularAvatar(ctx, player.avatarUrl, x + w / 2, avatarY, 52, isTurn ? themeColor : "rgba(255,255,255,0.2)", 3);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 22px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const nameY = avatarY + 74;
		const truncated = player.username.length > 15 ? player.username.slice(0, 14) + "…" : player.username;
		ctx.fillText(truncated, x + w / 2, nameY);
		const maxHp = player.maxHealth || 100;
		const currentHp = Math.max(0, Math.min(maxHp, player.health));
		const hpRatio = maxHp > 0 ? currentHp / maxHp : 0;
		const hpY = nameY + 28;
		const barW = w - 44;
		const barX = x + 22;
		const barH = 26;
		CanvasUtils.fillRoundedRect(ctx, barX, hpY, barW, barH, 13, "#212530", "rgba(255,255,255,0.06)", 1);
		if (currentHp > 0) {
			const fillW = Math.max(barH, barW * hpRatio);
			const hpGrad = ctx.createLinearGradient(barX, hpY, barX + fillW, hpY);
			if (hpRatio > .5) {
				hpGrad.addColorStop(0, "#00f5a0");
				hpGrad.addColorStop(1, "#00b862");
			} else if (hpRatio > .25) {
				hpGrad.addColorStop(0, "#ffb700");
				hpGrad.addColorStop(1, "#ff7700");
			} else {
				hpGrad.addColorStop(0, "#ff2d55");
				hpGrad.addColorStop(1, "#c00028");
			}
			CanvasUtils.fillRoundedRect(ctx, barX, hpY, fillW, barH, 13, hpGrad);
		}
		const hpLabel = CanvasUtils.cleanText(customTexts?.hpLabel || "HP");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 13px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(`${currentHp} / ${maxHp} ${hpLabel}`, x + w / 2, hpY + barH / 2 + 1);
		const statsY = hpY + 48;
		const coinLabel = CanvasUtils.cleanText(customTexts?.coinLabel || "Coins");
		const coinStr = `${player.coins} ${coinLabel}`;
		ctx.font = "bold 16px sans-serif";
		const coinStartX = x + (w - (28 + ctx.measureText(coinStr).width)) / 2;
		CanvasUtils.drawCoinIcon(ctx, coinStartX + 10, statsY, 10);
		ctx.fillStyle = "#ffd700";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(coinStr, coinStartX + 26, statsY);
		const actionY = statsY + 30;
		CanvasUtils.fillRoundedRect(ctx, barX, actionY, barW, 44, 12, "rgba(255, 255, 255, 0.03)", "rgba(255,255,255,0.07)", 1);
		ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
		ctx.font = "14px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const cleanAction = this.cleanText(player.lastAction || "Awaiting action...", [player]);
		ctx.fillText(cleanAction, x + w / 2, actionY + 22);
		if (player.activeEffects && player.activeEffects.length > 0) {
			const effectY = actionY + 54;
			const cleanEffects = player.activeEffects.map((e) => this.cleanText(e, [player])).join(" • ");
			CanvasUtils.fillRoundedRect(ctx, barX, effectY - 12, barW, 26, 8, "rgba(0, 247, 255, 0.1)", "rgba(0, 247, 255, 0.35)", 1);
			ctx.fillStyle = "#00f7ff";
			ctx.font = "bold 12px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`BUFF: ${cleanEffects}`, x + w / 2, effectY + 1);
		}
	}
	/**
	* Renders the Victory or Game Over card.
	*/
	static async renderOutcomeCard(winner, loser, type = "WIN", customTexts) {
		const W = 900;
		const H = 540;
		const canvas = new Canvas(W, H);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
		if (type === "WIN") {
			bg.addColorStop(0, "#122618");
			bg.addColorStop(.65, "#0b140e");
			bg.addColorStop(1, "#060807");
		} else if (type === "SURRENDER") {
			bg.addColorStop(0, "#281b10");
			bg.addColorStop(.65, "#140e08");
			bg.addColorStop(1, "#080706");
		} else {
			bg.addColorStop(0, "#261318");
			bg.addColorStop(.65, "#140a0d");
			bg.addColorStop(1, "#080607");
		}
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
		ctx.lineWidth = 1;
		for (let x = 40; x < W; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, H);
			ctx.stroke();
		}
		const themeColor = type === "WIN" ? "#00f5a0" : type === "SURRENDER" ? "#ffb700" : "#ff2d55";
		CanvasUtils.fillRoundedRect(ctx, 24, 24, 852, 492, 24, "rgba(255,255,255,0.015)", themeColor, 1.5);
		ctx.save();
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		let titleText = customTexts?.title || (type === "SURRENDER" ? "SURRENDER" : type === "DENIED" ? "CHALLENGE DECLINED" : type === "TIMEOUT" ? "TIME'S UP" : "VICTORY");
		let subtitleText = customTexts?.subtitle || (type === "SURRENDER" ? "The opponent surrendered." : type === "DENIED" ? "The duel invitation was rejected." : type === "TIMEOUT" ? "The duel timed out due to inactivity." : "Wins the battle!");
		ctx.shadowColor = themeColor;
		ctx.shadowBlur = 22;
		ctx.fillStyle = themeColor;
		ctx.font = "bold 52px sans-serif";
		ctx.fillText(titleText, W / 2, 85);
		ctx.restore();
		if (type === "WIN" || type === "SURRENDER") {
			await CanvasUtils.drawCircularAvatar(ctx, winner.avatarUrl, W / 2, 250, 90, themeColor, 6);
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 34px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(winner.username, W / 2, 380);
			ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
			ctx.font = "20px sans-serif";
			ctx.fillText(subtitleText, W / 2, 422);
		} else {
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 24px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(subtitleText, W / 2, 280);
		}
		return canvas.toBuffer("image/png");
	}
};
// src/games/Fight.ts
var Fight = class extends BaseGame {
	opponentUser = null;
	opponentMember = null;
	phase = "REQUEST";
	isVsBoss = false;
	bossProfile = null;
	p1;
	p2;
	currentTurnId;
	btnPrefix;
	lastAnnouncement = "Choose your action!";
	constructor(manager, options) {
		super(manager, options, "fight");
		this.btnPrefix = getRandomString(6, "fight_");
		this.defaultColor = this.resolveColor(options.embed?.color, 15548997);
		const startHp = options.startHealth ?? 100;
		const startCoins = options.coins ?? 20;
		this.p1 = {
			id: this.ctx.userId,
			username: this.ctx.user.username,
			avatarUrl: this.ctx.user.displayAvatarURL({
				extension: "png",
				size: 128
			}),
			health: startHp,
			maxHealth: startHp,
			coins: startCoins,
			lastAction: "Challenged opponent",
			activeEffects: []
		};
		const opp = options.opponent;
		if (!opp || (opp instanceof GuildMember ? opp.user.bot : opp.bot) || options.ai || options.boss) {
			this.isVsBoss = true;
			const bossKey = options.boss || "dragon";
			this.bossProfile = FIGHT_BOSSES[bossKey] || FIGHT_BOSSES["dragon"];
			this.p2 = {
				id: "weky_boss",
				username: this.bossProfile.name,
				avatarUrl: this.bossProfile.avatarUrl,
				health: this.bossProfile.maxHealth,
				maxHealth: this.bossProfile.maxHealth,
				coins: this.bossProfile.coins,
				lastAction: this.bossProfile.title,
				activeEffects: []
			};
		} else {
			if (opp instanceof GuildMember) {
				this.opponentMember = opp;
				this.opponentUser = opp.user;
			} else this.opponentUser = opp;
			this.p2 = {
				id: this.opponentUser.id,
				username: this.opponentUser.username,
				avatarUrl: this.opponentUser.displayAvatarURL({
					extension: "png",
					size: 128
				}),
				health: startHp,
				maxHealth: startHp,
				coins: startCoins,
				lastAction: "Awaiting start",
				activeEffects: []
			};
		}
		this.currentTurnId = this.p1.id;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
	}
	async start() {
		if (!this.isVsBoss && this.opponentUser && this.opponentUser.id === this.ctx.userId) {
			const msg = this.options.cannotFightYourselfMessage || "❌ You cannot fight against yourself!";
			const container = this.createContainer(16711680).addTextDisplayComponents((t) => t.setContent(`## ❌ Error\n> ${msg}`));
			await this.ctx.sendInitial({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
			return;
		}
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		if (this.isVsBoss && this.bossProfile) {
			this.phase = "FIGHT";
			this.currentTurnId = this.p1.id;
			this.lastAnnouncement = this.bossProfile.dialogueIntro;
			await this.updateBattleInterface();
			this.resetTimeout(() => this.endGame("TIMEOUT"));
			return;
		}
		const buffer = await RenderFight.renderRequestCard({
			username: this.p1.username,
			avatarUrl: this.p1.avatarUrl
		}, {
			username: this.p2.username,
			avatarUrl: this.p2.avatarUrl
		});
		const attachment = new AttachmentBuilder(buffer, { name: "fight-request.png" });
		const container = this.createGameContainer("request", { image: "fight-request.png" });
		await this.ctx.sendInitial({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("TIMEOUT"));
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		const action = customId.replace(this.btnPrefix, "");
		if (this.phase === "REQUEST") {
			if (action === "accept") {
				if (interaction.user.id !== this.p2.id) {
					const wrongMsg = this.options.wrongUserFight || "Only the challenged opponent can accept this duel!";
					ContextAdapter.replyEphemeral(interaction, wrongMsg);
					return;
				}
				await interaction.deferUpdate().catch(() => {});
				await this.startBattle();
				return;
			}
			if (action === "deny") {
				if (interaction.user.id !== this.p2.id && interaction.user.id !== this.p1.id) {
					ContextAdapter.replyEphemeral(interaction, "You are not part of this duel challenge!");
					return;
				}
				await interaction.deferUpdate().catch(() => {});
				await this.endGame("DENIED");
				return;
			}
		}
		if (this.phase === "FIGHT") {
			if (interaction.user.id !== this.p1.id && interaction.user.id !== this.p2.id) {
				const wrongMsg = this.options.wrongUserFight || "You are not participating in this battle!";
				ContextAdapter.replyEphemeral(interaction, wrongMsg);
				return;
			}
			if (action !== "surrender" && interaction.user.id !== this.currentTurnId) {
				const waitMsg = this.options.opponentsTurnMessage || "Please wait for your opponent's move!";
				ContextAdapter.replyEphemeral(interaction, waitMsg);
				return;
			}
			await interaction.deferUpdate().catch(() => {});
			this.resetTimeout(() => this.endGame("TIMEOUT"));
			const activeFighter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
			const targetFighter = this.currentTurnId === this.p1.id ? this.p2 : this.p1;
			if (action === "hit") this.handleHit(activeFighter, targetFighter, false);
			else if (action === "heavy") this.handleHit(activeFighter, targetFighter, true);
			else if (action === "heal") this.handleHeal(activeFighter);
			else if (action === "shield") this.handleShield(activeFighter);
			else if (action === "double") this.handleDoubleDamage(activeFighter);
			else if (action === "surrender") {
				const surrenderingP = interaction.user.id === this.p1.id ? this.p1 : this.p2;
				const winnerP = interaction.user.id === this.p1.id ? this.p2 : this.p1;
				await this.endGame("SURRENDER", winnerP, surrenderingP);
				return;
			}
			if (targetFighter.health <= 0) {
				await this.endGame("WIN", activeFighter, targetFighter);
				return;
			}
			if (this.isVsBoss) {
				const bossAction = FightAI.decideAction(this.p2, this.p1, this.bossProfile || void 0);
				const playerAnnouncement = this.lastAnnouncement;
				if (bossAction === "special" && this.bossProfile) {
					const res = this.bossProfile.specialMoveEffect(this.p2, this.p1);
					this.p2.lastAction = this.bossProfile.specialMoveName;
					this.lastAnnouncement = `${playerAnnouncement}\n\n${res.message}`;
				} else if (bossAction === "heavy") {
					this.handleHit(this.p2, this.p1, true);
					this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
				} else if (bossAction === "heal") {
					this.handleHeal(this.p2);
					this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
				} else if (bossAction === "shield") {
					this.handleShield(this.p2);
					this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
				} else {
					this.handleHit(this.p2, this.p1, false);
					this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
				}
				if (this.p1.health <= 0) {
					await this.endGame("WIN", this.p2, this.p1);
					return;
				}
				this.currentTurnId = this.p1.id;
				await this.updateBattleInterface();
				return;
			}
			this.currentTurnId = targetFighter.id;
			await this.updateBattleInterface();
		}
	}
	async startBattle() {
		this.phase = "FIGHT";
		this.currentTurnId = Math.random() < .5 ? this.p1.id : this.p2.id;
		const starter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
		this.lastAnnouncement = `The duel begins! It's ${starter.username}'s turn!`;
		await this.updateBattleInterface();
	}
	handleHit(attacker, defender, isHeavy) {
		const isBoss = attacker.id === "weky_boss" && this.bossProfile;
		let minDmg = 12;
		let maxDmg = this.options.damageMax ?? 20;
		if (isBoss && this.bossProfile) {
			minDmg = this.bossProfile.damageMin;
			maxDmg = this.bossProfile.damageMax;
		}
		let damage = 0;
		if (isHeavy) {
			if (Math.random() < (isBoss ? .08 : .14)) {
				attacker.lastAction = "Missed Heavy Attack!";
				this.lastAnnouncement = `💨 **${attacker.username}** swung hard but missed!`;
				attacker.coins += 5;
				return;
			}
			if (isBoss && this.bossProfile) damage = Math.floor(Math.random() * (Math.round(maxDmg * 1.35) - Math.round(minDmg * 1.35) + 1)) + Math.round(minDmg * 1.35);
			else damage = Math.floor(Math.random() * 11) + 20;
		} else damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
		if (attacker.activeEffects?.includes("2x Damage")) {
			damage *= 2;
			attacker.activeEffects = attacker.activeEffects.filter((e) => e !== "2x Damage");
		}
		if (defender.activeEffects?.includes("Shield")) {
			damage = Math.floor(damage / 2);
			defender.activeEffects = defender.activeEffects.filter((e) => e !== "Shield");
		}
		defender.health = Math.max(0, defender.health - damage);
		attacker.coins += isHeavy ? 15 : 10;
		attacker.lastAction = `${isHeavy ? "Heavy Hit" : "Hit"} for ${damage} DMG`;
		this.lastAnnouncement = `💥 **${attacker.username}** used ${isHeavy ? "Heavy Attack" : "Normal Attack"} dealing **${damage}** damage!`;
	}
	handleHeal(player) {
		const maxHp = player.maxHealth || 100;
		if (player.health >= maxHp * .85) {
			const highHpMsg = this.options.highHealthMessage || "You cannot heal if your HP is above 85%!";
			this.lastAnnouncement = `⚠️ **${player.username}** tried to heal: ${highHpMsg}`;
			player.lastAction = "Heal failed (High HP)";
			return;
		}
		const healAmount = Math.floor(Math.random() * 11) + 16;
		player.health = Math.min(maxHp, player.health + healAmount);
		player.coins += 5;
		player.lastAction = `Healed +${healAmount} HP`;
		this.lastAnnouncement = `💚 **${player.username}** healed for **+${healAmount} HP**!`;
	}
	handleShield(player) {
		if (player.coins < 25) {
			this.lastAnnouncement = `❌ Not enough coins for a Shield! (Cost: 25, You have: ${player.coins})`;
			return;
		}
		player.coins -= 25;
		if (!player.activeEffects) player.activeEffects = [];
		if (!player.activeEffects.includes("Shield")) player.activeEffects.push("Shield");
		player.lastAction = "Activated Shield";
		const shieldReply = this.options.powerups?.shield?.replyMessage ? this.options.powerups.shield.replyMessage.replace("{{username}}", player.username) : `🛡️ **${player.username}** activated a **Shield** (-50% next incoming damage)!`;
		this.lastAnnouncement = shieldReply;
	}
	handleDoubleDamage(player) {
		if (player.coins < 30) {
			this.lastAnnouncement = `❌ Not enough coins for 2x Damage! (Cost: 30, You have: ${player.coins})`;
			return;
		}
		player.coins -= 30;
		if (!player.activeEffects) player.activeEffects = [];
		if (!player.activeEffects.includes("2x Damage")) player.activeEffects.push("2x Damage");
		player.lastAction = "Activated 2x DMG";
		const dmgReply = this.options.powerups?.doubleDamage?.replyMessage ? this.options.powerups.doubleDamage.replyMessage.replace("{{username}}", player.username) : `⚡ **${player.username}** activated **Double Damage** on next attack!`;
		this.lastAnnouncement = dmgReply;
	}
	async updateBattleInterface() {
		const buffer = await RenderFight.renderBattleCard(this.p1, this.p2, this.currentTurnId, this.lastAnnouncement);
		const attachment = new AttachmentBuilder(buffer, { name: "fight-arena.png" });
		const container = this.createGameContainer("active", {
			image: "fight-arena.png",
			turnId: this.currentTurnId,
			announcement: this.lastAnnouncement
		});
		if (!this.ctx.gameMessage) await this.ctx.sendInitial({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
		else await this.ctx.edit({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
	}
	async endGame(reason, winner, loser) {
		this.phase = "ENDED";
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		const winnerData = winner || (this.p1.health > this.p2.health ? this.p1 : this.p2);
		const loserData = loser || (winnerData.id === this.p1.id ? this.p2 : this.p1);
		let outcome = reason;
		if (reason === "WIN") outcome = winnerData.id === this.p1.id ? "WIN" : "LOSE";
		else if (reason === "SURRENDER") outcome = winnerData.id === this.p1.id ? "WIN" : "LOSE";
		this.emitEnd(outcome, outcome === "WIN" ? 1 : 0, {
			winner: winnerData,
			loser: loserData
		});
		const buffer = await RenderFight.renderOutcomeCard({
			username: winnerData.username,
			avatarUrl: winnerData.avatarUrl
		}, loserData ? {
			username: loserData.username,
			avatarUrl: loserData.avatarUrl
		} : void 0, reason);
		const attachment = new AttachmentBuilder(buffer, { name: "fight-outcome.png" });
		const stateKey = reason === "WIN" ? "won" : reason === "SURRENDER" ? "surrender" : reason === "DENIED" ? "deny" : "timeout";
		const container = this.createGameContainer(stateKey, {
			image: "fight-outcome.png",
			winnerId: winnerData.id,
			loserId: loserData?.id
		});
		if (!this.ctx.gameMessage) await this.ctx.sendInitial({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
		else await this.ctx.edit({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, details) {
		const stateColors = {
			request: 16705372,
			active: this.defaultColor,
			won: 5763719,
			surrender: 15548997,
			deny: 15548997,
			timeout: 10070709,
			error: 16711680
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const formatFighterName = (id) => {
			if (!id) return "Unknown";
			if (id === "weky_boss") return `**${this.p2.username} (Boss)**`;
			return `<@${id}>`;
		};
		switch (state) {
			case "request":
				content = this.options.states?.request ? this.options.states.request.replace("{{challengerMention}}", `<@${this.p1.id}>`).replace("{{opponentMention}}", formatFighterName(this.p2.id)) : `## ⚔️ Challenge!\n> <@${this.p1.id}> challenged ${formatFighterName(this.p2.id)} to a duel!`;
				break;
			case "active":
				const turnText = formatFighterName(details?.turnId || this.currentTurnId);
				content = this.options.states?.active ? this.options.states.active : `## ⚔️ Fighting...\n> 🎯 **Turn:** ${turnText}\n> ${details?.announcement || this.lastAnnouncement}`;
				break;
			case "won":
				const winnerName = formatFighterName(details?.winnerId || this.p1.id);
				const loserName = formatFighterName(details?.loserId || this.p2.id);
				content = this.options.states?.won ? this.options.states.won : `## 🏆 Fight Ended\n> 🏆 ${winnerName} knocked out ${loserName} and won the duel!`;
				break;
			case "surrender":
				const surrLoser = formatFighterName(details?.loserId || this.p2.id);
				const surrWinner = formatFighterName(details?.winnerId || this.p1.id);
				content = this.options.states?.surrender ? this.options.states.surrender : `## 🏳️ Surrendered\n> 🏳️ ${surrLoser} surrendered! ${surrWinner} is victorious!`;
				break;
			case "deny":
				content = this.options.states?.deny ? this.options.states.deny : `## 🚫 Denied\n> The challenge was declined.`;
				break;
			case "timeout":
				content = this.options.states?.timeout ? this.options.states.timeout : `## ⏱️ Time's Up\n> The duel timed out due to inactivity.`;
				break;
			case "error": content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown error.") : `## ❌ Error\n> ${details?.error || "Unknown error."}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (details?.image) {
			const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
			container.addMediaGalleryComponents(gallery);
		}
		if (state === "request") {
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}accept`).setLabel(this.options.buttons?.accept || "Accept Duel").setEmoji("⚔️").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`${this.btnPrefix}deny`).setLabel(this.options.buttons?.deny || "Decline").setEmoji("✖️").setStyle(ButtonStyle.Danger));
			container.addActionRowComponents(row);
		} else if (state === "active") {
			const active = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
			const row1 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}hit`).setLabel(this.options.buttons?.hit || "Hit").setEmoji("🗡️").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId(`${this.btnPrefix}heavy`).setLabel(this.options.buttons?.heavy || "Heavy Attack").setEmoji("🪓").setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId(`${this.btnPrefix}heal`).setLabel(this.options.buttons?.heal || "Heal").setEmoji("💚").setStyle(ButtonStyle.Success).setDisabled(active.health >= 85), new ButtonBuilder().setCustomId(`${this.btnPrefix}surrender`).setLabel(this.options.buttons?.cancel || "Surrender").setEmoji("🏳️").setStyle(ButtonStyle.Secondary));
			const shieldLabel = this.options.powerups?.shield?.label || "Shield (25¢)";
			const doubleLabel = this.options.powerups?.doubleDamage?.label || "2x DMG (30¢)";
			const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}shield`).setLabel(shieldLabel).setEmoji("🛡️").setStyle(ButtonStyle.Secondary).setDisabled(active.coins < 25), new ButtonBuilder().setCustomId(`${this.btnPrefix}double`).setLabel(doubleLabel).setEmoji("⚡").setStyle(ButtonStyle.Secondary).setDisabled(active.coins < 30));
			container.addActionRowComponents(row1);
			container.addActionRowComponents(row2);
		}
		return container;
	}
};
// src/canvas/Render2048.ts
const CANVAS_SIZE$1 = 800;
const GRID_SIZE = 560;
const GRID_Y_START$1 = 180;
const CELL_SIZE = 120;
const TILE_COLORS = {
	0: {
		main: "#cdc1b4",
		shadow: "#bdad9e",
		text: "transparent"
	},
	2: {
		main: "#eee4da",
		shadow: "#ded0c1",
		text: "#776e65"
	},
	4: {
		main: "#ede0c8",
		shadow: "#decbb0",
		text: "#776e65"
	},
	8: {
		main: "#f2b179",
		shadow: "#e69c5c",
		text: "#f9f6f2"
	},
	16: {
		main: "#f59563",
		shadow: "#e67e45",
		text: "#f9f6f2"
	},
	32: {
		main: "#f67c5f",
		shadow: "#e36040",
		text: "#f9f6f2"
	},
	64: {
		main: "#f65e3b",
		shadow: "#d6421e",
		text: "#f9f6f2"
	},
	128: {
		main: "#edcf72",
		shadow: "#dcc059",
		text: "#f9f6f2"
	},
	256: {
		main: "#edcc61",
		shadow: "#dcb946",
		text: "#f9f6f2"
	},
	512: {
		main: "#edc850",
		shadow: "#dcb438",
		text: "#f9f6f2"
	},
	1024: {
		main: "#edc53f",
		shadow: "#dbb227",
		text: "#f9f6f2"
	},
	2048: {
		main: "#edc22e",
		shadow: "#dfb216",
		text: "#f9f6f2"
	}
};
function getTileColors(val) {
	if (TILE_COLORS[val]) return TILE_COLORS[val];
	return {
		main: "#3c3a32",
		shadow: "#292721",
		text: "#f9f6f2"
	};
}
var Render2048 = class {
	static async renderBoard(board, score, username, avatarUrl, state) {
		const canvas = new Canvas(CANVAS_SIZE$1, CANVAS_SIZE$1);
		const ctx = canvas.getContext("2d");
		const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE$1);
		bgGrad.addColorStop(0, "#1e2024");
		bgGrad.addColorStop(1, "#2b2d33");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, CANVAS_SIZE$1, CANVAS_SIZE$1);
		await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, "#00f7ff", 4);
		CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 26px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		const truncatedName = username.length > 14 ? username.slice(0, 13) + "…" : username;
		ctx.fillText(truncatedName, 146, 75);
		const scoreBoxW = 200;
		const scoreBoxX = 560;
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#15171c");
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#1e2129");
		ctx.fillStyle = "#00f7ff";
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("SCORE", 660, 45);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 34px sans-serif";
		ctx.fillText(String(score), 660, 70);
		const gridX = 120;
		CanvasUtils.fillRoundedRect(ctx, gridX, 188, GRID_SIZE, GRID_SIZE, 18, "#9e9183");
		CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START$1, GRID_SIZE, GRID_SIZE, 18, "#bbada0");
		for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
			const val = board[row][col];
			const x = 136 + col * 136;
			const y = 196 + row * 136;
			const colors = getTileColors(val);
			CanvasUtils.fillRoundedRect(ctx, x, y + 5, CELL_SIZE, CELL_SIZE, 10, colors.shadow);
			CanvasUtils.fillRoundedRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 10, colors.main);
			if (val > 0) {
				ctx.fillStyle = colors.text;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.font = `bold ${val > 1e3 ? 46 : val > 100 ? 54 : 64}px sans-serif`;
				ctx.fillText(String(val), x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 2);
			}
		}
		if (state && state !== "active") {
			ctx.save();
			CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START$1, GRID_SIZE, 568, 18, "rgba(15, 17, 20, 0.82)");
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (state === "won") {
				ctx.shadowColor = "#ffcc00";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#ffcc00";
				ctx.font = "bold 72px sans-serif";
				ctx.fillText("VICTORY!", CANVAS_SIZE$1 / 2, 440);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "28px sans-serif";
				ctx.fillText("You reached 2048!", CANVAS_SIZE$1 / 2, 510);
			} else {
				const title = state === "quit" ? "GAME STOPPED" : state === "timeout" ? "TIME'S UP" : "GAME OVER";
				ctx.shadowColor = "#ff4444";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#ff4444";
				ctx.font = "bold 68px sans-serif";
				ctx.fillText(title, CANVAS_SIZE$1 / 2, 440);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "28px sans-serif";
				ctx.fillText(`Final Score: ${score}`, CANVAS_SIZE$1 / 2, 510);
			}
			ctx.restore();
		}
		return canvas.toBuffer("image/png");
	}
};
// src/games/Game2048.ts
var Game2048 = class extends BaseGame {
	board = [];
	score = 0;
	hasWon = false;
	isGameOver = false;
	gameTitle;
	emojiUp;
	emojiDown;
	emojiLeft;
	emojiRight;
	quitButtonLabel;
	idUp;
	idDown;
	idLeft;
	idRight;
	idQuit;
	constructor(manager, options) {
		super(manager, options, "2048");
		const uid = getRandomString(6, "2048_");
		this.idUp = `${uid}_up`;
		this.idDown = `${uid}_down`;
		this.idLeft = `${uid}_left`;
		this.idRight = `${uid}_right`;
		this.idQuit = `${uid}_quit`;
		this.gameTitle = options.embed?.title || "2048";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.emojiUp = options.emojis?.up || "⬆️";
		this.emojiDown = options.emojis?.down || "⬇️";
		this.emojiLeft = options.emojis?.left || "⬅️";
		this.emojiRight = options.emojis?.right || "➡️";
		this.quitButtonLabel = options.quitButton || "Quit";
		this.defaultTimeout = options.time || manager?.defaultTimeout || 3e5;
	}
	async start() {
		this.initBoard();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const initialContainer = this.createGameContainer("loading");
		await this.ctx.sendInitial({
			components: [initialContainer],
			flags: MessageFlags.IsComponentsV2
		});
		const boardBuffer = await this.renderBoardImage();
		const attachment = new AttachmentBuilder(boardBuffer, { name: "2048-board.png" });
		const activeContainer = this.createGameContainer("active", {
			image: "2048-board.png",
			score: this.score
		});
		await this.ctx.edit({
			components: [activeContainer],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	initBoard() {
		this.board = Array(4).fill(0).map(() => Array(4).fill(0));
		this.score = 0;
		this.hasWon = false;
		this.isGameOver = false;
		this.spawnTile();
		this.spawnTile();
	}
	spawnTile() {
		const empty = [];
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (this.board[r][c] === 0) empty.push({
			r,
			c
		});
		if (empty.length > 0) {
			const spot = empty[Math.floor(Math.random() * empty.length)];
			this.board[spot.r][spot.c] = Math.random() < .9 ? 2 : 4;
		}
	}
	async renderBoardImage(endingState) {
		const avatar = this.ctx.user.displayAvatarURL({
			extension: "png",
			size: 128
		});
		const state = endingState || (this.hasWon ? "won" : this.isGameOver ? "gameover" : "active");
		return Render2048.renderBoard(this.board, this.score, this.ctx.user.username, avatar, state);
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (!this.isAuthorized(interaction)) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		const id = interaction.customId;
		if (id === this.idQuit) {
			await interaction.deferUpdate().catch(() => {});
			return this.endGame("quit");
		}
		let direction = null;
		if (id === this.idUp) direction = "UP";
		else if (id === this.idDown) direction = "DOWN";
		else if (id === this.idLeft) direction = "LEFT";
		else if (id === this.idRight) direction = "RIGHT";
		if (!direction) return;
		await interaction.deferUpdate().catch(() => {});
		this.resetTimeout(() => this.endGame("timeout"));
		if (!this.move(direction)) return;
		const buffer = await this.renderBoardImage();
		const attachment = new AttachmentBuilder(buffer, { name: "2048-board.png" });
		if (this.hasWon) return this.endGame("won", {
			image: "2048-board.png",
			score: this.score
		}, attachment);
		if (this.isGameOver) return this.endGame("gameover", {
			image: "2048-board.png",
			score: this.score
		}, attachment);
		const container = this.createGameContainer("active", {
			image: "2048-board.png",
			score: this.score
		});
		await this.ctx.edit({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
	}
	move(direction) {
		let moved = false;
		let scoreGained = 0;
		let newBoard = this.board.map((row) => [...row]);
		const processRow = (row) => {
			let filtered = row.filter((v) => v !== 0);
			let merged = [];
			for (let i = 0; i < filtered.length; i++) if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
				const combined = filtered[i] * 2;
				merged.push(combined);
				scoreGained += combined;
				i++;
			} else merged.push(filtered[i]);
			while (merged.length < 4) merged.push(0);
			return merged;
		};
		if (direction === "LEFT") newBoard = newBoard.map((row) => {
			const nr = processRow(row);
			if (nr.join(",") !== row.join(",")) moved = true;
			return nr;
		});
		else if (direction === "RIGHT") newBoard = newBoard.map((row) => {
			const rev = [...row].reverse();
			const nr = processRow(rev);
			if (nr.join(",") !== rev.join(",")) moved = true;
			return nr.reverse();
		});
		else if (direction === "UP") {
			let trans = this.transpose(newBoard);
			trans = trans.map((row) => {
				const nr = processRow(row);
				if (nr.join(",") !== row.join(",")) moved = true;
				return nr;
			});
			newBoard = this.transpose(trans);
		} else if (direction === "DOWN") {
			let trans = this.transpose(newBoard);
			trans = trans.map((row) => {
				const rev = [...row].reverse();
				const nr = processRow(rev);
				if (nr.join(",") !== rev.join(",")) moved = true;
				return nr.reverse();
			});
			newBoard = this.transpose(trans);
		}
		if (moved) {
			this.board = newBoard;
			this.score += scoreGained;
			this.spawnTile();
			if (!this.hasWon && this.checkWon()) this.hasWon = true;
			if (this.checkGameOver()) this.isGameOver = true;
		}
		return moved;
	}
	transpose(matrix) {
		return matrix[0].map((_, col) => matrix.map((row) => row[col]));
	}
	checkWon() {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (this.board[r][c] >= 2048) return true;
		return false;
	}
	checkGameOver() {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
			if (this.board[r][c] === 0) return false;
			if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return false;
			if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return false;
		}
		return true;
	}
	async endGame(state, details, attachment) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state, this.score);
		if (!attachment && state !== "error") {
			const buffer = await this.renderBoardImage(state);
			attachment = new AttachmentBuilder(buffer, { name: "2048-board.png" });
		}
		const container = this.createGameContainer(state, details || {
			score: this.score,
			image: "2048-board.png"
		});
		const files = attachment ? [attachment] : [];
		await this.ctx.edit({
			components: [container],
			files,
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, details) {
		const stateColors = {
			loading: this.defaultColor,
			active: this.defaultColor,
			won: 5763719,
			gameover: 15548997,
			quit: 15548997,
			timeout: 15548997,
			error: 16711680
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const score = details?.score ?? this.score;
		switch (state) {
			case "loading":
				content = this.options.loadingMessage ? this.options.loadingMessage.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 Starting game...`;
				break;
			case "active":
				content = this.options.activeMessage ? this.options.activeMessage.replace("{{gameTitle}}", this.gameTitle).replace("{{score}}", score.toString()) : `## ${this.gameTitle}\n> Combine the tiles to reach **2048**!\n\n**Score:** \`${score}\``;
				break;
			case "won":
				content = this.options.wonMessage ? this.options.wonMessage.replace("{{score}}", score.toString()) : `## 🎉 You Won!\n> You reached the **2048** tile!\n\n**Final Score:** \`${score}\``;
				break;
			case "gameover":
				content = this.options.gameoverMessage ? this.options.gameoverMessage.replace("{{score}}", score.toString()) : `## 💀 Game Over\n> No more moves available.\n\n**Final Score:** \`${score}\``;
				break;
			case "quit":
				content = this.options.quitMessage ? this.options.quitMessage.replace("{{score}}", score.toString()) : `## 🛑 Game Stopped\n> You quit the game.\n\n**Final Score:** \`${score}\``;
				break;
			case "timeout":
				content = this.options.timeoutMessage ? this.options.timeoutMessage.replace("{{score}}", score.toString()) : `## ⏱️ Time's Up\n> Game session expired.\n\n**Final Score:** \`${score}\``;
				break;
			case "error": content = this.options.errorMessage ? this.options.errorMessage.replace("{{error}}", details?.error || "Unknown") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (details?.image) {
			const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
			container.addMediaGalleryComponents(gallery);
		}
		if (state !== "loading" && state !== "error") {
			const isDisabled = state !== "active";
			const up = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiUp).setCustomId(this.idUp).setDisabled(isDisabled);
			const down = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiDown).setCustomId(this.idDown).setDisabled(isDisabled);
			const left = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiLeft).setCustomId(this.idLeft).setDisabled(isDisabled);
			const right = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiRight).setCustomId(this.idRight).setDisabled(isDisabled);
			const quit = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.quitButtonLabel).setCustomId(this.idQuit).setEmoji("🛑").setDisabled(isDisabled);
			const dis1 = new ButtonBuilder().setLabel("​").setStyle(ButtonStyle.Secondary).setCustomId("dis1").setDisabled(true);
			const dis2 = new ButtonBuilder().setLabel("​").setStyle(ButtonStyle.Secondary).setCustomId("dis2").setDisabled(true);
			const row1 = new ActionRowBuilder().addComponents(dis1, up, dis2, quit);
			const row2 = new ActionRowBuilder().addComponents(left, down, right);
			container.addActionRowComponents(row1);
			container.addActionRowComponents(row2);
		}
		return container;
	}
};
// src/games/GuessTheNumber.ts
var GuessTheNumber = class extends BaseGame {
	targetNumber = 0;
	currentMin = 1;
	currentMax = 1e3;
	attempts = 0;
	participants = /* @__PURE__ */ new Set();
	isPublic = false;
	btnPrefix;
	gameTitle;
	constructor(manager, options) {
		super(manager, options, "gtn");
		this.btnPrefix = getRandomString(6, "gtn_");
		this.isPublic = options.publicMode ?? options.publicGame ?? false;
		this.gameTitle = options.embed?.title || "Guess The Number";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.currentMin = options.min ?? 1;
		this.currentMax = options.max ?? 100;
		if (typeof options.number === "number") this.targetNumber = options.number;
		else this.targetNumber = Math.floor(Math.random() * (this.currentMax - this.currentMin + 1)) + this.currentMin;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 12e4;
	}
	async start() {
		this.startTime = Date.now();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isPublic && !this.isAuthorized(interaction)) return;
		if (interaction.customId === `${this.btnPrefix}cancel`) {
			await interaction.deferUpdate().catch(() => {});
			await this.endGame("cancelled");
		}
	}
	async onMessage(message) {
		if (!this.isActive) return;
		if (message.channelId !== this.ctx.channel.id) return;
		if (!this.isPublic && message.author.id !== this.ctx.userId) return;
		const content = message.content.trim();
		const guess = parseInt(content, 10);
		if (isNaN(guess) || !/^\d+$/.test(content)) return;
		if (message.deletable) await message.delete().catch(() => {});
		this.resetTimeout(() => this.endGame("timeout"));
		this.attempts++;
		this.participants.add(message.author.id);
		if (guess === this.targetNumber) {
			await this.endGame("won", message.author.id);
			return;
		}
		if (guess < this.targetNumber) {
			if (guess > this.currentMin) this.currentMin = guess;
			const hint = `🔼 **${guess} is TOO LOW!** <@${message.author.id}>, try a higher number.`;
			const container = this.createGameContainer("higher", { hint });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
		} else {
			if (guess < this.currentMax) this.currentMax = guess;
			const hint = `🔽 **${guess} is TOO HIGH!** <@${message.author.id}>, try a lower number.`;
			const container = this.createGameContainer("lower", { hint });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
		}
	}
	async endGame(state, winnerId) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state, this.attempts);
		const elapsed = formatTime(Date.now() - this.startTime);
		const container = this.createGameContainer(state, {
			winnerId,
			timeTaken: elapsed
		});
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, data) {
		const stateColors = {
			active: this.defaultColor,
			higher: 16705372,
			lower: 15105570,
			won: 5763719,
			cancelled: 15548997,
			lost: 15548997,
			timeout: 15548997
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const modeText = this.isPublic ? "👥 **Mode:** Public (Everyone can guess!)" : "👤 **Mode:** Solo";
		switch (state) {
			case "active":
			case "higher":
			case "lower":
				content = `## ${this.gameTitle}\n`;
				if (data?.hint) content += `> ${data.hint}\n\n`;
				content += `> ${modeText}\n> Guess the secret number between **${this.currentMin}** and **${this.currentMax}**!\n\n**Attempts:** \`${this.attempts}\` | **Participants:** \`${this.participants.size}\``;
				break;
			case "won":
				content = `## 🎯 Number Found!\n> 🏆 **Congratulations <@${data?.winnerId || this.ctx.userId}>!**\n> The secret number was **${this.targetNumber}**!\n\n**Total Attempts:** \`${this.attempts}\` | **Time Taken:** \`${data?.timeTaken || "0s"}\` | **Participants:** \`${this.participants.size}\``;
				break;
			case "cancelled":
				content = `## 🛑 Game Cancelled\n> The game was ended. The number was **${this.targetNumber}**.`;
				break;
			case "lost":
			case "timeout": content = `## ⏱️ Time's Up\n> Game session expired. The secret number was **${this.targetNumber}**.`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (state === "active" || state === "higher" || state === "lower") {
			const giveUpBtn = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.options.giveUpButton || this.options.button || "Give Up").setEmoji("🛑").setCustomId(`${this.btnPrefix}cancel`);
			container.addActionRowComponents((row) => row.setComponents(giveUpBtn));
		}
		return container;
	}
};
// src/canvas/RenderPokemon.ts
const TYPE_COLORS = {
	normal: "#a8a878",
	fire: "#f08030",
	water: "#6890f0",
	electric: "#f8d030",
	grass: "#78c850",
	ice: "#98d8d8",
	fighting: "#c03028",
	poison: "#a040a0",
	ground: "#e0c068",
	flying: "#a890f0",
	psychic: "#f85888",
	bug: "#a8b820",
	rock: "#b8a038",
	ghost: "#705898",
	dragon: "#7038f8",
	dark: "#705848",
	steel: "#b8b8d0",
	fairy: "#ee99ac"
};
var RenderPokemon = class {
	static async renderCard(pokemon, revealed = false) {
		const canvas = new Canvas(800, 500);
		const ctx = canvas.getContext("2d");
		const primaryType = (pokemon.types[0] || "normal").toLowerCase();
		const typeColor = TYPE_COLORS[primaryType] || "#00f7ff";
		const bg = ctx.createRadialGradient(250, 250, 50, 400, 250, 500);
		bg.addColorStop(0, "#19243b");
		bg.addColorStop(1, "#0a0e17");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, 800, 500);
		ctx.save();
		ctx.strokeStyle = "rgba(0, 247, 255, 0.08)";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.arc(260, 250, 190, 0, Math.PI * 2);
		ctx.stroke();
		ctx.strokeStyle = "rgba(0, 247, 255, 0.04)";
		ctx.lineWidth = 14;
		ctx.beginPath();
		ctx.arc(260, 250, 160, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
		try {
			const img = await loadImage(pokemon.imageUrl);
			const targetW = 320;
			const targetH = 320;
			const spriteX = 260 - targetW / 2;
			const spriteY = 250 - targetH / 2;
			if (!revealed) {
				const offCanvas = new Canvas(targetW, targetH);
				const offCtx = offCanvas.getContext("2d");
				offCtx.drawImage(img, 0, 0, targetW, targetH);
				offCtx.globalCompositeOperation = "source-in";
				offCtx.fillStyle = "#111726";
				offCtx.fillRect(0, 0, targetW, targetH);
				ctx.save();
				ctx.shadowColor = "rgba(0, 247, 255, 0.4)";
				ctx.shadowBlur = 24;
				ctx.drawImage(offCanvas, spriteX, spriteY);
				ctx.restore();
			} else {
				ctx.save();
				ctx.shadowColor = typeColor;
				ctx.shadowBlur = 26;
				ctx.drawImage(img, spriteX, spriteY, targetW, targetH);
				ctx.restore();
			}
		} catch {
			ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
			ctx.beginPath();
			ctx.arc(260, 250, 90, 0, Math.PI * 2);
			ctx.fill();
		}
		const rightX = 520;
		ctx.fillStyle = "#00f7ff";
		ctx.font = "bold 22px sans-serif";
		ctx.textAlign = "left";
		ctx.fillText("WHO'S THAT POKÉMON?", rightX, 100);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 44px sans-serif";
		if (revealed) ctx.fillText(pokemon.name, rightX, 160);
		else ctx.fillText("???", rightX, 160);
		let badgeX = rightX;
		for (const type of pokemon.types) {
			const color = TYPE_COLORS[type.toLowerCase()] || "#777777";
			CanvasUtils.drawBadge(ctx, type.toUpperCase(), badgeX, 200, 100, 32, color, "#ffffff", "bold 13px sans-serif");
			badgeX += 112;
		}
		CanvasUtils.fillRoundedRect(ctx, rightX, 260, 250, 170, 16, "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.1)", 1);
		ctx.fillStyle = "#8b949e";
		ctx.font = "bold 13px sans-serif";
		ctx.fillText("ABILITIES", 536, 290);
		ctx.fillStyle = "#e0e6ed";
		ctx.font = "16px sans-serif";
		const abilityText = pokemon.abilities.slice(0, 3).join(", ") || "Unknown";
		ctx.fillText(abilityText, 536, 320);
		ctx.fillStyle = "#8b949e";
		ctx.font = "bold 13px sans-serif";
		ctx.fillText(revealed ? "STATUS" : "HINT", 536, 365);
		ctx.fillStyle = revealed ? "#00ff88" : "#ffaa00";
		ctx.font = "bold 16px sans-serif";
		ctx.fillText(revealed ? "Identified!" : "Type your guess in chat!", 536, 395);
		return canvas.toBuffer("image/png");
	}
};
// src/data/pokemons.ts
const POPULAR_POKEMONS = [
	{
		id: 25,
		name: "Pikachu",
		types: ["Electric"],
		abilities: ["Static", "Lightning Rod"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
	},
	{
		id: 6,
		name: "Charizard",
		types: ["Fire", "Flying"],
		abilities: ["Blaze", "Solar Power"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
	},
	{
		id: 9,
		name: "Blastoise",
		types: ["Water"],
		abilities: ["Torrent", "Rain Dish"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
	},
	{
		id: 3,
		name: "Venusaur",
		types: ["Grass", "Poison"],
		abilities: ["Overgrow", "Chlorophyll"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png"
	},
	{
		id: 94,
		name: "Gengar",
		types: ["Ghost", "Poison"],
		abilities: ["Cursed Body"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
	},
	{
		id: 150,
		name: "Mewtwo",
		types: ["Psychic"],
		abilities: ["Pressure", "Unnerve"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
	},
	{
		id: 133,
		name: "Eevee",
		types: ["Normal"],
		abilities: [
			"Run Away",
			"Adaptability",
			"Anticipation"
		],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
	},
	{
		id: 143,
		name: "Snorlax",
		types: ["Normal"],
		abilities: [
			"Immunity",
			"Thick Fat",
			"Gluttony"
		],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png"
	},
	{
		id: 149,
		name: "Dragonite",
		types: ["Dragon", "Flying"],
		abilities: ["Inner Focus", "Multiscale"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png"
	},
	{
		id: 448,
		name: "Lucario",
		types: ["Fighting", "Steel"],
		abilities: [
			"Steadfast",
			"Inner Focus",
			"Justified"
		],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png"
	},
	{
		id: 658,
		name: "Greninja",
		types: ["Water", "Dark"],
		abilities: [
			"Torrent",
			"Protean",
			"Battle Bond"
		],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png"
	},
	{
		id: 384,
		name: "Rayquaza",
		types: ["Dragon", "Flying"],
		abilities: ["Air Lock"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png"
	},
	{
		id: 445,
		name: "Garchomp",
		types: ["Dragon", "Ground"],
		abilities: ["Sand Veil", "Rough Skin"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png"
	},
	{
		id: 282,
		name: "Gardevoir",
		types: ["Psychic", "Fairy"],
		abilities: [
			"Synchronize",
			"Trace",
			"Telepathy"
		],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png"
	},
	{
		id: 197,
		name: "Umbreon",
		types: ["Dark"],
		abilities: ["Synchronize", "Inner Focus"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png"
	},
	{
		id: 249,
		name: "Lugia",
		types: ["Psychic", "Flying"],
		abilities: ["Pressure", "Multiscale"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png"
	},
	{
		id: 130,
		name: "Gyarados",
		types: ["Water", "Flying"],
		abilities: ["Intimidate", "Moxie"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png"
	},
	{
		id: 392,
		name: "Infernape",
		types: ["Fire", "Fighting"],
		abilities: ["Blaze", "Iron Fist"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/392.png"
	},
	{
		id: 778,
		name: "Mimikyu",
		types: ["Ghost", "Fairy"],
		abilities: ["Disguise"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png"
	},
	{
		id: 257,
		name: "Blaziken",
		types: ["Fire", "Fighting"],
		abilities: ["Blaze", "Speed Boost"],
		imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/257.png"
	}
];
async function fetchRandomPokemon() {
	const randomId = Math.floor(Math.random() * 898) + 1;
	try {
		const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
		if (!res.ok) throw new Error("PokeAPI response was not ok");
		const data = await res.json();
		const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
		const types = data.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
		const abilities = data.abilities.map((a) => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1));
		const imageUrl = data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.other?.home?.front_default || data.sprites?.front_default;
		if (!imageUrl) throw new Error("No image sprite found");
		return {
			id: data.id,
			name,
			types,
			abilities,
			imageUrl
		};
	} catch {
		return POPULAR_POKEMONS[Math.floor(Math.random() * POPULAR_POKEMONS.length)];
	}
}
// src/games/GuessThePokemon.ts
var GuessThePokemon = class extends BaseGame {
	pokemon = null;
	btnPrefix;
	modalId;
	gameTitle;
	giveUpButtonLabel;
	constructor(manager, options) {
		super(manager, options, "gtp");
		this.btnPrefix = getRandomString(6, "gtp_");
		this.modalId = `${this.btnPrefix}modal`;
		this.gameTitle = options.embed?.title || "Who's That Pokémon?";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.giveUpButtonLabel = options.giveUpButton || "Give Up";
		this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
	}
	async start() {
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const loadingContainer = this.createGameContainer("loading");
		await this.ctx.sendInitial({
			components: [loadingContainer],
			flags: MessageFlags.IsComponentsV2
		});
		try {
			this.pokemon = this.options.pokemon || await fetchRandomPokemon();
		} catch {
			return this.endGame("error", "Failed to retrieve Pokémon data.");
		}
		if (!this.pokemon) return this.endGame("error", "Failed to retrieve Pokémon data.");
		this.startTime = Date.now();
		const buffer = await RenderPokemon.renderCard(this.pokemon, false);
		const attachment = new AttachmentBuilder(buffer, { name: "pokemon-card.png" });
		const activeContainer = this.createGameContainer("active", { image: "pokemon-card.png" });
		await this.ctx.edit({
			components: [activeContainer],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("lost"));
	}
	async onInteraction(interaction) {
		if (interaction.isButton()) {
			if (interaction.message.id !== this.ctx.gameMessage?.id) return;
			if (!this.isAuthorized(interaction)) return;
			const customId = interaction.customId;
			if (!customId.startsWith(this.btnPrefix)) return;
			const action = customId.replace(this.btnPrefix, "");
			if (action === "giveup") {
				await interaction.deferUpdate().catch(() => {});
				await this.endGame("lost");
				return;
			}
			if (action === "guess") {
				const modal = new ModalBuilder().setCustomId(this.modalId).setTitle("Guess The Pokémon");
				const textInput = new TextInputBuilder().setCustomId("pokemon_name").setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(30).setRequired(true).setPlaceholder("e.g. Pikachu");
				const label = new LabelBuilder().setLabel("What is the name of this Pokémon?").setTextInputComponent(textInput);
				modal.addLabelComponents(label);
				await interaction.showModal(modal).catch(() => {});
				return;
			}
		}
		if (interaction.isModalSubmit()) {
			if (interaction.customId !== this.modalId) return;
			if (interaction.user.id !== this.ctx.userId) return;
			await interaction.deferUpdate().catch(() => {});
			const input = interaction.fields.getTextInputValue("pokemon_name").trim();
			await this.processGuess(input);
		}
	}
	async onMessage(message) {
		if (message.channelId !== this.ctx.channel.id) return;
		if (message.author.id !== this.ctx.userId) return;
		const content = message.content.trim();
		if (!content || content.startsWith("/") || content.startsWith("!")) return;
		if (message.deletable) await message.delete().catch(() => {});
		await this.processGuess(content);
	}
	async processGuess(guess) {
		if (!this.pokemon || !this.isActive) return;
		this.resetTimeout(() => this.endGame("lost"));
		if (guess.toLowerCase().replace(/[^a-z0-9]/g, "") === this.pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, "")) await this.endGame("won");
		else {
			const buffer = await RenderPokemon.renderCard(this.pokemon, false);
			const attachment = new AttachmentBuilder(buffer, { name: "pokemon-card.png" });
			const incorrectNotice = this.options.incorrectMessage ? this.options.incorrectMessage.replace("{{answer}}", guess) : `❌ No, it's not **${guess}**! Try again.`;
			const container = this.createGameContainer("active", {
				image: "pokemon-card.png",
				statusNotice: incorrectNotice
			});
			await this.ctx.edit({
				components: [container],
				files: [attachment],
				flags: MessageFlags.IsComponentsV2
			});
		}
	}
	async endGame(state, errorMsg) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state);
		if (!this.pokemon) {
			const container = this.createGameContainer("error", { error: errorMsg || "Unknown error occurred." });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
			return;
		}
		const durationSec = formatTime(Date.now() - this.startTime);
		const buffer = await RenderPokemon.renderCard(this.pokemon, true);
		const attachment = new AttachmentBuilder(buffer, { name: "pokemon-revealed.png" });
		const container = this.createGameContainer(state, {
			image: "pokemon-revealed.png",
			timeTaken: durationSec,
			error: errorMsg
		});
		await this.ctx.edit({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, details) {
		const stateColors = {
			loading: this.defaultColor,
			active: this.defaultColor,
			won: 5763719,
			lost: 15548997,
			error: 16711680
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const name = this.pokemon?.name || "Unknown";
		switch (state) {
			case "loading":
				content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 ${this.options.thinkMessage || "Searching the tall grass for a wild Pokémon..."}`;
				break;
			case "active":
				const typesStr = this.pokemon?.types.map((t) => `\`${t}\``).join(", ") || "`Unknown`";
				const abilitiesStr = this.pokemon?.abilities.map((a) => `\`${a}\``).join(", ") || "`Unknown`";
				content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> **Types:** ${typesStr}\n> **Abilities:** ${abilitiesStr}\n\n> ⏳ Type your guess in chat or click **Guess Pokémon**!${details?.statusNotice ? `\n\n> ${details.statusNotice}` : ""}`;
				break;
			case "won":
				const winText = this.options.winMessage ? this.options.winMessage.replace("{{answer}}", name).replace("{{time}}", details?.timeTaken || "0s") : `GG! It was **${name}**. You got it in **${details?.timeTaken || "0s"}**!`;
				content = this.options.states?.won ? this.options.states.won.replace("{{gameTitle}}", this.gameTitle).replace("{{answer}}", name) : `## 🎉 Pokémon Identified!\n> 🏆 ${winText}`;
				break;
			case "lost":
				const loseText = this.options.loseMessage ? this.options.loseMessage.replace("{{answer}}", name) : `Better luck next time! It was **${name}**.`;
				content = this.options.states?.lost ? this.options.states.lost.replace("{{gameTitle}}", this.gameTitle).replace("{{answer}}", name) : `## 💨 Pokémon Got Away!\n> ${loseText}`;
				break;
			case "error": content = this.options.states?.error ? this.options.states.error.replace("{{error}}", details?.error || "Unknown error.") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (details?.image) {
			const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
			container.addMediaGalleryComponents(gallery);
		}
		if (state === "active") {
			const guessBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}guess`).setLabel("Guess Pokémon").setEmoji("⚡").setStyle(ButtonStyle.Primary);
			const giveUpBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}giveup`).setLabel(this.giveUpButtonLabel).setEmoji("🏳️").setStyle(ButtonStyle.Danger);
			const row = new ActionRowBuilder().addComponents(guessBtn, giveUpBtn);
			container.addActionRowComponents(row);
		}
		return container;
	}
};
// src/canvas/RenderHangman.ts
var RenderHangman = class {
	static async renderCard(wrongGuessesCount, displayWord, guessedLetters, username, avatarUrl, gameOver = false, won = false, fullWord) {
		const canvas = new Canvas(800, 500);
		const ctx = canvas.getContext("2d");
		const bg = ctx.createRadialGradient(400, 250, 50, 400, 250, 500);
		bg.addColorStop(0, "#2c303a");
		bg.addColorStop(1, "#15171d");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, 800, 500);
		await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 60, 55, 35, "#00ff88", 3);
		CanvasUtils.fillRoundedRect(ctx, 110, 32, 220, 46, 14, "rgba(255,255,255,0.06)");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 20px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		const truncated = username.length > 13 ? username.slice(0, 12) + "…" : username;
		ctx.fillText(truncated, 124, 55);
		ctx.fillStyle = "rgba(0,0,0,0.3)";
		ctx.beginPath();
		ctx.ellipse(230, 420, 130, 24, 0, 0, Math.PI * 2);
		ctx.fill();
		this.drawWoodenBeam(ctx, 110, 420, 350, 420, 14);
		this.drawWoodenBeam(ctx, 150, 420, 150, 100, 14);
		this.drawWoodenBeam(ctx, 150, 100, 310, 100, 14);
		this.drawWoodenBeam(ctx, 150, 170, 210, 100, 12);
		ctx.strokeStyle = "#c29b62";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(310, 100);
		ctx.lineTo(310, 150);
		ctx.stroke();
		const ropeEndX = 310;
		if (wrongGuessesCount >= 1) {
			ctx.save();
			ctx.fillStyle = "#e0e6ed";
			ctx.beginPath();
			ctx.arc(ropeEndX, 175, 25, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = "#8b949e";
			ctx.lineWidth = 3;
			ctx.stroke();
			if (wrongGuessesCount >= 6) {
				ctx.strokeStyle = "#ff3355";
				ctx.lineWidth = 2.5;
				this.drawX(ctx, 300, 170, 6);
				this.drawX(ctx, 320, 170, 6);
			}
			ctx.restore();
		}
		if (wrongGuessesCount >= 2) this.drawLimb(ctx, ropeEndX, 200, ropeEndX, 300, 7, "#e0e6ed");
		if (wrongGuessesCount >= 3) this.drawLimb(ctx, ropeEndX, 220, 270, 265, 6, "#e0e6ed");
		if (wrongGuessesCount >= 4) this.drawLimb(ctx, ropeEndX, 220, 350, 265, 6, "#e0e6ed");
		if (wrongGuessesCount >= 5) this.drawLimb(ctx, ropeEndX, 300, 275, 370, 6, "#e0e6ed");
		if (wrongGuessesCount >= 6) this.drawLimb(ctx, ropeEndX, 300, 345, 370, 6, "#e0e6ed");
		const rightCenterX = 580;
		ctx.fillStyle = "#8b949e";
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("SECRET WORD", rightCenterX, 130);
		ctx.fillStyle = "#ffffff";
		ctx.font = `bold ${displayWord.length > 18 ? 32 : displayWord.length > 12 ? 38 : 46}px monospace`;
		ctx.fillText(displayWord, rightCenterX, 185);
		const remaining = Math.max(0, 6 - wrongGuessesCount);
		const livesColor = remaining > 3 ? "#00ff88" : remaining > 1 ? "#ffaa00" : "#ff3355";
		CanvasUtils.drawBadge(ctx, `${remaining} / 6 LIVES REMAINING`, 470, 240, 220, 32, "rgba(0,0,0,0.3)", livesColor, "bold 13px sans-serif");
		const wrongLetters = guessedLetters.filter((l) => !displayWord.includes(l));
		if (wrongLetters.length > 0) {
			ctx.fillStyle = "#ff5555";
			ctx.font = "bold 15px sans-serif";
			ctx.fillText("INCORRECT GUESSES", rightCenterX, 310);
			CanvasUtils.fillRoundedRect(ctx, 420, 335, 320, 54, 12, "rgba(0, 0, 0, 0.35)");
			ctx.fillStyle = "#ff8899";
			ctx.font = "bold 24px monospace";
			ctx.fillText(wrongLetters.join("  "), rightCenterX, 363);
		}
		if (gameOver) {
			ctx.save();
			ctx.fillStyle = "rgba(10, 12, 16, 0.8)";
			ctx.fillRect(0, 0, 800, 500);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (won) {
				ctx.shadowColor = "#00ff88";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#00ff88";
				ctx.font = "bold 64px sans-serif";
				ctx.fillText("VICTORY!", 400, 210);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "24px sans-serif";
				ctx.fillText(`Word: ${fullWord || displayWord.replace(/ /g, "")}`, 400, 280);
			} else {
				ctx.shadowColor = "#ff3355";
				ctx.shadowBlur = 24;
				ctx.fillStyle = "#ff3355";
				ctx.font = "bold 64px sans-serif";
				ctx.fillText("GAME OVER", 400, 210);
				ctx.shadowBlur = 0;
				ctx.fillStyle = "#ffffff";
				ctx.font = "24px sans-serif";
				ctx.fillText(`The word was: ${fullWord || displayWord.replace(/ /g, "")}`, 400, 280);
			}
			ctx.restore();
		}
		return canvas.toBuffer("image/png");
	}
	static drawWoodenBeam(ctx, x1, y1, x2, y2, width) {
		ctx.save();
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.strokeStyle = "#5d4037";
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	}
	static drawLimb(ctx, x1, y1, x2, y2, width, color) {
		ctx.save();
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	}
	static drawX(ctx, cx, cy, size) {
		ctx.beginPath();
		ctx.moveTo(cx - size, cy - size);
		ctx.lineTo(cx + size, cy + size);
		ctx.moveTo(cx + size, cy - size);
		ctx.lineTo(cx - size, cy + size);
		ctx.stroke();
	}
};
// src/games/Hangman.ts
var Hangman = class extends BaseGame {
	targetWord = "";
	category = "General";
	displayWord = "";
	guessedLetters = [];
	wrongGuesses = 0;
	maxMistakes = 6;
	btnPrefix;
	modalId;
	gameTitle;
	quitButtonLabel;
	constructor(manager, options) {
		super(manager, options, "hangman");
		this.btnPrefix = getRandomString(6, "hang_");
		this.modalId = `${this.btnPrefix}modal`;
		this.gameTitle = options.embed?.title || "Hangman";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.quitButtonLabel = options.quitButton || "Quit Game";
		this.maxMistakes = options.maxMistakes ?? 6;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 18e4;
	}
	async start() {
		if (this.options.word) {
			this.targetWord = this.options.word.toUpperCase().trim();
			this.category = this.options.category || "Custom";
		} else {
			const selected = getRandomHangmanWord(this.options.category);
			this.targetWord = selected.word;
			this.category = selected.category;
		}
		this.updateDisplayWord();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const loadingContainer = this.createGameContainer("loading");
		await this.ctx.sendInitial({
			components: [loadingContainer],
			flags: MessageFlags.IsComponentsV2
		});
		const buffer = await this.renderImage();
		const attachment = new AttachmentBuilder(buffer, { name: "hangman-board.png" });
		const activeContainer = this.createGameContainer("active", { image: "hangman-board.png" });
		await this.ctx.edit({
			components: [activeContainer],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	updateDisplayWord() {
		this.displayWord = this.targetWord.split("").map((char) => {
			if (!/[A-Z]/.test(char)) return char;
			return this.guessedLetters.includes(char) ? char : "_";
		}).join(" ");
	}
	async renderImage(gameOver = false, won = false) {
		const avatar = this.ctx.user.displayAvatarURL({
			extension: "png",
			size: 128
		});
		return await RenderHangman.renderCard(this.wrongGuesses, this.displayWord, this.guessedLetters, this.ctx.user.username, avatar, gameOver, won, this.targetWord);
	}
	async onInteraction(interaction) {
		if (interaction.isButton()) {
			if (interaction.message.id !== this.ctx.gameMessage?.id) return;
			if (!this.isAuthorized(interaction)) return;
			const customId = interaction.customId;
			if (!customId.startsWith(this.btnPrefix)) return;
			const action = customId.replace(this.btnPrefix, "");
			if (action === "quit") {
				await interaction.deferUpdate().catch(() => {});
				await this.endGame("quit");
				return;
			}
			if (action === "guess") {
				const modal = new ModalBuilder().setCustomId(this.modalId).setTitle("Hangman Guess");
				const textInput = new TextInputBuilder().setCustomId("guess_input").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(this.targetWord.length).setRequired(true).setPlaceholder("e.g. A or the full word");
				const label = new LabelBuilder().setLabel("Enter a single letter or full word guess").setTextInputComponent(textInput);
				modal.addLabelComponents(label);
				await interaction.showModal(modal).catch(() => {});
				return;
			}
		}
		if (interaction.isModalSubmit()) {
			if (interaction.customId !== this.modalId) return;
			if (interaction.user.id !== this.ctx.userId) return;
			await interaction.deferUpdate().catch(() => {});
			const input = interaction.fields.getTextInputValue("guess_input").toUpperCase().trim();
			await this.processGuess(input);
		}
	}
	async onMessage(message) {
		if (message.channelId !== this.ctx.channel.id) return;
		if (message.author.id !== this.ctx.userId) return;
		const content = message.content.toUpperCase().trim();
		if (!content || content.startsWith("/") || content.startsWith("!")) return;
		if (content.length === 1 || content.length === this.targetWord.length) {
			if (message.deletable) await message.delete().catch(() => {});
			await this.processGuess(content);
		}
	}
	async processGuess(guess) {
		this.resetTimeout(() => this.endGame("timeout"));
		if (guess.length > 1) {
			if (guess === this.targetWord) {
				this.guessedLetters = Array.from(/* @__PURE__ */ new Set([...this.guessedLetters, ...this.targetWord.split("")]));
				this.updateDisplayWord();
				await this.endGame("won");
			} else {
				this.wrongGuesses += 1;
				if (this.wrongGuesses >= this.maxMistakes) await this.endGame("lost");
				else await this.refreshBoard(`❌ **${guess}** is not the word! (-1 Life)`);
			}
			return;
		}
		const letter = guess;
		if (this.guessedLetters.includes(letter)) {
			await this.refreshBoard(`⚠️ Letter **${letter}** has already been guessed!`);
			return;
		}
		this.guessedLetters.push(letter);
		if (this.targetWord.includes(letter)) {
			this.updateDisplayWord();
			if (this.targetWord.split("").every((c) => !/[A-Z]/.test(c) || this.guessedLetters.includes(c))) await this.endGame("won");
			else await this.refreshBoard(`✅ Good guess! Letter **${letter}** is in the word!`);
		} else {
			this.wrongGuesses += 1;
			if (this.wrongGuesses >= this.maxMistakes) await this.endGame("lost");
			else await this.refreshBoard(`❌ Letter **${letter}** is not in the word! (-1 Life)`);
		}
	}
	async refreshBoard(statusNotice) {
		const buffer = await this.renderImage();
		const attachment = new AttachmentBuilder(buffer, { name: "hangman-board.png" });
		const container = this.createGameContainer("active", {
			image: "hangman-board.png",
			statusNotice
		});
		await this.ctx.edit({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
	}
	async endGame(state, errorMsg) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state, this.wrongGuesses);
		const isWon = state === "won";
		const isOver = state === "lost" || state === "quit" || state === "timeout";
		const buffer = await this.renderImage(isOver, isWon);
		const attachment = new AttachmentBuilder(buffer, { name: "hangman-board.png" });
		const container = this.createGameContainer(state, {
			word: this.targetWord,
			image: "hangman-board.png",
			error: errorMsg
		});
		await this.ctx.edit({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, details) {
		const stateColors = {
			loading: this.defaultColor,
			active: this.defaultColor,
			won: 5763719,
			lost: 15548997,
			quit: 15548997,
			timeout: 15548997,
			error: 16711680
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const revealedWord = details?.word || this.targetWord;
		switch (state) {
			case "loading":
				content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 Starting game...`;
				break;
			case "active":
				content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> **Category:** \`${this.category}\`\n> Click **Guess Letter / Word** or type your guess directly in the chat!\n${details?.statusNotice ? `\n> ${details.statusNotice}` : ""}`;
				break;
			case "won":
				content = this.options.states?.won ? this.options.states.won.replace("{{word}}", revealedWord) : `## 🎉 Victory!\n> You guessed the word: **${revealedWord}**!`;
				break;
			case "lost":
				content = this.options.states?.lost ? this.options.states.lost.replace("{{word}}", revealedWord) : `## 💀 Game Over\n> The word was: **${revealedWord}**`;
				break;
			case "quit":
				content = this.options.states?.quit ? this.options.states.quit.replace("{{word}}", revealedWord) : `## 🛑 Game Stopped\n> You quit the game. The word was **${revealedWord}**`;
				break;
			case "timeout":
				content = this.options.states?.timeout ? this.options.states.timeout.replace("{{word}}", revealedWord) : `## ⏱️ Time's Up\n> Session expired. The word was: **${revealedWord}**`;
				break;
			case "error": content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown error.") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (details?.image) {
			const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
			container.addMediaGalleryComponents(gallery);
		}
		if (state === "active") {
			const guessBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}guess`).setLabel("Guess Letter / Word").setEmoji("💡").setStyle(ButtonStyle.Primary);
			const quitBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}quit`).setLabel(this.quitButtonLabel).setEmoji("🛑").setStyle(ButtonStyle.Danger);
			const row = new ActionRowBuilder().addComponents(guessBtn, quitBtn);
			container.addActionRowComponents(row);
		}
		return container;
	}
};
// src/data/trivia.ts
const TRIVIA_FACTS = [
	{
		statement: "Bananas are berries, but strawberries are not.",
		isTrue: true,
		explanation: "Botanically, a berry has seeds inside a fleshy pericarp. Bananas qualify, but strawberry seeds are achenes on the exterior."
	},
	{
		statement: "Goldfish only have a memory span of three seconds.",
		isTrue: false,
		explanation: "Scientific research has proven goldfish have a memory span of at least several months and can be trained."
	},
	{
		statement: "Lightning never strikes the same place twice.",
		isTrue: false,
		explanation: "Lightning frequently strikes the exact same place repeatedly; the Empire State Building is struck dozens of times annually."
	},
	{
		statement: "Humans share approximately 50% of their DNA with bananas.",
		isTrue: true,
		explanation: "Many fundamental cellular processes and housekeeping genes are conserved across living organisms."
	},
	{
		statement: "The Great Wall of China is visible from the Moon with the naked human eye.",
		isTrue: false,
		explanation: "Astronauts have confirmed that no human structure is visible from the Moon without optical magnification."
	},
	{
		statement: "Water drains in different directions in the Northern and Southern Hemispheres due to the Coriolis effect.",
		isTrue: false,
		explanation: "The Coriolis effect operates on large atmospheric scales. Household sink drainage is dictated by basin shape and plumbing."
	},
	{
		statement: "An octopus has three hearts and blue blood.",
		isTrue: true,
		explanation: "Two branchial hearts pump blood through the gills, one systemic heart pumps to the body, and copper-based hemocyanin turns blood blue."
	},
	{
		statement: "Wombat feces are cube-shaped.",
		isTrue: true,
		explanation: "The unique elasticity of a wombat's intestinal walls shapes feces into cubes, preventing them from rolling away."
	},
	{
		statement: "Sharks are immune to all forms of cancer.",
		isTrue: false,
		explanation: "This is a widespread medical myth. Sharks do contract cancer, including tumors in their cartilage."
	},
	{
		statement: "Honey never spoils, even after thousands of years.",
		isTrue: true,
		explanation: "Low moisture content and high acidity prevent bacteria and microorganisms from surviving in raw honey."
	},
	{
		statement: "Hot water always freezes faster than cold water in all conditions.",
		isTrue: false,
		explanation: "The Mpemba effect only occurs under very specific, controlled thermodynamic conditions and is not universal."
	},
	{
		statement: "There are more trees on planet Earth than stars in the Milky Way galaxy.",
		isTrue: true,
		explanation: "Earth has roughly 3 trillion trees, while the Milky Way is estimated to contain 100 to 400 billion stars."
	},
	{
		statement: "Oxford University is older than the Aztec Empire.",
		isTrue: true,
		explanation: "Teaching at Oxford began around 1096, whereas the Aztec civilization was founded in 1325 with Tenochtitlan."
	},
	{
		statement: "Mount Everest is the closest point on Earth to outer space.",
		isTrue: false,
		explanation: "Because Earth bulges at the equator, Mount Chimborazo in Ecuador is the farthest point from Earth's center."
	},
	{
		statement: "A day on Venus is longer than a year on Venus.",
		isTrue: true,
		explanation: "Venus takes 243 Earth days to rotate once on its axis, but only 225 Earth days to complete an orbit around the Sun."
	}
];
const NEVER_HAVE_I_EVER_PROMPTS = [
	"Never have I ever pretended to be sick to avoid attending an event.",
	"Never have I ever sent a message to the wrong Discord server or person.",
	"Never have I ever stayed up past 4:00 AM playing a video game.",
	"Never have I ever re-gifted a present that someone gave to me.",
	"Never have I ever eaten food that fell on the floor after the 5-second rule.",
	"Never have I ever sang loudly in the shower thinking nobody could hear me.",
	"Never have I ever accidentally liked a years-old post while stalking someone on social media.",
	"Never have I ever forgotten someone's name immediately after they introduced themselves.",
	"Never have I ever spent money on an in-game cosmetic item and immediately regretted it.",
	"Never have I ever laughed so hard that drinks came out of my nose.",
	"Never have I ever walked into a glass door or window thinking it was open.",
	"Never have I ever blamed a pet for something that I actually broke or did.",
	"Never have I ever binge-watched an entire season of a television show in a single day.",
	"Never have I ever tried to plug in a USB drive upside down three times in a row.",
	"Never have I ever rage-quit a multiplayer match and closed Discord in defeat."
];
function getRandomTriviaFact() {
	return TRIVIA_FACTS[Math.floor(Math.random() * TRIVIA_FACTS.length)];
}
function getRandomNHIE() {
	return NEVER_HAVE_I_EVER_PROMPTS[Math.floor(Math.random() * NEVER_HAVE_I_EVER_PROMPTS.length)];
}
// src/games/LieSwatter.ts
var LieSwatter = class extends BaseGame {
	fact;
	btnPrefix;
	gameTitle;
	labelTrue;
	labelLie;
	constructor(manager, options) {
		super(manager, options, "lieswatter");
		this.btnPrefix = getRandomString(6, "ls_");
		this.gameTitle = options.embed?.title || "Lie Swatter";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.labelTrue = options.buttons?.true || "Truth";
		this.labelLie = options.buttons?.lie || "Lie";
		if (options.statement) this.fact = {
			statement: options.statement,
			isTrue: options.isTrue ?? true,
			explanation: options.explanation || "No explanation provided."
		};
		else this.fact = getRandomTriviaFact();
		this.defaultTimeout = options.time || manager?.defaultTimeout || 45e3;
	}
	async start() {
		this.startTime = Date.now();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		await interaction.deferUpdate().catch(() => {});
		const isCorrect = customId.replace(this.btnPrefix, "") === "true" === this.fact.isTrue;
		await this.endGame(isCorrect ? "won" : "lost");
	}
	async endGame(state) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state);
		const elapsed = formatTime(Date.now() - this.startTime);
		const container = this.createGameContainer(state, { timeTaken: elapsed });
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, data) {
		const stateColors = {
			active: this.defaultColor,
			won: 5763719,
			lost: 15548997,
			timeout: 15548997
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const correctLabel = this.fact.isTrue ? this.labelTrue : this.labelLie;
		switch (state) {
			case "active":
				content = `## ${this.gameTitle}\n> "${this.fact.statement}"\n\nIs this statement a **${this.labelTrue}** or a **${this.labelLie}**?`;
				break;
			case "won":
				const winText = this.options.winMessage ? this.options.winMessage.replace("{{answer}}", correctLabel).replace("{{time}}", data?.timeTaken || "0s") : `🏆 Spot on! It was indeed **${correctLabel}**! Answered in **${data?.timeTaken || "0s"}**.`;
				content = `## ${this.gameTitle}\n> ${winText}\n\n📖 **Fact:** ${this.fact.explanation}`;
				break;
			case "lost":
				const loseText = this.options.loseMessage ? this.options.loseMessage.replace("{{answer}}", correctLabel) : `💀 Swatted! It was actually **${correctLabel}**.`;
				content = `## ${this.gameTitle}\n> ${loseText}\n\n📖 **Fact:** ${this.fact.explanation}`;
				break;
			case "timeout": content = `## ${this.gameTitle}\n> ⏱️ Time's up! It was actually **${correctLabel}**.\n\n📖 **Fact:** ${this.fact.explanation}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		const isResult = state !== "active";
		const trueBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}true`).setLabel(this.labelTrue).setEmoji("✅").setStyle(isResult ? this.fact.isTrue ? ButtonStyle.Success : ButtonStyle.Secondary : ButtonStyle.Success).setDisabled(isResult);
		const lieBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}false`).setLabel(this.labelLie).setEmoji("❌").setStyle(isResult ? !this.fact.isTrue ? ButtonStyle.Success : ButtonStyle.Secondary : ButtonStyle.Danger).setDisabled(isResult);
		const row = new ActionRowBuilder().addComponents(trueBtn, lieBtn);
		container.addActionRowComponents(row);
		return container;
	}
};
// src/games/NeverHaveIEver.ts
var NeverHaveIEver = class extends BaseGame {
	statement = "";
	haveVoters = /* @__PURE__ */ new Set();
	neverVoters = /* @__PURE__ */ new Set();
	btnPrefix;
	gameTitle;
	constructor(manager, options) {
		super(manager, options, "nhie");
		this.btnPrefix = getRandomString(6, "nhie_");
		this.gameTitle = options.embed?.title || "Never Have I Ever";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.statement = options.statement || getRandomNHIE();
		this.defaultTimeout = options.time || manager?.defaultTimeout || 9e4;
	}
	async start() {
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer(false);
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame());
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		const action = customId.replace(this.btnPrefix, "");
		if (action === "end") {
			if (!this.isAuthorized(interaction)) return;
			await interaction.deferUpdate().catch(() => {});
			await this.endGame();
			return;
		}
		await interaction.deferUpdate().catch(() => {});
		this.resetTimeout(() => this.endGame());
		const voterId = interaction.user.id;
		if (action === "have") {
			this.haveVoters.add(voterId);
			this.neverVoters.delete(voterId);
		} else if (action === "never") {
			this.neverVoters.add(voterId);
			this.haveVoters.delete(voterId);
		}
		const container = this.createGameContainer(false);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	async endGame() {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd("ended", this.haveVoters.size + this.neverVoters.size);
		const container = this.createGameContainer(true);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(isFinal) {
		const container = this.createContainer(isFinal ? 5763719 : this.defaultColor);
		const total = this.haveVoters.size + this.neverVoters.size;
		const havePct = total > 0 ? Math.round(this.haveVoters.size / total * 100) : 0;
		const neverPct = total > 0 ? Math.round(this.neverVoters.size / total * 100) : 0;
		let content = `## ${this.gameTitle}\n> "${this.statement}"\n\n`;
		if (total > 0) {
			content += `**Live Tally (${total} response${total === 1 ? "" : "s"}):**\n`;
			content += `🙋 **I Have:** \`${this.haveVoters.size}\` (${havePct}%)\n`;
			content += `🙅 **Never:** \`${this.neverVoters.size}\` (${neverPct}%)\n`;
			if (isFinal) {
				if (this.haveVoters.size > 0) {
					const names = Array.from(this.haveVoters).map((id) => `<@${id}>`).join(", ");
					content += `\n**Have Done It:** ${names}`;
				}
				if (this.neverVoters.size > 0) {
					const names = Array.from(this.neverVoters).map((id) => `<@${id}>`).join(", ");
					content += `\n**Never Done It:** ${names}`;
				}
			}
		} else content += `> Click a button below to cast your confession!`;
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (!isFinal) {
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}have`).setLabel(this.options.buttons?.optionA || "I Have").setEmoji("🙋").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`${this.btnPrefix}never`).setLabel(this.options.buttons?.optionB || "Never").setEmoji("🙅").setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId(`${this.btnPrefix}end`).setLabel("Finish").setEmoji("🏁").setStyle(ButtonStyle.Secondary));
			container.addActionRowComponents(row);
		}
		return container;
	}
};
// src/games/QuickClick.ts
var QuickClick = class extends BaseGame {
	targetIndex = 0;
	btnPrefix;
	isWaiting = true;
	waitTimer = null;
	emoji;
	gameTitle;
	buttonCount;
	minDelay;
	maxDelay;
	constructor(manager, options) {
		super(manager, options, "quickclick");
		this.btnPrefix = getRandomString(6, "qc_");
		this.emoji = options.emoji || "⚡";
		this.gameTitle = options.embed?.title || "Quick Click";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.buttonCount = clamp(options.buttonCount ?? 20, 1, 25);
		this.minDelay = options.minDelay ?? 2e3;
		this.maxDelay = options.maxDelay ?? 6e3;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 1e4;
	}
	async start() {
		this.targetIndex = Math.floor(Math.random() * this.buttonCount);
		this.isWaiting = true;
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("waiting");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		const delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
		this.waitTimer = setTimeout(() => {
			this.triggerActiveState();
		}, delay);
	}
	async triggerActiveState() {
		if (!this.isActive) return;
		const container = this.createGameContainer("active");
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.isWaiting = false;
		this.startTime = Date.now();
		this.resetTimeout(() => this.endGame("timeout"));
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		if (this.isWaiting) {
			await interaction.deferUpdate().catch(() => {});
			await this.endGame("early");
			return;
		}
		if (parseInt(customId.replace(this.btnPrefix, ""), 10) === this.targetIndex) {
			const clickTimestamp = interaction.createdTimestamp || Date.now();
			const rawDelta = Math.max(1, clickTimestamp - this.startTime);
			const wsPing = interaction.client?.ws?.ping ?? 0;
			const transitEstimate = wsPing > 0 ? Math.round(wsPing / 2) : 0;
			const reactionTimeMs = Math.max(1, rawDelta - transitEstimate);
			await interaction.deferUpdate().catch(() => {});
			await this.endGame("won", reactionTimeMs);
		}
	}
	async endGame(reason, reactionMs) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		if (this.waitTimer) {
			clearTimeout(this.waitTimer);
			this.waitTimer = null;
		}
		this.emitEnd(reason, reactionMs ? Math.round(reactionMs) : 0);
		const container = this.createGameContainer(reason, reactionMs);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	destroy() {
		super.destroy();
		if (this.waitTimer) {
			clearTimeout(this.waitTimer);
			this.waitTimer = null;
		}
	}
	createGameContainer(state, reactionMs) {
		const stateColors = {
			waiting: this.defaultColor,
			active: this.defaultColor,
			won: 5763719,
			early: 15548997,
			timeout: 15548997
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		switch (state) {
			case "waiting":
				content = `## ${this.gameTitle}\n> ⏳ ${this.options.waitMessage || `Get ready! The **${this.emoji}** button will appear randomly...`}`;
				break;
			case "active":
				content = `## ${this.gameTitle}\n> 🔥 **CLICK NOW!** Find and click the **${this.emoji}** button as fast as you can!`;
				break;
			case "won":
				const sec = ((reactionMs || 0) / 1e3).toFixed(3);
				content = `## ⚡ Blazing Fast Reaction!\n> 🏆 **GG <@${this.ctx.userId}>!**\n> You clicked the button in **${reactionMs}ms** (\`${sec}s\`)!\n> *(Network latency compensated)*`;
				break;
			case "early":
				content = "## ❌ Too Early!\n> You clicked before the button appeared! Patience is a virtue.";
				break;
			case "timeout": content = `## ⏱️ Time's Up!\n> ${this.options.loseMessage || "Time expired! You weren't fast enough."}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		const allDisabled = state !== "active";
		const showTarget = state === "active" || state === "won";
		let btnIndex = 0;
		for (let r = 0; r < 5; r++) {
			const row = new ActionRowBuilder();
			let addedInRow = 0;
			for (let c = 0; c < 5; c++) {
				if (btnIndex >= this.buttonCount) break;
				const isTarget = btnIndex === this.targetIndex;
				const btn = new ButtonBuilder().setCustomId(`${this.btnPrefix}${btnIndex}`).setLabel(isTarget && showTarget ? this.emoji : "​").setStyle(isTarget && showTarget ? ButtonStyle.Success : ButtonStyle.Secondary).setDisabled(allDisabled ? true : !isTarget);
				row.addComponents(btn);
				btnIndex++;
				addedInRow++;
			}
			if (addedInRow > 0) container.addActionRowComponents(row);
		}
		return container;
	}
};
// src/ai/RPSPredictor.ts
/**
* Rock Paper Scissors Psychological AI Engine
* Uses win-stay / lose-shift psychological heuristic tracking
* to intelligently counter human move habits.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var RPSPredictor = class {
	static BEATS = {
		rock: "scissors",
		paper: "rock",
		scissors: "paper"
	};
	static COUNTERS = {
		rock: "paper",
		paper: "scissors",
		scissors: "rock"
	};
	/**
	* Predicts the player's next move and returns the best counter.
	* @param playerHistory Array of moves the player has previously made.
	* @param lastPlayerOutcome Whether the player won, lost, or tied in the previous round.
	* @param difficulty "easy" (random), "medium" (frequency counter), "hard" (heuristic predictor).
	*/
	static getCounterMove(playerHistory = [], lastPlayerOutcome, difficulty = "hard") {
		const allMoves = [
			"rock",
			"paper",
			"scissors"
		];
		if (difficulty === "easy" || playerHistory.length === 0) return allMoves[Math.floor(Math.random() * allMoves.length)];
		if (difficulty === "medium") {
			const counts = {
				rock: 0,
				paper: 0,
				scissors: 0
			};
			for (const m of playerHistory) counts[m]++;
			let mostPlayed = "rock";
			for (const m of allMoves) if (counts[m] > counts[mostPlayed]) mostPlayed = m;
			return this.COUNTERS[mostPlayed];
		}
		const lastMove = playerHistory[playerHistory.length - 1];
		if (lastPlayerOutcome === "win") return this.COUNTERS[lastMove];
		else if (lastPlayerOutcome === "lose") {
			const likelyMove = this.COUNTERS[lastMove];
			return this.COUNTERS[likelyMove];
		}
		return this.COUNTERS[lastMove];
	}
};
// src/games/RockPaperScissors.ts
var RockPaperScissors = class extends BaseGame {
	opponentUser = null;
	isVsBot = true;
	p1Move = null;
	p2Move = null;
	btnPrefix;
	gameTitle;
	difficulty = "hard";
	constructor(manager, options) {
		super(manager, options, "rps");
		this.btnPrefix = getRandomString(6, "rps_");
		this.gameTitle = options.embed?.title || "Rock Paper Scissors";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.difficulty = options.difficulty || "hard";
		if (options.opponent) {
			this.opponentUser = options.opponent instanceof GuildMember ? options.opponent.user : options.opponent;
			this.isVsBot = this.opponentUser.bot || this.opponentUser.id === this.ctx.client.user?.id;
		}
		this.defaultTimeout = options.time || manager?.defaultTimeout || 45e3;
	}
	async start() {
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		const move = customId.replace(this.btnPrefix, "");
		const userId = interaction.user.id;
		if (this.isVsBot || !this.opponentUser) {
			if (userId !== this.ctx.userId) {
				this.isAuthorized(interaction);
				return;
			}
			await interaction.deferUpdate().catch(() => {});
			this.p1Move = move;
			this.p2Move = RPSPredictor.getCounterMove([move], void 0, this.difficulty);
			await this.endGame("result");
		} else {
			if (userId !== this.ctx.userId && userId !== this.opponentUser.id) {
				ContextAdapter.replyEphemeral(interaction, "You are not participating in this match!");
				return;
			}
			if (userId === this.ctx.userId) {
				if (this.p1Move) {
					ContextAdapter.replyEphemeral(interaction, "You already picked your move!");
					return;
				}
				this.p1Move = move;
				await ContextAdapter.replyEphemeral(interaction, `✅ You selected **${move.toUpperCase()}**!`);
			} else if (userId === this.opponentUser.id) {
				if (this.p2Move) {
					ContextAdapter.replyEphemeral(interaction, "You already picked your move!");
					return;
				}
				this.p2Move = move;
				await ContextAdapter.replyEphemeral(interaction, `✅ You selected **${move.toUpperCase()}**!`);
			}
			this.resetTimeout(() => this.endGame("timeout"));
			if (this.p1Move && this.p2Move) await this.endGame("result");
			else {
				const waitingFor = !this.p1Move ? `<@${this.ctx.userId}>` : `<@${this.opponentUser.id}>`;
				const container = this.createGameContainer("waiting", { waitingFor });
				await this.ctx.edit({
					components: [container],
					flags: MessageFlags.IsComponentsV2
				});
			}
		}
	}
	async endGame(state) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		let outcome = state;
		if (state === "result") {
			const m1 = this.p1Move || "rock";
			const m2 = this.p2Move || "rock";
			if (m1 === m2) outcome = "tie";
			else if (m1 === "rock" && m2 === "scissors" || m1 === "paper" && m2 === "rock" || m1 === "scissors" && m2 === "paper") outcome = "won";
			else outcome = "lost";
		}
		this.emitEnd(outcome, outcome === "won" ? 1 : 0, {
			p1Move: this.p1Move,
			p2Move: this.p2Move
		});
		const container = this.createGameContainer(state);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, details) {
		const stateColors = {
			active: this.defaultColor,
			waiting: 16705372,
			result: 5763719,
			timeout: 15548997
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const emojis = {
			rock: "🪨 Rock",
			paper: "📄 Paper",
			scissors: "✂️ Scissors"
		};
		switch (state) {
			case "active":
				if (this.isVsBot || !this.opponentUser) content = `## ${this.gameTitle}\n> You are playing against the **Bot**!\n> Select your move below:`;
				else content = `## ${this.gameTitle}\n> ⚔️ <@${this.ctx.userId}> vs <@${this.opponentUser.id}>!\n> Both players, choose your move in secret!`;
				break;
			case "waiting":
				content = `## ${this.gameTitle}\n> One player locked in their move!\n> ⏳ Waiting for ${details?.waitingFor}...`;
				break;
			case "result":
				const m1 = this.p1Move || "rock";
				const m2 = this.p2Move || "rock";
				let winnerText = "";
				if (m1 === m2) winnerText = "🤝 **It's a TIE!**";
				else if (m1 === "rock" && m2 === "scissors" || m1 === "paper" && m2 === "rock" || m1 === "scissors" && m2 === "paper") winnerText = `🏆 **<@${this.ctx.userId}> WINS!**`;
				else winnerText = `🏆 **${this.opponentUser ? `<@${this.opponentUser.id}>` : "🤖 The Bot"} WINS!**`;
				const p2Label = this.opponentUser ? `<@${this.opponentUser.id}>` : "🤖 Bot";
				content = `## ${this.gameTitle} - Results\n> ${winnerText}\n\n**Choices:**\n<@${this.ctx.userId}>: ${emojis[m1]}\n${p2Label}: ${emojis[m2]}`;
				break;
			case "timeout": content = `## ${this.gameTitle}\n> ⏱️ Game session expired. Moves were not submitted in time.`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (state === "active" || state === "waiting") {
			const rock = new ButtonBuilder().setCustomId(`${this.btnPrefix}rock`).setLabel(this.options.buttons?.rock || "Rock").setEmoji("🪨").setStyle(ButtonStyle.Primary);
			const paper = new ButtonBuilder().setCustomId(`${this.btnPrefix}paper`).setLabel(this.options.buttons?.paper || "Paper").setEmoji("📄").setStyle(ButtonStyle.Primary);
			const scissors = new ButtonBuilder().setCustomId(`${this.btnPrefix}scissors`).setLabel(this.options.buttons?.scissors || "Scissors").setEmoji("✂️").setStyle(ButtonStyle.Primary);
			const row = new ActionRowBuilder().addComponents(rock, paper, scissors);
			container.addActionRowComponents(row);
		}
		return container;
	}
};
// src/games/ShuffleGuess.ts
var ShuffleGuess = class extends BaseGame {
	targetWord = "";
	scrambled = "";
	btnPrefix;
	gameTitle;
	constructor(manager, options) {
		super(manager, options, "shuffleguess");
		this.btnPrefix = getRandomString(6, "sg_");
		this.targetWord = (options.word || getRandomWord()).toUpperCase().trim();
		this.scrambled = this.getValidScramble(this.targetWord);
		this.gameTitle = options.embed?.title || "Shuffle Guess";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
	}
	async start() {
		this.startTime = Date.now();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	getValidScramble(word) {
		let s = shuffleString(word);
		let attempts = 0;
		while (s === word && word.length > 2 && attempts < 10) {
			s = shuffleString(word);
			attempts++;
		}
		return s;
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		const action = customId.replace(this.btnPrefix, "");
		await interaction.deferUpdate().catch(() => {});
		this.resetTimeout(() => this.endGame("timeout"));
		if (action === "quit") {
			await this.endGame("quit");
			return;
		}
		if (action === "reshuffle") {
			this.scrambled = this.getValidScramble(this.targetWord);
			const container = this.createGameContainer("reshuffled", { feedback: "🔄 *Letters reshuffled!*" });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
		}
	}
	async onMessage(message) {
		if (!this.isActive) return;
		if (message.channelId !== this.ctx.channel.id) return;
		if (message.author.id !== this.ctx.userId) return;
		const guess = message.content.toUpperCase().trim();
		if (guess.startsWith("/") || guess.startsWith("!")) return;
		if (message.deletable) await message.delete().catch(() => {});
		this.resetTimeout(() => this.endGame("timeout"));
		if (guess === this.targetWord) await this.endGame("won");
		else {
			const container = this.createGameContainer("wrong", { feedback: `❌ **${guess}** is not correct! Keep trying!` });
			await this.ctx.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
		}
	}
	async endGame(state) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state);
		const elapsed = formatTime(Date.now() - this.startTime);
		const container = this.createGameContainer(state, { timeTaken: elapsed });
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, data) {
		const stateColors = {
			active: this.defaultColor,
			reshuffled: this.defaultColor,
			wrong: 15548997,
			won: 5763719,
			quit: 15548997,
			timeout: 15548997
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const formatted = this.scrambled.split("").join("  ");
		switch (state) {
			case "active":
			case "reshuffled":
			case "wrong":
				content = `## ${this.gameTitle}\n`;
				if (data?.feedback) content += `> ${data.feedback}\n\n`;
				content += `> Unscramble the letters below and type your guess in chat!\n\n\`\`\`fix\n${formatted}\n\`\`\`\n**Word Length:** \`${this.targetWord.length} letters\``;
				break;
			case "won":
				content = `## 🎉 Word Solved!\n> 🏆 **GG <@${this.ctx.userId}>!**\n> You unscrambled **${this.targetWord}** in **${data?.timeTaken || "0s"}**!`;
				break;
			case "quit":
				content = `## 🛑 Game Over\n> You gave up! The secret word was **${this.targetWord}**.`;
				break;
			case "timeout": content = `## ⏱️ Time's Up\n> Session expired. The secret word was **${this.targetWord}**.`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (state === "active" || state === "reshuffled" || state === "wrong") {
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}reshuffle`).setLabel(this.options.buttons?.reshuffle || "Reshuffle").setEmoji("🔀").setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`${this.btnPrefix}quit`).setLabel(this.options.buttons?.cancel || "Give Up").setEmoji("🛑").setStyle(ButtonStyle.Danger));
			container.addActionRowComponents(row);
		}
		return container;
	}
};
// src/canvas/RenderSnake.ts
const CANVAS_SIZE = 800;
const GRID_CONTAINER = 560;
const GRID_Y_START = 180;
const COLORS = {
	bgTop: "#15181e",
	bgBot: "#21252d",
	boardBg: "#0b0d10",
	snakeHead: "#00ff88",
	snakeBody: "#00b862",
	snakeBodyAlt: "#00a155",
	food: "#ff3355",
	gridLines: "#1b1e25"
};
var RenderSnake = class {
	static async renderBoard(snake, food, direction, score, gridSize, username, avatarUrl, isGameOver = false, overlayTitle) {
		const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE);
		const ctx = canvas.getContext("2d");
		const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
		bgGrad.addColorStop(0, COLORS.bgTop);
		bgGrad.addColorStop(1, COLORS.bgBot);
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
		await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, COLORS.snakeHead, 4);
		CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 26px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		const truncatedName = username.length > 14 ? username.slice(0, 13) + "…" : username;
		ctx.fillText(truncatedName, 146, 75);
		const scoreBoxW = 200;
		const scoreBoxX = 560;
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#101217");
		CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#191d24");
		ctx.fillStyle = COLORS.snakeHead;
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("SCORE", 660, 45);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 34px sans-serif";
		ctx.fillText(String(score), 660, 70);
		const cellSize = GRID_CONTAINER / gridSize;
		const gridX = 120;
		CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_CONTAINER, GRID_CONTAINER, 16, COLORS.boardBg);
		ctx.strokeStyle = COLORS.gridLines;
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let i = 1; i < gridSize; i++) {
			ctx.moveTo(gridX + i * cellSize, GRID_Y_START);
			ctx.lineTo(gridX + i * cellSize, 740);
			ctx.moveTo(gridX, GRID_Y_START + i * cellSize);
			ctx.lineTo(680, GRID_Y_START + i * cellSize);
		}
		ctx.stroke();
		const foodX = gridX + food.x * cellSize + cellSize / 2;
		const foodY = GRID_Y_START + food.y * cellSize + cellSize / 2;
		ctx.save();
		ctx.fillStyle = COLORS.food;
		ctx.shadowColor = COLORS.food;
		ctx.shadowBlur = 16;
		ctx.beginPath();
		ctx.arc(foodX, foodY, cellSize / 2.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		snake.forEach((part, index) => {
			const px = gridX + part.x * cellSize;
			const py = GRID_Y_START + part.y * cellSize;
			const pad = 1.5;
			if (index === 0) {
				ctx.save();
				ctx.shadowColor = COLORS.snakeHead;
				ctx.shadowBlur = 12;
				CanvasUtils.fillRoundedRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, 5, COLORS.snakeHead);
				ctx.restore();
				this.drawEyes(ctx, px, py, cellSize, direction);
			} else {
				const bodyColor = index % 2 === 0 ? COLORS.snakeBody : COLORS.snakeBodyAlt;
				CanvasUtils.fillRoundedRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, 4, bodyColor);
			}
		});
		if (isGameOver) {
			ctx.save();
			CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_CONTAINER, GRID_CONTAINER, 16, "rgba(10, 12, 16, 0.82)");
			ctx.shadowColor = "#ff3355";
			ctx.shadowBlur = 24;
			ctx.fillStyle = "#ff3355";
			ctx.font = "bold 68px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(overlayTitle || "GAME OVER", CANVAS_SIZE / 2, 440);
			ctx.shadowBlur = 0;
			ctx.fillStyle = "#ffffff";
			ctx.font = "26px sans-serif";
			ctx.fillText(`Final Length: ${snake.length} | Score: ${score}`, CANVAS_SIZE / 2, 505);
			ctx.restore();
		}
		return canvas.toBuffer("image/png");
	}
	static drawEyes(ctx, x, y, size, dir) {
		ctx.fillStyle = "#111111";
		const offset = size / 3.8;
		let eye1 = {
			x: 0,
			y: 0
		};
		let eye2 = {
			x: 0,
			y: 0
		};
		if (dir === "UP") {
			eye1 = {
				x: x + offset,
				y: y + offset
			};
			eye2 = {
				x: x + size - offset,
				y: y + offset
			};
		} else if (dir === "DOWN") {
			eye1 = {
				x: x + offset,
				y: y + size - offset
			};
			eye2 = {
				x: x + size - offset,
				y: y + size - offset
			};
		} else if (dir === "LEFT") {
			eye1 = {
				x: x + offset,
				y: y + offset
			};
			eye2 = {
				x: x + offset,
				y: y + size - offset
			};
		} else {
			eye1 = {
				x: x + size - offset,
				y: y + offset
			};
			eye2 = {
				x: x + size - offset,
				y: y + size - offset
			};
		}
		const eyeRadius = Math.max(2, size / 10);
		ctx.beginPath();
		ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
		ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
		ctx.fill();
	}
};
// src/games/Snake.ts
var Snake = class extends BaseGame {
	snake = [];
	food = {
		x: 0,
		y: 0
	};
	direction = "UP";
	gridSize = 15;
	score = 0;
	isGameOver = false;
	gameTitle;
	emojiUp;
	emojiDown;
	emojiLeft;
	emojiRight;
	quitButtonLabel;
	idUp;
	idDown;
	idLeft;
	idRight;
	idQuit;
	constructor(manager, options) {
		super(manager, options, "snake");
		const uid = getRandomString(6, "snake_");
		this.idUp = `${uid}_up`;
		this.idDown = `${uid}_down`;
		this.idLeft = `${uid}_left`;
		this.idRight = `${uid}_right`;
		this.idQuit = `${uid}_quit`;
		this.gameTitle = options.embed?.title || "Snake";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.gridSize = clamp(options.gridSize || 15, 10, 20);
		this.emojiUp = options.emojis?.up || "⬆️";
		this.emojiDown = options.emojis?.down || "⬇️";
		this.emojiLeft = options.emojis?.left || "⬅️";
		this.emojiRight = options.emojis?.right || "➡️";
		this.quitButtonLabel = options.quitButton || "Quit";
		this.defaultTimeout = options.time || manager?.defaultTimeout || 3e5;
	}
	async start() {
		this.initGame();
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const loadingContainer = this.createGameContainer("loading");
		await this.ctx.sendInitial({
			components: [loadingContainer],
			flags: MessageFlags.IsComponentsV2
		});
		const buffer = await this.renderBoardImage();
		const attachment = new AttachmentBuilder(buffer, { name: "snake-board.png" });
		const activeContainer = this.createGameContainer("active", { image: "snake-board.png" });
		await this.ctx.edit({
			components: [activeContainer],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	initGame() {
		const startX = Math.floor(this.gridSize / 2);
		const startY = Math.floor(this.gridSize / 2);
		this.snake = [
			{
				x: startX,
				y: startY
			},
			{
				x: startX,
				y: startY + 1
			},
			{
				x: startX,
				y: startY + 2
			}
		];
		this.direction = "UP";
		this.score = 0;
		this.isGameOver = false;
		this.spawnFood();
	}
	spawnFood() {
		let valid = false;
		while (!valid) {
			const fx = Math.floor(Math.random() * this.gridSize);
			const fy = Math.floor(Math.random() * this.gridSize);
			if (!this.snake.some((p) => p.x === fx && p.y === fy)) {
				this.food = {
					x: fx,
					y: fy
				};
				valid = true;
			}
		}
	}
	move(newDir) {
		if ({
			UP: "DOWN",
			DOWN: "UP",
			LEFT: "RIGHT",
			RIGHT: "LEFT"
		}[this.direction] === newDir) newDir = this.direction;
		this.direction = newDir;
		const head = { ...this.snake[0] };
		switch (newDir) {
			case "UP":
				head.y -= 1;
				break;
			case "DOWN":
				head.y += 1;
				break;
			case "LEFT":
				head.x -= 1;
				break;
			case "RIGHT": head.x += 1;
		}
		if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
			this.isGameOver = true;
			return false;
		}
		if (this.snake.some((part, i) => {
			if (i === this.snake.length - 1 && !(head.x === this.food.x && head.y === this.food.y)) return false;
			return part.x === head.x && part.y === head.y;
		})) {
			this.isGameOver = true;
			return false;
		}
		this.snake.unshift(head);
		if (head.x === this.food.x && head.y === this.food.y) {
			this.score += 1;
			this.spawnFood();
		} else this.snake.pop();
		return true;
	}
	async renderBoardImage(overlayTitle) {
		const userAvatar = this.ctx.user.displayAvatarURL({
			extension: "png",
			size: 128
		});
		return RenderSnake.renderBoard(this.snake, this.food, this.direction, this.score, this.gridSize, this.ctx.user.username, userAvatar, this.isGameOver, overlayTitle);
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (!this.isAuthorized(interaction)) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		const id = interaction.customId;
		if (id === this.idQuit) {
			await interaction.deferUpdate().catch(() => {});
			return this.endGame("quit");
		}
		let nextDir = null;
		if (id === this.idUp) nextDir = "UP";
		else if (id === this.idDown) nextDir = "DOWN";
		else if (id === this.idLeft) nextDir = "LEFT";
		else if (id === this.idRight) nextDir = "RIGHT";
		if (!nextDir) return;
		await interaction.deferUpdate().catch(() => {});
		this.resetTimeout(() => this.endGame("timeout"));
		const alive = this.move(nextDir);
		const buffer = await this.renderBoardImage();
		const attachment = new AttachmentBuilder(buffer, { name: "snake-board.png" });
		if (!alive || this.isGameOver) return this.endGame("gameover", {
			image: "snake-board.png",
			score: this.score
		}, attachment);
		const container = this.createGameContainer("active", {
			image: "snake-board.png",
			score: this.score
		});
		await this.ctx.edit({
			components: [container],
			files: [attachment],
			flags: MessageFlags.IsComponentsV2
		});
	}
	async endGame(state, details, attachment) {
		this.isActive = false;
		this.isGameOver = true;
		this.clearTimer();
		this.destroy();
		this.emitEnd(state, this.score);
		if (!attachment && state !== "error") {
			const overlayTitle = state === "quit" ? "GAME STOPPED" : state === "timeout" ? "TIME'S UP" : "GAME OVER";
			const buffer = await this.renderBoardImage(overlayTitle);
			attachment = new AttachmentBuilder(buffer, { name: "snake-board.png" });
		}
		const container = this.createGameContainer(state, details || {
			score: this.score,
			image: "snake-board.png"
		});
		const files = attachment ? [attachment] : [];
		await this.ctx.edit({
			components: [container],
			files,
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, details) {
		const stateColors = {
			loading: this.defaultColor,
			active: this.defaultColor,
			gameover: 15548997,
			quit: 15548997,
			timeout: 15548997,
			error: 16711680
		};
		const container = this.createContainer(stateColors[state]);
		let content = "";
		const score = details?.score ?? this.score;
		switch (state) {
			case "loading":
				content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 Starting game...`;
				break;
			case "active":
				content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{score}}", score.toString()).replace("{{length}}", this.snake.length.toString()) : `## ${this.gameTitle}\n> Eat food and avoid crashing!\n\n**Score:** \`${score}\` | **Length:** \`${this.snake.length}\``;
				break;
			case "gameover":
				content = this.options.states?.gameover ? this.options.states.gameover.replace("{{score}}", score.toString()) : `## 💀 Game Over\n> The snake crashed!\n\n**Final Score:** \`${score}\``;
				break;
			case "quit":
				content = this.options.states?.quit ? this.options.states.quit.replace("{{score}}", score.toString()) : `## 🛑 Game Stopped\n> You quit the game.\n\n**Final Score:** \`${score}\``;
				break;
			case "timeout":
				content = this.options.states?.timeout ? this.options.states.timeout.replace("{{score}}", score.toString()) : `## ⏱️ Time's Up\n> Game session expired.\n\n**Final Score:** \`${score}\``;
				break;
			case "error": content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
		}
		content = this.applyEmbedDecorations(container, content);
		container.addTextDisplayComponents((t) => t.setContent(content));
		if (details?.image) {
			const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
			container.addMediaGalleryComponents(gallery);
		}
		if (state !== "loading" && state !== "error") {
			const isDisabled = state !== "active";
			const up = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiUp).setCustomId(this.idUp).setDisabled(isDisabled);
			const down = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiDown).setCustomId(this.idDown).setDisabled(isDisabled);
			const left = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiLeft).setCustomId(this.idLeft).setDisabled(isDisabled);
			const right = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(this.emojiRight).setCustomId(this.idRight).setDisabled(isDisabled);
			const quit = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(this.quitButtonLabel).setCustomId(this.idQuit).setEmoji("🛑").setDisabled(isDisabled);
			const dis1 = new ButtonBuilder().setLabel("​").setStyle(ButtonStyle.Secondary).setCustomId("dis1").setDisabled(true);
			const dis2 = new ButtonBuilder().setLabel("​").setStyle(ButtonStyle.Secondary).setCustomId("dis2").setDisabled(true);
			const row1 = new ActionRowBuilder().addComponents(dis1, up, dis2, quit);
			const row2 = new ActionRowBuilder().addComponents(left, down, right);
			container.addActionRowComponents(row1);
			container.addActionRowComponents(row2);
		}
		return container;
	}
};
// src/ai/TicTacToeAI.ts
/**
* TicTacToe AI Engine
* Implements Minimax with depth penalty for optimal play,
* plus medium and easy heuristic modes.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var TicTacToeAI = class {
	static WINNING_COMBOS = [
		[
			0,
			1,
			2
		],
		[
			3,
			4,
			5
		],
		[
			6,
			7,
			8
		],
		[
			0,
			3,
			6
		],
		[
			1,
			4,
			7
		],
		[
			2,
			5,
			8
		],
		[
			0,
			4,
			8
		],
		[
			2,
			4,
			6
		]
	];
	/**
	* Finds the best move index (0-8) for the AI.
	* @param board The current 3x3 board state.
	* @param aiSymbol The symbol of the AI ('X' or 'O').
	* @param difficulty AI difficulty level.
	*/
	static getBestMove(board, aiSymbol = "O", difficulty = "hard") {
		const humanSymbol = aiSymbol === "X" ? "O" : "X";
		const availableMoves = this.getAvailableMoves(board);
		if (availableMoves.length === 0) return -1;
		if (availableMoves.length === 9) return 4;
		if (difficulty === "easy") return availableMoves[Math.floor(Math.random() * availableMoves.length)];
		if (difficulty === "medium") {
			if (Math.random() < .5) return this.minimaxBestMove(board, aiSymbol, humanSymbol);
			for (const move of availableMoves) {
				board[move] = aiSymbol;
				if (this.checkWinner(board) === aiSymbol) {
					board[move] = null;
					return move;
				}
				board[move] = null;
			}
			for (const move of availableMoves) {
				board[move] = humanSymbol;
				if (this.checkWinner(board) === humanSymbol) {
					board[move] = null;
					return move;
				}
				board[move] = null;
			}
			if (board[4] === null) return 4;
			return availableMoves[Math.floor(Math.random() * availableMoves.length)];
		}
		return this.minimaxBestMove(board, aiSymbol, humanSymbol);
	}
	static minimaxBestMove(board, aiSymbol, humanSymbol) {
		let bestScore = -Infinity;
		let bestMove = -1;
		for (const move of this.getAvailableMoves(board)) {
			board[move] = aiSymbol;
			const score = this.minimax(board, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
			board[move] = null;
			if (score > bestScore) {
				bestScore = score;
				bestMove = move;
			}
		}
		return bestMove;
	}
	static minimax(board, depth, isMaximizing, aiSymbol, humanSymbol, alpha, beta) {
		const winner = this.checkWinner(board);
		if (winner === aiSymbol) return 10 - depth;
		if (winner === humanSymbol) return depth - 10;
		if (this.isBoardFull(board)) return 0;
		if (isMaximizing) {
			let maxEval = -Infinity;
			for (const move of this.getAvailableMoves(board)) {
				board[move] = aiSymbol;
				const evaluation = this.minimax(board, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
				board[move] = null;
				maxEval = Math.max(maxEval, evaluation);
				alpha = Math.max(alpha, evaluation);
				if (beta <= alpha) break;
			}
			return maxEval;
		} else {
			let minEval = Infinity;
			for (const move of this.getAvailableMoves(board)) {
				board[move] = humanSymbol;
				const evaluation = this.minimax(board, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
				board[move] = null;
				minEval = Math.min(minEval, evaluation);
				beta = Math.min(beta, evaluation);
				if (beta <= alpha) break;
			}
			return minEval;
		}
	}
	static checkWinner(board) {
		for (const [a, b, c] of this.WINNING_COMBOS) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
		return null;
	}
	static isBoardFull(board) {
		return board.every((cell) => cell !== null);
	}
	static getAvailableMoves(board) {
		const moves = [];
		for (let i = 0; i < board.length; i++) if (board[i] === null) moves.push(i);
		return moves;
	}
};
// src/games/TicTacToe.ts
var TicTacToe = class extends BaseGame {
	opponentUser;
	board = Array(9).fill(null);
	currentTurnId;
	btnPrefix;
	gameTitle;
	isVsAi = false;
	difficulty = "hard";
	constructor(manager, options) {
		super(manager, options, "tictactoe");
		this.btnPrefix = getRandomString(6, "ttt_");
		this.gameTitle = options.embed?.title || "Tic Tac Toe";
		this.defaultColor = this.resolveColor(options.embed?.color);
		this.currentTurnId = this.ctx.userId;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
		if (options.ai || !options.opponent) {
			this.isVsAi = true;
			this.difficulty = options.difficulty || "hard";
			const botUser = this.ctx.client?.user;
			this.opponentUser = botUser || {
				id: "weky_ai",
				username: `Weky AI (${this.difficulty})`,
				bot: true
			};
		} else {
			this.opponentUser = options.opponent instanceof GuildMember ? options.opponent.user : options.opponent;
			if (this.opponentUser.bot || this.opponentUser.id === this.ctx.client?.user?.id) {
				this.isVsAi = true;
				this.difficulty = options.difficulty || "hard";
			}
		}
	}
	async start() {
		if (!this.isVsAi && this.opponentUser.id === this.ctx.userId) {
			const container = this.createContainer(16711680).addTextDisplayComponents((t) => t.setContent("## ❌ Error\n> You cannot play Tic Tac Toe against yourself! Enable AI mode or invite an opponent."));
			await this.ctx.sendInitial({
				components: [container],
				flags: MessageFlags.IsComponentsV2
			});
			return;
		}
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame("timeout"));
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		const userId = interaction.user.id;
		if (userId !== this.ctx.userId && !this.isVsAi && userId !== this.opponentUser.id) {
			ContextAdapter.replyEphemeral(interaction, "You are not participating in this Tic Tac Toe match!");
			return;
		}
		if (userId !== this.currentTurnId) {
			ContextAdapter.replyEphemeral(interaction, "Please wait for your turn!");
			return;
		}
		const index = parseInt(customId.replace(this.btnPrefix, ""), 10);
		if (this.board[index] !== null) return;
		await interaction.deferUpdate().catch(() => {});
		this.resetTimeout(() => this.endGame("timeout"));
		const symbol = userId === this.ctx.userId ? "X" : "O";
		this.board[index] = symbol;
		const winner = this.checkWinner();
		if (winner) {
			await this.endGame("won", winner);
			return;
		}
		if (this.board.every((cell) => cell !== null)) {
			await this.endGame("tie");
			return;
		}
		if (this.isVsAi) {
			const aiMove = TicTacToeAI.getBestMove(this.board, "O", this.difficulty);
			if (aiMove !== -1) {
				this.board[aiMove] = "O";
				const aiWinner = this.checkWinner();
				if (aiWinner) {
					await this.endGame("won", aiWinner);
					return;
				}
				if (this.board.every((cell) => cell !== null)) {
					await this.endGame("tie");
					return;
				}
			}
			this.currentTurnId = this.ctx.userId;
		} else this.currentTurnId = this.currentTurnId === this.ctx.userId ? this.opponentUser.id : this.ctx.userId;
		const container = this.createGameContainer("active");
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	checkWinner() {
		for (const [a, b, c] of [
			[
				0,
				1,
				2
			],
			[
				3,
				4,
				5
			],
			[
				6,
				7,
				8
			],
			[
				0,
				3,
				6
			],
			[
				1,
				4,
				7
			],
			[
				2,
				5,
				8
			],
			[
				0,
				4,
				8
			],
			[
				2,
				4,
				6
			]
		]) if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) return this.board[a];
		return null;
	}
	async endGame(state, winningSymbol) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		let outcome = state;
		if (state === "won") outcome = winningSymbol === "X" ? "won" : "lost";
		this.emitEnd(outcome, outcome === "won" ? 1 : 0, { winningSymbol });
		const container = this.createGameContainer(state, winningSymbol);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, winningSymbol) {
		let stateColor = this.defaultColor;
		if (state === "won") stateColor = 5763719;
		else if (state === "tie") stateColor = 16705372;
		else if (state === "timeout") stateColor = 15548997;
		const container = this.createContainer(stateColor);
		let content = "";
		switch (state) {
			case "active":
				content = `## ${this.gameTitle}\n> ⚔️ <@${this.ctx.userId}> (❌) vs <@${this.opponentUser.id}> (⭕)!\n\n> 🎯 **Current Turn:** <@${this.currentTurnId}>`;
				break;
			case "won":
				const winnerId = winningSymbol === "X" ? this.ctx.userId : this.opponentUser.id;
				content = `## ${this.gameTitle} - Results\n> 🏆 **GG! <@${winnerId}> (${winningSymbol}) WON the match!**`;
				break;
			case "tie":
				content = `## ${this.gameTitle} - Results\n> 🤝 **It's a TIE!** Neither player could achieve three in a row.`;
				break;
			case "timeout": content = `## ${this.gameTitle}\n> ⏱️ Game session expired due to inactivity.`;
		}
		container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
		const isFinished = state !== "active";
		for (let row = 0; row < 3; row++) {
			const actionRow = new ActionRowBuilder();
			for (let col = 0; col < 3; col++) {
				const index = row * 3 + col;
				const cell = this.board[index];
				let label = "​";
				let style = ButtonStyle.Secondary;
				if (cell === "X") {
					label = "❌";
					style = ButtonStyle.Danger;
				} else if (cell === "O") {
					label = "⭕";
					style = ButtonStyle.Primary;
				}
				const btn = new ButtonBuilder().setCustomId(`${this.btnPrefix}${index}`).setLabel(label).setStyle(style).setDisabled(isFinished || cell !== null);
				actionRow.addComponents(btn);
			}
			container.addActionRowComponents(actionRow);
		}
		return container;
	}
};
// src/data/dilemmas.ts
const WYPTB_DILEMMAS = [
	{
		question: "You can teleport anywhere in the universe instantly.",
		consequence: "You arrive completely naked every time.",
		stats: {
			yes: "82%",
			no: "18%"
		}
	},
	{
		question: "You become a billionaire overnight.",
		consequence: "Every time you buy something, you must sing the receipt out loud.",
		stats: {
			yes: "74%",
			no: "26%"
		}
	},
	{
		question: "You can speak, read, and write every human language fluently.",
		consequence: "You can never speak in your native mother tongue again.",
		stats: {
			yes: "68%",
			no: "32%"
		}
	},
	{
		question: "You get photographic memory and never forget anything.",
		consequence: "You can never listen to music again.",
		stats: {
			yes: "45%",
			no: "55%"
		}
	},
	{
		question: "You can stop time whenever you want.",
		consequence: "Every second time is stopped, you age by two seconds.",
		stats: {
			yes: "59%",
			no: "41%"
		}
	},
	{
		question: "You can eat whatever you want without gaining weight or getting unhealthy.",
		consequence: "All drinks taste like lukewarm tap water.",
		stats: {
			yes: "63%",
			no: "37%"
		}
	},
	{
		question: "You become the greatest gamer in the world across all titles.",
		consequence: "You can only play with inverted controls forever.",
		stats: {
			yes: "51%",
			no: "49%"
		}
	},
	{
		question: "You can read people's minds whenever you make eye contact.",
		consequence: "You cannot turn it off, and they can hear your thoughts too.",
		stats: {
			yes: "38%",
			no: "62%"
		}
	},
	{
		question: "You have unlimited battery on all your electronic devices forever.",
		consequence: "Your Wi-Fi speed is capped at 10 Mbps.",
		stats: {
			yes: "42%",
			no: "58%"
		}
	},
	{
		question: "You can breathe underwater and swim like a fish.",
		consequence: "You can never eat seafood again.",
		stats: {
			yes: "79%",
			no: "21%"
		}
	},
	{
		question: "You never need to sleep again and never feel tired.",
		consequence: "You can never dream again.",
		stats: {
			yes: "71%",
			no: "29%"
		}
	},
	{
		question: "You can talk to animals and understand them perfectly.",
		consequence: "They all have incredibly sarcastic British accents.",
		stats: {
			yes: "88%",
			no: "12%"
		}
	},
	{
		question: "You always win every lottery or raffle you enter.",
		consequence: "Fifty percent of all your winnings must be donated to charity.",
		stats: {
			yes: "94%",
			no: "6%"
		}
	},
	{
		question: "You are immune to all physical pain and sickness.",
		consequence: "You stub your toe every single morning at 7:00 AM.",
		stats: {
			yes: "76%",
			no: "24%"
		}
	},
	{
		question: "You can travel back in time to fix any past mistake.",
		consequence: "A random stranger forgets you ever existed.",
		stats: {
			yes: "81%",
			no: "19%"
		}
	}
];
const WYR_DILEMMAS = [
	{
		optionA: "Be able to see 10 minutes into the future",
		optionB: "Be able to see 100 years into the future",
		stats: {
			votesA: 58,
			votesB: 42
		}
	},
	{
		optionA: "Never have to clean dishes again",
		optionB: "Never have to do laundry again",
		stats: {
			votesA: 52,
			votesB: 48
		}
	},
	{
		optionA: "Live in a world without music",
		optionB: "Live in a world without movies and television",
		stats: {
			votesA: 28,
			votesB: 72
		}
	},
	{
		optionA: "Always be 15 minutes late everywhere",
		optionB: "Always be 20 minutes early everywhere",
		stats: {
			votesA: 19,
			votesB: 81
		}
	},
	{
		optionA: "Have unlimited free flights for life",
		optionB: "Never have to pay for food anywhere for life",
		stats: {
			votesA: 41,
			votesB: 59
		}
	},
	{
		optionA: "Be fluent in every programming language",
		optionB: "Be fluent in every spoken human language",
		stats: {
			votesA: 33,
			votesB: 67
		}
	},
	{
		optionA: "Have super strength like Superman",
		optionB: "Have super intelligence like Batman",
		stats: {
			votesA: 36,
			votesB: 64
		}
	},
	{
		optionA: "Always have damp socks on your feet",
		optionB: "Always have an annoying eyelash stuck in your eye",
		stats: {
			votesA: 62,
			votesB: 38
		}
	},
	{
		optionA: "Live in virtual reality with total control",
		optionB: "Live in the real world with normal limitations",
		stats: {
			votesA: 44,
			votesB: 56
		}
	},
	{
		optionA: "Be able to rewind time by 5 seconds",
		optionB: "Be able to pause time for 10 seconds",
		stats: {
			votesA: 73,
			votesB: 27
		}
	}
];
function getRandomWYPTB() {
	return WYPTB_DILEMMAS[Math.floor(Math.random() * WYPTB_DILEMMAS.length)];
}
function getRandomWYR() {
	return WYR_DILEMMAS[Math.floor(Math.random() * WYR_DILEMMAS.length)];
}
// src/games/WillYouPressTheButton.ts
var WillYouPressTheButton = class extends BaseGame {
	dilemma;
	btnPrefix;
	gameTitle;
	labelYes;
	labelNo;
	constructor(manager, options) {
		super(manager, options, "wyptb");
		this.btnPrefix = getRandomString(6, "wyptb_");
		this.gameTitle = options.embed?.title || "Will You Press The Button?";
		this.defaultColor = this.resolveColor(options.embed?.color, 5793266);
		this.labelYes = options.button?.yes || options.buttons?.yes || "Yes! Press it!";
		this.labelNo = options.button?.no || options.buttons?.no || "No! Don't press!";
		if (options.perk && options.consequence) this.dilemma = {
			question: options.perk,
			consequence: options.consequence,
			stats: {
				yes: "50%",
				no: "50%"
			}
		};
		else this.dilemma = getRandomWYPTB();
		this.defaultTimeout = options.time || 6e4;
	}
	async start() {
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame());
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		await interaction.deferUpdate().catch(() => {});
		const pressed = customId.replace(this.btnPrefix, "") === "yes";
		await this.endGame(pressed);
	}
	async endGame(pressed) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		const outcome = pressed === void 0 ? "timeout" : pressed ? "pressed" : "passed";
		this.emitEnd(outcome);
		const state = pressed !== void 0 ? "result" : "timeout";
		const container = this.createGameContainer(state, pressed);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, pressed) {
		let stateColor = this.defaultColor;
		if (state === "result") stateColor = pressed ? 5763719 : 15548997;
		else if (state === "timeout") stateColor = 15548997;
		const container = this.createContainer(stateColor);
		let content = "";
		switch (state) {
			case "active":
				content = `## ${this.gameTitle}\n> ${this.dilemma.question}\n\n**BUT**\n\n> ${this.dilemma.consequence}`;
				break;
			case "result":
				const decisionText = pressed ? this.options.yesPress || "Yes! Press it!" : this.options.noPress || "No! Don't press!";
				content = `## ${this.gameTitle}\n> ${this.dilemma.question}\n\n**BUT**\n\n> ${this.dilemma.consequence}\n\n**You chose:** \`${decisionText}\`\n\n📊 **Community Consensus:**\n🔘 **Pressed:** \`${this.dilemma.stats.yes}\`\n🚫 **Didn't Press:** \`${this.dilemma.stats.no}\``;
				break;
			case "timeout": content = `## ${this.gameTitle}\n> ⏱️ Time's up! You took too long to decide.\n\n📊 **Community Consensus:**\n🔘 **Pressed:** \`${this.dilemma.stats.yes}\`\n🚫 **Didn't Press:** \`${this.dilemma.stats.no}\``;
		}
		container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
		const isResult = state === "result" || state === "timeout";
		const txtYes = isResult ? `${this.labelYes} (${this.dilemma.stats.yes})` : this.labelYes;
		const txtNo = isResult ? `${this.labelNo} (${this.dilemma.stats.no})` : this.labelNo;
		let styleYes = ButtonStyle.Success;
		let styleNo = ButtonStyle.Danger;
		if (isResult) {
			if (pressed === true) styleNo = ButtonStyle.Secondary;
			if (pressed === false) styleYes = ButtonStyle.Secondary;
		}
		const btnYes = new ButtonBuilder().setStyle(styleYes).setLabel(txtYes).setEmoji("🔘").setCustomId(`${this.btnPrefix}yes`).setDisabled(isResult);
		const btnNo = new ButtonBuilder().setStyle(styleNo).setLabel(txtNo).setEmoji("🚫").setCustomId(`${this.btnPrefix}no`).setDisabled(isResult);
		const row = new ActionRowBuilder().addComponents(btnYes, btnNo);
		container.addActionRowComponents(row);
		return container;
	}
};
// src/games/WouldYouRather.ts
var WouldYouRather = class extends BaseGame {
	dilemma;
	btnPrefix;
	gameTitle;
	labelA;
	labelB;
	constructor(manager, options) {
		super(manager, options, "wyr");
		this.btnPrefix = getRandomString(6, "wyr_");
		this.gameTitle = options.embed?.title || "Would You Rather?";
		this.defaultColor = this.resolveColor(options.embed?.color, 5793266);
		this.labelA = options.buttons?.optionA || options.buttonA || "Option A";
		this.labelB = options.buttons?.optionB || options.buttonB || "Option B";
		if (options.optionA && options.optionB) this.dilemma = {
			optionA: options.optionA,
			optionB: options.optionB,
			stats: {
				votesA: 50,
				votesB: 50
			}
		};
		else this.dilemma = getRandomWYR();
		this.defaultTimeout = options.time || 6e4;
	}
	async start() {
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createGameContainer("active");
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endGame());
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		if (interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		await interaction.deferUpdate().catch(() => {});
		const choice = customId.replace(this.btnPrefix, "");
		await this.endGame(choice);
	}
	async endGame(choice) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		const outcome = choice ? `chose_${choice.toLowerCase()}` : "timeout";
		this.emitEnd(outcome);
		const state = choice ? "result" : "timeout";
		const container = this.createGameContainer(state, choice);
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createGameContainer(state, choice) {
		let stateColor = this.defaultColor;
		if (state === "result") stateColor = choice === "A" ? 5793266 : 5763719;
		else if (state === "timeout") stateColor = 15548997;
		const container = this.createContainer(stateColor);
		let content = "";
		const totalVotes = this.dilemma.stats.votesA + this.dilemma.stats.votesB;
		const pctA = Math.round(this.dilemma.stats.votesA / totalVotes * 100);
		const pctB = Math.round(this.dilemma.stats.votesB / totalVotes * 100);
		switch (state) {
			case "active":
				content = `## ${this.gameTitle}\n> **Would you rather...**\n\n🅰️ **Option A:**\n> ${this.dilemma.optionA}\n\n*— OR —*\n\n🅱️ **Option B:**\n> ${this.dilemma.optionB}\n\n*Choose your fate below!*`;
				break;
			case "result":
				const chosenText = choice === "A" ? this.dilemma.optionA : this.dilemma.optionB;
				content = `## ${this.gameTitle}\n> 👉 You chose **Option ${choice}**: "${chosenText}"\n\n📊 **Community Consensus:**\n🅰️ **Option A (${pctA}%):**\n> ${this.dilemma.optionA}\n\n🅱️ **Option B (${pctB}%):**\n> ${this.dilemma.optionB}`;
				break;
			case "timeout": content = `## ${this.gameTitle}\n> ⏱️ Time's up! You took too long to choose.\n\n📊 **Community Consensus:**\n🅰️ **Option A (${pctA}%):**\n> ${this.dilemma.optionA}\n\n🅱️ **Option B (${pctB}%):**\n> ${this.dilemma.optionB}`;
		}
		container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
		const isResult = state === "result" || state === "timeout";
		const labelA = isResult ? `${this.labelA} (${pctA}%)` : this.labelA;
		const labelB = isResult ? `${this.labelB} (${pctB}%)` : this.labelB;
		let styleA = ButtonStyle.Primary;
		let styleB = ButtonStyle.Primary;
		if (isResult) {
			if (choice === "A") {
				styleA = ButtonStyle.Success;
				styleB = ButtonStyle.Secondary;
			} else if (choice === "B") {
				styleA = ButtonStyle.Secondary;
				styleB = ButtonStyle.Success;
			}
		}
		const btnA = new ButtonBuilder().setCustomId(`${this.btnPrefix}A`).setLabel(labelA).setEmoji("🅰️").setStyle(styleA).setDisabled(isResult);
		const btnB = new ButtonBuilder().setCustomId(`${this.btnPrefix}B`).setLabel(labelB).setEmoji("🅱️").setStyle(styleB).setDisabled(isResult);
		const row = new ActionRowBuilder().addComponents(btnA, btnB);
		container.addActionRowComponents(row);
		return container;
	}
};
// src/hub/ArcadeHub.ts
/**
* Arcade Hub Interface
* A centralized, categorized launcher for all 17 Weky minigames.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
const ARCADE_GAMES = [
	{
		key: "2048",
		name: "2048 Arcade",
		emoji: "🔢",
		category: "Classic Arcade",
		description: "Slide and merge numbered tiles on a canvas grid"
	},
	{
		key: "snake",
		name: "Retro Snake",
		emoji: "🐍",
		category: "Classic Arcade",
		description: "Classic arcade snake with D-pad canvas controls"
	},
	{
		key: "fight",
		name: "Fight RPG Duel / Boss",
		emoji: "⚔️",
		category: "PvP Duels",
		description: "Turn-based battle arena vs players or AI Bosses"
	},
	{
		key: "tictactoe",
		name: "Tic Tac Toe (PvP / AI)",
		emoji: "❌",
		category: "PvP Duels",
		description: "Turn-based 3x3 grid with Minimax AI difficulty"
	},
	{
		key: "rps",
		name: "Rock Paper Scissors",
		emoji: "✂️",
		category: "PvP Duels",
		description: "Classic hand game with psychological AI counter"
	},
	{
		key: "hangman",
		name: "Canvas Hangman",
		emoji: "🪓",
		category: "Brain & Puzzles",
		description: "Guess words with photorealistic wooden canvas gallows"
	},
	{
		key: "gtp",
		name: "Who's That Pokémon?",
		emoji: "⚡",
		category: "Brain & Puzzles",
		description: "Pokédex silhouette canvas quiz"
	},
	{
		key: "calculator",
		name: "Scientific Calculator",
		emoji: "📟",
		category: "Brain & Puzzles",
		description: "25-key keypad calculator with scientific mode"
	},
	{
		key: "fasttype",
		name: "Fast Type Challenge",
		emoji: "⌨️",
		category: "Brain & Puzzles",
		description: "WPM typing test with anti-paste cheat detection"
	},
	{
		key: "chaoswords",
		name: "Chaos Words",
		emoji: "🧩",
		category: "Brain & Puzzles",
		description: "Find scrambled words hidden in chaos text"
	},
	{
		key: "shuffleguess",
		name: "Shuffle Guess",
		emoji: "🔀",
		category: "Brain & Puzzles",
		description: "Unscramble anagrams with live reshuffle"
	},
	{
		key: "lieswatter",
		name: "Lie Swatter",
		emoji: "🧠",
		category: "Brain & Puzzles",
		description: "Rapid-fire fact or fiction trivia"
	},
	{
		key: "gtn",
		name: "Guess The Number",
		emoji: "🎯",
		category: "Party & Social",
		description: "High/low numeric range clues in solo or channel mode"
	},
	{
		key: "nhie",
		name: "Never Have I Ever",
		emoji: "👥",
		category: "Party & Social",
		description: "Group confession voting party with live percentages"
	},
	{
		key: "wyptb",
		name: "Will You Press The Button?",
		emoji: "🔘",
		category: "Party & Social",
		description: "Tempting perks coupled with hilarious consequences"
	},
	{
		key: "wyr",
		name: "Would You Rather?",
		emoji: "🅰️",
		category: "Party & Social",
		description: "Moral dilemma pitting Option A vs Option B"
	},
	{
		key: "quickclick",
		name: "Quick Click",
		emoji: "⏱️",
		category: "Party & Social",
		description: "Reaction speed measured down to milliseconds"
	}
];
var ArcadeHub = class extends BaseGame {
	btnPrefix;
	selectMenuId;
	selectedCategory = "All";
	constructor(manager, options) {
		super(manager, options, "arcade_hub");
		this.btnPrefix = getRandomString(6, "hub_");
		this.selectMenuId = `${this.btnPrefix}select`;
		this.defaultTimeout = options.time || manager?.defaultTimeout || 12e4;
	}
	async start() {
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		const container = this.createHubContainer();
		await this.ctx.sendInitial({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
		this.resetTimeout(() => this.endHub("timeout"));
	}
	async onInteraction(interaction) {
		if (!this.isActive) return;
		if (!("message" in interaction) || !interaction.message || interaction.message.id !== this.ctx.gameMessage?.id) return;
		if (!this.isAuthorized(interaction)) return;
		if (interaction.isStringSelectMenu() && interaction.customId === this.selectMenuId) {
			await interaction.deferUpdate().catch(() => {});
			const selectedGameKey = interaction.values[0];
			await this.launchGame(selectedGameKey);
			return;
		}
		if (interaction.isButton()) {
			const customId = interaction.customId;
			if (!customId.startsWith(this.btnPrefix)) return;
			await interaction.deferUpdate().catch(() => {});
			const action = customId.replace(this.btnPrefix, "");
			if (action === "random") {
				const available = ARCADE_GAMES.filter((g) => !this.options.exclude?.includes(g.key));
				const picked = available[Math.floor(Math.random() * available.length)];
				await this.launchGame(picked.key);
			} else if (action === "close") await this.endHub("closed");
		}
	}
	async launchGame(gameKey) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		if (typeof this.options.onSelect === "function") {
			await this.options.onSelect(gameKey, this.ctx);
			return;
		}
		if (typeof this.manager.launchGameByKey === "function") await this.manager.launchGameByKey(gameKey, this.ctx);
	}
	async endHub(reason) {
		this.isActive = false;
		this.clearTimer();
		this.destroy();
		this.emitEnd(reason);
		const container = this.createContainer(15548997);
		const content = reason === "closed" ? this.options.texts?.closedNotice || `## 🕹️ Arcade Closed\n> The Arcade Cabinet session has been closed.` : this.options.texts?.expiredNotice || `## ⏱️ Arcade Expired\n> The Arcade Cabinet session expired due to inactivity.`;
		container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
	createHubContainer() {
		const container = this.createContainer(this.defaultColor);
		const title = this.options.title || this.options.embed?.title || "🕹️ Weky Mini-Arcade Cabinet";
		const content = this.options.texts?.description || `## ${title}\n> Welcome to the unified **Discord Minigames Hub**! Choose any of the 17 games from the menu below to launch immediately.\n\n👾 **Classic Arcade:** 2048, Snake\n⚔️ **PvP Duels & Bosses:** Fight RPG, Tic-Tac-Toe, Rock Paper Scissors\n🧠 **Brain & Trivia:** Hangman, Guess The Pokémon, Fast Type, Chaos Words, Shuffle Guess, Lie Swatter, Calculator\n👥 **Party & Social:** Never Have I Ever, Would You Rather, Will You Press The Button, Guess The Number, Quick Click\n\n*Select a game or hit **Random Game** to let fate decide!*`;
		container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
		const availableGames = ARCADE_GAMES.filter((g) => !this.options.exclude?.includes(g.key));
		const selectPlaceholder = this.options.texts?.selectPlaceholder || "🎮 Select a Minigame to Launch...";
		const selectMenu = new StringSelectMenuBuilder().setCustomId(this.selectMenuId).setPlaceholder(selectPlaceholder).addOptions(availableGames.map((g) => new StringSelectMenuOptionBuilder().setLabel(`${g.name} (${g.category})`).setValue(g.key).setDescription(g.description.slice(0, 100)).setEmoji(g.emoji)));
		const selectRow = new ActionRowBuilder().addComponents(selectMenu);
		container.addActionRowComponents(selectRow);
		const btnRandom = new ButtonBuilder().setCustomId(`${this.btnPrefix}random`).setLabel(this.options.texts?.randomButton || "🎲 Surprise Me (Random Game)").setStyle(ButtonStyle.Primary);
		const btnClose = new ButtonBuilder().setCustomId(`${this.btnPrefix}close`).setLabel(this.options.texts?.closeButton || "❌ Close Arcade").setStyle(ButtonStyle.Secondary);
		const btnRow = new ActionRowBuilder().addComponents(btnRandom, btnClose);
		container.addActionRowComponents(btnRow);
		return container;
	}
};
// src/tournament/RenderBracket.ts
/**
* Canvas Tournament Bracket Renderer
* Generates an eSports-style visual bracket chart using @napi-rs/canvas.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var RenderBracket = class {
	/**
	* Generates a high-definition tournament bracket image buffer.
	*/
	static async render(options) {
		const width = 1200;
		const height = 700;
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		const bgGrad = ctx.createLinearGradient(0, 0, width, height);
		bgGrad.addColorStop(0, "#0b0e17");
		bgGrad.addColorStop(.5, "#101426");
		bgGrad.addColorStop(1, "#07090f");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, width, height);
		ctx.strokeStyle = "rgba(88, 101, 242, 0.08)";
		ctx.lineWidth = 1;
		for (let x = 0; x < width; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		for (let y = 0; y < height; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		const headerTitle = CanvasUtils.cleanText(options.title || "WEKY TOURNAMENT BRACKET") || "WEKY TOURNAMENT BRACKET";
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 32px sans-serif";
		ctx.textAlign = "left";
		ctx.fillText(headerTitle, 50, 55);
		ctx.fillStyle = "#5865F2";
		ctx.font = "bold 16px sans-serif";
		ctx.fillText(`GAME: ${options.gameName.toUpperCase()} • SINGLE ELIMINATION`, 50, 85);
		const lineGrad = ctx.createLinearGradient(50, 95, 1150, 95);
		lineGrad.addColorStop(0, "#5865F2");
		lineGrad.addColorStop(.5, "#00ff88");
		lineGrad.addColorStop(1, "transparent");
		ctx.strokeStyle = lineGrad;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(50, 95);
		ctx.lineTo(1150, 95);
		ctx.stroke();
		const numRounds = options.rounds;
		const usableWidth = 1080;
		const colWidth = 230;
		const colSpacing = (usableWidth - colWidth * numRounds) / Math.max(1, numRounds - 1);
		const startY = 130;
		const usableHeight = 540;
		const roundNames = numRounds === 2 ? ["Semifinals", "Grand Finals"] : [
			"Quarterfinals",
			"Semifinals",
			"Grand Finals"
		];
		const matchPositions = /* @__PURE__ */ new Map();
		for (let r = 0; r < numRounds; r++) {
			const roundMatches = options.matches.filter((m) => m.round === r + 1);
			const colX = 60 + r * (colWidth + colSpacing);
			ctx.fillStyle = "#a0a5b5";
			ctx.font = "bold 14px sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(roundNames[r] || `Round ${r + 1}`, colX + colWidth / 2, 118);
			const matchCount = roundMatches.length;
			const slotHeight = usableHeight / matchCount;
			for (let m = 0; m < matchCount; m++) {
				const match = roundMatches[m];
				const cardY = startY + m * slotHeight + (slotHeight - 90) / 2;
				matchPositions.set(`${match.round}_${match.matchIndex}`, {
					x: colX,
					y: cardY + 45,
					rightX: colX + colWidth
				});
				await this.drawMatchCard(ctx, colX, cardY, colWidth, 90, match);
			}
		}
		ctx.lineWidth = 2;
		for (let r = 1; r < numRounds; r++) {
			const prevRoundMatches = options.matches.filter((m) => m.round === r);
			for (const prevMatch of prevRoundMatches) {
				const nextMatchIndex = Math.floor(prevMatch.matchIndex / 2);
				const fromPos = matchPositions.get(`${r}_${prevMatch.matchIndex}`);
				const toPos = matchPositions.get(`${r + 1}_${nextMatchIndex}`);
				if (fromPos && toPos) {
					const midX = fromPos.rightX + colSpacing / 2;
					ctx.strokeStyle = prevMatch.winnerId ? "#00ff88" : "rgba(255, 255, 255, 0.2)";
					ctx.beginPath();
					ctx.moveTo(fromPos.rightX, fromPos.y);
					ctx.lineTo(midX, fromPos.y);
					ctx.lineTo(midX, toPos.y);
					ctx.lineTo(toPos.x, toPos.y);
					ctx.stroke();
				}
			}
		}
		if (options.champion) {
			CanvasUtils.roundRectPath(ctx, 930, 20, 240, 65, 12);
			ctx.fillStyle = "rgba(0, 255, 136, 0.12)";
			ctx.fill();
			ctx.strokeStyle = "#00ff88";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.fillStyle = "#00ff88";
			ctx.font = "bold 13px sans-serif";
			ctx.textAlign = "left";
			CanvasUtils.drawCrownIcon(ctx, 956, 40, 12, 7, "#00ff88");
			ctx.fillText("TOURNAMENT CHAMPION", 968, 42);
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 18px sans-serif";
			const cleanChamp = CanvasUtils.cleanText(options.champion.username) || options.champion.username;
			ctx.fillText(cleanChamp.slice(0, 16), 950, 68);
		}
		return canvas.toBuffer("image/png");
	}
	static async drawMatchCard(ctx, x, y, width, height, match) {
		CanvasUtils.roundRectPath(ctx, x, y, width, height, 10);
		ctx.fillStyle = "rgba(22, 27, 46, 0.95)";
		ctx.fill();
		const isWinnerP1 = Boolean(match.winnerId && match.p1 && match.winnerId === match.p1.id);
		const isWinnerP2 = Boolean(match.winnerId && match.p2 && match.winnerId === match.p2.id);
		const isCompleted = match.winnerId !== void 0;
		ctx.strokeStyle = isCompleted ? "rgba(0, 255, 136, 0.4)" : "rgba(88, 101, 242, 0.35)";
		ctx.lineWidth = 1.5;
		ctx.stroke();
		const slotH = height / 2;
		await this.drawParticipantRow(ctx, x, y, width, slotH, match.p1, isWinnerP1, isCompleted && !isWinnerP1, match.scoreText);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x + 10, y + slotH);
		ctx.lineTo(x + width - 10, y + slotH);
		ctx.stroke();
		await this.drawParticipantRow(ctx, x, y + slotH, width, slotH, match.p2, isWinnerP2, isCompleted && !isWinnerP2, match.scoreText);
	}
	static async drawParticipantRow(ctx, x, y, width, height, participant, isWinner, isEliminated, scoreText) {
		if (!participant) {
			ctx.fillStyle = "#555b6e";
			ctx.font = "italic 13px sans-serif";
			ctx.textAlign = "left";
			ctx.fillText("TBD / Waiting...", x + 16, y + height / 2 + 5);
			return;
		}
		const avatarR = 12;
		const avatarX = x + 20;
		const avatarY = y + height / 2;
		if (participant.avatarUrl) await CanvasUtils.drawCircularAvatar(ctx, participant.avatarUrl, avatarX, avatarY, avatarR, isWinner ? "#00ff88" : void 0, 1.5);
		else {
			ctx.fillStyle = "#2c2f40";
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
			ctx.fill();
		}
		if (isWinner) {
			ctx.strokeStyle = "#00ff88";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, 13, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.fillStyle = isWinner ? "#00ff88" : isEliminated ? "#666b7a" : "#e0e3ed";
		ctx.font = isWinner ? "bold 13px sans-serif" : "13px sans-serif";
		ctx.textAlign = "left";
		const name = participant.username.length > 14 ? `${participant.username.slice(0, 13)}…` : participant.username;
		ctx.fillText(name, x + 40, y + height / 2 + 5);
		if (isWinner) {
			ctx.fillStyle = "#00ff88";
			ctx.font = "bold 12px sans-serif";
			ctx.textAlign = "right";
			const winLabel = scoreText || (participant.score !== void 0 ? String(participant.score) : "WIN");
			ctx.fillText(winLabel, x + width - 15, y + height / 2 + 5);
		} else if (isEliminated) {
			ctx.fillStyle = "#ff4444";
			ctx.font = "12px sans-serif";
			ctx.textAlign = "right";
			const outLabel = participant.score !== void 0 ? String(participant.score) : "OUT";
			ctx.fillText(outLabel, x + width - 15, y + height / 2 + 5);
		}
	}
};
// src/tournament/TournamentManager.ts
/**
* Automated & Manual Tournament Manager
* Manages player brackets, automated dual-ephemeral matches, manual winner progression,
* detailed victory/defeat outcome tracking, live public Grand Finals, and visual bracket updates.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var TournamentManager = class extends BaseGame {
	btnPrefix;
	participants = [];
	matches = [];
	numRounds = 2;
	currentRound = 1;
	champion;
	isManualMode = false;
	gameTitle;
	activeSessions = /* @__PURE__ */ new Map();
	gfSession;
	gfAfkTimer;
	constructor(manager, options) {
		super(manager, options, "tournament");
		this.defaultTimeout = options.time || 6e5;
		this.btnPrefix = getRandomString(6, "tourn_");
		this.gameTitle = options.game || "custom";
		const rawGame = (options.game || "").toLowerCase();
		this.isManualMode = Boolean(options.manual || rawGame === "custom" || ![
			"rps",
			"tictactoe",
			"fight"
		].includes(rawGame));
		const rawPlayers = options.players || [];
		this.participants = rawPlayers.map((p) => {
			const user = p instanceof GuildMember ? p.user : p;
			return {
				id: user.id,
				username: user.username,
				avatarUrl: user.displayAvatarURL ? user.displayAvatarURL({
					extension: "png",
					size: 128
				}) : void 0
			};
		});
		this.setupBrackets();
	}
	setupBrackets() {
		const count = this.participants.length;
		const bracketSize = count <= 4 ? 4 : count <= 8 ? 8 : 16;
		this.numRounds = Math.log2(bracketSize);
		const round1Count = bracketSize / 2;
		for (let i = 0; i < round1Count; i++) this.matches.push({
			id: `1_${i}`,
			round: 1,
			matchIndex: i,
			p1: this.participants[i * 2],
			p2: this.participants[i * 2 + 1]
		});
		for (let r = 2; r <= this.numRounds; r++) {
			const matchesInRound = Math.pow(2, this.numRounds - r);
			for (let i = 0; i < matchesInRound; i++) this.matches.push({
				id: `${r}_${i}`,
				round: r,
				matchIndex: i
			});
		}
	}
	async start() {
		if (this.participants.length < 4) {
			const errContainer = this.createContainer(15548997).addTextDisplayComponents((t) => t.setContent("## ❌ Tournament Error\n> Tournaments require a minimum of 4 players to generate a bracket!"));
			await this.ctx.sendInitial({
				components: [errContainer],
				flags: MessageFlags.IsComponentsV2
			});
			return;
		}
		this.isActive = true;
		this.manager._eventManager.register(this);
		this.emitStart();
		await this.renderAndDisplay();
		this.resetTournamentTimeout();
	}
	/**
	* Resets the tournament inactivity timer (clock).
	* Refreshes the full defaultTimeout (10 mins or options.time) whenever an interaction occurs.
	*/
	resetTournamentTimeout() {
		if (!this.isActive) return;
		this.resetTimeout(() => this.endTournament("timeout"), this.defaultTimeout);
	}
	async onInteraction(interaction) {
		if (!interaction.isButton() || !this.isActive) return;
		const customId = interaction.customId;
		if (!customId.startsWith(this.btnPrefix)) return;
		this.resetTournamentTimeout();
		const actionKey = customId.slice(this.btnPrefix.length);
		if (actionKey === "abort") {
			if (interaction.user.id !== this.ctx.userId) {
				await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the tournament organizer can cancel this tournament.");
				return;
			}
			await interaction.deferUpdate().catch(() => {});
			await this.endTournament("aborted");
			return;
		}
		if (actionKey === "refresh") {
			await interaction.deferUpdate().catch(() => {});
			await this.renderAndDisplay();
			return;
		}
		if (actionKey === "manual_menu") {
			await this.handleManualMenu(interaction);
			return;
		}
		if (actionKey.startsWith("adv_")) {
			await this.handleManualAdvanceSelection(interaction, actionKey);
			return;
		}
		if (actionKey === "join") {
			await this.handlePlayerJoinMatch(interaction);
			return;
		}
		if (actionKey.startsWith("m_")) {
			await this.handleEphemeralMatchInteraction(interaction, actionKey);
			return;
		}
		if (actionKey.startsWith("gf_")) {
			await this.handleGrandFinalsInteraction(interaction, actionKey);
			return;
		}
	}
	/**
	* Dispatches the manual advance modal/control menu to the organizer.
	*/
	async handleManualMenu(interaction) {
		if (interaction.user.id !== this.ctx.userId) {
			await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the tournament organizer can manually advance matches.");
			return;
		}
		const currentMatches = this.matches.filter((m) => m.round === this.currentRound && !m.winnerId && m.p1 && m.p2);
		if (currentMatches.length === 0) {
			await ContextAdapter.replyEphemeral(interaction, "All matches in this round are already completed!");
			return;
		}
		const container = this.createContainer(16766720).addTextDisplayComponents((t) => t.setContent(`## 👑 Manual Match Control Panel (Round ${this.currentRound})\n> **Discipline:** ${this.gameTitle.toUpperCase()}\n> Select a winner below to manually report their match outcome and advance them in the bracket:`));
		for (let i = 0; i < Math.min(4, currentMatches.length); i++) {
			const m = currentMatches[i];
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}adv_${m.id}_${m.p1.id}`).setLabel(`🏆 Win: ${m.p1.username.slice(0, 16)} (M${m.matchIndex + 1})`).setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`${this.btnPrefix}adv_${m.id}_${m.p2.id}`).setLabel(`🏆 Win: ${m.p2.username.slice(0, 16)} (M${m.matchIndex + 1})`).setStyle(ButtonStyle.Primary));
			container.addActionRowComponents((ar) => ar.addComponents(...row.components));
		}
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		}).catch(() => {});
	}
	/**
	* Handles manual winner selection by the organizer.
	*/
	async handleManualAdvanceSelection(interaction, actionKey) {
		if (interaction.user.id !== this.ctx.userId) {
			await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the tournament organizer can manually advance matches.");
			return;
		}
		const parts = actionKey.split("_");
		const matchId = `${parts[1]}_${parts[2]}`;
		const winnerId = parts[3];
		const match = this.matches.find((m) => m.id === matchId);
		if (!match || !match.p1 || !match.p2) {
			await ContextAdapter.replyEphemeral(interaction, "Match not found or players not populated.");
			return;
		}
		const winner = match.p1.id === winnerId ? match.p1 : match.p2;
		const loser = match.p1.id === winnerId ? match.p2 : match.p1;
		const outcome = `Declared Winner by Organizer (${winner.username} defeated ${loser.username})`;
		await this.progressMatch(matchId, winnerId, outcome);
		await interaction.update({
			components: [this.createContainer(5763719).addTextDisplayComponents((t) => t.setContent(`✅ **Match ${match.matchIndex + 1} Advanced!** <@${winnerId}> (${winner.username}) declared winner!`))],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		}).catch(() => {});
	}
	/**
	* Handles a player pressing "Play My Match" on the main bracket board.
	*/
	async handlePlayerJoinMatch(interaction) {
		const userId = interaction.user.id;
		if (!this.participants.some((p) => p.id === userId)) {
			await ContextAdapter.replyEphemeral(interaction, "❌ You are not a registered participant in this tournament.");
			return;
		}
		if (this.isManualMode) {
			await ContextAdapter.replyEphemeral(interaction, `ℹ️ This tournament is running in **Manual Progression Mode** (${this.gameTitle}). The organizer will report match outcomes on the bracket board!`);
			return;
		}
		if (this.currentRound === this.numRounds) {
			await ContextAdapter.replyEphemeral(interaction, "👑 The Grand Finals is active LIVE directly on the tournament message in this channel! You do not need an ephemeral.");
			return;
		}
		const match = this.matches.find((m) => m.round === this.currentRound && (m.p1?.id === userId || m.p2?.id === userId));
		if (!match || !match.p1 || !match.p2) {
			if (this.matches.some((m) => m.round < this.currentRound && (m.p1?.id === userId || m.p2?.id === userId) && m.winnerId && m.winnerId !== userId)) await ContextAdapter.replyEphemeral(interaction, "❌ You have been eliminated from the tournament. Thanks for participating!");
			else await ContextAdapter.replyEphemeral(interaction, "⏳ Your match for this round is waiting for opponents to qualify.");
			return;
		}
		if (match.winnerId) {
			if (match.winnerId === userId) await ContextAdapter.replyEphemeral(interaction, `✅ You have already won your match for Round ${this.currentRound} (${match.outcomeDetail || "Victory"})! Waiting for other matches in this round to finish.`);
			else await ContextAdapter.replyEphemeral(interaction, `❌ You were defeated in Round ${this.currentRound} (${match.outcomeDetail || "Defeated"}). Good game!`);
			return;
		}
		let session = this.activeSessions.get(match.id);
		if (!session) {
			session = this.createMatchSession(match);
			this.activeSessions.set(match.id, session);
		}
		const isP1 = match.p1.id === userId;
		if (isP1) {
			session.p1Ready = true;
			session.p1Interaction = interaction;
		} else {
			session.p2Ready = true;
			session.p2Interaction = interaction;
		}
		const opponent = isP1 ? match.p2 : match.p1;
		if (!(isP1 ? session.p2Ready : session.p1Ready)) {
			if (!session.readyTimeoutTimer) session.readyTimeoutTimer = setTimeout(async () => {
				await this.handleWalkover(session, userId, "ready_timeout");
			}, 6e4);
			const waitContainer = this.createContainer(5793266).addTextDisplayComponents((t) => t.setContent(`## ⚔️ Match Found: You vs <@${opponent.id}>\n> **Discipline:** ${this.gameTitle.toUpperCase()} • **Round ${session.round}**\n\n⏳ **You are Ready!**\n> Waiting for your opponent <@${opponent.id}> to click **"⚔️ Play My Match"** on the tournament board...\n\n> ⏰ *If your opponent does not join within 60 seconds, you will win by default (Walkover).*`));
			await interaction.reply({
				components: [waitContainer],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
			}).catch(() => {});
			return;
		}
		if (session.readyTimeoutTimer) {
			clearTimeout(session.readyTimeoutTimer);
			session.readyTimeoutTimer = void 0;
		}
		session.status = "in_progress";
		this.resetSessionAfkTimer(session);
		const p1Container = this.renderMatchContainer(session, session.p1.id);
		const p2Container = this.renderMatchContainer(session, session.p2.id);
		const currentPContainer = isP1 ? p1Container : p2Container;
		const waitingPContainer = isP1 ? p2Container : p1Container;
		const waitingInteraction = isP1 ? session.p2Interaction : session.p1Interaction;
		await interaction.reply({
			components: [currentPContainer],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		}).catch(() => {});
		if (waitingInteraction) await waitingInteraction.editReply({
			components: [waitingPContainer],
			flags: MessageFlags.IsComponentsV2
		}).catch(() => {});
		await this.renderAndDisplay();
	}
	/**
	* Handles user interaction inside an ephemeral preliminary match.
	*/
	async handleEphemeralMatchInteraction(interaction, actionKey) {
		const parts = actionKey.split("_");
		const matchId = `${parts[1]}_${parts[2]}`;
		const gameType = parts[3];
		const subAction = parts.slice(4).join("_");
		const session = this.activeSessions.get(matchId);
		if (!session || session.status !== "in_progress") {
			await interaction.deferUpdate().catch(() => {});
			return;
		}
		const userId = interaction.user.id;
		if (userId !== session.p1.id && userId !== session.p2.id) {
			await ContextAdapter.replyEphemeral(interaction, "⚠️ You are not a player in this match.");
			return;
		}
		if (userId === session.p1.id) session.p1Interaction = interaction;
		else session.p2Interaction = interaction;
		let moveMade = false;
		if (gameType === "ttt") {
			if (userId !== session.currentTurnId) {
				await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn! Wait for your opponent.");
				return;
			}
			const cellIdx = parseInt(subAction, 10);
			if (session.tttBoard && session.tttBoard[cellIdx] === null) {
				session.tttBoard[cellIdx] = userId === session.p1.id ? "X" : "O";
				moveMade = true;
				const winResult = this.checkTTTWin(session.tttBoard);
				if (winResult) {
					session.winnerId = winResult.mark === "X" ? session.p1.id : session.p2.id;
					session.outcomeDetail = `Connected 3-in-a-row across ${winResult.line}`;
					session.scoreText = "3-IN-A-ROW";
					session.match.outcomeDetail = session.outcomeDetail;
					session.match.scoreText = session.scoreText;
				} else if (session.tttBoard.every((c) => c !== null)) {
					session.tttBoard = Array(9).fill(null);
					session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
				} else session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
			}
		} else if (gameType === "rps") {
			const move = subAction;
			if (userId === session.p1.id && !session.rpsP1Choice) {
				session.rpsP1Choice = move;
				moveMade = true;
			} else if (userId === session.p2.id && !session.rpsP2Choice) {
				session.rpsP2Choice = move;
				moveMade = true;
			}
			if (session.rpsP1Choice && session.rpsP2Choice) {
				const result = this.checkRPSWinner(session.rpsP1Choice, session.rpsP2Choice);
				if (result === "p1") {
					session.winnerId = session.p1.id;
					session.outcomeDetail = `${session.rpsP1Choice.toUpperCase()} defeated ${session.rpsP2Choice.toUpperCase()}`;
					session.scoreText = `${session.rpsP1Choice.toUpperCase()} W`;
				} else if (result === "p2") {
					session.winnerId = session.p2.id;
					session.outcomeDetail = `${session.rpsP2Choice.toUpperCase()} defeated ${session.rpsP1Choice.toUpperCase()}`;
					session.scoreText = `${session.rpsP2Choice.toUpperCase()} W`;
				} else {
					session.rpsMessage = `⚡ Tie! Both players selected **${session.rpsP1Choice.toUpperCase()}**! Sudden death replay:`;
					session.rpsP1Choice = void 0;
					session.rpsP2Choice = void 0;
				}
				if (session.winnerId) {
					session.match.outcomeDetail = session.outcomeDetail;
					session.match.scoreText = session.scoreText;
				}
			}
		} else if (gameType === "fight") {
			if (userId !== session.currentTurnId) {
				await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn!");
				return;
			}
			this.executeFightAction(session, userId, subAction);
			moveMade = true;
		}
		if (!moveMade && !session.winnerId) {
			await interaction.deferUpdate().catch(() => {});
			return;
		}
		if (session.winnerId) {
			if (session.afkTimer) clearTimeout(session.afkTimer);
			session.status = "completed";
			this.advanceWinnerInBracket(session.match, session.winnerId);
			const otherUserId = userId === session.p1.id ? session.p2.id : session.p1.id;
			const otherInteraction = userId === session.p1.id ? session.p2Interaction : session.p1Interaction;
			const clickerResult = this.renderMatchResultContainer(session, userId);
			const otherResult = this.renderMatchResultContainer(session, otherUserId);
			await interaction.update({
				components: [clickerResult],
				flags: MessageFlags.IsComponentsV2
			}).catch(() => {});
			if (otherInteraction) await otherInteraction.editReply({
				components: [otherResult],
				flags: MessageFlags.IsComponentsV2
			}).catch(() => {});
			await this.renderAndDisplay();
			await this.checkRoundCompletion();
			return;
		}
		this.resetSessionAfkTimer(session);
		const isP1 = userId === session.p1.id;
		const clickerContainer = this.renderMatchContainer(session, userId);
		const otherUserId = isP1 ? session.p2.id : session.p1.id;
		const otherContainer = this.renderMatchContainer(session, otherUserId);
		const otherInteraction = isP1 ? session.p2Interaction : session.p1Interaction;
		await interaction.update({
			components: [clickerContainer],
			flags: MessageFlags.IsComponentsV2
		}).catch(() => {});
		if (otherInteraction) await otherInteraction.editReply({
			components: [otherContainer],
			flags: MessageFlags.IsComponentsV2
		}).catch(() => {});
	}
	/**
	* Handles user interaction in the live, public Grand Finals in the channel.
	*/
	async handleGrandFinalsInteraction(interaction, actionKey) {
		const finalMatch = this.matches.find((m) => m.round === this.numRounds);
		if (!finalMatch || !finalMatch.p1 || !finalMatch.p2 || !this.gfSession) {
			await interaction.deferUpdate().catch(() => {});
			return;
		}
		const userId = interaction.user.id;
		if (userId !== finalMatch.p1.id && userId !== finalMatch.p2.id) {
			await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the Grand Finalists can make moves in the championship match!");
			return;
		}
		const parts = actionKey.split("_");
		const gameType = parts[1];
		const subAction = parts.slice(2).join("_");
		const session = this.gfSession;
		let moveMade = false;
		if (gameType === "ttt") {
			if (userId !== session.currentTurnId) {
				await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn!");
				return;
			}
			const cellIdx = parseInt(subAction, 10);
			if (session.tttBoard && session.tttBoard[cellIdx] === null) {
				session.tttBoard[cellIdx] = userId === session.p1.id ? "X" : "O";
				moveMade = true;
				const winResult = this.checkTTTWin(session.tttBoard);
				if (winResult) {
					session.winnerId = winResult.mark === "X" ? session.p1.id : session.p2.id;
					session.outcomeDetail = `Grand Finals Victory: 3-in-a-row across ${winResult.line}!`;
					session.scoreText = "CHAMPION";
				} else if (session.tttBoard.every((c) => c !== null)) {
					session.tttBoard = Array(9).fill(null);
					session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
				} else session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
			}
		} else if (gameType === "rps") {
			const move = subAction;
			if (userId === session.p1.id && !session.rpsP1Choice) {
				session.rpsP1Choice = move;
				moveMade = true;
			} else if (userId === session.p2.id && !session.rpsP2Choice) {
				session.rpsP2Choice = move;
				moveMade = true;
			}
			if (session.rpsP1Choice && session.rpsP2Choice) {
				const result = this.checkRPSWinner(session.rpsP1Choice, session.rpsP2Choice);
				if (result === "p1") {
					session.winnerId = session.p1.id;
					session.outcomeDetail = `Championship Move: ${session.rpsP1Choice.toUpperCase()} defeated ${session.rpsP2Choice.toUpperCase()}!`;
					session.scoreText = "CHAMPION";
				} else if (result === "p2") {
					session.winnerId = session.p2.id;
					session.outcomeDetail = `Championship Move: ${session.rpsP2Choice.toUpperCase()} defeated ${session.rpsP1Choice.toUpperCase()}!`;
					session.scoreText = "CHAMPION";
				} else {
					session.rpsMessage = `⚡ Tie! Both finalists selected **${session.rpsP1Choice.toUpperCase()}**! Sudden death replay:`;
					session.rpsP1Choice = void 0;
					session.rpsP2Choice = void 0;
				}
			}
		} else if (gameType === "fight") {
			if (userId !== session.currentTurnId) {
				await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn!");
				return;
			}
			this.executeFightAction(session, userId, subAction);
			moveMade = true;
		}
		if (!moveMade && !session.winnerId) {
			await interaction.deferUpdate().catch(() => {});
			return;
		}
		if (session.winnerId) {
			if (this.gfAfkTimer) clearTimeout(this.gfAfkTimer);
			const winner = session.winnerId === session.p1.id ? session.p1 : session.p2;
			this.champion = winner;
			finalMatch.winnerId = winner.id;
			finalMatch.outcomeDetail = session.outcomeDetail;
			finalMatch.scoreText = session.scoreText || "CHAMPION";
			await interaction.deferUpdate().catch(() => {});
			this.clearAllTimers();
			this.isActive = false;
			await this.renderAndDisplay(true);
			this.emitEnd("finished");
			this.destroy();
			return;
		}
		this.resetGrandFinalsAfkTimer();
		const updatedContainer = this.renderGrandFinalsContainer();
		await interaction.update({
			components: [updatedContainer],
			flags: MessageFlags.IsComponentsV2
		}).catch(() => {});
	}
	/**
	* Handles Walkover / Forfeit if a player is AFK.
	*/
	async handleWalkover(session, winningUserId, reason) {
		if (session.status === "completed") return;
		if (session.readyTimeoutTimer) clearTimeout(session.readyTimeoutTimer);
		if (session.afkTimer) clearTimeout(session.afkTimer);
		session.status = "completed";
		session.winnerId = winningUserId;
		const outcome = reason === "ready_timeout" ? "Walkover (Opponent 60s AFK)" : "Turn Timeout (Opponent 45s Inactivity)";
		session.outcomeDetail = outcome;
		session.scoreText = "WALKOVER";
		session.match.outcomeDetail = outcome;
		session.match.scoreText = "WALKOVER";
		this.advanceWinnerInBracket(session.match, winningUserId);
		const opponentId = winningUserId === session.p1.id ? session.p2.id : session.p1.id;
		const winnerInteraction = winningUserId === session.p1.id ? session.p1Interaction : session.p2Interaction;
		const loserInteraction = winningUserId === session.p1.id ? session.p2Interaction : session.p1Interaction;
		const winContainer = this.createContainer(5763719).addTextDisplayComponents((t) => t.setContent(`## 🏆 WALKOVER VICTORY!\n> Your opponent <@${opponentId}> was inactive (${outcome}).\n\n⚔️ **Match Outcome:** ${outcome}\n🎉 **You have ADVANCED to the next round by forfeit!**\n> Return to the tournament board in the channel to view the updated bracket.`));
		const loseContainer = this.createContainer(15548997).addTextDisplayComponents((t) => t.setContent(`## ⏰ MATCH FORFEITED\n> You were disqualified from Round ${session.round} due to inactivity (${outcome}).\n\n⚔️ **Match Outcome:** ${outcome}\n👋 Thank you for playing! You can continue watching the tournament in the channel.`));
		if (winnerInteraction) await winnerInteraction.editReply({
			components: [winContainer],
			flags: MessageFlags.IsComponentsV2
		}).catch(() => {});
		if (loserInteraction) await loserInteraction.editReply({
			components: [loseContainer],
			flags: MessageFlags.IsComponentsV2
		}).catch(() => {});
		await this.renderAndDisplay();
		await this.checkRoundCompletion();
	}
	/**
	* Advances the winner into the next bracket node.
	*/
	advanceWinnerInBracket(match, winnerId) {
		match.winnerId = winnerId;
		const winner = match.p1?.id === winnerId ? match.p1 : match.p2;
		if (!winner) return;
		const nextRound = match.round + 1;
		if (nextRound <= this.numRounds) {
			const nextMatchIndex = Math.floor(match.matchIndex / 2);
			const isP1Slot = match.matchIndex % 2 === 0;
			const nextMatch = this.matches.find((m) => m.round === nextRound && m.matchIndex === nextMatchIndex);
			if (nextMatch) {
				if (isP1Slot) nextMatch.p1 = winner;
				else nextMatch.p2 = winner;
			}
		} else this.champion = winner;
	}
	/**
	* Manually advances a specific match with a winner and optional outcome detail text.
	* Works for ANY game or bracket type.
	*/
	async progressMatch(matchId, winnerId, outcomeDetail = "Manual Advance") {
		const match = this.matches.find((m) => m.id === matchId);
		if (!match || !match.p1 || !match.p2) return;
		match.winnerId = winnerId;
		match.outcomeDetail = outcomeDetail;
		match.scoreText = "WIN";
		const session = this.activeSessions.get(match.id);
		if (session) {
			session.status = "completed";
			session.winnerId = winnerId;
			session.outcomeDetail = outcomeDetail;
			session.scoreText = "WIN";
			if (session.readyTimeoutTimer) clearTimeout(session.readyTimeoutTimer);
			if (session.afkTimer) clearTimeout(session.afkTimer);
		}
		this.advanceWinnerInBracket(match, winnerId);
		this.resetTournamentTimeout();
		await this.renderAndDisplay();
		await this.checkRoundCompletion();
	}
	/**
	* Manually advances the next pending match in the current round.
	*/
	async progressNextMatch(winnerId, outcomeDetail = "Manual Advance") {
		const nextPending = this.matches.find((m) => m.round === this.currentRound && !m.winnerId && m.p1 && m.p2);
		if (!nextPending) return null;
		const chosenWinner = winnerId || (Math.random() < .5 ? nextPending.p1.id : nextPending.p2.id);
		await this.progressMatch(nextPending.id, chosenWinner, outcomeDetail);
		return nextPending;
	}
	/**
	* Static helper to generate a visual tournament progress bracket image manually without running live games.
	*/
	static async generateBracketProgress(options) {
		const rounds = options.rounds || (options.matches.length > 0 ? Math.max(...options.matches.map((m) => m.round)) : 2);
		const bracketMatches = options.matches.map((m) => ({
			id: `${m.round}_${m.matchIndex}`,
			round: m.round,
			matchIndex: m.matchIndex,
			p1: {
				id: `p_${m.p1Username}`,
				username: m.p1Username,
				avatarUrl: m.p1AvatarUrl
			},
			p2: {
				id: `p_${m.p2Username}`,
				username: m.p2Username,
				avatarUrl: m.p2AvatarUrl
			},
			winnerId: m.winnerUsername ? `p_${m.winnerUsername}` : void 0,
			scoreText: m.scoreText,
			outcomeDetail: m.outcomeDetail
		}));
		const champion = options.championUsername ? {
			id: `p_${options.championUsername}`,
			username: options.championUsername
		} : void 0;
		return RenderBracket.render({
			title: options.title || "TOURNAMENT BRACKET",
			gameName: options.gameName || "CHAMPIONSHIP",
			rounds,
			matches: bracketMatches,
			champion
		});
	}
	getMatches() {
		return this.matches;
	}
	getPendingMatches() {
		return this.matches.filter((m) => m.round === this.currentRound && !m.winnerId && m.p1 && m.p2);
	}
	/**
	* Checks if all matches in the active round are done, advancing to the next round or Grand Finals.
	*/
	async checkRoundCompletion() {
		if (this.matches.filter((m) => m.round === this.currentRound).every((m) => m.winnerId !== void 0)) {
			this.resetTournamentTimeout();
			if (this.currentRound < this.numRounds) {
				this.currentRound++;
				if (this.currentRound === this.numRounds) this.initGrandFinals();
				await this.renderAndDisplay();
			} else {
				const finalsMatch = this.matches.find((m) => m.round === this.numRounds);
				if (finalsMatch?.winnerId) this.champion = finalsMatch.winnerId === finalsMatch.p1?.id ? finalsMatch.p1 : finalsMatch.p2;
				this.clearAllTimers();
				this.isActive = false;
				await this.renderAndDisplay(true);
				this.emitEnd("finished");
				this.destroy();
			}
		}
	}
	/**
	* Initializes the Grand Finals session when preliminary rounds complete.
	*/
	initGrandFinals() {
		const finalsMatch = this.matches.find((m) => m.round === this.numRounds);
		if (!finalsMatch || !finalsMatch.p1 || !finalsMatch.p2) return;
		this.gfSession = {
			match: finalsMatch,
			p1: finalsMatch.p1,
			p2: finalsMatch.p2,
			currentTurnId: finalsMatch.p1.id,
			tttBoard: Array(9).fill(null),
			fightP1Hp: 100,
			fightP2Hp: 100,
			fightP1Coins: 20,
			fightP2Coins: 20
		};
		if (!this.isManualMode) this.resetGrandFinalsAfkTimer();
	}
	resetSessionAfkTimer(session) {
		if (session.afkTimer) clearTimeout(session.afkTimer);
		session.afkTimer = setTimeout(async () => {
			const winningUser = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
			await this.handleWalkover(session, winningUser, "turn_timeout");
		}, 45e3);
	}
	resetGrandFinalsAfkTimer() {
		if (this.gfAfkTimer) clearTimeout(this.gfAfkTimer);
		this.gfAfkTimer = setTimeout(async () => {
			if (!this.gfSession || !this.isActive) return;
			const winningUser = this.gfSession.currentTurnId === this.gfSession.p1.id ? this.gfSession.p2 : this.gfSession.p1;
			this.champion = winningUser;
			const finalMatch = this.matches.find((m) => m.round === this.numRounds);
			if (finalMatch) {
				finalMatch.winnerId = winningUser.id;
				finalMatch.outcomeDetail = "Walkover (Opponent 60s AFK)";
				finalMatch.scoreText = "CHAMPION";
			}
			this.clearAllTimers();
			this.isActive = false;
			await this.renderAndDisplay(true);
			this.emitEnd("finished");
			this.destroy();
		}, 6e4);
	}
	createMatchSession(match) {
		return {
			match,
			round: match.round,
			p1: match.p1,
			p2: match.p2,
			status: "waiting_opponent",
			p1Ready: false,
			p2Ready: false,
			currentTurnId: match.p1.id,
			tttBoard: Array(9).fill(null),
			fightP1Hp: 100,
			fightP2Hp: 100,
			fightP1Coins: 20,
			fightP2Coins: 20
		};
	}
	checkTTTWin(board) {
		for (const [a, b, c, line] of [
			[
				0,
				1,
				2,
				"Top Row"
			],
			[
				3,
				4,
				5,
				"Middle Row"
			],
			[
				6,
				7,
				8,
				"Bottom Row"
			],
			[
				0,
				3,
				6,
				"Left Column"
			],
			[
				1,
				4,
				7,
				"Center Column"
			],
			[
				2,
				5,
				8,
				"Right Column"
			],
			[
				0,
				4,
				8,
				"Diagonal (Top-Left to Bottom-Right)"
			],
			[
				2,
				4,
				6,
				"Diagonal (Top-Right to Bottom-Left)"
			]
		]) if (board[a] && board[a] === board[b] && board[a] === board[c]) return {
			mark: board[a],
			line
		};
		return null;
	}
	checkRPSWinner(p1Choice, p2Choice) {
		if (p1Choice === p2Choice) return "draw";
		if (p1Choice === "rock" && p2Choice === "scissors" || p1Choice === "scissors" && p2Choice === "paper" || p1Choice === "paper" && p2Choice === "rock") return "p1";
		return "p2";
	}
	executeFightAction(session, attackerId, action) {
		const isP1 = session.p1.id === attackerId;
		let attackerHp = isP1 ? session.fightP1Hp : session.fightP2Hp;
		let defenderHp = isP1 ? session.fightP2Hp : session.fightP1Hp;
		let attackerCoins = isP1 ? session.fightP1Coins : session.fightP2Coins;
		let defenderShield = isP1 ? session.fightP2Shield : session.fightP1Shield;
		const attackerName = isP1 ? session.p1.username : session.p2.username;
		if (action === "attack") {
			let dmg = Math.floor(Math.random() * 9) + 14;
			if (defenderShield) {
				dmg = Math.floor(dmg / 2);
				if (isP1) session.fightP2Shield = false;
				else session.fightP1Shield = false;
			}
			defenderHp = Math.max(0, defenderHp - dmg);
			attackerCoins += 10;
			session.fightCombatLog = `💥 **${attackerName}** used Normal Attack dealing **${dmg}** damage!`;
		} else if (action === "heavy") {
			if (Math.random() < .14) {
				attackerCoins += 5;
				session.fightCombatLog = `💨 **${attackerName}** swung hard but missed!`;
			} else {
				let dmg = Math.floor(Math.random() * 11) + 22;
				if (defenderShield) {
					dmg = Math.floor(dmg / 2);
					if (isP1) session.fightP2Shield = false;
					else session.fightP1Shield = false;
				}
				defenderHp = Math.max(0, defenderHp - dmg);
				attackerCoins += 15;
				session.fightCombatLog = `💥 **${attackerName}** landed a HEAVY CRIT dealing **${dmg}** damage!`;
			}
		} else if (action === "heal") {
			const healAmount = Math.floor(Math.random() * 11) + 16;
			attackerHp = Math.min(100, attackerHp + healAmount);
			attackerCoins += 5;
			session.fightCombatLog = `💚 **${attackerName}** drank an elixir and healed **+${healAmount} HP**!`;
		} else if (action === "shield") {
			if (attackerCoins >= 25) {
				attackerCoins -= 25;
				if (isP1) session.fightP1Shield = true;
				else session.fightP2Shield = true;
				session.fightCombatLog = `🛡️ **${attackerName}** activated a Shield (-50% next damage)!`;
			} else session.fightCombatLog = `❌ **${attackerName}** did not have enough coins for a Shield!`;
		}
		if (isP1) {
			session.fightP1Hp = attackerHp;
			session.fightP2Hp = defenderHp;
			session.fightP1Coins = attackerCoins;
		} else {
			session.fightP2Hp = attackerHp;
			session.fightP1Hp = defenderHp;
			session.fightP2Coins = attackerCoins;
		}
		if (defenderHp <= 0) {
			session.winnerId = attackerId;
			const outcome = `Knockout with ${action === "heavy" ? "Heavy Strike" : "Normal Attack"}! (Winner HP: ${attackerHp}/100)`;
			session.outcomeDetail = outcome;
			session.scoreText = `KO (${attackerHp} HP)`;
			session.match.outcomeDetail = outcome;
			session.match.scoreText = session.scoreText;
		} else session.currentTurnId = isP1 ? session.p2.id : session.p1.id;
	}
	/**
	* Renders the interactive match container for an ephemeral match session.
	*/
	renderMatchContainer(session, viewingUserId) {
		const isP1 = viewingUserId === session.p1.id;
		const isMyTurn = session.currentTurnId === viewingUserId;
		const opponent = isP1 ? session.p2 : session.p1;
		const game = this.options.game || "custom";
		const container = this.createContainer(isMyTurn ? 63487 : 5793266);
		let text = `## ⚔️ Tournament Match • Round ${session.round}\n### <@${session.p1.id}> vs <@${session.p2.id}>\n> **Discipline:** ${this.gameTitle.toUpperCase()} • **Opponent:** <@${opponent.id}>\n\n`;
		if (game === "tictactoe") {
			text += isMyTurn ? `👉 **It's YOUR turn (${isP1 ? "❌ X" : "⭕ O"})!** Select an available square below:\n` : `⏳ **Waiting for <@${session.currentTurnId}> to make a move...**\n`;
			text += `> ⏰ *45s turn timeout (inactivity forfeits match)*`;
			container.addTextDisplayComponents((t) => t.setContent(text));
			for (let r = 0; r < 3; r++) {
				const row = new ActionRowBuilder();
				for (let c = 0; c < 3; c++) {
					const idx = r * 3 + c;
					const cell = session.tttBoard?.[idx];
					const btn = new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_ttt_${idx}`);
					if (cell === "X") btn.setLabel("X").setStyle(ButtonStyle.Danger).setDisabled(true);
					else if (cell === "O") btn.setLabel("O").setStyle(ButtonStyle.Success).setDisabled(true);
					else btn.setLabel("-").setStyle(ButtonStyle.Secondary).setDisabled(!isMyTurn);
					row.addComponents(btn);
				}
				container.addActionRowComponents((ar) => ar.addComponents(...row.components));
			}
		} else if (game === "rps") {
			const myChoice = isP1 ? session.rpsP1Choice : session.rpsP2Choice;
			if (session.rpsMessage) text += `> ${session.rpsMessage}\n\n`;
			text += myChoice ? `✅ **You picked ${myChoice.toUpperCase()}!** Waiting for your opponent...\n` : `👉 **Choose your move secretly below:**\n`;
			text += `> ⏰ *45s move timeout*`;
			container.addTextDisplayComponents((t) => t.setContent(text));
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_rps_rock`).setLabel("🪨 Rock").setStyle(myChoice === "rock" ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(Boolean(myChoice)), new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_rps_paper`).setLabel("📄 Paper").setStyle(myChoice === "paper" ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(Boolean(myChoice)), new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_rps_scissors`).setLabel("✂️ Scissors").setStyle(myChoice === "scissors" ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(Boolean(myChoice)));
			container.addActionRowComponents((ar) => ar.addComponents(...row.components));
		} else if (game === "fight") {
			const myHp = isP1 ? session.fightP1Hp : session.fightP2Hp;
			const oppHp = isP1 ? session.fightP2Hp : session.fightP1Hp;
			const myCoins = isP1 ? session.fightP1Coins : session.fightP2Coins;
			const hasShield = isP1 ? session.fightP1Shield : session.fightP2Shield;
			if (session.fightCombatLog) text += `> ${session.fightCombatLog}\n\n`;
			text += `📊 **Your HP:** ${myHp} / 100 • **Coins:** ¢${myCoins} ${hasShield ? "(🛡️ Shield Active)" : ""}\n🎯 **Opponent HP:** ${oppHp} / 100\n\n`;
			text += isMyTurn ? `👉 **It's YOUR turn!** Select an action below:\n` : `⏳ **Waiting for <@${session.currentTurnId}>'s action...**\n`;
			text += `> ⏰ *45s turn timeout*`;
			container.addTextDisplayComponents((t) => t.setContent(text));
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_attack`).setLabel("⚔️ Attack").setStyle(ButtonStyle.Primary).setDisabled(!isMyTurn), new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_heavy`).setLabel("💥 Heavy Strike").setStyle(ButtonStyle.Danger).setDisabled(!isMyTurn), new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_heal`).setLabel("💚 Heal").setStyle(ButtonStyle.Success).setDisabled(!isMyTurn || myHp >= 85), new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_shield`).setLabel("🛡️ Shield (¢25)").setStyle(ButtonStyle.Secondary).setDisabled(!isMyTurn || myCoins < 25 || hasShield));
			container.addActionRowComponents((ar) => ar.addComponents(...row.components));
		}
		return container;
	}
	/**
	* Renders the outcome container shown to players when an ephemeral match concludes,
	* with explicit detail on how the player won or was defeated.
	*/
	renderMatchResultContainer(session, viewingUserId) {
		const won = session.winnerId === viewingUserId;
		const opponent = viewingUserId === session.p1.id ? session.p2 : session.p1;
		const container = this.createContainer(won ? 5763719 : 15548997);
		const outcome = session.outcomeDetail || session.match.outcomeDetail || "Standard Match Victory";
		let content = "";
		if (won) content = `## 🎉 MATCH VICTORY!\n> **Congratulations <@${viewingUserId}>!** You defeated <@${opponent.id}> in Round ${session.round}!\n\n⚔️ **Winning Play / Outcome:**\n> • ${outcome}\n\n🏆 **You have ADVANCED to the next round!**\n> Check the updated bracket board in the channel to see your next matchup.`;
		else content = `## ❌ TOURNAMENT ELIMINATION\n> You were defeated by <@${opponent.id}> in Round ${session.round}.\n\n⚔️ **Defeat Reason / Deciding Play:**\n> • ${outcome}\n\n👋 **Thank you for playing!** You can continue spectating the remaining matches in the channel.`;
		container.addTextDisplayComponents((t) => t.setContent(content));
		return container;
	}
	/**
	* Renders the interactive container for the live Grand Finals in the main channel.
	*/
	renderGrandFinalsContainer() {
		const finalMatch = this.matches.find((m) => m.round === this.numRounds);
		const session = this.gfSession;
		const game = this.options.game || "custom";
		const container = this.createContainer(16766720);
		let text = `## 👑 GRAND FINALS: <@${finalMatch.p1.id}> vs <@${finalMatch.p2.id}>\n> **Discipline:** ${this.gameTitle.toUpperCase()} • **THE CHAMPIONSHIP MATCH**\n> 🏆 *The final game is played LIVE here in the channel!*\n\n`;
		if (this.isManualMode) {
			text += `👉 **Organizer:** Use the manual advance button below to crown the final champion!`;
			container.addTextDisplayComponents((t) => t.setContent(text));
		} else if (game === "tictactoe") {
			const isP1Turn = session.currentTurnId === finalMatch.p1.id;
			text += `👉 **Current Turn:** <@${session.currentTurnId}> (${isP1Turn ? "❌ X" : "⭕ O"})\n> ⏰ *60s turn limit (inactivity forfeits the championship)*`;
			container.addTextDisplayComponents((t) => t.setContent(text));
			for (let r = 0; r < 3; r++) {
				const row = new ActionRowBuilder();
				for (let c = 0; c < 3; c++) {
					const idx = r * 3 + c;
					const cell = session.tttBoard?.[idx];
					const btn = new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_ttt_${idx}`);
					if (cell === "X") btn.setLabel("X").setStyle(ButtonStyle.Danger).setDisabled(true);
					else if (cell === "O") btn.setLabel("O").setStyle(ButtonStyle.Success).setDisabled(true);
					else btn.setLabel("-").setStyle(ButtonStyle.Secondary);
					row.addComponents(btn);
				}
				container.addActionRowComponents((ar) => ar.addComponents(...row.components));
			}
		} else if (game === "rps") {
			if (session.rpsMessage) text += `> ${session.rpsMessage}\n\n`;
			text += `👉 **Both finalists: choose your move below!**\n> • <@${finalMatch.p1.id}>: ${session.rpsP1Choice ? "✅ Locked In" : "⏳ Deciding..."}\n> • <@${finalMatch.p2.id}>: ${session.rpsP2Choice ? "✅ Locked In" : "⏳ Deciding..."}\n`;
			container.addTextDisplayComponents((t) => t.setContent(text));
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_rps_rock`).setLabel("🪨 Rock").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_rps_paper`).setLabel("📄 Paper").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_rps_scissors`).setLabel("✂️ Scissors").setStyle(ButtonStyle.Primary));
			container.addActionRowComponents((ar) => ar.addComponents(...row.components));
		} else if (game === "fight") {
			if (session.fightCombatLog) text += `> ${session.fightCombatLog}\n\n`;
			text += `📊 **<@${finalMatch.p1.id}>:** ${session.fightP1Hp} HP • ¢${session.fightP1Coins} ${session.fightP1Shield ? "(🛡️ Shield)" : ""}\n📊 **<@${finalMatch.p2.id}>:** ${session.fightP2Hp} HP • ¢${session.fightP2Coins} ${session.fightP2Shield ? "(🛡️ Shield)" : ""}\n\n👉 **Current Turn:** <@${session.currentTurnId}>\n> ⏰ *60s turn limit*`;
			container.addTextDisplayComponents((t) => t.setContent(text));
			const isP1 = session.currentTurnId === finalMatch.p1.id;
			const curHp = isP1 ? session.fightP1Hp : session.fightP2Hp;
			const curCoins = isP1 ? session.fightP1Coins : session.fightP2Coins;
			const curShield = isP1 ? session.fightP1Shield : session.fightP2Shield;
			const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_attack`).setLabel("⚔️ Attack").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_heavy`).setLabel("💥 Heavy Strike").setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_heal`).setLabel("💚 Heal").setStyle(ButtonStyle.Success).setDisabled(curHp >= 85), new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_shield`).setLabel("🛡️ Shield (¢25)").setStyle(ButtonStyle.Secondary).setDisabled(curCoins < 25 || curShield));
			container.addActionRowComponents((ar) => ar.addComponents(...row.components));
		}
		const controlsRow = new ActionRowBuilder();
		if (this.isManualMode) controlsRow.addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}manual_menu`).setLabel(this.options.texts?.crownChampionButton || "👑 Advance / Crown Champion").setStyle(ButtonStyle.Success));
		controlsRow.addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}abort`).setLabel(this.options.texts?.abortButton || "Abort Tournament").setStyle(ButtonStyle.Danger));
		container.addActionRowComponents((ar) => ar.addComponents(...controlsRow.components));
		return container;
	}
	/**
	* Renders and updates the main tournament channel message.
	*/
	async renderAndDisplay(isFinished = false) {
		const buffer = await RenderBracket.render({
			gameName: this.gameTitle,
			rounds: this.numRounds,
			matches: this.matches,
			champion: this.champion,
			title: this.options.title || this.options.embed?.title
		});
		const attachment = new AttachmentBuilder(buffer, { name: "tournament-bracket.png" });
		if (isFinished && this.champion) {
			const finishContainer = this.createContainer(5763719);
			const finalsMatch = this.matches.find((m) => m.round === this.numRounds);
			const outcome = finalsMatch?.outcomeDetail ? `\n> ⚔️ **Championship Outcome:** ${finalsMatch.outcomeDetail}` : "";
			const content = `## 🏆 ${this.options.title || "Championship Tournament"}\n> **Discipline:** ${this.gameTitle.toUpperCase()} • **Rounds:** ${this.numRounds} • **Players:** ${this.participants.length}\n\n🎉 **TOURNAMENT COMPLETE!**\n> 👑 **CHAMPION:** <@${this.champion.id}> (${this.champion.username}) takes 1st place!${outcome}\n\nCongratulations to all contenders and champions!`;
			finishContainer.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(finishContainer, content)));
			finishContainer.addMediaGalleryComponents((m) => m.addItems((item) => item.setURL("attachment://tournament-bracket.png")));
			await this.deliverMessage([finishContainer], [attachment]);
			return;
		}
		if (this.currentRound === this.numRounds && this.gfSession) {
			const gfContainer = this.renderGrandFinalsContainer();
			gfContainer.addMediaGalleryComponents((m) => m.addItems((item) => item.setURL("attachment://tournament-bracket.png")));
			await this.deliverMessage([gfContainer], [attachment]);
			return;
		}
		const currentMatches = this.matches.filter((m) => m.round === this.currentRound);
		const container = this.createContainer(this.defaultColor);
		let content = `## 🏆 ${this.options.title || "Championship Tournament"}\n> **Discipline:** ${this.gameTitle.toUpperCase()} • **Round:** ${this.currentRound} of ${this.numRounds} • **Players:** ${this.participants.length}\n\n⚔️ **Active Matches (Round ${this.currentRound}):**\n`;
		for (let i = 0; i < currentMatches.length; i++) {
			const m = currentMatches[i];
			const p1Text = m.p1 ? `<@${m.p1.id}>` : "TBD";
			const p2Text = m.p2 ? `<@${m.p2.id}>` : "TBD";
			let statusBadge = "⏳ Waiting for Players";
			if (m.winnerId) statusBadge = `✅ **${m.winnerId === m.p1?.id ? m.p1?.username : m.p2?.username} Won**${m.outcomeDetail ? ` • ${m.outcomeDetail}` : ""}`;
			else {
				const sess = this.activeSessions.get(m.id);
				if (sess?.status === "in_progress") statusBadge = "🔥 **In Progress**";
				else if (sess?.p1Ready || sess?.p2Ready) statusBadge = "⏳ 1/2 Ready";
			}
			content += `> • **Match ${i + 1}:** ${p1Text} vs ${p2Text} [${statusBadge}]\n`;
		}
		if (this.isManualMode) content += `\n👉 **Organizer:** Click **"👑 Advance Match"** below to record match results!`;
		else content += `\n👉 **Players:** Click **"⚔️ Play My Match"** below to enter your private game!`;
		container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
		container.addMediaGalleryComponents((m) => m.addItems((item) => item.setURL("attachment://tournament-bracket.png")));
		const buttonsRow = new ActionRowBuilder();
		if (this.isManualMode) buttonsRow.addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}manual_menu`).setLabel(this.options.texts?.manualAdvanceButton || "👑 Advance Match").setStyle(ButtonStyle.Success));
		else buttonsRow.addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}join`).setLabel(this.options.texts?.playButton || "⚔️ Play My Match").setStyle(ButtonStyle.Success));
		buttonsRow.addComponents(new ButtonBuilder().setCustomId(`${this.btnPrefix}refresh`).setLabel(this.options.texts?.refreshButton || "🔄 Refresh Bracket").setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId(`${this.btnPrefix}abort`).setLabel(this.options.texts?.abortButton || "Abort").setStyle(ButtonStyle.Danger));
		container.addActionRowComponents((r) => r.addComponents(...buttonsRow.components));
		await this.deliverMessage([container], [attachment]);
	}
	async deliverMessage(components, files) {
		if (!this.ctx.gameMessage) await this.ctx.sendInitial({
			components,
			files,
			flags: MessageFlags.IsComponentsV2
		});
		else await this.ctx.edit({
			components,
			files,
			flags: MessageFlags.IsComponentsV2
		});
	}
	clearAllTimers() {
		this.clearTimer();
		if (this.gfAfkTimer) {
			clearTimeout(this.gfAfkTimer);
			this.gfAfkTimer = void 0;
		}
		for (const session of this.activeSessions.values()) {
			if (session.readyTimeoutTimer) {
				clearTimeout(session.readyTimeoutTimer);
				session.readyTimeoutTimer = void 0;
			}
			if (session.afkTimer) {
				clearTimeout(session.afkTimer);
				session.afkTimer = void 0;
			}
		}
	}
	async endTournament(reason) {
		this.isActive = false;
		this.clearAllTimers();
		this.destroy();
		this.emitEnd(reason);
		const container = this.createContainer(15548997).addTextDisplayComponents((t) => t.setContent(`## 🏆 Tournament Ended\n> The tournament was ${reason === "aborted" ? "cancelled by organizer" : "ended due to inactivity"}.`));
		await this.ctx.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2
		});
	}
};
// src/leaderboard/LeaderboardManager.ts
/**
* ELO & High-Score Leaderboard Engine
* Provides plug-and-play ELO rating calculations, streak tracking, and score storage.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var LeaderboardManager = class LeaderboardManager {
	players = /* @__PURE__ */ new Map();
	defaultElo;
	defaultKFactor;
	pointing;
	storageAdapter;
	wekyManager;
	constructor(options = {}) {
		this.defaultElo = options.defaultElo ?? 1200;
		this.defaultKFactor = options.kFactor ?? 32;
		this.storageAdapter = options.storageAdapter;
		this.pointing = options.pointing;
		this.wekyManager = options.wekyManager;
	}
	/**
	* Calculates ELO rating adjustments using the standard international FIDE ELO formula.
	*
	* @param playerElo Rating of Player 1
	* @param opponentElo Rating of Player 2
	* @param outcome 1 for player 1 win, 0.5 for draw, 0 for player 1 loss
	* @param kFactor Weight factor (default: 32)
	*/
	static calculateElo(playerElo, opponentElo, outcome, kFactor = 32) {
		const expectedP1 = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
		const expectedP2 = 1 - expectedP1;
		const actualP1 = outcome;
		const actualP2 = 1 - outcome;
		const p1Change = Math.round(kFactor * (actualP1 - expectedP1));
		const p2Change = Math.round(kFactor * (actualP2 - expectedP2));
		return {
			p1Change,
			p2Change,
			p1NewElo: Math.max(100, playerElo + p1Change),
			p2NewElo: Math.max(100, opponentElo + p2Change)
		};
	}
	/**
	* Retrieves or initializes stats for a player.
	*/
	async getPlayer(userId, username = "Unknown Player", avatarUrl) {
		if (this.storageAdapter) {
			const stored = await this.storageAdapter.get(userId);
			if (stored) {
				if (username !== "Unknown Player") stored.username = username;
				if (avatarUrl) stored.avatarUrl = avatarUrl;
				return stored;
			}
		}
		let player = this.players.get(userId);
		if (!player) {
			player = {
				id: userId,
				username,
				avatarUrl,
				elo: this.defaultElo,
				wins: 0,
				losses: 0,
				draws: 0,
				winStreak: 0,
				highestStreak: 0,
				scores: {},
				lastPlayed: Date.now()
			};
			this.players.set(userId, player);
			if (this.storageAdapter) await this.storageAdapter.set(userId, player);
		} else {
			if (username !== "Unknown Player") player.username = username;
			if (avatarUrl) player.avatarUrl = avatarUrl;
		}
		return player;
	}
	/**
	* Records a 1v1 match outcome between two players and updates their ratings and streaks.
	* If custom pointing is configured (or passed in options), it executes the developer formula;
	* otherwise it defaults to international FIDE ELO.
	*/
	async recordMatch(p1Id, p2Id, result, options = {}) {
		const p1 = await this.getPlayer(p1Id, options.p1Username, options.p1Avatar);
		const p2 = await this.getPlayer(p2Id, options.p2Username, options.p2Avatar);
		const oldP1Elo = p1.elo;
		const oldP2Elo = p2.elo;
		const pointing = options.pointing || this.pointing;
		let eloResult;
		if (pointing?.calculateMatchPoints) {
			const customRes = pointing.calculateMatchPoints({
				p1,
				p2,
				result,
				game: options.game,
				kFactor: options.kFactor ?? this.defaultKFactor
			});
			eloResult = {
				p1Change: customRes.p1Change,
				p2Change: customRes.p2Change ?? 0,
				p1NewElo: customRes.p1NewElo ?? Math.max(0, p1.elo + customRes.p1Change),
				p2NewElo: customRes.p2NewElo ?? Math.max(0, p2.elo + (customRes.p2Change ?? 0))
			};
		} else if (pointing?.winPoints !== void 0) {
			const p1Bonus = result === "p1" ? p1.winStreak * (pointing.streakBonus || 0) : 0;
			const p2Bonus = result === "p2" ? p2.winStreak * (pointing.streakBonus || 0) : 0;
			const p1Change = result === "p1" ? pointing.winPoints + p1Bonus : result === "draw" ? pointing.drawPoints ?? 0 : -(pointing.lossPoints ?? 0);
			const p2Change = result === "p2" ? pointing.winPoints + p2Bonus : result === "draw" ? pointing.drawPoints ?? 0 : -(pointing.lossPoints ?? 0);
			eloResult = {
				p1Change,
				p2Change,
				p1NewElo: Math.max(0, p1.elo + p1Change),
				p2NewElo: Math.max(0, p2.elo + p2Change)
			};
		} else {
			const k = options.kFactor ?? this.defaultKFactor;
			const outcome = result === "p1" ? 1 : result === "draw" ? .5 : 0;
			eloResult = LeaderboardManager.calculateElo(p1.elo, p2.elo, outcome, k);
		}
		p1.elo = eloResult.p1NewElo;
		p2.elo = eloResult.p2NewElo;
		p1.lastPlayed = Date.now();
		p2.lastPlayed = Date.now();
		if (result === "p1") {
			p1.wins++;
			p1.winStreak++;
			if (p1.winStreak > p1.highestStreak) p1.highestStreak = p1.winStreak;
			p2.losses++;
			p2.winStreak = 0;
		} else if (result === "p2") {
			p2.wins++;
			p2.winStreak++;
			if (p2.winStreak > p2.highestStreak) p2.highestStreak = p2.winStreak;
			p1.losses++;
			p1.winStreak = 0;
		} else {
			p1.draws++;
			p2.draws++;
			p1.winStreak = 0;
			p2.winStreak = 0;
		}
		if (this.storageAdapter) {
			await this.storageAdapter.set(p1.id, p1);
			await this.storageAdapter.set(p2.id, p2);
		}
		if (this.wekyManager && typeof this.wekyManager.emit === "function") {
			this.wekyManager.emit("leaderboardUpdate", {
				userId: p1.id,
				username: p1.username,
				game: options.game || "pvp",
				oldValue: oldP1Elo,
				newValue: p1.elo,
				change: eloResult.p1Change,
				isWin: result === "p1",
				streak: p1.winStreak
			});
			this.wekyManager.emit("leaderboardUpdate", {
				userId: p2.id,
				username: p2.username,
				game: options.game || "pvp",
				oldValue: oldP2Elo,
				newValue: p2.elo,
				change: eloResult.p2Change,
				isWin: result === "p2",
				streak: p2.winStreak
			});
		}
		return eloResult;
	}
	/**
	* Records a solo arcade score (e.g. 2048, Snake, FastType).
	* Updates player's personal best if beaten.
	*/
	async recordScore(userId, game, score, options = {}) {
		const player = await this.getPlayer(userId, options.username, options.avatarUrl);
		const previousBest = player.scores[game] || 0;
		const pointing = options.pointing || this.pointing;
		const finalScore = pointing?.calculateSoloPoints ? pointing.calculateSoloPoints({
			player,
			game,
			score
		}) : score;
		const isPersonalBest = finalScore > previousBest;
		if (isPersonalBest || player.scores[game] === void 0) player.scores[game] = finalScore;
		player.lastPlayed = Date.now();
		if (this.storageAdapter) await this.storageAdapter.set(player.id, player);
		if (this.wekyManager && typeof this.wekyManager.emit === "function") this.wekyManager.emit("leaderboardUpdate", {
			userId: player.id,
			username: player.username,
			game,
			oldValue: previousBest,
			newValue: player.scores[game],
			change: finalScore - previousBest,
			isWin: isPersonalBest,
			streak: player.winStreak
		});
		return {
			isPersonalBest,
			previousBest,
			newBest: player.scores[game],
			awardedPoints: finalScore
		};
	}
	/**
	* Exports all leaderboard player records as a raw JSON serializable array (for web dashboards).
	*/
	async exportData() {
		const all = this.storageAdapter ? await this.storageAdapter.getAll() : Array.from(this.players.values());
		return JSON.parse(JSON.stringify(all));
	}
	/**
	* Imports or merges an external array of player records into the leaderboard (e.g. from a web dashboard database).
	*/
	async importData(data) {
		for (const player of data) {
			this.players.set(player.id, player);
			if (this.storageAdapter) await this.storageAdapter.set(player.id, player);
		}
	}
	/**
	* Returns top players sorted by ELO rating.
	*/
	async getTopByElo(limit = 10) {
		return (this.storageAdapter ? await this.storageAdapter.getAll() : Array.from(this.players.values())).sort((a, b) => b.elo - a.elo).slice(0, limit);
	}
	/**
	* Returns top players for a specific solo minigame by high score.
	*/
	async getTopByScore(game, limit = 10) {
		return (this.storageAdapter ? await this.storageAdapter.getAll() : Array.from(this.players.values())).filter((p) => p.scores[game] !== void 0).sort((a, b) => (b.scores[game] || 0) - (a.scores[game] || 0)).slice(0, limit).map((player, index) => ({
			rank: index + 1,
			player,
			score: player.scores[game] || 0
		}));
	}
	/**
	* Clears all in-memory leaderboard records.
	*/
	reset() {
		this.players.clear();
	}
};
// src/canvas/RenderLeaderboard.ts
/**
* Canvas Leaderboard Renderer
* Generates an eSports-grade High-Score poster using @napi-rs/canvas.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var RenderLeaderboard = class {
	static async render(options) {
		const entries = options.entries.slice(0, 10);
		const width = 1e3;
		const rowHeight = 54;
		const headerHeight = 175;
		const height = Math.max(540, headerHeight + entries.length * 64 + 28 + 35);
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		const bgGrad = ctx.createLinearGradient(0, 0, width, height);
		bgGrad.addColorStop(0, "#080b12");
		bgGrad.addColorStop(.4, "#0d1322");
		bgGrad.addColorStop(1, "#06080d");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, width, height);
		const aura = ctx.createRadialGradient(width / 2, 80, 20, width / 2, 80, 480);
		aura.addColorStop(0, "rgba(88, 101, 242, 0.16)");
		aura.addColorStop(.5, "rgba(0, 247, 255, 0.05)");
		aura.addColorStop(1, "rgba(0, 0, 0, 0)");
		ctx.fillStyle = aura;
		ctx.fillRect(0, 0, width, 320);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
		ctx.lineWidth = 1;
		for (let x = 0; x < width; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		for (let y = 0; y < height; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		CanvasUtils.fillRoundedRect(ctx, 12, 12, 976, height - 24, 20, "transparent", "rgba(88, 101, 242, 0.2)", 1.5);
		const headerTitle = CanvasUtils.cleanText(options.title || "ARCADE CHAMPIONSHIP");
		const headerSub = CanvasUtils.cleanText(options.subtitle || (options.gameName ? `TOP PLAYERS • ${options.gameName.toUpperCase()}` : "GLOBAL LEADERBOARD • REAL-TIME"));
		const topBarGrad = ctx.createLinearGradient(48, 0, 952, 0);
		topBarGrad.addColorStop(0, "#5865f2");
		topBarGrad.addColorStop(.5, "#00f7ff");
		topBarGrad.addColorStop(1, "#ffd700");
		ctx.fillStyle = topBarGrad;
		ctx.fillRect(48, 20, 904, 3);
		const categoryBadge = CanvasUtils.cleanText(options.texts?.categoryBadge || "HALL OF FAME");
		CanvasUtils.fillRoundedRect(ctx, 42, 34, 160, 28, 14, "rgba(88, 101, 242, 0.22)", "#5865f2", 1.2);
		CanvasUtils.drawStarIcon(ctx, 60, 48, 5, 6, 3, "#5865f2");
		ctx.fillStyle = "#5865f2";
		ctx.font = "bold 12px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(categoryBadge, 73, 48);
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 34px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
		ctx.shadowBlur = 12;
		ctx.fillText(headerTitle, 42, 94);
		ctx.restore();
		ctx.save();
		ctx.fillStyle = "#8a91a0";
		ctx.font = "bold 13px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(headerSub, 44, 125);
		ctx.restore();
		const countBadge = options.texts?.topContendersBadge ? CanvasUtils.cleanText(options.texts.topContendersBadge.replace(/\{\{count\}\}/g, String(entries.length))) : `${entries.length} TOP CONTENDERS`;
		CanvasUtils.fillRoundedRect(ctx, 792, 80, 165, 30, 15, "rgba(255, 255, 255, 0.04)", "rgba(255, 255, 255, 0.12)", 1);
		ctx.fillStyle = "#00f7ff";
		ctx.font = "bold 11px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(countBadge, 874, 95);
		const colY = 152;
		ctx.fillStyle = "#555b6a";
		ctx.font = "bold 11px sans-serif";
		ctx.textAlign = "left";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.rankColumn || "RANK"), 48, colY);
		ctx.fillText(CanvasUtils.cleanText(options.texts?.playerColumn || "PLAYER"), 143, colY);
		ctx.fillText(CanvasUtils.cleanText(options.texts?.recordColumn || "RECORD / STREAK"), 610, colY);
		ctx.textAlign = "right";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.scoreColumn || "SCORE / ELO"), 948, colY);
		const startY = headerHeight;
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			const y = startY + i * 64;
			const isTop1 = entry.rank === 1;
			const isTop2 = entry.rank === 2;
			const isTop3 = entry.rank === 3;
			let cardBg = "rgba(18, 24, 38, 0.65)";
			let cardBorder = "rgba(255, 255, 255, 0.07)";
			let rankColor = "#ffffff";
			let rankBg = "rgba(255, 255, 255, 0.08)";
			let scoreColor = "#00f7ff";
			if (isTop1) {
				cardBg = "rgba(255, 215, 0, 0.11)";
				cardBorder = "rgba(255, 215, 0, 0.75)";
				rankColor = "#0a0c12";
				rankBg = "#ffd700";
				scoreColor = "#ffd700";
			} else if (isTop2) {
				cardBg = "rgba(200, 215, 235, 0.09)";
				cardBorder = "rgba(200, 215, 235, 0.65)";
				rankColor = "#0a0c12";
				rankBg = "#c5d2e0";
				scoreColor = "#e6edf5";
			} else if (isTop3) {
				cardBg = "rgba(205, 127, 50, 0.09)";
				cardBorder = "rgba(205, 127, 50, 0.65)";
				rankColor = "#ffffff";
				rankBg = "#cd7f32";
				scoreColor = "#e8a05c";
			}
			CanvasUtils.fillRoundedRect(ctx, 38, y, 924, rowHeight, 12, cardBg, cardBorder, isTop1 ? 2 : 1.2);
			const badgeW = 38;
			const badgeH = 28;
			const badgeX = 50;
			const badgeY = y + 13;
			CanvasUtils.fillRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 7, rankBg);
			ctx.fillStyle = rankColor;
			ctx.font = "bold 13px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (isTop1) {
				CanvasUtils.drawCrownIcon(ctx, 69, badgeY + 7, 12, 7, "#7a5901");
				ctx.fillText("1", 69, badgeY + badgeH / 2 + 5);
			} else ctx.fillText(`#${entry.rank}`, 69, badgeY + badgeH / 2);
			const avatarRadius = 19;
			const avatarX = 118;
			const avatarY = y + rowHeight / 2;
			if (entry.avatarUrl) {
				const borderColor = isTop1 ? "#ffd700" : isTop2 ? "#c5d2e0" : isTop3 ? "#cd7f32" : "#5865f2";
				await CanvasUtils.drawCircularAvatar(ctx, entry.avatarUrl, avatarX, avatarY, avatarRadius, borderColor, 2.5);
			} else {
				ctx.save();
				ctx.beginPath();
				ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
				ctx.fillStyle = "#252b38";
				ctx.fill();
				ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
				ctx.stroke();
				ctx.restore();
			}
			ctx.fillStyle = isTop1 ? "#ffd700" : "#ffffff";
			ctx.font = isTop1 ? "bold 18px sans-serif" : "bold 16px sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			const maxNameLen = 17;
			const cleanName = CanvasUtils.cleanText(entry.username) || entry.username;
			const displayName = cleanName.length > maxNameLen ? cleanName.slice(0, 16) + "…" : cleanName;
			ctx.fillText(displayName, 151, y + rowHeight / 2);
			const statsX = 610;
			if (entry.streak && entry.streak > 1) {
				CanvasUtils.fillRoundedRect(ctx, statsX, y + 15, 105, 24, 12, "rgba(255, 107, 0, 0.18)", "#ff6b00", 1);
				CanvasUtils.drawFlameIcon(ctx, 626, y + rowHeight / 2, 6, "#ff8c38");
				ctx.fillStyle = "#ff8c38";
				ctx.font = "bold 11px sans-serif";
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				const streakText = options.texts?.streakSuffix || "STREAK";
				ctx.fillText(`${entry.streak} ${streakText}`, 637, y + rowHeight / 2);
				if (entry.stats) {
					ctx.fillStyle = "#7c8392";
					ctx.font = "12px sans-serif";
					ctx.textAlign = "left";
					ctx.fillText(CanvasUtils.cleanText(entry.stats), 725, y + rowHeight / 2);
				}
			} else {
				ctx.fillStyle = "#8e95a5";
				ctx.font = "14px sans-serif";
				ctx.textAlign = "left";
				ctx.fillText(CanvasUtils.cleanText(entry.stats) || "—", statsX, y + rowHeight / 2);
			}
			const scoreStr = typeof entry.scoreOrElo === "number" ? entry.scoreOrElo.toLocaleString() : String(entry.scoreOrElo);
			ctx.save();
			ctx.fillStyle = scoreColor;
			ctx.font = "bold 19px monospace";
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			if (isTop1) {
				ctx.shadowColor = "rgba(255, 215, 0, 0.4)";
				ctx.shadowBlur = 8;
			}
			ctx.fillText(scoreStr, 944, y + rowHeight / 2);
			ctx.restore();
		}
		const footerY = height - 16;
		ctx.fillStyle = "#484f60";
		ctx.font = "11px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const footer = CanvasUtils.cleanText(options.texts?.footer || "Powered by @m3rcena/weky • Modern Discord Minigames Engine");
		ctx.fillText(footer, width / 2, footerY);
		return canvas.toBuffer("image/png");
	}
};
// src/canvas/RenderShareCard.ts
/**
* "Share & Flex" Gamer Score Card Generator
* Generates an eSports-grade holographic match victory / performance pass using @napi-rs/canvas.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var RenderShareCard = class {
	static async render(options) {
		const width = 840;
		const height = 480;
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		const accent = options.accentColor || "#00f7ff";
		const bgGrad = ctx.createLinearGradient(0, 0, width, height);
		bgGrad.addColorStop(0, "#070a12");
		bgGrad.addColorStop(.45, "#0d1526");
		bgGrad.addColorStop(1, "#05070d");
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, width, height);
		const leftAura = ctx.createRadialGradient(160, 220, 20, 160, 220, 280);
		leftAura.addColorStop(0, "rgba(0, 247, 255, 0.12)");
		leftAura.addColorStop(.6, "rgba(88, 101, 242, 0.05)");
		leftAura.addColorStop(1, "rgba(0, 0, 0, 0)");
		ctx.fillStyle = leftAura;
		ctx.fillRect(0, 0, width, height);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
		ctx.lineWidth = 1;
		for (let x = 0; x < width; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		for (let y = 0; y < height; y += 40) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		CanvasUtils.fillRoundedRect(ctx, 14, 14, 812, 452, 20, "transparent", accent, 1.8);
		const drawBracket = (cx, cy, dx, dy) => {
			ctx.strokeStyle = accent;
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(cx, cy + dy * 16);
			ctx.lineTo(cx, cy);
			ctx.lineTo(cx + dx * 16, cy);
			ctx.stroke();
		};
		drawBracket(24, 24, 1, 1);
		drawBracket(816, 24, -1, 1);
		drawBracket(24, 456, 1, -1);
		drawBracket(816, 456, -1, -1);
		CanvasUtils.fillRoundedRect(ctx, 44, 30, 170, 28, 14, "rgba(88, 101, 242, 0.22)", "#5865f2", 1.2);
		ctx.fillStyle = "#5865f2";
		ctx.font = "bold 12px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(options.gameName.toUpperCase(), 129, 44);
		const verifiedText = CanvasUtils.cleanText(options.texts?.verifiedStamp || "VERIFIED COMPETITIVE MATCH");
		ctx.font = "bold 12px sans-serif";
		const textWidth = ctx.measureText(verifiedText).width;
		const textRight = 794;
		const textLeft = textRight - textWidth;
		CanvasUtils.drawCheckmarkIcon(ctx, textLeft - 13, 44, 7, "#57f287", "#070a12");
		ctx.fillStyle = "#57f287";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillText(verifiedText, textRight, 44);
		const headline = CanvasUtils.cleanText(options.headline || "MATCH PERFORMANCE PASS");
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 26px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
		ctx.shadowBlur = 10;
		ctx.fillText(headline, 44, 86);
		ctx.restore();
		const profileW = 230;
		const profileH = 320;
		const profileX = 44;
		const profileY = 113;
		CanvasUtils.fillRoundedRect(ctx, profileX, profileY, profileW, profileH, 16, "rgba(16, 22, 36, 0.75)", "rgba(255, 255, 255, 0.08)", 1.2);
		const avatarX = 159;
		const avatarY = 188;
		const avatarRadius = 52;
		if (options.avatarUrl) await CanvasUtils.drawCircularAvatar(ctx, options.avatarUrl, avatarX, avatarY, avatarRadius, accent, 4);
		else {
			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#252b38";
			ctx.fill();
			ctx.strokeStyle = accent;
			ctx.lineWidth = 4;
			ctx.shadowColor = accent;
			ctx.shadowBlur = 12;
			ctx.stroke();
			ctx.restore();
		}
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 22px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const maxName = 14;
		const rawUser = CanvasUtils.cleanText(options.username) || options.username;
		const displayName = rawUser.length > maxName ? rawUser.slice(0, 13) + "…" : rawUser;
		ctx.fillText(displayName, avatarX, 266);
		const rawBadge = CanvasUtils.cleanText(options.rankBadge || "ARCADE PRO") || "ARCADE PRO";
		CanvasUtils.fillRoundedRect(ctx, 84, 286, 150, 26, 13, "rgba(255, 215, 0, 0.16)", "#ffd700", 1.2);
		CanvasUtils.drawStarIcon(ctx, 103, 299, 5, 5, 2.5, "#ffd700");
		ctx.fillStyle = "#ffd700";
		ctx.font = "bold 12px sans-serif";
		ctx.fillText(rawBadge, 167, 299);
		ctx.fillStyle = "#656e80";
		ctx.font = "bold 10px monospace";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.authenticatedSub || "WEKY AUTHENTICATED"), avatarX, 332);
		const rightX = 294;
		CanvasUtils.fillRoundedRect(ctx, rightX, profileY, 502, 95, 14, "rgba(18, 26, 44, 0.85)", "rgba(0, 247, 255, 0.35)", 1.5);
		ctx.fillStyle = "#7b8599";
		ctx.font = "bold 11px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(CanvasUtils.cleanText(options.texts?.primaryHighlight || "PRIMARY HIGHLIGHT"), 316, 129);
		const cleanPrimaryScore = CanvasUtils.cleanText(options.primaryScore) || options.primaryScore;
		ctx.save();
		ctx.fillStyle = accent;
		ctx.font = "bold 38px monospace";
		ctx.shadowColor = accent;
		ctx.shadowBlur = 14;
		ctx.fillText(cleanPrimaryScore, 316, 151);
		ctx.restore();
		const defaultStats = [
			{
				label: "RANK TIER",
				value: rawBadge,
				color: "#ffd700"
			},
			{
				label: "STREAK",
				value: "ACTIVE STREAK",
				color: "#ff8c38"
			},
			{
				label: "ENGINE",
				value: "WEKY 14.28",
				color: "#00f7ff"
			},
			{
				label: "STATUS",
				value: "VERIFIED MATCH",
				color: "#57f287"
			}
		];
		const statsToRender = (options.stats && options.stats.length >= 2 ? options.stats : defaultStats).slice(0, 4);
		const cardW = 244;
		const cardH = 74;
		const gridY = 228;
		for (let i = 0; i < statsToRender.length; i++) {
			const stat = statsToRender[i];
			const col = i % 2;
			const row = Math.floor(i / 2);
			const cardX = rightX + col * 258;
			const cardY = gridY + row * 86;
			CanvasUtils.fillRoundedRect(ctx, cardX, cardY, cardW, cardH, 10, "rgba(16, 22, 36, 0.7)", "rgba(255, 255, 255, 0.08)", 1);
			ctx.fillStyle = "#656e80";
			ctx.font = "bold 11px sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";
			ctx.fillText(CanvasUtils.cleanText(stat.label).toUpperCase(), cardX + 16, cardY + 14);
			ctx.fillStyle = stat.color || "#ffffff";
			ctx.font = "bold 18px monospace";
			ctx.fillText(CanvasUtils.cleanText(stat.value), cardX + 16, cardY + 38);
		}
		const bottomY = 454;
		ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
		for (let bx = 44; bx < 248; bx += 4) {
			const bH = bx % 8 === 0 ? 14 : bx % 6 === 0 ? 10 : 6;
			ctx.fillRect(bx, bottomY - bH / 2, 2, bH);
		}
		ctx.fillStyle = "#4a5263";
		ctx.font = "11px monospace";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		const footerText = CanvasUtils.cleanText(options.texts?.footer || "WEKY-PASSPORT • AUTHENTICATED BY @M3RCENA/WEKY ENGINE");
		ctx.fillText(footerText, 794, bottomY);
		return canvas.toBuffer("image/png");
	}
};
// node_modules/tsdown/esm-shims.js
const getFilename = () => fileURLToPath(import.meta.url);
const getDirname = () => path.dirname(getFilename());
const __dirname = /* @__PURE__ */ getDirname();
// src/soundboard/SoundboardManager.ts
/**
* Dashboard Audio & MP3 Soundboard Engine
* Provides MP3 audio playback cues for Web Dashboards, Headless Game Engines,
* and Cross-Platform Bridge gameplay without requiring Discord Voice Channels.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
/** Built-in high-quality MP3 audio library for Web Dashboards */
const DEFAULT_DASHBOARD_SOUNDS = {
	victory: {
		key: "victory",
		name: "Victory Fanfare",
		category: "victory",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/victory.mp3",
		description: "Triumphant fanfare played on match wins and new high scores."
	},
	defeat: {
		key: "defeat",
		name: "Defeat & Game Over",
		category: "defeat",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/defeat.mp3",
		description: "Somber fail chime played on round defeat or game over."
	},
	action: {
		key: "action",
		name: "Button & Move Click",
		category: "general",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/action.mp3",
		description: "Subtle tactile sound for card interactions, button presses, and moves."
	},
	countdown: {
		key: "countdown",
		name: "Countdown Tick",
		category: "general",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/countdown.mp3",
		description: "Metronome tick for active turn countdowns and speed rounds."
	},
	hit: {
		key: "hit",
		name: "Combat Hit Impact",
		category: "combat",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/hit.mp3",
		description: "Impact sound for weapon strikes and normal attacks in Fight RPG."
	},
	heavy_hit: {
		key: "heavy_hit",
		name: "Heavy Critical Strike",
		category: "combat",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/heavy_hit.mp3",
		description: "Heavy bass strike for critical attacks and boss special moves."
	},
	heal: {
		key: "heal",
		name: "Magic Heal & Shield",
		category: "combat",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/heal.mp3",
		description: "Glittering chime for healing potions and shield activation."
	},
	eat: {
		key: "eat",
		name: "Retro Munch & Collect",
		category: "retro",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/eat.mp3",
		description: "Classic arcade bite sound for Snake apples and 2048 merges."
	},
	tie: {
		key: "tie",
		name: "Match Draw",
		category: "general",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/tie.mp3",
		description: "Harmonic neutral chime for ties and stalemate matches."
	},
	gamestart: {
		key: "gamestart",
		name: "Arcade Coin Insert",
		category: "retro",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/gamestart.mp3",
		description: "Classic coin drop sound when launching a new game session."
	},
	win_streak: {
		key: "win_streak",
		name: "Combo Streak Fire",
		category: "victory",
		url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/win_streak.mp3",
		description: "Ignition flare sound when reaching high win streaks."
	}
};
/** Backwards-compatible alias */
const DEFAULT_DISCORD_SOUNDS = Object.values(DEFAULT_DASHBOARD_SOUNDS).map((s) => ({
	id: s.key,
	name: s.name,
	emoji: s.category === "victory" ? "🏆" : s.category === "combat" ? "⚔️" : s.category === "retro" ? "🕹️" : "🔊"
}));
var SoundboardManager = class {
	client;
	config;
	wekyManager;
	constructor(client, config = {}, wekyManager) {
		this.client = client;
		this.wekyManager = wekyManager;
		this.config = {
			enabled: config.enabled ?? true,
			volume: typeof config.volume === "number" ? Math.max(0, Math.min(1, config.volume)) : .8,
			sounds: config.sounds || {}
		};
	}
	/**
	* Returns whether dashboard audio is enabled.
	*/
	get isEnabled() {
		return this.config.enabled ?? true;
	}
	/**
	* Returns default playback volume (0.0 to 1.0).
	*/
	get volume() {
		return this.config.volume ?? .8;
	}
	/**
	* Retrieves the MP3 sound URL for a given event key.
	* If a custom URL was provided in config, it takes precedence over built-in defaults.
	*/
	getSoundUrl(soundKey) {
		const customUrl = this.config.sounds?.[soundKey];
		if (customUrl) return customUrl;
		const defaultSound = DEFAULT_DASHBOARD_SOUNDS[soundKey];
		if (defaultSound) return defaultSound.url;
		return DEFAULT_DASHBOARD_SOUNDS.action.url;
	}
	/**
	* Retrieves a registered sound entry by key.
	*/
	getSound(soundKey) {
		const customUrl = this.config.sounds?.[soundKey];
		const defaultEntry = DEFAULT_DASHBOARD_SOUNDS[soundKey];
		if (customUrl) return {
			key: soundKey,
			name: defaultEntry?.name || soundKey.toUpperCase(),
			category: defaultEntry?.category || "general",
			url: customUrl,
			description: defaultEntry?.description || "Custom developer MP3 audio track."
		};
		return defaultEntry;
	}
	/**
	* Returns all available sound entries as a dictionary.
	*/
	getAllSounds() {
		const combined = { ...DEFAULT_DASHBOARD_SOUNDS };
		if (this.config.sounds) for (const [key, url] of Object.entries(this.config.sounds)) {
			if (!url) continue;
			const existing = combined[key];
			combined[key] = {
				key,
				name: existing?.name || key.toUpperCase(),
				category: existing?.category || "general",
				url,
				description: existing?.description || "Custom developer MP3 audio track."
			};
		}
		return combined;
	}
	/**
	* Generates a lightweight JSON manifest of all MP3 audio tracks for Web Dashboards.
	*/
	getAudioManifest() {
		const manifest = {};
		const all = this.getAllSounds();
		for (const [k, v] of Object.entries(all)) manifest[k] = {
			name: v.name,
			url: v.url,
			category: v.category
		};
		return manifest;
	}
	/**
	* Returns the directory path containing the bundled MP3 audio files.
	* Useful for web servers (Express/Fastify/Next.js) serving static audio files.
	*/
	getSoundsDirectory() {
		const candidatePaths = [path$1.resolve(process.cwd(), "assets/sounds"), path$1.resolve(process.cwd(), "node_modules/@m3rcena/weky/assets/sounds")];
		try {
			if (typeof __dirname !== "undefined") {
				candidatePaths.push(path$1.resolve(__dirname, "../../assets/sounds"));
				candidatePaths.push(path$1.resolve(__dirname, "../assets/sounds"));
			}
		} catch {}
		for (const p of candidatePaths) if (fs.existsSync(p)) return p;
		return candidatePaths[0];
	}
	/**
	* Returns the local file path for an MP3 audio asset if it exists on disk.
	*/
	getLocalSoundPath(soundKey) {
		const dir = this.getSoundsDirectory();
		return path$1.join(dir, `${soundKey}.mp3`);
	}
	/**
	* Triggers a dashboard audio sound cue, dispatching a `dashboardSound` lifecycle event.
	*/
	triggerSound(soundKey, meta = {}) {
		if (!this.config.enabled) return null;
		const soundUrl = this.getSoundUrl(soundKey);
		const volume = typeof meta.volume === "number" ? Math.max(0, Math.min(1, meta.volume)) : this.volume;
		const eventPayload = {
			sessionId: meta.sessionId,
			game: meta.game,
			soundKey,
			soundUrl,
			volume,
			timestamp: Date.now()
		};
		if (this.wekyManager && typeof this.wekyManager.emit === "function") this.wekyManager.emit("dashboardSound", eventPayload);
		return eventPayload;
	}
	/**
	* Returns a ready-to-use HTML/JavaScript client-side script snippet that web dashboards
	* can include to automatically play MP3 sounds on user interactions and WebSocket events.
	*/
	generateDashboardAudioScript(options = {}) {
		return `
<!-- Weky Web Dashboard Audio Controller -->
<script>
(function() {
  const WEKY_AUDIO_MANIFEST = ${JSON.stringify(this.getAudioManifest())};
  const WekyAudio = {
    manifest: WEKY_AUDIO_MANIFEST,
    volume: ${options.defaultVolume ?? this.volume},
    cache: {},
    play: function(soundKey, customVol) {
      try {
        const sound = WEKY_AUDIO_MANIFEST[soundKey] || { url: soundKey };
        if (!sound.url) return;
        const audio = new Audio(sound.url);
        audio.volume = typeof customVol === 'number' ? Math.max(0, Math.min(1, customVol)) : WekyAudio.volume;
        audio.play().catch(function(err) {
          // Autoplay policy: audio will play once the user interacts with the dashboard
        });
      } catch (e) {
        console.warn('[WekyAudio] Playback notice:', e);
      }
    }
  };
  window.WekyAudio = WekyAudio;
})();
<\/script>`.trim();
	}
	/**
	* Safely plays a soundboard sound for dashboards.
	* Fully backwards compatible with existing minigame call sites.
	*/
	async playSoundWithResult(channelOrKey, soundTypeOrId, options) {
		if (!this.config.enabled) return {
			success: false,
			platform: "dashboard",
			error: "Soundboard integration is disabled in WekyManager configuration."
		};
		const soundKey = (soundTypeOrId || channelOrKey || "action").toString();
		const soundUrl = this.getSoundUrl(soundKey);
		let vol = this.volume;
		let sessionId;
		let game;
		if (typeof options === "object" && options !== null) {
			if (typeof options.volume === "number") vol = options.volume;
			if (options.sessionId) sessionId = options.sessionId;
			if (options.game) game = options.game;
		}
		this.triggerSound(soundKey, {
			sessionId,
			game,
			volume: vol
		});
		return {
			success: true,
			soundKey,
			soundUrl,
			volume: vol,
			platform: "dashboard"
		};
	}
	/**
	* Safely plays a soundboard sound.
	*/
	async playSound(channelOrKey, soundTypeOrId, options) {
		return (await this.playSoundWithResult(channelOrKey, soundTypeOrId, options)).success;
	}
	/**
	* Backwards-compatible stubs for previous voice channel controls.
	*/
	isConnectedTo() {
		return false;
	}
	async joinVoice() {
		return null;
	}
	leaveVoice() {
		return false;
	}
	destroy() {}
};
// src/bridge/WekyBridge.ts
/**
* Weky Cross-Platform Bridge & Dashboard Gateway
* Connects Discord minigame instances with Headless Engines and Web Dashboards,
* enabling real-time game state synchronization, cross-platform move execution,
* and unified leaderboard data access.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
var WekyBridge = class {
	sessions = /* @__PURE__ */ new Map();
	wekyManager;
	constructor(wekyManager) {
		this.wekyManager = wekyManager;
	}
	/**
	* Registers an active game session into the cross-platform bridge.
	*/
	registerSession(session) {
		session.createdAt = session.createdAt || Date.now();
		session.lastUpdated = Date.now();
		this.sessions.set(session.id, session);
		if (this.wekyManager && typeof this.wekyManager.emit === "function") this.wekyManager.emit("bridgeSync", {
			sessionId: session.id,
			game: session.game,
			state: session.state,
			source: session.platform,
			timestamp: Date.now()
		});
	}
	/**
	* Unregisters a game session upon termination.
	*/
	unregisterSession(sessionId) {
		this.sessions.delete(sessionId);
	}
	/**
	* Retrieves a session by ID.
	*/
	getSession(sessionId) {
		return this.sessions.get(sessionId);
	}
	/**
	* Returns all active, uncompleted sessions.
	*/
	getActiveSessions() {
		return Array.from(this.sessions.values()).filter((s) => !s.isGameOver);
	}
	/**
	* Returns all registered sessions regardless of status.
	*/
	getAllSessions() {
		return Array.from(this.sessions.values());
	}
	/**
	* Returns all sessions where a specific user is a participant.
	*/
	getSessionsForPlayer(playerId) {
		return Array.from(this.sessions.values()).filter((s) => s.players.some((p) => p.id === playerId));
	}
	/**
	* Updates state for a session and synchronizes it with bridge listeners.
	*/
	syncState(sessionId, newState, source = "internal") {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		session.state = newState;
		session.lastUpdated = Date.now();
		if (this.wekyManager && typeof this.wekyManager.emit === "function") this.wekyManager.emit("bridgeSync", {
			sessionId: session.id,
			game: session.game,
			state: newState,
			source,
			timestamp: Date.now()
		});
	}
	/**
	* Dispatches a cross-platform move to an active game session.
	* Can be invoked from Web Dashboards, REST APIs, or Discord bots.
	*/
	async dispatchMove(sessionId, move) {
		const session = this.sessions.get(sessionId);
		if (!session) return {
			success: false,
			state: null,
			error: `Session "${sessionId}" not found`
		};
		if (session.isGameOver) return {
			success: false,
			state: session.state,
			error: "Session has already ended"
		};
		let result;
		if (session.onMove) result = await session.onMove(move);
		else if (session.engine && typeof session.engine.action === "function") {
			const engineRes = session.engine.action(move.playerId, move.action, move.payload);
			result = {
				success: engineRes.success,
				state: session.engine.getState(),
				nextTurnId: session.engine.getState().currentTurn,
				isGameOver: engineRes.isGameOver,
				winnerId: engineRes.winnerId,
				announcement: engineRes.announcement
			};
		} else return {
			success: false,
			state: session.state,
			error: "No move handler registered for session"
		};
		if (result.success) {
			session.state = result.state ?? session.state;
			session.lastUpdated = Date.now();
			if (result.nextTurnId) session.currentTurnId = result.nextTurnId;
			if (result.isGameOver) {
				session.isGameOver = true;
				session.winnerId = result.winnerId;
			}
			if (this.wekyManager?.soundboard && typeof this.wekyManager.soundboard.getSoundUrl === "function") {
				let soundKey = "action";
				if (result.isGameOver) soundKey = result.winnerId ? "victory" : "tie";
				else if (move.action === "hit" || move.action === "heavy") soundKey = "hit";
				else if (move.action === "heal") soundKey = "heal";
				else if (move.action === "eat" || session.game === "snake") soundKey = "eat";
				const soundUrl = this.wekyManager.soundboard.getSoundUrl(soundKey);
				result.soundKey = soundKey;
				result.soundUrl = soundUrl;
				this.wekyManager.soundboard.triggerSound(soundKey, {
					sessionId: session.id,
					game: session.game
				});
			}
			if (this.wekyManager && typeof this.wekyManager.emit === "function") {
				this.wekyManager.emit("crossPlatformMove", {
					sessionId: session.id,
					game: session.game,
					playerId: move.playerId,
					action: move.action,
					payload: move.payload,
					platform: move.sourcePlatform
				});
				this.wekyManager.emit("bridgeSync", {
					sessionId: session.id,
					game: session.game,
					state: session.state,
					source: move.sourcePlatform,
					timestamp: Date.now()
				});
			}
		}
		return result;
	}
	/**
	* Ends an active game session and flags it as completed.
	*/
	endSession(sessionId, outcome = {}) {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		session.isGameOver = true;
		session.winnerId = outcome.winnerId;
		session.lastUpdated = Date.now();
	}
	/**
	* Renders a live visual snapshot of the session (Canvas image Buffer or Data URL).
	*/
	async renderSessionSnapshot(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return null;
		if (session.renderSnapshot) return await session.renderSnapshot();
		if (session.engine && typeof session.engine.renderDataURL === "function") return await session.engine.renderDataURL();
		if (session.engine && typeof session.engine.renderBuffer === "function") return await session.engine.renderBuffer();
		return null;
	}
	/**
	* Returns a high-level overview of live games, active sessions, and leaderboard data for Web Dashboards.
	*/
	async getDashboardOverview() {
		const activeSessions = this.getActiveSessions().map((s) => ({
			id: s.id,
			game: s.game,
			platform: s.platform,
			players: s.players.map((p) => ({
				id: p.id,
				username: p.username,
				platform: p.platform
			})),
			currentTurnId: s.currentTurnId,
			lastUpdated: s.lastUpdated,
			isGameOver: s.isGameOver
		}));
		let topContenders = [];
		let totalPlayers = 0;
		if (this.wekyManager && this.wekyManager.leaderboard) {
			topContenders = (await this.wekyManager.leaderboard.getTopByElo(5)).map((p, index) => ({
				rank: index + 1,
				username: p.username,
				elo: p.elo,
				wins: p.wins,
				winStreak: p.winStreak
			}));
			totalPlayers = (await this.wekyManager.leaderboard.exportData()).length;
		}
		return {
			activeGamesCount: activeSessions.length,
			totalLeaderboardPlayers: totalPlayers,
			activeSessions,
			topContenders
		};
	}
	/**
	* Exports full state dump of active sessions and leaderboard data for external database syncing.
	*/
	async exportAllState() {
		const sessions = Array.from(this.sessions.values()).map((s) => ({
			...s,
			engine: void 0,
			onMove: void 0,
			renderSnapshot: void 0
		}));
		let leaderboard;
		if (this.wekyManager?.leaderboard) leaderboard = await this.wekyManager.leaderboard.exportData();
		return {
			sessions,
			leaderboard
		};
	}
	/**
	* Imports state dump from an external database or dashboard backend.
	*/
	async importAllState(data) {
		if (data.sessions) for (const s of data.sessions) this.sessions.set(s.id, s);
		if (data.leaderboard && this.wekyManager?.leaderboard) await this.wekyManager.leaderboard.importData(data.leaderboard);
	}
};
// src/utils/Notifier.ts
/**
* Utility functions for update checking and terminal box notifications.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
const yellow = (s) => `\x1b[33m${s}\x1b[39m`;
const green = (s) => `\x1b[32m${s}\x1b[39m`;
const red = (s) => `\x1b[31m${s}\x1b[39m`;
const cyan = (s) => `\x1b[36m${s}\x1b[39m`;
/**
* Strips ANSI color escape codes to compute visible string length.
*/
function stripAnsi(str) {
	return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}
/**
* Renders an array of text messages inside a styled terminal box.
*/
function boxConsole(messages) {
	const stripped = messages.map((m) => stripAnsi(m));
	const maxLen = Math.max(...stripped.map((s) => s.length)) + 8;
	const line = yellow("─".repeat(maxLen));
	console.log(yellow("┌") + line + yellow("┐"));
	console.log(yellow("│") + " ".repeat(maxLen) + yellow("│"));
	for (let i = 0; i < messages.length; i++) {
		const padTotal = maxLen - stripped[i].length;
		const padLeft = Math.floor(padTotal / 2);
		const padRight = padTotal - padLeft;
		console.log(yellow("│") + " ".repeat(padLeft) + messages[i] + " ".repeat(padRight) + yellow("│"));
	}
	console.log(yellow("│") + " ".repeat(maxLen) + yellow("│"));
	console.log(yellow("└") + line + yellow("┘"));
}
/**
* Compares two semantic version strings.
* Returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2.
*/
function compareSemver(v1, v2) {
	const clean1 = v1.replace(/^v/, "").split("-")[0].split(".").map((n) => parseInt(n, 10) || 0);
	const clean2 = v2.replace(/^v/, "").split("-")[0].split(".").map((n) => parseInt(n, 10) || 0);
	for (let i = 0; i < Math.max(clean1.length, clean2.length); i++) {
		const num1 = clean1[i] || 0;
		const num2 = clean2[i] || 0;
		if (num1 > num2) return 1;
		if (num1 < num2) return -1;
	}
	return 0;
}
/**
* Fetches the latest published version of `@m3rcena/weky` from the npm registry.
*/
async function fetchLatestVersion() {
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 3500);
		const res = await fetch("https://registry.npmjs.org/@m3rcena/weky/latest", {
			signal: controller.signal,
			headers: { "User-Agent": "@m3rcena/weky-update-notifier" }
		});
		clearTimeout(timer);
		if (res.ok) {
			const data = await res.json();
			return typeof data.version === "string" ? data.version : null;
		}
	} catch {
		try {
			const { exec } = await import("child_process");
			const { promisify } = await import("util");
			const { stdout } = await promisify(exec)("npm show @m3rcena/weky version", { timeout: 3500 });
			return stdout.trim() || null;
		} catch {
			return null;
		}
	}
	return null;
}
/**
* Checks if a newer version of `@m3rcena/weky` is available and logs the notification box.
* @param currentVersion Current running package version.
* @param disabled If true, update checking is bypassed.
* @param gameName Optional name of the game being executed.
*/
async function checkPackageUpdates(currentVersion, disabled, gameName) {
	if (disabled) return;
	try {
		const latest = await fetchLatestVersion();
		if (!latest) return;
		if (compareSemver(currentVersion, latest) < 0) {
			const messages = [];
			if (gameName) messages.push(`Are you using ${red(gameName)}? Don't lose out on new features!`);
			messages.push(`New ${green("version")} of ${yellow("@m3rcena/weky")} is available!`, `${red(currentVersion)} -> ${green(latest)}`, `Registry: ${cyan("https://www.npmjs.com/package/@m3rcena/weky")}`, `Run ${green(`npm i @m3rcena/weky@${latest}`)} to update!`);
			boxConsole(messages);
		}
	} catch {}
}
// src/core/WekyManager.ts
/**
* Main manager class for the `@m3rcena/weky` Discord minigames engine.
* Extends EventEmitter to broadcast game lifecycle telemetry:
* - `gameStart`: ({ game, user, channelId })
* - `gameOver`: ({ game, user, outcome, score, timeElapsed })
* - `gameError`: ({ game, error, context })
* - `unauthorizedClick`: ({ game, user, interaction })
*/
var WekyManager = class extends EventEmitter {
	_client;
	_eventManager;
	defaultTimeout = 6e4;
	embedColor;
	unauthorizedMessage;
	notifyUpdates = true;
	soundboard;
	leaderboard;
	bridge;
	/**
	* Initializes the WekyManager.
	* @param client The Discord.js Client instance.
	* @param options Optional configuration object or legacy notifyUpdates boolean.
	* @param notifyUpdatesParam Legacy parameter for update notifications.
	*/
	constructor(client, options, notifyUpdatesParam) {
		super();
		if (!client || !(client instanceof Client) && typeof client.on !== "function") throw new TypeError("[WekyManager] A valid Discord.js Client instance is required.");
		this._client = client;
		this._eventManager = new EventManager(this._client);
		this.bridge = new WekyBridge(this);
		if (typeof options === "boolean") this.notifyUpdates = options;
		else if (typeof options === "string") this.notifyUpdates = typeof notifyUpdatesParam === "boolean" ? notifyUpdatesParam : true;
		else if (options && typeof options === "object") {
			if (typeof options.defaultTimeout === "number") this.defaultTimeout = options.defaultTimeout;
			if (options.embedColor !== void 0) this.embedColor = options.embedColor;
			if (typeof options.unauthorizedMessage === "string") this.unauthorizedMessage = options.unauthorizedMessage;
			if (typeof options.notifyUpdates === "boolean") this.notifyUpdates = options.notifyUpdates;
		}
		const sbConfig = options && typeof options === "object" ? options.soundboard : void 0;
		this.soundboard = new SoundboardManager(this._client, sbConfig, this);
		const lbConfig = options && typeof options === "object" ? options.leaderboard : void 0;
		this.leaderboard = new LeaderboardManager({
			...lbConfig,
			wekyManager: this
		});
		if (this.notifyUpdates) checkPackageUpdates(version, false).catch(() => {});
	}
	on(event, listener) {
		return super.on(event, listener);
	}
	once(event, listener) {
		return super.once(event, listener);
	}
	emit(event, ...args) {
		return super.emit(event, ...args);
	}
	off(event, listener) {
		return super.off(event, listener);
	}
	addListener(event, listener) {
		return super.addListener(event, listener);
	}
	removeListener(event, listener) {
		return super.removeListener(event, listener);
	}
	/**
	* Manually checks for newer versions of @m3rcena/weky.
	*/
	async checkUpdates(gameName) {
		await checkPackageUpdates(version, !this.notifyUpdates, gameName);
	}
	/** Backwards compatibility accessor */
	get _EventManager() {
		return this._eventManager;
	}
	/**
	* Starts a new **2048** minigame session.
	*/
	async create2048(options) {
		await new Game2048(this, options).start();
	}
	/**
	* Starts a new **Calculator** session with safe mathematical evaluation.
	*/
	async createCalculator(options) {
		await new Calculator(this, options).start();
	}
	/**
	* Starts a new **Chaos Words** minigame session.
	*/
	async createChaosWords(options) {
		await new ChaosWords(this, options).start();
	}
	/**
	* Starts a new **Fast Type** speed typing challenge.
	*/
	async createFastType(options) {
		await new FastType(this, options).start();
	}
	/**
	* Starts a new turn-based **Fight** duel RPG between two players.
	*/
	async createFight(options) {
		await new Fight(this, options).start();
	}
	/**
	* Starts a new **Guess The Number** game (Solo or Public).
	*/
	async createGuessTheNumber(options) {
		await new GuessTheNumber(this, options).start();
	}
	/**
	* Starts a new **Guess The Pokemon** game featuring native canvas silhouettes.
	*/
	async createGuessThePokemon(options) {
		await new GuessThePokemon(this, options).start();
	}
	/**
	* Starts a new **Hangman** game featuring high-resolution canvas gallows.
	*/
	async createHangman(options) {
		await new Hangman(this, options).start();
	}
	/**
	* Starts a new **Lie Swatter** true-or-false trivia quiz.
	*/
	async createLieSwatter(options) {
		await new LieSwatter(this, options).start();
	}
	/**
	* Starts a new **Never Have I Ever** interactive party voting game.
	*/
	async createNeverHaveIEver(options) {
		await new NeverHaveIEver(this, options).start();
	}
	/**
	* Starts a new **Quick Click** reaction speed test.
	*/
	async createQuickClick(options) {
		await new QuickClick(this, options).start();
	}
	/**
	* Starts a new **Shuffle Guess** word unscramble puzzle.
	*/
	async createShuffleGuess(options) {
		await new ShuffleGuess(this, options).start();
	}
	/**
	* Starts a new **Snake** arcade game featuring retro canvas graphics.
	*/
	async createSnake(options) {
		await new Snake(this, options).start();
	}
	/**
	* Starts a new **Will You Press The Button?** dilemma game.
	*/
	async createWillYouPressTheButton(options) {
		await new WillYouPressTheButton(this, options).start();
	}
	/**
	* Starts a new **Would You Rather?** dilemma game.
	*/
	async createWouldYouRather(options) {
		await new WouldYouRather(this, options).start();
	}
	/**
	* Starts a new **Rock Paper Scissors** game (Solo vs Bot or 2-Player).
	*/
	async createRPS(options) {
		await new RockPaperScissors(this, options).start();
	}
	/** Alias for createRPS */
	async createRockPaperScissors(options) {
		return this.createRPS(options);
	}
	/**
	* Starts a new interactive **Tic Tac Toe** match.
	*/
	async createTicTacToe(options) {
		await new TicTacToe(this, options).start();
	}
	/**
	* Starts a new **Arcade Hub** central minigames launcher cabinet.
	*/
	async createArcadeHub(options) {
		await new ArcadeHub(this, options).start();
	}
	/**
	* Starts a new automated or manual **Tournament** bracket championship (4 to 16 players).
	*/
	async createTournament(options) {
		const tournament = new TournamentManager(this, options);
		await tournament.start();
		return tournament;
	}
	/**
	* Generates tournament bracket progress manually for any game or custom competition.
	*/
	async generateTournamentProgress(options) {
		return TournamentManager.generateBracketProgress(options);
	}
	/**
	* Generates a tournament bracket canvas chart image buffer.
	*/
	async renderTournamentBracket(options) {
		return RenderBracket.render(options);
	}
	/**
	* Generates a high-score arcade leaderboard card image buffer.
	*/
	async renderLeaderboard(options) {
		return RenderLeaderboard.render(options);
	}
	/**
	* Generates a "Share & Flex" gamer score card image buffer.
	*/
	async renderShareCard(options) {
		return RenderShareCard.render(options);
	}
	/**
	* Launches any minigame by key (used by ArcadeHub and custom launchers).
	*/
	async launchGameByKey(gameKey, contextOrOptions) {
		const baseOpts = {
			context: contextOrOptions instanceof ContextAdapter ? contextOrOptions.raw : contextOrOptions?.context || contextOrOptions?.interaction || contextOrOptions?.message || contextOrOptions,
			...typeof contextOrOptions === "object" && !(contextOrOptions instanceof ContextAdapter) ? contextOrOptions : {}
		};
		switch (gameKey.toLowerCase()) {
			case "2048": return this.create2048(baseOpts);
			case "calculator": return this.createCalculator(baseOpts);
			case "chaoswords": return this.createChaosWords(baseOpts);
			case "fasttype": return this.createFastType(baseOpts);
			case "fight": return this.createFight({
				...baseOpts,
				ai: true
			});
			case "gtn":
			case "guessthenumber": return this.createGuessTheNumber(baseOpts);
			case "gtp":
			case "guessthepokemon": return this.createGuessThePokemon(baseOpts);
			case "hangman": return this.createHangman(baseOpts);
			case "lieswatter": return this.createLieSwatter(baseOpts);
			case "nhie":
			case "neverhaveiever": return this.createNeverHaveIEver(baseOpts);
			case "quickclick": return this.createQuickClick(baseOpts);
			case "rps":
			case "rockpaperscissors": return this.createRPS(baseOpts);
			case "shuffleguess": return this.createShuffleGuess(baseOpts);
			case "snake": return this.createSnake(baseOpts);
			case "tictactoe": return this.createTicTacToe({
				...baseOpts,
				ai: true
			});
			case "wyptb":
			case "willyoupressthebutton": return this.createWillYouPressTheButton(baseOpts);
			case "wyr":
			case "wouldyourather": return this.createWouldYouRather(baseOpts);
			default: throw new Error(`[WekyManager] Unknown game key: ${gameKey}`);
		}
	}
	_getContextUserID(context) {
		if (!context) return "";
		if (context.author?.id) return context.author.id;
		if (context.user?.id) return context.user.id;
		if (context.member?.id) return context.member.id;
		return "";
	}
	getRandomString(length = 8, prefix = "weky_") {
		return getRandomString(length, prefix);
	}
	convertTime(timeMs) {
		return formatTime(timeMs);
	}
	shuffleString(str) {
		return shuffleString(str);
	}
	shuffleArray(arr) {
		return shuffleArray(arr);
	}
	/**
	* Builds an EmbedBuilder instance with defaults applied.
	*/
	_createEmbed(embedOptions = {}, noFields = false) {
		const embed = new EmbedBuilder();
		if (embedOptions.title) embed.setTitle(embedOptions.title);
		if (embedOptions.description) embed.setDescription(embedOptions.description);
		if (embedOptions.url) embed.setURL(embedOptions.url);
		if (embedOptions.thumbnail) embed.setThumbnail(embedOptions.thumbnail);
		if (embedOptions.image) embed.setImage(embedOptions.image);
		const color = embedOptions.color || this.embedColor;
		embed.setColor(safeResolveColor(color, 5793266));
		if (embedOptions.footer) embed.setFooter(embedOptions.footer);
		if (embedOptions.timestamp) embed.setTimestamp(embedOptions.timestamp === true ? /* @__PURE__ */ new Date() : new Date(embedOptions.timestamp));
		if (embedOptions.author) embed.setAuthor({
			name: embedOptions.author.name,
			iconURL: embedOptions.author.icon_url,
			url: embedOptions.author.url
		});
		if (!noFields && embedOptions.fields && embedOptions.fields.length > 0) embed.setFields(embedOptions.fields);
		return embed;
	}
	/**
	* Retrieves dashboard overview metrics, live sessions, and leaderboard data for Web Dashboards.
	*/
	async getDashboardOverview() {
		return await this.bridge.getDashboardOverview();
	}
	/**
	* Dispatches a cross-platform move from Web Dashboard, REST API, or Discord.
	*/
	async dispatchCrossPlatformMove(sessionId, move) {
		return await this.bridge.dispatchMove(sessionId, move);
	}
	/**
	* Registers an external or hybrid game session with the cross-platform bridge.
	*/
	registerCrossPlatformSession(session) {
		this.bridge.registerSession(session);
	}
};
// src/canvas/WekyCanvas.ts
/**
* Centralized graphics and card generation suite for `@m3rcena/weky`.
* Ideal for web dashboards, REST APIs, custom UIs, and external webhooks.
*/
var WekyCanvas = class {
	/**
	* Converts an image Buffer into a web-ready Data URL string (`data:image/png;base64,...`).
	* Can be directly used in HTML `<img src="..." />` or frontend frameworks (React, Vue, Svelte).
	*/
	static toDataURL(buffer, mime = "image/png") {
		return `data:${mime};base64,${buffer.toString("base64")}`;
	}
	/**
	* Converts an image Buffer into a base64 encoded string.
	*/
	static toBase64(buffer) {
		return buffer.toString("base64");
	}
	/**
	* Fight Duel canvas card renderers.
	*/
	static fight = {
		/**
		* Renders a Challenge / Request card between two players.
		*/
		request: (challenger, opponent) => {
			return RenderFight.renderRequestCard(challenger, opponent);
		},
		/**
		* Renders an active battle arena card showing both fighters, health bars, coins, and current turn indicator.
		*/
		battle: (player1, player2, currentTurnUserId, announcement) => {
			return RenderFight.renderBattleCard(player1, player2, currentTurnUserId, announcement);
		},
		/**
		* Renders the battle outcome card (Victory, Surrender, Denied, Timeout).
		*/
		outcome: (winner, loser, type) => {
			return RenderFight.renderOutcomeCard(winner, loser, type);
		}
	};
	/**
	* 2048 game board card renderer.
	*/
	static game2048(board, score, username, avatarUrl, state) {
		return Render2048.renderBoard(board, score, username, avatarUrl, state);
	}
	/**
	* Snake game board card renderer.
	*/
	static snake(snake, food, direction, score, gridSize, username, avatarUrl, isGameOver, overlayTitle) {
		return RenderSnake.renderBoard(snake, food, direction, score, gridSize, username, avatarUrl, isGameOver, overlayTitle);
	}
	/**
	* Hangman gallows and word card renderer.
	*/
	static hangman(wrongGuessesCount, displayWord, guessedLetters, username = "Player", avatarUrl = "", gameOver = false, won = false, fullWord) {
		return RenderHangman.renderCard(wrongGuessesCount, displayWord, guessedLetters, username, avatarUrl, gameOver, won, fullWord);
	}
	/**
	* Pokemon silhouette / revealed card renderer.
	*/
	static pokemon(pokemon, reveal = false) {
		return RenderPokemon.renderCard({
			name: pokemon.name,
			imageUrl: pokemon.imageUrl || pokemon.image || "",
			types: pokemon.types || ["Normal"],
			abilities: pokemon.abilities || [],
			id: pokemon.id
		}, reveal);
	}
};
// src/engines/CalculatorEngine.ts
const STANDARD_KEYS = [
	"DC",
	"(",
	")",
	"⌫",
	"AC",
	"7",
	"8",
	"9",
	"÷",
	"^",
	"4",
	"5",
	"6",
	"x",
	"SQRT",
	"1",
	"2",
	"3",
	" - ",
	" + ",
	"2nd",
	"0",
	".",
	"ans",
	"="
];
const SCIENTIFIC_KEYS = [
	"DC",
	"SIN",
	"COS",
	"TAN",
	"AC",
	"LG",
	"LN",
	"x!",
	"1/x",
	"⌫",
	"RND",
	"π",
	"e",
	"÷",
	"x",
	"(",
	")",
	"%",
	" - ",
	" + ",
	"2nd",
	"0",
	".",
	"ans",
	"="
];
const INVALID_START_KEYS = [
	"⌫",
	"AC",
	"=",
	"x",
	"÷",
	"%",
	"^",
	"x!"
];
/**
* Headless Calculator engine for web dashboards and custom clients.
*/
var CalculatorEngine = class {
	expression = " ";
	lastAnswer = "";
	hasCalculated = false;
	is2nd = false;
	constructor() {}
	/**
	* Toggles between standard arithmetic keypad and 2nd / scientific keypad.
	*/
	toggle2nd() {
		this.is2nd = !this.is2nd;
		return this.is2nd;
	}
	/**
	* Clears the current expression (AC).
	*/
	clear() {
		this.expression = " ";
	}
	/**
	* Erases the last character or token (Backspace).
	*/
	backspace() {
		if (!this.expression || this.expression === " ") return;
		this.expression = this.expression.endsWith(" ") ? this.expression.slice(0, -3) : this.expression.slice(0, -1);
		if (this.expression === "") this.expression = " ";
	}
	/**
	* Alias for input(key).
	*/
	press(key) {
		return this.input(key);
	}
	/**
	* Handles button click or input.
	*/
	input(key) {
		if (key === "2nd") {
			this.toggle2nd();
			return;
		}
		if (key === "AC") {
			this.clear();
			return;
		}
		if (key === "⌫") {
			this.backspace();
			return;
		}
		if (key === "=") return this.calculate();
		let token = key;
		if (token === "×" || token === "*") token = "x";
		if (token === "+") token = " + ";
		if (token === "-") token = " - ";
		this.expression += token;
	}
	/**
	* Calculates the current expression safely using MathEvaluator.
	*/
	calculate() {
		if (!this.expression.trim()) return { error: "Empty expression" };
		const clean = this.expression.replace(/x/g, "*").replace(/÷/g, "/").replace(/π/g, "pi").replace(/ans/g, this.lastAnswer || "0").trim();
		const evalResult = MathEvaluator.evaluate(clean, Number(this.lastAnswer) || 0);
		if (evalResult.error) {
			this.expression = "Error";
			return { error: evalResult.error };
		}
		const res = evalResult.formatted;
		this.expression = String(res);
		this.lastAnswer = String(res);
		this.hasCalculated = true;
		return { result: res };
	}
	/**
	* Returns a snapshot of the calculator's current state.
	*/
	getState() {
		const modeTag = this.is2nd ? " [2nd / SCI]" : "";
		return {
			expression: this.expression,
			display: `${this.expression}${modeTag}`,
			lastAnswer: this.lastAnswer,
			is2nd: this.is2nd,
			hasCalculated: this.hasCalculated
		};
	}
	/**
	* Returns the 5x5 keypad controls schema for dashboard rendering.
	*/
	getControls() {
		const keys = this.is2nd ? SCIENTIFIC_KEYS : STANDARD_KEYS;
		const isEmpty = this.expression.trim() === "";
		const rows = [];
		for (let i = 0; i < keys.length; i += 5) {
			const components = keys.slice(i, i + 5).map((k) => {
				let disabled = false;
				if (k === "ans" && !this.hasCalculated) disabled = true;
				else if (isEmpty && INVALID_START_KEYS.includes(k)) disabled = true;
				let style = "secondary";
				if (k === "=") style = "success";
				else if (k === "2nd") style = this.is2nd ? "success" : "primary";
				else if (k === "AC" || k === "DC") style = "danger";
				else if ([
					"x",
					"÷",
					" - ",
					" + ",
					"^",
					"%"
				].includes(k)) style = "primary";
				return {
					id: k,
					label: k,
					emoji: k === "DC" ? "🛑" : void 0,
					style,
					disabled
				};
			});
			rows.push({ components });
		}
		return rows;
	}
};
// src/engines/FightEngine.ts
/**
* Headless Fight Duel RPG engine for web dashboards and custom APIs.
*/
var FightEngine = class {
	p1;
	p2;
	currentTurnId;
	phase = "REQUEST";
	lastAnnouncement = "Duel requested!";
	winner;
	loser;
	endReason;
	constructor(options) {
		const defaultHp = options.startHealth ?? 100;
		this.p1 = {
			id: options.player1.id,
			username: options.player1.username,
			avatarUrl: options.player1.avatarUrl || "",
			health: options.player1.health ?? defaultHp,
			coins: options.player1.coins ?? 0,
			lastAction: "Challenged opponent",
			activeEffects: []
		};
		this.p2 = {
			id: options.player2.id,
			username: options.player2.username,
			avatarUrl: options.player2.avatarUrl || "",
			health: options.player2.health ?? defaultHp,
			coins: options.player2.coins ?? 0,
			lastAction: "Awaiting start",
			activeEffects: []
		};
		this.currentTurnId = this.p1.id;
		if (options.initialPhase === "REQUEST") {
			this.phase = "REQUEST";
			this.lastAnnouncement = "Duel requested!";
		} else {
			this.phase = "FIGHT";
			this.lastAnnouncement = `The duel begins! It's ${this.p1.username}'s turn!`;
		}
	}
	/**
	* Accepts the challenge and transitions to FIGHT phase.
	*/
	acceptChallenge() {
		this.phase = "FIGHT";
		this.currentTurnId = Math.random() < .5 ? this.p1.id : this.p2.id;
		const starter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
		this.lastAnnouncement = `The duel begins! It's ${starter.username}'s turn!`;
	}
	/**
	* Universal action method accepting either (action, playerId) or (playerId, action) and case-insensitive strings.
	*/
	action(playerId, actionType) {
		let act = actionType.toLowerCase();
		if (act === "attack") act = "hit";
		const res = this.performAction(act, playerId);
		return {
			success: res.success,
			message: res.message,
			announcement: this.lastAnnouncement,
			isGameOver: res.isGameOver,
			winnerId: res.winnerId
		};
	}
	/**
	* Performs a combat action for a fighter.
	*/
	performAction(action, playerId) {
		if (this.phase === "REQUEST") return {
			success: false,
			message: "Duel has not started yet. Call acceptChallenge() first."
		};
		if (this.phase === "ENDED") return {
			success: false,
			message: "Duel has already ended."
		};
		if (playerId !== this.p1.id && playerId !== this.p2.id) return {
			success: false,
			message: "User is not a combatant in this duel."
		};
		if (action === "surrender") {
			this.winner = playerId === this.p1.id ? this.p2 : this.p1;
			this.loser = playerId === this.p1.id ? this.p1 : this.p2;
			this.phase = "ENDED";
			this.endReason = "SURRENDER";
			this.lastAnnouncement = `${this.loser.username} surrendered! ${this.winner.username} wins!`;
			return {
				success: true,
				message: this.lastAnnouncement,
				isGameOver: this.phase === "ENDED",
				winnerId: this.winner?.id
			};
		}
		if (playerId !== this.currentTurnId) return {
			success: false,
			message: "It is not this player's turn."
		};
		const attacker = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
		const defender = this.currentTurnId === this.p1.id ? this.p2 : this.p1;
		if (action === "hit" || action === "heavy") {
			const isHeavy = action === "heavy";
			let damage = isHeavy ? Math.floor(Math.random() * 18) + 18 : Math.floor(Math.random() * 13) + 10;
			if (isHeavy && Math.random() < .25) {
				attacker.lastAction = "Missed Heavy Attack!";
				this.lastAnnouncement = `${attacker.username} swung hard but missed!`;
				attacker.coins += 5;
			} else {
				if (attacker.activeEffects?.includes("2x Damage")) {
					damage *= 2;
					attacker.activeEffects = attacker.activeEffects.filter((e) => e !== "2x Damage");
				}
				if (defender.activeEffects?.includes("Shield")) {
					damage = Math.floor(damage / 2);
					defender.activeEffects = defender.activeEffects.filter((e) => e !== "Shield");
				}
				defender.health = Math.max(0, defender.health - damage);
				attacker.coins += isHeavy ? 15 : 10;
				attacker.lastAction = `${isHeavy ? "Heavy Hit" : "Hit"} for ${damage} DMG`;
				this.lastAnnouncement = `${attacker.username} used ${isHeavy ? "Heavy Attack" : "Normal Attack"} dealing ${damage} damage!`;
			}
		} else if (action === "heal") {
			if (attacker.health >= 85) {
				this.lastAnnouncement = `${attacker.username} tried to heal, but HP is already high!`;
				attacker.lastAction = "Heal failed (High HP)";
			} else {
				const heal = Math.floor(Math.random() * 11) + 15;
				attacker.health = Math.min(100, attacker.health + heal);
				attacker.coins += 5;
				attacker.lastAction = `Healed +${heal} HP`;
				this.lastAnnouncement = `${attacker.username} healed for +${heal} HP!`;
			}
		} else if (action === "shield") {
			if (attacker.coins < 25) return {
				success: false,
				message: "Not enough coins for Shield (requires 25)."
			};
			attacker.coins -= 25;
			if (!attacker.activeEffects) attacker.activeEffects = [];
			if (!attacker.activeEffects.includes("Shield")) attacker.activeEffects.push("Shield");
			attacker.lastAction = "Activated Shield";
			this.lastAnnouncement = `${attacker.username} activated a Shield! (-50% damage taken)`;
		} else if (action === "double") {
			if (attacker.coins < 30) return {
				success: false,
				message: "Not enough coins for 2x Damage (requires 30)."
			};
			attacker.coins -= 30;
			if (!attacker.activeEffects) attacker.activeEffects = [];
			if (!attacker.activeEffects.includes("2x Damage")) attacker.activeEffects.push("2x Damage");
			attacker.lastAction = "Activated 2x DMG";
			this.lastAnnouncement = `${attacker.username} activated 2x Damage for next attack!`;
		}
		if (defender.health <= 0) {
			this.winner = attacker;
			this.loser = defender;
			this.phase = "ENDED";
			this.endReason = "WIN";
			this.lastAnnouncement = `${attacker.username} knocked out ${defender.username} and won!`;
		} else this.currentTurnId = defender.id;
		return {
			success: true,
			message: this.lastAnnouncement,
			isGameOver: this.phase === "ENDED",
			winnerId: this.winner?.id
		};
	}
	/**
	* Returns current combat state.
	*/
	getState() {
		return {
			p1: {
				...this.p1,
				activeEffects: [...this.p1.activeEffects || []]
			},
			p2: {
				...this.p2,
				activeEffects: [...this.p2.activeEffects || []]
			},
			currentTurnId: this.currentTurnId,
			phase: this.phase,
			lastAnnouncement: this.lastAnnouncement,
			winner: this.winner ? { ...this.winner } : void 0,
			loser: this.loser ? { ...this.loser } : void 0,
			endReason: this.endReason
		};
	}
	/**
	* Returns control buttons suitable for web dashboard or custom bot.
	*/
	getControls(playerId) {
		const isPlayerTurn = !playerId || playerId === this.currentTurnId;
		const isFightPhase = this.phase === "FIGHT";
		const disabled = !isFightPhase || !isPlayerTurn;
		const activePlayer = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
		const canShield = !disabled && activePlayer.coins >= 25;
		const canDouble = !disabled && activePlayer.coins >= 30;
		return [{ components: [
			{
				id: "hit",
				label: "Attack",
				emoji: "⚔️",
				style: "primary",
				disabled
			},
			{
				id: "heavy",
				label: "Heavy Attack",
				emoji: "💥",
				style: "primary",
				disabled
			},
			{
				id: "heal",
				label: "Heal (+15-25 HP)",
				emoji: "💚",
				style: "success",
				disabled
			}
		] }, { components: [
			{
				id: "shield",
				label: "Shield (25¢)",
				emoji: "🛡️",
				style: "secondary",
				disabled: !canShield
			},
			{
				id: "double",
				label: "2x Damage (30¢)",
				emoji: "⚡",
				style: "secondary",
				disabled: !canDouble
			},
			{
				id: "surrender",
				label: "Surrender",
				emoji: "🏳️",
				style: "danger",
				disabled: !isFightPhase
			}
		] }];
	}
	/**
	* Renders the current fight arena card as a PNG buffer.
	*/
	async renderCard() {
		if (this.phase === "REQUEST") return RenderFight.renderRequestCard(this.p1, this.p2);
		if (this.phase === "ENDED" && this.winner) return RenderFight.renderOutcomeCard(this.winner, this.loser, this.endReason);
		return RenderFight.renderBattleCard(this.p1, this.p2, this.currentTurnId, this.lastAnnouncement);
	}
	/**
	* Renders the current fight card as a Data URL string.
	*/
	async renderDataURL() {
		const buffer = await this.renderCard();
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/Game2048Engine.ts
/**
* Headless 2048 game engine for web dashboards, custom bots, and REST/WebSocket APIs.
*/
var Game2048Engine = class {
	board = [];
	score = 0;
	hasWon = false;
	isGameOver = false;
	moveCount = 0;
	username;
	avatarUrl;
	constructor(options) {
		this.username = options?.username || "Player";
		this.avatarUrl = options?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
		this.reset();
	}
	/**
	* Resets the game to an initial state with 2 spawned tiles.
	*/
	reset() {
		this.board = Array(4).fill(0).map(() => Array(4).fill(0));
		this.score = 0;
		this.hasWon = false;
		this.isGameOver = false;
		this.moveCount = 0;
		this.spawnTile();
		this.spawnTile();
	}
	/**
	* Spawns a random tile (2 with 90% probability, 4 with 10% probability).
	*/
	spawnTile() {
		const empty = [];
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (this.board[r][c] === 0) empty.push({
			r,
			c
		});
		if (empty.length > 0) {
			const spot = empty[Math.floor(Math.random() * empty.length)];
			this.board[spot.r][spot.c] = Math.random() < .9 ? 2 : 4;
		}
	}
	/**
	* Performs a slide move in the specified direction.
	* @returns `true` if the board moved/changed, `false` otherwise.
	*/
	move(direction) {
		if (this.isGameOver) return false;
		let moved = false;
		let scoreGained = 0;
		let newBoard = this.board.map((row) => [...row]);
		const processRow = (row) => {
			let filtered = row.filter((v) => v !== 0);
			let merged = [];
			for (let i = 0; i < filtered.length; i++) if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
				const combined = filtered[i] * 2;
				merged.push(combined);
				scoreGained += combined;
				i++;
			} else merged.push(filtered[i]);
			while (merged.length < 4) merged.push(0);
			return merged;
		};
		if (direction === "LEFT") newBoard = newBoard.map((row) => {
			const nr = processRow(row);
			if (nr.join(",") !== row.join(",")) moved = true;
			return nr;
		});
		else if (direction === "RIGHT") newBoard = newBoard.map((row) => {
			const rev = [...row].reverse();
			const nr = processRow(rev);
			if (nr.join(",") !== rev.join(",")) moved = true;
			return nr.reverse();
		});
		else if (direction === "UP") {
			let trans = this.transpose(newBoard);
			trans = trans.map((row) => {
				const nr = processRow(row);
				if (nr.join(",") !== row.join(",")) moved = true;
				return nr;
			});
			newBoard = this.transpose(trans);
		} else if (direction === "DOWN") {
			let trans = this.transpose(newBoard);
			trans = trans.map((row) => {
				const rev = [...row].reverse();
				const nr = processRow(rev);
				if (nr.join(",") !== rev.join(",")) moved = true;
				return nr.reverse();
			});
			newBoard = this.transpose(trans);
		}
		if (moved) {
			this.board = newBoard;
			this.score += scoreGained;
			this.moveCount++;
			this.spawnTile();
			if (!this.hasWon && this.checkWon()) this.hasWon = true;
			if (this.checkGameOver()) this.isGameOver = true;
		}
		return moved;
	}
	transpose(matrix) {
		return matrix[0].map((_, col) => matrix.map((row) => row[col]));
	}
	checkWon() {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (this.board[r][c] >= 2048) return true;
		return false;
	}
	checkGameOver() {
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
			if (this.board[r][c] === 0) return false;
			if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return false;
			if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return false;
		}
		return true;
	}
	/**
	* Returns a snapshot of the current game state.
	*/
	getState() {
		return {
			board: this.board.map((r) => [...r]),
			score: this.score,
			hasWon: this.hasWon,
			isGameOver: this.isGameOver,
			moveCount: this.moveCount
		};
	}
	/**
	* Returns control buttons suitable for web dashboards or UI rendering.
	*/
	getControls() {
		const disabled = this.isGameOver;
		return [{ components: [
			{
				id: "blank_1",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "up",
				label: "Up",
				emoji: "⬆️",
				style: "primary",
				disabled
			},
			{
				id: "blank_2",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "quit",
				label: "Quit",
				emoji: "🛑",
				style: "danger",
				disabled
			}
		] }, { components: [
			{
				id: "left",
				label: "Left",
				emoji: "⬅️",
				style: "primary",
				disabled
			},
			{
				id: "down",
				label: "Down",
				emoji: "⬇️",
				style: "primary",
				disabled
			},
			{
				id: "right",
				label: "Right",
				emoji: "➡️",
				style: "primary",
				disabled
			}
		] }];
	}
	/**
	* Renders the current board as a PNG buffer.
	*/
	async renderCard(customState) {
		const state = customState || (this.hasWon ? "won" : this.isGameOver ? "gameover" : "active");
		return Render2048.renderBoard(this.board, this.score, this.username, this.avatarUrl, state);
	}
	/**
	* Renders the current board directly as a Data URL string (`data:image/png;base64,...`).
	*/
	async renderDataURL(customState) {
		const buffer = await this.renderCard(customState);
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/HangmanEngine.ts
/**
* Headless Hangman word puzzle engine for dashboards and web interfaces.
*/
var HangmanEngine = class {
	word = "";
	guessedLetters = [];
	mistakes = 0;
	maxMistakes;
	isWon = false;
	isGameOver = false;
	constructor(options) {
		this.maxMistakes = options?.maxMistakes || 6;
		this.word = (options?.word || getRandomWord()).toUpperCase().trim();
	}
	/**
	* Resets the game with an optional new word.
	*/
	reset(newWord) {
		this.word = (newWord || getRandomWord()).toUpperCase().trim();
		this.guessedLetters = [];
		this.mistakes = 0;
		this.isWon = false;
		this.isGameOver = false;
	}
	/**
	* Makes a letter guess.
	*/
	guess(letter) {
		if (this.isGameOver) return {
			correct: false,
			isWon: this.isWon,
			isGameOver: true
		};
		const char = letter.toUpperCase().trim();
		if (!char || char.length !== 1 || this.guessedLetters.includes(char)) return {
			correct: false,
			isWon: this.isWon,
			isGameOver: this.isGameOver
		};
		this.guessedLetters.push(char);
		const isMatch = this.word.includes(char);
		if (!isMatch) {
			this.mistakes++;
			if (this.mistakes >= this.maxMistakes) this.isGameOver = true;
		} else if (this.word.split("").every((c) => c === " " || this.guessedLetters.includes(c))) {
			this.isWon = true;
			this.isGameOver = true;
		}
		return {
			correct: isMatch,
			isWon: this.isWon,
			isGameOver: this.isGameOver
		};
	}
	/**
	* Returns current game state.
	*/
	getState() {
		const masked = this.word.split("").map((c) => c === " " ? " " : this.guessedLetters.includes(c) ? c : "_").join(" ");
		return {
			word: this.word,
			maskedWord: masked,
			guessedLetters: [...this.guessedLetters],
			mistakes: this.mistakes,
			maxMistakes: this.maxMistakes,
			isWon: this.isWon,
			isGameOver: this.isGameOver
		};
	}
	/**
	* Returns keyboard layout controls schema for web dashboards.
	*/
	getControls() {
		const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
		const rows = [];
		const rowSizes = [
			7,
			7,
			6,
			6
		];
		let offset = 0;
		for (const size of rowSizes) {
			const chunk = letters.slice(offset, offset + size);
			offset += size;
			const components = chunk.map((letter) => {
				const isGuessed = this.guessedLetters.includes(letter);
				return {
					id: letter,
					label: letter,
					style: isGuessed && this.word.includes(letter) ? "success" : isGuessed ? "danger" : "secondary",
					disabled: this.isGameOver || isGuessed
				};
			});
			rows.push({ components });
		}
		return rows;
	}
	/**
	* Renders the Hangman canvas board as a PNG buffer.
	*/
	async renderCard(username = "Player", avatarUrl = "") {
		const masked = this.getState().maskedWord;
		return RenderHangman.renderCard(this.mistakes, masked, this.guessedLetters, username, avatarUrl, this.isGameOver, this.isWon, this.word);
	}
	/**
	* Renders the Hangman board as a Data URL string.
	*/
	async renderDataURL(username = "Player", avatarUrl = "") {
		const buffer = await this.renderCard(username, avatarUrl);
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/SnakeEngine.ts
/**
* Headless Snake game engine for web dashboards and custom APIs.
*/
var SnakeEngine = class {
	snake = [];
	food = {
		x: 0,
		y: 0
	};
	direction = "RIGHT";
	score = 0;
	isGameOver = false;
	gridSize;
	username;
	avatarUrl;
	constructor(options) {
		this.gridSize = options?.gridSize || 15;
		this.username = options?.username || "Player";
		this.avatarUrl = options?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
		this.reset();
	}
	/**
	* Resets the snake game to starting state.
	*/
	reset() {
		const center = Math.floor(this.gridSize / 2);
		this.snake = [
			{
				x: center,
				y: center
			},
			{
				x: center - 1,
				y: center
			},
			{
				x: center - 2,
				y: center
			}
		];
		this.direction = "RIGHT";
		this.score = 0;
		this.isGameOver = false;
		this.spawnFood();
	}
	spawnFood() {
		let valid = false;
		while (!valid) {
			const fx = Math.floor(Math.random() * this.gridSize);
			const fy = Math.floor(Math.random() * this.gridSize);
			if (!this.snake.some((part) => part.x === fx && part.y === fy)) {
				this.food = {
					x: fx,
					y: fy
				};
				valid = true;
			}
		}
	}
	/**
	* Moves the snake one step in the specified direction.
	* Prevents instant reverse into own neck.
	*/
	move(newDir) {
		if (this.isGameOver) return false;
		if ({
			UP: "DOWN",
			DOWN: "UP",
			LEFT: "RIGHT",
			RIGHT: "LEFT"
		}[this.direction] === newDir) newDir = this.direction;
		this.direction = newDir;
		const head = { ...this.snake[0] };
		switch (newDir) {
			case "UP":
				head.y -= 1;
				break;
			case "DOWN":
				head.y += 1;
				break;
			case "LEFT":
				head.x -= 1;
				break;
			case "RIGHT": head.x += 1;
		}
		if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
			this.isGameOver = true;
			return false;
		}
		if (this.snake.some((part, i) => {
			if (i === this.snake.length - 1 && !(head.x === this.food.x && head.y === this.food.y)) return false;
			return part.x === head.x && part.y === head.y;
		})) {
			this.isGameOver = true;
			return false;
		}
		this.snake.unshift(head);
		if (head.x === this.food.x && head.y === this.food.y) {
			this.score += 1;
			this.spawnFood();
		} else this.snake.pop();
		return true;
	}
	/**
	* Sets next direction without immediately advancing.
	*/
	changeDirection(newDir) {
		if ({
			UP: "DOWN",
			DOWN: "UP",
			LEFT: "RIGHT",
			RIGHT: "LEFT"
		}[this.direction] !== newDir) this.direction = newDir;
	}
	/**
	* Advances snake by one frame/step. Ideal for timer loops.
	*/
	step(dir) {
		return {
			isAlive: this.move(dir || this.direction),
			isGameOver: this.isGameOver,
			score: this.score
		};
	}
	/**
	* Returns current snapshot of the snake state.
	*/
	getState() {
		return {
			snake: this.snake.map((p) => ({ ...p })),
			food: { ...this.food },
			score: this.score,
			length: this.snake.length,
			direction: this.direction,
			isGameOver: this.isGameOver
		};
	}
	/**
	* Returns control buttons schema.
	*/
	getControls() {
		const disabled = this.isGameOver;
		return [{ components: [
			{
				id: "blank_1",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "up",
				label: "Up",
				emoji: "⬆️",
				style: "primary",
				disabled
			},
			{
				id: "blank_2",
				label: " ",
				style: "secondary",
				disabled: true
			},
			{
				id: "quit",
				label: "Quit",
				emoji: "🛑",
				style: "danger",
				disabled
			}
		] }, { components: [
			{
				id: "left",
				label: "Left",
				emoji: "⬅️",
				style: "primary",
				disabled
			},
			{
				id: "down",
				label: "Down",
				emoji: "⬇️",
				style: "primary",
				disabled
			},
			{
				id: "right",
				label: "Right",
				emoji: "➡️",
				style: "primary",
				disabled
			}
		] }];
	}
	/**
	* Renders the current snake board as a PNG buffer.
	*/
	async renderCard(overlayTitle) {
		return RenderSnake.renderBoard(this.snake, this.food, this.direction, this.score, this.gridSize, this.username, this.avatarUrl, this.isGameOver, overlayTitle);
	}
	/**
	* Renders the snake board as a Data URL string.
	*/
	async renderDataURL(overlayTitle) {
		const buffer = await this.renderCard(overlayTitle);
		return WekyCanvas.toDataURL(buffer);
	}
};
// src/engines/TicTacToeEngine.ts
/**
* Headless Tic Tac Toe engine for dashboards and web interfaces.
*/
var TicTacToeEngine = class {
	board = Array(9).fill(null);
	playerX;
	playerO;
	currentTurnId;
	winner = null;
	isDraw = false;
	isGameOver = false;
	constructor(options) {
		this.playerX = options?.playerX || {
			id: "X",
			username: "Player X"
		};
		this.playerO = options?.playerO || {
			id: "O",
			username: "Player O"
		};
		this.currentTurnId = this.playerX.id;
	}
	reset() {
		this.board = Array(9).fill(null);
		this.currentTurnId = this.playerX.id;
		this.winner = null;
		this.isDraw = false;
		this.isGameOver = false;
	}
	/**
	* Places a mark on the board. Supports (row, col) or flat index (0-8).
	* Automatically uses currentTurnId if playerId is omitted.
	*/
	move(rowOrIndex, colOrPlayerId, playerId) {
		let index;
		let actualPlayerId;
		if (typeof colOrPlayerId === "number") {
			index = rowOrIndex * 3 + colOrPlayerId;
			actualPlayerId = playerId || this.currentTurnId;
		} else {
			index = rowOrIndex;
			actualPlayerId = colOrPlayerId || this.currentTurnId;
		}
		return {
			success: this.place(index, actualPlayerId).success,
			winner: this.winner,
			isWon: !!this.winner,
			isDraw: this.isDraw,
			isGameOver: this.isGameOver
		};
	}
	place(index, playerId) {
		if (this.isGameOver || index < 0 || index > 8 || this.board[index] !== null) return { success: false };
		if (playerId !== this.currentTurnId) return { success: false };
		const symbol = playerId === this.playerX.id ? "X" : "O";
		this.board[index] = symbol;
		if (this.checkWin(symbol)) {
			this.winner = playerId;
			this.isGameOver = true;
			return {
				success: true,
				winner: playerId
			};
		}
		if (this.board.every((cell) => cell !== null)) {
			this.isDraw = true;
			this.isGameOver = true;
			return {
				success: true,
				isDraw: true
			};
		}
		this.currentTurnId = playerId === this.playerX.id ? this.playerO.id : this.playerX.id;
		return { success: true };
	}
	checkWin(symbol) {
		return [
			[
				0,
				1,
				2
			],
			[
				3,
				4,
				5
			],
			[
				6,
				7,
				8
			],
			[
				0,
				3,
				6
			],
			[
				1,
				4,
				7
			],
			[
				2,
				5,
				8
			],
			[
				0,
				4,
				8
			],
			[
				2,
				4,
				6
			]
		].some(([a, b, c]) => this.board[a] === symbol && this.board[b] === symbol && this.board[c] === symbol);
	}
	getState() {
		return {
			board: [...this.board],
			currentTurnId: this.currentTurnId,
			winner: this.winner,
			isDraw: this.isDraw,
			isGameOver: this.isGameOver
		};
	}
	getControls() {
		const rows = [];
		for (let r = 0; r < 3; r++) {
			const components = [];
			for (let c = 0; c < 3; c++) {
				const idx = r * 3 + c;
				const val = this.board[idx];
				components.push({
					id: String(idx),
					label: val || " ",
					emoji: val === "X" ? "❌" : val === "O" ? "⭕" : void 0,
					style: val === "X" ? "danger" : val === "O" ? "primary" : "secondary",
					disabled: this.isGameOver || val !== null
				});
			}
			rows.push({ components });
		}
		return rows;
	}
};
// src/engines/WekyEngine.ts
/**
* Unified Headless Engine Factory for web dashboards, REST APIs, and custom bots.
*/
var WekyEngine = class WekyEngine {
	/**
	* Instantiates a headless 2048 game session.
	*/
	static create2048(options) {
		return new Game2048Engine(options);
	}
	/**
	* Instantiates a headless Snake game session.
	*/
	static createSnake(options) {
		return new SnakeEngine(options);
	}
	/**
	* Instantiates a headless Fight Duel RPG session.
	*/
	static createFight(options) {
		return new FightEngine(options);
	}
	/**
	* Instantiates a headless Hangman game session.
	*/
	static createHangman(options) {
		return new HangmanEngine(options);
	}
	/**
	* Instantiates a headless Calculator session.
	*/
	static createCalculator() {
		return new CalculatorEngine();
	}
	/**
	* Instantiates a headless Tic Tac Toe session.
	*/
	static createTicTacToe(options) {
		return new TicTacToeEngine(options);
	}
	static game2048 = WekyEngine.create2048;
	static snake = WekyEngine.createSnake;
	static fight = WekyEngine.createFight;
	static hangman = WekyEngine.createHangman;
	static calculator = WekyEngine.createCalculator;
	static ticTacToe = WekyEngine.createTicTacToe;
};
// src/index.ts
/**
* @m3rcena/weky
* The ultimate modern Discord minigames engine.
* Powered by @napi-rs/canvas, hybrid Slash/Message contexts, and zero external dependencies.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
export { ARCADE_GAMES, ArcadeHub, BaseGame, COMMON_WORDS, Calculator, CalculatorEngine, CanvasUtils, ChaosWords, ContextAdapter, DEFAULT_DASHBOARD_SOUNDS, DEFAULT_DISCORD_SOUNDS, EASY_SENTENCES, EventManager, FIGHT_BOSSES, FastType, Fight, FightAI, FightEngine, Game2048, Game2048Engine, GuessTheNumber, GuessThePokemon, HANGMAN_CATEGORIES, HARD_SENTENCES, Hangman, HangmanEngine, LeaderboardManager, LieSwatter, MEDIUM_SENTENCES, MathEvaluator, NEVER_HAVE_I_EVER_PROMPTS, NeverHaveIEver, POPULAR_POKEMONS, QuickClick, RPSPredictor, Render2048, RenderBracket, RenderFight, RenderHangman, RenderLeaderboard, RenderPokemon, RenderShareCard, RenderSnake, RockPaperScissors, ShuffleGuess, Snake, SnakeEngine, SoundboardManager, TRIVIA_FACTS, TicTacToe, TicTacToeAI, TicTacToeEngine, TournamentManager, VERSION, WYPTB_DILEMMAS, WYR_DILEMMAS, WekyBridge, WekyCanvas, WekyEngine, WekyManager, WillYouPressTheButton, WouldYouRather, boxConsole, checkPackageUpdates, clamp, compareSemver, fetchLatestVersion, fetchRandomPokemon, formatTime, getRandomHangmanWord, getRandomNHIE, getRandomSentence, getRandomString, getRandomTriviaFact, getRandomWYPTB, getRandomWYR, getRandomWord, getRandomWords, safeResolveColor, shuffleArray, shuffleString, stripAnsi, version };

//# sourceMappingURL=index.mjs.map