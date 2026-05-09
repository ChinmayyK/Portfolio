"use client";

import { useState, useEffect, type ReactNode } from "react";
import { DiagramEdge, type DiagramEdgeAccent } from "./DiagramEdge";

// ─── Shared primitives ────────────────────────────────────────────────────────
// FlowRow and Zone — consistent spacing, breathing room, no compression.
// ─────────────────────────────────────────────────────────────────────────────

function useIsDark() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.dataset.theme !== "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

interface FlowRowProps {
  children: ReactNode[];
  accent?: DiagramEdgeAccent;
  delays?: number[];
  duration?: number;
}

export function FlowRow({
  children,
  accent = "amber",
  delays = [0],
  duration = 1.6,
}: FlowRowProps) {
  const nodes = Array.isArray(children) ? children : [children];
  const edgeCount = nodes.length - 1;

  const items: ReactNode[] = [];
  nodes.forEach((node, i) => {
    items.push(
      <div key={`node-${i}`} className="min-w-0 flex-1 flex flex-col">
        {node}
      </div>
    );
    if (i < edgeCount) {
      items.push(
        <div key={`edge-h-${i}`} className="hidden shrink-0 md:flex md:items-center md:justify-center">
          <DiagramEdge
            direction="horizontal"
            accent={accent}
            delay={delays[i] ?? i * 0.15}
            duration={duration}
          />
        </div>
      );
    }
  });

  const mobileConnectors: ReactNode[] = [];
  for (let i = 0; i < edgeCount; i++) {
    mobileConnectors.push(
      <div key={`edge-v-${i}`} className="flex justify-center md:hidden my-1">
        <DiagramEdge
          direction="vertical"
          accent={accent}
          delay={delays[i] ?? i * 0.15}
          duration={duration}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Mobile: stack nodes with vertical connectors */}
      <div className="flex flex-col gap-0 md:hidden">
        {nodes.map((node, i) => (
          <div key={i} className="min-w-0">
            {node}
            {i < edgeCount && mobileConnectors[i]}
          </div>
        ))}
      </div>

      {/* Desktop: horizontal row with generous gap via edges */}
      <div className="hidden min-w-0 items-stretch gap-0 md:flex">
        {items}
      </div>
    </div>
  );
}

// ── Zone ──────────────────────────────────────────────────────────────────────

export type ZoneTone = "amber" | "sky" | "teal" | "purple" | "client" | "external";

interface ZoneStyle { border: string; bg: string; title: string; }

const DARK_ZONES: Record<ZoneTone, ZoneStyle> = {
  amber:    { border: "border-[rgba(245,158,11,0.2)]",   bg: "bg-[rgba(245,158,11,0.022)]",   title: "text-[rgba(253,230,138,0.7)]" },
  sky:      { border: "border-[rgba(56,189,248,0.22)]",  bg: "bg-[rgba(56,189,248,0.022)]",   title: "text-[rgba(186,230,253,0.7)]" },
  teal:     { border: "border-[rgba(94,234,212,0.22)]",  bg: "bg-[rgba(94,234,212,0.022)]",   title: "text-[rgba(153,246,228,0.7)]" },
  purple:   { border: "border-[rgba(167,139,250,0.2)]",  bg: "bg-[rgba(167,139,250,0.022)]",  title: "text-[rgba(221,214,254,0.7)]" },
  client:   { border: "border-[rgba(56,189,248,0.22)]",  bg: "bg-[rgba(56,189,248,0.022)]",   title: "text-[rgba(186,230,253,0.7)]" },
  external: { border: "border-[rgba(94,234,212,0.22)]",  bg: "bg-[rgba(94,234,212,0.022)]",   title: "text-[rgba(153,246,228,0.7)]" },
};

const LIGHT_ZONES: Record<ZoneTone, ZoneStyle> = {
  amber:    { border: "border-[rgba(146,64,14,0.22)]",   bg: "bg-[rgba(146,64,14,0.03)]",    title: "text-[rgba(120,53,15,0.75)]" },
  sky:      { border: "border-[rgba(3,105,161,0.22)]",   bg: "bg-[rgba(3,105,161,0.03)]",    title: "text-[rgba(12,74,110,0.75)]" },
  teal:     { border: "border-[rgba(6,95,70,0.22)]",     bg: "bg-[rgba(6,95,70,0.03)]",      title: "text-[rgba(4,78,56,0.75)]" },
  purple:   { border: "border-[rgba(109,40,217,0.2)]",   bg: "bg-[rgba(109,40,217,0.03)]",   title: "text-[rgba(88,28,135,0.75)]" },
  client:   { border: "border-[rgba(3,105,161,0.22)]",   bg: "bg-[rgba(3,105,161,0.03)]",    title: "text-[rgba(12,74,110,0.75)]" },
  external: { border: "border-[rgba(6,95,70,0.22)]",     bg: "bg-[rgba(6,95,70,0.03)]",      title: "text-[rgba(4,78,56,0.75)]" },
};

interface ZoneProps {
  title: string;
  caption?: string;
  tone: ZoneTone;
  children: ReactNode;
}

export function Zone({ title, caption, tone, children }: ZoneProps) {
  const isDark = useIsDark();
  const s = isDark ? DARK_ZONES[tone] : LIGHT_ZONES[tone];
  return (
    <section
      className={`min-w-0 rounded-[1.15rem] border border-dashed px-5 py-5 ${s.border} ${s.bg}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className={`font-mono text-[9.5px] uppercase tracking-[0.28em] ${s.title}`}>{title}</p>
        {caption && (
          <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-[var(--soft)]">
            {caption}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

