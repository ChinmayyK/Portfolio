import type { CSSProperties } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { EDUCATION, EMAIL, EXPERIENCE, PROJECTS, SOCIALS, TOOLS } from "@/lib/content";
import { commitsAtBuild } from "@/lib/commits";
import Nav from "@/components/Nav";
import Board from "@/components/Board";
import Shots from "@/components/Shots";
import CopyEmail from "@/components/CopyEmail";
import Reveal from "@/components/Reveal";

// devicons drawn in black, which disappear on the dark theme unless inverted
const INK_ICONS = new Set(["nextjs", "rust", "prisma"]);

const d = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;

const Head = ({ n, id, children }: { n: string; id: string; children: React.ReactNode }) => (
  <h2 className="s-head mono" id={id} data-r><span>{n}</span>{children}</h2>
);

export default async function Home() {
  const days = await commitsAtBuild();
  const linkAll = PROJECTS[0];

  return (
    <>
      <Nav />
      <main>
        <Board initial={days} />

        <section className="wrap sect" id="work" aria-labelledby="work-h">
          <Head n="01" id="work-h">Work</Head>
          <article className="card feature" data-r>
            <div className="feature-text">
              <span className="mono">Personal project · 2026</span>
              <h3>{linkAll.t}</h3>
              <p>Copy on one device, paste on another. Clipboard and files across macOS, Windows, Android and Linux, with no cloud.</p>
              <p className="mono stack">Rust · Swift · Kotlin · WinUI 3</p>
              <div className="row">
                {linkAll.site && <a className="b-btn solid" href={linkAll.site}>Website<ArrowUpRight weight="light" /></a>}
                <a className="b-btn" href={linkAll.src}>Source<ArrowUpRight weight="light" /></a>
              </div>
            </div>
            <Shots files={linkAll.shots} alt={`${linkAll.t} on desktop`} />
          </article>
          <article className="card plain" data-r style={d(1)}>
            <div>
              <span className="mono">At ideaForge · 2026</span>
              <h3>iF FleetDesk</h3>
              <p>Book, dispatch and track company vehicles, for employees, drivers and admins.</p>
            </div>
            <p className="mono stack">NestJS · Prisma · PostgreSQL · React · Expo<br /><span>Internal, not public</span></p>
          </article>
        </section>

        <section className="wrap sect" id="experience" aria-labelledby="exp-h">
          <Head n="02" id="exp-h">Experience</Head>
          <ol className="rows">
            {EXPERIENCE.map((x, i) => (
              <li key={x.org} data-r style={d(i)}>
                <span className="mono when">{x.now && <i className="live" aria-hidden />}{x.when}</span>
                <div><h3>{x.role} <span>· {x.org}</span></h3><p>{x.line}</p></div>
              </li>
            ))}
            <li data-r style={d(EXPERIENCE.length)}>
              <span className="mono when">{EDUCATION.when}</span>
              <div><h3>{EDUCATION.degree} <span>· {EDUCATION.school}</span></h3><p>Education.</p></div>
            </li>
          </ol>
        </section>

        <section className="wrap sect" id="toolkit" aria-labelledby="tools-h">
          <Head n="03" id="tools-h">Toolkit</Head>
          <ul className="tools">
            {TOOLS.map(([name, slug], i) => (
              <li key={slug} data-r style={{ "--d": `${i * 30}ms` } as CSSProperties}>
                <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${slug}/${slug}-original.svg`} alt="" loading="lazy" width={22} height={22} className={INK_ICONS.has(slug) ? "ink" : undefined} />
                {name}
              </li>
            ))}
          </ul>
        </section>

        <section className="wrap sect" id="contact" aria-labelledby="c-h">
          <Head n="04" id="c-h">Contact</Head>
          <div className="card contact" data-r>
            <span className="mono"><i className="live" aria-hidden />Open to full-time roles from 2027</span>
            <a className="mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <div className="row">
              <CopyEmail email={EMAIL} />
              {SOCIALS.map(([label, href]) => <a key={label} className="b-btn" href={href}>{label}<ArrowUpRight weight="light" /></a>)}
            </div>
          </div>
        </section>
      </main>

      <footer className="wrap foot mono">
        <span>Chinmay Kudalkar, 2026</span>
        <a href="#top">Back to top ↑</a>
      </footer>
      <Reveal />
    </>
  );
}
