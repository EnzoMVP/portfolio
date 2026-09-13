import Image from "next/image";
import type { CSSProperties } from "react";
import { HiArrowUpRight } from "react-icons/hi2";
import { getTranslations } from "next-intl/server";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/locale";
import { getTechIcon } from "@/lib/project-tech-icons";
import { ProjectTechBadge } from "./ProjectTechBadge";
import type { Project } from "@/lib/sanity/queries";
import type { Locale } from "@/i18n/routing";

export async function ProjectRow({
  project,
  locale,
  reverse = false,
}: {
  project: Project;
  locale: Locale;
  reverse?: boolean;
}) {
  const t = await getTranslations("projects");
  const title = pickLocale(project.title, locale);
  const summary = pickLocale(project.summary, locale);
  // Prefer the repo link, but a project with only a live demo (no repoUrl)
  // should still get a link instead of showing none at all.
  const linkUrl = project.repoUrl ?? project.liveUrl;
  const linkLabel = project.repoUrl ? t("viewRepo") : t("viewLive");
  // The section's one deliberate spot of color: each row is tinted with the
  // brand color of its own first tech tag, rather than a color invented for
  // decoration — so "more color" still stays anchored to real project facts.
  const accent = getTechIcon(project.techTags?.[0] ?? "").color;

  return (
    <div className="relative mx-auto w-[90%] sm:w-[85%]" style={{ "--accent": accent } as CSSProperties}>
      {/* Casts the card's own accent color out onto the grid behind it,
          so the grid reads as lit up around each project rather than
          just sitting there as a flat backdrop. */}
      <div
        className="project-row-backglow pointer-events-none absolute -inset-x-10 -inset-y-16 -z-10 opacity-40 blur-[90px] sm:-inset-x-16 sm:-inset-y-24"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />
      <article
        className={`project-row relative flex flex-col overflow-hidden rounded-2xl border border-fg-inverse/10 bg-bg-inverse text-fg-inverse md:min-h-[50vh] ${reverse ? "md:flex-row-reverse" : "md:flex-row"}`}
      >
      <div className="relative flex items-center justify-center overflow-hidden p-6 sm:p-10 md:w-[55%]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 35% 40%, var(--accent) 0%, transparent 65%)",
          }}
        />
        {project.coverImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-fg-inverse/10 shadow-2xl">
            <Image
              src={urlFor(project.coverImage).width(1000).height(563).url()}
              alt={pickLocale(project.coverImage.alt, locale) || title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full rounded-xl border border-dashed border-fg-inverse/15" />
        )}
      </div>

      <div className="relative flex flex-col justify-center gap-5 p-6 sm:p-10 md:w-[45%]">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="min-w-0 flex-1 font-display text-xl font-bold tracking-tight uppercase sm:text-2xl">
            {title}
          </h3>
          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 border-b border-fg-inverse pb-0.5 text-xs font-semibold tracking-wide uppercase"
            >
              {linkLabel}
              <HiArrowUpRight />
            </a>
          )}
        </div>
        <p className="text-base text-fg-inverse/70">{summary}</p>
        {project.techTags && project.techTags.length > 0 && (
          <ul className="flex flex-wrap gap-2.5">
            {project.techTags.map((tag) => (
              <li key={tag}>
                <ProjectTechBadge tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </div>
      </article>
    </div>
  );
}
