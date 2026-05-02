import { siteConfig, getSiteUrl } from "@/lib/site";
import {
  changelogEntryHref,
  getAllChangelogEntries,
} from "@/lib/changelog/content";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDateForEntryDate(date: string): string {
  return `${date}T00:00:00Z`;
}

export function GET(): Response {
  const siteUrl = getSiteUrl();
  const entries = getAllChangelogEntries();
  const feedUrl = `${siteUrl}/changelog.xml`;
  const indexUrl = `${siteUrl}/changelog`;
  const updated = entries.length
    ? isoDateForEntryDate(entries[0].frontmatter.date)
    : new Date().toISOString();

  const entryXml = entries
    .map((entry) => {
      const url = `${siteUrl}${changelogEntryHref(entry.slug)}`;
      const published = isoDateForEntryDate(entry.frontmatter.date);
      const categories = entry.frontmatter.tags
        .map((tag) => `    <category term="${escapeXml(tag)}"/>`)
        .join("\n");
      return [
        "  <entry>",
        `    <id>${escapeXml(url)}</id>`,
        `    <title>${escapeXml(entry.frontmatter.title)}</title>`,
        `    <link rel="alternate" type="text/html" href="${escapeXml(url)}"/>`,
        `    <updated>${published}</updated>`,
        `    <published>${published}</published>`,
        categories,
        `    <summary type="text">${escapeXml(entry.frontmatter.summary)}</summary>`,
        "  </entry>",
      ]
        .filter((line) => line.length > 0)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.name)} Changelog</title>
  <subtitle>${escapeXml(`Release notes from ${siteConfig.name}.`)}</subtitle>
  <id>${escapeXml(feedUrl)}</id>
  <link rel="self" type="application/atom+xml" href="${escapeXml(feedUrl)}"/>
  <link rel="alternate" type="text/html" href="${escapeXml(indexUrl)}"/>
  <updated>${updated}</updated>
  <author>
    <name>${escapeXml(siteConfig.name)}</name>
    <uri>${escapeXml(siteUrl)}</uri>
  </author>
${entryXml}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, max-age=600",
    },
  });
}
