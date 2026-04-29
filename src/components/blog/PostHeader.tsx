import Image from "next/image";
import { BLOG_AUTHOR, type Post } from "@/lib/blog/content";

function formatPublishedDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function PostHeader({ post }: { post: Post }) {
  const { frontmatter, readingTime } = post;
  const updated = frontmatter.updatedAt && frontmatter.updatedAt !== frontmatter.publishedAt;

  return (
    <header className="border-b border-ink-100 pb-10">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-lumos-700">
        Field guide
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl md:text-5xl">
        {frontmatter.title}
      </h1>
      <p className="mt-4 max-w-prose text-lg text-ink-500">
        {frontmatter.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
        <span className="font-medium text-ink-700">{BLOG_AUTHOR.name}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={frontmatter.publishedAt}>
          {formatPublishedDate(frontmatter.publishedAt)}
        </time>
        {updated && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-ink-400">
              Updated{" "}
              <time dateTime={frontmatter.updatedAt}>
                {formatPublishedDate(frontmatter.updatedAt as string)}
              </time>
            </span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{readingTime.text}</span>
      </div>

      {frontmatter.heroImage && (
        <figure className="mt-10">
          <Image
            src={frontmatter.heroImage}
            alt={frontmatter.heroImageAlt ?? frontmatter.title}
            width={1600}
            height={900}
            className="h-auto w-full rounded-xl border border-ink-100 bg-ink-50"
            sizes="(min-width: 1024px) 960px, 100vw"
            priority
          />
          {frontmatter.heroImageAlt && (
            <figcaption className="mt-3 text-sm text-ink-400">
              {frontmatter.heroImageAlt}
            </figcaption>
          )}
        </figure>
      )}
    </header>
  );
}
