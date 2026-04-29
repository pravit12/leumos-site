import Link from "next/link";
import { KnotMark } from "./KnotMark";
import { RuleGradient } from "./RuleGradient";

export function Footer() {
  return (
    <footer id="footer" className="site-footer" role="contentinfo">
      <div className="site-footer__rule">
        <RuleGradient width="full" />
      </div>
      <div className="site-footer__container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link
              href="/"
              className="brand"
              aria-label="Leumos AI — home"
            >
              <KnotMark size={32} />
              <span className="brand__wordmark">leumos</span>
            </Link>
            <p className="site-footer__mission">
              AI-assisted color grading for editors who&apos;ve shipped enough
              log footage. Browser-based. Cinematic by default.
            </p>
          </div>

          <nav className="site-footer__col" aria-label="Footer — Product">
            <h5>Product</h5>
            <ul>
              <li>
                <a href="#act-i">Story</a>
              </li>
              <li>
                <Link href="/blog">Resources</Link>
              </li>
              <li>
                <span className="site-footer__link-disabled">
                  Pricing — soon
                </span>
              </li>
            </ul>
          </nav>

          <nav className="site-footer__col" aria-label="Footer — Company">
            <h5>Company</h5>
            <ul>
              <li>
                <a href="#footer">About</a>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
            </ul>
          </nav>

          <nav className="site-footer__col" aria-label="Footer — Status">
            <h5>Status</h5>
            <ul>
              <li>
                <a href="#footer">
                  <span className="site-footer__status-dot" aria-hidden="true" />
                  All systems normal
                </a>
              </li>
              <li>
                <span className="site-footer__version">v0.1 pre-launch</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <p className="text-small">© 2026 Leumos AI. All rights reserved.</p>
          <p className="text-small">Designed in dim rooms.</p>
        </div>
      </div>
    </footer>
  );
}
