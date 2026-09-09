import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

export const client: SanityClient | null = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;
