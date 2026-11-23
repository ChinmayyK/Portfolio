import Hero from "@/components/hero/Hero";
import Intro from "@/components/home/Intro";
import Work from "@/components/home/Work";
import About from "@/components/home/About";
import Curve from "@/components/chrome/Curve";
import Contact from "@/components/home/Contact";

export default function Home() {
  return (
    <>
      <main id="main" tabIndex={-1} className="page">
        <Hero />
        <Intro />
        <Work />
        <About />
        <Curve />
      </main>
      <Contact />
    </>
  );
}
