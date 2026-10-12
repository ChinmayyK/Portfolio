"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import Shot from "@/components/Shot";

// what's inside Link All, called out around the phone: left side, then right, top to bottom
const CALLOUTS: { side: "l" | "r"; y: string; t: string; d: string }[] = [
  { side: "l", y: "20%", t: "One Rust core", d: "Shared by native apps in Swift, Kotlin, WinUI 3 and GTK" },
  { side: "r", y: "39%", t: "Resumable transfers", d: "Chunk-level acks survive a dropped connection" },
  { side: "l", y: "61%", t: "X25519 + ChaCha20", d: "End-to-end encrypted, paired by code or QR" },
  { side: "r", y: "76%", t: "Secret filter", d: "OTPs, passwords and cards never sync" },
];

export default function Hero({ commits: built }: { commits: number }) {
  const [stage, setStage] = useState(""); // "" -> "go" (entrance) -> "go settled" (pointer drift, hover)
  const hero = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState("");

  const [commits, setCommits] = useState(built);
  const name = useRef<HTMLHeadingElement>(null);
  useLively(hero, name);
  useBall(name);

  // refresh the count baked in at build with today's; the edge cache makes this the same request the
  // graph further down makes. One retry, since a cold edge cache has to wait on GitHub.
  useEffect(() => {
    const get = (left: number): Promise<void> =>
      fetch("/api/commits", { signal: AbortSignal.timeout(12000) })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j: { total: { lastYear: number } }) => setCommits(j.total.lastYear))
        .catch(() => (left ? new Promise<void>((ok) => setTimeout(ok, 1500)).then(() => get(left - 1)) : undefined));
    get(1);
  }, []);

  // local time in India, ticking over each minute (rendered after mount, so the static HTML never holds a stale time)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    let t = 0;
    const tick = () => { setTime(fmt.format(new Date()).toUpperCase()); t = window.setTimeout(tick, 60000 - (Date.now() % 60000)); };
    tick();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStage("go"));
    const t = setTimeout(() => setStage("go settled"), 2000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  // the phone drifts with the pointer, a plate lifted off the drawing
  useEffect(() => {
    const el = hero.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (min-width: 901px)").matches) return;
    let raf = 0, tx = 0, ty = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        plate.current?.querySelectorAll<HTMLElement>(".bezel").forEach((b) => {
          const d = Number(b.dataset.depth);
          b.style.setProperty("--px", `${(-tx * d).toFixed(1)}px`);
          b.style.setProperty("--py", `${(-ty * d).toFixed(1)}px`);
        });
      });
    };
    el.addEventListener("pointermove", move);
    return () => { el.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <header className={`hero ${stage}`} id="top" ref={hero}>
      <div className="wrap">
        <div>
          <span className="chip" data-r>Full-stack developer</span>
          <h1 aria-label="Chinmay Kudalkar" ref={name}>
            <span className="ln" aria-hidden="true">{letters("Chinmay", 0)}</span>
            <span className="ln" aria-hidden="true">{letters("Kudalkar", 7)}<span className="ch dot" style={{ "--n": 15 } as CSSProperties}>.</span></span>
          </h1>
          <p className="lede" data-r style={{ "--d": "340ms" } as CSSProperties}>
            I like the parts nobody screenshots. <b>Here&rsquo;s what&rsquo;s inside the app I&rsquo;m proudest of</b>: Link All, clipboard and files across four platforms with no cloud.
          </p>
          <div className="cta" data-r style={{ "--d": "420ms" } as CSSProperties}>
            <a className="pill dark" href="#link-all">See my work <span className="isl"><ArrowDown weight="light" /></span></a>
            <a className="pill light" href="/resume" target="_blank" rel="noopener">Résumé <span className="isl"><ArrowUpRight weight="light" /></span></a>
          </div>
          <p className="status" data-r style={{ "--d": "520ms" } as CSSProperties}>
            <span>Now</span> <a href="#now">Interning at ideaForge</a> <i className="loc">· Navi Mumbai</i>{time && <> <i>· <time>{time} IST</time></i></>}
            {" "}<i>· B.Tech &rsquo;27</i>{commits > 0 && <> <i>· <a href="#receipts">{commits.toLocaleString("en-IN")} contributions</a></i></>}
          </p>
        </div>

        <figure className="spec" aria-labelledby="spec-cap">
          <figcaption id="spec-cap"><span>Fig. 01 — Link All</span><span>Android</span></figcaption>
          <div className="plate" ref={plate}>
            <a href="#link-all" className="bezel lifted phone" data-depth={30} aria-label="Link All on Android. See the project.">
              <div className="core"><Shot file="linkall-android-home.png" alt="" /></div>
            </a>
            <ol>
              {CALLOUTS.map((c, i) => (
                <li key={c.t} className={c.side} style={{ "--y": c.y, "--n": i } as CSSProperties}>
                  <p><small>0{i + 1}</small><b>{c.t}</b>{c.d}</p><i aria-hidden="true" />
                </li>
              ))}
            </ol>
            <span className="dim" aria-hidden="true">macOS · Windows · Linux · Android</span>
          </div>
        </figure>
      </div>
    </header>
  );
}

// the i is drawn dotless, with its dot as a separate piece that can bounce in on its own
const letters = (word: string, from: number) =>
  [...word].map((c, i) => c === "i"
    ? <span className="ch" key={i} style={{ "--n": from + i } as CSSProperties}>{"ı"}<span className="tittle" /></span>
    : <span className="ch" key={i} style={{ "--n": from + i } as CSSProperties}>{c}</span>);

// Under the pointer the name thins out: Geist is a variable font, so each letter's weight eases from
// bold down towards light by how close the pointer is, and springs back as it moves away.
function useLively(hero: RefObject<HTMLElement | null>, name: RefObject<HTMLHeadingElement | null>) {
  useEffect(() => {
    const el = name.current, box = hero.current;
    if (!el || !box || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover)").matches) return;
    const REST = 700, THIN = 260;
    const chars = [...el.querySelectorAll<HTMLElement>(".ch")];
    const w = chars.map(() => REST), v = chars.map(() => 0);
    let centres: { x: number; y: number }[] = [];
    let px = -1e5, py = -1e5, em = 100, raf = 0;

    // letter centres in page coordinates, taken while the name is at rest
    const measure = () => {
      if (w.some((x) => Math.abs(x - REST) > 1)) return;
      em = parseFloat(getComputedStyle(el).fontSize);
      centres = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + scrollX + r.width / 2, y: r.top + scrollY + r.height / 2 };
      });
    };
    const tick = () => {
      raf = 0;
      let busy = false;
      chars.forEach((c, i) => {
        const dx = (centres[i].x - px) / (em * 0.7), dy = (centres[i].y - py) / (em * 0.9);
        const target = REST - (REST - THIN) * Math.exp(-(dx * dx + dy * dy));
        v[i] = (v[i] + (target - w[i]) * 0.14) * 0.72;
        w[i] += v[i];
        if (Math.abs(v[i]) > 0.3 || Math.abs(target - w[i]) > 0.5) busy = true;
        c.style.fontWeight = w[i].toFixed(0);
      });
      if (busy) raf = requestAnimationFrame(tick);
      else if (px < -1e4) chars.forEach((c, i) => { w[i] = REST; c.style.fontWeight = ""; }); // fully at rest again
    };
    const kick = () => { if (!raf && centres.length) raf = requestAnimationFrame(tick); };
    const move = (e: PointerEvent) => { if (!centres.length) measure(); px = e.pageX; py = e.pageY; kick(); };
    const leave = () => { px = py = -1e5; kick(); };
    box.addEventListener("pointerenter", measure);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);
    addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      box.removeEventListener("pointerenter", measure); box.removeEventListener("pointermove", move); box.removeEventListener("pointerleave", leave);
      removeEventListener("resize", measure);
    };
  }, [hero, name]);
}

// The dot of the i arrives last: it comes in from the right edge, hits the bottom of the screen twice,
// arcs up onto its letter, and bounces four times on the i, each lower and quicker, before it settles.
function useBall(name: RefObject<HTMLHeadingElement | null>) {
  useEffect(() => {
    const h1 = name.current, dot = h1?.querySelector<HTMLElement>(".tittle");
    if (!h1 || !dot) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { dot.style.opacity = "1"; return; }
    let raf = 0, ball: HTMLDivElement | undefined;

    const fly = () => {
      const d = dot.getBoundingClientRect().width;
      ball = document.createElement("div");
      ball.className = "ball";
      ball.style.width = ball.style.height = `${d}px`;
      document.body.appendChild(ball);

      const target = () => dot.getBoundingClientRect(); // re-read each frame in case the page scrolls
      const t0 = target();
      const ground = innerHeight - d; // the bottom edge of the screen
      const x0 = innerWidth + d, y0 = innerHeight * 0.15; // enters high up, already falling
      const span = x0 - t0.left;
      const hit1 = t0.left + span * 0.62, hit2 = t0.left + span * 0.28; // where it touches the ground
      const drop = ground - y0;
      // three legs: fall to the first hit, a bounce to the second, then one arc up onto the i
      const legs = [0.6, 0.5, 0.7];
      const total = legs.reduce((a, b) => a + b, 0);
      const start = performance.now();
      let squash = 0, leg = -1;

      const step = (now: number) => {
        const t = (now - start) / 1000;
        const tg = target();
        let x: number, y: number, vx: number, vy: number, u: number;
        if (t < legs[0]) {
          u = t / legs[0];
          x = x0 + (hit1 - x0) * u; y = y0 + drop * u * u;
          vx = (hit1 - x0) / legs[0]; vy = 2 * drop * u / legs[0];
        } else if (t < legs[0] + legs[1]) {
          u = (t - legs[0]) / legs[1];
          const hb = drop * 0.5;
          x = hit1 + (hit2 - hit1) * u; y = ground - hb * 4 * u * (1 - u);
          vx = (hit2 - hit1) / legs[1]; vy = -hb * 4 * (1 - 2 * u) / legs[1];
        } else {
          u = Math.min(1, (t - legs[0] - legs[1]) / legs[2]);
          const rise = ground - tg.top, hc = rise * 0.3 + 40;
          x = hit2 + (tg.left - hit2) * u; y = ground - rise * u - hc * 4 * u * (1 - u);
          vx = (tg.left - hit2) / legs[2]; vy = (-rise - hc * 4 * (1 - 2 * u)) / legs[2];
        }
        const now_leg = t < legs[0] ? 0 : t < legs[0] + legs[1] ? 1 : 2;
        if (now_leg !== leg) { if (leg >= 0) squash = 1; leg = now_leg; } // it just touched the ground
        if (t >= total) { land(); return; }

        let shape: string;
        if (squash > 0.05) {
          shape = `scale(${1 + squash * 0.45}, ${1 - squash * 0.4})`;
          squash *= 0.72;
        } else {
          const s = Math.min(1.25, 1 + Math.hypot(vx, vy) / 9000);
          shape = `rotate(${(Math.atan2(vy, vx) * 180 / Math.PI).toFixed(1)}deg) scale(${s.toFixed(3)}, ${(1 / s).toFixed(3)})`;
        }
        ball!.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) ${shape}`;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const land = () => {
      ball?.remove(); ball = undefined;
      dot.style.opacity = "1";
      // real bounces: constant gravity, and each impact keeps E of the speed, so every hop is E² as high
      const G = 3600, E = 0.7, HOPS = 4;
      const H = parseFloat(getComputedStyle(h1).fontSize) * 0.7; // the first hop's height
      const v0 = Math.sqrt(2 * G * H);
      let y = 0, v = v0, hops = 0, squash = 1, last = performance.now();
      const hop = (now: number) => {
        const dt = Math.min(1 / 30, (now - last) / 1000);
        last = now;
        if (hops < HOPS) { v -= G * dt; y += v * dt; }
        if (hops < HOPS && y <= 0) {
          y = 0;
          squash = Math.min(1, -v / v0); // harder hits squash more
          v = ++hops >= HOPS ? 0 : -v * E;
        }
        const q = squash > 0.03 ? squash : 0;
        squash *= 0.6;
        const sx = 1 + q * 0.4, sy = 1 - q * 0.38;
        dot.style.transform = `translateY(${(-y).toFixed(2)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
        if (hops >= HOPS && q === 0) { dot.style.transform = ""; return; }
        raf = requestAnimationFrame(hop);
      };
      raf = requestAnimationFrame(hop);
    };

    const t = window.setTimeout(fly, 2050); // once the letters are in
    return () => { clearTimeout(t); cancelAnimationFrame(raf); ball?.remove(); dot.style.transform = ""; };
  }, [name]);
}
