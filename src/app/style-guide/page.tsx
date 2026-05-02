import type { Metadata } from "next";
import {
  Button,
  CTACard,
  EmailField,
  ScrollReveal,
  StickyMobileCTA,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Style guide",
  description:
    "Internal token + component reference for the Leumos brand system v1.",
  robots: { index: false, follow: false, nocache: true },
};

const lumeStops = [
  { name: "lume-blue", hex: "#1F4DFF" },
  { name: "lume-violet", hex: "#6B2BD9" },
  { name: "lume-magenta", hex: "#D6238C" },
  { name: "lume-orange", hex: "#FF7A1A" },
];

const stageRamp = [
  { name: "stage-50", hex: "#F5F6F8" },
  { name: "stage-100", hex: "#E8EBF0" },
  { name: "stage-200", hex: "#C9CFD9" },
  { name: "stage-300", hex: "#97A0AF" },
  { name: "stage-400", hex: "#5F6878" },
  { name: "stage-500", hex: "#3A4150" },
  { name: "stage-600", hex: "#252B38" },
  { name: "stage-700", hex: "#161B26" },
  { name: "stage-800", hex: "#0D1119" },
  { name: "stage-900", hex: "#07090F" },
];

const signalRamp = [
  { name: "signal-50", hex: "#FFF1E6" },
  { name: "signal-100", hex: "#FFD9B8" },
  { name: "signal-300", hex: "#FFA866" },
  { name: "signal-500", hex: "#FF7A1A" },
  { name: "signal-600", hex: "#DB5F0A" },
  { name: "signal-700", hex: "#A1410A" },
  { name: "signal-900", hex: "#5C2407" },
];

const cineRamp = [
  { name: "cine-100", hex: "#C8F0F7" },
  { name: "cine-300", hex: "#5FCDE0" },
  { name: "cine-500", hex: "#1AA3BD" },
  { name: "cine-700", hex: "#0E5F73" },
];

const hotRamp = [
  { name: "hot-300", hex: "#F06DBA" },
  { name: "hot-500", hex: "#D6238C" },
  { name: "hot-700", hex: "#861C5C" },
];

const semanticAliases = [
  { name: "--bg", value: "stage-800" },
  { name: "--surface", value: "stage-700" },
  { name: "--surface-2", value: "stage-600" },
  { name: "--text", value: "stage-50" },
  { name: "--text-muted", value: "stage-300" },
  { name: "--text-subtle", value: "stage-400" },
  { name: "--border", value: "rgba(255,255,255,0.08)" },
  { name: "--border-strong", value: "rgba(255,255,255,0.16)" },
  { name: "--link", value: "cine-300" },
  { name: "--link-hover", value: "cine-100" },
  { name: "--focus-ring", value: "signal-300" },
  { name: "--cta-fill", value: "signal-500" },
  { name: "--cta-text", value: "stage-900" },
];

const spacing = [
  { name: "s-1", value: "4px" },
  { name: "s-2", value: "8px" },
  { name: "s-3", value: "12px" },
  { name: "s-4", value: "16px" },
  { name: "s-5", value: "20px" },
  { name: "s-6", value: "24px" },
  { name: "s-8", value: "32px" },
  { name: "s-10", value: "40px" },
  { name: "s-12", value: "48px" },
  { name: "s-16", value: "64px" },
  { name: "s-20", value: "80px" },
  { name: "s-24", value: "96px" },
  { name: "s-32", value: "128px" },
];

const radii = [
  { name: "r-xs", value: "4px" },
  { name: "r-sm", value: "6px" },
  { name: "r-md", value: "10px" },
  { name: "r-lg", value: "14px" },
  { name: "r-xl", value: "20px" },
  { name: "r-pill", value: "9999px" },
];

const shadows = [
  { name: "shadow-sm", className: "shadow-sm" },
  { name: "shadow-md", className: "shadow-md" },
  { name: "shadow-lg", className: "shadow-lg" },
  { name: "glow-warm", className: "shadow-glow-warm" },
  { name: "glow-cool", className: "shadow-glow-cool" },
];

const durations = [
  { name: "dur-fast", value: "120ms", className: "duration-fast" },
  { name: "dur-base", value: "200ms", className: "duration-base" },
  { name: "dur-slow", value: "360ms", className: "duration-slow" },
  { name: "dur-cinema", value: "720ms", className: "duration-cinema" },
];

export default function StyleGuidePage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-container px-6 py-24"
      style={{ paddingBottom: "10rem" }}
    >
      <header className="mb-16 max-w-prose">
        <p className="text-eyebrow mb-3">Brand system v1</p>
        <h1>Style guide</h1>
        <p className="text-lede mt-6">
          Internal reference for tokens and primitives. Every state every
          component must implement is documented here. UX uses this surface for
          review.
        </p>
      </header>

      <Section id="colors" title="1. Color tokens">
        <Subsection title="1.1 Brand spectrum">
          <Swatches items={lumeStops} foreground="white" />
        </Subsection>

        <Subsection title="Canonical brand gradient">
          <div
            className="h-24 w-full rounded-lg"
            role="img"
            aria-label="Brand gradient: lume-blue to lume-orange"
            style={{ background: "var(--brand-gradient)" }}
          />
        </Subsection>

        <Subsection title="1.2 Stage neutrals">
          <Swatches items={stageRamp} />
        </Subsection>

        <Subsection title="1.3 Signal — primary action">
          <Swatches items={signalRamp} />
        </Subsection>

        <Subsection title="1.4 Cine — link / accent teal">
          <Swatches items={cineRamp} />
        </Subsection>

        <Subsection title="1.5 Hot — magenta accent">
          <Swatches items={hotRamp} />
        </Subsection>

        <Subsection title="1.6 Semantic aliases">
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {semanticAliases.map((alias) => (
              <li
                key={alias.name}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-stage-700 px-4 py-3"
              >
                <code className="font-mono text-sm text-stage-50">
                  {alias.name}
                </code>
                <code className="font-mono text-sm text-stage-300">
                  {alias.value}
                </code>
              </li>
            ))}
          </ul>
        </Subsection>
      </Section>

      <Section id="typography" title="2. Typography">
        <div className="space-y-8">
          <div>
            <Caption>display · Fraunces 600</Caption>
            <p className="text-display">Color graded like a colorist.</p>
          </div>
          <div>
            <Caption>display + pivot italic</Caption>
            <p className="text-display">
              Color graded{" "}
              <span className="text-pivot">like a colorist</span>.
            </p>
          </div>
          <div>
            <Caption>h1 · Fraunces 600</Caption>
            <h1>Cinematic color, AI-assisted.</h1>
          </div>
          <div>
            <Caption>h2 · Fraunces 600</Caption>
            <h2>Match 12 shots in 8 seconds.</h2>
          </div>
          <div>
            <Caption>h3 · Fraunces 600</Caption>
            <h3>The graded shot is a single decision, not wallpaper.</h3>
          </div>
          <div>
            <Caption>h4 · Geist 600</Caption>
            <h4>Built for editors, by editors.</h4>
          </div>
          <div>
            <Caption>lede · Geist 400</Caption>
            <p className="text-lede max-w-lede">
              Two metaphors run through every token: the darkened theater and
              the graded shot. Color appears in deliberate moments — never as
              wallpaper.
            </p>
          </div>
          <div>
            <Caption>body · Geist 400 · 17px</Caption>
            <p className="max-w-prose">
              We respect the craft and we respect the reader&apos;s time. We
              show, we don&apos;t tell. We never sell the AI; we sell the
              result. We assume the reader can read.
            </p>
          </div>
          <div>
            <Caption>small · Geist 500 · 14px</Caption>
            <p className="text-small">
              One email when it&apos;s ready. Nothing else.
            </p>
          </div>
          <div>
            <Caption>eyebrow · Geist 600 · 12px / 0.18em tracking</Caption>
            <p className="text-eyebrow">Pre-launch · Spring 2026</p>
          </div>
          <div>
            <Caption>mono · Geist Mono 400 · 14px</Caption>
            <p className="font-mono text-sm text-stage-200">
              fine_tune --shot 12 --lut neg-print
            </p>
          </div>
        </div>
      </Section>

      <Section id="spacing" title="3. Spacing">
        <ul className="space-y-2">
          {spacing.map((token) => (
            <li
              key={token.name}
              className="flex items-center gap-4"
            >
              <code className="w-20 shrink-0 font-mono text-sm text-stage-300">
                {token.name}
              </code>
              <code className="w-16 shrink-0 font-mono text-sm text-stage-300">
                {token.value}
              </code>
              <span
                aria-hidden="true"
                className="block h-3 rounded-xs bg-signal-500"
                style={{ width: token.value }}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="radii" title="4. Radii">
        <div className="flex flex-wrap gap-6">
          {radii.map((radius) => (
            <div
              key={radius.name}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="h-20 w-20 border border-[var(--border-strong)] bg-stage-700"
                style={{ borderRadius: radius.value }}
                aria-hidden="true"
              />
              <code className="font-mono text-sm text-stage-300">
                {radius.name}
              </code>
              <code className="font-mono text-xs text-stage-300">
                {radius.value}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section id="shadows" title="5. Shadows & glows">
        <div className="flex flex-wrap gap-10">
          {shadows.map((shadow) => (
            <div key={shadow.name} className="flex flex-col items-center gap-3">
              <div
                className={`h-24 w-24 rounded-md bg-stage-700 ${shadow.className}`}
                aria-hidden="true"
              />
              <code className="font-mono text-sm text-stage-300">
                {shadow.name}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section id="motion" title="6. Motion">
        <p className="text-stage-300 mb-6 max-w-prose">
          Hover any swatch to see the duration. Reduced-motion honors §6.3 —
          all transitions over 200ms collapse to opacity-only at 80ms.
        </p>
        <div className="flex flex-wrap gap-6">
          {durations.map((token) => (
            <div
              key={token.name}
              className={`group h-20 w-40 cursor-default rounded-md border border-[var(--border-strong)] bg-stage-700 p-4 transition-colors ease-standard ${token.className} hover:bg-signal-500 hover:text-stage-900`}
            >
              <code className="block font-mono text-sm">{token.name}</code>
              <code className="block font-mono text-xs text-stage-300 group-hover:text-stage-700">
                {token.value}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="8.1 / 8.5 Button">
        <Subsection title="Variants">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Get on the waitlist</Button>
            <Button variant="ghost">Learn more</Button>
            <Button variant="outline">See it run</Button>
          </div>
        </Subsection>

        <Subsection title="Pill (hero inline)">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" pill>
              Get on the waitlist
            </Button>
            <Button variant="outline" pill>
              See it run
            </Button>
          </div>
        </Subsection>

        <Subsection title="States — primary">
          <div className="flex flex-wrap items-end gap-6">
            <StateBlock label="default">
              <Button variant="primary">Default</Button>
            </StateBlock>
            <StateBlock label="loading">
              <Button variant="primary" loading loadingLabel="Joining…">
                Joining
              </Button>
            </StateBlock>
            <StateBlock label="disabled">
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </StateBlock>
          </div>
          <p className="text-small mt-3">
            Hover and focus states are visible by interacting with the buttons
            above; focus shows the {`signal-300`} ring.
          </p>
        </Subsection>

        <Subsection title="States — ghost">
          <div className="flex flex-wrap items-end gap-6">
            <StateBlock label="default">
              <Button variant="ghost">Default</Button>
            </StateBlock>
            <StateBlock label="disabled">
              <Button variant="ghost" disabled>
                Disabled
              </Button>
            </StateBlock>
            <StateBlock label="loading">
              <Button variant="ghost" loading>
                Loading
              </Button>
            </StateBlock>
          </div>
        </Subsection>

        <Subsection title="States — outline">
          <div className="flex flex-wrap items-end gap-6">
            <StateBlock label="default">
              <Button variant="outline">Default</Button>
            </StateBlock>
            <StateBlock label="disabled">
              <Button variant="outline" disabled>
                Disabled
              </Button>
            </StateBlock>
            <StateBlock label="loading">
              <Button variant="outline" loading>
                Loading
              </Button>
            </StateBlock>
          </div>
        </Subsection>
      </Section>

      <Section id="email-field" title="8.5 EmailField">
        <Subsection title="Default — block layout">
          <form aria-label="EmailField default demo">
            <EmailField
              id="email-default"
              label="Email address"
              required
              placeholder="you@studio.com"
              helpText="One email when it’s ready. Nothing else."
            />
          </form>
        </Subsection>

        <Subsection title="Inline pill — hero layout">
          <form
            aria-label="EmailField inline demo"
            className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <EmailField
              id="email-inline"
              label="Email address"
              layout="inline"
              pill
              placeholder="you@studio.com"
              className="sm:flex-1"
            />
            <Button variant="primary" pill type="submit">
              Get on the waitlist <span aria-hidden="true">→</span>
            </Button>
          </form>
        </Subsection>

        <Subsection title="Error">
          <form aria-label="EmailField error demo">
            <EmailField
              id="email-error"
              label="Email address"
              required
              defaultValue="not-an-email"
              errorText="We need an email to add you to the list."
            />
          </form>
        </Subsection>

        <Subsection title="Disabled (mid-submit)">
          <form aria-label="EmailField disabled demo" aria-busy="true">
            <EmailField
              id="email-disabled"
              label="Email address"
              defaultValue="you@studio.com"
              disabled
              helpText="Joining…"
            />
          </form>
        </Subsection>
      </Section>

      <Section id="cta-card" title="8.3 CTACard">
        <CTACard
          eyebrow="Waitlist"
          heading="Stop pulling LUTs by hand."
          body="One email when Leumos is ready. We send no marketing — just the launch note and a personal invite."
        >
          <form
            aria-label="Waitlist sign-up"
            className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <EmailField
              id="email-cta"
              label="Email address"
              layout="inline"
              pill
              placeholder="you@studio.com"
              className="sm:flex-1"
            />
            <Button variant="primary" pill type="submit">
              Get on the waitlist <span aria-hidden="true">→</span>
            </Button>
          </form>
        </CTACard>
      </Section>

      <Section
        id="sticky-cta"
        title="8.4 StickyMobileCTA — non-fixed preview"
      >
        <p className="text-stage-300 mb-4 max-w-prose">
          Below is the sticky bar rendered in-flow so it can be reviewed at
          desktop. The live component fixes to{" "}
          <code className="font-mono text-sm text-stage-200">bottom-0</code>{" "}
          and is only visible on viewports ≤900px. A live instance is mounted
          at the bottom of this page; resize to ≤900px to see it.
        </p>
        <div
          className="relative overflow-hidden rounded-lg border border-[var(--border-strong)]"
          style={{ height: "5rem" }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-x-0 bottom-0 border-t border-[var(--border-strong)] px-4 py-3"
              style={{
                backgroundColor: "rgba(13,17,25,0.85)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div className="mx-auto flex max-w-container items-center justify-between gap-4">
                <p className="text-xs leading-tight text-stage-300">
                  One email when it&apos;s ready.
                </p>
                <span className="inline-flex h-11 items-center justify-center rounded-pill bg-signal-500 px-5 text-sm font-medium text-stage-900">
                  Get on the waitlist
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="scroll-reveal" title="8.2 ScrollReveal">
        <p className="text-stage-300 mb-6 max-w-prose">
          Scroll within this page to trigger reveals. Reduced motion collapses
          the translate and shortens the duration.
        </p>
        <div className="space-y-12">
          <ScrollReveal mode="up">
            <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-8">
              <h3>mode=&quot;up&quot;</h3>
              <p className="text-stage-200 mt-3">
                Translates 16px on mobile, 24px on desktop, fading in over
                720ms with the cinematic ease.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="fade">
            <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-8">
              <h3>mode=&quot;fade&quot;</h3>
              <p className="text-stage-200 mt-3">
                Opacity-only, no translate.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="stagger">
            <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-8 space-y-3">
              <h3>mode=&quot;stagger&quot;</h3>
              <p className="text-stage-200">
                First child reveals immediately…
              </p>
              <p className="text-stage-200">…then the second…</p>
              <p className="text-stage-200">…and a third, 80ms apart.</p>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      <Section id="scarcity-hierarchy" title="Scarcity hierarchy (fomo-spec §3 · LEU-45)">
        <p className="text-stage-300 mb-6 max-w-prose">
          Three semantic registers so visual urgency lands on capped concepts
          (founding price, 1,000-cap, founding badge) and stays off uncapped
          concepts (the free waitlist seat). No new tokens — every reference is
          to brand-system v1.
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-6">
            <h3 className="mb-3 text-base">tier-scarce</h3>
            <p className="text-stage-300 text-sm mb-4">
              Eyebrow caps · mono numeral · 1px×24px leading rule. Pair with
              the post-founding price for anchoring.
            </p>
            <p className="tier-scarce">
              <span className="tier-scarce__num">823</span>
              of 1,000 founding spots
            </p>
            <p className="tier-scarce tier-scarce--small mt-4">
              <span className="tier-scarce__num">1,000</span>
              founding spots
            </p>
            <p
              className="tier-scarce mt-4"
              data-state="critical"
            >
              <span className="tier-scarce__num">37</span>
              of 1,000 left
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-6">
            <h3 className="mb-3 text-base">tier-abundant</h3>
            <p className="text-stage-300 text-sm mb-4">
              Body type · sentence case · text-muted · no rule, no numeral, no
              eyebrow. Never adjacent to scarce without s-8 separation.
            </p>
            <p className="tier-abundant">free to join the waitlist</p>
            <p className="tier-abundant tier-abundant--small mt-4">
              free to join
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-6">
            <h3 className="mb-3 text-base">tier-anchor</h3>
            <p className="text-stage-300 text-sm mb-4">
              Loss-Aversion price comparison. Real <code>&lt;s&gt;</code> with
              <code> aria-label=&quot;regular price&quot;</code> — never CSS
              line-through on a span.
            </p>
            <p className="tier-anchor" aria-label="Founding price compared to regular price">
              <span className="tier-anchor__founding">
                $9
                <span className="tier-anchor__period">/mo</span>
              </span>
              <span className="tier-anchor__regular">
                <s aria-label="regular price">$14</s>
              </span>
            </p>
          </div>
        </div>

        <h3 className="mt-12 mb-4 text-base">Composition: scarcity-row (hero secondary line)</h3>
        <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-6">
          <div className="scarcity-row" role="group" aria-label="Founding tier and waitlist terms">
            <p className="tier-scarce">
              <span className="tier-scarce__num">823</span>
              of 1,000 founding spots
            </p>
            <span className="scarcity-row__sep" aria-hidden="true">·</span>
            <p className="tier-abundant tier-abundant--small">
              free to join the waitlist
            </p>
          </div>
          <p className="text-stage-300 text-sm mt-3">
            Desktop: inline, bullet between. Mobile (≤640px): stacks with s-8
            separation; bullet hides.
          </p>
        </div>

        <h3 className="mt-12 mb-4 text-base">Composition: scarcity-stack (Act V invitation)</h3>
        <div className="rounded-lg border border-[var(--border-strong)] bg-stage-700 p-6">
          <div className="scarcity-stack">
            <p className="tier-anchor" aria-label="Founding price compared to regular price">
              <span className="tier-anchor__founding">
                $9
                <span className="tier-anchor__period">founding · per month</span>
              </span>
              <span className="tier-anchor__regular">
                <s aria-label="regular price">$14</s>
              </span>
            </p>
            <p className="tier-abundant">
              Free to join the waitlist. No card, no resellers, no bots.
            </p>
          </div>
        </div>

        <h3 className="mt-12 mb-4 text-base">Anti-cliché checklist (block in PR review)</h3>
        <ul className="text-stage-300 text-sm space-y-1 list-disc pl-6">
          <li>No &quot;Limited time only&quot; anywhere.</li>
          <li>No &quot;Don&apos;t miss out&quot; anywhere.</li>
          <li>No exclamation point on any scarce-tier element.</li>
          <li>
            Strikethrough is the <code>&lt;s&gt;</code> element only, in
            <code> --text-muted</code>. Never red.
          </li>
        </ul>
      </Section>

      <StickyMobileCTA
        microcopy="One email when it’s ready. Nothing else."
        action={
          <Button variant="primary" pill size="md">
            Get on the waitlist
          </Button>
        }
      />
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-[var(--border)] py-16"
    >
      <h2 id={`${id}-heading`} className="mb-10">
        {title}
      </h2>
      <div className="space-y-12">{children}</div>
    </section>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-stage-200">{title}</h3>
      {children}
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-eyebrow mb-2 text-stage-300">{children}</p>
  );
}

function StateBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs uppercase tracking-wider text-stage-300">
        {label}
      </span>
      {children}
    </div>
  );
}

function Swatches({
  items,
  foreground,
}: {
  items: { name: string; hex: string }[];
  foreground?: "white" | "dark";
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {items.map((item) => (
        <li
          key={item.name}
          className="overflow-hidden rounded-md border border-[var(--border)]"
        >
          <div
            className="h-20 w-full"
            style={{ backgroundColor: item.hex }}
            aria-hidden="true"
          />
          <div className="bg-stage-700 p-3">
            <code
              className={`block font-mono text-xs ${
                foreground === "white" ? "text-stage-50" : "text-stage-200"
              }`}
            >
              {item.name}
            </code>
            <code className="block font-mono text-xs text-stage-300">
              {item.hex}
            </code>
          </div>
        </li>
      ))}
    </ul>
  );
}
