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

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * English section label in the Japanese editorial style: a fine hairline draws in,
 * then the widely tracked label follows ("— SERVICE"). Centred labels get a hairline
 * on both sides.
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
  const centered = align === "center";
  const lineColor = tone === "onDark" ? "bg-sky-300/70" : "bg-accent/60";

  const line = (origin: "left" | "right") => (
    <motion.span
      aria-hidden
      className={`h-px w-8 sm:w-10 ${lineColor} ${origin === "left" ? "origin-left" : "origin-right"}`}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    />
  );

  return (
    <p
      ref={ref}
      className={[
        "font-en mb-5 flex w-fit items-center gap-4 text-xs font-medium tracking-[0.34em] uppercase sm:text-[0.8125rem]",
        tone === "onDark" ? "text-sky-300" : "text-accent",
        centered ? "mx-auto" : "",
        className,
      ].join(" ")}
    >
      {line(centered ? "right" : "left")}
      <motion.span
        initial={{ opacity: 0, x: -8 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
        transition={{ duration: 0.7, delay: delay + 0.25, ease: EASE }}
      >
        {children}
      </motion.span>
      {centered && line("left")}
    </p>
  );
}
