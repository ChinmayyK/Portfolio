"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function SpineWatermark() {
  const { scrollY } = useScroll();
  // When user scrolls down 5000px, the text moves up by 1000px, creating a massive parallax effect
  const y = useTransform(scrollY, [0, 5000], [0, -1000]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden hidden md:block">
      <motion.div 
        style={{ y }} 
        className="absolute top-1/2 right-24 -translate-y-1/2 origin-center -rotate-90 opacity-40 mix-blend-plus-lighter"
      >
        <span className="text-[140px] lg:text-[180px] font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-500/40 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)] whitespace-nowrap">
          Never Settle
        </span>
      </motion.div>
    </div>
  );
}
