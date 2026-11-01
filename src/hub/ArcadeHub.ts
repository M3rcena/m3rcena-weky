/**
 * Arcade Hub Interface
 * A centralized, categorized launcher for all 17 Weky minigames.
 * Supports deep game customization, custom text dictionaries, and an
 * optional interactive pre-launch setup screen for difficulty, bosses, and modes.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  Interaction,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
} from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { ContextAdapter } from "../core/ContextAdapter.js";
import { BaseGameOptions } from "../core/Types.js";
import { getRandomString } from "../utils/Helpers.js";

export interface ArcadeHubCustomTexts {
  /** Custom description text for main arcade screen */
  description?: string;
  /** Select menu placeholder (default: "🎮 Select a Minigame to Launch...") */
  selectPlaceholder?: string;
  /** Label for random game button (default: "🎲 Surprise Me (Random Game)") */
  randomButton?: string;
  /** Label for close button (default: "❌ Close Arcade") */
  closeButton?: string;
  /** Notice shown when closed by user */
  closedNotice?: string;
  /** Notice shown when expired due to inactivity */
  expiredNotice?: string;
  /** Setup screen title template (default: "🕹️ Match Setup: {game}") */
  setupTitle?: string;
  /** Setup screen description text */
  setupDescription?: string;
  /** Start button label on setup screen (default: "▶️ Launch Game") */
  startButton?: string;
  /** Back button label on setup screen (default: "◀️ Back to Cabinet") */
  backButton?: string;
}

export interface ArcadeHubOptions extends BaseGameOptions {
  /** Optional custom banner image URL */
  bannerUrl?: string;
  /** Custom title for the arcade launcher */
  title?: string;
  /** Games to exclude from the launcher */
  exclude?: string[];
  /** Custom callback when a game is selected */
  onSelect?: (gameKey: string, context: ContextAdapter) => Promise<void> | void;
  /**
   * Game-specific options and text customizations passed down to minigames
   * when launched from the Arcade Hub.
   *
   * Example:
   * ```typescript
   * gameOptions: {
   *   tictactoe: { difficulty: "unbeatable", texts: { playerTurn: "Your move!" } },
   *   fight: { boss: "dragon", startHealth: 200 },
   *   snake: { gridSize: 18 }
   * }
   * ```
   */
  gameOptions?: Record<string, any>;
  /**
   * When true, displays an interactive setup screen (difficulty, opponent, boss, mode)
   * with buttons before launching the selected game.
   */
  configureBeforeLaunch?: boolean;
  /** Optional custom text labels */
  texts?: ArcadeHubCustomTexts;
}

export interface ArcadeGameEntry {
  key: string;
  name: string;
  emoji: string;
  category: "Classic Arcade" | "PvP Duels" | "Brain & Puzzles" | "Party & Social";
  description: string;
}

export const ARCADE_GAMES: ArcadeGameEntry[] = [
  { key: "2048", name: "2048 Arcade", emoji: "🔢", category: "Classic Arcade", description: "Slide and merge numbered tiles on a canvas grid" },
  { key: "snake", name: "Retro Snake", emoji: "🐍", category: "Classic Arcade", description: "Classic arcade snake with D-pad canvas controls" },
  { key: "fight", name: "Fight RPG Duel / Boss", emoji: "⚔️", category: "PvP Duels", description: "Turn-based battle arena vs players or AI Bosses" },
  { key: "tictactoe", name: "Tic Tac Toe (PvP / AI)", emoji: "❌", category: "PvP Duels", description: "Turn-based 3x3 grid with Minimax AI difficulty" },
  { key: "rps", name: "Rock Paper Scissors", emoji: "✂️", category: "PvP Duels", description: "Classic hand game with psychological AI counter" },
  { key: "hangman", name: "Canvas Hangman", emoji: "🪓", category: "Brain & Puzzles", description: "Guess words with photorealistic wooden canvas gallows" },
  { key: "gtp", name: "Who's That Pokémon?", emoji: "⚡", category: "Brain & Puzzles", description: "Pokédex silhouette canvas quiz" },
  { key: "calculator", name: "Scientific Calculator", emoji: "📟", category: "Brain & Puzzles", description: "25-key keypad calculator with scientific mode" },
  { key: "fasttype", name: "Fast Type Challenge", emoji: "⌨️", category: "Brain & Puzzles", description: "WPM typing test with anti-paste cheat detection" },
  { key: "chaoswords", name: "Chaos Words", emoji: "🧩", category: "Brain & Puzzles", description: "Find scrambled words hidden in chaos text" },
  { key: "shuffleguess", name: "Shuffle Guess", emoji: "🔀", category: "Brain & Puzzles", description: "Unscramble anagrams with live reshuffle" },
  { key: "lieswatter", name: "Lie Swatter", emoji: "🧠", category: "Brain & Puzzles", description: "Rapid-fire fact or fiction trivia" },
  { key: "gtn", name: "Guess The Number", emoji: "🎯", category: "Party & Social", description: "High/low numeric range clues in solo or channel mode" },
  { key: "nhie", name: "Never Have I Ever", emoji: "👥", category: "Party & Social", description: "Group confession voting party with live percentages" },
  { key: "wyptb", name: "Will You Press The Button?", emoji: "🔘", category: "Party & Social", description: "Tempting perks coupled with hilarious consequences" },
  { key: "wyr", name: "Would You Rather?", emoji: "🅰️", category: "Party & Social", description: "Moral dilemma pitting Option A vs Option B" },
  { key: "quickclick", name: "Quick Click", emoji: "⏱️", category: "Party & Social", description: "Reaction speed measured down to milliseconds" },
];

export class ArcadeHub extends BaseGame<ArcadeHubOptions> {
  private btnPrefix: string;
  private selectMenuId: string;
  private state: "SELECT" | "CONFIG" = "SELECT";
  private pendingGameKey?: string;
  private pendingConfig: Record<string, any> = {};

  constructor(manager: any, options: ArcadeHubOptions) {
    super(manager, options, "arcade_hub");
    this.btnPrefix = getRandomString(6, "hub_");
    this.selectMenuId = `${this.btnPrefix}select`;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 120_000;
  }

  public async start(): Promise<void> {
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    const container = this.createHubContainer();

    await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endHub("timeout"));
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!this.isActive) return;
    if (!("message" in interaction) || !interaction.message || interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;

    if ("isUserSelectMenu" in interaction && typeof (interaction as any).isUserSelectMenu === "function" && interaction.isUserSelectMenu()) {
      if (interaction.customId === `${this.btnPrefix}cfg_user_select`) {
        await interaction.deferUpdate().catch(() => {});
        const selectedUser = interaction.users.first();
        if (selectedUser) {
          this.pendingConfig.opponent = selectedUser;
          this.pendingConfig.ai = false;
          this.pendingConfig.mode = "pvp";
        }
        const container = this.createConfigContainer();
        await this.ctx.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === this.selectMenuId) {
      await interaction.deferUpdate().catch(() => {});
      const selectedGameKey = interaction.values[0];

      if (this.options.configureBeforeLaunch) {
        this.openConfigScreen(selectedGameKey);
        const container = this.createConfigContainer();
        await this.ctx.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

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
        if (this.options.configureBeforeLaunch) {
          this.openConfigScreen(picked.key);
          const container = this.createConfigContainer();
          await this.ctx.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
          return;
        }
        await this.launchGame(picked.key);
      } else if (action === "close") {
        await this.endHub("closed");
      } else if (action === "cfg_start") {
        if (this.pendingGameKey) {
          await this.launchGame(this.pendingGameKey, this.pendingConfig);
        }
      } else if (action === "cfg_back") {
        this.state = "SELECT";
        this.pendingGameKey = undefined;
        this.pendingConfig = {};
        const container = this.createHubContainer();
        await this.ctx.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } else if (action.startsWith("cfg_mode_")) {
        const mode = action.replace("cfg_mode_", "");
        this.pendingConfig.mode = mode;
        if (mode === "pvp") {
          this.pendingConfig.ai = false;
        } else {
          this.pendingConfig.ai = true;
          delete this.pendingConfig.opponent;
        }
        const container = this.createConfigContainer();
        await this.ctx.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } else if (action.startsWith("cfg_")) {
        const parts = action.replace("cfg_", "").split("_");
        const param = parts[0];
        const val = parts.slice(1).join("_");
        if (param === "gridSize") {
          this.pendingConfig.gridSize = Number(val);
        } else if (param === "publicGame") {
          this.pendingConfig.publicGame = val === "true";
        } else {
          this.pendingConfig[param] = val;
        }
        const container = this.createConfigContainer();
        await this.ctx.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    }
  }

  private openConfigScreen(gameKey: string): void {
    this.state = "CONFIG";
    this.pendingGameKey = gameKey;
    const baseOpts = this.options.gameOptions?.[gameKey] || {};
    this.pendingConfig = { ...baseOpts };

    if (gameKey === "tictactoe" && !this.pendingConfig.difficulty) {
      this.pendingConfig.difficulty = "medium";
    } else if (gameKey === "fight" && !this.pendingConfig.boss) {
      this.pendingConfig.boss = "dragon";
    } else if (gameKey === "fasttype" && !this.pendingConfig.difficulty) {
      this.pendingConfig.difficulty = "medium";
    } else if (gameKey === "hangman" && !this.pendingConfig.category) {
      this.pendingConfig.category = "Animals";
    } else if (gameKey === "rps" && !this.pendingConfig.difficulty) {
      this.pendingConfig.difficulty = "hard";
    } else if (gameKey === "snake" && !this.pendingConfig.gridSize) {
      this.pendingConfig.gridSize = 15;
    }
  }

  private async launchGame(gameKey: string, overrides: Record<string, any> = {}): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const specificGameOpts = this.options.gameOptions?.[gameKey] || {};
    const finalOptions = {
      ...specificGameOpts,
      ...overrides,
    };

    if (typeof this.options.onSelect === "function") {
      await this.options.onSelect(gameKey, this.ctx);
      return;
    }

    // Default launcher via WekyManager
    if (typeof this.manager.launchGameByKey === "function") {
      await this.manager.launchGameByKey(gameKey, {
        context: this.ctx,
        ...finalOptions,
      });
    }
  }

  private async endHub(reason: "closed" | "timeout"): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd(reason);

    const container = this.createContainer(0xed4245);
    const content =
      reason === "closed"
        ? (this.options.texts?.closedNotice || `## 🕹️ Arcade Closed\n> The Arcade Cabinet session has been closed.`)
        : (this.options.texts?.expiredNotice || `## ⏱️ Arcade Expired\n> The Arcade Cabinet session expired due to inactivity.`);

    container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createHubContainer(): ContainerBuilder {
    const container = this.createContainer(this.defaultColor);
    const title = this.options.title || this.options.embed?.title || "🕹️ Weky Mini-Arcade Cabinet";

    const content =
      this.options.texts?.description ||
      (`## ${title}\n` +
      `> Welcome to the unified **Discord Minigames Hub**! Choose any of the 17 games from the menu below to launch immediately.\n\n` +
      `👾 **Classic Arcade:** 2048, Snake\n` +
      `⚔️ **PvP Duels & Bosses:** Fight RPG, Tic-Tac-Toe, Rock Paper Scissors\n` +
      `🧠 **Brain & Trivia:** Hangman, Guess The Pokémon, Fast Type, Chaos Words, Shuffle Guess, Lie Swatter, Calculator\n` +
      `👥 **Party & Social:** Never Have I Ever, Would You Rather, Will You Press The Button, Guess The Number, Quick Click\n\n` +
      `*Select a game or hit **Surprise Me** to let fate decide!*`);

    container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));

    // Select Menu with filtered games
    const availableGames = ARCADE_GAMES.filter((g) => !this.options.exclude?.includes(g.key));
    const selectPlaceholder = this.options.texts?.selectPlaceholder || "🎮 Select a Minigame to Launch...";
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(this.selectMenuId)
      .setPlaceholder(selectPlaceholder)
      .addOptions(
        availableGames.map((g) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${g.name} (${g.category})`)
            .setValue(g.key)
            .setDescription(g.description.slice(0, 100))
            .setEmoji(g.emoji)
        )
      );

    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    container.addActionRowComponents(selectRow);

    // Button Row: Random & Close
    const btnRandom = new ButtonBuilder()
      .setCustomId(`${this.btnPrefix}random`)
      .setLabel(this.options.texts?.randomButton || "🎲 Surprise Me (Random Game)")
      .setStyle(ButtonStyle.Primary);

    const btnClose = new ButtonBuilder()
      .setCustomId(`${this.btnPrefix}close`)
      .setLabel(this.options.texts?.closeButton || "❌ Close Arcade")
      .setStyle(ButtonStyle.Secondary);

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(btnRandom, btnClose);
    container.addActionRowComponents(btnRow);

    return container;
  }

  private createConfigContainer(): ContainerBuilder {
    const container = this.createContainer(this.defaultColor);
    const gameKey = this.pendingGameKey!;
    const gameInfo = ARCADE_GAMES.find((g) => g.key === gameKey) || {
      key: gameKey,
      name: gameKey.toUpperCase(),
      category: "Arcade",
      emoji: "🎮",
      description: "Launch this arcade minigame.",
    };

    const title =
      this.options.texts?.setupTitle?.replace("{game}", gameInfo.name) ||
      `🕹️ Match Setup: ${gameInfo.name} ${gameInfo.emoji}`;

    const isPvP = this.pendingConfig.mode === "pvp" || (!this.pendingConfig.ai && this.pendingConfig.opponent);

    const configDetails: string[] = [];
    if (["fight", "tictactoe", "rps"].includes(gameKey)) {
      if (isPvP) {
        configDetails.push(`**Mode:** \`⚔️ PvP Duel (${this.pendingConfig.opponent ? `@${this.pendingConfig.opponent.username}` : "Select Opponent Below"})\``);
      } else {
        configDetails.push(`**Mode:** \`🤖 Solo vs ${gameKey === "fight" ? "Boss" : "AI"}\``);
      }
    }
    if (!isPvP && this.pendingConfig.difficulty) configDetails.push(`**Difficulty:** \`${this.pendingConfig.difficulty}\``);
    if (!isPvP && this.pendingConfig.boss) configDetails.push(`**Target Boss:** \`${this.pendingConfig.boss.replace(/_/g, " ").toUpperCase()}\``);
    if (this.pendingConfig.category) configDetails.push(`**Category:** \`${this.pendingConfig.category}\``);
    if (this.pendingConfig.gridSize) configDetails.push(`**Grid Size:** \`${this.pendingConfig.gridSize}x${this.pendingConfig.gridSize}\``);
    if (this.pendingConfig.publicGame !== undefined) configDetails.push(`**Mode:** \`${this.pendingConfig.publicGame ? "Public / Channel" : "Solo"}\``);

    let content =
      `## ${title}\n` +
      `> **Discipline:** ${gameInfo.category} • ${gameInfo.description}\n\n`;

    if (configDetails.length > 0) {
      content += `### ⚙️ Current Settings:\n> ${configDetails.join(" • ")}\n\n`;
    }

    content +=
      this.options.texts?.setupDescription ||
      `*Configure your match settings below, then press **${this.options.texts?.startButton || "▶️ Launch Game"}**!*`;

    container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));

    // Mode Toggle for PvP games (Fight, TicTacToe, RPS)
    if (["fight", "tictactoe", "rps"].includes(gameKey)) {
      const modeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_mode_solo`)
          .setLabel(gameKey === "fight" ? "🐉 Solo vs Boss" : "🤖 Solo vs AI")
          .setStyle(!isPvP ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_mode_pvp`)
          .setLabel("⚔️ Duel a Friend (PvP)")
          .setStyle(isPvP ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      container.addActionRowComponents(modeRow);

      if (isPvP) {
        const userSelect = new UserSelectMenuBuilder()
          .setCustomId(`${this.btnPrefix}cfg_user_select`)
          .setPlaceholder(
            this.pendingConfig.opponent
              ? `Challenging @${this.pendingConfig.opponent.username} (Click to change)`
              : "👥 Select a friend / opponent to duel..."
          );
        const userRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);
        container.addActionRowComponents(userRow);
      }
    }

    // Specific interactive option rows for Solo mode
    if (!isPvP && gameKey === "tictactoe") {
      const currentDiff = this.pendingConfig.difficulty || "medium";
      const diffRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_easy`)
          .setLabel("🟢 Easy")
          .setStyle(currentDiff === "easy" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_medium`)
          .setLabel("🟡 Medium")
          .setStyle(currentDiff === "medium" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_hard`)
          .setLabel("🔴 Hard")
          .setStyle(currentDiff === "hard" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_unbeatable`)
          .setLabel("⚡ Minimax")
          .setStyle(currentDiff === "unbeatable" ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      container.addActionRowComponents(diffRow);
    } else if (!isPvP && gameKey === "fight") {
      const currentBoss = this.pendingConfig.boss || "dragon";
      const bossRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_boss_dragon`)
          .setLabel("🐉 Dragon Sovereign")
          .setStyle(currentBoss === "dragon" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_boss_cyber_knight`)
          .setLabel("⚔️ Cyber Knight")
          .setStyle(currentBoss === "cyber_knight" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_boss_shadow_goblin`)
          .setLabel("👺 Shadow Goblin")
          .setStyle(currentBoss === "shadow_goblin" ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      container.addActionRowComponents(bossRow);
    } else if (gameKey === "fasttype") {
      const currentDiff = this.pendingConfig.difficulty || "medium";
      const diffRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_easy`)
          .setLabel("🟢 Easy")
          .setStyle(currentDiff === "easy" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_medium`)
          .setLabel("🟡 Medium")
          .setStyle(currentDiff === "medium" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_hard`)
          .setLabel("🔴 Hard")
          .setStyle(currentDiff === "hard" ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      container.addActionRowComponents(diffRow);
    } else if (gameKey === "hangman") {
      const currentCat = this.pendingConfig.category || "Animals";
      const catRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_category_Animals`)
          .setLabel("🐾 Animals")
          .setStyle(currentCat === "Animals" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_category_Technology`)
          .setLabel("💻 Tech")
          .setStyle(currentCat === "Technology" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_category_Gaming`)
          .setLabel("🎮 Gaming")
          .setStyle(currentCat === "Gaming" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_category_Food`)
          .setLabel("🍕 Food")
          .setStyle(currentCat === "Food" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_category_Countries`)
          .setLabel("🌍 Countries")
          .setStyle(currentCat === "Countries" ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      container.addActionRowComponents(catRow);
    } else if (!isPvP && gameKey === "rps") {
      const currentDiff = this.pendingConfig.difficulty || "hard";
      const rpsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_easy`)
          .setLabel("🤖 Casual AI")
          .setStyle(currentDiff === "easy" ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_difficulty_hard`)
          .setLabel("🧠 Predictor AI")
          .setStyle(currentDiff === "hard" ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      container.addActionRowComponents(rpsRow);
    } else if (gameKey === "snake") {
      const currentGrid = this.pendingConfig.gridSize || 15;
      const snakeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_gridSize_15`)
          .setLabel("Classic (15x15)")
          .setStyle(currentGrid === 15 ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}cfg_gridSize_18`)
          .setLabel("Large Grid (18x18)")
          .setStyle(currentGrid === 18 ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
      container.addActionRowComponents(snakeRow);
    }

    // Launch & Back Buttons
    const startBtn = new ButtonBuilder()
      .setCustomId(`${this.btnPrefix}cfg_start`)
      .setLabel(this.options.texts?.startButton || "▶️ Launch Game")
      .setStyle(ButtonStyle.Primary);

    const backBtn = new ButtonBuilder()
      .setCustomId(`${this.btnPrefix}cfg_back`)
      .setLabel(this.options.texts?.backButton || "◀️ Back to Cabinet")
      .setStyle(ButtonStyle.Secondary);

    const ctrlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(startBtn, backBtn);
    container.addActionRowComponents(ctrlRow);

    return container;
  }
}
