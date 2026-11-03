import assert from "node:assert/strict";
import test from "node:test";
import { loadServerEnvironment } from "./env-validation.js";

const validProduction: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  PORT: "4000",
  MONGODB_URI: "mongodb+srv://user:password@cluster.example.test/booknook",
  DB_NAME: "booknook",
  BETTER_AUTH_URL: "https://books.example.test",
  CLIENT_URL: "https://books.example.test",
  BORROW_DURATION_DAYS: "7",
};

test("production server accepts valid HTTPS auth and client origins", () => {
  const env = loadServerEnvironment(validProduction);
  assert.equal(env.NODE_ENV, "production");
  assert.equal(env.CLIENT_URL, "https://books.example.test");
});

test("production server requires CLIENT_URL and matching auth origin", () => {
  assert.throws(() => loadServerEnvironment({ ...validProduction, CLIENT_URL: undefined }), /CLIENT_URL is required in production/);
  assert.throws(() => loadServerEnvironment({ ...validProduction, BETTER_AUTH_URL: undefined }), /BETTER_AUTH_URL/);
  assert.throws(() => loadServerEnvironment({ ...validProduction, CLIENT_URL: "https://other.example.test" }), /BETTER_AUTH_URL and CLIENT_URL must match/);
});

test("production server rejects local or non-HTTPS origins", () => {
  assert.throws(() => loadServerEnvironment({ ...validProduction, BETTER_AUTH_URL: "http://localhost:3000", CLIENT_URL: "http://localhost:3000" }), /BETTER_AUTH_URL must be an HTTPS origin/);
});

test("server requires valid MongoDB URI and database name without echoing connection values", () => {
  assert.throws(() => loadServerEnvironment({ ...validProduction, MONGODB_URI: undefined }), /MONGODB_URI/);
  assert.throws(() => loadServerEnvironment({ ...validProduction, MONGODB_URI: "not-a-mongodb-uri" }), /MONGODB_URI must be a valid/);
  assert.throws(() => loadServerEnvironment({ ...validProduction, DB_NAME: undefined }), /DB_NAME/);
  assert.throws(() => loadServerEnvironment({ ...validProduction, MONGODB_URI: "mongodb+srv://secret-user:secret-password@/booknook" }), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.doesNotMatch(error.message, /secret-user|secret-password/);
    return true;
  });
});

test("development retains the local client URL default", () => {
  const env = loadServerEnvironment({
    NODE_ENV: "development",
    MONGODB_URI: "mongodb://127.0.0.1:27017/booknook?replicaSet=rs0",
    DB_NAME: "booknook",
    BETTER_AUTH_URL: "http://localhost:3000",
  });
  assert.equal(env.CLIENT_URL, "http://localhost:3000");
});

test("server requires an explicit runtime mode", () => {
  assert.throws(() => loadServerEnvironment({}), /NODE_ENV/);
});
