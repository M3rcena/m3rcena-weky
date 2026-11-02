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
export type M3rcenaPackageName = "@m3rcena/weky" | "@m3rcena/eco" | "@m3rcena/bridge";
export interface PackageResolution {
  name: M3rcenaPackageName;
  status: "submodule" | "npm" | "missing";
  type: "source" | "dist" | "registry";
  path: string;
  rootDirectory?: string;
  version?: string;
  isBuilt?: boolean;
}
export interface ResolverOptions {
  cwd?: string;
  submodulesDir?: string;
  preferSource?: boolean;
  overrides?: Partial<Record<M3rcenaPackageName, string>>;
  silent?: boolean;
}
export interface M3rcenaResolverConfig {
  submodulesDir?: string;
  preferSource?: boolean;
  packages?: Partial<Record<M3rcenaPackageName, string>>;
}
export declare function isTypeScriptRuntime(): boolean;
export declare function findProjectRoot(startDir?: string): string;
export declare function loadResolverConfig(cwd?: string): M3rcenaResolverConfig | null;
export declare function resolvePackage(packageName: M3rcenaPackageName, options?: ResolverOptions): PackageResolution;
export declare function getAllPackageResolutions(options?: ResolverOptions): Record<M3rcenaPackageName, PackageResolution>;
export declare function generateTsConfigPaths(options?: ResolverOptions): Record<string, string[]>;
export declare function printResolutionSummary(options?: ResolverOptions): void;
//# sourceMappingURL=resolver.d.mts.map