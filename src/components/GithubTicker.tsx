"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function GithubTicker({ onClick }: { onClick: () => void }) {
  const [timestamp, setTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setTimestamp(Date.now());
  }, []);

  return (
    <div 
      className="absolute bottom-0 left-0 w-full h-16 sm:h-20 bg-[var(--bg)]/40 backdrop-blur-md border-t border-[var(--line-strong)] z-40 overflow-hidden cursor-pointer group flex items-center shadow-[0_-10px_30px_rgba(0,0,0,0.1)]"
      onClick={onClick}
    >
      {/* Edge Gradients for smooth fading */}
      <div className="absolute top-0 left-0 h-full w-24 sm:w-48 bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-24 sm:w-48 bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />
      
      {/* Ticker Content */}
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex items-center gap-12 whitespace-nowrap"
      >
         {/* Render multiple times for a seamless infinite loop */}
         {[1, 2, 3, 4].map((i) => (
           <div key={i} className="flex items-center gap-12 shrink-0">
             <span className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#22C55E] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                </span>
                Live Activity
             </span>
             <img 
                src={`https://ghchart.rshah.org/22C55E/ChinmayyK${timestamp ? `?v=${timestamp}` : ''}`}
                alt="GitHub Activity"
                className="h-10 sm:h-12 w-auto opacity-50 group-hover:opacity-100 transition-opacity duration-300 mix-blend-plus-lighter"
                style={{ filter: 'hue-rotate(0deg) contrast(1.2) brightness(1.2)' }}
             />
           </div>
         ))}
      </motion.div>
    </div>
  );
}
