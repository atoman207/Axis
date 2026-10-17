"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Site-wide Motion settings. `reducedMotion="user"` honours the OS setting:
 * movement is dropped and only opacity fades remain.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
