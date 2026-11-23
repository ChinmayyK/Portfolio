"use client";

import { useEffect, useRef, useState } from "react";
import { scrollToTarget } from "@/lib/scroll";

/**
 * On phones and tablets a case study is a long read with no sticky labels, so a small pill
 * floats at the bottom: the section you're in, a bar for how far through you are, and,
 * when tapped, the list of sections to jump to.
 */
export default function CaseProgress({ sections }: { sections: { n: string; title: string }[] }) {
  const [current, setCurrent] = useState(-1);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const blocks = sections.map((s) => document.getElementById(`cs-${s.n}`)?.closest("section")).filter((b): b is HTMLElement => !!b);
    if (!blocks.length) return;
    let frame = 0;
    const measure = () => {
      const line = innerHeight * 0.45;
      let c = -1;
      blocks.forEach((b, i) => { if (b.getBoundingClientRect().top < line) c = i; });
      const last = blocks[blocks.length - 1].getBoundingClientRect();
      if (last.bottom < line) c = -1; // past the last section: the pill steps aside for the ending
      setCurrent(c);
      const start = blocks[0].getBoundingClientRect().top, span = last.bottom - start;
      bar.current?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, (line - start) / span)).toFixed(3)})`);
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", key); };
  }, [open]);

  const shown = current >= 0 || open;
  const s = sections[Math.max(0, current)];
  return (
    <nav ref={root} className={`cs-progress ${shown ? "is-on" : ""}`} aria-label="Case study sections" aria-hidden={!shown || undefined} inert={!shown || undefined}>
      {open && (
        <ol className="cs-progress-list">
          {sections.map((x, i) => (
            <li key={x.n}>
              <button type="button" aria-current={i === current ? "true" : undefined} onClick={() => { setOpen(false); scrollToTarget(`#cs-${x.n}`); }}>
                <span className="t-label">{x.n}</span>{x.title}
              </button>
            </li>
          ))}
        </ol>
      )}
      <button type="button" className="cs-progress-pill" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="t-label">{s.n}</span>
        <span className="cs-progress-title">{s.title}</span>
        <span className="cs-progress-chevron" aria-hidden="true">{open ? "↓" : "↑"}</span>
        <span className="cs-progress-bar" aria-hidden="true"><span ref={bar} /></span>
      </button>
    </nav>
  );
}
