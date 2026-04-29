"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

interface StickyMobileCTAProps {
  microcopy: ReactNode;
  /** Action node — typically a <Button> with an onClick that focuses the inline form. */
  action: ReactNode;
  /** Visually hide on viewports above 900px. Default true. */
  mobileOnly?: boolean;
  /** Extra class names for the wrapper. */
  className?: string;
  /** When true, the bar is hidden (e.g. inline form is focused, or success rendered). */
  hidden?: boolean;
}

export function StickyMobileCTA({
  microcopy,
  action,
  mobileOnly = true,
  className,
  hidden = false,
}: StickyMobileCTAProps) {
  return (
    <aside
      role="complementary"
      aria-label="Waitlist call to action"
      aria-hidden={hidden || undefined}
      data-hidden={hidden || undefined}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50",
        "border-t border-[var(--border-strong)]",
        "px-4 py-3",
        "transition-[opacity,transform] duration-base ease-standard",
        "data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0 data-[hidden=true]:translate-y-2",
        mobileOnly && "min-[901px]:hidden",
        className
      )}
      style={{
        backgroundColor: "rgba(13,17,25,0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto flex max-w-container items-center justify-between gap-4">
        <p className="text-xs leading-tight text-stage-300">{microcopy}</p>
        <div className="shrink-0">{action}</div>
      </div>
    </aside>
  );
}
