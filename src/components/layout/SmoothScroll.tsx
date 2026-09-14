"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import "lenis/dist/lenis.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMotionEnabled() {
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerMotionEnabled() {
  return true;
}

// Intercepts in-page hash links (nav items, Hero's "View projects" button)
// so they animate through Lenis instead of jumping natively — otherwise
// anchor clicks would look jarringly instant next to the smooth wheel/touch
// scrolling everywhere else. A single document-level listener covers every
// hash link on the page rather than wiring this into each component.
function AnchorScrollHandler({ smooth }: { smooth: boolean }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    function onClick(event: MouseEvent) {
      // Leave modified/non-primary clicks (open in new tab, etc.) to the browser.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest?.("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!(target instanceof HTMLElement)) return;
      event.preventDefault();
      // preventDefault also skipped the native hash update — restore it so the
      // section stays shareable/reloadable and Back returns to it.
      if (window.location.hash !== href) history.pushState(null, "", href);
      lenis?.scrollTo(target, { offset: -72, immediate: !smooth });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis, smooth]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  // useSyncExternalStore rather than state-in-an-effect: matchMedia isn't
  // available during SSR, so the server snapshot assumes motion is allowed
  // (the common case, so Lenis isn't rebuilt right after hydration) and the
  // client re-reads the real value on mount.
  const enabled = useSyncExternalStore(
    subscribeToReducedMotion,
    getMotionEnabled,
    getServerMotionEnabled,
  );

  const options = useMemo(() => ({ lerp: 0.1, duration: 1.2, smoothWheel: enabled }), [enabled]);

  // ReactLenis is rendered unconditionally and reduced motion only flips an
  // option. Swapping between `<>{children}</>` and `<ReactLenis>` changes
  // the parent element type, which makes React throw away and rebuild the
  // entire page subtree — measured: ~640 of ~700 elements recreated right
  // after hydration, including the Hero <h1> (re-emitting LCP).
  return (
    <ReactLenis root options={options}>
      <AnchorScrollHandler smooth={enabled} />
      {children}
    </ReactLenis>
  );
}
