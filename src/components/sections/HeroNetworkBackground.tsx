"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dotRadius: number;
  color: string;
  orbitDir: 1 | -1;
  flowSeed: number;
  linkCount: number;
  orbiting: boolean;
  orbitRadius: number; // this node's own assigned orbit distance, fixed per capture
  currentRadius: number; // eases toward orbitRadius each frame — avoids snapping/clustering
  orbitAngle: number;
  orbitSpeed: number; // radians/ms, signed by orbitDir
  boost: number; // decaying speed ceiling applied right after release from orbit
  releasedAt: number; // timestamp of last release, so it isn't instantly recaptured close-in
};

const NODE_COUNT = 64;
const MAX_LINK_DIST = 140;
const SPEED_MIN = 0.15;
const SPEED_MAX = 0.5;
const MAX_SPEED = 0.75;
const JITTER = 0.05; // random per-frame nudge that keeps the ambient drift disorderly
const CURSOR_LAG_EASE = 0.09; // how fast the orbit anchor catches up to the real cursor per
// ~16.67ms frame — the anchor (not the raw cursor) is what nodes orbit, so a fast cursor swing
// leaves them trailing behind instead of teleporting with it
const ORBIT_CAPTURE_RADIUS = 220; // anchor "gravity" reach — nodes this close get captured
const MIN_ORBIT_RADIUS = 80; // floor so a captured node never orbits right on the cursor
const MAX_ORBIT_RADIUS = ORBIT_CAPTURE_RADIUS;
const ORBIT_RADIUS_EASE = 0.045; // per-frame ease from capture distance to the assigned orbit
const ORBIT_SPEED_MIN = 0.0006; // rad/ms — outer orbits move slower
const ORBIT_SPEED_MAX = 0.002; // rad/ms — inner orbits move faster, Kepler-ish; still well above
// ambient wander speed, just not as brisk as before
const ORBIT_WOBBLE_FREQ = 0.0015; // ms^-1 — subtle radius "breathing" so orbits aren't robotic
const ORBIT_WOBBLE_AMPLITUDE = 0.05; // fraction of orbit radius
const IDLE_TIMEOUT = 700; // ms the cursor can sit still before orbiting nodes are released
const RECAPTURE_COOLDOWN = 500; // ms a released node refuses to be captured again — gives the
// repel kick time to actually carry it away, instead of it snapping right back into a tight
// orbit around the cursor on the very next moving frame
const REPEL_KICK_SPEED = 3; // outward speed given to a node the instant it's released
const BOOST_DECAY = 0.95; // per-frame decay of that release kick back to ambient speed
const MAX_GLOW_LINKS = 6; // link count at which a node is treated as fully lit
const MIN_NODE_ALPHA = 0.3; // opacity floor for an isolated node
const MAX_NODE_ALPHA = 1;
const MAX_WHITEN = 0.9; // how far toward pure white a fully-linked node shifts
const MAX_GLOW_BLUR = 9; // px of glow bloom on a fully-linked node

/**
 * Nodes burst outward from the section's center once on load, then wander
 * the whole canvas indefinitely — velocity gets a small random nudge each
 * frame and wraps around the edges (exit one side, re-enter the opposite
 * one), so the motion stays disorderly instead of settling into a clean
 * orbit or repeating path.
 *
 * While the cursor is actively moving, nodes within ORBIT_CAPTURE_RADIUS get
 * captured into a real orbit — planet-style: each node locks in its own
 * radius (never closer than MIN_ORBIT_RADIUS, so they don't pile up on the
 * cursor) and its own angular speed (closer nodes orbit faster, like
 * Kepler's law) the moment it's captured. They don't orbit the raw cursor
 * position though — they orbit a lagging anchor point that eases toward the
 * cursor each frame (CURSOR_LAG_EASE), so a fast flick of the mouse leaves
 * the swarm trailing behind instead of teleporting with it; it catches up
 * once the cursor slows down. A slow sine wobble on the radius keeps orbits
 * from looking perfectly robotic.
 *
 * The moment the cursor stops moving (or leaves), every orbiting node is
 * released: it gets kicked outward away from the cursor and returns to
 * ordinary ambient wandering. Moving the cursor again simply captures
 * whatever nodes are back within range.
 *
 * Drawn with the "lighter" composite mode so overlapping nodes/edges blend
 * into brighter tones instead of flattening — the palette overlap the
 * design calls for.
 */
export function HeroNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Mirrors the @theme tokens in globals.css — used only if a token is
    // renamed/removed there without updating this list, so the canvas
    // never silently falls back to an empty (invisible) palette.
    const FALLBACK_PALETTE = ["#979992", "#636560", "#a9a9a9", "#959595", "#fefeff"];

    const rootStyle = getComputedStyle(document.documentElement);
    const resolved = [
      rootStyle.getPropertyValue("--color-surface-1"),
      rootStyle.getPropertyValue("--color-surface-2"),
      rootStyle.getPropertyValue("--color-border"),
      rootStyle.getPropertyValue("--color-border-strong"),
      rootStyle.getPropertyValue("--color-fg-inverse"),
    ]
      .map((c) => c.trim())
      .filter(Boolean);
    const palette = resolved.length > 0 ? resolved : FALLBACK_PALETTE;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // anchorX/anchorY are what nodes actually orbit — they ease toward x/y
    // (the real cursor) each frame rather than snapping to it instantly.
    const mouse = {
      x: 0,
      y: 0,
      active: false,
      lastMoveAt: 0,
      anchorX: 0,
      anchorY: 0,
      anchorInit: false,
    };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnNode(): Node {
      const angle = Math.random() * Math.PI * 2;
      const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      return {
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        dotRadius: 2 + Math.random() * 2.6,
        color: palette[Math.floor(Math.random() * palette.length)],
        orbitDir: Math.random() < 0.5 ? 1 : -1,
        flowSeed: Math.random() * 1000,
        linkCount: 0,
        orbiting: false,
        orbitRadius: 0,
        currentRadius: 0,
        orbitAngle: 0,
        orbitSpeed: 0,
        boost: 0,
        releasedAt: -Infinity,
      };
    }

    // Blends a #rrggbb color toward white by `t` (0 = original, 1 = white).
    // Falls back to the original color for anything not in that format.
    function whiten(hex: string, t: number): string {
      if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const mix = (channel: number) => Math.round(channel + (255 - channel) * t);
      return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
    }

    // Live ctx.shadowBlur is a GPU gaussian blur per draw call — 64 of them
    // every frame saturated integrated GPUs site-wide (measured: hero ~30fps,
    // other sections stuttering since the loop kept running off-screen).
    // A node's glow only depends on its color and link count, and link count
    // is clamped to MAX_GLOW_LINKS, so every possible look is prerendered
    // once here — shadow included — and stamped with drawImage per frame.
    const SPRITE_REF_RADIUS = 3.3; // mid of the 2..4.6 dotRadius range; sprites scale from this
    const spritePad = SPRITE_REF_RADIUS + MAX_GLOW_BLUR * 2;
    const spriteCss = spritePad * 2;
    const sprites = new Map<string, HTMLCanvasElement[]>();
    for (const color of palette) {
      const levels: HTMLCanvasElement[] = [];
      for (let links = 0; links <= MAX_GLOW_LINKS; links++) {
        const glow = links / MAX_GLOW_LINKS;
        const sprite = document.createElement("canvas");
        sprite.width = sprite.height = Math.ceil(spriteCss * dpr);
        const sctx = sprite.getContext("2d")!;
        sctx.scale(dpr, dpr);
        // "lighter" here too, so the dot adds onto its own bloom the same
        // way it used to add onto the shadow drawn straight on the canvas.
        sctx.globalCompositeOperation = "lighter";
        sctx.fillStyle = whiten(color, glow * MAX_WHITEN);
        sctx.shadowColor = sctx.fillStyle;
        // shadowBlur ignores the ctx transform (always device pixels), same
        // as it did on the main canvas — so no dpr factor here either.
        sctx.shadowBlur = MAX_GLOW_BLUR * glow;
        sctx.beginPath();
        sctx.arc(spritePad, spritePad, SPRITE_REF_RADIUS, 0, Math.PI * 2);
        sctx.fill();
        levels.push(sprite);
      }
      sprites.set(color, levels);
    }

    function advance(n: Node, now: number, dt: number) {
      const isMoving = mouse.active && now - mouse.lastMoveAt < IDLE_TIMEOUT;

      if (isMoving) {
        if (!n.orbiting && now - n.releasedAt > RECAPTURE_COOLDOWN) {
          const dx = n.x - mouse.anchorX;
          const dy = n.y - mouse.anchorY;
          const dist = Math.hypot(dx, dy);
          if (dist < ORBIT_CAPTURE_RADIUS) {
            // Each node gets its own assigned orbit distance, picked at
            // random and independent of where it happened to be captured —
            // this is what actually guarantees a mix of near/far orbits
            // instead of every node clumping at whatever distance it was
            // when the cursor found it. currentRadius eases toward that
            // target below, so the node spirals smoothly into its own path
            // rather than snapping onto it.
            n.orbiting = true;
            n.orbitRadius =
              MIN_ORBIT_RADIUS + Math.random() * (MAX_ORBIT_RADIUS - MIN_ORBIT_RADIUS);
            // Start from the real capture distance, uncapped — the ease
            // above carries it up to MIN_ORBIT_RADIUS smoothly instead of
            // snapping there instantly when captured very close in.
            n.currentRadius = dist;
            n.orbitAngle = Math.atan2(dy, dx);
            const radiusT =
              (n.orbitRadius - MIN_ORBIT_RADIUS) /
              (MAX_ORBIT_RADIUS - MIN_ORBIT_RADIUS);
            const baseSpeed =
              ORBIT_SPEED_MAX - radiusT * (ORBIT_SPEED_MAX - ORBIT_SPEED_MIN);
            n.orbitSpeed = baseSpeed * (0.75 + Math.random() * 0.5) * n.orbitDir;
          }
        }

        if (n.orbiting) {
          n.orbitAngle += n.orbitSpeed * dt;
          n.currentRadius += (n.orbitRadius - n.currentRadius) * ORBIT_RADIUS_EASE;
          const wobble =
            1 + Math.sin(now * ORBIT_WOBBLE_FREQ + n.flowSeed) * ORBIT_WOBBLE_AMPLITUDE;
          const r = n.currentRadius * wobble;
          const targetX = mouse.anchorX + Math.cos(n.orbitAngle) * r;
          const targetY = mouse.anchorY + Math.sin(n.orbitAngle) * r;
          n.vx = targetX - n.x;
          n.vy = targetY - n.y;
          n.x = Math.min(Math.max(targetX, 0), width);
          n.y = Math.min(Math.max(targetY, 0), height);
          return;
        }
      } else if (n.orbiting) {
        // Cursor stopped (or left) — release the node with an outward kick
        // instead of just letting it drift off from wherever it was.
        n.orbiting = false;
        n.releasedAt = now;
        const dx = n.x - mouse.anchorX;
        const dy = n.y - mouse.anchorY;
        const dist = Math.hypot(dx, dy) || 1;
        n.vx = (dx / dist) * REPEL_KICK_SPEED;
        n.vy = (dy / dist) * REPEL_KICK_SPEED;
        n.boost = REPEL_KICK_SPEED;
      }

      // SPEED_MIN/MAX/JITTER are tuned for a ~16.67ms (60fps) frame, so
      // scale the jitter and position step by how much real time actually
      // passed — otherwise ambient speed would silently track the display's
      // refresh rate instead of staying consistent (orbit motion above is
      // already dt-scaled via orbitAngle += orbitSpeed * dt).
      const frameScale = dt / 16.67;
      n.vx += (Math.random() - 0.5) * JITTER * frameScale;
      n.vy += (Math.random() - 0.5) * JITTER * frameScale;

      const speedCap = Math.max(MAX_SPEED, n.boost);
      const speed = Math.hypot(n.vx, n.vy);
      if (speed > speedCap) {
        n.vx = (n.vx / speed) * speedCap;
        n.vy = (n.vy / speed) * speedCap;
      }
      n.boost = n.boost < 0.01 ? 0 : n.boost * BOOST_DECAY;

      n.x += n.vx * frameScale;
      n.y += n.vy * frameScale;

      // Wrap around the edges instead of bouncing — a node that drifts off
      // one side reappears on the opposite one, keeping the same velocity.
      if (n.x < 0) {
        n.x += width;
      } else if (n.x > width) {
        n.x -= width;
      }
      if (n.y < 0) {
        n.y += height;
      } else if (n.y > height) {
        n.y -= height;
      }
    }

    resize();

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, spawnNode);
    // Pre-run the simulation a bit so nodes have already spread out from
    // the center burst by the time of the very first paint.
    const warmupSteps = reduceMotion ? 220 : 90;
    for (let i = 0; i < warmupSteps; i++) {
      nodes.forEach((n) => advance(n, 0, 16.67));
    }

    let frameId = 0;

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (const n of nodes) n.linkCount = 0;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_LINK_DIST) {
            a.linkCount++;
            b.linkCount++;
            ctx!.strokeStyle = a.color;
            ctx!.globalAlpha = (1 - dist / MAX_LINK_DIST) * 0.55;
            ctx!.lineWidth = 1.3;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // The more links a node has, the more it glows: it brightens toward
      // white, gains opacity, and picks up a soft bloom; a node with few or
      // no links stays dim and closer to its base palette color.
      for (const n of nodes) {
        const links = Math.min(n.linkCount, MAX_GLOW_LINKS);
        const glow = links / MAX_GLOW_LINKS;
        ctx!.globalAlpha = MIN_NODE_ALPHA + (MAX_NODE_ALPHA - MIN_NODE_ALPHA) * glow;
        const size = spriteCss * (n.dotRadius / SPRITE_REF_RADIUS);
        ctx!.drawImage(sprites.get(n.color)![links], n.x - size / 2, n.y - size / 2, size, size);
      }

      ctx!.globalAlpha = 1;
    }

    let lastTime = performance.now();
    function step(now: number) {
      // Clamp dt so a backgrounded/throttled tab doesn't let orbit angles
      // jump wildly when the frame loop resumes.
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      if (mouse.active) {
        // Exponential ease scaled to dt so the catch-up rate stays roughly
        // consistent regardless of the actual frame rate.
        const followT = 1 - Math.pow(1 - CURSOR_LAG_EASE, dt / 16.67);
        mouse.anchorX += (mouse.x - mouse.anchorX) * followT;
        mouse.anchorY += (mouse.y - mouse.anchorY) * followT;
      }

      nodes.forEach((n) => advance(n, now, dt));
      draw();
      frameId = requestAnimationFrame(step);
    }

    // Only simulate while the hero is actually on screen — the loop used to
    // keep drawing for the whole visit, costing GPU time in every other
    // section. Resuming resets lastTime so the first dt isn't the whole
    // off-screen gap (the 50ms clamp would hide that, but this is exact).
    let visible = false;
    function startLoop() {
      if (frameId || reduceMotion) return;
      lastTime = performance.now();
      frameId = requestAnimationFrame(step);
    }
    function stopLoop() {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    }
    const visibilityObserver = new IntersectionObserver((entries) => {
      // Entries are queued in order; if the canvas crossed the edge more than
      // once before this callback ran, only the last one is current.
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) {
        startLoop();
      } else {
        stopLoop();
        mouse.active = false;
      }
    });
    visibilityObserver.observe(canvas);

    // Paint the warmed-up frame right away rather than waiting on the
    // observer's first callback (and it's the only frame under reduced motion).
    draw();

    // Resize events fire many times per second while dragging a window;
    // reallocating the canvas bitmap once per frame is enough.
    let resizeFrame = 0;
    function handleResize() {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
        // canvas.width/height assignment above clears the bitmap; redraw
        // immediately so reduced-motion (no rAF loop) doesn't go blank.
        // Clamp existing nodes into the new bounds so a shrink doesn't
        // strand them off-canvas.
        for (const n of nodes) {
          n.x = Math.min(Math.max(n.x, 0), width);
          n.y = Math.min(Math.max(n.y, 0), height);
        }
        draw();
      });
    }
    window.addEventListener("resize", handleResize);

    // The canvas is pointer-events-none (so it never blocks clicks on the
    // hero content), so tracking has to happen on window instead — bounds
    // are checked against the canvas rect to know when the cursor is
    // actually over it.
    function handlePointerMove(e: PointerEvent) {
      if (!visible) return;
      const rect = canvas!.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      mouse.active = localX >= 0 && localX <= width && localY >= 0 && localY <= height;
      mouse.x = localX;
      mouse.y = localY;
      if (mouse.active && !mouse.anchorInit) {
        // Snap the anchor onto the cursor the first time it's ever active
        // over the canvas, so the swarm doesn't fly in from wherever the
        // mouse first moved outside the hero area (or from (0,0)).
        mouse.anchorX = localX;
        mouse.anchorY = localY;
        mouse.anchorInit = true;
      }
      mouse.lastMoveAt = performance.now();
    }
    function handlePointerLeave() {
      mouse.active = false;
    }
    if (!reduceMotion) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerleave", handlePointerLeave);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      visibilityObserver.disconnect();
      stopLoop();
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
    />
  );
}
