import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, MessageFlags } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { WillYouPressTheButtonTypes } from "../core/Types.js";
import { getRandomWYPTB, WYPTBDilemma } from "../data/dilemmas.js";
import { getRandomString } from "../utils/Helpers.js";

export class WillYouPressTheButton extends BaseGame<WillYouPressTheButtonTypes> {
  private dilemma: WYPTBDilemma;
  private btnPrefix: string;
  private gameTitle: string;
  private labelYes: string;
  private labelNo: string;

  constructor(manager: any, options: WillYouPressTheButtonTypes) {
    super(manager, options, "wyptb");
    this.btnPrefix = getRandomString(6, "wyptb_");
    this.gameTitle = options.embed?.title || "Will You Press The Button?";
    this.defaultColor = this.resolveColor(options.embed?.color, 0x5865f2);
    this.labelYes = options.button?.yes || options.buttons?.yes || "Yes! Press it!";
    this.labelNo = options.button?.no || options.buttons?.no || "No! Don't press!";

    if (options.perk && options.consequence) {
      this.dilemma = {
        question: options.perk,
        consequence: options.consequence,
        stats: { yes: "50%", no: "50%" },
      };
    } else {
      this.dilemma = getRandomWYPTB();
    }

    this.defaultTimeout = options.time || 60_000;
  }

  public async start(): Promise<void> {
    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    const container = this.createGameContainer("active");

    await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame());
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;
    if (!this.isAuthorized(interaction)) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    await interaction.deferUpdate().catch(() => {});
    const pressed = customId.replace(this.btnPrefix, "") === "yes";

    await this.endGame(pressed);
  }

  private async endGame(pressed?: boolean): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const outcome = pressed === undefined ? "timeout" : pressed ? "pressed" : "passed";
    this.emitEnd(outcome);

    const state = pressed !== undefined ? "result" : "timeout";
    const container = this.createGameContainer(state, pressed);

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "result" | "timeout", pressed?: boolean): ContainerBuilder {
    let stateColor = this.defaultColor;
    if (state === "result") {
      stateColor = pressed ? 0x57f287 : 0xed4245;
    } else if (state === "timeout") {
      stateColor = 0xed4245;
    }

    const container = this.createContainer(stateColor);
    let content = "";

    switch (state) {
      case "active":
        content = `## ${this.gameTitle}\n` + `> ${this.dilemma.question}\n\n` + `**BUT**\n\n` + `> ${this.dilemma.consequence}`;
        break;

      case "result":
        const decisionText = pressed ? this.options.yesPress || "Yes! Press it!" : this.options.noPress || "No! Don't press!";
        content = `## ${this.gameTitle}\n` + `> ${this.dilemma.question}\n\n` + `**BUT**\n\n` + `> ${this.dilemma.consequence}\n\n` + `**You chose:** \`${decisionText}\`\n\n` + `📊 **Community Consensus:**\n` + `🔘 **Pressed:** \`${this.dilemma.stats.yes}\`\n` + `🚫 **Didn't Press:** \`${this.dilemma.stats.no}\``;
        break;

      case "timeout":
        content = `## ${this.gameTitle}\n` + `> ⏱️ Time's up! You took too long to decide.\n\n` + `📊 **Community Consensus:**\n` + `🔘 **Pressed:** \`${this.dilemma.stats.yes}\`\n` + `🚫 **Didn't Press:** \`${this.dilemma.stats.no}\``;
        break;
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

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnYes, btnNo);
    container.addActionRowComponents(row);

    return container;
  }
}
