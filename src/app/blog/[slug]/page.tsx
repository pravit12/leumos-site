import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Pluggable } from "unified";
import { buildPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { JsonLd, articleLd, breadcrumbListLd } from "@/lib/structured-data";
import {
  BLOG_AUTHOR,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  postHref,
} from "@/lib/blog/content";
import { extractToc } from "@/lib/blog/toc";
import { blogMdxComponents } from "@/components/blog/MdxComponents";
import { PostHeader } from "@/components/blog/PostHeader";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { PostCtaSection } from "@/components/blog/PostCtaSection";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return getAllPosts().map((post) => ({ slug: post.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return buildPageMetadata({ title: "Not found", path: postHref(slug), noIndex: true });
  return buildPageMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: postHref(post.frontmatter.slug),
    keywords: post.frontmatter.keywords,
  });
}

const mdxOptions = {
  remarkPlugins: [remarkGfm] as Pluggable[],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "append",
        properties: {
          className: ["heading-anchor"],
          ariaLabel: "Link to section",
        },
        content: {
          type: "element",
          tagName: "span",
          properties: { ariaHidden: "true" },
          children: [{ type: "text", value: "#" }],
        },
      },
    ],
  ] as Pluggable[],
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const toc = extractToc(post.content);
  const related = getRelatedPosts(post, 3);

  const articleSchema = articleLd({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: postHref(post.frontmatter.slug),
    datePublished: new Date(`${post.frontmatter.publishedAt}T00:00:00Z`).toISOString(),
    dateModified: new Date(
      `${post.frontmatter.updatedAt ?? post.frontmatter.publishedAt}T00:00:00Z`,
    ).toISOString(),
    authorName: BLOG_AUTHOR.name,
    authorUrl: BLOG_AUTHOR.url,
    image: post.frontmatter.heroImage
      ? absoluteUrl(post.frontmatter.heroImage)
      : absoluteUrl(`${postHref(post.frontmatter.slug)}/opengraph-image`),
    keywords: post.frontmatter.keywords,
  });

  const breadcrumbs = breadcrumbListLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.frontmatter.title, path: postHref(post.frontmatter.slug) },
  ]);

  return (
    <>
      <main
        id="main-content"
        className="mx-auto w-full max-w-[80rem] px-6 py-12 sm:py-16"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
          <article className="min-w-0">
            <PostHeader post={post} />
            <div className="prose-leumos mt-10">
              <MDXRemote
                source={post.content}
                components={blogMdxComponents}
                options={{ mdxOptions }}
              />
            </div>
            <PostCtaSection
              variant={post.frontmatter.ctaVariant}
              formId={`post-${post.frontmatter.slug}-waitlist`}
            />
            <RelatedPosts posts={related} />
          </article>

          <aside className="lg:order-last">
            <TableOfContents entries={toc} />
          </aside>
        </div>
      </main>
      <StickyMobileCTA targetId={`post-${post.frontmatter.slug}-waitlist`} />
      <JsonLd data={[articleSchema, breadcrumbs]} />
    </>
  );
}
