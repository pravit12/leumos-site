import {
  readFoundingCount,
  buildSimulatedCount,
  type FoundingCount,
} from "@/lib/founding-count/source";
import { FoundingCounterClient } from "./FoundingCounterClient";

export type FoundingCounterVariant = "inline" | "pill" | "compact";

interface FoundingCounterProps {
  variant?: FoundingCounterVariant;
  /**
   * Force a simulated `remaining` value. Used by the `?simulateRemaining=N`
   * dev/preview affordance so QA can verify critical (=100) and full (=0)
   * states without touching the KV.
   */
  simulateRemaining?: number;
  /** Extra class names appended to the root container. */
  className?: string;
  /** Optional id for screen-reader linking. */
  id?: string;
  /**
   * When true, suppress live-region announcements. Use when multiple
   * counters render on the same page (we keep one announcing). Default
   * is the first instance: caller controls quiet for the rest.
   */
  quiet?: boolean;
}

/**
 * Server entry. Resolves the count at request time so the SSR markup
 * is correct before hydration; the client child takes over for the
 * 60s SWR-style revalidation + on-focus refresh.
 */
export async function FoundingCounter({
  variant = "inline",
  simulateRemaining,
  className,
  id,
  quiet,
}: FoundingCounterProps) {
  const initial: FoundingCount =
    typeof simulateRemaining === "number"
      ? buildSimulatedCount(simulateRemaining)
      : await readFoundingCount();

  return (
    <FoundingCounterClient
      variant={variant}
      initial={initial}
      simulated={typeof simulateRemaining === "number"}
      className={className}
      id={id}
      quiet={quiet}
    />
  );
}
