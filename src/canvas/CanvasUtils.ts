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

  /**
   * Safely cleans text by stripping Unicode emojis and symbols that render as tofu `[?]` boxes on Linux servers.
   */
  public static cleanText(text?: string | null): string {
    if (!text) return "";
    return text
      .replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{FE00}-\u{FE0F}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Draws a crisp vector checkmark badge at (cx, cy).
   */
  public static drawCheckmarkIcon(ctx: SKRSContext2D, cx: number, cy: number, radius: number = 8, bgColor: string = "#57f287", checkColor: string = "#0b0f19"): void {
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Checkmark tick
    ctx.strokeStyle = checkColor;
    ctx.lineWidth = Math.max(1.5, radius / 4);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.45, cy);
    ctx.lineTo(cx - radius * 0.1, cy + radius * 0.4);
    ctx.lineTo(cx + radius * 0.45, cy - radius * 0.35);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws a vector 5-point star icon at (cx, cy).
   */
  public static drawStarIcon(ctx: SKRSContext2D, cx: number, cy: number, spikes: number = 5, outerRadius: number = 7, innerRadius: number = 3.5, color: string = "#ffd700"): void {
    ctx.save();
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws a sleek vector flame icon at (cx, cy).
   */
  public static drawFlameIcon(ctx: SKRSContext2D, cx: number, cy: number, size: number = 10, color: string = "#ff8c38"): void {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    // Stylized flame shape
    ctx.moveTo(cx, cy - size * 0.9);
    ctx.quadraticCurveTo(cx + size * 0.7, cy - size * 0.2, cx + size * 0.5, cy + size * 0.5);
    ctx.quadraticCurveTo(cx + size * 0.2, cy + size * 0.9, cx, cy + size * 0.9);
    ctx.quadraticCurveTo(cx - size * 0.2, cy + size * 0.9, cx - size * 0.5, cy + size * 0.5);
    ctx.quadraticCurveTo(cx - size * 0.7, cy - size * 0.2, cx, cy - size * 0.9);
    ctx.fill();

    // Inner bright ember
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.35, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws a clean vector crown icon at (cx, cy).
   */
  public static drawCrownIcon(ctx: SKRSContext2D, cx: number, cy: number, width: number = 14, height: number = 9, color: string = "#ffd700"): void {
    ctx.save();
    ctx.fillStyle = color;
    const halfW = width / 2;
    const topY = cy - height / 2;
    const botY = cy + height / 2;

    ctx.beginPath();
    ctx.moveTo(cx - halfW, topY);
    ctx.lineTo(cx - halfW * 0.5, topY + height * 0.45);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + halfW * 0.5, topY + height * 0.45);
    ctx.lineTo(cx + halfW, topY);
    ctx.lineTo(cx + halfW * 0.75, botY);
    ctx.lineTo(cx - halfW * 0.75, botY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
