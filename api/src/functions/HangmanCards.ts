import { Canvas, SKRSContext2D, loadImage } from "@napi-rs/canvas";

export const getHangmanCard = async function (
    state: number, 
    displayWord: string, 
    guessedLetters: string[],
    username: string,
    userIcon: string,
    gameOver: boolean,
    won: boolean
): Promise<string> {
    const canvas = new Canvas(800, 500); 
    const ctx = canvas.getContext("2d");

    // --- BACKGROUND ---
    const bg = ctx.createRadialGradient(400, 250, 50, 400, 250, 600);
    bg.addColorStop(0, "#3e4451");
    bg.addColorStop(1, "#1e2127");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- HEADER (User Info) ---
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    drawRoundedRect(ctx, 20, 20, 300, 60, 30);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(username, 90, 58);

    try {
        const avatar = await loadImage(userIcon);
        ctx.save();
        ctx.beginPath();
        ctx.arc(50, 50, 25, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 25, 25, 50, 50);
        ctx.restore();
    } catch (e) {  }


    // --- DRAW GALLOWS (Left Side) ---
    const gallowsX = 50; 
    const gallowsY = 50; 

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(200 + gallowsX, 380 + gallowsY, 150, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wood
    drawWoodenBeam(ctx, 80 + gallowsX, 380 + gallowsY, 320 + gallowsX, 380 + gallowsY);
    drawWoodenBeam(ctx, 120 + gallowsX, 380 + gallowsY, 120 + gallowsX, 60 + gallowsY);
    drawWoodenBeam(ctx, 120 + gallowsX, 60 + gallowsY, 280 + gallowsX, 60 + gallowsY);
    drawWoodenBeam(ctx, 120 + gallowsX, 130 + gallowsY, 180 + gallowsX, 60 + gallowsY);

    // Rope
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(280 + gallowsX, 60 + gallowsY);
    ctx.lineTo(280 + gallowsX, 110 + gallowsY);
    ctx.stroke();

    // The Man
    if (state >= 1) drawRealisticHead(ctx, 280 + gallowsX, 135 + gallowsY);
    if (state >= 2) drawWoodenBeam(ctx, 280 + gallowsX, 160 + gallowsY, 280 + gallowsX, 260 + gallowsY, 8, "#2c3e50");
    if (state >= 3) drawWoodenBeam(ctx, 280 + gallowsX, 180 + gallowsY, 240 + gallowsX, 230 + gallowsY, 6, "#2c3e50");
    if (state >= 4) drawWoodenBeam(ctx, 280 + gallowsX, 180 + gallowsY, 320 + gallowsX, 230 + gallowsY, 6, "#2c3e50");
    if (state >= 5) drawWoodenBeam(ctx, 280 + gallowsX, 260 + gallowsY, 250 + gallowsX, 330 + gallowsY, 7, "#2c3e50");
    if (state >= 6) drawWoodenBeam(ctx, 280 + gallowsX, 260 + gallowsY, 310 + gallowsX, 330 + gallowsY, 7, "#2c3e50");


    // --- UI: RIGHT SIDE ---
    const rightCenterX = 600;

    // The Word
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    const fontSize = displayWord.length > 15 ? 40 : 50; 
    ctx.font = `bold ${fontSize}px monospace`; 
    ctx.fillText(displayWord, rightCenterX, 220);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "20px sans-serif";
    ctx.fillText("GUESS THE WORD", rightCenterX, 170);

    // --- UI: WRONG CHARACTERS ---
    const wrongLetters = guessedLetters.filter(l => !displayWord.includes(l));

    if (wrongLetters.length > 0) {
        const boxY = 300;
        
        // Label
        ctx.fillStyle = "#ff5555";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("WRONG GUESSES", rightCenterX, boxY);

        // Background box for letters
        const boxWidth = 350;
        const boxHeight = 60;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        drawRoundedRect(ctx, rightCenterX - boxWidth/2, boxY + 15, boxWidth, boxHeight, 15);

        // The Letters
        ctx.fillStyle = "#ffaaaa";
        ctx.font = "bold 30px monospace";
        ctx.textBaseline = "middle";
        ctx.fillText(wrongLetters.join("  "), rightCenterX, boxY + 15 + boxHeight/2);
        ctx.textBaseline = "alphabetic"; // Reset
    }


    // --- UI: WIN/LOSS OVERLAY ---
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-0.1);

        ctx.font = "bold 80px sans-serif";
        ctx.textAlign = "center";
        
        if (won) {
            ctx.shadowColor = "#00ff00";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("VICTORY!", 0, 0);
        } else {
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "#ff5555";
            ctx.fillText("GAME OVER", 0, 0);
            
            ctx.font = "bold 30px sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`Word was: ${displayWord.replace(/ /g, "")}`, 0, 60);
        }
        ctx.restore();
    }

    return canvas.toBuffer("image/png").toString("base64");
};

function drawWoodenBeam(ctx: SKRSContext2D, x1: number, y1: number, x2: number, y2: number, width = 15, color?: string) {
    ctx.save();
    ctx.lineWidth = width;
    ctx.lineCap = "square";
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    if (color) {
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, "#455a64"); 
    } else {
        grad.addColorStop(0, "#3d2b1f"); 
        grad.addColorStop(0.5, "#5d4037"); 
        grad.addColorStop(1, "#3d2b1f");
    }
    ctx.strokeStyle = grad;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

function drawRealisticHead(ctx: SKRSContext2D, x: number, y: number) {
    ctx.save();
    ctx.fillStyle = "#2c3e50";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a1887f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y + 5, 28, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
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