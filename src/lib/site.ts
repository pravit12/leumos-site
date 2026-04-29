export const siteConfig = {
  name: "Leumos AI",
  shortName: "Leumos",
  tagline: "Pre-launch — join the waitlist.",
  description:
    "Leumos AI is launching soon. Join the waitlist for early access and founding-member perks.",
  defaultOgTitle: "Leumos AI — Coming soon",
  twitter: "@leumosai",
  locale: "en_US",
} as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
