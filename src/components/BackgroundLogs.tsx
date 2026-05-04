"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function BackgroundLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const logMessages = [
      "INTERACTION_OBSERVED: cursor_move",
      "UI_ENGINE: updating_parallax_layer",
      "COMPONENT_MOUNTED: terminal_widget",
      "HAPTIC_ENGINE: initialized",
      "STATE_UPDATE: theme_synced",
      "EVENT_EMITTED: system_idle",
      "METRIC_LOGGED: frame_time_1.2ms",
      "DATA_FETCH: github_contributions",
      "ANIMATION_START: hero_reveal",
      "RENDER_CYCLE: complete",
      "OPTIMIZATION: tree_shaking_active",
      "BUFFER_CLEAR: old_frames"
    ];

    let count = 0;
    const interval = setInterval(() => {
      setLogs(prev => {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        const newLogs = [...prev, `[${timestamp}] ${logMessages[count % logMessages.length]}`];
        return newLogs.slice(-12);
      });
      count++;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05] [mask-image:linear-gradient(to_bottom,white,transparent_80%)]">
      <div className="absolute top-[10%] left-[2%] flex flex-col gap-3 font-mono text-[9px] sm:text-[11px] text-[var(--text)] tracking-tighter">
        {logs.map((log, i) => (
          <motion.div
            key={`${i}-${log}`}
            initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {log}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
