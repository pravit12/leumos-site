import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { signupInputSchema } from "../schema";
import { generateReferralCode, isValidReferralCode } from "../referral-code";

describe("signupInputSchema", () => {
  it("accepts a minimal valid sign-up", () => {
    const parsed = signupInputSchema.parse({ email: "Hi@Example.com" });
    assert.equal(parsed.email, "hi@example.com");
    assert.equal(parsed.name, undefined);
  });

  it("rejects an invalid email", () => {
    assert.throws(() => signupInputSchema.parse({ email: "not-an-email" }));
  });

  it("normalizes optional fields and trims whitespace", () => {
    const parsed = signupInputSchema.parse({
      email: "person@example.com",
      name: "  Ada Lovelace  ",
      company: " Analytical Engines ",
      role: "engineer",
      useCase: "team",
      referredBy: "  lu-ab23cd  ",
      website: "",
    });
    assert.equal(parsed.name, "Ada Lovelace");
    assert.equal(parsed.company, "Analytical Engines");
    assert.equal(parsed.role, "engineer");
    assert.equal(parsed.useCase, "team");
    assert.equal(parsed.referredBy, "LU-AB23CD");
  });

  it("drops empty optional strings rather than storing them", () => {
    const parsed = signupInputSchema.parse({
      email: "p@example.com",
      name: "",
      company: "  ",
    });
    assert.equal(parsed.name, undefined);
    assert.equal(parsed.company, undefined);
  });

  it("rejects an enum role outside the allowed list", () => {
    assert.throws(() =>
      signupInputSchema.parse({ email: "p@example.com", role: "ceo" }),
    );
  });

  it("accepts a populated honeypot at the schema level — handler decides what to do", () => {
    const parsed = signupInputSchema.parse({
      email: "p@example.com",
      website: "spam",
    });
    assert.equal(parsed.website, "spam");
  });
});

describe("referral codes", () => {
  it("generates codes that match the validation regex", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateReferralCode();
      assert.match(code, /^LU-[A-Z2-9]{6}$/);
      assert.equal(isValidReferralCode(code), true);
    }
  });

  it("rejects malformed referral codes", () => {
    assert.equal(isValidReferralCode("LU-abcdef"), false);
    assert.equal(isValidReferralCode("LU-12345"), false);
    assert.equal(isValidReferralCode("LU-1A2B3C"), false); // contains 1
    assert.equal(isValidReferralCode("XX-AB23CD"), false);
  });
});
