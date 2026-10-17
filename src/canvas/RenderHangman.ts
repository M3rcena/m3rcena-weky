import { Canvas, SKRSContext2D } from "@napi-rs/canvas";
import { CanvasUtils } from "./CanvasUtils.js";

export class RenderHangman {
  public static async renderCard(wrongGuessesCount: number, displayWord: string, guessedLetters: string[], username: string, avatarUrl: string, gameOver: boolean = false, won: boolean = false, fullWord?: string): Promise<Buffer> {
    const canvas = new Canvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Dark radial gradient background
    const bg = ctx.createRadialGradient(400, 250, 50, 400, 250, 500);
    bg.addColorStop(0, "#2c303a");
    bg.addColorStop(1, "#15171d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 500);

    // Header: User Info
    await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 60, 55, 35, "#00ff88", 3);
    CanvasUtils.fillRoundedRect(ctx, 110, 32, 220, 46, 14, "rgba(255,255,255,0.06)");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const truncated = username.length > 13 ? username.slice(0, 12) + "…" : username;
    ctx.fillText(truncated, 124, 55);

    // --- DRAW GALLOWS (Left Side) ---
    const gx = 40;
    const gy = 40;

    // Base Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(190 + gx, 380 + gy, 130, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Beams
    this.drawWoodenBeam(ctx, 70 + gx, 380 + gy, 310 + gx, 380 + gy, 14);
    this.drawWoodenBeam(ctx, 110 + gx, 380 + gy, 110 + gx, 60 + gy, 14);
    this.drawWoodenBeam(ctx, 110 + gx, 60 + gy, 270 + gx, 60 + gy, 14);
    this.drawWoodenBeam(ctx, 110 + gx, 130 + gy, 170 + gx, 60 + gy, 12);

    // Rope
    ctx.strokeStyle = "#c29b62";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(270 + gx, 60 + gy);
    ctx.lineTo(270 + gx, 110 + gy);
    ctx.stroke();

    // Hangman Stages
    const ropeEndX = 270 + gx;
    const ropeEndY = 110 + gy;

    // 1: Head
    if (wrongGuessesCount >= 1) {
      ctx.save();
      ctx.fillStyle = "#e0e6ed";
      ctx.beginPath();
      ctx.arc(ropeEndX, ropeEndY + 25, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8b949e";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Dead eyes if lost
      if (wrongGuessesCount >= 6) {
        ctx.strokeStyle = "#ff3355";
        ctx.lineWidth = 2.5;
        // Left X
        this.drawX(ctx, ropeEndX - 10, ropeEndY + 20, 6);
        // Right X
        this.drawX(ctx, ropeEndX + 10, ropeEndY + 20, 6);
      }
      ctx.restore();
    }

    // 2: Body / Torso
    if (wrongGuessesCount >= 2) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 50, ropeEndX, ropeEndY + 150, 7, "#e0e6ed");
    }

    // 3: Left Arm
    if (wrongGuessesCount >= 3) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 70, ropeEndX - 40, ropeEndY + 115, 6, "#e0e6ed");
    }

    // 4: Right Arm
    if (wrongGuessesCount >= 4) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 70, ropeEndX + 40, ropeEndY + 115, 6, "#e0e6ed");
    }

    // 5: Left Leg
    if (wrongGuessesCount >= 5) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 150, ropeEndX - 35, ropeEndY + 220, 6, "#e0e6ed");
    }

    // 6: Right Leg
    if (wrongGuessesCount >= 6) {
      this.drawLimb(ctx, ropeEndX, ropeEndY + 150, ropeEndX + 35, ropeEndY + 220, 6, "#e0e6ed");
    }

    // --- RIGHT SIDE: WORD & GUESSES ---
    const rightCenterX = 580;

    // Header label
    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SECRET WORD", rightCenterX, 130);

    // Masked Word Display
    ctx.fillStyle = "#ffffff";
    const fontSize = displayWord.length > 18 ? 32 : displayWord.length > 12 ? 38 : 46;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillText(displayWord, rightCenterX, 185);

    // Lives Indicator
    const remaining = Math.max(0, 6 - wrongGuessesCount);
    const livesColor = remaining > 3 ? "#00ff88" : remaining > 1 ? "#ffaa00" : "#ff3355";
    CanvasUtils.drawBadge(ctx, `${remaining} / 6 LIVES REMAINING`, rightCenterX - 110, 240, 220, 32, "rgba(0,0,0,0.3)", livesColor, "bold 13px sans-serif");

    // Wrong Guesses Box
    const wrongLetters = guessedLetters.filter((l) => !displayWord.includes(l));
    if (wrongLetters.length > 0) {
      ctx.fillStyle = "#ff5555";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("INCORRECT GUESSES", rightCenterX, 310);

      CanvasUtils.fillRoundedRect(ctx, rightCenterX - 160, 335, 320, 54, 12, "rgba(0, 0, 0, 0.35)");
      ctx.fillStyle = "#ff8899";
      ctx.font = "bold 24px monospace";
      ctx.fillText(wrongLetters.join("  "), rightCenterX, 363);
    }

    // --- GAME OVER / VICTORY OVERLAYS ---
    if (gameOver) {
      ctx.save();
      ctx.fillStyle = "rgba(10, 12, 16, 0.8)";
      ctx.fillRect(0, 0, 800, 500);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (won) {
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#00ff88";
        ctx.font = "bold 64px sans-serif";
        ctx.fillText("VICTORY!", 400, 210);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px sans-serif";
        ctx.fillText(`Word: ${fullWord || displayWord.replace(/ /g, "")}`, 400, 280);
      } else {
        ctx.shadowColor = "#ff3355";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#ff3355";
        ctx.font = "bold 64px sans-serif";
        ctx.fillText("GAME OVER", 400, 210);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px sans-serif";
        ctx.fillText(`The word was: ${fullWord || displayWord.replace(/ /g, "")}`, 400, 280);
      }
      ctx.restore();
    }

    return canvas.toBuffer("image/png");
  }

  private static drawWoodenBeam(ctx: SKRSContext2D, x1: number, y1: number, x2: number, y2: number, width: number): void {
    ctx.save();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#5d4037";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  private static drawLimb(ctx: SKRSContext2D, x1: number, y1: number, x2: number, y2: number, width: number, color: string): void {
    ctx.save();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  private static drawX(ctx: SKRSContext2D, cx: number, cy: number, size: number): void {
    ctx.beginPath();
    ctx.moveTo(cx - size, cy - size);
    ctx.lineTo(cx + size, cy + size);
    ctx.moveTo(cx + size, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.stroke();
  }
}
