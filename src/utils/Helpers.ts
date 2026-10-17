import { randomBytes } from "crypto";
import { ColorResolvable, resolveColor } from "discord.js";

/**
 * Generates a cryptographically secure random string with a prefix.
 * @param length Length of the random suffix.
 * @param prefix Optional prefix for the customId (default "weky_").
 */
export function getRandomString(length: number = 8, prefix: string = "weky_"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(length);
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Converts milliseconds into a clean human-readable duration string.
 * @param ms Duration in milliseconds.
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);

  return parts.join(", ");
}

/**
 * Randomly shuffles characters in a string.
 */
export function shuffleString(str: string): string {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

/**
 * Randomly shuffles an array using Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

/**
 * Safely resolves any Discord color (Hex, Name, Number).
 */
export function safeResolveColor(color?: ColorResolvable | string | number | null, fallback: number = 0x5865f2): number {
  if (!color) return fallback;
  try {
    return resolveColor(color as ColorResolvable);
  } catch {
    return fallback;
  }
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
