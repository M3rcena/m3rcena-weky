import { ActionRowBuilder, AttachmentBuilder, ButtonInteraction, ChatInputCommandInteraction, Client, ContainerBuilder, EmbedBuilder, Guild, GuildMember, InteractionCallbackResponse, Message, MessageCreateOptions, MessageEditOptions, MessageFlags, TextBasedChannel, User } from "discord.js";
import { GameContextInput } from "./Types.js";

export type ComponentBuilderType = ActionRowBuilder<any> | ContainerBuilder | any;

export interface ContextSendOptions {
  content?: string;
  embeds?: EmbedBuilder[];
  components?: ComponentBuilderType[];
  files?: (AttachmentBuilder | Buffer | { attachment: Buffer | string; name?: string })[];
  flags?: MessageFlags | number;
}

export class ContextAdapter {
  public raw: GameContextInput;
  public user: User;
  public userId: string;
  public member: GuildMember | null;
  public guild: Guild | null;
  public channel: TextBasedChannel;
  public client: Client;
  public isInteraction: boolean;
  public isMessage: boolean;
  public gameMessage: Message | null = null;

  constructor(context: GameContextInput) {
    if (context instanceof ContextAdapter) {
      context = context.raw;
    }
    this.raw = context;

    if (context instanceof Message) {
      this.isMessage = true;
      this.isInteraction = false;
      this.user = context.author;
      this.userId = context.author.id;
      this.member = context.member ?? null;
      this.guild = context.guild ?? null;
      this.channel = context.channel as TextBasedChannel;
      this.client = context.client;
    } else if (typeof (context as any)?.reply === "function") {
      // Interaction (ChatInputCommand, Button, SelectMenu, etc.)
      this.isInteraction = true;
      this.isMessage = false;
      this.user = context.user || (context as any).author;
      this.userId = this.user?.id || context.member?.id;
      this.member = (context.member as GuildMember) ?? null;
      this.guild = context.guild ?? null;
      this.channel = context.channel as TextBasedChannel;
      this.client = context.client;
    } else {
      // Custom / Headless / Dashboard Context or Channel-based context
      this.isInteraction = false;
      this.isMessage = true;
      this.user = context.user || (context as any).author;
      this.userId = this.user?.id || (context.member as any)?.id;
      this.member = ((context.member as GuildMember) ?? null);
      this.guild = context.guild ?? null;
      this.channel = (context.channel || (typeof (context as any).send === "function" ? context : null)) as TextBasedChannel;
      this.client = context.client;
    }

    if (!this.user || !this.channel) {
      throw new Error("[ContextAdapter] Invalid Discord context: unable to resolve user or channel.");
    }
  }

  public static from(context: GameContextInput): ContextAdapter {
    return new ContextAdapter(context);
  }

  /**
   * Resolves appropriate message flags, ensuring MessageFlags.IsComponentsV2
   * is automatically attached whenever ContainerBuilder is present.
   */
  private resolveFlags(options: ContextSendOptions): number | undefined {
    let flags = typeof options.flags === "number" ? options.flags : 0;
    const hasContainer = options.components?.some((c: any) => c instanceof ContainerBuilder || typeof c?.setAccentColor === "function" || c?.data?.type === 17);
    if (hasContainer) {
      flags |= MessageFlags.IsComponentsV2;
    }
    return flags > 0 ? flags : undefined;
  }

  /**
   * Sends the initial game interface message.
   * Handles interaction replies (using withResponse: true), deferred states, and message channels transparently.
   */
  public async sendInitial(options: ContextSendOptions): Promise<Message> {
    if (typeof (this.raw as any)?.sendInitial === "function") {
      const msg = await (this.raw as any).sendInitial(options);
      this.gameMessage = msg;
      return msg;
    }

    const resolvedFlags = this.resolveFlags(options);
    const isV2 = !!((resolvedFlags ?? 0) & MessageFlags.IsComponentsV2);

    if (this.isInteraction) {
      const interaction = this.raw as ChatInputCommandInteraction | ButtonInteraction;

      if (interaction.deferred || interaction.replied) {
        const payload: any = {
          components: options.components,
          files: options.files as any,
          flags: resolvedFlags,
        };
        if (!isV2) {
          if (options.content !== undefined) payload.content = options.content;
          if (options.embeds !== undefined) payload.embeds = options.embeds;
        }
        const msg = await interaction.editReply(payload);
        if (msg instanceof Message) {
          this.gameMessage = msg;
        } else if (typeof (interaction as any).fetchReply === "function") {
          this.gameMessage = await (interaction as any).fetchReply().catch(() => null);
        } else {
          this.gameMessage = msg || null;
        }
      } else {
        const payload: any = {
          components: options.components,
          files: options.files as any,
          flags: resolvedFlags,
          withResponse: true,
        };
        if (!isV2) {
          if (options.content !== undefined) payload.content = options.content;
          if (options.embeds !== undefined) payload.embeds = options.embeds;
        }
        const response: any = await interaction.reply(payload);

        if (response && typeof response === "object" && "resource" in response && response.resource?.message) {
          this.gameMessage = response.resource.message;
        } else if (response instanceof Message || (response && typeof response === "object" && "id" in response)) {
          this.gameMessage = response;
        } else if (typeof (interaction as any).fetchReply === "function") {
          this.gameMessage = await (interaction as any).fetchReply().catch(() => null);
        } else {
          this.gameMessage = response || null;
        }
      }
    } else {
      const channel = this.channel as any;
      if (typeof channel.send !== "function") {
        throw new Error("[ContextAdapter] The provided channel is not sendable.");
      }
      const payload: any = {
        components: options.components,
        files: options.files,
        flags: resolvedFlags,
        allowedMentions: { repliedUser: false },
      };
      if (!isV2) {
        if (options.content !== undefined) payload.content = options.content;
        if (options.embeds !== undefined) payload.embeds = options.embeds;
      }
      const msg = await channel.send(payload as MessageCreateOptions);
      this.gameMessage = msg;
    }

    return this.gameMessage!;
  }

  /**
   * Updates the game message safely with Components V2 support.
   */
  public async edit(options: ContextSendOptions): Promise<void> {
    if (typeof (this.raw as any)?.edit === "function") {
      await (this.raw as any).edit(options);
      return;
    }

    if (!this.gameMessage) {
      await this.sendInitial(options);
      return;
    }
    const resolvedFlags = this.resolveFlags(options);
    const isV2 = !!((resolvedFlags ?? 0) & MessageFlags.IsComponentsV2);

    const payload: any = {
      components: options.components ?? [],
      files: (options.files as any) ?? [],
      flags: resolvedFlags,
    };
    if (!isV2) {
      payload.content = options.content ?? null;
      payload.embeds = options.embeds ?? [];
    }

    try {
      await this.gameMessage.edit(payload as MessageEditOptions);
    } catch (err: any) {
      // Gracefully ignore 10008 (Unknown Message) or 50027 if deleted
      if (err.code !== 10008 && err.code !== 50027) {
        // Ignored
      }
    }
  }

  /**
   * Sends an ephemeral reply to an interaction if a non-player attempts to interact.
   * Uses modern flags: MessageFlags.Ephemeral instead of deprecated ephemeral: true.
   */
  public static async replyEphemeral(interaction: any, content: string): Promise<void> {
    try {
      if (!interaction || typeof interaction.isRepliable !== "function" || !interaction.isRepliable()) return;
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content, flags: MessageFlags.Ephemeral });
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Safely deletes the game message.
   */
  public async delete(): Promise<void> {
    if (this.gameMessage && this.gameMessage.deletable) {
      try {
        await this.gameMessage.delete();
      } catch {
        // Ignored
      }
    }
  }
}
