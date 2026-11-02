/**
 * @m3rcena/weky - Standalone Local Submodule Host Service
 *
 * Runs the Weky Arcade Engine locally when cloned via Git submodules.
 * Supports both Headless HTTP Arcade Server mode and interactive Discord Bot mode.
 * Automatically connects to local @m3rcena/bridge if detected.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import http from "node:http";
import { WekyManager } from "./core/WekyManager.js";
import { WekyBridge } from "./bridge/WekyBridge.js";
import { WekyBridgeRouter } from "./bridge/WekyBridgeRouter.js";
import { getAllPackageResolutions, printResolutionSummary } from "./resolver.js";
import { RenderPokemon } from "./canvas/RenderPokemon.js";

export interface HostWekyOptions {
  port?: number;
  bridgeUrl?: string;
  discordToken?: string;
}

export async function hostWeky(options: HostWekyOptions = {}): Promise<{
  server: http.Server;
  router: WekyBridgeRouter;
  port: number;
}> {
  const port = options.port ?? parseInt(process.env.PORT || process.env.WEKY_PORT || "4001", 10);
  const bridgeUrl = options.bridgeUrl ?? (process.env.BRIDGE_URL || "http://localhost:4000/bridge");

  printResolutionSummary();

  const wekyBridge = new WekyBridge();
  const router = wekyBridge.router;

  // Try auto-connecting to Bridge if bridge submodule/npm exists
  const resolutions = getAllPackageResolutions();
  if (resolutions["@m3rcena/bridge"].status !== "missing") {
    try {
      const bridgeModule = await import(resolutions["@m3rcena/bridge"].path);
      if (bridgeModule.M3rcenaBridge) {
        console.log(`[m3rcena-weky] 🌉 Found @m3rcena/bridge (${resolutions["@m3rcena/bridge"].status}). Ready for bridge mount.`);
      }
    } catch {
      // Ignore
    }
  }

  // Create standalone local HTTP server for Weky Headless API
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const pathname = url.pathname;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (pathname === "/health" || pathname === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "healthy",
          package: "@m3rcena/weky",
          mode: "local-submodule-host",
          version: "14.28.0",
          uptime: process.uptime(),
          canvasEngine: "@napi-rs/canvas (blazingly fast Rust renderer)",
        }, null, 2)
      );
      return;
    }

    if (pathname === "/catalog") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          games: [
            { id: "2048", name: "2048", mode: "singleplayer", canvas: true },
            { id: "snake", name: "Snake", mode: "singleplayer", canvas: true },
            { id: "fight", name: "Fight", mode: "pvp", canvas: true },
            { id: "tictactoe", name: "TicTacToe", mode: "pvp", canvas: false },
            { id: "calculator", name: "Calculator", mode: "utility", canvas: false },
            { id: "hangman", name: "Hangman", mode: "word", canvas: true },
            { id: "guess-pokemon", name: "Guess The Pokemon", mode: "trivia", canvas: true },
            { id: "trivia", name: "Trivia", mode: "quiz", canvas: false },
            { id: "minesweeper", name: "Minesweeper", mode: "puzzle", canvas: false },
            { id: "connect4", name: "Connect4", mode: "pvp", canvas: false },
          ],
        }, null, 2)
      );
      return;
    }

    if (pathname === "/render/pokemon") {
      try {
        const buf = await RenderPokemon.renderCard({
          name: "Pikachu",
          types: ["electric"],
          abilities: ["static"],
          imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
        }, url.searchParams.get("reveal") === "true");
        res.writeHead(200, { "Content-Type": "image/png" });
        res.end(buf);
        return;
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // Forward to WekyBridgeRouter if matched
    if (pathname.startsWith("/weky/") || pathname.startsWith("/api/weky")) {
      const bridgeReq = {
        method: req.method ?? "GET",
        url: req.url || "/",
        path: pathname,
        subPath: pathname.replace(/^\/(?:api\/)?weky/, ""),
        params: {},
        headers: req.headers as Record<string, string>,
        query: Object.fromEntries(url.searchParams.entries()),
      };
      const handled = await router.handleRequest(bridgeReq as any);
      if (handled) {
        res.writeHead(handled.status, {
          "Content-Type": handled.contentType || "application/json",
          ...(handled.headers || {}),
        });
        if (Buffer.isBuffer(handled.body)) {
          res.end(handled.body);
        } else if (typeof handled.body === "string") {
          res.end(handled.body);
        } else {
          res.end(JSON.stringify(handled.body));
        }
        return;
      }
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found", path: pathname }));
  });

  await new Promise<void>((resolve) => {
    server.listen(port, () => resolve());
  });

  console.log(`
┌────────────────────────────────────────────────────────────────────────┐
│  🕹️  M3RCENA WEKY LOCAL HOST SERVICE                                   │
│  Arcade Engine running on http://localhost:${port.toString().padEnd(27)}│
│  - Health API:     http://localhost:${port}/health                        │
│  - Games Catalog:  http://localhost:${port}/catalog                       │
│  - Canvas Preview: http://localhost:${port}/render/pokemon                │
│  Ready to host minigames locally via Submodule!                        │
└────────────────────────────────────────────────────────────────────────┘
`);

  return { server, router, port };
}

if (process.argv[1]?.endsWith("host.ts") || process.argv[1]?.endsWith("host.js")) {
  hostWeky().catch((err) => {
    console.error("[m3rcena-weky host] Fatal error:", err);
    process.exit(1);
  });
}
