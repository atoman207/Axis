"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Props = {
  children: string;
  align?: "left" | "center";
  /** Use on dark surfaces (CTA band, etc.). */
  tone?: "default" | "onDark";
  className?: string;
  delay?: number;
};

/**
 * English section label: sky-blue type with a yellow underline
 * that draws left → right the first time it scrolls into view.
 */
export default function SectionEyebrow({
  children,
  align = "left",
  tone = "default",
  className = "",
  delay = 0,
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });

  return (
    <p
      ref={ref}
      className={[
        "mb-4 flex w-fit flex-col gap-1.5 text-sm font-bold tracking-[0.28em] uppercase sm:text-[0.9375rem]",
        tone === "onDark" ? "text-sky-400" : "text-sky-500",
        align === "center" ? "mx-auto items-center" : "items-start",
        className,
      ].join(" ")}
    >
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        className="h-[2.5px] w-full origin-left rounded-full bg-yellow-400"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.75, delay: delay + 0.12, ease: [0.22, 1, 0.36, 1] }}
      />
    </p>
  );
}
