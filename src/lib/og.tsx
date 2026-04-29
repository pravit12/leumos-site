import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const ogImageSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png" as const;

type OgCardInput = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function renderOgCard(input: OgCardInput = {}) {
  const eyebrow = input.eyebrow ?? siteConfig.shortName;
  const title = input.title ?? siteConfig.name;
  const description = input.description ?? siteConfig.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0b0d14 0%, #161a25 60%, #7a340f 100%)",
          color: "#fffaeb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#ffd14a",
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.3,
              color: "#eceef2",
              maxWidth: 900,
            }}
          >
            {description}
          </div>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#a8aebc",
          }}
        >
          leumos.ai
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
