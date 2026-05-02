"use client";

import { useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";
import {
  paletteForReferralCode,
  paletteToCssGradient,
  seedFromReferralCode,
} from "@/lib/og/seed";
import {
  RANK_FRAME_COPY,
  ariaLabelForRank,
  tweetIntentUrl,
} from "@/lib/og/share-text";

export type RankFrameProps = {
  rank: number;
  total: number;
  referralCode: string;
  shareUrl: string;
  rankToken: string;
  alreadyOnList: boolean;
  /** When set, the role drives the X copy variant (editor vs default). */
  isEditor?: boolean;
};

type ToastKind = "copy" | "save" | null;

export function RankFrame(props: RankFrameProps) {
  const {
    rank,
    total,
    referralCode,
    shareUrl,
    rankToken,
    alreadyOnList,
    isEditor,
  } = props;

  const headingRef = useRef<HTMLHeadingElement>(null);
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [toast, setToast] = useState<ToastKind>(null);
  const seed = seedFromReferralCode(referralCode);
  const palette = paletteForReferralCode(referralCode);
  const gradient = paletteToCssGradient(palette);
  const verticalPng = `/api/og/rank?token=${encodeURIComponent(rankToken)}&size=vertical`;
  const ogPng = `/api/og/rank?token=${encodeURIComponent(rankToken)}&size=og`;
  const xIntent = tweetIntentUrl({ shareUrl, isEditor });

  // The success surface owns focus per brand-system §8.6.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // The backdrop here is a CSS gradient, so paint is synchronous — but we
  // also pre-fetch the OG PNG so "Save to camera roll" feels instant. The
  // share row is gated on this image's onLoad to honor the earn-the-share
  // rule (fomo-spec §4.4).
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBackdropLoaded(true);
    img.onerror = () => setBackdropLoaded(true); // do not strand the user
    img.src = verticalPng;
    track(ANALYTICS_EVENTS.WAITLIST_RANK_FRAME_VIEW, {
      rank,
      seedId: seed,
      alreadyOnList,
    });
  }, [verticalPng, rank, seed, alreadyOnList]);

  function showToast(kind: Exclude<ToastKind, null>) {
    setToast(kind);
    window.setTimeout(() => {
      setToast((current) => (current === kind ? null : current));
    }, 1600);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      track(ANALYTICS_EVENTS.WAITLIST_REFERRAL_COPY, { kind: "link" });
      showToast("copy");
    } catch {
      // clipboard blocked (Safari incognito, etc.) — fall through to a select.
      const node = document.querySelector<HTMLInputElement>(
        '[data-rank-frame-share-url]',
      );
      node?.select();
    }
  }

  async function saveToCameraRoll() {
    track(ANALYTICS_EVENTS.WAITLIST_REFERRAL_SHARE, {
      kind: "save",
      referralCode,
    });
    try {
      const res = await fetch(verticalPng);
      const blob = await res.blob();
      const file = new File([blob], `leumos-rank-${rank}.png`, {
        type: "image/png",
      });

      // Web Share API path — iOS Safari + Android Chrome.
      if (
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        typeof (navigator as Navigator & { canShare?: (data: ShareData) => boolean }).canShare === "function" &&
        (navigator as Navigator & { canShare: (data: ShareData) => boolean }).canShare({ files: [file] })
      ) {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          files: [file],
          title: "Leumos AI · Founding waitlist",
          text: ariaLabelForRank(rank, total),
        });
        showToast("save");
        return;
      }
    } catch {
      // Either fetch failed or the share was cancelled — fall through to download.
    }

    // Desktop fallback — synthesise an <a download>.
    const link = document.createElement("a");
    link.href = verticalPng;
    link.download = `leumos-rank-${rank}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("save");
  }

  function shareToX() {
    track(ANALYTICS_EVENTS.WAITLIST_REFERRAL_SHARE, {
      kind: "x",
      referralCode,
    });
    window.open(xIntent, "_blank", "noopener,noreferrer");
  }

  const eyebrow = RANK_FRAME_COPY.eyebrow;
  const body = alreadyOnList
    ? RANK_FRAME_COPY.alreadyOnList
    : RANK_FRAME_COPY.body;

  return (
    <section
      data-waitlist-success
      data-rank-frame
      aria-labelledby="rank-h"
      className="flex w-full flex-col gap-8 rounded-lg bg-stage-700 p-12 sm:p-16"
    >
      <figure
        role="img"
        aria-label={ariaLabelForRank(rank, total)}
        className="relative overflow-hidden rounded-xl shadow-lg"
        style={{
          aspectRatio: "16 / 9",
          background: gradient,
          boxShadow:
            "0 24px 48px -16px rgba(7,9,15,0.55), 0 0 80px -16px rgba(255,122,26,0.45)",
        }}
      >
        {/* The hidden <img> is the gate for the share buttons. Its src is the
            same PNG users will save, so by the time they tap the button the
            asset is already cached. next/image is intentionally not used —
            the route is a server-rendered PNG we want to expose unoptimised
            so it matches the OG/email embed byte-for-byte. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={verticalPng}
          alt=""
          aria-hidden="true"
          width={1}
          height={1}
          className="absolute h-px w-px opacity-0"
          onLoad={() => setBackdropLoaded(true)}
          onError={() => setBackdropLoaded(true)}
        />

        {/* Letterbox bars — 12% top + bottom */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 bg-stage-900"
          style={{ height: "12%" }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 bg-stage-900"
          style={{ height: "12%" }}
        />

        {/* Knot mark — top-right of the frame, 24px inset, glow-warm */}
        <span
          aria-hidden="true"
          className="absolute right-6 top-[14%] flex h-12 w-12 items-center justify-center rounded-pill bg-stage-900/40 shadow-[0_0_80px_-16px_rgba(255,122,26,0.45)]"
        >
          <span className="text-xl font-semibold text-signal-300">L</span>
        </span>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-eyebrow text-signal-300">{eyebrow}</span>
          <span
            className="text-pivot font-display text-[clamp(72px,8vw,128px)] font-semibold leading-none"
            style={{ fontStyle: "italic" }}
          >
            #{rank.toLocaleString()}
          </span>
          <span className="font-mono text-base text-stage-300 sm:text-lg">
            {RANK_FRAME_COPY.totalLabel.replace("1,000", total.toLocaleString())}
          </span>
        </div>
      </figure>

      <header className="flex flex-col gap-3">
        <h2
          id="rank-h"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-stage-50 outline-none"
        >
          {RANK_FRAME_COPY.headline}
        </h2>
        <p className="max-w-[36rem] text-lede text-stage-200">{body}</p>
      </header>

      <aside className="flex flex-col gap-4 rounded-md bg-stage-600 p-6">
        <p className="text-small">
          {RANK_FRAME_COPY.movesPerReferral}.{" "}
          <span className="text-stage-300">
            {RANK_FRAME_COPY.shareDisclaimer}
          </span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={saveToCameraRoll}
            disabled={!backdropLoaded}
            className="inline-flex items-center justify-center rounded-sm border border-[var(--border-strong)] bg-transparent px-4 py-3 text-base font-semibold text-stage-50 transition hover:border-signal-300 hover:text-signal-300 disabled:cursor-not-allowed disabled:opacity-40"
            aria-describedby="rank-frame-share-help"
          >
            {RANK_FRAME_COPY.saveButton}
          </button>
          <button
            type="button"
            onClick={shareToX}
            disabled={!backdropLoaded}
            className="inline-flex items-center justify-center rounded-sm border border-[var(--border-strong)] bg-transparent px-4 py-3 text-base font-semibold text-stage-50 transition hover:border-signal-300 hover:text-signal-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {RANK_FRAME_COPY.shareXButton}
          </button>
          <button
            type="button"
            onClick={copyLink}
            disabled={!backdropLoaded}
            className="inline-flex items-center justify-center rounded-sm border border-[var(--border-strong)] bg-transparent px-4 py-3 text-base font-semibold text-stage-50 transition hover:border-signal-300 hover:text-signal-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {RANK_FRAME_COPY.copyLinkButton}
          </button>
        </div>
        <p id="rank-frame-share-help" className="sr-only">
          Share buttons unlock once the cinema frame finishes loading.
        </p>
        <div className="flex items-center gap-2">
          <code className="rounded-xs bg-stage-800 px-3 py-2 font-mono text-sm text-stage-50">
            {referralCode}
          </code>
          <input
            type="text"
            data-rank-frame-share-url
            readOnly
            value={shareUrl}
            aria-label="Your referral share link"
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 truncate rounded-sm border border-[var(--border)] bg-stage-800 px-3 py-2 font-mono text-sm text-stage-200"
          />
        </div>
        {/* Provide the OG-format URL too so X / LI scrapers pick it up if a
            user pastes the page URL with their referral code. */}
        <link
          rel="preload"
          as="image"
          href={ogPng}
          // @ts-expect-error - non-standard but accepted by browsers
          fetchpriority="high"
        />
      </aside>

      {/* Toast — role=status, no focus shift, auto-dismiss after 1.6s. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 transition-opacity"
        style={{ opacity: toast ? 1 : 0 }}
      >
        {toast && (
          <span className="inline-flex items-center gap-2 rounded-pill bg-stage-900 px-4 py-2 text-small text-stage-50 shadow-md">
            {toast === "copy"
              ? `${RANK_FRAME_COPY.copiedToast} · ${referralCode}`
              : "Saved"}
          </span>
        )}
      </div>
    </section>
  );
}
