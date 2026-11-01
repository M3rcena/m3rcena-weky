/**
 * Canvas Leaderboard Renderer
 * Generates an eSports-grade High-Score poster using @napi-rs/canvas.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { createCanvas, SKRSContext2D } from "@napi-rs/canvas";
import { CanvasUtils } from "./CanvasUtils.js";

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  username: string;
  avatarUrl?: string;
  scoreOrElo: number | string;
  stats?: string;
  streak?: number;
}

export interface LeaderboardCustomTexts {
  /** Text shown in top-left badge pill (default: "HALL OF FAME") */
  categoryBadge?: string;
  /** Text template shown in top-right contenders badge (default: "${count} TOP CONTENDERS") */
  topContendersBadge?: string;
  /** Column header for rank (default: "RANK") */
  rankColumn?: string;
  /** Column header for player (default: "PLAYER") */
  playerColumn?: string;
  /** Column header for record / streak (default: "RECORD / STREAK") */
  recordColumn?: string;
  /** Column header for score / elo (default: "SCORE / ELO") */
  scoreColumn?: string;
  /** Streak pill suffix (default: "STREAK") */
  streakSuffix?: string;
  /** Footer branding watermark (default: "Powered by @m3rcena/weky • Modern Discord Minigames Engine") */
  footer?: string;
}

export interface RenderLeaderboardOptions {
  title?: string;
  subtitle?: string;
  gameName?: string;
  entries: LeaderboardEntry[];
  accentColor?: string;
  texts?: LeaderboardCustomTexts;
}

export class RenderLeaderboard {
  public static async render(options: RenderLeaderboardOptions): Promise<Buffer> {
    const entries = options.entries.slice(0, 10);
    const width = 1000;
    const rowHeight = 54;
    const headerHeight = 175;
    const padding = 28;
    const height = Math.max(540, headerHeight + entries.length * (rowHeight + 10) + padding + 35);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 1. Deep Cyber Radial & Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#080b12");
    bgGrad.addColorStop(0.4, "#0d1322");
    bgGrad.addColorStop(1, "#06080d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Aura in the Center Header
    const aura = ctx.createRadialGradient(width / 2, 80, 20, width / 2, 80, 480);
    aura.addColorStop(0, "rgba(88, 101, 242, 0.16)");
    aura.addColorStop(0.5, "rgba(0, 247, 255, 0.05)");
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, 320);

    // High-Tech Cyber Grid Accent
    ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
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

    // Outer Border Frame
    CanvasUtils.fillRoundedRect(ctx, 12, 12, width - 24, height - 24, 20, "transparent", "rgba(88, 101, 242, 0.2)", 1.5);

    // 2. Header Section
    const headerTitle = CanvasUtils.cleanText(options.title || "ARCADE CHAMPIONSHIP");
    const headerSub = CanvasUtils.cleanText(
      options.subtitle || (options.gameName ? `TOP PLAYERS • ${options.gameName.toUpperCase()}` : "GLOBAL LEADERBOARD • REAL-TIME")
    );

    // Top Glowing Accent Bar
    const topBarGrad = ctx.createLinearGradient(padding + 20, 0, width - padding - 20, 0);
    topBarGrad.addColorStop(0, "#5865f2");
    topBarGrad.addColorStop(0.5, "#00f7ff");
    topBarGrad.addColorStop(1, "#ffd700");
    ctx.fillStyle = topBarGrad;
    ctx.fillRect(padding + 20, 20, width - (padding + 20) * 2, 3);

    // Category Pill Badge
    const categoryBadge = CanvasUtils.cleanText(options.texts?.categoryBadge || "HALL OF FAME");
    CanvasUtils.fillRoundedRect(ctx, padding + 14, 34, 160, 28, 14, "rgba(88, 101, 242, 0.22)", "#5865f2", 1.2);
    CanvasUtils.drawStarIcon(ctx, padding + 32, 48, 5, 6, 3, "#5865f2");
    ctx.fillStyle = "#5865f2";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(categoryBadge, padding + 45, 48);

    // Main Title with Glow
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
    ctx.shadowBlur = 12;
    ctx.fillText(headerTitle, padding + 14, 94);
    ctx.restore();

    // Subtitle (explicit alignment ensures no clipping)
    ctx.save();
    ctx.fillStyle = "#8a91a0";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(headerSub, padding + 16, 125);
    ctx.restore();

    // Total Players Badge (Right side of header)
    const countBadge = options.texts?.topContendersBadge
      ? CanvasUtils.cleanText(options.texts.topContendersBadge.replace(/\{\{count\}\}/g, String(entries.length)))
      : `${entries.length} TOP CONTENDERS`;
    CanvasUtils.fillRoundedRect(ctx, width - padding - 180, 80, 165, 30, 15, "rgba(255, 255, 255, 0.04)", "rgba(255, 255, 255, 0.12)", 1);
    ctx.fillStyle = "#00f7ff";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(countBadge, width - padding - 98, 95);

    // Column Headers
    const colY = 152;
    ctx.fillStyle = "#555b6a";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(CanvasUtils.cleanText(options.texts?.rankColumn || "RANK"), padding + 20, colY);
    ctx.fillText(CanvasUtils.cleanText(options.texts?.playerColumn || "PLAYER"), padding + 115, colY);
    ctx.fillText(CanvasUtils.cleanText(options.texts?.recordColumn || "RECORD / STREAK"), width - 390, colY);
    ctx.textAlign = "right";
    ctx.fillText(CanvasUtils.cleanText(options.texts?.scoreColumn || "SCORE / ELO"), width - padding - 24, colY);

    // 3. Render Leaderboard Rows
    const startY = headerHeight;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const y = startY + i * (rowHeight + 10);
      const isTop1 = entry.rank === 1;
      const isTop2 = entry.rank === 2;
      const isTop3 = entry.rank === 3;

      let cardBg = "rgba(18, 24, 38, 0.65)";
      let cardBorder = "rgba(255, 255, 255, 0.07)";
      let rankColor = "#ffffff";
      let rankBg = "rgba(255, 255, 255, 0.08)";
      let scoreColor = "#00f7ff";

      if (isTop1) {
        cardBg = "rgba(255, 215, 0, 0.11)";
        cardBorder = "rgba(255, 215, 0, 0.75)";
        rankColor = "#0a0c12";
        rankBg = "#ffd700";
        scoreColor = "#ffd700";
      } else if (isTop2) {
        cardBg = "rgba(200, 215, 235, 0.09)";
        cardBorder = "rgba(200, 215, 235, 0.65)";
        rankColor = "#0a0c12";
        rankBg = "#c5d2e0";
        scoreColor = "#e6edf5";
      } else if (isTop3) {
        cardBg = "rgba(205, 127, 50, 0.09)";
        cardBorder = "rgba(205, 127, 50, 0.65)";
        rankColor = "#ffffff";
        rankBg = "#cd7f32";
        scoreColor = "#e8a05c";
      }

      // Draw Row Container with Glassmorphism
      CanvasUtils.fillRoundedRect(ctx, padding + 10, y, width - (padding + 10) * 2, rowHeight, 12, cardBg, cardBorder, isTop1 ? 2 : 1.2);

      // Rank Badge
      const badgeW = 38;
      const badgeH = 28;
      const badgeX = padding + 22;
      const badgeY = y + (rowHeight - badgeH) / 2;
      CanvasUtils.fillRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 7, rankBg);

      ctx.fillStyle = rankColor;
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isTop1) {
        CanvasUtils.drawCrownIcon(ctx, badgeX + badgeW / 2, badgeY + 7, 12, 7, "#7a5901");
        ctx.fillText("1", badgeX + badgeW / 2, badgeY + badgeH / 2 + 5);
      } else {
        ctx.fillText(`#${entry.rank}`, badgeX + badgeW / 2, badgeY + badgeH / 2);
      }

      // Avatar
      const avatarRadius = 19;
      const avatarX = padding + 90;
      const avatarY = y + rowHeight / 2;

      if (entry.avatarUrl) {
        const borderColor = isTop1 ? "#ffd700" : isTop2 ? "#c5d2e0" : isTop3 ? "#cd7f32" : "#5865f2";
        await CanvasUtils.drawCircularAvatar(ctx, entry.avatarUrl, avatarX, avatarY, avatarRadius, borderColor, 2.5);
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#252b38";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.stroke();
        ctx.restore();
      }

      // Username
      ctx.fillStyle = isTop1 ? "#ffd700" : "#ffffff";
      ctx.font = isTop1 ? "bold 18px sans-serif" : "bold 16px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const maxNameLen = 17;
      const cleanName = CanvasUtils.cleanText(entry.username) || entry.username;
      const displayName = cleanName.length > maxNameLen ? cleanName.slice(0, maxNameLen - 1) + "…" : cleanName;
      ctx.fillText(displayName, avatarX + avatarRadius + 14, y + rowHeight / 2);

      // Record / Streak Pill
      const statsX = width - 390;
      if (entry.streak && entry.streak > 1) {
        // Fire streak pill
        CanvasUtils.fillRoundedRect(ctx, statsX, y + (rowHeight - 24) / 2, 105, 24, 12, "rgba(255, 107, 0, 0.18)", "#ff6b00", 1);
        CanvasUtils.drawFlameIcon(ctx, statsX + 16, y + rowHeight / 2, 6, "#ff8c38");
        ctx.fillStyle = "#ff8c38";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const streakText = options.texts?.streakSuffix || "STREAK";
        ctx.fillText(`${entry.streak} ${streakText}`, statsX + 27, y + rowHeight / 2);

        if (entry.stats) {
          ctx.fillStyle = "#7c8392";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(CanvasUtils.cleanText(entry.stats), statsX + 115, y + rowHeight / 2);
        }
      } else {
        ctx.fillStyle = "#8e95a5";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(CanvasUtils.cleanText(entry.stats) || "—", statsX, y + rowHeight / 2);
      }

      // Score / ELO Box
      const scoreStr = typeof entry.scoreOrElo === "number" ? entry.scoreOrElo.toLocaleString() : String(entry.scoreOrElo);
      ctx.save();
      ctx.fillStyle = scoreColor;
      ctx.font = "bold 19px monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      if (isTop1) {
        ctx.shadowColor = "rgba(255, 215, 0, 0.4)";
        ctx.shadowBlur = 8;
      }
      ctx.fillText(scoreStr, width - padding - 28, y + rowHeight / 2);
      ctx.restore();
    }

    // 4. Footer Branding
    const footerY = height - 16;
    ctx.fillStyle = "#484f60";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const footer = CanvasUtils.cleanText(options.texts?.footer || "Powered by @m3rcena/weky • Modern Discord Minigames Engine");
    ctx.fillText(footer, width / 2, footerY);

    return canvas.toBuffer("image/png");
  }
}
