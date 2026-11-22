"use client";

import { scrollToTarget } from "@/lib/scroll";

export default function BackToTop() {
  return (
    <button type="button" className="uhover back-top" onClick={() => { scrollToTarget(0); document.getElementById("main")?.focus({ preventScroll: true }); }}>
      Back to top ↑
    </button>
  );
}
