import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS, projectBySlug } from "@/content/projects";
import CaseStudy from "@/components/case/CaseStudy";
import Curve from "@/components/chrome/Curve";
import Contact from "@/components/home/Contact";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} — Chinmay Kudalkar`, description: p.summary, url: `/work/${p.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  const next = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];
  return (
    <>
      <main id="main" tabIndex={-1} className="page">
        <CaseStudy project={project} next={next} />
        <Curve />
      </main>
      <Contact />
    </>
  );
}
