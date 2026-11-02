const { spawnSync } = require("node:child_process");
const path = require("node:path");

const preload = JSON.stringify(path.join(__dirname, "test-preload.cjs"));
const env = { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --require=${preload}`.trim() };
const cli = path.join(__dirname, "..", "node_modules", "tsx", "dist", "cli.mjs");
const result = spawnSync(process.execPath, [cli, "--test", "src/validators/schemas.test.ts"], { env, stdio: "inherit" });
process.exitCode = result.status ?? 1;
