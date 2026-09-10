import { SKILLS, type SkillItem } from "@/lib/skills-data";

const ICON_SIZE = 28;
const PADDING_X = 28; // px, each side
const ICON_TEXT_GAP = 14;
const CHAR_PX = 11.5; // rough average glyph width at this size/weight, for layout math
const PILL_GAP = 36; // px between pills — enough clearance for the hovered one to scale up without touching its neighbors
const HOVER_SCALE = 1.22;
const SPEED_PX_PER_SEC = 60; // constant scroll speed, independent of how much content there is
const BUFFER_COPIES = 4; // full list-copies rendered, so a wide viewport never runs out of content mid-loop

// Pills size to their own text, so give each one an estimated width (used
// both to size the pill and to lay out the strip) rather than relying on a
// runtime layout measurement.
function estimateWidth(name: string) {
  return Math.round(PADDING_X * 2 + ICON_SIZE + ICON_TEXT_GAP + name.length * CHAR_PX);
}

const WIDTHS = SKILLS.map((s) => estimateWidth(s.name));
const TOTAL_WIDTH = WIDTHS.reduce((sum, w) => sum + w + PILL_GAP, 0);
const CYCLE_SECONDS = TOTAL_WIDTH / SPEED_PX_PER_SEC;

// Repeated enough times that translating by exactly one list-width loops
// seamlessly, with extra copies so a wide viewport's visible window never
// reaches past the rendered content.
const REPEATED = Array.from({ length: BUFFER_COPIES }, () => SKILLS).flat();

function SkillPill({ skill, width }: { skill: SkillItem; width: number }) {
  const { Icon, name, color } = skill;
  return (
    <div
      className="skill-card flex shrink-0 items-center justify-center gap-3.5 whitespace-nowrap rounded-full"
      style={{ width, height: 64 }}
    >
      <Icon size={ICON_SIZE} color={color} />
      <span className="text-lg font-semibold text-fg-inverse">{name}</span>
    </div>
  );
}

function SkillLane({ reverse = false }: { reverse?: boolean }) {
  // To run this lane the opposite direction without duplicating the strip
  // animation, flip the whole strip horizontally and then flip every pill
  // back — the strip's translateX keeps moving the same way, but viewed
  // through the outer flip it reads as moving the other way, while each
  // pill's counter-flip keeps its content upright and readable.
  return (
    <div className="w-full overflow-hidden" aria-hidden="true">
      <div style={reverse ? { transform: "scaleX(-1)" } : undefined}>
        <div className="skill-lane-strip flex items-center" style={{ gap: PILL_GAP }}>
          {REPEATED.map((skill, i) => (
            <div key={i} style={reverse ? { transform: "scaleX(-1)" } : undefined}>
              <SkillPill skill={skill} width={WIDTHS[i % SKILLS.length]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Two full-width belts of skill pills, each scrolling continuously at a
 * constant speed (no auto-highlighting of whatever happens to be centered —
 * that turned out to desync from the belt after any hover interaction and
 * end up spotlighting the wrong pill). The only highlight is on hover:
 * pausing over any pill stops that lane and scales up, brightens, and
 * glows just that pill — plain CSS (`:has()` + `:hover`), no JS. The second
 * lane moves in the opposite direction.
 */
export function SkillsMarquee() {
  return (
    <>
      <style>{`
        @keyframes skill-marquee-strip {
          from { transform: translateX(0); }
          to { transform: translateX(-${TOTAL_WIDTH}px); }
        }
        .skill-lane-strip {
          animation: skill-marquee-strip ${CYCLE_SECONDS}s linear infinite;
          will-change: transform;
        }
        .skill-lane-strip:has(.skill-card:hover) {
          animation-play-state: paused;
        }
        /* Derived from --color-fg-inverse (the theme's white token) via
           color-mix, rather than raw rgba(), so a palette retune in
           globals.css's @theme block still reaches these overlays. */
        .skill-card {
          --skill-hover-scale: ${HOVER_SCALE};
          --skill-white: var(--color-fg-inverse);
          position: relative;
          border: 1px solid color-mix(in srgb, var(--skill-white) 10%, transparent);
          background-color: color-mix(in srgb, var(--skill-white) 7%, transparent);
          box-shadow: inset 0 0 0 transparent;
          transition: transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
        }
        .skill-card:hover {
          transform: scale(var(--skill-hover-scale));
          background-color: color-mix(in srgb, var(--skill-white) 16%, transparent);
          box-shadow:
            inset 0 0 18px 2px color-mix(in srgb, var(--skill-white) 45%, transparent),
            inset 0 0 34px 6px color-mix(in srgb, var(--skill-white) 22%, transparent);
          z-index: 20;
        }
        @media (prefers-reduced-motion: reduce) {
          .skill-lane-strip {
            animation: none !important;
          }
        }
      `}</style>
      {/* The lanes repeat this list many times over purely for the visual
          effect, so they're aria-hidden; this is the one real, unrepeated
          copy screen readers get. */}
      <ul className="sr-only">
        {SKILLS.map((skill) => (
          <li key={skill.name}>{skill.name}</li>
        ))}
      </ul>
      <div className="space-y-6 sm:space-y-8">
        <SkillLane />
        <SkillLane reverse />
      </div>
    </>
  );
}
