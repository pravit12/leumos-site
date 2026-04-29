"use client";

import { useEffect, useState } from "react";

export function StickyMobileCTA({
  targetId = "waitlist-form",
  label = "Join the waitlist",
  hint = "Email only. Takes 5 seconds.",
}: {
  targetId?: string;
  label?: string;
  hint?: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <div
      role="region"
      aria-label="Join the waitlist"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 px-4 py-3 shadow-[0_-6px_24px_rgba(11,13,20,0.08)] backdrop-blur transition-opacity duration-300 sm:hidden ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <div className="mx-auto flex max-w-narrow items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{label}</p>
          <p className="truncate text-xs text-ink-500">{hint}</p>
        </div>
        <a
          href={`#${targetId}`}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-lumos-50 hover:bg-ink-800"
        >
          Join now
        </a>
      </div>
    </div>
  );
}
