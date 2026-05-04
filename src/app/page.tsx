import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { SectionTransition } from "@/components/SectionTransition";
import { ParallaxLayer } from "@/components/ParallaxLayer";

// ─── Lazy-load everything below the fold ───────────────────────────────────
const Statement  = dynamic(() => import("@/components/Statement").then(m => m.Statement));
const Experience = dynamic(() => import("@/components/Experience").then(m => m.Experience));
const Projects   = dynamic(() => import("@/components/Projects").then(m => m.Projects));
const Principles = dynamic(() => import("@/components/Principles").then(m => m.Principles));
const TechStack  = dynamic(() => import("@/components/TechStack").then(m => m.TechStack));
const Contact    = dynamic(() => import("@/components/Contact").then(m => m.Contact));
const Footer     = dynamic(() => import("@/components/Footer").then(m => m.Footer));

const SECTION_X = "px-5 sm:px-6 lg:px-8";
const SECTION_WRAP = `mx-auto w-full max-w-6xl ${SECTION_X}`;

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ① Hero — eager, above the fold */}
      <Hero />

      {/* ② Philosophy */}
      <Statement />

      <SectionTransition />

      {/* ③ Experience */}
      <ParallaxLayer speed={0.15}>
        <div id="experience" className={SECTION_WRAP}>
          <Experience />
        </div>
      </ParallaxLayer>

      <SectionTransition />

      {/* ④ Projects */}
      <Projects />

      <SectionTransition />

      {/* ⑤ Principles */}
      <ParallaxLayer speed={0.2}>
        <div className={SECTION_WRAP}>
          <Principles />
        </div>
      </ParallaxLayer>

      <SectionTransition />

      {/* ⑥ Tech Stack */}
      <ParallaxLayer speed={0.12}>
        <div className={SECTION_WRAP}>
          <TechStack />
        </div>
      </ParallaxLayer>

      {/* ⑦ Contact */}
      <Contact />

      {/* ⑧ Footer */}
      <Footer />
    </main>
  );
}
