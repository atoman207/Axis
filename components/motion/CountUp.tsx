"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";

type Props = {
  value: number;
  /** Seconds. */
  duration?: number;
};

/**
 * Counts up from zero the first time the number scrolls into view.
 * The server renders the real figure, so crawlers and no-JS readers get it as-is.
 */
export default function CountUp({ value, duration = 1.6 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  // Before the count is reached, park the number at zero (before paint, so nothing flickers).
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !prefersReducedMotion()) el.textContent = "0";
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (prefersReducedMotion()) {
      el.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        el.textContent = String(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
