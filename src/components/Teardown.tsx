"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Shot from "@/components/Shot";

// Link All's Android app taken apart, front to back. --p on the figure runs 0 (upright and whole)
// to 1 (tilted and fully apart); the CSS works the 3D out from it, and the labels are placed here.
const LAYERS = [
  { k: "screen", t: "The screenshot", d: "The only layer anyone sees" },
  { k: "ui", t: "Native UI", d: "Compose here; SwiftUI, WinUI 3 and GTK elsewhere" },
  { k: "filter", t: "Secret filter", d: "OTPs, passwords and cards never sync" },
  { k: "core", t: "One Rust core", d: "The same engine under all four apps" },
  { k: "wire", t: "The wire", d: "X25519 + ChaCha20-Poly1305, chunks that resume" },
] as const;

const CLIPS: [text: string, kept: boolean][] = [
  ["meeting moved to 4:30", true],
  ["Your OTP is ██████", false],
  ["git push --force-with-lease", true],
  ["4111 ████ ████ ████", false],
  ["see you at the station", true],
  ["pass: ██████████", false],
];

// a fixed scatter of hex for the wire, and the transfer's chunks: acknowledged, the one that went again, still to come
const HEX = Array.from({ length: 168 }, (_, i) => ((i * 2654435761) >>> 0).toString(16).slice(-2)).join(" ");
const CHUNKS = Array.from({ length: 36 }, (_, i) => (i < 17 ? "ok" : i === 17 ? "redo" : i < 24 ? "ok" : ""));

const smooth = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c); };

export default function Teardown() {
  const fig = useRef<HTMLElement>(null);
  useTeardown(fig);
  return (
    <figure className="tear" ref={fig} aria-label="Link All's Android app taken apart into five layers: the screen, the native UI, the secret filter, the Rust core and the encrypted wire.">
      <div className="tear-stack" aria-hidden="true">
        {LAYERS.map((l, i) => (
          <div key={l.k} className={`slab ${l.k}`} style={{ "--i": i } as CSSProperties}>
            <div className="face">{faces[l.k]}</div>
            <i className="at" />
          </div>
        ))}
      </div>
      <ol className="tear-tags" aria-hidden="true">
        {LAYERS.map((l, i) => <li key={l.k}><i /><small>0{i + 1}</small><b>{l.t}</b><span>{l.d}</span></li>)}
      </ol>
      <figcaption>Fig. 01 — Link All on Android, taken apart</figcaption>
    </figure>
  );
}

// Opens a little by itself on load, so there's something to notice, then scrolling opens it the rest
// of the way: on desktop while the hero holds the screen, on phones as the figure passes. The pointer
// tilts it. Each label sits in a column right of the stack, level with its layer, with a leader to it.
// Reduced motion shows it fully open and still.
function useTeardown(fig: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = fig.current, hero = el?.closest<HTMLElement>(".hero");
    if (!el || !hero) return;
    const anchors = [...el.querySelectorAll<HTMLElement>(".slab .at")];
    const plates = [...el.querySelectorAll<HTMLElement>(".slab .face")];
    const tags = [...el.querySelectorAll<HTMLElement>(".tear-tags li")];
    const s = { tease: 0, scroll: 0, mx: 0, my: 0 };

    const draw = () => {
      const p = Math.max(s.tease, s.scroll), open = smooth((p - 0.1) / 0.75);
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--mx", s.mx.toFixed(3));
      el.style.setProperty("--my", s.my.toFixed(3));
      const box = el.getBoundingClientRect();
      const pts = anchors.map((a) => { const r = a.getBoundingClientRect(); return { x: r.left - box.left, y: r.top - box.top }; });
      // clear of every layer, but never past the figure's edge
      const col = Math.min(Math.max(...plates.map((f) => f.getBoundingClientRect().right)) - box.left + 28, box.width - tags[0].offsetWidth);
      let floor = -Infinity;
      tags.forEach((t, i) => {
        const y = Math.max(pts[i].y, floor + 12); // never on top of the label above
        floor = y + t.offsetHeight;
        const dx = pts[i].x - col, dy = pts[i].y - y;
        t.style.transform = `translate(${col.toFixed(1)}px, ${y.toFixed(1)}px)`;
        t.style.setProperty("--len", `${Math.hypot(dx, dy).toFixed(1)}px`);
        t.style.setProperty("--ang", `${Math.atan2(dy, dx).toFixed(4)}rad`);
        t.style.opacity = smooth((open - 0.3 - i * 0.08) * 4).toFixed(3);
      });
    };
    // tweens only mark it dirty; it's drawn once per frame however many of them moved
    let dirty = true;
    const mark = () => { dirty = true; };
    const tick = () => { if (dirty) { dirty = false; draw(); } };
    gsap.ticker.add(tick);
    addEventListener("resize", mark);
    const stop = () => { gsap.ticker.remove(tick); removeEventListener("resize", mark); };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { s.tease = 1; return stop; }

    gsap.registerPlugin(ScrollTrigger);
    const tease = gsap.to(s, { tease: 0.4, duration: 2, delay: 0.9, ease: "power3.inOut", onUpdate: mark });
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 901px)", narrow: "(max-width: 900px)" }, (ctx) => { // gsap runs this only while one matches
      gsap.to(s, {
        scroll: 1, ease: "none", onUpdate: mark,
        scrollTrigger: (ctx.conditions as { wide: boolean }).wide
          ? { trigger: hero, start: "top top", end: "bottom bottom", scrub: 0.8 }
          : { trigger: el, start: "top 90%", end: "center 55%", scrub: 0.8 },
      });
    });
    const move = (e: PointerEvent) => {
      gsap.to(s, { mx: e.clientX / innerWidth - 0.5, my: e.clientY / innerHeight - 0.5, duration: 0.9, ease: "power3.out", overwrite: "auto", onUpdate: mark });
    };
    if (matchMedia("(hover: hover)").matches) hero.addEventListener("pointermove", move);
    return () => { stop(); tease.kill(); mm.revert(); gsap.killTweensOf(s); hero.removeEventListener("pointermove", move); };
  }, [fig]);
}

const faces: Record<(typeof LAYERS)[number]["k"], ReactNode> = {
  screen: <Shot file="linkall-android-home.png" alt="" loading="eager" />,
  // the same screen, as its layout boxes
  ui: (
    <>
      <i style={{ top: "5%", height: "4%", width: "40%" }} />
      <i style={{ top: "11%", height: "21%" }} />
      <i style={{ top: "37%", height: "3%", width: "22%" }} />
      <i style={{ top: "42%", height: "15%" }} />
      <i style={{ top: "61%", height: "3%", width: "18%" }} />
      <i style={{ top: "66%", height: "8%" }} />
      <i style={{ top: "88%", height: "6%", left: "18%", right: "18%" }} />
    </>
  ),
  filter: (
    <ul>
      {CLIPS.map(([t, kept]) => <li key={t} className={kept ? "" : "no"}><span>{t}</span><em>{kept ? "sync" : "kept"}</em></li>)}
    </ul>
  ),
  core: (
    <>
      <span className="die"><b>core</b><small>rust</small></span>
      {["Swift", "Kotlin", "WinUI 3", "GTK"].map((n, i) => <span key={n} className={`pin p${i}`}>{n}</span>)}
    </>
  ),
  wire: (
    <>
      <p className="hex">{HEX}</p>
      <div className="chunks">{CHUNKS.map((c, i) => <i key={i} className={c} />)}</div>
    </>
  ),
};
