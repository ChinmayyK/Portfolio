"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function TopographicMap() {
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 100]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  if (!isMounted) return null;

  // Multiple SVG paths to mimic a topographic map contour lines
  // These are roughly bezier curves that give a wavy, organic feel
  
  return (
    <motion.div 
      className="absolute inset-0 z-[1] pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,white_40%,transparent)]"
      style={{ y, opacity }}
    >
      <svg 
        className="absolute w-full h-full opacity-100 dark:opacity-50" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" fill="none" strokeWidth="1.5" className="text-[var(--text)]">
          {/* We'll use framer-motion to draw the paths and subtly animate their stroke-dasharray over time if desired */}
          {[...Array(15)].map((_, i) => {
            const scale = 1 + i * 0.1;
            const yOffset = i * 20;
            return (
              <motion.path
                key={i}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 - (i * 0.05) }}
                transition={{ duration: 3 + i * 0.2, ease: "easeInOut", delay: i * 0.1 }}
                d={`M -200 ${300 + yOffset} C ${200 * scale} ${100 + yOffset * 2}, ${400 * scale} ${400 + yOffset}, ${700 * scale} ${200 + yOffset * 2} S ${900 * scale} ${500 + yOffset}, 1200 ${300 + yOffset * 2}`}
                style={{
                  transformOrigin: "center",
                  transform: `scale(${1 + i * 0.02}) rotate(${i * 0.5}deg)`
                }}
              />
            );
          })}
        </g>
      </svg>
    </motion.div>
  );
}
