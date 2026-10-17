import { useEffect, type DependencyList, type RefObject } from "react";
import type { gsap as GsapCore } from "gsap";
import type { ScrollTrigger as ScrollTriggerPlugin } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

export type Gsap = typeof GsapCore;
export type ScrollTriggerStatic = typeof ScrollTriggerPlugin;

export type GsapKit = {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerStatic;
  /** The visitor asked for reduced motion: jump to end states instead of animating. */
  reduced: boolean;
};

let kit: Promise<Omit<GsapKit, "reduced">> | null = null;

/**
 * GSAP + ScrollTrigger, fetched after hydration so they never weigh on first paint.
 * Every caller shares one download and one plugin registration.
 */
export function loadGsap() {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([core, plugin]) => {
    const { gsap } = core;
    const { ScrollTrigger } = plugin;
    gsap.registerPlugin(ScrollTrigger);
    // Web fonts arrive after first layout and shift section heights — re-measure once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    return { gsap, ScrollTrigger };
  });
  return kit;
}

/**
 * Runs `setup` inside a gsap.context scoped to `scope`, once GSAP has loaded.
 * Every tween and ScrollTrigger it creates is reverted on unmount or when `deps` change;
 * `setup` may also return its own cleanup.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (kit: GsapKit) => void | (() => void),
  deps: DependencyList = []
) {
  useEffect(() => {
    let ctx: ReturnType<Gsap["context"]> | undefined;
    let cancelled = false;

    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        const root = scope.current;
        if (cancelled || !root) return;
        ctx = gsap.context(() => setup({ gsap, ScrollTrigger, reduced: prefersReducedMotion() }), root);
      })
      .catch(() => {
        // Decoration only: without GSAP the content simply stays in its resting state.
      });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
