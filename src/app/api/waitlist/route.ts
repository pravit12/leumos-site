import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  signupInputSchema,
  FOUNDING_TOTAL,
  type SignupErrorResponse,
  type SignupSuccessResponse,
} from "@/lib/waitlist/schema";
import { signRankToken } from "@/lib/og/token";
import { seedFromReferralCode } from "@/lib/og/seed";
import {
  getStorage,
  getStorageKind,
  type SignupRecord,
} from "@/lib/waitlist/storage";
import { generateReferralCode, isValidReferralCode } from "@/lib/waitlist/referral-code";
import { sendConfirmationEmail, syncToAudience } from "@/lib/waitlist/email";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function fail(status: number, payload: SignupErrorResponse) {
  return NextResponse.json(payload, { status });
}

async function mintRankToken(args: {
  referralCode: string;
  rank: number;
  name?: string;
}): Promise<string> {
  return signRankToken({
    rank: args.rank,
    total: FOUNDING_TOTAL,
    referralCode: args.referralCode,
    seedId: seedFromReferralCode(args.referralCode),
    name: args.name,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, { ok: false, error: "Invalid JSON body." });
  }

  let parsed;
  try {
    parsed = signupInputSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = issue.path.join(".") || "_root";
        (fieldErrors[key] ??= []).push(issue.message);
      }
      return fail(400, {
        ok: false,
        error: "Please double-check the form.",
        fieldErrors,
      });
    }
    return fail(400, { ok: false, error: "Invalid input." });
  }

  // Honeypot — silent success so bots don't learn anything.
  if (parsed.website && parsed.website.length > 0) {
    const fakeCode = "LU-XXXXXX";
    const rankToken = await mintRankToken({ referralCode: fakeCode, rank: 1 });
    return NextResponse.json(
      {
        ok: true,
        queuePosition: 1,
        referralCode: fakeCode,
        referralCount: 0,
        shareUrl: `${getSiteUrl()}/?ref=${fakeCode}`,
        alreadyOnList: false,
        rankToken,
        rankTotal: FOUNDING_TOTAL,
      } satisfies SignupSuccessResponse,
      { status: 200 },
    );
  }

  const storage = getStorage();
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? undefined;

  const rl = await storage.rateLimit(ip);
  if (!rl.allowed) {
    return fail(429, {
      ok: false,
      error: "Too many sign-up attempts from this network. Try again shortly.",
    });
  }

  // Idempotent — if email already exists, return their existing record.
  const existing = await storage.getByEmail(parsed.email);
  if (existing) {
    const queuePosition = await storage.computeQueuePosition(existing);
    const rankToken = await mintRankToken({
      referralCode: existing.referralCode,
      rank: queuePosition,
      name: existing.name,
    });
    return NextResponse.json(
      {
        ok: true,
        queuePosition,
        referralCode: existing.referralCode,
        referralCount: existing.referralCount,
        shareUrl: `${getSiteUrl()}/?ref=${existing.referralCode}`,
        alreadyOnList: true,
        rankToken,
        rankTotal: FOUNDING_TOTAL,
      } satisfies SignupSuccessResponse,
      { status: 200 },
    );
  }

  // Validate referral code (if provided) but don't fail the sign-up if invalid —
  // we just drop the attribution. A bogus code shouldn't block someone joining.
  let referredBy: string | undefined = undefined;
  if (parsed.referredBy && isValidReferralCode(parsed.referredBy)) {
    const referrer = await storage.getByReferralCode(parsed.referredBy);
    if (referrer) referredBy = referrer.referralCode;
  }

  const referralCode = generateReferralCode();
  const created = await storage.createSignup({
    email: parsed.email,
    name: parsed.name,
    company: parsed.company,
    role: parsed.role,
    useCase: parsed.useCase,
    referralCode,
    referredBy,
    ip,
    userAgent,
    utm: parsed.utm,
    createdAt: new Date().toISOString(),
  });

  if (referredBy) {
    await storage.incrementReferralCount(referredBy);
  }

  const queuePosition = await storage.computeQueuePosition(created);
  const enriched: SignupRecord = { ...created, queuePosition };
  const rankToken = await mintRankToken({
    referralCode: enriched.referralCode,
    rank: queuePosition,
    name: enriched.name,
  });

  // Email and audience sync are fire-and-forget so a Resend hiccup does not
  // fail the sign-up. Failures are logged server-side.
  void Promise.all([
    sendConfirmationEmail(enriched, { rankToken }).then((result) => {
      if (!result.delivered && result.attempted) {
        console.warn("[waitlist] confirmation send failed", {
          email: enriched.email,
          reason: result.reason,
        });
      }
    }),
    syncToAudience(enriched),
  ]);

  console.info("[waitlist] new signup", {
    email: enriched.email,
    referralCode: enriched.referralCode,
    referredBy,
    queuePosition,
    storage: getStorageKind(),
    utm: enriched.utm ?? null,
  });

  return NextResponse.json(
    {
      ok: true,
      queuePosition,
      referralCode: enriched.referralCode,
      referralCount: 0,
      shareUrl: `${getSiteUrl()}/?ref=${enriched.referralCode}`,
      alreadyOnList: false,
      rankToken,
      rankTotal: FOUNDING_TOTAL,
    } satisfies SignupSuccessResponse,
    { status: 201 },
  );
}
