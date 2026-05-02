"use client";

import type { FormEvent } from "react";
import { Button, EmailField } from "@/components/ui";

interface ActVProps {
  eyebrow: string;
  headline: string;
  lede: string;
  ctaButton: string;
  microcopy: string;
  /**
   * Loss-Aversion anchor row (fomo-spec §3): founding price next to a real
   * <s>regular price</s>. Strikethrough is the <s> element itself for SR support.
   */
  anchor: {
    foundingPrice: string;
    foundingPeriod?: string;
    regularPrice: string;
    regularLabel?: string;
  };
  /** Uncapped reassurance line. Sits with s-8 separation from the anchor row. */
  trust: string;
}

export function ActV({
  eyebrow,
  headline,
  lede,
  ctaButton,
  microcopy,
  anchor,
  trust,
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
          <div className="act-5__copy">
            <p className="text-eyebrow">{eyebrow}</p>
            <h2 id="act-v-h" className="act-5__headline">
              {headline}
            </h2>
            <p className="act-5__lede">{lede}</p>
            <div className="scarcity-stack act-5__pricing">
              <p className="tier-anchor" aria-label="Founding price compared to regular price">
                <span className="tier-anchor__founding">
                  {anchor.foundingPrice}
                  {anchor.foundingPeriod ? (
                    <span className="tier-anchor__period">{anchor.foundingPeriod}</span>
                  ) : null}
                </span>
                <span className="tier-anchor__regular">
                  <s aria-label={anchor.regularLabel ?? "regular price"}>
                    {anchor.regularPrice}
                  </s>
                </span>
              </p>
              <p className="tier-abundant">{trust}</p>
            </div>
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
          </form>
        </aside>
      </div>
    </section>
  );
}
