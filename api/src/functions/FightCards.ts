import { Canvas, Image, loadImage, SKRSContext2D } from "@napi-rs/canvas";
import { AttachmentBuilder, GuildMember } from "discord.js";
import { FightPlayerType } from "../Types";

// Request Card
export async function getRequestCard(
	challengerUsername: string,
	challengerIcon: string,
	opponentUsername: string,
	opponentIcon: string
): Promise<string> {
	const canvas = new Canvas(800, 800);
	const ctx = canvas.getContext("2d");

	// --- 1. ADVANCED BACKGROUND ---
	// Deep radial gradient for depth
	const bgGradient = ctx.createRadialGradient(400, 400, 100, 400, 400, 600);
	bgGradient.addColorStop(0, "#1b2735");
	bgGradient.addColorStop(1, "#090a0f");
	ctx.fillStyle = bgGradient;
	ctx.fillRect(0, 0, 800, 800);

	// Add subtle "Scanlines" for a tech look
	ctx.fillStyle = "rgba(0, 255, 136, 0.03)";
	for (let i = 0; i < 800; i += 4) {
		ctx.fillRect(0, i, 800, 1);
	}

	// --- 2. THE CHASSIS (Outer Frame) ---
	const drawGlassPanel = (x: number, y: number, w: number, h: number, radius: number) => {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + w - radius, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
		ctx.lineTo(x + w, y + h - radius);
		ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
		ctx.lineTo(x + radius, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();

		// Glass fill
		ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
		ctx.fill();
		// Neon stroke
		ctx.strokeStyle = "rgba(0, 255, 136, 0.3)";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();
	};

	drawGlassPanel(40, 40, 720, 720, 30);

	// --- 3. HEADER DESIGN ---
	ctx.font = "italic bold 56px sans-serif";
	ctx.textAlign = "center";
	// Chrome/Silver gradient for text
	const textGrad = ctx.createLinearGradient(0, 100, 0, 160);
	textGrad.addColorStop(0, "#ffffff");
	textGrad.addColorStop(1, "#00ff88");

	ctx.shadowColor = "rgba(0, 255, 136, 0.8)";
	ctx.shadowBlur = 15;
	ctx.fillStyle = textGrad;
	ctx.fillText("FIGHT REQUEST", 400, 130);
	ctx.shadowBlur = 0;

	// --- 4. AVATAR SLOTS WITH ORBITAL RINGS ---
	const drawAvatar = async (img: Image, x: number, y: number, color: string) => {
		// Outer Glow Ring
		ctx.beginPath();
		ctx.arc(x, y, 115, 0, Math.PI * 2);
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.setLineDash([10, 15]); // Dashed "tech" circle
		ctx.stroke();
		ctx.setLineDash([]);

		// Main Border
		ctx.beginPath();
		ctx.arc(x, y, 105, 0, Math.PI * 2);
		ctx.strokeStyle = color;
		ctx.lineWidth = 5;
		ctx.shadowColor = color;
		ctx.shadowBlur = 15;
		ctx.stroke();
		ctx.shadowBlur = 0;

		// Clipping for Avatar
		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, 100, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(img, x - 100, y - 100, 200, 200);
		ctx.restore();
	};

	const [challengerAvatar, opponentAvatar] = await Promise.all([loadImage(challengerIcon), loadImage(opponentIcon)]);

	await drawAvatar(challengerAvatar, 220, 380, "#00ff88");
	await drawAvatar(opponentAvatar, 580, 380, "#ff3366");

	// --- 5. THE "VS" BADGE ---
	ctx.save();
	ctx.font = "bold 80px sans-serif";
	ctx.fillStyle = "#ffffff";
	ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
	ctx.shadowBlur = 20;
	ctx.fillText("VS", 400, 410);
	ctx.restore();

	// --- 6. USER INFO BLOCKS ---
	const drawInfo = (name: string, role: string, x: number, y: number, color: string) => {
		// Background tag
		ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
		ctx.fillRect(x - 120, y - 40, 240, 80);

		// Role Label
		ctx.font = "bold 18px sans-serif";
		ctx.fillStyle = color;
		ctx.fillText(role, x, y - 10);

		// Username
		ctx.font = "28px sans-serif";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(name, x, y + 25);

		// Accent line
		ctx.fillStyle = color;
		ctx.fillRect(x - 60, y + 40, 120, 3);
	};

	drawInfo(challengerUsername, "CHALLENGER", 220, 560, "#00ff88");
	drawInfo(opponentUsername, "OPPONENT", 580, 560, "#ff3366");

	// --- 7. FOOTER BUTTON ---
	ctx.font = "24px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
	ctx.fillText("AWAITING RESPONSE...", 400, 720);

	return canvas.toBuffer("image/png").toString("base64");
}

// Main Card
export async function getMainCard(
	challenger: FightPlayerType,
	challengerIcon: string,
	opponent: FightPlayerType,
	opponentIcon: string,
	currentTurnId: string
): Promise<string> {
	const canvas = new Canvas(800, 800);
	const ctx = canvas.getContext("2d");

	// --- 1. BACKGROUND ENGINE ---
	const bg = ctx.createRadialGradient(400, 400, 50, 400, 400, 600);
	bg.addColorStop(0, "#1a1a2e");
	bg.addColorStop(1, "#0f0f1a");
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, 800, 800);

	// Subtle tech-grid overlay
	ctx.strokeStyle = "rgba(0, 255, 136, 0.1)";
	ctx.lineWidth = 1;
	for (let i = 0; i < 800; i += 40) {
		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, 800);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(800, i);
		ctx.stroke();
	}

	// --- 2. AVATARS & DATA ---
	const [avatar1, avatar2] = await Promise.all([loadImage(challengerIcon), loadImage(opponentIcon)]);

	const drawCoinIcon = (ctx, x, y, size) => {
		ctx.save();
		// Center the coin perfectly
		ctx.translate(x, y);

		// Coin Outer Circle
		ctx.beginPath();
		ctx.arc(0, 0, size, 0, Math.PI * 2);
		ctx.fillStyle = "#ffcc00";
		ctx.fill();
		ctx.strokeStyle = "#e6b800";
		ctx.lineWidth = 1.5;
		ctx.stroke();

		// Coin Inner Detail (Shine)
		ctx.beginPath();
		ctx.arc(-size / 3, -size / 3, size / 4, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
		ctx.fill();

		// The "C" for Coins - Adjusted for perfect centering
		ctx.font = `bold ${size * 1.2}px sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#997300";
		// Using 0, 0 because of the translate() above
		ctx.fillText("C", 0, 0);
		ctx.restore();
	};

	const drawPlayer = (
		img: Image,
		x: number,
		y: number,
		hp: number,
		coins: number,
		name: string,
		color: string,
		isLeft: boolean,
		isTurn: boolean
	) => {
		const align = isLeft ? "left" : "right";
		const panelX = isLeft ? 60 : 440;

		ctx.save();

		// Avatar Glow & Frame
		if (isTurn) {
			// Active Player Style
			ctx.shadowColor = color;
			ctx.shadowBlur = 20;
			ctx.beginPath();
			ctx.arc(x, y, 85, 0, Math.PI * 2);
			ctx.fillStyle = "#0f0f1a";
			ctx.fill();
			ctx.strokeStyle = color;
			ctx.lineWidth = 4;
			ctx.stroke();
			ctx.shadowBlur = 0; // Reset shadow for next elements
		} else {
			// Inactive Player Style (Simple border, no glow)
			ctx.beginPath();
			ctx.arc(x, y, 85, 0, Math.PI * 2);
			ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
			ctx.lineWidth = 2;
			ctx.stroke();
		}

		// Avatar Image
		ctx.beginPath();
		ctx.arc(x, y, 80, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(img, x - 80, y - 80, 160, 160);
		ctx.restore();

		// Stats Panel (The "Glass" Effect)
		// IMPORTANT: Changed from solid to rgba(255, 255, 255, 0.08)
		ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
		ctx.beginPath();
		ctx.roundRect(panelX, 290, 300, 180, 20);
		ctx.fill();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
		ctx.stroke();

		// Username
		ctx.font = "bold 28px sans-serif";
		ctx.textAlign = align;
		ctx.fillStyle = "#ffffff";
		ctx.fillText(name, isLeft ? 80 : 720, 335);

		// Health Bar Container (Dark Background)
		const hpWidth = 260;
		const barX = isLeft ? 80 : 460;
		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.beginPath();
		ctx.roundRect(barX, 355, hpWidth, 25, 5);
		ctx.fill();

		// Actual Health Fill
		const hpGrad = ctx.createLinearGradient(barX, 0, barX + hpWidth, 0);
		hpGrad.addColorStop(0, color);
		hpGrad.addColorStop(1, "#ffffff");

		ctx.fillStyle = hpGrad;
		const currentHpWidth = Math.max(0, (hp / 100) * hpWidth);
		ctx.beginPath();
		ctx.roundRect(barX, 355, currentHpWidth, 25, 5);
		ctx.fill();

		// Stats Text
		ctx.font = "bold 20px sans-serif";
		ctx.fillStyle = color;
		ctx.textAlign = align;
		ctx.fillText(`HP: ${hp}%`, isLeft ? 80 : 720, 410);

		// Dynamic Coin Alignment
		const coinY = 440;
		const iconSize = 10;
		let iconX: number, textX: number;

		if (isLeft) {
			iconX = 80 + iconSize; // Shift right by radius so it's inside the margin
			textX = iconX + iconSize + 10; // Space after icon
		} else {
			iconX = 720 - iconSize; // Shift left by radius so it's inside the margin
			textX = iconX - iconSize - 10; // Space before icon
		}

		drawCoinIcon(ctx, iconX, coinY, iconSize);

		ctx.fillStyle = "#ffcc00";
		ctx.textAlign = isLeft ? "left" : "right";
		// Adjusting Y slightly to match the middle of the icon
		ctx.fillText(`${coins} Coins`, textX, coinY + 7);
	};

	drawPlayer(
		avatar1,
		220,
		180,
		challenger.health,
		challenger.coins,
		challenger.username,
		"#00ff88",
		true,
		currentTurnId === challenger.memberId
	);
	drawPlayer(
		avatar2,
		580,
		180,
		opponent.health,
		opponent.coins,
		opponent.username,
		"#ff3366",
		false,
		currentTurnId === opponent.memberId
	);

	// --- 3. VS ICON ---
	ctx.font = "italic bold 64px sans-serif";
	ctx.textAlign = "center";
	ctx.fillStyle = "#ffffff";
	ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
	ctx.shadowBlur = 15;
	ctx.fillText("VS", 400, 200);
	ctx.shadowBlur = 0;

	// --- 4. EFFECTS PANEL ---
	const drawEffects = (x: number, y: number, w: number, h: number) => {
		ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, 20);
		ctx.fill();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
		ctx.stroke();

		ctx.font = "bold 20px sans-serif";
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
		ctx.fillText("ACTIVE BATTLE EFFECTS", 400, y + 35);

		// Left Side Effects
		ctx.textAlign = "left";
		ctx.font = "18px sans-serif";
		ctx.fillStyle = "#00ff88";
		challenger.activeEffects.forEach((eff, i) => {
			ctx.fillText(`• ${eff}`, x + 30, y + 75 + i * 30);
		});

		// Right Side Effects
		ctx.textAlign = "right";
		ctx.fillStyle = "#ff3366";
		opponent.activeEffects.forEach((eff, i) => {
			ctx.fillText(`${eff} •`, x + w - 30, y + 75 + i * 30);
		});
	};
	drawEffects(60, 500, 680, 240);

	// --- 5. CORNER ACCENTS ---
	ctx.strokeStyle = "#00ff88";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(40, 100);
	ctx.lineTo(40, 40);
	ctx.lineTo(100, 40);
	ctx.stroke();

	ctx.strokeStyle = "#ff3366";
	ctx.beginPath();
	ctx.moveTo(700, 760);
	ctx.lineTo(760, 760);
	ctx.lineTo(760, 700);
	ctx.stroke();

	return canvas.toBuffer("image/png").toString("base64");
}

// Surrender Card
export async function getSurrenderCard(
	winnerUsername: string,
	winnerIcon: string,
	surrenderUsername: string,
	surrenderIcon: string
): Promise<string> {
	const canvas = new Canvas(800, 800);
	const ctx = canvas.getContext("2d");

	// --- 1. DARK VIGNETTE BACKGROUND ---
	const bg = ctx.createRadialGradient(400, 400, 50, 400, 400, 600);
	bg.addColorStop(0, "#2d0b0b"); // Dark crimson center
	bg.addColorStop(1, "#0a0a0c"); // Pitch black edges
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, 800, 800);

	// Add a "Shattered" texture effect (Subtle lines)
	ctx.strokeStyle = "rgba(255, 51, 102, 0.05)";
	for (let i = 0; i < 10; i++) {
		ctx.beginPath();
		ctx.moveTo(Math.random() * 800, 0);
		ctx.lineTo(Math.random() * 800, 800);
		ctx.stroke();
	}

	// --- 2. ADVANCED BORDER (ANGLED CORNERS) ---
	const drawCyberFrame = (color: string) => {
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		// Top-left notched corner
		ctx.moveTo(100, 50);
		ctx.lineTo(700, 50);
		ctx.lineTo(750, 100);
		// Bottom-right notched corner
		ctx.lineTo(750, 700);
		ctx.lineTo(700, 750);
		ctx.lineTo(100, 750);
		ctx.lineTo(50, 700);
		ctx.lineTo(50, 100);
		ctx.closePath();
		ctx.stroke();
	};
	drawCyberFrame("rgba(255, 51, 102, 0.4)");

	// --- 3. HEADER (SURRENDERED) ---
	ctx.font = "italic bold 64px sans-serif";
	ctx.textAlign = "center";
	ctx.shadowColor = "#ff3366";
	ctx.shadowBlur = 25;
	ctx.fillStyle = "#ff3366";
	ctx.fillText("SURRENDERED", 400, 140);
	ctx.shadowBlur = 0;

	// --- 4. AVATARS ---
	const [playerAvatar, winnerAvatar] = await Promise.all([loadImage(surrenderIcon), loadImage(winnerIcon)]);

	const drawAvatarStat = (img: Image, x: number, y: number, color: string, isWinner: boolean) => {
		ctx.save();

		// Outer Ring
		ctx.beginPath();
		ctx.arc(x, y, 110, 0, Math.PI * 2);
		ctx.strokeStyle = color;
		ctx.lineWidth = 4;
		if (isWinner) {
			ctx.shadowColor = color;
			ctx.shadowBlur = 20;
		}
		ctx.stroke();

		// Avatar Clip
		ctx.beginPath();
		ctx.arc(x, y, 100, 0, Math.PI * 2);
		ctx.clip();

		// If surrendered, make it slightly darker/greyscale
		ctx.drawImage(img, x - 100, y - 100, 200, 200);
		if (!isWinner) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			ctx.fillRect(x - 100, y - 100, 200, 200);
		}
		ctx.restore();
	};

	drawAvatarStat(playerAvatar, 240, 380, "#ff3366", false);
	drawAvatarStat(winnerAvatar, 560, 380, "#00ff88", true);

	// --- 5. VS & UI ELEMENTS ---
	ctx.font = "bold 40px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
	ctx.fillText("VS", 400, 395);

	// --- VECTOR CROWN (Replaces Emoji) ---
	const drawVectorCrown = (ctx: SKRSContext2D, x: number, y: number, color: string) => {
		ctx.save();
		ctx.translate(x, y);
		ctx.fillStyle = color;
		ctx.shadowColor = color;
		ctx.shadowBlur = 15;

		ctx.beginPath();
		// Drawing a sharp, "advanced" tactical crown
		ctx.moveTo(-30, 0); // Bottom left
		ctx.lineTo(30, 0); // Bottom right
		ctx.lineTo(40, -20); // Right point
		ctx.lineTo(20, -10); // Right dip
		ctx.lineTo(0, -40); // Middle peak
		ctx.lineTo(-20, -10); // Left dip
		ctx.lineTo(-40, -20); // Left point
		ctx.closePath();

		ctx.fill();
		ctx.restore();
	};

	// Winner Crown Icon (Simple Drawing)
	drawVectorCrown(ctx, 560, 240, "#00ff88");

	// --- 6. USER DATA BLOCKS ---
	const drawData = (name: string, label: string, x: number, y: number, color: string) => {
		// Label
		ctx.font = "bold 20px sans-serif";
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.fillText(label, x, y);

		// Name
		ctx.font = "bold 32px sans-serif";
		ctx.fillStyle = color;
		ctx.shadowBlur = 10;
		ctx.shadowColor = color;
		ctx.fillText(name, x, y + 45);
		ctx.shadowBlur = 0;
	};

	drawData(surrenderUsername, "LOSER", 240, 540, "#ff3366");
	drawData(winnerUsername, "WINNER", 560, 540, "#00ff88");

	// --- 7. FOOTER DECORATION ---
	ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
	ctx.setLineDash([5, 5]);
	ctx.beginPath();
	ctx.moveTo(150, 680);
	ctx.lineTo(650, 680);
	ctx.stroke();

	return canvas.toBuffer("image/png").toString("base64");
}

// Denied Card
export async function getDeniedCard(
	challengerUsername: string,
	challengerIcon: string,
	opponentUsername: string,
	opponentIcon: string
): Promise<string> {
	const canvas = new Canvas(800, 800);
	const ctx = canvas.getContext("2d");

	// --- 1. GLITCH & ERROR BACKGROUND ---
	// Darker red/black radial for a "Warning" feel
	const bg = ctx.createRadialGradient(400, 400, 50, 400, 400, 600);
	bg.addColorStop(0, "#2d0b0b");
	bg.addColorStop(1, "#0d0d0d");
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, 800, 800);

	// Add horizontal "Digital Noise" bars
	ctx.fillStyle = "rgba(255, 51, 102, 0.05)";
	for (let i = 0; i < 20; i++) {
		ctx.fillRect(0, Math.random() * 800, 800, Math.random() * 5);
	}

	// --- 2. THE "DENIED" FRAME ---
	const drawDeniedFrame = () => {
		ctx.strokeStyle = "#ff3366";
		ctx.lineWidth = 4;
		ctx.setLineDash([20, 10]); // Tech-dashed line
		ctx.strokeRect(40, 40, 720, 720);
		ctx.setLineDash([]);

		// Add corner accents
		ctx.fillStyle = "#ff3366";
		const size = 40;
		// Top Left
		ctx.fillRect(40, 40, size, 5);
		ctx.fillRect(40, 40, 5, size);
		// Top Right
		ctx.fillRect(760 - size, 40, size, 5);
		ctx.fillRect(755, 40, 5, size);
		// Bottom Left
		ctx.fillRect(40, 755, size, 5);
		ctx.fillRect(40, 760 - size, 5, size);
		// Bottom Right
		ctx.fillRect(760 - size, 755, size, 5);
		ctx.fillRect(755, 760 - size, 5, size);
	};
	drawDeniedFrame();

	// --- 3. HEADER (DENIED) ---
	ctx.font = "bold 80px sans-serif";
	ctx.textAlign = "center";
	ctx.shadowColor = "#ff3366";
	ctx.shadowBlur = 30;
	ctx.fillStyle = "#ffffff";
	ctx.fillText("DENIED", 400, 140);
	ctx.shadowBlur = 0;

	// --- 4. AVATARS ---
	const [challengerAvatar, opponentAvatar] = await Promise.all([loadImage(challengerIcon), loadImage(opponentIcon)]);

	// Draw Challenger (Normal)
	ctx.save();
	ctx.beginPath();
	ctx.arc(240, 400, 100, 0, Math.PI * 2);
	ctx.strokeStyle = "#00ff88";
	ctx.lineWidth = 5;
	ctx.stroke();
	ctx.clip();
	ctx.drawImage(challengerAvatar, 140, 300, 200, 200);
	ctx.restore();

	// Draw Opponent (With "X" Overlay)
	ctx.save();
	// Background Red Glow for Opponent
	ctx.beginPath();
	ctx.arc(560, 400, 110, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(255, 51, 102, 0.2)";
	ctx.fill();

	ctx.beginPath();
	ctx.arc(560, 400, 100, 0, Math.PI * 2);
	ctx.strokeStyle = "#ff3366";
	ctx.lineWidth = 5;
	ctx.stroke();
	ctx.clip();
	ctx.drawImage(opponentAvatar, 460, 300, 200, 200);

	// Red "X" over the denied avatar
	ctx.restore();
	ctx.strokeStyle = "rgba(255, 51, 102, 0.8)";
	ctx.lineWidth = 15;
	ctx.beginPath();
	ctx.moveTo(510, 350);
	ctx.lineTo(610, 450);
	ctx.moveTo(610, 350);
	ctx.lineTo(510, 450);
	ctx.stroke();

	// --- 5. VS TEXT ---
	ctx.font = "bold 50px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
	ctx.fillText("VS", 400, 415);

	// --- 6. LABELS & USERNAMES ---
	const drawUserLabel = (name: string, role: string, x: number, y: number, color: string) => {
		// Role (Challenger / Denied)
		ctx.font = "bold 22px sans-serif";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(role, x, y);

		// Username
		ctx.font = "bold 32px sans-serif";
		ctx.fillStyle = color;
		ctx.fillText(name, x, y + 45);

		// Underline
		ctx.fillStyle = color;
		ctx.fillRect(x - 80, y + 60, 160, 4);
	};

	drawUserLabel(challengerUsername, "CHALLENGER", 240, 560, "#00ff88");
	drawUserLabel(opponentUsername, "DENIED ACCESS", 560, 560, "#ff3366");

	// --- 7. FOOTER STATUS ---
	ctx.font = "20px sans-serif";
	ctx.fillStyle = "rgba(255, 51, 102, 0.7)";
	ctx.fillText("REQUEST TERMINATED BY USER", 400, 720);

	return canvas.toBuffer("image/png").toString("base64");
}

// Win Card
export async function getWinCard(
	winnerUsername: string,
	winnerIcon: string,
	loserUsername: string,
	loserIcon: string
): Promise<string> {
	const canvas = new Canvas(800, 800);
	const ctx = canvas.getContext("2d");

	// --- 1. PRESTIGE BACKGROUND ---
	const bg = ctx.createRadialGradient(400, 450, 50, 400, 400, 600);
	bg.addColorStop(0, "#3d2b00"); // Deep victory gold
	bg.addColorStop(1, "#0a0a0c"); // Cinematic black
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, 800, 800);

	// Dynamic background "Rays of Glory"
	ctx.strokeStyle = "rgba(255, 204, 0, 0.08)";
	ctx.lineWidth = 3;
	for (let i = 0; i < 360; i += 20) {
		ctx.save();
		ctx.translate(400, 380);
		ctx.rotate((i * Math.PI) / 180);
		ctx.beginPath();
		ctx.moveTo(0, 120);
		ctx.lineTo(0, 1000);
		ctx.stroke();
		ctx.restore();
	}

	// --- 2. TACTICAL BORDER ---
	const drawBorder = () => {
		ctx.strokeStyle = "#ffcc00";
		ctx.lineWidth = 2;
		ctx.strokeRect(50, 50, 700, 700);

		// Heavy Corner Accents
		ctx.fillStyle = "#ffcc00";
		const len = 60;
		const thick = 8;
		// TL
		ctx.fillRect(50, 50, len, thick);
		ctx.fillRect(50, 50, thick, len);
		// TR
		ctx.fillRect(750 - len, 50, len, thick);
		ctx.fillRect(750 - thick, 50, thick, len);
		// BL
		ctx.fillRect(50, 750 - thick, len, thick);
		ctx.fillRect(50, 750 - len, thick, len);
		// BR
		ctx.fillRect(750 - len, 750 - thick, len, thick);
		ctx.fillRect(750 - thick, 750 - len, thick, len);
	};
	drawBorder();

	// --- 3. HEADER (CHAMPION) ---
	ctx.font = "italic bold 90px sans-serif";
	ctx.textAlign = "center";
	ctx.shadowColor = "#ffcc00";
	ctx.shadowBlur = 35;
	ctx.fillStyle = "#ffffff";
	ctx.fillText("VICTORIOUS", 400, 150);
	ctx.shadowBlur = 0;

	// --- 4. THE PODIUM (AVATARS) ---
	const [winnerAvatar, loserAvatar] = await Promise.all([loadImage(winnerIcon), loadImage(loserIcon)]);

	// Winner - Large and Centered
	const winX = 400,
		winY = 380,
		winRad = 130;
	ctx.save();
	ctx.shadowColor = "#ffcc00";
	ctx.shadowBlur = 30;
	ctx.beginPath();
	ctx.arc(winX, winY, winRad + 5, 0, Math.PI * 2);
	ctx.strokeStyle = "#ffcc00";
	ctx.lineWidth = 6;
	ctx.stroke();
	ctx.clip();
	ctx.drawImage(winnerAvatar, winX - winRad, winY - winRad, winRad * 2, winRad * 2);
	ctx.restore();

	// Large Vector Crown
	const drawCrown = (x: number, y: number) => {
		ctx.save();
		ctx.translate(x, y);
		ctx.fillStyle = "#ffcc00";
		ctx.shadowColor = "#ffcc00";
		ctx.shadowBlur = 15;
		ctx.beginPath();
		ctx.moveTo(-50, 0);
		ctx.lineTo(50, 0);
		ctx.lineTo(65, -35);
		ctx.lineTo(25, -15);
		ctx.lineTo(0, -60);
		ctx.lineTo(-25, -15);
		ctx.lineTo(-65, -35);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	};
	drawCrown(winX, winY - winRad - 20);

	// Loser - Small and Off-Center
	const loseX = 620,
		loseY = 550,
		loseRad = 70;
	ctx.save();
	ctx.beginPath();
	ctx.arc(loseX, loseY, loseRad, 0, Math.PI * 2);
	ctx.strokeStyle = "#ff3366";
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.clip();
	ctx.drawImage(loserAvatar, loseX - loseRad, loseY - loseRad, loseRad * 2, loseRad * 2);
	// Darken loser significantly
	ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	ctx.fillRect(loseX - loseRad, loseY - loseRad, loseRad * 2, loseRad * 2);
	ctx.restore();

	// --- 5. TEXT LABELS ---
	// Winner Name
	ctx.font = "bold 42px sans-serif";
	ctx.fillStyle = "#ffcc00";
	ctx.textAlign = "center";
	ctx.fillText(winnerUsername.toUpperCase(), winX, winY + winRad + 60);

	ctx.font = "24px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	ctx.fillText("BATTLE MVP", winX, winY + winRad + 95);

	// Loser Name
	ctx.font = "bold 24px sans-serif";
	ctx.fillStyle = "#ff3366";
	ctx.textAlign = "center";
	ctx.fillText(loserUsername, loseX, loseY + loseRad + 35);

	ctx.font = "18px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
	ctx.fillText("DEFEATED", loseX, loseY + loseRad + 60);

	// --- 6. DECORATIVE QUOTE ---
	ctx.font = "italic 20px sans-serif";
	ctx.fillStyle = "rgba(255, 204, 0, 0.4)";
	ctx.fillText("“There is no substitute for victory.”", 400, 720);

	return canvas.toBuffer("image/png").toString("base64");
}

// Timeout Card
export async function getTimeoutCard(
	challengerUsername: string,
	challengerIcon: string,
	opponentUsername: string,
	opponentIcon: string
): Promise<string> {
	const canvas = new Canvas(800, 800);
	const ctx = canvas.getContext("2d");

	// --- 1. AMBER "FROZEN" BACKGROUND ---
	const bg = ctx.createLinearGradient(0, 0, 800, 800);
	bg.addColorStop(0, "#2b230b"); // Dark amber/brown
	bg.addColorStop(1, "#0d0d0f"); // Deep black
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, 800, 800);

	// Add a "Dust" particle effect for an old-clock feel
	ctx.fillStyle = "rgba(255, 224, 102, 0.1)";
	for (let i = 0; i < 50; i++) {
		ctx.beginPath();
		ctx.arc(Math.random() * 800, Math.random() * 800, Math.random() * 2, 0, Math.PI * 2);
		ctx.fill();
	}

	// --- 2. THE CHRONO-FRAME ---
	const drawChronoFrame = () => {
		ctx.strokeStyle = "#ffe066";
		ctx.lineWidth = 2;
		// Main rectangle with cut-outs
		ctx.strokeRect(60, 60, 680, 680);

		// Decorative "Loading" brackets
		ctx.lineWidth = 6;
		// Top-Center notch
		ctx.beginPath();
		ctx.moveTo(350, 60);
		ctx.lineTo(450, 60);
		ctx.stroke();
		// Bottom-Center notch
		ctx.beginPath();
		ctx.moveTo(350, 740);
		ctx.lineTo(450, 740);
		ctx.stroke();
	};
	drawChronoFrame();

	// --- 3. HEADER (TIMEOUT) ---
	ctx.font = "bold 70px sans-serif";
	ctx.textAlign = "center";
	ctx.shadowColor = "#ffe066";
	ctx.shadowBlur = 20;
	ctx.fillStyle = "#ffe066";
	ctx.fillText("TIME EXPIRED", 400, 140);
	ctx.shadowBlur = 0;

	// --- 4. AVATARS (DESATURATED/FROZEN) ---
	const [challengerAvatar, opponentAvatar] = await Promise.all([loadImage(challengerIcon), loadImage(opponentIcon)]);

	const drawFrozenAvatar = (img: Image, x: number, y: number) => {
		ctx.save();
		// Glowing Ring
		ctx.beginPath();
		ctx.arc(x, y, 105, 0, Math.PI * 2);
		ctx.strokeStyle = "#ffe066";
		ctx.lineWidth = 4;
		ctx.stroke();

		// Clip Avatar
		ctx.beginPath();
		ctx.arc(x, y, 100, 0, Math.PI * 2);
		ctx.clip();

		// Draw image with a sepia/dark overlay to look "timed out"
		ctx.drawImage(img, x - 100, y - 100, 200, 200);
		ctx.fillStyle = "rgba(43, 35, 11, 0.5)"; // Amber tint
		ctx.fillRect(x - 100, y - 100, 200, 200);
		ctx.restore();
	};

	drawFrozenAvatar(challengerAvatar, 240, 380);
	drawFrozenAvatar(opponentAvatar, 560, 380);

	// --- 5. VS & TIMER ICON ---
	ctx.font = "bold 40px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
	ctx.fillText("VS", 400, 395);

	// Small "Clock" icon drawing (simplified)
	ctx.strokeStyle = "#ffe066";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(400, 440, 15, 0, Math.PI * 2);
	ctx.moveTo(400, 440);
	ctx.lineTo(400, 430); // Hand 1
	ctx.moveTo(400, 440);
	ctx.lineTo(410, 440); // Hand 2
	ctx.stroke();

	// --- 6. USER LABELS ---
	const drawUser = (name: string, role: string, x: number, y: number) => {
		ctx.font = "20px sans-serif";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(role, x, y);

		ctx.font = "bold 30px sans-serif";
		ctx.fillStyle = "#ffe066";
		ctx.fillText(name, x, y + 40);
	};

	drawUser(challengerUsername, "CHALLENGER", 240, 560);
	drawUser(opponentUsername, "OPPONENT", 560, 560);

	// --- 7. FOOTER MESSAGE ---
	ctx.font = "italic 22px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	ctx.fillText("Match cancelled due to inactivity", 400, 710);

	return canvas.toBuffer("image/png").toString("base64");
}
