import type { Metadata } from "next";
import { siteConfig, getSiteUrl } from "@/lib/site";
import {
  ActI,
  ActII,
  ActIV,
  ActV,
  FoundingCounter,
  Footer,
  Hero,
  Nav,
  WaitlistStickyCTA,
} from "@/components/site";

type SearchParams = Record<string, string | string[] | undefined>;

function pickSimulateRemaining(params: SearchParams): number | undefined {
  // Dev/preview-only affordance for QA. The API route enforces the
  // production-disabled check; here we just parse and forward.
  const raw = params.simulateRemaining;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return undefined;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0 || n > 1000) return undefined;
  return n;
}

type Stat = {
  numeral: string;
  label: string;
  context: string;
  ariaLabel: string;
  primary?: boolean;
};
type StatTriple = [Stat, Stat, Stat];

// Placeholder copy is owned by LEU-12 (Hero copy v1) — these strings track the
// home.html visual proof shipped with the spec until ContentGrowth lands real copy.
const copy = {
  hero: {
    eyebrow: "Leumos AI",
    headline: { lead: "Color grade like a colorist.", pivot: "Without being one." },
    lede: "Upload your footage. We detect the cuts, match the look, balance the shots. You finish the frame.",
    ctaLabel: "Get on the waitlist",
    microcopy: "One email when it's ready. Nothing else.",
    trust: "First 1,000 sign-ups get the founding-member tier. No card. No spam.",
  },
  actI: {
    eyebrow: "Act I — The world today",
    headline: "It's late. The footage is stacked. The grade is still ahead of you.",
    lede:
      "Most edits ship un-graded or barely-graded — not because nobody cares, but because the tools that get you to a real grade demand hours per minute and a parallel career in color science. So you push the cut and live with footage that looks like footage.",
    caption: "Footage straight off the SD card.",
    frameTag: "REC.709 · log · 24fps",
    figureAlt: "Un-graded reference frame, straight from the SD card",
  },
  actII: {
    eyebrow: "Act II — The shift",
    headline: "A model can read a frame now. That changes who gets to grade.",
    lede:
      "Detecting cuts, recognizing skin and sky, matching exposure across shots — these used to be manual chores or proprietary plug-ins. They aren't anymore. The craft survives. The tax on getting there doesn't.",
    figureAlt: "One frame, partly graded — a single accent corrected",
    figureCaption: "One element graded; the rest still log.",
    rows: [
      {
        headline: "Scene cuts, automatic.",
        body: "Drop a clip in. The shots split themselves. You correct what's wrong — you don't slice it.",
      },
      {
        headline: "Reference, then match.",
        body: "Hand it a still you like. It applies that look across every shot, then balances them against each other.",
      },
      {
        headline: "Manual overrides, on every value.",
        body: "Exposure, contrast, white balance, saturation. The AI starts the grade. You finish it.",
      },
    ],
    ctaEyebrow: "Get on the waitlist",
    ctaHeading: "If this resonates, get on the list.",
    ctaBody:
      "One email when it's ready. Founding-member tier for the first 1,000.",
    ctaButton: "Get on the waitlist",
  },
  actIV: {
    eyebrow: "Act IV — The transformation",
    headline:
      "Upload. Match. Export. The cut you wanted, in the time you have.",
    lede:
      "No tutorial. No primaries panel. The model handles the chores; you keep the decisions. Match a hero shot across twelve takes, balance the wedding ceremony to the reception, send the YouTube cut to the encoder before the kettle boils.",
    shots: [
      { alt: "Shot 01 — graded reference", caption: "shot 01 · graded", gradeBleed: true },
      { alt: "Shot 02 — matched", caption: "shot 02 · matched" },
      { alt: "Shot 03 — matched", caption: "shot 03 · matched" },
      { alt: "Shot 04 — matched", caption: "shot 04 · matched" },
      { alt: "Shot 05 — matched", caption: "shot 05 · matched" },
    ],
    stats: [
      {
        numeral: "12",
        label: "Shots matched",
        context: "on exposure + contrast, in a single pass",
        ariaLabel: "12 shots matched on exposure and contrast in a single pass",
        primary: true,
      },
      {
        numeral: "8s",
        label: "Wall-clock",
        context: "average across 1080p footage on the Creator tier",
        ariaLabel: "8 seconds, average wall-clock for a 12-shot match on the Creator tier",
      },
      {
        numeral: "3",
        label: "Clicks",
        context: "upload, pick a look, export",
        ariaLabel: "Three clicks: upload, pick a look, export",
      },
    ] as StatTriple,
    ctaButton: "Get on the waitlist",
    quoteBody:
      "It's the part of the edit I dreaded — turning footage into a film. Leumos doesn't make it disappear. It makes it the fun part again.",
    quoteAttribution: "— The Leumos team · Pre-launch",
  },
  actV: {
    eyebrow: "Act V — The invitation",
    headline: "First 1,000 in. Founding-member tier, free for life.",
    lede:
      "When we open the doors, the first 1,000 sign-ups keep the Creator tier free, forever. After that we'll be billing — and you'll have already been grading.",
    ctaButton: "Get on the waitlist",
    microcopy: "Honest. One email when it's ready.",
    trust:
      "Joining: indie editors, wedding studios, social-agency colorists. No bots, no resellers.",
  },
};

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const siteUrl = getSiteUrl();
  const params = (await searchParams) ?? {};
  const simulateRemaining = pickSimulateRemaining(params);

  const heroCounter = (
    <div className="hero__counter-row">
      <FoundingCounter variant="inline" simulateRemaining={simulateRemaining} />
      <span className="hero__counter-row__sep" aria-hidden="true">
        ·
      </span>
      <p className="hero__counter-row__abundant">free to join the waitlist</p>
    </div>
  );

  const actVCounter = (
    <FoundingCounter
      variant="pill"
      simulateRemaining={simulateRemaining}
      quiet
    />
  );

  const stickyCounter = (
    <FoundingCounter
      variant="compact"
      simulateRemaining={simulateRemaining}
      quiet
    />
  );

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteUrl,
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <ActI {...copy.actI} />
        <ActII {...copy.actII} />
        <Hero
          eyebrow={copy.hero.eyebrow}
          headline={copy.hero.headline}
          lede={copy.hero.lede}
          ctaLabel={copy.hero.ctaLabel}
          microcopy={copy.hero.microcopy}
          trust={copy.hero.trust}
          secondaryRow={heroCounter}
        />
        <ActIV {...copy.actIV} />
        <ActV {...copy.actV} counterSlot={actVCounter} />
      </main>
      <Footer />
      <WaitlistStickyCTA leading={stickyCounter} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
    </>
  );
}
