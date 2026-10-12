"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useTheme } from "@/components/PreferencesProvider";
import type { Theme } from "@/lib/preferences/config";
import Asteroids from "./Asteroids";
import Nebula from "./Nebula";
import Planet, { SUN_DIRECTION, type BodyPalette, type RingPalette } from "./Planet";
import ShootingStars from "./ShootingStars";
import { Galaxy, Stars } from "./Starfield";
import { CAMERA_FOV, CAMERA_Z, anchor, type Rig, type RigRef } from "./shared";

/* -------------------------------------------------------------------------- */
/* Palettes — each has a space look and a soft "ink on paper" look for white  */
/* -------------------------------------------------------------------------- */

const AZURE: BodyPalette = {
  dark: "#0b2350",
  bright: "#2f7bf0",
  storm: "#bfe3ff",
  rim: "#8fc4ff",
  paperDark: "#c3d7f3",
  paperBright: "#e8f0fb",
  paperRim: "#365fae",
};

const AZURE_RING: RingPalette = {
  near: "#c8e2ff",
  far: "#6d6bd6",
  paperNear: "#84a4da",
  paperFar: "#a5b0ee",
};

const MOON: BodyPalette = {
  dark: "#33384a",
  bright: "#8c93ad",
  storm: "#c3c9de",
  rim: "#cdd6ff",
  paperDark: "#d5dae6",
  paperBright: "#f2f4f9",
  paperRim: "#8c96b8",
};

const AMETHYST: BodyPalette = {
  dark: "#231a52",
  bright: "#7a5cf0",
  storm: "#f0b6ff",
  rim: "#b9a6ff",
  paperDark: "#d9d3f7",
  paperBright: "#f1eefc",
  paperRim: "#6d5bd0",
};

const AZURE_MOON = { distance: 3.2, size: 0.16, speed: 0.12, palette: MOON };

const SUN_POSITION = SUN_DIRECTION.clone().multiplyScalar(30).toArray();

/* -------------------------------------------------------------------------- */
/* Camera rig                                                                 */
/* -------------------------------------------------------------------------- */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Owns the shared per-frame values and flies the camera: scrolling the page
 * travels forward through the scene, and the mouse nudges the view for parallax.
 */
function useCameraRig(theme: Theme, animate: boolean): RigRef {
  const rig = useRef<Rig>({
    time: 0,
    scroll: 0,
    pointerX: 0,
    pointerY: 0,
    light: theme === "light" ? 1 : 0,
  });
  const invalidate = useThree((state) => state.invalidate);
  const target = useRef({ scroll: 0, pointerX: 0, pointerY: 0 });

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current.scroll = max > 0 ? clamp01(window.scrollY / max) : 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.pointerY = 1 - (event.clientY / window.innerHeight) * 2;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  // With the render loop paused (reduced motion) a theme change still needs a fresh frame.
  useEffect(() => {
    invalidate();
  }, [theme, invalidate]);

  // priority -1: runs before every other part of the scene reads the values
  useFrame(({ camera }, delta) => {
    const values = rig.current;
    const light = theme === "light" ? 1 : 0;

    if (!animate) {
      values.light = light;
      return;
    }

    // clamp so a background tab coming back doesn't jump the scene forward
    const dt = Math.min(delta, 0.1);
    values.time += dt;
    values.light = THREE.MathUtils.damp(values.light, light, 7, dt);
    values.scroll = THREE.MathUtils.damp(values.scroll, target.current.scroll, 3.2, dt);
    values.pointerX = THREE.MathUtils.damp(values.pointerX, target.current.pointerX, 2.5, dt);
    values.pointerY = THREE.MathUtils.damp(values.pointerY, target.current.pointerY, 2.5, dt);

    const { time, scroll, pointerX, pointerY } = values;
    camera.position.set(
      pointerX * 0.6 + Math.sin(time * 0.07) * 0.35,
      pointerY * 0.35 + Math.cos(time * 0.05) * 0.2 - scroll * 2.2,
      CAMERA_Z - scroll * 9
    );
    camera.lookAt(pointerX * 0.2, -scroll * 3.5, -40);
    camera.rotateZ(-scroll * 0.12);
  }, -1);

  return rig;
}

/** Lights for the rocks; on white everything is flooded with soft ambient light. */
function Sunlight({ rig }: { rig: RigRef }) {
  const ambient = useRef<THREE.AmbientLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const { light } = rig.current;
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(0.35, 2.4, light);
    if (sun.current) sun.current.intensity = THREE.MathUtils.lerp(2.6, 1.2, light);
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.35} />
      <directionalLight ref={sun} position={SUN_POSITION} intensity={2.6} color="#fff4e0" />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene                                                                      */
/* -------------------------------------------------------------------------- */

function Scene({ theme, animate }: { theme: Theme; animate: boolean }) {
  const rig = useCameraRig(theme, animate);

  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const compact = useThree((state) => state.size.width < 768);
  // on tall, narrow screens the planets shrink so they don't crowd the content
  const planetScale = THREE.MathUtils.clamp(aspect / 1.6, 0.5, 1);

  return (
    <>
      <Sunlight rig={rig} />

      <Nebula rig={rig} aspect={aspect} />
      <Stars rig={rig} count={compact ? 1700 : 3400} />
      <Galaxy rig={rig} count={compact ? 3600 : 7000} aspect={aspect} />

      {/* ringed gas giant, its crown rising over the lower-left corner */}
      <Planet
        rig={rig}
        position={anchor(-0.86, -1.04, 18, aspect)}
        tilt={[0.36, 0, 0.3]}
        radius={3.2 * planetScale}
        bands={9}
        spin={0.05}
        palette={AZURE}
        halo="#5aa2ff"
        ring={AZURE_RING}
        moon={AZURE_MOON}
      />

      {/* a smaller violet world, far off to the lower right */}
      <Planet
        rig={rig}
        position={anchor(0.84, -0.66, 44, aspect)}
        tilt={[0.2, 0, -0.35]}
        radius={1.9 * planetScale}
        bands={6}
        spin={0.07}
        palette={AMETHYST}
        halo="#8f7bff"
      />

      <Asteroids rig={rig} count={compact ? 16 : 30} />
      <ShootingStars rig={rig} aspect={aspect} />
    </>
  );
}

export default function SpaceScene() {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV, near: 0.1, far: 400 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      // reduced motion: draw a still sky, re-rendered only when something changes
      frameloop={reducedMotion ? "demand" : "always"}
      // the canvas is fixed to the viewport — no need to re-measure on scroll
      resize={{ scroll: false }}
      style={{ background: "transparent" }}
    >
      <Scene theme={theme} animate={!reducedMotion} />
    </Canvas>
  );
}
