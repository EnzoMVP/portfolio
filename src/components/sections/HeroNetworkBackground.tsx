"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
};

const NODE_COUNT = 46;
const MAX_LINK_DIST = 130;
const SPEED_MIN = 0.15;
const SPEED_MAX = 0.5;

/**
 * Nodes spawn at the section's center and drift outward to the edges,
 * respawning once off-screen. Drawn with the "lighter" composite mode
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
        radius: 1 + Math.random() * 1.8,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    }

    resize();

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, spawnNode);
    // Stagger nodes along their own trajectory so it doesn't start as a
    // single dot in the center on first paint.
    nodes.forEach((n) => {
      const t = Math.random() * Math.max(width, height) * 0.6;
      n.x += n.vx * t;
      n.y += n.vy * t;
    });

    const margin = 40;
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
        n.x += n.vx;
        n.y += n.vy;
        if (
          n.x < -margin ||
          n.x > width + margin ||
          n.y < -margin ||
          n.y > height + margin
        ) {
          Object.assign(n, spawnNode());
        }
      }
      draw();
      frameId = requestAnimationFrame(step);
    }

    if (reduceMotion) {
      draw();
    } else {
      step();
    }

    function handleResize() {
      resize();
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
