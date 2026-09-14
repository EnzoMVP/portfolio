import { getLocale, getTranslations } from "next-intl/server";
import { getProjects } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/locale";
import { getTechIcon } from "@/lib/project-tech-icons";
import { ProjectCarousel, type CarouselProject } from "@/components/project/ProjectCarousel";
import type { Locale } from "@/i18n/routing";

export async function Projects() {
  const [t, locale, projects] = await Promise.all([
    getTranslations("projects"),
    getLocale(),
    getProjects(),
  ]);

  const carouselProjects: CarouselProject[] = projects.map((project) => {
    const title = pickLocale(project.title, locale as Locale);
    const linkUrl = project.repoUrl ?? project.liveUrl;
    return {
      id: project._id,
      title,
      summary: pickLocale(project.summary, locale as Locale),
      accent: getTechIcon(project.techTags?.[0] ?? "").color,
      techTags: project.techTags ?? [],
      imageUrl: project.coverImage
        ? urlFor(project.coverImage).width(1000).height(563).url()
        : undefined,
      imageAlt: pickLocale(project.coverImage?.alt, locale as Locale) || title,
      linkUrl,
      linkLabel: project.repoUrl ? t("viewRepo") : t("viewLive"),
    };
  });

  return (
    <section
      id="projects"
      className="[overflow-x:clip] bg-bg-inverse text-fg-inverse"
      style={{
        backgroundImage:
          "linear-gradient(color-mix(in srgb, var(--color-surface-1) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-surface-1) 35%, transparent) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 pt-20 sm:pt-28">
        <p className="mb-3 font-mono text-xs tracking-widest text-surface-1 uppercase">[ 03 ]</p>
        <h2 className="font-display text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          {t("heading")}
        </h2>
        {carouselProjects.length === 0 && (
          <p className="mt-10 pb-20 text-sm text-fg-inverse/60 sm:pb-28">{t("empty")}</p>
        )}
      </div>
      {carouselProjects.length > 0 && (
        // Full-bleed on purpose: the slider pins to the viewport and pans its
        // track across the whole width, so it can't live in the max-w column.
        <ProjectCarousel projects={carouselProjects} />
      )}
    </section>
  );
}
