import { AttachmentBuilder, User } from "discord.js";

import { Canvas, loadImage } from "@napi-rs/canvas";

import { PlayerData } from "../Types/fight";

// Request Card
export async function getRequestCard(challenger: User, opponent: User): Promise<AttachmentBuilder> {
    const canvas = new Canvas(800, 800); // Square aspect ratio
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(750, 50);
    ctx.lineTo(750, 750);
    ctx.lineTo(50, 750);
    ctx.closePath();
    ctx.stroke();

    // Add inner border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 70);
    ctx.lineTo(730, 70);
    ctx.lineTo(730, 730);
    ctx.lineTo(70, 730);
    ctx.closePath();
    ctx.stroke();

    // Add decorative corner elements
    const drawCorner = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 30);
        ctx.stroke();
        ctx.restore();
    };

    drawCorner(50, 50, 0);
    drawCorner(750, 50, Math.PI / 2);
    drawCorner(750, 750, Math.PI);
    drawCorner(50, 750, -Math.PI / 2);

    // Add title with glow effect (moved lower)
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00ff88';
    ctx.fillText('FIGHT REQUEST', 400, 150);
    ctx.shadowBlur = 0;

    // Load avatars
    const [challengerAvatar, opponentAvatar] = await Promise.all([
        loadImage(challenger.displayAvatarURL({ extension: 'png', size: 256 })),
        loadImage(opponent.displayAvatarURL({ extension: 'png', size: 256 }))
    ]);

    // Avatar positions (closer to VS, but with more space between icon and VS)
    const leftX = 240;
    const rightX = 560;
    const avatarY = 390;
    const usernameY = avatarY + 130;
    const labelY = usernameY + 40;
    const lineY = labelY + 15;

    // Draw challenger avatar (left)
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftX, avatarY, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(challengerAvatar, leftX - 100, avatarY - 100, 200, 200);
    ctx.restore();

    // Draw opponent avatar (right)
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightX, avatarY, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(opponentAvatar, rightX - 100, avatarY - 100, 200, 200);
    ctx.restore();

    // Add VS text with glow (add more space between avatars and VS)
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VS', 400, avatarY + 10);
    ctx.shadowBlur = 0;

    // Add usernames (centered under avatars)
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ff88';
    ctx.fillText(challenger.username, leftX, usernameY);
    ctx.shadowBlur = 0;

    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff3366';
    ctx.fillText(opponent.username, rightX, usernameY);
    ctx.shadowBlur = 0;

    // Add labels (centered under usernames)
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHALLENGER', leftX, labelY);
    ctx.fillText('OPPONENT', rightX, labelY);

    // Add colored lines under labels
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX - 60, lineY);
    ctx.lineTo(leftX + 60, lineY);
    ctx.stroke();

    ctx.strokeStyle = '#ff3366';
    ctx.beginPath();
    ctx.moveTo(rightX - 60, lineY);
    ctx.lineTo(rightX + 60, lineY);
    ctx.stroke();

    // Add "Click Accept to Start" text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Click Accept to Start', 400, 700);

    return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: 'fight-request.png' });
}

// Main Card
export async function getMainCard(player1: PlayerData, player2: PlayerData): Promise<AttachmentBuilder> {
    const canvas = new Canvas(800, 800); // Square aspect ratio
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(750, 50);
    ctx.lineTo(750, 750);
    ctx.lineTo(50, 750);
    ctx.closePath();
    ctx.stroke();

    // Add inner border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 70);
    ctx.lineTo(730, 70);
    ctx.lineTo(730, 730);
    ctx.lineTo(70, 730);
    ctx.closePath();
    ctx.stroke();

    // Load avatars
    const [avatar1, avatar2] = await Promise.all([
        loadImage(player1.member.displayAvatarURL({ extension: 'png', size: 256 })),
        loadImage(player2.member.displayAvatarURL({ extension: 'png', size: 256 }))
    ]);

    // Draw player 1 section (left)
    // Avatar frame
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 200, 80, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(avatar1, 120, 120, 160, 160);
    ctx.restore();

    // Health bar player 1
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(100, 320, 200, 30);
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(100, 320, (player1.health / 100) * 200, 30);

    // Health bar border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 320, 200, 30);

    // Player 1 stats
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(player1.member.username, 100, 380);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#00ff88';
    ctx.fillText(`HP: ${player1.health}`, 100, 410);
    ctx.fillText(`Coins: ${player1.coins}`, 100, 440);

    // Draw player 2 section (right)
    // Avatar frame
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 200, 80, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(avatar2, 520, 120, 160, 160);
    ctx.restore();

    // Health bar player 2
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(500, 320, 200, 30);
    ctx.fillStyle = '#ff3366';
    ctx.fillRect(500, 320, (player2.health / 100) * 200, 30);

    // Health bar border
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2;
    ctx.strokeRect(500, 320, 200, 30);

    // Player 2 stats
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(player2.member.username, 700, 380);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#ff3366';
    ctx.fillText(`HP: ${player2.health}`, 700, 410);
    ctx.fillText(`Coins: ${player2.coins}`, 700, 440);

    // VS text
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('VS', 400, 200);

    // Active effects section
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(100, 500, 600, 200);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 500, 600, 200);

    // Player 1 effects
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    ctx.fillText(`${player1.member.username}'s Effects:`, 120, 530);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    player1.activeEffects.forEach((effect, i) => {
        ctx.fillText(`• ${effect}`, 120, 560 + (i * 25));
    });

    // Player 2 effects
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#ff3366';
    ctx.textAlign = 'right';
    ctx.fillText(`${player2.member.username}'s Effects:`, 680, 530);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    player2.activeEffects.forEach((effect, i) => {
        ctx.fillText(`• ${effect}`, 680, 560 + (i * 25));
    });

    // Add decorative corner elements
    const drawCorner = (x: number, y: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 30);
        ctx.stroke();
        ctx.restore();
    };

    drawCorner(50, 50, 0);
    drawCorner(750, 50, Math.PI / 2);
    drawCorner(750, 750, Math.PI);
    drawCorner(50, 750, -Math.PI / 2);

    return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: 'fight-status.png' });
}

// Surrender Card
export async function getSurrenderCard(player: User, winner: User): Promise<AttachmentBuilder> {
    const canvas = new Canvas(800, 800);
    const ctx = canvas.getContext('2d');
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#2d0b0b');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);
    // Borders
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 700, 700);
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 1;
    ctx.strokeRect(70, 70, 660, 660);
    // Title
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff3366';
    ctx.fillText('SURRENDERED', 400, 150);
    ctx.shadowBlur = 0;
    // Avatars
    const [playerAvatar, winnerAvatar] = await Promise.all([
        loadImage(player.displayAvatarURL({ extension: 'png', size: 256 })),
        loadImage(winner.displayAvatarURL({ extension: 'png', size: 256 }))
    ]);
    ctx.save();
    ctx.beginPath();
    ctx.arc(250, 400, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(playerAvatar, 150, 300, 200, 200);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(550, 400, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(winnerAvatar, 450, 300, 200, 200);
    ctx.restore();
    // VS text
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 10;
    ctx.fillText('VS', 400, 420);
    ctx.shadowBlur = 0;
    // Usernames
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ff3366';
    ctx.fillText(player.username, 250, 550);
    ctx.fillStyle = '#00ff88';
    ctx.fillText(winner.username, 550, 550);
    // Labels
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SURRENDERED', 250, 590);
    ctx.fillText('WINNER', 550, 590);
    // Message
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${player.username} has surrendered! ${winner.username} wins!`, 400, 700);
    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'fight-surrender.png' });
}

// Denied Card
export async function getDeniedCard(challenger: User, opponent: User): Promise<AttachmentBuilder> {
    const canvas = new Canvas(800, 800);
    const ctx = canvas.getContext('2d');
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#2d0b0b');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);
    // Borders
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 700, 700);
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 1;
    ctx.strokeRect(70, 70, 660, 660);
    // Title
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff3366';
    ctx.fillText('DENIED', 400, 150);
    ctx.shadowBlur = 0;
    // Avatars
    const [challengerAvatar, opponentAvatar] = await Promise.all([
        loadImage(challenger.displayAvatarURL({ extension: 'png', size: 256 })),
        loadImage(opponent.displayAvatarURL({ extension: 'png', size: 256 }))
    ]);
    ctx.save();
    ctx.beginPath();
    ctx.arc(250, 400, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(challengerAvatar, 150, 300, 200, 200);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(550, 400, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(opponentAvatar, 450, 300, 200, 200);
    ctx.restore();
    // VS text
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 10;
    ctx.fillText('VS', 400, 420);
    ctx.shadowBlur = 0;
    // Usernames
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#00ff88';
    ctx.fillText(challenger.username, 250, 550);
    ctx.fillStyle = '#ff3366';
    ctx.fillText(opponent.username, 550, 550);
    // Labels
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHALLENGER', 250, 590);
    ctx.fillText('DENIED', 550, 590);
    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'fight-denied.png' });
}

// Timeout Card
export async function getTimeoutCard(challenger: User, opponent: User): Promise<AttachmentBuilder> {
    const canvas = new Canvas(800, 800);
    const ctx = canvas.getContext('2d');
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#2e2e0b');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);
    // Borders
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 700, 700);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 1;
    ctx.strokeRect(70, 70, 660, 660);
    // Title
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffe066';
    ctx.fillText('TIMEOUT', 400, 150);
    ctx.shadowBlur = 0;
    // Avatars
    const [challengerAvatar, opponentAvatar] = await Promise.all([
        loadImage(challenger.displayAvatarURL({ extension: 'png', size: 256 })),
        loadImage(opponent.displayAvatarURL({ extension: 'png', size: 256 }))
    ]);
    ctx.save();
    ctx.beginPath();
    ctx.arc(250, 400, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(challengerAvatar, 150, 300, 200, 200);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(550, 400, 100, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(opponentAvatar, 450, 300, 200, 200);
    ctx.restore();
    // VS text
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 10;
    ctx.fillText('VS', 400, 420);
    ctx.shadowBlur = 0;
    // Usernames
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffe066';
    ctx.fillText(challenger.username, 250, 550);
    ctx.fillText(opponent.username, 550, 550);
    // Labels
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHALLENGER', 250, 590);
    ctx.fillText('OPPONENT', 550, 590);
    // Message
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('No response in time. The fight was cancelled.', 400, 700);
    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'fight-timeout.png' });
}