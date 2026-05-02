// Deterministic referral-code → backdrop-variant mapping.
//
// Same user always sees the same cinema-frame look across the in-page
// render, the downloadable PNG, and the email embed. The hash is a small
// FNV-1a over the upper-cased referral code — collision resistance does
// not matter here; uniform distribution across 12 buckets does.
//
// 12 stub gradient palettes mirror brand-system v1 §1 — pulled from the
// lume + stage + signal + hot ramps. UXDesigner replaces these with
// rights-cleared color-field stills per fomo-spec §8.4 once they land.

export const BACKDROP_COUNT = 12;

export type GradientStop = { color: string; offset: number };

export type BackdropPalette = {
  id: number;
  angle: number; // degrees
  stops: GradientStop[];
  name: string;
};

const PALETTES: BackdropPalette[] = [
  {
    id: 0,
    name: "blue-dawn",
    angle: 105,
    stops: [
      { color: "#1F4DFF", offset: 0 },
      { color: "#3A4150", offset: 40 },
      { color: "#161B26", offset: 75 },
      { color: "#FF7A1A", offset: 100 },
    ],
  },
  {
    id: 1,
    name: "violet-cut",
    angle: 115,
    stops: [
      { color: "#6B2BD9", offset: 0 },
      { color: "#252B38", offset: 45 },
      { color: "#0D1119", offset: 80 },
      { color: "#D6238C", offset: 100 },
    ],
  },
  {
    id: 2,
    name: "magenta-fade",
    angle: 100,
    stops: [
      { color: "#D6238C", offset: 0 },
      { color: "#5C2407", offset: 50 },
      { color: "#161B26", offset: 100 },
    ],
  },
  {
    id: 3,
    name: "warm-knot",
    angle: 95,
    stops: [
      { color: "#FF7A1A", offset: 0 },
      { color: "#A1410A", offset: 40 },
      { color: "#252B38", offset: 80 },
      { color: "#07090F", offset: 100 },
    ],
  },
  {
    id: 4,
    name: "stage-night",
    angle: 110,
    stops: [
      { color: "#0D1119", offset: 0 },
      { color: "#1F4DFF", offset: 35 },
      { color: "#161B26", offset: 70 },
      { color: "#5FCDE0", offset: 100 },
    ],
  },
  {
    id: 5,
    name: "credit-roll",
    angle: 120,
    stops: [
      { color: "#161B26", offset: 0 },
      { color: "#6B2BD9", offset: 50 },
      { color: "#FFA866", offset: 100 },
    ],
  },
  {
    id: 6,
    name: "hot-pivot",
    angle: 90,
    stops: [
      { color: "#0D1119", offset: 0 },
      { color: "#D6238C", offset: 60 },
      { color: "#FF7A1A", offset: 100 },
    ],
  },
  {
    id: 7,
    name: "cine-deep",
    angle: 105,
    stops: [
      { color: "#0E5F73", offset: 0 },
      { color: "#1F4DFF", offset: 40 },
      { color: "#252B38", offset: 80 },
      { color: "#07090F", offset: 100 },
    ],
  },
  {
    id: 8,
    name: "ember",
    angle: 100,
    stops: [
      { color: "#5C2407", offset: 0 },
      { color: "#FF7A1A", offset: 35 },
      { color: "#161B26", offset: 80 },
      { color: "#07090F", offset: 100 },
    ],
  },
  {
    id: 9,
    name: "iris",
    angle: 115,
    stops: [
      { color: "#1F4DFF", offset: 0 },
      { color: "#6B2BD9", offset: 38 },
      { color: "#D6238C", offset: 65 },
      { color: "#FF7A1A", offset: 100 },
    ],
  },
  {
    id: 10,
    name: "ash-orange",
    angle: 95,
    stops: [
      { color: "#3A4150", offset: 0 },
      { color: "#A1410A", offset: 50 },
      { color: "#FFA866", offset: 100 },
    ],
  },
  {
    id: 11,
    name: "studio",
    angle: 125,
    stops: [
      { color: "#252B38", offset: 0 },
      { color: "#0E5F73", offset: 45 },
      { color: "#161B26", offset: 80 },
      { color: "#FFA866", offset: 100 },
    ],
  },
];

// FNV-1a 32-bit. Tiny, branchless, and stable across edge / node / browser.
function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

export function seedFromReferralCode(referralCode: string): number {
  const normalised = referralCode.trim().toUpperCase();
  if (normalised.length === 0) return 0;
  return fnv1a(normalised) % BACKDROP_COUNT;
}

export function paletteForSeed(seedId: number): BackdropPalette {
  const safe = ((seedId % BACKDROP_COUNT) + BACKDROP_COUNT) % BACKDROP_COUNT;
  return PALETTES[safe];
}

export function paletteForReferralCode(referralCode: string): BackdropPalette {
  return paletteForSeed(seedFromReferralCode(referralCode));
}

export function paletteToCssGradient(palette: BackdropPalette): string {
  const stops = palette.stops
    .map((s) => `${s.color} ${s.offset}%`)
    .join(", ");
  return `linear-gradient(${palette.angle}deg, ${stops})`;
}
