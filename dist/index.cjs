"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BaseGame: () => BaseGame,
  COMMON_WORDS: () => COMMON_WORDS,
  Calculator: () => Calculator,
  CalculatorEngine: () => CalculatorEngine,
  CanvasUtils: () => CanvasUtils,
  ChaosWords: () => ChaosWords,
  ContextAdapter: () => ContextAdapter,
  EASY_SENTENCES: () => EASY_SENTENCES,
  EventManager: () => EventManager,
  FastType: () => FastType,
  Fight: () => Fight,
  FightEngine: () => FightEngine,
  Game2048: () => Game2048,
  Game2048Engine: () => Game2048Engine,
  GuessTheNumber: () => GuessTheNumber,
  GuessThePokemon: () => GuessThePokemon,
  HANGMAN_CATEGORIES: () => HANGMAN_CATEGORIES,
  HARD_SENTENCES: () => HARD_SENTENCES,
  Hangman: () => Hangman,
  HangmanEngine: () => HangmanEngine,
  LieSwatter: () => LieSwatter,
  MEDIUM_SENTENCES: () => MEDIUM_SENTENCES,
  MathEvaluator: () => MathEvaluator,
  NEVER_HAVE_I_EVER_PROMPTS: () => NEVER_HAVE_I_EVER_PROMPTS,
  NeverHaveIEver: () => NeverHaveIEver,
  POPULAR_POKEMONS: () => POPULAR_POKEMONS,
  QuickClick: () => QuickClick,
  Render2048: () => Render2048,
  RenderFight: () => RenderFight,
  RenderHangman: () => RenderHangman,
  RenderPokemon: () => RenderPokemon,
  RenderSnake: () => RenderSnake,
  RockPaperScissors: () => RockPaperScissors,
  ShuffleGuess: () => ShuffleGuess,
  Snake: () => Snake,
  SnakeEngine: () => SnakeEngine,
  TRIVIA_FACTS: () => TRIVIA_FACTS,
  TicTacToe: () => TicTacToe,
  TicTacToeEngine: () => TicTacToeEngine,
  VERSION: () => VERSION,
  WYPTB_DILEMMAS: () => WYPTB_DILEMMAS,
  WYR_DILEMMAS: () => WYR_DILEMMAS,
  WekyCanvas: () => WekyCanvas,
  WekyEngine: () => WekyEngine,
  WekyManager: () => WekyManager,
  WillYouPressTheButton: () => WillYouPressTheButton,
  WouldYouRather: () => WouldYouRather,
  boxConsole: () => boxConsole,
  checkPackageUpdates: () => checkPackageUpdates,
  clamp: () => clamp,
  compareSemver: () => compareSemver,
  fetchLatestVersion: () => fetchLatestVersion,
  fetchRandomPokemon: () => fetchRandomPokemon,
  formatTime: () => formatTime,
  getRandomHangmanWord: () => getRandomHangmanWord,
  getRandomNHIE: () => getRandomNHIE,
  getRandomSentence: () => getRandomSentence,
  getRandomString: () => getRandomString,
  getRandomTriviaFact: () => getRandomTriviaFact,
  getRandomWYPTB: () => getRandomWYPTB,
  getRandomWYR: () => getRandomWYR,
  getRandomWord: () => getRandomWord,
  getRandomWords: () => getRandomWords,
  safeResolveColor: () => safeResolveColor,
  shuffleArray: () => shuffleArray,
  shuffleString: () => shuffleString,
  stripAnsi: () => stripAnsi,
  version: () => version
});
module.exports = __toCommonJS(index_exports);

// src/version.ts
var version = "14.27.0-1";
var VERSION = version;

// src/core/BaseGame.ts
var import_discord3 = require("discord.js");

// src/utils/Helpers.ts
var import_crypto = require("crypto");
var import_discord = require("discord.js");
function getRandomString(length = 8, prefix = "weky_") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = (0, import_crypto.randomBytes)(length);
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
function formatTime(ms) {
  if (ms < 1e3) {
    return `${Math.round(ms)}ms`;
  }
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
function shuffleString(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}
function shuffleArray(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}
function safeResolveColor(color, fallback = 5793266) {
  if (!color) return fallback;
  try {
    return (0, import_discord.resolveColor)(color);
  } catch {
    return fallback;
  }
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// src/core/ContextAdapter.ts
var import_discord2 = require("discord.js");
var ContextAdapter = class _ContextAdapter {
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
    this.raw = context;
    if (context instanceof import_discord2.Message) {
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
    if (!this.user || !this.channel) {
      throw new Error("[ContextAdapter] Invalid Discord context: unable to resolve user or channel.");
    }
  }
  static from(context) {
    return new _ContextAdapter(context);
  }
  /**
   * Resolves appropriate message flags, ensuring MessageFlags.IsComponentsV2
   * is automatically attached whenever ContainerBuilder is present.
   */
  resolveFlags(options) {
    let flags = typeof options.flags === "number" ? options.flags : 0;
    const hasContainer = options.components?.some((c) => c instanceof import_discord2.ContainerBuilder || typeof c?.setAccentColor === "function" || c?.data?.type === 17);
    if (hasContainer) {
      flags |= import_discord2.MessageFlags.IsComponentsV2;
    }
    return flags > 0 ? flags : void 0;
  }
  /**
   * Sends the initial game interface message.
   * Handles interaction replies (using withResponse: true), deferred states, and message channels transparently.
   */
  async sendInitial(options) {
    const resolvedFlags = this.resolveFlags(options);
    const isV2 = !!((resolvedFlags ?? 0) & import_discord2.MessageFlags.IsComponentsV2);
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
        this.gameMessage = msg instanceof import_discord2.Message ? msg : await interaction.fetchReply().catch(() => null);
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
        if (response instanceof import_discord2.InteractionCallbackResponse && response.resource?.message) {
          this.gameMessage = response.resource.message;
        } else if (response instanceof import_discord2.Message) {
          this.gameMessage = response;
        } else {
          this.gameMessage = await interaction.fetchReply().catch(() => null);
        }
      }
    } else {
      const channel = this.channel;
      if (typeof channel.send !== "function") {
        throw new Error("[ContextAdapter] The provided channel is not sendable.");
      }
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
    if (!this.gameMessage) return;
    const resolvedFlags = this.resolveFlags(options);
    const isV2 = !!((resolvedFlags ?? 0) & import_discord2.MessageFlags.IsComponentsV2);
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
      if (err.code !== 10008 && err.code !== 50027) {
      }
    }
  }
  /**
   * Sends an ephemeral reply to an interaction if a non-player attempts to interact.
   * Uses modern flags: MessageFlags.Ephemeral instead of deprecated ephemeral: true.
   */
  static async replyEphemeral(interaction, content) {
    try {
      if (!interaction || typeof interaction.isRepliable !== "function" || !interaction.isRepliable()) return;
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, flags: import_discord2.MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content, flags: import_discord2.MessageFlags.Ephemeral });
      }
    } catch {
    }
  }
  /**
   * Safely deletes the game message.
   */
  async delete() {
    if (this.gameMessage && this.gameMessage.deletable) {
      try {
        await this.gameMessage.delete();
      } catch {
      }
    }
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
    const container = new import_discord3.ContainerBuilder();
    const color = this.options.embed?.color ? safeResolveColor(this.options.embed.color, this.defaultColor) : stateAccentColor !== void 0 ? stateAccentColor : this.defaultColor;
    container.setAccentColor(color);
    return container;
  }
  /**
   * Helper to construct a Components V2 MediaGalleryBuilder for attachments.
   */
  createMediaGallery(attachmentUrlOrName) {
    const url = attachmentUrlOrName.startsWith("attachment://") ? attachmentUrlOrName : `attachment://${attachmentUrlOrName}`;
    return new import_discord3.MediaGalleryBuilder().addItems((item) => item.setURL(url));
  }
  /**
   * Applies custom embed properties (author, description, fields, footer, timestamp)
   * to markdown text displayed inside a Components V2 Container.
   */
  applyEmbedDecorations(container, content) {
    let finalContent = content;
    if (this.options.embed?.author?.name) {
      const authorText = this.options.embed.author.url ? `[${this.options.embed.author.name}](${this.options.embed.author.url})` : `**${this.options.embed.author.name}**`;
      finalContent = `${authorText}

${finalContent}`;
    }
    if (this.options.embed?.description && !finalContent.includes(this.options.embed.description)) {
      finalContent = `${finalContent}

${this.options.embed.description}`;
    }
    if (this.options.embed?.fields && this.options.embed.fields.length > 0) {
      const fieldsText = this.options.embed.fields.map((f) => `**${f.name}**
${f.value}`).join("\n\n");
      finalContent = `${finalContent}

${fieldsText}`;
    }
    const footerParts = [];
    if (this.options.embed?.footer?.text) {
      footerParts.push(this.options.embed.footer.text);
    }
    if (this.options.embed?.timestamp) {
      const date = this.options.embed.timestamp === true ? /* @__PURE__ */ new Date() : new Date(this.options.embed.timestamp);
      footerParts.push(`<t:${Math.floor(date.getTime() / 1e3)}:R>`);
    }
    if (footerParts.length > 0) {
      finalContent = `${finalContent}

- - -
${footerParts.join(" \u2022 ")}`;
    }
    if (this.options.embed?.thumbnail && !container.data.components?.some((c) => c.type === 18)) {
      container.addMediaGalleryComponents(this.createMediaGallery(this.options.embed.thumbnail));
    }
    return finalContent;
  }
  /**
   * Emits the gameStart lifecycle event on WekyManager.
   */
  emitStart() {
    this.startTime = Date.now();
    if (this.manager && typeof this.manager.emit === "function") {
      this.manager.emit("gameStart", {
        game: this.gameKey,
        user: this.ctx.user,
        channelId: this.ctx.channel?.id
      });
    }
  }
  /**
   * Emits the gameOver lifecycle event on WekyManager.
   */
  emitEnd(outcome, score = 0) {
    const timeElapsed = this.startTime > 0 ? Date.now() - this.startTime : 0;
    if (this.manager && typeof this.manager.emit === "function") {
      this.manager.emit("gameOver", {
        game: this.gameKey,
        user: this.ctx.user,
        outcome,
        score,
        timeElapsed
      });
    }
  }
  /**
   * Emits the gameError lifecycle event on WekyManager.
   */
  emitError(error) {
    if (this.manager && typeof this.manager.emit === "function") {
      this.manager.emit("gameError", {
        game: this.gameKey,
        error,
        context: this.ctx
      });
    }
  }
  /**
   * Standardized Embed builder for backwards compatibility.
   */
  createEmbed(description, titleOverride) {
    const embed = new import_discord3.EmbedBuilder();
    const opts = this.options.embed;
    if (titleOverride || opts?.title) {
      embed.setTitle(titleOverride || opts.title);
    }
    if (description || opts?.description) {
      embed.setDescription(description || opts.description);
    }
    embed.setColor(this.resolveColor(opts?.color));
    if (opts?.footer) {
      embed.setFooter(opts.footer);
    }
    if (opts?.timestamp) {
      embed.setTimestamp(opts.timestamp === true ? /* @__PURE__ */ new Date() : new Date(opts.timestamp));
    }
    if (opts?.author) {
      embed.setAuthor({
        name: opts.author.name,
        iconURL: opts.author.icon_url,
        url: opts.author.url
      });
    }
    if (opts?.fields && opts.fields.length > 0) {
      embed.setFields(opts.fields);
    }
    if (opts?.thumbnail) {
      embed.setThumbnail(opts.thumbnail);
    }
    if (opts?.image) {
      embed.setImage(opts.image);
    }
    if (opts?.url) {
      embed.setURL(opts.url);
    }
    return embed;
  }
  /**
   * Checks if the interacting user is the game owner. If not, replies with othersMessage.
   */
  isAuthorized(interaction, allowedUserIds) {
    const userId = interaction.user.id;
    const allowed = allowedUserIds || [this.ctx.userId];
    if (!allowed.includes(userId)) {
      const template = this.options.othersMessage || this.manager?.unauthorizedMessage || "Only <@{{author}}> can use these buttons!";
      const reply = template.replace(/\{\{author\}\}/g, this.ctx.userId);
      ContextAdapter.replyEphemeral(interaction, reply);
      if (this.manager && typeof this.manager.emit === "function") {
        this.manager.emit("unauthorizedClick", {
          game: this.gameKey,
          user: interaction.user,
          interaction
        });
      }
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
    if (this.manager && this.manager._eventManager) {
      this.manager._eventManager.unregister(this.id);
    }
  }
};

// src/core/EventManager.ts
var import_discord4 = require("discord.js");
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
    this.client.on(import_discord4.Events.InteractionCreate, async (interaction) => {
      for (const game of this.activeGames.values()) {
        if (game.onInteraction) {
          try {
            await game.onInteraction(interaction);
          } catch (err) {
            console.error(`[Weky:EventManager] Error in game ${game.id} onInteraction:`, err);
          }
        }
      }
    });
    this.client.on(import_discord4.Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      for (const game of this.activeGames.values()) {
        if (game.onMessage) {
          try {
            await game.onMessage(message);
          } catch (err) {
            console.error(`[Weky:EventManager] Error in game ${game.id} onMessage:`, err);
          }
        }
      }
    });
    this.client.on(import_discord4.Events.TypingStart, async (typing) => {
      for (const game of this.activeGames.values()) {
        if (game.onTypingStart) {
          try {
            await game.onTypingStart(typing);
          } catch (err) {
            console.error(`[Weky:EventManager] Error in game ${game.id} onTypingStart:`, err);
          }
        }
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

// src/core/WekyManager.ts
var import_discord22 = require("discord.js");
var import_events = require("events");

// src/games/Calculator.ts
var import_discord5 = require("discord.js");

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
      if (!expression || expression.trim().length === 0) {
        return { result: null, formatted: "0", error: "Empty expression" };
      }
      let clean = expression.replace(/×/g, "*").replace(/x/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").trim();
      const tokens = this.tokenize(clean, lastAnswer);
      const rpn = this.toRPN(tokens);
      const result = this.evaluateRPN(rpn);
      if (!Number.isFinite(result)) {
        return { result: null, formatted: "Error", error: "Result is infinite or undefined" };
      }
      const formatted = this.formatNumber(result);
      return { result, formatted };
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
    const str = parseFloat(n.toFixed(10)).toString();
    return str;
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
        if (ident === "pi") {
          tokens.push(Math.PI);
        } else if (ident === "e") {
          tokens.push(Math.E);
        } else if (ident === "ans") {
          tokens.push(lastAnswer);
        } else if (["sin", "cos", "tan", "sqrt", "log", "log10", "ln", "round", "abs"].includes(ident)) {
          tokens.push(ident);
        } else {
          throw new Error(`Unknown function or symbol: ${ident}`);
        }
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
    for (const token of tokens) {
      if (typeof token === "number") {
        output.push(token);
      } else if (["sin", "cos", "tan", "sqrt", "log", "log10", "ln", "round", "abs"].includes(token)) {
        stack.push(token);
      } else if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length > 0 && stack[stack.length - 1] !== "(") {
          output.push(stack.pop());
        }
        if (stack.length === 0) throw new Error("Mismatched parentheses");
        stack.pop();
        if (stack.length > 0 && ["sin", "cos", "tan", "sqrt", "log", "log10", "ln", "round", "abs"].includes(stack[stack.length - 1])) {
          output.push(stack.pop());
        }
      } else {
        const op = token;
        while (stack.length > 0 && stack[stack.length - 1] !== "(" && (!isRightAssociative(op) && precedence[stack[stack.length - 1]] >= precedence[op] || isRightAssociative(op) && precedence[stack[stack.length - 1]] > precedence[op])) {
          output.push(stack.pop());
        }
        stack.push(op);
      }
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
        case "u-": {
          if (stack.length < 1) throw new Error("Invalid unary minus syntax");
          stack.push(-stack.pop());
          break;
        }
        case "!": {
          if (stack.length < 1) throw new Error("Invalid factorial syntax");
          stack.push(this.factorial(stack.pop()));
          break;
        }
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
        case "sin": {
          if (stack.length < 1) throw new Error("Missing argument for sin");
          stack.push(Math.sin(stack.pop()));
          break;
        }
        case "cos": {
          if (stack.length < 1) throw new Error("Missing argument for cos");
          stack.push(Math.cos(stack.pop()));
          break;
        }
        case "tan": {
          if (stack.length < 1) throw new Error("Missing argument for tan");
          stack.push(Math.tan(stack.pop()));
          break;
        }
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
        case "round": {
          if (stack.length < 1) throw new Error("Missing argument for round");
          stack.push(Math.round(stack.pop()));
          break;
        }
        case "abs": {
          if (stack.length < 1) throw new Error("Missing argument for abs");
          stack.push(Math.abs(stack.pop()));
          break;
        }
        default:
          throw new Error(`Unknown operator: ${token}`);
      }
    }
    if (stack.length !== 1) throw new Error("Invalid expression");
    return stack[0];
  }
};

// src/games/Calculator.ts
var STANDARD_KEYS = ["DC", "(", ")", "\u232B", "AC", "7", "8", "9", "\xF7", "^", "4", "5", "6", "x", "SQRT", "1", "2", "3", " - ", " + ", "2nd", "0", ".", "ans", "="];
var SCIENTIFIC_KEYS = ["DC", "SIN", "COS", "TAN", "AC", "LG", "LN", "x!", "1/x", "\u232B", "RND", "\u03C0", "e", "\xF7", "x", "(", ")", "%", " - ", " + ", "2nd", "0", ".", "ans", "="];
var INVALID_START_KEYS = ["\u232B", "AC", "=", "x", "\xF7", "%", "^", "x!"];
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
      flags: import_discord5.MessageFlags.IsComponentsV2
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
      await interaction.deferUpdate().catch(() => {
      });
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
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate().catch(() => {
      });
    }
    switch (true) {
      case id === "calDC":
        return this.endGame();
      case id === "calAC":
        this.currentExpression = " ";
        break;
      case id === "cal\u232B":
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
      default:
        this.currentExpression += rawValue;
        break;
    }
    await this.updateUI();
  }
  calculate(expr) {
    let clean = expr.replace(/x/g, "*").replace(/÷/g, "/").replace(/π/g, "pi").replace(/ans/g, this.lastAnswer || "0").trim();
    try {
      const evalResult = MathEvaluator.evaluate(clean, Number(this.lastAnswer) || 0);
      if (evalResult.error) {
        return {
          result: null,
          error: this.options.errorMessages?.invalidCalculation || "Invalid calculation"
        };
      }
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
    const modal = new import_discord5.ModalBuilder().setTitle(config.title).setCustomId(modalId);
    const input = new import_discord5.TextInputBuilder().setCustomId(`input_${config.funcName}`).setStyle(import_discord5.TextInputStyle.Short).setRequired(true);
    const textDisplay = new import_discord5.TextDisplayBuilder().setContent(this.options.modals?.display ? this.options.modals.display.replace("{{currentExpression}}", this.currentExpression === " " ? `\`\`\`${this.options.modals?.noPromptYet || "No Prompt Yet"}\`\`\`` : this.getDisplay()) : `## Current Calculation:
${this.currentExpression === " " ? "```No Prompt Yet```" : this.getDisplay()}`);
    const label = new import_discord5.LabelBuilder().setLabel(this.options.modals?.labels ? this.options.modals.labels.replace("{{label}}", config.label) : `Enter number for ${config.label}`).setTextInputComponent(input);
    modal.addTextDisplayComponents(textDisplay);
    modal.addLabelComponents(label);
    await interaction.showModal(modal).catch(() => {
    });
    try {
      const submitted = await interaction.awaitModalSubmit({
        filter: (i) => i.customId === modalId && i.user.id === this.ctx.userId,
        time: 12e4
      });
      await submitted.deferUpdate().catch(() => {
      });
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
        flags: import_discord5.MessageFlags.IsComponentsV2
      }).catch(() => {
      });
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
      let content = `\`\`\`
${endMsg}
\`\`\``;
      content = this.applyEmbedDecorations(container, content);
      container.addTextDisplayComponents((t) => t.setContent(content));
      const keys = this.is2nd ? SCIENTIFIC_KEYS : STANDARD_KEYS;
      this.addButtonsToContainer(container, keys, true);
      await this.msg1.edit({ components: [container], flags: import_discord5.MessageFlags.IsComponentsV2 }).catch(() => {
      });
    }
  }
  getDisplay() {
    const modeTag = this.is2nd ? "  [2nd / SCI]" : "";
    return `\`\`\`fix
${this.currentExpression}${modeTag}
\`\`\``;
  }
  buildContainer(forceEmpty = false) {
    const container = this.createContainer(this.accentColor);
    const header = this.options.embed?.title ? `## ${this.options.embed.title}
` : "";
    let content = `${header}${this.getDisplay()}`;
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    const keys = this.is2nd ? SCIENTIFIC_KEYS : STANDARD_KEYS;
    this.addButtonsToContainer(container, keys, forceEmpty);
    return container;
  }
  addButtonsToContainer(container, keys, forceEmpty = false) {
    const isEmpty = this.currentExpression.trim() === "" || forceEmpty;
    for (let i = 0; i < keys.length; i += 5) {
      const chunk = keys.slice(i, i + 5);
      const buttons = chunk.map((k) => {
        let isDisabled = this.isFinished;
        if (!isDisabled) {
          if (k === "2nd") {
            isDisabled = false;
          } else if (k === "ans" && !this.hasCalculated) {
            isDisabled = true;
          } else if (isEmpty && INVALID_START_KEYS.includes(k)) {
            isDisabled = true;
          }
        }
        const btn = new import_discord5.ButtonBuilder().setLabel(k).setCustomId(`cal${k}`).setDisabled(isDisabled);
        if (k === "=") {
          btn.setStyle(import_discord5.ButtonStyle.Success);
        } else if (k === "2nd") {
          btn.setStyle(this.is2nd ? import_discord5.ButtonStyle.Success : import_discord5.ButtonStyle.Primary);
        } else if (k === "AC") {
          btn.setStyle(import_discord5.ButtonStyle.Danger);
        } else if (k === "DC") {
          btn.setStyle(import_discord5.ButtonStyle.Danger).setEmoji("\u{1F6D1}");
        } else if (["x", "\xF7", " - ", " + ", "^", "%"].includes(k)) {
          btn.setStyle(import_discord5.ButtonStyle.Primary);
        } else {
          btn.setStyle(import_discord5.ButtonStyle.Secondary);
        }
        return btn;
      });
      const row = new import_discord5.ActionRowBuilder().addComponents(...buttons);
      container.addActionRowComponents(row);
    }
  }
};

// src/games/ChaosWords.ts
var import_discord6 = require("discord.js");

// src/data/words.ts
var HANGMAN_CATEGORIES = {
  Animals: ["elephant", "alligator", "chimpanzee", "dolphin", "flamingo", "kangaroo", "hedgehog", "chameleon", "penguin", "leopard", "octopus", "platypus", "giraffe", "rhinoceros", "gorilla", "cheetah", "crocodile", "squirrel", "badger", "tortoise", "armadillo", "jellyfish", "seahorse", "woodpecker", "porcupine", "hippopotamus", "anteater", "wolverine", "koala", "panther"],
  Countries: ["australia", "brazil", "canada", "denmark", "egypt", "finland", "germany", "hungary", "iceland", "japan", "kenya", "mexico", "norway", "portugal", "switzerland", "thailand", "ukraine", "vietnam", "argentina", "belgium", "colombia", "greece", "indonesia", "ireland", "madagascar", "netherlands", "philippines", "singapore", "sweden", "turkey"],
  Technology: ["typescript", "javascript", "discord", "algorithm", "database", "compiler", "frontend", "backend", "encryption", "framework", "interface", "kubernetes", "microservice", "python", "repository", "firewall", "bandwidth", "protocol", "cybersecurity", "middleware", "debugger", "variable", "container", "terminal", "asynchronous", "functional", "recursion", "hardware", "software", "processor"],
  Gaming: ["minecraft", "nintendo", "playstation", "pokemon", "controller", "graphics", "joystick", "speedrun", "respawn", "multiplayer", "adventure", "quest", "portal", "assassin", "overwatch", "fortnite", "zelda", "warcraft", "sandbox", "inventory", "stealth", "headshot", "checkpoint", "dungeon", "platformer", "retro", "emulator", "champion", "bossfight", "achievement"],
  Food: ["spaghetti", "hamburger", "croissant", "burrito", "chocolate", "pancake", "sandwich", "cheesecake", "barbecue", "mushroom", "avocado", "lasagna", "doughnut", "pineapple", "waffle", "guacamole", "macaroni", "quesadilla", "dumpling", "smoothie", "meatball", "casserole", "biscuit", "marshmallow"]
};
var COMMON_WORDS = [
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
  const shuffled = [...COMMON_WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
function getRandomHangmanWord(category) {
  const catNames = Object.keys(HANGMAN_CATEGORIES);
  const selectedCat = category && HANGMAN_CATEGORIES[category] ? category : catNames[Math.floor(Math.random() * catNames.length)];
  const words = HANGMAN_CATEGORIES[selectedCat];
  const word = words[Math.floor(Math.random() * words.length)];
  return { word: word.toUpperCase(), category: selectedCat };
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
    if (this.options.words && this.options.words.length > 0) {
      this.words = this.options.words.slice(0, wordCount).map((w) => w.toLowerCase().trim());
    } else {
      this.words = getRandomWords(wordCount).map((w) => w.toLowerCase());
    }
    this.remainingWords = [...this.words];
    this.foundWords = [];
    this.chaosString = this.generateChaosString();
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();
    const container = this.createGameContainer("active");
    await this.ctx.sendInitial({
      components: [container],
      flags: import_discord6.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame("timeout"));
  }
  generateChaosString() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const totalWordLength = this.words.join("").length;
    const charCount = this.options.charCount || this.options.charGenerated || totalWordLength + 12;
    this.chaosArray = [];
    for (let i = 0; i < charCount; i++) {
      this.chaosArray.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }
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
      await interaction.deferUpdate().catch(() => {
      });
      await this.endGame("cancelled");
    }
  }
  async onMessage(message) {
    if (!this.isActive) return;
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;
    const guess = message.content.toLowerCase().trim();
    if (guess.startsWith("/") || guess.startsWith("!")) return;
    if (message.deletable) await message.delete().catch(() => {
    });
    this.resetTimeout(() => this.endGame("timeout"));
    if (this.foundWords.includes(guess)) {
      const container = this.createGameContainer("repeat", { feedback: `\u26A0\uFE0F You already found **${guess}**!` });
      await this.ctx.edit({ components: [container], flags: import_discord6.MessageFlags.IsComponentsV2 });
      return;
    }
    if (this.remainingWords.includes(guess)) {
      this.foundWords.push(guess);
      this.remainingWords = this.remainingWords.filter((w) => w !== guess);
      const indexInChaos = this.chaosArray.indexOf(guess);
      if (indexInChaos > -1) {
        this.chaosArray.splice(indexInChaos, 1);
      }
      this.chaosString = this.chaosArray.join("");
      if (this.remainingWords.length === 0) {
        await this.endGame("won");
        return;
      }
      const container = this.createGameContainer("correct", { feedback: `\u2705 **Correct!** You uncovered **${guess}**!` });
      await this.ctx.edit({ components: [container], flags: import_discord6.MessageFlags.IsComponentsV2 });
    } else {
      this.triesLeft -= 1;
      if (this.triesLeft <= 0) {
        await this.endGame("lost");
        return;
      }
      const container = this.createGameContainer("wrong", { feedback: `\u274C **${guess}** is not in the hidden words! (-1 Try)` });
      await this.ctx.edit({ components: [container], flags: import_discord6.MessageFlags.IsComponentsV2 });
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
      flags: import_discord6.MessageFlags.IsComponentsV2
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
        content = `## ${this.gameTitle}
`;
        if (details?.feedback) {
          content += `> ${details.feedback}

`;
        }
        content += `> Find **${this.words.length}** hidden words in the scrambled text below!

\`\`\`fix
${this.chaosString}
\`\`\`
**Words Found:** ${wordsFoundStr}
**Remaining Words:** \`${this.remainingWords.length}\`
**Tries Left:** \`${this.triesLeft} / ${this.maxTries}\``;
        break;
      case "won":
        content = this.options.winMessage ? `## \u{1F3C6} Word Master!
> ${this.options.winMessage}` : `## \u{1F3C6} Word Master!
> \u{1F389} **Congratulations!** You found all hidden words:
> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;
      case "lost":
        content = this.options.loseMessage ? `## \u274C Out of Tries
> ${this.options.loseMessage}` : `## \u274C Out of Tries
> \u{1F480} You ran out of attempts! The hidden words were:
> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;
      case "cancelled":
        content = `## \u{1F6D1} Game Cancelled
> You stopped the game. The hidden words were:
> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;
      case "timeout":
        content = `## \u23F1\uFE0F Time's Up
> Session expired. The hidden words were:
> ${this.words.map((w) => `\`${w}\``).join(", ")}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (state === "active" || state === "correct" || state === "wrong" || state === "repeat") {
      const cancelBtn = new import_discord6.ButtonBuilder().setStyle(import_discord6.ButtonStyle.Danger).setLabel(this.options.cancelButton || this.options.buttonText || "Cancel").setEmoji("\u{1F6D1}").setCustomId(`${this.btnPrefix}cancel`);
      container.addActionRowComponents((row) => row.setComponents(cancelBtn));
    }
    return container;
  }
};

// src/games/FastType.ts
var import_discord7 = require("discord.js");

// src/data/sentences.ts
var EASY_SENTENCES = [
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
var MEDIUM_SENTENCES = [
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
var HARD_SENTENCES = [
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
      flags: import_discord7.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame("timeout"));
  }
  onTypingStart(typing) {
    const typingUserId = typing.user?.id || typing.userId;
    const typingChannelId = typing.channel?.id || typing.channelId;
    if (typingUserId === this.ctx.userId && typingChannelId === this.ctx.channel.id) {
      this.hasTyped = true;
    }
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;
    if (interaction.customId === `${this.btnPrefix}cancel`) {
      await interaction.deferUpdate().catch(() => {
      });
      await this.endGame("cancelled");
    }
  }
  async onMessage(message) {
    if (!this.isActive) return;
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;
    const input = message.content.trim();
    if (input.startsWith("/") || input.startsWith("!")) return;
    if (message.deletable) await message.delete().catch(() => {
    });
    if (this.checkCheating && !this.hasTyped) {
      await this.endGame("cheat");
      return;
    }
    if (input === this.sentence) {
      const elapsedMs = Date.now() - this.startTime;
      const elapsedSec = Math.max(0.5, elapsedMs / 1e3);
      const minutes = elapsedSec / 60;
      const words = this.sentence.length / 5;
      const wpm = Math.round(words / minutes);
      await this.endGame("won", { timeTaken: formatTime(elapsedMs), wpm: String(wpm) });
    } else {
      const typoContainer = this.createGameContainer("typo");
      await this.ctx.edit({
        components: [typoContainer],
        flags: import_discord7.MessageFlags.IsComponentsV2
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
      flags: import_discord7.MessageFlags.IsComponentsV2
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
        content = `## ${this.gameTitle}
> \u{1F504} Preparing sentence...`;
        break;
      case "active":
        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{sentence}}", this.sentence) : `## ${this.gameTitle}
> Type the sentence below as fast as you can!

\`\`\`text
${this.sentence}
\`\`\`

\u23F3 You have **${formatTime(this.defaultTimeout)}**!`;
        break;
      case "typo":
        content = `## ${this.gameTitle}
> \u274C **Typo! That was not an exact match.** Try again quickly!

\`\`\`text
${this.sentence}
\`\`\``;
        break;
      case "won":
        const winText = this.options.winMessage ? this.options.winMessage.replace("{{time}}", data?.timeTaken || "0s").replace("{{wpm}}", data?.wpm || "0") : `You typed the sentence in **${data?.timeTaken || "0s"}** with a speed of **${data?.wpm || "0"} WPM**!`;
        content = this.options.states?.won ? this.options.states.won.replace("{{winText}}", winText).replace("{{sentence}}", this.sentence) : `## \u{1F3C6} Fast Fingers!
> ${winText}

**Sentence:**
\`\`\`text
${this.sentence}
\`\`\``;
        break;
      case "cheat":
        content = this.options.states?.cheat ? this.options.states.cheat.replace("{{sentence}}", this.sentence) : `## \u26A0\uFE0F Cheat Detected
> ${this.options.cheatMessage || "Copy-pasting is not allowed! Please type the sentence manually."}

**Sentence:**
\`\`\`text
${this.sentence}
\`\`\``;
        break;
      case "timeout":
        content = this.options.states?.timeout ? this.options.states.timeout.replace("{{sentence}}", this.sentence) : `## \u23F1\uFE0F Time's Up
> ${this.options.timeoutMessage || "You ran out of time!"}

**Sentence:**
\`\`\`text
${this.sentence}
\`\`\``;
        break;
      case "cancelled":
        content = this.options.states?.cancelled ? this.options.states.cancelled.replace("{{sentence}}", this.sentence) : `## \u{1F6AB} Game Cancelled
> You cancelled the typing test.`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (state === "active" || state === "typo") {
      const btnCancel = new import_discord7.ButtonBuilder().setStyle(import_discord7.ButtonStyle.Danger).setLabel(this.options.cancelButton || this.options.buttonText || "Cancel").setEmoji("\u{1F6D1}").setCustomId(`${this.btnPrefix}cancel`);
      container.addActionRowComponents((row) => row.setComponents(btnCancel));
    }
    return container;
  }
};

// src/games/Fight.ts
var import_discord8 = require("discord.js");

// src/canvas/RenderFight.ts
var import_canvas2 = require("@napi-rs/canvas");

// src/canvas/CanvasUtils.ts
var import_canvas = require("@napi-rs/canvas");
var CanvasUtils = class {
  /**
   * Draws a rounded rectangle path.
   */
  static roundRectPath(ctx, x, y, w, h, r) {
    let tl = 0, tr = 0, br = 0, bl = 0;
    if (typeof r === "number") {
      tl = tr = br = bl = r;
    } else if (Array.isArray(r)) {
      [tl, tr = tl, br = tl, bl = tr] = r;
    }
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
      const avatar = await (0, import_canvas.loadImage)(url);
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
    ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff4b8";
    ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\xA2", x, y + 0.5);
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
    for (const p of players) {
      if (p.id) {
        clean = clean.replace(new RegExp(`<@!?${p.id}>`, "g"), p.username);
      }
    }
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
  static async renderRequestCard(challenger, opponent) {
    const W = 900;
    const H = 520;
    const canvas = new import_canvas2.Canvas(W, H);
    const ctx = canvas.getContext("2d");
    const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
    bg.addColorStop(0, "#161b26");
    bg.addColorStop(0.65, "#0d1017");
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
    CanvasUtils.fillRoundedRect(ctx, 24, 24, W - 48, H - 48, 24, "rgba(255,255,255,0.015)", "rgba(0, 245, 160, 0.25)", 1.5);
    ctx.save();
    ctx.font = "bold 38px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#00f5a0";
    ctx.shadowColor = "rgba(0, 245, 160, 0.6)";
    ctx.shadowBlur = 18;
    ctx.fillText("DUEL CHALLENGE", W / 2, 75);
    ctx.restore();
    await CanvasUtils.drawCircularAvatar(ctx, challenger.avatarUrl, 230, 240, 80, "#00f5a0", 5);
    await CanvasUtils.drawCircularAvatar(ctx, opponent.avatarUrl, 670, 240, 80, "#ff2d55", 5);
    const vsX = W / 2;
    const vsY = 240;
    CanvasUtils.fillRoundedRect(ctx, vsX - 44, vsY - 44, 88, 88, 20, "#121620", "rgba(255, 255, 255, 0.2)", 2);
    ctx.save();
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowBlur = 12;
    ctx.fillText("VS", vsX, vsY + 2);
    ctx.restore();
    const drawPlayerInfo = (name, role, x, color) => {
      CanvasUtils.fillRoundedRect(ctx, x - 130, 345, 260, 68, 16, "rgba(18, 22, 30, 0.85)", color, 1.5);
      CanvasUtils.drawBadge(ctx, role, x - 55, 355, 110, 22, color, "#000000", "bold 11px sans-serif");
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const truncated = name.length > 15 ? name.slice(0, 14) + "\u2026" : name;
      ctx.fillText(truncated, x, 396);
    };
    drawPlayerInfo(challenger.username, "CHALLENGER", 230, "#00f5a0");
    drawPlayerInfo(opponent.username, "OPPONENT", 670, "#ff2d55");
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Awaiting opponent to accept duel...", W / 2, 455);
    return canvas.toBuffer("image/png");
  }
  /**
   * Renders the dynamic Battle Arena card with health bars, coins, and current turn indicators.
   */
  static async renderBattleCard(player1, player2, currentTurnUserId, announcement = "Battle in progress!") {
    const W = 900;
    const H = 620;
    const canvas = new import_canvas2.Canvas(W, H);
    const ctx = canvas.getContext("2d");
    const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 580);
    bg.addColorStop(0, "#161b24");
    bg.addColorStop(0.65, "#0e1118");
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
    const cleanAnnouncement = this.cleanText(announcement, [player1, player2]) || "Duel in progress!";
    CanvasUtils.fillRoundedRect(ctx, 40, 24, W - 80, 60, 16, "rgba(18, 22, 30, 0.88)", "rgba(255, 255, 255, 0.12)", 1.5);
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
    ctx.shadowBlur = 8;
    const truncatedAnnouncement = cleanAnnouncement.length > 68 ? cleanAnnouncement.slice(0, 66) + "\u2026" : cleanAnnouncement;
    ctx.fillText(truncatedAnnouncement, W / 2, 54);
    ctx.restore();
    const isP1Turn = player1.id === currentTurnUserId;
    const isP2Turn = player2.id === currentTurnUserId;
    await this.drawFighterPanel(ctx, player1, 45, 110, 365, 475, isP1Turn, "#00f5a0");
    await this.drawFighterPanel(ctx, player2, 490, 110, 365, 475, isP2Turn, "#ff2d55");
    const vsX = W / 2;
    const vsY = 340;
    CanvasUtils.fillRoundedRect(ctx, vsX - 32, vsY - 32, 64, 64, 16, "#121620", "rgba(255, 255, 255, 0.2)", 1.5);
    ctx.save();
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VS", vsX, vsY + 1);
    ctx.restore();
    return canvas.toBuffer("image/png");
  }
  static async drawFighterPanel(ctx, player, x, y, w, h, isTurn, themeColor) {
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
    const truncated = player.username.length > 15 ? player.username.slice(0, 14) + "\u2026" : player.username;
    ctx.fillText(truncated, x + w / 2, nameY);
    const hp = Math.max(0, Math.min(100, player.health));
    const hpY = nameY + 28;
    const barW = w - 44;
    const barX = x + 22;
    const barH = 26;
    CanvasUtils.fillRoundedRect(ctx, barX, hpY, barW, barH, 13, "#212530", "rgba(255,255,255,0.06)", 1);
    if (hp > 0) {
      const fillW = Math.max(barH, barW * hp / 100);
      const hpGrad = ctx.createLinearGradient(barX, hpY, barX + fillW, hpY);
      if (hp > 50) {
        hpGrad.addColorStop(0, "#00f5a0");
        hpGrad.addColorStop(1, "#00b862");
      } else if (hp > 25) {
        hpGrad.addColorStop(0, "#ffb700");
        hpGrad.addColorStop(1, "#ff7700");
      } else {
        hpGrad.addColorStop(0, "#ff2d55");
        hpGrad.addColorStop(1, "#c00028");
      }
      CanvasUtils.fillRoundedRect(ctx, barX, hpY, fillW, barH, 13, hpGrad);
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${hp} / 100 HP`, x + w / 2, hpY + barH / 2 + 1);
    const statsY = hpY + 48;
    const coinStr = `${player.coins} Coins`;
    ctx.font = "bold 16px sans-serif";
    const textW = ctx.measureText(coinStr).width;
    const totalCoinW = 20 + 8 + textW;
    const coinStartX = x + (w - totalCoinW) / 2;
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
      const cleanEffects = player.activeEffects.map((e) => this.cleanText(e, [player])).join(" \u2022 ");
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
  static async renderOutcomeCard(winner, loser, type = "WIN") {
    const W = 900;
    const H = 540;
    const canvas = new import_canvas2.Canvas(W, H);
    const ctx = canvas.getContext("2d");
    const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
    if (type === "WIN") {
      bg.addColorStop(0, "#122618");
      bg.addColorStop(0.65, "#0b140e");
      bg.addColorStop(1, "#060807");
    } else if (type === "SURRENDER") {
      bg.addColorStop(0, "#281b10");
      bg.addColorStop(0.65, "#140e08");
      bg.addColorStop(1, "#080706");
    } else {
      bg.addColorStop(0, "#261318");
      bg.addColorStop(0.65, "#140a0d");
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
    CanvasUtils.fillRoundedRect(ctx, 24, 24, W - 48, H - 48, 24, "rgba(255,255,255,0.015)", themeColor, 1.5);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let titleText = "VICTORY";
    let subtitleText = "Wins the battle!";
    if (type === "SURRENDER") {
      titleText = "SURRENDER";
      subtitleText = "The opponent surrendered.";
    } else if (type === "DENIED") {
      titleText = "CHALLENGE DECLINED";
      subtitleText = "The duel invitation was rejected.";
    } else if (type === "TIMEOUT") {
      titleText = "TIME'S UP";
      subtitleText = "The duel timed out due to inactivity.";
    }
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
  opponentUser;
  opponentMember = null;
  phase = "REQUEST";
  // Player Stats
  p1;
  p2;
  currentTurnId;
  btnPrefix;
  lastAnnouncement = "Choose your action!";
  constructor(manager, options) {
    super(manager, options, "fight");
    this.btnPrefix = getRandomString(6, "fight_");
    this.defaultColor = this.resolveColor(options.embed?.color, 15548997);
    const opp = options.opponent;
    if (opp instanceof import_discord8.GuildMember) {
      this.opponentMember = opp;
      this.opponentUser = opp.user;
    } else {
      this.opponentUser = opp;
    }
    const startHp = options.startHealth ?? 100;
    const startCoins = options.coins ?? 20;
    this.p1 = {
      id: this.ctx.userId,
      username: this.ctx.user.username,
      avatarUrl: this.ctx.user.displayAvatarURL({ extension: "png", size: 128 }),
      health: startHp,
      coins: startCoins,
      lastAction: "Challenged opponent",
      activeEffects: []
    };
    this.p2 = {
      id: this.opponentUser.id,
      username: this.opponentUser.username,
      avatarUrl: this.opponentUser.displayAvatarURL({ extension: "png", size: 128 }),
      health: startHp,
      coins: startCoins,
      lastAction: "Awaiting start",
      activeEffects: []
    };
    this.currentTurnId = this.p1.id;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
  }
  async start() {
    if (this.opponentUser.id === this.ctx.userId) {
      const msg = this.options.cannotFightYourselfMessage || "\u274C You cannot fight against yourself!";
      const container2 = this.createContainer(16711680).addTextDisplayComponents((t) => t.setContent(`## \u274C Error
> ${msg}`));
      await this.ctx.sendInitial({
        components: [container2],
        flags: import_discord8.MessageFlags.IsComponentsV2
      });
      return;
    }
    if (this.opponentUser.bot) {
      const container2 = this.createContainer(16711680).addTextDisplayComponents((t) => t.setContent("## \u274C Error\n> You cannot fight against a bot!"));
      await this.ctx.sendInitial({
        components: [container2],
        flags: import_discord8.MessageFlags.IsComponentsV2
      });
      return;
    }
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();
    const buffer = await RenderFight.renderRequestCard({ username: this.p1.username, avatarUrl: this.p1.avatarUrl }, { username: this.p2.username, avatarUrl: this.p2.avatarUrl });
    const attachment = new import_discord8.AttachmentBuilder(buffer, { name: "fight-request.png" });
    const container = this.createGameContainer("request", { image: "fight-request.png" });
    await this.ctx.sendInitial({
      components: [container],
      files: [attachment],
      flags: import_discord8.MessageFlags.IsComponentsV2
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
        await interaction.deferUpdate().catch(() => {
        });
        await this.startBattle();
        return;
      }
      if (action === "deny") {
        if (interaction.user.id !== this.p2.id && interaction.user.id !== this.p1.id) {
          ContextAdapter.replyEphemeral(interaction, "You are not part of this duel challenge!");
          return;
        }
        await interaction.deferUpdate().catch(() => {
        });
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
      await interaction.deferUpdate().catch(() => {
      });
      this.resetTimeout(() => this.endGame("TIMEOUT"));
      const activeFighter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
      const targetFighter = this.currentTurnId === this.p1.id ? this.p2 : this.p1;
      if (action === "hit") {
        this.handleHit(activeFighter, targetFighter, false);
      } else if (action === "heavy") {
        this.handleHit(activeFighter, targetFighter, true);
      } else if (action === "heal") {
        this.handleHeal(activeFighter);
      } else if (action === "shield") {
        this.handleShield(activeFighter);
      } else if (action === "double") {
        this.handleDoubleDamage(activeFighter);
      } else if (action === "surrender") {
        const surrenderingP = interaction.user.id === this.p1.id ? this.p1 : this.p2;
        const winnerP = interaction.user.id === this.p1.id ? this.p2 : this.p1;
        await this.endGame("SURRENDER", winnerP, surrenderingP);
        return;
      }
      if (targetFighter.health <= 0) {
        await this.endGame("WIN", activeFighter, targetFighter);
        return;
      }
      this.currentTurnId = targetFighter.id;
      await this.updateBattleInterface();
    }
  }
  async startBattle() {
    this.phase = "FIGHT";
    this.currentTurnId = Math.random() < 0.5 ? this.p1.id : this.p2.id;
    const starter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
    this.lastAnnouncement = `The duel begins! It's ${starter.username}'s turn!`;
    await this.updateBattleInterface();
  }
  handleHit(attacker, defender, isHeavy) {
    const maxDmg = this.options.damageMax ?? 24;
    let damage = isHeavy ? Math.floor(Math.random() * 18) + 18 : Math.floor(Math.random() * (maxDmg - 10 + 1)) + 10;
    if (isHeavy && Math.random() < 0.25) {
      attacker.lastAction = "Missed Heavy Attack!";
      this.lastAnnouncement = `\u{1F4A8} **${attacker.username}** swung hard but missed!`;
      attacker.coins += 5;
      return;
    }
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
    this.lastAnnouncement = `\u{1F4A5} **${attacker.username}** used ${isHeavy ? "Heavy Attack" : "Normal Attack"} dealing **${damage}** damage!`;
  }
  handleHeal(player) {
    if (player.health >= 85) {
      const highHpMsg = this.options.highHealthMessage || "You cannot heal if your HP is above 85!";
      this.lastAnnouncement = `\u26A0\uFE0F **${player.username}** tried to heal: ${highHpMsg}`;
      player.lastAction = "Heal failed (High HP)";
      return;
    }
    const healAmount = Math.floor(Math.random() * 11) + 15;
    player.health = Math.min(100, player.health + healAmount);
    player.coins += 5;
    player.lastAction = `Healed +${healAmount} HP`;
    this.lastAnnouncement = `\u{1F49A} **${player.username}** healed for **+${healAmount} HP**!`;
  }
  handleShield(player) {
    if (player.coins < 25) {
      this.lastAnnouncement = `\u274C Not enough coins for a Shield! (Cost: 25, You have: ${player.coins})`;
      return;
    }
    player.coins -= 25;
    if (!player.activeEffects) player.activeEffects = [];
    if (!player.activeEffects.includes("Shield")) player.activeEffects.push("Shield");
    player.lastAction = "Activated Shield";
    const shieldReply = this.options.powerups?.shield?.replyMessage ? this.options.powerups.shield.replyMessage.replace("{{username}}", player.username) : `\u{1F6E1}\uFE0F **${player.username}** activated a **Shield** (-50% next incoming damage)!`;
    this.lastAnnouncement = shieldReply;
  }
  handleDoubleDamage(player) {
    if (player.coins < 30) {
      this.lastAnnouncement = `\u274C Not enough coins for 2x Damage! (Cost: 30, You have: ${player.coins})`;
      return;
    }
    player.coins -= 30;
    if (!player.activeEffects) player.activeEffects = [];
    if (!player.activeEffects.includes("2x Damage")) player.activeEffects.push("2x Damage");
    player.lastAction = "Activated 2x DMG";
    const dmgReply = this.options.powerups?.doubleDamage?.replyMessage ? this.options.powerups.doubleDamage.replyMessage.replace("{{username}}", player.username) : `\u26A1 **${player.username}** activated **Double Damage** on next attack!`;
    this.lastAnnouncement = dmgReply;
  }
  async updateBattleInterface() {
    const buffer = await RenderFight.renderBattleCard(this.p1, this.p2, this.currentTurnId, this.lastAnnouncement);
    const attachment = new import_discord8.AttachmentBuilder(buffer, { name: "fight-arena.png" });
    const container = this.createGameContainer("active", {
      image: "fight-arena.png",
      turnId: this.currentTurnId,
      announcement: this.lastAnnouncement
    });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: import_discord8.MessageFlags.IsComponentsV2
    });
  }
  async endGame(reason, winner, loser) {
    this.phase = "ENDED";
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(reason);
    const winnerData = winner || (this.p1.health > this.p2.health ? this.p1 : this.p2);
    const loserData = loser || (winnerData.id === this.p1.id ? this.p2 : this.p1);
    const buffer = await RenderFight.renderOutcomeCard({ username: winnerData.username, avatarUrl: winnerData.avatarUrl }, loserData ? { username: loserData.username, avatarUrl: loserData.avatarUrl } : void 0, reason);
    const attachment = new import_discord8.AttachmentBuilder(buffer, { name: "fight-outcome.png" });
    const stateKey = reason === "WIN" ? "won" : reason === "SURRENDER" ? "surrender" : reason === "DENIED" ? "deny" : "timeout";
    const container = this.createGameContainer(stateKey, {
      image: "fight-outcome.png",
      winnerId: winnerData.id,
      loserId: loserData?.id
    });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: import_discord8.MessageFlags.IsComponentsV2
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
    switch (state) {
      case "request":
        content = this.options.states?.request ? this.options.states.request.replace("{{challengerMention}}", `<@${this.p1.id}>`).replace("{{opponentMention}}", `<@${this.p2.id}>`) : `## \u2694\uFE0F Challenge!
> <@${this.p1.id}> challenged <@${this.p2.id}> to a duel!`;
        break;
      case "active":
        content = this.options.states?.active ? this.options.states.active : `## \u2694\uFE0F Fighting...
> \u{1F3AF} **Turn:** <@${details?.turnId || this.currentTurnId}>
> ${details?.announcement || this.lastAnnouncement}`;
        break;
      case "won":
        content = this.options.states?.won ? this.options.states.won : `## \u{1F3C6} Fight Ended
> \u{1F3C6} **<@${details?.winnerId || this.p1.id}>** knocked out <@${details?.loserId || this.p2.id}> and won the duel!`;
        break;
      case "surrender":
        content = this.options.states?.surrender ? this.options.states.surrender : `## \u{1F3F3}\uFE0F Surrendered
> \u{1F3F3}\uFE0F **<@${details?.loserId || this.p2.id}>** surrendered! **<@${details?.winnerId || this.p1.id}>** is victorious!`;
        break;
      case "deny":
        content = this.options.states?.deny ? this.options.states.deny : `## \u{1F6AB} Denied
> The challenge was declined.`;
        break;
      case "timeout":
        content = this.options.states?.timeout ? this.options.states.timeout : `## \u23F1\uFE0F Time's Up
> The duel timed out due to inactivity.`;
        break;
      case "error":
        content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown error.") : `## \u274C Error
> ${details?.error || "Unknown error."}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (details?.image) {
      const gallery = new import_discord8.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }
    if (state === "request") {
      const row = new import_discord8.ActionRowBuilder().addComponents(
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}accept`).setLabel(this.options.buttons?.accept || "Accept Duel").setEmoji("\u2694\uFE0F").setStyle(import_discord8.ButtonStyle.Success),
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}deny`).setLabel(this.options.buttons?.deny || "Decline").setEmoji("\u2716\uFE0F").setStyle(import_discord8.ButtonStyle.Danger)
      );
      container.addActionRowComponents(row);
    } else if (state === "active") {
      const active = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
      const row1 = new import_discord8.ActionRowBuilder().addComponents(
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}hit`).setLabel(this.options.buttons?.hit || "Hit").setEmoji("\u{1F5E1}\uFE0F").setStyle(import_discord8.ButtonStyle.Primary),
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}heavy`).setLabel(this.options.buttons?.heavy || "Heavy Attack").setEmoji("\u{1FA93}").setStyle(import_discord8.ButtonStyle.Danger),
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}heal`).setLabel(this.options.buttons?.heal || "Heal").setEmoji("\u{1F49A}").setStyle(import_discord8.ButtonStyle.Success).setDisabled(active.health >= 85),
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}surrender`).setLabel(this.options.buttons?.cancel || "Surrender").setEmoji("\u{1F3F3}\uFE0F").setStyle(import_discord8.ButtonStyle.Secondary)
      );
      const shieldLabel = this.options.powerups?.shield?.label || "Shield (25\xA2)";
      const doubleLabel = this.options.powerups?.doubleDamage?.label || "2x DMG (30\xA2)";
      const row2 = new import_discord8.ActionRowBuilder().addComponents(
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}shield`).setLabel(shieldLabel).setEmoji("\u{1F6E1}\uFE0F").setStyle(import_discord8.ButtonStyle.Secondary).setDisabled(active.coins < 25),
        new import_discord8.ButtonBuilder().setCustomId(`${this.btnPrefix}double`).setLabel(doubleLabel).setEmoji("\u26A1").setStyle(import_discord8.ButtonStyle.Secondary).setDisabled(active.coins < 30)
      );
      container.addActionRowComponents(row1);
      container.addActionRowComponents(row2);
    }
    return container;
  }
};

// src/games/Game2048.ts
var import_discord9 = require("discord.js");

// src/canvas/Render2048.ts
var import_canvas3 = require("@napi-rs/canvas");
var CANVAS_SIZE = 800;
var GRID_SIZE = 560;
var GRID_Y_START = 180;
var PADDING = 16;
var CELL_SIZE = (GRID_SIZE - PADDING * 5) / 4;
var TILE_COLORS = {
  0: { main: "#cdc1b4", shadow: "#bdad9e", text: "transparent" },
  2: { main: "#eee4da", shadow: "#ded0c1", text: "#776e65" },
  4: { main: "#ede0c8", shadow: "#decbb0", text: "#776e65" },
  8: { main: "#f2b179", shadow: "#e69c5c", text: "#f9f6f2" },
  16: { main: "#f59563", shadow: "#e67e45", text: "#f9f6f2" },
  32: { main: "#f67c5f", shadow: "#e36040", text: "#f9f6f2" },
  64: { main: "#f65e3b", shadow: "#d6421e", text: "#f9f6f2" },
  128: { main: "#edcf72", shadow: "#dcc059", text: "#f9f6f2" },
  256: { main: "#edcc61", shadow: "#dcb946", text: "#f9f6f2" },
  512: { main: "#edc850", shadow: "#dcb438", text: "#f9f6f2" },
  1024: { main: "#edc53f", shadow: "#dbb227", text: "#f9f6f2" },
  2048: { main: "#edc22e", shadow: "#dfb216", text: "#f9f6f2" }
};
function getTileColors(val) {
  if (TILE_COLORS[val]) return TILE_COLORS[val];
  return { main: "#3c3a32", shadow: "#292721", text: "#f9f6f2" };
}
var Render2048 = class {
  static async renderBoard(board, score, username, avatarUrl, state) {
    const canvas = new import_canvas3.Canvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext("2d");
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
    bgGrad.addColorStop(0, "#1e2024");
    bgGrad.addColorStop(1, "#2b2d33");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, "#00f7ff", 4);
    CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const truncatedName = username.length > 14 ? username.slice(0, 13) + "\u2026" : username;
    ctx.fillText(truncatedName, 146, 75);
    const scoreBoxW = 200;
    const scoreBoxX = CANVAS_SIZE - scoreBoxW - 40;
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#15171c");
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#1e2129");
    ctx.fillStyle = "#00f7ff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("SCORE", scoreBoxX + scoreBoxW / 2, 45);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(String(score), scoreBoxX + scoreBoxW / 2, 70);
    const gridX = (CANVAS_SIZE - GRID_SIZE) / 2;
    CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START + 8, GRID_SIZE, GRID_SIZE, 18, "#9e9183");
    CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_SIZE, GRID_SIZE, 18, "#bbada0");
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const val = board[row][col];
        const x = gridX + PADDING + col * (CELL_SIZE + PADDING);
        const y = GRID_Y_START + PADDING + row * (CELL_SIZE + PADDING);
        const colors = getTileColors(val);
        CanvasUtils.fillRoundedRect(ctx, x, y + 5, CELL_SIZE, CELL_SIZE, 10, colors.shadow);
        CanvasUtils.fillRoundedRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 10, colors.main);
        if (val > 0) {
          ctx.fillStyle = colors.text;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const fontSize = val > 1e3 ? 46 : val > 100 ? 54 : 64;
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillText(String(val), x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 2);
        }
      }
    }
    if (state && state !== "active") {
      ctx.save();
      CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_SIZE, GRID_SIZE + 8, 18, "rgba(15, 17, 20, 0.82)");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (state === "won") {
        ctx.shadowColor = "#ffcc00";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 72px sans-serif";
        ctx.fillText("VICTORY!", CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 - 20);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px sans-serif";
        ctx.fillText("You reached 2048!", CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 + 50);
      } else {
        const title = state === "quit" ? "GAME STOPPED" : state === "timeout" ? "TIME'S UP" : "GAME OVER";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 68px sans-serif";
        ctx.fillText(title, CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 - 20);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px sans-serif";
        ctx.fillText(`Final Score: ${score}`, CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 + 50);
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
    this.emojiUp = options.emojis?.up || "\u2B06\uFE0F";
    this.emojiDown = options.emojis?.down || "\u2B07\uFE0F";
    this.emojiLeft = options.emojis?.left || "\u2B05\uFE0F";
    this.emojiRight = options.emojis?.right || "\u27A1\uFE0F";
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
      flags: import_discord9.MessageFlags.IsComponentsV2
    });
    const boardBuffer = await this.renderBoardImage();
    const attachment = new import_discord9.AttachmentBuilder(boardBuffer, { name: "2048-board.png" });
    const activeContainer = this.createGameContainer("active", { image: "2048-board.png", score: this.score });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: import_discord9.MessageFlags.IsComponentsV2
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
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const spot = empty[Math.floor(Math.random() * empty.length)];
      this.board[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    }
  }
  async renderBoardImage(endingState) {
    const avatar = this.ctx.user.displayAvatarURL({ extension: "png", size: 128 });
    const state = endingState || (this.hasWon ? "won" : this.isGameOver ? "gameover" : "active");
    return Render2048.renderBoard(this.board, this.score, this.ctx.user.username, avatar, state);
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (!this.isAuthorized(interaction)) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    const id = interaction.customId;
    if (id === this.idQuit) {
      await interaction.deferUpdate().catch(() => {
      });
      return this.endGame("quit");
    }
    let direction = null;
    if (id === this.idUp) direction = "UP";
    else if (id === this.idDown) direction = "DOWN";
    else if (id === this.idLeft) direction = "LEFT";
    else if (id === this.idRight) direction = "RIGHT";
    if (!direction) return;
    await interaction.deferUpdate().catch(() => {
    });
    this.resetTimeout(() => this.endGame("timeout"));
    const moved = this.move(direction);
    if (!moved) return;
    const buffer = await this.renderBoardImage();
    const attachment = new import_discord9.AttachmentBuilder(buffer, { name: "2048-board.png" });
    if (this.hasWon) {
      return this.endGame("won", { image: "2048-board.png", score: this.score }, attachment);
    }
    if (this.isGameOver) {
      return this.endGame("gameover", { image: "2048-board.png", score: this.score }, attachment);
    }
    const container = this.createGameContainer("active", { image: "2048-board.png", score: this.score });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: import_discord9.MessageFlags.IsComponentsV2
    });
  }
  move(direction) {
    let moved = false;
    let scoreGained = 0;
    let newBoard = this.board.map((row) => [...row]);
    const processRow = (row) => {
      let filtered = row.filter((v) => v !== 0);
      let merged = [];
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const combined = filtered[i] * 2;
          merged.push(combined);
          scoreGained += combined;
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      return merged;
    };
    if (direction === "LEFT") {
      newBoard = newBoard.map((row) => {
        const nr = processRow(row);
        if (nr.join(",") !== row.join(",")) moved = true;
        return nr;
      });
    } else if (direction === "RIGHT") {
      newBoard = newBoard.map((row) => {
        const rev = [...row].reverse();
        const nr = processRow(rev);
        if (nr.join(",") !== rev.join(",")) moved = true;
        return nr.reverse();
      });
    } else if (direction === "UP") {
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
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] >= 2048) return true;
      }
    }
    return false;
  }
  checkGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) return false;
        if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return false;
        if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return false;
      }
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
      attachment = new import_discord9.AttachmentBuilder(buffer, { name: "2048-board.png" });
    }
    const container = this.createGameContainer(state, details || { score: this.score, image: "2048-board.png" });
    const files = attachment ? [attachment] : [];
    await this.ctx.edit({
      components: [container],
      files,
      flags: import_discord9.MessageFlags.IsComponentsV2
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
        content = this.options.loadingMessage ? this.options.loadingMessage.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}
> \u{1F504} Starting game...`;
        break;
      case "active":
        content = this.options.activeMessage ? this.options.activeMessage.replace("{{gameTitle}}", this.gameTitle).replace("{{score}}", score.toString()) : `## ${this.gameTitle}
> Combine the tiles to reach **2048**!

**Score:** \`${score}\``;
        break;
      case "won":
        content = this.options.wonMessage ? this.options.wonMessage.replace("{{score}}", score.toString()) : `## \u{1F389} You Won!
> You reached the **2048** tile!

**Final Score:** \`${score}\``;
        break;
      case "gameover":
        content = this.options.gameoverMessage ? this.options.gameoverMessage.replace("{{score}}", score.toString()) : `## \u{1F480} Game Over
> No more moves available.

**Final Score:** \`${score}\``;
        break;
      case "quit":
        content = this.options.quitMessage ? this.options.quitMessage.replace("{{score}}", score.toString()) : `## \u{1F6D1} Game Stopped
> You quit the game.

**Final Score:** \`${score}\``;
        break;
      case "timeout":
        content = this.options.timeoutMessage ? this.options.timeoutMessage.replace("{{score}}", score.toString()) : `## \u23F1\uFE0F Time's Up
> Game session expired.

**Final Score:** \`${score}\``;
        break;
      case "error":
        content = this.options.errorMessage ? this.options.errorMessage.replace("{{error}}", details?.error || "Unknown") : `## \u274C Error
> ${details?.error || "Unknown error occurred."}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (details?.image) {
      const gallery = new import_discord9.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }
    if (state !== "loading" && state !== "error") {
      const isDisabled = state !== "active";
      const up = new import_discord9.ButtonBuilder().setStyle(import_discord9.ButtonStyle.Secondary).setLabel(this.emojiUp).setCustomId(this.idUp).setDisabled(isDisabled);
      const down = new import_discord9.ButtonBuilder().setStyle(import_discord9.ButtonStyle.Secondary).setLabel(this.emojiDown).setCustomId(this.idDown).setDisabled(isDisabled);
      const left = new import_discord9.ButtonBuilder().setStyle(import_discord9.ButtonStyle.Secondary).setLabel(this.emojiLeft).setCustomId(this.idLeft).setDisabled(isDisabled);
      const right = new import_discord9.ButtonBuilder().setStyle(import_discord9.ButtonStyle.Secondary).setLabel(this.emojiRight).setCustomId(this.idRight).setDisabled(isDisabled);
      const quit = new import_discord9.ButtonBuilder().setStyle(import_discord9.ButtonStyle.Danger).setLabel(this.quitButtonLabel).setCustomId(this.idQuit).setEmoji("\u{1F6D1}").setDisabled(isDisabled);
      const dis1 = new import_discord9.ButtonBuilder().setLabel("\u200B").setStyle(import_discord9.ButtonStyle.Secondary).setCustomId("dis1").setDisabled(true);
      const dis2 = new import_discord9.ButtonBuilder().setLabel("\u200B").setStyle(import_discord9.ButtonStyle.Secondary).setCustomId("dis2").setDisabled(true);
      const row1 = new import_discord9.ActionRowBuilder().addComponents(dis1, up, dis2, quit);
      const row2 = new import_discord9.ActionRowBuilder().addComponents(left, down, right);
      container.addActionRowComponents(row1);
      container.addActionRowComponents(row2);
    }
    return container;
  }
};

// src/games/GuessTheNumber.ts
var import_discord10 = require("discord.js");
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
    if (typeof options.number === "number") {
      this.targetNumber = options.number;
    } else {
      this.targetNumber = Math.floor(Math.random() * (this.currentMax - this.currentMin + 1)) + this.currentMin;
    }
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
      flags: import_discord10.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame("timeout"));
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isPublic && !this.isAuthorized(interaction)) return;
    if (interaction.customId === `${this.btnPrefix}cancel`) {
      await interaction.deferUpdate().catch(() => {
      });
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
    if (message.deletable) await message.delete().catch(() => {
    });
    this.resetTimeout(() => this.endGame("timeout"));
    this.attempts++;
    this.participants.add(message.author.id);
    if (guess === this.targetNumber) {
      await this.endGame("won", message.author.id);
      return;
    }
    if (guess < this.targetNumber) {
      if (guess > this.currentMin) this.currentMin = guess;
      const hint = `\u{1F53C} **${guess} is TOO LOW!** <@${message.author.id}>, try a higher number.`;
      const container = this.createGameContainer("higher", { hint });
      await this.ctx.edit({ components: [container], flags: import_discord10.MessageFlags.IsComponentsV2 });
    } else {
      if (guess < this.currentMax) this.currentMax = guess;
      const hint = `\u{1F53D} **${guess} is TOO HIGH!** <@${message.author.id}>, try a lower number.`;
      const container = this.createGameContainer("lower", { hint });
      await this.ctx.edit({ components: [container], flags: import_discord10.MessageFlags.IsComponentsV2 });
    }
  }
  async endGame(state, winnerId) {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state, this.attempts);
    const elapsed = formatTime(Date.now() - this.startTime);
    const container = this.createGameContainer(state, { winnerId, timeTaken: elapsed });
    await this.ctx.edit({
      components: [container],
      flags: import_discord10.MessageFlags.IsComponentsV2
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
    const modeText = this.isPublic ? "\u{1F465} **Mode:** Public (Everyone can guess!)" : "\u{1F464} **Mode:** Solo";
    switch (state) {
      case "active":
      case "higher":
      case "lower":
        content = `## ${this.gameTitle}
`;
        if (data?.hint) {
          content += `> ${data.hint}

`;
        }
        content += `> ${modeText}
> Guess the secret number between **${this.currentMin}** and **${this.currentMax}**!

**Attempts:** \`${this.attempts}\` | **Participants:** \`${this.participants.size}\``;
        break;
      case "won":
        content = `## \u{1F3AF} Number Found!
> \u{1F3C6} **Congratulations <@${data?.winnerId || this.ctx.userId}>!**
> The secret number was **${this.targetNumber}**!

**Total Attempts:** \`${this.attempts}\` | **Time Taken:** \`${data?.timeTaken || "0s"}\` | **Participants:** \`${this.participants.size}\``;
        break;
      case "cancelled":
        content = `## \u{1F6D1} Game Cancelled
> The game was ended. The number was **${this.targetNumber}**.`;
        break;
      case "lost":
      case "timeout":
        content = `## \u23F1\uFE0F Time's Up
> Game session expired. The secret number was **${this.targetNumber}**.`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (state === "active" || state === "higher" || state === "lower") {
      const giveUpBtn = new import_discord10.ButtonBuilder().setStyle(import_discord10.ButtonStyle.Danger).setLabel(this.options.giveUpButton || this.options.button || "Give Up").setEmoji("\u{1F6D1}").setCustomId(`${this.btnPrefix}cancel`);
      container.addActionRowComponents((row) => row.setComponents(giveUpBtn));
    }
    return container;
  }
};

// src/games/GuessThePokemon.ts
var import_discord11 = require("discord.js");

// src/canvas/RenderPokemon.ts
var import_canvas4 = require("@napi-rs/canvas");
var TYPE_COLORS = {
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
    const canvas = new import_canvas4.Canvas(800, 500);
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
      const img = await (0, import_canvas4.loadImage)(pokemon.imageUrl);
      const targetW = 320;
      const targetH = 320;
      const spriteX = 260 - targetW / 2;
      const spriteY = 250 - targetH / 2;
      if (!revealed) {
        const offCanvas = new import_canvas4.Canvas(targetW, targetH);
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
    ctx.fillText("WHO'S THAT POK\xC9MON?", rightX, 100);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    if (revealed) {
      ctx.fillText(pokemon.name, rightX, 160);
    } else {
      ctx.fillText("???", rightX, 160);
    }
    let badgeX = rightX;
    for (const type of pokemon.types) {
      const color = TYPE_COLORS[type.toLowerCase()] || "#777777";
      CanvasUtils.drawBadge(ctx, type.toUpperCase(), badgeX, 200, 100, 32, color, "#ffffff", "bold 13px sans-serif");
      badgeX += 112;
    }
    CanvasUtils.fillRoundedRect(ctx, rightX, 260, 250, 170, 16, "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.1)", 1);
    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ABILITIES", rightX + 16, 290);
    ctx.fillStyle = "#e0e6ed";
    ctx.font = "16px sans-serif";
    const abilityText = pokemon.abilities.slice(0, 3).join(", ") || "Unknown";
    ctx.fillText(abilityText, rightX + 16, 320);
    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(revealed ? "STATUS" : "HINT", rightX + 16, 365);
    ctx.fillStyle = revealed ? "#00ff88" : "#ffaa00";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(revealed ? "Identified!" : "Type your guess in chat!", rightX + 16, 395);
    return canvas.toBuffer("image/png");
  }
};

// src/data/pokemons.ts
var POPULAR_POKEMONS = [
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
    abilities: ["Run Away", "Adaptability", "Anticipation"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
  },
  {
    id: 143,
    name: "Snorlax",
    types: ["Normal"],
    abilities: ["Immunity", "Thick Fat", "Gluttony"],
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
    abilities: ["Steadfast", "Inner Focus", "Justified"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png"
  },
  {
    id: 658,
    name: "Greninja",
    types: ["Water", "Dark"],
    abilities: ["Torrent", "Protean", "Battle Bond"],
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
    abilities: ["Synchronize", "Trace", "Telepathy"],
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
    this.gameTitle = options.embed?.title || "Who's That Pok\xE9mon?";
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
      flags: import_discord11.MessageFlags.IsComponentsV2
    });
    try {
      this.pokemon = this.options.pokemon || await fetchRandomPokemon();
    } catch {
      return this.endGame("error", "Failed to retrieve Pok\xE9mon data.");
    }
    if (!this.pokemon) {
      return this.endGame("error", "Failed to retrieve Pok\xE9mon data.");
    }
    this.startTime = Date.now();
    const buffer = await RenderPokemon.renderCard(this.pokemon, false);
    const attachment = new import_discord11.AttachmentBuilder(buffer, { name: "pokemon-card.png" });
    const activeContainer = this.createGameContainer("active", { image: "pokemon-card.png" });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: import_discord11.MessageFlags.IsComponentsV2
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
        await interaction.deferUpdate().catch(() => {
        });
        await this.endGame("lost");
        return;
      }
      if (action === "guess") {
        const modal = new import_discord11.ModalBuilder().setCustomId(this.modalId).setTitle("Guess The Pok\xE9mon");
        const textInput = new import_discord11.TextInputBuilder().setCustomId("pokemon_name").setStyle(import_discord11.TextInputStyle.Short).setMinLength(2).setMaxLength(30).setRequired(true).setPlaceholder("e.g. Pikachu");
        const label = new import_discord11.LabelBuilder().setLabel("What is the name of this Pok\xE9mon?").setTextInputComponent(textInput);
        modal.addLabelComponents(label);
        await interaction.showModal(modal).catch(() => {
        });
        return;
      }
    }
    if (interaction.isModalSubmit()) {
      if (interaction.customId !== this.modalId) return;
      if (interaction.user.id !== this.ctx.userId) return;
      await interaction.deferUpdate().catch(() => {
      });
      const input = interaction.fields.getTextInputValue("pokemon_name").trim();
      await this.processGuess(input);
    }
  }
  async onMessage(message) {
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;
    const content = message.content.trim();
    if (!content || content.startsWith("/") || content.startsWith("!")) return;
    if (message.deletable) await message.delete().catch(() => {
    });
    await this.processGuess(content);
  }
  async processGuess(guess) {
    if (!this.pokemon || !this.isActive) return;
    this.resetTimeout(() => this.endGame("lost"));
    const normalizedGuess = guess.toLowerCase().replace(/[^a-z0-9]/g, "");
    const correctName = this.pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedGuess === correctName) {
      await this.endGame("won");
    } else {
      const buffer = await RenderPokemon.renderCard(this.pokemon, false);
      const attachment = new import_discord11.AttachmentBuilder(buffer, { name: "pokemon-card.png" });
      const incorrectNotice = this.options.incorrectMessage ? this.options.incorrectMessage.replace("{{answer}}", guess) : `\u274C No, it's not **${guess}**! Try again.`;
      const container = this.createGameContainer("active", {
        image: "pokemon-card.png",
        statusNotice: incorrectNotice
      });
      await this.ctx.edit({
        components: [container],
        files: [attachment],
        flags: import_discord11.MessageFlags.IsComponentsV2
      });
    }
  }
  async endGame(state, errorMsg) {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state);
    if (!this.pokemon) {
      const container2 = this.createGameContainer("error", { error: errorMsg || "Unknown error occurred." });
      await this.ctx.edit({
        components: [container2],
        flags: import_discord11.MessageFlags.IsComponentsV2
      });
      return;
    }
    const durationSec = formatTime(Date.now() - this.startTime);
    const buffer = await RenderPokemon.renderCard(this.pokemon, true);
    const attachment = new import_discord11.AttachmentBuilder(buffer, { name: "pokemon-revealed.png" });
    const container = this.createGameContainer(state, {
      image: "pokemon-revealed.png",
      timeTaken: durationSec,
      error: errorMsg
    });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: import_discord11.MessageFlags.IsComponentsV2
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
        content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}
> \u{1F504} ${this.options.thinkMessage || "Searching the tall grass for a wild Pok\xE9mon..."}`;
        break;
      case "active":
        const typesStr = this.pokemon?.types.map((t) => `\`${t}\``).join(", ") || "`Unknown`";
        const abilitiesStr = this.pokemon?.abilities.map((a) => `\`${a}\``).join(", ") || "`Unknown`";
        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}
> **Types:** ${typesStr}
> **Abilities:** ${abilitiesStr}

> \u23F3 Type your guess in chat or click **Guess Pok\xE9mon**!${details?.statusNotice ? `

> ${details.statusNotice}` : ""}`;
        break;
      case "won":
        const winText = this.options.winMessage ? this.options.winMessage.replace("{{answer}}", name).replace("{{time}}", details?.timeTaken || "0s") : `GG! It was **${name}**. You got it in **${details?.timeTaken || "0s"}**!`;
        content = this.options.states?.won ? this.options.states.won.replace("{{gameTitle}}", this.gameTitle).replace("{{answer}}", name) : `## \u{1F389} Pok\xE9mon Identified!
> \u{1F3C6} ${winText}`;
        break;
      case "lost":
        const loseText = this.options.loseMessage ? this.options.loseMessage.replace("{{answer}}", name) : `Better luck next time! It was **${name}**.`;
        content = this.options.states?.lost ? this.options.states.lost.replace("{{gameTitle}}", this.gameTitle).replace("{{answer}}", name) : `## \u{1F4A8} Pok\xE9mon Got Away!
> ${loseText}`;
        break;
      case "error":
        content = this.options.states?.error ? this.options.states.error.replace("{{error}}", details?.error || "Unknown error.") : `## \u274C Error
> ${details?.error || "Unknown error occurred."}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (details?.image) {
      const gallery = new import_discord11.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }
    if (state === "active") {
      const guessBtn = new import_discord11.ButtonBuilder().setCustomId(`${this.btnPrefix}guess`).setLabel("Guess Pok\xE9mon").setEmoji("\u26A1").setStyle(import_discord11.ButtonStyle.Primary);
      const giveUpBtn = new import_discord11.ButtonBuilder().setCustomId(`${this.btnPrefix}giveup`).setLabel(this.giveUpButtonLabel).setEmoji("\u{1F3F3}\uFE0F").setStyle(import_discord11.ButtonStyle.Danger);
      const row = new import_discord11.ActionRowBuilder().addComponents(guessBtn, giveUpBtn);
      container.addActionRowComponents(row);
    }
    return container;
  }
};

// src/games/Hangman.ts
var import_discord12 = require("discord.js");

// src/canvas/RenderHangman.ts
var import_canvas5 = require("@napi-rs/canvas");
var RenderHangman = class {
  static async renderCard(wrongGuessesCount, displayWord, guessedLetters, username, avatarUrl, gameOver = false, won = false, fullWord) {
    const canvas = new import_canvas5.Canvas(800, 500);
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
    const truncated = username.length > 13 ? username.slice(0, 12) + "\u2026" : username;
    ctx.fillText(truncated, 124, 55);
    const gx = 40;
    const gy = 40;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(190 + gx, 380 + gy, 130, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    this.drawWoodenBeam(ctx, 70 + gx, 380 + gy, 310 + gx, 380 + gy, 14);
    this.drawWoodenBeam(ctx, 110 + gx, 380 + gy, 110 + gx, 60 + gy, 14);
    this.drawWoodenBeam(ctx, 110 + gx, 60 + gy, 270 + gx, 60 + gy, 14);
    this.drawWoodenBeam(ctx, 110 + gx, 130 + gy, 170 + gx, 60 + gy, 12);
    ctx.strokeStyle = "#c29b62";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(270 + gx, 60 + gy);
    ctx.lineTo(270 + gx, 110 + gy);
    ctx.stroke();
    const ropeEndX = 270 + gx;
    const ropeEndY = 110 + gy;
    if (wrongGuessesCount >= 1) {
      ctx.save();
      ctx.fillStyle = "#e0e6ed";
      ctx.beginPath();
      ctx.arc(ropeEndX, ropeEndY + 25, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8b949e";
      ctx.lineWidth = 3;
      ctx.stroke();
      if (wrongGuessesCount >= 6) {
        ctx.strokeStyle = "#ff3355";
        ctx.lineWidth = 2.5;
        this.drawX(ctx, ropeEndX - 10, ropeEndY + 20, 6);
        this.drawX(ctx, ropeEndX + 10, ropeEndY + 20, 6);
      }
      ctx.restore();
    }
    if (wrongGuessesCount >= 2) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 50, ropeEndX, ropeEndY + 150, 7, "#e0e6ed");
    }
    if (wrongGuessesCount >= 3) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 70, ropeEndX - 40, ropeEndY + 115, 6, "#e0e6ed");
    }
    if (wrongGuessesCount >= 4) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 70, ropeEndX + 40, ropeEndY + 115, 6, "#e0e6ed");
    }
    if (wrongGuessesCount >= 5) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 150, ropeEndX - 35, ropeEndY + 220, 6, "#e0e6ed");
    }
    if (wrongGuessesCount >= 6) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 150, ropeEndX + 35, ropeEndY + 220, 6, "#e0e6ed");
    }
    const rightCenterX = 580;
    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SECRET WORD", rightCenterX, 130);
    ctx.fillStyle = "#ffffff";
    const fontSize = displayWord.length > 18 ? 32 : displayWord.length > 12 ? 38 : 46;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillText(displayWord, rightCenterX, 185);
    const remaining = Math.max(0, 6 - wrongGuessesCount);
    const livesColor = remaining > 3 ? "#00ff88" : remaining > 1 ? "#ffaa00" : "#ff3355";
    CanvasUtils.drawBadge(ctx, `${remaining} / 6 LIVES REMAINING`, rightCenterX - 110, 240, 220, 32, "rgba(0,0,0,0.3)", livesColor, "bold 13px sans-serif");
    const wrongLetters = guessedLetters.filter((l) => !displayWord.includes(l));
    if (wrongLetters.length > 0) {
      ctx.fillStyle = "#ff5555";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("INCORRECT GUESSES", rightCenterX, 310);
      CanvasUtils.fillRoundedRect(ctx, rightCenterX - 160, 335, 320, 54, 12, "rgba(0, 0, 0, 0.35)");
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
      flags: import_discord12.MessageFlags.IsComponentsV2
    });
    const buffer = await this.renderImage();
    const attachment = new import_discord12.AttachmentBuilder(buffer, { name: "hangman-board.png" });
    const activeContainer = this.createGameContainer("active", { image: "hangman-board.png" });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: import_discord12.MessageFlags.IsComponentsV2
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
    const avatar = this.ctx.user.displayAvatarURL({ extension: "png", size: 128 });
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
        await interaction.deferUpdate().catch(() => {
        });
        await this.endGame("quit");
        return;
      }
      if (action === "guess") {
        const modal = new import_discord12.ModalBuilder().setCustomId(this.modalId).setTitle("Hangman Guess");
        const textInput = new import_discord12.TextInputBuilder().setCustomId("guess_input").setStyle(import_discord12.TextInputStyle.Short).setMinLength(1).setMaxLength(this.targetWord.length).setRequired(true).setPlaceholder("e.g. A or the full word");
        const label = new import_discord12.LabelBuilder().setLabel("Enter a single letter or full word guess").setTextInputComponent(textInput);
        modal.addLabelComponents(label);
        await interaction.showModal(modal).catch(() => {
        });
        return;
      }
    }
    if (interaction.isModalSubmit()) {
      if (interaction.customId !== this.modalId) return;
      if (interaction.user.id !== this.ctx.userId) return;
      await interaction.deferUpdate().catch(() => {
      });
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
      if (message.deletable) await message.delete().catch(() => {
      });
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
        if (this.wrongGuesses >= this.maxMistakes) {
          await this.endGame("lost");
        } else {
          await this.refreshBoard(`\u274C **${guess}** is not the word! (-1 Life)`);
        }
      }
      return;
    }
    const letter = guess;
    if (this.guessedLetters.includes(letter)) {
      await this.refreshBoard(`\u26A0\uFE0F Letter **${letter}** has already been guessed!`);
      return;
    }
    this.guessedLetters.push(letter);
    if (this.targetWord.includes(letter)) {
      this.updateDisplayWord();
      const allRevealed = this.targetWord.split("").every((c) => !/[A-Z]/.test(c) || this.guessedLetters.includes(c));
      if (allRevealed) {
        await this.endGame("won");
      } else {
        await this.refreshBoard(`\u2705 Good guess! Letter **${letter}** is in the word!`);
      }
    } else {
      this.wrongGuesses += 1;
      if (this.wrongGuesses >= this.maxMistakes) {
        await this.endGame("lost");
      } else {
        await this.refreshBoard(`\u274C Letter **${letter}** is not in the word! (-1 Life)`);
      }
    }
  }
  async refreshBoard(statusNotice) {
    const buffer = await this.renderImage();
    const attachment = new import_discord12.AttachmentBuilder(buffer, { name: "hangman-board.png" });
    const container = this.createGameContainer("active", {
      image: "hangman-board.png",
      statusNotice
    });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: import_discord12.MessageFlags.IsComponentsV2
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
    const attachment = new import_discord12.AttachmentBuilder(buffer, { name: "hangman-board.png" });
    const container = this.createGameContainer(state, {
      word: this.targetWord,
      image: "hangman-board.png",
      error: errorMsg
    });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: import_discord12.MessageFlags.IsComponentsV2
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
        content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}
> \u{1F504} Starting game...`;
        break;
      case "active":
        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}
> **Category:** \`${this.category}\`
> Click **Guess Letter / Word** or type your guess directly in the chat!
${details?.statusNotice ? `
> ${details.statusNotice}` : ""}`;
        break;
      case "won":
        content = this.options.states?.won ? this.options.states.won.replace("{{word}}", revealedWord) : `## \u{1F389} Victory!
> You guessed the word: **${revealedWord}**!`;
        break;
      case "lost":
        content = this.options.states?.lost ? this.options.states.lost.replace("{{word}}", revealedWord) : `## \u{1F480} Game Over
> The word was: **${revealedWord}**`;
        break;
      case "quit":
        content = this.options.states?.quit ? this.options.states.quit.replace("{{word}}", revealedWord) : `## \u{1F6D1} Game Stopped
> You quit the game. The word was **${revealedWord}**`;
        break;
      case "timeout":
        content = this.options.states?.timeout ? this.options.states.timeout.replace("{{word}}", revealedWord) : `## \u23F1\uFE0F Time's Up
> Session expired. The word was: **${revealedWord}**`;
        break;
      case "error":
        content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown error.") : `## \u274C Error
> ${details?.error || "Unknown error occurred."}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (details?.image) {
      const gallery = new import_discord12.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }
    if (state === "active") {
      const guessBtn = new import_discord12.ButtonBuilder().setCustomId(`${this.btnPrefix}guess`).setLabel("Guess Letter / Word").setEmoji("\u{1F4A1}").setStyle(import_discord12.ButtonStyle.Primary);
      const quitBtn = new import_discord12.ButtonBuilder().setCustomId(`${this.btnPrefix}quit`).setLabel(this.quitButtonLabel).setEmoji("\u{1F6D1}").setStyle(import_discord12.ButtonStyle.Danger);
      const row = new import_discord12.ActionRowBuilder().addComponents(guessBtn, quitBtn);
      container.addActionRowComponents(row);
    }
    return container;
  }
};

// src/games/LieSwatter.ts
var import_discord13 = require("discord.js");

// src/data/trivia.ts
var TRIVIA_FACTS = [
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
var NEVER_HAVE_I_EVER_PROMPTS = [
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
    if (options.statement) {
      this.fact = {
        statement: options.statement,
        isTrue: options.isTrue ?? true,
        explanation: options.explanation || "No explanation provided."
      };
    } else {
      this.fact = getRandomTriviaFact();
    }
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
      flags: import_discord13.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame("timeout"));
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;
    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;
    await interaction.deferUpdate().catch(() => {
    });
    const chosen = customId.replace(this.btnPrefix, "");
    const userGuessIsTrue = chosen === "true";
    const isCorrect = userGuessIsTrue === this.fact.isTrue;
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
      flags: import_discord13.MessageFlags.IsComponentsV2
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
        content = `## ${this.gameTitle}
> "${this.fact.statement}"

Is this statement a **${this.labelTrue}** or a **${this.labelLie}**?`;
        break;
      case "won":
        const winText = this.options.winMessage ? this.options.winMessage.replace("{{answer}}", correctLabel).replace("{{time}}", data?.timeTaken || "0s") : `\u{1F3C6} Spot on! It was indeed **${correctLabel}**! Answered in **${data?.timeTaken || "0s"}**.`;
        content = `## ${this.gameTitle}
> ${winText}

\u{1F4D6} **Fact:** ${this.fact.explanation}`;
        break;
      case "lost":
        const loseText = this.options.loseMessage ? this.options.loseMessage.replace("{{answer}}", correctLabel) : `\u{1F480} Swatted! It was actually **${correctLabel}**.`;
        content = `## ${this.gameTitle}
> ${loseText}

\u{1F4D6} **Fact:** ${this.fact.explanation}`;
        break;
      case "timeout":
        content = `## ${this.gameTitle}
> \u23F1\uFE0F Time's up! It was actually **${correctLabel}**.

\u{1F4D6} **Fact:** ${this.fact.explanation}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    const isResult = state !== "active";
    const trueBtn = new import_discord13.ButtonBuilder().setCustomId(`${this.btnPrefix}true`).setLabel(this.labelTrue).setEmoji("\u2705").setStyle(isResult ? this.fact.isTrue ? import_discord13.ButtonStyle.Success : import_discord13.ButtonStyle.Secondary : import_discord13.ButtonStyle.Success).setDisabled(isResult);
    const lieBtn = new import_discord13.ButtonBuilder().setCustomId(`${this.btnPrefix}false`).setLabel(this.labelLie).setEmoji("\u274C").setStyle(isResult ? !this.fact.isTrue ? import_discord13.ButtonStyle.Success : import_discord13.ButtonStyle.Secondary : import_discord13.ButtonStyle.Danger).setDisabled(isResult);
    const row = new import_discord13.ActionRowBuilder().addComponents(trueBtn, lieBtn);
    container.addActionRowComponents(row);
    return container;
  }
};

// src/games/NeverHaveIEver.ts
var import_discord14 = require("discord.js");
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
      flags: import_discord14.MessageFlags.IsComponentsV2
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
      await interaction.deferUpdate().catch(() => {
      });
      await this.endGame();
      return;
    }
    await interaction.deferUpdate().catch(() => {
    });
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
      flags: import_discord14.MessageFlags.IsComponentsV2
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
      flags: import_discord14.MessageFlags.IsComponentsV2
    });
  }
  createGameContainer(isFinal) {
    const container = this.createContainer(isFinal ? 5763719 : this.defaultColor);
    const total = this.haveVoters.size + this.neverVoters.size;
    const havePct = total > 0 ? Math.round(this.haveVoters.size / total * 100) : 0;
    const neverPct = total > 0 ? Math.round(this.neverVoters.size / total * 100) : 0;
    let content = `## ${this.gameTitle}
> "${this.statement}"

`;
    if (total > 0) {
      content += `**Live Tally (${total} response${total === 1 ? "" : "s"}):**
`;
      content += `\u{1F64B} **I Have:** \`${this.haveVoters.size}\` (${havePct}%)
`;
      content += `\u{1F645} **Never:** \`${this.neverVoters.size}\` (${neverPct}%)
`;
      if (isFinal) {
        if (this.haveVoters.size > 0) {
          const names = Array.from(this.haveVoters).map((id) => `<@${id}>`).join(", ");
          content += `
**Have Done It:** ${names}`;
        }
        if (this.neverVoters.size > 0) {
          const names = Array.from(this.neverVoters).map((id) => `<@${id}>`).join(", ");
          content += `
**Never Done It:** ${names}`;
        }
      }
    } else {
      content += `> Click a button below to cast your confession!`;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (!isFinal) {
      const row = new import_discord14.ActionRowBuilder().addComponents(
        new import_discord14.ButtonBuilder().setCustomId(`${this.btnPrefix}have`).setLabel(this.options.buttons?.optionA || "I Have").setEmoji("\u{1F64B}").setStyle(import_discord14.ButtonStyle.Success),
        new import_discord14.ButtonBuilder().setCustomId(`${this.btnPrefix}never`).setLabel(this.options.buttons?.optionB || "Never").setEmoji("\u{1F645}").setStyle(import_discord14.ButtonStyle.Danger),
        new import_discord14.ButtonBuilder().setCustomId(`${this.btnPrefix}end`).setLabel("Finish").setEmoji("\u{1F3C1}").setStyle(import_discord14.ButtonStyle.Secondary)
      );
      container.addActionRowComponents(row);
    }
    return container;
  }
};

// src/games/QuickClick.ts
var import_discord15 = require("discord.js");
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
    this.emoji = options.emoji || "\u26A1";
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
      flags: import_discord15.MessageFlags.IsComponentsV2
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
      flags: import_discord15.MessageFlags.IsComponentsV2
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
      await interaction.deferUpdate().catch(() => {
      });
      await this.endGame("early");
      return;
    }
    const clickedIndex = parseInt(customId.replace(this.btnPrefix, ""), 10);
    if (clickedIndex === this.targetIndex) {
      const clickTimestamp = interaction.createdTimestamp || Date.now();
      const rawDelta = Math.max(1, clickTimestamp - this.startTime);
      const wsPing = interaction.client?.ws?.ping ?? 0;
      const transitEstimate = wsPing > 0 ? Math.round(wsPing / 2) : 0;
      const reactionTimeMs = Math.max(1, rawDelta - transitEstimate);
      await interaction.deferUpdate().catch(() => {
      });
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
      flags: import_discord15.MessageFlags.IsComponentsV2
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
        content = `## ${this.gameTitle}
> \u23F3 ${this.options.waitMessage || `Get ready! The **${this.emoji}** button will appear randomly...`}`;
        break;
      case "active":
        content = `## ${this.gameTitle}
> \u{1F525} **CLICK NOW!** Find and click the **${this.emoji}** button as fast as you can!`;
        break;
      case "won":
        const sec = ((reactionMs || 0) / 1e3).toFixed(3);
        content = `## \u26A1 Blazing Fast Reaction!
> \u{1F3C6} **GG <@${this.ctx.userId}>!**
> You clicked the button in **${reactionMs}ms** (\`${sec}s\`)!
> *(Network latency compensated)*`;
        break;
      case "early":
        content = `## \u274C Too Early!
> You clicked before the button appeared! Patience is a virtue.`;
        break;
      case "timeout":
        content = `## \u23F1\uFE0F Time's Up!
> ${this.options.loseMessage || "Time expired! You weren't fast enough."}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    const allDisabled = state !== "active";
    const showTarget = state === "active" || state === "won";
    let btnIndex = 0;
    for (let r = 0; r < 5; r++) {
      const row = new import_discord15.ActionRowBuilder();
      let addedInRow = 0;
      for (let c = 0; c < 5; c++) {
        if (btnIndex >= this.buttonCount) break;
        const isTarget = btnIndex === this.targetIndex;
        const btn = new import_discord15.ButtonBuilder().setCustomId(`${this.btnPrefix}${btnIndex}`).setLabel(isTarget && showTarget ? this.emoji : "\u200B").setStyle(isTarget && showTarget ? import_discord15.ButtonStyle.Success : import_discord15.ButtonStyle.Secondary).setDisabled(allDisabled ? true : !isTarget);
        row.addComponents(btn);
        btnIndex++;
        addedInRow++;
      }
      if (addedInRow > 0) {
        container.addActionRowComponents(row);
      }
    }
    return container;
  }
};

// src/games/RockPaperScissors.ts
var import_discord16 = require("discord.js");
var RockPaperScissors = class extends BaseGame {
  opponentUser = null;
  isVsBot = true;
  p1Move = null;
  p2Move = null;
  btnPrefix;
  gameTitle;
  constructor(manager, options) {
    super(manager, options, "rps");
    this.btnPrefix = getRandomString(6, "rps_");
    this.gameTitle = options.embed?.title || "Rock Paper Scissors";
    this.defaultColor = this.resolveColor(options.embed?.color);
    if (options.opponent) {
      this.opponentUser = options.opponent instanceof import_discord16.GuildMember ? options.opponent.user : options.opponent;
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
      flags: import_discord16.MessageFlags.IsComponentsV2
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
      await interaction.deferUpdate().catch(() => {
      });
      this.p1Move = move;
      const botMoves = ["rock", "paper", "scissors"];
      this.p2Move = botMoves[Math.floor(Math.random() * botMoves.length)];
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
        await ContextAdapter.replyEphemeral(interaction, `\u2705 You selected **${move.toUpperCase()}**!`);
      } else if (userId === this.opponentUser.id) {
        if (this.p2Move) {
          ContextAdapter.replyEphemeral(interaction, "You already picked your move!");
          return;
        }
        this.p2Move = move;
        await ContextAdapter.replyEphemeral(interaction, `\u2705 You selected **${move.toUpperCase()}**!`);
      }
      this.resetTimeout(() => this.endGame("timeout"));
      if (this.p1Move && this.p2Move) {
        await this.endGame("result");
      } else {
        const waitingFor = !this.p1Move ? `<@${this.ctx.userId}>` : `<@${this.opponentUser.id}>`;
        const container = this.createGameContainer("waiting", { waitingFor });
        await this.ctx.edit({ components: [container], flags: import_discord16.MessageFlags.IsComponentsV2 });
      }
    }
  }
  async endGame(state) {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state);
    const container = this.createGameContainer(state);
    await this.ctx.edit({
      components: [container],
      flags: import_discord16.MessageFlags.IsComponentsV2
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
      rock: "\u{1FAA8} Rock",
      paper: "\u{1F4C4} Paper",
      scissors: "\u2702\uFE0F Scissors"
    };
    switch (state) {
      case "active":
        if (this.isVsBot || !this.opponentUser) {
          content = `## ${this.gameTitle}
> You are playing against the **Bot**!
> Select your move below:`;
        } else {
          content = `## ${this.gameTitle}
> \u2694\uFE0F <@${this.ctx.userId}> vs <@${this.opponentUser.id}>!
> Both players, choose your move in secret!`;
        }
        break;
      case "waiting":
        content = `## ${this.gameTitle}
> One player locked in their move!
> \u23F3 Waiting for ${details?.waitingFor}...`;
        break;
      case "result":
        const m1 = this.p1Move || "rock";
        const m2 = this.p2Move || "rock";
        let winnerText = "";
        if (m1 === m2) {
          winnerText = "\u{1F91D} **It's a TIE!**";
        } else if (m1 === "rock" && m2 === "scissors" || m1 === "paper" && m2 === "rock" || m1 === "scissors" && m2 === "paper") {
          winnerText = `\u{1F3C6} **<@${this.ctx.userId}> WINS!**`;
        } else {
          const oppText = this.opponentUser ? `<@${this.opponentUser.id}>` : "\u{1F916} The Bot";
          winnerText = `\u{1F3C6} **${oppText} WINS!**`;
        }
        const p2Label = this.opponentUser ? `<@${this.opponentUser.id}>` : "\u{1F916} Bot";
        content = `## ${this.gameTitle} - Results
> ${winnerText}

**Choices:**
<@${this.ctx.userId}>: ${emojis[m1]}
${p2Label}: ${emojis[m2]}`;
        break;
      case "timeout":
        content = `## ${this.gameTitle}
> \u23F1\uFE0F Game session expired. Moves were not submitted in time.`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (state === "active" || state === "waiting") {
      const rock = new import_discord16.ButtonBuilder().setCustomId(`${this.btnPrefix}rock`).setLabel(this.options.buttons?.rock || "Rock").setEmoji("\u{1FAA8}").setStyle(import_discord16.ButtonStyle.Primary);
      const paper = new import_discord16.ButtonBuilder().setCustomId(`${this.btnPrefix}paper`).setLabel(this.options.buttons?.paper || "Paper").setEmoji("\u{1F4C4}").setStyle(import_discord16.ButtonStyle.Primary);
      const scissors = new import_discord16.ButtonBuilder().setCustomId(`${this.btnPrefix}scissors`).setLabel(this.options.buttons?.scissors || "Scissors").setEmoji("\u2702\uFE0F").setStyle(import_discord16.ButtonStyle.Primary);
      const row = new import_discord16.ActionRowBuilder().addComponents(rock, paper, scissors);
      container.addActionRowComponents(row);
    }
    return container;
  }
};

// src/games/ShuffleGuess.ts
var import_discord17 = require("discord.js");
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
      flags: import_discord17.MessageFlags.IsComponentsV2
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
    await interaction.deferUpdate().catch(() => {
    });
    this.resetTimeout(() => this.endGame("timeout"));
    if (action === "quit") {
      await this.endGame("quit");
      return;
    }
    if (action === "reshuffle") {
      this.scrambled = this.getValidScramble(this.targetWord);
      const container = this.createGameContainer("reshuffled", { feedback: "\u{1F504} *Letters reshuffled!*" });
      await this.ctx.edit({ components: [container], flags: import_discord17.MessageFlags.IsComponentsV2 });
    }
  }
  async onMessage(message) {
    if (!this.isActive) return;
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;
    const guess = message.content.toUpperCase().trim();
    if (guess.startsWith("/") || guess.startsWith("!")) return;
    if (message.deletable) await message.delete().catch(() => {
    });
    this.resetTimeout(() => this.endGame("timeout"));
    if (guess === this.targetWord) {
      await this.endGame("won");
    } else {
      const container = this.createGameContainer("wrong", { feedback: `\u274C **${guess}** is not correct! Keep trying!` });
      await this.ctx.edit({ components: [container], flags: import_discord17.MessageFlags.IsComponentsV2 });
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
      flags: import_discord17.MessageFlags.IsComponentsV2
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
        content = `## ${this.gameTitle}
`;
        if (data?.feedback) {
          content += `> ${data.feedback}

`;
        }
        content += `> Unscramble the letters below and type your guess in chat!

\`\`\`fix
${formatted}
\`\`\`
**Word Length:** \`${this.targetWord.length} letters\``;
        break;
      case "won":
        content = `## \u{1F389} Word Solved!
> \u{1F3C6} **GG <@${this.ctx.userId}>!**
> You unscrambled **${this.targetWord}** in **${data?.timeTaken || "0s"}**!`;
        break;
      case "quit":
        content = `## \u{1F6D1} Game Over
> You gave up! The secret word was **${this.targetWord}**.`;
        break;
      case "timeout":
        content = `## \u23F1\uFE0F Time's Up
> Session expired. The secret word was **${this.targetWord}**.`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (state === "active" || state === "reshuffled" || state === "wrong") {
      const row = new import_discord17.ActionRowBuilder().addComponents(
        new import_discord17.ButtonBuilder().setCustomId(`${this.btnPrefix}reshuffle`).setLabel(this.options.buttons?.reshuffle || "Reshuffle").setEmoji("\u{1F500}").setStyle(import_discord17.ButtonStyle.Secondary),
        new import_discord17.ButtonBuilder().setCustomId(`${this.btnPrefix}quit`).setLabel(this.options.buttons?.cancel || "Give Up").setEmoji("\u{1F6D1}").setStyle(import_discord17.ButtonStyle.Danger)
      );
      container.addActionRowComponents(row);
    }
    return container;
  }
};

// src/games/Snake.ts
var import_discord18 = require("discord.js");

// src/canvas/RenderSnake.ts
var import_canvas6 = require("@napi-rs/canvas");
var CANVAS_SIZE2 = 800;
var GRID_CONTAINER = 560;
var GRID_Y_START2 = 180;
var COLORS = {
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
    const canvas = new import_canvas6.Canvas(CANVAS_SIZE2, CANVAS_SIZE2);
    const ctx = canvas.getContext("2d");
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE2);
    bgGrad.addColorStop(0, COLORS.bgTop);
    bgGrad.addColorStop(1, COLORS.bgBot);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE2, CANVAS_SIZE2);
    await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, COLORS.snakeHead, 4);
    CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const truncatedName = username.length > 14 ? username.slice(0, 13) + "\u2026" : username;
    ctx.fillText(truncatedName, 146, 75);
    const scoreBoxW = 200;
    const scoreBoxX = CANVAS_SIZE2 - scoreBoxW - 40;
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#101217");
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#191d24");
    ctx.fillStyle = COLORS.snakeHead;
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("SCORE", scoreBoxX + scoreBoxW / 2, 45);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(String(score), scoreBoxX + scoreBoxW / 2, 70);
    const cellSize = GRID_CONTAINER / gridSize;
    const gridX = (CANVAS_SIZE2 - GRID_CONTAINER) / 2;
    CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START2, GRID_CONTAINER, GRID_CONTAINER, 16, COLORS.boardBg);
    ctx.strokeStyle = COLORS.gridLines;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < gridSize; i++) {
      ctx.moveTo(gridX + i * cellSize, GRID_Y_START2);
      ctx.lineTo(gridX + i * cellSize, GRID_Y_START2 + GRID_CONTAINER);
      ctx.moveTo(gridX, GRID_Y_START2 + i * cellSize);
      ctx.lineTo(gridX + GRID_CONTAINER, GRID_Y_START2 + i * cellSize);
    }
    ctx.stroke();
    const foodX = gridX + food.x * cellSize + cellSize / 2;
    const foodY = GRID_Y_START2 + food.y * cellSize + cellSize / 2;
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
      const py = GRID_Y_START2 + part.y * cellSize;
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
      CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START2, GRID_CONTAINER, GRID_CONTAINER, 16, "rgba(10, 12, 16, 0.82)");
      ctx.shadowColor = "#ff3355";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#ff3355";
      ctx.font = "bold 68px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(overlayTitle || "GAME OVER", CANVAS_SIZE2 / 2, GRID_Y_START2 + GRID_CONTAINER / 2 - 20);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "26px sans-serif";
      ctx.fillText(`Final Length: ${snake.length} | Score: ${score}`, CANVAS_SIZE2 / 2, GRID_Y_START2 + GRID_CONTAINER / 2 + 45);
      ctx.restore();
    }
    return canvas.toBuffer("image/png");
  }
  static drawEyes(ctx, x, y, size, dir) {
    ctx.fillStyle = "#111111";
    const offset = size / 3.8;
    let eye1 = { x: 0, y: 0 };
    let eye2 = { x: 0, y: 0 };
    if (dir === "UP") {
      eye1 = { x: x + offset, y: y + offset };
      eye2 = { x: x + size - offset, y: y + offset };
    } else if (dir === "DOWN") {
      eye1 = { x: x + offset, y: y + size - offset };
      eye2 = { x: x + size - offset, y: y + size - offset };
    } else if (dir === "LEFT") {
      eye1 = { x: x + offset, y: y + offset };
      eye2 = { x: x + offset, y: y + size - offset };
    } else {
      eye1 = { x: x + size - offset, y: y + offset };
      eye2 = { x: x + size - offset, y: y + size - offset };
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
  food = { x: 0, y: 0 };
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
    this.emojiUp = options.emojis?.up || "\u2B06\uFE0F";
    this.emojiDown = options.emojis?.down || "\u2B07\uFE0F";
    this.emojiLeft = options.emojis?.left || "\u2B05\uFE0F";
    this.emojiRight = options.emojis?.right || "\u27A1\uFE0F";
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
      flags: import_discord18.MessageFlags.IsComponentsV2
    });
    const buffer = await this.renderBoardImage();
    const attachment = new import_discord18.AttachmentBuilder(buffer, { name: "snake-board.png" });
    const activeContainer = this.createGameContainer("active", { image: "snake-board.png" });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: import_discord18.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame("timeout"));
  }
  initGame() {
    const startX = Math.floor(this.gridSize / 2);
    const startY = Math.floor(this.gridSize / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX, y: startY + 1 },
      { x: startX, y: startY + 2 }
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
      const occupied = this.snake.some((p) => p.x === fx && p.y === fy);
      if (!occupied) {
        this.food = { x: fx, y: fy };
        valid = true;
      }
    }
  }
  move(newDir) {
    const opposites = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT"
    };
    if (opposites[this.direction] === newDir) {
      newDir = this.direction;
    }
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
      case "RIGHT":
        head.x += 1;
        break;
    }
    if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
      this.isGameOver = true;
      return false;
    }
    const hitBody = this.snake.some((part, i) => {
      if (i === this.snake.length - 1 && !(head.x === this.food.x && head.y === this.food.y)) return false;
      return part.x === head.x && part.y === head.y;
    });
    if (hitBody) {
      this.isGameOver = true;
      return false;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 1;
      this.spawnFood();
    } else {
      this.snake.pop();
    }
    return true;
  }
  async renderBoardImage(overlayTitle) {
    const userAvatar = this.ctx.user.displayAvatarURL({ extension: "png", size: 128 });
    return RenderSnake.renderBoard(this.snake, this.food, this.direction, this.score, this.gridSize, this.ctx.user.username, userAvatar, this.isGameOver, overlayTitle);
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (!this.isAuthorized(interaction)) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    const id = interaction.customId;
    if (id === this.idQuit) {
      await interaction.deferUpdate().catch(() => {
      });
      return this.endGame("quit");
    }
    let nextDir = null;
    if (id === this.idUp) nextDir = "UP";
    else if (id === this.idDown) nextDir = "DOWN";
    else if (id === this.idLeft) nextDir = "LEFT";
    else if (id === this.idRight) nextDir = "RIGHT";
    if (!nextDir) return;
    await interaction.deferUpdate().catch(() => {
    });
    this.resetTimeout(() => this.endGame("timeout"));
    const alive = this.move(nextDir);
    const buffer = await this.renderBoardImage();
    const attachment = new import_discord18.AttachmentBuilder(buffer, { name: "snake-board.png" });
    if (!alive || this.isGameOver) {
      return this.endGame("gameover", { image: "snake-board.png", score: this.score }, attachment);
    }
    const container = this.createGameContainer("active", { image: "snake-board.png", score: this.score });
    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: import_discord18.MessageFlags.IsComponentsV2
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
      attachment = new import_discord18.AttachmentBuilder(buffer, { name: "snake-board.png" });
    }
    const container = this.createGameContainer(state, details || { score: this.score, image: "snake-board.png" });
    const files = attachment ? [attachment] : [];
    await this.ctx.edit({
      components: [container],
      files,
      flags: import_discord18.MessageFlags.IsComponentsV2
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
        content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}
> \u{1F504} Starting game...`;
        break;
      case "active":
        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle).replace("{{score}}", score.toString()).replace("{{length}}", this.snake.length.toString()) : `## ${this.gameTitle}
> Eat food and avoid crashing!

**Score:** \`${score}\` | **Length:** \`${this.snake.length}\``;
        break;
      case "gameover":
        content = this.options.states?.gameover ? this.options.states.gameover.replace("{{score}}", score.toString()) : `## \u{1F480} Game Over
> The snake crashed!

**Final Score:** \`${score}\``;
        break;
      case "quit":
        content = this.options.states?.quit ? this.options.states.quit.replace("{{score}}", score.toString()) : `## \u{1F6D1} Game Stopped
> You quit the game.

**Final Score:** \`${score}\``;
        break;
      case "timeout":
        content = this.options.states?.timeout ? this.options.states.timeout.replace("{{score}}", score.toString()) : `## \u23F1\uFE0F Time's Up
> Game session expired.

**Final Score:** \`${score}\``;
        break;
      case "error":
        content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown") : `## \u274C Error
> ${details?.error || "Unknown error occurred."}`;
        break;
    }
    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));
    if (details?.image) {
      const gallery = new import_discord18.MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }
    if (state !== "loading" && state !== "error") {
      const isDisabled = state !== "active";
      const up = new import_discord18.ButtonBuilder().setStyle(import_discord18.ButtonStyle.Secondary).setLabel(this.emojiUp).setCustomId(this.idUp).setDisabled(isDisabled);
      const down = new import_discord18.ButtonBuilder().setStyle(import_discord18.ButtonStyle.Secondary).setLabel(this.emojiDown).setCustomId(this.idDown).setDisabled(isDisabled);
      const left = new import_discord18.ButtonBuilder().setStyle(import_discord18.ButtonStyle.Secondary).setLabel(this.emojiLeft).setCustomId(this.idLeft).setDisabled(isDisabled);
      const right = new import_discord18.ButtonBuilder().setStyle(import_discord18.ButtonStyle.Secondary).setLabel(this.emojiRight).setCustomId(this.idRight).setDisabled(isDisabled);
      const quit = new import_discord18.ButtonBuilder().setStyle(import_discord18.ButtonStyle.Danger).setLabel(this.quitButtonLabel).setCustomId(this.idQuit).setEmoji("\u{1F6D1}").setDisabled(isDisabled);
      const dis1 = new import_discord18.ButtonBuilder().setLabel("\u200B").setStyle(import_discord18.ButtonStyle.Secondary).setCustomId("dis1").setDisabled(true);
      const dis2 = new import_discord18.ButtonBuilder().setLabel("\u200B").setStyle(import_discord18.ButtonStyle.Secondary).setCustomId("dis2").setDisabled(true);
      const row1 = new import_discord18.ActionRowBuilder().addComponents(dis1, up, dis2, quit);
      const row2 = new import_discord18.ActionRowBuilder().addComponents(left, down, right);
      container.addActionRowComponents(row1);
      container.addActionRowComponents(row2);
    }
    return container;
  }
};

// src/games/TicTacToe.ts
var import_discord19 = require("discord.js");
var TicTacToe = class extends BaseGame {
  opponentUser;
  board = Array(9).fill(null);
  currentTurnId;
  btnPrefix;
  gameTitle;
  constructor(manager, options) {
    super(manager, options, "tictactoe");
    this.btnPrefix = getRandomString(6, "ttt_");
    this.opponentUser = options.opponent instanceof import_discord19.GuildMember ? options.opponent.user : options.opponent;
    this.gameTitle = options.embed?.title || "Tic Tac Toe";
    this.defaultColor = this.resolveColor(options.embed?.color);
    this.currentTurnId = this.ctx.userId;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 6e4;
  }
  async start() {
    if (this.opponentUser.id === this.ctx.userId) {
      const container2 = this.createContainer(16711680).addTextDisplayComponents((t) => t.setContent("## \u274C Error\n> You cannot play Tic Tac Toe against yourself!"));
      await this.ctx.sendInitial({
        components: [container2],
        flags: import_discord19.MessageFlags.IsComponentsV2
      });
      return;
    }
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();
    const container = this.createGameContainer("active");
    await this.ctx.sendInitial({
      components: [container],
      flags: import_discord19.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame("timeout"));
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;
    const userId = interaction.user.id;
    if (userId !== this.ctx.userId && userId !== this.opponentUser.id) {
      ContextAdapter.replyEphemeral(interaction, "You are not participating in this Tic Tac Toe match!");
      return;
    }
    if (userId !== this.currentTurnId) {
      ContextAdapter.replyEphemeral(interaction, "Please wait for your turn!");
      return;
    }
    const index = parseInt(customId.replace(this.btnPrefix, ""), 10);
    if (this.board[index] !== null) return;
    await interaction.deferUpdate().catch(() => {
    });
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
    this.currentTurnId = this.currentTurnId === this.ctx.userId ? this.opponentUser.id : this.ctx.userId;
    const container = this.createGameContainer("active");
    await this.ctx.edit({
      components: [container],
      flags: import_discord19.MessageFlags.IsComponentsV2
    });
  }
  checkWinner() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    return null;
  }
  async endGame(state, winningSymbol) {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(state, state === "won" && winningSymbol === "X" ? 1 : 0);
    const container = this.createGameContainer(state, winningSymbol);
    await this.ctx.edit({
      components: [container],
      flags: import_discord19.MessageFlags.IsComponentsV2
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
        content = `## ${this.gameTitle}
> \u2694\uFE0F <@${this.ctx.userId}> (\u274C) vs <@${this.opponentUser.id}> (\u2B55)!

> \u{1F3AF} **Current Turn:** <@${this.currentTurnId}>`;
        break;
      case "won":
        const winnerId = winningSymbol === "X" ? this.ctx.userId : this.opponentUser.id;
        content = `## ${this.gameTitle} - Results
> \u{1F3C6} **GG! <@${winnerId}> (${winningSymbol}) WON the match!**`;
        break;
      case "tie":
        content = `## ${this.gameTitle} - Results
> \u{1F91D} **It's a TIE!** Neither player could achieve three in a row.`;
        break;
      case "timeout":
        content = `## ${this.gameTitle}
> \u23F1\uFE0F Game session expired due to inactivity.`;
        break;
    }
    container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
    const isFinished = state !== "active";
    for (let row = 0; row < 3; row++) {
      const actionRow = new import_discord19.ActionRowBuilder();
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        const cell = this.board[index];
        let label = "\u200B";
        let style = import_discord19.ButtonStyle.Secondary;
        if (cell === "X") {
          label = "\u274C";
          style = import_discord19.ButtonStyle.Danger;
        } else if (cell === "O") {
          label = "\u2B55";
          style = import_discord19.ButtonStyle.Primary;
        }
        const btn = new import_discord19.ButtonBuilder().setCustomId(`${this.btnPrefix}${index}`).setLabel(label).setStyle(style).setDisabled(isFinished || cell !== null);
        actionRow.addComponents(btn);
      }
      container.addActionRowComponents(actionRow);
    }
    return container;
  }
};

// src/games/WillYouPressTheButton.ts
var import_discord20 = require("discord.js");

// src/data/dilemmas.ts
var WYPTB_DILEMMAS = [
  {
    question: "You can teleport anywhere in the universe instantly.",
    consequence: "You arrive completely naked every time.",
    stats: { yes: "82%", no: "18%" }
  },
  {
    question: "You become a billionaire overnight.",
    consequence: "Every time you buy something, you must sing the receipt out loud.",
    stats: { yes: "74%", no: "26%" }
  },
  {
    question: "You can speak, read, and write every human language fluently.",
    consequence: "You can never speak in your native mother tongue again.",
    stats: { yes: "68%", no: "32%" }
  },
  {
    question: "You get photographic memory and never forget anything.",
    consequence: "You can never listen to music again.",
    stats: { yes: "45%", no: "55%" }
  },
  {
    question: "You can stop time whenever you want.",
    consequence: "Every second time is stopped, you age by two seconds.",
    stats: { yes: "59%", no: "41%" }
  },
  {
    question: "You can eat whatever you want without gaining weight or getting unhealthy.",
    consequence: "All drinks taste like lukewarm tap water.",
    stats: { yes: "63%", no: "37%" }
  },
  {
    question: "You become the greatest gamer in the world across all titles.",
    consequence: "You can only play with inverted controls forever.",
    stats: { yes: "51%", no: "49%" }
  },
  {
    question: "You can read people's minds whenever you make eye contact.",
    consequence: "You cannot turn it off, and they can hear your thoughts too.",
    stats: { yes: "38%", no: "62%" }
  },
  {
    question: "You have unlimited battery on all your electronic devices forever.",
    consequence: "Your Wi-Fi speed is capped at 10 Mbps.",
    stats: { yes: "42%", no: "58%" }
  },
  {
    question: "You can breathe underwater and swim like a fish.",
    consequence: "You can never eat seafood again.",
    stats: { yes: "79%", no: "21%" }
  },
  {
    question: "You never need to sleep again and never feel tired.",
    consequence: "You can never dream again.",
    stats: { yes: "71%", no: "29%" }
  },
  {
    question: "You can talk to animals and understand them perfectly.",
    consequence: "They all have incredibly sarcastic British accents.",
    stats: { yes: "88%", no: "12%" }
  },
  {
    question: "You always win every lottery or raffle you enter.",
    consequence: "Fifty percent of all your winnings must be donated to charity.",
    stats: { yes: "94%", no: "6%" }
  },
  {
    question: "You are immune to all physical pain and sickness.",
    consequence: "You stub your toe every single morning at 7:00 AM.",
    stats: { yes: "76%", no: "24%" }
  },
  {
    question: "You can travel back in time to fix any past mistake.",
    consequence: "A random stranger forgets you ever existed.",
    stats: { yes: "81%", no: "19%" }
  }
];
var WYR_DILEMMAS = [
  {
    optionA: "Be able to see 10 minutes into the future",
    optionB: "Be able to see 100 years into the future",
    stats: { votesA: 58, votesB: 42 }
  },
  {
    optionA: "Never have to clean dishes again",
    optionB: "Never have to do laundry again",
    stats: { votesA: 52, votesB: 48 }
  },
  {
    optionA: "Live in a world without music",
    optionB: "Live in a world without movies and television",
    stats: { votesA: 28, votesB: 72 }
  },
  {
    optionA: "Always be 15 minutes late everywhere",
    optionB: "Always be 20 minutes early everywhere",
    stats: { votesA: 19, votesB: 81 }
  },
  {
    optionA: "Have unlimited free flights for life",
    optionB: "Never have to pay for food anywhere for life",
    stats: { votesA: 41, votesB: 59 }
  },
  {
    optionA: "Be fluent in every programming language",
    optionB: "Be fluent in every spoken human language",
    stats: { votesA: 33, votesB: 67 }
  },
  {
    optionA: "Have super strength like Superman",
    optionB: "Have super intelligence like Batman",
    stats: { votesA: 36, votesB: 64 }
  },
  {
    optionA: "Always have damp socks on your feet",
    optionB: "Always have an annoying eyelash stuck in your eye",
    stats: { votesA: 62, votesB: 38 }
  },
  {
    optionA: "Live in virtual reality with total control",
    optionB: "Live in the real world with normal limitations",
    stats: { votesA: 44, votesB: 56 }
  },
  {
    optionA: "Be able to rewind time by 5 seconds",
    optionB: "Be able to pause time for 10 seconds",
    stats: { votesA: 73, votesB: 27 }
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
    if (options.perk && options.consequence) {
      this.dilemma = {
        question: options.perk,
        consequence: options.consequence,
        stats: { yes: "50%", no: "50%" }
      };
    } else {
      this.dilemma = getRandomWYPTB();
    }
    this.defaultTimeout = options.time || 6e4;
  }
  async start() {
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();
    const container = this.createGameContainer("active");
    await this.ctx.sendInitial({
      components: [container],
      flags: import_discord20.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame());
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;
    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;
    await interaction.deferUpdate().catch(() => {
    });
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
      flags: import_discord20.MessageFlags.IsComponentsV2
    });
  }
  createGameContainer(state, pressed) {
    let stateColor = this.defaultColor;
    if (state === "result") {
      stateColor = pressed ? 5763719 : 15548997;
    } else if (state === "timeout") {
      stateColor = 15548997;
    }
    const container = this.createContainer(stateColor);
    let content = "";
    switch (state) {
      case "active":
        content = `## ${this.gameTitle}
> ${this.dilemma.question}

**BUT**

> ${this.dilemma.consequence}`;
        break;
      case "result":
        const decisionText = pressed ? this.options.yesPress || "Yes! Press it!" : this.options.noPress || "No! Don't press!";
        content = `## ${this.gameTitle}
> ${this.dilemma.question}

**BUT**

> ${this.dilemma.consequence}

**You chose:** \`${decisionText}\`

\u{1F4CA} **Community Consensus:**
\u{1F518} **Pressed:** \`${this.dilemma.stats.yes}\`
\u{1F6AB} **Didn't Press:** \`${this.dilemma.stats.no}\``;
        break;
      case "timeout":
        content = `## ${this.gameTitle}
> \u23F1\uFE0F Time's up! You took too long to decide.

\u{1F4CA} **Community Consensus:**
\u{1F518} **Pressed:** \`${this.dilemma.stats.yes}\`
\u{1F6AB} **Didn't Press:** \`${this.dilemma.stats.no}\``;
        break;
    }
    container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
    const isResult = state === "result" || state === "timeout";
    const txtYes = isResult ? `${this.labelYes} (${this.dilemma.stats.yes})` : this.labelYes;
    const txtNo = isResult ? `${this.labelNo} (${this.dilemma.stats.no})` : this.labelNo;
    let styleYes = import_discord20.ButtonStyle.Success;
    let styleNo = import_discord20.ButtonStyle.Danger;
    if (isResult) {
      if (pressed === true) styleNo = import_discord20.ButtonStyle.Secondary;
      if (pressed === false) styleYes = import_discord20.ButtonStyle.Secondary;
    }
    const btnYes = new import_discord20.ButtonBuilder().setStyle(styleYes).setLabel(txtYes).setEmoji("\u{1F518}").setCustomId(`${this.btnPrefix}yes`).setDisabled(isResult);
    const btnNo = new import_discord20.ButtonBuilder().setStyle(styleNo).setLabel(txtNo).setEmoji("\u{1F6AB}").setCustomId(`${this.btnPrefix}no`).setDisabled(isResult);
    const row = new import_discord20.ActionRowBuilder().addComponents(btnYes, btnNo);
    container.addActionRowComponents(row);
    return container;
  }
};

// src/games/WouldYouRather.ts
var import_discord21 = require("discord.js");
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
    if (options.optionA && options.optionB) {
      this.dilemma = {
        optionA: options.optionA,
        optionB: options.optionB,
        stats: { votesA: 50, votesB: 50 }
      };
    } else {
      this.dilemma = getRandomWYR();
    }
    this.defaultTimeout = options.time || 6e4;
  }
  async start() {
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();
    const container = this.createGameContainer("active");
    await this.ctx.sendInitial({
      components: [container],
      flags: import_discord21.MessageFlags.IsComponentsV2
    });
    this.resetTimeout(() => this.endGame());
  }
  async onInteraction(interaction) {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;
    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;
    await interaction.deferUpdate().catch(() => {
    });
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
      flags: import_discord21.MessageFlags.IsComponentsV2
    });
  }
  createGameContainer(state, choice) {
    let stateColor = this.defaultColor;
    if (state === "result") {
      stateColor = choice === "A" ? 5793266 : 5763719;
    } else if (state === "timeout") {
      stateColor = 15548997;
    }
    const container = this.createContainer(stateColor);
    let content = "";
    const totalVotes = this.dilemma.stats.votesA + this.dilemma.stats.votesB;
    const pctA = Math.round(this.dilemma.stats.votesA / totalVotes * 100);
    const pctB = Math.round(this.dilemma.stats.votesB / totalVotes * 100);
    switch (state) {
      case "active":
        content = `## ${this.gameTitle}
> **Would you rather...**

\u{1F170}\uFE0F **Option A:**
> ${this.dilemma.optionA}

*\u2014 OR \u2014*

\u{1F171}\uFE0F **Option B:**
> ${this.dilemma.optionB}

*Choose your fate below!*`;
        break;
      case "result":
        const chosenText = choice === "A" ? this.dilemma.optionA : this.dilemma.optionB;
        content = `## ${this.gameTitle}
> \u{1F449} You chose **Option ${choice}**: "${chosenText}"

\u{1F4CA} **Community Consensus:**
\u{1F170}\uFE0F **Option A (${pctA}%):**
> ${this.dilemma.optionA}

\u{1F171}\uFE0F **Option B (${pctB}%):**
> ${this.dilemma.optionB}`;
        break;
      case "timeout":
        content = `## ${this.gameTitle}
> \u23F1\uFE0F Time's up! You took too long to choose.

\u{1F4CA} **Community Consensus:**
\u{1F170}\uFE0F **Option A (${pctA}%):**
> ${this.dilemma.optionA}

\u{1F171}\uFE0F **Option B (${pctB}%):**
> ${this.dilemma.optionB}`;
        break;
    }
    container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
    const isResult = state === "result" || state === "timeout";
    const labelA = isResult ? `${this.labelA} (${pctA}%)` : this.labelA;
    const labelB = isResult ? `${this.labelB} (${pctB}%)` : this.labelB;
    let styleA = import_discord21.ButtonStyle.Primary;
    let styleB = import_discord21.ButtonStyle.Primary;
    if (isResult) {
      if (choice === "A") {
        styleA = import_discord21.ButtonStyle.Success;
        styleB = import_discord21.ButtonStyle.Secondary;
      } else if (choice === "B") {
        styleA = import_discord21.ButtonStyle.Secondary;
        styleB = import_discord21.ButtonStyle.Success;
      }
    }
    const btnA = new import_discord21.ButtonBuilder().setCustomId(`${this.btnPrefix}A`).setLabel(labelA).setEmoji("\u{1F170}\uFE0F").setStyle(styleA).setDisabled(isResult);
    const btnB = new import_discord21.ButtonBuilder().setCustomId(`${this.btnPrefix}B`).setLabel(labelB).setEmoji("\u{1F171}\uFE0F").setStyle(styleB).setDisabled(isResult);
    const row = new import_discord21.ActionRowBuilder().addComponents(btnA, btnB);
    container.addActionRowComponents(row);
    return container;
  }
};

// src/utils/Notifier.ts
var yellow = (s) => `\x1B[33m${s}\x1B[39m`;
var green = (s) => `\x1B[32m${s}\x1B[39m`;
var red = (s) => `\x1B[31m${s}\x1B[39m`;
var cyan = (s) => `\x1B[36m${s}\x1B[39m`;
function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}
function boxConsole(messages) {
  const defaultSpace = 4;
  const stripped = messages.map((m) => stripAnsi(m));
  const maxLen = Math.max(...stripped.map((s) => s.length)) + defaultSpace * 2;
  const line = yellow("\u2500".repeat(maxLen));
  console.log(yellow("\u250C") + line + yellow("\u2510"));
  console.log(yellow("\u2502") + " ".repeat(maxLen) + yellow("\u2502"));
  for (let i = 0; i < messages.length; i++) {
    const len = stripped[i].length;
    const padTotal = maxLen - len;
    const padLeft = Math.floor(padTotal / 2);
    const padRight = padTotal - padLeft;
    console.log(yellow("\u2502") + " ".repeat(padLeft) + messages[i] + " ".repeat(padRight) + yellow("\u2502"));
  }
  console.log(yellow("\u2502") + " ".repeat(maxLen) + yellow("\u2502"));
  console.log(yellow("\u2514") + line + yellow("\u2518"));
}
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
      const execPromise = promisify(exec);
      const { stdout } = await execPromise("npm show @m3rcena/weky version", { timeout: 3500 });
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }
  return null;
}
async function checkPackageUpdates(currentVersion, disabled, gameName) {
  if (disabled) return;
  try {
    const latest = await fetchLatestVersion();
    if (!latest) return;
    if (compareSemver(currentVersion, latest) < 0) {
      const messages = [];
      if (gameName) {
        messages.push(`Are you using ${red(gameName)}? Don't lose out on new features!`);
      }
      messages.push(`New ${green("version")} of ${yellow("@m3rcena/weky")} is available!`, `${red(currentVersion)} -> ${green(latest)}`, `Registry: ${cyan("https://www.npmjs.com/package/@m3rcena/weky")}`, `Run ${green(`npm i @m3rcena/weky@${latest}`)} to update!`);
      boxConsole(messages);
    }
  } catch {
  }
}

// src/core/WekyManager.ts
var WekyManager = class extends import_events.EventEmitter {
  _client;
  _eventManager;
  defaultTimeout = 6e4;
  embedColor;
  unauthorizedMessage;
  notifyUpdates = true;
  /**
   * Initializes the WekyManager.
   * @param client The Discord.js Client instance.
   * @param options Optional configuration object or legacy notifyUpdates boolean.
   * @param notifyUpdatesParam Legacy parameter for update notifications.
   */
  constructor(client, options, notifyUpdatesParam) {
    super();
    if (!client || !(client instanceof import_discord22.Client) && typeof client.on !== "function") {
      throw new TypeError("[WekyManager] A valid Discord.js Client instance is required.");
    }
    this._client = client;
    this._eventManager = new EventManager(this._client);
    if (typeof options === "boolean") {
      this.notifyUpdates = options;
    } else if (typeof options === "string") {
      this.notifyUpdates = typeof notifyUpdatesParam === "boolean" ? notifyUpdatesParam : true;
    } else if (options && typeof options === "object") {
      if (typeof options.defaultTimeout === "number") {
        this.defaultTimeout = options.defaultTimeout;
      }
      if (options.embedColor !== void 0) {
        this.embedColor = options.embedColor;
      }
      if (typeof options.unauthorizedMessage === "string") {
        this.unauthorizedMessage = options.unauthorizedMessage;
      }
      if (typeof options.notifyUpdates === "boolean") {
        this.notifyUpdates = options.notifyUpdates;
      }
    }
    if (this.notifyUpdates) {
      checkPackageUpdates(version, false).catch(() => {
      });
    }
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
  /* -------------------------------------------------------------------------- */
  /* MINIGAMES CREATION METHODS                                                 */
  /* -------------------------------------------------------------------------- */
  /**
   * Starts a new **2048** minigame session.
   */
  async create2048(options) {
    const game = new Game2048(this, options);
    await game.start();
  }
  /**
   * Starts a new **Calculator** session with safe mathematical evaluation.
   */
  async createCalculator(options) {
    const game = new Calculator(this, options);
    await game.start();
  }
  /**
   * Starts a new **Chaos Words** minigame session.
   */
  async createChaosWords(options) {
    const game = new ChaosWords(this, options);
    await game.start();
  }
  /**
   * Starts a new **Fast Type** speed typing challenge.
   */
  async createFastType(options) {
    const game = new FastType(this, options);
    await game.start();
  }
  /**
   * Starts a new turn-based **Fight** duel RPG between two players.
   */
  async createFight(options) {
    const game = new Fight(this, options);
    await game.start();
  }
  /**
   * Starts a new **Guess The Number** game (Solo or Public).
   */
  async createGuessTheNumber(options) {
    const game = new GuessTheNumber(this, options);
    await game.start();
  }
  /**
   * Starts a new **Guess The Pokemon** game featuring native canvas silhouettes.
   */
  async createGuessThePokemon(options) {
    const game = new GuessThePokemon(this, options);
    await game.start();
  }
  /**
   * Starts a new **Hangman** game featuring high-resolution canvas gallows.
   */
  async createHangman(options) {
    const game = new Hangman(this, options);
    await game.start();
  }
  /**
   * Starts a new **Lie Swatter** true-or-false trivia quiz.
   */
  async createLieSwatter(options) {
    const game = new LieSwatter(this, options);
    await game.start();
  }
  /**
   * Starts a new **Never Have I Ever** interactive party voting game.
   */
  async createNeverHaveIEver(options) {
    const game = new NeverHaveIEver(this, options);
    await game.start();
  }
  /**
   * Starts a new **Quick Click** reaction speed test.
   */
  async createQuickClick(options) {
    const game = new QuickClick(this, options);
    await game.start();
  }
  /**
   * Starts a new **Shuffle Guess** word unscramble puzzle.
   */
  async createShuffleGuess(options) {
    const game = new ShuffleGuess(this, options);
    await game.start();
  }
  /**
   * Starts a new **Snake** arcade game featuring retro canvas graphics.
   */
  async createSnake(options) {
    const game = new Snake(this, options);
    await game.start();
  }
  /**
   * Starts a new **Will You Press The Button?** dilemma game.
   */
  async createWillYouPressTheButton(options) {
    const game = new WillYouPressTheButton(this, options);
    await game.start();
  }
  /**
   * Starts a new **Would You Rather?** dilemma game.
   */
  async createWouldYouRather(options) {
    const game = new WouldYouRather(this, options);
    await game.start();
  }
  /**
   * Starts a new **Rock Paper Scissors** game (Solo vs Bot or 2-Player).
   */
  async createRPS(options) {
    const game = new RockPaperScissors(this, options);
    await game.start();
  }
  /** Alias for createRPS */
  async createRockPaperScissors(options) {
    return this.createRPS(options);
  }
  /**
   * Starts a new interactive **Tic Tac Toe** match.
   */
  async createTicTacToe(options) {
    const game = new TicTacToe(this, options);
    await game.start();
  }
  /* -------------------------------------------------------------------------- */
  /* UTILITY HELPERS                                                            */
  /* -------------------------------------------------------------------------- */
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
    const embed = new import_discord22.EmbedBuilder();
    if (embedOptions.title) embed.setTitle(embedOptions.title);
    if (embedOptions.description) embed.setDescription(embedOptions.description);
    if (embedOptions.url) embed.setURL(embedOptions.url);
    if (embedOptions.thumbnail) embed.setThumbnail(embedOptions.thumbnail);
    if (embedOptions.image) embed.setImage(embedOptions.image);
    const color = embedOptions.color || this.embedColor;
    embed.setColor(safeResolveColor(color, 5793266));
    if (embedOptions.footer) embed.setFooter(embedOptions.footer);
    if (embedOptions.timestamp) {
      embed.setTimestamp(embedOptions.timestamp === true ? /* @__PURE__ */ new Date() : new Date(embedOptions.timestamp));
    }
    if (embedOptions.author) {
      embed.setAuthor({
        name: embedOptions.author.name,
        iconURL: embedOptions.author.icon_url,
        url: embedOptions.author.url
      });
    }
    if (!noFields && embedOptions.fields && embedOptions.fields.length > 0) {
      embed.setFields(embedOptions.fields);
    }
    return embed;
  }
};

// src/canvas/WekyCanvas.ts
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
    return RenderPokemon.renderCard(
      {
        name: pokemon.name,
        imageUrl: pokemon.imageUrl || pokemon.image || "",
        types: pokemon.types || ["Normal"],
        abilities: pokemon.abilities || [],
        id: pokemon.id
      },
      reveal
    );
  }
};

// src/engines/CalculatorEngine.ts
var STANDARD_KEYS2 = ["DC", "(", ")", "\u232B", "AC", "7", "8", "9", "\xF7", "^", "4", "5", "6", "x", "SQRT", "1", "2", "3", " - ", " + ", "2nd", "0", ".", "ans", "="];
var SCIENTIFIC_KEYS2 = ["DC", "SIN", "COS", "TAN", "AC", "LG", "LN", "x!", "1/x", "\u232B", "RND", "\u03C0", "e", "\xF7", "x", "(", ")", "%", " - ", " + ", "2nd", "0", ".", "ans", "="];
var INVALID_START_KEYS2 = ["\u232B", "AC", "=", "x", "\xF7", "%", "^", "x!"];
var CalculatorEngine = class {
  expression = " ";
  lastAnswer = "";
  hasCalculated = false;
  is2nd = false;
  constructor() {
  }
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
    if (key === "\u232B") {
      this.backspace();
      return;
    }
    if (key === "=") {
      return this.calculate();
    }
    let token = key;
    if (token === "\xD7" || token === "*") token = "x";
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
    const keys = this.is2nd ? SCIENTIFIC_KEYS2 : STANDARD_KEYS2;
    const isEmpty = this.expression.trim() === "";
    const rows = [];
    for (let i = 0; i < keys.length; i += 5) {
      const chunk = keys.slice(i, i + 5);
      const components = chunk.map((k) => {
        let disabled = false;
        if (k === "ans" && !this.hasCalculated) disabled = true;
        else if (isEmpty && INVALID_START_KEYS2.includes(k)) disabled = true;
        let style = "secondary";
        if (k === "=") style = "success";
        else if (k === "2nd") style = this.is2nd ? "success" : "primary";
        else if (k === "AC" || k === "DC") style = "danger";
        else if (["x", "\xF7", " - ", " + ", "^", "%"].includes(k)) style = "primary";
        return {
          id: k,
          label: k,
          emoji: k === "DC" ? "\u{1F6D1}" : void 0,
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
    this.currentTurnId = Math.random() < 0.5 ? this.p1.id : this.p2.id;
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
      announcement: this.lastAnnouncement
    };
  }
  /**
   * Performs a combat action for a fighter.
   */
  performAction(action, playerId) {
    if (this.phase === "REQUEST") {
      return { success: false, message: "Duel has not started yet. Call acceptChallenge() first." };
    }
    if (this.phase === "ENDED") {
      return { success: false, message: "Duel has already ended." };
    }
    if (playerId !== this.p1.id && playerId !== this.p2.id) {
      return { success: false, message: "User is not a combatant in this duel." };
    }
    if (action === "surrender") {
      this.winner = playerId === this.p1.id ? this.p2 : this.p1;
      this.loser = playerId === this.p1.id ? this.p1 : this.p2;
      this.phase = "ENDED";
      this.endReason = "SURRENDER";
      this.lastAnnouncement = `${this.loser.username} surrendered! ${this.winner.username} wins!`;
      return { success: true, message: this.lastAnnouncement };
    }
    if (playerId !== this.currentTurnId) {
      return { success: false, message: "It is not this player's turn." };
    }
    const attacker = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
    const defender = this.currentTurnId === this.p1.id ? this.p2 : this.p1;
    if (action === "hit" || action === "heavy") {
      const isHeavy = action === "heavy";
      let damage = isHeavy ? Math.floor(Math.random() * 18) + 18 : Math.floor(Math.random() * 13) + 10;
      if (isHeavy && Math.random() < 0.25) {
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
      if (attacker.coins < 25) {
        return { success: false, message: "Not enough coins for Shield (requires 25)." };
      }
      attacker.coins -= 25;
      if (!attacker.activeEffects) attacker.activeEffects = [];
      if (!attacker.activeEffects.includes("Shield")) attacker.activeEffects.push("Shield");
      attacker.lastAction = "Activated Shield";
      this.lastAnnouncement = `${attacker.username} activated a Shield! (-50% damage taken)`;
    } else if (action === "double") {
      if (attacker.coins < 30) {
        return { success: false, message: "Not enough coins for 2x Damage (requires 30)." };
      }
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
    } else {
      this.currentTurnId = defender.id;
    }
    return { success: true, message: this.lastAnnouncement };
  }
  /**
   * Returns current combat state.
   */
  getState() {
    return {
      p1: { ...this.p1, activeEffects: [...this.p1.activeEffects || []] },
      p2: { ...this.p2, activeEffects: [...this.p2.activeEffects || []] },
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
    return [
      {
        components: [
          { id: "hit", label: "Attack", emoji: "\u2694\uFE0F", style: "primary", disabled },
          { id: "heavy", label: "Heavy Attack", emoji: "\u{1F4A5}", style: "primary", disabled },
          { id: "heal", label: "Heal (+15-25 HP)", emoji: "\u{1F49A}", style: "success", disabled }
        ]
      },
      {
        components: [
          { id: "shield", label: "Shield (25\xA2)", emoji: "\u{1F6E1}\uFE0F", style: "secondary", disabled: !canShield },
          { id: "double", label: "2x Damage (30\xA2)", emoji: "\u26A1", style: "secondary", disabled: !canDouble },
          { id: "surrender", label: "Surrender", emoji: "\u{1F3F3}\uFE0F", style: "danger", disabled: !isFightPhase }
        ]
      }
    ];
  }
  /**
   * Renders the current fight arena card as a PNG buffer.
   */
  async renderCard() {
    if (this.phase === "REQUEST") {
      return RenderFight.renderRequestCard(this.p1, this.p2);
    }
    if (this.phase === "ENDED" && this.winner) {
      return RenderFight.renderOutcomeCard(this.winner, this.loser, this.endReason);
    }
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
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const spot = empty[Math.floor(Math.random() * empty.length)];
      this.board[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
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
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const combined = filtered[i] * 2;
          merged.push(combined);
          scoreGained += combined;
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      return merged;
    };
    if (direction === "LEFT") {
      newBoard = newBoard.map((row) => {
        const nr = processRow(row);
        if (nr.join(",") !== row.join(",")) moved = true;
        return nr;
      });
    } else if (direction === "RIGHT") {
      newBoard = newBoard.map((row) => {
        const rev = [...row].reverse();
        const nr = processRow(rev);
        if (nr.join(",") !== rev.join(",")) moved = true;
        return nr.reverse();
      });
    } else if (direction === "UP") {
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
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] >= 2048) return true;
      }
    }
    return false;
  }
  checkGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) return false;
        if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return false;
        if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return false;
      }
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
    return [
      {
        components: [
          { id: "blank_1", label: " ", style: "secondary", disabled: true },
          { id: "up", label: "Up", emoji: "\u2B06\uFE0F", style: "primary", disabled },
          { id: "blank_2", label: " ", style: "secondary", disabled: true },
          { id: "quit", label: "Quit", emoji: "\u{1F6D1}", style: "danger", disabled }
        ]
      },
      {
        components: [
          { id: "left", label: "Left", emoji: "\u2B05\uFE0F", style: "primary", disabled },
          { id: "down", label: "Down", emoji: "\u2B07\uFE0F", style: "primary", disabled },
          { id: "right", label: "Right", emoji: "\u27A1\uFE0F", style: "primary", disabled }
        ]
      }
    ];
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
    if (this.isGameOver) return { correct: false, isWon: this.isWon, isGameOver: true };
    const char = letter.toUpperCase().trim();
    if (!char || char.length !== 1 || this.guessedLetters.includes(char)) {
      return { correct: false, isWon: this.isWon, isGameOver: this.isGameOver };
    }
    this.guessedLetters.push(char);
    const isMatch = this.word.includes(char);
    if (!isMatch) {
      this.mistakes++;
      if (this.mistakes >= this.maxMistakes) {
        this.isGameOver = true;
      }
    } else {
      const allFound = this.word.split("").every((c) => c === " " || this.guessedLetters.includes(c));
      if (allFound) {
        this.isWon = true;
        this.isGameOver = true;
      }
    }
    return { correct: isMatch, isWon: this.isWon, isGameOver: this.isGameOver };
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
    const rowSizes = [7, 7, 6, 6];
    let offset = 0;
    for (const size of rowSizes) {
      const chunk = letters.slice(offset, offset + size);
      offset += size;
      const components = chunk.map((letter) => {
        const isGuessed = this.guessedLetters.includes(letter);
        const inWord = isGuessed && this.word.includes(letter);
        const style = inWord ? "success" : isGuessed ? "danger" : "secondary";
        return {
          id: letter,
          label: letter,
          style,
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
var SnakeEngine = class {
  snake = [];
  food = { x: 0, y: 0 };
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
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center }
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
      const occupied = this.snake.some((part) => part.x === fx && part.y === fy);
      if (!occupied) {
        this.food = { x: fx, y: fy };
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
    const opposites = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT"
    };
    if (opposites[this.direction] === newDir) {
      newDir = this.direction;
    }
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
      case "RIGHT":
        head.x += 1;
        break;
    }
    if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
      this.isGameOver = true;
      return false;
    }
    const hitBody = this.snake.some((part, i) => {
      if (i === this.snake.length - 1 && !(head.x === this.food.x && head.y === this.food.y)) return false;
      return part.x === head.x && part.y === head.y;
    });
    if (hitBody) {
      this.isGameOver = true;
      return false;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 1;
      this.spawnFood();
    } else {
      this.snake.pop();
    }
    return true;
  }
  /**
   * Sets next direction without immediately advancing.
   */
  changeDirection(newDir) {
    const opposites = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT"
    };
    if (opposites[this.direction] !== newDir) {
      this.direction = newDir;
    }
  }
  /**
   * Advances snake by one frame/step. Ideal for timer loops.
   */
  step(dir) {
    const moved = this.move(dir || this.direction);
    return {
      isAlive: moved,
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
    return [
      {
        components: [
          { id: "blank_1", label: " ", style: "secondary", disabled: true },
          { id: "up", label: "Up", emoji: "\u2B06\uFE0F", style: "primary", disabled },
          { id: "blank_2", label: " ", style: "secondary", disabled: true },
          { id: "quit", label: "Quit", emoji: "\u{1F6D1}", style: "danger", disabled }
        ]
      },
      {
        components: [
          { id: "left", label: "Left", emoji: "\u2B05\uFE0F", style: "primary", disabled },
          { id: "down", label: "Down", emoji: "\u2B07\uFE0F", style: "primary", disabled },
          { id: "right", label: "Right", emoji: "\u27A1\uFE0F", style: "primary", disabled }
        ]
      }
    ];
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
var TicTacToeEngine = class {
  board = Array(9).fill(null);
  playerX;
  playerO;
  currentTurnId;
  winner = null;
  isDraw = false;
  isGameOver = false;
  constructor(options) {
    this.playerX = options?.playerX || { id: "X", username: "Player X" };
    this.playerO = options?.playerO || { id: "O", username: "Player O" };
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
    const res = this.place(index, actualPlayerId);
    return {
      success: res.success,
      winner: this.winner,
      isWon: !!this.winner,
      isDraw: this.isDraw,
      isGameOver: this.isGameOver
    };
  }
  place(index, playerId) {
    if (this.isGameOver || index < 0 || index > 8 || this.board[index] !== null) {
      return { success: false };
    }
    if (playerId !== this.currentTurnId) {
      return { success: false };
    }
    const symbol = playerId === this.playerX.id ? "X" : "O";
    this.board[index] = symbol;
    if (this.checkWin(symbol)) {
      this.winner = playerId;
      this.isGameOver = true;
      return { success: true, winner: playerId };
    }
    if (this.board.every((cell) => cell !== null)) {
      this.isDraw = true;
      this.isGameOver = true;
      return { success: true, isDraw: true };
    }
    this.currentTurnId = playerId === this.playerX.id ? this.playerO.id : this.playerX.id;
    return { success: true };
  }
  checkWin(symbol) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // cols
      [0, 4, 8],
      [2, 4, 6]
      // diagonals
    ];
    return lines.some(([a, b, c]) => this.board[a] === symbol && this.board[b] === symbol && this.board[c] === symbol);
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
          emoji: val === "X" ? "\u274C" : val === "O" ? "\u2B55" : void 0,
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
var WekyEngine = class _WekyEngine {
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
  // Aliases for concise instantiation
  static game2048 = _WekyEngine.create2048;
  static snake = _WekyEngine.createSnake;
  static fight = _WekyEngine.createFight;
  static hangman = _WekyEngine.createHangman;
  static calculator = _WekyEngine.createCalculator;
  static ticTacToe = _WekyEngine.createTicTacToe;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseGame,
  COMMON_WORDS,
  Calculator,
  CalculatorEngine,
  CanvasUtils,
  ChaosWords,
  ContextAdapter,
  EASY_SENTENCES,
  EventManager,
  FastType,
  Fight,
  FightEngine,
  Game2048,
  Game2048Engine,
  GuessTheNumber,
  GuessThePokemon,
  HANGMAN_CATEGORIES,
  HARD_SENTENCES,
  Hangman,
  HangmanEngine,
  LieSwatter,
  MEDIUM_SENTENCES,
  MathEvaluator,
  NEVER_HAVE_I_EVER_PROMPTS,
  NeverHaveIEver,
  POPULAR_POKEMONS,
  QuickClick,
  Render2048,
  RenderFight,
  RenderHangman,
  RenderPokemon,
  RenderSnake,
  RockPaperScissors,
  ShuffleGuess,
  Snake,
  SnakeEngine,
  TRIVIA_FACTS,
  TicTacToe,
  TicTacToeEngine,
  VERSION,
  WYPTB_DILEMMAS,
  WYR_DILEMMAS,
  WekyCanvas,
  WekyEngine,
  WekyManager,
  WillYouPressTheButton,
  WouldYouRather,
  boxConsole,
  checkPackageUpdates,
  clamp,
  compareSemver,
  fetchLatestVersion,
  fetchRandomPokemon,
  formatTime,
  getRandomHangmanWord,
  getRandomNHIE,
  getRandomSentence,
  getRandomString,
  getRandomTriviaFact,
  getRandomWYPTB,
  getRandomWYR,
  getRandomWord,
  getRandomWords,
  safeResolveColor,
  shuffleArray,
  shuffleString,
  stripAnsi,
  version
});
/**
 * Utility functions for update checking and terminal box notifications.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
/**
 * @m3rcena/weky
 * The ultimate modern Discord minigames engine.
 * Powered by @napi-rs/canvas, hybrid Slash/Message contexts, and zero external dependencies.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */
//# sourceMappingURL=index.cjs.map