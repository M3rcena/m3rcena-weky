import { ColorResolvable, ContainerBuilder, EmbedBuilder, Interaction, MediaGalleryBuilder, Message } from "discord.js";
import { safeResolveColor } from "../utils/Helpers.js";
import { ContextAdapter } from "./ContextAdapter.js";
import { BaseGameOptions, IMinigame } from "./Types.js";

export abstract class BaseGame<T extends BaseGameOptions> implements IMinigame {
  public id: string;
  public gameKey: string;
  public ctx: ContextAdapter;
  public options: T;
  public manager: any;
  public isActive: boolean = false;
  public defaultColor: number;
  protected startTime: number = 0;
  protected timeoutTimer: NodeJS.Timeout | null = null;
  protected defaultTimeout: number = 60_000;

  constructor(manager: any, options: T, gameKey: string) {
    this.manager = manager;
    this.options = options;
    this.gameKey = gameKey;
    this.ctx = ContextAdapter.from(options.context);
    this.id = `${this.ctx.userId}_${gameKey}`;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 60_000;
    this.defaultColor = this.resolveColor(options.embed?.color);
  }

  public abstract start(): Promise<any>;

  /**
   * Safely resolves a color according to the hierarchy:
   * 1. Explicit override color passed
   * 2. options.embed.color
   * 3. manager.embedColor
   * 4. fallback color
   */
  public resolveColor(color?: ColorResolvable | string | number | null, fallback: number = 0x5865f2): number {
    if (color) return safeResolveColor(color, fallback);
    if (this.options.embed?.color) return safeResolveColor(this.options.embed.color, fallback);
    if (this.manager?.embedColor) return safeResolveColor(this.manager.embedColor, fallback);
    return fallback;
  }

  /**
   * Resets the inactivity timeout.
   */
  protected resetTimeout(callback?: () => void, customMs?: number): void {
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
  protected clearTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * Default timeout handler. Can be overridden by subclasses.
   */
  protected onTimeout(): void {
    this.destroy();
  }

  /**
   * Helper to construct a Components V2 ContainerBuilder with accent color.
   * If the user provided an embed.color, it is strictly prioritized across all states.
   */
  public createContainer(stateAccentColor?: number): ContainerBuilder {
    const container = new ContainerBuilder();
    const color = this.options.embed?.color
      ? safeResolveColor(this.options.embed.color, this.defaultColor)
      : stateAccentColor !== undefined
        ? stateAccentColor
        : this.defaultColor;
    container.setAccentColor(color);
    return container;
  }

  /**
   * Helper to construct a Components V2 MediaGalleryBuilder for attachments.
   */
  protected createMediaGallery(attachmentUrlOrName: string): MediaGalleryBuilder {
    const url = attachmentUrlOrName.startsWith("attachment://") ? attachmentUrlOrName : `attachment://${attachmentUrlOrName}`;
    return new MediaGalleryBuilder().addItems((item) => item.setURL(url));
  }

  /**
   * Applies custom embed properties (author, description, fields, footer, timestamp)
   * to markdown text displayed inside a Components V2 Container.
   */
  public applyEmbedDecorations(container: ContainerBuilder, content: string): string {
    let finalContent = content;

    // Prepend author if provided
    if (this.options.embed?.author?.name) {
      const authorText = this.options.embed.author.url ? `[${this.options.embed.author.name}](${this.options.embed.author.url})` : `**${this.options.embed.author.name}**`;
      finalContent = `${authorText}\n\n${finalContent}`;
    }

    // Append description if provided and not already included in text
    if (this.options.embed?.description && !finalContent.includes(this.options.embed.description)) {
      finalContent = `${finalContent}\n\n${this.options.embed.description}`;
    }

    // Append custom fields if provided
    if (this.options.embed?.fields && this.options.embed.fields.length > 0) {
      const fieldsText = this.options.embed.fields.map((f) => `**${f.name}**\n${f.value}`).join("\n\n");
      finalContent = `${finalContent}\n\n${fieldsText}`;
    }

    // Append footer & timestamp if provided
    const footerParts: string[] = [];
    if (this.options.embed?.footer?.text) {
      footerParts.push(this.options.embed.footer.text);
    }
    if (this.options.embed?.timestamp) {
      const date = this.options.embed.timestamp === true ? new Date() : new Date(this.options.embed.timestamp);
      footerParts.push(`<t:${Math.floor(date.getTime() / 1000)}:R>`);
    }
    if (footerParts.length > 0) {
      finalContent = `${finalContent}\n\n- - -\n${footerParts.join(" • ")}`;
    }

    // Add thumbnail as media gallery item if provided and container has none
    if (this.options.embed?.thumbnail && !container.data.components?.some((c: any) => c.type === 18)) {
      container.addMediaGalleryComponents(this.createMediaGallery(this.options.embed.thumbnail));
    }

    return finalContent;
  }

  /**
   * Emits the gameStart lifecycle event on WekyManager and registers session with the bridge.
   */
  protected emitStart(): void {
    this.startTime = Date.now();
    if (this.manager) {
      if (typeof this.manager.emit === "function") {
        this.manager.emit("gameStart", {
          game: this.gameKey,
          user: this.ctx.user,
          channelId: this.ctx.channel?.id,
          timestamp: this.startTime,
        });
      }
      if (this.manager.bridge && typeof this.manager.bridge.registerSession === "function") {
        this.manager.bridge.registerSession({
          id: this.id,
          game: this.gameKey,
          platform: "discord",
          players: [
            {
              id: this.ctx.userId,
              username: this.ctx.user?.username || "Player",
              avatarUrl: this.ctx.user?.displayAvatarURL ? this.ctx.user.displayAvatarURL({ extension: "png" }) : undefined,
              platform: "discord",
            },
          ],
          state: { active: true, startTime: this.startTime },
          createdAt: this.startTime,
          lastUpdated: Date.now(),
          isGameOver: false,
        });
      }
    }
  }

  /**
   * Emits the gameOver lifecycle event on WekyManager and updates the bridge session.
   */
  protected emitEnd(outcome: string, score: number = 0): void {
    const timeElapsed = this.startTime > 0 ? Date.now() - this.startTime : 0;
    if (this.manager) {
      if (typeof this.manager.emit === "function") {
        this.manager.emit("gameOver", {
          game: this.gameKey,
          user: this.ctx.user,
          outcome,
          score,
          timeElapsed,
          timestamp: Date.now(),
        });
      }
      if (this.manager.bridge && typeof this.manager.bridge.endSession === "function") {
        this.manager.bridge.endSession(this.id, { reason: outcome });
      }
    }
  }

  /**
   * Emits the gameError lifecycle event on WekyManager.
   */
  protected emitError(error: any): void {
    if (this.manager && typeof this.manager.emit === "function") {
      this.manager.emit("gameError", {
        game: this.gameKey,
        error,
        context: this.ctx,
      });
    }
  }

  /**
   * Standardized Embed builder for backwards compatibility.
   */
  protected createEmbed(description?: string, titleOverride?: string): EmbedBuilder {
    const embed = new EmbedBuilder();
    const opts = this.options.embed;

    if (titleOverride || opts?.title) {
      embed.setTitle(titleOverride || opts!.title!);
    }
    if (description || opts?.description) {
      embed.setDescription(description || opts!.description!);
    }
    embed.setColor(this.resolveColor(opts?.color));

    if (opts?.footer) {
      embed.setFooter(opts.footer);
    }
    if (opts?.timestamp) {
      embed.setTimestamp(opts.timestamp === true ? new Date() : new Date(opts.timestamp));
    }
    if (opts?.author) {
      embed.setAuthor({
        name: opts.author.name,
        iconURL: opts.author.icon_url,
        url: opts.author.url,
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
  protected isAuthorized(interaction: Interaction, allowedUserIds?: string[]): boolean {
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
          interaction,
        });
      }

      return false;
    }
    return true;
  }

  /**
   * Terminates and cleans up the minigame instance.
   */
  public destroy(): void {
    this.isActive = false;
    this.clearTimer();
    if (this.manager) {
      if (this.manager._eventManager) {
        this.manager._eventManager.unregister(this.id);
      }
      if (this.manager.bridge && typeof this.manager.bridge.unregisterSession === "function") {
        this.manager.bridge.unregisterSession(this.id);
      }
    }
  }

  public onInteraction?(interaction: Interaction): Promise<void> | void;
  public onMessage?(message: Message): Promise<void> | void;
  public onTypingStart?(typing: any): Promise<void> | void;
}
