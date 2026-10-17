/** One motion language for the whole site: the same curves and timings everywhere. */

/** Long, soft settle — the default for reveals and entrances. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Symmetric ease for movements that start and stop on screen. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** CSS form of EASE_OUT, for the Web Animations API and inline styles. */
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Browser-only check; false on the server. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** True for a real mouse or trackpad — touch screens skip hover-driven effects. */
export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
