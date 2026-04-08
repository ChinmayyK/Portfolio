"use client";

/**
 * NoiseTexture — Premium film grain overlay.
 * Uses a higher-quality SVG noise filter with optimized opacity
 * to add that analog, premium texture across the entire viewport.
 * Subtly animated to prevent static noise banding.
 */
export function NoiseTexture() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.018] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          animation: "noise-drift 8s steps(4) infinite",
        }}
      />
      <style jsx>{`
        @keyframes noise-drift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, 2px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </>
  );
}

