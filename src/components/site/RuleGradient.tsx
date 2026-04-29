import { cn } from "@/components/ui/cn";

interface RuleGradientProps {
  width?: "full" | "short";
  direction?: "right" | "center";
  className?: string;
}

export function RuleGradient({
  width = "full",
  direction = "center",
  className,
}: RuleGradientProps) {
  const gradient =
    direction === "center"
      ? "linear-gradient(90deg, transparent, var(--signal-500), transparent)"
      : "linear-gradient(90deg, var(--signal-500), transparent)";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-px",
        width === "full" ? "w-full" : "w-8",
        className
      )}
      style={{ background: gradient }}
    />
  );
}
