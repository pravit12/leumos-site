"use client";

import {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "./cn";

type RevealMode = "up" | "fade" | "stagger";

interface ScrollRevealProps {
  children: ReactNode;
  /** "up" translates 24px and fades; "fade" only fades; "stagger" delays direct children. */
  mode?: RevealMode;
  /** Render as a different element (default: section). */
  as?: ElementType;
  /** Stagger gap (ms) between direct children when mode="stagger". */
  staggerMs?: number;
  /** IntersectionObserver threshold. */
  threshold?: number;
  /** IntersectionObserver root margin. Default per §8.2. */
  rootMargin?: string;
  className?: string;
}

export function ScrollReveal({
  children,
  mode = "up",
  as,
  staggerMs = 80,
  threshold = 0.1,
  rootMargin = "0px 0px -10%",
  className,
}: ScrollRevealProps) {
  const Tag = (as ?? "section") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Tag
      ref={ref}
      data-reveal={mode}
      data-revealed={revealed || undefined}
      style={
        mode === "stagger"
          ? ({ "--stagger-ms": `${staggerMs}ms` } as React.CSSProperties)
          : undefined
      }
      className={cn("scroll-reveal", `scroll-reveal--${mode}`, className)}
    >
      {children}
    </Tag>
  );
}
