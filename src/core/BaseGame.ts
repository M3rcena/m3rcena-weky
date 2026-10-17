import { ContainerBuilder, EmbedBuilder, Interaction, MediaGalleryBuilder, Message } from "discord.js";
import { safeResolveColor } from "../utils/Helpers.js";
import { ContextAdapter } from "./ContextAdapter.js";
import { BaseGameOptions, IMinigame } from "./Types.js";

export abstract class BaseGame<T extends BaseGameOptions> implements IMinigame {
  public id: string;
  public ctx: ContextAdapter;
  public options: T;
  public manager: any;
  public isActive: boolean = false;
  protected timeoutTimer: NodeJS.Timeout | null = null;
  protected defaultTimeout: number = 60_000;

  constructor(manager: any, options: T, gameKey: string) {
    this.manager = manager;
    this.options = options;
    this.ctx = ContextAdapter.from(options.context);
    this.id = `${this.ctx.userId}_${gameKey}`;
    this.defaultTimeout = options.time || 60_000;
  }

  public abstract start(): Promise<any>;

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
   */
  protected createContainer(accentColor?: number): ContainerBuilder {
    const container = new ContainerBuilder();
    const color = accentColor !== undefined ? accentColor : safeResolveColor(this.options.embed?.color, 0x5865f2);
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
   * Standardized Embed builder for backwards compatibility.
   */
  protected createEmbed(description?: string, titleOverride?: string): EmbedBuilder {
    const embed = new EmbedBuilder();
    const opts = this.options.embed;

    if (titleOverride || opts?.title) {
      embed.setTitle(titleOverride || opts!.title!);
    }
    if (description) {
      embed.setDescription(description);
    }
    embed.setColor(safeResolveColor(opts?.color, 0x5865f2));

    if (opts?.footer) {
      embed.setFooter(opts.footer);
    }
    if (opts?.timestamp) {
      embed.setTimestamp(opts.timestamp === true ? new Date() : opts.timestamp);
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
      const template = this.options.othersMessage || "Only <@{{author}}> can use these buttons!";
      const reply = template.replace(/\{\{author\}\}/g, this.ctx.userId);
      ContextAdapter.replyEphemeral(interaction, reply);
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
    if (this.manager && this.manager._eventManager) {
      this.manager._eventManager.unregister(this.id);
    }
  }

  public onInteraction?(interaction: Interaction): Promise<void> | void;
  public onMessage?(message: Message): Promise<void> | void;
  public onTypingStart?(typing: any): Promise<void> | void;
}
