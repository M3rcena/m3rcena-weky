import { Canvas, SKRSContext2D } from "@napi-rs/canvas";
import { CanvasUtils } from "./CanvasUtils.js";

export interface FightPlayerInfo {
  id: string;
  username: string;
  avatarUrl: string;
  health: number;
  maxHealth?: number;
  coins: number;
  lastAction?: string;
  activeEffects?: string[];
}

export interface FightCardCustomTexts {
  title?: string;
  subtitle?: string;
  vsText?: string;
  hpLabel?: string;
  coinLabel?: string;
}

export class RenderFight {
  /**
   * Sanitizes text for Canvas rendering by stripping markdown asterisks,
   * resolving Discord user mentions into actual usernames, and removing
   * unicode emoji sequences that cause missing glyph '▯' (tofu) boxes.
   */
  public static cleanText(text: string, players: { id?: string; username: string }[] = []): string {
    if (!text) return "";
    let clean = text;

    // Resolve <@userId> mentions to username
    for (const p of players) {
      if (p.id) {
        clean = clean.replace(new RegExp(`<@!?${p.id}>`, "g"), p.username);
      }
    }
    clean = clean.replace(/<@!?\d+>/g, "@Player");

    // Strip markdown bold, italic, code, underline, strike
    clean = clean.replace(/\*\*(.*?)\*\*/g, "$1");
    clean = clean.replace(/\*(.*?)\*/g, "$1");
    clean = clean.replace(/__(.*?)__/g, "$1");
    clean = clean.replace(/~~(.*?)~~/g, "$1");
    clean = clean.replace(/`(.*?)`/g, "$1");

    // Strip emoji characters that cause tofu boxes on canvas
    clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu, "");

    return clean.replace(/\s+/g, " ").trim();
  }

  /**
   * Renders the initial Fight Challenge / Request card.
   */
  public static async renderRequestCard(challenger: { username: string; avatarUrl: string }, opponent: { username: string; avatarUrl: string }, customTexts?: FightCardCustomTexts): Promise<Buffer> {
    const W = 900;
    const H = 520;
    const canvas = new Canvas(W, H);
    const ctx = canvas.getContext("2d");

    // Cyber Arena Background
    const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
    bg.addColorStop(0, "#161b26");
    bg.addColorStop(0.65, "#0d1017");
    bg.addColorStop(1, "#07080c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Tech Grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
    ctx.lineWidth = 1;
    for (let x = 40; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 40; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Outer Neon Glow Frame
    CanvasUtils.fillRoundedRect(ctx, 24, 24, W - 48, H - 48, 24, "rgba(255,255,255,0.015)", "rgba(0, 245, 160, 0.25)", 1.5);

    // Header Title
    ctx.save();
    ctx.font = "bold 38px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#00f5a0";
    ctx.shadowColor = "rgba(0, 245, 160, 0.6)";
    ctx.shadowBlur = 18;
    const reqTitle = CanvasUtils.cleanText(customTexts?.title || "DUEL CHALLENGE");
    ctx.fillText(reqTitle, W / 2, 75);
    ctx.restore();

    // Avatars
    await CanvasUtils.drawCircularAvatar(ctx, challenger.avatarUrl, 230, 240, 80, "#00f5a0", 5);
    await CanvasUtils.drawCircularAvatar(ctx, opponent.avatarUrl, 670, 240, 80, "#ff2d55", 5);

    // Center "VS" Shield
    const vsX = W / 2;
    const vsY = 240;
    CanvasUtils.fillRoundedRect(ctx, vsX - 44, vsY - 44, 88, 88, 20, "#121620", "rgba(255, 255, 255, 0.2)", 2);
    ctx.save();
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowBlur = 12;
    const vsText = CanvasUtils.cleanText(customTexts?.vsText || "VS");
    ctx.fillText(vsText, vsX, vsY + 2);
    ctx.restore();

    // Player Cards
    const drawPlayerInfo = (name: string, role: string, x: number, color: string) => {
      CanvasUtils.fillRoundedRect(ctx, x - 130, 345, 260, 68, 16, "rgba(18, 22, 30, 0.85)", color, 1.5);
      CanvasUtils.drawBadge(ctx, role, x - 55, 355, 110, 22, color, "#000000", "bold 11px sans-serif");

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const truncated = name.length > 15 ? name.slice(0, 14) + "…" : name;
      ctx.fillText(truncated, x, 396);
    };

    drawPlayerInfo(challenger.username, "CHALLENGER", 230, "#00f5a0");
    drawPlayerInfo(opponent.username, "OPPONENT", 670, "#ff2d55");

    // Footer prompt
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const reqSub = CanvasUtils.cleanText(customTexts?.subtitle || "Awaiting opponent to accept duel...");
    ctx.fillText(reqSub, W / 2, 455);

    return canvas.toBuffer("image/png");
  }

  /**
   * Renders the dynamic Battle Arena card with health bars, coins, and current turn indicators.
   */
  public static async renderBattleCard(
    player1: FightPlayerInfo,
    player2: FightPlayerInfo,
    currentTurnUserId: string,
    announcement: string = "Battle in progress!",
    customTexts?: FightCardCustomTexts
  ): Promise<Buffer> {
    const W = 900;
    const H = 620;
    const canvas = new Canvas(W, H);
    const ctx = canvas.getContext("2d");

    // Dark Cyber Arena Background
    const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 580);
    bg.addColorStop(0, "#161b24");
    bg.addColorStop(0.65, "#0e1118");
    bg.addColorStop(1, "#07090d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle arena grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    for (let x = 40; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Announcement Banner (Top)
    const cleanAnnouncement = this.cleanText(customTexts?.title || announcement, [player1, player2]) || "Duel in progress!";
    CanvasUtils.fillRoundedRect(ctx, 40, 24, W - 80, 60, 16, "rgba(18, 22, 30, 0.88)", "rgba(255, 255, 255, 0.12)", 1.5);

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
    ctx.shadowBlur = 8;
    const truncatedAnnouncement = cleanAnnouncement.length > 68 ? cleanAnnouncement.slice(0, 66) + "…" : cleanAnnouncement;
    ctx.fillText(truncatedAnnouncement, W / 2, 54);
    ctx.restore();

    // Render Both Combatants
    const isP1Turn = player1.id === currentTurnUserId;
    const isP2Turn = player2.id === currentTurnUserId;

    await this.drawFighterPanel(ctx, player1, 45, 110, 365, 475, isP1Turn, "#00f5a0", customTexts);
    await this.drawFighterPanel(ctx, player2, 490, 110, 365, 475, isP2Turn, "#ff2d55", customTexts);

    // Center "VS" Shield
    const vsX = W / 2;
    const vsY = 340;
    CanvasUtils.fillRoundedRect(ctx, vsX - 32, vsY - 32, 64, 64, 16, "#121620", "rgba(255, 255, 255, 0.2)", 1.5);
    ctx.save();
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const vsLabel = CanvasUtils.cleanText(customTexts?.vsText || "VS");
    ctx.fillText(vsLabel, vsX, vsY + 1);
    ctx.restore();

    return canvas.toBuffer("image/png");
  }

  private static async drawFighterPanel(ctx: SKRSContext2D, player: FightPlayerInfo, x: number, y: number, w: number, h: number, isTurn: boolean, themeColor: string, customTexts?: FightCardCustomTexts): Promise<void> {
    const borderColor = isTurn ? themeColor : "rgba(255, 255, 255, 0.08)";
    const borderWidth = isTurn ? 2.5 : 1;

    // Panel card background
    CanvasUtils.fillRoundedRect(ctx, x, y, w, h, 22, "rgba(16, 20, 28, 0.9)", borderColor, borderWidth);

    // Active Turn Glow & Pill Badge
    if (isTurn) {
      ctx.save();
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 14;
      CanvasUtils.drawBadge(ctx, "ACTIVE TURN", x + w / 2 - 65, y + 18, 130, 26, themeColor, "#000000", "bold 12px sans-serif");
      ctx.restore();
    }

    // Avatar
    const avatarY = y + (isTurn ? 104 : 85);
    await CanvasUtils.drawCircularAvatar(ctx, player.avatarUrl, x + w / 2, avatarY, 52, isTurn ? themeColor : "rgba(255,255,255,0.2)", 3);

    // Username
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const nameY = avatarY + 74;
    const truncated = player.username.length > 15 ? player.username.slice(0, 14) + "…" : player.username;
    ctx.fillText(truncated, x + w / 2, nameY);

    // Health Bar Container (Scaled to maxHealth)
    const maxHp = player.maxHealth || 100;
    const currentHp = Math.max(0, Math.min(maxHp, player.health));
    const hpRatio = maxHp > 0 ? currentHp / maxHp : 0;
    const hpY = nameY + 28;
    const barW = w - 44;
    const barX = x + 22;
    const barH = 26;

    // Track background
    CanvasUtils.fillRoundedRect(ctx, barX, hpY, barW, barH, 13, "#212530", "rgba(255,255,255,0.06)", 1);

    // Dynamic gradient HP fill
    if (currentHp > 0) {
      const fillW = Math.max(barH, barW * hpRatio);
      const hpGrad = ctx.createLinearGradient(barX, hpY, barX + fillW, hpY);
      if (hpRatio > 0.5) {
        hpGrad.addColorStop(0, "#00f5a0");
        hpGrad.addColorStop(1, "#00b862");
      } else if (hpRatio > 0.25) {
        hpGrad.addColorStop(0, "#ffb700");
        hpGrad.addColorStop(1, "#ff7700");
      } else {
        hpGrad.addColorStop(0, "#ff2d55");
        hpGrad.addColorStop(1, "#c00028");
      }
      CanvasUtils.fillRoundedRect(ctx, barX, hpY, fillW, barH, 13, hpGrad);
    }

    // Health Text
    const hpLabel = CanvasUtils.cleanText(customTexts?.hpLabel || "HP");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${currentHp} / ${maxHp} ${hpLabel}`, x + w / 2, hpY + barH / 2 + 1);

    // Coins Counter (Vector Coin - No Tofu Box!)
    const statsY = hpY + 48;
    const coinLabel = CanvasUtils.cleanText(customTexts?.coinLabel || "Coins");
    const coinStr = `${player.coins} ${coinLabel}`;
    ctx.font = "bold 16px sans-serif";
    const textW = ctx.measureText(coinStr).width;
    const totalCoinW = 20 + 8 + textW;
    const coinStartX = x + (w - totalCoinW) / 2;

    CanvasUtils.drawCoinIcon(ctx, coinStartX + 10, statsY, 10);
    ctx.fillStyle = "#ffd700";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(coinStr, coinStartX + 26, statsY);

    // Last Action Box
    const actionY = statsY + 30;
    CanvasUtils.fillRoundedRect(ctx, barX, actionY, barW, 44, 12, "rgba(255, 255, 255, 0.03)", "rgba(255,255,255,0.07)", 1);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cleanAction = this.cleanText(player.lastAction || "Awaiting action...", [player]);
    ctx.fillText(cleanAction, x + w / 2, actionY + 22);

    // Active Buffs / Effects
    if (player.activeEffects && player.activeEffects.length > 0) {
      const effectY = actionY + 54;
      const cleanEffects = player.activeEffects.map((e) => this.cleanText(e, [player])).join(" • ");
      CanvasUtils.fillRoundedRect(ctx, barX, effectY - 12, barW, 26, 8, "rgba(0, 247, 255, 0.1)", "rgba(0, 247, 255, 0.35)", 1);
      ctx.fillStyle = "#00f7ff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`BUFF: ${cleanEffects}`, x + w / 2, effectY + 1);
    }
  }

  /**
   * Renders the Victory or Game Over card.
   */
  public static async renderOutcomeCard(winner: { username: string; avatarUrl: string }, loser?: { username: string; avatarUrl: string }, type: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT" = "WIN", customTexts?: FightCardCustomTexts): Promise<Buffer> {
    const W = 900;
    const H = 540;
    const canvas = new Canvas(W, H);
    const ctx = canvas.getContext("2d");

    // Dynamic background
    const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 540);
    if (type === "WIN") {
      bg.addColorStop(0, "#122618");
      bg.addColorStop(0.65, "#0b140e");
      bg.addColorStop(1, "#060807");
    } else if (type === "SURRENDER") {
      bg.addColorStop(0, "#281b10");
      bg.addColorStop(0.65, "#140e08");
      bg.addColorStop(1, "#080706");
    } else {
      bg.addColorStop(0, "#261318");
      bg.addColorStop(0.65, "#140a0d");
      bg.addColorStop(1, "#080607");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle arena grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    for (let x = 40; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Outer neon border
    const themeColor = type === "WIN" ? "#00f5a0" : type === "SURRENDER" ? "#ffb700" : "#ff2d55";
    CanvasUtils.fillRoundedRect(ctx, 24, 24, W - 48, H - 48, 24, "rgba(255,255,255,0.015)", themeColor, 1.5);

    // Title Banner
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let titleText = customTexts?.title || (type === "SURRENDER" ? "SURRENDER" : type === "DENIED" ? "CHALLENGE DECLINED" : type === "TIMEOUT" ? "TIME'S UP" : "VICTORY");
    let subtitleText = customTexts?.subtitle || (type === "SURRENDER" ? "The opponent surrendered." : type === "DENIED" ? "The duel invitation was rejected." : type === "TIMEOUT" ? "The duel timed out due to inactivity." : "Wins the battle!");

    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 22;
    ctx.fillStyle = themeColor;
    ctx.font = "bold 52px sans-serif";
    ctx.fillText(titleText, W / 2, 85);
    ctx.restore();

    if (type === "WIN" || type === "SURRENDER") {
      // Winner Avatar
      await CanvasUtils.drawCircularAvatar(ctx, winner.avatarUrl, W / 2, 250, 90, themeColor, 6);

      // Winner Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(winner.username, W / 2, 380);

      // Subtitle
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "20px sans-serif";
      ctx.fillText(subtitleText, W / 2, 422);
    } else {
      // Denied / Timeout layout
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(subtitleText, W / 2, 280);
    }

    return canvas.toBuffer("image/png");
  }
}
