"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Where the line's growing tip sits in the viewport. High enough that a card
 * riding along with it stays on screen below it.
 */
const TIP_VIEWPORT_POSITION = "35%";
/** Line growth (px) over which a card rises into place once the line reaches it. */
const CARD_REVEAL_DISTANCE = 160;
/** How far below its resting place a card starts (px). */
const CARD_RISE = 56;
/** Matches the node's and connector's `top-6` offset inside an item. */
const NODE_OFFSET = 24;
const NODE_REVEAL_DISTANCE = 32;
/** Line growth (px) over which an event's glow fades in and back out. */
const GLOW_FADE = 90;

const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));
const clamp01 = (value: number) => clamp(0, 1, value);

type Item = {
  li: HTMLElement;
  bar: HTMLElement | null;
  node: HTMLElement | null;
  card: HTMLElement | null;
  connector: HTMLElement | null;
  glow: HTMLElement | null;
  ongoing: boolean;
  top: number;
  height: number;
  /** How far the card may travel down following the tip. */
  travel: number;
};

/**
 * Scroll-scrubbed "unfolding" of the timeline `<ol>` it renders. On arrival
 * the axis is just a dot; scrolling grows the line downward behind that dot
 * (and back up when scrolling back). Wherever the tip passes:
 * - nodes pop in and cards rise from below;
 * - while an event is happening, its card (tied to the axis by its connector
 *   tick) rides along with the tip; once the tip passes the event's end, the
 *   card stays behind there, hanging below that point — room for which is made
 *   by pushing later events on the same side down (and below the list);
 * - ongoing events' bars stretch exactly with the tip, finished ones draw in;
 * - cards glow while the tip is inside their period, ongoing ones for good.
 *
 * Children mark their parts with `data-timeline-*` attributes (see
 * `Education.tsx`). Without JS, or with reduced motion, everything stays in its
 * final, static state — the hidden starting state is only ever applied from
 * here. Following the tip needs the two-column grid, so it's `md`-up only.
 */
export function TimelineScroll({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 768px)" },
      (context) => {
        const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;

        const cardEase = gsap.parseEase("power3.out");
        const items: Item[] = [...list.querySelectorAll<HTMLElement>("[data-timeline-item]")].map((li) => ({
          li,
          bar: li.querySelector<HTMLElement>("[data-timeline-bar]"),
          node: li.querySelector<HTMLElement>("[data-timeline-node]"),
          card: li.querySelector<HTMLElement>("[data-timeline-card]"),
          connector: li.querySelector<HTMLElement>("[data-timeline-connector]"),
          glow: li.querySelector<HTMLElement>("[data-timeline-glow]"),
          ongoing: li.dataset.ongoing === "true",
          top: 0,
          height: 0,
          travel: 0,
        }));

        let listHeight = 0;
        // offsetTop/offsetHeight ignore transforms, so moving cards never
        // skew these measurements.
        const measure = () => {
          listHeight = list.offsetHeight;
          for (const item of items) {
            item.top = item.li.offsetTop;
            item.height = Math.max(1, item.li.offsetHeight);
            // Ride the tip through the whole period: at the end the connector
            // sits on the event's end, NODE_OFFSET below the card's top.
            item.travel = wide ? Math.max(0, item.height - NODE_OFFSET - 1) : 0;
          }
        };

        // A card left behind at its event's end hangs below that end by its
        // own height. Make room for it: push the next event on the same side
        // down (a top margin grows its grid row) and reserve space below the
        // list for whatever hangs past the bottom. Changes layout, so it only
        // runs before ScrollTrigger measures, never from onRefresh.
        const LANE_GAP = 32;
        const makeRoom = () => {
          for (const item of items) item.li.style.removeProperty("margin-top");
          let overhang = 0;
          if (wide) {
            for (const side of ["left", "right"]) {
              let hangBottom = -Infinity;
              for (const item of items.filter((i) => i.li.dataset.side === side)) {
                const top = item.li.offsetTop;
                if (top < hangBottom + LANE_GAP) {
                  item.li.style.marginTop = `${hangBottom + LANE_GAP - top}px`;
                }
                const bottom = item.li.offsetTop + item.li.offsetHeight;
                const hang = (item.card?.offsetHeight ?? 0) - NODE_OFFSET - 1;
                hangBottom = bottom + Math.max(0, hang);
              }
              overhang = Math.max(overhang, hangBottom - list.offsetHeight);
            }
          }
          list.style.setProperty("--timeline-overhang", `${Math.max(0, overhang)}px`);
        };

        const render = (progress: number) => {
          const tip = progress * listHeight;
          list.style.setProperty("--timeline-progress", String(progress));
          list.style.setProperty("--timeline-tip", `${tip}px`);

          for (const item of items) {
            const reached = tip - item.top;
            const along = clamp01(reached / item.height);
            const revealDistance = Math.min(CARD_REVEAL_DISTANCE, item.height * 0.8);
            const following = reached - NODE_OFFSET;

            if (item.bar) {
              const drawn = item.ongoing ? along : clamp01(reached / revealDistance);
              item.bar.style.scale = `1 ${drawn}`;
            }
            if (item.glow) {
              // Lit while the line is inside this event's period. An ongoing
              // event never darkens again — it's still happening.
              const fade = Math.min(GLOW_FADE, item.height / 2);
              const lighting = clamp01(reached / fade);
              const fading = item.ongoing ? 1 : clamp01((item.height - reached) / fade);
              item.glow.style.opacity = String(Math.min(lighting, fading));
            }
            if (item.node) {
              item.node.style.scale = String(clamp01(following / NODE_REVEAL_DISTANCE));
            }

            const shown = cardEase(clamp01(reached / revealDistance));
            if (item.card) {
              const ride = clamp(0, item.travel, following);
              item.card.style.opacity = String(shown);
              item.card.style.translate = `0 ${ride + (1 - shown) * CARD_RISE}px`;
            }
            if (item.connector) {
              // Tracks the tip through the whole period — past a stopped
              // card's top if need be, while still meeting its side — and is
              // left at the event's end afterwards.
              const reach = wide ? clamp(0, item.height - NODE_OFFSET - 1, following) : 0;
              item.connector.style.opacity = String(shown);
              item.connector.style.translate = `0 ${reach}px`;
            }
          }
        };

        // Before ScrollTrigger works out positions, since the reserved space
        // below the list is part of the page layout.
        const onRefreshInit = () => makeRoom();
        makeRoom();
        measure();
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

        const trigger = ScrollTrigger.create({
          trigger: list,
          start: `top ${TIP_VIEWPORT_POSITION}`,
          end: `bottom ${TIP_VIEWPORT_POSITION}`,
          onRefresh: (self) => {
            measure();
            render(self.progress);
          },
          onUpdate: (self) => render(self.progress),
        });
        render(trigger.progress);

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
          for (const property of ["--timeline-progress", "--timeline-tip", "--timeline-overhang"]) {
            list.style.removeProperty(property);
          }
          for (const { li, bar, node, card, connector, glow } of items) {
            li.style.removeProperty("margin-top");
            bar?.style.removeProperty("scale");
            node?.style.removeProperty("scale");
            glow?.style.removeProperty("opacity");
            card?.style.removeProperty("opacity");
            card?.style.removeProperty("translate");
            connector?.style.removeProperty("opacity");
            connector?.style.removeProperty("translate");
          }
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <ol ref={listRef} className={className} style={style}>
      {children}
    </ol>
  );
}
