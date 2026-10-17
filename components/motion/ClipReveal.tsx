"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Cinematic entrance: the block rises while its frame opens from the bottom edge.
 * The clip is removed once open so hover lifts and glows are never cut off.
 */
export default function ClipReveal({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 56, clipPath: "inset(18% 3% 0% 3%)" }}
      whileInView={{
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        transitionEnd: { clipPath: "none" },
      }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
