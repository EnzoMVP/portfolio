"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "framer-motion";

/**
 * Two things depend on real scroll visibility, not just mount time:
 * - The orbit animation is expensive (blurred circles + the glass card's
 *   backdrop-filter recomputing every frame they move), so it shouldn't
 *   keep running while this is off-screen — a plain CSS animation has no
 *   notion of visibility and would otherwise burn CPU/GPU for as long as
 *   the tab stays open. `.in-view` toggles with the real viewport state
 *   and only unpauses the orbits while they're actually visible.
 * - The signature's one-time flicker, and the orbits' one-time fast
 *   intro burst, are meant to play once the user actually sees this
 *   section — not during initial mount while it's still hidden behind
 *   Hero. `.has-entered` latches true the first time this is seen and
 *   never resets, so that one-off intro isn't replayed on every re-entry.
 *
 * Built on framer-motion's useInView (already used by RevealOnScroll)
 * rather than a hand-rolled IntersectionObserver, since it's the same
 * underlying mechanism this project already depends on.
 */
export function AboutIntroTrigger({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px 0px" });
  const hasEntered = useInView(ref, { margin: "200px 0px", once: true });

  const classes = [
    "about-orbit-wrap relative overflow-hidden rounded-2xl bg-bg-inverse p-12 sm:p-16",
    inView && "in-view",
    hasEntered && "has-entered",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes}>
      <div className="about-orb-track">
        <div className="about-orb about-orb-tl" />
        <div className="about-orb about-orb-br" />
      </div>
      {children}
    </div>
  );
}
