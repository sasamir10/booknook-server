import assert from "node:assert/strict";
import test from "node:test";
import { configureDevelopmentDns } from "./development-dns.js";

test("development DNS override applies configured resolver IPs", () => {
  let applied: string[] = [];
  const changed = configureDevelopmentDns("development", "8.8.8.8, 8.8.4.4", (servers) => { applied = servers; });
  assert.equal(changed, true);
  assert.deepEqual(applied, ["8.8.8.8", "8.8.4.4"]);
});

test("production ignores development DNS configuration", () => {
  let called = false;
  const changed = configureDevelopmentDns("production", "not-a-resolver", () => { called = true; });
  assert.equal(changed, false);
  assert.equal(called, false);
});

test("development DNS configuration rejects non-IP values", () => {
  assert.throws(
    () => configureDevelopmentDns("development", "not-a-resolver", () => undefined),
    /comma-separated list of IP addresses in development/,
  );
});
