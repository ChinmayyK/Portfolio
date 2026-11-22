// Shared between the page-transition curtain and the choreographer: while the curtain is lifting,
// entrances wait for it so they play in view rather than behind it.
let lifting = false;
export const transitionState = {
  set: (v: boolean) => { lifting = v; },
  /** seconds an entrance on a freshly arrived page should wait */
  get enterDelay() { return lifting ? 0.45 : 0; },
};
