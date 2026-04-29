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
      <p className="text-eyebrow mb-6">Pre-launch</p>
      <h1 className="text-display">{siteConfig.name}</h1>
      <p className="text-lede mt-6 max-w-lede">
        Cinematic color, AI-assisted. The full site lands soon — sign-up will
        live here when it&apos;s ready.
      </p>
      <p className="text-small mt-10">— Leumos AI</p>

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
