"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Activity } from "lucide-react";

export function GithubGraph({ onClose }: { onClose: () => void }) {
  const [timestamp, setTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setTimestamp(Date.now());
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-300"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl rounded-3xl border border-[var(--line-strong)] bg-[var(--surface-elevated)] p-6 sm:p-10 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/10 via-transparent to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
                <Activity className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)] tracking-tight">GitHub Contribution Engine</h2>
                <p className="text-sm text-[var(--muted)]">Live activity feed from the last 53 weeks</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--surface-muted)] transition-colors text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[var(--line-strong)] scrollbar-track-transparent">
            <div className="min-w-[800px] flex justify-center py-2 relative">
              <a 
                href="https://github.com/ChinmayyK" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative block w-full group/graph cursor-pointer"
              >
                <img 
                  src={`https://ghchart.rshah.org/22C55E/ChinmayyK${timestamp ? `?v=${timestamp}` : ''}`}
                  alt="GitHub Activity"
                  className="w-full h-auto drop-shadow-md opacity-90 group-hover/graph:opacity-100 transition-all duration-500"
                  style={{ filter: 'hue-rotate(0deg) contrast(1.1) brightness(1.2)' }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/graph:opacity-100 transition-all duration-300 rounded-xl backdrop-blur-[2px] flex items-center justify-center">
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface-strong)] border border-[var(--line-strong)] rounded-full text-[var(--text)] shadow-2xl transform translate-y-4 group-hover/graph:translate-y-0 transition-transform duration-300">
                    <ExternalLink className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-sm font-semibold tracking-wide">Open Full Profile</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
