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
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`         | analytics        | yes (prod) | e.g. `leumos.ai`. Loads Plausible script in production only.                |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`       | heatmaps         | yes (prod) | Microsoft Clarity project id. Loads in production only.                     |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | search console   | yes (prod, HTML method) | Adds `<meta name="google-site-verification" />` to `<head>`.   |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION`   | search console   | optional | Adds `<meta name="msvalidate.01" />`. Only needed if verifying Bing without "Import from GSC". |
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

## Live URLs

- **Production**: https://leumos-site.vercel.app
- Source: https://github.com/pravit12/leumos-site

_(auto-preview link verified by PR #2)_

## Measurement & SEO consoles

All four consoles below should be checked weekly during pre-launch. They only have data for the **production** origin — preview deploys are blocked from indexing and from analytics scripts.

| Console | URL | Purpose |
| ------- | --- | ------- |
| Plausible | https://plausible.io/leumos.ai | Pageviews, custom funnel events, top pages, referrers |
| Microsoft Clarity | https://clarity.microsoft.com | Heatmaps, session recordings, dead-click / rage-click insights |
| Google Search Console | https://search.google.com/search-console | Indexing status, sitemap submission, query performance |
| Bing Webmaster Tools | https://www.bing.com/webmasters | Bing index status (imported from GSC) |

> Update the Plausible URL above to the actual data domain once `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set in Vercel production.

### Custom analytics events

Tracked via Plausible custom events. Names are stable — changing a name resets the funnel. The canonical registry lives in [`src/lib/analytics/events.ts`](./src/lib/analytics/events.ts):

| Event | Where it fires | Notes |
| ----- | -------------- | ----- |
| `waitlist_form_view` | Sign-up form scrolled into view | Denominator for conversion rate |
| `waitlist_form_submit` | Sign-up form submit attempted | Fires before server response |
| `waitlist_signup_success` | Server returned 2xx for sign-up | Numerator for conversion rate |
| `waitlist_signup_error` | Server returned non-2xx for sign-up | Includes `reason` prop |
| `waitlist_referral_share` | Referral link shared via Twitter / LinkedIn / etc. | `channel` prop |
| `waitlist_referral_copy` | Referral link copied to clipboard | — |
| `blog_read` | Blog post scrolled to ≥75% (placeholder until blog ships) | — |

Fire events from any client component:

```ts
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";

track(ANALYTICS_EVENTS.WAITLIST_SIGNUP_SUCCESS, { plan: "waitlist" });
```

`track()` is a no-op in dev/preview, or before the Plausible script loads — so it's always safe to call. In dev it logs to the console for debugging.

### Verification methods (one-time setup)

Performed by an operator with console access; the env vars below are set in Vercel **Production** environment only.

1. **Google Search Console** — preferred path: DNS TXT record on the production domain (works across `https://`, `https://www.`, and subdomains). Fallback: HTML-meta method by setting `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and redeploying. After verification, submit `https://<production-origin>/sitemap.xml` from the **Sitemaps** page.
2. **Bing Webmaster Tools** — sign in, choose **Import from Google Search Console**, pick the verified property. No env var needed when imported. If standalone verification is required, set `NEXT_PUBLIC_BING_SITE_VERIFICATION` (msvalidate.01 token) and redeploy.
3. **Microsoft Clarity** — create a project at [clarity.microsoft.com](https://clarity.microsoft.com), copy the project id, set `NEXT_PUBLIC_CLARITY_PROJECT_ID` in Vercel Production, redeploy. Heatmaps and session recordings are on by default in Clarity; nothing else to enable.
4. **Plausible** — add the production hostname as a site at [plausible.io](https://plausible.io), set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to that exact hostname in Vercel Production, redeploy. Verify pageviews appear by loading the production homepage and checking Plausible's realtime view.

### Privacy & cookie banners

Plausible and Microsoft Clarity are configured to be cookieless / privacy-respecting:

- Plausible does not use cookies and does not collect personal data — no cookie banner is required for EU/UK visitors per Plausible's own legal docs.
- Microsoft Clarity sets first-party cookies for session stitching; per Clarity's docs they are not classified as analytics cookies, but if Leumos AI later targets EU users with paid traffic we should re-evaluate adding a banner. For pre-launch organic traffic we ship without one.

Re-evaluate this stance when paid acquisition starts or when we add a third-party tag that uses cross-site cookies.
