import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { HeroNetworkBackground } from "./HeroNetworkBackground";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="hero"
      className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden bg-bg-inverse px-6 text-fg-inverse"
    >
      {/* Entrance is plain CSS rather than RevealOnScroll: that one server-
          renders at opacity 0 and only fades in after hydration + an
          IntersectionObserver tick, and Chrome doesn't count an opacity-0
          element for LCP — so the <h1> (this page's LCP element) was held
          back until the JS bundle ran. CSS keyframes start at first paint.
          The <h1> itself only rises, never fades, so it's a visible LCP
          candidate from the very first frame; the lines around it fade in. */}
      <style>{`
        @keyframes hero-rise {
          from { transform: translateY(16px); }
          to { transform: none; }
        }
        @keyframes hero-fade-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .hero-title {
          animation: hero-rise 0.5s ease-out both;
        }
        .hero-line {
          animation: hero-fade-rise 0.5s ease-out both;
          animation-delay: var(--hero-delay, 0s);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-title,
          .hero-line {
            animation: none;
          }
        }
      `}</style>
      <HeroNetworkBackground />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-inverse via-transparent to-bg-inverse/40" />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <p className="hero-line mb-6 font-mono text-xs tracking-widest text-surface-1 uppercase">
          {t("location")}
        </p>
        <h1 className="hero-title font-display text-4xl leading-[1.05] font-bold tracking-tight text-fg-inverse uppercase sm:text-6xl md:text-7xl">
          {t("name")}
        </h1>
        <p
          className="hero-line mt-4 font-display text-xl font-medium tracking-tight text-surface-1 uppercase sm:text-2xl md:text-3xl"
          style={{ "--hero-delay": "0.08s" } as CSSProperties}
        >
          {t("role")}
        </p>
        <a
          href="#projects"
          className="hero-line mt-10 inline-block border border-border-strong/50 px-6 py-3 font-mono text-xs tracking-widest text-fg-inverse uppercase transition-colors hover:border-fg-inverse hover:bg-fg-inverse hover:text-bg-inverse"
          style={{ "--hero-delay": "0.16s" } as CSSProperties}
        >
          {t("cta")}
        </a>
      </div>
    </section>
  );
}
