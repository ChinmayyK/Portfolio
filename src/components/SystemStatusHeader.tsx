"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { triggerHaptic } from "@/lib/haptics";

export function SystemStatusHeader({ className }: { className?: string }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = ["BUILDING", "AVAILABLE", "RUNNING"];
  const currentStatus = statuses[statusIndex];
  const statusRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!statusRef.current) return;

    gsap.fromTo(statusRef.current, 
      { opacity: 0, x: -5 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );
  }, { dependencies: [currentStatus] });

  const handleCycle = () => {
    triggerHaptic("light");
    setStatusIndex((prev) => (prev + 1) % statuses.length);
  };

  return (
    <div className={`flex flex-col items-start gap-1 cursor-pointer transition-all duration-300 w-fit group ${className || "mb-4 sm:mb-6"}`} onClick={handleCycle} title="Click to cycle status">
      {/* Line 1: Status */}
      <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase">
        {/* Blinking Dot */}
        <div className="relative flex items-center justify-center w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-[#22c55e] animate-ping opacity-60" />
          <div className="relative w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        </div>
        <span className="text-[var(--muted)] opacity-80">STATUS:</span>
        <span ref={statusRef} className="text-[var(--success)] font-medium">{currentStatus}</span>
      </div>

      {/* Line 2: Role */}
      <div className="font-mono text-[12px] sm:text-[13px] tracking-[0.1em] text-[var(--text)] font-semibold uppercase">
        FULL-STACK ENGINEER
      </div>
    </div>
  );
}
