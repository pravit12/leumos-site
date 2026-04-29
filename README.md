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
    layout.tsx                # root layout, fonts, metadata, OG/Twitter
    page.tsx                  # home page: hero + waitlist + JSON-LD
    sitemap.ts                # /sitemap.xml
    robots.ts                 # /robots.txt
    icon.svg                  # favicon
    globals.css               # Tailwind base + minimal element resets
    api/
      waitlist/route.ts       # POST /api/waitlist (sign-up handler)
  components/
    WaitlistForm.tsx          # client form (email + optional fields, honeypot)
    WaitlistSuccess.tsx       # success state: queue position + share UI
    StickyMobileCTA.tsx       # bottom-anchored mobile CTA bar
  lib/
    site.ts                   # site config + getSiteUrl()
    analytics/events.ts       # event-name registry + track() stub
    waitlist/
      schema.ts               # Zod input schema + response types
      storage.ts              # KV-backed store + in-memory fallback
      referral-code.ts        # referral-code generator + validator
      email.ts                # Resend confirmation + audience sync
      utm.ts                  # client-side UTM/referrer/ref capture
.github/workflows/ci.yml      # typecheck, lint, build, Lighthouse CI
lighthouserc.json             # Lighthouse CI budgets (perf/SEO/a11y/BP ≥ 90)
tailwind.config.ts            # token layer
```

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
