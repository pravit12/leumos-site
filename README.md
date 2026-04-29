# Leumos AI — marketing site

Pre-launch marketing site for Leumos AI. Single goal: high-quality waitlist sign-ups, with strong technical SEO and Lighthouse 90+ across every page.

## Stack

- **Next.js 15 (App Router)** + TypeScript + React 19
- **Tailwind CSS** with a small token layer (color, spacing, type scale) in `tailwind.config.ts`
- **Vercel** for production + per-PR preview deploys
- **Lighthouse CI** on every PR (perf / SEO / a11y / best-practices each ≥ 90; LCP < 2.5s; CLS < 0.1; INP < 200ms)
- **MDX** for blog posts (file-system content under `content/blog/`)

### Why Next.js (not Astro / Framer)

We need API routes for the waitlist sign-up, the referral mechanic, and (later) ESP webhooks. App Router gives tight per-route control over caching, OG image generation, and structured data. Astro is faster for purely static surfaces, but the dynamic surface area we're about to build — and Vercel's preview-per-PR DX — favors Next.js. If we ever need to pull the blog out into a static-only build, MDX content stays portable.

## Local development

```bash
# Node 20+ required (see package.json engines)
cp .env.example .env.local
npm install
npm run dev
# open http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm run start       # serve the production build locally
npm run lint        # next lint
npm run typecheck   # tsc --noEmit
npm test            # unit tests (tsx --test)
```

## Required environment variables

All values go in `.env.local` for local dev or in Vercel project settings for preview/prod. See `.env.example` for the full list.

| Var                                    | Where used      | Required | Notes                                                                        |
| -------------------------------------- | --------------- | -------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | metadata, sitemap, robots, canonical, OG | yes (prod) | e.g. `https://leumos.ai`. Falls back to `VERCEL_URL` then `http://localhost:3000`. |
| `RESEND_API_KEY`                       | waitlist confirmation email | yes (prod) | Resend API key. If unset, the API logs and skips the send (dev/preview safe). |
| `RESEND_FROM_EMAIL`                    | waitlist confirmation email | optional | Defaults to `Leumos AI <hello@leumos.ai>`. Must be a Resend-verified sender.   |
| `RESEND_AUDIENCE_ID`                   | audience sync               | optional | If set, every sign-up is also pushed to this Resend Audience.                 |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | waitlist storage           | yes (prod) | Vercel KV / Upstash Redis credentials. In dev/CI, an in-memory fallback is used so the form still works without a KV binding. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`         | analytics        | placeholder | e.g. `leumos.ai`. Wired up in a separate ticket.                            |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`       | heatmaps         | placeholder | Microsoft Clarity project id.                                               |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | search console   | optional | Adds `<meta name="google-site-verification" />` to `<head>`.                |
| `VERCEL_URL` / `VERCEL_ENV`            | Vercel runtime   | auto     | Injected by Vercel — do not set manually.                                   |

Robots.txt **only allows indexing when `VERCEL_ENV === "production"`**. Preview deploys serve a `Disallow: /` to keep them out of search.

## Project structure

```
src/
  app/
    layout.tsx                  # root layout, fonts, metadata, JSON-LD, header/footer
    page.tsx                    # home page: hero + waitlist + JSON-LD
    sitemap.ts                  # /sitemap.xml — staticRoutes + every published blog post
    robots.ts                   # /robots.txt
    opengraph-image.tsx         # default OG image (1200x630, edge-rendered via next/og)
    twitter-image.tsx           # Twitter card variant (re-exports OG)
    icon.svg                    # favicon
    globals.css                 # Tailwind base + minimal element resets
    api/
      waitlist/route.ts         # POST /api/waitlist (sign-up handler)
    blog/
      page.tsx                  # /blog index — published posts list
      [slug]/
        page.tsx                # /blog/[slug] — MDX post page
        opengraph-image.tsx     # per-post OG image
        twitter-image.tsx       # per-post Twitter card
  components/
    site-header.tsx             # <header> + <nav aria-label="Primary">
    site-footer.tsx             # <footer> + <nav aria-label="Footer">
    WaitlistForm.tsx            # client form (email + optional fields, honeypot)
    WaitlistSuccess.tsx         # success state: queue position + share UI
    StickyMobileCTA.tsx         # bottom-anchored mobile CTA bar
    blog/
      MdxComponents.tsx         # mapping for MDX -> styled HTML elements
      PostHeader.tsx            # title, byline, hero image, reading time
      TableOfContents.tsx       # sticky desktop / collapsible mobile TOC
      RelatedPosts.tsx          # related-by-slug grid
      PostCtaSection.tsx        # in-post waitlist CTA (variant-driven)
  content/
    blog/                       # MDX source: <slug>.mdx, frontmatter at top
  lib/
    site.ts                     # siteConfig + getSiteUrl()
    seo.ts                      # buildPageMetadata({ title, description, path, ... })
    structured-data.tsx         # JSON-LD helpers + <JsonLd> component
    og.tsx                      # shared OG card renderer
    analytics/events.ts         # event-name registry + track() stub
    blog/
      content.ts                # MDX loader, frontmatter schema, related lookup
      reading-time.ts           # ~225 wpm estimator
      toc.ts                    # h2/h3 extractor (returns slug + text + depth)
    waitlist/                   # schema, storage, email, referral, utm
.github/workflows/ci.yml        # typecheck, lint, build, Lighthouse CI
lighthouserc.json               # Lighthouse CI budgets (perf/SEO/a11y/BP ≥ 90)
tailwind.config.ts              # token layer
```

## SEO baseline (LEU-3)

Every page inherits a baseline of technical SEO. New pages should use the helpers below rather than wiring metadata by hand — that's how we keep the Lighthouse SEO score ≥ 95 site-wide.

### `buildPageMetadata` — per-page `<title>`, `<meta>`, OG, Twitter, canonical

```ts
// src/app/about/page.tsx
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About Leumos",
  description: "What we believe and who we're building for.",
  path: "/about",
});
```

Pass `ogImage` to override the default OG image, `noIndex: true` to keep a page out of search, and `keywords` if you really need them (rarely).

### Site-wide JSON-LD

`Organization` and `WebSite` (with a `SearchAction` stub) are mounted once in `src/app/layout.tsx`. Don't repeat them on individual pages — search engines de-duplicate by `@id`, but cleaner is better.

### Page-level JSON-LD

For per-page structured data, import the helpers from `src/lib/structured-data.tsx`:

```tsx
import { JsonLd, articleLd, faqPageLd, breadcrumbListLd } from "@/lib/structured-data";

<JsonLd
  data={[
    articleLd({ /* post metadata */ }),
    breadcrumbListLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "Match Shot Color", path: "/blog/match-shot-color" },
    ]),
  ]}
/>;
```

Blog posts use `articleLd` automatically (see below). For non-blog pages, keep adding helpers in `src/lib/structured-data.tsx` rather than inlining JSON-LD.

### Sitemap and robots

- New static routes get listed in `staticRoutes` in `src/lib/site.ts`. `src/app/sitemap.ts` consumes that list and **automatically appends every published blog post**, so adding an MDX file is enough — no sitemap edits needed.
- `src/app/robots.ts` allows crawling everywhere except on Vercel preview deploys (where it serves `Disallow: /` so previews don't get indexed). Both reference `${SITE_URL}/sitemap.xml`.

### OG images

`src/app/opengraph-image.tsx` is a `next/og` edge-rendered default that uses the brand gradient + `siteConfig` text. `twitter-image.tsx` re-exports it so the Twitter `summary_large_image` card matches. Per-post OG images live in `src/app/blog/[slug]/opengraph-image.tsx` and use the same `renderOgCard` helper with the post's title overlaid.

### Semantic HTML

The root layout renders `<header>`, `<main>` (via the page's own element), and `<footer>` landmarks, plus a "Skip to content" link that targets `#main-content`. Every `<main>` should keep `id="main-content"` and exactly one `<h1>` per page.

## Waitlist (LEU-4)

### ESP choice — Resend

We picked **Resend** over Loops for two reasons:

1. **One vendor, two needs.** Resend handles transactional confirmation email *and*
   audience list management. We don't need a sequence engine yet (no drip
   campaign), so paying for both Resend and Loops would be premature.
2. **Cleaner DX.** Resend's audience contact API is straightforward; if we later
   need real sequences we can layer Loops on top without rewriting the capture
   path.

The confirmation send is fire-and-forget — a Resend hiccup never fails a
sign-up. Failures log to the server with the email (so we can retry manually).

### Storage — Vercel KV (Upstash Redis)

Sign-ups are persisted to Redis keyed by lowercased email. We chose KV over
Postgres because the referral mechanic needs atomic counter increments and fast
key→position lookups, both of which Redis nails. The Resend audience is
synced after the local write so the ESP list stays current.

A pure in-memory fallback is used when `KV_REST_API_URL` / `KV_REST_API_TOKEN`
are not set, so dev and CI don't need KV credentials. **Production must
provide them** — the in-memory store does not survive a serverless cold start.

### Referral mechanic

Each sign-up gets a 6-character referral code (e.g. `LU-AB23CD`) and starts at
queue position `signupOrder`. Every confirmed sign-up that lands with someone
else's `?ref=LU-XXXXXX` increments that referrer's counter and lifts their
displayed queue position by **10 spots per conversion** (tunable in
`src/lib/waitlist/storage.ts`). The `?ref=` param is captured client-side and
persists in `localStorage` for 30 days so the credit survives a page refresh.

UTM params (`utm_source/medium/campaign/content/term`), referrer, and landing
path are captured at first touch and attached to the sign-up server-side.

### Anti-spam

- Honeypot field (`website`) — submissions with a non-empty value get a fake
  success response so bots can't tell.
- Per-IP rate limit (6 sign-ups per hour) via the same KV/Redis store.
- Server-side Zod validation of every field; client-side validation is
  best-effort only.

### Analytics events

Names live in `src/lib/analytics/events.ts` and are stubbed today (console-log
in dev, no-op in prod). LEU-5 wires them to Plausible.

| Event                       | Fired from        |
| --------------------------- | ----------------- |
| `waitlist_form_view`        | form mount        |
| `waitlist_form_submit`      | submit click      |
| `waitlist_signup_success`   | API 2xx response  |
| `waitlist_signup_error`     | API error         |
| `waitlist_referral_share`   | success Share btn |
| `waitlist_referral_copy`    | success Copy btn  |

## Blog (LEU-14)

The blog is the publishing surface for our cornerstone SEO content. Posts are MDX files in version control — no headless CMS yet.

### Drop a new post (ContentGrowth flow)

1. Create `content/blog/<slug>.mdx`. The filename slug must match the `slug` in the frontmatter.
2. Fill in frontmatter (see schema below). At minimum: `title`, `slug`, `description`, `publishedAt`, `heroImage`.
3. Drop the hero image into `public/blog/` and reference it as `/blog/your-image.jpg` (use a real width/height — `next/image` enforces both, and CLS is a Lighthouse killer).
4. Preview locally:

   ```bash
   npm run dev
   # /blog/<slug>
   ```

5. Open a PR. Vercel builds a preview at `https://<branch>.<project>.vercel.app/blog/<slug>` automatically. Lighthouse CI runs against `/blog` on every PR.
6. Merge to `main` to publish. The sitemap, RSS-style listing, and per-post OG image regenerate on the next build — no extra steps.

### Frontmatter schema

```yaml
---
title: "Match Shot Color Across Cameras (3-Frame Method)"
slug: "match-shot-color"
description: "A practical 3-frame method for matching shot color across cameras…"  # 140-160 chars; used as <meta name="description">
publishedAt: "2026-04-29"            # ISO date — drives sitemap + Article schema
updatedAt: "2026-04-30"              # optional
heroImage: "/blog/match-shot-color/hero.jpg"  # public-relative path
heroImageAlt: "Three side-by-side frames…"    # required for a11y
relatedSlugs: ["color-grading-101", "log-vs-rec709"]   # array, manual for v1
keywords: ["color matching", "DaVinci Resolve", "filmmaking"]  # used for <meta name="keywords">
ctaVariant: "default"                # selects in-post CTA copy from PostCtaSection
draft: false                         # set true to keep out of /blog and sitemap
---
```

### MDX features

- Code blocks with language tags (`` ```ts ``)
- Image embeds with required alt text
- Blockquotes, tables, ordered/unordered lists
- Internal links to other posts: `[See the color grading primer](/blog/color-grading-101)`
- All h2/h3 headings get auto-generated slug ids (rehype-slug) and "click to copy" anchor links (rehype-autolink-headings) so the table of contents links work.

### What's automatic

- `<title>`, `<meta description>`, canonical, OG, and Twitter tags via `buildPageMetadata`.
- `Article` JSON-LD via `articleLd` from `src/lib/structured-data.tsx`.
- Per-post OG image at `/blog/<slug>/opengraph-image` (title overlaid on the brand gradient).
- Sitemap entry — built from the same loader as the route.
- Reading time (≈225 wpm), table of contents, and related posts list.

### Out of scope for v1

- Comments, reactions, share buttons.
- Author taxonomy / per-author pages (single byline: "Leumos team").
- Tag/category taxonomy pages (we have ~8 cornerstones, not 800 — flat list is fine).
- In-blog search.

## Deployment

- **Production:** auto-deploys on push to `main`.
- **Preview:** every PR gets a unique preview URL.
- **Domain:** TBD — pending CEO sign-off on `leumos.ai` purchase + DNS.

The Vercel project must have `NEXT_PUBLIC_SITE_URL` set to the production origin in the Production environment. Preview environments can leave it unset (Next will fall back to `VERCEL_URL`).

## Conventions

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for commit-message and PR conventions.

## Live URLs

- **Production**: https://leumos-site.vercel.app
- Source: https://github.com/pravit12/leumos-site

_(auto-preview link verified by PR #2)_
