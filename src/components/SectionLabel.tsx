import { ReactNode } from "react";

export function SectionLabel({ 
  children, 
  color = "var(--accent)",
  className = ""
}: { 
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div 
      className={`inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 rounded-lg border border-white/10 bg-[#0c1015]/80 shadow-[0_2px_12px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 ${className}`}
    >
      {/* Glossy top highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
      
      {/* Glowing dot */}
      <div className="relative flex h-2 w-2 items-center justify-center">
        <span 
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" 
          style={{ backgroundColor: color }}
        />
        <span 
          className="relative inline-flex h-1.5 w-1.5 rounded-full shadow-sm" 
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
      
      {/* Label Text */}
      <span 
        className="font-mono text-xs sm:text-[13px] font-bold uppercase tracking-[0.25em]"
        style={{ color: color }}
      >
        {children}
      </span>
      
      {/* Subtle background glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${color}, transparent)` }}
      />
    </div>
  );
}
