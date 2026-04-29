# Leumos AI — marketing site

Pre-launch marketing site for Leumos AI. Single goal: high-quality waitlist sign-ups, with strong technical SEO and Lighthouse 90+ across every page.

## Stack

- **Next.js 15 (App Router)** + TypeScript + React 19
- **Tailwind CSS** with a small token layer (color, spacing, type scale) in `tailwind.config.ts`
- **Vercel** for production + per-PR preview deploys
- **Lighthouse CI** on every PR (perf / SEO / a11y / best-practices each ≥ 90; LCP < 2.5s; CLS < 0.1; INP < 200ms)
- MDX for blog posts (added when blog ticket lands)

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
```

## Required environment variables

All values go in `.env.local` for local dev or in Vercel project settings for preview/prod. See `.env.example` for the full list.

| Var                                    | Where used      | Required | Notes                                                                        |
| -------------------------------------- | --------------- | -------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | metadata, sitemap, robots, canonical, OG | yes (prod) | e.g. `https://leumos.ai`. Falls back to `VERCEL_URL` then `http://localhost:3000`. |
| `RESEND_API_KEY`                       | sign-up form     | placeholder | Wired up in a separate ticket.                                              |
| `RESEND_AUDIENCE_ID`                   | sign-up form     | placeholder | Resend audience id for the waitlist.                                        |
| `LOOPS_API_KEY`                        | (alt ESP)        | placeholder | If we pick Loops over Resend.                                               |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`         | analytics        | placeholder | e.g. `leumos.ai`. Wired up in a separate ticket.                            |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`       | heatmaps         | placeholder | Microsoft Clarity project id.                                               |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | search console   | optional | Adds `<meta name="google-site-verification" />` to `<head>`.                |
| `VERCEL_URL` / `VERCEL_ENV`            | Vercel runtime   | auto     | Injected by Vercel — do not set manually.                                   |

Robots.txt **only allows indexing when `VERCEL_ENV === "production"`**. Preview deploys serve a `Disallow: /` to keep them out of search.

## Project structure

```
src/
  app/
    layout.tsx              # root layout, fonts, site-wide metadata, JSON-LD, header/footer
    page.tsx                # placeholder home page
    sitemap.ts              # /sitemap.xml — built from site.ts staticRoutes
    robots.ts               # /robots.txt
    opengraph-image.tsx     # default OG image (1200x630, edge-rendered via next/og)
    twitter-image.tsx       # Twitter card variant (re-exports OG)
    icon.svg                # favicon
    globals.css             # Tailwind base + minimal element resets
  components/
    site-header.tsx         # <header> + <nav aria-label="Primary">
    site-footer.tsx         # <footer> + <nav aria-label="Footer">
  lib/
    site.ts                 # siteConfig, getSiteUrl(), absoluteUrl(), staticRoutes
    seo.ts                  # buildPageMetadata({ title, description, path, ... })
    structured-data.tsx     # JSON-LD helpers + <JsonLd> component
.github/workflows/
  ci.yml                    # typecheck, lint, build, Lighthouse CI
lighthouserc.json           # Lighthouse CI budgets (perf/SEO/a11y/BP ≥ 90)
tailwind.config.ts          # token layer
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
import { JsonLd, faqPageLd, breadcrumbListLd } from "@/lib/structured-data";

<JsonLd
  data={[
    faqPageLd([
      { question: "What is Leumos?", answer: "..." },
    ]),
    breadcrumbListLd([
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" },
    ]),
  ]}
/>;
```

`faqPageLd` and `breadcrumbListLd` are the two reusable helpers we'll lean on most for the blog and resource pages. Add new helpers there rather than inlining JSON-LD.

### Sitemap and robots

- New routes get listed in `staticRoutes` in `src/lib/site.ts`. `src/app/sitemap.ts` consumes that list. When the blog lands, append the MDX-derived routes there too.
- `src/app/robots.ts` allows crawling everywhere except on Vercel preview deploys (where it serves `Disallow: /` so previews don't get indexed). Both reference `${SITE_URL}/sitemap.xml`.

### OG images

`src/app/opengraph-image.tsx` is a `next/og` edge-rendered default that uses the brand gradient + `siteConfig` text. `twitter-image.tsx` re-exports it so the Twitter `summary_large_image` card matches. To override per route, drop a sibling `opengraph-image.tsx` and `twitter-image.tsx` into that route's folder — Next.js picks the closest one.

### Semantic HTML

The root layout renders `<header>`, `<main>` (via the page's own element), and `<footer>` landmarks, plus a "Skip to content" link that targets `#main-content`. Every `<main>` should keep `id="main-content"` and exactly one `<h1>` per page.

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
