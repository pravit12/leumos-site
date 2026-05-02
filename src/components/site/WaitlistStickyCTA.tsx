"use client";

import { useEffect, useState } from "react";
import { Button, StickyMobileCTA } from "@/components/ui";

/**
 * Wraps StickyMobileCTA with a runtime listener that observes when any
 * waitlist form (data-waitlist-form) has focus and hides the bar.
 *
 * Also hides when a SuccessState is present (data-waitlist-success).
 * SuccessState wiring lives in LEU-4; this component just provides the contract.
 */
export function WaitlistStickyCTA() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const evaluate = () => {
      const active = document.activeElement as HTMLElement | null;
      const focused = !!active?.closest?.("[data-waitlist-form]");
      const success = !!document.querySelector("[data-waitlist-success]");
      setHidden(focused || success);
    };

    const onFocusIn = () => evaluate();
    const onFocusOut = () =>
      // Defer to allow the next focus target to land before re-evaluating.
      window.setTimeout(evaluate, 0);

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    const observer = new MutationObserver(() => evaluate());
    observer.observe(document.body, { subtree: true, childList: true });

    evaluate();

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      observer.disconnect();
    };
  }, []);

  const onClick = () => {
    if (typeof document === "undefined") return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const target = document.getElementById("hero-email");
    const form = document.getElementById("waitlist-form");
    (form ?? target)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
    target?.focus({ preventScroll: true });
  };

  return (
    <StickyMobileCTA
      hidden={hidden}
      microcopy={
        // fomo-spec §3 — sticky-CTA microcopy is two scarce-tier registers:
        // [counter compact] · [scarce-small] founding price locked.
        // Until LEU-43 ships the live counter, the first element is a static
        // placeholder using the same compact treatment.
        <>
          <span className="tier-scarce tier-scarce--small">
            <span className="tier-scarce__num">1,000</span>
            founding spots
          </span>
          <span className="scarcity-row__sep" aria-hidden="true">
            ·
          </span>
          <span className="tier-scarce tier-scarce--small tier-scarce--norule">
            founding price locked
          </span>
        </>
      }
      action={
        <Button size="md" pill onClick={onClick}>
          Join →
        </Button>
      }
    />
  );
}
