"use client";

import { useEffect, useRef } from "react";
import { finePointer, motion, reducedMotion } from "@/lib/motion";

/**
 * A follower for mouse and trackpad users only; the system cursor stays.
 * Over links it opens into a ring; over anything with data-cursor="Label" it becomes a disc
 * carrying that label, so project media say what a click will do.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const { gsap } = motion();
    const el = dot.current!;
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    let mode = "";

    const set = (next: string, label = "") => {
      if (next === mode && (next !== "label" || text.current!.textContent === label)) return;
      mode = next;
      el.dataset.mode = next;
      if (label) text.current!.textContent = label;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      gsap.to(el, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      x(e.clientX); y(e.clientY);
      const t = e.target as Element | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      if (labelled) set("label", labelled.dataset.cursor);
      else if (t?.closest("a, button, [role=button], label, summary")) set("link");
      else set("");
    };
    const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.2 });
    const down = () => gsap.to(el, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(el, { scale: 1, duration: 0.3, ease: "back.out(3)" });

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div ref={dot} className="cursor" aria-hidden="true">
      <span ref={text} className="cursor-label label" />
    </div>
  );
}
