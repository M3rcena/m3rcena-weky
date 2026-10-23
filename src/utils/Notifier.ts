/**
 * Utility functions for update checking and terminal box notifications.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

const yellow = (s: string) => `\x1b[33m${s}\x1b[39m`;
const green = (s: string) => `\x1b[32m${s}\x1b[39m`;
const red = (s: string) => `\x1b[31m${s}\x1b[39m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[39m`;

/**
 * Strips ANSI color escape codes to compute visible string length.
 */
export function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Renders an array of text messages inside a styled terminal box.
 */
export function boxConsole(messages: string[]): void {
  const defaultSpace = 4;
  const stripped = messages.map((m) => stripAnsi(m));
  const maxLen = Math.max(...stripped.map((s) => s.length)) + defaultSpace * 2;
  const line = yellow("─".repeat(maxLen));

  console.log(yellow("┌") + line + yellow("┐"));
  console.log(yellow("│") + " ".repeat(maxLen) + yellow("│"));

  for (let i = 0; i < messages.length; i++) {
    const len = stripped[i].length;
    const padTotal = maxLen - len;
    const padLeft = Math.floor(padTotal / 2);
    const padRight = padTotal - padLeft;
    console.log(yellow("│") + " ".repeat(padLeft) + messages[i] + " ".repeat(padRight) + yellow("│"));
  }

  console.log(yellow("│") + " ".repeat(maxLen) + yellow("│"));
  console.log(yellow("└") + line + yellow("┘"));
}

/**
 * Compares two semantic version strings.
 * Returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2.
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = v1
    .replace(/^v/, "")
    .split("-")[0]
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const clean2 = v2
    .replace(/^v/, "")
    .split("-")[0]
    .split(".")
    .map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(clean1.length, clean2.length); i++) {
    const num1 = clean1[i] || 0;
    const num2 = clean2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Fetches the latest published version of `@m3rcena/weky` from the npm registry.
 */
export async function fetchLatestVersion(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://registry.npmjs.org/@m3rcena/weky/latest", {
      signal: controller.signal,
      headers: { "User-Agent": "@m3rcena/weky-update-notifier" },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data: any = await res.json();
      return typeof data.version === "string" ? data.version : null;
    }
  } catch {
    // Non-blocking fallback using child_process exec
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execPromise = promisify(exec);
      const { stdout } = await execPromise("npm show @m3rcena/weky version", { timeout: 3500 });
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Checks if a newer version of `@m3rcena/weky` is available and logs the notification box.
 * @param currentVersion Current running package version.
 * @param disabled If true, update checking is bypassed.
 * @param gameName Optional name of the game being executed.
 */
export async function checkPackageUpdates(currentVersion: string, disabled?: boolean, gameName?: string): Promise<void> {
  if (disabled) return;

  try {
    const latest = await fetchLatestVersion();
    if (!latest) return;

    if (compareSemver(currentVersion, latest) < 0) {
      const messages: string[] = [];

      if (gameName) {
        messages.push(`Are you using ${red(gameName)}? Don't lose out on new features!`);
      }

      messages.push(`New ${green("version")} of ${yellow("@m3rcena/weky")} is available!`, `${red(currentVersion)} -> ${green(latest)}`, `Registry: ${cyan("https://www.npmjs.com/package/@m3rcena/weky")}`, `Run ${green(`npm i @m3rcena/weky@${latest}`)} to update!`);

      boxConsole(messages);
    }
  } catch {
    // Silently suppress network errors during update checks
  }
}
