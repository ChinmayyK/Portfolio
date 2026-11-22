import Disc from "@/components/chrome/Disc";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="page nf frame">
      <p className="t-label">404</p>
      <h1 className="t-name">Not here.</h1>
      <p className="t-lead nf-lead">This page doesn&apos;t exist, or it moved when the site was rebuilt.</p>
      <Disc href="/" label="Index">Back home</Disc>
    </main>
  );
}
