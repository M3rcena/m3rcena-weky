/**
 * @m3rcena/weky - Auto-Register Hook for Rust-Style Submodule Resolver
 *
 * Automatically intercepts and patches module resolution so that:
 *   import { WekyManager } from '@m3rcena/weky';
 *   import { EcoManager } from '@m3rcena/eco';
 *   import { M3rcenaBridge } from '@m3rcena/bridge';
 * resolve transparently to local Git submodules if present on disk,
 * falling back gracefully to standard npm registry installations.
 *
 * @copyright 2026 M3rcena Development. All rights reserved.
 * @license Apache-2.0
 */

import { getAllPackageResolutions, printResolutionSummary } from "./resolver.js";

let hasRegistered = false;

export function registerSubmoduleResolver(options: { silent?: boolean } = {}): void {
  if (hasRegistered) return;
  hasRegistered = true;

  const resolutions = getAllPackageResolutions();
  const hasAnySubmodule = Object.values(resolutions).some((r) => r.status === "submodule");

  if (!options.silent && !process.env.M3RCENA_RESOLVER_SILENT && hasAnySubmodule) {
    printResolutionSummary();
  }

  try {
    const Module = (require as any)?.main?.constructor || require("node:module");
    if (Module && typeof Module._resolveFilename === "function") {
      const origResolveFilename = Module._resolveFilename;
      Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
        if (request === "@m3rcena/weky" && resolutions["@m3rcena/weky"].status === "submodule") {
          return resolutions["@m3rcena/weky"].path;
        }
        if (request === "@m3rcena/eco" && resolutions["@m3rcena/eco"].status === "submodule") {
          return resolutions["@m3rcena/eco"].path;
        }
        if (request === "@m3rcena/bridge" && resolutions["@m3rcena/bridge"].status === "submodule") {
          return resolutions["@m3rcena/bridge"].path;
        }
        if (request === "@m3rcena/bridge/client" && resolutions["@m3rcena/bridge"].status === "submodule" && resolutions["@m3rcena/bridge"].rootDirectory) {
          const root = resolutions["@m3rcena/bridge"].rootDirectory!;
          const clientPath = resolutions["@m3rcena/bridge"].type === "source"
            ? `${root}/src/client.ts`
            : `${root}/dist/client.mjs`;
          return clientPath;
        }
        return origResolveFilename.call(this, request, parent, isMain, options);
      };
    }
  } catch {
    // ESM fallback
  }
}

registerSubmoduleResolver();

export { getAllPackageResolutions, printResolutionSummary };
