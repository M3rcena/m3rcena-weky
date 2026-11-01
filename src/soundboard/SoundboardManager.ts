/**
 * Soundboard & Audio Integration
 * Plays Discord soundboard sounds on key minigame events.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { Client } from "discord.js";

export interface SoundboardConfig {
  enabled?: boolean;
  sounds?: {
    victory?: string;
    defeat?: string;
    countdown?: string;
    action?: string;
  };
}

export interface SoundboardPlayResult {
  success: boolean;
  error?: string;
  soundId?: string;
}

export interface DefaultSoundboardSound {
  id: string;
  name: string;
  emoji: string;
}

/** Built-in Discord soundboard sound IDs usable across all Discord servers */
export const DEFAULT_DISCORD_SOUNDS: DefaultSoundboardSound[] = [
  { id: "1", name: "Quack", emoji: "🦆" },
  { id: "2", name: "Airhorn", emoji: "📢" },
  { id: "3", name: "Cricket", emoji: "🦗" },
  { id: "4", name: "Golf Clap", emoji: "👏" },
  { id: "5", name: "Sad Horn", emoji: "🎺" },
  { id: "6", name: "Ba-Dum-Tss", emoji: "🥁" },
];

export class SoundboardManager {
  private client: Client;
  private config: SoundboardConfig;

  constructor(client: Client, config: SoundboardConfig = {}) {
    this.client = client;
    this.config = {
      enabled: config.enabled ?? false,
      sounds: config.sounds || {},
    };
  }

  /**
   * Safely plays a soundboard sound in the given voice channel with diagnostic details.
   */
  public async playSoundWithResult(
    channelId: string,
    soundTypeOrId: "victory" | "defeat" | "countdown" | "action" | string,
    sourceGuildId?: string
  ): Promise<SoundboardPlayResult> {
    if (!this.config.enabled) {
      return { success: false, error: "Soundboard integration is disabled in WekyManager configuration." };
    }
    if (!channelId) {
      return { success: false, error: "A valid Voice Channel ID is required to trigger soundboard playback." };
    }

    const soundId = this.config.sounds?.[soundTypeOrId as keyof typeof this.config.sounds] || soundTypeOrId;
    if (!soundId) {
      return { success: false, error: `No sound ID found for '${soundTypeOrId}'.` };
    }

    try {
      if (this.client.rest && typeof (this.client.rest as any).post === "function") {
        const body: Record<string, any> = { sound_id: soundId };
        if (sourceGuildId) body.source_guild_id = sourceGuildId;

        await (this.client.rest as any).post(`/channels/${channelId}/send-soundboard-sound`, {
          body,
        });
        return { success: true, soundId };
      }
      return { success: false, error: "Discord.js REST client is unavailable." };
    } catch (err: any) {
      const errMsg = err?.rawError?.message || err?.message || "Failed to dispatch soundboard sound.";
      return { success: false, error: errMsg, soundId };
    }
  }

  /**
   * Safely plays a soundboard sound in the given voice channel.
   * If soundboard is disabled or bot lacks permissions, fails silently without crashing.
   */
  public async playSound(
    channelId: string,
    soundTypeOrId: "victory" | "defeat" | "countdown" | "action" | string,
    sourceGuildId?: string
  ): Promise<boolean> {
    const res = await this.playSoundWithResult(channelId, soundTypeOrId, sourceGuildId);
    return res.success;
  }
}

