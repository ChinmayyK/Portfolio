"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { motion, reducedMotion } from "@/lib/motion";
import { transitionState } from "@/lib/transition";
import { cast, measure, paint, type Glyphs } from "./shadow";
import { compass, light, mumbaiClock, mumbaiMidnight, sun } from "./sun";

/**
 * The hero is lit by the real sky over Mumbai. The type throws a shadow from wherever the sun is
 * right now: long and warm near sunrise and sunset, short at noon. After dark the moon takes
 * over if it's up, and the hero goes dark. A dial lets you drag the sun through the day.
 */

const minute = () => Math.floor(Date.now() / 60_000) * 60_000;
function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
}
/** the current minute, client only: the server renders the hero without a sky */
export const useNow = () => useSyncExternalStore(subscribe, minute, () => null);

const RAD = Math.PI / 180;
type Mood = "day" | "golden" | "night";
export const moodAt = (t: number): Mood => {
  const l = light(t);
  return l.by !== "sun" ? "night" : l.altitude < 9 ? "golden" : "day";
};
const SHADE: Record<Mood, string> = { day: "rgb(20 20 19 / .16)", golden: "rgb(96 52 14 / .2)", night: "rgb(0 0 0 / .3)" };

export function useSunlight(root: RefObject<HTMLElement | null>, time: number | null) {
  const timeRef = useRef(time);
  const drawRef = useRef<() => void>(() => {});

  useEffect(() => { timeRef.current = time; drawRef.current(); }, [time]);

  useEffect(() => {
    const el = root.current!;
    const surface = el.querySelector<HTMLElement>(".hero-layer:not(.is-xray)")!;
    const [lit, xray] = Array.from(el.querySelectorAll<HTMLCanvasElement>(".hero-shadow"));
    const html = document.documentElement;
    const { gsap } = motion();
    let glyphs: Glyphs | null = null, dead = false;
    const grow = { v: reducedMotion() ? 1 : 0 };

    const draw = () => {
      const t = timeRef.current;
      if (t === null) return;
      const mood = moodAt(t);
      el.dataset.light = mood;
      html.classList.toggle("hero-night", mood === "night");
      const l = light(t);
      if (!glyphs || l.by === "none" || grow.v === 0) {
        for (const c of [lit, xray]) c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
        return;
      }
      // letters stand about a third of their size off the page; the shadow is that height over tan(altitude)
      const height = glyphs.size * 0.32;
      const length = Math.min(el.clientWidth * 1.25, height / Math.tan(Math.max(l.altitude, 0.6) * RAD)) * grow.v;
      const away = (l.bearing + 180) * RAD;
      const shadow = cast(glyphs, { x: Math.sin(away), y: -Math.cos(away) }, Math.max(1, length));
      paint(lit, shadow, SHADE[mood]);
      paint(xray, shadow, "hatch");
      lit.style.setProperty("--soft", `${(0.5 + length * 0.004).toFixed(2)}px`);
    };
    drawRef.current = draw;

    const build = () => {
      glyphs = measure(Array.from(surface.querySelectorAll<HTMLElement>(".hero-name, .hero-role, .hero-arrow")), surface);
      draw();
    };
    document.fonts.ready.then(() => {
      if (dead) return;
      build();
      // the shadows lengthen in, like the light arriving
      if (grow.v === 0) gsap.to(grow, { v: 1, duration: 2.4, ease: "power2.out", delay: 0.7 + transitionState.enterDelay, onUpdate: draw });
    });
    let width = el.clientWidth, frame = 0;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    });
    ro.observe(el);
    return () => {
      dead = true; ro.disconnect(); cancelAnimationFrame(frame); gsap.killTweensOf(grow);
      drawRef.current = () => {};
      html.classList.remove("hero-night");
    };
  }, [root]);
}

// ── The dial ────────────────────────────────────────────────────────────
const DAY = 1440;
const W = 240, H = 64, MID = H / 2;
const xOf = (m: number) => (m / DAY) * W;
const yOf = (alt: number) => MID - (alt / 90) * (MID - 4);

function describe(t: number, pinned: boolean) {
  const l = light(t);
  const when = pinned ? `at ${mumbaiClock(t)}` : "right now";
  if (l.by === "sun") return { title: `Lit by the sun over Mumbai, ${when}.`, meta: `${mumbaiClock(t)} · ${Math.max(0, Math.round(l.altitude))}° up, in the ${compass(l.bearing)}` };
  if (l.by === "moon") return { title: `Lit by the moon over Mumbai, ${when}.`, meta: `${mumbaiClock(t)} · the moon is ${Math.round(l.altitude)}° up, in the ${compass(l.bearing)}` };
  return { title: `Night in Mumbai, ${when}.`, meta: `${mumbaiClock(t)} · no sun, no moon. Drag the sun along.` };
}

export function SunDial({ time, pinned, onScrub }: { time: number | null; pinned: boolean; onScrub: (t: number | null) => void }) {
  const track = useRef<HTMLDivElement>(null);
  if (time === null) return <div className="hero-sun" aria-hidden="true" />;

  const midnight = mumbaiMidnight(time);
  const m = Math.round((time - midnight) / 60_000);
  const path = Array.from({ length: DAY / 15 + 1 }, (_, i) => `${i ? "L" : "M"}${xOf(i * 15).toFixed(1)} ${yOf(sun(midnight + i * 15 * 60_000).altitude).toFixed(1)}`).join(" ");
  const s = sun(time);
  const { title, meta } = describe(time, pinned);
  const set = (min: number) => onScrub(midnight + ((Math.round(min) % DAY) + DAY) % DAY * 60_000);
  const fromPointer = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    set(Math.min(DAY - 1, Math.max(0, ((e.clientX - r.left) / r.width) * DAY)));
  };

  return (
    <div className="hero-sun">
      <p className="hero-sun-title">{title}</p>
      <p className="hero-sun-meta t-small">{meta}</p>
      <div
        ref={track}
        className="sun-track"
        role="slider"
        tabIndex={0}
        aria-label="Time of day in Mumbai"
        aria-valuemin={0}
        aria-valuemax={DAY - 1}
        aria-valuenow={m}
        aria-valuetext={mumbaiClock(time)}
        data-cursor="Drag"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e); }}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 60 : 15;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); set(m + step); }
          else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); set(m - step); }
          else if (e.key === "Home" || e.key === "Escape") { e.preventDefault(); onScrub(null); }
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <line className="sun-horizon" x1="0" x2={W} y1={MID} y2={MID} />
          <clipPath id="sun-above"><rect x="0" y="0" width={W} height={MID} /></clipPath>
          <path className="sun-path is-below" d={path} />
          <path className="sun-path" d={path} clipPath="url(#sun-above)" />
          <line className="sun-now" x1={xOf(m)} x2={xOf(m)} y1={MID - 3} y2={MID + 3} />
          <circle className="sun-thumb" cx={xOf(m)} cy={yOf(s.altitude)} r="6.5" />
        </svg>
      </div>
      <p className="hero-sun-foot t-label">
        <span>Drag the sun</span>
        {pinned && <button type="button" className="uhover" onClick={() => onScrub(null)}>Back to now</button>}
      </p>
    </div>
  );
}
