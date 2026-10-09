"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { ArrowDown, ArrowUpRight, CheckCircle, Copy, Image, LinkSimple, TextAa } from "@phosphor-icons/react";
import Shot from "@/components/Shot";
import { detect } from "@/lib/visitor";

export default function Hero({ commits: built }: { commits: number }) {
  const [stage, setStage] = useState(""); // "" -> "go" (entrance) -> "go settled" (pointer drift, hover)
  const hero = useRef<HTMLElement>(null);
  const cas = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState("");
  const [win, setWin] = useState(false); // Windows visitors see Link All on Windows, matching the scene this card flies into

  const [commits, setCommits] = useState(built);
  const relay = useRelay(cas);
  const name = useRef<HTMLHeadingElement>(null);
  useLively(hero, name);
  useBall(name);

  useEffect(() => { setWin(!!detect()?.win); }, []);

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

  // cards drift by depth with the pointer, like plates at different heights
  useEffect(() => {
    const el = hero.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (min-width: 901px)").matches) return;
    let raf = 0, tx = 0, ty = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cas.current?.querySelectorAll<HTMLElement>(".bezel").forEach((b) => {
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
          <ul className="proof" data-r style={{ "--d": "340ms" } as CSSProperties}>
            <li><a href="#link-all"><b>Link All</b> macOS, Windows, Linux, Android</a></li>
            <li className={commits ? "" : "wait"}><a href="#receipts"><b>{commits ? commits.toLocaleString("en-IN") : "—"}</b> contributions this year</a></li>
            <li><b>B.Tech</b> graduating 2027</li>
          </ul>
          <div className="cta" data-r style={{ "--d": "420ms" } as CSSProperties}>
            <a className="pill dark" href="#link-all">See my work <span className="isl"><ArrowDown weight="light" /></span></a>
            <a className="pill light" href="/resume" target="_blank" rel="noopener">Résumé <span className="isl"><ArrowUpRight weight="light" /></span></a>
          </div>
          <p className="status" data-r style={{ "--d": "520ms" } as CSSProperties}>
            <span>Now</span> <a href="#now">Interning at ideaForge</a> <i className="loc">· Navi Mumbai</i>{time && <> <i>· <time>{time} IST</time></i></>}
          </p>
        </div>

        <div className="cascade" ref={cas}>
          <a href="#link-all" className="bezel lifted main" data-depth={22} style={{ "--i": 0 } as CSSProperties}
            aria-label="Link All, my latest project. See the project.">
            <div className="core">
              <Shot file={win ? "linkall-win-clipboard.png" : "linkall-mac-devices.png"} alt="" />
              <Note show={relay.at === "mac"} kind={relay.phase} item={relay.item} from="your phone" />
            </div>
          </a>
          <a href="#link-all" className="bezel lifted phone" data-depth={40} style={{ "--i": 1 } as CSSProperties}
            tabIndex={-1} aria-hidden="true">
            <div className="core">
              <Shot file="linkall-android-home.png" alt="" />
              <Note show={relay.at === "phone"} kind={relay.phase} item={relay.item} from={win ? "your PC" : "your Mac"} />
            </div>
          </a>
          <span className="relay" ref={relay.ref} aria-hidden="true">{ICON[relay.item.kind]}<span>{relay.item.label}</span></span>
        </div>
      </div>
    </header>
  );
}

// While the visitor reads, the two cards pass a clip back and forth: copied on one device, it travels
// over and lands on the other. Phone to Mac, then Mac to phone, and so on.
type Kind = "text" | "link" | "photo";
const ICON: Record<Kind, ReactNode> = { text: <TextAa weight="light" />, link: <LinkSimple weight="light" />, photo: <Image weight="light" /> };
const CLIPS: { kind: Kind; label: string }[] = [
  { kind: "text", label: "Gate 12, boards 07:10" },
  { kind: "link", label: "github.com/ChinmayyK" },
  { kind: "photo", label: "IMG_2041.jpg" },
];
type Phase = "" | "copy" | "land";

function Note({ show, kind, item, from }: { show: boolean; kind: Phase; item: { kind: Kind; label: string }; from: string }) {
  // the sending device says "Copied"; the receiving one shows what arrived
  const copy = kind === "copy";
  return (
    <span className={`note${show && kind ? " on" : ""}${copy ? " copy" : ""}`} aria-hidden="true">
      {copy ? <><Copy weight="bold" /> Copied</> : <><CheckCircle weight="fill" /><span><small>From {from}</small>{item.label}</span></>}
    </span>
  );
}

function useRelay(cas: RefObject<HTMLDivElement | null>) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<Phase>("");
  const [at, setAt] = useState<"" | "mac" | "phone">("");

  useEffect(() => {
    const box = cas.current, el = ref.current;
    if (!box || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let live = true, t = 0, seen = false, anim: Animation | undefined;
    const wait = (ms: number) => new Promise<void>((r) => { t = window.setTimeout(r, ms); });
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.5 });
    io.observe(box);
    // held while off screen, in a background tab, or once the cards start flying into the Link All chapter
    const idle = () => !seen || document.hidden || Number(box.style.getPropertyValue("--k") || 1) < 0.99;
    const centre = (sel: string, b: DOMRect, dy = 0.5) => {
      const r = box.querySelector(sel)!.getBoundingClientRect();
      return [r.left - b.left + r.width / 2, r.top - b.top + r.height * dy];
    };

    (async () => {
      await wait(2600); // let the entrance finish
      for (let i = 0; live; i++) {
        while (live && idle()) await wait(700);
        if (!live) return;
        const up = i % 2 === 1; // odd rounds go Mac to phone
        setN(i);
        setAt(up ? "mac" : "phone"); setPhase("copy");
        await wait(900);
        const b = box.getBoundingClientRect();
        const [fx, fy] = centre(up ? ".main .core" : ".phone .core", b, up ? 0.4 : 0.5);
        const [tx, ty] = centre(up ? ".phone .core" : ".main .core", b, up ? 0.5 : 0.4);
        const lift = Math.min(140, Math.hypot(tx - fx, ty - fy) * 0.35);
        setAt("");
        anim = el.animate([
          { translate: `${fx}px ${fy}px`, scale: 0.4, opacity: 0 },
          { translate: `${fx + (tx - fx) * 0.15}px ${fy + (ty - fy) * 0.15 - lift * 0.5}px`, scale: 1, opacity: 1, offset: 0.18 },
          { translate: `${(fx + tx) / 2}px ${(fy + ty) / 2 - lift}px`, scale: 1, opacity: 1, offset: 0.5 },
          { translate: `${tx}px ${ty}px`, scale: 0.5, opacity: 0 },
        ], { duration: 1300, easing: "cubic-bezier(.45, 0, .25, 1)" });
        await anim.finished.catch(() => {});
        if (!live) return;
        setAt(up ? "phone" : "mac"); setPhase("land");
        await wait(2600);
        setAt(""); setPhase("");
        await wait(1500);
      }
    })();
    return () => { live = false; clearTimeout(t); anim?.cancel(); io.disconnect(); };
  }, [cas]);

  return { ref, phase, at, item: CLIPS[n % CLIPS.length] };
}

// the i is drawn dotless, with its dot as a separate piece that can bounce in on its own
const letters = (word: string, from: number) =>
  [...word].map((c, i) => c === "i"
    ? <span className="ch" key={i} style={{ "--n": from + i } as CSSProperties}>{"ı"}<span className="tittle" /></span>
    : <span className="ch" key={i} style={{ "--n": from + i } as CSSProperties}>{c}</span>);

// The name is alive: letters near the pointer lift like keys under a finger and spring back, and every
// so often a small wave runs through it on its own (a tap on the name sends one too, for phones).
function useLively(hero: RefObject<HTMLElement | null>, name: RefObject<HTMLHeadingElement | null>) {
  useEffect(() => {
    const el = name.current, box = hero.current;
    if (!el || !box || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = [...el.querySelectorAll<HTMLElement>(".ch")];
    const y = chars.map(() => 0), v = chars.map(() => 0);
    let centres: { x: number; y: number }[] = [];
    let px = -1e5, py = -1e5, em = 100, raf = 0, wave = -1, lastMove = 0, seen = true;

    // letter centres in page coordinates, minus whatever lift they currently have
    const measure = () => {
      em = parseFloat(getComputedStyle(el).fontSize);
      centres = chars.map((c, i) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + scrollX + r.width / 2, y: r.top + scrollY + r.height / 2 - y[i] };
      });
    };
    const tick = (now: number) => {
      raf = 0;
      let busy = false;
      const t = wave < 0 ? -1 : (now - wave) / 1000;
      if (t > 2.2) wave = -1;
      chars.forEach((c, i) => {
        const dx = (centres[i].x - px) / (em * 0.55), dy = (centres[i].y - py) / (em * 0.9);
        let target = -0.13 * em * Math.exp(-(dx * dx + dy * dy));
        if (t >= 0) { const k = t * 11 - i; target += -0.09 * em * Math.exp(-k * k / 2.5); }
        v[i] = (v[i] + (target - y[i]) * 0.16) * 0.74; // spring, a little under-damped
        y[i] += v[i];
        if (Math.abs(v[i]) > 0.02 || Math.abs(target - y[i]) > 0.05) busy = true;
        c.style.translate = `0 ${y[i].toFixed(2)}px`;
      });
      if (busy || wave >= 0) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const sendWave = () => { measure(); wave = performance.now(); kick(); };

    const fine = matchMedia("(hover: hover)").matches;
    const move = (e: PointerEvent) => {
      if (!centres.length) measure();
      px = e.pageX; py = e.pageY; lastMove = Date.now(); kick();
    };
    const leave = () => { px = py = -1e5; kick(); };
    if (fine) { box.addEventListener("pointerenter", measure); box.addEventListener("pointermove", move); box.addEventListener("pointerleave", leave); }
    el.addEventListener("click", sendWave);
    addEventListener("resize", measure);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);

    // the idle wave: first once the entrance has settled, then every seven seconds while nobody is playing with it
    const first = window.setTimeout(() => { if (seen) sendWave(); }, 6000); // after the i's dot has landed
    const every = window.setInterval(() => { if (seen && !document.hidden && Date.now() - lastMove > 4000) sendWave(); }, 7000);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(first); clearInterval(every); io.disconnect();
      box.removeEventListener("pointerenter", measure); box.removeEventListener("pointermove", move); box.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", sendWave); removeEventListener("resize", measure);
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
