"use client";

import { motion, useReducedMotion, useSpring, type HTMLMotionProps } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

type Props = Omit<HTMLMotionProps<"div">, "style" | "children"> & {
  children?: ReactNode;
  /** Peak tilt in degrees at the card's edges. */
  max?: number;
};

const SPRING = { stiffness: 240, damping: 22, mass: 0.6 };

/**
 * A card that leans toward the cursor in 3D, lit by a soft light that follows it
 * and a blue→violet edge glow. Mouse only — touch and reduced motion stay flat.
 * Children can lift off the surface with `[transform:translateZ(…)]` as long as
 * no ancestor between them and this card clips with `overflow: hidden`.
 */
export default function TiltCard({ max = 7, className = "", children, onPointerMove, onPointerLeave, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;

    const { clientX, clientY } = event;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      if (reduced) return;
      rotateY.set((px - 0.5) * 2 * max);
      rotateX.set((0.5 - py) * 2 * max);
    });
  };

  const handleLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    cancelAnimationFrame(frameRef.current);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      {...rest}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={`tilt-card relative [transform-style:preserve-3d] ${className}`}
    >
      {children}
      <span aria-hidden className="tilt-glare" />
      <span aria-hidden className="tilt-edge" />
    </motion.div>
  );
}
