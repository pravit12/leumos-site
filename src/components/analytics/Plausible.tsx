import Script from "next/script";

const PLAUSIBLE_SCRIPT_SRC = "https://plausible.io/js/script.js";

export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const isProd = process.env.VERCEL_ENV === "production";
  if (!domain || !isProd) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src={PLAUSIBLE_SCRIPT_SRC}
      strategy="afterInteractive"
    />
  );
}
