import type { Locale } from "@/i18n/routing";
import type { TimelineEvent, YearMonth } from "@/lib/timeline-data";
import { CourseCard } from "./cards/CourseCard";
import { GraduationCard } from "./cards/GraduationCard";

export type TimelineCardProps<E extends TimelineEvent = TimelineEvent> = {
  event: E;
  locale: Locale;
  topicLabel: string;
  /** Already formatted, e.g. "MAR 2026 — PRESENT". */
  period: string;
  /** Formats a single month the same way the period is formatted. */
  formatYearMonth: (ym: YearMonth) => string;
  /** Scoped to the `education` messages. */
  t: (key: string) => string;
};

/** Picks the card component for the event's topic. */
export function TimelineCard(props: TimelineCardProps) {
  const { event } = props;
  switch (event.topic) {
    case "graduation":
      return <GraduationCard {...props} event={event} />;
    case "course":
      return <CourseCard {...props} event={event} />;
  }
}
