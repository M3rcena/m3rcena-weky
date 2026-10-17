import { Canvas, loadImage } from "@napi-rs/canvas";
import { CanvasUtils } from "./CanvasUtils.js";

const TYPE_COLORS: Record<string, string> = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
};

export class RenderPokemon {
  public static async renderCard(
    pokemon: {
      name: string;
      types: string[];
      abilities: string[];
      imageUrl: string;
      id?: number;
    },
    revealed: boolean = false,
  ): Promise<Buffer> {
    const canvas = new Canvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Dynamic background
    const primaryType = (pokemon.types[0] || "normal").toLowerCase();
    const typeColor = TYPE_COLORS[primaryType] || "#00f7ff";

    const bg = ctx.createRadialGradient(250, 250, 50, 400, 250, 500);
    bg.addColorStop(0, "#19243b");
    bg.addColorStop(1, "#0a0e17");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 500);

    // Decorative Pokédex circle in the background
    ctx.save();
    ctx.strokeStyle = "rgba(0, 247, 255, 0.08)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(260, 250, 190, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 247, 255, 0.04)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(260, 250, 160, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Load Pokémon Image
    try {
      const img = await loadImage(pokemon.imageUrl);

      const targetW = 320;
      const targetH = 320;
      const spriteX = 260 - targetW / 2;
      const spriteY = 250 - targetH / 2;

      if (!revealed) {
        // Draw Silhouette
        // 1. Draw image to offscreen canvas
        const offCanvas = new Canvas(targetW, targetH);
        const offCtx = offCanvas.getContext("2d");
        offCtx.drawImage(img, 0, 0, targetW, targetH);

        // 2. Tint entire opaque area black/dark blue
        offCtx.globalCompositeOperation = "source-in";
        offCtx.fillStyle = "#111726";
        offCtx.fillRect(0, 0, targetW, targetH);

        // 3. Draw silhouette with glow onto main canvas
        ctx.save();
        ctx.shadowColor = "rgba(0, 247, 255, 0.4)";
        ctx.shadowBlur = 24;
        ctx.drawImage(offCanvas, spriteX, spriteY);
        ctx.restore();
      } else {
        // Draw Vibrant Full Color Sprite
        ctx.save();
        ctx.shadowColor = typeColor;
        ctx.shadowBlur = 26;
        ctx.drawImage(img, spriteX, spriteY, targetW, targetH);
        ctx.restore();
      }
    } catch {
      // Draw placeholder if image fails to load
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.arc(260, 250, 90, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right Side Info Panel
    const rightX = 520;

    // Header Title
    ctx.fillStyle = "#00f7ff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("WHO'S THAT POKÉMON?", rightX, 100);

    // Name / Mystery Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    if (revealed) {
      ctx.fillText(pokemon.name, rightX, 160);
    } else {
      ctx.fillText("???", rightX, 160);
    }

    // Types Badges
    let badgeX = rightX;
    for (const type of pokemon.types) {
      const color = TYPE_COLORS[type.toLowerCase()] || "#777777";
      CanvasUtils.drawBadge(ctx, type.toUpperCase(), badgeX, 200, 100, 32, color, "#ffffff", "bold 13px sans-serif");
      badgeX += 112;
    }

    // Clues Box
    CanvasUtils.fillRoundedRect(ctx, rightX, 260, 250, 170, 16, "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.1)", 1);

    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ABILITIES", rightX + 16, 290);

    ctx.fillStyle = "#e0e6ed";
    ctx.font = "16px sans-serif";
    const abilityText = pokemon.abilities.slice(0, 3).join(", ") || "Unknown";
    ctx.fillText(abilityText, rightX + 16, 320);

    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(revealed ? "STATUS" : "HINT", rightX + 16, 365);

    ctx.fillStyle = revealed ? "#00ff88" : "#ffaa00";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(revealed ? "Identified!" : "Type your guess in chat!", rightX + 16, 395);

    return canvas.toBuffer("image/png");
  }
}
