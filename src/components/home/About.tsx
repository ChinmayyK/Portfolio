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
        <div className="about-copy" data-reveal>
          <Disc href={SITE.resume} size="md">Résumé</Disc>
        </div>

        <div className="about-lists">
          <h3 className="t-label">Experience</h3>
          <ol className="about-rows">
            {EXPERIENCE.map((x) => (
              <li key={x.org} className="about-row" data-reveal>
                <span className="about-org t-h3">{x.org}</span>
                <span className="about-role">{x.role}</span>
                <span className="about-when t-small">{x.when}</span>
              </li>
            ))}
            <li className="about-row" data-reveal>
              <span className="about-org t-h3">RT-MSSU</span>
              <span className="about-role">{EDUCATION.degree}</span>
              <span className="about-when t-small">{EDUCATION.when}</span>
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
