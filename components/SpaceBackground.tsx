"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/PreferencesProvider";

// Three.js / WebGL must only run in the browser — never during SSR.
const SpaceScene = dynamic(() => import("@/components/space/SpaceScene"), {
  ssr: false,
});

/**
 * WebGL can be missing or blocked (old devices, locked-down browsers). The scene
 * is decoration, so if it fails the page simply keeps its CSS backdrop.
 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Fixed, full-viewport backdrop that sits behind all page content.
 * Space theme: a 3D sky of stars, nebula, galaxy and planets. White theme: a plain
 * page, so the scene (and its WebGL cost) is left out entirely.
 */
export default function SpaceBackground() {
  const { theme } = useTheme();

  return (
    <div aria-hidden className="space-backdrop fixed inset-0 -z-10 pointer-events-none">
      {theme === "space" && (
        // z-[1]: keep the canvas above the backdrop's CSS glow and star layers
        <div className="absolute inset-0 z-[1]">
          <SceneBoundary>
            <SpaceScene />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
