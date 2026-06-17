"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useDesktopEffects } from "@/hooks/useDesktopEffects";

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;          // negative = slower, positive = faster
  className?: string;
  direction?: "vertical" | "horizontal";
  offset?: [number, number];  // [start, end] in px for the transform
}

export function ParallaxLayer({
  children,
  speed = 0.3,
  className = "",
  direction = "vertical",
  offset,
}: ParallaxLayerProps) {
  const desktopEffects = useDesktopEffects();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = offset || [-80 * speed, 80 * speed];

  const y = useTransform(scrollYProgress, [0, 1], range);
  const x = useTransform(scrollYProgress, [0, 1], range);

  if (!desktopEffects) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={direction === "vertical" ? { y } : { x }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Parallax with opacity fade ── */
interface ParallaxFadeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxFade({
  children,
  className = "",
  speed = 0.2,
}: ParallaxFadeProps) {
  const desktopEffects = useDesktopEffects();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [40 * speed, 0, 0, -40 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  if (!desktopEffects) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

