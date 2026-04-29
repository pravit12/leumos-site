import { Button, CTACard, ScrollReveal } from "@/components/ui";
import { BeatRow } from "./BeatRow";

interface ActIIProps {
  eyebrow: string;
  headline: string;
  lede: string;
  figureAlt: string;
  figureCaption: string;
  rows: { headline: string; body: string }[];
  ctaEyebrow: string;
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
}

export function ActII({
  eyebrow,
  headline,
  lede,
  figureAlt,
  figureCaption,
  rows,
  ctaHeading,
  ctaBody,
  ctaButton,
}: ActIIProps) {
  return (
    <section
      className="act act-2"
      id="act-ii"
      aria-labelledby="act-ii-h"
    >
      <div className="act__container">
        <ScrollReveal as="div" mode="stagger" className="act-2__grid">
          <div className="act__copy">
            <p className="text-eyebrow">{eyebrow}</p>
            <h2 id="act-ii-h" className="act__headline">
              {headline}
            </h2>
            <p className="act__lede">{lede}</p>
          </div>
          <figure>
            <div
              className="figure-shift"
              role="img"
              aria-label={figureAlt}
            />
            <figcaption>{figureCaption}</figcaption>
          </figure>
        </ScrollReveal>

        <ScrollReveal
          as="div"
          mode="stagger"
          staggerMs={120}
          className="beat-rows"
        >
          {rows.map((row, i) => (
            <BeatRow
              key={i}
              index={(i + 1) as 1 | 2 | 3}
              headline={row.headline}
              body={row.body}
            />
          ))}
        </ScrollReveal>

        <div className="act-2__cta">
          <CTACard
            heading={ctaHeading}
            body={ctaBody}
            ariaLabel="Waitlist call to action"
          >
            <a href="#waitlist-form" className="act-2__cta-anchor">
              <Button size="lg" pill>
                {ctaButton}
                <span aria-hidden="true" className="act-2__cta-arrow">
                  →
                </span>
              </Button>
            </a>
          </CTACard>
        </div>
      </div>
    </section>
  );
}
