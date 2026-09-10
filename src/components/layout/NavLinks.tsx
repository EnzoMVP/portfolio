"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type NavItem = { key: string; id: string; label: string };

/**
 * Renders the nav links plus a sliding underline that marks the active
 * section. The underline follows scroll position (via IntersectionObserver
 * watching each section) and snaps to whatever link is hovered, taking
 * priority over the scroll-driven one while the cursor is there.
 */
export function NavLinks({ items }: { items: NavItem[] }) {
  const containerRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

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
    // nothing currently matches (e.g. mid-scroll through an unlisted section
    // like certifications, which shares the studies nav item), the last
    // known active id is left as-is instead of being cleared.
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

  return (
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
        <motion.div
          className="absolute -bottom-1 h-[2px] bg-fg"
          initial={false}
          animate={{ left: indicator.left, width: indicator.width, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
        />
      )}
    </nav>
  );
}
