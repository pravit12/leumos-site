import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const isProd = process.env.VERCEL_ENV === "production";
  return {
    rules: [
      isProd
        ? { userAgent: "*", allow: "/" }
        : { userAgent: "*", disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
