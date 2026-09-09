"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  en: "EN",
  "pt-BR": "PT",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 font-mono text-xs tracking-wide text-fg-muted">
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden>/</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={loc === locale}
            className={
              loc === locale
                ? "text-fg"
                : "transition-colors hover:text-fg"
            }
          >
            {labels[loc]}
          </button>
        </span>
      ))}
    </div>
  );
}
