"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/PreferencesProvider";
import { prefersReducedMotion } from "@/lib/motion";

/** Older ripples are dropped first if someone clicks rapidly. */
const MAX_RIPPLES = 6;
const RIPPLE_MS = 1500;

/**
 * Every click sends out a wave: rings spreading like water on the white theme,
 * and a satellite's signal pulse on the space theme. Plain DOM, no re-renders.
 */
export default function ClickRipples() {
  const { theme } = useTheme();
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // `click`, not pointerdown: on phones a scroll starts with a pointerdown, but never clicks.
    const onClick = (event: MouseEvent) => {
      // detail 0 = a keyboard "click" (Enter/Space), which has no position on screen
      if (event.detail === 0 || event.button !== 0 || prefersReducedMotion()) return;
      while (layer.childElementCount >= MAX_RIPPLES) layer.firstElementChild?.remove();

      const ripple = document.createElement("span");
      ripple.className = `click-ripple ${theme === "space" ? "click-ripple--signal" : "click-ripple--water"}`;
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      for (let i = 0; i < 3; i++) ripple.appendChild(document.createElement("i"));
      layer.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), RIPPLE_MS);
    };

    // capture phase, so links that stop propagation still get their ripple
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [theme]);

  return <div ref={layerRef} aria-hidden className="pointer-events-none fixed inset-0 z-[75] overflow-hidden" />;
}
