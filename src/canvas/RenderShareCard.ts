/**
 * "Share & Flex" Gamer Score Card Generator
 * Generates an eSports-grade holographic match victory / performance pass using @napi-rs/canvas.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { createCanvas, SKRSContext2D } from "@napi-rs/canvas";
import { CanvasUtils } from "./CanvasUtils.js";

export interface ShareCardStat {
  label: string;
  value: string;
  color?: string;
}

export interface ShareCardCustomTexts {
  /** Verified stamp in top right (default: "VERIFIED COMPETITIVE MATCH") */
  verifiedStamp?: string;
  /** Subtitle under avatar (default: "WEKY AUTHENTICATED") */
  authenticatedSub?: string;
  /** Label for top right highlight box (default: "PRIMARY HIGHLIGHT") */
  primaryHighlight?: string;
  /** Bottom footer watermark (default: "WEKY-PASSPORT • AUTHENTICATED BY @M3RCENA/WEKY ENGINE") */
  footer?: string;
}

export interface RenderShareCardOptions {
  /** The player's username */
  username: string;
  /** Avatar image URL */
  avatarUrl?: string;
  /** Minigame title or discipline (e.g. "Snake Arcade", "Fight RPG", "TicTacToe") */
  gameName: string;
  /** Main outcome or highlight (e.g. "VICTORY 👑", "HIGH SCORE 🌟", "MATCH COMPLETE") */
  headline?: string;
  /** Primary metric (e.g. "28,450 PTS" or "VICTORY (+32 ELO)") */
  primaryScore: string;
  /** Rank badge or tier (e.g. "GRANDMASTER", "DIAMOND TIER", "ARCADE PRO") */
  rankBadge?: string;
  /** Additional 2 to 4 key statistics to display in the metric grid */
  stats?: ShareCardStat[];
  /** Optional custom theme accent color (hex) */
  accentColor?: string;
  /** Optional custom text labels */
  texts?: ShareCardCustomTexts;
}

export class RenderShareCard {
  public static async render(options: RenderShareCardOptions): Promise<Buffer> {
    const width = 840;
    const height = 480;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const accent = options.accentColor || "#00f7ff";
    const padding = 28;

    // 1. Deep Cyberpunk Dark Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#070a12");
    bgGrad.addColorStop(0.45, "#0d1526");
    bgGrad.addColorStop(1, "#05070d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Radial Ambient Aura from Left
    const leftAura = ctx.createRadialGradient(160, 220, 20, 160, 220, 280);
    leftAura.addColorStop(0, "rgba(0, 247, 255, 0.12)");
    leftAura.addColorStop(0.6, "rgba(88, 101, 242, 0.05)");
    leftAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = leftAura;
    ctx.fillRect(0, 0, width, height);

    // Subtle Hex & Tech Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer Neon Border Frame with Rounded Edges
    CanvasUtils.fillRoundedRect(ctx, 14, 14, width - 28, height - 28, 20, "transparent", accent, 1.8);

    // Corner Decorative Brackets
    const drawBracket = (cx: number, cy: number, dx: number, dy: number) => {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * 16);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * 16, cy);
      ctx.stroke();
    };
    drawBracket(24, 24, 1, 1);
    drawBracket(width - 24, 24, -1, 1);
    drawBracket(24, height - 24, 1, -1);
    drawBracket(width - 24, height - 24, -1, -1);

    // 2. Header Bar
    // Discipline Pill
    CanvasUtils.fillRoundedRect(ctx, padding + 16, padding + 2, 170, 28, 14, "rgba(88, 101, 242, 0.22)", "#5865f2", 1.2);
    ctx.fillStyle = "#5865f2";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(options.gameName.toUpperCase(), padding + 16 + 170 / 2, padding + 16);

    // Verified Match Stamp with Checkmark
    const verifiedText = CanvasUtils.cleanText(options.texts?.verifiedStamp || "VERIFIED COMPETITIVE MATCH");
    ctx.font = "bold 12px sans-serif";
    const textWidth = ctx.measureText(verifiedText).width;
    const textRight = width - padding - 18;
    const textLeft = textRight - textWidth;
    CanvasUtils.drawCheckmarkIcon(ctx, textLeft - 13, padding + 16, 7, "#57f287", "#070a12");

    ctx.fillStyle = "#57f287";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(verifiedText, textRight, padding + 16);

    // Headline
    const headline = CanvasUtils.cleanText(options.headline || "MATCH PERFORMANCE PASS");
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
    ctx.shadowBlur = 10;
    ctx.fillText(headline, padding + 16, padding + 58);
    ctx.restore();

    // 3. Left Column: Player Identity Card
    const profileW = 230;
    const profileH = 320;
    const profileX = padding + 16;
    const profileY = padding + 85;

    CanvasUtils.fillRoundedRect(ctx, profileX, profileY, profileW, profileH, 16, "rgba(16, 22, 36, 0.75)", "rgba(255, 255, 255, 0.08)", 1.2);

    // Large Circular Avatar with Neon Ring
    const avatarX = profileX + profileW / 2;
    const avatarY = profileY + 75;
    const avatarRadius = 52;

    if (options.avatarUrl) {
      await CanvasUtils.drawCircularAvatar(ctx, options.avatarUrl, avatarX, avatarY, avatarRadius, accent, 4);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#252b38";
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }

    // Player Username
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const maxName = 14;
    const rawUser = CanvasUtils.cleanText(options.username) || options.username;
    const displayName = rawUser.length > maxName ? rawUser.slice(0, maxName - 1) + "…" : rawUser;
    ctx.fillText(displayName, avatarX, avatarY + avatarRadius + 26);

    // Rank Badge Pill
    const rawBadge = CanvasUtils.cleanText(options.rankBadge || "ARCADE PRO") || "ARCADE PRO";
    CanvasUtils.fillRoundedRect(ctx, avatarX - 75, avatarY + avatarRadius + 46, 150, 26, 13, "rgba(255, 215, 0, 0.16)", "#ffd700", 1.2);
    CanvasUtils.drawStarIcon(ctx, avatarX - 56, avatarY + avatarRadius + 59, 5, 5, 2.5, "#ffd700");
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(rawBadge, avatarX + 8, avatarY + avatarRadius + 59);

    // "AUTHENTICATED PLAYER" Subtitle
    ctx.fillStyle = "#656e80";
    ctx.font = "bold 10px monospace";
    ctx.fillText(CanvasUtils.cleanText(options.texts?.authenticatedSub || "WEKY AUTHENTICATED"), avatarX, avatarY + avatarRadius + 92);

    // 4. Right Area: Primary Result & Stats Grid
    const rightX = profileX + profileW + 20;
    const rightW = width - rightX - padding - 16;

    // Primary Result Box
    CanvasUtils.fillRoundedRect(ctx, rightX, profileY, rightW, 95, 14, "rgba(18, 26, 44, 0.85)", "rgba(0, 247, 255, 0.35)", 1.5);

    ctx.fillStyle = "#7b8599";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(CanvasUtils.cleanText(options.texts?.primaryHighlight || "PRIMARY HIGHLIGHT"), rightX + 22, profileY + 16);

    const cleanPrimaryScore = CanvasUtils.cleanText(options.primaryScore) || options.primaryScore;
    ctx.save();
    ctx.fillStyle = accent;
    ctx.font = "bold 38px monospace";
    ctx.shadowColor = accent;
    ctx.shadowBlur = 14;
    ctx.fillText(cleanPrimaryScore, rightX + 22, profileY + 38);
    ctx.restore();

    // Stats Grid (2x2)
    const defaultStats: ShareCardStat[] = [
      { label: "RANK TIER", value: rawBadge, color: "#ffd700" },
      { label: "STREAK", value: "ACTIVE STREAK", color: "#ff8c38" },
      { label: "ENGINE", value: "WEKY 14.28", color: "#00f7ff" },
      { label: "STATUS", value: "VERIFIED MATCH", color: "#57f287" },
    ];
    const statsToRender = (options.stats && options.stats.length >= 2 ? options.stats : defaultStats).slice(0, 4);

    const cardW = (rightW - 14) / 2;
    const cardH = 74;
    const gridY = profileY + 115;

    for (let i = 0; i < statsToRender.length; i++) {
      const stat = statsToRender[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cardX = rightX + col * (cardW + 14);
      const cardY = gridY + row * (cardH + 12);

      CanvasUtils.fillRoundedRect(ctx, cardX, cardY, cardW, cardH, 10, "rgba(16, 22, 36, 0.7)", "rgba(255, 255, 255, 0.08)", 1);

      ctx.fillStyle = "#656e80";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(CanvasUtils.cleanText(stat.label).toUpperCase(), cardX + 16, cardY + 14);

      ctx.fillStyle = stat.color || "#ffffff";
      ctx.font = "bold 18px monospace";
      ctx.fillText(CanvasUtils.cleanText(stat.value), cardX + 16, cardY + 38);
    }

    // 5. Bottom Verification Strip
    const bottomY = height - 26;

    // Mini decorative barcode ticks
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let bx = padding + 16; bx < padding + 220; bx += 4) {
      const bH = bx % 8 === 0 ? 14 : bx % 6 === 0 ? 10 : 6;
      ctx.fillRect(bx, bottomY - bH / 2, 2, bH);
    }

    ctx.fillStyle = "#4a5263";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const footerText = CanvasUtils.cleanText(options.texts?.footer || "WEKY-PASSPORT • AUTHENTICATED BY @M3RCENA/WEKY ENGINE");
    ctx.fillText(footerText, width - padding - 18, bottomY);

    return canvas.toBuffer("image/png");
  }
}
