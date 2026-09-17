"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";

type NavItem = { key: string; id: string; label: string };

/**
 * Renders the nav links plus a sliding underline that marks the active
 * section. The underline follows scroll position (via IntersectionObserver
 * watching each section) and snaps to whatever link is hovered, taking
 * priority over the scroll-driven one while the cursor is there.
 *
 * Below `md` the link row itself is hidden (no room for it) and this
 * renders a hamburger toggle + dropdown panel instead, reusing the same
 * `items`/`activeId` so both forms of nav always agree on what's current.
 */
export function NavLinks({
  items,
  openLabel,
  closeLabel,
}: {
  items: NavItem[];
  openLabel: string;
  closeLabel: string;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const targetId = hoveredId ?? activeId;

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // A section counts as "active" once it's crossed a line near the top of
    // the viewport and hasn't yet been mostly scrolled past — of everything
    // matching that, the one whose top edge is furthest down (closest to,
    // but still above, the scrollspy line) wins, i.e. the most recently
    // entered section rather than one already scrolled mostly past. If
    // nothing currently matches (e.g. mid-scroll through a gap between
    // sections), the last known active id is left as-is instead of being
    // cleared.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top > b.boundingClientRect.top ? a : b,
        );
        setActiveId(topMost.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    function recompute() {
      if (!targetId || !containerRef.current) {
        setIndicator(null);
        return;
      }
      const link = linkRefs.current[targetId];
      if (!link) {
        setIndicator(null);
        return;
      }
      const containerRect = containerRef.current.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      setIndicator({ left: linkRect.left - containerRect.left, width: linkRect.width });
    }

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [targetId]);

  // Above md the hamburger/panel are never rendered (md:hidden), but a
  // resize from mobile to desktop while the panel is open would otherwise
  // leave mobileOpen stuck true for when the viewport narrows again.
  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    const mql = window.matchMedia("(min-width: 768px)");
    function handleMql() {
      if (mql.matches) setMobileOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    mql.addEventListener("change", handleMql);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      mql.removeEventListener("change", handleMql);
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        ref={containerRef}
        className="relative hidden items-center gap-6 font-mono text-xs tracking-wide text-fg-muted uppercase md:flex"
        onMouseLeave={() => setHoveredId(null)}
      >
        {items.map((item) => (
          <a
            key={item.key}
            ref={(el) => {
              linkRefs.current[item.id] = el;
            }}
            href={`#${item.id}`}
            onMouseEnter={() => setHoveredId(item.id)}
            className={`pb-1 transition-colors hover:text-fg ${
              activeId === item.id ? "text-fg" : ""
            }`}
          >
            {item.label}
          </a>
        ))}
        {indicator && (
          // A 1px bar stretched with scaleX rather than animating left/width,
          // which would run layout on every frame of the spring.
          <motion.div
            className="absolute -bottom-1 left-0 h-[2px] w-px origin-left bg-fg"
            initial={false}
            animate={{ x: indicator.left, scaleX: indicator.width, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
          />
        )}
      </nav>

      {/* order-last: the header row is `justify-between` with the logo and
          the locale/LinkedIn group both source-ordered before this, so
          without it the button would land between them instead of at the
          row's trailing edge. */}
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? closeLabel : openLabel}
        className="order-last text-lg text-fg-muted transition-colors hover:text-fg md:hidden"
      >
        {mobileOpen ? <FaXmark /> : <FaBars />}
      </button>

      {mobileOpen && (
        // Positioned against the header itself (see `relative` there), so
        // it sits flush under the row regardless of the row's actual
        // height, and stays inside the header's own sticky/backdrop layer.
        <div className="absolute inset-x-0 top-full border-b border-border/60 bg-bg/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-5xl flex-col px-6 py-2 font-mono text-sm tracking-wide text-fg-muted uppercase">
            {items.map((item) => (
              <a
                key={item.key}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-border/40 py-3 transition-colors last:border-none hover:text-fg ${
                  activeId === item.id ? "text-fg" : ""
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
