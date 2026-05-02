"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import type { FoundingCount } from "@/lib/founding-count/source";
import type { FoundingCounterVariant } from "./FoundingCounter";

// Placeholder copy slots. Real strings come from LEU-40 (ContentGrowth)
// and must be swapped in before merge per LEU-43 acceptance.
const LABEL = {
  default: "founding spots left",
  critical: "founding spots left — closing",
  full: "founding cohort full · waitlist still open",
} as const;

type State = "default" | "critical" | "full";

function deriveState(remaining: number): State {
  if (remaining === 0) return "full";
  if (remaining <= 100) return "critical";
  return "default";
}

const REVALIDATE_MS = 60_000;
const STALE_MS = 10 * 60_000;

interface Props {
  variant: FoundingCounterVariant;
  initial: FoundingCount;
  simulated: boolean;
  className?: string;
  id?: string;
  quiet?: boolean;
}

export function FoundingCounterClient({
  variant,
  initial,
  simulated,
  className,
  id,
  quiet,
}: Props) {
  const [count, setCount] = useState<FoundingCount>(initial);

  useEffect(() => {
    // When simulated, pin to the SSR value — never refresh from the
    // network. This keeps `?simulateRemaining=N` deterministic across
    // hydration, focus changes, and revalidation cycles.
    if (simulated) return;

    let cancelled = false;
    const controller = new AbortController();

    const refresh = async () => {
      try {
        const res = await fetch("/api/waitlist/founding-count", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as FoundingCount;
        if (!cancelled) setCount(json);
      } catch {
        // Swallow — the counter degrades to its last good value.
      }
    };

    const interval = window.setInterval(refresh, REVALIDATE_MS);
    const onFocus = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [simulated]);

  const state = deriveState(count.remaining);
  const isStale =
    Boolean(count.stale) ||
    Date.now() - new Date(count.lastUpdatedAt).getTime() > STALE_MS;

  // Number-formatting: the numeral is the *remaining* count;
  // total renders as `1,000`. `Intl.NumberFormat` is locale-stable.
  const formatter = new Intl.NumberFormat("en-US");
  const numeralText = formatter.format(count.remaining);
  const totalText = formatter.format(count.totalCap);
  const label = LABEL[state];

  // Verbose label for screen readers — single sentence per fomo-spec §1.4.
  const ariaText =
    state === "full"
      ? `Founding cohort full of ${totalText}; waitlist still open.`
      : `${numeralText} of ${totalText} founding spots left${
          state === "critical" ? ", closing." : "."
        }`;

  return (
    <div
      id={id}
      role="status"
      aria-live={quiet ? "off" : "polite"}
      aria-atomic="true"
      aria-busy={isStale || undefined}
      data-state={state}
      data-variant={variant}
      data-simulated={simulated || undefined}
      data-stale={isStale || undefined}
      className={cn("founding-counter", className)}
    >
      {variant !== "compact" && (
        <span className="founding-counter__rule" aria-hidden="true" />
      )}
      {state === "full" ? (
        <s
          className="founding-counter__numeral"
          aria-label={`${numeralText} of ${totalText} founding spots remaining`}
        >
          {numeralText}
        </s>
      ) : (
        <span className="founding-counter__numeral">{numeralText}</span>
      )}
      <span className="founding-counter__divider" aria-hidden="true">
        /
      </span>
      <span className="founding-counter__total">{totalText}</span>
      <span className="founding-counter__label">{label}</span>
      {/* Single screen-reader-only sentence — keeps VoiceOver from
          reading the visual fragments separately. */}
      <span className="sr-only">{ariaText}</span>
      {state === "full" && (
        <p className="founding-counter__post">
          The founding cohort is full — the waitlist is still open and the
          launch tier still applies.
        </p>
      )}
    </div>
  );
}
