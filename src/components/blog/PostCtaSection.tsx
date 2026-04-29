import { WaitlistForm } from "@/components/WaitlistForm";

type CtaCopy = {
  eyebrow: string;
  heading: string;
  body: string;
};

const CTA_VARIANTS: Record<string, CtaCopy> = {
  default: {
    eyebrow: "Join the waitlist",
    heading: "Want more like this?",
    body: "We send one email when access opens. No drip sequence, no list-sharing.",
  },
  filmmaking: {
    eyebrow: "Built for filmmakers",
    heading: "Get the full toolkit when we launch",
    body: "Leumos is a workspace for the post-production craft. Drop your email and we'll let you know when early access opens.",
  },
  tutorial: {
    eyebrow: "Get the next guide",
    heading: "More cornerstone guides on the way",
    body: "Sign up to get the next one in your inbox the day it goes live.",
  },
};

export function PostCtaSection({
  variant,
  formId,
}: {
  variant?: string;
  formId?: string;
}) {
  const copy = CTA_VARIANTS[variant ?? "default"] ?? CTA_VARIANTS.default;
  return (
    <aside
      aria-labelledby={`${formId ?? "post-waitlist"}-heading`}
      className="mt-16 rounded-2xl border border-ink-100 bg-lumos-50/60 p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-lumos-700">
        {copy.eyebrow}
      </p>
      <h2
        id={`${formId ?? "post-waitlist"}-heading`}
        className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl"
      >
        {copy.heading}
      </h2>
      <p className="mt-2 max-w-prose text-base text-ink-500">{copy.body}</p>
      <div className="mt-6">
        <WaitlistForm formId={formId ?? "post-waitlist"} />
      </div>
    </aside>
  );
}
