"use client";

import { useEffect, useRef } from "react";
import { finePointer, motion, reducedMotion } from "@/lib/motion";

/** Pulls its child toward the pointer while the pointer is near, then springs back. Mouse only. */
export default function Magnetic({ children, strength = 0.35, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const { gsap } = motion();
    const el = wrap.current!, inner = el.firstElementChild as HTMLElement | null;
    const x = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const y = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const ix = inner && gsap.quickTo(inner, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const iy = inner && gsap.quickTo(inner, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      x(dx * strength); y(dy * strength);
      ix?.(dx * strength * 0.4); iy?.(dy * strength * 0.4);
    };
    const leave = () => { x(0); y(0); ix?.(0); iy?.(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [strength]);

  return <span ref={wrap} className={`magnetic ${className}`}>{children}</span>;
}
