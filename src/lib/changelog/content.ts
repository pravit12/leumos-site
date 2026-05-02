import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const FILENAME_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.mdx$/;

const FrontmatterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  version: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[\w.+\-]+$/, "version may only contain word chars, dots, plus, hyphen"),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(400),
  tags: z.array(z.string().min(1).max(40)).default([]),
});

export type ChangelogFrontmatter = z.infer<typeof FrontmatterSchema>;

export type ChangelogEntry = {
  slug: string;
  frontmatter: ChangelogFrontmatter;
  content: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content", "changelog");

function parseEntryFile(fileName: string): ChangelogEntry {
  const match = FILENAME_RE.exec(fileName);
  if (!match) {
    throw new Error(
      `Changelog filename "${fileName}" must match YYYY-MM-DD-slug.mdx`,
    );
  }
  const [, fileDate, slug] = match;
  const raw = fs.readFileSync(path.join(CONTENT_ROOT, fileName), "utf8");
  const { data, content } = matter(raw);
  const parsed = FrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${fileName} — ${detail}`);
  }
  if (parsed.data.date !== fileDate) {
    throw new Error(
      `Date mismatch in ${fileName} — frontmatter "${parsed.data.date}" must match filename "${fileDate}".`,
    );
  }
  return { slug, frontmatter: parsed.data, content };
}

let entryCache: ChangelogEntry[] | null = null;

function loadEntriesFromDisk(): ChangelogEntry[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  const files = fs
    .readdirSync(CONTENT_ROOT)
    .filter((name) => name.endsWith(".mdx"));
  const entries = files.map((name) => parseEntryFile(name));
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.slug)) {
      throw new Error(`Duplicate changelog slug "${entry.slug}"`);
    }
    slugs.add(entry.slug);
  }
  entries.sort((a, b) => {
    const cmp = b.frontmatter.date.localeCompare(a.frontmatter.date);
    return cmp !== 0 ? cmp : a.slug.localeCompare(b.slug);
  });
  return entries;
}

function getCachedEntries(): ChangelogEntry[] {
  if (process.env.NODE_ENV === "production") {
    if (!entryCache) entryCache = loadEntriesFromDisk();
    return entryCache;
  }
  return loadEntriesFromDisk();
}

export function getAllChangelogEntries(): ChangelogEntry[] {
  return getCachedEntries();
}

export function getChangelogEntryBySlug(slug: string): ChangelogEntry | null {
  return getCachedEntries().find((entry) => entry.slug === slug) ?? null;
}

export function changelogEntryHref(slug: string): string {
  return `/changelog/${slug}`;
}

export function changelogEntryDate(entry: ChangelogEntry): Date {
  return new Date(`${entry.frontmatter.date}T00:00:00Z`);
}
