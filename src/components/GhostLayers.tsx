/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

// 1. Vertical Flow-Line Topology (For Principles / Process)
export function VerticalFlowMap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  if (!mounted) return null;

  return (
    <motion.div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ 
        y, 
        WebkitMaskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)", 
        maskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)" 
      }}
    >
      <svg className="absolute w-full h-[150%] opacity-[0.03] dark:opacity-[0.05]" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" fill="none" strokeWidth="1" className="text-[var(--text)]">
          {/* Vertical flow lines */}
          {[...Array(30)].map((_, i) => (
            <line key={`v-${i}`} x1={33.3 * i} y1="0" x2={33.3 * i} y2="1000" strokeDasharray="4 8" opacity={0.5 + Math.abs(Math.sin(i * 10)) * 0.5} />
          ))}
          {/* Faint pipeline accents */}
          {[...Array(6)].map((_, i) => (
            <path key={`p-${i}`} d={`M ${166 * i} 0 Q ${166 * i + 50} 500 ${166 * i} 1000`} strokeWidth="1.5" className="text-[var(--accent)]" opacity="0.4" />
          ))}
          {/* Horizontal cross-connections */}
          {[...Array(10)].map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={100 * i} x2="1000" y2={100 * i} strokeWidth="0.5" opacity="0.3" />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}

// 2. Blueprint Grid / Schematic (For Projects / Core Systems)
export function BlueprintGrid() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  if (!mounted) return null;

  return (
    <motion.div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ 
        y,
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, white 20%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, white 20%, transparent 100%)"
      }}
    >
      <svg className="absolute w-full h-full opacity-[0.03] dark:opacity-[0.06]" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" fill="none" className="text-[var(--text)]">
          {/* Main Grid */}
          <pattern id="blueprint-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="none" />
            <path d="M 50 0 L 0 0 0 50" strokeWidth="0.5" strokeDasharray="2 4" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
          
          {/* Schematic connections between arbitrary nodes */}
          <circle cx="200" cy="250" r="4" strokeWidth="1" fill="none" />
          <circle cx="850" cy="450" r="6" strokeWidth="1.5" fill="none" className="text-[var(--accent)]" />
          <circle cx="300" cy="750" r="4" strokeWidth="1" fill="none" />
          <circle cx="700" cy="850" r="3" strokeWidth="1" fill="none" />
          
          {/* Architectural dimension lines */}
          <path d="M 200 250 L 200 450 L 850 450" strokeWidth="1" />
          <path d="M 300 750 L 300 450" strokeWidth="1" />
          <path d="M 850 450 L 850 150 L 950 150" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 300 750 L 700 750 L 700 850" strokeWidth="0.5" strokeDasharray="2 2" />
        </g>
      </svg>
    </motion.div>
  );
}

// 3. Waveform / Stability Map (For TechStack / Capabilities)
export function WaveformStability() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  
  if (!mounted) return null;

  return (
    <motion.div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        y,
        WebkitMaskImage: "linear-gradient(to bottom, transparent, white 30%, white 70%, transparent)",
        maskImage: "linear-gradient(to bottom, transparent, white 30%, white 70%, transparent)"
      }}
    >
      <svg className="absolute w-full h-full opacity-[0.03] dark:opacity-[0.05]" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" fill="none" strokeWidth="1.5" className="text-[var(--teal)]">
          {/* Node graph artifacts */}
          <circle cx="200" cy="300" r="100" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />
          <circle cx="800" cy="700" r="150" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />
          <path d="M 200 300 L 800 700" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2" />

          {/* Waveforms representing stability */}
          {[...Array(12)].map((_, i) => {
            const yOffset = i * 45 + 250;
            return (
              <motion.path
                key={i}
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 15 + i * 2, ease: "linear", repeat: Infinity }}
                strokeDasharray="1000"
                d={`M -100 ${yOffset} Q 150 ${yOffset - 60 + Math.abs(Math.sin(i * 15)) * 120} 300 ${yOffset} T 700 ${yOffset} T 1100 ${yOffset}`}
                opacity={0.3 + (i % 3) * 0.2}
              />
            );
          })}
        </g>
      </svg>
    </motion.div>
  );
}

// 4. Dotted Topology / Contour Fade (For Footer)
export function FooterTopology() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 100%, white 10%, transparent 80%)",
        maskImage: "radial-gradient(ellipse 100% 100% at 50% 100%, white 10%, transparent 80%)"
      }}
    >
      <svg className="absolute w-full h-full opacity-[0.04] dark:opacity-[0.07]" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" className="text-[var(--text)]" />
        <g stroke="currentColor" fill="none" strokeWidth="1" className="text-[var(--text)]" opacity="0.3">
          {[...Array(5)].map((_, i) => {
            const yOffset = i * 40;
            return (
              <path key={i} d={`M -100 ${350 + yOffset} Q 300 ${150 + yOffset} 500 ${400 + yOffset} T 1100 ${250 + yOffset}`} />
            );
          })}
        </g>
      </svg>
    </div>
  );
}


