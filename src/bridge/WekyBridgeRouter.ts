/**
 * @m3rcena/weky
 * Weky Bridge Package Router & Decoupled State API.
 * Provides unified HTTP endpoints and WebSocket routing for headless minigames,
 * raw state inspection, live cross-platform moves, and visual Canvas card rendering.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { BridgePackageRouter, BridgeRequest, BridgeResponse, BridgeAction } from "@m3rcena/bridge";
import { WekyBridge } from "./WekyBridge.js";
import { Game2048Engine } from "../engines/Game2048Engine.js";
import { SnakeEngine } from "../engines/SnakeEngine.js";
import { FightEngine } from "../engines/FightEngine.js";
import { TicTacToeEngine } from "../engines/TicTacToeEngine.js";
import { HangmanEngine } from "../engines/HangmanEngine.js";
import { CalculatorEngine } from "../engines/CalculatorEngine.js";
import { Render2048 } from "../canvas/Render2048.js";
import { RenderSnake } from "../canvas/RenderSnake.js";
import { RenderFight } from "../canvas/RenderFight.js";
import { RenderHangman } from "../canvas/RenderHangman.js";
import { RenderPokemon } from "../canvas/RenderPokemon.js";
import { RenderShareCard } from "../canvas/RenderShareCard.js";
import { RenderLeaderboard } from "../canvas/RenderLeaderboard.js";

export const WEKY_GAME_CATALOG = [
  {
    id: "2048",
    name: "2048",
    description: "Slide and merge numbered tiles on a 4x4 grid to reach the 2048 tile.",
    minPlayers: 1,
    maxPlayers: 1,
    category: "puzzle",
    controls: ["UP", "DOWN", "LEFT", "RIGHT"],
    canvasSupported: true,
  },
  {
    id: "snake",
    name: "Snake",
    description: "Navigate the classic snake, eat apples, grow longer and avoid collisions.",
    minPlayers: 1,
    maxPlayers: 1,
    category: "arcade",
    controls: ["UP", "DOWN", "LEFT", "RIGHT"],
    canvasSupported: true,
  },
  {
    id: "fight",
    name: "Fight (PvP & Boss Battle)",
    description: "Turn-based arena fighting game with health bars, critical strikes, and heals.",
    minPlayers: 1,
    maxPlayers: 2,
    category: "action",
    controls: ["hit", "heavy", "heal", "shield", "surrender"],
    canvasSupported: true,
  },
  {
    id: "tictactoe",
    name: "Tic Tac Toe",
    description: "Classic 3x3 grid alignment duel against another player or AI.",
    minPlayers: 1,
    maxPlayers: 2,
    category: "strategy",
    controls: ["cell_0", "cell_1", "cell_2", "cell_3", "cell_4", "cell_5", "cell_6", "cell_7", "cell_8"],
    canvasSupported: false,
  },
  {
    id: "hangman",
    name: "Hangman",
    description: "Guess the hidden mystery word letter by letter before running out of lives.",
    minPlayers: 1,
    maxPlayers: 1,
    category: "word",
    controls: ["letter_guess"],
    canvasSupported: true,
  },
  {
    id: "calculator",
    name: "Scientific Calculator",
    description: "Interactive arithmetic calculator with expression evaluation.",
    minPlayers: 1,
    maxPlayers: 1,
    category: "utility",
    controls: ["num_0" /* etc */],
    canvasSupported: false,
  },
];

export class WekyBridgeRouter implements BridgePackageRouter {
  public name: string = "weky";
  public basePath: string = "/api/weky";
  public description: string = "Universal headless minigame engine, state synchronization, and canvas card generator.";
  public version: string = "14.28.0";
  private bridge: WekyBridge;

  constructor(bridge: WekyBridge) {
    this.bridge = bridge;
  }

  public async handleRequest(req: BridgeRequest): Promise<BridgeResponse | null> {
    const path = req.subPath.replace(/\/+$/, "") || "/";
    const method = req.method.toUpperCase();

    // 1. GET /games - Catalog of games
    if (path === "/games" && method === "GET") {
      return {
        status: 200,
        body: {
          games: WEKY_GAME_CATALOG,
          activeCount: this.bridge.getActiveSessions().length,
        },
      };
    }

    // 2. POST /games/start - Start headless game session
    if (path === "/games/start" && method === "POST") {
      const body = req.body || {};
      const game = (body.game || "").toLowerCase();
      const playerId = body.playerId || "guest";
      const username = body.username || "Guest Player";
      const avatarUrl = body.avatarUrl;

      const sessionId = `weky_${game}_${Math.random().toString(36).substring(2, 8)}`;
      let engine: any = null;
      let initialState: any = null;
      let players = [{ id: playerId, username, avatarUrl, platform: (body.platform || "dashboard") as any }];

      if (game === "2048") {
        engine = new Game2048Engine({ username, avatarUrl });
        initialState = engine.getState();
      } else if (game === "snake") {
        engine = new SnakeEngine({ username, avatarUrl });
        initialState = engine.getState();
      } else if (game === "fight") {
        const opponentId = body.opponentId || "bot";
        const opponentName = body.opponentName || "Cyber Gladiator";
        engine = new FightEngine({
          player1: { id: playerId, username, avatarUrl },
          player2: { id: opponentId, username: opponentName, avatarUrl: body.opponentAvatarUrl },
        });
        initialState = engine.getState();
        players.push({ id: opponentId, username: opponentName, avatarUrl: body.opponentAvatarUrl, platform: "dashboard" as any });
      } else if (game === "tictactoe") {
        const opponentId = body.opponentId || "ai";
        const opponentName = body.opponentName || "Antigravity AI";
        engine = new TicTacToeEngine({
          player1: { id: playerId, username },
          player2: { id: opponentId, username: opponentName },
        });
        initialState = engine.getState();
        players.push({ id: opponentId, username: opponentName, platform: "dashboard" as any });
      } else if (game === "hangman") {
        engine = new HangmanEngine();
        initialState = engine.getState();
      } else if (game === "calculator") {
        engine = new CalculatorEngine();
        initialState = engine.getState();
      } else {
        return {
          status: 400,
          body: { error: `Unsupported game "${game}". Available: 2048, snake, fight, tictactoe, hangman, calculator` },
        };
      }

      const session = {
        id: sessionId,
        game,
        platform: "dashboard" as any,
        players,
        currentTurnId: playerId,
        state: initialState,
        engine,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        isGameOver: false,
        onMove: async (move: any) => {
          let res: any;
          if (game === "2048") {
            const moved = engine.move(move.action.toUpperCase() as any);
            res = {
              success: moved,
              state: engine.getState(),
              isGameOver: engine.getState().isGameOver,
            };
          } else if (game === "snake") {
            const moved = engine.changeDirection(move.action.toUpperCase() as any);
            res = {
              success: moved,
              state: engine.getState(),
              isGameOver: engine.getState().isGameOver,
            };
          } else if (game === "fight") {
            res = engine.action(move.playerId, move.action, move.payload);
          } else if (game === "tictactoe") {
            res = engine.playTurn(move.playerId, parseInt(move.payload?.index ?? move.action.replace("cell_", ""), 10));
          } else if (game === "hangman") {
            res = engine.guess(move.action || move.payload?.letter);
          } else if (game === "calculator") {
            res = engine.press(move.action);
          } else {
            res = { success: false, error: "Unsupported game move" };
          }
          return res;
        },
      };

      this.bridge.registerSession(session);

      return {
        status: 201,
        body: {
          success: true,
          sessionId,
          game,
          state: initialState,
          players,
        },
      };
    }

    // 3. POST /games/action - Execute game action
    if (path === "/games/action" && method === "POST") {
      const { sessionId, playerId, action, payload } = req.body || {};
      if (!sessionId || !action) {
        return { status: 400, body: { error: "Missing sessionId or action in request body." } };
      }

      const result = await this.bridge.dispatchMove(sessionId, {
        playerId: playerId || "guest",
        action,
        payload,
        sourcePlatform: (req.body?.platform || "dashboard") as any,
      });

      return {
        status: result.success ? 200 : 400,
        body: result,
      };
    }

    // 4. GET /games/:sessionId - Inspect session
    if (path.startsWith("/games/") && method === "GET") {
      const sessionId = path.replace("/games/", "");
      const session = this.bridge.getSession(sessionId);
      if (!session) {
        return { status: 404, body: { error: `Session "${sessionId}" not found.` } };
      }

      return {
        status: 200,
        body: {
          id: session.id,
          game: session.game,
          platform: session.platform,
          players: session.players,
          currentTurnId: session.currentTurnId,
          state: session.state,
          isGameOver: session.isGameOver,
          winnerId: session.winnerId,
          lastUpdated: session.lastUpdated,
        },
      };
    }

    // 5. GET /cards/render - Visual Canvas Card Renderer
    if (path === "/cards/render" && method === "GET") {
      const type = (req.query.type || req.query.card || "").toLowerCase();

      try {
        let buffer: Buffer | null = null;
        const username = req.query.username || "Player";
        const avatarUrl = req.query.avatarUrl || "";

        if (type === "2048") {
          const score = parseInt(req.query.score || "0", 10);
          const boardJson = req.query.board ? JSON.parse(req.query.board) : [
            [2, 4, 8, 16],
            [32, 64, 128, 256],
            [512, 1024, 2048, 0],
            [0, 0, 0, 0],
          ];
          buffer = await Render2048.renderBoard(boardJson, score, username, avatarUrl);
        } else if (type === "snake") {
          const score = parseInt(req.query.score || "0", 10);
          buffer = await RenderSnake.renderBoard(
            [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }],
            { x: 10, y: 7 },
            "RIGHT",
            score,
            15,
            username,
            avatarUrl
          );
        } else if (type === "fight") {
          const p1Hp = parseInt(req.query.p1Hp || "90", 10);
          const p2Hp = parseInt(req.query.p2Hp || "45", 10);
          buffer = await RenderFight.renderBattleCard(
            {
              id: "p1",
              username: req.query.p1 || req.query.p1Name || username,
              avatarUrl: req.query.p1Avatar || avatarUrl,
              health: p1Hp,
              maxHealth: 100,
              shield: false,
              doubleDamage: false,
            },
            {
              id: "p2",
              username: req.query.p2 || req.query.p2Name || "Dragon Boss",
              avatarUrl: req.query.p2Avatar || "",
              health: p2Hp,
              maxHealth: 100,
              shield: false,
              doubleDamage: false,
            },
            "p1",
            req.query.action || "⚔️ Hero used Heavy Strike for 24 damage!"
          );
        } else if (type === "hangman") {
          const word = req.query.word || "DEVELOPER";
          const guessed = (req.query.guessed || "E,O,L").split(",");
          buffer = await RenderHangman.renderCard(
            parseInt(req.query.mistakes || "2", 10),
            word,
            guessed,
            username,
            avatarUrl
          );
        } else if (type === "pokemon") {
          buffer = await RenderPokemon.renderCard(
            {
              name: req.query.name || req.query.pokemon || "Pikachu",
              types: ["Electric"],
              abilities: ["Static", "Lightning Rod"],
              imageUrl: req.query.imageUrl || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
              id: 25,
            },
            req.query.revealed === "true"
          );
        } else if (type === "share") {
          buffer = await RenderShareCard.render({
            title: req.query.game || "Weky Arcade",
            username,
            avatarUrl,
            stats: [
              { label: "Score", value: req.query.score || "4,096" },
              { label: "Outcome", value: req.query.outcome || "VICTORY" },
            ],
          });
        } else if (type === "leaderboard") {
          buffer = await RenderLeaderboard.render({
            title: req.query.title || "Arcade Championship Leaderboard",
            gameName: "Arcade",
            entries: [
              { rank: 1, userId: "MasterGamer", score: 14500, avatarUrl },
              { rank: 2, userId: "NeonNinja", score: 11200 },
              { rank: 3, userId: "PixelQueen", score: 9800 },
            ],
          });
        }

        if (buffer) {
          return {
            status: 200,
            body: buffer,
            isBuffer: true,
            contentType: "image/png",
          };
        }

        return {
          status: 400,
          body: { error: `Invalid card type "${type}". Available: 2048, snake, fight, hangman, pokemon, share, leaderboard` },
        };
      } catch (err: any) {
        return {
          status: 500,
          body: { error: `Card rendering error: ${err?.message || err}` },
        };
      }
    }

    // 6. GET /overview - Weky Dashboard Overview
    if (path === "/overview" && method === "GET") {
      const overview = await this.bridge.getDashboardOverview();
      return {
        status: 200,
        body: overview,
      };
    }

    return null;
  }

  public async handleAction(action: BridgeAction): Promise<any> {
    if (!action.sessionId) {
      return { success: false, error: "Action missing sessionId" };
    }
    return this.bridge.dispatchMove(action.sessionId, {
      playerId: action.playerId,
      action: action.action,
      payload: action.payload,
      sourcePlatform: action.sourcePlatform as any,
    });
  }
}
