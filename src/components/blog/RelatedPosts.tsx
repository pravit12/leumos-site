import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/lib/blog/content";

export function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;
  return (
    <section
      aria-labelledby="related-posts-heading"
      className="mt-16 border-t border-ink-100 pt-12"
    >
      <h2
        id="related-posts-heading"
        className="text-2xl font-semibold tracking-tight text-ink-900"
      >
        Keep reading
      </h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.frontmatter.slug}>
            <Link
              href={post.href}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white transition hover:border-lumos-300 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumos-500"
            >
              {post.frontmatter.heroImage && (
                <span className="block aspect-[16/9] overflow-hidden bg-ink-50">
                  <Image
                    src={post.frontmatter.heroImage}
                    alt={post.frontmatter.heroImageAlt ?? post.frontmatter.title}
                    width={640}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                  />
                </span>
              )}
              <span className="flex flex-1 flex-col gap-2 p-5">
                <span className="text-base font-semibold text-ink-900 group-hover:text-ink-800">
                  {post.frontmatter.title}
                </span>
                <span className="line-clamp-3 text-sm text-ink-500">
                  {post.frontmatter.description}
                </span>
                <span className="mt-auto text-xs uppercase tracking-[0.18em] text-ink-400">
                  {post.readingTime.text}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
