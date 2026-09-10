import { getTranslations } from "next-intl/server";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { HeroNetworkBackground } from "./HeroNetworkBackground";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden bg-bg-inverse px-6 text-fg-inverse">
      <HeroNetworkBackground />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-inverse via-transparent to-bg-inverse/40" />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <RevealOnScroll>
          <p className="mb-6 font-mono text-xs tracking-widest text-surface-1 uppercase">
            [ {t("location")} ]
          </p>
          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-fg-inverse uppercase sm:text-6xl md:text-7xl">
            {t("name")}
          </h1>
          <p className="mt-4 font-display text-xl font-medium tracking-tight text-surface-1 uppercase sm:text-2xl md:text-3xl">
            {t("role")}
          </p>
          <a
            href="#projects"
            className="mt-10 inline-block border border-border-strong/50 px-6 py-3 font-mono text-xs tracking-widest text-fg-inverse uppercase transition-colors hover:border-fg-inverse hover:bg-fg-inverse hover:text-bg-inverse"
          >
            {t("cta")}
          </a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
