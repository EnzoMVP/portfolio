import { pickLocale } from "@/lib/sanity/locale";
import type { CourseEvent } from "@/lib/timeline-data";
import type { TimelineCardProps } from "../TimelineCard";
import { TimelineCardShell, cardLabel, mutedText } from "../TimelineCardShell";

type LinkRow = { key: string; href?: string; label: string };

export function CourseCard({ event, locale, topicLabel, period, t }: TimelineCardProps<CourseEvent>) {
  const muted = mutedText(event.importance);
  const rows: LinkRow[] = [];
  if (event.repositoryUrl) rows.push({ key: "repository", href: event.repositoryUrl, label: t("repository") });
  if (event.certificateUrl) {
    rows.push({ key: "certificate", href: event.certificateUrl, label: t("certificate") });
  } else if (event.certificateNote) {
    // No certificate to link to — say why in its place instead of omitting it.
    rows.push({ key: "certificate", label: pickLocale(event.certificateNote, locale) });
  }

  return (
    <TimelineCardShell
      importance={event.importance}
      ongoing={event.end === null}
      topicLabel={topicLabel}
      period={period}
      title={pickLocale(event.title, locale)}
    >
      <p className={`text-sm ${muted}`}>{event.provider}</p>
      <p className="mt-3 text-sm leading-relaxed">{pickLocale(event.learned, locale)}</p>
      {rows.length > 0 && (
        <ul className="mt-4 flex flex-col items-start gap-2">
          {rows.map((row) => (
            <li key={row.key}>
              {row.href ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cardLabel} underline underline-offset-4 transition-opacity hover:opacity-60`}
                >
                  {row.label} ↗
                </a>
              ) : (
                <span className={`${cardLabel} ${muted}`}>{row.label}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </TimelineCardShell>
  );
}
