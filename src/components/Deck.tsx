"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, GithubLogo, X } from "@phosphor-icons/react";
import { PROJECTS, type Project } from "@/lib/content";
import Shot from "@/components/Shot";

// The starred project (Link All) has its own chapter; the deck holds the rest.
const ITEMS = PROJECTS.filter((p) => !p.star);
const N = ITEMS.length;

type VTDoc = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

/** A short tick on phones that support it (Android); silently does nothing elsewhere. */
export function buzz() {
  if (matchMedia("(pointer: coarse)").matches) navigator.vibrate?.(8);
}

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
  const [screen, setScreen] = useState<number[]>(() => ITEMS.map(() => 0));
  const sheetCore = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLElement | null>(null);

  function showScreen(card: number, s: number) {
    setScreen((cur) => cur.map((v, i) => (i === card ? s : v)));
    buzz();
  }

  // The card grows into the sheet (and shrinks back) where View Transitions exist; otherwise the sheet just rises.
  const canMorph = () => !!(document as VTDoc).startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openSheet(p: Project, card: HTMLElement) {
    buzz();
    from.current = card;
    const dlg = sheet.current!;
    if (!canMorph()) { setOpen(p); return; }
    card.style.viewTransitionName = "project";
    const vt = (document as VTDoc).startViewTransition!(() => {
      card.style.viewTransitionName = "";
      flushSync(() => setOpen(p));
      dlg.dataset.vt = "";
      if (!dlg.open) dlg.showModal();
      if (sheetCore.current) sheetCore.current.style.viewTransitionName = "project";
    });
    vt.finished.finally(() => { if (sheetCore.current) sheetCore.current.style.viewTransitionName = ""; });
  }

  function closeSheet() {
    const dlg = sheet.current!;
    const card = from.current;
    if (!canMorph() || !card || !sheetCore.current) { dlg.close(); return; }
    sheetCore.current.style.viewTransitionName = "project";
    const vt = (document as VTDoc).startViewTransition!(() => {
      if (sheetCore.current) sheetCore.current.style.viewTransitionName = "";
      dlg.close();
      card.style.viewTransitionName = "project";
    });
    vt.finished.finally(() => { card.style.viewTransitionName = ""; delete dlg.dataset.vt; });
  }

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

  // Scrolls so card i is in front. In list mode (narrow or reduced motion) it scrolls to the card itself.
  function goTo(i: number) {
    const el = deck.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduce ? "auto" : "smooth";
    if (reduce || !matchMedia("(min-width: 901px)").matches) {
      cards.current[i]?.scrollIntoView({ behavior, block: "center" });
      return;
    }
    const span = el.offsetHeight - innerHeight;
    scrollTo({ top: el.offsetTop + (span * i) / (N - 1) + 2, behavior });
    buzz();
  }

  // other parts of the page ask for a project by name: bring its card forward, or open its sheet
  useEffect(() => {
    const onGo = (e: Event) => { const i = ITEMS.findIndex((p) => p.t === (e as CustomEvent<string>).detail); if (i >= 0) goTo(i); };
    const onOpen = (e: Event) => {
      const p = PROJECTS.find((x) => x.t === (e as CustomEvent<string>).detail);
      if (p) { buzz(); from.current = null; setOpen(p); }
    };
    addEventListener("deck:go", onGo);
    addEventListener("sheet:open", onOpen);
    return () => { removeEventListener("deck:go", onGo); removeEventListener("sheet:open", onOpen); };
  }, []);

  return (
    <>
      <div className="deck" ref={deck} style={{ "--n": N } as CSSProperties}>
        <div className="stage">
          {ITEMS.map((p, i) => (
            <article key={p.t} className="card bezel lifted" ref={(el) => { if (el) cards.current[i] = el; }} aria-labelledby={`ct-${i}`}>
              <div className="core">
                <div className="txt">
                  <div><span className="chip">{p.k}</span><h3 id={`ct-${i}`}>{p.t}</h3><p className="line">{p.line}</p></div>
                  <div><button className="pill dark" type="button" onClick={(e) => openSheet(p, e.currentTarget.closest(".core") as HTMLElement)}>Details <span className="isl"><ArrowUpRight weight="light" /></span></button></div>
                </div>
                <div className="pic">
                  {/* tap the screenshot to step through the app's screens */}
                  <button type="button" className="fit" onClick={() => showScreen(i, (screen[i] + 1) % p.shots.length)}
                    aria-label={`${p.t}: screen ${screen[i] + 1} of ${p.shots.length}. Show the next screen.`}>
                    <Shot key={p.shots[screen[i]]} className="swap" file={p.shots[screen[i]]} alt="" loading="lazy" />
                  </button>
                  {p.shots.length > 1 && (
                    <div className="screens">
                      {p.shots.map((s, j) => (
                        <button key={s} type="button" aria-label={`Screen ${j + 1} of ${p.shots.length}`} aria-current={j === screen[i]} onClick={() => showScreen(i, j)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
          <div className={`tabs${inDeck ? "" : " off"}`} aria-label="Projects">
            {ITEMS.map((p, i) => (
              <button key={p.t} type="button" aria-current={i === active} onClick={() => goTo(i)}>{p.t}</button>
            ))}
          </div>
        </div>
      </div>

      <dialog ref={sheet} aria-labelledby="s-title" onClose={() => setOpen(null)}
        onCancel={(e) => { e.preventDefault(); closeSheet(); }}
        onClick={(e) => { if (e.target === sheet.current) closeSheet(); }}>
        {open && (
          <div className="sheet bezel">
            <div className="core" ref={sheetCore}>
              <button className="x" type="button" aria-label="Close" onClick={closeSheet}><X weight="light" /></button>
              <span className="chip">{open.k}</span>
              <h3 id="s-title">{open.t}</h3>
              <p className="line">{open.lede}</p>
              {open.shots.length > 0 && (
                <div className="shots">{open.shots.map((s) => <Shot key={s} file={s} alt={`${open.t} screenshot`} loading="lazy" />)}</div>
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
