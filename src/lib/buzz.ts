/** A short tick on phones that support it (Android); silently does nothing elsewhere. */
export function buzz() {
  if (matchMedia("(pointer: coarse)").matches) navigator.vibrate?.(8);
}
