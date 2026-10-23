import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { NeverHaveIEverTypes } from "../core/Types.js";
import { getRandomNHIE } from "../data/trivia.js";
import { getRandomString } from "../utils/Helpers.js";

export class NeverHaveIEver extends BaseGame<NeverHaveIEverTypes> {
  private statement: string = "";
  private haveVoters: Set<string> = new Set();
  private neverVoters: Set<string> = new Set();
  private btnPrefix: string;
  private gameTitle: string;

  constructor(manager: any, options: NeverHaveIEverTypes) {
    super(manager, options, "nhie");
    this.btnPrefix = getRandomString(6, "nhie_");
    this.gameTitle = options.embed?.title || "Never Have I Ever";
    this.defaultColor = this.resolveColor(options.embed?.color);
    this.statement = options.statement || getRandomNHIE();
    this.defaultTimeout = options.time || manager?.defaultTimeout || 90_000;
  }

  public async start(): Promise<void> {
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    const container = this.createGameContainer(false);

    await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame());
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
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
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private async endGame(): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();
    this.emitEnd("ended", this.haveVoters.size + this.neverVoters.size);

    const container = this.createGameContainer(true);

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(isFinal: boolean): ContainerBuilder {
    const container = this.createContainer(isFinal ? 0x57f287 : this.defaultColor);

    const total = this.haveVoters.size + this.neverVoters.size;
    const havePct = total > 0 ? Math.round((this.haveVoters.size / total) * 100) : 0;
    const neverPct = total > 0 ? Math.round((this.neverVoters.size / total) * 100) : 0;

    let content = `## ${this.gameTitle}\n> "${this.statement}"\n\n`;

    if (total > 0) {
      content += `**Live Tally (${total} response${total === 1 ? "" : "s"}):**\n`;
      content += `🙋 **I Have:** \`${this.haveVoters.size}\` (${havePct}%)\n`;
      content += `🙅 **Never:** \`${this.neverVoters.size}\` (${neverPct}%)\n`;

      if (isFinal) {
        if (this.haveVoters.size > 0) {
          const names = Array.from(this.haveVoters)
            .map((id) => `<@${id}>`)
            .join(", ");
          content += `\n**Have Done It:** ${names}`;
        }
        if (this.neverVoters.size > 0) {
          const names = Array.from(this.neverVoters)
            .map((id) => `<@${id}>`)
            .join(", ");
          content += `\n**Never Done It:** ${names}`;
        }
      }
    } else {
      content += `> Click a button below to cast your confession!`;
    }

    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    if (!isFinal) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}have`)
          .setLabel(this.options.buttons?.optionA || "I Have")
          .setEmoji("🙋")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}never`)
          .setLabel(this.options.buttons?.optionB || "Never")
          .setEmoji("🙅")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`${this.btnPrefix}end`).setLabel("Finish").setEmoji("🏁").setStyle(ButtonStyle.Secondary),
      );
      container.addActionRowComponents(row);
    }

    return container;
  }
}
