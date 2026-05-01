"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ThemeShockwave — Pure CSS ripple effect on theme toggle.
 * Replaces the previous Three.js WebGL implementation to eliminate
 * the entire Three.js bundle from the client (~150KB gzipped).
 */
export function ThemeShockwave() {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; onComplete: () => void }>;
      const { x, y, onComplete } = customEvent.detail;

      setRipple({ x, y });

      // Match the old 400ms timing
      setTimeout(() => {
        setRipple(null);
        if (onComplete) onComplete();
      }, 500);
    };

    window.addEventListener("sh-theme-trigger", handleTrigger);
    return () => window.removeEventListener("sh-theme-trigger", handleTrigger);
  }, []);

  if (!ripple) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute rounded-full animate-[shockwave_500ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        style={{
          left: ripple.x,
          top: ripple.y,
          width: 0,
          height: 0,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(150,200,255,0.15) 0%, rgba(150,200,255,0.05) 40%, transparent 70%)",
          boxShadow: "0 0 60px 20px rgba(150,200,255,0.08)",
        }}
      />
      <style>{`
        @keyframes shockwave {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: max(200vw, 200vh);
            height: max(200vw, 200vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

