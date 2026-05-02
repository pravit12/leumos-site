"use client";

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, EmailField } from "@/components/ui";
import { KnotMark } from "./KnotMark";

interface HeroProps {
  eyebrow: string;
  /** Headline split into a leading clause and an italic gradient pivot. */
  headline: { lead: string; pivot: string };
  lede: string;
  ctaLabel: string;
  microcopy: string;
  trust: string;
  formId?: string;
  /**
   * Optional secondary-line node rendered between the headline and the lede.
   * Used by the home page to inject the inline FoundingCounter (LEU-43).
   */
  secondaryRow?: ReactNode;
}

export function Hero({
  eyebrow,
  headline,
  lede,
  ctaLabel,
  microcopy,
  trust,
  formId = "waitlist-form",
  secondaryRow,
}: HeroProps) {
  const figureRef = useRef<HTMLElement | null>(null);
  const seamRef = useRef<HTMLDivElement | null>(null);
  const [seamPercent, setSeamPercent] = useState<number>(50);
  const draggingRef = useRef(false);

  const updateSeam = useCallback((clientX: number) => {
    const el = figureRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSeamPercent(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      updateSeam(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [updateSeam]);

  // One-time intro sweep on first viewport entry — only when motion is allowed.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    const el = figureRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let ran = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || ran) continue;
          ran = true;
          const start = performance.now();
          const duration = 1600;
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // ease-cinematic-ish path: 0 → 100 → settle to 50 in second half
            const eased = t < 0.65 ? t / 0.65 : 1 - (t - 0.65) / 0.35;
            const target = t < 0.65 ? 5 + eased * 90 : 95 - eased * 45;
            setSeamPercent(target);
            if (t < 1) requestAnimationFrame(step);
            else setSeamPercent(50);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Form internals owned by LEU-4. Keep submit non-destructive in v1.
    e.preventDefault();
  };

  const onPointerDownHandle = (e: React.PointerEvent<HTMLButtonElement>) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateSeam(e.clientX);
  };

  const onKeyDownHandle = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSeamPercent((p) => Math.max(0, p - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSeamPercent((p) => Math.min(100, p + 5));
    }
  };

  return (
    <section className="hero" id="act-iii" aria-labelledby="hero-h">
      <div className="hero__container">
        <div className="hero__grid">
          <div className="hero__copy">
            <div className="hero__knot-decor">
              <KnotMark size={48} glow className="hero__knot" />
              <p className="text-eyebrow hero__eyebrow">{eyebrow}</p>
            </div>
            <h1 id="hero-h" className="hero__headline">
              {headline.lead}{" "}
              <span className="text-pivot hero__pivot">{headline.pivot}</span>
            </h1>
            {secondaryRow}
            <p className="hero__lede">{lede}</p>

            <form
              id={formId}
              className="hero__form"
              data-waitlist-form
              data-waitlist-form-primary
              aria-label="Join the waitlist"
              noValidate
              onSubmit={onSubmit}
            >
              <EmailField
                id="hero-email"
                label="Email address"
                helpText={microcopy}
                placeholder="you@studio.com"
                layout="inline"
                pill
                required
                className="hero__email-field"
              />
              <Button type="submit" size="lg" pill>
                {ctaLabel}
                <span aria-hidden="true" className="hero__cta-arrow">
                  →
                </span>
              </Button>
              <p className="hero__trust text-small">{trust}</p>
            </form>
          </div>

          <figure
            ref={figureRef}
            className="hero__frame"
            aria-label="Before and after — the same frame, ungraded on the left, cinematically graded on the right"
          >
            <div className="hero__frame-before">
              <span className="hero__frame-pill hero__frame-pill--left">
                before · log
              </span>
            </div>
            <div
              className="hero__frame-after"
              style={{
                clipPath: `polygon(${seamPercent}% 0, 100% 0, 100% 100%, ${seamPercent}% 100%)`,
              }}
            >
              <span className="hero__frame-pill hero__frame-pill--right">
                after · graded
              </span>
            </div>
            <div
              ref={seamRef}
              className="hero__frame-seam"
              aria-hidden="true"
              style={{ left: `${seamPercent}%` }}
            />
            <button
              type="button"
              className="hero__frame-handle"
              aria-label="Drag to compare before and after"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(seamPercent)}
              role="slider"
              onPointerDown={onPointerDownHandle}
              onKeyDown={onKeyDownHandle}
              style={{ left: `${seamPercent}%` }}
            >
              <span aria-hidden="true">⇆</span>
            </button>
          </figure>
        </div>
      </div>
    </section>
  );
}
