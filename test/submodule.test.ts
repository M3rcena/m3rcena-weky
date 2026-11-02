import assert from "node:assert";
import http from "node:http";
import { resolvePackage, getAllPackageResolutions, generateTsConfigPaths, hostWeky } from "../src/index.js";

async function runSubmoduleTests() {
  console.log("=== TESTING WEKY RUST-STYLE SUBMODULE RESOLVER & HOST ===");

  const resolutions = getAllPackageResolutions();
  assert.ok(resolutions["@m3rcena/weky"]);
  assert.strictEqual(resolutions["@m3rcena/weky"].status, "submodule");
  console.log("  ✓ Weky detected as submodule");

  const tsPaths = generateTsConfigPaths();
  assert.ok(tsPaths["@m3rcena/weky"]);
  console.log("  ✓ Weky tsconfig paths generated");

  const { server, port } = await hostWeky({ port: 5125 });
  assert.strictEqual(port, 5125);

  const res = await new Promise<{ status: number; body: any }>((resolve, reject) => {
    http.get(`http://localhost:${port}/health`, (response) => {
      let data = "";
      response.on("data", (c) => (data += c));
      response.on("end", () => resolve({ status: response.statusCode ?? 0, body: JSON.parse(data) }));
    }).on("error", reject);
  });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.package, "@m3rcena/weky");
  server.close();
  console.log("  ✓ Weky host server booted, served /health, and stopped cleanly");

  console.log("🎉 ALL WEKY SUBMODULE RESOLVER TESTS PASSED!\n");
}

runSubmoduleTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
