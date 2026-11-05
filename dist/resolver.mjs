import { t as __require } from "./rolldown-runtime-D3PmRqjj.mjs";
import fs from "node:fs";
import path from "node:path";
// src/resolver.ts
/**
* @m3rcena/weky - Rust-Style Submodule & Path Resolver
*
* Inspired by Cargo's workspace and [patch.crates-io] resolver algorithm.
* Enables zero-friction consumption of @m3rcena packages via Git submodules,
* local vendor paths, or standard NPM registry installs without code changes.
*
* @copyright 2026 M3rcena Development. All rights reserved.
* @license Apache-2.0
*/
const KNOWN_PACKAGES = {
	"@m3rcena/weky": {
		aliases: [
			"m3rcena-weky",
			"weky",
			"weky-manager"
		],
		envVar: "M3RCENA_WEKY_PATH"
	},
	"@m3rcena/eco": {
		aliases: [
			"m3rcena-eco",
			"eco",
			"economy"
		],
		envVar: "M3RCENA_ECO_PATH"
	},
	"@m3rcena/bridge": {
		aliases: [
			"m3rcena-bridge",
			"bridge",
			"m3rcena-core"
		],
		envVar: "M3RCENA_BRIDGE_PATH"
	}
};
const CANDIDATE_CONTAINERS = [
	".",
	"submodules",
	"submodule",
	"vendor",
	"packages",
	"libs",
	"modules"
];
function isTypeScriptRuntime() {
	if (typeof process.isBun !== "undefined") return true;
	if (typeof process.isDeno !== "undefined") return true;
	const execArgv = process.execArgv.join(" ");
	if (/tsx|ts-node|@swc\/register|ts-loader/.test(execArgv)) return true;
	if (process.argv[1]?.endsWith(".ts") || process.argv[1]?.endsWith(".mts")) return true;
	if (process.env.M3RCENA_PREFER_SOURCE === "true" || process.env.M3RCENA_PREFER_SOURCE === "1") return true;
	return false;
}
function findProjectRoot(startDir = process.cwd()) {
	let current = path.resolve(startDir);
	for (let i = 0; i < 6; i++) {
		const pkgJson = path.join(current, "package.json");
		if (fs.existsSync(pkgJson)) return current;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return path.resolve(startDir);
}
function loadResolverConfig(cwd = process.cwd()) {
	const root = findProjectRoot(cwd);
	const resolverFile = path.join(root, "m3rcena.resolver.json");
	if (fs.existsSync(resolverFile)) try {
		return JSON.parse(fs.readFileSync(resolverFile, "utf-8"));
	} catch {}
	const pkgJsonPath = path.join(root, "package.json");
	if (fs.existsSync(pkgJsonPath)) try {
		const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
		if (pkg.m3rcena && typeof pkg.m3rcena === "object") return pkg.m3rcena;
	} catch {}
	return null;
}
function inspectSubmoduleDirectory(dirPath, expectedName) {
	if (!fs.existsSync(dirPath)) return { isValid: false };
	try {
		if (!fs.statSync(dirPath).isDirectory()) return { isValid: false };
		const pkgPath = path.join(dirPath, "package.json");
		if (fs.existsSync(pkgPath)) {
			const data = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
			if (data.name === expectedName) return {
				isValid: true,
				version: data.version
			};
		}
		if (fs.existsSync(path.join(dirPath, "src", "index.ts"))) return { isValid: true };
	} catch {
		return { isValid: false };
	}
	return { isValid: false };
}
function resolveSubmoduleEntryPoint(dirPath, preferSource) {
	const srcTs = path.join(dirPath, "src", "index.ts");
	const distMjs = path.join(dirPath, "dist", "index.mjs");
	const distCjs = path.join(dirPath, "dist", "index.cjs");
	const isBuilt = fs.existsSync(distMjs) || fs.existsSync(distCjs);
	if (preferSource && fs.existsSync(srcTs)) return {
		entryPath: srcTs,
		type: "source",
		isBuilt
	};
	if (fs.existsSync(distMjs)) return {
		entryPath: distMjs,
		type: "dist",
		isBuilt: true
	};
	if (fs.existsSync(distCjs)) return {
		entryPath: distCjs,
		type: "dist",
		isBuilt: true
	};
	if (fs.existsSync(srcTs)) return {
		entryPath: srcTs,
		type: "source",
		isBuilt: false
	};
	return {
		entryPath: dirPath,
		type: "dist",
		isBuilt
	};
}
function resolvePackage(packageName, options = {}) {
	const root = findProjectRoot(options.cwd ?? process.cwd());
	const cfg = loadResolverConfig(root);
	const pkgMeta = KNOWN_PACKAGES[packageName];
	const preferSource = options.preferSource ?? cfg?.preferSource ?? isTypeScriptRuntime();
	const rootInspected = inspectSubmoduleDirectory(root, packageName);
	if (rootInspected.isValid) {
		const ep = resolveSubmoduleEntryPoint(root, preferSource);
		return {
			name: packageName,
			status: "submodule",
			type: ep.type,
			path: ep.entryPath,
			rootDirectory: root,
			version: rootInspected.version,
			isBuilt: ep.isBuilt
		};
	}
	if (options.overrides?.[packageName]) {
		const customPath = path.resolve(root, options.overrides[packageName]);
		const inspected = inspectSubmoduleDirectory(customPath, packageName);
		if (inspected.isValid) {
			const ep = resolveSubmoduleEntryPoint(customPath, preferSource);
			return {
				name: packageName,
				status: "submodule",
				type: ep.type,
				path: ep.entryPath,
				rootDirectory: customPath,
				version: inspected.version,
				isBuilt: ep.isBuilt
			};
		}
	}
	const envVal = process.env[pkgMeta.envVar];
	if (envVal) {
		const customPath = path.resolve(root, envVal);
		const inspected = inspectSubmoduleDirectory(customPath, packageName);
		if (inspected.isValid) {
			const ep = resolveSubmoduleEntryPoint(customPath, preferSource);
			return {
				name: packageName,
				status: "submodule",
				type: ep.type,
				path: ep.entryPath,
				rootDirectory: customPath,
				version: inspected.version,
				isBuilt: ep.isBuilt
			};
		}
	}
	if (cfg?.packages?.[packageName]) {
		const customPath = path.resolve(root, cfg.packages[packageName]);
		const inspected = inspectSubmoduleDirectory(customPath, packageName);
		if (inspected.isValid) {
			const ep = resolveSubmoduleEntryPoint(customPath, preferSource);
			return {
				name: packageName,
				status: "submodule",
				type: ep.type,
				path: ep.entryPath,
				rootDirectory: customPath,
				version: inspected.version,
				isBuilt: ep.isBuilt
			};
		}
	}
	const candidateContainers = [
		options.submodulesDir,
		cfg?.submodulesDir,
		process.env.M3RCENA_SUBMODULES_DIR,
		...CANDIDATE_CONTAINERS
	].filter((c) => typeof c === "string" && c.trim().length > 0);
	const searchRoots = [
		root,
		path.resolve(root, ".."),
		path.resolve(root, "../..")
	];
	for (const sRoot of searchRoots) for (const container of candidateContainers) for (const alias of pkgMeta.aliases) {
		const candidateDir = path.resolve(sRoot, container, alias);
		const inspected = inspectSubmoduleDirectory(candidateDir, packageName);
		if (inspected.isValid) {
			const ep = resolveSubmoduleEntryPoint(candidateDir, preferSource);
			return {
				name: packageName,
				status: "submodule",
				type: ep.type,
				path: ep.entryPath,
				rootDirectory: candidateDir,
				version: inspected.version,
				isBuilt: ep.isBuilt
			};
		}
	}
	try {
		return {
			name: packageName,
			status: "npm",
			type: "registry",
			path: __require.resolve(packageName, { paths: [root, process.cwd()] })
		};
	} catch {
		const nmPath = path.join(root, "node_modules", packageName);
		if (fs.existsSync(nmPath)) return {
			name: packageName,
			status: "npm",
			type: "registry",
			path: nmPath
		};
	}
	return {
		name: packageName,
		status: "missing",
		type: "registry",
		path: packageName
	};
}
function getAllPackageResolutions(options = {}) {
	return {
		"@m3rcena/weky": resolvePackage("@m3rcena/weky", options),
		"@m3rcena/eco": resolvePackage("@m3rcena/eco", options),
		"@m3rcena/bridge": resolvePackage("@m3rcena/bridge", options)
	};
}
function generateTsConfigPaths(options = {}) {
	const resolutions = getAllPackageResolutions(options);
	const root = findProjectRoot(options.cwd ?? process.cwd());
	const paths = {};
	for (const [name, res] of Object.entries(resolutions)) if (res.status === "submodule" && res.rootDirectory) {
		const rel = path.relative(root, res.rootDirectory).replace(/\\/g, "/");
		const cleanRel = !rel || rel === "." ? "." : rel.startsWith(".") ? rel : `./${rel}`;
		paths[name] = [
			`${cleanRel}/src`,
			`${cleanRel}/dist/index.mjs`,
			cleanRel
		];
		if (name === "@m3rcena/bridge") paths["@m3rcena/bridge/client"] = [`${cleanRel}/src/client`, `${cleanRel}/dist/client.mjs`];
	}
	return paths;
}
function printResolutionSummary(options = {}) {
	const resolutions = getAllPackageResolutions(options);
	const cyan = (s) => `\x1b[36m${s}\x1b[39m`;
	const green = (s) => `\x1b[32m${s}\x1b[39m`;
	const yellow = (s) => `\x1b[33m${s}\x1b[39m`;
	const gray = (s) => `\x1b[90m${s}\x1b[39m`;
	const bold = (s) => `\x1b[1m${s}\x1b[22m`;
	console.log(cyan("┌────────────────────────────────────────────────────────────────────────┐"));
	console.log(cyan("│") + bold("  🦀 M3RCENA RUST-STYLE SUBMODULE RESOLVER                              ") + cyan("│"));
	console.log(cyan("├────────────────────────────────────────────────────────────────────────┤"));
	for (const [name, res] of Object.entries(resolutions)) {
		const padName = name.padEnd(16);
		if (res.status === "submodule") {
			const mode = res.type === "source" ? yellow("[SOURCE]") : green("[DIST]");
			const ver = res.version ? `v${res.version}` : "local";
			const shortPath = res.rootDirectory ? path.basename(res.rootDirectory) : res.path;
			console.log(cyan("│") + `  ${bold(padName)} -> ${green("submodule")} ${mode} ${gray(ver)} ${gray(`(${shortPath})`)}`.padEnd(79) + cyan("│"));
		} else if (res.status === "npm") console.log(cyan("│") + `  ${bold(padName)} -> ${cyan("npm registry")} ${gray("(node_modules)")}`.padEnd(79) + cyan("│"));
		else console.log(cyan("│") + `  ${bold(padName)} -> ${gray("not installed")}`.padEnd(79) + cyan("│"));
	}
	console.log(cyan("└────────────────────────────────────────────────────────────────────────┘"));
}
export { findProjectRoot, generateTsConfigPaths, getAllPackageResolutions, isTypeScriptRuntime, loadResolverConfig, printResolutionSummary, resolvePackage };

//# sourceMappingURL=resolver.mjs.map