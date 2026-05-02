"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button, StickyMobileCTA } from "@/components/ui";

interface WaitlistStickyCTAProps {
  /**
   * Optional node placed to the left of the microcopy + action —
   * the FoundingCounter `compact` variant drops in here (LEU-43).
   */
  leading?: ReactNode;
}

/**
 * Wraps StickyMobileCTA with a runtime listener that observes when any
 * waitlist form (data-waitlist-form) has focus and hides the bar.
 *
 * Also hides when a SuccessState is present (data-waitlist-success).
 * SuccessState wiring lives in LEU-4; this component just provides the contract.
 */
export function WaitlistStickyCTA({ leading }: WaitlistStickyCTAProps = {}) {
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
      leading={leading}
      microcopy="Cinematic color, AI-assisted. First 1,000 free."
      action={
        <Button size="md" pill onClick={onClick}>
          Join →
        </Button>
      }
    />
  );
}
