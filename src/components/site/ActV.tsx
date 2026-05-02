"use client";

import type { FormEvent } from "react";
import { Button, EmailField, WaitlistOptInCheckbox } from "@/components/ui";
import { SocialProofBlock } from "./SocialProofBlock";

interface ActVProps {
  eyebrow: string;
  headline: string;
  lede: string;
  ctaButton: string;
  microcopy: string;
}

export function ActV({
  eyebrow,
  headline,
  lede,
  ctaButton,
  microcopy,
}: ActVProps) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <section
      className="act act-5"
      id="act-v"
      aria-labelledby="act-v-h"
    >
      <div className="act__container">
        <aside
          className="act-5__card"
          aria-labelledby="act-v-h"
        >
          <div className="act-5__top">
            <div className="act-5__copy">
              <p className="text-eyebrow">{eyebrow}</p>
              <h2 id="act-v-h" className="act-5__headline">
                {headline}
              </h2>
              <p className="act-5__lede">{lede}</p>
            </div>
            <form
              className="act-5__form"
              data-waitlist-form
              aria-label="Join the waitlist (Act V)"
              noValidate
              onSubmit={onSubmit}
            >
              <EmailField
                id="act-v-email"
                label="Email address"
                placeholder="you@studio.com"
                required
              />
              <Button type="submit" size="lg" pill className="w-full">
                {ctaButton}
                <span aria-hidden="true" className="act-5__cta-arrow">
                  →
                </span>
              </Button>
              <p className="text-small act-5__microcopy">{microcopy}</p>
              <WaitlistOptInCheckbox
                id="act-v-public-name"
                className="act-5__optin"
              />
            </form>
          </div>
          <SocialProofBlock
            variant="compact"
            className="act-5__social-proof"
          />
        </aside>
      </div>
    </section>
  );
}
