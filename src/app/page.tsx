import type { Metadata } from "next";
import { siteConfig, getSiteUrl } from "@/lib/site";
import { WaitlistForm } from "@/components/WaitlistForm";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Join the waitlist`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: `${siteConfig.name} — Join the waitlist`,
    description: siteConfig.description,
  },
};

export default function HomePage() {
  const siteUrl = getSiteUrl();

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
    potentialAction: {
      "@type": "SubscribeAction",
      target: `${siteUrl}/#waitlist-form`,
    },
  };

  return (
    <>
      <main
        id="main"
        className="mx-auto flex min-h-screen w-full max-w-narrow flex-col justify-center px-6 py-16 pb-32 sm:py-24 sm:pb-24"
      >
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-lumos-700">
          Pre-launch
        </p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl md:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mt-6 max-w-prose text-lg text-ink-500 sm:text-xl">
          We&apos;re building something worth your inbox space. Join the
          waitlist and we&apos;ll send one email when access opens — no drip
          sequence, no list-sharing.
        </p>

        <section
          aria-labelledby="waitlist-heading"
          className="mt-12 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2
            id="waitlist-heading"
            className="text-2xl font-semibold text-ink-900"
          >
            Join the waitlist
          </h2>
          <p className="mt-2 text-base text-ink-500">
            Drop your email. Optional details help us tailor the rollout.
          </p>
          <div className="mt-6">
            <WaitlistForm />
          </div>
        </section>

        <p className="mt-10 text-sm text-ink-400">— Leumos AI</p>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </main>
      <StickyMobileCTA />
    </>
  );
}
