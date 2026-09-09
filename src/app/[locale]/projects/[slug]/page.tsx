import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProjectBySlug, getProjectSlugs } from "@/lib/sanity/queries";
import { pickLocale } from "@/lib/sanity/locale";
import { urlFor } from "@/lib/sanity/image";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return {};

  const title = pickLocale(project.title, locale as Locale);
  const description = pickLocale(project.summary, locale as Locale);
  const ogImage = project.coverImage
    ? [urlFor(project.coverImage).width(1200).height(630).fit("crop").url()]
    : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images: ogImage },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, project] = await Promise.all([
    getTranslations("projects"),
    getProjectBySlug(slug),
  ]);

  if (!project) notFound();

  const title = pickLocale(project.title, locale as Locale);
  const description = project.description?.[locale === "pt-BR" ? "ptBR" : "en"]
    ?? project.description?.en;

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/"
        className="mb-8 inline-block font-mono text-xs tracking-widest text-fg-muted uppercase"
      >
        ← {t("heading")}
      </Link>
      <h1 className="font-display text-3xl font-bold tracking-tight uppercase sm:text-5xl">
        {title}
      </h1>
      {project.techTags && project.techTags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.techTags.map((tag) => (
            <li key={tag} className="font-mono text-xs text-fg-muted uppercase">
              #{tag}
            </li>
          ))}
        </ul>
      )}
      {project.coverImage && (
        <div className="relative mt-8 aspect-video overflow-hidden bg-surface-1">
          <Image
            src={urlFor(project.coverImage).width(1200).height(675).url()}
            alt={pickLocale(project.coverImage.alt, locale as Locale) || title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className="prose prose-neutral mt-10 max-w-none">
        {description ? (
          <PortableText value={description} />
        ) : (
          <p className="text-fg-muted">
            {pickLocale(project.summary, locale as Locale)}
          </p>
        )}
      </div>
      <div className="mt-10 flex gap-6 font-mono text-xs tracking-widest uppercase">
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
      </div>
    </article>
  );
}
