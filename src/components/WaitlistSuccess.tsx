"use client";

import { useState } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";

export function WaitlistSuccess(props: {
  queuePosition: number;
  referralCode: string;
  shareUrl: string;
  alreadyOnList: boolean;
}) {
  const { queuePosition, referralCode, shareUrl, alreadyOnList } = props;
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  async function copy(value: string, kind: "link" | "code") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      track(ANALYTICS_EVENTS.WAITLIST_REFERRAL_COPY, { kind });
      setTimeout(() => setCopied((current) => (current === kind ? null : current)), 1800);
    } catch {
      /* clipboard blocked — user can long-press to copy */
    }
  }

  async function share() {
    track(ANALYTICS_EVENTS.WAITLIST_REFERRAL_SHARE, { referralCode });
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Leumos AI",
          text: "I just joined the Leumos AI waitlist — thought you might want in too.",
          url: shareUrl,
        });
        return;
      } catch {
        /* share cancelled — fall through to copy */
      }
    }
    await copy(shareUrl, "link");
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full flex-col gap-6 rounded-xl border border-lumos-200 bg-lumos-50 p-6 sm:p-8"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lumos-700">
          {alreadyOnList ? "Already on the list" : "You're in"}
        </p>
        <p className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">
          You&apos;re #{queuePosition.toLocaleString()} in line.
        </p>
        <p className="mt-3 text-base text-ink-500">
          {alreadyOnList
            ? "We already had your email on file — your spot is saved. Confirmation is on its way again."
            : "Confirmation just hit your inbox. Move up the line by sharing your code: every confirmed sign-up lifts you ~10 spots."}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400">
            Your referral code
          </p>
          <p className="mt-1 font-mono text-xl text-ink-900">{referralCode}</p>
        </div>
        <button
          type="button"
          onClick={() => copy(referralCode, "code")}
          className="inline-flex items-center justify-center rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-300 hover:bg-ink-50"
        >
          {copied === "code" ? "Copied" : "Copy code"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400">
          Share your link
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={shareUrl}
            aria-label="Your referral share link"
            className="w-full flex-1 rounded-md border border-ink-200 bg-white px-3 py-2 font-mono text-sm text-ink-700"
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => copy(shareUrl, "link")}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-300 hover:bg-ink-50"
            >
              {copied === "link" ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-lumos-50 hover:bg-ink-800"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
