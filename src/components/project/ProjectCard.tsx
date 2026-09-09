import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/locale";
import type { Project } from "@/lib/sanity/queries";
import type { Locale } from "@/i18n/routing";

export async function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const t = await getTranslations("projects");
  const title = pickLocale(project.title, locale);
  const summary = pickLocale(project.summary, locale);

  return (
    <article className="group border border-border/60">
      {project.coverImage && (
        <Link href={`/projects/${project.slug}`}>
          <div className="relative aspect-video overflow-hidden bg-surface-1">
            <Image
              src={urlFor(project.coverImage).width(800).height(450).url()}
              alt={pickLocale(project.coverImage.alt, locale) || title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
      )}
      <div className="p-5">
        <h3 className="font-display text-lg font-bold tracking-tight uppercase">
          <Link href={`/projects/${project.slug}`}>{title}</Link>
        </h3>
        <p className="mt-2 text-sm text-fg-muted">{summary}</p>
        {project.techTags && project.techTags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.techTags.map((tag) => (
              <li
                key={tag}
                className="font-mono text-xs tracking-wide text-fg-muted uppercase"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex gap-4 font-mono text-xs tracking-widest uppercase">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {t("viewRepo")}
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {t("viewLive")}
            </a>
          )}
          <Link href={`/projects/${project.slug}`} className="underline underline-offset-4">
            {t("readMore")}
          </Link>
        </div>
      </div>
    </article>
  );
}
