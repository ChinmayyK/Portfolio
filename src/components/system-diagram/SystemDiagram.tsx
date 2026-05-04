"use client";

import { ReactNode, useState } from "react";
import { DiagramContext, type DiagramMode } from "./DiagramContext";

// ─── SystemDiagram ────────────────────────────────────────────────────────────
// Outer shell — provides DiagramContext, handles hover state, renders grid.
// - Generous internal padding (32px)
// - No overflow / horizontal scroll
// - Mode-aware ambient glow
// ─────────────────────────────────────────────────────────────────────────────

interface Annotation {
  id: string;
  text: string;
}

interface SystemDiagramProps {
  eyebrow?: string;
  title?: string;
  compact?: boolean;
  mode?: DiagramMode;
  annotations?: Annotation[];
  children: ReactNode;
}

const modeGlow: Record<DiagramMode, string> = {
  normal:    "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.04), transparent 70%)",
  systems:   "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(245,158,11,0.07), transparent 68%)",
  decisions: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(94,234,212,0.07), transparent 68%)",
  failure:   "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(248,113,113,0.07), transparent 68%)",
};

export function SystemDiagram({
  eyebrow,
  title,
  compact = false,
  mode = "normal",
  annotations,
  children,
}: SystemDiagramProps) {
  const [isFlowHovered, setIsFlowHovered] = useState(false);

  return (
    <DiagramContext.Provider value={{ mode, isFlowHovered, setFlowHovered: setIsFlowHovered }}>
      <div
        className={`relative w-full overflow-hidden rounded-[1.25rem] border border-[var(--diagram-boundary)] bg-[var(--diagram-surface)] transition-all duration-500 ${
          compact ? "p-4" : "p-8"
        }`}
        onMouseEnter={() => setIsFlowHovered(true)}
        onMouseLeave={() => setIsFlowHovered(false)}
      >
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.032] [background-image:radial-gradient(var(--diagram-grid)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        {/* Ambient glow — mode-adaptive */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-all duration-700"
          style={{ background: modeGlow[mode] }}
        />

        <div className="relative min-w-0">
          {/* Header */}
          {(eyebrow || title) && (
            <div className={compact ? "mb-4" : "mb-6"}>
              {eyebrow && (
                <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-[var(--soft)]">
                  {eyebrow}
                </p>
              )}
              {title && (
                <p
                  className={`font-medium text-[var(--muted)] leading-snug ${
                    compact ? "mt-1 text-[10px]" : "mt-2 text-xs"
                  }`}
                >
                  {title}
                </p>
              )}
            </div>
          )}

          {/* Diagram content — fluid, no overflow */}
          <div className="min-w-0 w-full">{children}</div>

          {/* Annotations — full mode only */}
          {!compact && annotations && annotations.length > 0 && (
            <div className="mt-6 border-t border-[var(--diagram-boundary)] pt-5">
              <p className="mb-3 font-mono text-[8.5px] uppercase tracking-[0.28em] text-[var(--soft)]">
                System Insights
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {annotations.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-[0.75rem] border border-[var(--diagram-boundary)] bg-[var(--surface-soft)] px-4 py-2"
                  >
                    <p className="text-[10px] leading-relaxed text-[var(--soft)]">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DiagramContext.Provider>
  );
}
