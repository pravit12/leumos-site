/**
 * Founding-member counter source. Reads the confirmed-signup count
 * from the same Upstash KV the LEU-4 waitlist API writes to.
 *
 * Coordinated key (this PR / LEU-43): `waitlist:counter`
 * — set + INCR'd by `getStorage().createSignup()` in LEU-4.
 *   The fomo-spec §1.3 originally proposed `waitlist:confirmed_count`
 *   as a separate "confirmed-only" key; LEU-4 currently does not
 *   distinguish confirmed vs. unconfirmed counts at the KV layer
 *   (every successful POST counts), so we share the existing key.
 *   When LEU-17 introduces explicit confirmation gating, swap to
 *   the confirmation-only key here without touching the API or UI.
 *
 * No SDK dependency: we hit the Upstash REST API directly so this
 * module ships independently of LEU-4's storage adapter.
 */

const COUNTER_KEY = "waitlist:counter";
export const FOUNDING_TOTAL_CAP = 1000;

export type FoundingCount = {
  totalCap: number;
  confirmed: number;
  remaining: number;
  lastUpdatedAt: string;
  /** True when the read failed and we returned the last cached value. */
  stale?: boolean;
};

let memoryCache: FoundingCount | null = null;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function buildCount(confirmedRaw: number, stale = false): FoundingCount {
  const confirmed = Math.max(0, Math.floor(confirmedRaw));
  const remaining = clamp(FOUNDING_TOTAL_CAP - confirmed, 0, FOUNDING_TOTAL_CAP);
  return {
    totalCap: FOUNDING_TOTAL_CAP,
    confirmed,
    remaining,
    lastUpdatedAt: new Date().toISOString(),
    ...(stale ? { stale: true } : {}),
  };
}

function envUrl(): string | undefined {
  return (
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? undefined
  );
}

function envToken(): string | undefined {
  return (
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? undefined
  );
}

/**
 * Read the current founding-count.
 *
 * - With Upstash REST env vars set → live KV read.
 * - Without env vars (dev / preview without KV) → returns confirmed=0
 *   so the counter renders default state. Never returns 0/1000 from a
 *   *failed* read — that path returns the last cached value with stale=true.
 */
export async function readFoundingCount(): Promise<FoundingCount> {
  const url = envUrl();
  const token = envToken();

  if (!url || !token) {
    const fresh = buildCount(0);
    memoryCache = fresh;
    return fresh;
  }

  try {
    const res = await fetch(`${url}/get/${COUNTER_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash GET ${COUNTER_KEY} → ${res.status}`);
    const json = (await res.json()) as { result: string | number | null };
    const raw = json.result;
    const confirmed =
      typeof raw === "number" ? raw : raw == null ? 0 : Number.parseInt(raw, 10) || 0;
    const fresh = buildCount(confirmed);
    memoryCache = fresh;
    return fresh;
  } catch {
    if (memoryCache) {
      return { ...memoryCache, stale: true, lastUpdatedAt: memoryCache.lastUpdatedAt };
    }
    // Cold start with a failing KV — last-resort: render at default state.
    return { ...buildCount(0), stale: true };
  }
}

/**
 * Build a count from a forced "remaining" value. Used by the
 * `?simulateRemaining=N` dev/preview affordance so QA can verify
 * critical (=100) and full (=0) states without touching the KV.
 */
export function buildSimulatedCount(remaining: number): FoundingCount {
  const clamped = clamp(Math.floor(remaining), 0, FOUNDING_TOTAL_CAP);
  return buildCount(FOUNDING_TOTAL_CAP - clamped);
}
