import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { verifyRankToken } from "@/lib/og/token";
import { paletteForSeed, paletteToCssGradient } from "@/lib/og/seed";

// Edge runtime — `next/og` ships its own renderer; keep the route close to
// the user, far from the Node app.
export const runtime = "edge";

const SIZES = {
  vertical: { width: 1080, height: 1350 },
  og: { width: 1200, height: 630 },
} as const;
type SizeKey = keyof typeof SIZES;

function pickSize(value: string | null): SizeKey {
  return value === "og" ? "og" : "vertical";
}

export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return new Response("Missing token.", { status: 400 });
  }

  let payload;
  try {
    payload = await verifyRankToken(token);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "invalid token";
    return new Response(`Invalid rank token: ${reason}`, { status: 401 });
  }

  const sizeKey = pickSize(url.searchParams.get("size"));
  const dim = SIZES[sizeKey];
  const palette = paletteForSeed(payload.seedId);
  const isVertical = sizeKey === "vertical";

  // Layout numbers tuned to the spec (fomo-spec §4.2):
  // - 16:9 mobile / 21:9 desktop frame; we pick by which size is requested
  // - 12% letterbox bars top + bottom
  // - rank numeral roughly 18% of frame height
  const barHeight = Math.round(dim.height * 0.12);
  const numeralPx = isVertical ? 240 : 168;
  const eyebrowPx = isVertical ? 28 : 22;
  const totalPx = isVertical ? 32 : 24;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: paletteToCssGradient(palette),
          color: "#F5F6F8",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto",
          position: "relative",
        }}
      >
        {/* Letterbox top */}
        <div
          style={{
            height: barHeight,
            background: "#07090F",
            display: "flex",
          }}
        />

        {/* Stage */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isVertical ? "0 80px" : "0 96px",
            gap: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: eyebrowPx,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#FFA866",
              display: "flex",
            }}
          >
            FOUNDING WAITLIST · RANK
          </div>
          {/* Rank numeral. next/og does not support background-clip:text,
              so the gradient lives behind a tight masked bounding box. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: numeralPx,
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1,
              color: "#FFD9B8",
              letterSpacing: -2,
              textShadow:
                "0 2px 24px rgba(7,9,15,0.55), 0 0 80px rgba(255,122,26,0.45)",
            }}
          >
            #{payload.rank.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: totalPx,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              color: "#C9CFD9",
              display: "flex",
            }}
          >
            of {payload.total.toLocaleString()}
          </div>
          <div
            style={{
              marginTop: isVertical ? 32 : 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderRadius: 6,
              background: "rgba(13,17,25,0.55)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: isVertical ? 22 : 18,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              color: "#F5F6F8",
            }}
          >
            <span style={{ display: "flex", color: "#5FCDE0" }}>leumos.ai</span>
            <span style={{ display: "flex", color: "#97A0AF" }}>·</span>
            <span style={{ display: "flex" }}>{payload.referralCode}</span>
          </div>
        </div>

        {/* Letterbox bottom */}
        <div
          style={{
            height: barHeight,
            background: "#07090F",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: dim.width,
      height: dim.height,
      headers: {
        "Cache-Control": "public, immutable, max-age=86400",
      },
    },
  );
}
