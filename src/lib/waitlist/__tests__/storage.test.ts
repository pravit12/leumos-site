import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { __resetStorageForTests, getStorage } from "../storage";

describe("MemoryStorage (waitlist storage in-memory fallback)", () => {
  beforeEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    __resetStorageForTests();
  });

  it("creates a sign-up with a stable signupOrder and looks it up by email and code", async () => {
    const store = getStorage();
    const created = await store.createSignup({
      email: "ada@example.com",
      referralCode: "LU-AB23CD",
      createdAt: new Date().toISOString(),
    });
    assert.equal(created.signupOrder, 1);
    assert.equal(created.queuePosition, 1);

    const byEmail = await store.getByEmail("ada@example.com");
    assert.equal(byEmail?.email, "ada@example.com");

    const byCode = await store.getByReferralCode("LU-AB23CD");
    assert.equal(byCode?.email, "ada@example.com");
  });

  it("each new sign-up increments the global counter", async () => {
    const store = getStorage();
    const a = await store.createSignup({
      email: "a@example.com",
      referralCode: "LU-AAAAAA",
      createdAt: new Date().toISOString(),
    });
    const b = await store.createSignup({
      email: "b@example.com",
      referralCode: "LU-BBBBBB",
      createdAt: new Date().toISOString(),
    });
    assert.equal(a.signupOrder, 1);
    assert.equal(b.signupOrder, 2);
    assert.equal(await store.totalSignups(), 2);
  });

  it("incrementing referral count lifts the referrer's queue position by 10 per conversion", async () => {
    const store = getStorage();
    const referrer = await store.createSignup({
      email: "ref@example.com",
      referralCode: "LU-REFCOD",
      createdAt: new Date().toISOString(),
    });
    // pad the queue so the referrer has room to move up
    for (let i = 0; i < 30; i++) {
      await store.createSignup({
        email: `pad-${i}@example.com`,
        referralCode: `LU-PAD${i.toString().padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
      });
    }
    const startPos = await store.computeQueuePosition(
      (await store.getByEmail(referrer.email))!,
    );
    assert.equal(startPos, 1); // referrer was first

    // 3 conversions
    await store.incrementReferralCount("LU-REFCOD");
    await store.incrementReferralCount("LU-REFCOD");
    await store.incrementReferralCount("LU-REFCOD");

    // start position is 1 already — verify the boost arithmetic on a deeper
    // record so we can see it move.
    const pad15 = (await store.getByEmail("pad-15@example.com"))!;
    const padStart = await store.computeQueuePosition(pad15);
    assert.equal(padStart, pad15.signupOrder); // no boost yet

    await store.incrementReferralCount(pad15.referralCode);
    await store.incrementReferralCount(pad15.referralCode);
    const padAfter = await store.computeQueuePosition(pad15);
    assert.equal(padAfter, Math.max(1, pad15.signupOrder - 20));
  });

  it("rate-limits the same IP after the configured threshold", async () => {
    const store = getStorage();
    const ip = "203.0.113.42";
    let lastAllowed = true;
    let blockedAt = -1;
    for (let i = 0; i < 10; i++) {
      const r = await store.rateLimit(ip);
      if (!r.allowed && lastAllowed) blockedAt = i;
      lastAllowed = r.allowed;
    }
    assert.ok(blockedAt > 0, "expected to be rate-limited at some point");
  });
});
