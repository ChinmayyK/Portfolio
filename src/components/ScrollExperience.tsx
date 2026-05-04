"use client";

import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";
import { useEffect } from "react";

/* ─── Scroll Experience ─────────────────────────────────────────────
 * Provides smooth scrolling via Lenis.
 * The visual SYNC progress bar has been removed.
 * ─────────────────────────────────────────────────────────────────── */

export function ScrollExperience() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.09,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      syncTouch: false,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [reduceMotion]);

  return null;
}
