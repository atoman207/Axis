"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { hasWebGL } from "@/lib/webgl";
import SilkWaves from "./SilkWaves";
import type { MistHandle } from "./mist-scene";

/**
 * The white theme's living backdrop: drifting morning mist (WebGL, loaded after
 * hydration) over soft CSS light that stands in until it arrives or if WebGL is
 * unavailable, with silk wave lines flowing along the bottom.
 */
export default function MistBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // The pre-paint script already applied a saved space theme; React state is about to
    // follow, so don't spin up a WebGL context only to tear it down a moment later.
    // Without WebGL the soft CSS light below stays on as the backdrop.
    if (!canvas || document.documentElement.dataset.theme === "space" || !hasWebGL()) return;
    let mist: MistHandle | null = null;
    let disposed = false;

    import("./mist-scene")
      .then(({ createMist }) => {
        if (disposed) return;
        mist = createMist(canvas, { still: prefersReducedMotion() });
        canvas.dataset.ready = mist ? "true" : "false";
      })
      .catch(() => {});

    return () => {
      disposed = true;
      mist?.destroy();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div className="mist-fallback absolute inset-0 overflow-hidden">
        <span className="aurora absolute -left-[12%] top-[8%] h-[60vmax] w-[60vmax] rounded-full bg-[#dbe7fd] blur-[90px]" />
        <span className="aurora aurora--slow absolute -right-[16%] bottom-[-12%] h-[56vmax] w-[56vmax] rounded-full bg-[#e8e2fd] blur-[100px]" />
      </div>
      <canvas ref={canvasRef} className="mist-canvas absolute inset-0 h-full w-full" />
      <SilkWaves />
    </div>
  );
}
