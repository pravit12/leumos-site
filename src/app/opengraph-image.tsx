import { ogContentType, ogImageSize, renderOgCard } from "@/lib/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = siteConfig.defaultOgTitle;
export const size = ogImageSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard();
}
