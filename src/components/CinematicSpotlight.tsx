"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CinematicSpotlight() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress so the spotlight feels "heavy" and cinematic
  const smoothProgress = useSpring(scrollYProgress, { damping: 30, stiffness: 60, mass: 0.8 });
  
  // Map scroll to Y position (from top to bottom of screen)
  const y = useTransform(smoothProgress, [0, 1], ["-10vh", "80vh"]);
  
  // Subtle color changes based on scroll depth
  const color1 = useTransform(
    smoothProgress, 
    [0, 0.4, 0.8, 1], 
    [
      "rgba(245,158,11,0.18)", // Amber at top
      "rgba(94,234,212,0.15)", // Teal in middle
      "rgba(167,139,250,0.15)", // Purple lower
      "rgba(245,158,11,0.18)"  // Amber at bottom
    ]
  );
  
  const color2 = useTransform(
    smoothProgress, 
    [0, 0.4, 0.8, 1], 
    [
      "rgba(245,158,11,0.08)", 
      "rgba(94,234,212,0.08)", 
      "rgba(167,139,250,0.08)", 
      "rgba(245,158,11,0.08)"
    ]
  );

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Absolute dark base overlay to ensure high contrast, only deepens the dark theme */}
      <div className="absolute inset-0 bg-[var(--bg)] opacity-30 dark:opacity-0 transition-opacity duration-1000" />
      
      <motion.div
        style={{ y }}
        className="absolute left-0 right-0 h-[600px] sm:h-[800px] w-full max-w-[1400px] mx-auto mix-blend-screen opacity-100 dark:opacity-80 transition-opacity duration-1000"
      >
        <motion.div 
          className="w-full h-full rounded-full blur-[100px] md:blur-[160px]"
          style={{ background: color1 }}
        />
        <motion.div 
          className="absolute inset-0 w-3/4 h-3/4 mx-auto my-auto rounded-full blur-[80px] md:blur-[120px]"
          style={{ background: color2 }}
        />
      </motion.div>
    </div>
  );
}
