import { getLocale, getTranslations } from "next-intl/server";
import { getCertifications } from "@/lib/sanity/queries";
import { pickLocale } from "@/lib/sanity/locale";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { Locale } from "@/i18n/routing";

type StudyItem = { school: string; degree: string; period: string };

function SubHeading({ label, heading }: { label: string; heading: string }) {
  return (
    <>
      <p className="mb-1 font-mono text-xs tracking-widest text-fg-muted uppercase">{label}</p>
      <h3 className="mb-6 font-display text-lg font-bold tracking-tight uppercase">{heading}</h3>
    </>
  );
}

/**
 * Education is one section with two numbered subtopics — 4.1 Studies and
 * 4.2 Certifications — rather than two separate top-level sections, per the
 * site's numbering scheme.
 */
export async function Education() {
  const [t, tStudies, tCertifications, locale, certifications] = await Promise.all([
    getTranslations("education"),
    getTranslations("studies"),
    getTranslations("certifications"),
    getLocale(),
    getCertifications(),
  ]);
  const items = tStudies.raw("items") as StudyItem[];

  return (
    <SectionContainer id="education" label="[ 04 ]" heading={t("heading")}>
      <div className="space-y-16">
        <div>
          <SubHeading label="[ 4.1 ]" heading={tStudies("heading")} />
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
        </div>

        <div>
          <SubHeading label="[ 4.2 ]" heading={tCertifications("heading")} />
          {certifications.length === 0 ? (
            <p className="text-sm text-fg-muted">{tCertifications("empty")}</p>
          ) : (
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
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
