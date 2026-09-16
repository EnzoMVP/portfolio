import type { ReactNode } from "react";
import type { Importance } from "@/lib/timeline-data";

const SHELL_BY_IMPORTANCE: Record<Importance, string> = {
  3: "bg-bg-inverse p-7 text-fg-inverse md:p-8",
  2: "border border-border-strong bg-bg p-6",
  1: "border border-border/60 bg-bg px-5 py-4",
};

const TITLE_BY_IMPORTANCE: Record<Importance, string> = {
  3: "font-display text-2xl font-bold tracking-tight uppercase md:text-3xl",
  2: "font-display text-lg font-bold tracking-tight uppercase",
  1: "font-display text-sm font-bold tracking-tight uppercase",
};

/** Secondary text inside a card — readable on the dark highlight card too. */
export const mutedText = (importance: Importance) =>
  importance === 3 ? "text-fg-inverse/60" : "text-fg-muted";

/** Small display-font label, same family as the title (topic, dates, links). */
export const cardLabel = "font-display text-xs font-bold tracking-widest uppercase";

// Same recipe as the Projects carousel (`CardsRotateSlider`): a crisp 1px lit
// edge, a tight bloom, then a wide soft halo. That section is dark so it lights
// cards in `--color-fg-inverse`; this one sits on the light background, so the
// light is `--color-fg` instead.
const GLOW_SHADOW = [
  "0 0 0 1px color-mix(in srgb, var(--color-fg) 70%, transparent)",
  "0 0 24px 2px color-mix(in srgb, var(--color-fg) 28%, transparent)",
  "0 0 90px 16px color-mix(in srgb, var(--color-fg) 12%, transparent)",
].join(", ");

/**
 * Frame shared by every topic card: importance-driven prominence, the topic
 * label + period header, and the glow layer `TimelineScroll` lights while the line is inside this event's
 * period. Ongoing events start lit and never go dark, so they still read as
 * "happening now" without JS. Topic cards (`./cards/`) fill in the body.
 */
export function TimelineCardShell({
  importance,
  ongoing,
  topicLabel,
  period,
  title,
  children,
}: {
  importance: Importance;
  ongoing: boolean;
  topicLabel: string;
  period: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className={`relative ${SHELL_BY_IMPORTANCE[importance]}`}>
      {/* Bleeding layer so the halo is contained by its own box, with the
          shadow drawn by a card-sized child — see CardsRotateSlider. */}
      <div
        data-timeline-glow
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-32 will-change-[opacity] ${
          ongoing ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-32 -m-px" style={{ boxShadow: GLOW_SHADOW }} />
      </div>
      <div
        className={`relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${cardLabel} ${mutedText(
          importance,
        )}`}
      >
        <span>[ {topicLabel} ]</span>
        <span>{period}</span>
      </div>
      <h3 className={`relative mt-3 ${TITLE_BY_IMPORTANCE[importance]}`}>{title}</h3>
      {children && <div className="relative mt-1">{children}</div>}
    </article>
  );
}
