import assert from "node:assert/strict";
import test from "node:test";
import { hmacSha256, hashToken, safeEqual } from "./tokens";

test("hmac signatures match only for the same secret and payload", () => {
  const good = hmacSha256("school-secret", '{"reference":"abc","status":"succeeded"}');
  const replay = hmacSha256("school-secret", '{"reference":"abc","status":"succeeded"}');
  const other = hmacSha256("school-secret", '{"reference":"abc","status":"failed"}');
  assert.equal(safeEqual(good, replay), true);
  assert.equal(safeEqual(good, other), false);
  assert.equal(safeEqual(good, hmacSha256("other-secret", '{"reference":"abc","status":"succeeded"}')), false);
});

test("token hashes are not reversible and differ by input", () => {
  const a = hashToken("verify-token");
  const b = hashToken("other-token");
  assert.equal(a.length, 64);
  assert.notEqual(a, b);
  assert.notEqual(a, "verify-token");
});
