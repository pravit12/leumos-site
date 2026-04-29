import { useId } from "react";

interface KnotMarkProps {
  size?: number;
  glow?: boolean;
  decorative?: boolean;
  accessibleName?: string;
  className?: string;
}

export function KnotMark({
  size = 48,
  glow = false,
  decorative = true,
  accessibleName,
  className,
}: KnotMarkProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `knot-grad-${uid}`;
  const glowId = `knot-glow-${uid}`;

  const ariaProps = decorative
    ? ({ "aria-hidden": true, role: "presentation" } as const)
    : ({ role: "img", "aria-label": accessibleName ?? "Leumos knot mark" } as const);

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={
        glow
          ? {
              filter:
                "drop-shadow(0 0 18px rgba(255,122,26,0.55)) drop-shadow(0 0 26px rgba(31,77,255,0.35))",
            }
          : undefined
      }
      {...ariaProps}
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1F4DFF" />
          <stop offset="38%" stopColor="#6B2BD9" />
          <stop offset="65%" stopColor="#D6238C" />
          <stop offset="100%" stopColor="#FF7A1A" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter={glow ? `url(#${glowId})` : undefined}
        stroke={`url(#${gradId})`}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      >
        <path d="M16 32 C 16 18, 32 18, 32 32 C 32 46, 48 46, 48 32 C 48 18, 32 18, 32 32 C 32 46, 16 46, 16 32 Z" />
      </g>
    </svg>
  );
}
