import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

type StudyItem = { school: string; degree: string; period: string };

export async function Studies() {
  const t = await getTranslations("studies");
  const items = t.raw("items") as StudyItem[];

  return (
    <SectionContainer id="studies" label="[ 02 ]" heading={t("heading")}>
      <ul className="space-y-6">
        {items.map((item, i) => (
          <RevealOnScroll key={item.school + i} delay={i * 0.05}>
            <li className="flex flex-col justify-between gap-1 border-b border-border/60 pb-6 sm:flex-row sm:items-baseline">
              <div>
                <p className="font-medium">{item.degree}</p>
                <p className="text-sm text-fg-muted">{item.school}</p>
              </div>
              <p className="font-mono text-xs text-fg-muted">{item.period}</p>
            </li>
          </RevealOnScroll>
        ))}
      </ul>
    </SectionContainer>
  );
}
