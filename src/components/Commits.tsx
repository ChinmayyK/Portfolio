"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";

const USER = "ChinmayyK";
// Public mirror of the GitHub contribution calendar (no token needed, CORS open).
const API = `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`;

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type State = { kind: "loading" } | { kind: "error" } | { kind: "ok"; days: (Day | null)[]; total: number };

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** GitHub contribution graph, drawn in the site's own palette. Loads when it's about to scroll into view. */
export default function Commits() {
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      fetch(API)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j: { total: { lastYear: number }; contributions: Day[] }) => {
          if (cancelled) return;
          const days = j.contributions;
          // pad the first column so each column is one Sunday-to-Saturday week, like GitHub
          const lead = new Date(days[0].date + "T00:00:00").getDay();
          setState({ kind: "ok", days: [...Array(lead).fill(null), ...days], total: j.total.lastYear });
          dispatchEvent(new CustomEvent("commits:total", { detail: j.total.lastYear }));
        })
        .catch(() => !cancelled && setState({ kind: "error" }));
    }, { rootMargin: "900px 0px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  // draw in once the data is there and the graph is on screen; on phones, start scrolled to the latest weeks
  useEffect(() => {
    if (state.kind !== "ok" || !box.current) return;
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [state.kind]);

  return (
    <div className="graph-card" ref={box}>
      <div className="graph-head">
        <p className="graph-total">
          {state.kind === "ok" ? <><b>{state.total.toLocaleString("en-IN")}</b> contributions in the last year</> : state.kind === "error" ? "Couldn't load the graph right now." : "Counting commits…"}
        </p>
        <a className="pill light" href={`https://github.com/${USER}`}>@{USER} <span className="isl"><ArrowUpRight weight="light" /></span></a>
      </div>
      <div className="graph-scroll" ref={scroller}>
        <div className={`graph${shown ? " in" : ""}${state.kind === "loading" ? " skeleton" : ""}`} role="img"
          aria-label={state.kind === "ok" ? `GitHub contribution graph: ${state.total} contributions in the last year` : "GitHub contribution graph"}>
          {state.kind === "ok"
            ? state.days.map((d, i) => d
              ? <i key={d.date} className={`l${d.level}`} style={{ "--c": Math.floor(i / 7) } as CSSProperties} title={`${d.count} on ${fmt.format(new Date(d.date + "T00:00:00"))}`} />
              : <i key={`pad-${i}`} className="pad" />)
            : Array.from({ length: 53 * 7 }, (_, i) => <i key={i} className="l0" />)}
        </div>
      </div>
      <div className="graph-key" aria-hidden="true"><span>Less</span><i className="l0" /><i className="l1" /><i className="l2" /><i className="l3" /><i className="l4" /><span>More</span></div>
    </div>
  );
}
