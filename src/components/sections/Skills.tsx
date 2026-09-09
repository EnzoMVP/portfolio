import { getTranslations } from "next-intl/server";
import { getSkills } from "@/lib/sanity/queries";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const CATEGORY_ORDER = ["ml-ai", "languages", "data", "tools", "other"] as const;

export async function Skills() {
  const [t, skills] = await Promise.all([
    getTranslations("skills"),
    getSkills(),
  ]);

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <SectionContainer id="skills" label="[ 03 ]" heading={t("heading")}>
      {grouped.length === 0 ? (
        <p className="text-sm text-fg-muted">{t("empty")}</p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((group, i) => (
            <RevealOnScroll key={group.category} delay={i * 0.05}>
              <h3 className="mb-3 font-mono text-xs tracking-widest text-fg-muted uppercase">
                {t(`categories.${group.category}`)}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <li
                    key={skill._id}
                    className="rounded-full border border-border px-3 py-1 text-sm"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
