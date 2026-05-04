"use client";

import { useEffect, useState } from "react";

function getDesktopEffectsState(minWidth: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(
    `(min-width: ${minWidth}px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`
  ).matches;
}

export function useDesktopEffects(minWidth = 1024) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      `(min-width: ${minWidth}px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`
    );

    const sync = () => {
      setEnabled(getDesktopEffectsState(minWidth));
    };

    sync();
    query.addEventListener("change", sync);

    return () => {
      query.removeEventListener("change", sync);
    };
  }, [minWidth]);

  return enabled;
}
