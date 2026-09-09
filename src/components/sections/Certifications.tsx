import { getLocale, getTranslations } from "next-intl/server";
import { getCertifications } from "@/lib/sanity/queries";
import { pickLocale } from "@/lib/sanity/locale";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { Locale } from "@/i18n/routing";

export async function Certifications() {
  const [t, locale, certifications] = await Promise.all([
    getTranslations("certifications"),
    getLocale(),
    getCertifications(),
  ]);

  if (certifications.length === 0) return null;

  return (
    <SectionContainer id="certifications" label="[ 04 ]" heading={t("heading")}>
      <ul className="grid gap-6 sm:grid-cols-2">
        {certifications.map((cert, i) => (
          <RevealOnScroll key={cert._id} delay={i * 0.05}>
            <li className="border border-border/60 p-5">
              <p className="font-medium">{pickLocale(cert.name, locale as Locale)}</p>
              {cert.issuer && (
                <p className="mt-1 text-sm text-fg-muted">{cert.issuer}</p>
              )}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block font-mono text-xs tracking-wide text-fg underline underline-offset-4"
                >
                  {cert.credentialUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </li>
          </RevealOnScroll>
        ))}
      </ul>
    </SectionContainer>
  );
}
