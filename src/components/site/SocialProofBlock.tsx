"use client";

import { useEffect, useState } from "react";
import {
  AVATAR_PALETTE,
  avatarColorFor,
  type SocialProofPayload,
} from "@/lib/social-proof";

interface SocialProofBlockProps {
  /**
   * Optional initial payload (e.g. injected from a server component).
   * If omitted the block fetches /api/waitlist/social-proof on mount and
   * renders nothing until the response resolves — never a skeleton, per spec.
   */
  initial?: SocialProofPayload;
  /** Visual variant. `compact` is used in the Act V CTA card footer. */
  variant?: "default" | "compact";
  className?: string;
}

const ENDPOINT = "/api/waitlist/social-proof";
const MAX_AVATARS = 3;
const MIN_AVATAR_THRESHOLD = 5;

export function SocialProofBlock({
  initial,
  variant = "default",
  className,
}: SocialProofBlockProps) {
  const [data, setData] = useState<SocialProofPayload | null>(initial ?? null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    fetch(ENDPOINT, { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((payload: SocialProofPayload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  // Honest-data guard: never render skeleton, never invent counts.
  if (error || !data) return null;
  if (!Number.isFinite(data.recentCount) || data.recentCount <= 0) return null;

  const showAvatars = data.recentCount >= MIN_AVATAR_THRESHOLD;
  const avatarSlots = showAvatars
    ? data.anonymousInitials.slice(0, MAX_AVATARS)
    : [];
  const overflow = showAvatars
    ? Math.max(0, data.recentCount - avatarSlots.length)
    : 0;
  const blockClass = [
    "social-proof",
    variant === "compact" ? "social-proof--compact" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={blockClass}
      role="region"
      aria-label="Recent waitlist activity"
      aria-live="off"
      data-variant={variant}
    >
      {showAvatars && avatarSlots.length > 0 ? (
        <ul className="social-proof__avatars" aria-hidden="true">
          {avatarSlots.map((initials, index) => (
            <li
              key={`${initials}-${index}`}
              className="social-proof__avatar"
              style={{
                background: avatarColorFor(initials),
                zIndex: avatarSlots.length - index,
              }}
            >
              <span className="social-proof__avatar-text">{initials}</span>
            </li>
          ))}
          {overflow > 0 ? (
            <li
              className="social-proof__avatar social-proof__overflow"
              style={{ zIndex: 0 }}
            >
              <span className="social-proof__avatar-text">
                +{compactCount(overflow)}
              </span>
            </li>
          ) : null}
        </ul>
      ) : null}
      <p className="social-proof__line">
        <span className="social-proof__count">
          {compactCount(data.recentCount)}
        </span>{" "}
        <span className="social-proof__label">
          joined in the last 7 days
        </span>
      </p>
      {data.namedQuote ? (
        <figure className="social-proof__quote">
          <blockquote className="social-proof__quote-body">
            “{data.namedQuote.body}”
          </blockquote>
          <figcaption className="social-proof__quote-attr">
            <span className="social-proof__quote-name">
              {data.namedQuote.name}
            </span>
            <span aria-hidden="true"> · </span>
            <span className="social-proof__quote-role">
              {data.namedQuote.role}
            </span>
          </figcaption>
        </figure>
      ) : null}
    </section>
  );
}

function compactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(n / 1000)}k`;
}

// Re-export the palette so downstream tooling can render the same colors
// without importing the lib (e.g. Storybook chrome). Keep it small.
export const __AVATAR_PALETTE__ = AVATAR_PALETTE;
