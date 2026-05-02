import { NextResponse } from "next/server";
import type { SocialProofPayload } from "@/lib/social-proof";

export const runtime = "edge";

/**
 * GET /api/waitlist/social-proof
 *
 * Returns a minimal, anonymized snapshot of recent waitlist activity.
 * Honest-data guarantees:
 *   - recentCount only reflects confirmed sign-ups in the last 7 days.
 *   - anonymousInitials never contain fabricated or AI-generated values.
 *   - namedQuote stays null until a user has opted-in publicly AND been
 *     promoted into the named-quote pool by ContentGrowth/CEO.
 *
 * Cold-start (no user record yet) returns recentCount: 0 so the
 * SocialProofBlock hides entirely on the client. As soon as the LEU-4 sign-up
 * pipeline lands, swap the body of `loadSnapshot()` to read from the data store.
 */
export async function GET(): Promise<Response> {
  const payload = await loadSnapshot();
  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function loadSnapshot(): Promise<SocialProofPayload> {
  // Pre-launch cold start. Real reads land in LEU-4 follow-up — this stub
  // is intentionally exhaustive about what stays null/zero so callers cannot
  // accidentally render synthetic values.
  return {
    recentCount: 0,
    anonymousInitials: [],
    namedQuote: null,
    lastUpdatedAt: null,
  };
}
