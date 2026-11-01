/**
 * Canvas Tournament Bracket Renderer
 * Generates an eSports-style visual bracket chart using @napi-rs/canvas.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { createCanvas } from "@napi-rs/canvas";
import { CanvasUtils } from "../canvas/CanvasUtils.js";

export interface BracketParticipant {
  id: string;
  username: string;
  avatarUrl?: string;
  score?: number;
}

export interface BracketMatch {
  id: string;
  round: number;
  matchIndex: number;
  p1?: BracketParticipant;
  p2?: BracketParticipant;
  winnerId?: string;
  scoreText?: string;
  outcomeDetail?: string;
}

export interface BracketRenderOptions {
  title?: string;
  gameName: string;
  rounds: number; // 2 for 4 players, 3 for 8 players, 4 for 16 players
  matches: BracketMatch[];
  champion?: BracketParticipant;
}

export class RenderBracket {
  /**
   * Generates a high-definition tournament bracket image buffer.
   */
  public static async render(options: BracketRenderOptions): Promise<Buffer> {
    const width = 1200;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 1. Futuristic Dark Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#0b0e17");
    bgGrad.addColorStop(0.5, "#101426");
    bgGrad.addColorStop(1, "#07090f");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Hex Grid Accent
    ctx.strokeStyle = "rgba(88, 101, 242, 0.08)";
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

    // 2. Tournament Header
    const headerTitle = CanvasUtils.cleanText(options.title || "WEKY TOURNAMENT BRACKET") || "WEKY TOURNAMENT BRACKET";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(headerTitle, 50, 55);

    ctx.fillStyle = "#5865F2";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`GAME: ${options.gameName.toUpperCase()} • SINGLE ELIMINATION`, 50, 85);

    // Header separator line
    const lineGrad = ctx.createLinearGradient(50, 95, width - 50, 95);
    lineGrad.addColorStop(0, "#5865F2");
    lineGrad.addColorStop(0.5, "#00ff88");
    lineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 95);
    ctx.lineTo(width - 50, 95);
    ctx.stroke();

    // 3. Render Bracket Columns
    const numRounds = options.rounds;
    const usableWidth = width - 120;
    const colWidth = 230;
    const colSpacing = (usableWidth - colWidth * numRounds) / Math.max(1, numRounds - 1);
    const startY = 130;
    const usableHeight = height - 160;

    const roundNames = numRounds === 2 ? ["Semifinals", "Grand Finals"] : ["Quarterfinals", "Semifinals", "Grand Finals"];

    // Store match center positions for drawing connectors
    const matchPositions: Map<string, { x: number; y: number; rightX: number }> = new Map();

    for (let r = 0; r < numRounds; r++) {
      const roundMatches = options.matches.filter((m) => m.round === r + 1);
      const colX = 60 + r * (colWidth + colSpacing);

      // Round Label
      ctx.fillStyle = "#a0a5b5";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(roundNames[r] || `Round ${r + 1}`, colX + colWidth / 2, startY - 12);

      const matchCount = roundMatches.length;
      const slotHeight = usableHeight / matchCount;

      for (let m = 0; m < matchCount; m++) {
        const match = roundMatches[m];
        const cardY = startY + m * slotHeight + (slotHeight - 90) / 2;

        matchPositions.set(`${match.round}_${match.matchIndex}`, {
          x: colX,
          y: cardY + 45,
          rightX: colX + colWidth,
        });

        // Draw Match Box
        await this.drawMatchCard(ctx, colX, cardY, colWidth, 90, match);
      }
    }

    // 4. Draw Connecting Lines between Rounds
    ctx.lineWidth = 2;
    for (let r = 1; r < numRounds; r++) {
      const prevRoundMatches = options.matches.filter((m) => m.round === r);
      for (const prevMatch of prevRoundMatches) {
        const nextMatchIndex = Math.floor(prevMatch.matchIndex / 2);
        const fromPos = matchPositions.get(`${r}_${prevMatch.matchIndex}`);
        const toPos = matchPositions.get(`${r + 1}_${nextMatchIndex}`);

        if (fromPos && toPos) {
          const midX = fromPos.rightX + colSpacing / 2;
          ctx.strokeStyle = prevMatch.winnerId ? "#00ff88" : "rgba(255, 255, 255, 0.2)";

          ctx.beginPath();
          ctx.moveTo(fromPos.rightX, fromPos.y);
          ctx.lineTo(midX, fromPos.y);
          ctx.lineTo(midX, toPos.y);
          ctx.lineTo(toPos.x, toPos.y);
          ctx.stroke();
        }
      }
    }

    // 5. Crown & Champion Banner (if finished)
    if (options.champion) {
      const champX = width - 260;
      const champY = 45;

      CanvasUtils.roundRectPath(ctx, champX - 10, 20, 240, 65, 12);
      ctx.fillStyle = "rgba(0, 255, 136, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      CanvasUtils.drawCrownIcon(ctx, champX + 16, 40, 12, 7, "#00ff88");
      ctx.fillText("TOURNAMENT CHAMPION", champX + 28, 42);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      const cleanChamp = CanvasUtils.cleanText(options.champion.username) || options.champion.username;
      ctx.fillText(cleanChamp.slice(0, 16), champX + 10, 68);
    }

    return canvas.toBuffer("image/png");
  }

  private static async drawMatchCard(
    ctx: any,
    x: number,
    y: number,
    width: number,
    height: number,
    match: BracketMatch
  ): Promise<void> {
    // Card background
    CanvasUtils.roundRectPath(ctx, x, y, width, height, 10);
    ctx.fillStyle = "rgba(22, 27, 46, 0.95)";
    ctx.fill();

    const isWinnerP1 = Boolean(match.winnerId && match.p1 && match.winnerId === match.p1.id);
    const isWinnerP2 = Boolean(match.winnerId && match.p2 && match.winnerId === match.p2.id);
    const isCompleted = match.winnerId !== undefined;

    ctx.strokeStyle = isCompleted ? "rgba(0, 255, 136, 0.4)" : "rgba(88, 101, 242, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Player 1 Slot
    const slotH = height / 2;
    await this.drawParticipantRow(ctx, x, y, width, slotH, match.p1, isWinnerP1, isCompleted && !isWinnerP1, match.scoreText);

    // Separator line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + slotH);
    ctx.lineTo(x + width - 10, y + slotH);
    ctx.stroke();

    // Player 2 Slot
    await this.drawParticipantRow(ctx, x, y + slotH, width, slotH, match.p2, isWinnerP2, isCompleted && !isWinnerP2, match.scoreText);
  }

  private static async drawParticipantRow(
    ctx: any,
    x: number,
    y: number,
    width: number,
    height: number,
    participant?: BracketParticipant,
    isWinner?: boolean,
    isEliminated?: boolean,
    scoreText?: string
  ): Promise<void> {
    if (!participant) {
      ctx.fillStyle = "#555b6e";
      ctx.font = "italic 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("TBD / Waiting...", x + 16, y + height / 2 + 5);
      return;
    }

    // Avatar Circle
    const avatarR = 12;
    const avatarX = x + 20;
    const avatarY = y + height / 2;

    if (participant.avatarUrl) {
      await CanvasUtils.drawCircularAvatar(ctx, participant.avatarUrl, avatarX, avatarY, avatarR, isWinner ? "#00ff88" : undefined, 1.5);
    } else {
      ctx.fillStyle = "#2c2f40";
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Winner border highlight on avatar
    if (isWinner) {
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR + 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Username
    ctx.fillStyle = isWinner ? "#00ff88" : isEliminated ? "#666b7a" : "#e0e3ed";
    ctx.font = isWinner ? "bold 13px sans-serif" : "13px sans-serif";
    ctx.textAlign = "left";
    const name = participant.username.length > 14 ? `${participant.username.slice(0, 13)}…` : participant.username;
    ctx.fillText(name, x + 40, y + height / 2 + 5);

    // Score or Status Icon
    if (isWinner) {
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      const winLabel = scoreText || (participant.score !== undefined ? String(participant.score) : "WIN");
      ctx.fillText(winLabel, x + width - 15, y + height / 2 + 5);
    } else if (isEliminated) {
      ctx.fillStyle = "#ff4444";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      const outLabel = participant.score !== undefined ? String(participant.score) : "OUT";
      ctx.fillText(outLabel, x + width - 15, y + height / 2 + 5);
    }
  }
}
