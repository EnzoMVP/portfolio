import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavLinks } from "./NavLinks";

const navItems = [
  { key: "hero", id: "hero" },
  { key: "about", id: "about" },
  { key: "skills", id: "skills" },
  { key: "studiesCertifications", id: "studies" },
  { key: "projects", id: "projects" },
  { key: "contact", id: "contact" },
] as const;

export async function Header() {
  const t = await getTranslations("nav");
  const items = navItems.map((item) => ({ ...item, label: t(item.key) }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-sm font-bold tracking-tight uppercase">
          Portfolio
        </Link>
        <NavLinks items={items} />
        <LocaleSwitcher />
      </div>
    </header>
  );
}
