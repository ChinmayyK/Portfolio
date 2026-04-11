"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

/**
 * AmbientParticles — Subtle floating dots that drift across the page background.
 * Creates a living, breathing feel without being distracting.
 * Rendered once in layout, covers the entire page.
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
}

export function AmbientParticles() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        duration: 20 + Math.random() * 30,
        delay: Math.random() * -20,
        opacity: 0.06 + Math.random() * 0.08,
        driftX: Math.random() > 0.5 ? 15 : -15,
      }))
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (reduceMotion || !mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[var(--accent-soft)]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, p.driftX, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

