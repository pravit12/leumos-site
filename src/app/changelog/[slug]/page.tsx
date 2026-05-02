import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { siteConfig, getSiteUrl } from "@/lib/site";
import {
  changelogEntryHref,
  getAllChangelogEntries,
  getChangelogEntryBySlug,
} from "@/lib/changelog/content";
import { changelogMdxComponents } from "@/components/changelog/MdxComponents";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllChangelogEntries().map((entry) => ({ slug: entry.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const entry = getChangelogEntryBySlug(slug);
  if (!entry) return {};
  const canonical = changelogEntryHref(entry.slug);
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: `${entry.frontmatter.title} · ${siteConfig.name} changelog`,
      description: entry.frontmatter.summary,
      publishedTime: entry.frontmatter.date,
      tags: entry.frontmatter.tags,
    },
    twitter: {
      card: "summary",
      title: `${entry.frontmatter.title} · ${siteConfig.name} changelog`,
      description: entry.frontmatter.summary,
    },
  };
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default async function ChangelogEntryPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const entry = getChangelogEntryBySlug(slug);
  if (!entry) notFound();

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${changelogEntryHref(entry.slug)}`;

  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    datePublished: entry.frontmatter.date,
    dateModified: entry.frontmatter.date,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: {
      "@type": "Blog",
      name: `${siteConfig.name} Changelog`,
      url: `${siteUrl}/changelog`,
    },
    keywords: entry.frontmatter.tags.length
      ? entry.frontmatter.tags.join(", ")
      : undefined,
    author: { "@type": "Organization", name: siteConfig.name, url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-6">
        <Link
          href="/changelog"
          className="text-sm text-ink-500 underline decoration-ink-300 underline-offset-4 hover:text-ink-900"
        >
          ← Changelog
        </Link>
      </p>
      <article>
        <header className="mb-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
            <time dateTime={entry.frontmatter.date} className="text-ink-400">
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
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900 md:text-4xl">
            {entry.frontmatter.title}
          </h1>
          <p className="mt-3 max-w-prose text-lg text-ink-500">
            {entry.frontmatter.summary}
          </p>
        </header>

        <div>
          <MDXRemote
            source={entry.content}
            components={changelogMdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
      />
    </main>
  );
}
