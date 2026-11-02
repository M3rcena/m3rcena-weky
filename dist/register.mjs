import { t as __require } from "./rolldown-runtime-D3PmRqjj.mjs";
import { getAllPackageResolutions, printResolutionSummary } from "./resolver.mjs";
// src/register.ts
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
let hasRegistered = false;
function registerSubmoduleResolver(options = {}) {
	if (hasRegistered) return;
	hasRegistered = true;
	const resolutions = getAllPackageResolutions();
	const hasAnySubmodule = Object.values(resolutions).some((r) => r.status === "submodule");
	if (!options.silent && !process.env.M3RCENA_RESOLVER_SILENT && hasAnySubmodule) printResolutionSummary();
	try {
		const Module = __require?.main?.constructor || __require("node:module");
		if (Module && typeof Module._resolveFilename === "function") {
			const origResolveFilename = Module._resolveFilename;
			Module._resolveFilename = function(request, parent, isMain, options) {
				if (request === "@m3rcena/weky" && resolutions["@m3rcena/weky"].status === "submodule") return resolutions["@m3rcena/weky"].path;
				if (request === "@m3rcena/eco" && resolutions["@m3rcena/eco"].status === "submodule") return resolutions["@m3rcena/eco"].path;
				if (request === "@m3rcena/bridge" && resolutions["@m3rcena/bridge"].status === "submodule") return resolutions["@m3rcena/bridge"].path;
				if (request === "@m3rcena/bridge/client" && resolutions["@m3rcena/bridge"].status === "submodule" && resolutions["@m3rcena/bridge"].rootDirectory) {
					const root = resolutions["@m3rcena/bridge"].rootDirectory;
					return resolutions["@m3rcena/bridge"].type === "source" ? `${root}/src/client.ts` : `${root}/dist/client.mjs`;
				}
				return origResolveFilename.call(this, request, parent, isMain, options);
			};
		}
	} catch {}
}
registerSubmoduleResolver();
export { getAllPackageResolutions, printResolutionSummary, registerSubmoduleResolver };

//# sourceMappingURL=register.mjs.map