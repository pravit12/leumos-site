import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import {
  changelogEntryHref,
  changelogEntryDate,
  getAllChangelogEntries,
} from "@/lib/changelog/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries = getAllChangelogEntries();
  const newestChangelogDate = entries.length
    ? changelogEntryDate(entries[0])
    : new Date();

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/changelog`,
      lastModified: newestChangelogDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...entries.map((entry) => ({
      url: `${base}${changelogEntryHref(entry.slug)}`,
      lastModified: changelogEntryDate(entry),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
