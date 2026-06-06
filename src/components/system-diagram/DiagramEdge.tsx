"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDiagramContext } from "./DiagramContext";

export type DiagramEdgeAccent = "amber" | "sky" | "teal";

interface DiagramEdgeProps {
  direction?: "horizontal" | "vertical";
  accent?: DiagramEdgeAccent;
  delay?: number;
  duration?: number;
}

interface AccentStyle { color: string; glow: string; failureColor: string; }

const DARK_ACCENTS: Record<DiagramEdgeAccent, AccentStyle> = {
  amber: {
    color: "rgba(245,158,11,0.9)",
    glow: "0 0 10px rgba(245,158,11,0.5)",
    failureColor: "rgba(248,113,113,0.85)",
  },
  sky: {
    color: "rgba(56,189,248,0.88)",
    glow: "0 0 10px rgba(56,189,248,0.44)",
    failureColor: "rgba(248,113,113,0.75)",
  },
  teal: {
    color: "rgba(94,234,212,0.88)",
    glow: "0 0 10px rgba(94,234,212,0.44)",
    failureColor: "rgba(248,113,113,0.75)",
  },
};

const LIGHT_ACCENTS: Record<DiagramEdgeAccent, AccentStyle> = {
  amber: {
    color: "rgba(146,64,14,0.85)",
    glow: "0 0 8px rgba(146,64,14,0.3)",
    failureColor: "rgba(220,38,38,0.7)",
  },
  sky: {
    color: "rgba(3,105,161,0.8)",
    glow: "0 0 8px rgba(3,105,161,0.3)",
    failureColor: "rgba(220,38,38,0.65)",
  },
  teal: {
    color: "rgba(6,95,70,0.8)",
    glow: "0 0 8px rgba(6,95,70,0.3)",
    failureColor: "rgba(220,38,38,0.65)",
  },
};

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

export function DiagramEdge({
  direction = "horizontal",
  accent = "amber",
  delay = 0,
  duration = 1.6,
}: DiagramEdgeProps) {
  const { mode, isFlowHovered } = useDiagramContext();
  const isDark = useIsDark();
  const isH = direction === "horizontal";
  const s = isDark ? DARK_ACCENTS[accent] : LIGHT_ACCENTS[accent];

  const isFailure = mode === "failure";
  const isDecisions = mode === "decisions";

  const pulseColor = isFailure ? s.failureColor : s.color;
  const pulseGlow = isFailure
    ? "0 0 10px rgba(248,113,113,0.45)"
    : isFlowHovered
    ? s.glow.replace(/[\d.]+\)$/, "0.68)")
    : s.glow;

  const pulseDuration = isFailure ? 0.9 : isDecisions ? 2.2 : isFlowHovered ? 1.1 : duration;
  const pulseOpacity: number[] = isFailure ? [0, 0.9, 0.35, 0.85, 0] : [0, 1, 0];

  const pulseClass = isH ? "h-[2px] w-6 rounded-full" : "h-6 w-[2px] rounded-full";
  const baseOpacity = isFlowHovered ? 0.5 : 0.3;
  const baseColor = isDark ? `rgba(255,255,255,${baseOpacity})` : `rgba(15,23,42,${baseOpacity})`;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${
        isH ? "h-px w-12" : "h-7 w-px mx-auto"
      }`}
    >
      <div
        className={`absolute ${isH ? "h-px w-full" : "h-full w-px"}`}
        style={{ background: baseColor }}
      />
      <motion.div
        data-flow-pulse
        className={`absolute ${pulseClass}`}
        style={{ background: pulseColor, boxShadow: pulseGlow }}
        animate={
          isH
            ? { x: ["-150%", "150%"], opacity: pulseOpacity }
            : { y: ["-150%", "150%"], opacity: pulseOpacity }
        }
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: isFailure ? "easeOut" : "linear",
          delay,
          times: isFailure ? [0, 0.2, 0.5, 0.8, 1] : undefined,
        }}
      />
    </div>
  );
}

