import { getLocale, getTranslations } from "next-intl/server";
import { getProjects } from "@/lib/sanity/queries";
import { ProjectRow } from "@/components/project/ProjectRow";
import { ProjectReveal } from "@/components/project/ProjectReveal";
import type { Locale } from "@/i18n/routing";

export async function Projects() {
  const [t, locale, projects] = await Promise.all([
    getTranslations("projects"),
    getLocale(),
    getProjects(),
  ]);

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
      <style>{`
        /* Each card carries its own white light so it reads as lit against
           the grid behind it. Dim at rest; hovering "switches it on" — a
           quick flicker, then a steady, stronger glow. */
        .project-row {
          border: 1px solid color-mix(in srgb, var(--color-fg-inverse) 25%, transparent);
          box-shadow: 0 0 70px color-mix(in srgb, var(--color-fg-inverse) 22%, transparent);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .project-row:hover {
          animation: project-row-flicker 0.5s steps(1, end) forwards;
        }
        @keyframes project-row-flicker {
          0% {
            border-color: color-mix(in srgb, var(--color-fg-inverse) 60%, transparent);
            box-shadow: 0 0 90px color-mix(in srgb, var(--color-fg-inverse) 45%, transparent);
          }
          15% {
            border-color: color-mix(in srgb, var(--color-fg-inverse) 20%, transparent);
            box-shadow: 0 0 30px color-mix(in srgb, var(--color-fg-inverse) 12%, transparent);
          }
          30% {
            border-color: color-mix(in srgb, var(--color-fg-inverse) 70%, transparent);
            box-shadow: 0 0 100px color-mix(in srgb, var(--color-fg-inverse) 55%, transparent);
          }
          45% {
            border-color: color-mix(in srgb, var(--color-fg-inverse) 25%, transparent);
            box-shadow: 0 0 35px color-mix(in srgb, var(--color-fg-inverse) 15%, transparent);
          }
          65% {
            border-color: color-mix(in srgb, var(--color-fg-inverse) 75%, transparent);
            box-shadow: 0 0 120px color-mix(in srgb, var(--color-fg-inverse) 60%, transparent);
          }
          100% {
            border-color: color-mix(in srgb, var(--color-fg-inverse) 75%, transparent);
            box-shadow: 0 0 120px color-mix(in srgb, var(--color-fg-inverse) 60%, transparent);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .project-row:hover {
            animation: none;
            border-color: color-mix(in srgb, var(--color-fg-inverse) 75%, transparent);
            box-shadow: 0 0 120px color-mix(in srgb, var(--color-fg-inverse) 60%, transparent);
          }
        }
      `}</style>
      <div className="mx-auto max-w-5xl px-6 pt-20 sm:pt-28">
        <p className="mb-3 font-mono text-xs tracking-widest text-surface-1 uppercase">[ 03 ]</p>
        <h2 className="mb-10 font-display text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          {t("heading")}
        </h2>
        {projects.length === 0 && (
          <p className="pb-20 text-sm text-fg-inverse/60 sm:pb-28">{t("empty")}</p>
        )}
      </div>
      {/* Breaks out of the max-w-5xl column on purpose — each project is
          meant to read as its own wide panel rather than sit inside the
          site's usual reading column, just sized to 80-90% of the viewport
          (via each row's own w-[90%] sm:w-[85%] mx-auto) instead of true
          edge-to-edge. */}
      {projects.length > 0 && (
        // The horizontal clip lives on the <section> as overflow-x:clip, not
        // here: this container needs to contain ProjectReveal's transform
        // (each row starts up to 160px off-screen before scrolling into
        // view) and each card's accent backglow (bleeds ~90px past its own
        // row) without ever affecting vertical scroll. `clip` (rather than
        // `hidden`) matters specifically: an element with only overflow-x
        // set to `hidden` has its overflow-y computed as `auto`, turning the
        // whole section into its own nested scroll container — which
        // intermittently showed a real scrollbar for that section alone on
        // first paint. `clip` never creates a scroll container on either
        // axis, so that bug class isn't just contained, it's structurally
        // impossible here.
        <div className="flex flex-col gap-20 pb-20 sm:gap-28 sm:pb-28">
          {projects.map((project, i) => (
            <ProjectReveal key={project._id} fromCorner={i % 2 === 0 ? "top-left" : "bottom-right"}>
              <ProjectRow project={project} locale={locale as Locale} reverse={i % 2 === 1} />
            </ProjectReveal>
          ))}
        </div>
      )}
    </section>
  );
}
