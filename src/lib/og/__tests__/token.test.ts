import test from "node:test";
import assert from "node:assert/strict";
import { signRankToken, verifyRankToken } from "../token";

// `getSecret()` is read on every sign/verify call, not at module-load time,
// so wiring the env var here is enough — no top-level await / `require`.
process.env.OG_TOKEN_SECRET =
  process.env.OG_TOKEN_SECRET ??
  "test-only-secret-please-do-not-ship-thirty-two-chars";

const basePayload = {
  rank: 312,
  total: 1000,
  referralCode: "LU-A4F2QP",
  seedId: 7,
};

test("signRankToken + verifyRankToken round-trip", async () => {
  const token = await signRankToken(basePayload);
  assert.match(token, /^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  const decoded = await verifyRankToken(token);
  assert.equal(decoded.rank, basePayload.rank);
  assert.equal(decoded.total, basePayload.total);
  assert.equal(decoded.referralCode, basePayload.referralCode);
  assert.equal(decoded.seedId, basePayload.seedId);
  assert.equal(typeof decoded.iat, "number");
});

test("verifyRankToken rejects a bad signature", async () => {
  const token = await signRankToken(basePayload);
  const parts = token.split(".");
  parts[2] = parts[2].slice(0, -1) + (parts[2].endsWith("A") ? "B" : "A");
  await assert.rejects(() => verifyRankToken(parts.join(".")), /signature mismatch/);
});

test("verifyRankToken rejects tampered payload", async () => {
  const token = await signRankToken(basePayload);
  const parts = token.split(".");
  parts[1] = btoa('{"rank":1,"total":1000,"referralCode":"LU-A4F2QP","seedId":7,"iat":0}')
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  await assert.rejects(() => verifyRankToken(parts.join(".")), /signature mismatch|invalid/);
});

test("verifyRankToken rejects expired tokens", async () => {
  const old = await signRankToken({ ...basePayload, iat: 1 });
  await assert.rejects(
    () => verifyRankToken(old, { ttlSeconds: 60, nowSeconds: 1_000_000_000 }),
    /expired/,
  );
});

test("verifyRankToken rejects malformed tokens", async () => {
  await assert.rejects(() => verifyRankToken(""), /Malformed/);
  await assert.rejects(() => verifyRankToken("v1.body"), /Malformed/);
  await assert.rejects(() => verifyRankToken("v2.body.sig"), /Malformed/);
});
