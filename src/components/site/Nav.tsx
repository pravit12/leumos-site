import Link from "next/link";
import { Button } from "@/components/ui";
import { KnotMark } from "./KnotMark";

export function Nav() {
  return (
    <header role="banner" className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="Leumos AI — home">
          <KnotMark size={28} className="brand__knot brand__knot--mobile" />
          <KnotMark size={32} className="brand__knot brand__knot--desktop" />
          <span className="brand__wordmark">leumos</span>
        </Link>

        <nav aria-label="Primary" className="site-header__nav">
          <a href="#act-i" className="site-header__link">
            Story
          </a>
          <a href="#footer" className="site-header__link">
            About
          </a>
          <Link href="/blog" className="site-header__link">
            Resources
          </Link>
          <a href="#waitlist-form" className="site-header__cta-anchor">
            <Button size="md" pill>
              Get on the waitlist
            </Button>
          </a>
        </nav>

        <nav aria-label="Primary" className="site-header__nav-mobile">
          <a href="#waitlist-form" className="site-header__link">
            Waitlist →
          </a>
        </nav>
      </div>
    </header>
  );
}
