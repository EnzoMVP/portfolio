"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const OFFSETS = {
  "top-left": { x: -160, y: -120 },
  "bottom-right": { x: 160, y: 120 },
};

export function ProjectReveal({
  children,
  fromCorner,
}: {
  children: ReactNode;
  fromCorner: "top-left" | "bottom-right";
}) {
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion ? { x: 0, y: 0 } : OFFSETS[fromCorner];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
