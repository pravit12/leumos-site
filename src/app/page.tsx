import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: `${siteConfig.name} — Coming soon`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-narrow flex-col justify-center px-6 py-24"
    >
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
      <p className="mt-10 text-sm text-ink-400">— Leumos AI</p>
    </main>
  );
}
