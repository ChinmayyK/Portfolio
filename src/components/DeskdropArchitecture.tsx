"use client";

import { motion } from "framer-motion";
import { Lock, Cpu, Smartphone, Monitor } from "lucide-react";

export function DeskdropArchitecture() {
  return (
    <div className="w-full bg-[var(--bg)] rounded-xl border border-[var(--line-strong)] p-6 relative overflow-hidden mt-6 shadow-inner group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <h4 className="text-sm font-mono text-[var(--accent)] tracking-widest uppercase mb-8 flex items-center gap-2">
          <Cpu className="w-4 h-4" /> System Architecture
        </h4>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          
          {/* Node A */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col items-center gap-3 w-full md:w-1/3"
          >
            <div className="w-full p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm flex flex-col items-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Monitor className="w-7 h-7 text-blue-400 mb-2 relative z-10" />
              <span className="text-xs font-semibold text-[var(--ink)] relative z-10">macOS / Windows</span>
              <span className="text-[10px] text-[var(--soft)] mt-1 relative z-10">Native UI (Swift/WPF)</span>
            </div>
            
            <div className="w-full h-10 flex justify-center relative">
              <div className="w-[2px] bg-gradient-to-b from-blue-500/50 to-[#F59E0B]/50 h-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-[var(--surface-muted)] text-[8px] font-mono rounded text-[var(--soft)] border border-[var(--line)]">
                IPC Socket
              </div>
            </div>
            
            <div className="w-full p-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5 backdrop-blur-sm flex items-center justify-center gap-2 shadow-lg">
              <Cpu className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[11px] font-mono text-[#F59E0B]">Rust Core Engine</span>
            </div>
          </motion.div>

          {/* Peer to Peer Connection */}
          <div className="flex flex-col items-center justify-center w-full md:w-1/3 relative py-8 md:py-0">
            <motion.div 
              animate={{ y: ["-5px", "5px", "-5px"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] z-10 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold tracking-wider">mTLS / QUIC</span>
              <span className="text-[8px] opacity-80 uppercase tracking-widest text-center">Zero-Trust P2P</span>
            </motion.div>
            
            {/* Animated Data Stream */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[var(--line)] -translate-y-1/2 overflow-hidden md:block hidden">
              <motion.div 
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-80"
              />
              <motion.div 
                animate={{ x: ["300%", "-100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
                className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-60"
              />
            </div>
          </div>

          {/* Node B */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col items-center gap-3 w-full md:w-1/3"
          >
            <div className="w-full p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 backdrop-blur-sm flex flex-col items-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Smartphone className="w-7 h-7 text-purple-400 mb-2 relative z-10" />
              <span className="text-xs font-semibold text-[var(--ink)] relative z-10">Android</span>
              <span className="text-[10px] text-[var(--soft)] mt-1 relative z-10">Jetpack Compose</span>
            </div>
            
            <div className="w-full h-10 flex justify-center relative">
              <div className="w-[2px] bg-gradient-to-b from-purple-500/50 to-[#F59E0B]/50 h-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-[var(--surface-muted)] text-[8px] font-mono rounded text-[var(--soft)] border border-[var(--line)]">
                JNI Bridge
              </div>
            </div>
            
            <div className="w-full p-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5 backdrop-blur-sm flex items-center justify-center gap-2 shadow-lg">
              <Cpu className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[11px] font-mono text-[#F59E0B]">Rust Core Engine</span>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
