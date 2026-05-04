"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Haptic Feedback Utility v2
//
// Platform coverage:
//  • Android Chrome / Firefox: navigator.vibrate() — full support
//  • iOS Safari (standard):    no Web Vibration API; we use a sub-audible
//    AudioContext burst (~200 Hz, near-silent) that causes tiny speaker
//    resonance on iPhone — closest approximation without a native bridge
//  • iOS PWA (home screen):    same as above
//  • Desktop:                  silently no-ops
//
// The layout.tsx injects a hapticPrimerScript that creates an AudioContext
// on the first user gesture and stores it at window.__hapticAudioCtx.
// We reuse that already-unlocked context here, avoiding the iOS
// "AudioContext was not allowed to start" restriction.
// ─────────────────────────────────────────────────────────────────────────────

export type HapticStyle =
  | "light"
  | "medium"
  | "strong"
  | "success"
  | "warning"
  | "error";

// Web Vibration API patterns (ms on / ms off / …)
// Using values well above Android hardware minimums to guarantee perceptible
// motor activation across all OEMs (Samsung, Xiaomi, OnePlus, Pixel, etc.)
const vibrationPatterns: Record<HapticStyle, number | number[]> = {
  light:   60,
  medium:  100,
  strong:  150,
  success: [60, 80, 60],
  warning: [100, 100, 100],
  error:   [150, 100, 150, 100, 150],
};

// Near-inaudible gain per style (felt as speaker micro-resonance on iPhone)
const iosGains: Record<HapticStyle, number> = {
  light:   0.0008,
  medium:  0.0014,
  strong:  0.0022,
  success: 0.0014,
  warning: 0.0018,
  error:   0.0022,
};

// Burst duration in seconds
const iosDurations: Record<HapticStyle, number> = {
  light:   0.018,
  medium:  0.034,
  strong:  0.055,
  success: 0.030,
  warning: 0.040,
  error:   0.060,
};

let lastHapticAt = 0;

// ── Detect iOS ────────────────────────────────────────────────

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports itself as macOS
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// ── Get AudioContext ──────────────────────────────────────────
// Prefers the already-unlocked context created by the primer script
// in layout.tsx. Falls back to creating a new one if needed.

type WindowWithCtx = Window & { __hapticAudioCtx?: AudioContext };

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  // Reuse primer context if available and running
  const primed = (window as WindowWithCtx).__hapticAudioCtx;
  if (primed) {
    if (primed.state === "suspended") {
      primed.resume().catch(() => {});
    }
    return primed;
  }

  // Fallback: try to create our own
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    (window as WindowWithCtx).__hapticAudioCtx = ctx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

// ── iOS speaker-resonance haptic ─────────────────────────────

function playIOSBuffer(ctx: AudioContext, style: HapticStyle): void {
  try {
    const duration = iosDurations[style];
    const sampleCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Shaped white noise: fast attack, exponential decay
    for (let i = 0; i < sampleCount; i++) {
      const envelope =
        i < sampleCount * 0.05
          ? i / (sampleCount * 0.05)
          : 1 - (i - sampleCount * 0.05) / (sampleCount * 0.95);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    source.buffer = buffer;
    gain.gain.setValueAtTime(iosGains[style], ctx.currentTime);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
    source.onended = () => {
      try {
        gain.disconnect();
        source.disconnect();
      } catch {}
    };
  } catch (e) {
    console.error('[haptics] iOS error:', e);
  }
}

function triggerIOSHaptic(style: HapticStyle): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // AudioContext may still be suspended on the very first gesture —
  // resume() is async, so chain the buffer playback inside .then().
  if (ctx.state === "suspended") {
    ctx.resume().then(() => playIOSBuffer(ctx, style)).catch(() => {});
  } else {
    playIOSBuffer(ctx, style);
  }
}

// ── Public API ────────────────────────────────────────────────

/**
 * Trigger haptic feedback. Falls back gracefully on unsupported platforms.
 *
 * Usage:
 *   triggerHaptic("light")   // subtle tap
 *   triggerHaptic("strong")  // prominent tap
 *   triggerHaptic("success") // double-pulse confirmation
 */
export function triggerHaptic(style: HapticStyle = "light"): void {
  if (typeof window === "undefined") return;

  // Throttle — 80ms is enough to prevent double-fires while still
  // feeling responsive on fast taps. Lower than before (was 250ms)
  // because 250ms was swallowing legitimate rapid interactions.
  const now = Date.now();
  if (now - lastHapticAt < 80) return;
  lastHapticAt = now;

  // 1. Standard Web Vibration API (Android Chrome / some desktop)
  //    DO NOT early-return based on vibrate()'s return value — many
  //    Android devices/OEMs return true but the motor doesn't fire
  //    (e.g. battery saver mode, OEM vibration policies). We fire
  //    and forget; the OS decides if the motor runs.
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(vibrationPatterns[style]);
    } catch {
      // Silently swallow — may be blocked by Permissions Policy
    }
  }

  // 2. iOS speaker-resonance via WebAudio (additive, not exclusive)
  if (isIOS()) {
    triggerIOSHaptic(style);
  }
}

/**
 * Stop any ongoing vibration.
 */
export function cancelHaptic(): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(0); } catch {}
  }
}
