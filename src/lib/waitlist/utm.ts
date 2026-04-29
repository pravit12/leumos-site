import { ROLE_OPTIONS, USE_CASE_OPTIONS } from "./schema";

export type UtmCapture = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landingPath?: string;
};

const STORAGE_KEY = "leumos.waitlist.attribution.v1";
const REF_KEY = "leumos.waitlist.ref.v1";
const ATTRIBUTION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type StoredAttribution = {
  utm: UtmCapture;
  ref?: string;
  capturedAt: number;
};

function readSafe(): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (!parsed.capturedAt || Date.now() - parsed.capturedAt > ATTRIBUTION_TTL_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSafe(value: StoredAttribution): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private mode / quota: fine to skip */
  }
}

export function captureAttributionFromLocation(loc: Location): {
  utm: UtmCapture;
  ref?: string;
} {
  const url = new URL(loc.href);
  const params = url.searchParams;

  const utm: UtmCapture = {};
  for (const [k, target] of [
    ["utm_source", "source"],
    ["utm_medium", "medium"],
    ["utm_campaign", "campaign"],
    ["utm_content", "content"],
    ["utm_term", "term"],
  ] as const) {
    const v = params.get(k);
    if (v) utm[target] = v.slice(0, 120);
  }

  if (typeof document !== "undefined") {
    const referrer = document.referrer?.slice(0, 500);
    if (referrer) utm.referrer = referrer;
  }
  utm.landingPath = `${url.pathname}${url.search}`.slice(0, 500);

  const ref = params.get("ref")?.toUpperCase();

  const stored = readSafe();
  const hasIncomingUtm = Object.values(utm).some((v) => v !== undefined && v !== utm.landingPath);

  // First touch wins for utm; latest touch wins for ref (so people can re-share).
  const finalUtm: UtmCapture = stored?.utm && !hasIncomingUtm ? stored.utm : utm;
  const finalRef = ref ?? stored?.ref;

  writeSafe({ utm: finalUtm, ref: finalRef, capturedAt: Date.now() });

  if (ref && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(REF_KEY, ref);
    } catch {
      /* ignore */
    }
  }

  return { utm: finalUtm, ref: finalRef };
}

export function readStoredAttribution(): { utm: UtmCapture; ref?: string } {
  const stored = readSafe();
  if (!stored) return { utm: {} };
  return { utm: stored.utm, ref: stored.ref };
}

export function isValidRoleOption(v: string): boolean {
  return (ROLE_OPTIONS as readonly string[]).includes(v);
}

export function isValidUseCaseOption(v: string): boolean {
  return (USE_CASE_OPTIONS as readonly string[]).includes(v);
}
