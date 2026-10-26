"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, GitFork, Star, Tag } from "@phosphor-icons/react";
import { EDUCATION, EMAIL, EXPERIENCE, GITHUB, PROJECTS, SOCIALS, TOOLS } from "@/lib/content";
import type { Day } from "@/lib/commits";
import { repoStats, type Repo } from "@/lib/repo";
import Shots from "@/components/Shots";

const long = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const short = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kolkata" });
const at = (date: string) => new Date(date + "T00:00:00");
// GitHub timestamps, read in UTC so the server and browser print the same day
const stamp = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const num = (n: number) => n.toLocaleString("en-IN");

// GitHub's own language colours for the ones Link All is written in; the long tail shares one grey bar
const LANG_COLORS: Record<string, string> = { Rust: "#DEA584", Kotlin: "#A97BFF", Swift: "#F05138", "C#": "#178600" };
const OTHER = "var(--ink-3)";

// devicons drawn in black, which disappear on the dark theme unless inverted
const INK_ICONS = new Set(["nextjs", "rust", "prisma"]);

/** Longest run of active days, and the run still going (a quiet today doesn't break it). */
function streaks(days: Day[]) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.count ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0, i = days.length - 1;
  if (i >= 0 && !days[i].count) i--;
  for (; i >= 0 && days[i].count; i--) current++;
  return { longest, current };
}

/** Tilts a tile toward the pointer. */
function tilt(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const t = e.currentTarget, r = t.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  t.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
}
const level = (e: React.PointerEvent<HTMLElement>) => { e.currentTarget.style.transform = ""; };
const tile = (i: number) => ({ onPointerMove: tilt, onPointerLeave: level, style: { "--i": i } as React.CSSProperties });

function Clock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(clock.format(new Date()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <b suppressHydrationWarning>{now}</b>;
}

/** The whole page: one board of tiles that flip up one after another. */
export default function Board({ initial, repo: builtRepo }: { initial: Day[]; repo: Repo | null }) {
  const [days, setDays] = useState(initial);
  const [repo, setRepo] = useState(builtRepo);
  const [hover, setHover] = useState<Day | null>(null);
  const cells = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const linkAll = PROJECTS[0];

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commits", { signal: AbortSignal.timeout(12000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: { contributions: Day[] }) => { if (!cancelled && j.contributions?.length) setDays(j.contributions.slice(-365)); })
      .catch(() => {}); // the build-time copy stays up
    repoStats(linkAll.src).then((r) => { if (!cancelled && r) setRepo(r); });
    return () => { cancelled = true; };
  }, [linkAll.src]);

  // the four biggest languages get their own bar, the rest are lumped into "Other"
  const langs = useMemo(() => {
    const all = repo?.langs ?? [];
    const top = all.filter(([l]) => l in LANG_COLORS).slice(0, 4);
    const rest = 1 - top.reduce((s, [, n]) => s + n, 0);
    return rest > 0.005 ? [...top, ["Other", rest] as [string, number]] : top;
  }, [repo]);

  const lead = days.length ? at(days[0].date).getDay() : 0;
  const total = useMemo(() => days.reduce((s, d) => s + d.count, 0), [days]);
  const streak = useMemo(() => streaks(days), [days]);
  const cols = Math.ceil((days.length + lead) / 7);
  const active = useMemo(() => days.filter((d) => d.count).length, [days]);
  const best = useMemo(() => days.reduce<Day | null>((b, d) => (d.count > (b?.count ?? 0) ? d : b), null), [days]);

  // a label over each week where a new month starts, skipping a sliver of a month at the very start
  const months = useMemo(() => {
    const out: { col: number; label: string }[] = [];
    for (let c = 0, prev = -1; c < cols; c++) {
      const m = at((days[c * 7 - lead] ?? days[0]).date).getMonth();
      if (m !== prev) out.push({ col: c, label: month.format(new Date(2000, m, 1)) });
      prev = m;
    }
    if (out.length > 1 && out[1].col < 3) out.shift();
    return out;
  }, [days, cols, lead]);

  // on a phone the year is wider than the tile: start scrolled to the latest weeks
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [days]);

  // a ripple spreads from the pointer: nearby squares lift and grow, written straight to the DOM
  const ripple = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cells.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = ((e.clientX - r.left) / r.width) * cols, cy = ((e.clientY - r.top) / r.height) * 7;
    const kids = el.children as HTMLCollectionOf<HTMLElement>;
    for (let i = lead; i < kids.length; i++) {
      const d = Math.hypot(Math.floor(i / 7) + 0.5 - cx, (i % 7) + 0.5 - cy);
      kids[i].style.transform = d < 4 ? `translateY(${(-(4 - d) * 1.5).toFixed(1)}px) scale(${(1 + (4 - d) * 0.18).toFixed(2)})` : "";
      kids[i].classList.toggle("hit", d < 0.8);
    }
    setHover(days[Math.floor(cx) * 7 + Math.floor(cy) - lead] ?? null);
  };
  const calm = () => {
    for (const c of (cells.current?.children ?? []) as HTMLCollectionOf<HTMLElement>) { c.style.transform = ""; c.classList.remove("hit"); }
    setHover(null);
  };

  return (
    <main className="board wrap" id="top">
      <div className="tile t-id" {...tile(0)}>
        <div className="blob" aria-hidden />
        <span className="k mono">Full-stack developer</span>
        <h1>Chinmay<br />Kudalkar</h1>
        <p>I build software for the web, phones and desktop.</p>
        <div className="pills mono">
          <a className="go" href={`mailto:${EMAIL}`}>Email me<ArrowUpRight weight="light" /></a>
          <a href="/resume">Résumé<ArrowUpRight weight="light" /></a>
        </div>
      </div>

      <div className="tile t-clock" {...tile(1)}>
        <span className="k mono">Navi Mumbai</span>
        <Clock />
      </div>

      <div className="tile t-now" {...tile(2)}>
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
          <path id="route" d="M-10 160 C 80 150, 90 60, 180 80 S 300 170, 410 40" />
          <circle r="5"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#route" /></animateMotion></circle>
        </svg>
        <span className="k mono"><i className="live" aria-hidden />Now · since Aug 2026</span>
        <h2>Fleet software at ideaForge</h2>
      </div>

      <div className="tile t-status" {...tile(3)}>
        <span className="k mono">Status</span>
        <p><i className="live" aria-hidden />Open to full-time roles from 2027</p>
      </div>

      <div className="tile t-streak" {...tile(4)}>
        <span className="k mono">Streak</span>
        <p><b>{streak.current}</b> days <span>· best {streak.longest}</span></p>
      </div>

      <div className="tile t-edu" {...tile(5)}>
        <span className="k mono">Education · {EDUCATION.when}</span>
        <p>{EDUCATION.school}<span>{EDUCATION.degree}</span></p>
      </div>

      <div className="tile t-graph" id="github" {...tile(6)}>
        <div className="gh-main">
          <div className="row mono">
            <span className="k">GitHub · last year</span>
            <span aria-live="polite">
              {hover
                ? `${hover.count || "No"} ${hover.count === 1 ? "contribution" : "contributions"} · ${long.format(at(hover.date))}`
                : days.length ? `${monthYear.format(at(days[0].date))} – ${monthYear.format(at(days[days.length - 1].date))}` : ""}
            </span>
          </div>
          <div className="gh-scroll" ref={scroller}>
            <div className="gh-cal" style={{ "--cols": cols } as React.CSSProperties}>
              <div className="mo mono" aria-hidden>
                {months.map((m) => <span key={m.col} style={{ gridColumn: m.col + 1 }}>{m.label}</span>)}
              </div>
              <div className="hm" ref={cells} role="img" aria-label={`${total} GitHub contributions in the last year`}
                onPointerMove={ripple} onPointerDown={ripple} onPointerLeave={(e) => e.pointerType === "mouse" && calm()}>
                {Array.from({ length: lead }, (_, i) => <i key={`pad${i}`} className="pad" />)}
                {days.map((d) => <i key={d.date} data-l={d.level} />)}
              </div>
            </div>
          </div>
        </div>
        <div className="gh-side">
          <a className="gh-who" href={`https://github.com/${GITHUB}`}>
            <img src={`https://github.com/${GITHUB}.png?size=96`} alt="" width={40} height={40} loading="lazy" />
            <span>Chinmay Kudalkar<span className="mono">@{GITHUB}</span></span>
            <ArrowUpRight weight="light" />
          </a>
          <dl>
            <div><dt className="mono">Contributions</dt><dd>{total.toLocaleString("en-IN")}</dd></div>
            <div><dt className="mono">Active days</dt><dd>{active}<span>/{days.length}</span></dd></div>
            <div><dt className="mono">Best day</dt><dd>{best?.count ?? 0}{best && <span> · {short.format(at(best.date))}</span>}</dd></div>
          </dl>
          <div className="legend mono" aria-hidden>Less{[0, 1, 2, 3, 4].map((l) => <i key={l} data-l={l} />)}More</div>
        </div>
      </div>

      <a className="tile t-work" id="work" href={linkAll.site ?? linkAll.src} {...tile(7)}>
        <Shots files={linkAll.shots} alt={`${linkAll.t} on desktop`} />
        <div className="cap">
          <div>
            {repo && (
              <div className="chips mono">
                <span><Star weight="fill" />{num(repo.stars)}<em>stars</em></span>
                <span><GitFork />{num(repo.forks)}<em>{repo.forks === 1 ? "fork" : "forks"}</em></span>
                {repo.latest && <span><Tag />{repo.latest.tag}</span>}
              </div>
            )}
            <span className="k mono">Project · 2026</span><h2>{linkAll.t}</h2>
          </div>
          <span className="mono">Copy here, paste there <ArrowUpRight weight="light" /></span>
        </div>
      </a>

      <div className="tile t-about" {...tile(8)}>
        <span className="k mono">About Link All</span>
        <p>Clipboard and files across macOS, Windows, Android and Linux, with no cloud.</p>
        {repo && (
          <dl className="facts">
            {repo.commits !== null && <div><dt className="mono">Commits</dt><dd>{num(repo.commits)}</dd></div>}
            <div><dt className="mono">Releases</dt><dd>{repo.releases}</dd></div>
            <div><dt className="mono">Downloads</dt><dd>{num(repo.downloads)}</dd></div>
          </dl>
        )}
        {langs.length > 0 && (
          <div className="langs">
            <div className="track" aria-hidden>
              {langs.map(([l, n]) => <i key={l} style={{ flexGrow: n, background: LANG_COLORS[l] ?? OTHER }} />)}
            </div>
            <ul className="mono">
              {langs.map(([l, n]) => (
                <li key={l}><i style={{ background: LANG_COLORS[l] ?? OTHER }} aria-hidden />{l} <span>{Math.round(n * 100)}%</span></li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="mono">
            {repo
              ? [repo.license, `Updated ${stamp.format(new Date(repo.pushed))}`].filter(Boolean).join(" · ")
              : "Rust · Swift · Kotlin · WinUI 3"}
          </p>
          <div className="pills mono">
            {linkAll.site && <a href={linkAll.site}>Website<ArrowUpRight weight="light" /></a>}
            <a href={linkAll.src}>Source<ArrowUpRight weight="light" /></a>
          </div>
        </div>
      </div>

      <div className="tile t-exp" id="experience" {...tile(9)}>
        <span className="k mono">Experience</span>
        <ul>
          {EXPERIENCE.map((x) => <li key={x.org}>{x.org}<span>{x.role} · {x.when}</span></li>)}
        </ul>
      </div>

      <div className="tile t-fleet" {...tile(10)}>
        <span className="k mono">At ideaForge · 2026</span>
        <div>
          <h2>iF FleetDesk</h2>
          <p>Book, dispatch and track company vehicles, for employees, drivers and admins.</p>
        </div>
        <p className="mono">NestJS · Prisma · PostgreSQL · React · Expo<br /><span>Internal, not public</span></p>
      </div>

      <div className="tile t-tools" {...tile(11)}>
        <span className="k mono">Toolkit</span>
        <ul>
          {TOOLS.map(([name, slug]) => (
            <li key={slug} title={name}>
              <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${slug}/${slug}-original.svg`} alt="" loading="lazy" width={28} height={28} className={INK_ICONS.has(slug) ? "ink" : undefined} />
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="tile t-stack" {...tile(12)}>
        <div className="marq mono" aria-label={TOOLS.map(([n]) => n).join(", ")}>
          {[0, 1].map((k) => TOOLS.map(([n]) => <span key={`${k}${n}`} aria-hidden>{n}</span>))}
        </div>
      </div>

      <div className="tile t-links" {...tile(13)}>
        <span className="k mono">Elsewhere</span>
        <nav>{SOCIALS.map(([label, href]) => <a key={label} href={href}>{label}<ArrowUpRight weight="light" /></a>)}</nav>
      </div>

      <a className="tile t-mail" id="contact" href={`mailto:${EMAIL}`} {...tile(14)}>
        <span><span className="k mono">Say hello</span><br />Email me</span>
        <ArrowUpRight weight="light" />
      </a>
    </main>
  );
}
