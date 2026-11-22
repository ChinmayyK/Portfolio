"use client";

import { useEffect, useRef, useState } from "react";
import { motion, reducedMotion } from "@/lib/motion";

// An invented street grid and an invented trip. It illustrates what FleetDesk does; it is not its UI.
const MAJOR = ["M0 540 L1200 380", "M250 0 L330 800", "M770 0 L700 800", "M0 170 L1200 230"];
const MINOR = [
  "M90 0 V800", "M160 0 V800", "M430 0 V800", "M520 0 V800", "M610 0 V800", "M880 0 V800", "M980 0 V800", "M1090 0 V800",
  "M0 90 H1200", "M0 300 H1200", "M0 450 H1200", "M0 620 H1200", "M0 710 H1200",
];
const ROUTE = "M160 710 V450 H430 V300 H880 V90 H1090";
const STOPS = [
  { x: 160, y: 710, label: "A · Pickup", at: 0 },
  { x: 610, y: 300, label: "B · Stop", at: 0.5 },
  { x: 1090, y: 90, label: "C · Site", at: 1 },
];
const IDLE = [[520, 620], [980, 450], [90, 300], [700, 710], [1090, 620], [330, 90]];
export const TRIP_STATES = ["Booked", "Approved", "Dispatched", "On trip", "Closed"];

export default function RouteIllustration({ progress: fixed }: { progress?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const van = useRef<SVGGElement>(null);
  const [p, setP] = useState(fixed ?? 0);

  useEffect(() => {
    if (fixed !== undefined) return;
    const path = route.current!, len = path.getTotalLength();
    const place = (t: number) => {
      const pt = path.getPointAtLength(len * t);
      van.current!.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      path.style.strokeDashoffset = String(1 - t);
      setP(t);
    };
    if (reducedMotion()) { place(0.62); return; }
    const { ScrollTrigger } = motion();
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 75%",
      end: "bottom 25%",
      scrub: 0.6,
      onUpdate: (s) => place(s.progress),
    });
    place(0);
    return () => st.kill();
  }, [fixed]);

  // booked, approved and dispatched happen before the van moves far; the trip closes on arrival
  const stage = p < 0.04 ? 0 : p < 0.1 ? 1 : p < 0.18 ? 2 : p < 0.98 ? 3 : 4;
  const first = fixed !== undefined ? STOPS[1] : null;

  return (
    <div ref={root} className="route" data-media>
      <ol className="route-states label" aria-label="Trip states, illustrated">
        {TRIP_STATES.map((s, i) => (
          <li key={s} data-on={i <= stage || undefined} aria-current={i === stage ? "step" : undefined}>{s}</li>
        ))}
      </ol>
      <svg viewBox="0 0 1200 800" className="route-svg" role="img" aria-label="Illustration: a vehicle follows a route from a pickup, through a stop, to a site, on an invented street grid.">
        <g className="route-minor">{MINOR.map((d) => <path key={d} d={d} />)}</g>
        <g className="route-major">{MAJOR.map((d) => <path key={d} d={d} />)}</g>
        <g className="route-idle">{IDLE.map(([x, y]) => <rect key={`${x}-${y}`} x={x - 5} y={y - 5} width="10" height="10" />)}</g>
        <path d={ROUTE} className="route-ghost" />
        <path ref={route} d={ROUTE} className="route-line" pathLength={1} strokeDasharray="1" strokeDashoffset={fixed !== undefined ? 1 - fixed : 1} />
        {STOPS.map((s) => (
          <g key={s.label} transform={`translate(${s.x} ${s.y})`} className="route-stop" data-on={p >= s.at - 0.02 || undefined}>
            <circle r="9" />
            <text x="18" y="-14">{s.label}</text>
          </g>
        ))}
        <g ref={van} className="route-van" transform={first ? `translate(${first.x} ${first.y})` : "translate(160 710)"}>
          <circle r="26" className="route-van-pulse" />
          <rect x="-11" y="-11" width="22" height="22" />
        </g>
      </svg>
    </div>
  );
}
