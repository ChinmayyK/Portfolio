"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CustomCursor — A handcrafted cursor with spring-based ring lag.
 *
 * Two layers:
 *   • dot   — 5px, tracks cursor exactly, instant
 *   • ring  — 32px, follows with spring physics (slightly behind)
 *
 * On interactive elements the ring stretches and tilts slightly.
 * Completely invisible while using keyboard (tabbing) or touch.
 */
export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Spring state (mutable refs, no React renders needed)
  const pos  = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100, vx: 0, vy: 0 });
  const raf  = useRef<number>(0);

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Only run on pointer-fine devices
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SPRING = 0.14;   // how strongly ring chases dot
    const DAMPEN = 0.72;   // velocity decay per frame

    const dot  = dotRef.current;
    const rng  = ringRef.current;
    if (!dot || !rng) return;

    const tick = () => {
      // Spring physics: ring chases pos
      const dx = pos.current.x - ring.current.x;
      const dy = pos.current.y - ring.current.y;
      ring.current.vx = (ring.current.vx + dx * SPRING) * DAMPEN;
      ring.current.vy = (ring.current.vy + dy * SPRING) * DAMPEN;
      ring.current.x += ring.current.vx;
      ring.current.y += ring.current.vy;

      dot.style.transform  = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      rng.style.transform  = `translate(${ring.current.x}px, ${ring.current.y}px)`;

      // Slightly stretch ring in the direction of velocity
      const speed = Math.sqrt(ring.current.vx ** 2 + ring.current.vy ** 2);
      const stretch = Math.min(speed * 0.06, 0.22);
      const angle   = Math.atan2(ring.current.vy, ring.current.vx) * (180 / Math.PI);
      rng.style.scale  = `${1 + stretch} ${1 - stretch * 0.5}`;
      rng.style.rotate = `${angle}deg`;

      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onHoverStart = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("a, button, [role='button'], input, textarea, label, [tabindex]")) {
        setHovering(true);
      }
    };
    const onHoverEnd = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("a, button, [role='button'], input, textarea, label, [tabindex]")) {
        setHovering(false);
      }
    };

    raf.current = requestAnimationFrame(tick);
    document.addEventListener("mousemove",  onMove,      { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover",  onHoverStart, { passive: true });
    document.addEventListener("mouseout",   onHoverEnd,   { passive: true });

    return () => {
      cancelAnimationFrame(raf.current);
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover",  onHoverStart);
      document.removeEventListener("mouseout",   onHoverEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Hide the native cursor site-wide when this is active */}
      <style>{`@media (pointer: fine) and (prefers-reduced-motion: no-preference) { * { cursor: none !important; } }`}</style>

      {/* Dot — always at cursor, sharp */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "var(--text)",
          pointerEvents: "none",
          zIndex: 9999,
          marginLeft: -3,
          marginTop: -3,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s",
          willChange: "transform",
        }}
      />

      {/* Ring — lags behind with spring physics */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: hovering ? 44 : 30,
          height: hovering ? 44 : 30,
          borderRadius: "50%",
          border: `1.5px solid ${hovering ? "var(--accent)" : "var(--text)"}`,
          pointerEvents: "none",
          zIndex: 9998,
          marginLeft: hovering ? -22 : -15,
          marginTop:  hovering ? -22 : -15,
          opacity: visible ? (hovering ? 0.7 : 0.35) : 0,
          transition: "width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s, border-color 0.2s, margin 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          willChange: "transform",
          transformOrigin: "center center",
        }}
      />
    </>
  );
}
