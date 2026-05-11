"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function TopographicMap() {
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  if (!isMounted) return null;

  return (
    <motion.div 
      className="absolute inset-0 z-[1] pointer-events-none overflow-hidden"
      style={{ 
        y, 
        opacity,
        WebkitMaskImage: "radial-gradient(ellipse 120% 100% at 50% 0%, white 20%, transparent 80%)",
        maskImage: "radial-gradient(ellipse 120% 100% at 50% 0%, white 20%, transparent 80%)"
      }}
    >
      <svg 
        className="absolute w-full h-full opacity-[0.04] dark:opacity-[0.06]" 
        viewBox="0 0 1200 800" 
        preserveAspectRatio="xMidYMid slice" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" fill="none" strokeWidth="1" className="text-[var(--text)]">
          {[...Array(25)].map((_, i) => {
            const scale = 1 + i * 0.05;
            const yOffset = i * 15;
            return (
              <motion.path
                key={i}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 4 + i * 0.2, ease: "easeInOut", delay: i * 0.05 }}
                d={`M -200 ${200 + yOffset} C ${300 * scale} ${50 + yOffset * 2}, ${500 * scale} ${300 + yOffset}, ${800 * scale} ${100 + yOffset * 2} S ${1000 * scale} ${400 + yOffset}, 1400 ${200 + yOffset * 2}`}
                style={{
                  transformOrigin: "center top",
                  transform: `scale(${1 + i * 0.01}) rotate(${i * 0.2}deg)`
                }}
              />
            );
          })}
        </g>
      </svg>
    </motion.div>
  );
}
