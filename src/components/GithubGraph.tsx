"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionLabel } from "./SectionLabel";
import { Github, ExternalLink, Activity } from "lucide-react";
import { WaveformStability } from "./GhostLayers";

export function GithubGraph() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    // Scroll to the end of the graph on mount (so latest activity is visible on mobile)
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <section className="relative w-full py-8 sm:py-16 group/section">
      <WaveformStability />
      <div className="mx-auto w-full max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <SectionLabel color="#22C55E">
              <Github className="w-4 h-4 mr-1 opacity-70" />
              GitHub Dashboard
            </SectionLabel>
            
            <a 
              href="https://github.com/ChinmayyK" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] text-sm font-medium hover:bg-[#22C55E]/20 hover:border-[#22C55E]/50 transition-all duration-300"
            >
              <span className="hidden sm:inline">View Profile</span>
              <span className="sm:hidden">Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-col gap-6">
            {/* Top Row: Activity Graph */}
            <div className="rounded-2xl border border-[var(--line-strong)] bg-[var(--surface-elevated)] p-4 sm:p-8 backdrop-blur-md relative overflow-hidden group shadow-xl transition-all duration-500 hover:border-[#22C55E]/30 hover:shadow-[#22C55E]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
              
              <div className="mb-4 flex items-center gap-2 text-[var(--ink)] font-medium">
                <Activity className="w-4 h-4 text-[#22C55E]" />
                <h3>Contribution History ({currentYear})</h3>
              </div>

              {/* Responsive Container: allows horizontal scroll on mobile */}
              <div 
                ref={scrollRef}
                className="relative z-10 w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[var(--line-strong)] scrollbar-track-transparent"
              >
                <div className="min-w-[700px] flex justify-center py-2 relative">
                  <a 
                    href="https://github.com/ChinmayyK" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative block w-full group/graph cursor-pointer"
                  >
                    <img 
                      src={`https://ghchart.rshah.org/22C55E/ChinmayyK`}
                      alt={`ChinmayyK's GitHub Activity Graph for ${currentYear}`} 
                      className="w-full h-auto drop-shadow-md opacity-80 group-hover/graph:opacity-100 transition-all duration-500"
                      style={{ filter: 'hue-rotate(0deg) contrast(1.1) brightness(1.2)' }}
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/graph:opacity-100 transition-all duration-300 rounded-lg backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface-strong)] border border-[var(--line-strong)] rounded-full text-[var(--ink)] shadow-2xl transform translate-y-4 group-hover/graph:translate-y-0 transition-transform duration-300">
                        <ExternalLink className="w-4 h-4 text-[#22C55E]" />
                        <span className="text-sm font-semibold tracking-wide">Open in GitHub</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
