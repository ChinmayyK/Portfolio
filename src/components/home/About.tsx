import { CAPABILITIES, EDUCATION, EXPERIENCE, SITE } from "@/content/site";
import Disc from "@/components/chrome/Disc";

export default function About() {
  return (
    <section id="about" className="about frame" aria-labelledby="about-title">
      <h2 id="about-title" className="t-label about-label">About</h2>
      <p className="about-lead t-h2" data-split>
        I like the parts of software that have to agree with each other.
      </p>

      <div className="about-cols">
        <div className="about-copy" data-stagger>
          <p>
            A clipboard shared by a phone and a laptop. A booking that has to make sense to an employee, an admin and a driver. A file that
            arrives whole after the Wi-Fi drops. That&apos;s the kind of problem I keep choosing.
          </p>
          <p>
            I&apos;m finishing a B.Tech in Computer Technology in Mumbai, interning at ideaForge, and looking for a full-time role from 2027.
          </p>
          <div><Disc href={SITE.resume} size="md">Résumé</Disc></div>
        </div>

        <div className="about-lists">
          <h3 className="t-label">Experience</h3>
          <ol className="about-rows">
            {EXPERIENCE.map((x) => (
              <li key={x.org} className="about-row" data-reveal>
                <span className="about-org t-h3">{x.org}</span>
                <span className="about-role">{x.role}</span>
                <span className="about-when t-small">{x.when}</span>
                <span className="about-line t-small">{x.line}</span>
              </li>
            ))}
            <li className="about-row" data-reveal>
              <span className="about-org t-h3">RT-MSSU</span>
              <span className="about-role">{EDUCATION.degree}</span>
              <span className="about-when t-small">{EDUCATION.when}</span>
              <span className="about-line t-small">{EDUCATION.school}</span>
            </li>
          </ol>

          <h3 className="t-label">Tools</h3>
          <dl className="about-tools" data-stagger>
            {CAPABILITIES.map(([g, items]) => (
              <div key={g}>
                <dt className="t-small">{g}</dt>
                <dd>{items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
