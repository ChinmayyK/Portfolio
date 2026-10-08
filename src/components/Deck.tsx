"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, GithubLogo, X } from "@phosphor-icons/react";
import { PROJECTS, type Project } from "@/lib/content";

const N = PROJECTS.length;

/**
 * Projects as a deck you scroll through in depth. The stage is sticky; scroll progress
 * through the tall wrapper picks which card is in front. Below 901px, or with reduced
 * motion, the CSS turns it into a plain list and the transforms are cleared.
 */
export default function Deck() {
  const deck = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLElement[]>([]);
  const sheet = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [inDeck, setInDeck] = useState(false);
  const [open, setOpen] = useState<Project | null>(null);

  useEffect(() => {
    const wide = matchMedia("(min-width: 901px)");
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => wide.matches && !still.matches;
    let target = 0, cur = 0, raf = 0, last = -1;

    const paint = (p: number) => {
      cards.current.forEach((c, i) => {
        const d = i - p;
        let tf: string, op: number, dim: number;
        if (d < 0) { // passed: lifts up and away
          const t = Math.min(1, -d);
          tf = `translate3d(0, ${-t * innerHeight * 0.95}px, ${t * 120}px) rotateX(${t * 12}deg) scale(${1 - t * 0.04})`;
          op = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
          dim = 0;
        } else { // waiting: tucked behind, higher and further back; solid so nothing shows through
          const s = i % 2 ? 1 : -1;
          tf = `translate3d(0, ${-d * 46}px, ${-d * 150}px) rotate(${s * Math.min(d, 3) * 0.9}deg)`;
          op = d > 3 ? Math.max(0, 4 - d) : 1;
          dim = Math.min(d, 3) * 0.22;
        }
        c.style.transform = tf;
        c.style.opacity = Math.max(0, op).toFixed(3);
        c.style.zIndex = String(100 - i);
        c.style.setProperty("--dim", dim.toFixed(3));
        c.inert = Math.abs(d) >= 0.5;
      });
      const a = Math.round(p);
      if (a !== last) { last = a; setActive(a); }
    };
    const clear = () => cards.current.forEach((c) => { c.style.cssText = ""; c.inert = false; });
    const progress = () => {
      const el = deck.current!;
      const span = el.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -el.getBoundingClientRect().top / span)) * (N - 1);
    };
    const loop = () => {
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0005) { cur = target; raf = 0; } else raf = requestAnimationFrame(loop);
      paint(cur);
    };

    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: deck.current, start: "top top", end: "bottom bottom",
      onToggle: (s) => setInDeck(s.isActive),
      onUpdate: () => { if (!on()) return; target = progress(); if (!raf) raf = requestAnimationFrame(loop); },
    });
    const sync = () => { if (on()) { cur = target = progress(); paint(cur); } else clear(); };
    sync();
    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => { st.kill(); cancelAnimationFrame(raf); wide.removeEventListener("change", sync); still.removeEventListener("change", sync); };
  }, []);

  useEffect(() => {
    if (open && sheet.current && !sheet.current.open) sheet.current.showModal();
  }, [open]);

  function goTo(i: number) {
    const el = deck.current!;
    const span = el.offsetHeight - innerHeight;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: el.offsetTop + (span * i) / (N - 1) + 2, behavior: smooth ? "smooth" : "auto" });
  }

  return (
    <>
      <div className="deck" ref={deck} style={{ "--n": N } as CSSProperties}>
        <div className="stage">
          {PROJECTS.map((p, i) => (
            <article key={p.t} className="card bezel lifted" ref={(el) => { if (el) cards.current[i] = el; }} aria-labelledby={`ct-${i}`}>
              <div className="core">
                <div className="txt">
                  <div><span className="chip">{p.k}</span><h3 id={`ct-${i}`}>{p.t}</h3><p className="line">{p.line}</p></div>
                  <div><button className="pill dark" type="button" onClick={() => setOpen(p)}>Details <span className="isl"><ArrowUpRight weight="light" /></span></button></div>
                </div>
                <div className="pic" style={p.tone ? { background: p.tone } : undefined}>
                  <img src={`/img/${p.img}`} alt={`${p.t} screenshot`} loading="lazy" style={p.pos ? { objectPosition: p.pos } : undefined} />
                </div>
              </div>
            </article>
          ))}
          <div className={`tabs${inDeck ? "" : " off"}`} aria-label="Projects">
            {PROJECTS.map((p, i) => (
              <button key={p.t} type="button" aria-current={i === active} onClick={() => goTo(i)}>{p.t}</button>
            ))}
          </div>
        </div>
      </div>

      <dialog ref={sheet} aria-labelledby="s-title" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === sheet.current) sheet.current?.close(); }}>
        {open && (
          <div className="sheet bezel">
            <div className="core">
              <form method="dialog"><button className="x" aria-label="Close"><X weight="light" /></button></form>
              <span className="chip">{open.k}</span>
              <h3 id="s-title">{open.t}</h3>
              <p className="line">{open.lede}</p>
              {open.shots.length > 0 && (
                <div className="shots">{open.shots.map((s) => <img key={s} src={`/img/${s}`} alt={`${open.t} screenshot`} loading="lazy" />)}</div>
              )}
              <div className="facts">
                <div><h4>How it works</h4><ul>{open.pts.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div>
                  <h4>Built with</h4><p>{open.stack}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {open.site && <a className="pill dark" href={open.site}>Visit the site <span className="isl"><ArrowUpRight weight="light" /></span></a>}
                    <a className={`pill ${open.site ? "light" : "dark"}`} href={open.src}>View on GitHub <span className="isl"><GithubLogo weight="light" /></span></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
