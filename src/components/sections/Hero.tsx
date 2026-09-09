import { getTranslations } from "next-intl/server";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export async function Hero() {
  const t = await getTranslations("hero");
  const lines = t("manifesto").split("\n");

  return (
    <section className="flex min-h-[85vh] flex-col justify-center bg-bg-inverse px-6 text-fg-inverse">
      <div className="mx-auto w-full max-w-5xl">
        <RevealOnScroll>
          <p className="mb-6 font-mono text-xs tracking-widest text-fg-inverse/60 uppercase">
            {t("label")}
          </p>
          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight uppercase sm:text-6xl md:text-7xl">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <a
            href="#projects"
            className="mt-10 inline-block border border-fg-inverse/40 px-6 py-3 font-mono text-xs tracking-widest uppercase transition-colors hover:border-fg-inverse hover:bg-fg-inverse hover:text-bg-inverse"
          >
            {t("cta")}
          </a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
