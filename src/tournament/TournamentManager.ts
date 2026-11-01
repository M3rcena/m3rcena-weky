/**
 * Automated & Manual Tournament Manager
 * Manages player brackets, automated dual-ephemeral matches, manual winner progression,
 * detailed victory/defeat outcome tracking, live public Grand Finals, and visual bracket updates.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  GuildMember,
  Interaction,
  MessageFlags,
  User,
} from "discord.js";
import { BaseGame } from "../core/BaseGame.js";
import { BaseGameOptions } from "../core/Types.js";
import { ContextAdapter } from "../core/ContextAdapter.js";
import { getRandomString } from "../utils/Helpers.js";
import { BracketMatch, BracketParticipant, RenderBracket } from "./RenderBracket.js";

export interface TournamentCustomTexts {
  /** Label for the play match button (default: "⚔️ Play My Match") */
  playButton?: string;
  /** Label for the bracket refresh button (default: "🔄 Refresh Bracket") */
  refreshButton?: string;
  /** Label for the abort button (default: "Abort Tournament") */
  abortButton?: string;
  /** Label for manual advance button (default: "👑 Advance Match") */
  manualAdvanceButton?: string;
  /** Label for crowning champion button in finals (default: "👑 Advance / Crown Champion") */
  crownChampionButton?: string;
  /** Header title for active bracket (default: "🏆 {{title}} • Round {{round}}") */
  bracketHeader?: string;
  /** Header title for grand finals (default: "👑 {{title}} • Grand Finals") */
  finalsHeader?: string;
  /** Header title when champion is crowned (default: "🏆 TOURNAMENT CHAMPION CROWNED!") */
  championHeader?: string;
}

export interface TournamentOptions extends BaseGameOptions {
  /** Tournament discipline ("rps", "tictactoe", "fight", or custom game name) */
  game?: "rps" | "tictactoe" | "fight" | "custom" | string;
  /** Participant array (4 to 16 players) */
  players: (User | GuildMember)[];
  /** Tournament title */
  title?: string;
  /** When true, tournament progress is manually advanced by the organizer rather than game-specific */
  manual?: boolean;
  /** Optional custom text labels and headers */
  texts?: TournamentCustomTexts;
}

export interface TournamentMatchSession {
  match: BracketMatch;
  round: number;
  p1: BracketParticipant;
  p2: BracketParticipant;
  status: "waiting_opponent" | "in_progress" | "completed";
  p1Ready: boolean;
  p2Ready: boolean;
  p1Interaction?: any;
  p2Interaction?: any;
  readyTimeoutTimer?: NodeJS.Timeout;
  afkTimer?: NodeJS.Timeout;
  currentTurnId: string;
  winnerId?: string;
  outcomeDetail?: string;
  scoreText?: string;

  // TicTacToe specific
  tttBoard?: (string | null)[];

  // RPS specific
  rpsP1Choice?: "rock" | "paper" | "scissors";
  rpsP2Choice?: "rock" | "paper" | "scissors";
  rpsMessage?: string;

  // Fight specific
  fightP1Hp?: number;
  fightP2Hp?: number;
  fightP1Coins?: number;
  fightP2Coins?: number;
  fightP1Shield?: boolean;
  fightP2Shield?: boolean;
  fightCombatLog?: string;
}

export interface GrandFinalsSession {
  match: BracketMatch;
  p1: BracketParticipant;
  p2: BracketParticipant;
  currentTurnId: string;
  winnerId?: string;
  outcomeDetail?: string;
  scoreText?: string;
  afkTimer?: NodeJS.Timeout;

  // TicTacToe specific
  tttBoard?: (string | null)[];

  // RPS specific
  rpsP1Choice?: "rock" | "paper" | "scissors";
  rpsP2Choice?: "rock" | "paper" | "scissors";
  rpsMessage?: string;

  // Fight specific
  fightP1Hp?: number;
  fightP2Hp?: number;
  fightP1Coins?: number;
  fightP2Coins?: number;
  fightP1Shield?: boolean;
  fightP2Shield?: boolean;
  fightCombatLog?: string;
}

export interface ManualMatchInput {
  round: number;
  matchIndex: number;
  p1Username: string;
  p1AvatarUrl?: string;
  p2Username: string;
  p2AvatarUrl?: string;
  winnerUsername?: string;
  scoreText?: string;
  outcomeDetail?: string;
}

export interface ManualTournamentOptions {
  title?: string;
  gameName?: string;
  rounds?: number;
  players?: string[];
  matches: ManualMatchInput[];
  championUsername?: string;
}

export class TournamentManager extends BaseGame<TournamentOptions> {
  private btnPrefix: string;
  private participants: BracketParticipant[] = [];
  private matches: BracketMatch[] = [];
  private numRounds: number = 2;
  private currentRound: number = 1;
  private champion?: BracketParticipant;
  private isManualMode: boolean = false;
  private gameTitle: string;

  // Ephemeral Sessions for preliminary rounds
  private activeSessions: Map<string, TournamentMatchSession> = new Map();

  // Grand Finals live session (played publicly in the channel)
  private gfSession?: GrandFinalsSession;
  private gfAfkTimer?: NodeJS.Timeout;

  constructor(manager: any, options: TournamentOptions) {
    super(manager, options, "tournament");
    // Default tournament idle timeout is 10 minutes (600,000ms), customizable via options.time
    this.defaultTimeout = options.time || 600_000;
    this.btnPrefix = getRandomString(6, "tourn_");

    this.gameTitle = options.game || "custom";
    const rawGame = (options.game || "").toLowerCase();
    this.isManualMode = Boolean(options.manual || rawGame === "custom" || !["rps", "tictactoe", "fight"].includes(rawGame));

    // Standardize participants
    const rawPlayers = options.players || [];
    this.participants = rawPlayers.map((p) => {
      const user = p instanceof GuildMember ? p.user : (p as User);
      return {
        id: user.id,
        username: user.username,
        avatarUrl: user.displayAvatarURL ? user.displayAvatarURL({ extension: "png", size: 128 }) : undefined,
      };
    });

    this.setupBrackets();
  }

  private setupBrackets(): void {
    const count = this.participants.length;
    const bracketSize = count <= 4 ? 4 : count <= 8 ? 8 : 16;
    this.numRounds = Math.log2(bracketSize);

    // Seed round 1 matches
    const round1Count = bracketSize / 2;
    for (let i = 0; i < round1Count; i++) {
      this.matches.push({
        id: `1_${i}`,
        round: 1,
        matchIndex: i,
        p1: this.participants[i * 2],
        p2: this.participants[i * 2 + 1],
      });
    }

    // Seed subsequent empty rounds
    for (let r = 2; r <= this.numRounds; r++) {
      const matchesInRound = Math.pow(2, this.numRounds - r);
      for (let i = 0; i < matchesInRound; i++) {
        this.matches.push({
          id: `${r}_${i}`,
          round: r,
          matchIndex: i,
        });
      }
    }
  }

  public async start(): Promise<void> {
    if (this.participants.length < 4) {
      const errContainer = this.createContainer(0xed4245).addTextDisplayComponents((t) =>
        t.setContent("## ❌ Tournament Error\n> Tournaments require a minimum of 4 players to generate a bracket!")
      );
      await this.ctx.sendInitial({
        components: [errContainer],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    await this.renderAndDisplay();
    this.resetTournamentTimeout();
  }

  /**
   * Resets the tournament inactivity timer (clock).
   * Refreshes the full defaultTimeout (10 mins or options.time) whenever an interaction occurs.
   */
  private resetTournamentTimeout(): void {
    if (!this.isActive) return;
    this.resetTimeout(() => this.endTournament("timeout"), this.defaultTimeout);
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    // Reset tournament inactivity clock on any valid interaction so ongoing tournaments never abort
    this.resetTournamentTimeout();

    const actionKey = customId.slice(this.btnPrefix.length);

    // 1. Abort Tournament (Organizer only)
    if (actionKey === "abort") {
      if (interaction.user.id !== this.ctx.userId) {
        await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the tournament organizer can cancel this tournament.");
        return;
      }
      await interaction.deferUpdate().catch(() => {});
      await this.endTournament("aborted");
      return;
    }

    // 2. Refresh Bracket
    if (actionKey === "refresh") {
      await interaction.deferUpdate().catch(() => {});
      await this.renderAndDisplay();
      return;
    }

    // 3. Manual Advance Menu (Organizer only)
    if (actionKey === "manual_menu") {
      await this.handleManualMenu(interaction);
      return;
    }

    // 4. Manual Advance Selection (e.g. "adv_1_0_userId")
    if (actionKey.startsWith("adv_")) {
      await this.handleManualAdvanceSelection(interaction, actionKey);
      return;
    }

    // 5. Player joins / readies up for match
    if (actionKey === "join") {
      await this.handlePlayerJoinMatch(interaction);
      return;
    }

    // 6. Ephemeral Match Interaction (Preliminary Rounds)
    if (actionKey.startsWith("m_")) {
      await this.handleEphemeralMatchInteraction(interaction, actionKey);
      return;
    }

    // 7. Grand Finals Interaction (Live in channel)
    if (actionKey.startsWith("gf_")) {
      await this.handleGrandFinalsInteraction(interaction, actionKey);
      return;
    }
  }

  /**
   * Dispatches the manual advance modal/control menu to the organizer.
   */
  private async handleManualMenu(interaction: any): Promise<void> {
    if (interaction.user.id !== this.ctx.userId) {
      await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the tournament organizer can manually advance matches.");
      return;
    }

    const currentMatches = this.matches.filter((m) => m.round === this.currentRound && !m.winnerId && m.p1 && m.p2);
    if (currentMatches.length === 0) {
      await ContextAdapter.replyEphemeral(interaction, "All matches in this round are already completed!");
      return;
    }

    const container = this.createContainer(0xffd700).addTextDisplayComponents((t) =>
      t.setContent(
        `## 👑 Manual Match Control Panel (Round ${this.currentRound})\n` +
          `> **Discipline:** ${this.gameTitle.toUpperCase()}\n` +
          `> Select a winner below to manually report their match outcome and advance them in the bracket:`
      )
    );

    for (let i = 0; i < Math.min(4, currentMatches.length); i++) {
      const m = currentMatches[i];
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}adv_${m.id}_${m.p1!.id}`)
          .setLabel(`🏆 Win: ${m.p1!.username.slice(0, 16)} (M${m.matchIndex + 1})`)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}adv_${m.id}_${m.p2!.id}`)
          .setLabel(`🏆 Win: ${m.p2!.username.slice(0, 16)} (M${m.matchIndex + 1})`)
          .setStyle(ButtonStyle.Primary)
      );
      container.addActionRowComponents((ar) => ar.addComponents(...row.components));
    }

    await interaction.reply({
      components: [container],
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    }).catch(() => {});
  }

  /**
   * Handles manual winner selection by the organizer.
   */
  private async handleManualAdvanceSelection(interaction: any, actionKey: string): Promise<void> {
    if (interaction.user.id !== this.ctx.userId) {
      await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the tournament organizer can manually advance matches.");
      return;
    }

    const parts = actionKey.split("_");
    const matchId = `${parts[1]}_${parts[2]}`;
    const winnerId = parts[3];

    const match = this.matches.find((m) => m.id === matchId);
    if (!match || !match.p1 || !match.p2) {
      await ContextAdapter.replyEphemeral(interaction, "Match not found or players not populated.");
      return;
    }

    const winner = match.p1.id === winnerId ? match.p1 : match.p2;
    const loser = match.p1.id === winnerId ? match.p2 : match.p1;
    const outcome = `Declared Winner by Organizer (${winner.username} defeated ${loser.username})`;

    await this.progressMatch(matchId, winnerId, outcome);

    await interaction.update({
      components: [
        this.createContainer(0x57f287).addTextDisplayComponents((t) =>
          t.setContent(`✅ **Match ${match.matchIndex + 1} Advanced!** <@${winnerId}> (${winner.username}) declared winner!`)
        ),
      ],
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    }).catch(() => {});
  }

  /**
   * Handles a player pressing "Play My Match" on the main bracket board.
   */
  private async handlePlayerJoinMatch(interaction: any): Promise<void> {
    const userId = interaction.user.id;
    const isParticipant = this.participants.some((p) => p.id === userId);

    if (!isParticipant) {
      await ContextAdapter.replyEphemeral(interaction, "❌ You are not a registered participant in this tournament.");
      return;
    }

    // In manual mode, matches are reported by organizer
    if (this.isManualMode) {
      await ContextAdapter.replyEphemeral(
        interaction,
        `ℹ️ This tournament is running in **Manual Progression Mode** (${this.gameTitle}). The organizer will report match outcomes on the bracket board!`
      );
      return;
    }

    // If we are currently in Grand Finals, the game is played publicly
    if (this.currentRound === this.numRounds) {
      await ContextAdapter.replyEphemeral(
        interaction,
        "👑 The Grand Finals is active LIVE directly on the tournament message in this channel! You do not need an ephemeral."
      );
      return;
    }

    // Find the player's active match in the current round
    const match = this.matches.find(
      (m) => m.round === this.currentRound && (m.p1?.id === userId || m.p2?.id === userId)
    );

    if (!match || !match.p1 || !match.p2) {
      const earlierLoss = this.matches.some(
        (m) => m.round < this.currentRound && (m.p1?.id === userId || m.p2?.id === userId) && m.winnerId && m.winnerId !== userId
      );
      if (earlierLoss) {
        await ContextAdapter.replyEphemeral(interaction, "❌ You have been eliminated from the tournament. Thanks for participating!");
      } else {
        await ContextAdapter.replyEphemeral(interaction, "⏳ Your match for this round is waiting for opponents to qualify.");
      }
      return;
    }

    if (match.winnerId) {
      if (match.winnerId === userId) {
        await ContextAdapter.replyEphemeral(
          interaction,
          `✅ You have already won your match for Round ${this.currentRound} (${match.outcomeDetail || "Victory"})! Waiting for other matches in this round to finish.`
        );
      } else {
        await ContextAdapter.replyEphemeral(
          interaction,
          `❌ You were defeated in Round ${this.currentRound} (${match.outcomeDetail || "Defeated"}). Good game!`
        );
      }
      return;
    }

    // Retrieve or initialize match session
    let session = this.activeSessions.get(match.id);
    if (!session) {
      session = this.createMatchSession(match);
      this.activeSessions.set(match.id, session);
    }

    const isP1 = match.p1.id === userId;
    if (isP1) {
      session.p1Ready = true;
      session.p1Interaction = interaction;
    } else {
      session.p2Ready = true;
      session.p2Interaction = interaction;
    }

    const opponent = isP1 ? match.p2 : match.p1;
    const oppReady = isP1 ? session.p2Ready : session.p1Ready;

    if (!oppReady) {
      if (!session.readyTimeoutTimer) {
        session.readyTimeoutTimer = setTimeout(async () => {
          await this.handleWalkover(session!, userId, "ready_timeout");
        }, 60_000);
      }

      const waitContainer = this.createContainer(0x5865f2).addTextDisplayComponents((t) =>
        t.setContent(
          `## ⚔️ Match Found: You vs <@${opponent.id}>\n` +
            `> **Discipline:** ${this.gameTitle.toUpperCase()} • **Round ${session!.round}**\n\n` +
            `⏳ **You are Ready!**\n> Waiting for your opponent <@${opponent.id}> to click **"⚔️ Play My Match"** on the tournament board...\n\n` +
            `> ⏰ *If your opponent does not join within 60 seconds, you will win by default (Walkover).*`
        )
      );

      await interaction.reply({
        components: [waitContainer],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      }).catch(() => {});
      return;
    }

    // BOTH PLAYERS ARE READY: Start the game!
    if (session.readyTimeoutTimer) {
      clearTimeout(session.readyTimeoutTimer);
      session.readyTimeoutTimer = undefined;
    }

    session.status = "in_progress";
    this.resetSessionAfkTimer(session);

    const p1Container = this.renderMatchContainer(session, session.p1.id);
    const p2Container = this.renderMatchContainer(session, session.p2.id);

    const currentPContainer = isP1 ? p1Container : p2Container;
    const waitingPContainer = isP1 ? p2Container : p1Container;
    const waitingInteraction = isP1 ? session.p2Interaction : session.p1Interaction;

    await interaction.reply({
      components: [currentPContainer],
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    }).catch(() => {});

    if (waitingInteraction) {
      await waitingInteraction.editReply({
        components: [waitingPContainer],
        flags: MessageFlags.IsComponentsV2,
      }).catch(() => {});
    }

    await this.renderAndDisplay();
  }

  /**
   * Handles user interaction inside an ephemeral preliminary match.
   */
  private async handleEphemeralMatchInteraction(interaction: any, actionKey: string): Promise<void> {
    const parts = actionKey.split("_");
    const matchId = `${parts[1]}_${parts[2]}`;
    const gameType = parts[3];
    const subAction = parts.slice(4).join("_");

    const session = this.activeSessions.get(matchId);
    if (!session || session.status !== "in_progress") {
      await interaction.deferUpdate().catch(() => {});
      return;
    }

    const userId = interaction.user.id;
    if (userId !== session.p1.id && userId !== session.p2.id) {
      await ContextAdapter.replyEphemeral(interaction, "⚠️ You are not a player in this match.");
      return;
    }

    if (userId === session.p1.id) session.p1Interaction = interaction;
    else session.p2Interaction = interaction;

    let moveMade = false;

    if (gameType === "ttt") {
      if (userId !== session.currentTurnId) {
        await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn! Wait for your opponent.");
        return;
      }
      const cellIdx = parseInt(subAction, 10);
      if (session.tttBoard && session.tttBoard[cellIdx] === null) {
        session.tttBoard[cellIdx] = userId === session.p1.id ? "X" : "O";
        moveMade = true;

        const winResult = this.checkTTTWin(session.tttBoard);
        if (winResult) {
          session.winnerId = winResult.mark === "X" ? session.p1.id : session.p2.id;
          session.outcomeDetail = `Connected 3-in-a-row across ${winResult.line}`;
          session.scoreText = "3-IN-A-ROW";
          session.match.outcomeDetail = session.outcomeDetail;
          session.match.scoreText = session.scoreText;
        } else if (session.tttBoard.every((c) => c !== null)) {
          // Tie -> Reset for sudden death
          session.tttBoard = Array(9).fill(null);
          session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
        } else {
          session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
        }
      }
    } else if (gameType === "rps") {
      const move = subAction as "rock" | "paper" | "scissors";
      if (userId === session.p1.id && !session.rpsP1Choice) {
        session.rpsP1Choice = move;
        moveMade = true;
      } else if (userId === session.p2.id && !session.rpsP2Choice) {
        session.rpsP2Choice = move;
        moveMade = true;
      }

      if (session.rpsP1Choice && session.rpsP2Choice) {
        const result = this.checkRPSWinner(session.rpsP1Choice, session.rpsP2Choice);
        if (result === "p1") {
          session.winnerId = session.p1.id;
          session.outcomeDetail = `${session.rpsP1Choice.toUpperCase()} defeated ${session.rpsP2Choice.toUpperCase()}`;
          session.scoreText = `${session.rpsP1Choice.toUpperCase()} W`;
        } else if (result === "p2") {
          session.winnerId = session.p2.id;
          session.outcomeDetail = `${session.rpsP2Choice.toUpperCase()} defeated ${session.rpsP1Choice.toUpperCase()}`;
          session.scoreText = `${session.rpsP2Choice.toUpperCase()} W`;
        } else {
          session.rpsMessage = `⚡ Tie! Both players selected **${session.rpsP1Choice.toUpperCase()}**! Sudden death replay:`;
          session.rpsP1Choice = undefined;
          session.rpsP2Choice = undefined;
        }

        if (session.winnerId) {
          session.match.outcomeDetail = session.outcomeDetail;
          session.match.scoreText = session.scoreText;
        }
      }
    } else if (gameType === "fight") {
      if (userId !== session.currentTurnId) {
        await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn!");
        return;
      }
      this.executeFightAction(session, userId, subAction);
      moveMade = true;
    }

    if (!moveMade && !session.winnerId) {
      await interaction.deferUpdate().catch(() => {});
      return;
    }

    // Check if match concluded
    if (session.winnerId) {
      if (session.afkTimer) clearTimeout(session.afkTimer);
      session.status = "completed";
      this.advanceWinnerInBracket(session.match, session.winnerId);

      const otherUserId = userId === session.p1.id ? session.p2.id : session.p1.id;
      const otherInteraction = userId === session.p1.id ? session.p2Interaction : session.p1Interaction;

      const clickerResult = this.renderMatchResultContainer(session, userId);
      const otherResult = this.renderMatchResultContainer(session, otherUserId);

      await interaction.update({
        components: [clickerResult],
        flags: MessageFlags.IsComponentsV2,
      }).catch(() => {});

      if (otherInteraction) {
        await otherInteraction.editReply({
          components: [otherResult],
          flags: MessageFlags.IsComponentsV2,
        }).catch(() => {});
      }

      await this.renderAndDisplay();
      await this.checkRoundCompletion();
      return;
    }

    // Match continues
    this.resetSessionAfkTimer(session);

    const isP1 = userId === session.p1.id;
    const clickerContainer = this.renderMatchContainer(session, userId);
    const otherUserId = isP1 ? session.p2.id : session.p1.id;
    const otherContainer = this.renderMatchContainer(session, otherUserId);
    const otherInteraction = isP1 ? session.p2Interaction : session.p1Interaction;

    await interaction.update({
      components: [clickerContainer],
      flags: MessageFlags.IsComponentsV2,
    }).catch(() => {});

    if (otherInteraction) {
      await otherInteraction.editReply({
        components: [otherContainer],
        flags: MessageFlags.IsComponentsV2,
      }).catch(() => {});
    }
  }

  /**
   * Handles user interaction in the live, public Grand Finals in the channel.
   */
  private async handleGrandFinalsInteraction(interaction: any, actionKey: string): Promise<void> {
    const finalMatch = this.matches.find((m) => m.round === this.numRounds);
    if (!finalMatch || !finalMatch.p1 || !finalMatch.p2 || !this.gfSession) {
      await interaction.deferUpdate().catch(() => {});
      return;
    }

    const userId = interaction.user.id;
    if (userId !== finalMatch.p1.id && userId !== finalMatch.p2.id) {
      await ContextAdapter.replyEphemeral(interaction, "⚠️ Only the Grand Finalists can make moves in the championship match!");
      return;
    }

    const parts = actionKey.split("_");
    const gameType = parts[1];
    const subAction = parts.slice(2).join("_");
    const session = this.gfSession;

    let moveMade = false;

    if (gameType === "ttt") {
      if (userId !== session.currentTurnId) {
        await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn!");
        return;
      }
      const cellIdx = parseInt(subAction, 10);
      if (session.tttBoard && session.tttBoard[cellIdx] === null) {
        session.tttBoard[cellIdx] = userId === session.p1.id ? "X" : "O";
        moveMade = true;

        const winResult = this.checkTTTWin(session.tttBoard);
        if (winResult) {
          session.winnerId = winResult.mark === "X" ? session.p1.id : session.p2.id;
          session.outcomeDetail = `Grand Finals Victory: 3-in-a-row across ${winResult.line}!`;
          session.scoreText = "CHAMPION";
        } else if (session.tttBoard.every((c) => c !== null)) {
          // Tie -> Sudden death
          session.tttBoard = Array(9).fill(null);
          session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
        } else {
          session.currentTurnId = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
        }
      }
    } else if (gameType === "rps") {
      const move = subAction as "rock" | "paper" | "scissors";
      if (userId === session.p1.id && !session.rpsP1Choice) {
        session.rpsP1Choice = move;
        moveMade = true;
      } else if (userId === session.p2.id && !session.rpsP2Choice) {
        session.rpsP2Choice = move;
        moveMade = true;
      }

      if (session.rpsP1Choice && session.rpsP2Choice) {
        const result = this.checkRPSWinner(session.rpsP1Choice, session.rpsP2Choice);
        if (result === "p1") {
          session.winnerId = session.p1.id;
          session.outcomeDetail = `Championship Move: ${session.rpsP1Choice.toUpperCase()} defeated ${session.rpsP2Choice.toUpperCase()}!`;
          session.scoreText = "CHAMPION";
        } else if (result === "p2") {
          session.winnerId = session.p2.id;
          session.outcomeDetail = `Championship Move: ${session.rpsP2Choice.toUpperCase()} defeated ${session.rpsP1Choice.toUpperCase()}!`;
          session.scoreText = "CHAMPION";
        } else {
          session.rpsMessage = `⚡ Tie! Both finalists selected **${session.rpsP1Choice.toUpperCase()}**! Sudden death replay:`;
          session.rpsP1Choice = undefined;
          session.rpsP2Choice = undefined;
        }
      }
    } else if (gameType === "fight") {
      if (userId !== session.currentTurnId) {
        await ContextAdapter.replyEphemeral(interaction, "⏳ It's not your turn!");
        return;
      }
      this.executeFightAction(session, userId, subAction);
      moveMade = true;
    }

    if (!moveMade && !session.winnerId) {
      await interaction.deferUpdate().catch(() => {});
      return;
    }

    if (session.winnerId) {
      if (this.gfAfkTimer) clearTimeout(this.gfAfkTimer);
      const winner = session.winnerId === session.p1.id ? session.p1 : session.p2;
      this.champion = winner;
      finalMatch.winnerId = winner.id;
      finalMatch.outcomeDetail = session.outcomeDetail;
      finalMatch.scoreText = session.scoreText || "CHAMPION";

      await interaction.deferUpdate().catch(() => {});
      this.clearAllTimers();
      this.isActive = false;
      await this.renderAndDisplay(true);
      this.emitEnd("finished");
      this.destroy();
      return;
    }

    // Grand Finals continues
    this.resetGrandFinalsAfkTimer();
    const updatedContainer = this.renderGrandFinalsContainer();
    await interaction.update({
      components: [updatedContainer],
      flags: MessageFlags.IsComponentsV2,
    }).catch(() => {});
  }

  /**
   * Handles Walkover / Forfeit if a player is AFK.
   */
  private async handleWalkover(session: TournamentMatchSession, winningUserId: string, reason: "ready_timeout" | "turn_timeout"): Promise<void> {
    if (session.status === "completed") return;

    if (session.readyTimeoutTimer) clearTimeout(session.readyTimeoutTimer);
    if (session.afkTimer) clearTimeout(session.afkTimer);

    session.status = "completed";
    session.winnerId = winningUserId;
    const outcome = reason === "ready_timeout" ? "Walkover (Opponent 60s AFK)" : "Turn Timeout (Opponent 45s Inactivity)";
    session.outcomeDetail = outcome;
    session.scoreText = "WALKOVER";
    session.match.outcomeDetail = outcome;
    session.match.scoreText = "WALKOVER";

    this.advanceWinnerInBracket(session.match, winningUserId);

    const opponentId = winningUserId === session.p1.id ? session.p2.id : session.p1.id;
    const winnerInteraction = winningUserId === session.p1.id ? session.p1Interaction : session.p2Interaction;
    const loserInteraction = winningUserId === session.p1.id ? session.p2Interaction : session.p1Interaction;

    const winContainer = this.createContainer(0x57f287).addTextDisplayComponents((t) =>
      t.setContent(
        `## 🏆 WALKOVER VICTORY!\n` +
          `> Your opponent <@${opponentId}> was inactive (${outcome}).\n\n` +
          `⚔️ **Match Outcome:** ${outcome}\n` +
          `🎉 **You have ADVANCED to the next round by forfeit!**\n` +
          `> Return to the tournament board in the channel to view the updated bracket.`
      )
    );

    const loseContainer = this.createContainer(0xed4245).addTextDisplayComponents((t) =>
      t.setContent(
        `## ⏰ MATCH FORFEITED\n` +
          `> You were disqualified from Round ${session.round} due to inactivity (${outcome}).\n\n` +
          `⚔️ **Match Outcome:** ${outcome}\n` +
          `👋 Thank you for playing! You can continue watching the tournament in the channel.`
      )
    );

    if (winnerInteraction) {
      await winnerInteraction.editReply({
        components: [winContainer],
        flags: MessageFlags.IsComponentsV2,
      }).catch(() => {});
    }

    if (loserInteraction) {
      await loserInteraction.editReply({
        components: [loseContainer],
        flags: MessageFlags.IsComponentsV2,
      }).catch(() => {});
    }

    await this.renderAndDisplay();
    await this.checkRoundCompletion();
  }

  /**
   * Advances the winner into the next bracket node.
   */
  private advanceWinnerInBracket(match: BracketMatch, winnerId: string): void {
    match.winnerId = winnerId;
    const winner = match.p1?.id === winnerId ? match.p1 : match.p2;
    if (!winner) return;

    const nextRound = match.round + 1;
    if (nextRound <= this.numRounds) {
      const nextMatchIndex = Math.floor(match.matchIndex / 2);
      const isP1Slot = match.matchIndex % 2 === 0;
      const nextMatch = this.matches.find((m) => m.round === nextRound && m.matchIndex === nextMatchIndex);
      if (nextMatch) {
        if (isP1Slot) nextMatch.p1 = winner;
        else nextMatch.p2 = winner;
      }
    } else {
      this.champion = winner;
    }
  }

  /**
   * Manually advances a specific match with a winner and optional outcome detail text.
   * Works for ANY game or bracket type.
   */
  public async progressMatch(matchId: string, winnerId: string, outcomeDetail: string = "Manual Advance"): Promise<void> {
    const match = this.matches.find((m) => m.id === matchId);
    if (!match || !match.p1 || !match.p2) return;

    match.winnerId = winnerId;
    match.outcomeDetail = outcomeDetail;
    match.scoreText = "WIN";

    const session = this.activeSessions.get(match.id);
    if (session) {
      session.status = "completed";
      session.winnerId = winnerId;
      session.outcomeDetail = outcomeDetail;
      session.scoreText = "WIN";
      if (session.readyTimeoutTimer) clearTimeout(session.readyTimeoutTimer);
      if (session.afkTimer) clearTimeout(session.afkTimer);
    }

    this.advanceWinnerInBracket(match, winnerId);
    this.resetTournamentTimeout();
    await this.renderAndDisplay();
    await this.checkRoundCompletion();
  }

  /**
   * Manually advances the next pending match in the current round.
   */
  public async progressNextMatch(winnerId?: string, outcomeDetail: string = "Manual Advance"): Promise<BracketMatch | null> {
    const nextPending = this.matches.find((m) => m.round === this.currentRound && !m.winnerId && m.p1 && m.p2);
    if (!nextPending) return null;

    const chosenWinner = winnerId || (Math.random() < 0.5 ? nextPending.p1!.id : nextPending.p2!.id);
    await this.progressMatch(nextPending.id, chosenWinner, outcomeDetail);
    return nextPending;
  }

  /**
   * Static helper to generate a visual tournament progress bracket image manually without running live games.
   */
  public static async generateBracketProgress(options: ManualTournamentOptions): Promise<Buffer> {
    const rounds = options.rounds || (options.matches.length > 0 ? Math.max(...options.matches.map((m) => m.round)) : 2);
    const bracketMatches: BracketMatch[] = options.matches.map((m) => ({
      id: `${m.round}_${m.matchIndex}`,
      round: m.round,
      matchIndex: m.matchIndex,
      p1: { id: `p_${m.p1Username}`, username: m.p1Username, avatarUrl: m.p1AvatarUrl },
      p2: { id: `p_${m.p2Username}`, username: m.p2Username, avatarUrl: m.p2AvatarUrl },
      winnerId: m.winnerUsername ? `p_${m.winnerUsername}` : undefined,
      scoreText: m.scoreText,
      outcomeDetail: m.outcomeDetail,
    }));

    const champion = options.championUsername
      ? { id: `p_${options.championUsername}`, username: options.championUsername }
      : undefined;

    return RenderBracket.render({
      title: options.title || "TOURNAMENT BRACKET",
      gameName: options.gameName || "CHAMPIONSHIP",
      rounds,
      matches: bracketMatches,
      champion,
    });
  }

  public getMatches(): BracketMatch[] {
    return this.matches;
  }

  public getPendingMatches(): BracketMatch[] {
    return this.matches.filter((m) => m.round === this.currentRound && !m.winnerId && m.p1 && m.p2);
  }

  /**
   * Checks if all matches in the active round are done, advancing to the next round or Grand Finals.
   */
  private async checkRoundCompletion(): Promise<void> {
    const currentMatches = this.matches.filter((m) => m.round === this.currentRound);
    const allDone = currentMatches.every((m) => m.winnerId !== undefined);

    if (allDone) {
      this.resetTournamentTimeout();
      if (this.currentRound < this.numRounds) {
        this.currentRound++;
        if (this.currentRound === this.numRounds) {
          this.initGrandFinals();
        }
        await this.renderAndDisplay();
      } else {
        const finalsMatch = this.matches.find((m) => m.round === this.numRounds);
        if (finalsMatch?.winnerId) {
          this.champion = finalsMatch.winnerId === finalsMatch.p1?.id ? finalsMatch.p1 : finalsMatch.p2;
        }
        this.clearAllTimers();
        this.isActive = false;
        await this.renderAndDisplay(true);
        this.emitEnd("finished");
        this.destroy();
      }
    }
  }

  /**
   * Initializes the Grand Finals session when preliminary rounds complete.
   */
  private initGrandFinals(): void {
    const finalsMatch = this.matches.find((m) => m.round === this.numRounds);
    if (!finalsMatch || !finalsMatch.p1 || !finalsMatch.p2) return;

    this.gfSession = {
      match: finalsMatch,
      p1: finalsMatch.p1,
      p2: finalsMatch.p2,
      currentTurnId: finalsMatch.p1.id,
      tttBoard: Array(9).fill(null),
      fightP1Hp: 100,
      fightP2Hp: 100,
      fightP1Coins: 20,
      fightP2Coins: 20,
    };

    if (!this.isManualMode) {
      this.resetGrandFinalsAfkTimer();
    }
  }

  private resetSessionAfkTimer(session: TournamentMatchSession): void {
    if (session.afkTimer) clearTimeout(session.afkTimer);
    session.afkTimer = setTimeout(async () => {
      const winningUser = session.currentTurnId === session.p1.id ? session.p2.id : session.p1.id;
      await this.handleWalkover(session, winningUser, "turn_timeout");
    }, 45_000);
  }

  private resetGrandFinalsAfkTimer(): void {
    if (this.gfAfkTimer) clearTimeout(this.gfAfkTimer);
    this.gfAfkTimer = setTimeout(async () => {
      if (!this.gfSession || !this.isActive) return;
      const winningUser = this.gfSession.currentTurnId === this.gfSession.p1.id ? this.gfSession.p2 : this.gfSession.p1;
      this.champion = winningUser;
      const finalMatch = this.matches.find((m) => m.round === this.numRounds);
      if (finalMatch) {
        finalMatch.winnerId = winningUser.id;
        finalMatch.outcomeDetail = "Walkover (Opponent 60s AFK)";
        finalMatch.scoreText = "CHAMPION";
      }

      this.clearAllTimers();
      this.isActive = false;
      await this.renderAndDisplay(true);
      this.emitEnd("finished");
      this.destroy();
    }, 60_000);
  }

  private createMatchSession(match: BracketMatch): TournamentMatchSession {
    return {
      match,
      round: match.round,
      p1: match.p1!,
      p2: match.p2!,
      status: "waiting_opponent",
      p1Ready: false,
      p2Ready: false,
      currentTurnId: match.p1!.id,
      tttBoard: Array(9).fill(null),
      fightP1Hp: 100,
      fightP2Hp: 100,
      fightP1Coins: 20,
      fightP2Coins: 20,
    };
  }

  private checkTTTWin(board: (string | null)[]): { mark: "X" | "O"; line: string } | null {
    const lines: [number, number, number, string][] = [
      [0, 1, 2, "Top Row"],
      [3, 4, 5, "Middle Row"],
      [6, 7, 8, "Bottom Row"],
      [0, 3, 6, "Left Column"],
      [1, 4, 7, "Center Column"],
      [2, 5, 8, "Right Column"],
      [0, 4, 8, "Diagonal (Top-Left to Bottom-Right)"],
      [2, 4, 6, "Diagonal (Top-Right to Bottom-Left)"],
    ];
    for (const [a, b, c, line] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { mark: board[a] as "X" | "O", line };
      }
    }
    return null;
  }

  private checkRPSWinner(p1Choice: string, p2Choice: string): "p1" | "p2" | "draw" {
    if (p1Choice === p2Choice) return "draw";
    if (
      (p1Choice === "rock" && p2Choice === "scissors") ||
      (p1Choice === "scissors" && p2Choice === "paper") ||
      (p1Choice === "paper" && p2Choice === "rock")
    ) {
      return "p1";
    }
    return "p2";
  }

  private executeFightAction(session: TournamentMatchSession | GrandFinalsSession, attackerId: string, action: string): void {
    const isP1 = session.p1.id === attackerId;
    let attackerHp = isP1 ? session.fightP1Hp! : session.fightP2Hp!;
    let defenderHp = isP1 ? session.fightP2Hp! : session.fightP1Hp!;
    let attackerCoins = isP1 ? session.fightP1Coins! : session.fightP2Coins!;
    let defenderShield = isP1 ? session.fightP2Shield : session.fightP1Shield;
    const attackerName = isP1 ? session.p1.username : session.p2.username;

    if (action === "attack") {
      let dmg = Math.floor(Math.random() * 9) + 14; // 14-22 dmg
      if (defenderShield) {
        dmg = Math.floor(dmg / 2);
        if (isP1) session.fightP2Shield = false;
        else session.fightP1Shield = false;
      }
      defenderHp = Math.max(0, defenderHp - dmg);
      attackerCoins += 10;
      session.fightCombatLog = `💥 **${attackerName}** used Normal Attack dealing **${dmg}** damage!`;
    } else if (action === "heavy") {
      if (Math.random() < 0.14) {
        attackerCoins += 5;
        session.fightCombatLog = `💨 **${attackerName}** swung hard but missed!`;
      } else {
        let dmg = Math.floor(Math.random() * 11) + 22; // 22-32 dmg
        if (defenderShield) {
          dmg = Math.floor(dmg / 2);
          if (isP1) session.fightP2Shield = false;
          else session.fightP1Shield = false;
        }
        defenderHp = Math.max(0, defenderHp - dmg);
        attackerCoins += 15;
        session.fightCombatLog = `💥 **${attackerName}** landed a HEAVY CRIT dealing **${dmg}** damage!`;
      }
    } else if (action === "heal") {
      const healAmount = Math.floor(Math.random() * 11) + 16; // 16-26 hp
      attackerHp = Math.min(100, attackerHp + healAmount);
      attackerCoins += 5;
      session.fightCombatLog = `💚 **${attackerName}** drank an elixir and healed **+${healAmount} HP**!`;
    } else if (action === "shield") {
      if (attackerCoins >= 25) {
        attackerCoins -= 25;
        if (isP1) session.fightP1Shield = true;
        else session.fightP2Shield = true;
        session.fightCombatLog = `🛡️ **${attackerName}** activated a Shield (-50% next damage)!`;
      } else {
        session.fightCombatLog = `❌ **${attackerName}** did not have enough coins for a Shield!`;
      }
    }

    if (isP1) {
      session.fightP1Hp = attackerHp;
      session.fightP2Hp = defenderHp;
      session.fightP1Coins = attackerCoins;
    } else {
      session.fightP2Hp = attackerHp;
      session.fightP1Hp = defenderHp;
      session.fightP2Coins = attackerCoins;
    }

    if (defenderHp <= 0) {
      session.winnerId = attackerId;
      const attackName = action === "heavy" ? "Heavy Strike" : "Normal Attack";
      const outcome = `Knockout with ${attackName}! (Winner HP: ${attackerHp}/100)`;
      session.outcomeDetail = outcome;
      session.scoreText = `KO (${attackerHp} HP)`;
      session.match.outcomeDetail = outcome;
      session.match.scoreText = session.scoreText;
    } else {
      session.currentTurnId = isP1 ? session.p2.id : session.p1.id;
    }
  }

  /**
   * Renders the interactive match container for an ephemeral match session.
   */
  private renderMatchContainer(session: TournamentMatchSession, viewingUserId: string): ContainerBuilder {
    const isP1 = viewingUserId === session.p1.id;
    const isMyTurn = session.currentTurnId === viewingUserId;
    const opponent = isP1 ? session.p2 : session.p1;
    const game = this.options.game || "custom";

    const container = this.createContainer(isMyTurn ? 0x00f7ff : 0x5865f2);

    let text = `## ⚔️ Tournament Match • Round ${session.round}\n` +
      `### <@${session.p1.id}> vs <@${session.p2.id}>\n` +
      `> **Discipline:** ${this.gameTitle.toUpperCase()} • **Opponent:** <@${opponent.id}>\n\n`;

    if (game === "tictactoe") {
      text += isMyTurn
        ? `👉 **It's YOUR turn (${isP1 ? "❌ X" : "⭕ O"})!** Select an available square below:\n`
        : `⏳ **Waiting for <@${session.currentTurnId}> to make a move...**\n`;
      text += `> ⏰ *45s turn timeout (inactivity forfeits match)*`;

      container.addTextDisplayComponents((t) => t.setContent(text));

      for (let r = 0; r < 3; r++) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const cell = session.tttBoard?.[idx];
          const btn = new ButtonBuilder().setCustomId(`${this.btnPrefix}m_${session.match.id}_ttt_${idx}`);

          if (cell === "X") {
            btn.setLabel("X").setStyle(ButtonStyle.Danger).setDisabled(true);
          } else if (cell === "O") {
            btn.setLabel("O").setStyle(ButtonStyle.Success).setDisabled(true);
          } else {
            btn.setLabel("-").setStyle(ButtonStyle.Secondary).setDisabled(!isMyTurn);
          }
          row.addComponents(btn);
        }
        container.addActionRowComponents((ar) => ar.addComponents(...row.components));
      }
    } else if (game === "rps") {
      const myChoice = isP1 ? session.rpsP1Choice : session.rpsP2Choice;
      if (session.rpsMessage) {
        text += `> ${session.rpsMessage}\n\n`;
      }
      text += myChoice
        ? `✅ **You picked ${myChoice.toUpperCase()}!** Waiting for your opponent...\n`
        : `👉 **Choose your move secretly below:**\n`;
      text += `> ⏰ *45s move timeout*`;

      container.addTextDisplayComponents((t) => t.setContent(text));

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}m_${session.match.id}_rps_rock`)
          .setLabel("🪨 Rock")
          .setStyle(myChoice === "rock" ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(Boolean(myChoice)),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}m_${session.match.id}_rps_paper`)
          .setLabel("📄 Paper")
          .setStyle(myChoice === "paper" ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(Boolean(myChoice)),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}m_${session.match.id}_rps_scissors`)
          .setLabel("✂️ Scissors")
          .setStyle(myChoice === "scissors" ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(Boolean(myChoice))
      );
      container.addActionRowComponents((ar) => ar.addComponents(...row.components));
    } else if (game === "fight") {
      const myHp = isP1 ? session.fightP1Hp! : session.fightP2Hp!;
      const oppHp = isP1 ? session.fightP2Hp! : session.fightP1Hp!;
      const myCoins = isP1 ? session.fightP1Coins! : session.fightP2Coins!;
      const hasShield = isP1 ? session.fightP1Shield : session.fightP2Shield;

      if (session.fightCombatLog) {
        text += `> ${session.fightCombatLog}\n\n`;
      }
      text += `📊 **Your HP:** ${myHp} / 100 • **Coins:** ¢${myCoins} ${hasShield ? "(🛡️ Shield Active)" : ""}\n` +
        `🎯 **Opponent HP:** ${oppHp} / 100\n\n`;
      text += isMyTurn
        ? `👉 **It's YOUR turn!** Select an action below:\n`
        : `⏳ **Waiting for <@${session.currentTurnId}>'s action...**\n`;
      text += `> ⏰ *45s turn timeout*`;

      container.addTextDisplayComponents((t) => t.setContent(text));

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_attack`)
          .setLabel("⚔️ Attack")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!isMyTurn),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_heavy`)
          .setLabel("💥 Heavy Strike")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!isMyTurn),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_heal`)
          .setLabel("💚 Heal")
          .setStyle(ButtonStyle.Success)
          .setDisabled(!isMyTurn || myHp >= 85),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}m_${session.match.id}_fight_shield`)
          .setLabel("🛡️ Shield (¢25)")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!isMyTurn || myCoins < 25 || hasShield)
      );
      container.addActionRowComponents((ar) => ar.addComponents(...row.components));
    }

    return container;
  }

  /**
   * Renders the outcome container shown to players when an ephemeral match concludes,
   * with explicit detail on how the player won or was defeated.
   */
  private renderMatchResultContainer(session: TournamentMatchSession, viewingUserId: string): ContainerBuilder {
    const won = session.winnerId === viewingUserId;
    const opponent = viewingUserId === session.p1.id ? session.p2 : session.p1;
    const container = this.createContainer(won ? 0x57f287 : 0xed4245);
    const outcome = session.outcomeDetail || session.match.outcomeDetail || "Standard Match Victory";

    let content = "";
    if (won) {
      content = `## 🎉 MATCH VICTORY!\n` +
        `> **Congratulations <@${viewingUserId}>!** You defeated <@${opponent.id}> in Round ${session.round}!\n\n` +
        `⚔️ **Winning Play / Outcome:**\n` +
        `> • ${outcome}\n\n` +
        `🏆 **You have ADVANCED to the next round!**\n` +
        `> Check the updated bracket board in the channel to see your next matchup.`;
    } else {
      content = `## ❌ TOURNAMENT ELIMINATION\n` +
        `> You were defeated by <@${opponent.id}> in Round ${session.round}.\n\n` +
        `⚔️ **Defeat Reason / Deciding Play:**\n` +
        `> • ${outcome}\n\n` +
        `👋 **Thank you for playing!** You can continue spectating the remaining matches in the channel.`;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));
    return container;
  }

  /**
   * Renders the interactive container for the live Grand Finals in the main channel.
   */
  private renderGrandFinalsContainer(): ContainerBuilder {
    const finalMatch = this.matches.find((m) => m.round === this.numRounds)!;
    const session = this.gfSession!;
    const game = this.options.game || "custom";

    const container = this.createContainer(0xffd700);

    let text = `## 👑 GRAND FINALS: <@${finalMatch.p1!.id}> vs <@${finalMatch.p2!.id}>\n` +
      `> **Discipline:** ${this.gameTitle.toUpperCase()} • **THE CHAMPIONSHIP MATCH**\n` +
      `> 🏆 *The final game is played LIVE here in the channel!*\n\n`;

    if (this.isManualMode) {
      text += `👉 **Organizer:** Use the manual advance button below to crown the final champion!`;
      container.addTextDisplayComponents((t) => t.setContent(text));
    } else if (game === "tictactoe") {
      const isP1Turn = session.currentTurnId === finalMatch.p1!.id;
      text += `👉 **Current Turn:** <@${session.currentTurnId}> (${isP1Turn ? "❌ X" : "⭕ O"})\n` +
        `> ⏰ *60s turn limit (inactivity forfeits the championship)*`;

      container.addTextDisplayComponents((t) => t.setContent(text));

      for (let r = 0; r < 3; r++) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const cell = session.tttBoard?.[idx];
          const btn = new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_ttt_${idx}`);

          if (cell === "X") {
            btn.setLabel("X").setStyle(ButtonStyle.Danger).setDisabled(true);
          } else if (cell === "O") {
            btn.setLabel("O").setStyle(ButtonStyle.Success).setDisabled(true);
          } else {
            btn.setLabel("-").setStyle(ButtonStyle.Secondary);
          }
          row.addComponents(btn);
        }
        container.addActionRowComponents((ar) => ar.addComponents(...row.components));
      }
    } else if (game === "rps") {
      if (session.rpsMessage) {
        text += `> ${session.rpsMessage}\n\n`;
      }
      text += `👉 **Both finalists: choose your move below!**\n` +
        `> • <@${finalMatch.p1!.id}>: ${session.rpsP1Choice ? "✅ Locked In" : "⏳ Deciding..."}\n` +
        `> • <@${finalMatch.p2!.id}>: ${session.rpsP2Choice ? "✅ Locked In" : "⏳ Deciding..."}\n`;

      container.addTextDisplayComponents((t) => t.setContent(text));

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_rps_rock`).setLabel("🪨 Rock").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_rps_paper`).setLabel("📄 Paper").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_rps_scissors`).setLabel("✂️ Scissors").setStyle(ButtonStyle.Primary)
      );
      container.addActionRowComponents((ar) => ar.addComponents(...row.components));
    } else if (game === "fight") {
      if (session.fightCombatLog) {
        text += `> ${session.fightCombatLog}\n\n`;
      }
      text += `📊 **<@${finalMatch.p1!.id}>:** ${session.fightP1Hp} HP • ¢${session.fightP1Coins} ${session.fightP1Shield ? "(🛡️ Shield)" : ""}\n` +
        `📊 **<@${finalMatch.p2!.id}>:** ${session.fightP2Hp} HP • ¢${session.fightP2Coins} ${session.fightP2Shield ? "(🛡️ Shield)" : ""}\n\n` +
        `👉 **Current Turn:** <@${session.currentTurnId}>\n` +
        `> ⏰ *60s turn limit*`;

      container.addTextDisplayComponents((t) => t.setContent(text));

      const isP1 = session.currentTurnId === finalMatch.p1!.id;
      const curHp = isP1 ? session.fightP1Hp! : session.fightP2Hp!;
      const curCoins = isP1 ? session.fightP1Coins! : session.fightP2Coins!;
      const curShield = isP1 ? session.fightP1Shield : session.fightP2Shield;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_attack`).setLabel("⚔️ Attack").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_heavy`).setLabel("💥 Heavy Strike").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_heal`).setLabel("💚 Heal").setStyle(ButtonStyle.Success).setDisabled(curHp >= 85),
        new ButtonBuilder().setCustomId(`${this.btnPrefix}gf_fight_shield`).setLabel("🛡️ Shield (¢25)").setStyle(ButtonStyle.Secondary).setDisabled(curCoins < 25 || curShield)
      );
      container.addActionRowComponents((ar) => ar.addComponents(...row.components));
    }

    // Controls Row
    const controlsRow = new ActionRowBuilder<ButtonBuilder>();
    if (this.isManualMode) {
      controlsRow.addComponents(
        new ButtonBuilder().setCustomId(`${this.btnPrefix}manual_menu`).setLabel(this.options.texts?.crownChampionButton || "👑 Advance / Crown Champion").setStyle(ButtonStyle.Success)
      );
    }
    controlsRow.addComponents(
      new ButtonBuilder().setCustomId(`${this.btnPrefix}abort`).setLabel(this.options.texts?.abortButton || "Abort Tournament").setStyle(ButtonStyle.Danger)
    );
    container.addActionRowComponents((ar) => ar.addComponents(...controlsRow.components));

    return container;
  }

  /**
   * Renders and updates the main tournament channel message.
   */
  private async renderAndDisplay(isFinished: boolean = false): Promise<void> {
    const buffer = await RenderBracket.render({
      gameName: this.gameTitle,
      rounds: this.numRounds,
      matches: this.matches,
      champion: this.champion,
      title: this.options.title || this.options.embed?.title,
    });

    const attachment = new AttachmentBuilder(buffer, { name: "tournament-bracket.png" });

    // 1. Tournament Finished State
    if (isFinished && this.champion) {
      const finishContainer = this.createContainer(0x57f287);
      const finalsMatch = this.matches.find((m) => m.round === this.numRounds);
      const outcome = finalsMatch?.outcomeDetail ? `\n> ⚔️ **Championship Outcome:** ${finalsMatch.outcomeDetail}` : "";

      const content = `## 🏆 ${this.options.title || "Championship Tournament"}\n` +
        `> **Discipline:** ${this.gameTitle.toUpperCase()} • **Rounds:** ${this.numRounds} • **Players:** ${this.participants.length}\n\n` +
        `🎉 **TOURNAMENT COMPLETE!**\n> 👑 **CHAMPION:** <@${this.champion.id}> (${this.champion.username}) takes 1st place!${outcome}\n\n` +
        `Congratulations to all contenders and champions!`;

      finishContainer.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(finishContainer, content)));
      finishContainer.addMediaGalleryComponents((m) => m.addItems((item) => item.setURL("attachment://tournament-bracket.png")));

      await this.deliverMessage([finishContainer], [attachment]);
      return;
    }

    // 2. Grand Finals Live Game State
    if (this.currentRound === this.numRounds && this.gfSession) {
      const gfContainer = this.renderGrandFinalsContainer();
      gfContainer.addMediaGalleryComponents((m) => m.addItems((item) => item.setURL("attachment://tournament-bracket.png")));
      await this.deliverMessage([gfContainer], [attachment]);
      return;
    }

    // 3. Preliminary Round Bracket Board State
    const currentMatches = this.matches.filter((m) => m.round === this.currentRound);
    const container = this.createContainer(this.defaultColor);

    let content = `## 🏆 ${this.options.title || "Championship Tournament"}\n` +
      `> **Discipline:** ${this.gameTitle.toUpperCase()} • **Round:** ${this.currentRound} of ${this.numRounds} • **Players:** ${this.participants.length}\n\n` +
      `⚔️ **Active Matches (Round ${this.currentRound}):**\n`;

    for (let i = 0; i < currentMatches.length; i++) {
      const m = currentMatches[i];
      const p1Text = m.p1 ? `<@${m.p1.id}>` : "TBD";
      const p2Text = m.p2 ? `<@${m.p2.id}>` : "TBD";

      let statusBadge = "⏳ Waiting for Players";
      if (m.winnerId) {
        const winnerName = m.winnerId === m.p1?.id ? m.p1?.username : m.p2?.username;
        const outcome = m.outcomeDetail ? ` • ${m.outcomeDetail}` : "";
        statusBadge = `✅ **${winnerName} Won**${outcome}`;
      } else {
        const sess = this.activeSessions.get(m.id);
        if (sess?.status === "in_progress") {
          statusBadge = "🔥 **In Progress**";
        } else if (sess?.p1Ready || sess?.p2Ready) {
          statusBadge = "⏳ 1/2 Ready";
        }
      }
      content += `> • **Match ${i + 1}:** ${p1Text} vs ${p2Text} [${statusBadge}]\n`;
    }

    if (this.isManualMode) {
      content += `\n👉 **Organizer:** Click **"👑 Advance Match"** below to record match results!`;
    } else {
      content += `\n👉 **Players:** Click **"⚔️ Play My Match"** below to enter your private game!`;
    }

    container.addTextDisplayComponents((t) => t.setContent(this.applyEmbedDecorations(container, content)));
    container.addMediaGalleryComponents((m) => m.addItems((item) => item.setURL("attachment://tournament-bracket.png")));

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();

    if (this.isManualMode) {
      buttonsRow.addComponents(
        new ButtonBuilder().setCustomId(`${this.btnPrefix}manual_menu`).setLabel(this.options.texts?.manualAdvanceButton || "👑 Advance Match").setStyle(ButtonStyle.Success)
      );
    } else {
      buttonsRow.addComponents(
        new ButtonBuilder().setCustomId(`${this.btnPrefix}join`).setLabel(this.options.texts?.playButton || "⚔️ Play My Match").setStyle(ButtonStyle.Success)
      );
    }

    buttonsRow.addComponents(
      new ButtonBuilder().setCustomId(`${this.btnPrefix}refresh`).setLabel(this.options.texts?.refreshButton || "🔄 Refresh Bracket").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`${this.btnPrefix}abort`).setLabel(this.options.texts?.abortButton || "Abort").setStyle(ButtonStyle.Danger)
    );

    container.addActionRowComponents((r) => r.addComponents(...buttonsRow.components));
    await this.deliverMessage([container], [attachment]);
  }

  private async deliverMessage(components: ContainerBuilder[], files: AttachmentBuilder[]): Promise<void> {
    if (!this.ctx.gameMessage) {
      await this.ctx.sendInitial({
        components,
        files,
        flags: MessageFlags.IsComponentsV2,
      });
    } else {
      await this.ctx.edit({
        components,
        files,
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  private clearAllTimers(): void {
    this.clearTimer();
    if (this.gfAfkTimer) {
      clearTimeout(this.gfAfkTimer);
      this.gfAfkTimer = undefined;
    }
    for (const session of this.activeSessions.values()) {
      if (session.readyTimeoutTimer) {
        clearTimeout(session.readyTimeoutTimer);
        session.readyTimeoutTimer = undefined;
      }
      if (session.afkTimer) {
        clearTimeout(session.afkTimer);
        session.afkTimer = undefined;
      }
    }
  }

  private async endTournament(reason: "timeout" | "aborted"): Promise<void> {
    this.isActive = false;
    this.clearAllTimers();
    this.destroy();
    this.emitEnd(reason);

    const container = this.createContainer(0xed4245).addTextDisplayComponents((t) =>
      t.setContent(`## 🏆 Tournament Ended\n> The tournament was ${reason === "aborted" ? "cancelled by organizer" : "ended due to inactivity"}.`)
    );

    await this.ctx.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
}
