// Short-lived HMAC-signed token used by `/api/og/rank?token=…`.
//
// We sign a tiny JSON payload with HMAC-SHA256 over the Web Crypto API so
// the same code path runs on the Edge runtime (where the OG route lives)
// and the Node runtime (where the email send mints tokens). No external
// dep — `jose` would work but adds 60 KB the bundle does not need.

const TEXT = new TextEncoder();

export type RankPayload = {
  rank: number;
  total: number;
  referralCode: string;
  seedId: number;
  /** issued-at, seconds since epoch */
  iat: number;
  /** optional first name for the email greeting; not displayed in the PNG */
  name?: string;
};

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const TOKEN_VERSION = "v1";

function getSecret(): string {
  const secret =
    process.env.OG_TOKEN_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.RESEND_API_KEY;
  if (!secret) {
    throw new Error(
      "OG_TOKEN_SECRET is not set. Provide a 32+ char secret to sign rank-frame tokens.",
    );
  }
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // btoa is available on edge + node (>= 16) + browsers.
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    TEXT.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, TEXT.encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Sign a rank-frame payload and return a URL-safe token.
 * Format: `v1.<base64url-payload>.<base64url-sig>`
 */
export async function signRankToken(
  payload: Omit<RankPayload, "iat"> & { iat?: number },
): Promise<string> {
  const full: RankPayload = {
    ...payload,
    iat: payload.iat ?? Math.floor(Date.now() / 1000),
  };
  const body = base64UrlEncode(TEXT.encode(JSON.stringify(full)));
  const sig = base64UrlEncode(await hmac(getSecret(), `${TOKEN_VERSION}.${body}`));
  return `${TOKEN_VERSION}.${body}.${sig}`;
}

export type VerifyOptions = {
  /** override max-age in seconds (default 7 days) */
  ttlSeconds?: number;
  /** override Date.now (testing) */
  nowSeconds?: number;
};

export async function verifyRankToken(
  token: string,
  opts: VerifyOptions = {},
): Promise<RankPayload> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) {
    throw new Error("Malformed rank token.");
  }
  const [, body, sig] = parts;
  const expected = await hmac(getSecret(), `${TOKEN_VERSION}.${body}`);
  const provided = base64UrlDecode(sig);
  if (!timingSafeEqual(expected, provided)) {
    throw new Error("Rank token signature mismatch.");
  }
  const decoded = JSON.parse(new TextDecoder().decode(base64UrlDecode(body)));
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.rank !== "number" ||
    typeof decoded.total !== "number" ||
    typeof decoded.referralCode !== "string" ||
    typeof decoded.seedId !== "number" ||
    typeof decoded.iat !== "number"
  ) {
    throw new Error("Rank token payload shape is invalid.");
  }
  const ttl = opts.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const now = opts.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (now - decoded.iat > ttl) {
    throw new Error("Rank token expired.");
  }
  return decoded as RankPayload;
}
