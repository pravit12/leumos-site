// Event-name registry. Sent to Plausible (loaded by `<PlausibleScript />` in
// production) via `track()` below. In dev/preview, `track()` logs to console
// and no-ops because the Plausible script is not loaded.

export const ANALYTICS_EVENTS = {
  WAITLIST_FORM_VIEW: "waitlist_form_view",
  WAITLIST_FORM_SUBMIT: "waitlist_form_submit",
  WAITLIST_SIGNUP_SUCCESS: "waitlist_signup_success",
  WAITLIST_SIGNUP_ERROR: "waitlist_signup_error",
  WAITLIST_REFERRAL_SHARE: "waitlist_referral_share",
  WAITLIST_REFERRAL_COPY: "waitlist_referral_copy",
  BLOG_READ: "blog_read",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type Plausible = (event: string, opts?: { props?: Record<string, unknown> }) => void;

declare global {
  interface Window {
    plausible?: Plausible;
  }
}

export function track(
  name: AnalyticsEventName,
  props?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.plausible === "function") {
    window.plausible(name, props ? { props } : undefined);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(`[analytics:stub] ${name}`, props ?? {});
  }
}
