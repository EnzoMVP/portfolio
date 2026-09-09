import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 font-mono text-xs text-fg-muted">
        <span>© {year}</span>
        <span>{t("rights")}</span>
      </div>
    </footer>
  );
}
