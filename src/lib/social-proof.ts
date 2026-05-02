/**
 * Social-proof helpers (LEU-44).
 *
 * Honest data only — no fabricated names, no synthetic initials.
 * Initials are derived only from real opted-in or anonymized records.
 */

export interface NamedQuote {
  name: string;
  role: string;
  body: string;
}

export interface SocialProofPayload {
  /** Confirmed sign-ups in the last 7 days. Cold-start is 0. */
  recentCount: number;
  /**
   * Anonymized initials of recent confirmed sign-ups, newest first.
   * Up to 3 are rendered as avatars; the rest (if any) collapse into the overflow chip.
   * Empty until at least 5 confirmed sign-ups exist.
   */
  anonymousInitials: string[];
  /**
   * Optional named quote. Null until a user opts in via the public-name checkbox
   * AND has been promoted into the named-quote pool (admin flag, off by default).
   */
  namedQuote: NamedQuote | null;
  /** ISO timestamp of the most recent confirmed sign-up that fed this payload. */
  lastUpdatedAt: string | null;
}

/**
 * Brand-spectrum stops used for avatar backgrounds. The order is the spec:
 * lume-blue → lume-violet → lume-magenta → lume-orange.
 */
export const AVATAR_PALETTE = [
  "var(--lume-blue)",
  "var(--lume-violet)",
  "var(--lume-magenta)",
  "var(--lume-orange)",
] as const;

/**
 * Deterministic 32-bit FNV-1a hash. Stable across runtimes; no crypto needed.
 */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Pick a deterministic color index for a pair of initials. */
export function avatarColorFor(initials: string): string {
  const idx = fnv1a32(initials.toUpperCase()) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

/**
 * Derive 2-letter initials from a name + email pair.
 * - First letter of first name + first letter of last name when a name is present
 * - Otherwise, first 2 letters of the email local-part
 *
 * Returns null when neither input yields letters (do NOT fabricate initials).
 */
export function deriveInitials(opts: {
  name?: string | null;
  email?: string | null;
}): string | null {
  const name = (opts.name ?? "").trim();
  if (name.length > 0) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0];
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : undefined;
    const letters = `${first ?? ""}${last ?? ""}`.toUpperCase();
    if (/^[A-Z]{1,2}$/.test(letters)) return letters.padEnd(2, letters[0]);
  }

  const email = (opts.email ?? "").trim();
  if (email.length > 0) {
    const local = email.split("@")[0] ?? "";
    const letters = local.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
    if (letters.length === 2) return letters;
    if (letters.length === 1) return `${letters}${letters}`;
  }

  return null;
}
