"use client";

import { TransitionProvider } from "./Transition";
import { Choreographer, SmoothScroll } from "./Motion";
import Header from "./Header";
import Cursor from "./Cursor";

/** Everything that frames every page: navigation, transitions, scroll, motion and the cursor. */
export default function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <SmoothScroll />
      <Header />
      {children}
      <Choreographer />
      <Cursor />
    </TransitionProvider>
  );
}
