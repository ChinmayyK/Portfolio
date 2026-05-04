"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Micro-sound system — reuses the primed AudioContext from layout.tsx
// ─────────────────────────────────────────────────────────────────────────────

type WindowWithCtx = Window & { __hapticAudioCtx?: AudioContext };

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const primed = (window as WindowWithCtx).__hapticAudioCtx;
  if (primed) {
    if (primed.state === "suspended") primed.resume().catch(() => {});
    return primed;
  }

  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    (window as WindowWithCtx).__hapticAudioCtx = ctx;
    return ctx;
  } catch {
    return null;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A nearly-inaudible two-tone blip played when the system mode switcher
 * changes state. gain is set very low (0.04) — only barely audible on
 * headphones. The UI is fully usable without it.
 */
export function playModePulse(): void {
  if (prefersReducedMotion()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.04, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    masterGain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(520, now + 0.08);
    osc1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.18);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0, now + 0.04);
    shimmerGain.gain.linearRampToValueAtTime(0.02, now + 0.08);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    shimmerGain.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
    osc2.connect(shimmerGain);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.18);
  } catch {
    // silent fail
  }
}

export function playClick(): void {
  if (prefersReducedMotion()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}
