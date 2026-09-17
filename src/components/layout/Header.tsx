import { getTranslations } from "next-intl/server";
import { FaLinkedin } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { getSiteSettings } from "@/lib/sanity/queries";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavLinks } from "./NavLinks";

const navItems = [
  { key: "hero", id: "hero" },
  { key: "about", id: "about" },
  { key: "skills", id: "skills" },
  { key: "projects", id: "projects" },
  { key: "education", id: "education" },
  { key: "contact", id: "contact" },
] as const;

export async function Header() {
  const [t, tContact, settings] = await Promise.all([
    getTranslations("nav"),
    getTranslations("contact"),
    getSiteSettings(),
  ]);
  const items = navItems.map((item) => ({ ...item, label: t(item.key) }));
  const linkedinUrl = settings?.linkedinUrl || "https://www.linkedin.com/in/enzo-mvp/";

  return (
    // `sticky` (position: sticky) already establishes the containing block
    // the mobile menu panel positions against — no separate `relative` needed.
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-sm font-bold tracking-tight uppercase">
          Portfolio
        </Link>
        <NavLinks items={items} openLabel={t("openMenu")} closeLabel={t("closeMenu")} />
        {/* From xl up there's room outside the centered max-w-5xl row, so
            the LinkedIn icon breaks out to the header's own right edge
            (the sticky header is its containing block); below that it
            stays inline next to the locale switcher. */}
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tContact("linkedin")}
            className="text-lg text-fg-muted transition-colors hover:text-fg xl:absolute xl:top-1/2 xl:right-6 xl:-translate-y-1/2"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </header>
  );
}
