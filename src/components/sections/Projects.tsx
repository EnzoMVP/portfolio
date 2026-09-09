import { getLocale, getTranslations } from "next-intl/server";
import { getProjects } from "@/lib/sanity/queries";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { Locale } from "@/i18n/routing";

export async function Projects() {
  const [t, locale, projects] = await Promise.all([
    getTranslations("projects"),
    getLocale(),
    getProjects(),
  ]);

  return (
    <SectionContainer id="projects" label="[ 05 ]" heading={t("heading")}>
      {projects.length === 0 ? (
        <p className="text-sm text-fg-muted">{t("empty")}</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {projects.map((project, i) => (
            <RevealOnScroll key={project._id} delay={i * 0.05}>
              <ProjectCard project={project} locale={locale as Locale} />
            </RevealOnScroll>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
