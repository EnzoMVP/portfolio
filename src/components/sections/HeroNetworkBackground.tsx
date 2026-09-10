"use client";

import { useEffect, useRef } from "react";

type Node = {
  angle: number;
  angularSpeed: number;
  progress: number; // 0..1, how far along the center-to-edge burst this node is
  progressSpeed: number;
  radiusFactor: number; // fraction of the max edge-hugging radius this node settles at
  dotRadius: number;
  color: string;
  x: number;
  y: number;
};

const NODE_COUNT = 44;
const MAX_LINK_DIST = 150;
const EDGE_MARGIN = 0.86; // keeps the orbit band inset from the true viewport edge

/**
 * Nodes burst outward from the section's center once on load, travel out
 * to a band near the edges, then keep circulating along that band —
 * they never fall back toward the center after the initial reveal.
 * Radius is stored as a dimensionless factor of the current viewport
 * half-size, so a window resize rescales the orbit automatically without
 * any extra bookkeeping. Drawn with the "lighter" composite mode so
 * overlapping nodes/edges blend into brighter tones instead of
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
    let maxRadiusX = 0;
    let maxRadiusY = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
      maxRadiusX = (width / 2) * EDGE_MARGIN;
      maxRadiusY = (height / 2) * EDGE_MARGIN;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function positionOf(n: Pick<Node, "angle" | "radiusFactor" | "progress">) {
      const r = n.progress;
      return {
        x: centerX + Math.cos(n.angle) * maxRadiusX * n.radiusFactor * r,
        y: centerY + Math.sin(n.angle) * maxRadiusY * n.radiusFactor * r,
      };
    }

    function spawnNode(instant: boolean): Node {
      const angularDirection = Math.random() < 0.5 ? -1 : 1;
      const node: Node = {
        angle: Math.random() * Math.PI * 2,
        angularSpeed: angularDirection * (0.0025 + Math.random() * 0.006),
        progress: instant ? 1 : 0,
        progressSpeed: 1 / (50 + Math.random() * 40),
        radiusFactor: 0.72 + Math.random() * 0.24,
        dotRadius: 2 + Math.random() * 2.6,
        color: palette[Math.floor(Math.random() * palette.length)],
        x: centerX,
        y: centerY,
      };
      const pos = positionOf(node);
      node.x = pos.x;
      node.y = pos.y;
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
            ctx!.globalAlpha = (1 - dist / MAX_LINK_DIST) * 0.55;
            ctx!.lineWidth = 1.3;
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
        ctx!.arc(n.x, n.y, n.dotRadius, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
    }

    function step() {
      for (const n of nodes) {
        if (n.progress < 1) {
          n.progress = Math.min(1, n.progress + n.progressSpeed);
        }
        n.angle += n.angularSpeed;
        const pos = positionOf(n);
        n.x = pos.x;
        n.y = pos.y;
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
      // canvas.width/height assignment above clears the bitmap; redraw
      // immediately so reduced-motion (no rAF loop) doesn't go blank.
      // maxRadiusX/Y already reflect the new size, and position is
      // recomputed from each node's dimensionless radiusFactor, so
      // orbits rescale automatically with no extra bookkeeping.
      for (const n of nodes) {
        const pos = positionOf(n);
        n.x = pos.x;
        n.y = pos.y;
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
