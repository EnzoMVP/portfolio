import type { Locale } from "@/i18n/routing";

type LocaleField = { en?: string | null; ptBR?: string | null } | null | undefined;

export function pickLocale(field: LocaleField, locale: Locale): string {
  if (!field) return "";
  const value = locale === "pt-BR" ? field.ptBR : field.en;
  return value || field.en || "";
}
