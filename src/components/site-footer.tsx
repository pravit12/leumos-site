import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink-100/80 bg-ink-50/60">
      <div className="mx-auto flex max-w-prose flex-col gap-2 px-6 py-8 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} {siteConfig.legalName} All rights reserved.
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-4">
            <li>
              <a
                href="mailto:hello@leumos.ai"
                className="hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumos-500"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
