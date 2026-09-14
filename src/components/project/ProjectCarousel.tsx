"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { HiArrowUpRight } from "react-icons/hi2";
import { CardsRotateSlider } from "@/components/ui/CardsRotateSlider";
import { ProjectTechBadge } from "./ProjectTechBadge";

export type CarouselProject = {
  id: string;
  title: string;
  summary: string;
  accent: string;
  techTags: string[];
  imageUrl?: string;
  imageAlt: string;
  linkUrl?: string;
  linkLabel: string;
};

/**
 * Project cards on a scroll-pinned horizontal track: each card rotates in,
 * settles flat when centered, then rotates out (see CardsRotateSlider).
 * Takes any number of projects — the pinned scroll distance grows with them.
 */
export function ProjectCarousel({ projects }: { projects: CarouselProject[] }) {
  return (
    <CardsRotateSlider
      items={projects}
      getKey={(project) => project.id}
      renderItem={(project, index) => <CardShell project={project} priority={index === 0} />}
      glowColor="var(--color-fg-inverse)"
      rotationAmount={0.8}
      perspective={2200}
    />
  );
}

function CardShell({ project, priority }: { project: CarouselProject; priority: boolean }) {
  return (
    <article
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-fg-inverse/10 bg-bg-inverse text-fg-inverse md:min-h-[50vh] md:flex-row"
      style={{ "--accent": project.accent } as CSSProperties}
    >
      <div className="relative flex items-center justify-center overflow-hidden p-6 sm:p-10 md:w-[55%]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle at 35% 40%, var(--accent) 0%, transparent 65%)" }}
        />
        {project.imageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-fg-inverse/10 shadow-2xl">
            <Image
              src={project.imageUrl}
              alt={project.imageAlt}
              fill
              sizes="(min-width: 768px) 50vw, 90vw"
              className="object-cover"
              draggable={false}
              priority={priority}
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full rounded-xl border border-dashed border-fg-inverse/15" />
        )}
      </div>

      <div className="relative flex flex-col justify-center gap-5 p-6 sm:p-10 md:w-[45%]">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="min-w-0 flex-1 font-display text-xl font-bold tracking-tight uppercase sm:text-2xl">
            {project.title}
          </h3>
          {project.linkUrl && (
            <a
              href={project.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 border-b border-fg-inverse pb-0.5 text-xs font-semibold tracking-wide uppercase"
            >
              {project.linkLabel}
              <HiArrowUpRight />
            </a>
          )}
        </div>
        <p className="text-base text-fg-inverse/70">{project.summary}</p>
        {project.techTags.length > 0 && (
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
  );
}
