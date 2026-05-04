"use client";

import { useEffect, useRef } from "react";

/**
 * SectionTransition — A minimal, hand-drawn-style horizontal rule.
 *
 * A single line that traces itself in on scroll using the SVG stroke-dashoffset
 * trick. No glow dots, no framer-motion bindings, no wing effects.
 * Just a clean line — the kind a designer draws with intention.
 */
export function SectionTransition({ className = "" }: { className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const len = path.getTotalLength();
    path.style.strokeDasharray  = `${len}`;
    path.style.strokeDashoffset = isReduced ? "0" : `${len}`;

    if (isReduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            path.style.transition = "stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1)";
            path.style.strokeDashoffset = "0";
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={`relative py-4 sm:py-10 overflow-hidden ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <svg
          viewBox="0 0 800 8"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[8px] overflow-visible"
          aria-hidden
        >
          {/* Faint background track */}
          <line
            x1="0" y1="4" x2="800" y2="4"
            stroke="var(--divider-line)"
            strokeWidth="0.5"
            opacity="0.5"
          />
          {/* Animated foreground line — very slight organic wave */}
          <path
            ref={pathRef}
            d="M0,4 C100,4 150,3.2 200,4 C260,4.8 300,3.4 380,4 C460,4.6 520,3.6 580,4 C650,4.4 720,3.8 800,4"
            stroke="var(--accent-soft)"
            strokeWidth="1"
            opacity="0.45"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
