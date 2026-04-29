import Image from "next/image";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPostSummaries } from "@/lib/blog/content";
import { JsonLd, breadcrumbListLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  title: "Field guide — Leumos blog",
  description:
    "Practical guides for filmmakers and post-production teams. Cornerstone tutorials, craft notes, and workflow deep-dives from the Leumos team.",
  path: "/blog",
});

const formatPublishedDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default function BlogIndexPage() {
  const posts = getAllPostSummaries();

  return (
    <>
      <main
        id="main-content"
        className="mx-auto w-full max-w-prose px-6 py-16 sm:py-20"
      >
        <header className="border-b border-ink-100 pb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-lumos-700">
            Field guide
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            The Leumos blog
          </h1>
          <p className="mt-4 max-w-prose text-lg text-ink-500">
            Practical guides for filmmakers and post-production teams. New
            cornerstone tutorials drop here as we build them.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-12 text-base text-ink-500">
            No posts yet. The first cornerstone is on the way — join the
            waitlist and we&apos;ll let you know when it lands.
          </p>
        ) : (
          <ul className="mt-10 flex flex-col gap-10">
            {posts.map((post) => (
              <li key={post.frontmatter.slug}>
                <article className="grid gap-5 sm:grid-cols-[200px_1fr] sm:gap-6">
                  {post.frontmatter.heroImage && (
                    <Link
                      href={post.href}
                      aria-label={post.frontmatter.title}
                      className="block overflow-hidden rounded-lg border border-ink-100 bg-ink-50"
                    >
                      <Image
                        src={post.frontmatter.heroImage}
                        alt={
                          post.frontmatter.heroImageAlt ?? post.frontmatter.title
                        }
                        width={400}
                        height={225}
                        className="h-full w-full object-cover"
                        sizes="(min-width: 640px) 200px, 100vw"
                      />
                    </Link>
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] text-ink-400">
                      <time dateTime={post.frontmatter.publishedAt}>
                        {formatPublishedDate(post.frontmatter.publishedAt)}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span>{post.readingTime.text}</span>
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
                      <Link
                        href={post.href}
                        className="hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumos-500"
                      >
                        {post.frontmatter.title}
                      </Link>
                    </h2>
                    <p className="text-base text-ink-500">
                      {post.frontmatter.description}
                    </p>
                    <p className="mt-1">
                      <Link
                        href={post.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-lumos-700 hover:text-lumos-800"
                      >
                        Read the guide
                        <span aria-hidden="true">→</span>
                      </Link>
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
      <JsonLd
        data={breadcrumbListLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
    </>
  );
}
