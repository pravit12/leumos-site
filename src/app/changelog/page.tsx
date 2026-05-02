import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, getSiteUrl } from "@/lib/site";
import {
  changelogEntryHref,
  getAllChangelogEntries,
} from "@/lib/changelog/content";

const PAGE_TITLE = "Changelog";
const PAGE_DESCRIPTION = `Release notes and product updates from ${siteConfig.name}.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/changelog",
    types: { "application/atom+xml": "/changelog.xml" },
  },
  openGraph: {
    type: "website",
    url: "/changelog",
    title: `${PAGE_TITLE} · ${siteConfig.name}`,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${PAGE_TITLE} · ${siteConfig.name}`,
    description: PAGE_DESCRIPTION,
  },
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default function ChangelogIndexPage() {
  const entries = getAllChangelogEntries();
  const siteUrl = getSiteUrl();

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.name} Changelog`,
    url: `${siteUrl}/changelog`,
    description: PAGE_DESCRIPTION,
    blogPost: entries.map((entry) => ({
      "@type": "BlogPosting",
      headline: entry.frontmatter.title,
      datePublished: entry.frontmatter.date,
      url: `${siteUrl}${changelogEntryHref(entry.slug)}`,
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <header className="mb-12">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-ink-400">
          What&apos;s new
        </p>
        <h1 className="font-display text-4xl font-semibold text-ink-900 md:text-5xl">
          Changelog
        </h1>
        <p className="mt-4 max-w-prose text-lg text-ink-500">
          {PAGE_DESCRIPTION} Subscribe via{" "}
          <a
            className="underline decoration-ink-300 underline-offset-4 hover:text-ink-900"
            href="/changelog.xml"
          >
            Atom feed
          </a>
          .
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-ink-500">No entries yet.</p>
      ) : (
        <ol className="space-y-12">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <article>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                  <time
                    dateTime={entry.frontmatter.date}
                    className="text-ink-400"
                  >
                    {dateFmt.format(
                      new Date(`${entry.frontmatter.date}T00:00:00Z`),
                    )}
                  </time>
                  <span className="font-mono text-xs text-ink-400">
                    v{entry.frontmatter.version}
                  </span>
                  {entry.frontmatter.tags.length > 0 ? (
                    <span className="flex flex-wrap gap-2">
                      {entry.frontmatter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-ink-200 px-2 py-0.5 text-xs text-ink-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-ink-900">
                  <Link
                    href={changelogEntryHref(entry.slug)}
                    className="hover:underline"
                  >
                    {entry.frontmatter.title}
                  </Link>
                </h2>
                <p className="mt-2 max-w-prose text-ink-500">
                  {entry.frontmatter.summary}
                </p>
                <p className="mt-3">
                  <Link
                    href={changelogEntryHref(entry.slug)}
                    className="text-sm text-ink-700 underline decoration-ink-300 underline-offset-4 hover:text-ink-900"
                  >
                    Read entry →
                  </Link>
                </p>
              </article>
            </li>
          ))}
        </ol>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
    </main>
  );
}
