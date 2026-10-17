"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

type Props = {
  lines: ReactNode[];
  delay?: number;
  /** Gap between consecutive lines. */
  stagger?: number;
  /** "mount" for above-the-fold headlines; "inView" waits until the line scrolls in. */
  trigger?: "mount" | "inView";
  lineClassName?: string;
};

const LINE = {
  hidden: { y: "110%" },
  shown: { y: "0%" },
};

/**
 * Each line rises out of its own clipping mask — the quiet, editorial headline
 * reveal. Text stays in the DOM for screen readers and search engines.
 */
export default function MaskLines({ lines, delay = 0, stagger = 0.1, trigger = "inView", lineClassName = "" }: Props) {
  return lines.map((line, i) => {
    // The mask (not the line inside it) watches the viewport: the line starts fully
    // clipped, so an observer on it would never see it arrive.
    const reveal =
      trigger === "mount"
        ? { animate: "shown" }
        : { whileInView: "shown", viewport: { once: true, margin: "-40px" } };

    return (
      // Padding + matching negative margin give descenders room inside the mask.
      <motion.span
        key={i}
        initial="hidden"
        {...reveal}
        className={`-mb-[0.14em] block overflow-hidden pb-[0.14em] ${lineClassName}`}
      >
        <motion.span
          className="block"
          variants={LINE}
          transition={{ duration: 1, ease: EASE_OUT, delay: delay + i * stagger }}
        >
          {line}
        </motion.span>
      </motion.span>
    );
  });
}
