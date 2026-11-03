import assert from "node:assert/strict";
import test from "node:test";
import { isCorsOriginAllowed } from "./cors.js";

const productionClient = "https://books.example.test";

test("production CORS accepts only the configured client origin", () => {
  assert.equal(isCorsOriginAllowed(productionClient, "production", productionClient), true);
  assert.equal(isCorsOriginAllowed("http://localhost:3000", "production", productionClient), false);
  assert.equal(isCorsOriginAllowed("https://other.example.test", "production", productionClient), false);
});

test("development CORS preserves localhost and configured client access", () => {
  assert.equal(isCorsOriginAllowed("http://localhost:3000", "development", "http://127.0.0.1:3000"), true);
  assert.equal(isCorsOriginAllowed("http://127.0.0.1:3000", "development", "http://127.0.0.1:3000"), true);
});

test("originless requests remain allowed for server-to-server requests", () => {
  assert.equal(isCorsOriginAllowed(undefined, "production", productionClient), true);
});
