import { cn } from "@/components/ui/cn";

interface Shot {
  alt: string;
  caption: string;
  /** Triggers the saturation transition on viewport entry, see spec §6.5. */
  gradeBleed?: boolean;
}

interface ShotStripProps {
  shots: Shot[];
  ariaLabel?: string;
  className?: string;
}

/**
 * Native overflow scroll with snap. No JS carousel. Each thumbnail is a placeholder
 * gradient block until graded stills land (per §13.4 of the home-page spec).
 */
export function ShotStrip({ shots, ariaLabel, className }: ShotStripProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel ?? "A pass of graded shots"}
      className={cn("shot-strip-wrap", className)}
    >
      <ul className="shot-strip-track" role="list">
        {shots.map((shot, i) => (
          <li
            key={i}
            className="shot-cell"
            data-grade-bleed={shot.gradeBleed ? "true" : undefined}
          >
            <div
              className="shot-thumb"
              role="img"
              aria-label={shot.alt}
              data-graded={shot.gradeBleed ? "true" : undefined}
            />
            <p className="shot-caption">{shot.caption}</p>
          </li>
        ))}
      </ul>
      <p className="shot-strip-microcopy" aria-hidden="true">
        drag or scroll →
      </p>
    </div>
  );
}
