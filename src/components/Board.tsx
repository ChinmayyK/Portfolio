"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { EMAIL, SOCIALS } from "@/lib/content";
import type { Day } from "@/lib/commits";

const long = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
const at = (date: string) => new Date(date + "T00:00:00");

/** Longest run of active days, and the run still going (a quiet today doesn't break it). */
function streaks(days: Day[]) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.count ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0, i = days.length - 1;
  if (i >= 0 && !days[i].count) i--;
  for (; i >= 0 && days[i].count; i--) current++;
  return { longest, current };
}

/** Moves a tile's soft light with the pointer, through --gx/--gy. */
function light(e: React.PointerEvent<HTMLElement>) {
  const t = e.currentTarget, r = t.getBoundingClientRect();
  t.style.setProperty("--gx", `${e.clientX - r.left}px`);
  t.style.setProperty("--gy", `${e.clientY - r.top}px`);
}
const tile = (i: number) => ({ onPointerMove: light, style: { "--i": i } as React.CSSProperties });

/** Splits a word into letters that rise in one after another. */
const Rise = ({ text, from }: { text: string; from: number }) => (
  <span className="rise" aria-label={text}>
    {[...text].map((c, i) => <span key={i} aria-hidden style={{ "--n": from + i } as React.CSSProperties}>{c}</span>)}
  </span>
);

/** The hero: a board of tiles that wipe in one after another. */
export default function Board({ initial }: { initial: Day[] }) {
  const [days, setDays] = useState(initial);
  const [hover, setHover] = useState<Day | null>(null);
  const cells = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commits", { signal: AbortSignal.timeout(12000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: { contributions: Day[] }) => { if (!cancelled && j.contributions?.length) setDays(j.contributions.slice(-365)); })
      .catch(() => {}); // the build-time copy stays up
    return () => { cancelled = true; };
  }, []);

  const { lead, total, streak, months } = useMemo(() => {
    const lead = days.length ? at(days[0].date).getDay() : 0;
    return {
      lead,
      total: days.reduce((s, d) => s + d.count, 0),
      streak: streaks(days),
      months: days.flatMap((d, i) => (at(d.date).getDate() === 1 ? [{ col: Math.floor((i + lead) / 7), label: month.format(at(d.date)) }] : [])),
    };
  }, [days]);
  const cols = Math.ceil((days.length + lead) / 7);

  // a ripple spreads from the pointer: nearby squares lift and grow, written straight to the DOM
  const ripple = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cells.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = ((e.clientX - r.left) / r.width) * cols, cy = ((e.clientY - r.top) / r.height) * 7;
    const kids = el.children as HTMLCollectionOf<HTMLElement>;
    for (let i = lead; i < kids.length; i++) {
      const d = Math.hypot(Math.floor(i / 7) + 0.5 - cx, (i % 7) + 0.5 - cy);
      kids[i].style.transform = d < 3.5 ? `translateY(${(-(3.5 - d) * 1.4).toFixed(1)}px) scale(${(1 + (3.5 - d) * 0.14).toFixed(2)})` : "";
    }
    setHover(days[Math.floor(cx) * 7 + Math.floor(cy) - lead] ?? null);
  };
  const calm = () => {
    for (const c of (cells.current?.children ?? []) as HTMLCollectionOf<HTMLElement>) c.style.transform = "";
    setHover(null);
  };

  return (
    <section className="board wrap" id="top" aria-labelledby="name">
      <div className="b-tile b-id" {...tile(0)}>
        <div className="b-label mono"><span>Full-stack developer</span><span><i className="live" aria-hidden />Open to roles from 2027</span></div>
        <div>
          <h1 id="name"><Rise text="Chinmay" from={0} /> <em><Rise text="Kudalkar" from={7} /></em></h1>
          <p className="b-lede">I build software for the web, phones and desktop, and I care how it feels to use.</p>
          <ul className="b-links mono">
            <li><a className="b-btn solid" href={`mailto:${EMAIL}`}>Email me</a></li>
            {SOCIALS.map(([label, href]) => (
              <li key={label}><a className="b-btn" href={href}>{label}<ArrowUpRight weight="light" /></a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="b-tile b-now" {...tile(1)}>
        <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <path className="road" d="M-20 250 C 60 240, 70 150, 140 160 S 230 230, 250 140 S 220 40, 320 30" />
          <path className="trip" id="trip" d="M-20 250 C 60 240, 70 150, 140 160 S 230 230, 250 140 S 220 40, 320 30" />
          <circle className="stop" cx="140" cy="160" r="4" />
          <circle className="stop" cx="250" cy="140" r="4" />
          <circle className="car" r="6"><animateMotion dur="9s" repeatCount="indefinite"><mpath href="#trip" /></animateMotion></circle>
        </svg>
        <div className="b-label mono"><span><i className="live" aria-hidden />Now</span><span>Since Aug 2026</span></div>
        <div>
          <h2>Interning at ideaForge</h2>
          <p>Building iF FleetDesk: booking, dispatch and live vehicle tracking, on web and mobile.</p>
        </div>
      </div>

      <div className="b-tile b-graph" {...tile(2)}>
        <div className="b-label mono">
          <span aria-live="polite">
            {hover
              ? <><b>{hover.count || "No"}</b> {hover.count === 1 ? "contribution" : "contributions"} · {long.format(at(hover.date))}</>
              : <><b>{total.toLocaleString("en-IN")}</b> contributions in the last year</>}
          </span>
          <span>Streak <b>{streak.current}</b>d · best <b>{streak.longest}</b>d</span>
        </div>
        <div>
          <div className="b-months mono" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden>
            {months.map((m) => <span key={m.col} style={{ gridColumn: m.col + 1 }}>{m.label}</span>)}
          </div>
          <div className="b-cells" ref={cells} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            role="img" aria-label={`${total} GitHub contributions in the last year`} onPointerMove={ripple} onPointerLeave={calm}>
            {Array.from({ length: lead }, (_, i) => <i key={`pad${i}`} className="pad" />)}
            {days.map((d, i) => <i key={d.date} data-l={d.level} style={{ "--c": Math.floor((i + lead) / 7) } as React.CSSProperties} />)}
          </div>
        </div>
      </div>

      <a className="b-tile b-next" href="#work" {...tile(3)}>
        <div className="b-label mono"><span>Latest project</span><ArrowUpRight weight="light" /></div>
        <div>
          <h2>Link All</h2>
          <p>Copy on one device, paste on another.</p>
        </div>
      </a>
    </section>
  );
}
