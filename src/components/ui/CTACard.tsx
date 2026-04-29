import type { ReactNode } from "react";
import { cn } from "./cn";

interface CTACardProps {
  /** Section label rendered as a small uppercase eyebrow above the heading. */
  eyebrow?: string;
  /** Card heading — rendered as a real <h3>. */
  heading: string;
  /** Body copy under the heading. */
  body?: ReactNode;
  /** Action area (Button, form, link) — pass children for full control. */
  children: ReactNode;
  /** ARIA label for the card; defaults to the heading. */
  ariaLabel?: string;
  className?: string;
}

export function CTACard({
  eyebrow,
  heading,
  body,
  children,
  ariaLabel,
  className,
}: CTACardProps) {
  return (
    <aside
      aria-label={ariaLabel ?? heading}
      className={cn(
        "relative overflow-hidden",
        "rounded-lg border border-[var(--border-strong)]",
        "p-8 md:p-12",
        "transition-shadow duration-slow ease-cinematic",
        "focus-within:shadow-glow-warm",
        className
      )}
      style={{
        background:
          "linear-gradient(120deg, var(--stage-700), var(--surface-2))",
      }}
    >
      <div className="relative z-10 flex flex-col gap-4 md:max-w-prose">
        {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
        <h3>{heading}</h3>
        {body ? <p className="text-stage-200">{body}</p> : null}
        <div className="mt-2">{children}</div>
      </div>
    </aside>
  );
}
