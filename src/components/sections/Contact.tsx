import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/sanity/queries";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export async function Contact() {
  const [t, locale, settings] = await Promise.all([
    getTranslations("contact"),
    getLocale(),
    getSiteSettings(),
  ]);

  const email = settings?.email || "you@example.com";
  const linkedinUrl = settings?.linkedinUrl || "#";
  const githubUrl = settings?.githubUrl || "#";
  const cvHref = locale === "pt-BR" ? "/cv/cv-pt.pdf" : "/cv/cv-en.pdf";

  return (
    <SectionContainer id="contact" label="[ 06 ]" heading={t("heading")} tone="inverse">
      <RevealOnScroll>
        <p className="max-w-xl text-lg text-fg-inverse/80">{t("intro")}</p>
        <div className="mt-8 flex flex-col gap-4 font-mono text-sm tracking-wide uppercase sm:flex-row sm:gap-10">
          <a href={`mailto:${email}`} className="underline underline-offset-4">
            {t("email")}
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {t("linkedin")}
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {t("github")}
          </a>
          <a href={cvHref} download className="underline underline-offset-4">
            {t("downloadCv")}
          </a>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
