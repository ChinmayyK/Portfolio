/**
 * Lightweight global event bus for system-level events.
 * No external deps — just a typed pub/sub.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

/** Emit a system status check event */
export function emitSystemStatus() {
  listeners.forEach((fn) => fn());
}

/** Subscribe to system status check events. Returns unsubscribe fn. */
export function onSystemStatus(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
