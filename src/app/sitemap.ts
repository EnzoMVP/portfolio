import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/sanity/queries";
import { routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function localePath(locale: string, path = "") {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteUrl}${prefix}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs();

  const roots = routing.locales.map((locale) => ({
    url: localePath(locale),
    lastModified: new Date(),
  }));

  const projectPages = routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({
      url: localePath(locale, `/projects/${slug}`),
      lastModified: new Date(),
    })),
  );

  return [...roots, ...projectPages];
}
