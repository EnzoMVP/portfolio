export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/**
 * False until `sanity init` has been run and the env vars above are set.
 * Query helpers in lib/sanity/queries.ts check this so the site renders
 * empty-state sections instead of crashing before the CMS is connected.
 */
export const isSanityConfigured = Boolean(projectId);
