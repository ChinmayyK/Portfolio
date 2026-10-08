import type { CSSProperties } from "react";
import {
  ArrowRight, CalendarCheck, Copy as CopyIcon, GithubLogo, LinkedinLogo, Path, Phone, SteeringWheel, WarningCircle, ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { EMAIL, TOOLS } from "@/lib/content";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Deck from "@/components/Deck";
import CopyButton from "@/components/CopyButton";
import WhoAmI from "@/components/WhoAmI";
import Reveal from "@/components/Reveal";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />

        <section className="now" id="now" aria-labelledby="now-h">
          <div className="wrap">
            <div className="bezel lifted" data-r>
              <div className="core">
                <div className="say">
                  <span className="chip" style={{ justifySelf: "start" }}>Since August 2026</span>
                  <div>
                    <h2 id="now-h">Interning at <em>ideaForge</em>.</h2>
                    <p style={{ marginTop: 16 }}>I work on iF FleetDesk, the internal app staff use to book vehicles for people and material, on web and mobile.</p>
                  </div>
                </div>
                <ol>
                  <li data-r style={d(100)}><i><Path weight="light" /></i>A four-step booking flow, including multi-stop and outstation trips.</li>
                  <li data-r style={d(180)}><i><SteeringWheel weight="light" /></i>Driver assignment, dispatch and reassignment.</li>
                  <li data-r style={d(260)}><i><WarningCircle weight="light" /></i>Checks for conflicting vehicle and driver bookings.</li>
                  <li data-r style={d(340)}><i><CalendarCheck weight="light" /></i>Scheduled rides with seat reservations and no-shows.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="work" id="work" aria-labelledby="work-h">
          <div className="wrap">
            <h2 id="work-h" data-r>Things I&apos;ve built.</h2>
            <p className="lead" data-r style={d(120)}>Side projects and college work. Open any of them for screenshots and details.</p>
          </div>
          <Deck />
        </section>

        <section id="background" aria-labelledby="bg-h">
          <div className="wrap">
            <h2 id="bg-h" data-r>Background.</h2>
            <div className="bento">
              <article className="bezel lifted b-a" data-r>
                <div className="core">
                  <div>
                    <span className="chip">Aug 2026 to now</span>
                    <h3 className="role">Web &amp; Mobile App Developer Intern</h3>
                    <p className="org">ideaForge Technology, Navi Mumbai</p>
                  </div>
                  <ul>
                    <li><i><ArrowRight weight="light" /></i>iF FleetDesk, the fleet and employee transport platform, on web and mobile for five kinds of user.</li>
                    <li><i><ArrowRight weight="light" /></i>Booking for passengers, material or both, for yourself or someone else.</li>
                    <li><i><ArrowRight weight="light" /></i>Vehicle availability, capacity matching, driver assignment and dispatch.</li>
                    <li><i><ArrowRight weight="light" /></i>Scheduled rides with set routes and timings, seat reservations, cancellations and no-shows.</li>
                  </ul>
                </div>
              </article>
              <article className="bezel lifted b-b" data-r style={d(100)}>
                <div className="core">
                  <div>
                    <span className="chip">Dec 2025 to Apr 2026</span>
                    <h3 className="role">Software Engineering Intern</h3>
                    <p className="org">Mintskill HR Solutions</p>
                  </div>
                  <ul>
                    <li>Node.js services and REST integrations connecting hiring tools (ATS) to CRMs.</li>
                    <li>Redis-backed background job queues.</li>
                  </ul>
                </div>
              </article>
              <article className="bezel lifted b-d" data-r style={d(120)}>
                <div className="core">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <h3 className="role" style={{ margin: 0 }}>What I use</h3>
                    <p className="org" style={{ margin: 0 }}>Plus AWS, LLM integration and RAG.</p>
                  </div>
                  <div className="logos">
                    {TOOLS.map(([name, slug]) => (
                      <span className="logo" key={slug}>
                        <span><img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${slug}/${slug}-original.svg`} alt="" loading="lazy" /></span>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
              <article className="bezel lifted b-c" data-r style={d(180)}>
                <div className="core">
                  <span className="chip" style={{ justifySelf: "start" }}>Education</span>
                  <dl>
                    <div><dt>B.Tech, Computer Technology</dt><dd>RT-MSSU, 2023 to 2027. CGPA 7.3.</dd></div>
                    <div><dt>Certificates</dt><dd>AWS Certified Cloud Practitioner (2026). Deep Learning, Skillsoft (2025). AI, Databases, HTML &amp; CSS from Certiport.</dd></div>
                  </dl>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="c-h">
          <div className="wrap">
            <div className="bezel lifted" data-r>
              <div className="core">
                <div>
                  <span className="chip">Open to full-time roles from 2027</span>
                  <h2 id="c-h" style={{ marginTop: 22 }}>Say hello.</h2>
                  <a className="mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </div>
                <div className="side">
                  <a className="pill dark" href={`mailto:${EMAIL}`}>Email me <span className="isl"><ArrowUpRight weight="light" /></span></a>
                  <CopyButton text={EMAIL} icon={<CopyIcon weight="light" />} />
                  <div className="row">
                    <a className="pill light" href="https://linkedin.com/in/chinmayyk">LinkedIn <span className="isl"><LinkedinLogo weight="light" /></span></a>
                    <a className="pill light" href="https://github.com/chinmayyk">GitHub <span className="isl"><GithubLogo weight="light" /></span></a>
                  </div>
                  <a className="pill light" href="tel:+918766983907">+91 87669 83907 <span className="isl"><Phone weight="light" /></span></a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer><div className="wrap"><span>Chinmay Kudalkar, 2026</span><span>Type <button type="button" className="kbd" data-whoami>whoami</button> anywhere</span></div></footer>

      <WhoAmI />
      <Reveal />
    </>
  );
}
