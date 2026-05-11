"use client";

import { useScroll, useTransform, motion, useInView } from "framer-motion";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionLabel } from "./SectionLabel";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "./ScrollReveal";
import { ScrollScramble } from "./TextScramble";
import { TiltCard } from "./TiltCard";
import { Cpu, GitBranch, BarChart3 } from "lucide-react";
import { BlueprintGrid } from "./GhostLayers";

const systems = [
  {
    title: "Multi-tenant",
    tag: "ARCHITECTURE",
    desc: "Shared infrastructure isolation across tenants without data leakage.",
    icon: Cpu,
    accentRgb: "245,158,11",
  },
  {
    title: "Async",
    tag: "WORKFLOWS",
    desc: "Reliable async sync with BullMQ-backed queue processing.",
    icon: GitBranch,
    accentRgb: "94,234,212",
  },
  {
    title: "Production",
    tag: "SYSTEMS",
    desc: "Production SaaS delivery with real constraints and real users.",
    icon: BarChart3,
    accentRgb: "167,139,250",
  },
];

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 0.3, 0.5], ["0%", "100%", "100%"]);
  const lineOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const fadeOut = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll(".exp-card");
    const heading = sectionRef.current.querySelector(".exp-heading");
    gsap.set([heading, ...cards], { opacity: 0, y: 32 });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(heading, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
          gsap.to(cards, { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power3.out", delay: 0.15 });
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, { scope: sectionRef });

  return (
    <section id="experience" ref={sectionRef} className="relative py-8 sm:py-16 md:py-32">
      <BlueprintGrid />
      <div className="exp-heading relative z-10 mb-8 sm:mb-12 md:mb-16">
        <motion.div style={{ opacity: fadeOut }}>
          <SectionLabel>Experience</SectionLabel>
          <h2 className="section-title max-w-3xl">
            <ScrollScramble
              text="System Design & Delivery"
              as="span"
              duration={760}
            />
          </h2>
        </motion.div>
      </div>

      <article className="panel panel-strong overflow-visible exp-card relative z-10 group">
        {/* Ambient glow behind card */}
        <div className="absolute -inset-2 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-xl"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, transparent 50%, rgba(94,234,212,0.1) 100%)" }}
        />
        <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, transparent 50%, rgba(94,234,212,0.08) 100%)" }}
        />

        {/* Header */}
        <div className="relative px-5 py-4 sm:px-6 sm:py-6 md:px-8 md:pt-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative flex h-2 w-2 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full bg-[var(--success)] opacity-40"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]" />
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-[var(--soft)] whitespace-nowrap">
              MINTSKILL HR SOLUTIONS · 2025-26
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mt-2 sm:mt-3 mb-1">
            Full-Stack Engineer
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Architected system design and delivery of a multi-tenant recruitment SaaS processing 10k+ jobs/day.
          </p>

          <motion.div
            className="absolute bottom-0 inset-x-6 md:inset-x-8 h-px bg-gradient-to-r from-[var(--accent-soft)] via-[var(--line)] to-transparent"
            style={{ width: lineWidth, opacity: lineOpacity }}
          />
        </div>

        {/* Highlights grid */}
        <div className="px-5 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <ScrollRevealGroup className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3" stagger={0.12}>
            {systems.map((item) => {
              const Icon = item.icon;
              return (
                <ScrollRevealItem key={item.tag} direction="up" distance={20}>
                  <TiltCard tiltStrength={6}>
                    <motion.div
                      className="group flex h-full flex-col justify-between rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:p-6 transition-all duration-400 overflow-hidden relative"
                      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
                      style={{ borderColor: "var(--line)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = `rgba(${item.accentRgb},0.3)`;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px rgba(${item.accentRgb},0.08)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "";
                      }}
                    >
                      {/* Corner glow */}
                      <div
                        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(circle, rgba(${item.accentRgb},0.2), transparent)`, filter: "blur(12px)" }}
                      />

                      <div>
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110"
                          style={{ background: `rgba(${item.accentRgb},0.1)`, boxShadow: `0 0 0 1px rgba(${item.accentRgb},0.2)` }}
                        >
                          <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" style={{ color: `rgb(${item.accentRgb})` }} strokeWidth={2} />
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-[var(--text)] md:text-xl">{item.title}</p>
                        <p className="mt-1 sm:mt-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em]" style={{ color: `rgba(${item.accentRgb},0.8)` }}>
                          {item.tag}
                        </p>
                      </div>
                      <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-5 sm:leading-6 text-[var(--muted)]">{item.desc}</p>
                    </motion.div>
                  </TiltCard>
                </ScrollRevealItem>
              );
            })}
          </ScrollRevealGroup>
        </div>
      </article>
    </section>
  );
}
