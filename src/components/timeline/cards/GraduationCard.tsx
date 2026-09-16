import { pickLocale } from "@/lib/sanity/locale";
import type { GraduationEvent } from "@/lib/timeline-data";
import type { TimelineCardProps } from "../TimelineCard";
import { TimelineCardShell, cardLabel, mutedText } from "../TimelineCardShell";

export function GraduationCard({
  event,
  locale,
  topicLabel,
  period,
  formatYearMonth,
  t,
}: TimelineCardProps<GraduationEvent>) {
  const muted = mutedText(event.importance);

  return (
    <TimelineCardShell
      importance={event.importance}
      ongoing={event.end === null}
      topicLabel={topicLabel}
      period={period}
      title={pickLocale(event.degree, locale)}
    >
      <p className={`text-sm ${muted}`}>{event.institution}</p>
      {/* Only meaningful while it's still running — a finished degree has a
          real end date in its period instead. */}
      {event.expectedEnd && event.end === null && (
        <p className={`mt-4 ${cardLabel} ${muted}`}>
          {t("expectedCompletion")} — {formatYearMonth(event.expectedEnd)}
        </p>
      )}
    </TimelineCardShell>
  );
}
