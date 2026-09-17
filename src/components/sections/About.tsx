import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AboutIntroTrigger } from "./AboutIntroTrigger";

export async function About() {
  const t = await getTranslations("about");

  return (
    <SectionContainer id="about" heading={t("heading")}>
      <style>{`
        /* Two glowing orbs sitting on the dark outer panel, centered right
           on the inner glass card's corners. Each orb is 20rem wide but
           the wrapper's padding is only 3rem/4rem, so ~6rem of it is
           clipped by the wrapper's own edge entirely (invisible); of the
           remaining ~14rem, a few rem sit in the padding zone (full
           strength, plainly visible against the dark panel — a white orb
           would be invisible bleeding onto the page's light background
           instead) and the rest tucks behind the card edge, dimmed
           through it. Reads as two distinct lights circling the card
           rather than a uniform haze. */
        /* Full-size track the orbs move across. Its own size (not the
           content's) defines it, so it can be a size container — that's
           what lets the keyframes below use cqw/cqh to reach the far
           corners with transform alone. Animating top/left instead forced
           layout plus a re-raster of both 50px-blurred orbs every frame;
           a translated layer is rasterized once and just moved. */
        .about-orb-track {
          position: absolute;
          inset: 0;
          container-type: size;
          pointer-events: none;
        }
        .about-orb {
          position: absolute;
          top: -6rem;
          left: -6rem;
          width: 20rem;
          height: 20rem;
          border-radius: 9999px;
          filter: blur(50px);
          background: color-mix(in srgb, var(--color-fg-inverse) 70%, transparent);
          z-index: 0;
          will-change: transform;
        }
        /* --orbit picks which keyframes (and so which starting corner)
           this orb uses. about-orbit-alt is the same path as about-orbit,
           just starting from the opposite corner, so the pair stays
           diagonally opposite the whole loop. */
        .about-orb {
          animation: var(--orbit) 22s linear infinite;
          animation-play-state: paused;
        }
        .about-orb-tl {
          --orbit: about-orbit;
        }
        .about-orb-br {
          --orbit: about-orbit-alt;
          transform: translate(calc(100cqw - 8rem), calc(100cqh - 8rem));
        }
        /* Paused by default (above) — AboutIntroTrigger's real
           IntersectionObserver only adds .in-view while this is actually
           on screen, instead of burning CPU/GPU on it indefinitely. It
           toggles back off on scroll-out too, unlike .has-entered below. */
        .in-view .about-orb {
          animation-play-state: running;
        }
        /* Same path as before (top-left corner at -6rem → far corner at
           100% - 14rem), expressed as an offset from the -6rem origin:
           100% - 14rem - (-6rem) = 100% - 8rem. */
        @keyframes about-orbit {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(calc(100cqw - 8rem), 0);
          }
          50% {
            transform: translate(calc(100cqw - 8rem), calc(100cqh - 8rem));
          }
          75% {
            transform: translate(0, calc(100cqh - 8rem));
          }
          100% {
            transform: translate(0, 0);
          }
        }
        @keyframes about-orbit-alt {
          0% {
            transform: translate(calc(100cqw - 8rem), calc(100cqh - 8rem));
          }
          25% {
            transform: translate(0, calc(100cqh - 8rem));
          }
          50% {
            transform: translate(0, 0);
          }
          75% {
            transform: translate(calc(100cqw - 8rem), 0);
          }
          100% {
            transform: translate(calc(100cqw - 8rem), calc(100cqh - 8rem));
          }
        }
        /* Hidden until the section is first scrolled into view, then
           flickers once and stays visible for good — .has-entered latches true and
           never resets, so this doesn't replay on later re-entries. */
        .about-signature {
          opacity: 0;
        }
        .has-entered .about-signature {
          animation: about-signature-flicker 2.4s linear forwards;
        }
        @keyframes about-signature-flicker {
          0% {
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          16% {
            opacity: 0.1;
          }
          26% {
            opacity: 1;
          }
          34% {
            opacity: 0.1;
          }
          44% {
            opacity: 1;
          }
          52% {
            opacity: 0.1;
          }
          62% {
            opacity: 1;
          }
          100% {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-orb {
            animation: none;
          }
          .about-signature,
          .has-entered .about-signature {
            animation: none;
            opacity: 1;
          }
        }
        /* The inner card: translucent, lightly blurred backdrop — like
           frosted glass sitting between the viewer and the two light orbs
           on the dark panel behind it, rather than the glow being painted
           directly on it. A restrained blur keeps the orbs' bright cores
           distinguishable through it instead of smearing into a flat
           wash. */
        .about-card {
          position: relative;
          z-index: 1;
          background-color: color-mix(in srgb, var(--color-bg-inverse) 72%, transparent);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        /* Soft vignette so the cutout's own rectangular bounding box
           doesn't read as a pasted-on sticker — all four edges fade into
           the card behind it instead of cutting off hard. */
        .about-portrait {
          mask-image: radial-gradient(ellipse 72% 78% at 50% 42%, black 50%, transparent 92%);
          -webkit-mask-image: radial-gradient(ellipse 72% 78% at 50% 42%, black 50%, transparent 92%);
        }
      `}</style>
      {/* A dark outer panel (rather than flipping the whole section dark)
          keeps the light/dark rhythm between sections intact — Hero and
          Skills are already dark, so About staying light-with-a-dark-panel
          preserves the visual break between them. The panel is slightly
          larger than the glass card it holds, so the two corner orbs have
          somewhere dark to be visible on, circling the card itself. */}
      <AboutIntroTrigger>
        <div className="about-card rounded-2xl px-6 py-20 text-fg-inverse sm:px-16 sm:py-28">
          <div className="relative z-10 grid items-center gap-16 sm:grid-cols-2">
            <RevealOnScroll>
              <div className="relative mx-auto w-full max-w-md">
                <Image
                  src="/images/about-portrait.png"
                  alt={t("name")}
                  width={716}
                  height={716}
                  className="about-portrait w-full"
                />
                <Image
                  src="/images/signature.png"
                  alt=""
                  aria-hidden="true"
                  width={260}
                  height={120}
                  className="about-signature absolute right-2 bottom-2 h-auto w-28 sm:right-4 sm:bottom-4 sm:w-36"
                />
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <div className="mx-auto flex max-w-lg flex-col items-center text-center sm:ml-auto sm:items-start sm:text-left">
                <h3 className="font-display text-4xl font-bold tracking-tight uppercase sm:text-5xl">
                  {t("name")}
                </h3>
                <p className="mt-6 text-xl leading-relaxed text-fg-inverse/80">
                  {t.rich("body", {
                    b: (chunks) => <strong className="font-semibold text-fg-inverse">{chunks}</strong>,
                  })}
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </AboutIntroTrigger>
    </SectionContainer>
  );
}
