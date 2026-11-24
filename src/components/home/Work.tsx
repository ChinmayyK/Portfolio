import { ALSO, PROJECTS, SHOTS } from "@/content/projects";
import WorkIndex, { type WorkItem } from "@/components/work/WorkIndex";

export default function Work() {
  const [linkAll, fleet, vault] = PROJECTS;
  const sd = ALSO[0];
  const items: WorkItem[] = [
    { title: linkAll.title, category: linkAll.category, kind: linkAll.kind, years: linkAll.years, href: `/work/${linkAll.slug}`, preview: { kind: "shot", shot: SHOTS.macDevices }, tint: "#dcdcd6" },
    { title: fleet.title, category: fleet.category, kind: `${fleet.kind} · ideaForge`, years: fleet.years, href: `/work/${fleet.slug}`, preview: { kind: "route" }, tint: "#e3e2dc" },
    { title: vault.title, category: vault.category, kind: vault.kind, years: vault.years, href: `/work/${vault.slug}`, preview: { kind: "redaction" }, tint: "#e6e5e0" },
    { title: sd.title, category: sd.category, kind: sd.kind, years: sd.years, href: sd.href, external: true, preview: { kind: "shot", shot: SHOTS.streamdisk }, tint: "#d9d8d2" },
  ];
  return (
    <section id="work" className="work frame" aria-labelledby="work-title">
      <div className="work-head">
        <h2 id="work-title" className="t-label">Selected work</h2>
        <p className="t-label work-head-meta">Name / Type / Role / Year</p>
      </div>
      <WorkIndex items={items} />
    </section>
  );
}
