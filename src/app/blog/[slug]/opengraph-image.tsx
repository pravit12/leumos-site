import { notFound } from "next/navigation";
import { ogContentType, ogImageSize, renderOgCard } from "@/lib/og";
import { getAllPosts, getPostBySlug } from "@/lib/blog/content";

export const size = ogImageSize;
export const contentType = ogContentType;
export const alt = "Leumos blog post";

export async function generateImageMetadata() {
  return getAllPosts().map((post) => ({
    id: post.frontmatter.slug,
    alt: post.frontmatter.title,
    contentType,
    size,
  }));
}

export default async function PostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  return renderOgCard({
    eyebrow: "Leumos · Field guide",
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  });
}
