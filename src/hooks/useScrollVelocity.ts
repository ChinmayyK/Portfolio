"use client";
import { useEffect, useRef, useState } from "react";

/**
 * useScrollVelocity — Returns current scroll velocity (px/s).
 *
 * Used for scroll-velocity-based blur on headings:
 * fast scroll = slight blur on text = feels like a real camera
 * still = sharp = fully readable
 *
 * Values:
 *   0        → stopped
 *   < 200    → slow
 *   200–800  → medium
 *   > 800    → fast
 */
export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const decayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastT.current;
      if (dt > 0) {
        const v = Math.abs((y - lastY.current) / dt) * 1000; // px/s
        setVelocity(v);

        if (decayRef.current) clearTimeout(decayRef.current);
        decayRef.current = setTimeout(() => setVelocity(0), 80);
      }
      lastY.current = y;
      lastT.current = now;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (decayRef.current) clearTimeout(decayRef.current);
    };
  }, []);

  return velocity;
}
