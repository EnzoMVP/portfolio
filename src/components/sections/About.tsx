import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export async function About() {
  const t = await getTranslations("about");

  return (
    <SectionContainer id="about" label="[ 01 ]" heading={t("heading")}>
      <RevealOnScroll>
        <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">
          {t("body")}
        </p>
      </RevealOnScroll>
    </SectionContainer>
  );
}
