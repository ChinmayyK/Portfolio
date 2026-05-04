"use client";

import { useEffect, useState } from "react";

/**
 * GrainOverlay — SVG feTurbulence film grain as a fixed full-screen overlay.
 *
 * What this does that nothing else does:
 * The grain slowly animates (seed changes every ~120ms) giving it a subtle
 * living quality. At this opacity (0.028) it's subliminal — you feel it
 * before you see it. The page goes from "rendered on a screen" to
 * "printed on paper". 
 *
 * Uses mix-blend-mode: overlay in dark mode and soft-light in light mode
 * so it doesn't muddy the colours.
 *
 * Only runs on non-reduced-motion devices.
 */
export function GrainOverlay() {
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const INTERVAL = 4; // update every 4 frames ~67ms at 60fps

    const tick = () => {
      frame++;
      if (frame % INTERVAL === 0) {
        setSeed((s) => (s % 999) + 1);
      }
      rafId = requestAnimationFrame(tick);
    };

    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      {/* Dark mode grain */}
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9000] opacity-[0.028] [mix-blend-mode:overlay] dark-grain"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100vw", height: "100vh" }}
      >
        <filter id={`grain-dark-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-dark-${seed})`} />
      </svg>

      {/* Light mode grain — slightly stronger, different blend */}
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9000] opacity-[0.018] [mix-blend-mode:multiply] light-grain"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100vw", height: "100vh" }}
      >
        <filter id={`grain-light-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            seed={seed + 300}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-light-${seed})`} />
      </svg>

      <style>{`
        :root .dark-grain { display: block; }
        :root .light-grain { display: none; }
        [data-theme="light"] .dark-grain { display: none; }
        [data-theme="light"] .light-grain { display: block; }
      `}</style>
    </>
  );
}
