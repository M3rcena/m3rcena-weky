import { Canvas, loadImage, Image, SKRSContext2D } from "@napi-rs/canvas";

const CANVAS_SIZE = 1000;
const GRID_SIZE = 700;
const GRID_Y_START = 220;
const PADDING = 20;
const CELL_SIZE = (GRID_SIZE - PADDING * 5) / 4;

const COLORS = {
	bgTop: "#232526",
	bgBot: "#414345",

	boardBase: "#bbaea0", // Light brownish/grey
	boardDark: "#a39485", // Shadow for the tray

	textDark: "#776e65", // For light tiles (2, 4)
	textLight: "#f9f6f2", // For dark tiles (8+)

	neonAccent: "#00f7ff",
};

function getTileColors(value: number) {
	switch (value) {
		case 0:
			return { main: "#cdc1b4", shadow: "#bdad9e" };
		case 2:
			return { main: "#eee4da", shadow: "#ded0c1" };
		case 4:
			return { main: "#ede0c8", shadow: "#decbb0" };
		case 8:
			return { main: "#f2b179", shadow: "#e69c5c" };
		case 16:
			return { main: "#f59563", shadow: "#e67e45" };
		case 32:
			return { main: "#f67c5f", shadow: "#e36040" };
		case 64:
			return { main: "#f65e3b", shadow: "#d6421e" };
		case 128:
			return { main: "#edcf72", shadow: "#dcc059" };
		case 256:
			return { main: "#edcc61", shadow: "#dcb946" };
		case 512:
			return { main: "#edc850", shadow: "#dcb438" };
		case 1024:
			return { main: "#edc53f", shadow: "#dbb227" };
		case 2048:
			return { main: "#edc22e", shadow: "#dfb216" };
		default:
			return { main: "#3c3a32", shadow: "#292721" };
	}
}

// --- HELPER: 3D Tile Drawer ---
function draw3DTile(ctx: SKRSContext2D, x: number, y: number, size: number, value: number) {
	const radius = 12;
	const depth = 8;

	const colors = getTileColors(value);

	ctx.fillStyle = colors.shadow;
	drawRoundedRect(ctx, x, y + depth, size, size, radius);

	ctx.fillStyle = colors.main;
	drawRoundedRect(ctx, x, y, size, size, radius);

	if (value !== 0) {
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		const fontSize = value > 1000 ? "65px" : value > 100 ? "75px" : "90px";
		ctx.font = `bold ${fontSize} sans-serif`;

		ctx.fillStyle = value <= 4 ? COLORS.textDark : COLORS.textLight;

		if (value > 4) {
			ctx.shadowColor = "rgba(0,0,0,0.2)";
			ctx.shadowBlur = 4;
		}

		ctx.fillText(String(value), x + size / 2, y + size / 2 + 2);

		ctx.shadowBlur = 0;
	}
}

// --- STANDARD ROUNDED RECT ---
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

// --- MAIN GENERATOR ---
export async function getBoardCard(
	username: string,
	userIcon: string,
	score: number,
	board: number[][]
): Promise<string> {
	const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE);
	const ctx = canvas.getContext("2d");

	const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
	bgGrad.addColorStop(0, COLORS.bgTop);
	bgGrad.addColorStop(1, COLORS.bgBot);
	ctx.fillStyle = bgGrad;
	ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	drawHeader(ctx, username, score);

	try {
		const avatar = await loadImage(userIcon);
		ctx.save();
		ctx.beginPath();
		ctx.arc(80, 80, 55, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(avatar, 25, 25, 110, 110);
		ctx.restore();
		ctx.lineWidth = 6;
		ctx.strokeStyle = COLORS.neonAccent;
		ctx.stroke();
	} catch (e) {
		/* ignore */
	}

	const gridX = (CANVAS_SIZE - GRID_SIZE) / 2;

	ctx.fillStyle = COLORS.boardDark;
	drawRoundedRect(ctx, gridX, GRID_Y_START + 10, GRID_SIZE, GRID_SIZE, 20);

	ctx.fillStyle = COLORS.boardBase;
	drawRoundedRect(ctx, gridX, GRID_Y_START, GRID_SIZE, GRID_SIZE, 20);

	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 4; col++) {
			const value = board[row][col];

			const x = gridX + PADDING + col * (CELL_SIZE + PADDING);
			const y = GRID_Y_START + PADDING + row * (CELL_SIZE + PADDING);

			draw3DTile(ctx, x, y, CELL_SIZE, value);
		}
	}

	return canvas.toBuffer("image/png").toString("base64");
}

export async function getGameOverCard(
	username: string,
	userIcon: string,
	score: number,
	board: number[][]
): Promise<string> {
	const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE);
	const ctx = canvas.getContext("2d");

	const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
	bgGrad.addColorStop(0, COLORS.bgTop);
	bgGrad.addColorStop(1, COLORS.bgBot);
	ctx.fillStyle = bgGrad;
	ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	const gridX = (CANVAS_SIZE - GRID_SIZE) / 2;
	ctx.fillStyle = COLORS.boardDark;
	drawRoundedRect(ctx, gridX, GRID_Y_START + 10, GRID_SIZE, GRID_SIZE, 20);
	ctx.fillStyle = COLORS.boardBase;
	drawRoundedRect(ctx, gridX, GRID_Y_START, GRID_SIZE, GRID_SIZE, 20);

	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 4; col++) {
			const value = board[row][col];
			const x = gridX + PADDING + col * (CELL_SIZE + PADDING);
			const y = GRID_Y_START + PADDING + row * (CELL_SIZE + PADDING);
			draw3DTile(ctx, x, y, CELL_SIZE, value);
		}
	}

	drawHeader(ctx, username, score);
	try {
		const avatar = await loadImage(userIcon);
		ctx.save();
		ctx.beginPath();
		ctx.arc(80, 80, 55, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(avatar, 25, 25, 110, 110);
		ctx.restore();
		ctx.lineWidth = 6;
		ctx.strokeStyle = "#ff4444";
		ctx.stroke();
	} catch (e) {}

	ctx.fillStyle = "rgba(30, 30, 35, 0.8)";
	drawRoundedRect(ctx, gridX, GRID_Y_START, GRID_SIZE, GRID_SIZE + 10, 20);

	ctx.shadowColor = "#ff4444";
	ctx.shadowBlur = 30;

	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 100px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("GAME OVER", CANVAS_SIZE / 2, GRID_Y_START + GRID_SIZE / 2);

	ctx.shadowBlur = 0;

	return canvas.toBuffer("image/png").toString("base64");
}

function drawHeader(ctx: SKRSContext2D, username: string, score: number) {
	const nameTagW = 350;
	ctx.fillStyle = "rgba(255,255,255,0.1)";
	drawRoundedRect(ctx, 160, 50, nameTagW, 60, 30);

	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 32px sans-serif";
	ctx.textAlign = "left";
	ctx.fillText(username, 180, 92);

	const scoreBoxW = 250;
	const scoreBoxX = CANVAS_SIZE - scoreBoxW - 50;

	ctx.fillStyle = "#1e1e24";
	drawRoundedRect(ctx, scoreBoxX, 35, scoreBoxW, 100, 20);
	ctx.fillStyle = "#2b2b36";
	drawRoundedRect(ctx, scoreBoxX, 30, scoreBoxW, 100, 20);

	ctx.fillStyle = COLORS.neonAccent;
	ctx.font = "bold 20px sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("SCORE", scoreBoxX + scoreBoxW / 2, 60);

	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 45px sans-serif";
	ctx.fillText(String(score), scoreBoxX + scoreBoxW / 2, 105);
}
