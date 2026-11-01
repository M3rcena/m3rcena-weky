/**
 * Fight RPG AI & Boss Engine
 * Pre-configured tactical bosses and automated decision trees.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

export interface BossProfile {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  maxHealth: number;
  damageMin: number;
  damageMax: number;
  coins: number;
  dialogueIntro: string;
  dialogueVictory: string;
  dialogueDefeat: string;
  specialMoveName: string;
  specialMoveEffect: (boss: any, player: any) => { damage: number; message: string };
}

export const FIGHT_BOSSES: Record<string, BossProfile> = {
  dragon: {
    id: "dragon_sovereign",
    name: "Dragon Sovereign",
    title: "Ancient Pyromancer",
    avatarUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    maxHealth: 150,
    damageMin: 15,
    damageMax: 24,
    coins: 40,
    dialogueIntro: "🔥 *The ground shakes as the Dragon Sovereign lands! 'Kneel or turn to ash!'*",
    dialogueVictory: "🔥 *'Your courage was admirable, mortal, but you are merely kindling!'*",
    dialogueDefeat: "💨 *'Impossible... defeated by mere flesh and bone?!'*",
    specialMoveName: "Inferno Breath",
    specialMoveEffect: (boss, player) => {
      let dmg = Math.floor(Math.random() * 11) + 24; // 24-34 dmg
      if (player.activeEffects?.includes("Shield")) {
        dmg = Math.floor(dmg * 0.7); // Inferno partially scorches through shields
        player.activeEffects = player.activeEffects.filter((e: string) => e !== "Shield");
      }
      player.health = Math.max(0, player.health - dmg);
      return { damage: dmg, message: `🔥 **${boss.username} unleashes INFERNO BREATH dealing ${dmg} scorching damage!**` };
    },
  },
  cyber_knight: {
    id: "cyber_knight",
    name: "Cyber Knight",
    title: "Protocol MK-VII",
    avatarUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png",
    maxHealth: 135,
    damageMin: 13,
    damageMax: 22,
    coins: 35,
    dialogueIntro: "⚡ *Sensors active. Target acquired. Commencing combat protocol.*",
    dialogueVictory: "⚡ *Threat neutralized. Target combat readiness: 0%.*",
    dialogueDefeat: "⚡ *Critical system failure... Re-routing power to emergency beacon.*",
    specialMoveName: "EMP Overcharge",
    specialMoveEffect: (boss, player) => {
      const dmg = Math.floor(Math.random() * 9) + 20; // 20-28 dmg
      player.health = Math.max(0, player.health - dmg);
      player.activeEffects = []; // Strips player shields and buffs
      return { damage: dmg, message: `⚡ **${boss.username} fires an EMP OVERCHARGE for ${dmg} damage, overloading your systems and stripping all buffs!**` };
    },
  },
  shadow_goblin: {
    id: "shadow_goblin",
    name: "Shadow Goblin",
    title: "Greed Master",
    avatarUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/302.png",
    maxHealth: 120,
    damageMin: 11,
    damageMax: 19,
    coins: 55,
    dialogueIntro: "🗡️ *Hehehe! What shiny coins you got there! Hand 'em over or bleed!*",
    dialogueVictory: "💰 *Hehehe! Thanks for the loot, chump! All mine now!*",
    dialogueDefeat: "💨 *Gahh! My loot! I'll be back for this, you brute!*",
    specialMoveName: "Coin Heist & Backstab",
    specialMoveEffect: (boss, player) => {
      const stolen = Math.min(player.coins, Math.floor(Math.random() * 9) + 10); // 10-18 coins
      player.coins -= stolen;
      boss.coins += stolen;
      const dmg = Math.floor(Math.random() * 7) + 16; // 16-22 dmg
      player.health = Math.max(0, player.health - dmg);
      return { damage: dmg, message: `🗡️ **${boss.username} strikes for ${dmg} damage and pickpockets ${stolen} coins from your pouch!**` };
    },
  },
};

// Aliases for convenience
FIGHT_BOSSES["knight"] = FIGHT_BOSSES["cyber_knight"];
FIGHT_BOSSES["goblin"] = FIGHT_BOSSES["shadow_goblin"];

export class FightAI {
  /**
   * Decides the tactical action for the AI/Boss on its turn.
   */
  public static decideAction(
    aiPlayer: any,
    humanPlayer: any,
    bossProfile?: BossProfile
  ): "attack" | "heavy" | "heal" | "shield" | "special" {
    // 1. Counter Human's 2x Damage buff with Shield or Special
    if (humanPlayer.activeEffects?.includes("2x Damage")) {
      if (aiPlayer.coins >= 25 && !aiPlayer.activeEffects?.includes("Shield") && Math.random() < 0.6) {
        return "shield";
      }
      if (bossProfile && Math.random() < 0.4) {
        return "special";
      }
    }

    // 2. Tactical Boss Special Move: 28% chance
    if (bossProfile && Math.random() < 0.28) {
      return "special";
    }

    // 3. Defensive reaction when health is under 45 HP and has coins
    if (aiPlayer.health < 45 && aiPlayer.coins >= 25 && !aiPlayer.activeEffects?.includes("Shield") && Math.random() < 0.45) {
      return Math.random() < 0.6 ? "shield" : "heal";
    }

    // 4. Execute human when human is in critical range (<= 30 HP)
    if (humanPlayer.health <= 30 && Math.random() < 0.6) {
      return "heavy";
    }

    // 5. Default attack distribution: 40% heavy attack, 60% normal attack
    return Math.random() < 0.4 ? "heavy" : "attack";
  }
}
