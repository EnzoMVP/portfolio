import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

const navItems = [
  "about",
  "skills",
  "studies",
  "certifications",
  "projects",
  "contact",
] as const;

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-sm font-bold tracking-tight uppercase">
          Portfolio
        </Link>
        <nav className="hidden items-center gap-6 font-mono text-xs tracking-wide text-fg-muted uppercase md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item}`} className="transition-colors hover:text-fg">
              {t(item)}
            </a>
          ))}
        </nav>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
