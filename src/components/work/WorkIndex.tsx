"use client";

import { useEffect, useRef, useState } from "react";
import { TLink } from "@/components/chrome/Transition";
import { finePointer, motion, reducedMotion } from "@/lib/motion";
import type { Shot } from "@/content/projects";
import RouteIllustration from "./RouteIllustration";
import RedactionIllustration from "./RedactionIllustration";

export type WorkItem = {
  title: string;
  category: string;
  kind: string;
  years: string;
  href: string;
  external?: boolean;
  preview: { kind: "shot"; shot: Shot } | { kind: "route" } | { kind: "redaction" };
  tint: string;
};

function Preview({ item }: { item: WorkItem }) {
  if (item.preview.kind === "route") return <RouteIllustration progress={0.55} />;
  if (item.preview.kind === "redaction") return <RedactionIllustration labels={false} />;
  const s = item.preview.shot;
  // eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized webp
  return <img src={s.src} alt="" width={s.w} height={s.h} loading="lazy" decoding="async" />;
}

/**
 * The index of work: big names in rows. On a mouse, a framed preview follows the pointer and its
 * contents slide between projects as you move down the list. On touch, each row carries its own frame.
 */
export default function WorkIndex({ items }: { items: WorkItem[] }) {
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!finePointer()) return;
    const { gsap } = motion();
    const el = frame.current!;
    const reduced = reducedMotion();
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0 });
    const x = gsap.quickTo(el, "x", { duration: reduced ? 0 : 0.7, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: reduced ? 0 : 0.7, ease: "power3.out" });
    const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY); };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    if (!finePointer()) return;
    const { gsap } = motion();
    gsap.to(frame.current, { scale: active < 0 ? 0 : 1, duration: 0.5, ease: active < 0 ? "power3.in" : "expo.out" });
  }, [active]);

  return (
    <div className="work-index" onPointerLeave={() => setActive(-1)}>
      <ul className="work-rows" data-active={active >= 0 || undefined}>
        {items.map((it, i) => {
          const body = (
            <>
              <span className="work-title t-h1">{it.title}</span>
              <span className="work-cat">{it.category}</span>
              <span className="work-kind t-small">{it.kind}</span>
              <span className="work-years t-small">{it.years}</span>
              <span className="work-thumb" aria-hidden="true" style={{ background: it.tint }} data-zoom><Preview item={it} /></span>
            </>
          );
          return (
            <li key={it.title} className="work-row" data-reveal data-on={i === active || undefined} onPointerEnter={() => setActive(i)}>
              {it.external
                ? <a href={it.href} className="work-link" data-cursor="GitHub">{body}</a>
                : <TLink href={it.href} label={it.title} className="work-link" data-cursor="View">{body}</TLink>}
            </li>
          );
        })}
      </ul>
      <div ref={frame} className="work-float" aria-hidden="true">
        <div className="work-float-strip" style={{ transform: `translateY(${-Math.max(active, 0) * 100}%)` }}>
          {items.map((it) => (
            <div key={it.title} className="work-float-cell" style={{ background: it.tint }}><Preview item={it} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}
