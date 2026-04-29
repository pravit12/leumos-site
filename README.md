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
    layout.tsx        # root layout, fonts, metadata, OG/Twitter
    page.tsx          # placeholder home page + JSON-LD
    sitemap.ts        # /sitemap.xml
    robots.ts         # /robots.txt
    icon.svg          # favicon
    globals.css       # Tailwind base + minimal element resets
  lib/
    site.ts           # site config + getSiteUrl()
.github/workflows/
  ci.yml              # typecheck, lint, build, Lighthouse CI
lighthouserc.json     # Lighthouse CI budgets (perf/SEO/a11y/BP ≥ 90)
tailwind.config.ts    # token layer
```

## Deployment

- **Production:** auto-deploys on push to `main`.
- **Preview:** every PR gets a unique preview URL.
- **Domain:** TBD — pending CEO sign-off on `leumos.ai` purchase + DNS.

The Vercel project must have `NEXT_PUBLIC_SITE_URL` set to the production origin in the Production environment. Preview environments can leave it unset (Next will fall back to `VERCEL_URL`).

## Conventions

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for commit-message and PR conventions.
