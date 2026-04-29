import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const isPreview = process.env.VERCEL_ENV === "preview";
  return {
    rules: [
      isPreview
        ? { userAgent: "*", disallow: "/" }
        : { userAgent: "*", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
