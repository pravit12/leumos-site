import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export type PageMetadataInput = {
  title?: string;
  description?: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
};

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const {
    title,
    description = siteConfig.description,
    path,
    ogImage,
    noIndex = false,
    keywords,
  } = input;

  const canonical = absoluteUrl(path);
  const resolvedTitle = title ?? siteConfig.defaultOgTitle;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: resolvedTitle,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      creator: siteConfig.twitter,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
  };
}
