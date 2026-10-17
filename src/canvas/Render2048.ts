import { Canvas } from "@napi-rs/canvas";
import { CanvasUtils } from "./CanvasUtils.js";

const CANVAS_SIZE = 800;
const GRID_SIZE = 560;
const GRID_Y_START = 180;
const PADDING = 16;
const CELL_SIZE = (GRID_SIZE - PADDING * 5) / 4;

const TILE_COLORS: Record<number, { main: string; shadow: string; text: string }> = {
  0: { main: "#cdc1b4", shadow: "#bdad9e", text: "transparent" },
  2: { main: "#eee4da", shadow: "#ded0c1", text: "#776e65" },
  4: { main: "#ede0c8", shadow: "#decbb0", text: "#776e65" },
  8: { main: "#f2b179", shadow: "#e69c5c", text: "#f9f6f2" },
  16: { main: "#f59563", shadow: "#e67e45", text: "#f9f6f2" },
  32: { main: "#f67c5f", shadow: "#e36040", text: "#f9f6f2" },
  64: { main: "#f65e3b", shadow: "#d6421e", text: "#f9f6f2" },
  128: { main: "#edcf72", shadow: "#dcc059", text: "#f9f6f2" },
  256: { main: "#edcc61", shadow: "#dcb946", text: "#f9f6f2" },
  512: { main: "#edc850", shadow: "#dcb438", text: "#f9f6f2" },
  1024: { main: "#edc53f", shadow: "#dbb227", text: "#f9f6f2" },
  2048: { main: "#edc22e", shadow: "#dfb216", text: "#f9f6f2" },
};

function getTileColors(val: number) {
  if (TILE_COLORS[val]) return TILE_COLORS[val];
  return { main: "#3c3a32", shadow: "#292721", text: "#f9f6f2" };
}

export class Render2048 {
  public static async renderBoard(board: number[][], score: number, username: string, avatarUrl: string, state?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer> {
    const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext("2d");

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
    bgGrad.addColorStop(0, "#1e2024");
    bgGrad.addColorStop(1, "#2b2d33");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Header: Avatar & Username
    await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, "#00f7ff", 4);

    // Username card
    CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const truncatedName = username.length > 14 ? username.slice(0, 13) + "…" : username;
    ctx.fillText(truncatedName, 146, 75);

    // Score Board
    const scoreBoxW = 200;
    const scoreBoxX = CANVAS_SIZE - scoreBoxW - 40;
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#15171c");
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#1e2129");

    ctx.fillStyle = "#00f7ff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("SCORE", scoreBoxX + scoreBoxW / 2, 45);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(String(score), scoreBoxX + scoreBoxW / 2, 70);

    // 2048 Board Container
    const gridX = (CANVAS_SIZE - GRID_SIZE) / 2;
    CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START + 8, GRID_SIZE, GRID_SIZE, 18, "#9e9183");
    CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_SIZE, GRID_SIZE, 18, "#bbada0");

    // Render Tiles
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const val = board[row][col];
        const x = gridX + PADDING + col * (CELL_SIZE + PADDING);
        const y = GRID_Y_START + PADDING + row * (CELL_SIZE + PADDING);
        const colors = getTileColors(val);

        // 3D effect shadow
        CanvasUtils.fillRoundedRect(ctx, x, y + 5, CELL_SIZE, CELL_SIZE, 10, colors.shadow);
        CanvasUtils.fillRoundedRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 10, colors.main);

        if (val > 0) {
          ctx.fillStyle = colors.text;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const fontSize = val > 1000 ? 46 : val > 100 ? 54 : 64;
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillText(String(val), x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 2);
        }
      }
    }

    // Overlays for Won, Game Over, Quit, Timeout
    if (state && state !== "active") {
      ctx.save();
      CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_SIZE, GRID_SIZE + 8, 18, "rgba(15, 17, 20, 0.82)");

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (state === "won") {
        ctx.shadowColor = "#ffcc00";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 72px sans-serif";
        ctx.fillText("VICTORY!", CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 - 20);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px sans-serif";
        ctx.fillText("You reached 2048!", CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 + 50);
      } else {
        const title = state === "quit" ? "GAME STOPPED" : state === "timeout" ? "TIME'S UP" : "GAME OVER";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 68px sans-serif";
        ctx.fillText(title, CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 - 20);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px sans-serif";
        ctx.fillText(`Final Score: ${score}`, CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2 + 50);
      }
      ctx.restore();
    }

    return canvas.toBuffer("image/png");
  }
}
