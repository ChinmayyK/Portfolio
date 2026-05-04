"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress — Ultra-thin accent line at the very top of the viewport.
 * Uses spring physics for buttery smooth tracking.
 * Gradient from accent to teal.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[200] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, var(--accent), var(--teal))",
      }}
    />
  );
}
