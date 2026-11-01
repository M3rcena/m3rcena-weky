import { FightPlayerInfo, RenderFight } from "../canvas/RenderFight.js";
import { WekyCanvas } from "../canvas/WekyCanvas.js";
import { GameControlRow } from "../core/ControlTypes.js";

export interface FightEngineOptions {
  player1: { id: string; username: string; avatarUrl?: string; health?: number; coins?: number };
  player2: { id: string; username: string; avatarUrl?: string; health?: number; coins?: number };
  startHealth?: number;
  initialPhase?: "REQUEST" | "FIGHT";
}

export interface FightState {
  p1: FightPlayerInfo;
  p2: FightPlayerInfo;
  currentTurnId: string;
  phase: "REQUEST" | "FIGHT" | "ENDED";
  lastAnnouncement: string;
  winner?: FightPlayerInfo;
  loser?: FightPlayerInfo;
  endReason?: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT";
}

/**
 * Headless Fight Duel RPG engine for web dashboards and custom APIs.
 */
export class FightEngine {
  private p1: FightPlayerInfo;
  private p2: FightPlayerInfo;
  private currentTurnId: string;
  private phase: "REQUEST" | "FIGHT" | "ENDED" = "REQUEST";
  private lastAnnouncement: string = "Duel requested!";
  private winner?: FightPlayerInfo;
  private loser?: FightPlayerInfo;
  private endReason?: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT";

  constructor(options: FightEngineOptions) {
    const defaultHp = options.startHealth ?? 100;
    this.p1 = {
      id: options.player1.id,
      username: options.player1.username,
      avatarUrl: options.player1.avatarUrl || "",
      health: options.player1.health ?? defaultHp,
      coins: options.player1.coins ?? 0,
      lastAction: "Challenged opponent",
      activeEffects: [],
    };
    this.p2 = {
      id: options.player2.id,
      username: options.player2.username,
      avatarUrl: options.player2.avatarUrl || "",
      health: options.player2.health ?? defaultHp,
      coins: options.player2.coins ?? 0,
      lastAction: "Awaiting start",
      activeEffects: [],
    };
    this.currentTurnId = this.p1.id;
    if (options.initialPhase === "REQUEST") {
      this.phase = "REQUEST";
      this.lastAnnouncement = "Duel requested!";
    } else {
      this.phase = "FIGHT";
      this.lastAnnouncement = `The duel begins! It's ${this.p1.username}'s turn!`;
    }
  }

  /**
   * Accepts the challenge and transitions to FIGHT phase.
   */
  public acceptChallenge(): void {
    this.phase = "FIGHT";
    this.currentTurnId = Math.random() < 0.5 ? this.p1.id : this.p2.id;
    const starter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
    this.lastAnnouncement = `The duel begins! It's ${starter.username}'s turn!`;
  }

  /**
   * Universal action method accepting either (action, playerId) or (playerId, action) and case-insensitive strings.
   */
  public action(playerId: string, actionType: string): { success: boolean; message: string; announcement: string; isGameOver?: boolean; winnerId?: string } {
    let act = actionType.toLowerCase();
    if (act === "attack") act = "hit";
    const res = this.performAction(act as any, playerId);
    return {
      success: res.success,
      message: res.message,
      announcement: this.lastAnnouncement,
      isGameOver: res.isGameOver,
      winnerId: res.winnerId,
    };
  }

  /**
   * Performs a combat action for a fighter.
   */
  public performAction(action: "hit" | "heavy" | "heal" | "shield" | "double" | "surrender", playerId: string): { success: boolean; message: string; isGameOver?: boolean; winnerId?: string } {
    if (this.phase === "REQUEST") {
      return { success: false, message: "Duel has not started yet. Call acceptChallenge() first." };
    }
    if (this.phase === "ENDED") {
      return { success: false, message: "Duel has already ended." };
    }
    if (playerId !== this.p1.id && playerId !== this.p2.id) {
      return { success: false, message: "User is not a combatant in this duel." };
    }

    if (action === "surrender") {
      this.winner = playerId === this.p1.id ? this.p2 : this.p1;
      this.loser = playerId === this.p1.id ? this.p1 : this.p2;
      this.phase = "ENDED";
      this.endReason = "SURRENDER";
      this.lastAnnouncement = `${this.loser.username} surrendered! ${this.winner.username} wins!`;
      return {
      success: true,
      message: this.lastAnnouncement,
      isGameOver: this.phase === "ENDED",
      winnerId: this.winner?.id,
    };
    }

    if (playerId !== this.currentTurnId) {
      return { success: false, message: "It is not this player's turn." };
    }

    const attacker = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
    const defender = this.currentTurnId === this.p1.id ? this.p2 : this.p1;

    if (action === "hit" || action === "heavy") {
      const isHeavy = action === "heavy";
      let damage = isHeavy ? Math.floor(Math.random() * 18) + 18 : Math.floor(Math.random() * 13) + 10;

      if (isHeavy && Math.random() < 0.25) {
        attacker.lastAction = "Missed Heavy Attack!";
        this.lastAnnouncement = `${attacker.username} swung hard but missed!`;
        attacker.coins += 5;
      } else {
        if (attacker.activeEffects?.includes("2x Damage")) {
          damage *= 2;
          attacker.activeEffects = attacker.activeEffects.filter((e) => e !== "2x Damage");
        }
        if (defender.activeEffects?.includes("Shield")) {
          damage = Math.floor(damage / 2);
          defender.activeEffects = defender.activeEffects.filter((e) => e !== "Shield");
        }
        defender.health = Math.max(0, defender.health - damage);
        attacker.coins += isHeavy ? 15 : 10;
        attacker.lastAction = `${isHeavy ? "Heavy Hit" : "Hit"} for ${damage} DMG`;
        this.lastAnnouncement = `${attacker.username} used ${isHeavy ? "Heavy Attack" : "Normal Attack"} dealing ${damage} damage!`;
      }
    } else if (action === "heal") {
      if (attacker.health >= 85) {
        this.lastAnnouncement = `${attacker.username} tried to heal, but HP is already high!`;
        attacker.lastAction = "Heal failed (High HP)";
      } else {
        const heal = Math.floor(Math.random() * 11) + 15;
        attacker.health = Math.min(100, attacker.health + heal);
        attacker.coins += 5;
        attacker.lastAction = `Healed +${heal} HP`;
        this.lastAnnouncement = `${attacker.username} healed for +${heal} HP!`;
      }
    } else if (action === "shield") {
      if (attacker.coins < 25) {
        return { success: false, message: "Not enough coins for Shield (requires 25)." };
      }
      attacker.coins -= 25;
      if (!attacker.activeEffects) attacker.activeEffects = [];
      if (!attacker.activeEffects.includes("Shield")) attacker.activeEffects.push("Shield");
      attacker.lastAction = "Activated Shield";
      this.lastAnnouncement = `${attacker.username} activated a Shield! (-50% damage taken)`;
    } else if (action === "double") {
      if (attacker.coins < 30) {
        return { success: false, message: "Not enough coins for 2x Damage (requires 30)." };
      }
      attacker.coins -= 30;
      if (!attacker.activeEffects) attacker.activeEffects = [];
      if (!attacker.activeEffects.includes("2x Damage")) attacker.activeEffects.push("2x Damage");
      attacker.lastAction = "Activated 2x DMG";
      this.lastAnnouncement = `${attacker.username} activated 2x Damage for next attack!`;
    }

    if (defender.health <= 0) {
      this.winner = attacker;
      this.loser = defender;
      this.phase = "ENDED";
      this.endReason = "WIN";
      this.lastAnnouncement = `${attacker.username} knocked out ${defender.username} and won!`;
    } else {
      this.currentTurnId = defender.id;
    }

    return {
      success: true,
      message: this.lastAnnouncement,
      isGameOver: this.phase === "ENDED",
      winnerId: this.winner?.id,
    };
  }

  /**
   * Returns current combat state.
   */
  public getState(): FightState {
    return {
      p1: { ...this.p1, activeEffects: [...(this.p1.activeEffects || [])] },
      p2: { ...this.p2, activeEffects: [...(this.p2.activeEffects || [])] },
      currentTurnId: this.currentTurnId,
      phase: this.phase,
      lastAnnouncement: this.lastAnnouncement,
      winner: this.winner ? { ...this.winner } : undefined,
      loser: this.loser ? { ...this.loser } : undefined,
      endReason: this.endReason,
    };
  }

  /**
   * Returns control buttons suitable for web dashboard or custom bot.
   */
  public getControls(playerId?: string): GameControlRow[] {
    const isPlayerTurn = !playerId || playerId === this.currentTurnId;
    const isFightPhase = this.phase === "FIGHT";
    const disabled = !isFightPhase || !isPlayerTurn;

    const activePlayer = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
    const canShield = !disabled && activePlayer.coins >= 25;
    const canDouble = !disabled && activePlayer.coins >= 30;

    return [
      {
        components: [
          { id: "hit", label: "Attack", emoji: "⚔️", style: "primary", disabled },
          { id: "heavy", label: "Heavy Attack", emoji: "💥", style: "primary", disabled },
          { id: "heal", label: "Heal (+15-25 HP)", emoji: "💚", style: "success", disabled },
        ],
      },
      {
        components: [
          { id: "shield", label: "Shield (25¢)", emoji: "🛡️", style: "secondary", disabled: !canShield },
          { id: "double", label: "2x Damage (30¢)", emoji: "⚡", style: "secondary", disabled: !canDouble },
          { id: "surrender", label: "Surrender", emoji: "🏳️", style: "danger", disabled: !isFightPhase },
        ],
      },
    ];
  }

  /**
   * Renders the current fight arena card as a PNG buffer.
   */
  public async renderCard(): Promise<Buffer> {
    if (this.phase === "REQUEST") {
      return RenderFight.renderRequestCard(this.p1, this.p2);
    }
    if (this.phase === "ENDED" && this.winner) {
      return RenderFight.renderOutcomeCard(this.winner, this.loser, this.endReason);
    }
    return RenderFight.renderBattleCard(this.p1, this.p2, this.currentTurnId, this.lastAnnouncement);
  }

  /**
   * Renders the current fight card as a Data URL string.
   */
  public async renderDataURL(): Promise<string> {
    const buffer = await this.renderCard();
    return WekyCanvas.toDataURL(buffer);
  }
}
