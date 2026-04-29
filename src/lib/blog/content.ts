import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

export const BLOG_AUTHOR = {
  name: "Leumos team",
  url: "/",
} as const;

const FrontmatterSchema = z.object({
  title: z.string().min(1, "title is required").max(160),
  slug: z
    .string()
    .min(1, "slug is required")
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case (a-z, 0-9, -)"),
  description: z.string().min(40).max(220),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "publishedAt must be YYYY-MM-DD"),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "updatedAt must be YYYY-MM-DD")
    .optional(),
  heroImage: z.string().min(1).optional(),
  heroImageAlt: z.string().min(1).optional(),
  relatedSlugs: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  ctaVariant: z.string().default("default"),
  draft: z.boolean().default(false),
  excerpt: z.string().optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

export type Post = {
  frontmatter: Frontmatter;
  /** Raw MDX body without the frontmatter block. */
  content: string;
  /** Reading-time stats from the `reading-time` package, rounded to 1 minute minimum. */
  readingTime: { minutes: number; words: number; text: string };
};

export type PostSummary = Pick<
  Post,
  "readingTime"
> & {
  frontmatter: Frontmatter;
  href: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content", "blog");

function readPostFile(filePath: string, slugFromName: string): Post {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const parsed = FrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)} — ${detail}`);
  }
  if (parsed.data.slug !== slugFromName) {
    throw new Error(
      `Slug mismatch in ${path.basename(filePath)} — frontmatter slug "${parsed.data.slug}" must match filename "${slugFromName}".`,
    );
  }
  const rt = readingTime(content);
  return {
    frontmatter: parsed.data,
    content,
    readingTime: {
      minutes: Math.max(1, Math.round(rt.minutes)),
      words: rt.words,
      text: `${Math.max(1, Math.round(rt.minutes))} min read`,
    },
  };
}

let postCache: Post[] | null = null;

function loadAllPostsFromDisk(): Post[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  const entries = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".mdx"));
  const posts = entries.map((entry) => {
    const slug = entry.name.replace(/\.mdx$/, "");
    return readPostFile(path.join(CONTENT_ROOT, entry.name), slug);
  });
  posts.sort((a, b) =>
    b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
  );
  return posts;
}

function getCachedPosts(): Post[] {
  if (process.env.NODE_ENV === "production") {
    if (!postCache) postCache = loadAllPostsFromDisk();
    return postCache;
  }
  return loadAllPostsFromDisk();
}

export function getAllPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Post[] {
  const posts = getCachedPosts();
  return includeDrafts ? posts : posts.filter((p) => !p.frontmatter.draft);
}

export function getAllPostSummaries(opts?: { includeDrafts?: boolean }): PostSummary[] {
  return getAllPosts(opts).map((p) => ({
    frontmatter: p.frontmatter,
    readingTime: p.readingTime,
    href: postHref(p.frontmatter.slug),
  }));
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts({ includeDrafts: false }).find((p) => p.frontmatter.slug === slug) ?? null;
}

export function getRelatedPosts(post: Post, limit = 3): PostSummary[] {
  const allOther = getAllPostSummaries().filter(
    (p) => p.frontmatter.slug !== post.frontmatter.slug,
  );
  const explicit = post.frontmatter.relatedSlugs
    .map((slug) => allOther.find((p) => p.frontmatter.slug === slug))
    .filter((p): p is PostSummary => Boolean(p));
  if (explicit.length >= limit) return explicit.slice(0, limit);
  const fillers = allOther.filter(
    (p) => !explicit.some((e) => e.frontmatter.slug === p.frontmatter.slug),
  );
  return [...explicit, ...fillers].slice(0, limit);
}

export function postHref(slug: string): string {
  return `/blog/${slug}`;
}

export function postPublishedDate(post: Post): Date {
  return new Date(`${post.frontmatter.publishedAt}T00:00:00Z`);
}

export function postModifiedDate(post: Post): Date {
  const value = post.frontmatter.updatedAt ?? post.frontmatter.publishedAt;
  return new Date(`${value}T00:00:00Z`);
}

export function postExcerpt(post: Post): string {
  return post.frontmatter.excerpt ?? post.frontmatter.description;
}
