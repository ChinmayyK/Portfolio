"use client";

import { createContext, useContext } from "react";

export type DiagramMode = "normal" | "systems" | "decisions" | "failure";

interface DiagramContextValue {
  mode: DiagramMode;
  isFlowHovered: boolean;
  setFlowHovered?: (v: boolean) => void;
}

export const DiagramContext = createContext<DiagramContextValue>({
  mode: "normal",
  isFlowHovered: false,
});

export function useDiagramContext() {
  return useContext(DiagramContext);
}

