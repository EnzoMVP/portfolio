import { getTranslations } from "next-intl/server";
import { FaEnvelope, FaLinkedin } from "react-icons/fa6";
import { SiGithub } from "react-icons/si";
import { getSiteSettings } from "@/lib/sanity/queries";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export async function Contact() {
  const [t, settings] = await Promise.all([getTranslations("contact"), getSiteSettings()]);

  const email = settings?.email || "enzomenezes03@gmail.com";
  const linkedinUrl = settings?.linkedinUrl || "https://www.linkedin.com/in/enzo-mvp/";
  const githubUrl = settings?.githubUrl || "https://github.com/EnzoMVP";

  return (
    <section id="contact" className="bg-bg-inverse text-fg-inverse">
      <style>{`
        .contact-icon {
          filter: drop-shadow(0 0 8px color-mix(in srgb, var(--color-fg-inverse) 55%, transparent))
            drop-shadow(0 0 18px color-mix(in srgb, var(--color-fg-inverse) 30%, transparent));
          transition:
            color 0.2s ease,
            filter 0.2s ease,
            transform 0.2s ease;
        }
        .contact-icon:hover {
          filter: drop-shadow(0 0 12px color-mix(in srgb, var(--color-fg-inverse) 80%, transparent))
            drop-shadow(0 0 28px color-mix(in srgb, var(--color-fg-inverse) 55%, transparent));
          transform: translateY(-2px);
        }
      `}</style>
      <div className="mx-auto max-w-5xl px-6 pt-20 sm:pt-28">
        <p className="mb-3 font-mono text-xs tracking-widest text-fg-muted uppercase">[ 05 ]</p>
        <h2 className="mb-10 font-display text-2xl font-bold tracking-tight uppercase sm:text-3xl">
          {t("heading")}
        </h2>

        <RevealOnScroll>
          <div className="flex flex-col gap-8 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-lg text-fg-inverse/80">{t("intro")}</p>
            <div className="flex gap-6 text-3xl sm:text-4xl">
              <a
                href={`mailto:${email}`}
                aria-label={t("email")}
                className="contact-icon transition-colors hover:text-fg-inverse/60"
              >
                <FaEnvelope />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("linkedin")}
                className="contact-icon transition-colors hover:text-fg-inverse/60"
              >
                <FaLinkedin />
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("github")}
                className="contact-icon transition-colors hover:text-fg-inverse/60"
              >
                <SiGithub />
              </a>
            </div>
          </div>
          <div className="border-t border-fg-inverse/15" />
        </RevealOnScroll>
      </div>

      {/* Breaks out of the max-w-5xl container on purpose — a giant
          edge-to-edge wordmark as the section's closing statement. A
          single vw-based size (no breakpoint override) scales exactly
          proportionally to viewport width at every screen size, so
          whatever headroom it has against wrapping/overflow at one width
          holds at every width — a bigger size on mobile than desktop
          (as this had before) breaks that proportionality and can overflow
          narrow screens instead of just being "extra giant" there. */}
      <div className="overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-14">
        <p
          aria-hidden="true"
          className="px-6 text-left font-display leading-none font-bold tracking-tight whitespace-nowrap text-fg-inverse uppercase select-none text-[12vw]"
        >
          {t("name")}
        </p>
      </div>
    </section>
  );
}
