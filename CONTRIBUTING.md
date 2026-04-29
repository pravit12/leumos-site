# Contributing

Lightweight conventions while we are pre-launch and the team is small.

## Branches

- `main` is always shippable; production deploys from it.
- Feature branches: `feat/short-description`, `fix/short-description`, `chore/...`, `docs/...`, `seo/...`, `perf/...`.
- Keep branches short-lived (< 2 days). Long-running branches drift the perf budget.

## Commits

Conventional Commits, present-tense, lowercase subject.

```
type(scope): short summary

Optional body explaining the why, not the what.
```

Common types: `feat`, `fix`, `chore`, `docs`, `seo`, `perf`, `refactor`, `style`, `test`, `ci`.

Examples:

```
feat(home): add hero section with primary CTA
seo(meta): add canonical + OG image to /pricing
perf(images): preload hero LCP image
ci(lighthouse): tighten LCP budget to 2200ms
```

Co-author tag (paperclip-driven commits):

```
Co-Authored-By: Paperclip <noreply@paperclip.ing>
```

## Pull requests

- One reviewable change per PR. If the diff is over ~400 lines and not a scaffold, split it.
- PR title mirrors the commit subject convention.
- PR body must include:
  - **What** — bullets of what changed.
  - **Why** — link the Paperclip ticket (e.g. `LEU-12`), the goal it serves, or the bug.
  - **Screenshots / preview URL** — desktop (1440×900) and mobile (390×844) for any visible change.
  - **Lighthouse impact** — note if any score is expected to drop, and why it's still in budget.
- All CI checks must be green before merging:
  - typecheck (`tsc --noEmit`)
  - lint (`next lint`)
  - build (`next build`)
  - Lighthouse CI (perf / a11y / SEO / best-practices each ≥ 90; LCP < 2.5s; CLS < 0.1)
- Squash-merge by default; the squashed commit message should follow Conventional Commits.

## SEO checklist (before merging visible changes)

- Page has unique `title` and `description` via the `Metadata` API.
- `<h1>` is present and unique to the page.
- Canonical URL is correct.
- OG + Twitter tags resolve to a real image (or fall back to the default).
- Internal links are crawlable (no `nofollow` unless intentional).
- New routes are added to `sitemap.ts`.
- Structured data (JSON-LD) added when applicable (Article, FAQ, Product, etc.).

## Performance budget (hard rules)

- LCP < 2.5s on a 4G simulation.
- CLS < 0.1.
- INP < 200ms.
- No client component above the fold unless interactivity demands it.
- All images use `next/image` with explicit `width`/`height` and `priority` only on the LCP image.
- No unmeasured third-party scripts. Add via `next/script` with `strategy="lazyOnload"` unless they are essential.

## Secrets

Never commit secrets. `.env.example` is the only env file in version control. Real values live in Vercel project settings.
