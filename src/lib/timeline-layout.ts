import type { TimelineEvent, TimelineTopic, YearMonth } from "./timeline-data";

export type TimelineSide = "left" | "right";

/**
 * Which side of the axis each topic lives on. The degree is the long-running
 * main track, alone on its side; everything else stacks on the other side.
 * Adding a topic to `TimelineEvent` forces picking a side here.
 */
const SIDE_BY_TOPIC: Record<TimelineTopic, TimelineSide> = {
  graduation: "left",
  course: "right",
};

export type PlacedTimelineEvent = {
  event: TimelineEvent;
  side: TimelineSide;
  /** CSS `grid-row` value. */
  gridRow: string;
};

export type TimelineLayout = {
  /** Oldest first — also the reading order on narrow screens. */
  items: PlacedTimelineEvent[];
  /**
   * Months of time each grid row covers, top to bottom, so the renderer can
   * give rows a minimum height proportional to elapsed time. Rows added only
   * to stack overlapping events cover 0 months.
   */
  rowMonths: number[];
};

const toMonthIndex = (ym: YearMonth) => {
  const [year, month] = ym.split("-").map(Number);
  return year * 12 + (month - 1);
};

type Span = { from: number; to: number };

/**
 * Lays the timeline out on a CSS grid, oldest at the top and the present at
 * the bottom.
 *
 * Grid lines sit at every distinct start/end month, so an event starts at the
 * height of its start date and spans down to its end — the degree opens the
 * line, and a course taken months later shows up further down beside it.
 * Rows are sized by the renderer from `rowMonths`, keeping gaps in time
 * visible.
 *
 * Events on the same side that overlap each other can't share rows in one
 * column, so a later one starts where the previous one ends. The last ongoing
 * event of a column runs to the bottom line (the present).
 */
export function layoutTimeline(events: TimelineEvent[], now = new Date()): TimelineLayout {
  // UTC, matching how the date labels are formatted.
  const nowIndex = now.getUTCFullYear() * 12 + now.getUTCMonth();

  // Half-open [from, to) in months. An ongoing event runs through this month
  // and always at least one month past every finished event, so something
  // that ended recently (even this month) still visibly ends before the
  // present instead of sharing the line's end with what's still going on.
  const lastFinishedEnd = Math.max(
    -Infinity,
    ...events.filter((event) => event.end).map((event) => toMonthIndex(event.end!) + 1),
  );
  const spans = new Map<TimelineEvent, Span>();
  for (const event of events) {
    const from = toMonthIndex(event.start);
    const to = event.end ? toMonthIndex(event.end) + 1 : Math.max(nowIndex + 1, lastFinishedEnd + 1);
    spans.set(event, { from, to: Math.max(to, from + 1) });
  }
  const spanOf = (event: TimelineEvent) => spans.get(event)!;
  const sideOf = (event: TimelineEvent) => SIDE_BY_TOPIC[event.topic];

  // Earliest start first, then earliest end.
  const ordered = [...events].sort((a, b) => {
    const sa = spanOf(a);
    const sb = spanOf(b);
    return sa.from - sb.from || sa.to - sb.to;
  });

  const boundaries = [...new Set([...spans.values()].flatMap((s) => [s.from, s.to]))].sort((a, b) => a - b);
  const lineOf = (month: number) => boundaries.indexOf(month) + 1;

  // Row index (0-based) → months covered; extra stacking rows cover 0.
  const rowMonths = boundaries.slice(1).map((boundary, i) => boundary - boundaries[i]);

  // Each side is one column. Ongoing events are placed after every finished
  // one in their column, and only the column's final event may stretch to the
  // bottom line — otherwise an event pushed below an ongoing one would end up
  // underneath it once it stretched.
  const lines = new Map<TimelineEvent, { start: number; end: number }>();
  const stretchesToBottom = new Set<TimelineEvent>();
  for (const side of ["left", "right"] as const) {
    const column = ordered.filter((event) => sideOf(event) === side);
    const sequence = [
      ...column.filter((event) => event.end !== null),
      ...column.filter((event) => event.end === null),
    ];
    let columnEnd = 1;
    for (const event of sequence) {
      const span = spanOf(event);
      let start = lineOf(span.from);
      let end = lineOf(span.to);
      if (start < columnEnd) {
        const shift = columnEnd - start;
        start += shift;
        end += shift;
      }
      columnEnd = end;
      lines.set(event, { start, end });
    }
    const last = sequence.at(-1);
    if (last && last.end === null) stretchesToBottom.add(last);
  }

  const lastLine = Math.max(boundaries.length, ...[...lines.values()].map((l) => l.end));
  while (rowMonths.length < lastLine - 1) rowMonths.push(0);

  const items = ordered
    .map((event) => {
      const { start, end } = lines.get(event)!;
      const bottom = stretchesToBottom.has(event) ? lastLine : end;
      return { event, side: sideOf(event), start, gridRow: `${start} / ${bottom}` };
    })
    // DOM order doubles as the single-column reading order.
    .sort((a, b) => a.start - b.start || (a.side === b.side ? 0 : a.side === "left" ? -1 : 1))
    .map(({ event, side, gridRow }): PlacedTimelineEvent => ({ event, side, gridRow }));

  return { items, rowMonths: rowMonths.length > 0 ? rowMonths : [0] };
}
