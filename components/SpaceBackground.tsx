"use client";

import dynamic from "next/dynamic";
import MistBackdrop from "@/components/motion/MistBackdrop";
import { useTheme } from "@/components/PreferencesProvider";
import SceneBoundary from "@/components/SceneBoundary";
import { useWebGLSupport } from "@/lib/webgl";

// Three.js / WebGL must only run in the browser — never during SSR.
// If the scene fails, SceneBoundary drops it and the page keeps its CSS backdrop.
const SpaceScene = dynamic(() => import("@/components/space/SpaceScene"), {
  ssr: false,
});

/**
 * Fixed, full-viewport backdrop that sits behind all page content.
 * Space theme: a 3D sky of stars, meteors, nebula, galaxy and planets.
 * White theme: drifting morning mist with flowing silk waves — a single cheap
 * shader instead of the 3D scene.
 */
export default function SpaceBackground() {
  const { theme } = useTheme();
  const webgl = useWebGLSupport();

  return (
    <div aria-hidden className="space-backdrop fixed inset-0 -z-10 pointer-events-none">
      {/* z-[1]: keep the canvases above the backdrop's CSS glow and star layers */}
      <div className="absolute inset-0 z-[1]">
        {theme === "space" ? (
          webgl && (
            <SceneBoundary>
              <SpaceScene />
            </SceneBoundary>
          )
        ) : (
          <MistBackdrop />
        )}
      </div>
    </div>
  );
}
