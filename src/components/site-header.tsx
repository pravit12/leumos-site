import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-ink-100/80 bg-ink-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-prose items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label={`${siteConfig.name} — home`}
          className="font-display text-base font-semibold tracking-tight text-ink-900"
        >
          {siteConfig.shortName}
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-sm text-ink-500">
            <li>
              <Link
                href="/"
                className="rounded-sm hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumos-500"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="rounded-sm hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumos-500"
              >
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
