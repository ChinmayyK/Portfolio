import { SITE } from "@/content/site";
import Disc from "@/components/chrome/Disc";
import CopyEmail from "./CopyEmail";
import BackToTop from "./BackToTop";

/** The ending sits under the page and is uncovered as the last section scrolls away. */
export default function Contact() {
  return (
    <footer id="contact" className="contact on-dark" aria-labelledby="contact-title">
      <div className="contact-inner frame">
        <div className="contact-head">
          <h2 id="contact-title" className="t-h1 contact-title" data-split>Say hello<span className="contact-dot">.</span></h2>
          <span className="contact-arrow t-lead" aria-hidden="true">↙</span>
        </div>
        <div className="contact-rule">
          <span className="contact-disc"><Disc href={`mailto:${SITE.email}`} tone="lime" size="lg">Write to me</Disc></span>
        </div>
        <div className="contact-mail">
          <a className="ulink t-h3" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <CopyEmail email={SITE.email} />
        </div>
        <div className="contact-foot">
          <nav aria-label="Elsewhere">
            <span className="t-label">Elsewhere</span>
            <p className="contact-links">
              <a className="uhover" href={SITE.github}>GitHub</a>
              <a className="uhover" href={SITE.linkedin}>LinkedIn</a>
              <a className="uhover" href={SITE.resume}>Résumé</a>
            </p>
          </nav>
          <div className="contact-end"><span className="t-label">© {new Date().getFullYear()}</span><BackToTop /></div>
        </div>
      </div>
    </footer>
  );
}
