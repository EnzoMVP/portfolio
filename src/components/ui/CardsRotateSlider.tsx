// Adapted from Hyperiux Vault's cards-rotate-slider: https://vault.hyperiux.com
"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MOBILE_STEP = 2;
const TABLET_STEP = 6;
const DESKTOP_STEP = 10;

const MOBILE_ROTATE_IN = -60;
const TABLET_ROTATE_IN = -80;
const DESKTOP_ROTATE_IN = -100;

const MOBILE_ROTATE_OUT = 50;
const TABLET_ROTATE_OUT = 65;
const DESKTOP_ROTATE_OUT = 80;

const ROTATE_X_NEGATIVE = 5;
const ROTATE_X_POSITIVE = -5;

// Reduced motion keeps the pass but cuts the rotation down hard and flattens
// the perspective, instead of removing the effect outright.
const ROTATION_REDUCTION_FACTOR = 0.15;
const REDUCED_PERSPECTIVE = 4800;

export type CardsRotateSliderProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Multiplier on the per-breakpoint rotateY entrance/exit strength. */
  rotationAmount?: number;
  /** Multiplier on the per-breakpoint vertical offset each card travels. */
  verticalDrift?: number;
  /** ScrollTrigger scrub on the horizontal track — higher lags/smooths more. */
  scrollSmoothing?: number;
  /** Perspective (px) on the sticky track — lower looks deeper/more distorted. */
  perspective?: number;
  /** Color of the glow lit around whichever card is centered. Omit for no glow. */
  glowColor?: string;
  /**
   * Extra pinned scroll (as a fraction of viewport height) after the last card
   * settles, so the page doesn't start scrolling away the moment it arrives.
   */
  endHold?: number;
  /** Classes for the glow layer — match the card's border radius here. */
  glowClassName?: string;
  /**
   * Space (px) a centered card must leave above and below it — e.g. for a
   * sticky header. When the tallest card doesn't fit the viewport minus this,
   * the slider falls back to a plain vertical stack instead of pinning (a
   * pinned card taller than the screen would be clipped with no way to
   * scroll to the rest of it).
   */
  safeInsetY?: number;
};

// A crisp 1px lit edge, a tight bloom, then a wide soft halo.
function glowShadow(color: string) {
  return [
    `0 0 0 1px color-mix(in srgb, ${color} 70%, transparent)`,
    `0 0 24px 2px color-mix(in srgb, ${color} 28%, transparent)`,
    `0 0 90px 16px color-mix(in srgb, ${color} 12%, transparent)`,
  ].join(", ");
}

// How far the glow layer's own box extends past the card on every side —
// must cover the halo's reach (blur + spread above) so no shadow ink
// overflows the layer. The inner shadow box's `inset-32` must mirror it.
const GLOW_BLEED = "-inset-32";

/**
 * A scroll-pinned horizontal track: the section sticks to the viewport while
 * vertical scroll pans the track sideways, and each card rotates in from one
 * side, settles flat when centered, then rotates out the other — GSAP
 * ScrollTrigger with a nested per-card timeline (containerAnimation).
 *
 * Card width is fixed per breakpoint and the track's side padding is exactly
 * (100vw - card width) / 2, so the first card starts centered (its timeline
 * at 0.5 = flat) and the last one ends centered. Any number of items works;
 * the pinned scroll distance grows with the count.
 */
export function CardsRotateSlider<T>({
  items,
  getKey,
  renderItem,
  rotationAmount = 1,
  verticalDrift = 1,
  scrollSmoothing = 1,
  perspective = 1200,
  glowColor,
  endHold = 0.75,
  glowClassName = "rounded-2xl",
  safeInsetY = 64,
}: CardsRotateSliderProps<T>) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const wrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const glowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!outer || !sticky || !track) return;

    const travel = () => Math.max(0, track.scrollWidth - window.innerWidth);

    // Wrappers keep the same width in both layouts, and offsetHeight ignores
    // transforms, so this measures the same thing whichever mode is active —
    // flipping modes can't change the answer and oscillate.
    const fitsViewport = () => {
      const tallest = Math.max(
        0,
        ...wrappersRef.current.slice(0, items.length).map((wrapper) => wrapper?.offsetHeight ?? 0),
      );
      return tallest <= window.innerHeight - safeInsetY * 2;
    };
    let stacked = false;
    const applyLayoutMode = () => {
      stacked = !fitsViewport();
      if (stacked) outer.dataset.stacked = "true";
      else delete outer.dataset.stacked;
    };

    // The outer box's height is what creates the scroll distance the sticky
    // track pans through. Recomputed before every ScrollTrigger refresh (and
    // whenever the track resizes) so start/end measurements always see it.
    // The horizontal tween only spans `travel`; the endHold slice after it
    // keeps the last card pinned and still before the page moves on.
    const syncHeight = () => {
      if (stacked) {
        outer.style.height = "";
        return;
      }
      const hold = travel() > 0 ? window.innerHeight * endHold : 0;
      outer.style.height = `${travel() + window.innerHeight + hold}px`;
    };
    applyLayoutMode();
    syncHeight();
    ScrollTrigger.addEventListener("refreshInit", syncHeight);
    const resizeObserver = new ResizeObserver(syncHeight);
    resizeObserver.observe(track);

    // gsap.matchMedia rebuilds everything when a breakpoint or the
    // reduced-motion preference changes, instead of reading them once on mount.
    // The callback only runs while at least one condition matches, so the
    // "all" query is what guarantees it runs on desktop with motion allowed.
    let mm: ReturnType<typeof gsap.matchMedia>;
    const build = () => {
      mm = gsap.matchMedia();
      mm.add(
        {
          all: "all",
          isMobile: "(max-width: 639px)",
          isTablet: "(min-width: 640px) and (max-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isMobile, isTablet, reduceMotion } = context.conditions as Record<string, boolean>;
          const cards = cardsRef.current.slice(0, items.length);
          const glows = glowsRef.current.slice(0, items.length);

          // Cards stay at exactly opacity 1 (the class starts them at 0 only to
          // avoid a pre-hydration flash). Scrubbing opacity below 1 inside this
          // preserve-3d context makes Chrome render the card into a separate
          // surface that clips the glow's halo at the card's top/left edges.
          gsap.set(cards, { opacity: 1 });

          // Stacked fallback: plain cards, no pin, no glow.
          if (stacked) return;

          sticky.style.perspective = `${reduceMotion ? REDUCED_PERSPECTIVE : perspective}px`;

          // A single item (or a track that already fits) has nowhere to pan.
          if (travel() === 0) {
            if (glows[0]) gsap.set(glows[0], { opacity: 1 });
            return;
          }

          const horizontalTween = gsap.to(track, {
            x: () => -travel(),
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              start: "top top",
              end: () => `+=${travel()}`,
              scrub: reduceMotion ? true : scrollSmoothing,
              invalidateOnRefresh: true,
            },
          });

          const total = items.length;
          const mid = Math.floor(total / 2);
          const step = (isMobile ? MOBILE_STEP : isTablet ? TABLET_STEP : DESKTOP_STEP) * verticalDrift;
          const rotationScale = reduceMotion ? ROTATION_REDUCTION_FACTOR : 1;
          const rotateIn =
            (isMobile ? MOBILE_ROTATE_IN : isTablet ? TABLET_ROTATE_IN : DESKTOP_ROTATE_IN) *
            rotationScale *
            rotationAmount;
          const rotateOut =
            (isMobile ? MOBILE_ROTATE_OUT : isTablet ? TABLET_ROTATE_OUT : DESKTOP_ROTATE_OUT) *
            rotationScale *
            rotationAmount;

          cards.forEach((card, index) => {
            const wrapper = wrappersRef.current[index];
            if (!card || !wrapper) return;

            const offset = index < mid ? -((mid - index) * step) : (index - mid + 1) * step;
            const rotateX = (offset < 0 ? ROTATE_X_NEGATIVE : ROTATE_X_POSITIVE) * rotationScale;

            const tl = gsap
              .timeline({
                scrollTrigger: {
                  trigger: wrapper,
                  containerAnimation: horizontalTween,
                  start: "left 100%",
                  end: "right 0%",
                  scrub: true,
                },
              })
              .fromTo(
                card,
                { rotateY: rotateIn, rotateX, y: `${offset}vh` },
                { rotateY: 0, rotateX: 0, y: 0, ease: "none", duration: 0.5 },
              )
              .to(card, { rotateY: rotateOut, y: `${-offset}vh`, ease: "none", duration: 0.5 });

            // The glow peaks at the same midpoint where the card is flat and
            // centered; power3 eases keep it dark until the card is nearly
            // settled, so only the main card is ever lit.
            const glow = glows[index];
            if (glow) {
              tl.fromTo(glow, { opacity: 0 }, { opacity: 1, ease: "power3.in", duration: 0.5 }, 0).to(
                glow,
                { opacity: 0, ease: "power3.out", duration: 0.5 },
                0.5,
              );
            }
          });
        },
      );
      ScrollTrigger.refresh();
    };
    build();

    // Viewport height can change without crossing any media query (window
    // resize, mobile browser UI), so re-check the fit and rebuild on a flip.
    let resizeFrame = 0;
    const onResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        if (fitsViewport() === !stacked) return;
        mm.revert();
        applyLayoutMode();
        syncHeight();
        build();
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      mm.revert();
      resizeObserver.disconnect();
      ScrollTrigger.removeEventListener("refreshInit", syncHeight);
      outer.style.height = "";
      delete outer.dataset.stacked;
    };
  }, [items, rotationAmount, verticalDrift, scrollSmoothing, perspective, endHold, safeInsetY]);

  // Overflow is "clip", never "hidden", on both boxes: "hidden" on the outer
  // would become the sticky's scroll container and break the pin, and on the
  // sticky it's still programmatically scrollable — tabbing to a link in an
  // off-screen card would scroll it sideways on top of the GSAP transform and
  // leave every card permanently misaligned.
  // data-stacked (set by the effect) switches to the vertical fallback.
  return (
    <div ref={outerRef} className="group/slider relative [overflow-x:clip]">
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen items-center overflow-clip group-data-[stacked=true]/slider:static group-data-[stacked=true]/slider:h-auto"
        style={{ perspective: `${perspective}px` }}
      >
        <div
          ref={trackRef}
          className="flex h-full items-center gap-[8vw] px-[7vw] will-change-transform group-data-[stacked=true]/slider:h-auto group-data-[stacked=true]/slider:w-full group-data-[stacked=true]/slider:flex-col group-data-[stacked=true]/slider:py-16 sm:gap-[8vw] sm:px-[10vw] lg:gap-[6vw] lg:px-[calc((100vw-min(72vw,84rem))/2)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, index) => (
            <div
              key={getKey(item)}
              ref={(element) => {
                wrappersRef.current[index] = element;
              }}
              className="relative flex w-[86vw] shrink-0 items-center justify-center sm:w-[80vw] lg:w-[min(72vw,84rem)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                ref={(element) => {
                  cardsRef.current[index] = element;
                }}
                className="relative w-full origin-right opacity-0"
                style={{ transformStyle: "preserve-3d", zIndex: items.length - index }}
              >
                {glowColor && (
                  // Lit edge + halo attached to the card itself, so it turns
                  // with it. Only opacity is scrubbed and will-change keeps it
                  // on its own layer: the shadow rasterizes once, and no CSS
                  // filter blur is involved (a scrubbed viewport-sized blur
                  // is what previously made this section stutter). The layer
                  // is a real box bleeding past the card, with the shadow
                  // drawn by an inner card-sized child, so the layer's bounds
                  // contain the whole halo instead of relying on ink overflow.
                  <div
                    ref={(element) => {
                      glowsRef.current[index] = element;
                    }}
                    aria-hidden="true"
                    className={`pointer-events-none absolute ${GLOW_BLEED} opacity-0 will-change-[opacity]`}
                  >
                    <div
                      className={`absolute inset-32 -m-px ${glowClassName}`}
                      style={{ boxShadow: glowShadow(glowColor) }}
                    />
                  </div>
                )}
                {renderItem(item, index)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
