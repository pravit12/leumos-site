// Crockford-ish base32 alphabet — no I, L, O, U, 0, 1 to avoid look-alikes.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_PREFIX = "LU";
const CODE_LENGTH = 6;

export function generateReferralCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let body = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    body += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${CODE_PREFIX}-${body}`;
}

export function isValidReferralCode(code: string): boolean {
  return /^LU-[A-Z2-9]{6}$/.test(code);
}
