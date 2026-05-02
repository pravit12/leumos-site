# OG rank-frame backdrops

Holds the **12 pre-curated stills** referenced in [fomo-spec §4.3](../../../README.md#leu-39).

## Status — v1 (LEU-46)

The 12 stills are sourced separately by UXDesigner ([fomo-spec §8.4](../../../README.md#leu-39) open item). Until they
land we render **deterministic gradient stubs** computed from the user's referral code seed; the seed → palette
mapping lives in `src/lib/og/seed.ts`. Both the in-page `<RankFrame>` and the `/api/og/rank` PNG share the same
palette, so the visual is identical in-page, in the downloaded PNG, and in the email.

## Drop-in contract for the real stills

When the rights-cleared stills arrive:

- **File names**: `00.jpg` through `11.jpg`. The numeric id matches the `seedId` in `paletteForSeed`.
- **Dimensions**: 1080×1350 (4:5 vertical), max **200 KB** each (mozjpeg quality ~78 is the working budget).
- **No faces, no scenes, no text** — abstract, color-graded fields only.
- **Color profile**: sRGB. Strip EXIF on commit.
- Update `src/lib/og/seed.ts` to flag stills as available, and `/api/og/rank` will switch from rendering a CSS
  gradient to compositing the still over the letterbox.

## Why the directory ships empty

Committing 12 placeholder JPGs would balloon the repo without adding anything visual that isn't already in the
gradient stub path. The stills are an art-direction deliverable, not engineering output, and the spec explicitly
allows stub gradients for v1.
