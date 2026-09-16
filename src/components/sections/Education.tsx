import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { TimelineCard } from "@/components/timeline/TimelineCard";
import { TimelineScroll } from "@/components/timeline/TimelineScroll";
import type { Locale } from "@/i18n/routing";
import { TIMELINE_EVENTS, type Importance, type YearMonth } from "@/lib/timeline-data";
import { layoutTimeline } from "@/lib/timeline-layout";

// z-index by importance: events ending on the same date share a node
// position, and the more important one should win.
const NODE_BY_IMPORTANCE: Record<Importance, string> = {
  3: "z-30 size-4 bg-fg",
  2: "z-20 size-3 bg-fg",
  1: "z-10 size-2.5 border border-fg-muted bg-bg",
};

// Minimum vertical space per month of elapsed time, so events keep their
// distance on the axis (e.g. a course starting four months into the degree
// shows up visibly further down). Rows still grow to fit their cards; long
// empty stretches are capped so a gap of years doesn't become a void.
const PX_PER_MONTH = 48;
const MAX_ROW_MIN_HEIGHT = 360;

const BAR_BY_IMPORTANCE: Record<Importance, string> = {
  3: "w-[3px] bg-fg",
  2: "w-[2px] bg-fg/70",
  1: "w-px bg-fg-muted/60",
};

/**
 * One vertical timeline (oldest at the top, present at the bottom) mixing every topic — degrees,
 * courses, … Entries live in `src/lib/timeline-data.ts`; placement comes from
 * `layoutTimeline()`.
 *
 * From `md` up it's a grid: [degree] [axis] [courses, …], with rows at every
 * start/end date sized by elapsed time — the degree opens the line and a
 * course starts at the height of its own start date beside it;
 * each event draws a bar along the axis for its rows, and its card rides along
 * with the unfolding line while it's happening. Below `md` it collapses to a single
 * column in the same oldest-first order.
 *
 * The whole thing unfolds with scroll — see `TimelineScroll`.
 */
export async function Education() {
  const [t, locale] = await Promise.all([getTranslations("education"), getLocale()]);
  const { items, rowMonths } = layoutTimeline(TIMELINE_EVENTS);
  const gridTemplateRows = rowMonths
    .map((months) => `minmax(${Math.min(months * PX_PER_MONTH, MAX_ROW_MIN_HEIGHT)}px, auto)`)
    .join(" ");

  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const formatYearMonth = (ym: YearMonth) => {
    const [year, month] = ym.split("-").map(Number);
    const monthLabel = monthFormatter.format(new Date(Date.UTC(year, month - 1, 1))).replace(".", "");
    return `${monthLabel} ${year}`;
  };

  return (
    <SectionContainer id="education" label="[ 04 ]" heading={t("heading")}>
      {/* before: the axis line, grown by TimelineScroll via
          --timeline-progress (0–1). after: the dot at its growing tip
          (--timeline-tip, px) — alone at the top on arrival, resting on the
          present at the bottom when static. */}
      <TimelineScroll
        className="relative flex flex-col gap-8 pl-10 before:absolute before:inset-y-0 before:left-3 before:w-px before:origin-top before:bg-border before:[scale:1_var(--timeline-progress,1)] after:absolute after:top-[var(--timeline-tip,100%)] after:left-3 after:z-[35] after:size-3 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-fg after:ring-4 after:ring-fg/15 md:mb-[var(--timeline-overhang,0px)] md:grid md:gap-x-0 md:gap-y-8 md:pl-0 md:before:left-1/2 md:before:-translate-x-1/2 md:after:left-1/2"
        style={{
          gridTemplateColumns: "minmax(0, 1fr) 4rem minmax(0, 1fr)",
          gridTemplateRows,
        }}
      >
        {items.map(({ event, side, gridRow }) => {
          const period = `${formatYearMonth(event.start)} — ${
            event.end ? formatYearMonth(event.end) : t("present")
          }`.toUpperCase();

          return (
            <li
              key={event.id}
              data-timeline-item
              data-ongoing={event.end === null}
              data-side={side}
              className="relative md:[grid-column:var(--col)] md:[grid-row:var(--row)]"
              style={{ "--row": gridRow, "--col": side === "left" ? 1 : 3 } as CSSProperties}
            >
              {/* Zero-width anchor sitting on the axis line. */}
              <div
                aria-hidden="true"
                className={`absolute inset-y-0 -left-7 w-0 ${
                  side === "left" ? "md:right-[-2rem] md:left-auto" : "md:-left-8"
                }`}
              >
                <span
                  data-timeline-bar
                  className={`absolute inset-y-0 left-px origin-top ${BAR_BY_IMPORTANCE[event.importance]} ${
                    side === "left" ? "md:right-px md:left-auto" : ""
                  }`}
                />
                <span
                  data-timeline-node
                  className={`absolute top-6 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-bg ${
                    NODE_BY_IMPORTANCE[event.importance]
                  }`}
                />
              </div>
              {/* Tick connecting the card to the axis, 24px down to meet the
                  node. TimelineScroll moves it (and the card) along with the
                  line's tip while the event is happening. */}
              <div
                aria-hidden="true"
                className={`absolute inset-y-0 -left-7 w-7 md:w-8 ${
                  side === "left" ? "md:-right-8 md:left-auto" : "md:-left-8"
                }`}
              >
                <span
                  data-timeline-connector
                  className={`absolute inset-x-0 top-6 h-px ${event.importance === 1 ? "bg-border" : "bg-fg"}`}
                />
              </div>
              <div data-timeline-card className="relative z-10">
                <TimelineCard
                  event={event}
                  locale={locale as Locale}
                  topicLabel={t(`topics.${event.topic}`)}
                  period={period}
                  formatYearMonth={(ym) => formatYearMonth(ym).toUpperCase()}
                  t={t}
                />
              </div>
            </li>
          );
        })}
      </TimelineScroll>
    </SectionContainer>
  );
}
