"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/blog/toc";

type Props = {
  entries: TocEntry[];
};

export function TableOfContents({ entries }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (entries.length === 0) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observed = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (observed.length === 0) return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -60% 0px", threshold: 0 },
    );
    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="block">
      {/* Mobile — collapsible disclosure. Hidden on lg+ where the desktop sticky version is used. */}
      <details
        className="lg:hidden"
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-ink-100 bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-700 marker:hidden [&::-webkit-details-marker]:hidden">
          <span>Table of contents</span>
          <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </summary>
        <ol className="mt-3 space-y-2 px-2 text-sm">
          {entries.map((entry) => (
            <TocItem key={entry.id} entry={entry} activeId={activeId} />
          ))}
        </ol>
      </details>

      {/* Desktop — sticky sidebar. */}
      <div className="sticky top-24 hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
          On this page
        </p>
        <ol className="mt-3 space-y-2 text-sm">
          {entries.map((entry) => (
            <TocItem key={entry.id} entry={entry} activeId={activeId} />
          ))}
        </ol>
      </div>
    </nav>
  );
}

function TocItem({ entry, activeId }: { entry: TocEntry; activeId: string | null }) {
  const active = entry.id === activeId;
  return (
    <li className={entry.depth === 3 ? "pl-4" : undefined}>
      <a
        href={`#${entry.id}`}
        aria-current={active ? "true" : undefined}
        className={`block border-l-2 py-1 pl-3 transition-colors ${
          active
            ? "border-lumos-500 font-medium text-ink-900"
            : "border-transparent text-ink-500 hover:border-ink-200 hover:text-ink-800"
        }`}
      >
        {entry.text}
      </a>
    </li>
  );
}
