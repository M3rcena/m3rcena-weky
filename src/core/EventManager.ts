import { Client, Events, Interaction, Message } from "discord.js";
import { IMinigame } from "./Types.js";

/**
 * Global Event Multiplexer.
 * Attaches a single listener to the Discord Client to dispatch events to all active minigames
 * without triggering EventEmitter MaxListenersExceeded warnings or memory leaks.
 */
export class EventManager {
  private client: Client;
  private activeGames: Map<string, IMinigame> = new Map();
  private initialized: boolean = false;

  constructor(client: Client) {
    this.client = client;
    this.initListeners();
  }

  private initListeners(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      for (const game of this.activeGames.values()) {
        if (game.onInteraction) {
          try {
            await game.onInteraction(interaction);
          } catch (err) {
            console.error(`[Weky:EventManager] Error in game ${game.id} onInteraction:`, err);
          }
        }
      }
    });

    this.client.on(Events.MessageCreate, async (message: Message) => {
      if (message.author.bot) return;
      for (const game of this.activeGames.values()) {
        if (game.onMessage) {
          try {
            await game.onMessage(message);
          } catch (err) {
            console.error(`[Weky:EventManager] Error in game ${game.id} onMessage:`, err);
          }
        }
      }
    });

    this.client.on(Events.TypingStart, async (typing: any) => {
      for (const game of this.activeGames.values()) {
        if (game.onTypingStart) {
          try {
            await game.onTypingStart(typing);
          } catch (err) {
            console.error(`[Weky:EventManager] Error in game ${game.id} onTypingStart:`, err);
          }
        }
      }
    });
  }

  public register(game: IMinigame): void {
    this.activeGames.set(game.id, game);
  }

  public unregister(gameId: string): void {
    this.activeGames.delete(gameId);
  }

  public isRegistered(gameId: string): boolean {
    return this.activeGames.has(gameId);
  }

  public getActiveCount(): number {
    return this.activeGames.size;
  }
}
