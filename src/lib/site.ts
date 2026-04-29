export const siteConfig = {
  name: "Leumos AI",
  shortName: "Leumos",
  legalName: "Leumos AI, Inc.",
  tagline: "Pre-launch — join the waitlist.",
  description:
    "Leumos AI is launching soon. Join the waitlist for early access and founding-member perks.",
  defaultOgTitle: "Leumos AI — Coming soon",
  twitter: "@leumosai",
  locale: "en_US",
} as const;

export type StaticRoute = {
  path: string;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export const staticRoutes: StaticRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
];

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
