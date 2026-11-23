"use client";

import { useEffect, useRef, useState } from "react";
import LocalTime from "@/components/chrome/LocalTime";
import { DUR, EASE, motion, reducedMotion } from "@/lib/motion";
import { transitionState } from "@/lib/transition";
import type { Stage } from "./stage";

/**
 * The hero is drawn twice. The surface is what you read; underneath sits the same page as an
 * engineer sees it — outlines, boxes, the grid and the real type specs, measured live. A lens
 * follows the pointer and shows the layer underneath; "Inspect" opens it across the whole hero.
 * Once the page has drawn, the name becomes real 3D type lit from the cursor (see stage.ts);
 * under the lens it shows as wireframe.
 */
function Layer({ xray = false }: { xray?: boolean }) {
  return (
    <div className={`hero-layer ${xray ? "is-xray" : ""}`} aria-hidden={xray || undefined}>
      {xray && <div className="xray-grid frame" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>}
      <canvas className="hero-gl" aria-hidden="true" />
      <div className="hero-top frame">
        <p className="hero-role t-lead" data-spec="">
          <span className="hero-mask"><span className="hero-rise">Software engineer</span></span>
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
        <li><span className="t-label">Now</span><span>Intern at ideaForge</span></li>
        <li><span className="t-label">Next</span><span>Full-time from 2027</span></li>
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
      const surface = el.querySelector<HTMLElement>(".hero-layer:not(.is-xray)")!;
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
    // smaller once the name is 3D, so the lens doesn't hide the letters rising under the cursor
    const rest = () => el.classList.contains("gl-on") ? Math.max(70, Math.min(120, el.clientWidth * 0.07)) : Math.max(110, Math.min(220, el.clientWidth * 0.11));
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

    // ── the name in 3D: loads after the page has drawn, then takes over from the HTML letters ──
    let stage: Stage | null = null, dead = false, introDone = reduced, revealed = false;
    const reveal = () => {
      if (!stage || !introDone || revealed) return;
      revealed = true;
      el.classList.add("gl-on");
      stage.reveal(!reduced);
    };
    (async () => {
      await document.fonts.ready;
      // after the page has loaded and gone quiet; stage.ts builds in small steps from there
      if (document.readyState !== "complete") await new Promise((r) => window.addEventListener("load", r, { once: true }));
      await new Promise((r) => ("requestIdleCallback" in window ? requestIdleCallback(r, { timeout: 1500 }) : setTimeout(r, 300)));
      if (dead) return;
      const { createStage } = await import("./stage");
      const [canvas, xrayCanvas] = Array.from(el.querySelectorAll<HTMLCanvasElement>(".hero-gl"));
      const made = await createStage({
        host: el, surface: el.querySelector<HTMLElement>(".hero-layer:not(.is-xray)")!, name: el.querySelector<HTMLElement>("#hero-name")!,
        canvas, xrayCanvas, lensOpen: () => L.r > 1, reduced,
      }).catch(() => null);
      if (dead) { made?.destroy(); return; }
      stage = made;
      reveal();
    })();
    const stopStage = () => { dead = true; stage?.destroy(); el.classList.remove("gl-on"); };

    if (reduced) return () => { ro.disconnect(); stopStage(); };

    // entrance, applied to both layers so they stay in register
    const delay = 0.15 + transitionState.enterDelay;
    let intro!: gsap.core.Timeline;
    const ctx = gsap.context(() => {
      intro = gsap.timeline({ delay })
      .from(el.querySelectorAll(".hero-name .hero-rise"), { yPercent: 105, duration: DUR.slow * 1.15, ease: EASE.out, stagger: 0.12 }, 0)
      .from(el.querySelectorAll(".hero-role .hero-rise"), { yPercent: 105, duration: DUR.slow, ease: EASE.out, stagger: 0.07 }, 0.35)
      .from(el.querySelectorAll(".hero-arrow, .hero-meta li"), { autoAlpha: 0, y: 14, duration: DUR.base, ease: EASE.out, stagger: 0.06 }, 0.6)
      .from(el.querySelectorAll(".hero-inspect"), { autoAlpha: 0, duration: 0.6 }, 1)
      .add(() => { introDone = true; reveal(); }, 1.45); // the HTML name has settled: hand over to 3D
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
    }, 1.1);

    const move = (e: PointerEvent) => {
      // a finger on the 3D name steers its light; the lens would only cover it
      if (e.pointerType === "touch" && el.classList.contains("gl-on")) return;
      if (isOpen) return;
      const h = host();
      hovering = true;
      const under = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(".hero-layer:not(.is-xray) [data-spec]");
      const all = Array.from(el.querySelectorAll<HTMLElement>(".hero-layer:not(.is-xray) [data-spec]"));
      const twin = under ? xray.querySelectorAll<HTMLElement>("[data-spec]")[all.indexOf(under)] : null;
      spec = twin?.dataset.spec ?? "";
      gsap.to(L, { x: e.clientX - h.left, y: e.clientY - h.top, duration: e.pointerType === "mouse" ? 0.55 : 0.2, ease: "power3.out", overwrite: "auto", onUpdate: paint });
      if (L.r < rest() * 0.9) gsap.to(L, { r: rest(), duration: 0.7, ease: EASE.out, onUpdate: paint });
    };
    const leave = () => { hovering = false; if (!isOpen) to({ r: 0 }, 0.6, EASE.inOut); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);

    return () => {
      ro.disconnect(); ctx.revert(); stopStage();
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
