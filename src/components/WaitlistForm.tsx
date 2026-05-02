"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ROLE_OPTIONS, USE_CASE_OPTIONS, type SignupResponse } from "@/lib/waitlist/schema";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/events";
import { captureAttributionFromLocation, readStoredAttribution } from "@/lib/waitlist/utm";
import { WaitlistSuccess } from "./WaitlistSuccess";

type FormStatus = "idle" | "submitting" | "success" | "error";

const ROLE_LABELS: Record<(typeof ROLE_OPTIONS)[number], string> = {
  founder: "Founder / CEO",
  engineer: "Engineer",
  product: "Product",
  design: "Design",
  operations: "Operations",
  investor: "Investor",
  other: "Other",
};

const USE_CASE_LABELS: Record<(typeof USE_CASE_OPTIONS)[number], string> = {
  personal: "Personal",
  team: "Small team",
  startup: "Startup",
  enterprise: "Enterprise",
  research: "Research",
  other: "Other",
};

export function WaitlistForm({ formId = "waitlist-form" }: { formId?: string }) {
  const emailId = useId();
  const nameId = useId();
  const companyId = useId();
  const roleId = useId();
  const useCaseId = useId();

  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const [status, setStatus] = useState<FormStatus>("idle");
  const [showOptional, setShowOptional] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<{
    queuePosition: number;
    referralCode: string;
    shareUrl: string;
    alreadyOnList: boolean;
    rankToken: string;
    rankTotal: number;
    isEditor: boolean;
  } | null>(null);

  useEffect(() => {
    track(ANALYTICS_EVENTS.WAITLIST_FORM_VIEW);
    if (typeof window !== "undefined") {
      try {
        captureAttributionFromLocation(window.location);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  if (status === "success" && success) {
    return (
      <WaitlistSuccess
        queuePosition={success.queuePosition}
        referralCode={success.referralCode}
        shareUrl={success.shareUrl}
        rankToken={success.rankToken}
        rankTotal={success.rankTotal}
        alreadyOnList={success.alreadyOnList}
        isEditor={success.isEditor}
      />
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setError(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);

    const attribution = readStoredAttribution();
    const payload = {
      email: String(data.get("email") ?? "").trim(),
      name: String(data.get("name") ?? "").trim() || undefined,
      company: String(data.get("company") ?? "").trim() || undefined,
      role: String(data.get("role") ?? "") || undefined,
      useCase: String(data.get("useCase") ?? "") || undefined,
      referredBy: attribution.ref,
      website: String(data.get("website") ?? ""),
      utm: attribution.utm,
    };

    track(ANALYTICS_EVENTS.WAITLIST_FORM_SUBMIT, {
      hasName: Boolean(payload.name),
      hasCompany: Boolean(payload.company),
      hasRole: Boolean(payload.role),
      hasUseCase: Boolean(payload.useCase),
      utmSource: payload.utm?.source ?? null,
      referredBy: payload.referredBy ?? null,
    });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as SignupResponse;
      if (!json.ok) {
        setStatus("error");
        setError(json.error);
        if (json.fieldErrors) setFieldErrors(json.fieldErrors);
        track(ANALYTICS_EVENTS.WAITLIST_SIGNUP_ERROR, { status: res.status });
        return;
      }
      setSuccess({
        queuePosition: json.queuePosition,
        referralCode: json.referralCode,
        shareUrl: json.shareUrl,
        alreadyOnList: json.alreadyOnList,
        rankToken: json.rankToken,
        rankTotal: json.rankTotal,
        // LEU-40 §1.E.3 carves out an "editor" share-text variant. The
        // current role schema doesn't expose that role yet; default to
        // the broad copy and let the editor-role rollout flip the bit.
        isEditor: false,
      });
      setStatus("success");
      track(ANALYTICS_EVENTS.WAITLIST_SIGNUP_SUCCESS, {
        queuePosition: json.queuePosition,
        alreadyOnList: json.alreadyOnList,
      });
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      track(ANALYTICS_EVENTS.WAITLIST_SIGNUP_ERROR, { kind: "network" });
    }
  }

  const submitting = status === "submitting";

  return (
    <form
      id={formId}
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={error ? `${formId}-error` : undefined}
      className="flex w-full flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={emailId} className="text-sm font-medium text-ink-700">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          placeholder="you@work.com"
          aria-invalid={Boolean(fieldErrors.email)}
          className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-300 focus:border-lumos-500 focus:outline-none focus:ring-2 focus:ring-lumos-300"
        />
        {fieldErrors.email && (
          <p className="text-sm text-lumos-700">{fieldErrors.email[0]}</p>
        )}
      </div>

      {showOptional ? (
        <div className="flex flex-col gap-4 border-t border-ink-100 pt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={nameId} className="text-sm font-medium text-ink-700">
              Name <span className="text-ink-400">(optional)</span>
            </label>
            <input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={120}
              className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-300 focus:border-lumos-500 focus:outline-none focus:ring-2 focus:ring-lumos-300"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={companyId} className="text-sm font-medium text-ink-700">
              Company <span className="text-ink-400">(optional)</span>
            </label>
            <input
              id={companyId}
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={160}
              className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-300 focus:border-lumos-500 focus:outline-none focus:ring-2 focus:ring-lumos-300"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor={roleId} className="text-sm font-medium text-ink-700">
                Role <span className="text-ink-400">(optional)</span>
              </label>
              <select
                id={roleId}
                name="role"
                defaultValue=""
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 focus:border-lumos-500 focus:outline-none focus:ring-2 focus:ring-lumos-300"
              >
                <option value="">Select a role…</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={useCaseId} className="text-sm font-medium text-ink-700">
                Use case <span className="text-ink-400">(optional)</span>
              </label>
              <select
                id={useCaseId}
                name="useCase"
                defaultValue=""
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-base text-ink-900 focus:border-lumos-500 focus:outline-none focus:ring-2 focus:ring-lumos-300"
              >
                <option value="">Select a use case…</option>
                {USE_CASE_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {USE_CASE_LABELS[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowOptional(true)}
          className="self-start text-sm text-ink-500 underline-offset-2 hover:text-ink-700 hover:underline"
        >
          Add name &amp; company (optional)
        </button>
      )}

      {/* Honeypot — hidden from humans, visible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${formId}-website`}>Leave this field empty</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-ink-900 px-5 py-3 text-base font-semibold text-lumos-50 shadow-sm transition hover:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-lumos-400 focus:ring-offset-2 focus:ring-offset-lumos-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Joining…" : "Join the waitlist"}
      </button>

      <p className="text-xs text-ink-400">
        We&apos;ll email you once when access opens. No spam, no list-sharing.
      </p>

      {error && (
        <p
          id={`${formId}-error`}
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-lumos-300 bg-lumos-50 px-3 py-2 text-sm text-lumos-800"
        >
          {error}
        </p>
      )}
    </form>
  );
}
