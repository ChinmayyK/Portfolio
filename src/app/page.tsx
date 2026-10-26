import { commitsAtBuild } from "@/lib/commits";
import { repoStats } from "@/lib/repo";
import { PROJECTS } from "@/lib/content";
import Nav from "@/components/Nav";
import Board from "@/components/Board";

export default async function Home() {
  const [days, repo] = await Promise.all([commitsAtBuild(), repoStats(PROJECTS[0].src)]);

  return (
    <>
      <Nav />
      <Board initial={days} repo={repo} />
      <footer className="wrap foot mono">
        <span>Chinmay Kudalkar, 2026</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
