import Disc from "@/components/chrome/Disc";

export default function Intro() {
  return (
    <section className="intro frame" aria-label="Introduction">
      <p className="intro-lead t-h3" data-fill>
        I work across the whole stack, from the interface to the service and the data underneath, and I care most about software that keeps
        working when conditions aren&apos;t ideal.
      </p>
      <p className="intro-side t-small" data-reveal data-delay="0.2">
        Right now that means a Rust core shared by four native apps, a fleet platform for a drone company, and a disk for macOS that streams
        from the cloud.
      </p>
      <div className="intro-disc" data-reveal data-delay="0.3"><Disc href="/#about" label="About">About me</Disc></div>
    </section>
  );
}
