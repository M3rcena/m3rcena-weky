import { Canvas, loadImage, SKRSContext2D } from "@napi-rs/canvas";
import { SnakeGameTypes } from "../Types";

const CANVAS_SIZE = 1000;
const GRID_CONTAINER = 700;
const GRID_Y_START = 220;
const COLORS = {
	bgTop: "#1a1c20",
	bgBot: "#2b2d31",
	boardBg: "#0d0e10",
	snakeHead: "#00ff88",
	snakeBody: "#00b862",
	food: "#ff4444",
	gridLines: "#232529",
};

export async function getSnakeBoard(username: string, userIcon: string, game: SnakeGameTypes): Promise<string> {
	const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE);
	const ctx = canvas.getContext("2d");

	const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
	bgGrad.addColorStop(0, COLORS.bgTop);
	bgGrad.addColorStop(1, COLORS.bgBot);
	ctx.fillStyle = bgGrad;
	ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	drawHeader(ctx, username, game.score);
	await drawAvatar(ctx, userIcon);

	const cellSize = GRID_CONTAINER / game.gridSize;
	const gridX = (CANVAS_SIZE - GRID_CONTAINER) / 2;

	ctx.fillStyle = COLORS.boardBg;
	drawRoundedRect(ctx, gridX, GRID_Y_START, GRID_CONTAINER, GRID_CONTAINER, 10);

	ctx.strokeStyle = COLORS.gridLines;
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (let i = 1; i < game.gridSize; i++) {
		// Verticals
		ctx.moveTo(gridX + i * cellSize, GRID_Y_START);
		ctx.lineTo(gridX + i * cellSize, GRID_Y_START + GRID_CONTAINER);
		// Horizontals
		ctx.moveTo(gridX, GRID_Y_START + i * cellSize);
		ctx.lineTo(gridX + GRID_CONTAINER, GRID_Y_START + i * cellSize);
	}
	ctx.stroke();

	const foodX = gridX + game.food.x * cellSize + cellSize / 2;
	const foodY = GRID_Y_START + game.food.y * cellSize + cellSize / 2;

	ctx.fillStyle = COLORS.food;
	ctx.shadowColor = COLORS.food;
	ctx.shadowBlur = 15;
	ctx.beginPath();
	ctx.arc(foodX, foodY, cellSize / 2.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.shadowBlur = 0;

	game.snake.forEach((part, index) => {
		const x = gridX + part.x * cellSize;
		const y = GRID_Y_START + part.y * cellSize;

		ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody;

		const pad = 2;
		drawRoundedRect(ctx, x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, 5);

		if (index === 0) {
			drawEyes(ctx, x, y, cellSize, game.direction);
		}
	});

	if (game.gameOver) {
		drawGameOverOverlay(ctx, gridX, GRID_Y_START, GRID_CONTAINER);
	}

	return canvas.toBuffer("image/png").toString("base64");
}

function drawEyes(ctx: SKRSContext2D, x: number, y: number, size: number, dir: string) {
	ctx.fillStyle = "black";
	const offset = size / 4;

	let eye1 = { x: 0, y: 0 },
		eye2 = { x: 0, y: 0 };

	if (dir === "UP") {
		eye1 = { x: x + offset, y: y + offset };
		eye2 = { x: x + size - offset, y: y + offset };
	} else if (dir === "DOWN") {
		eye1 = { x: x + offset, y: y + size - offset };
		eye2 = { x: x + size - offset, y: y + size - offset };
	} else if (dir === "LEFT") {
		eye1 = { x: x + offset, y: y + offset };
		eye2 = { x: x + offset, y: y + size - offset };
	} else if (dir === "RIGHT") {
		eye1 = { x: x + size - offset, y: y + offset };
		eye2 = { x: x + size - offset, y: y + size - offset };
	}

	ctx.beginPath();
	ctx.arc(eye1.x, eye1.y, 3, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(eye2.x, eye2.y, 3, 0, Math.PI * 2);
	ctx.fill();
}

function drawGameOverOverlay(ctx: SKRSContext2D, x: number, y: number, size: number) {
	ctx.fillStyle = "rgba(0,0,0,0.7)";
	drawRoundedRect(ctx, x, y, size, size, 10);

	ctx.shadowColor = "#ff4444";
	ctx.shadowBlur = 20;
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 80px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("GAME OVER", x + size / 2, y + size / 2);
	ctx.shadowBlur = 0;
}

function drawRoundedRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
	ctx.fill();
}

function drawHeader(ctx: SKRSContext2D, username: string, score: number) {
	// Similar to 2048 header...
	ctx.fillStyle = "rgba(255,255,255,0.1)";
	drawRoundedRect(ctx, 160, 50, 350, 60, 30);
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 32px sans-serif";
	ctx.textAlign = "left";
	ctx.fillText(username, 180, 92);

	const scoreBoxX = CANVAS_SIZE - 300;
	ctx.fillStyle = "#1e1e24";
	drawRoundedRect(ctx, scoreBoxX, 35, 250, 100, 20);

	ctx.fillStyle = "#00ff88";
	ctx.font = "bold 20px sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("LENGTH", scoreBoxX + 125, 60);

	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 45px sans-serif";
	ctx.fillText(String(score), scoreBoxX + 125, 105);
}

async function drawAvatar(ctx: SKRSContext2D, url: string) {
	try {
		const avatar = await loadImage(url);
		ctx.save();
		ctx.beginPath();
		ctx.arc(80, 80, 55, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(avatar, 25, 25, 110, 110);
		ctx.restore();
		ctx.lineWidth = 6;
		ctx.strokeStyle = "#00ff88";
		ctx.stroke();
	} catch (e) {}
}
