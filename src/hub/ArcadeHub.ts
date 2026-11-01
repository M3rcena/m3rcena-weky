/**
 * Arcade Hub Interface
 * A centralized, categorized launcher for all 17 Weky minigames.
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
} from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { ContextAdapter } from "../core/ContextAdapter.js";
import { BaseGameOptions } from "../core/Types.js";
import { getRandomString } from "../utils/Helpers.js";

export interface ArcadeHubCustomTexts {
  /** Custom description text */
  description?: string;
  /** Select menu placeholder (default: "🎮 Select a Minigame to Launch...") */
  selectPlaceholder?: string;
  /** Label for random game button (default: "🎲 Random Game") */
  randomButton?: string;
  /** Label for close button (default: "Close Cabinet") */
  closeButton?: string;
  /** Notice shown when closed by user */
  closedNotice?: string;
  /** Notice shown when expired due to inactivity */
  expiredNotice?: string;
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
  private selectedCategory: string = "All";

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
      } else if (action === "close") {
        await this.endHub("closed");
      }
    }
  }

  private async launchGame(gameKey: string): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    if (typeof this.options.onSelect === "function") {
      await this.options.onSelect(gameKey, this.ctx);
      return;
    }

    // Default launcher via WekyManager
    if (typeof this.manager.launchGameByKey === "function") {
      await this.manager.launchGameByKey(gameKey, this.ctx);
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
      `*Select a game or hit **Random Game** to let fate decide!*`);

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
}
