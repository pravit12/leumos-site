// Thin wrapper that hands a successful sign-up off to the cinematic
// `RankFrame`. The legacy queue-position card was replaced in LEU-46;
// the `[data-waitlist-success]` hook (consumed by the sticky CTA) now
// lives on the section element inside `<RankFrame>`.

import { RankFrame } from "./RankFrame";

export type WaitlistSuccessProps = {
  queuePosition: number;
  referralCode: string;
  shareUrl: string;
  rankToken: string;
  rankTotal: number;
  alreadyOnList: boolean;
  isEditor?: boolean;
};

export function WaitlistSuccess(props: WaitlistSuccessProps) {
  return (
    <RankFrame
      rank={props.queuePosition}
      total={props.rankTotal}
      referralCode={props.referralCode}
      shareUrl={props.shareUrl}
      rankToken={props.rankToken}
      alreadyOnList={props.alreadyOnList}
      isEditor={props.isEditor}
    />
  );
}
