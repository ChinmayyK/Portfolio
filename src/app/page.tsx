import { commitsAtBuild } from "@/lib/commits";
import { repoAtBuild } from "@/lib/repo";
import Nav from "@/components/Nav";
import Board from "@/components/Board";
import { LAND_INLINE } from "@/components/landing";

export default async function Home() {
  const [days, repo] = await Promise.all([commitsAtBuild(), repoAtBuild()]);

  return (
    <>
      <Nav />
      <Board initial={days} repo={repo} />
      {/* starts the landing intro as soon as the board is in the HTML, before the bundle loads */}
      <script dangerouslySetInnerHTML={{ __html: LAND_INLINE }} />
      <footer className="wrap foot mono">
        <span>Chinmay Kudalkar, 2026</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
