import type { MetadataRoute } from "next";
import { absoluteUrl, staticRoutes } from "@/lib/site";
import { getAllPosts, postHref, postModifiedDate } from "@/lib/blog/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const posts = getAllPosts().map((post) => ({
    url: absoluteUrl(postHref(post.frontmatter.slug)),
    lastModified: postModifiedDate(post),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticEntries, ...posts];
}
