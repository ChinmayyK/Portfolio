"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Holds its children back until the box is near the viewport and the browser
 * is idle, so heavy decoration (and its code, when the child is a dynamic
 * import) never competes with the first paint. The box itself renders at once,
 * so its reserved size keeps the layout still.
 */
export default function WhenNear({ className, children }: { className: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let idle = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const go = () => setOn(true);
      idle = typeof requestIdleCallback === "function" ? requestIdleCallback(go, { timeout: 1500 }) : (setTimeout(go, 200) as unknown as number);
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => {
      io.disconnect();
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle); else clearTimeout(idle);
    };
  }, []);

  return <div ref={box} className={className} aria-hidden>{on && children}</div>;
}
