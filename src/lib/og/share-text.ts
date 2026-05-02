// Share-mechanic copy from LEU-40 §1.E.3 / §2.A.
// Kept tight: ContentGrowth owns the wording; engineers paste it verbatim.

export const RANK_FRAME_COPY = {
  headline: "You're on the list.",
  // <25 words above the share UI per LEU-40 §1.E.1 spec target.
  body: "Confirmation just hit your inbox. Move up the line — every editor who confirms from your link bumps your rank.",
  alreadyOnList:
    "We already had your email on file. Your spot is saved, and a fresh confirmation is on its way.",
  shareAskBody:
    "Every editor who confirms from your link bumps your rank. No quotas, no tiers.",
  shareDisclaimer:
    "No bait. Your rank moves; theirs locks if the cap isn't hit yet.",
  saveButton: "Save to camera roll",
  shareXButton: "Share to X",
  copyLinkButton: "Copy referral link",
  copiedToast: "Copied",
  movesPerReferral: "+1 spot per confirmed friend",
  eyebrow: "FOUNDING WAITLIST · RANK",
  totalLabel: "of 1,000",
} as const;

const X_BASE =
  "Got my founding spot on Leumos — AI scene-cut and shot-matching, browser-native. First 1,000 lock $9 Creator / $19 Pro.";

const X_EDITOR =
  "Joined Leumos's founding list — auto scene-cut + Match-All in the browser, no DaVinci required.";

export function shareTextForX(args: {
  shareUrl: string;
  isEditor?: boolean;
}): string {
  const lead = args.isEditor ? X_EDITOR : X_BASE;
  return `${lead} ${args.shareUrl}`;
}

export function tweetIntentUrl(args: {
  shareUrl: string;
  isEditor?: boolean;
}): string {
  const text = shareTextForX(args);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/** Verbose aria-label for the cinema `<figure role="img">`. */
export function ariaLabelForRank(rank: number, total: number): string {
  return `Cinematic frame: rank ${rank.toLocaleString()} of ${total.toLocaleString()} founding waitlist members.`;
}
