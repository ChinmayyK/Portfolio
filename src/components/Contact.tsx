"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Github, Linkedin, MapPin, Sparkles } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { MagneticButton } from "./MagneticButton";
import { triggerHaptic } from "@/lib/haptics";
import { RESUME_URL } from "@/lib/resume";
import { ScrollScramble } from "./TextScramble";

function TypedEmail() {
  const email = "chinmayy.kudalkar@gmail.com";
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(email.slice(0, i));
      if (i >= email.length) {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 800);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <span ref={ref} className="font-mono text-xs tracking-wider text-[var(--soft)]">
      {displayed}
      {showCursor && started && (
        <span className="inline-block w-[4px] h-[16px] bg-[var(--accent-soft)] ml-1 align-text-bottom animate-pulse" />
      )}
    </span>
  );
}

function FloatingOrb(_: { delay: number; size: number; x: string; y: string; color: string }) {
  // Intentionally replaced — bouncing orbs removed
  return null;
}

/** Cursor-reactive ambient background for contact section */
function AmbientGradient() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 50, y: 50 });
  const display = useRef({ x: 50, y: 50 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const section = ref.current?.parentElement;
    if (!section) return;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      pos.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      };
    };

    const tick = () => {
      // Lerp toward cursor — very slow, dreamlike
      display.current.x += (pos.current.x - display.current.x) * 0.04;
      display.current.y += (pos.current.y - display.current.y) * 0.04;

      if (ref.current) {
        ref.current.style.background = `
          radial-gradient(600px circle at ${display.current.x}% ${display.current.y}%, 
            rgba(245,158,11,0.07), transparent 65%),
          radial-gradient(400px circle at ${100 - display.current.x}% ${100 - display.current.y}%, 
            rgba(94,234,212,0.05), transparent 60%)
        `;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    section.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf.current);
      section.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  );
}

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    triggerHaptic("light");
    
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      
      const res = await response.json();
      
      if (response.ok && res.success) {
        setStatus("success");
        triggerHaptic("success");
        e.currentTarget.reset();
      } else {
        setStatus("error");
        setErrorMsg(res.error || "Failed to send message.");
        triggerHaptic("error");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg("Network error. Please try again or email directly.");
      triggerHaptic("error");
      console.error(err);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="mt-8 w-full max-w-sm mx-auto flex flex-col gap-3 text-left"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <input 
        name="name" 
        required 
        placeholder="Your Name" 
        className="w-full bg-[var(--surface-soft)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--soft)] focus:outline-none focus:border-[var(--accent)] transition-colors backdrop-blur-md"
      />
      <input 
        name="email" 
        type="email" 
        required 
        placeholder="Your Email" 
        className="w-full bg-[var(--surface-soft)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--soft)] focus:outline-none focus:border-[var(--accent)] transition-colors backdrop-blur-md"
      />
      <textarea 
        name="message" 
        required 
        placeholder="Your Message" 
        rows={4}
        className="w-full bg-[var(--surface-soft)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--soft)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none backdrop-blur-md"
      />
      
      {status === "error" && <p className="text-red-500 text-xs px-1">{errorMsg}</p>}
      {status === "success" && <p className="text-[var(--success)] text-xs px-1">Message sent successfully! I'll get back to you soon.</p>}
      
      <div className="flex gap-3 mt-2">
        <MagneticButton
          as="button"
          type="submit"
          disabled={status === "loading" || status === "success"}
          strength={0.2}
          className="flex-1 relative ripple-container inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending..." : status === "success" ? "Sent!" : "Send Message"}
        </MagneticButton>
        <MagneticButton
          as="a"
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          strength={0.2}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[var(--surface-soft)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] transition-all hover:bg-[var(--surface-muted)] hover:border-[var(--accent)]/30 backdrop-blur-md"
        >
          Resume
        </MagneticButton>
      </div>
    </motion.form>
  );
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden px-6 pb-12 pt-14 sm:pt-28 sm:px-8 md:pb-20 md:pt-36 lg:px-12"
    >
      {/* Cursor-reactive ambient gradient — replaces bouncing orbs */}
      <AmbientGradient />

      {/* Divider */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--divider-line)] to-transparent" />

      {/* Grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:60px_60px]" />

      <motion.div style={{ scale }} className="relative mx-auto max-w-2xl text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 mb-6 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">Open to opportunities</span>
        </motion.div>

        <motion.p
          className="eyebrow mb-3"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
        >
          What&apos;s next
        </motion.p>

        <motion.h2
          className="section-title font-extrabold tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <ScrollScramble text="Let's build" as="span" duration={600} delay={200} />{" "}
          <span className="text-gradient-full italic">systems</span>{" "}
          <br className="sm:hidden" />
          <ScrollScramble text="that" as="span" duration={500} delay={350} />
          {" "}
          <ScrollScramble text="last." as="span" duration={500} delay={450} />
        </motion.h2>

        <motion.p
          className="mx-auto mt-4 max-w-sm text-base sm:text-lg leading-7 text-[var(--muted)] font-medium"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25 }}
        >
          Designed for scale. Built with intent. Ready to ship.
        </motion.p>

        {/* Typed email */}
        <motion.div
          className="mt-4 flex justify-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.35 }}
        >
          <TypedEmail />
        </motion.div>

        {/* Form & CTA */}
        <ContactForm />

        {/* Social links */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          {[
            { href: "https://github.com/ChinmayyK", Icon: Github, label: "GitHub" },
            { href: "https://www.linkedin.com/in/chinmayyk/", Icon: Linkedin, label: "LinkedIn" },
          ].map(({ href, Icon, label }) => (
            <MagneticButton key={label} strength={0.2} as="a" href={href} target="_blank" rel="noopener noreferrer">
              <div
                onClick={() => triggerHaptic("light")}
                className="group flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm text-[var(--muted)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent)]/30 hover:text-[var(--text)] hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:bg-[var(--surface-accent)]"
              >
                <Icon className="h-4 w-4 text-[var(--soft)] transition-colors group-hover:text-[var(--accent-soft)]" strokeWidth={1.5} />
                {label}
              </div>
            </MagneticButton>
          ))}
        </motion.div>

        {/* Location */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--soft)]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <MapPin className="h-4 w-4" />
          <span>Navi Mumbai, India</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
