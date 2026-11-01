/**
 * Dashboard Audio & MP3 Soundboard Engine
 * Provides MP3 audio playback cues for Web Dashboards, Headless Game Engines,
 * and Cross-Platform Bridge gameplay without requiring Discord Voice Channels.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { Client } from "discord.js";
import * as path from "node:path";
import * as fs from "node:fs";
import { DashboardSoundEvent } from "../core/EventTypes.js";

export interface DashboardSoundEntry {
  key: string;
  name: string;
  category: "general" | "victory" | "defeat" | "combat" | "retro";
  url: string;
  description: string;
}

export interface SoundboardConfig {
  /** Whether dashboard soundboard playback is enabled (default: true) */
  enabled?: boolean;
  /** Default playback volume between 0.0 and 1.0 (default: 0.8) */
  volume?: number;
  /** Custom developer MP3 URLs or relative asset paths mapped to sound event keys */
  sounds?: Record<string, string>;
}

export interface SoundboardPlayOptions {
  /** Volume override for this playback event (0.0 to 1.0) */
  volume?: number;
  /** Associated bridge session ID */
  sessionId?: string;
  /** Associated minigame key */
  game?: string;
  [key: string]: any;
}

export interface SoundboardPlayResult {
  success: boolean;
  soundKey?: string;
  soundUrl?: string;
  volume?: number;
  platform: "dashboard";
  error?: string;
}

/** Built-in high-quality MP3 audio library for Web Dashboards */
export const DEFAULT_DASHBOARD_SOUNDS: Record<string, DashboardSoundEntry> = {
  victory: {
    key: "victory",
    name: "Victory Fanfare",
    category: "victory",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/victory.mp3",
    description: "Triumphant fanfare played on match wins and new high scores.",
  },
  defeat: {
    key: "defeat",
    name: "Defeat & Game Over",
    category: "defeat",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/defeat.mp3",
    description: "Somber fail chime played on round defeat or game over.",
  },
  action: {
    key: "action",
    name: "Button & Move Click",
    category: "general",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/action.mp3",
    description: "Subtle tactile sound for card interactions, button presses, and moves.",
  },
  countdown: {
    key: "countdown",
    name: "Countdown Tick",
    category: "general",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/countdown.mp3",
    description: "Metronome tick for active turn countdowns and speed rounds.",
  },
  hit: {
    key: "hit",
    name: "Combat Hit Impact",
    category: "combat",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/hit.mp3",
    description: "Impact sound for weapon strikes and normal attacks in Fight RPG.",
  },
  heavy_hit: {
    key: "heavy_hit",
    name: "Heavy Critical Strike",
    category: "combat",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/heavy_hit.mp3",
    description: "Heavy bass strike for critical attacks and boss special moves.",
  },
  heal: {
    key: "heal",
    name: "Magic Heal & Shield",
    category: "combat",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/heal.mp3",
    description: "Glittering chime for healing potions and shield activation.",
  },
  eat: {
    key: "eat",
    name: "Retro Munch & Collect",
    category: "retro",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/eat.mp3",
    description: "Classic arcade bite sound for Snake apples and 2048 merges.",
  },
  tie: {
    key: "tie",
    name: "Match Draw",
    category: "general",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/tie.mp3",
    description: "Harmonic neutral chime for ties and stalemate matches.",
  },
  gamestart: {
    key: "gamestart",
    name: "Arcade Coin Insert",
    category: "retro",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/gamestart.mp3",
    description: "Classic coin drop sound when launching a new game session.",
  },
  win_streak: {
    key: "win_streak",
    name: "Combo Streak Fire",
    category: "victory",
    url: "https://raw.githubusercontent.com/M3rcena/m3rcena-weky/main/assets/sounds/win_streak.mp3",
    description: "Ignition flare sound when reaching high win streaks.",
  },
};

/** Backwards-compatible alias */
export const DEFAULT_DISCORD_SOUNDS = Object.values(DEFAULT_DASHBOARD_SOUNDS).map((s) => ({
  id: s.key,
  name: s.name,
  emoji: s.category === "victory" ? "🏆" : s.category === "combat" ? "⚔️" : s.category === "retro" ? "🕹️" : "🔊",
}));

export class SoundboardManager {
  private client: Client;
  private config: SoundboardConfig;
  public wekyManager?: any;

  constructor(client: Client, config: SoundboardConfig = {}, wekyManager?: any) {
    this.client = client;
    this.wekyManager = wekyManager;
    this.config = {
      enabled: config.enabled ?? true,
      volume: typeof config.volume === "number" ? Math.max(0, Math.min(1, config.volume)) : 0.8,
      sounds: config.sounds || {},
    };
  }

  /**
   * Returns whether dashboard audio is enabled.
   */
  public get isEnabled(): boolean {
    return this.config.enabled ?? true;
  }

  /**
   * Returns default playback volume (0.0 to 1.0).
   */
  public get volume(): number {
    return this.config.volume ?? 0.8;
  }

  /**
   * Retrieves the MP3 sound URL for a given event key.
   * If a custom URL was provided in config, it takes precedence over built-in defaults.
   */
  public getSoundUrl(soundKey: string): string {
    const customUrl = this.config.sounds?.[soundKey];
    if (customUrl) return customUrl;

    const defaultSound = DEFAULT_DASHBOARD_SOUNDS[soundKey];
    if (defaultSound) return defaultSound.url;

    // Fallback to action click sound
    return DEFAULT_DASHBOARD_SOUNDS.action.url;
  }

  /**
   * Retrieves a registered sound entry by key.
   */
  public getSound(soundKey: string): DashboardSoundEntry | undefined {
    const customUrl = this.config.sounds?.[soundKey];
    const defaultEntry = DEFAULT_DASHBOARD_SOUNDS[soundKey];

    if (customUrl) {
      return {
        key: soundKey,
        name: defaultEntry?.name || soundKey.toUpperCase(),
        category: defaultEntry?.category || "general",
        url: customUrl,
        description: defaultEntry?.description || "Custom developer MP3 audio track.",
      };
    }

    return defaultEntry;
  }

  /**
   * Returns all available sound entries as a dictionary.
   */
  public getAllSounds(): Record<string, DashboardSoundEntry> {
    const combined: Record<string, DashboardSoundEntry> = { ...DEFAULT_DASHBOARD_SOUNDS };
    if (this.config.sounds) {
      for (const [key, url] of Object.entries(this.config.sounds)) {
        if (!url) continue;
        const existing = combined[key];
        combined[key] = {
          key,
          name: existing?.name || key.toUpperCase(),
          category: existing?.category || "general",
          url,
          description: existing?.description || "Custom developer MP3 audio track.",
        };
      }
    }
    return combined;
  }

  /**
   * Generates a lightweight JSON manifest of all MP3 audio tracks for Web Dashboards.
   */
  public getAudioManifest(): Record<string, { name: string; url: string; category: string }> {
    const manifest: Record<string, { name: string; url: string; category: string }> = {};
    const all = this.getAllSounds();
    for (const [k, v] of Object.entries(all)) {
      manifest[k] = { name: v.name, url: v.url, category: v.category };
    }
    return manifest;
  }

  /**
   * Returns the directory path containing the bundled MP3 audio files.
   * Useful for web servers (Express/Fastify/Next.js) serving static audio files.
   */
  public getSoundsDirectory(): string {
    const candidatePaths = [
      path.resolve(process.cwd(), "assets/sounds"),
      path.resolve(process.cwd(), "node_modules/@m3rcena/weky/assets/sounds"),
    ];

    try {
      if (typeof __dirname !== "undefined") {
        candidatePaths.push(path.resolve(__dirname, "../../assets/sounds"));
        candidatePaths.push(path.resolve(__dirname, "../assets/sounds"));
      }
    } catch {
      // safe in ESM
    }

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) return p;
    }

    return candidatePaths[0];
  }

  /**
   * Returns the local file path for an MP3 audio asset if it exists on disk.
   */
  public getLocalSoundPath(soundKey: string): string {
    const dir = this.getSoundsDirectory();
    return path.join(dir, `${soundKey}.mp3`);
  }

  /**
   * Triggers a dashboard audio sound cue, dispatching a `dashboardSound` lifecycle event.
   */
  public triggerSound(
    soundKey: string,
    meta: { sessionId?: string; game?: string; volume?: number } = {}
  ): DashboardSoundEvent | null {
    if (!this.config.enabled) return null;

    const soundUrl = this.getSoundUrl(soundKey);
    const volume = typeof meta.volume === "number" ? Math.max(0, Math.min(1, meta.volume)) : this.volume;

    const eventPayload: DashboardSoundEvent = {
      sessionId: meta.sessionId,
      game: meta.game,
      soundKey,
      soundUrl,
      volume,
      timestamp: Date.now(),
    };

    if (this.wekyManager && typeof this.wekyManager.emit === "function") {
      this.wekyManager.emit("dashboardSound", eventPayload);
    }

    return eventPayload;
  }

  /**
   * Returns a ready-to-use HTML/JavaScript client-side script snippet that web dashboards
   * can include to automatically play MP3 sounds on user interactions and WebSocket events.
   */
  public generateDashboardAudioScript(options: { autoPlay?: boolean; defaultVolume?: number } = {}): string {
    const manifestJson = JSON.stringify(this.getAudioManifest());
    const defaultVol = options.defaultVolume ?? this.volume;

    return `
<!-- Weky Web Dashboard Audio Controller -->
<script>
(function() {
  const WEKY_AUDIO_MANIFEST = ${manifestJson};
  const WekyAudio = {
    manifest: WEKY_AUDIO_MANIFEST,
    volume: ${defaultVol},
    cache: {},
    play: function(soundKey, customVol) {
      try {
        const sound = WEKY_AUDIO_MANIFEST[soundKey] || { url: soundKey };
        if (!sound.url) return;
        const audio = new Audio(sound.url);
        audio.volume = typeof customVol === 'number' ? Math.max(0, Math.min(1, customVol)) : WekyAudio.volume;
        audio.play().catch(function(err) {
          // Autoplay policy: audio will play once the user interacts with the dashboard
        });
      } catch (e) {
        console.warn('[WekyAudio] Playback notice:', e);
      }
    }
  };
  window.WekyAudio = WekyAudio;
})();
</script>`.trim();
  }

  /**
   * Safely plays a soundboard sound for dashboards.
   * Fully backwards compatible with existing minigame call sites.
   */
  public async playSoundWithResult(
    channelOrKey: string,
    soundTypeOrId?: string,
    options?: SoundboardPlayOptions | string
  ): Promise<SoundboardPlayResult> {
    if (!this.config.enabled) {
      return {
        success: false,
        platform: "dashboard",
        error: "Soundboard integration is disabled in WekyManager configuration.",
      };
    }

    // Determine sound key
    const soundKey = (soundTypeOrId || channelOrKey || "action").toString();
    const soundUrl = this.getSoundUrl(soundKey);

    let vol = this.volume;
    let sessionId: string | undefined;
    let game: string | undefined;

    if (typeof options === "object" && options !== null) {
      if (typeof options.volume === "number") vol = options.volume;
      if (options.sessionId) sessionId = options.sessionId;
      if (options.game) game = options.game;
    }

    this.triggerSound(soundKey, { sessionId, game, volume: vol });

    return {
      success: true,
      soundKey,
      soundUrl,
      volume: vol,
      platform: "dashboard",
    };
  }

  /**
   * Safely plays a soundboard sound.
   */
  public async playSound(
    channelOrKey: string,
    soundTypeOrId?: string,
    options?: SoundboardPlayOptions | string
  ): Promise<boolean> {
    const res = await this.playSoundWithResult(channelOrKey, soundTypeOrId, options);
    return res.success;
  }

  /**
   * Backwards-compatible stubs for previous voice channel controls.
   */
  public isConnectedTo(): boolean {
    return false;
  }

  public async joinVoice(): Promise<null> {
    return null;
  }

  public leaveVoice(): boolean {
    return false;
  }

  public destroy(): void {
    // No-op for dashboard audio
  }
}
