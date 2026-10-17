"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { hasWebGL } from "@/lib/webgl";
import type { ParticleWaveHandle } from "./particle-wave-scene";

/**
 * Lightweight Three.js backdrop: a glowing blue→violet particle sea.
 * three.js is only downloaded when the block nears the viewport, the loop
 * pauses off-screen and in background tabs, and reduced motion gets one still frame.
 */
export default function ParticleWave({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    // without WebGL, don't even download three.js — the band keeps its photo and scrim
    if (!host || !hasWebGL()) return;

    let wave: ParticleWaveHandle | null = null;
    let loading = false;
    let disposed = false;
    let visible = false;

    const sync = () => wave?.setActive(visible && !document.hidden);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !wave && !loading) {
          loading = true;
          import("./particle-wave-scene")
            .then(({ createParticleWave }) => {
              if (disposed) return;
              wave = createParticleWave(host, { still: prefersReducedMotion() });
              host.dataset.ready = wave ? "true" : "false";
              sync();
            })
            .catch(() => {});
        }
        sync();
      },
      { rootMargin: "240px 0px" }
    );
    observer.observe(host);
    document.addEventListener("visibilitychange", sync);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      wave?.destroy();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={`particle-wave pointer-events-none ${className}`} />;
}
