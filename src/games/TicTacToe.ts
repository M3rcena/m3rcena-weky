import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, GuildMember, Interaction, MessageFlags, User } from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { ContextAdapter } from "../core/ContextAdapter.js";
import { TicTacToeTypes } from "../core/Types.js";
import { getRandomString, safeResolveColor } from "../utils/Helpers.js";

type Cell = "X" | "O" | null;

export class TicTacToe extends BaseGame<TicTacToeTypes> {
  private opponentUser: User;
  private board: Cell[] = Array(9).fill(null);
  private currentTurnId: string;
  private btnPrefix: string;
  private gameTitle: string;
  private defaultColor: number;

  constructor(manager: any, options: TicTacToeTypes) {
    super(manager, options, "tictactoe");
    this.btnPrefix = getRandomString(6, "ttt_");
    this.opponentUser = options.opponent instanceof GuildMember ? options.opponent.user : (options.opponent as User);
    this.gameTitle = options.embed?.title || "Tic Tac Toe";
    this.defaultColor = safeResolveColor(options.embed?.color, 0x5865f2);
    this.currentTurnId = this.ctx.userId;
    this.defaultTimeout = options.time || 60_000;
  }

  public async start(): Promise<void> {
    if (this.opponentUser.id === this.ctx.userId) {
      const container = new ContainerBuilder().setAccentColor(0xff0000).addTextDisplayComponents((t) => t.setContent("## ❌ Error\n> You cannot play Tic Tac Toe against yourself!"));
      await this.ctx.sendInitial({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

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

    await interaction.deferUpdate().catch(() => {});
    this.resetTimeout(() => this.endGame("timeout"));

    const symbol: Cell = userId === this.ctx.userId ? "X" : "O";
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
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private checkWinner(): Cell {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    return null;
  }

  private async endGame(state: "won" | "tie" | "timeout", winningSymbol?: Cell): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const container = this.createGameContainer(state, winningSymbol);

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "active" | "won" | "tie" | "timeout", winningSymbol?: Cell): ContainerBuilder {
    const container = new ContainerBuilder();
    let content = "";

    switch (state) {
      case "active":
        container.setAccentColor(this.defaultColor);
        content = `## ${this.gameTitle}\n` + `> ⚔️ <@${this.ctx.userId}> (❌) vs <@${this.opponentUser.id}> (⭕)!\n\n` + `> 🎯 **Current Turn:** <@${this.currentTurnId}>`;
        break;

      case "won":
        container.setAccentColor(0x57f287);
        const winnerId = winningSymbol === "X" ? this.ctx.userId : this.opponentUser.id;
        content = `## ${this.gameTitle} - Results\n` + `> 🏆 **GG! <@${winnerId}> (${winningSymbol}) WON the match!**`;
        break;

      case "tie":
        container.setAccentColor(0xfee75c);
        content = `## ${this.gameTitle} - Results\n` + `> 🤝 **It's a TIE!** Neither player could achieve three in a row.`;
        break;

      case "timeout":
        container.setAccentColor(0xed4245);
        content = `## ${this.gameTitle}\n` + `> ⏱️ Game session expired due to inactivity.`;
        break;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));

    const isFinished = state !== "active";

    for (let row = 0; row < 3; row++) {
      const actionRow = new ActionRowBuilder<ButtonBuilder>();
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        const cell = this.board[index];

        let label = "\u200b";
        let style = ButtonStyle.Secondary;

        if (cell === "X") {
          label = "❌";
          style = ButtonStyle.Danger;
        } else if (cell === "O") {
          label = "⭕";
          style = ButtonStyle.Primary;
        }

        const btn = new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}${index}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(isFinished || cell !== null);

        actionRow.addComponents(btn);
      }
      container.addActionRowComponents(actionRow);
    }

    return container;
  }
}
