import test from "node:test";
import assert from "node:assert/strict";
import {
  BACKDROP_COUNT,
  paletteForReferralCode,
  paletteForSeed,
  paletteToCssGradient,
  seedFromReferralCode,
} from "../seed";

test("seedFromReferralCode is deterministic for the same code", () => {
  const a = seedFromReferralCode("LU-A4F2QP");
  const b = seedFromReferralCode("LU-A4F2QP");
  assert.equal(a, b);
});

test("seedFromReferralCode is case-insensitive", () => {
  assert.equal(seedFromReferralCode("LU-A4F2QP"), seedFromReferralCode("lu-a4f2qp"));
});

test("seedFromReferralCode falls in [0, BACKDROP_COUNT)", () => {
  for (const code of ["LU-AAAAAA", "LU-ZZZZZZ", "LU-23456X", "LU-PRAVIT", ""]) {
    const seed = seedFromReferralCode(code);
    assert.ok(seed >= 0, `${code} => ${seed} should be >= 0`);
    assert.ok(seed < BACKDROP_COUNT, `${code} => ${seed} should be < ${BACKDROP_COUNT}`);
  }
});

test("seedFromReferralCode distributes across multiple buckets", () => {
  const seen = new Set<number>();
  // Sample 200 random-ish codes and confirm we hit at least 6 of 12 buckets.
  const sample = [
    "LU-ABCDEF", "LU-FEDCBA", "LU-23456X", "LU-X65432", "LU-PQRSTV",
    "LU-VTSQRP", "LU-MNHJKL", "LU-LKJHNM", "LU-WXYZ23", "LU-32ZYXW",
    "LU-A4F2QP", "LU-Q2F4AP", "LU-CINEMA", "LU-LEUMOS", "LU-FOUNDR",
    "LU-PIVOT2", "LU-SIGNAL", "LU-LEMON3", "LU-MAGNTA", "LU-ORANGE",
  ];
  for (const code of sample) seen.add(seedFromReferralCode(code));
  assert.ok(seen.size >= 6, `expected >=6 distinct buckets, got ${seen.size}: ${[...seen].join(",")}`);
});

test("paletteForSeed wraps for negative or oversized ids", () => {
  assert.equal(paletteForSeed(0).id, paletteForSeed(BACKDROP_COUNT).id);
  assert.equal(paletteForSeed(-1).id, paletteForSeed(BACKDROP_COUNT - 1).id);
});

test("paletteForReferralCode returns the same palette as seed lookup", () => {
  const code = "LU-A4F2QP";
  const direct = paletteForSeed(seedFromReferralCode(code));
  const via = paletteForReferralCode(code);
  assert.equal(direct.id, via.id);
  assert.equal(direct.name, via.name);
});

test("paletteToCssGradient returns a sane CSS gradient string", () => {
  const css = paletteToCssGradient(paletteForSeed(0));
  assert.match(css, /^linear-gradient\(\d+deg,/);
  assert.match(css, /#[0-9A-F]{6} \d+%/i);
});
