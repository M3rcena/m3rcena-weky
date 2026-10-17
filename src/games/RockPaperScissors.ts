import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, GuildMember, Interaction, MessageFlags, User } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { ContextAdapter } from "../core/ContextAdapter.js";
import { RPSTypes } from "../core/Types.js";
import { getRandomString, safeResolveColor } from "../utils/Helpers.js";

type RPSMove = "rock" | "paper" | "scissors";

export class RockPaperScissors extends BaseGame<RPSTypes> {
  private opponentUser: User | null = null;
  private isVsBot: boolean = true;
  private p1Move: RPSMove | null = null;
  private p2Move: RPSMove | null = null;
  private btnPrefix: string;
  private gameTitle: string;
  private defaultColor: number;

  constructor(manager: any, options: RPSTypes) {
    super(manager, options, "rps");
    this.btnPrefix = getRandomString(6, "rps_");
    this.gameTitle = options.embed?.title || "Rock Paper Scissors";
    this.defaultColor = safeResolveColor(options.embed?.color, 0x5865f2);

    if (options.opponent) {
      this.opponentUser = options.opponent instanceof GuildMember ? options.opponent.user : (options.opponent as User);
      this.isVsBot = this.opponentUser.bot || this.opponentUser.id === this.ctx.client.user?.id;
    }

    this.defaultTimeout = options.time || 60_000;
  }

  public async start(): Promise<void> {
    this.isActive = true;
    this.manager._eventManager.register(this);

    const container = this.createGameContainer("active");

    await this.ctx.sendInitial({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame("timeout"));
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    const move = customId.replace(this.btnPrefix, "") as RPSMove;
    const userId = interaction.user.id;

    if (this.isVsBot || !this.opponentUser) {
      if (userId !== this.ctx.userId) {
        this.isAuthorized(interaction);
        return;
      }

      await interaction.deferUpdate().catch(() => {});
      this.p1Move = move;
      const botMoves: RPSMove[] = ["rock", "paper", "scissors"];
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

      if (this.p1Move && this.p2Move) {
        await this.endGame("result");
      } else {
        const waitingFor = !this.p1Move ? `<@${this.ctx.userId}>` : `<@${this.opponentUser.id}>`;
        const container = this.createGameContainer("waiting", { waitingFor });
        await this.ctx.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    }
  }

  private async endGame(state: "result" | "timeout"): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const container = this.createGameContainer(state);

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "waiting" | "result" | "timeout", details?: { waitingFor?: string }): ContainerBuilder {
    const container = new ContainerBuilder();
    let content = "";

    const emojis: Record<RPSMove, string> = {
      rock: "🪨 Rock",
      paper: "📄 Paper",
      scissors: "✂️ Scissors",
    };

    switch (state) {
      case "active":
        container.setAccentColor(this.defaultColor);
        if (this.isVsBot || !this.opponentUser) {
          content = `## ${this.gameTitle}\n> You are playing against the **Bot**!\n> Select your move below:`;
        } else {
          content = `## ${this.gameTitle}\n> ⚔️ <@${this.ctx.userId}> vs <@${this.opponentUser.id}>!\n> Both players, choose your move in secret!`;
        }
        break;

      case "waiting":
        container.setAccentColor(0xfee75c);
        content = `## ${this.gameTitle}\n> One player locked in their move!\n> ⏳ Waiting for ${details?.waitingFor}...`;
        break;

      case "result":
        container.setAccentColor(0x57f287);
        const m1 = this.p1Move || "rock";
        const m2 = this.p2Move || "rock";
        let winnerText = "";

        if (m1 === m2) {
          winnerText = "🤝 **It's a TIE!**";
        } else if ((m1 === "rock" && m2 === "scissors") || (m1 === "paper" && m2 === "rock") || (m1 === "scissors" && m2 === "paper")) {
          winnerText = `🏆 **<@${this.ctx.userId}> WINS!**`;
        } else {
          const oppText = this.opponentUser ? `<@${this.opponentUser.id}>` : "🤖 The Bot";
          winnerText = `🏆 **${oppText} WINS!**`;
        }

        const p2Label = this.opponentUser ? `<@${this.opponentUser.id}>` : "🤖 Bot";
        content = `## ${this.gameTitle} - Results\n` + `> ${winnerText}\n\n` + `**Choices:**\n` + `<@${this.ctx.userId}>: ${emojis[m1]}\n` + `${p2Label}: ${emojis[m2]}`;
        break;

      case "timeout":
        container.setAccentColor(0xed4245);
        content = `## ${this.gameTitle}\n> ⏱️ Game session expired. Moves were not submitted in time.`;
        break;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));

    if (state === "active" || state === "waiting") {
      const rock = new ButtonBuilder()
        .setCustomId(`${this.btnPrefix}rock`)
        .setLabel(this.options.buttons?.rock || "Rock")
        .setEmoji("🪨")
        .setStyle(ButtonStyle.Primary);

      const paper = new ButtonBuilder()
        .setCustomId(`${this.btnPrefix}paper`)
        .setLabel(this.options.buttons?.paper || "Paper")
        .setEmoji("📄")
        .setStyle(ButtonStyle.Primary);

      const scissors = new ButtonBuilder()
        .setCustomId(`${this.btnPrefix}scissors`)
        .setLabel(this.options.buttons?.scissors || "Scissors")
        .setEmoji("✂️")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(rock, paper, scissors);
      container.addActionRowComponents(row);
    }

    return container;
  }
}
