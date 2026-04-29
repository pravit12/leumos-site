import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

interface BeatRowProps {
  index: 1 | 2 | 3;
  headline: ReactNode;
  body: ReactNode;
  className?: string;
}

export function BeatRow({ index, headline, body, className }: BeatRowProps) {
  const numeral = String(index).padStart(2, "0");
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 pl-8",
        "before:absolute before:left-0 before:top-[10px] before:h-px before:w-6",
        "before:bg-[linear-gradient(90deg,var(--signal-500),transparent)]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="font-mono text-sm tracking-wider text-signal-300"
      >
        {numeral}
      </span>
      <h4>{headline}</h4>
      <p className="text-stage-200">{body}</p>
    </div>
  );
}
