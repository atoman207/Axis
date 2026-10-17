"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Distance travelled upward, in px. */
  y?: number;
};

/** Fades its children up the first time they scroll into view. */
export default function Reveal({ children, delay = 0, className, y = 28 }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
