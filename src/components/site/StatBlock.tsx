"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

interface StatBlockProps {
  /** e.g. "12", "8s", "3" — the leading integer is animated when possible. */
  numeral: string;
  label: string;
  context: string;
  /** When true, numeral text gets the brand gradient fill. */
  primary?: boolean;
  /** Single-phrase reading for the entire stat (numeral + label + context). */
  ariaLabel: string;
  className?: string;
}

function parseLeadingInteger(value: string): { n: number; suffix: string } | null {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  return { n, suffix: match[2] ?? "" };
}

export function StatBlock({
  numeral,
  label,
  context,
  primary = false,
  ariaLabel,
  className,
}: StatBlockProps) {
  const [display, setDisplay] = useState<string>(numeral);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const parsed = parseLeadingInteger(numeral);
    if (!parsed) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(numeral);
      return;
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setDisplay(numeral);
      return;
    }

    let started = false;
    let raf = 0;
    const start = (timestamp: number) => {
      const duration = 800;
      const tick = (now: number) => {
        const t = Math.min(1, (now - timestamp) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = Math.round(parsed.n * eased);
        setDisplay(`${v}${parsed.suffix}`);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    setDisplay(`0${parsed.suffix}`);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            start(performance.now());
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [numeral]);

  return (
    <div
      ref={containerRef}
      role="listitem"
      aria-label={ariaLabel}
      className={cn("stat-block", className)}
    >
      <p
        aria-hidden="true"
        className={cn("stat-numeral", primary && "stat-numeral--primary")}
      >
        {display}
      </p>
      <p className="stat-label">{label}</p>
      <p className="stat-context">{context}</p>
    </div>
  );
}
