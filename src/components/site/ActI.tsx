import { ScrollReveal } from "@/components/ui";

interface ActIProps {
  eyebrow: string;
  headline: string;
  lede: string;
  caption: string;
  frameTag: string;
  figureAlt: string;
}

export function ActI({
  eyebrow,
  headline,
  lede,
  caption,
  frameTag,
  figureAlt,
}: ActIProps) {
  return (
    <section
      className="act act-1"
      id="act-i"
      aria-labelledby="act-i-h"
    >
      <div className="act__container">
        <ScrollReveal as="div" mode="stagger" className="act-1__grid">
          <div className="act__copy">
            <p className="text-eyebrow">{eyebrow}</p>
            <h2 id="act-i-h" className="act__headline">
              {headline}
            </h2>
            <p className="act__lede">{lede}</p>
          </div>
          <figure>
            <div
              className="figure-flat"
              role="img"
              aria-label={figureAlt}
            >
              <span className="figure-flat__tag">{frameTag}</span>
            </div>
            <figcaption>{caption}</figcaption>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
