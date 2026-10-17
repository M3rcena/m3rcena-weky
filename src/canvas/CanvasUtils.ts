import { loadImage, SKRSContext2D } from "@napi-rs/canvas";

export class CanvasUtils {
  /**
   * Draws a rounded rectangle path.
   */
  public static roundRectPath(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number | number[]): void {
    let tl = 0,
      tr = 0,
      br = 0,
      bl = 0;
    if (typeof r === "number") {
      tl = tr = br = bl = r;
    } else if (Array.isArray(r)) {
      [tl, tr = tl, br = tl, bl = tr] = r;
    }

    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
  }

  /**
   * Fills a rounded rectangle with optional fill and stroke.
   */
  public static fillRoundedRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number, fillStyle: SKRSContext2D["fillStyle"], strokeStyle?: SKRSContext2D["strokeStyle"], lineWidth: number = 1): void {
    ctx.save();
    this.roundRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Safely loads and draws a circular avatar with optional border and glow.
   */
  public static async drawCircularAvatar(ctx: SKRSContext2D, url: string, x: number, y: number, radius: number, borderColor?: string, borderWidth: number = 3): Promise<void> {
    try {
      if (!url) return;
      const avatar = await loadImage(url);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();

      if (borderColor && borderWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }
    } catch {
      // Fallback: draw placeholder circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#3a3c42";
      ctx.fill();
      if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /**
   * Draws a badge with rounded corners and centered text.
   */
  public static drawBadge(ctx: SKRSContext2D, text: string, x: number, y: number, w: number, h: number, bgColor: string, textColor: string = "#ffffff", font: string = "bold 14px sans-serif"): void {
    this.fillRoundedRect(ctx, x, y, w, h, h / 2, bgColor);
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
  }

  /**
   * Draws a shiny vector gold coin icon at (x, y) with radius r.
   * Completely avoids server font emoji missing tofu glyphs.
   */
  public static drawCoinIcon(ctx: SKRSContext2D, x: number, y: number, r: number = 10): void {
    ctx.save();
    // Outer rim gradient
    const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    grad.addColorStop(0, "#ffe066");
    grad.addColorStop(1, "#d48806");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner ridge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = Math.max(1, r / 6);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    // Center currency glyph
    ctx.fillStyle = "#fff4b8";
    ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("¢", x, y + 0.5);
    ctx.restore();
  }
}
