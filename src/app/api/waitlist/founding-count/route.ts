import { NextRequest, NextResponse } from "next/server";
import {
  readFoundingCount,
  buildSimulatedCount,
  FOUNDING_TOTAL_CAP,
} from "@/lib/founding-count/source";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const CACHE_HEADER = "public, s-maxage=30, stale-while-revalidate=90";
const SIMULATE_DISABLED_IN_PROD = process.env.VERCEL_ENV === "production";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const simulateParam = url.searchParams.get("simulateRemaining");

  if (simulateParam !== null && !SIMULATE_DISABLED_IN_PROD) {
    const n = Number.parseInt(simulateParam, 10);
    if (Number.isFinite(n) && n >= 0 && n <= FOUNDING_TOTAL_CAP) {
      return NextResponse.json(buildSimulatedCount(n), {
        headers: {
          "Cache-Control": "no-store",
          "X-Founding-Count-Simulated": "1",
        },
      });
    }
  }

  const count = await readFoundingCount();
  return NextResponse.json(count, {
    headers: {
      "Cache-Control": count.stale ? "no-store" : CACHE_HEADER,
    },
  });
}
