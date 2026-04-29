import { Button, ScrollReveal } from "@/components/ui";
import { ShotStrip } from "./ShotStrip";
import { StatBlock } from "./StatBlock";
import { PullQuote } from "./PullQuote";

interface Stat {
  numeral: string;
  label: string;
  context: string;
  ariaLabel: string;
  primary?: boolean;
}

interface ActIVProps {
  eyebrow: string;
  headline: string;
  lede: string;
  shots: { alt: string; caption: string; gradeBleed?: boolean }[];
  stats: [Stat, Stat, Stat];
  ctaButton: string;
  quoteBody: string;
  quoteAttribution: string;
}

export function ActIV({
  eyebrow,
  headline,
  lede,
  shots,
  stats,
  ctaButton,
  quoteBody,
  quoteAttribution,
}: ActIVProps) {
  return (
    <section
      className="act act-4"
      id="act-iv"
      aria-labelledby="act-iv-h"
    >
      <div className="act__container">
        <ScrollReveal as="div" mode="stagger" className="act-4__grid">
          <div className="act__copy">
            <p className="text-eyebrow">{eyebrow}</p>
            <h2 id="act-iv-h" className="act__headline">
              {headline}
            </h2>
            <p className="act__lede">{lede}</p>
          </div>
        </ScrollReveal>
      </div>

      <div className="act-4__strip-wrap">
        <ShotStrip
          shots={shots}
          ariaLabel="A pass through five shots in a single project"
        />
      </div>

      <div className="act__container">
        <ul
          className="stat-grid"
          role="list"
          aria-label="Concrete numbers on a typical pass"
        >
          {stats.map((s, i) => (
            <StatBlock
              key={i}
              numeral={s.numeral}
              label={s.label}
              context={s.context}
              ariaLabel={s.ariaLabel}
              primary={s.primary}
            />
          ))}
        </ul>

        <div className="act-4__cta-row">
          <a href="#waitlist-form" className="act-4__cta-anchor">
            <Button size="lg" pill>
              {ctaButton}
              <span aria-hidden="true" className="act-4__cta-arrow">
                →
              </span>
            </Button>
          </a>
        </div>

        <PullQuote body={`“${quoteBody}”`} attribution={quoteAttribution} />
      </div>
    </section>
  );
}
