"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Fragment, useRef, type ReactNode } from "react";

/** Wrap `value` into [min, max) — keeps the track looping without ever jumping visibly. */
function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

type RowProps = {
  items: ReactNode[];
  /** Percent of one copy per second; negative runs right-to-left. */
  baseVelocity: number;
  className?: string;
  separator?: ReactNode;
};

/**
 * A row that drifts on its own, speeds up with the page's scroll velocity and flips
 * direction with the scroll — the page feels like it has momentum. Pauses off-screen.
 */
function MarqueeRow({ items, baseVelocity, className = "", separator }: RowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "100px" });
  const reduced = useReducedMotion();

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  // four copies of the content; sliding by exactly one copy (25%) loops seamlessly
  const x = useTransform(baseX, (value) => `${wrap(-25, 0, value)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!visible || reduced) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    moveBy += direction.current * moveBy * Math.min(Math.abs(factor), 6);
    baseX.set(baseX.get() + moveBy);
  });

  const copy = (
    <span className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className="shrink-0">{item}</span>
          <span aria-hidden className="shrink-0">{separator}</span>
        </Fragment>
      ))}
    </span>
  );

  return (
    <div ref={ref} className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div className="flex shrink-0 whitespace-nowrap will-change-transform" style={{ x }}>
        {copy}
        {copy}
        {copy}
        {copy}
      </motion.div>
    </div>
  );
}

type Props = {
  /** Large outlined words. */
  primary: string[];
  /** Smaller line running the other way. */
  secondary: string[];
};

/** Two counter-running lines of keywords between sections. Decorative — hidden from assistive tech. */
export default function VelocityMarquee({ primary, secondary }: Props) {
  return (
    <div aria-hidden className="relative select-none overflow-hidden py-10 md:py-14">
      <MarqueeRow
        baseVelocity={-1.6}
        items={primary.map((word, i) => (
          <span
            key={word}
            className={`px-6 font-serif text-[clamp(2.4rem,6.5vw,5.5rem)] leading-none font-semibold tracking-[0.02em] uppercase md:px-10 ${
              i % 2 === 0 ? "marquee-outline" : "gradient-text"
            }`}
          >
            {word}
          </span>
        ))}
        separator={<span className="text-[clamp(1rem,2.4vw,2rem)] text-accent/60">✦</span>}
      />
      <MarqueeRow
        baseVelocity={1.1}
        className="mt-4 md:mt-6"
        items={secondary.map((word) => (
          <span key={word} className="px-5 text-sm font-medium tracking-[0.24em] text-muted md:text-base">
            {word}
          </span>
        ))}
        separator={<span className="inline-block h-1 w-1 rounded-full bg-gradient-to-r from-shu-500 to-violet-500" />}
      />
    </div>
  );
}
