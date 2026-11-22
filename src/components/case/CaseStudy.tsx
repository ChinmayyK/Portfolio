import type { Project } from "@/content/projects";
import { SHOTS } from "@/content/projects";
import { TLink } from "@/components/chrome/Transition";
import Disc from "@/components/chrome/Disc";
import RouteIllustration from "@/components/work/RouteIllustration";
import { FleetDiagram, LinkAllDiagram } from "./Diagrams";

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="cs-section" aria-labelledby={`cs-${n}`}>
      <h2 id={`cs-${n}`} className="cs-label"><span className="t-label">{n}</span><span>{title}</span></h2>
      <div className="cs-body">{children}</div>
    </section>
  );
}

function Img({ shot, className = "" }: { shot: (typeof SHOTS)[keyof typeof SHOTS]; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized webp
  return <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} className={className} decoding="async" />;
}

function Visual({ project }: { project: Project }) {
  if (project.slug === "link-all") {
    return (
      <figure className="cs-visual cs-visual--linkall" data-reveal="clip">
        <div className="cs-shots" data-media>
          <Img shot={SHOTS.macDevices} className="cs-shot-desk" />
          <span className="cs-shot-phone" data-parallax="0.18"><Img shot={SHOTS.androidHome} /></span>
        </div>
        <figcaption className="t-small">Link All on macOS and Android. Real captures.</figcaption>
      </figure>
    );
  }
  return (
    <figure className="cs-visual cs-visual--fleet" data-reveal="clip">
      <RouteIllustration />
      <figcaption className="t-small">An illustration of a trip, not the product.</figcaption>
    </figure>
  );
}

export default function CaseStudy({ project: p, next }: { project: Project; next: Project }) {
  return (
    <article className="cs">
      <header className="cs-hero frame">
        <TLink href="/#work" label="Work" className="t-small cs-back uhover">← All work</TLink>
        <p className="t-label cs-kicker" data-reveal="fade">{p.kind} · {p.context} · {p.years}</p>
        <h1 className="t-name cs-title" data-split>{p.title}</h1>
        <p className="t-lead cs-summary" data-split data-delay="0.15">{p.summary}</p>
        <dl className="cs-meta" data-stagger data-delay="0.3">
          <div><dt className="t-label">Role</dt><dd>{p.role}</dd></div>
          <div><dt className="t-label">Platforms</dt><dd>{p.platforms.join(", ")}</dd></div>
          <div><dt className="t-label">Stack</dt><dd>{p.stack.join(", ")}</dd></div>
          {p.links.length > 0 && (
            <div><dt className="t-label">Links</dt><dd className="cs-links">{p.links.map((l) => <a key={l.href} href={l.href} className="ulink">{l.label} ↗</a>)}</dd></div>
          )}
        </dl>
      </header>

      <div className="frame"><Visual project={p} /></div>

      {p.notice && <p className="cs-notice frame t-small" data-reveal>{p.notice}</p>}

      <div className="cs-sections frame">
        <Section n="01" title="The problem">
          {p.problem.map((t, i) => <p key={i} className={i === 0 ? "t-lead" : ""} data-reveal>{t}</p>)}
        </Section>

        <Section n="02" title="My role">
          <p className="t-lead" data-reveal>{p.role}</p>
        </Section>

        <Section n="03" title="Architecture">
          <p className="t-lead" data-reveal>{p.architecture.intro}</p>
          <div data-reveal>{p.slug === "link-all" ? <LinkAllDiagram /> : <FleetDiagram />}</div>
          <dl className="cs-notes" data-stagger>
            {p.architecture.notes.map((n) => (
              <div key={n.title}><dt>{n.title}</dt><dd>{n.body}</dd></div>
            ))}
          </dl>
        </Section>

        <Section n="04" title="Hard parts">
          <ol className="cs-list">
            {p.challenges.map((c, i) => (
              <li key={c.title} data-reveal>
                <span className="t-label">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3">{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section n="05" title="Decisions and trade-offs">
          <ul className="cs-decisions">
            {p.decisions.map((d) => (
              <li key={d.title} data-reveal>
                <h3 className="t-h3">{d.title}</h3>
                <p>{d.body}</p>
                <p className="cs-tradeoff"><span className="t-label">Trade-off</span>{d.tradeoff}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section n="06" title="Lessons">
          <ul className="cs-list cs-list--plain">
            {p.lessons.map((l) => (
              <li key={l.title} data-reveal><h3 className="t-h3">{l.title}</h3><p>{l.body}</p></li>
            ))}
          </ul>
        </Section>

        <Section n="07" title="Where it stands">
          <ul className="cs-outcomes" data-stagger>
            {p.outcomes.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </Section>
      </div>

      <nav className="cs-next frame" aria-label="Next project">
        <span className="t-label">Next project</span>
        <TLink href={`/work/${next.slug}`} label={next.title} className="cs-next-link" data-cursor="View">
          <span className="t-h1">{next.title}</span>
          <span className="cs-next-sub">{next.summary}</span>
        </TLink>
        <div className="cs-next-disc"><Disc href="/#work" label="Work">All work</Disc></div>
      </nav>
    </article>
  );
}
