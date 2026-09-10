"use client";

import { useEffect, useRef } from "react";

type Node = {
  angle: number;
  angularSpeed: number;
  r: number;
  targetR: number;
  radialSpeed: number;
  radius: number;
  color: string;
  x: number;
  y: number;
};

const NODE_COUNT = 36;
const MAX_LINK_DIST = 100;
const CONFINE_RATIO = 0.34; // fraction of min(width, height) nodes stay within
const CONFINE_MAX = 300; // px cap so it doesn't sprawl on very large screens

/**
 * Nodes burst outward from the section's center once on load, then settle
 * into a slow orbit confined to a central radius — they never drift to the
 * edges after that initial reveal. Drawn with the "lighter" composite mode
 * so overlapping nodes/edges blend into brighter tones instead of
 * flattening — the palette overlap the design calls for.
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
    let centerX = 0;
    let centerY = 0;
    let confineRadius = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
      confineRadius = Math.min(Math.min(width, height) * CONFINE_RATIO, CONFINE_MAX);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnNode(instant: boolean): Node {
      const targetR = confineRadius * (0.25 + Math.random() * 0.75);
      const angularDirection = Math.random() < 0.5 ? -1 : 1;
      const node: Node = {
        angle: Math.random() * Math.PI * 2,
        angularSpeed: angularDirection * (0.0025 + Math.random() * 0.006),
        r: instant ? targetR : 0,
        targetR,
        radialSpeed: targetR / (50 + Math.random() * 40),
        radius: 2 + Math.random() * 2.6,
        color: palette[Math.floor(Math.random() * palette.length)],
        x: centerX,
        y: centerY,
      };
      return node;
    }

    resize();

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () =>
      spawnNode(reduceMotion),
    );

    let frameId = 0;

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_LINK_DIST) {
            ctx!.strokeStyle = a.color;
            ctx!.globalAlpha = (1 - dist / MAX_LINK_DIST) * 0.35;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx!.globalAlpha = 0.75;
        ctx!.fillStyle = n.color;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
    }

    function step() {
      for (const n of nodes) {
        if (n.r < n.targetR) {
          n.r = Math.min(n.targetR, n.r + n.radialSpeed);
        }
        n.angle += n.angularSpeed;
        n.x = centerX + Math.cos(n.angle) * n.r;
        n.y = centerY + Math.sin(n.angle) * n.r;
      }
      draw();
      frameId = requestAnimationFrame(step);
    }

    if (reduceMotion) {
      for (const n of nodes) {
        n.x = centerX + Math.cos(n.angle) * n.r;
        n.y = centerY + Math.sin(n.angle) * n.r;
      }
      draw();
    } else {
      step();
    }

    function handleResize() {
      const prevConfineRadius = confineRadius;
      resize();
      // Rescale existing orbits to the new confinement radius so nodes
      // never end up orbiting outside it after the viewport shrinks.
      if (prevConfineRadius > 0) {
        const ratio = confineRadius / prevConfineRadius;
        for (const n of nodes) {
          n.r *= ratio;
          n.targetR *= ratio;
        }
      }
      // Recompute positions from the rescaled r/angle around the new
      // center — step() won't run this frame if reduced-motion has no
      // rAF loop, and canvas.width/height above already cleared the
      // bitmap, so draw() needs up-to-date coordinates right now.
      for (const n of nodes) {
        n.x = centerX + Math.cos(n.angle) * n.r;
        n.y = centerY + Math.sin(n.angle) * n.r;
      }
      draw();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameId) cancelAnimationFrame(frameId);
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
