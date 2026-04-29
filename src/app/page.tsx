import type { Metadata } from "next";
import { siteConfig, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Coming soon`,
  description: siteConfig.description,
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
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-narrow flex-col justify-center px-6 py-24">
      <p className="mb-6 text-sm uppercase tracking-[0.2em] text-ink-400">
        Pre-launch
      </p>
      <h1 className="text-5xl font-semibold text-ink-900 md:text-6xl">
        {siteConfig.name}
      </h1>
      <p className="mt-6 max-w-prose text-lg text-ink-500">
        Something is being built here. Story, brand, and the full site are landing
        soon. Sign-up will live here when it&apos;s ready.
      </p>
      <p className="mt-10 text-sm text-ink-400">
        — Leumos AI
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
    </main>
  );
}
