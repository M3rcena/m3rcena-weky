import { Render2048 } from "./Render2048.js";
import { FightPlayerInfo, RenderFight } from "./RenderFight.js";
import { RenderHangman } from "./RenderHangman.js";
import { RenderPokemon } from "./RenderPokemon.js";
import { RenderSnake } from "./RenderSnake.js";

/**
 * Centralized graphics and card generation suite for `@m3rcena/weky`.
 * Ideal for web dashboards, REST APIs, custom UIs, and external webhooks.
 */
export class WekyCanvas {
  /**
   * Converts an image Buffer into a web-ready Data URL string (`data:image/png;base64,...`).
   * Can be directly used in HTML `<img src="..." />` or frontend frameworks (React, Vue, Svelte).
   */
  public static toDataURL(buffer: Buffer, mime: string = "image/png"): string {
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }

  /**
   * Converts an image Buffer into a base64 encoded string.
   */
  public static toBase64(buffer: Buffer): string {
    return buffer.toString("base64");
  }

  /**
   * Fight Duel canvas card renderers.
   */
  public static readonly fight = {
    /**
     * Renders a Challenge / Request card between two players.
     */
    request: (challenger: { username: string; avatarUrl: string }, opponent: { username: string; avatarUrl: string }): Promise<Buffer> => {
      return RenderFight.renderRequestCard(challenger, opponent);
    },

    /**
     * Renders an active battle arena card showing both fighters, health bars, coins, and current turn indicator.
     */
    battle: (player1: FightPlayerInfo, player2: FightPlayerInfo, currentTurnUserId: string, announcement?: string): Promise<Buffer> => {
      return RenderFight.renderBattleCard(player1, player2, currentTurnUserId, announcement);
    },

    /**
     * Renders the battle outcome card (Victory, Surrender, Denied, Timeout).
     */
    outcome: (winner: { username: string; avatarUrl: string }, loser?: { username: string; avatarUrl: string }, type?: "WIN" | "SURRENDER" | "DENIED" | "TIMEOUT"): Promise<Buffer> => {
      return RenderFight.renderOutcomeCard(winner, loser, type);
    },
  };

  /**
   * 2048 game board card renderer.
   */
  public static game2048(board: number[][], score: number, username: string, avatarUrl: string, state?: "active" | "gameover" | "won" | "quit" | "timeout"): Promise<Buffer> {
    return Render2048.renderBoard(board, score, username, avatarUrl, state);
  }

  /**
   * Snake game board card renderer.
   */
  public static snake(snake: { x: number; y: number }[], food: { x: number; y: number }, direction: "UP" | "DOWN" | "LEFT" | "RIGHT", score: number, gridSize: number, username: string, avatarUrl: string, isGameOver?: boolean, overlayTitle?: string): Promise<Buffer> {
    return RenderSnake.renderBoard(snake, food, direction, score, gridSize, username, avatarUrl, isGameOver, overlayTitle);
  }

  /**
   * Hangman gallows and word card renderer.
   */
  public static hangman(wrongGuessesCount: number, displayWord: string, guessedLetters: string[], username: string = "Player", avatarUrl: string = "", gameOver: boolean = false, won: boolean = false, fullWord?: string): Promise<Buffer> {
    return RenderHangman.renderCard(wrongGuessesCount, displayWord, guessedLetters, username, avatarUrl, gameOver, won, fullWord);
  }

  /**
   * Pokemon silhouette / revealed card renderer.
   */
  public static pokemon(
    pokemon: {
      name: string;
      imageUrl?: string;
      image?: string;
      types?: string[];
      abilities?: string[];
      id?: number;
    },
    reveal: boolean = false,
  ): Promise<Buffer> {
    return RenderPokemon.renderCard(
      {
        name: pokemon.name,
        imageUrl: pokemon.imageUrl || pokemon.image || "",
        types: pokemon.types || ["Normal"],
        abilities: pokemon.abilities || [],
        id: pokemon.id,
      },
      reveal,
    );
  }
}
