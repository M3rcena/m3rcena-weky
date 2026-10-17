import { Canvas, SKRSContext2D } from "@napi-rs/canvas";
import { CanvasUtils } from "./CanvasUtils.js";

const CANVAS_SIZE = 800;
const GRID_CONTAINER = 560;
const GRID_Y_START = 180;

const COLORS = {
  bgTop: "#15181e",
  bgBot: "#21252d",
  boardBg: "#0b0d10",
  snakeHead: "#00ff88",
  snakeBody: "#00b862",
  snakeBodyAlt: "#00a155",
  food: "#ff3355",
  gridLines: "#1b1e25",
};

export class RenderSnake {
  public static async renderBoard(snake: { x: number; y: number }[], food: { x: number; y: number }, direction: "UP" | "DOWN" | "LEFT" | "RIGHT", score: number, gridSize: number, username: string, avatarUrl: string, isGameOver: boolean = false, overlayTitle?: string): Promise<Buffer> {
    const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext("2d");

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
    bgGrad.addColorStop(0, COLORS.bgTop);
    bgGrad.addColorStop(1, COLORS.bgBot);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Header: Avatar & Username
    await CanvasUtils.drawCircularAvatar(ctx, avatarUrl, 70, 75, 45, COLORS.snakeHead, 4);

    // Username card
    CanvasUtils.fillRoundedRect(ctx, 130, 48, 280, 54, 16, "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const truncatedName = username.length > 14 ? username.slice(0, 13) + "…" : username;
    ctx.fillText(truncatedName, 146, 75);

    // Length/Score card
    const scoreBoxW = 200;
    const scoreBoxX = CANVAS_SIZE - scoreBoxW - 40;
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 80, 16, "#101217");
    CanvasUtils.fillRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 75, 16, "#191d24");

    ctx.fillStyle = COLORS.snakeHead;
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("SCORE", scoreBoxX + scoreBoxW / 2, 45);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(String(score), scoreBoxX + scoreBoxW / 2, 70);

    // Grid Container
    const cellSize = GRID_CONTAINER / gridSize;
    const gridX = (CANVAS_SIZE - GRID_CONTAINER) / 2;

    CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_CONTAINER, GRID_CONTAINER, 16, COLORS.boardBg);

    // Grid lines
    ctx.strokeStyle = COLORS.gridLines;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < gridSize; i++) {
      ctx.moveTo(gridX + i * cellSize, GRID_Y_START);
      ctx.lineTo(gridX + i * cellSize, GRID_Y_START + GRID_CONTAINER);
      ctx.moveTo(gridX, GRID_Y_START + i * cellSize);
      ctx.lineTo(gridX + GRID_CONTAINER, GRID_Y_START + i * cellSize);
    }
    ctx.stroke();

    // Food (Apple) with glow
    const foodX = gridX + food.x * cellSize + cellSize / 2;
    const foodY = GRID_Y_START + food.y * cellSize + cellSize / 2;
    ctx.save();
    ctx.fillStyle = COLORS.food;
    ctx.shadowColor = COLORS.food;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(foodX, foodY, cellSize / 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Snake Body & Head
    snake.forEach((part, index) => {
      const px = gridX + part.x * cellSize;
      const py = GRID_Y_START + part.y * cellSize;
      const pad = 1.5;

      if (index === 0) {
        // Head with glow
        ctx.save();
        ctx.shadowColor = COLORS.snakeHead;
        ctx.shadowBlur = 12;
        CanvasUtils.fillRoundedRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, 5, COLORS.snakeHead);
        ctx.restore();

        // Eyes
        this.drawEyes(ctx, px, py, cellSize, direction);
      } else {
        // Body segment
        const bodyColor = index % 2 === 0 ? COLORS.snakeBody : COLORS.snakeBodyAlt;
        CanvasUtils.fillRoundedRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, 4, bodyColor);
      }
    });

    // Game Over Overlay
    if (isGameOver) {
      ctx.save();
      CanvasUtils.fillRoundedRect(ctx, gridX, GRID_Y_START, GRID_CONTAINER, GRID_CONTAINER, 16, "rgba(10, 12, 16, 0.82)");

      ctx.shadowColor = "#ff3355";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#ff3355";
      ctx.font = "bold 68px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(overlayTitle || "GAME OVER", CANVAS_SIZE / 2, GRID_Y_START + GRID_CONTAINER / 2 - 20);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "26px sans-serif";
      ctx.fillText(`Final Length: ${snake.length} | Score: ${score}`, CANVAS_SIZE / 2, GRID_Y_START + GRID_CONTAINER / 2 + 45);
      ctx.restore();
    }

    return canvas.toBuffer("image/png");
  }

  private static drawEyes(ctx: SKRSContext2D, x: number, y: number, size: number, dir: "UP" | "DOWN" | "LEFT" | "RIGHT"): void {
    ctx.fillStyle = "#111111";
    const offset = size / 3.8;
    let eye1 = { x: 0, y: 0 };
    let eye2 = { x: 0, y: 0 };

    if (dir === "UP") {
      eye1 = { x: x + offset, y: y + offset };
      eye2 = { x: x + size - offset, y: y + offset };
    } else if (dir === "DOWN") {
      eye1 = { x: x + offset, y: y + size - offset };
      eye2 = { x: x + size - offset, y: y + size - offset };
    } else if (dir === "LEFT") {
      eye1 = { x: x + offset, y: y + offset };
      eye2 = { x: x + offset, y: y + size - offset };
    } else {
      eye1 = { x: x + size - offset, y: y + offset };
      eye2 = { x: x + size - offset, y: y + size - offset };
    }

    const eyeRadius = Math.max(2, size / 10);
    ctx.beginPath();
    ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}
