"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ScrollProgress } from "./ScrollProgress";
import { FloatingNav } from "./FloatingNav";
import { useDesktopEffects } from "@/hooks/useDesktopEffects";
import { SystemBootInitializer } from "./SystemBootInitializer";
import { triggerHaptic } from "@/lib/haptics";
import { playClick } from "@/lib/sounds";
import { GrainOverlay } from "./GrainOverlay";

// ── Lazy-load non-critical layout decorations ────────────────────────────────
const NoiseTexture     = dynamic(() => import("./NoiseTexture").then(m => m.NoiseTexture),     { ssr: false });
const ScrollExperience = dynamic(() => import("./ScrollExperience").then(m => m.ScrollExperience), { ssr: false });
const AmbientParticles = dynamic(() => import("./AmbientParticles").then(m => m.AmbientParticles), { ssr: false });
const ThemeShockwave   = dynamic(() => import("./ThemeShockwave").then(m => m.ThemeShockwave),     { ssr: false });

export function ClientLayoutEffects({ children }: { children: React.ReactNode }) {
  const desktopEffects = useDesktopEffects();

  useEffect(() => {
    const pulseButton = (button: Element) => {
      button.setAttribute("data-haptic-press", "true");
      window.setTimeout(() => {
        button.removeAttribute("data-haptic-press");
      }, 140);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button, [role='button']");
      if (!button) return;

      if (button instanceof HTMLButtonElement && button.disabled) return;

      triggerHaptic("medium");
      playClick();
      pulseButton(button);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.detail !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button, [role='button']");
      if (!button) return;

      triggerHaptic("medium");
      playClick();
      pulseButton(button);
    };

    document.addEventListener("pointerup", handlePointerUp, { capture: true, passive: true });
    document.addEventListener("click", handleClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return (
    <SystemBootInitializer>
      <div data-app-shell>
        {/* Grain texture — subliminal film grain, makes the page feel physical */}
        <GrainOverlay />
        <ThemeShockwave />
        {desktopEffects ? <ScrollExperience /> : null}
        {desktopEffects ? <NoiseTexture /> : null}
        <ScrollProgress />
        <FloatingNav />
        {desktopEffects ? <AmbientParticles /> : null}
        {children}
      </div>
    </SystemBootInitializer>
  );
}
