import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, GuildMember, Interaction, MediaGalleryBuilder, MessageFlags, User } from "discord.js";
import { BossProfile, FIGHT_BOSSES, FightAI } from "../ai/FightBosses.js";
import { FightPlayerInfo, RenderFight } from "../canvas/RenderFight.js";
import { BaseGame } from "../core/BaseGame.js";
import { ContextAdapter } from "../core/ContextAdapter.js";
import { FightTypes } from "../core/Types.js";
import { getRandomString } from "../utils/Helpers.js";

export class Fight extends BaseGame<FightTypes> {
  private opponentUser: User | null = null;
  private opponentMember: GuildMember | null = null;
  private phase: "REQUEST" | "FIGHT" | "ENDED" = "REQUEST";
  private isVsBoss: boolean = false;
  private bossProfile: BossProfile | null = null;

  // Player Stats
  private p1: FightPlayerInfo;
  private p2: FightPlayerInfo;
  private currentTurnId: string;
  private btnPrefix: string;
  private lastAnnouncement: string = "Choose your action!";

  constructor(manager: any, options: FightTypes) {
    super(manager, options, "fight");
    this.btnPrefix = getRandomString(6, "fight_");
    this.defaultColor = this.resolveColor(options.embed?.color, 0xed4245);

    const startHp = options.startHealth ?? 100;
    const startCoins = options.coins ?? 20;

    this.p1 = {
      id: this.ctx.userId,
      username: this.ctx.user.username,
      avatarUrl: this.ctx.user.displayAvatarURL({ extension: "png", size: 128 }),
      health: startHp,
      maxHealth: startHp,
      coins: startCoins,
      lastAction: "Challenged opponent",
      activeEffects: [],
    };

    const opp = options.opponent;
    const isBotOrOmitted = !opp || (opp instanceof GuildMember ? opp.user.bot : (opp as User).bot) || options.ai || options.boss;

    if (isBotOrOmitted) {
      this.isVsBoss = true;
      const bossKey = options.boss || "dragon";
      this.bossProfile = FIGHT_BOSSES[bossKey] || FIGHT_BOSSES["dragon"];

      this.p2 = {
        id: "weky_boss",
        username: this.bossProfile.name,
        avatarUrl: this.bossProfile.avatarUrl,
        health: this.bossProfile.maxHealth,
        maxHealth: this.bossProfile.maxHealth,
        coins: this.bossProfile.coins,
        lastAction: this.bossProfile.title,
        activeEffects: [],
      };
    } else {
      if (opp instanceof GuildMember) {
        this.opponentMember = opp;
        this.opponentUser = opp.user;
      } else {
        this.opponentUser = opp as User;
      }

      this.p2 = {
        id: this.opponentUser.id,
        username: this.opponentUser.username,
        avatarUrl: this.opponentUser.displayAvatarURL({ extension: "png", size: 128 }),
        health: startHp,
        maxHealth: startHp,
        coins: startCoins,
        lastAction: "Awaiting start",
        activeEffects: [],
      };
    }

    this.currentTurnId = this.p1.id;
    this.defaultTimeout = options.time || manager?.defaultTimeout || 60_000;
  }

  public async start(): Promise<void> {
    if (!this.isVsBoss && this.opponentUser && this.opponentUser.id === this.ctx.userId) {
      const msg = this.options.cannotFightYourselfMessage || "❌ You cannot fight against yourself!";
      const container = this.createContainer(0xff0000).addTextDisplayComponents((t) => t.setContent(`## ❌ Error\n> ${msg}`));
      await this.ctx.sendInitial({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    this.isActive = true;
    this.manager._eventManager.register(this);
    this.emitStart();

    if (this.isVsBoss && this.bossProfile) {
      // Jump directly into battle with Boss intro!
      this.phase = "FIGHT";
      this.currentTurnId = this.p1.id;
      this.lastAnnouncement = this.bossProfile.dialogueIntro;
      await this.updateBattleInterface();
      this.resetTimeout(() => this.endGame("TIMEOUT"));
      return;
    }

    // Render Request Card for PvP
    const buffer = await RenderFight.renderRequestCard({ username: this.p1.username, avatarUrl: this.p1.avatarUrl }, { username: this.p2.username, avatarUrl: this.p2.avatarUrl });
    const attachment = new AttachmentBuilder(buffer, { name: "fight-request.png" });

    const container = this.createGameContainer("request", { image: "fight-request.png" });

    await this.ctx.sendInitial({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame("TIMEOUT"));
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton() || !this.isActive) return;
    if (interaction.message.id !== this.ctx.gameMessage?.id) return;

    const customId = interaction.customId;
    if (!customId.startsWith(this.btnPrefix)) return;

    const action = customId.replace(this.btnPrefix, "");

    // Phase 1: REQUEST Interactions
    if (this.phase === "REQUEST") {
      if (action === "accept") {
        if (interaction.user.id !== this.p2.id) {
          const wrongMsg = this.options.wrongUserFight || "Only the challenged opponent can accept this duel!";
          ContextAdapter.replyEphemeral(interaction, wrongMsg);
          return;
        }
        await interaction.deferUpdate().catch(() => {});
        await this.startBattle();
        return;
      }

      if (action === "deny") {
        if (interaction.user.id !== this.p2.id && interaction.user.id !== this.p1.id) {
          ContextAdapter.replyEphemeral(interaction, "You are not part of this duel challenge!");
          return;
        }
        await interaction.deferUpdate().catch(() => {});
        await this.endGame("DENIED");
        return;
      }
    }

    // Phase 2: FIGHT Interactions
    if (this.phase === "FIGHT") {
      if (interaction.user.id !== this.p1.id && interaction.user.id !== this.p2.id) {
        const wrongMsg = this.options.wrongUserFight || "You are not participating in this battle!";
        ContextAdapter.replyEphemeral(interaction, wrongMsg);
        return;
      }

      if (action !== "surrender" && interaction.user.id !== this.currentTurnId) {
        const waitMsg = this.options.opponentsTurnMessage || "Please wait for your opponent's move!";
        ContextAdapter.replyEphemeral(interaction, waitMsg);
        return;
      }

      await interaction.deferUpdate().catch(() => {});
      this.resetTimeout(() => this.endGame("TIMEOUT"));

      const activeFighter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
      const targetFighter = this.currentTurnId === this.p1.id ? this.p2 : this.p1;

      if (action === "hit") {
        this.handleHit(activeFighter, targetFighter, false);
      } else if (action === "heavy") {
        this.handleHit(activeFighter, targetFighter, true);
      } else if (action === "heal") {
        this.handleHeal(activeFighter);
      } else if (action === "shield") {
        this.handleShield(activeFighter);
      } else if (action === "double") {
        this.handleDoubleDamage(activeFighter);
      } else if (action === "surrender") {
        const surrenderingP = interaction.user.id === this.p1.id ? this.p1 : this.p2;
        const winnerP = interaction.user.id === this.p1.id ? this.p2 : this.p1;
        await this.endGame("SURRENDER", winnerP, surrenderingP);
        return;
      }

      if (targetFighter.health <= 0) {
        await this.endGame("WIN", activeFighter, targetFighter);
        return;
      }

      if (this.isVsBoss) {
        // AI Boss Turn Execution
        const bossAction = FightAI.decideAction(this.p2, this.p1, this.bossProfile || undefined);
        const playerAnnouncement = this.lastAnnouncement;

        if (bossAction === "special" && this.bossProfile) {
          const res = this.bossProfile.specialMoveEffect(this.p2, this.p1);
          this.p2.lastAction = this.bossProfile.specialMoveName;
          this.lastAnnouncement = `${playerAnnouncement}\n\n${res.message}`;
        } else if (bossAction === "heavy") {
          this.handleHit(this.p2, this.p1, true);
          this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
        } else if (bossAction === "heal") {
          this.handleHeal(this.p2);
          this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
        } else if (bossAction === "shield") {
          this.handleShield(this.p2);
          this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
        } else {
          this.handleHit(this.p2, this.p1, false);
          this.lastAnnouncement = `${playerAnnouncement}\n\n${this.lastAnnouncement}`;
        }

        if (this.p1.health <= 0) {
          await this.endGame("WIN", this.p2, this.p1);
          return;
        }

        this.currentTurnId = this.p1.id;
        await this.updateBattleInterface();
        return;
      }

      this.currentTurnId = targetFighter.id;
      await this.updateBattleInterface();
    }
  }

  private async startBattle(): Promise<void> {
    this.phase = "FIGHT";
    this.currentTurnId = Math.random() < 0.5 ? this.p1.id : this.p2.id;
    const starter = this.currentTurnId === this.p1.id ? this.p1 : this.p2;
    this.lastAnnouncement = `The duel begins! It's ${starter.username}'s turn!`;
    await this.updateBattleInterface();
  }

  private handleHit(attacker: FightPlayerInfo, defender: FightPlayerInfo, isHeavy: boolean): void {
    const isBoss = attacker.id === "weky_boss" && this.bossProfile;
    let minDmg = 12;
    let maxDmg = this.options.damageMax ?? 20;

    if (isBoss && this.bossProfile) {
      minDmg = this.bossProfile.damageMin;
      maxDmg = this.bossProfile.damageMax;
    }

    let damage = 0;
    if (isHeavy) {
      const missChance = isBoss ? 0.08 : 0.14;
      if (Math.random() < missChance) {
        attacker.lastAction = "Missed Heavy Attack!";
        this.lastAnnouncement = `💨 **${attacker.username}** swung hard but missed!`;
        attacker.coins += 5;
        return;
      }
      if (isBoss && this.bossProfile) {
        damage = Math.floor(Math.random() * (Math.round(maxDmg * 1.35) - Math.round(minDmg * 1.35) + 1)) + Math.round(minDmg * 1.35);
      } else {
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 dmg
      }
    } else {
      damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
    }

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
    this.lastAnnouncement = `💥 **${attacker.username}** used ${isHeavy ? "Heavy Attack" : "Normal Attack"} dealing **${damage}** damage!`;
  }

  private handleHeal(player: FightPlayerInfo): void {
    const maxHp = player.maxHealth || 100;
    if (player.health >= maxHp * 0.85) {
      const highHpMsg = this.options.highHealthMessage || "You cannot heal if your HP is above 85%!";
      this.lastAnnouncement = `⚠️ **${player.username}** tried to heal: ${highHpMsg}`;
      player.lastAction = "Heal failed (High HP)";
      return;
    }

    const healAmount = Math.floor(Math.random() * 11) + 16; // 16-26 HP
    player.health = Math.min(maxHp, player.health + healAmount);
    player.coins += 5;
    player.lastAction = `Healed +${healAmount} HP`;
    this.lastAnnouncement = `💚 **${player.username}** healed for **+${healAmount} HP**!`;
  }

  private handleShield(player: FightPlayerInfo): void {
    if (player.coins < 25) {
      this.lastAnnouncement = `❌ Not enough coins for a Shield! (Cost: 25, You have: ${player.coins})`;
      return;
    }
    player.coins -= 25;
    if (!player.activeEffects) player.activeEffects = [];
    if (!player.activeEffects.includes("Shield")) player.activeEffects.push("Shield");
    player.lastAction = "Activated Shield";
    const shieldReply = this.options.powerups?.shield?.replyMessage ? this.options.powerups.shield.replyMessage.replace("{{username}}", player.username) : `🛡️ **${player.username}** activated a **Shield** (-50% next incoming damage)!`;
    this.lastAnnouncement = shieldReply;
  }

  private handleDoubleDamage(player: FightPlayerInfo): void {
    if (player.coins < 30) {
      this.lastAnnouncement = `❌ Not enough coins for 2x Damage! (Cost: 30, You have: ${player.coins})`;
      return;
    }
    player.coins -= 30;
    if (!player.activeEffects) player.activeEffects = [];
    if (!player.activeEffects.includes("2x Damage")) player.activeEffects.push("2x Damage");
    player.lastAction = "Activated 2x DMG";
    const dmgReply = this.options.powerups?.doubleDamage?.replyMessage ? this.options.powerups.doubleDamage.replyMessage.replace("{{username}}", player.username) : `⚡ **${player.username}** activated **Double Damage** on next attack!`;
    this.lastAnnouncement = dmgReply;
  }

  private async updateBattleInterface(): Promise<void> {
    const buffer = await RenderFight.renderBattleCard(this.p1, this.p2, this.currentTurnId, this.lastAnnouncement);
    const attachment = new AttachmentBuilder(buffer, { name: "fight-arena.png" });

    const container = this.createGameContainer("active", {
      image: "fight-arena.png",
      turnId: this.currentTurnId,
      announcement: this.lastAnnouncement,
    });

    if (!this.ctx.gameMessage) {
      await this.ctx.sendInitial({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
      });
    } else {
      await this.ctx.edit({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  private async endGame(reason: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT", winner?: FightPlayerInfo, loser?: FightPlayerInfo): Promise<void> {
    this.phase = "ENDED";
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    const winnerData = winner || (this.p1.health > this.p2.health ? this.p1 : this.p2);
    const loserData = loser || (winnerData.id === this.p1.id ? this.p2 : this.p1);

    // Determine the outcome from the perspective of the initiator (this.ctx.user / this.p1):
    let outcome: string = reason;
    if (reason === "WIN") {
      outcome = winnerData.id === this.p1.id ? "WIN" : "LOSE";
    } else if (reason === "SURRENDER") {
      outcome = winnerData.id === this.p1.id ? "WIN" : "LOSE";
    }

    this.emitEnd(outcome, outcome === "WIN" ? 1 : 0, {
      winner: winnerData,
      loser: loserData,
    });

    const buffer = await RenderFight.renderOutcomeCard({ username: winnerData.username, avatarUrl: winnerData.avatarUrl }, loserData ? { username: loserData.username, avatarUrl: loserData.avatarUrl } : undefined, reason);
    const attachment = new AttachmentBuilder(buffer, { name: "fight-outcome.png" });

    const stateKey = reason === "WIN" ? "won" : reason === "SURRENDER" ? "surrender" : reason === "DENIED" ? "deny" : "timeout";
    const container = this.createGameContainer(stateKey, {
      image: "fight-outcome.png",
      winnerId: winnerData.id,
      loserId: loserData?.id,
    });

    if (!this.ctx.gameMessage) {
      await this.ctx.sendInitial({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
      });
    } else {
      await this.ctx.edit({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  private createGameContainer(state: "request" | "active" | "won" | "surrender" | "deny" | "timeout" | "error", details?: { image?: string; error?: string; turnId?: string; announcement?: string; winnerId?: string; loserId?: string }): ContainerBuilder {
    const stateColors: Record<string, number> = {
      request: 0xfee75c,
      active: this.defaultColor,
      won: 0x57f287,
      surrender: 0xed4245,
      deny: 0xed4245,
      timeout: 0x99aab5,
      error: 0xff0000,
    };
    const container = this.createContainer(stateColors[state]);
    let content = "";

    const formatFighterName = (id?: string) => {
      if (!id) return "Unknown";
      if (id === "weky_boss") return `**${this.p2.username} (Boss)**`;
      return `<@${id}>`;
    };

    switch (state) {
      case "request":
        content = this.options.states?.request ? this.options.states.request.replace("{{challengerMention}}", `<@${this.p1.id}>`).replace("{{opponentMention}}", formatFighterName(this.p2.id)) : `## ⚔️ Challenge!\n> <@${this.p1.id}> challenged ${formatFighterName(this.p2.id)} to a duel!`;
        break;

      case "active":
        const turnText = formatFighterName(details?.turnId || this.currentTurnId);
        content = this.options.states?.active ? this.options.states.active : `## ⚔️ Fighting...\n> 🎯 **Turn:** ${turnText}\n> ${details?.announcement || this.lastAnnouncement}`;
        break;

      case "won":
        const winnerName = formatFighterName(details?.winnerId || this.p1.id);
        const loserName = formatFighterName(details?.loserId || this.p2.id);
        content = this.options.states?.won ? this.options.states.won : `## 🏆 Fight Ended\n> 🏆 ${winnerName} knocked out ${loserName} and won the duel!`;
        break;

      case "surrender":
        const surrLoser = formatFighterName(details?.loserId || this.p2.id);
        const surrWinner = formatFighterName(details?.winnerId || this.p1.id);
        content = this.options.states?.surrender ? this.options.states.surrender : `## 🏳️ Surrendered\n> 🏳️ ${surrLoser} surrendered! ${surrWinner} is victorious!`;
        break;

      case "deny":
        content = this.options.states?.deny ? this.options.states.deny : `## 🚫 Denied\n> The challenge was declined.`;
        break;

      case "timeout":
        content = this.options.states?.timeout ? this.options.states.timeout : `## ⏱️ Time's Up\n> The duel timed out due to inactivity.`;
        break;

      case "error":
        content = this.options.states?.error?.main ? this.options.states.error.main.replace("{{error}}", details?.error || "Unknown error.") : `## ❌ Error\n> ${details?.error || "Unknown error."}`;
        break;
    }

    content = this.applyEmbedDecorations(container, content);
    container.addTextDisplayComponents((t) => t.setContent(content));

    if (details?.image) {
      const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }

    if (state === "request") {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}accept`)
          .setLabel(this.options.buttons?.accept || "Accept Duel")
          .setEmoji("⚔️")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}deny`)
          .setLabel(this.options.buttons?.deny || "Decline")
          .setEmoji("✖️")
          .setStyle(ButtonStyle.Danger),
      );
      container.addActionRowComponents(row);
    } else if (state === "active") {
      const active = this.currentTurnId === this.p1.id ? this.p1 : this.p2;

      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}hit`)
          .setLabel(this.options.buttons?.hit || "Hit")
          .setEmoji("🗡️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}heavy`)
          .setLabel(this.options.buttons?.heavy || "Heavy Attack")
          .setEmoji("🪓")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}heal`)
          .setLabel(this.options.buttons?.heal || "Heal")
          .setEmoji("💚")
          .setStyle(ButtonStyle.Success)
          .setDisabled(active.health >= 85),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}surrender`)
          .setLabel(this.options.buttons?.cancel || "Surrender")
          .setEmoji("🏳️")
          .setStyle(ButtonStyle.Secondary),
      );

      const shieldLabel = this.options.powerups?.shield?.label || "Shield (25¢)";
      const doubleLabel = this.options.powerups?.doubleDamage?.label || "2x DMG (30¢)";

      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}shield`)
          .setLabel(shieldLabel)
          .setEmoji("🛡️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(active.coins < 25),
        new ButtonBuilder()
          .setCustomId(`${this.btnPrefix}double`)
          .setLabel(doubleLabel)
          .setEmoji("⚡")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(active.coins < 30),
      );

      container.addActionRowComponents(row1);
      container.addActionRowComponents(row2);
    }

    return container;
  }
}
