"use client";

import { useEffect, useRef, useState } from "react";
import LocalTime from "@/components/chrome/LocalTime";
import { DUR, EASE, motion, reducedMotion } from "@/lib/motion";
import { transitionState } from "@/lib/transition";
import { SINCE, UNTIL, describeDay, draw, fit, hit, latestCell, layout, type Field } from "./days";

/**
 * The hero is drawn twice. The surface is what you read; underneath sits the same page as an
 * engineer sees it — outlines, boxes, the grid and the real type specs, measured live. A lens
 * follows the pointer and shows the layer underneath; "Inspect" opens it across the whole hero.
 * The name itself is set in my GitHub contributions: one dot each, oldest first, older work lighter.
 */
function Layer({ xray = false }: { xray?: boolean }) {
  return (
    <div className={`hero-layer ${xray ? "is-xray" : ""}`} aria-hidden={xray || undefined}>
      {xray && <div className="xray-grid frame" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>}
      <canvas className="hero-days" aria-hidden="true" />
      {!xray && <span className="days-latest" aria-hidden="true" />}
      <div className="hero-top frame">
        <div className="hero-key t-small" data-spec="">
          <p>My name, set in my work: one dot for <span data-days-per>every contribution</span> I&apos;ve pushed to GitHub since {SINCE}.</p>
          <p className="hero-key-scale"><span aria-hidden="true"><i /><i /><i /><i /></span>Older work is lighter</p>
          <p className="hero-key-latest"><i aria-hidden="true" />Up to {UNTIL}</p>
        </div>
        <p className="hero-role t-lead" data-spec="">
          <span className="hero-mask"><span className="hero-rise">Software engineer.</span></span>
          <span className="hero-mask"><span className="hero-rise">I build apps, systems</span></span>
          <span className="hero-mask"><span className="hero-rise">and tools that hold up.</span></span>
        </p>
        <span className="hero-arrow" aria-hidden="true" data-spec="">↘</span>
      </div>
      {xray ? (
        <p className="hero-name t-name" data-spec="">
          <span className="hero-mask"><span className="hero-rise">Chinmay</span></span>
          <span className="hero-mask hero-line-2"><span className="hero-rise">Kudalkar</span></span>
        </p>
      ) : (
        <h1 id="hero-name" className="hero-name t-name" data-spec="">
          <span className="hero-mask"><span className="hero-rise">Chinmay</span></span>
          <span className="hero-mask hero-line-2"><span className="hero-rise">Kudalkar</span></span>
        </h1>
      )}
      <ul className="hero-meta frame t-small" data-spec="">
        <li><span className="t-label">Based in</span><span>Mumbai, <LocalTime /></span></li>
        <li><span className="t-label">Now</span><span>Interning at ideaForge</span></li>
        <li><span className="t-label">Next</span><span>Full-time roles from 2027</span></li>
      </ul>
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const lens = useRef({ x: 0, y: 0, r: 0 });
  const api = useRef<{ setOpen: (v: boolean) => void } | null>(null);

  useEffect(() => {
    const el = root.current!;
    const wrap = el.querySelector<HTMLElement>(".hero-xray-wrap")!;
    const xray = wrap.querySelector<HTMLElement>(".is-xray")!;
    const surface = el.querySelector<HTMLElement>(".hero-layer:not(.is-xray)")!;
    const { gsap } = motion();
    const L = lens.current;
    let spec = ""; // the measured spec of whatever the lens is over
    const paint = () => {
      wrap.style.clipPath = `circle(${L.r}px at ${L.x}px ${L.y}px)`;
      wrap.style.setProperty("--lx", `${L.x}px`);
      wrap.style.setProperty("--ly", `${L.y}px`);
      const coords = el.querySelector<HTMLElement>(".xray-coords");
      if (coords) { coords.style.setProperty("--lx", `${L.x + L.r * 0.62}px`); coords.style.setProperty("--ly", `${L.y + L.r * 0.62}px`); coords.style.opacity = L.r > 40 ? "1" : "0"; }
      if (coords) coords.textContent = `x ${Math.round(L.x)}  y ${Math.round(L.y)}${spec ? `\n${spec}` : ""}`;
    };

    // write real measurements into the x-ray labels
    const specs = () => {
      const from = surface.querySelectorAll<HTMLElement>("[data-spec]");
      const to = xray.querySelectorAll<HTMLElement>("[data-spec]");
      from.forEach((s, i) => {
        const cs = getComputedStyle(s);
        const r = s.getBoundingClientRect();
        const tag = s.tagName.toLowerCase();
        to[i].dataset.spec = `${tag} · ${Math.round(r.width)}×${Math.round(r.height)} · ${parseFloat(cs.fontSize).toFixed(0)}px/${(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) || 1).toFixed(2)} · ${cs.fontWeight}`;
      });
    };
    specs();
    const ro = new ResizeObserver(specs);
    ro.observe(el);

    const reduced = reducedMotion();
    const rest = () => Math.max(110, Math.min(220, el.clientWidth * 0.11));
    const full = () => Math.hypot(el.clientWidth, el.clientHeight);
    let isOpen = false;
    const to = (vars: Partial<typeof L>, duration = 0.9, ease: string = EASE.out) =>
      gsap.to(L, { ...vars, duration, ease, overwrite: "auto", onUpdate: paint });

    api.current = {
      setOpen: (v) => {
        isOpen = v;
        if (reduced) { L.r = v ? full() : 0; L.x = el.clientWidth / 2; L.y = el.clientHeight / 2; paint(); return; }
        to({ r: v ? full() : 0 }, v ? 1.2 : 0.8, EASE.inOut);
      },
    };

    // ── the name in days ───────────────────────────────────────────────
    const delay = 0.15 + transitionState.enterDelay;
    const canvases = Array.from(el.querySelectorAll<HTMLCanvasElement>(".hero-days"));
    const latest = el.querySelector<HTMLElement>(".days-latest")!;
    let field: Field | null = null, ctxs: CanvasRenderingContext2D[] = [], hover = -1, ready = false, dead = false;
    const shown = { v: 0 };
    const render = () => { if (field) ctxs.forEach((c, i) => draw(c, field!, shown.v, i === 1, hover)); };
    const build = () => {
      field = layout(surface.querySelector(".hero-name")!, surface);
      if (!field) return;
      ctxs = canvases.map(fit);
      const c = latestCell(field);
      latest.style.cssText = `--dx:${c.x}px;--dy:${c.y}px;--dr:${Math.max(9, field.pitch * 1.9)}px`;
      el.classList.add("days-on");
      el.querySelectorAll("[data-days-per]").forEach((n) => { n.textContent = field!.per === 1 ? "every contribution" : `every ${field!.per} contributions`; });
      render();
    };
    let rebuild = 0, width = el.clientWidth;
    const resized = () => {
      if (!ready || el.clientWidth === width) return;
      width = el.clientWidth;
      cancelAnimationFrame(rebuild);
      rebuild = requestAnimationFrame(build);
    };
    const ro2 = new ResizeObserver(resized);
    ro2.observe(el);
    const started = performance.now();
    document.fonts.ready.then(() => {
      if (dead) return;
      ready = true; width = el.clientWidth;
      build();
      if (reduced) { shown.v = 1e9; render(); latest.classList.add("is-on"); return; }
      // the days fill in from the first to the most recent, so the name writes itself in order
      gsap.to(shown, {
        v: field ? field.dayOf.length * 1.06 + 60 : 0, duration: 3, ease: "power2.inOut", onUpdate: render,
        delay: Math.max(0, delay + 0.2 - (performance.now() - started) / 1000),
        onComplete: () => latest.classList.add("is-on"),
      });
    });
    const stopDays = () => { dead = true; ro2.disconnect(); cancelAnimationFrame(rebuild); gsap.killTweensOf(shown); };

    if (reduced) return () => { ro.disconnect(); stopDays(); };

    // entrance, applied to both layers so they stay in register
    let intro!: gsap.core.Timeline;
    const ctx = gsap.context(() => {
      intro = gsap.timeline({ delay })
      .from(el.querySelectorAll(".hero-name .hero-rise"), { yPercent: 105, duration: DUR.slow * 1.15, ease: EASE.out, stagger: 0.12 }, 0)
      .from(el.querySelectorAll(".hero-role .hero-rise"), { yPercent: 105, duration: DUR.slow, ease: EASE.out, stagger: 0.07 }, 0.35)
      .from(el.querySelectorAll(".hero-arrow, .hero-meta li"), { autoAlpha: 0, y: 14, duration: DUR.base, ease: EASE.out, stagger: 0.06 }, 0.6)
      .from(el.querySelectorAll(".hero-inspect"), { autoAlpha: 0, duration: 0.6 }, 1);
    });

    // then the lens introduces itself once: it opens over the name, crosses it, and closes
    let hovering = false;
    // the name's own extent, not its full-width box
    const name = () => {
      const rs = Array.from(el.querySelectorAll<HTMLElement>(".hero-layer:not(.is-xray) .hero-name .hero-mask > span")).map((s) => s.getBoundingClientRect());
      const left = Math.min(...rs.map((r) => r.left)), right = Math.max(...rs.map((r) => r.right));
      const top = Math.min(...rs.map((r) => r.top)), bottom = Math.max(...rs.map((r) => r.bottom));
      return { left, top, width: right - left, height: bottom - top };
    };
    const host = () => el.getBoundingClientRect();
    intro.add(() => {
      if (hovering || isOpen) return;
      const n = name(), h = host();
      L.x = n.left - h.left + n.width * 0.18; L.y = n.top - h.top + n.height * 0.3; L.r = 0;
      gsap.timeline({ onUpdate: paint })
        .to(L, { r: rest(), duration: 0.8, ease: EASE.out })
        .to(L, { x: n.left - h.left + n.width * 0.78, y: n.top - h.top + n.height * 0.72, duration: 1.8, ease: "power2.inOut" }, 0.2)
        .to(L, { r: hovering ? rest() : 0, duration: 0.7, ease: EASE.inOut, onStart() { if (hovering) this.kill(); } });
    }, 3.3); // once the name has finished writing itself

    const move = (e: PointerEvent) => {
      if (isOpen) return;
      const h = host();
      hovering = true;
      const under = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(".hero-layer:not(.is-xray) [data-spec]");
      const all = Array.from(el.querySelectorAll<HTMLElement>(".hero-layer:not(.is-xray) [data-spec]"));
      const twin = under ? xray.querySelectorAll<HTMLElement>("[data-spec]")[all.indexOf(under)] : null;
      spec = twin?.dataset.spec ?? "";
      const day = field ? hit(field, e.clientX - h.left, e.clientY - h.top) : -1;
      if (day >= 0) spec = describeDay(day);
      if (day !== hover) { hover = day; render(); }
      gsap.to(L, { x: e.clientX - h.left, y: e.clientY - h.top, duration: e.pointerType === "mouse" ? 0.55 : 0.2, ease: "power3.out", overwrite: "auto", onUpdate: paint });
      if (L.r < rest() * 0.9) gsap.to(L, { r: rest(), duration: 0.7, ease: EASE.out, onUpdate: paint });
    };
    const leave = () => { hovering = false; hover = -1; render(); if (!isOpen) to({ r: 0 }, 0.6, EASE.inOut); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);

    return () => {
      ro.disconnect(); ctx.revert(); stopDays();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointercancel", leave);
    };
  }, []);

  return (
    <section ref={root} className="hero" aria-labelledby="hero-name">
      <Layer />
      <div className="hero-xray-wrap" aria-hidden="true">
        <Layer xray />
        <span className="xray-cross" />
      </div>
      <span className="xray-coords t-label" aria-hidden="true" />
      <button
        type="button"
        className="hero-inspect t-label"
        aria-pressed={open}
        onClick={() => { const v = !open; setOpen(v); api.current?.setOpen(v); }}
      >
        <span className="hero-inspect-dot" aria-hidden="true" />
        {open ? "Close inspector" : "Inspect this page"}
      </button>
    </section>
  );
}
