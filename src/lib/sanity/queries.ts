import { client } from "./client";
import { isSanityConfigured } from "@/sanity/env";
import type { Image } from "sanity";
import type { PortableTextBlock } from "@portabletext/types";

type LocaleString = { en?: string; ptBR?: string };
type LocaleBlockContent = { en?: PortableTextBlock[]; ptBR?: PortableTextBlock[] };

export type Project = {
  _id: string;
  title: LocaleString;
  slug: string;
  summary: LocaleString;
  description: LocaleBlockContent;
  coverImage?: Image & { alt?: LocaleString };
  gallery?: Image[];
  repoUrl?: string;
  liveUrl?: string;
  techTags?: string[];
  role?: LocaleString;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
};

export type Skill = {
  _id: string;
  name: string;
  category: "languages" | "ml-ai" | "data" | "tools" | "other";
  level?: string;
  icon?: Image;
};

export type Certification = {
  _id: string;
  name: LocaleString;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
  badgeImage?: Image;
};

export type SiteSettings = {
  name?: string;
  tagline?: LocaleString;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  defaultOgImage?: Image;
};

const projectFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  description,
  coverImage,
  gallery,
  repoUrl,
  liveUrl,
  techTags,
  role,
  startDate,
  endDate,
  featured
`;

export async function getProjects(): Promise<Project[]> {
  if (!isSanityConfigured || !client) return [];
  return client.fetch(
    /* groq */ `*[_type == "project"] | order(order asc, startDate desc) { ${projectFields} }`,
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSanityConfigured || !client) return null;
  return client.fetch(
    /* groq */ `*[_type == "project" && slug.current == $slug][0] { ${projectFields} }`,
    { slug },
  );
}

export async function getProjectSlugs(): Promise<string[]> {
  if (!isSanityConfigured || !client) return [];
  return client.fetch<string[]>(
    /* groq */ `*[_type == "project" && defined(slug.current)].slug.current`,
  );
}

export async function getSkills(): Promise<Skill[]> {
  if (!isSanityConfigured || !client) return [];
  return client.fetch(
    /* groq */ `*[_type == "skill"] | order(order asc, name asc)`,
  );
}

export async function getCertifications(): Promise<Certification[]> {
  if (!isSanityConfigured || !client) return [];
  return client.fetch(
    /* groq */ `*[_type == "certification"] | order(order asc, issueDate desc)`,
  );
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured || !client) return null;
  return client.fetch(/* groq */ `*[_type == "siteSettings"][0]`);
}
