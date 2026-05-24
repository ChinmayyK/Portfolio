"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "blur" | "fade";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: RevealDirection;
  distance?: number;
  once?: boolean;
  stagger?: number;
}

function getEase(direction: RevealDirection) {
  switch (direction) {
    case "blur":  return "power2.out";
    case "fade":  return "power1.inOut";
    case "scale": return "back.out(1.4)";
    case "left":
    case "right": return "expo.out";
    default:      return "power3.out";
  }
}

function getInitial(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "up":    return { opacity: 0, y: distance };
    case "down":  return { opacity: 0, y: -distance };
    case "left":  return { opacity: 0, x: distance };
    case "right": return { opacity: 0, x: -distance };
    case "scale": return { opacity: 0, scale: 0.93, y: distance * 0.4 };
    case "blur":  return { opacity: 0, filter: "blur(8px)", y: distance * 0.3 };
    case "fade":  return { opacity: 0 };
    default:      return { opacity: 0, y: distance };
  }
}

function getAnimate(direction: RevealDirection) {
  switch (direction) {
    case "left":
    case "right": return { opacity: 1, x: 0 };
    case "scale": return { opacity: 1, scale: 1, y: 0 };
    case "blur":  return { opacity: 1, filter: "blur(0px)", y: 0 };
    case "fade":  return { opacity: 1 };
    default:      return { opacity: 1, y: 0 };
  }
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  direction = "up",
  distance = 28,
  once = true,
}: ScrollRevealProps) {
  const el = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!el.current) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      gsap.set(el.current, { opacity: 1, y: 0, x: 0, scale: 1, filter: "none" });
      return;
    }

    gsap.fromTo(
      el.current,
      getInitial(direction, distance),
      {
        ...getAnimate(direction),
        duration,
        delay,
        ease: getEase(direction),
        scrollTrigger: {
          trigger: el.current,
          start: "top 88%",
          once,
        },
      }
    );
  }, { scope: el });

  return (
    <div ref={el} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

interface ScrollRevealGroupProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  direction?: RevealDirection;
  distance?: number;
}

export function ScrollRevealGroup({
  children,
  className = "",
  stagger = 0.09,
  delayChildren = 0.05,
  direction = "scale",
  distance = 18,
}: ScrollRevealGroupProps) {
  const el = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!el.current) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      gsap.set(el.current.children, { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    const childEls = Array.from(el.current.children) as HTMLElement[];

    // Slightly irregular stagger amounts feel more organic
    childEls.forEach((child, i) => {
      const jitter = Math.sin(i * 2.3 + 1) * 0.03;
      gsap.fromTo(
        child,
        getInitial(direction, distance),
        {
          ...getAnimate(direction),
          duration: 0.5 + (i % 3) * 0.04,
          delay: delayChildren + i * (stagger + jitter),
          ease: getEase(direction),
          scrollTrigger: {
            trigger: el.current,
            start: "top 86%",
            once: true,
          },
        }
      );
    });
  }, { scope: el });

  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
}

interface ScrollRevealItemProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  distance?: number;
}

export function ScrollRevealItem({
  children,
  className = "",
  direction = "up",
  distance = 20,
}: ScrollRevealItemProps) {
  const init = getInitial(direction, distance);
  return (
    <div
      className={className}
      style={{
        opacity: init.opacity,
        transform: `translateY(${(init as { y?: number }).y ?? 0}px)`,
      }}
    >
      {children}
    </div>
  );
}

