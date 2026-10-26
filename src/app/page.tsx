import { commitsAtBuild } from "@/lib/commits";
import Nav from "@/components/Nav";
import Board from "@/components/Board";

export default async function Home() {
  const days = await commitsAtBuild();

  return (
    <>
      <Nav />
      <Board initial={days} />
      <footer className="wrap foot mono">
        <span>Chinmay Kudalkar, 2026</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
