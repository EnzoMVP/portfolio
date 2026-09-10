import { getTranslations } from "next-intl/server";
import { SkillsMarquee } from "./SkillsMarquee";

export async function Skills() {
  const t = await getTranslations("skills");

  return (
    <section id="skills" className="bg-bg-inverse py-20 text-fg-inverse sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-3 font-mono text-xs tracking-widest text-surface-1 uppercase">[ 03 ]</p>
        <h2 className="mb-10 font-display text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          {t("heading")}
        </h2>
      </div>
      <SkillsMarquee />
    </section>
  );
}
